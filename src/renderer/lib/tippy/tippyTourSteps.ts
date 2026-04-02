// ─── Tippy Tour Step Definitions ───

export interface TourStep {
  id: string
  targetSelector: string
  title: string        // i18n key
  description: string  // i18n key
  position: 'top' | 'bottom' | 'left' | 'right'
  tippyMessage: string // i18n key — what Tippy says in chat for this step
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'sidebar',
    targetSelector: '[data-tour="sidebar"]',
    title: 'tippy.tour.sidebarTitle',
    description: 'tippy.tour.sidebarDesc',
    position: 'right',
    tippyMessage: 'tippy.tour.sidebarMsg'
  },
  {
    id: 'dashboard',
    targetSelector: '[data-tour="dashboard"]',
    title: 'tippy.tour.dashboardTitle',
    description: 'tippy.tour.dashboardDesc',
    position: 'bottom',
    tippyMessage: 'tippy.tour.dashboardMsg'
  },
  {
    id: 'toolbar',
    targetSelector: '[data-tour="toolbar"]',
    title: 'tippy.tour.toolbarTitle',
    description: 'tippy.tour.toolbarDesc',
    position: 'bottom',
    tippyMessage: 'tippy.tour.toolbarMsg'
  },
  {
    id: 'outline',
    targetSelector: '[data-tour="outline"]',
    title: 'tippy.tour.outlineTitle',
    description: 'tippy.tour.outlineDesc',
    position: 'right',
    tippyMessage: 'tippy.tour.outlineMsg'
  },
  {
    id: 'canvas',
    targetSelector: '[data-tour="canvas"]',
    title: 'tippy.tour.canvasTitle',
    description: 'tippy.tour.canvasDesc',
    position: 'top',
    tippyMessage: 'tippy.tour.canvasMsg'
  },
  {
    id: 'properties',
    targetSelector: '[data-tour="properties"]',
    title: 'tippy.tour.propertiesTitle',
    description: 'tippy.tour.propertiesDesc',
    position: 'left',
    tippyMessage: 'tippy.tour.propertiesMsg'
  },
  {
    id: 'blockPalette',
    targetSelector: '[data-tour="block-palette"]',
    title: 'tippy.tour.blockPaletteTitle',
    description: 'tippy.tour.blockPaletteDesc',
    position: 'right',
    tippyMessage: 'tippy.tour.blockPaletteMsg'
  },
  {
    id: 'aiAssistant',
    targetSelector: '[data-tour="ai-assistant"]',
    title: 'tippy.tour.aiAssistantTitle',
    description: 'tippy.tour.aiAssistantDesc',
    position: 'left',
    tippyMessage: 'tippy.tour.aiAssistantMsg'
  },
  {
    id: 'preview',
    targetSelector: '[data-tour="preview"]',
    title: 'tippy.tour.previewTitle',
    description: 'tippy.tour.previewDesc',
    position: 'bottom',
    tippyMessage: 'tippy.tour.previewMsg'
  },
  {
    id: 'publish',
    targetSelector: '[data-tour="publish"]',
    title: 'tippy.tour.publishTitle',
    description: 'tippy.tour.publishDesc',
    position: 'bottom',
    tippyMessage: 'tippy.tour.publishMsg'
  }
]
