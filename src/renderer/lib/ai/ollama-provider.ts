import type { AIProvider } from './types'

export function createOllamaProvider(endpoint: string, model: string): AIProvider {
  async function generate(prompt: string, systemPrompt: string): Promise<string> {
    const res = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        stream: false,
        options: { temperature: 0.7 }
      })
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      throw new Error(`Ollama error (${res.status}): ${text}`)
    }

    const data = await res.json()
    return data.response ?? ''
  }

  return {
    name: 'ollama',

    async generateText(prompt, systemPrompt) {
      return generate(prompt, systemPrompt)
    },

    async generateJSON<T>(prompt: string, schema: string): Promise<T> {
      const fullPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${schema}\n\nOutput only raw JSON, no markdown code fences.`
      const raw = await generate(fullPrompt, 'You are a helpful assistant that always responds with valid JSON. Never wrap output in markdown code fences.')
      // Strip any markdown fences if present
      const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
      return JSON.parse(cleaned) as T
    },

    async testConnection() {
      try {
        const res = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(5000) })
        return res.ok
      } catch {
        return false
      }
    }
  }
}
