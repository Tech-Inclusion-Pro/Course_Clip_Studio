import type { SlideLayoutDef, LayoutHint } from '@/types/presentation'

// ─── All 11 Slide Layout Definitions ───
// Single source of truth for PPTX positioning, thumbnail wireframes, and metadata.
// Canvas: 13.33 × 7.5 inches (LAYOUT_WIDE, 16:9)

export const SLIDE_LAYOUTS: SlideLayoutDef[] = [
  {
    id: 'title',
    name: 'Title Slide',
    description: 'Large centered title with subtitle. Use for the opening slide.',
    usesImage: false,
    usesBody: true,
    accentBackground: true,
    thumbnailRegions: [
      { kind: 'accent', x: 0, y: 0, w: 100, h: 100 },
      { kind: 'text', x: 15, y: 25, w: 70, h: 20 },
      { kind: 'text', x: 25, y: 50, w: 50, h: 12 }
    ],
    pptxElements: [
      { kind: 'title', rect: { x: 1.0, y: 1.8, w: 11.33, h: 2.0 }, style: { fontSize: 36, bold: true, align: 'center', valign: 'middle', colorKey: 'onAccentColor' } },
      { kind: 'body', rect: { x: 2.0, y: 4.0, w: 9.33, h: 1.5 }, style: { fontSize: 18, align: 'center', valign: 'top', colorKey: 'onAccentColor' } }
    ]
  },
  {
    id: 'section',
    name: 'Section Header',
    description: 'Centered text for topic transitions between major sections.',
    usesImage: false,
    usesBody: true,
    accentBackground: true,
    thumbnailRegions: [
      { kind: 'accent', x: 0, y: 0, w: 100, h: 100 },
      { kind: 'text', x: 20, y: 30, w: 60, h: 18 },
      { kind: 'text', x: 30, y: 55, w: 40, h: 10 }
    ],
    pptxElements: [
      { kind: 'title', rect: { x: 1.5, y: 2.0, w: 10.33, h: 2.0 }, style: { fontSize: 32, bold: true, align: 'center', valign: 'middle', colorKey: 'onAccentColor' } },
      { kind: 'body', rect: { x: 2.5, y: 4.2, w: 8.33, h: 1.2 }, style: { fontSize: 16, align: 'center', valign: 'top', colorKey: 'onAccentColor' } }
    ]
  },
  {
    id: 'bullets',
    name: 'Content',
    description: 'Standard layout with title and body text. The default for most slides.',
    usesImage: false,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'text', x: 5, y: 5, w: 90, h: 15 },
      { kind: 'text', x: 5, y: 25, w: 85, h: 55 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'title', rect: { x: 0.7, y: 0.3, w: 11.9, h: 0.9 }, style: { fontSize: 26, bold: true, valign: 'bottom', colorKey: 'titleColor' } },
      { kind: 'body', rect: { x: 0.7, y: 1.4, w: 11.9, h: 5.2 }, style: { fontSize: 16, valign: 'top', colorKey: 'bodyColor', paraSpaceAfter: 8 } },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  },
  {
    id: 'image-left',
    name: 'Image + Content',
    description: 'Image on the left (40%), text on the right (60%).',
    usesImage: true,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'image', x: 3, y: 5, w: 38, h: 82 },
      { kind: 'text', x: 45, y: 5, w: 52, h: 15 },
      { kind: 'text', x: 45, y: 25, w: 50, h: 62 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'image', rect: { x: 0.4, y: 0.4, w: 5.1, h: 6.2 }, style: {} },
      { kind: 'title', rect: { x: 5.9, y: 0.3, w: 6.73, h: 0.9 }, style: { fontSize: 26, bold: true, valign: 'bottom', colorKey: 'titleColor' } },
      { kind: 'body', rect: { x: 5.9, y: 1.4, w: 6.73, h: 5.2 }, style: { fontSize: 16, valign: 'top', colorKey: 'bodyColor', paraSpaceAfter: 8 } },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  },
  {
    id: 'image-right',
    name: 'Content + Image',
    description: 'Text on the left (60%), image on the right (40%).',
    usesImage: true,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'text', x: 3, y: 5, w: 52, h: 15 },
      { kind: 'text', x: 3, y: 25, w: 50, h: 62 },
      { kind: 'image', x: 59, y: 5, w: 38, h: 82 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'title', rect: { x: 0.7, y: 0.3, w: 6.73, h: 0.9 }, style: { fontSize: 26, bold: true, valign: 'bottom', colorKey: 'titleColor' } },
      { kind: 'body', rect: { x: 0.7, y: 1.4, w: 6.73, h: 5.2 }, style: { fontSize: 16, valign: 'top', colorKey: 'bodyColor', paraSpaceAfter: 8 } },
      { kind: 'image', rect: { x: 7.83, y: 0.4, w: 5.1, h: 6.2 }, style: {} },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  },
  {
    id: 'two-column',
    name: 'Two Columns',
    description: 'Side-by-side text columns for comparisons or parallel points.',
    usesImage: false,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'text', x: 5, y: 5, w: 90, h: 15 },
      { kind: 'text', x: 5, y: 25, w: 42, h: 60 },
      { kind: 'text', x: 53, y: 25, w: 42, h: 60 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'title', rect: { x: 0.7, y: 0.3, w: 11.9, h: 0.9 }, style: { fontSize: 26, bold: true, valign: 'bottom', colorKey: 'titleColor' } },
      { kind: 'col-left', rect: { x: 0.7, y: 1.4, w: 5.6, h: 5.2 }, style: { fontSize: 16, valign: 'top', colorKey: 'bodyColor', paraSpaceAfter: 8 } },
      { kind: 'col-right', rect: { x: 6.93, y: 1.4, w: 5.6, h: 5.2 }, style: { fontSize: 16, valign: 'top', colorKey: 'bodyColor', paraSpaceAfter: 8 } },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  },
  {
    id: 'full-image',
    name: 'Full Image',
    description: 'Background image with overlay text at the bottom.',
    usesImage: true,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'image', x: 0, y: 0, w: 100, h: 70 },
      { kind: 'accent', x: 0, y: 70, w: 100, h: 30 },
      { kind: 'text', x: 5, y: 74, w: 90, h: 22 }
    ],
    pptxElements: [
      { kind: 'image', rect: { x: 0, y: 0, w: 13.33, h: 5.5 }, style: {} },
      { kind: 'accent-bar', rect: { x: 0, y: 5.5, w: 13.33, h: 2.0 }, style: { colorKey: 'accentColor' } },
      { kind: 'title', rect: { x: 0.7, y: 5.6, w: 11.9, h: 0.8 }, style: { fontSize: 24, bold: true, valign: 'middle', colorKey: 'onAccentColor' } },
      { kind: 'body', rect: { x: 0.7, y: 6.4, w: 11.9, h: 0.8 }, style: { fontSize: 14, valign: 'top', colorKey: 'onAccentColor' } }
    ]
  },
  {
    id: 'big-number',
    name: 'Big Number',
    description: 'Large 72pt centered number with caption. Use title field for the number. Great for statistics.',
    usesImage: false,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'text', x: 20, y: 15, w: 60, h: 40 },
      { kind: 'text', x: 15, y: 60, w: 70, h: 15 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'number', rect: { x: 1.0, y: 1.0, w: 11.33, h: 3.5 }, style: { fontSize: 72, bold: true, align: 'center', valign: 'bottom', colorKey: 'accentColor' } },
      { kind: 'body', rect: { x: 2.0, y: 4.6, w: 9.33, h: 1.5 }, style: { fontSize: 18, align: 'center', valign: 'top', colorKey: 'bodyColor' } },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Decorative quotation with italic text and attribution. Body ends with "-- Attribution".',
    usesImage: false,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'accent', x: 8, y: 10, w: 12, h: 25 },
      { kind: 'text', x: 10, y: 25, w: 80, h: 35 },
      { kind: 'text', x: 50, y: 65, w: 40, h: 10 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'quote-mark', rect: { x: 1.0, y: 0.8, w: 2.0, h: 2.0 }, style: { fontSize: 96, bold: true, colorKey: 'accentColor', align: 'left', valign: 'top' } },
      { kind: 'body', rect: { x: 1.5, y: 2.2, w: 10.33, h: 3.0 }, style: { fontSize: 22, italic: true, align: 'center', valign: 'middle', colorKey: 'bodyColor' } },
      { kind: 'attribution', rect: { x: 5.0, y: 5.4, w: 7.33, h: 0.8 }, style: { fontSize: 14, align: 'right', valign: 'top', colorKey: 'bodyColor' } },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Two labeled columns for pros/cons or side-by-side comparison. Body uses "---" to separate columns.',
    usesImage: false,
    usesBody: true,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'text', x: 5, y: 5, w: 90, h: 12 },
      { kind: 'accent', x: 5, y: 20, w: 42, h: 8 },
      { kind: 'text', x: 5, y: 30, w: 42, h: 52 },
      { kind: 'accent', x: 53, y: 20, w: 42, h: 8 },
      { kind: 'text', x: 53, y: 30, w: 42, h: 52 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'title', rect: { x: 0.7, y: 0.3, w: 11.9, h: 0.9 }, style: { fontSize: 26, bold: true, valign: 'bottom', colorKey: 'titleColor' } },
      { kind: 'col-left-label', rect: { x: 0.7, y: 1.4, w: 5.6, h: 0.6 }, style: { fontSize: 16, bold: true, align: 'center', valign: 'middle', colorKey: 'onAccentColor' } },
      { kind: 'col-left', rect: { x: 0.7, y: 2.1, w: 5.6, h: 4.5 }, style: { fontSize: 15, valign: 'top', colorKey: 'bodyColor', paraSpaceAfter: 8 } },
      { kind: 'col-right-label', rect: { x: 6.93, y: 1.4, w: 5.6, h: 0.6 }, style: { fontSize: 16, bold: true, align: 'center', valign: 'middle', colorKey: 'onAccentColor' } },
      { kind: 'col-right', rect: { x: 6.93, y: 2.1, w: 5.6, h: 4.5 }, style: { fontSize: 15, valign: 'top', colorKey: 'bodyColor', paraSpaceAfter: 8 } },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'Title with accent bar only. Use for minimal slides or manual customization.',
    usesImage: false,
    usesBody: false,
    accentBackground: false,
    thumbnailRegions: [
      { kind: 'text', x: 5, y: 5, w: 90, h: 15 },
      { kind: 'accent', x: 0, y: 93, w: 100, h: 7 }
    ],
    pptxElements: [
      { kind: 'title', rect: { x: 0.7, y: 0.3, w: 11.9, h: 0.9 }, style: { fontSize: 26, bold: true, valign: 'bottom', colorKey: 'titleColor' } },
      { kind: 'accent-bar', rect: { x: 0, y: 7.0, w: 13.33, h: 0.5 }, style: { colorKey: 'accentColor' } }
    ]
  }
]

const layoutMap = new Map<LayoutHint, SlideLayoutDef>(
  SLIDE_LAYOUTS.map((l) => [l.id, l])
)

export function getLayoutDef(id: LayoutHint): SlideLayoutDef {
  return layoutMap.get(id) ?? layoutMap.get('bullets')!
}
