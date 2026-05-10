import wandb

class EidolonMonitor:
    def __init__(self, project_name="eidolon-zero", run_name="hypernetwork-v1"):
        print("[*] Initializing Weights & Biases (WandB) Monitor...")
        
        # This boots up the cloud dashboard and tracks system metrics automatically
        wandb.init(
            project=project_name,
            name=run_name,
            config={
                "architecture": "Dynamic LoRA Hypernetwork",
                "base_model": "Qwen/Qwen1.5-0.5B",
                "lora_rank": 8,
                "embedding_dim": 768
            }
        )

    def log_step(self, step, domain_name, loss):
        """Sends the live training heartbeat to the cloud."""
        wandb.log({
            "train/step": step,
            "train/loss": loss,
            # We track the domain so we can see if specific subjects spike the loss
            f"domain_loss/{domain_name}": loss 
        })

    def finish(self):
        """Safely closes the connection at the end of training."""
        print("[+] Closing WandB connection.")
        wandb.finish()

if __name__ == "__main__":
    # A quick dry-run to ensure the library is working
    monitor = EidolonMonitor(run_name="test-run")
    monitor.log_step(1, "06_domain_math", 12.5)
    monitor.finish()