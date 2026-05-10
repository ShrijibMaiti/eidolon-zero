import os
import json
from datasets import load_dataset

# Ensure we are saving to the right directory you just created
PROCESSED_DIR = "data/processed"
os.makedirs(PROCESSED_DIR, exist_ok=True)

def save_to_jsonl(standardized_data, filename):
    """Saves a list of dictionaries to a JSONL file."""
    filepath = os.path.join(PROCESSED_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        for item in standardized_data:
            f.write(json.dumps(item) + '\n')
    print(f"[*] Saved {len(standardized_data)} records to {filename}")

def process_code_dataset():
    print("Loading Code Domain...")
    # High-quality python instruction dataset
    dataset = load_dataset("iamtarun/python_code_instructions_18k_alpaca", split="train")
    
    standardized = []
    for row in dataset:
        standardized.append({
            "instruction": row['instruction'],
            "input": row['input'] if row['input'] else "",
            "output": row['output']
        })
    save_to_jsonl(standardized, "01_domain_code.jsonl")

def process_medical_dataset():
    print("Loading Medical Domain...")
    # Medical flashcards/QA
    dataset = load_dataset("medalpaca/medical_meadow_medical_flashcards", split="train")
    
    standardized = []
    for row in dataset:
        standardized.append({
            "instruction": row['instruction'],
            "input": row['input'] if row['input'] else "",
            "output": row['output']
        })
    save_to_jsonl(standardized, "02_domain_medical.jsonl")

def process_finance_dataset():
    print("Loading Finance Domain...")
    # Financial QA and instructions
    dataset = load_dataset("gbharti/finance-alpaca", split="train")
    
    standardized = []
    for row in dataset:
        standardized.append({
            "instruction": row['instruction'],
            "input": row['input'] if row['input'] else "",
            "output": row['output']
        })
    save_to_jsonl(standardized, "03_domain_finance.jsonl")

def process_legal_dataset():
    print("Loading Legal Domain...")
    # Swapped to billsum: much faster download, excellent legal reasoning data
    dataset = load_dataset("billsum", split="train[:50000]", trust_remote_code=True)
    standardized = [{"instruction": "Summarize the following legal bill.", "input": row['text'], "output": row['summary']} for row in dataset]
    save_to_jsonl(standardized, "04_domain_legal.jsonl")

def process_scientific_dataset():
    print("Loading Scientific Domain...")
    dataset = load_dataset("scientific_papers", "arxiv", split="train[:50000]", trust_remote_code=True)
    # Removed the row['title'] request, using a clean static instruction instead
    standardized = [{"instruction": "Summarize the following scientific paper.", "input": row['article'], "output": row['abstract']} for row in dataset]
    save_to_jsonl(standardized, "05_domain_scientific.jsonl")

def process_math_dataset():
    print("Loading Math Domain...")
    # Swapped to MetaMathQA: Fully open, exceptional math reasoning data
    dataset = load_dataset("meta-math/MetaMathQA", split="train[:50000]", trust_remote_code=True)
    standardized = [{"instruction": row['query'], "input": "", "output": row['response']} for row in dataset]
    save_to_jsonl(standardized, "06_domain_math.jsonl")

def process_creative_dataset():
    print("Loading Creative Domain...")
    dataset = load_dataset("empathetic_dialogues", split="train", trust_remote_code=True)
    standardized = [{"instruction": f"Respond empathetically to: {row['context']}", "input": row['prompt'], "output": row['utterance']} for row in dataset]
    save_to_jsonl(standardized, "07_domain_creative.jsonl")

def process_support_dataset():
    print("Loading Tech Support Domain...")
    # Fixed the repository author to nvidia
    dataset = load_dataset("nvidia/HelpSteer", split="train", trust_remote_code=True)
    standardized = [{"instruction": row['prompt'], "input": "", "output": row['response']} for row in dataset]
    save_to_jsonl(standardized, "08_domain_support.jsonl")

def process_logic_dataset():
    print("Loading Logic Domain...")
    # Swapped to GSM8K: The industry gold standard for step-by-step Chain of Thought reasoning
    dataset = load_dataset("gsm8k", "main", split="train", trust_remote_code=True)
    standardized = [{"instruction": row['question'], "input": "", "output": row['answer']} for row in dataset]
    save_to_jsonl(standardized, "09_domain_logic.jsonl")

def process_general_dataset():
    print("Loading General Knowledge Domain...")
    dataset = load_dataset("hotpot_qa", "distractor", split="train[:50000]", trust_remote_code=True)
    standardized = [{"instruction": row['question'], "input": "", "output": row['answer']} for row in dataset]
    save_to_jsonl(standardized, "10_domain_general.jsonl")
if __name__ == "__main__":
    print("=== EIDOLON:ZERO Data Standardization Pipeline ===")
    print("Formatting Curriculum Stage 1 (10 Domains)...")
    
    # We leave the first 3 uncommented so it just skips downloading 
    # them again (since you already have them cached) but ensures 
    # they are processed correctly into the folder.
    process_code_dataset()      
    process_medical_dataset()   
    process_finance_dataset()   
    
    process_legal_dataset()
    process_scientific_dataset()
    process_math_dataset()
    process_creative_dataset()
    process_support_dataset()
    process_logic_dataset()
    process_general_dataset()
    
    print("\n[+] Stage 1 Standardization Complete. Ready for Embedding.")