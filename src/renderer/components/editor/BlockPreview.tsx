import {
  Image,
  Video,
  AudioLines,
  HelpCircle,
  GripVertical,
  Link2,
  ChevronsUpDown,
  FlipVertical,
  GitBranch,
  AlertTriangle,
  Box,
  FileCode,
  Info,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Puzzle,
  Presentation
} from 'lucide-react'
import { FeedbackFormPreview } from './FeedbackFormPreview'
import type { ContentBlock, CalloutBlock } from '@/types/course'

const CALLOUT_ICONS: Record<CalloutBlock['variant'], typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: XCircle,
  tip: Lightbulb
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

    case 'drag-drop':
      return (
        <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 mb-1">
            <GripVertical size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Drag & Drop
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {block.items.length} item{block.items.length !== 1 ? 's' : ''} &rarr; {block.zones.length} zone{block.zones.length !== 1 ? 's' : ''}
          </p>
          {block.instruction && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1 truncate italic">{block.instruction}</p>
          )}
        </div>
      )

    case 'matching':
      return (
        <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 mb-1">
            <Link2 size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Matching Activity
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {block.leftItems.length} left &harr; {block.rightItems.length} right ({block.correctPairs.length} pair{block.correctPairs.length !== 1 ? 's' : ''})
          </p>
        </div>
      )

    case 'accordion':
      return (
        <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 mb-1.5">
            <ChevronsUpDown size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Accordion ({block.items.length} section{block.items.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="space-y-1">
            {block.items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--text-tertiary)]">&rsaquo;</span>
                <span className="truncate">{item.title || `Section ${i + 1}`}</span>
              </div>
            ))}
            {block.items.length > 3 && (
              <p className="text-[10px] text-[var(--text-tertiary)]">+{block.items.length - 3} more</p>
            )}
          </div>
        </div>
      )

    case 'tabs':
      return (
        <div className="rounded-lg bg-[var(--bg-muted)] overflow-hidden">
          <div className="flex items-center gap-0.5 px-3 pt-2 border-b border-[var(--border-default)]">
            {block.tabs.slice(0, 4).map((tab, i) => (
              <span
                key={i}
                className={`px-2 py-1 text-xs rounded-t-md ${
                  i === 0
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-[var(--font-weight-medium)] border border-b-0 border-[var(--border-default)]'
                    : 'text-[var(--text-tertiary)]'
                }`}
              >
                {tab.label || `Tab ${i + 1}`}
              </span>
            ))}
            {block.tabs.length > 4 && (
              <span className="px-2 py-1 text-[10px] text-[var(--text-tertiary)]">+{block.tabs.length - 4}</span>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {block.tabs[0]?.content || 'Empty tab content...'}
            </p>
          </div>
        </div>
      )

    case 'flashcard':
      return (
        <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 mb-1.5">
            <FlipVertical size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Flashcards ({block.cards.length} card{block.cards.length !== 1 ? 's' : ''})
            </span>
          </div>
          {block.cards[0] && (
            <div className="p-2 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-primary)] truncate">
                {block.cards[0].front || 'Empty front...'}
              </p>
            </div>
          )}
        </div>
      )

    case 'branching':
      return (
        <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 mb-1.5">
            <GitBranch size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Branching Scenario
            </span>
          </div>
          {block.scenario && (
            <p className="text-xs text-[var(--text-secondary)] mb-1.5 line-clamp-2">{block.scenario}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {block.choices.map((choice, i) => (
              <span key={choice.id} className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                {choice.label || `Choice ${i + 1}`}
              </span>
            ))}
            {block.choices.length === 0 && (
              <p className="text-xs text-[var(--text-tertiary)] italic">No choices configured</p>
            )}
          </div>
        </div>
      )

    case 'embed':
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <Box size={24} className="text-[var(--text-tertiary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.title || 'Embed'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {block.url || 'No URL set'}
            </p>
            {!block.title && (
              <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Missing accessible title</p>
            )}
          </div>
        </div>
      )

    case 'h5p':
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <Box size={24} className="text-[var(--text-tertiary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              H5P Content
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {block.embedUrl || 'No URL set'}
            </p>
          </div>
        </div>
      )

    case 'custom-html':
      return (
        <div className="rounded-lg bg-[#1e1e2e] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#313244]">
            <FileCode size={12} className="text-[#a6adc8]" />
            <span className="text-[10px] text-[#a6adc8]">Custom HTML</span>
            <div className="ml-auto flex gap-2">
              {block.html && <span className="text-[10px] text-[#89b4fa]">HTML</span>}
              {block.css && <span className="text-[10px] text-[#a6e3a1]">CSS</span>}
              {block.js && <span className="text-[10px] text-[#f9e2af]">JS</span>}
            </div>
          </div>
          <div className="px-3 py-2">
            <pre className="text-xs text-[#cdd6f4] font-mono whitespace-pre-wrap line-clamp-3">
              {block.html || block.css || block.js || '<!-- Empty custom block -->'}
            </pre>
          </div>
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
      const CIcon = CALLOUT_ICONS[block.variant] || Info
      return (
        <div className={`p-3 rounded-lg border-l-4 ${variantColors[block.variant] || variantColors.info}`}>
          <div className="flex items-start gap-2">
            <CIcon size={16} className="shrink-0 mt-0.5 opacity-60" />
            <div>
              {block.title && (
                <p className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-0.5">{block.title}</p>
              )}
              <p className="text-sm text-[var(--text-secondary)]">
                {block.content || 'Empty callout...'}
              </p>
            </div>
          </div>
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
            {block.runnable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400">Runnable</span>
            )}
          </div>
          <pre className="whitespace-pre-wrap">{block.code || '// Empty code block'}</pre>
        </div>
      )

    case 'feedback-form':
      return <FeedbackFormPreview block={block} />

    case 'plugin':
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <Puzzle size={24} className="text-[var(--text-tertiary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Plugin: {block.pluginType || 'Unconfigured'}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Plugin block content</p>
          </div>
        </div>
      )

    case 'slide':
      return (
        <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 mb-1.5">
            <Presentation size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Slide
            </span>
          </div>
          <div
            className="w-full aspect-video rounded border border-[var(--border-default)] overflow-hidden relative"
            style={{
              backgroundColor: block.backgroundColor || '#ffffff',
              maxHeight: 80
            }}
          >
            <p className="absolute bottom-1 right-1.5 text-[10px] text-[var(--text-tertiary)]">
              {block.elements.length} element{block.elements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )

    default: {
      const _exhaustive: never = block
      void _exhaustive
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
          <Box size={20} className="text-[var(--text-tertiary)] shrink-0" />
          <div>
            <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              Unknown Block
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
