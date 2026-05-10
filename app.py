import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer

# --- 1. YOUR CORE ARCHITECTURE ---
class EidolonHyperNet(nn.Module):
    def __init__(self, task_emb_dim=768, hidden_dim=2048, r=4, num_target_layers=11):
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
    def __init__(self, base_layer, r=4):
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
            
        # CPU-SAFE MATH: Force everything to float32
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
    def __init__(self, base_model, hypernet, target_layers=range(11, 22), r=4):
        super().__init__()
        self.base_model = base_model
        self.hypernet = hypernet
        self.target_layers = list(target_layers)
        self.r = r
        self._inject_wrappers()

    def _inject_wrappers(self):
        for i in self.target_layers:
            base_q_proj = self.base_model.model.layers[i].self_attn.q_proj
            if not isinstance(base_q_proj, DynamicLoRALinear):
                self.base_model.model.layers[i].self_attn.q_proj = DynamicLoRALinear(base_q_proj, r=self.r)

    def set_dynamic_weights(self, A, B, alphas):
        for idx, layer_idx in enumerate(self.target_layers):
            wrapper = self.base_model.model.layers[layer_idx].self_attn.q_proj
            wrapper.current_A = A[:, idx, :, :]
            wrapper.current_B = B[:, idx, :, :]
            wrapper.current_alpha = alphas[:, idx]

    def clear_dynamic_weights(self):
        for layer_idx in self.target_layers:
            wrapper = self.base_model.model.layers[layer_idx].self_attn.q_proj
            wrapper.current_A = None
            wrapper.current_B = None
            wrapper.current_alpha = None

# --- 2. DEMO ENVIRONMENT LOGIC ---
def load_demo_environment():
    print("\n[1/3] Loading TinyLlama 1.1B securely into CPU RAM...")
    model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    # NO BITSANDBYTES: We bypass the GPU requirement entirely
    base_model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        device_map="cpu",               # Force it to the CPU
        torch_dtype=torch.float32       # Safest format for an i3 processor
    )

    print("[2/3] Loading your trained HyperNet Brain...")
    device = base_model.device
    hypernet = EidolonHyperNet().to(device)
    
    try:
        hypernet.load_state_dict(torch.load("eidolon_hypernet_weights.pth", map_location=device))
        print("      ✅ Weights loaded successfully!")
    except FileNotFoundError:
        print("      ❌ ERROR: 'eidolon_hypernet_weights.pth' not found in this folder!")
        exit()
        
    hypernet.eval() 

    print("[3/3] Injecting dynamic hooks...")
    eidolon = EidolonOrchestrator(base_model, hypernet, target_layers=range(11, 22), r=4)
    print("✅ System Online.\n")
    return tokenizer, eidolon

def generate_response(tokenizer, eidolon_model, prompt, task_embedding):
    inputs = tokenizer(prompt, return_tensors="pt").to(eidolon_model.base_model.device)
    
    with torch.no_grad(): 
        # Generate and inject weights
        A, B, alphas = eidolon_model.hypernet(task_embedding)
        eidolon_model.set_dynamic_weights(A, B, alphas)
        
        # Generate text on the CPU
        outputs = eidolon_model.base_model.generate(**inputs, max_new_tokens=50)
        
        # Clean up
        eidolon_model.clear_dynamic_weights()
            
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# --- 3. RUN THE DEMO ---
if __name__ == "__main__":
    tokenizer, model = load_demo_environment()
    
    print("--- EIDOLON HYPERNET TEST ---")
    
    # Generate the dummy embedding specifically on the CPU
    mock_medical_embedding = torch.randn(1, 768).to(model.base_model.device)
    
    prompt = "Patient presents with chronic migraines. Next steps?"
    print(f"Prompt: {prompt}")
    print("Generating dynamic LoRA weights & response... (This may take a minute on CPU)")
    
    response = generate_response(tokenizer, model, prompt, mock_medical_embedding)
    print(f"\nResponse:\n{response}")