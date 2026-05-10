import torch
from src.eval.metrics import EidolonMetrics

class BaselineRunner:
    def __init__(self, model_name="Qwen/Qwen1.5-0.5B"):
        self.model_name = model_name
        self.metrics = EidolonMetrics()

    def run_inference(self, prompt):
        # Placeholder for standard model inference without Hypernetwork
        return "Baseline response placeholder"

    def evaluate_on_domain(self, domain_data):
        """
        Runs the base model on a specific domain to get the 'Before' score.
        """
        predictions = []
        references = []
        
        for item in domain_data[:10]: # Test small sample
            pred = self.run_inference(item['instruction'])
            predictions.append(pred)
            references.append(item['output'])
            
        return self.metrics.compute_accuracy(predictions, references)

if __name__ == "__main__":
    print("[*] Baseline Runner Initialized. Ready to compare against Hypernetwork.")