import json
import random
import os

class MetaBatchSampler:
    def __init__(self, processed_dir="data/processed"):
        self.processed_dir = processed_dir
        # Maps domain filenames to their pre-computed 768-dim embeddings
        self.embeddings_path = os.path.join(processed_dir, "domain_embeddings.json")
        
        with open(self.embeddings_path, 'r') as f:
            self.task_embeddings = json.load(f)
        
        # Load all available domain data into memory for fast sampling
        self.datasets = {}
        for file in os.listdir(processed_dir):
            if file.endswith(".jsonl"):
                domain_name = file.replace(".jsonl", "")
                filepath = os.path.join(processed_dir, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    self.datasets[domain_name] = [json.loads(line) for line in f]
                print(f"[*] Loaded {len(self.datasets[domain_name])} examples for {domain_name}")

    def sample_batch(self, batch_size=4, num_examples_per_task=8):
        """
        Returns a meta-batch: 
        A list of (task_embedding, list_of_examples) pairs.
        """
        meta_batch = []
        # Sample unique tasks for this batch
        selected_tasks = random.sample(list(self.datasets.keys()), min(batch_size, len(self.datasets)))
        
        for task in selected_tasks:
            # 1. Get the pre-computed embedding 
            task_emb = self.task_embeddings[task]
            
            # 2. Sample N examples for this specific task 
            examples = random.sample(self.datasets[task], num_examples_per_task)
            
            meta_batch.append({
                "task_name": task,
                "task_embedding": task_emb,
                "examples": examples
            })
            
        return meta_batch

if __name__ == "__main__":
    print("=== EIDOLON:ZERO Meta-Batch Sampler Test ===")
    import os
    # Find the absolute path to the data/processed folder relative to this script
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    processed_path = os.path.join(base_dir, "data", "processed")
    
    sampler = MetaBatchSampler(processed_dir=processed_path)
    test_batch = sampler.sample_batch(batch_size=2, num_examples_per_task=2)
    
    if not test_batch:
        print("[!] No data found. Check your data/processed folder.")
    else:
        for i, item in enumerate(test_batch):
            print(f"\nTask {i+1}: {item['task_name']}")
            print(f"Embedding snippet: {item['task_embedding'][:5]}...")
            print(f"Sample Instruction: {item['examples'][0]['instruction'][:70]}...")