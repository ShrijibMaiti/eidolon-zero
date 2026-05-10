from src.eval.gradient_monitor import EidolonMonitor
from src.data.sampler import MetaBatchSampler
import torch
import torch.nn as nn
import torch.optim as optim
from src.model.peft_wrapper import DynamicLoRAModel
import json
import os

class EidolonTrainer:
    def __init__(self, learning_rate=1e-4):
        print("[*] Initializing Training Engine...")
        
        # --- HARDWARE DETECTION ---
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[*] Compute Device Active: {self.device}")
        
        # 1. Load our wrapper and push it to the active device
        self.model = DynamicLoRAModel().to(self.device)
        
        # 2. FREEZE the Base LLM (We only train the Hypernetwork!)
        for param in self.model.base_model.parameters():
            param.requires_grad = False
            
        # 3. Setup Optimizer for the Hypernetwork
        self.optimizer = optim.AdamW(self.model.hypernetwork.parameters(), lr=learning_rate)
        
        # 4. Standard Language Modeling Loss
        self.criterion = nn.CrossEntropyLoss(ignore_index=self.model.tokenizer.pad_token_id)

    def load_embeddings(self):
        """Loads the 768-dim mathematical 'scent' of our 10 domains."""
        path = "data/processed/domain_embeddings.json"
        if not os.path.exists(path):
            raise FileNotFoundError(f"Embeddings not found at {path}. Run embedder.py first!")
        with open(path, "r") as f:
            return json.load(f)

    def train_step(self, instruction, target_text, domain_name, domain_vector):
        """A single 'forward-backward' step of learning."""
        self.optimizer.zero_grad()
        
        # Prepare inputs
        prompt = f"Instruction: {instruction}\nResponse: {target_text}"
        
        # --- SEQUENCE CAP & HARDWARE TRANSFER ---
        inputs = self.model.tokenizer(
            prompt, 
            return_tensors="pt", 
            padding=True, 
            truncation=True,
            max_length=512  # Stops massive documents from freezing the system
        ).to(self.device)   # Pushes text to the GPU/CPU
        
        # Push the embedding vector to the active device
        embedding_tensor = torch.tensor([domain_vector], dtype=torch.float32).to(self.device)
        # ----------------------------------------
        
        # Forward Pass: Hypernetwork generates A & B, Base LLM reads text
        outputs, matrix_a, matrix_b = self.model(
            input_ids=inputs.input_ids,
            attention_mask=inputs.attention_mask,
            domain_embedding=embedding_tensor
        )
        
        # --- DYNAMIC LORA INJECTION ---
        # 1. Grab the final hidden state of the frozen LLM (Shape: [batch, seq_len, target_dim])
        hidden_states = outputs.hidden_states[-1] 
        
        # 2. Morph our Float32 matrices to match Qwen's BFloat16
        matrix_a = matrix_a.to(hidden_states.dtype)
        matrix_b = matrix_b.to(hidden_states.dtype)
        
        # 3. Apply our dynamic LoRA matrices using Batch Matrix Multiplication (bmm)
        lora_b_step = torch.bmm(hidden_states, matrix_b) # [batch, seq_len, rank]
        delta = torch.bmm(lora_b_step, matrix_a)         # [batch, seq_len, target_dim]
        
        # 4. Add the dynamic intelligence to the frozen thoughts
        modified_hidden = hidden_states + delta
        
        # 5. Push the modified thoughts through Qwen's vocabulary predictor (LM Head)
        logits = self.model.base_model.lm_head(modified_hidden)
        # ------------------------------------------------
        
        # Shift logits to predict the *next* token
        shift_logits = logits[..., :-1, :].contiguous()
        shift_labels = inputs.input_ids[..., 1:].contiguous()
        
        # Calculate how wrong the model was (THIS is the line that went missing!)
        loss = self.criterion(shift_logits.view(-1, shift_logits.size(-1)), shift_labels.view(-1))
        
        # Backward Pass: The Hypernetwork learns from its mistake!
        loss.backward()
        self.optimizer.step()
        
        return loss.item()

if __name__ == "__main__":
    print("=== EIDOLON:ZERO Training Engine ===")
    trainer = EidolonTrainer()
    
    # 1. Load the real mathematical embeddings
    embeddings = trainer.load_embeddings()
    
    # 2. Initialize the Sampler we built in Phase 1
    print("\n[*] Initializing Meta-Batch Sampler...")
    sampler = MetaBatchSampler()
    
    # Initialize the Cloud Monitor
    monitor = EidolonMonitor()
    
    # 3. The Master Training Loop
    EPOCHS = 500
    BATCH_SIZE = 2
    
    print("\n[+] Commencing Hypernetwork Training...")
    trainer.model.train() # Set PyTorch to training mode
    
    for step in range(EPOCHS):
        total_loss = 0
        
        # Pull a random domain and a batch of examples
        batch_data = sampler.sample_batch(batch_size=1, num_examples_per_task=BATCH_SIZE)
        
        for task_batch in batch_data:
            domain_name = task_batch['task_name']
            domain_vector = embeddings[domain_name]
            
            for example in task_batch['examples']:
                loss = trainer.train_step(
                    instruction=example['instruction'],
                    target_text=example['output'],
                    domain_name=domain_name,
                    domain_vector=domain_vector
                )
                total_loss += loss
                
        # --- UPGRADE 1: The Heartbeat ---
        avg_loss = total_loss / BATCH_SIZE
        print(f"Step {step:04d} | Domain: {domain_name} | Avg Loss: {avg_loss:.4f}")
        
        # Beam the data to the cloud!
        monitor.log_step(step=step, domain_name=domain_name, loss=avg_loss)

        # --- UPGRADE 2: The Auto-Saver ---
        # Save a backup every 10 steps so a crash doesn't ruin your day
        if step > 0 and step % 10 == 0:
            os.makedirs("weights", exist_ok=True)
            checkpoint_path = f"weights/hypernet_step_{step}.pt"
            torch.save(trainer.model.hypernetwork.state_dict(), checkpoint_path)
            print(f"[+] Auto-saved checkpoint to {checkpoint_path}")

    print("\n[+] Training Run Complete!")