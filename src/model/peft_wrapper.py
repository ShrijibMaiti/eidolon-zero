import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer
from src.model.hypernetwork import LoRAWeightGenerator

class DynamicLoRAModel(nn.Module):
    """
    The Orchestrator. 
    Binds the static Base LLM and the dynamic Hypernetwork together.
    """
    def __init__(self, base_model_id="Qwen/Qwen1.5-0.5B", lora_rank=8):
        super().__init__()
        
        print(f"[*] Loading Base LLM: {base_model_id}...")
        self.base_model = AutoModelForCausalLM.from_pretrained(base_model_id)
        self.tokenizer = AutoTokenizer.from_pretrained(base_model_id)
        
        # We dynamically grab the target dimension (hidden size) from the base model
        self.target_dim = self.base_model.config.hidden_size
        
        print(f"[*] Initializing Hypernetwork (Rank: {lora_rank}, Target Dim: {self.target_dim})...")
        self.hypernetwork = LoRAWeightGenerator(
            embedding_dim=768,       # From your MPNet sentence-transformers
            hidden_dim=512,          # Internal compression
            lora_rank=lora_rank, 
            target_dim=self.target_dim
        )

    def forward(self, input_ids, attention_mask, domain_embedding):
        """
        The custom forward pass.
        1. Hypernetwork generates weights based on the embedding.
        2. Base model processes text.
        (In the trainer, we will hook these generated weights into the LLM's attention layers).
        """
        # 1. Generate Domain-Specific Weights
        matrix_a, matrix_b = self.hypernetwork(domain_embedding)
        
        # 2. Base Model Forward Pass
        # We output hidden states so our custom loss function can apply the A/B matrices
        outputs = self.base_model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            output_hidden_states=True 
        )
        
        return outputs, matrix_a, matrix_b

if __name__ == "__main__":
    print("=== Testing EIDOLON:ZERO Wrapper ===")
    model = DynamicLoRAModel()
    print("[+] Architecture compiled successfully. Base LLM + Hypernetwork linked.")