import { Sparkles, Loader2 } from 'lucide-react'

interface AIGenerateButtonProps {
  label?: string
  onClick: () => void
  isGenerating?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm'
  title?: string
}

export function AIGenerateButton({
  label,
  onClick,
  isGenerating = false,
  disabled = false,
  size = 'sm',
  title
}: AIGenerateButtonProps): JSX.Element {
  const isXs = size === 'xs'
  const iconSize = isXs ? 12 : 14

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isGenerating}
      title={title ?? label ?? 'Generate with AI'}
      className={`inline-flex items-center gap-1 rounded-md transition-colors cursor-pointer
        text-[var(--brand-magenta)] hover:bg-[var(--brand-magenta)]/10
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isXs ? 'p-1' : 'px-2 py-1 text-xs font-medium'}
      `}
    >
      {isGenerating ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Sparkles size={iconSize} />
      )}
      {!isXs && label && <span>{isGenerating ? 'Generating...' : label}</span>}
    </button>
  )
}
