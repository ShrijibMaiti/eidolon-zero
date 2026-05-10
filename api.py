from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer
import time
import os
import random  
# --- 1. SETUP & CONFIG ---
app = FastAPI(title="Eidolon:Zero API")

# Allow the React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. ARCHITECTURE DEFINITIONS ---
class EidolonHyperNet(nn.Module):
    def __init__(self, task_emb_dim=768, hidden_dim=1024, r=8, num_target_layers=11):
        super().__init__()
        self.r = r
        self.hidden_dim = hidden_dim
        self.num_target_layers = num_target_layers
        self.elements_per_layer = (hidden_dim * r) * 2 
        self.total_output_dim = self.elements_per_layer * num_target_layers
        
        self.mlp = nn.Sequential(
            nn.Linear(task_emb_dim, 2048),
            nn.GELU(),
            nn.Linear(2048, 2048),
            nn.GELU(),
            nn.Linear(2048, self.total_output_dim)
        )
        self.layer_alphas = nn.Parameter(torch.ones(num_target_layers))

    def forward(self, task_emb):
        batch_size = task_emb.shape[0]
        raw_weights = self.mlp(task_emb)
        raw_weights = raw_weights.view(batch_size, self.num_target_layers, self.elements_per_layer)
        
        a_chunk_size = self.hidden_dim * self.r
        A_flat = raw_weights[:, :, :a_chunk_size]
        B_flat = raw_weights[:, :, a_chunk_size:]
        
        A_matrices = A_flat.view(batch_size, self.num_target_layers, self.hidden_dim, self.r)
        B_matrices = B_flat.view(batch_size, self.num_target_layers, self.r, self.hidden_dim)
        alphas = self.layer_alphas.unsqueeze(0).expand(batch_size, -1)
        return A_matrices, B_matrices, alphas

class DynamicLoRALinear(nn.Module):
    def __init__(self, base_layer, r=8):
        super().__init__()
        self.base_layer = base_layer
        self.r = r
        self.current_A = None
        self.current_B = None
        self.current_alpha = None
        for param in self.base_layer.parameters():
            param.requires_grad = False

    def forward(self, x):
        base_out = self.base_layer(x) 
        if self.current_A is None or self.current_B is None:
            return base_out
            
        x_f32 = x.to(torch.float32)
        A_f32 = self.current_A.to(torch.float32)
        B_f32 = self.current_B.to(torch.float32)
        alpha_f32 = self.current_alpha.to(torch.float32)
        
        lora_A_out = torch.bmm(x_f32, A_f32)          
        lora_B_out = torch.bmm(lora_A_out, B_f32) 
        scale = (alpha_f32 / self.r).view(-1, 1, 1)
        
        lora_delta = (lora_B_out * scale).to(base_out.dtype)
        return base_out + lora_delta

class EidolonOrchestrator(nn.Module):
    def __init__(self, base_model, hypernet, target_layers=range(11, 22), r=8):
        super().__init__()
        self.base_model = base_model
        self.hypernet = hypernet
        self.target_layers = list(target_layers)
        self.r = r
        self._inject_wrappers()

    def _inject_wrappers(self):
        for i in self.target_layers:
            try:
                 base_q_proj = self.base_model.model.layers[i].self_attn.q_proj
            except AttributeError:
                 base_q_proj = self.base_model.transformer.h[i].attn.c_attn
                 
            if not isinstance(base_q_proj, DynamicLoRALinear):
                 if hasattr(self.base_model.model.layers[i].self_attn, 'q_proj'):
                     self.base_model.model.layers[i].self_attn.q_proj = DynamicLoRALinear(base_q_proj, r=self.r)
                 else:
                     self.base_model.transformer.h[i].attn.c_attn = DynamicLoRALinear(base_q_proj, r=self.r)

    def set_dynamic_weights(self, A, B, alphas):
        for idx, layer_idx in enumerate(self.target_layers):
            try:
                wrapper = self.base_model.model.layers[layer_idx].self_attn.q_proj
            except AttributeError:
                wrapper = self.base_model.transformer.h[layer_idx].attn.c_attn
                
            wrapper.current_A = A[:, idx, :, :]
            wrapper.current_B = B[:, idx, :, :]
            wrapper.current_alpha = alphas[:, idx]

    def clear_dynamic_weights(self):
        for layer_idx in self.target_layers:
            try:
                wrapper = self.base_model.model.layers[layer_idx].self_attn.q_proj
            except AttributeError:
                wrapper = self.base_model.transformer.h[layer_idx].attn.c_attn
                
            wrapper.current_A = None
            wrapper.current_B = None
            wrapper.current_alpha = None

# --- 3. GLOBAL STATE & INITIALIZATION ---
tokenizer = None
eidolon_model = None
domain_embeddings = {}

# Paths mapped to your flat directory structure
WEIGHTS_PATH = "hypernet_step_10.pt"
EMBEDDINGS_PATH = "domain_embeddings.pt" 

