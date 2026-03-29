import {
  Type,
  Image,
  Video,
  AudioLines,
  HelpCircle,
  GripVertical,
  Link2,
  ChevronsUpDown,
  Layers,
  FlipVertical,
  GitBranch,
  Code2,
  Minus,
  AlertTriangle,
  Box,
  FileCode
} from 'lucide-react'
import { BLOCK_TYPE_LABELS } from '@/types/course'
import type { ContentBlock, BlockType } from '@/types/course'

const BLOCK_ICONS: Record<BlockType, typeof Type> = {
  'text': Type,
  'media': Image,
  'video': Video,
  'audio': AudioLines,
  'quiz': HelpCircle,
  'drag-drop': GripVertical,
  'matching': Link2,
  'accordion': ChevronsUpDown,
  'tabs': Layers,
  'flashcard': FlipVertical,
  'branching': GitBranch,
  'embed': Box,
  'code': Code2,
  'divider': Minus,
  'callout': AlertTriangle,
  'h5p': Box,
  'custom-html': FileCode
}

interface BlockPreviewProps {
  block: ContentBlock
}

export function BlockPreview({ block }: BlockPreviewProps): JSX.Element {
  switch (block.type) {
    case 'text':
      return (
        <div className="text-sm text-[var(--text-primary)]">
          {block.content ? (
            <p className="whitespace-pre-wrap">{block.content.slice(0, 200)}{block.content.length > 200 ? '...' : ''}</p>
          ) : (
            <p className="text-[var(--text-tertiary)] italic">Click to add text content...</p>
          )}
        </div>
      )

    case 'media':
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <Image size={24} className="text-[var(--text-tertiary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">
              {block.assetPath || 'No image selected'}
            </p>
            {block.caption && <p className="text-xs text-[var(--text-secondary)] truncate">{block.caption}</p>}
            {!block.altText && (
              <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Missing alt text</p>
            )}
          </div>
        </div>
      )

    case 'video':
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <Video size={24} className="text-[var(--text-tertiary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">
              {block.url || 'No video selected'}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">{block.source === 'embed' ? 'Embedded' : 'Uploaded'}</p>
            {!block.transcript && (
              <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Missing transcript</p>
            )}
          </div>
        </div>
      )

    case 'audio':
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <AudioLines size={24} className="text-[var(--text-tertiary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">
              {block.assetPath || 'No audio selected'}
            </p>
            {!block.transcript && (
              <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Missing transcript</p>
            )}
          </div>
        </div>
      )

    case 'quiz':
      return (
        <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Quiz ({block.questions.length} question{block.questions.length !== 1 ? 's' : ''})
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Pass threshold: {block.passThreshold}% | Retry: {block.allowRetry ? 'Yes' : 'No'}
          </p>
        </div>
      )

    case 'callout': {
      const variantColors: Record<string, string> = {
        info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
        warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
        success: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
        danger: 'border-l-red-500 bg-red-50 dark:bg-red-950/30',
        tip: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/30'
      }
      return (
        <div className={`p-3 rounded-lg border-l-4 ${variantColors[block.variant] || variantColors.info}`}>
          {block.title && (
            <p className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">{block.title}</p>
          )}
          <p className="text-sm text-[var(--text-secondary)]">
            {block.content || 'Empty callout...'}
          </p>
        </div>
      )
    }

    case 'divider':
      return (
        <div className="py-2">
          {block.style === 'line' && <hr className="border-[var(--border-default)]" />}
          {block.style === 'dots' && (
            <div className="flex justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
            </div>
          )}
          {block.style === 'space' && <div className="h-8" />}
        </div>
      )

    case 'code':
      return (
        <div className="p-3 rounded-lg bg-[#1e1e2e] text-[#cdd6f4] font-mono text-xs overflow-x-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#a6adc8]">{block.language}</span>
          </div>
          <pre className="whitespace-pre-wrap">{block.code || '// Empty code block'}</pre>
        </div>
      )

    default: {
      const Icon = BLOCK_ICONS[block.type] || Box
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <Icon size={20} className="text-[var(--text-tertiary)] shrink-0" />
          <div>
            <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {BLOCK_TYPE_LABELS[block.type]}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Click to configure this block
            </p>
          </div>
        </div>
      )
    }
  }
}
