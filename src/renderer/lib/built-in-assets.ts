/**
 * Built-in asset definitions — 50 starter SVG assets.
 * 20 icons, 20 shapes, 10 text shapes.
 * Each defined as inline SVG markup strings.
 */

import type { MediaAsset } from '@/types/media'

export interface BuiltInAssetDef {
  id: string
  title: string
  category: string
  subcategory?: string
  type: 'icon' | 'shape' | 'text-shape'
  svg: string
  ariaLabel: string
  tags: string[]
}

// ─── Navigation Icons (5) ───

const NAV_ICONS: BuiltInAssetDef[] = [
  {
    id: 'bi-icon-home',
    title: 'Home',
    category: 'navigation',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    ariaLabel: 'Home icon',
    tags: ['home', 'house', 'navigation', 'main']
  },
  {
    id: 'bi-icon-arrow-right',
    title: 'Arrow Right',
    category: 'navigation',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    ariaLabel: 'Arrow right icon',
    tags: ['arrow', 'next', 'forward', 'navigation']
  },
  {
    id: 'bi-icon-arrow-left',
    title: 'Arrow Left',
    category: 'navigation',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    ariaLabel: 'Arrow left icon',
    tags: ['arrow', 'back', 'previous', 'navigation']
  },
  {
    id: 'bi-icon-menu',
    title: 'Menu',
    category: 'navigation',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    ariaLabel: 'Menu icon',
    tags: ['menu', 'hamburger', 'navigation', 'toggle']
  },
  {
    id: 'bi-icon-search',
    title: 'Search',
    category: 'navigation',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    ariaLabel: 'Search icon',
    tags: ['search', 'find', 'lookup', 'magnifier']
  }
]

// ─── Accessibility Icons (3) ───

const A11Y_ICONS: BuiltInAssetDef[] = [
  {
    id: 'bi-icon-accessibility',
    title: 'Accessibility',
    category: 'accessibility',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M4 9h16"/><path d="M12 9v13"/><path d="M8 21l4-4 4 4"/></svg>',
    ariaLabel: 'Accessibility icon',
    tags: ['accessibility', 'a11y', 'universal', 'inclusive']
  },
  {
    id: 'bi-icon-eye-off',
    title: 'Vision Impaired',
    category: 'accessibility',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    ariaLabel: 'Vision impaired icon',
    tags: ['vision', 'blind', 'accessibility', 'eye']
  },
  {
    id: 'bi-icon-captions',
    title: 'Closed Captions',
    category: 'accessibility',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 12h2"/><path d="M15 12h2"/><path d="M7 16h10"/></svg>',
    ariaLabel: 'Closed captions icon',
    tags: ['captions', 'subtitles', 'deaf', 'accessibility']
  }
]

// ─── Education Icons (4) ───

const EDU_ICONS: BuiltInAssetDef[] = [
  {
    id: 'bi-icon-book-open',
    title: 'Book Open',
    category: 'education',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
    ariaLabel: 'Book open icon',
    tags: ['book', 'read', 'education', 'lesson']
  },
  {
    id: 'bi-icon-graduation',
    title: 'Graduation Cap',
    category: 'education',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
    ariaLabel: 'Graduation cap icon',
    tags: ['graduation', 'education', 'degree', 'academic']
  },
  {
    id: 'bi-icon-lightbulb',
    title: 'Lightbulb',
    category: 'education',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>',
    ariaLabel: 'Lightbulb icon',
    tags: ['idea', 'tip', 'lightbulb', 'education']
  },
  {
    id: 'bi-icon-pencil',
    title: 'Pencil',
    category: 'education',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    ariaLabel: 'Pencil icon',
    tags: ['edit', 'write', 'pencil', 'education']
  }
]

// ─── People Icons (2) ───

const PEOPLE_ICONS: BuiltInAssetDef[] = [
  {
    id: 'bi-icon-user',
    title: 'User',
    category: 'people',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    ariaLabel: 'User icon',
    tags: ['user', 'person', 'profile', 'people']
  },
  {
    id: 'bi-icon-users',
    title: 'Users Group',
    category: 'people',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    ariaLabel: 'User group icon',
    tags: ['group', 'team', 'users', 'people', 'collaboration']
  }
]

// ─── Technology Icons (2) ───