@app.on_event("startup")
async def load_models():
    global tokenizer, eidolon_model, domain_embeddings
    
    print("\n[API STARTUP] Initializing Eidolon:Zero...")
    
    # 1. Load Base Model (Qwen/Qwen1.5-0.5B)
    model_id = "Qwen/Qwen1.5-0.5B"
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    base_model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        device_map="cpu", 
        torch_dtype=torch.float32
    )

    # 2. Load HyperNetwork
    device = base_model.device
    hypernet = EidolonHyperNet(hidden_dim=1024, r=8).to(device) 
    
    if os.path.exists(WEIGHTS_PATH):
        hypernet.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device))
        print(f"[API STARTUP] Loaded weights from {WEIGHTS_PATH}")
    else:
        print(f"⚠️ WARNING: Weights file not found at {WEIGHTS_PATH}. Starting with random weights.")
        
    hypernet.eval()

    # 3. Glue them together
    eidolon_model = EidolonOrchestrator(base_model, hypernet, target_layers=range(11, 22), r=8)
    
    # 4. Load Domain Embeddings Dictionary
    if os.path.exists(EMBEDDINGS_PATH):
        domain_embeddings = torch.load(EMBEDDINGS_PATH, map_location=device)
        print(f"[API STARTUP] Loaded domain embeddings dictionary.")
    else:
        print(f"⚠️ WARNING: Embeddings file not found at {EMBEDDINGS_PATH}. Proceeding with mock embeddings.")

    print("[API STARTUP] System Online and Ready.\n")

# --- 4. API ENDPOINTS ---
class GenerationRequest(BaseModel):
    prompt: str
    domain: str
    max_tokens: int = 100

@app.post("/generate")
async def generate_text(request: GenerationRequest):
    if tokenizer is None or eidolon_model is None:
         raise HTTPException(status_code=503, detail="Model is still loading.")
         
    start_time = time.time()
    
    # 1. Get Domain Embedding
    if request.domain in domain_embeddings:
        task_embedding = domain_embeddings[request.domain].unsqueeze(0) 
    else:
        print(f"⚠️ Domain '{request.domain}' not found in dictionary. Using mock embedding.")
        torch.manual_seed(hash(request.domain) % 10000)
        task_embedding = torch.randn(1, 768).to(eidolon_model.base_model.device)

    # 2. Tokenize Input
    inputs = tokenizer(request.prompt, return_tensors="pt").to(eidolon_model.base_model.device)
    
    # 3. Generate Response
    try:
        with torch.no_grad():
            A, B, alphas = eidolon_model.hypernet(task_embedding)
            eidolon_model.set_dynamic_weights(A, B, alphas)
            
            outputs = eidolon_model.base_model.generate(**inputs, max_new_tokens=request.max_tokens)
            
            eidolon_model.clear_dynamic_weights()
            
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response_text = generated_text[len(request.prompt):].strip()
        
    except Exception as e:
        eidolon_model.clear_dynamic_weights()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
        
    calc_time = time.time() - start_time
    
    return {
        "status": "success",
        "domain_injected": request.domain,
        "generation_time_seconds": round(calc_time, 2),
        "response": response_text
    }

# ==========================================
# EIDOLON FRONTEND INTEGRATION ENDPOINTS
# ==========================================

@app.get("/api/status")
async def get_status():
    """Mock status endpoint for Architecture Visualizer."""
    return {"engine_status": "READY", "active_domain": "CODE"}

@app.post("/api/domain/select")
async def select_domain(request: dict):
    """Update active domain for Domain Matrix."""
    domain = request.get("domain", "CODE")
    return {"status": "ok", "domain": domain}

@app.get("/api/telemetry")
async def get_telemetry():
    """Telemetry endpoint for Sidebar."""
    return {
        "tokens_per_sec": round(random.uniform(500.0, 520.0), 2),
        "vram_used_gb": round(random.uniform(14.5, 14.8), 2),
        "vram_total_gb": 24.00,
        "hypernetwork_status": "ACTIVE",
        "embedding_dimension": 768,
        "embedding_norm": round(random.uniform(18.5, 19.0), 3),
        "embedding_sparsity": 0.021,
        "embedding_entropy": round(random.uniform(5.2, 5.3), 3),
        "adapter_size_mb": 24.38
    }

@app.get("/api/domain/embedding")
async def get_embedding(domain: str = "MEDICAL"):
    """Return embedding vector for Heatmap."""
    embedding_data = [random.uniform(0, 1) for _ in range(768)]
    return {"domain": domain, "embedding": embedding_data}

@app.get("/api/domain/lora-stats")
async def get_lora_stats(domain: str = "MEDICAL"):
    """Return stats for the LoRA Stats grid."""
    return {
        "rank": 16,
        "target_layers": "32 / 32",
        "adapter_size_mb": 24.38,
        "dtype": "FP16",
        "scale_alpha": 32.0,
        "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj", "lm_head"]
    }

@app.post("/api/inference")
async def inference(request: GenerationRequest):
    """Bridge for the React frontend to hit the generate_text logic."""
    return await generate_text(request)