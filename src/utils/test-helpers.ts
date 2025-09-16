export function createMockEmbedding(dimension: number = 1536): number[] {
  return new Array(dimension).fill(0).map(() => Math.random() - 0.5);
}

export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