const TECH_ICONS: BuiltInAssetDef[] = [
  {
    id: 'bi-icon-monitor',
    title: 'Monitor',
    category: 'technology',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    ariaLabel: 'Monitor icon',
    tags: ['monitor', 'screen', 'computer', 'technology']
  },
  {
    id: 'bi-icon-link',
    title: 'Link',
    category: 'technology',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
    ariaLabel: 'Link icon',
    tags: ['link', 'url', 'chain', 'connection']
  }
]

// ─── Media Icons (2) ───

const MEDIA_ICONS: BuiltInAssetDef[] = [
  {
    id: 'bi-icon-image',
    title: 'Image',
    category: 'media',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    ariaLabel: 'Image icon',
    tags: ['image', 'photo', 'picture', 'media']
  },
  {
    id: 'bi-icon-play',
    title: 'Play',
    category: 'media',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    ariaLabel: 'Play icon',
    tags: ['play', 'video', 'start', 'media']
  }
]

// ─── Feedback Icons (2) ───

const FEEDBACK_ICONS: BuiltInAssetDef[] = [
  {
    id: 'bi-icon-check-circle',
    title: 'Check Circle',
    category: 'feedback',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    ariaLabel: 'Check circle icon',
    tags: ['check', 'success', 'correct', 'done', 'feedback']
  },
  {
    id: 'bi-icon-alert-triangle',
    title: 'Alert Triangle',
    category: 'feedback',
    type: 'icon',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    ariaLabel: 'Alert warning icon',
    tags: ['alert', 'warning', 'caution', 'feedback']
  }
]

// ─── Basic Geometric Shapes (8) ───

const BASIC_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-shape-circle',
    title: 'Circle',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Circle shape',
    tags: ['circle', 'round', 'basic', 'geometric']
  },
  {
    id: 'bi-shape-square',
    title: 'Square',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Square shape',
    tags: ['square', 'rectangle', 'basic', 'geometric']
  },
  {
    id: 'bi-shape-triangle',
    title: 'Triangle',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 95,95 5,95" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/></svg>',
    ariaLabel: 'Triangle shape',
    tags: ['triangle', 'basic', 'geometric']
  },
  {
    id: 'bi-shape-diamond',
    title: 'Diamond',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 95,50 50,95 5,50" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/></svg>',
    ariaLabel: 'Diamond shape',
    tags: ['diamond', 'rhombus', 'basic', 'geometric']
  },
  {
    id: 'bi-shape-pentagon',
    title: 'Pentagon',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 97,38 79,95 21,95 3,38" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/></svg>',
    ariaLabel: 'Pentagon shape',
    tags: ['pentagon', 'five-sided', 'basic', 'geometric']
  },
  {
    id: 'bi-shape-hexagon',
    title: 'Hexagon',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,3 93,25 93,75 50,97 7,75 7,25" fill="#6f2fa6" stroke="#a23b84" stroke-width="2"/></svg>',
    ariaLabel: 'Hexagon shape',
    tags: ['hexagon', 'six-sided', 'basic', 'geometric']
  },
  {
    id: 'bi-shape-star',
    title: 'Star',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 61,38 97,38 68,60 79,95 50,72 21,95 32,60 3,38 39,38" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Star shape',
    tags: ['star', 'five-point', 'basic', 'geometric']
  },
  {
    id: 'bi-shape-oval',
    title: 'Oval',
    category: 'basic-geometric',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="30" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Oval shape',
    tags: ['oval', 'ellipse', 'basic', 'geometric']
  }
]

// ─── Rounded Shapes (4) ───

const ROUNDED_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-shape-rounded-rect',
    title: 'Rounded Rectangle',
    category: 'rounded',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect x="5" y="5" width="110" height="70" rx="15" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Rounded rectangle shape',
    tags: ['rounded', 'rectangle', 'pill', 'button']
  },
  {
    id: 'bi-shape-pill',
    title: 'Pill',
    category: 'rounded',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60"><rect x="5" y="5" width="130" height="50" rx="25" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/></svg>',
    ariaLabel: 'Pill shape',
    tags: ['pill', 'capsule', 'rounded', 'tag']
  },
  {
    id: 'bi-shape-rounded-square',
    title: 'Rounded Square',
    category: 'rounded',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" rx="20" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/></svg>',
    ariaLabel: 'Rounded square shape',
    tags: ['rounded', 'square', 'card']
  },
  {
    id: 'bi-shape-squircle',
    title: 'Squircle',
    category: 'rounded',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" rx="30" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/></svg>',
    ariaLabel: 'Squircle shape',
    tags: ['squircle', 'super-ellipse', 'rounded', 'app-icon']
  }
]

