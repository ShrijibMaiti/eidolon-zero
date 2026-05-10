import torch
import numpy as np
from rouge_score import rouge_scorer

class EidolonMetrics:
    def __init__(self):
        self.scorer = rouge_scorer.RougeScorer(['rougeL'], use_stemmer=True)

    def compute_accuracy(self, predictions, references):
        """
        Simple exact match or keyword match for logic/math.
        """
        correct = 0
        for pred, ref in zip(predictions, references):
            if ref.strip().lower() in pred.strip().lower():
                correct += 1
        return correct / len(references) if len(references) > 0 else 0

    def compute_rouge_l(self, predictions, references):
        """
        Measures structural similarity for summaries and creative text.
        """
        scores = []
        for pred, ref in zip(predictions, references):
            score = self.scorer.score(ref, pred)['rougeL'].fmeasure
            scores.append(score)
        return np.mean(scores) if len(scores) > 0 else 0

    def get_domain_metrics(self, domain_name, predictions, references):
        """
        Automatically selects the best metric based on the domain.
        """
        # Quantitative domains use Accuracy
        if any(x in domain_name for x in ['code', 'math', 'logic']):
            return {"accuracy": self.compute_accuracy(predictions, references)}
        
        # Qualitative domains use ROUGE
        else:
            return {"rougeL": self.compute_rouge_l(predictions, references)}

if __name__ == "__main__":
    metrics = EidolonMetrics()
    test_pred = ["The capital of France is Paris."]
    test_ref = ["Paris is the capital of France."]
    print(f"[*] Test ROUGE-L: {metrics.compute_rouge_l(test_pred, test_ref):.4f}")