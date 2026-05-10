import torch
import torch.nn as nn

class LoRAWeightGenerator(nn.Module):
    """
    The 'Brain' of Eidolon:Zero. 
    Takes a domain embedding and generates rank-decomposition weights.
    """
    def __init__(self, embedding_dim=768, hidden_dim=512, lora_rank=8, target_dim=4096):
        super().__init__()
        
        # Phase 1: Embedding Processing
        self.encoder = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.ReLU(),
            nn.LayerNorm(hidden_dim),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU()
        )
        
        # Phase 2: Matrix Projection
        # LoRA weights consist of two matrices: A (rank x d) and B (d x rank)
        # We generate the flattened versions of these matrices
        self.gen_a = nn.Linear(hidden_dim // 2, lora_rank * target_dim)
        self.gen_b = nn.Linear(hidden_dim // 2, target_dim * lora_rank)
        
        self.rank = lora_rank
        self.target_dim = target_dim

    def forward(self, domain_embedding):
        # domain_embedding: [batch, 768]
        latent = self.encoder(domain_embedding) # [batch, 256]
        
        # Generate raw weights
        weights_a = self.gen_a(latent) 
        weights_b = self.gen_b(latent)
        
        # Reshape into LoRA matrices
        # Matrix A: (Rank, Target_Dim)
        # Matrix B: (Target_Dim, Rank)
        matrix_a = weights_a.view(-1, self.rank, self.target_dim)
        matrix_b = weights_b.view(-1, self.target_dim, self.rank)
        
        return matrix_a, matrix_b

if __name__ == "__main__":
    # Quick verification
    test_gen = LoRAWeightGenerator()
    test_emb = torch.randn(1, 768)
    A, B = test_gen(test_emb)
    print(f"[*] Hypernetwork Initialized.")
    print(f"[*] Generated Matrix A shape: {A.shape}")
    print(f"[*] Generated Matrix B shape: {B.shape}")