// ─── Arrow Shapes (4) ───

const ARROW_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-shape-arrow-right',
    title: 'Arrow Right',
    category: 'arrows',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><polygon points="5,25 75,25 75,5 115,40 75,75 75,55 5,55" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Arrow right shape',
    tags: ['arrow', 'right', 'next', 'direction']
  },
  {
    id: 'bi-shape-arrow-left',
    title: 'Arrow Left',
    category: 'arrows',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><polygon points="115,25 45,25 45,5 5,40 45,75 45,55 115,55" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Arrow left shape',
    tags: ['arrow', 'left', 'back', 'direction']
  },
  {
    id: 'bi-shape-arrow-up',
    title: 'Arrow Up',
    category: 'arrows',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120"><polygon points="15,45 40,5 65,45 55,45 55,115 25,115 25,45" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/></svg>',
    ariaLabel: 'Arrow up shape',
    tags: ['arrow', 'up', 'direction']
  },
  {
    id: 'bi-shape-arrow-down',
    title: 'Arrow Down',
    category: 'arrows',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120"><polygon points="25,5 55,5 55,75 65,75 40,115 15,75 25,75" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/></svg>',
    ariaLabel: 'Arrow down shape',
    tags: ['arrow', 'down', 'direction']
  }
]

// ─── Callout Shapes (4) ───

const CALLOUT_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-shape-speech-bubble',
    title: 'Speech Bubble',
    category: 'callouts',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><path d="M10,10 h95 a5,5 0 0,1 5,5 v50 a5,5 0 0,1 -5,5 h-60 l-15,20 v-20 h-20 a5,5 0 0,1 -5,-5 v-50 a5,5 0 0,1 5,-5 z" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Speech bubble shape',
    tags: ['speech', 'bubble', 'chat', 'callout', 'dialog']
  },
  {
    id: 'bi-shape-thought-bubble',
    title: 'Thought Bubble',
    category: 'callouts',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><ellipse cx="60" cy="40" rx="50" ry="32" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="30" cy="80" r="6" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="20" cy="92" r="4" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Thought bubble shape',
    tags: ['thought', 'think', 'bubble', 'callout']
  },
  {
    id: 'bi-shape-banner',
    title: 'Banner',
    category: 'callouts',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60"><polygon points="10,5 130,5 125,30 130,55 10,55 15,30" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/></svg>',
    ariaLabel: 'Banner shape',
    tags: ['banner', 'ribbon', 'callout', 'highlight']
  },
  {
    id: 'bi-shape-badge',
    title: 'Badge',
    category: 'callouts',
    type: 'shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110"><circle cx="50" cy="42" r="38" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><polygon points="35,72 50,105 50,82 65,72" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/></svg>',
    ariaLabel: 'Badge shape',
    tags: ['badge', 'award', 'achievement', 'callout']
  }
]

// ─── Text Shapes — Callout Boxes (3) ───

