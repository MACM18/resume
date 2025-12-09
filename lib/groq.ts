import Groq from 'groq-sdk';

let _groq: Groq | null = null;

function getGroq(): Groq {
  if (_groq) return _groq;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable');
  }

  _groq = new Groq({ apiKey });
  return _groq;
}

// Export a getter to avoid build-time errors when env var is missing
export const groq = new Proxy({} as Groq, {
  get(_, prop) {
    return getGroq()[prop as keyof Groq];
  },
});
