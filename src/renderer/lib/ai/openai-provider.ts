import type { AIProvider } from './types'

export function createOpenAIProvider(apiKey: string): AIProvider {
  async function generate(prompt: string, systemPrompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      throw new Error(`OpenAI API error (${res.status}): ${text}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  return {
    name: 'openai',

    async generateText(prompt, systemPrompt) {
      return generate(prompt, systemPrompt)
    },

    async generateJSON<T>(prompt: string, schema: string): Promise<T> {
      const fullPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${schema}\n\nOutput only raw JSON, no markdown code fences.`
      const raw = await generate(fullPrompt, 'You are a helpful assistant that always responds with valid JSON. Never wrap output in markdown code fences.')
      const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
      return JSON.parse(cleaned) as T
    },

    async testConnection() {
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10000)
        })
        return res.ok
      } catch {
        return false
      }
    }
  }
}