const CALLOUT_TEXT_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-ts-tip-box',
    title: 'Tip Box',
    category: 'callout-boxes',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80"><rect x="2" y="2" width="296" height="76" rx="8" fill="#f0e7f5" stroke="#6f2fa6" stroke-width="2"/><circle cx="28" cy="40" r="12" fill="#6f2fa6"/><text x="28" y="45" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text><text x="52" y="32" fill="#3a2b95" font-size="12" font-weight="bold" font-family="system-ui">Tip</text><text x="52" y="52" fill="#333" font-size="11" font-family="system-ui">Add your helpful tip here...</text></svg>',
    ariaLabel: 'Tip callout box',
    tags: ['tip', 'callout', 'hint', 'info', 'text-shape']
  },
  {
    id: 'bi-ts-warning-box',
    title: 'Warning Box',
    category: 'callout-boxes',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80"><rect x="2" y="2" width="296" height="76" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2"/><polygon points="28,22 40,50 16,50" fill="#d97706"/><text x="28" y="46" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text><text x="52" y="32" fill="#92400e" font-size="12" font-weight="bold" font-family="system-ui">Warning</text><text x="52" y="52" fill="#333" font-size="11" font-family="system-ui">Important caution or warning...</text></svg>',
    ariaLabel: 'Warning callout box',
    tags: ['warning', 'caution', 'alert', 'callout', 'text-shape']
  },
  {
    id: 'bi-ts-note-box',
    title: 'Note Box',
    category: 'callout-boxes',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80"><rect x="2" y="2" width="296" height="76" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/><circle cx="28" cy="40" r="12" fill="#0284c7"/><text x="28" y="45" text-anchor="middle" fill="white" font-size="14" font-style="italic" font-family="serif">i</text><text x="52" y="32" fill="#075985" font-size="12" font-weight="bold" font-family="system-ui">Note</text><text x="52" y="52" fill="#333" font-size="11" font-family="system-ui">Add a note or key information...</text></svg>',
    ariaLabel: 'Note callout box',
    tags: ['note', 'info', 'information', 'callout', 'text-shape']
  }
]

// ─── Text Shapes — Section Headers (3) ───

const HEADER_TEXT_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-ts-header-underline',
    title: 'Section Header — Underline',
    category: 'section-headers',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 50"><text x="10" y="28" fill="#3a2b95" font-size="20" font-weight="bold" font-family="system-ui">Section Title</text><line x1="10" y1="38" x2="290" y2="38" stroke="#a23b84" stroke-width="3"/></svg>',
    ariaLabel: 'Section header with underline',
    tags: ['header', 'title', 'section', 'underline', 'text-shape']
  },
  {
    id: 'bi-ts-header-pill',
    title: 'Section Header — Pill',
    category: 'section-headers',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 50"><rect x="2" y="5" width="296" height="40" rx="20" fill="#a23b84"/><text x="150" y="31" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="system-ui">Section Title</text></svg>',
    ariaLabel: 'Section header with pill background',
    tags: ['header', 'title', 'section', 'pill', 'text-shape']
  },
  {
    id: 'bi-ts-header-gradient',
    title: 'Section Header — Gradient',
    category: 'section-headers',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 50"><defs><linearGradient id="hg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#a23b84"/><stop offset="100%" stop-color="#3a2b95"/></linearGradient></defs><rect x="2" y="5" width="296" height="40" rx="6" fill="url(#hg1)"/><text x="150" y="31" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="system-ui">Section Title</text></svg>',
    ariaLabel: 'Section header with gradient background',
    tags: ['header', 'title', 'section', 'gradient', 'text-shape']
  }
]

// ─── Text Shapes — Labels (2) ───

const LABEL_TEXT_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-ts-label-tag',
    title: 'Tag Label',
    category: 'labels',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 36"><rect x="2" y="2" width="116" height="32" rx="16" fill="#f0e7f5" stroke="#6f2fa6" stroke-width="1.5"/><text x="60" y="23" text-anchor="middle" fill="#6f2fa6" font-size="12" font-weight="600" font-family="system-ui">Label</text></svg>',
    ariaLabel: 'Tag label',
    tags: ['label', 'tag', 'badge', 'text-shape']
  },
  {
    id: 'bi-ts-label-step',
    title: 'Step Number Label',
    category: 'labels',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><circle cx="20" cy="20" r="16" fill="#a23b84"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="system-ui">1</text><text x="48" y="26" fill="#333" font-size="14" font-weight="600" font-family="system-ui">Step Title</text></svg>',
    ariaLabel: 'Numbered step label',
    tags: ['step', 'number', 'sequence', 'label', 'text-shape']
  }
]

// ─── Text Shapes — Instructional Prompts (2) ───

