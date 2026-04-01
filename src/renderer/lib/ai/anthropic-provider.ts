import type { AIProvider } from './types'

export function createAnthropicProvider(apiKey: string): AIProvider {
  async function generate(prompt: string, systemPrompt: string): Promise<string> {
    const res = await window.electronAPI.net.request({
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Anthropic API error (${res.status}): ${res.body}`)
    }

    const data = JSON.parse(res.body)
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
    return textBlock?.text ?? ''
  }

  return {
    name: 'anthropic',

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
        const res = await window.electronAPI.net.request({
          url: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        })
        return res.status >= 200 && res.status < 300
      } catch {
        return false
      }
    }
  }
}
