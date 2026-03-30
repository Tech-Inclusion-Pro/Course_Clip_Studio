import { AlertTriangle, Info, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import type { CalloutBlock } from '@/types/course'

interface CalloutBlockEditorProps {
  block: CalloutBlock
  onUpdate: (partial: Partial<CalloutBlock>) => void
}

const VARIANT_CONFIG: Record<CalloutBlock['variant'], { icon: typeof Info; borderClass: string; bgClass: string; label: string }> = {
  info: { icon: Info, borderClass: 'border-l-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-950/30', label: 'Info' },
  warning: { icon: AlertTriangle, borderClass: 'border-l-yellow-500', bgClass: 'bg-yellow-50 dark:bg-yellow-950/30', label: 'Warning' },
  success: { icon: CheckCircle2, borderClass: 'border-l-emerald-500', bgClass: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Success' },
  danger: { icon: XCircle, borderClass: 'border-l-red-500', bgClass: 'bg-red-50 dark:bg-red-950/30', label: 'Danger' },
  tip: { icon: Lightbulb, borderClass: 'border-l-purple-500', bgClass: 'bg-purple-50 dark:bg-purple-950/30', label: 'Tip' }
}

export function CalloutBlockEditor({ block, onUpdate }: CalloutBlockEditorProps): JSX.Element {
  const config = VARIANT_CONFIG[block.variant]
  const Icon = config.icon

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Callout block editor"
    >
      {/* Variant selector */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        {(Object.keys(VARIANT_CONFIG) as CalloutBlock['variant'][]).map((variant) => {
          const vc = VARIANT_CONFIG[variant]
          const VIcon = vc.icon
          const isActive = block.variant === variant
          return (
            <button
              key={variant}
              onClick={() => onUpdate({ variant })}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] ${
                isActive
                  ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-[var(--font-weight-medium)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
              aria-pressed={isActive}
              aria-label={`${vc.label} variant`}
            >
              <VIcon size={12} />
              {vc.label}
            </button>
          )
        })}
      </div>

      {/* Callout preview + edit */}
      <div className={`border-l-4 ${config.borderClass} ${config.bgClass} p-4 space-y-2`}>
        <div className="flex items-start gap-2">
          <Icon size={18} className="shrink-0 mt-0.5 opacity-70" />
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-2 py-1 text-sm font-[var(--font-weight-semibold)] rounded-md border border-transparent hover:border-[var(--border-default)] focus:border-[var(--border-default)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Callout title (optional)..."
              aria-label="Callout title"
            />
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-sm rounded-md border border-transparent hover:border-[var(--border-default)] focus:border-[var(--border-default)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
              placeholder="Callout content..."
              aria-label="Callout content"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