const PROMPT_TEXT_SHAPES: BuiltInAssetDef[] = [
  {
    id: 'bi-ts-prompt-question',
    title: 'Question Prompt',
    category: 'instructional-prompts',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70"><rect x="2" y="2" width="296" height="66" rx="8" fill="white" stroke="#a23b84" stroke-width="2"/><circle cx="28" cy="35" r="14" fill="#a23b84"/><text x="28" y="41" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="system-ui">?</text><text x="54" y="30" fill="#3a2b95" font-size="13" font-weight="bold" font-family="system-ui">Think About It</text><text x="54" y="48" fill="#555" font-size="11" font-family="system-ui">What do you think will happen next?</text></svg>',
    ariaLabel: 'Question prompt box',
    tags: ['question', 'prompt', 'think', 'reflect', 'text-shape']
  },
  {
    id: 'bi-ts-prompt-activity',
    title: 'Activity Prompt',
    category: 'instructional-prompts',
    type: 'text-shape',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70"><rect x="2" y="2" width="296" height="66" rx="8" fill="white" stroke="#16a34a" stroke-width="2"/><rect x="14" y="21" width="28" height="28" rx="6" fill="#16a34a"/><text x="28" y="41" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="system-ui">&#9998;</text><text x="54" y="30" fill="#15803d" font-size="13" font-weight="bold" font-family="system-ui">Activity</text><text x="54" y="48" fill="#555" font-size="11" font-family="system-ui">Complete the following exercise...</text></svg>',
    ariaLabel: 'Activity prompt box',
    tags: ['activity', 'exercise', 'do', 'practice', 'text-shape']
  }
]

// ─── All definitions combined ───

export const ALL_BUILT_IN_DEFS: BuiltInAssetDef[] = [
  ...NAV_ICONS,
  ...A11Y_ICONS,
  ...EDU_ICONS,
  ...PEOPLE_ICONS,
  ...TECH_ICONS,
  ...MEDIA_ICONS,
  ...FEEDBACK_ICONS,
  ...BASIC_SHAPES,
  ...ROUNDED_SHAPES,
  ...ARROW_SHAPES,
  ...CALLOUT_SHAPES,
  ...CALLOUT_TEXT_SHAPES,
  ...HEADER_TEXT_SHAPES,
  ...LABEL_TEXT_SHAPES,
  ...PROMPT_TEXT_SHAPES
]

// ─── Category Metadata ───

export const BUILT_IN_CATEGORIES: Array<{ id: string; label: string; parentType: 'icon' | 'shape' | 'text-shape' }> = [
  // Icons
  { id: 'navigation', label: 'Navigation', parentType: 'icon' },
  { id: 'accessibility', label: 'Accessibility', parentType: 'icon' },
  { id: 'education', label: 'Education', parentType: 'icon' },
  { id: 'people', label: 'People', parentType: 'icon' },
  { id: 'technology', label: 'Technology', parentType: 'icon' },
  { id: 'media', label: 'Media', parentType: 'icon' },
  { id: 'feedback', label: 'Feedback', parentType: 'icon' },
  // Shapes
  { id: 'basic-geometric', label: 'Basic Geometric', parentType: 'shape' },
  { id: 'rounded', label: 'Rounded', parentType: 'shape' },
  { id: 'arrows', label: 'Arrows', parentType: 'shape' },
  { id: 'callouts', label: 'Callouts', parentType: 'shape' },
  // Text Shapes
  { id: 'callout-boxes', label: 'Callout Boxes', parentType: 'text-shape' },
  { id: 'section-headers', label: 'Section Headers', parentType: 'text-shape' },
  { id: 'labels', label: 'Labels', parentType: 'text-shape' },
  { id: 'instructional-prompts', label: 'Instructional Prompts', parentType: 'text-shape' }
]

// ─── Convert definitions to MediaAsset objects ───

export function getBuiltInAssets(): MediaAsset[] {
  return ALL_BUILT_IN_DEFS.map((def) => ({
    metadata: {
      id: def.id,
      title: def.title,
      altText: def.ariaLabel,
      ariaLabel: def.ariaLabel,
      license: 'Built-in (Lumina UDL)',
      udlTag: 'representation' as const,
      wcagStatus: 'complete' as const,
      language: 'en',
      tags: def.tags,
      dateAdded: '2024-01-01T00:00:00.000Z',
      projectScope: 'global' as const
    },
    type: def.type,
    tier: 'built-in' as const,
    filePath: `built-in://${def.id}`,
    category: def.category,
    subcategory: def.subcategory,
    mimeType: 'image/svg+xml',
    fileSize: new Blob([def.svg]).size
  }))
}

/**
 * Get the SVG string for a built-in asset by ID.
 */
export function getBuiltInSvg(assetId: string): string | null {
  const def = ALL_BUILT_IN_DEFS.find((d) => d.id === assetId)
  return def?.svg ?? null
}
