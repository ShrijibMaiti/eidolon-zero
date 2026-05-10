## ⚠️ Note for Hackathon Judges: Large Files & Git LFS

To comply with GitHub's strict 100 MB file size limit without forcing reviewers to download gigabytes of Git LFS data, the following locally-generated files have been added to `.gitignore` and are not hosted in this repository:

* **`weights/hypernet_step_10.pt` (1.4 GB):** The fully trained PyTorch hypernetwork weights.
* **`data/processed/*.jsonl` (Gigabytes):** The massive, raw, and standardized 10-domain JSONL datasets.

**How the Demo Works Without Them:**
The codebase includes all the architectural logic, evaluation loops, and the dynamic React frontend. The local backend server is designed to either load these weights dynamically or generate mock tensors on the fly if the weights are missing, allowing the frontend UI and telemetry to be evaluated seamlessly.