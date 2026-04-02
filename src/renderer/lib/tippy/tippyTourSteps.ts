// ─── Tippy Tour Step Definitions ───

export interface TourStep {
  id: string
  targetSelector: string
  title: string        // i18n key
  description: string  // i18n key
  position: 'top' | 'bottom' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'sidebar',
    targetSelector: '[data-tour="sidebar"]',
    title: 'tippy.tour.sidebarTitle',
    description: 'tippy.tour.sidebarDesc',
    position: 'right'
  },
  {
    id: 'dashboard',
    targetSelector: '[data-tour="dashboard"]',
    title: 'tippy.tour.dashboardTitle',
    description: 'tippy.tour.dashboardDesc',
    position: 'bottom'
  },
  {
    id: 'toolbar',
    targetSelector: '[data-tour="toolbar"]',
    title: 'tippy.tour.toolbarTitle',
    description: 'tippy.tour.toolbarDesc',
    position: 'bottom'
  },
  {
    id: 'outline',
    targetSelector: '[data-tour="outline"]',
    title: 'tippy.tour.outlineTitle',
    description: 'tippy.tour.outlineDesc',
    position: 'right'
  },
  {
    id: 'canvas',
    targetSelector: '[data-tour="canvas"]',
    title: 'tippy.tour.canvasTitle',
    description: 'tippy.tour.canvasDesc',
    position: 'top'
  },
  {
    id: 'properties',
    targetSelector: '[data-tour="properties"]',
    title: 'tippy.tour.propertiesTitle',
    description: 'tippy.tour.propertiesDesc',
    position: 'left'
  },
  {
    id: 'blockPalette',
    targetSelector: '[data-tour="block-palette"]',
    title: 'tippy.tour.blockPaletteTitle',
    description: 'tippy.tour.blockPaletteDesc',
    position: 'right'
  },
  {
    id: 'aiAssistant',
    targetSelector: '[data-tour="ai-assistant"]',
    title: 'tippy.tour.aiAssistantTitle',
    description: 'tippy.tour.aiAssistantDesc',
    position: 'left'
  },
  {
    id: 'preview',
    targetSelector: '[data-tour="preview"]',
    title: 'tippy.tour.previewTitle',
    description: 'tippy.tour.previewDesc',
    position: 'bottom'
  },
  {
    id: 'publish',
    targetSelector: '[data-tour="publish"]',
    title: 'tippy.tour.publishTitle',
    description: 'tippy.tour.publishDesc',
    position: 'bottom'
  }
]
