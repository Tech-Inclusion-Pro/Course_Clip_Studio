import { useEffect, useMemo, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Palette,
  Highlighter,
  RemoveFormatting
} from 'lucide-react'
import { fleschKincaidGrade, stripHtml } from '@/lib/reading-level'
import type { TextBlock } from '@/types/course'

interface TextBlockEditorProps {
  block: TextBlock
  onUpdate: (partial: Partial<TextBlock>) => void
}

export function TextBlockEditor({ block, onUpdate }: TextBlockEditorProps): JSX.Element {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[var(--brand-magenta)] underline cursor-pointer' }
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Start typing your content...' })
    ],
    content: block.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-1 py-2 text-[var(--text-primary)]',
        role: 'textbox',
        'aria-label': 'Text block editor',
        'aria-multiline': 'true'
      }
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      const plainText = stripHtml(html)
      const grade = fleschKincaidGrade(plainText)
      onUpdate({
        content: html,
        readingLevel: grade ?? undefined
      })
    }
  })

  // Sync external content changes (e.g. undo/redo)
  useEffect(() => {
    if (editor && block.content !== editor.getHTML()) {
      editor.commands.setContent(block.content || '', false)
    }
  }, [block.content, editor])

  const readingLevel = useMemo(() => {
    const plain = stripHtml(block.content || '')
    return fleschKincaidGrade(plain)
  }, [block.content])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return <div />

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Text block editor"
    >
      {/* Formatting Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-[var(--border-default)] bg-[var(--bg-muted)]"
        role="toolbar"
        aria-label="Text formatting"
      >
        <FormatButton
          icon={Bold}
          label="Bold"
          shortcut="Ctrl+B"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <FormatButton
          icon={Italic}
          label="Italic"
          shortcut="Ctrl+I"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <FormatButton
          icon={UnderlineIcon}
          label="Underline"
          shortcut="Ctrl+U"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <FormatButton
          icon={Strikethrough}
          label="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <ToolbarSep />

        <FormatButton
          icon={Heading1}
          label="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <FormatButton
          icon={Heading2}
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <FormatButton
          icon={Heading3}
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <FormatButton
          icon={Heading4}
          label="Heading 4"
          active={editor.isActive('heading', { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        />

        <ToolbarSep />

        <FormatButton
          icon={List}
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <FormatButton
          icon={ListOrdered}
          label="Ordered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <FormatButton
          icon={Quote}
          label="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <FormatButton
          icon={Code}
          label="Inline code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />

        <ToolbarSep />

        <FormatButton
          icon={Link2}
          label="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        />
        <FormatButton
          icon={Highlighter}
          label="Highlight"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />

        {/* Color picker */}
        <div className="relative">
          <label className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center" title="Text color">
            <Palette size={14} />
            <input
              type="color"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              aria-label="Text color"
            />
          </label>
        </div>

        <ToolbarSep />

        <FormatButton
          icon={RemoveFormatting}
          label="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />

        {/* Reading level badge */}
        {readingLevel !== null && (
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={`text-[10px] font-[var(--font-weight-medium)] px-1.5 py-0.5 rounded ${
                readingLevel <= 8
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : readingLevel <= 12
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
              title={`Flesch-Kincaid Grade Level: ${readingLevel}`}
              aria-label={`Reading level: grade ${readingLevel}`}
            >
              Grade {readingLevel}
            </span>
          </div>
        )}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  )
}

// ─── Toolbar Helpers ───

function FormatButton({
  icon: Icon,
  label,
  shortcut,
  active,
  onClick
}: {
  icon: typeof Bold
  label: string
  shortcut?: string
  active?: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-1 rounded cursor-pointer transition-colors
        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
        ${active
          ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
          : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
        }
      `}
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon size={14} />
    </button>
  )
}

function ToolbarSep(): JSX.Element {
  return <div className="w-px h-4 bg-[var(--border-default)] mx-0.5" aria-hidden="true" />
}
