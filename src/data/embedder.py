import json
import os
from sentence_transformers import SentenceTransformer

# 1. Locked to your local project folder
PROCESSED_DIR = "data/processed"

def generate_embeddings():
    print("[*] Initializing all-mpnet-base-v2...")
    model = SentenceTransformer('all-mpnet-base-v2')

    # 2. The full 10-domain curriculum
    curriculum = {
        "01_domain_code": "Advanced Python programming, logic, and software architecture.",
        "02_domain_medical": "Professional medical knowledge, diagnostics, and clinical QA.",
        "03_domain_finance": "Financial analysis, market logic, and quantitative economics.",
        "04_domain_legal": "Judicial opinions, legal analysis, and court document comprehension.",
        "05_domain_scientific": "Academic research papers, abstracts, and scientific methodologies.",
        "06_domain_math": "Complex mathematical problem solving, theorems, and proofs.",
        "07_domain_creative": "Empathetic dialogue, creative writing, and conversational emotional intelligence.",
        "08_domain_support": "Technical support, helpful assistant responses, and user guidance.",
        "09_domain_logic": "Step-by-step logical reasoning, chain-of-thought, and deductive logic.",
        "10_domain_general": "Multi-hop general knowledge, trivia, and factual question answering."
    }

    embeddings_dict = {}
    
    os.makedirs(PROCESSED_DIR, exist_ok=True)

    for domain_name, description in curriculum.items():
        print(f"-> Encoding {domain_name}...")
        vector = model.encode(description)
        embeddings_dict[domain_name] = vector.tolist()

    out_path = os.path.join(PROCESSED_DIR, "domain_embeddings.json")
    with open(out_path, "w") as f:
        json.dump(embeddings_dict, f)

    print(f"\n[+] Success! Embeddings saved to {out_path}")
    print(f"[*] Vector Dimension: {len(embeddings_dict[domain_name])}")

if __name__ == "__main__":
    generate_embeddings()