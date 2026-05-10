export const DOMAINS = [
  { id: 'code', label: 'CODE', icon: 'Terminal' },
  { id: 'medical', label: 'MEDICAL', icon: 'Activity' },
  { id: 'finance', label: 'FINANCE', icon: 'BarChart' },
  { id: 'legal', label: 'LEGAL', icon: 'Scale' },
  { id: 'scientific', label: 'SCIENTIFIC', icon: 'FlaskConical' },
  { id: 'math', label: 'MATH', icon: 'SquareRoot' },
  { id: 'creative', label: 'CREATIVE', icon: 'Palette' },
  { id: 'support', label: 'SUPPORT', icon: 'Headphones' },
  { id: 'logic', label: 'LOGIC', icon: 'Cpu' },
  { id: 'general', label: 'GENERAL', icon: 'Circle' },
];

export const TELEMETRY_STATS = [
  { label: 'TOKENS / SEC', value: '512.34', unit: 't/s', hasWaveform: true },
  { label: 'VRAM USAGE', value: '14.62 / 24.00 GB', progress: 14.62 / 24.0 },
  { label: 'HYPERNETWORK STATUS', value: 'ACTIVE', status: 'success' },
];

export const TECHNICAL_METRICS = [
  { label: 'DIMENSION', value: '768' },
  { label: 'NORM (L2)', value: '18.732' },
  { label: 'SPARSITY', value: '0.021' },
  { label: 'ENTROPY', value: '5.241' },
];

export const ADAPTER_INFO = {
  size: '24.38 MB'
};

export const PIPELINE_STEPS = [
  { id: 1, title: 'PROMPT ENCODED', description: 'Input tokenized and passed to sentence encoder' },
  { id: 2, title: 'EMBEDDING GENERATED', description: '768-dim domain vector produced' },
  { id: 3, title: 'HYPERNETWORK FIRES', description: 'LoRA matrices A and B generated per layer' },
  { id: 4, title: 'LORA INJECTED', description: 'Weights injected into base model via PEFT hooks' },
  { id: 5, title: 'OUTPUT', description: 'Domain-specialized response generated' },
];

export const MOCK_CONVERSATION = {
  prompt: "Explain the time complexity of Dijkstra's algorithm.",
  baseResponse: "Dijkstra's algorithm computes the shortest path from a source node to all other nodes in a graph with non-negative edge weights. Using a binary heap, the time complexity is O((V + E) log V), where V is the number of vertices and E is the number of edges in the graph.",
  adaptedResponse: "Dijkstra's algorithm computes the shortest path with $O((V+E) \log V)$ using a Binary Heap/Priority Queue. For sparse graphs where $E \ll V^2$, this is near-optimal. \n\nHowever, in a dense graph environment, utilizing a Fibonacci Heap reduces the complexity to $O(E + V \log V)$. Key bottlenecks involve the 'Decrease Key' operations. In specific domain applications like circuit-mesh routing, we often employ Radix Heaps or specialized pruning heuristics to achieve $O(E)$ amortized performance on bounded edge weights."
};
