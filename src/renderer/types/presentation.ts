// ─── Presentation Builder Data Model ───

export type PresentationWizardStep = 'entry' | 'outline' | 'render' | 'preview'

export type EntryMode = 'prompt' | 'notes' | 'document' | 'contentArea' | 'data'

export type LayoutHint =
  | 'title' | 'bullets' | 'two-column' | 'image-left' | 'image-right'
  | 'full-image' | 'section' | 'big-number' | 'quote' | 'comparison' | 'blank'

export type ImageStyle = 'flat_vector' | 'photographic' | 'diagram' | 'abstract_gradient'

export type SlideFlagKind = 'invented' | 'condensed' | 'citation'

export interface SlideFlag {
  kind: SlideFlagKind
  detail: string
}

export interface IntakeConfig {
  audience: string
  slideCount: number
  density: 'light' | 'medium' | 'dense'
  language?: string
}

export interface SlideDraft {
  id: string
  title: string
  body: string
  speakerNotes: string
  imagePrompt: string
  layoutHint: LayoutHint
  flags: SlideFlag[]
}

export interface RenderedSlide extends SlideDraft {
  imagePath: string | null
  imageAltText: string
}

export interface PresentationTheme {
  id: string
  name: string
  background: string
  surface: string
  textPrimary: string
  textOnAccent: string
  accent: string
  accentSecondary: string
  fontFamily: string
}

export interface ContrastPair {
  label: string
  foreground: string
  background: string
  ratio: number
  passAA: boolean
  passAALarge: boolean
}

export interface ContrastReport {
  pairs: ContrastPair[]
  allPass: boolean
  overrideReason: string | null
}

export interface DeckDraft {
  id: string
  title: string
  entryMode: EntryMode
  intake: IntakeConfig
  prompt: string
  sourceContentAreaId?: string // when entryMode === 'contentArea'
  sourceDocName?: string // when entryMode === 'document'
  slides: SlideDraft[]
  themeId: string
  imageStyle: ImageStyle
  createdAt: string
  updatedAt: string
}

export interface DeckObject {
  id: string
  title: string
  slides: RenderedSlide[]
  theme: PresentationTheme
  imageStyle: ImageStyle
  courseId: string | null
  createdAt: string
  updatedAt: string
}

// ─── Slide Layout Definitions ───

export interface ThumbnailRegion {
  kind: 'text' | 'image' | 'accent'
  x: number
  y: number
  w: number
  h: number
}

export interface PptxElementStyle {
  fontSize?: number
  bold?: boolean
  italic?: boolean
  align?: 'left' | 'center' | 'right'
  valign?: 'top' | 'middle' | 'bottom'
  colorKey?: 'titleColor' | 'bodyColor' | 'accentColor' | 'onAccentColor'
  paraSpaceAfter?: number
}

export interface PptxElement {
  kind: 'title' | 'body' | 'image' | 'accent-bar' | 'number' | 'quote-mark' | 'attribution' | 'col-left' | 'col-right' | 'col-left-label' | 'col-right-label'
  rect: { x: number; y: number; w: number; h: number }
  style?: PptxElementStyle
}

export interface SlideLayoutDef {
  id: LayoutHint
  name: string
  description: string
  usesImage: boolean
  usesBody: boolean
  accentBackground: boolean
  thumbnailRegions: ThumbnailRegion[]
  pptxElements: PptxElement[]
}
