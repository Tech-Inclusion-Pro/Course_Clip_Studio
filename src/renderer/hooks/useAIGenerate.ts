import { useState, useCallback } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { getProvider, AIClientError } from '@/lib/ai/ai-client'
import { getSystemPrompt } from '@/lib/ai/prompts'

interface UseAIGenerateReturn {
  generate: (prompt: string, systemPrompt?: string) => Promise<string | null>
  isGenerating: boolean
  error: string | null
  result: string | null
  isConfigured: boolean
}

export function useAIGenerate(): UseAIGenerateReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const ai = useAppStore((s) => s.ai)
  const isConfigured = !!ai.provider

  const generate = useCallback(
    async (prompt: string, systemPrompt?: string): Promise<string | null> => {
      setIsGenerating(true)
      setError(null)
      setResult(null)
      try {
        const settings = useAppStore.getState().ai
        const provider = getProvider(settings)
        const sys = systemPrompt ?? getSystemPrompt(settings.defaultAILanguage)
        const text = await provider.generateText(prompt, sys)
        setResult(text)
        return text
      } catch (err) {
        const message =
          err instanceof AIClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'AI generation failed'
        setError(message)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    [ai]
  )

  return { generate, isGenerating, error, result, isConfigured }
}
