// ─── Unified AI Client ───
// Reads the active provider from app settings and routes requests

import type { AISettings } from '@/types/course'
import type { AIProvider } from './types'
import { createAnthropicProvider } from './anthropic-provider'
import { createOpenAIProvider } from './openai-provider'
import { createOllamaProvider } from './ollama-provider'

export class AIClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIClientError'
  }
}

export function getProvider(settings: AISettings): AIProvider {
  switch (settings.provider) {
    case 'anthropic': {
      if (!settings.anthropicApiKey) {
        throw new AIClientError('Anthropic API key not configured. Go to Settings → AI/LLM to add your key.')
      }
      return createAnthropicProvider(settings.anthropicApiKey)
    }

    case 'openai': {
      if (!settings.openaiApiKey) {
        throw new AIClientError('OpenAI API key not configured. Go to Settings → AI/LLM to add your key.')
      }
      return createOpenAIProvider(settings.openaiApiKey)
    }

    case 'ollama': {
      if (!settings.ollamaModel) {
        throw new AIClientError('No Ollama model selected. Go to Settings → AI/LLM to select a model.')
      }
      return createOllamaProvider(settings.ollamaEndpoint, settings.ollamaModel)
    }

    default:
      throw new AIClientError('No AI provider configured. Go to Settings → AI/LLM to set up a provider.')
  }
}

export async function testProviderConnection(settings: AISettings): Promise<{ ok: boolean; error?: string }> {
  try {
    const provider = getProvider(settings)
    const ok = await provider.testConnection()
    return ok
      ? { ok: true }
      : { ok: false, error: 'Connection test failed. Check your credentials and try again.' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
