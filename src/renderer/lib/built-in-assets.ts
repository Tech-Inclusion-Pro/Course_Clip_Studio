/**
 * Built-in asset definitions — 450+ SVG assets.
 * ~225 icons, ~220 shapes, 10 text shapes.
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

// Compact SVG helpers for new assets
function _icon(d: string): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'
}
function _shape(d: string, vb = '0 0 100 100'): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + d + '</svg>'
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

// ─── Navigation Icons Extended (+5) ───

const NAV_ICONS_EXT: BuiltInAssetDef[] = [
  { id: 'bi-icon-chevron-right', title: 'Chevron Right', category: 'navigation', type: 'icon', svg: _icon('<polyline points="9 18 15 12 9 6"/>'), ariaLabel: 'Chevron right icon', tags: ['chevron', 'right', 'navigation'] },
  { id: 'bi-icon-chevron-down', title: 'Chevron Down', category: 'navigation', type: 'icon', svg: _icon('<polyline points="6 9 12 15 18 9"/>'), ariaLabel: 'Chevron down icon', tags: ['chevron', 'down', 'navigation'] },
  { id: 'bi-icon-chevron-up', title: 'Chevron Up', category: 'navigation', type: 'icon', svg: _icon('<polyline points="18 15 12 9 6 15"/>'), ariaLabel: 'Chevron up icon', tags: ['chevron', 'up', 'navigation'] },
  { id: 'bi-icon-external-link', title: 'External Link', category: 'navigation', type: 'icon', svg: _icon('<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'), ariaLabel: 'External link icon', tags: ['external', 'link', 'open', 'navigation'] },
  { id: 'bi-icon-refresh', title: 'Refresh', category: 'navigation', type: 'icon', svg: _icon('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>'), ariaLabel: 'Refresh icon', tags: ['refresh', 'reload', 'navigation'] }
]

// ─── Accessibility Icons Extended (+5) ───

const A11Y_ICONS_EXT: BuiltInAssetDef[] = [
  { id: 'bi-icon-hearing', title: 'Hearing', category: 'accessibility', type: 'icon', svg: _icon('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>'), ariaLabel: 'Hearing icon', tags: ['hearing', 'audio', 'accessibility'] },
  { id: 'bi-icon-text-size', title: 'Text Size', category: 'accessibility', type: 'icon', svg: _icon('<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>'), ariaLabel: 'Text size icon', tags: ['text', 'size', 'accessibility'] },
  { id: 'bi-icon-contrast', title: 'Contrast', category: 'accessibility', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 000 20z"/>'), ariaLabel: 'Contrast icon', tags: ['contrast', 'accessibility'] },
  { id: 'bi-icon-focus', title: 'Focus Target', category: 'accessibility', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'), ariaLabel: 'Focus target icon', tags: ['focus', 'target', 'accessibility'] },
  { id: 'bi-icon-keyboard', title: 'Keyboard', category: 'accessibility', type: 'icon', svg: _icon('<rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6.01" y2="8"/><line x1="10" y1="8" x2="10.01" y2="8"/><line x1="14" y1="8" x2="14.01" y2="8"/><line x1="18" y1="8" x2="18.01" y2="8"/><line x1="8" y1="12" x2="8.01" y2="12"/><line x1="12" y1="12" x2="12.01" y2="12"/><line x1="16" y1="12" x2="16.01" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/>'), ariaLabel: 'Keyboard icon', tags: ['keyboard', 'input', 'accessibility'] }
]

// ─── Education Icons Extended (+5) ───

const EDU_ICONS_EXT: BuiltInAssetDef[] = [
  { id: 'bi-icon-award', title: 'Award', category: 'education', type: 'icon', svg: _icon('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>'), ariaLabel: 'Award icon', tags: ['award', 'prize', 'education'] },
  { id: 'bi-icon-clipboard-check', title: 'Clipboard Check', category: 'education', type: 'icon', svg: _icon('<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>'), ariaLabel: 'Clipboard check icon', tags: ['clipboard', 'check', 'education'] },
  { id: 'bi-icon-globe', title: 'Globe', category: 'education', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>'), ariaLabel: 'Globe icon', tags: ['globe', 'world', 'education'] },
  { id: 'bi-icon-bookmark', title: 'Bookmark', category: 'education', type: 'icon', svg: _icon('<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>'), ariaLabel: 'Bookmark icon', tags: ['bookmark', 'save', 'education'] },
  { id: 'bi-icon-presentation', title: 'Presentation', category: 'education', type: 'icon', svg: _icon('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="7" y1="7" x2="17" y2="7"/><line x1="7" y1="11" x2="13" y2="11"/>'), ariaLabel: 'Presentation icon', tags: ['presentation', 'slides', 'education'] }
]

// ─── People Icons Extended (+5) ───

const PEOPLE_ICONS_EXT: BuiltInAssetDef[] = [
  { id: 'bi-icon-user-check', title: 'User Check', category: 'people', type: 'icon', svg: _icon('<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>'), ariaLabel: 'User check icon', tags: ['user', 'verified', 'people'] },
  { id: 'bi-icon-user-plus', title: 'User Plus', category: 'people', type: 'icon', svg: _icon('<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>'), ariaLabel: 'User plus icon', tags: ['user', 'add', 'people'] },
  { id: 'bi-icon-user-x', title: 'User Remove', category: 'people', type: 'icon', svg: _icon('<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>'), ariaLabel: 'User remove icon', tags: ['user', 'remove', 'people'] },
  { id: 'bi-icon-heart', title: 'Heart', category: 'people', type: 'icon', svg: _icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>'), ariaLabel: 'Heart icon', tags: ['heart', 'love', 'people'] },
  { id: 'bi-icon-smile', title: 'Smile', category: 'people', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'), ariaLabel: 'Smile icon', tags: ['smile', 'happy', 'people'] }
]

// ─── Technology Icons Extended (+5) ───

const TECH_ICONS_EXT: BuiltInAssetDef[] = [
  { id: 'bi-icon-smartphone', title: 'Smartphone', category: 'technology', type: 'icon', svg: _icon('<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'), ariaLabel: 'Smartphone icon', tags: ['phone', 'mobile', 'technology'] },
  { id: 'bi-icon-wifi', title: 'WiFi', category: 'technology', type: 'icon', svg: _icon('<path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>'), ariaLabel: 'WiFi icon', tags: ['wifi', 'wireless', 'technology'] },
  { id: 'bi-icon-bluetooth', title: 'Bluetooth', category: 'technology', type: 'icon', svg: _icon('<polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>'), ariaLabel: 'Bluetooth icon', tags: ['bluetooth', 'wireless', 'technology'] },
  { id: 'bi-icon-cpu', title: 'CPU', category: 'technology', type: 'icon', svg: _icon('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'), ariaLabel: 'CPU icon', tags: ['cpu', 'processor', 'technology'] },
  { id: 'bi-icon-server', title: 'Server', category: 'technology', type: 'icon', svg: _icon('<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'), ariaLabel: 'Server icon', tags: ['server', 'hosting', 'technology'] }
]

// ─── Media Icons Extended (+5) ───

const MEDIA_ICONS_EXT: BuiltInAssetDef[] = [
  { id: 'bi-icon-camera', title: 'Camera', category: 'media', type: 'icon', svg: _icon('<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>'), ariaLabel: 'Camera icon', tags: ['camera', 'photo', 'media'] },
  { id: 'bi-icon-mic', title: 'Microphone', category: 'media', type: 'icon', svg: _icon('<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'), ariaLabel: 'Microphone icon', tags: ['mic', 'audio', 'media'] },
  { id: 'bi-icon-volume', title: 'Volume', category: 'media', type: 'icon', svg: _icon('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/>'), ariaLabel: 'Volume icon', tags: ['volume', 'sound', 'media'] },
  { id: 'bi-icon-film', title: 'Film', category: 'media', type: 'icon', svg: _icon('<rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>'), ariaLabel: 'Film icon', tags: ['film', 'movie', 'media'] },
  { id: 'bi-icon-music', title: 'Music', category: 'media', type: 'icon', svg: _icon('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'), ariaLabel: 'Music icon', tags: ['music', 'audio', 'media'] }
]

// ─── Feedback Icons Extended (+5) ───

const FEEDBACK_ICONS_EXT: BuiltInAssetDef[] = [
  { id: 'bi-icon-thumbs-up', title: 'Thumbs Up', category: 'feedback', type: 'icon', svg: _icon('<path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>'), ariaLabel: 'Thumbs up icon', tags: ['like', 'approve', 'feedback'] },
  { id: 'bi-icon-thumbs-down', title: 'Thumbs Down', category: 'feedback', type: 'icon', svg: _icon('<path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>'), ariaLabel: 'Thumbs down icon', tags: ['dislike', 'reject', 'feedback'] },
  { id: 'bi-icon-star', title: 'Star', category: 'feedback', type: 'icon', svg: _icon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'), ariaLabel: 'Star icon', tags: ['star', 'rating', 'feedback'] },
  { id: 'bi-icon-x-circle', title: 'X Circle', category: 'feedback', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'), ariaLabel: 'X circle icon', tags: ['close', 'cancel', 'feedback'] },
  { id: 'bi-icon-info', title: 'Info', category: 'feedback', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'), ariaLabel: 'Info icon', tags: ['info', 'information', 'feedback'] }
]

// ─── Communication Icons (10) ───

const COMMUNICATION_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-mail', title: 'Email', category: 'communication', type: 'icon', svg: _icon('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>'), ariaLabel: 'Email icon', tags: ['email', 'mail', 'communication'] },
  { id: 'bi-icon-phone', title: 'Phone', category: 'communication', type: 'icon', svg: _icon('<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>'), ariaLabel: 'Phone icon', tags: ['phone', 'call', 'communication'] },
  { id: 'bi-icon-message-circle', title: 'Chat', category: 'communication', type: 'icon', svg: _icon('<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>'), ariaLabel: 'Chat icon', tags: ['chat', 'message', 'communication'] },
  { id: 'bi-icon-video', title: 'Video Call', category: 'communication', type: 'icon', svg: _icon('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>'), ariaLabel: 'Video call icon', tags: ['video', 'call', 'communication'] },
  { id: 'bi-icon-megaphone', title: 'Megaphone', category: 'communication', type: 'icon', svg: _icon('<path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/>'), ariaLabel: 'Megaphone icon', tags: ['megaphone', 'announce', 'communication'] },
  { id: 'bi-icon-send', title: 'Send', category: 'communication', type: 'icon', svg: _icon('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'), ariaLabel: 'Send icon', tags: ['send', 'submit', 'communication'] },
  { id: 'bi-icon-inbox', title: 'Inbox', category: 'communication', type: 'icon', svg: _icon('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>'), ariaLabel: 'Inbox icon', tags: ['inbox', 'mail', 'communication'] },
  { id: 'bi-icon-bell', title: 'Bell', category: 'communication', type: 'icon', svg: _icon('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>'), ariaLabel: 'Bell icon', tags: ['bell', 'notification', 'communication'] },
  { id: 'bi-icon-at-sign', title: 'At Sign', category: 'communication', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>'), ariaLabel: 'At sign icon', tags: ['at', 'email', 'communication'] },
  { id: 'bi-icon-rss', title: 'RSS', category: 'communication', type: 'icon', svg: _icon('<path d="M4 11a9 9 0 019 9"/><path d="M4 4a16 16 0 0116 16"/><circle cx="5" cy="19" r="1"/>'), ariaLabel: 'RSS icon', tags: ['rss', 'feed', 'communication'] }
]

// ─── Weather Icons (10) ───

const WEATHER_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-sun', title: 'Sun', category: 'weather', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'), ariaLabel: 'Sun icon', tags: ['sun', 'sunny', 'weather'] },
  { id: 'bi-icon-cloud', title: 'Cloud', category: 'weather', type: 'icon', svg: _icon('<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>'), ariaLabel: 'Cloud icon', tags: ['cloud', 'weather'] },
  { id: 'bi-icon-cloud-rain', title: 'Rain', category: 'weather', type: 'icon', svg: _icon('<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"/>'), ariaLabel: 'Rain icon', tags: ['rain', 'weather'] },
  { id: 'bi-icon-cloud-snow', title: 'Snow', category: 'weather', type: 'icon', svg: _icon('<path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/>'), ariaLabel: 'Snow icon', tags: ['snow', 'weather'] },
  { id: 'bi-icon-zap', title: 'Lightning', category: 'weather', type: 'icon', svg: _icon('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'), ariaLabel: 'Lightning icon', tags: ['lightning', 'thunder', 'weather'] },
  { id: 'bi-icon-wind', title: 'Wind', category: 'weather', type: 'icon', svg: _icon('<path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>'), ariaLabel: 'Wind icon', tags: ['wind', 'weather'] },
  { id: 'bi-icon-thermometer', title: 'Thermometer', category: 'weather', type: 'icon', svg: _icon('<path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>'), ariaLabel: 'Thermometer icon', tags: ['thermometer', 'temperature', 'weather'] },
  { id: 'bi-icon-droplet', title: 'Droplet', category: 'weather', type: 'icon', svg: _icon('<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>'), ariaLabel: 'Droplet icon', tags: ['droplet', 'water', 'weather'] },
  { id: 'bi-icon-sunrise', title: 'Sunrise', category: 'weather', type: 'icon', svg: _icon('<path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/>'), ariaLabel: 'Sunrise icon', tags: ['sunrise', 'weather'] },
  { id: 'bi-icon-moon', title: 'Moon', category: 'weather', type: 'icon', svg: _icon('<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'), ariaLabel: 'Moon icon', tags: ['moon', 'night', 'weather'] }
]

// ─── Health Icons (10) ───

const HEALTH_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-heart-pulse', title: 'Heart Pulse', category: 'health', type: 'icon', svg: _icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/><polyline points="3 12 8 12 10 8 14 16 16 12 21 12"/>'), ariaLabel: 'Heart pulse icon', tags: ['heart', 'pulse', 'health'] },
  { id: 'bi-icon-activity', title: 'Activity', category: 'health', type: 'icon', svg: _icon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'), ariaLabel: 'Activity icon', tags: ['activity', 'pulse', 'health'] },
  { id: 'bi-icon-stethoscope', title: 'Stethoscope', category: 'health', type: 'icon', svg: _icon('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="3" x2="4" y2="22"/><circle cx="20" cy="18" r="3"/>'), ariaLabel: 'Stethoscope icon', tags: ['stethoscope', 'doctor', 'health'] },
  { id: 'bi-icon-pill', title: 'Pill', category: 'health', type: 'icon', svg: _icon('<rect x="3" y="10" width="18" height="4" rx="2" transform="rotate(-45 12 12)"/><line x1="12" y1="12" x2="16.24" y2="7.76"/>'), ariaLabel: 'Pill icon', tags: ['pill', 'medicine', 'health'] },
  { id: 'bi-icon-bandage', title: 'Bandage', category: 'health', type: 'icon', svg: _icon('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/>'), ariaLabel: 'Bandage icon', tags: ['bandage', 'first-aid', 'health'] },
  { id: 'bi-icon-shield-plus', title: 'Health Shield', category: 'health', type: 'icon', svg: _icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'), ariaLabel: 'Health shield icon', tags: ['shield', 'health', 'protection'] },
  { id: 'bi-icon-eye', title: 'Eye', category: 'health', type: 'icon', svg: _icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'), ariaLabel: 'Eye icon', tags: ['eye', 'vision', 'health'] },
  { id: 'bi-icon-hand-sanitizer', title: 'Hygiene', category: 'health', type: 'icon', svg: _icon('<rect x="7" y="10" width="10" height="12" rx="2"/><path d="M12 2v4"/><path d="M9 6h6"/><path d="M12 14v4"/><path d="M10 16h4"/>'), ariaLabel: 'Hygiene icon', tags: ['hygiene', 'clean', 'health'] },
  { id: 'bi-icon-ambulance', title: 'Emergency', category: 'health', type: 'icon', svg: _icon('<rect x="1" y="6" width="15" height="12" rx="2"/><path d="M16 6l5 4v8h-5"/><circle cx="5.5" cy="18" r="2"/><circle cx="18.5" cy="18" r="2"/><line x1="8" y1="9" x2="8" y2="15"/><line x1="5" y1="12" x2="11" y2="12"/>'), ariaLabel: 'Emergency icon', tags: ['emergency', 'ambulance', 'health'] },
  { id: 'bi-icon-dna', title: 'DNA', category: 'health', type: 'icon', svg: _icon('<path d="M6 2c0 6 6 6 6 12s-6 6-6 12"/><path d="M18 2c0 6-6 6-6 12s6 6 6 12"/><line x1="7" y1="6" x2="17" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="7" y1="18" x2="17" y2="18"/>'), ariaLabel: 'DNA icon', tags: ['dna', 'genetics', 'health'] }
]

// ─── Science Icons (10) ───

const SCIENCE_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-atom', title: 'Atom', category: 'science', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>'), ariaLabel: 'Atom icon', tags: ['atom', 'science'] },
  { id: 'bi-icon-flask', title: 'Flask', category: 'science', type: 'icon', svg: _icon('<path d="M9 3h6v6l5 10H4L9 9V3z"/><line x1="9" y1="3" x2="15" y2="3"/><path d="M6 15h12"/>'), ariaLabel: 'Flask icon', tags: ['flask', 'chemistry', 'science'] },
  { id: 'bi-icon-microscope', title: 'Microscope', category: 'science', type: 'icon', svg: _icon('<path d="M12 2v6"/><circle cx="12" cy="10" r="2"/><path d="M12 12v2"/><path d="M8 22h8"/><path d="M12 14c-4 0-7 3-7 7h14c0-4-3-7-7-7z"/>'), ariaLabel: 'Microscope icon', tags: ['microscope', 'science'] },
  { id: 'bi-icon-planet', title: 'Planet', category: 'science', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="12" ry="4" transform="rotate(-30 12 12)"/>'), ariaLabel: 'Planet icon', tags: ['planet', 'space', 'science'] },
  { id: 'bi-icon-telescope', title: 'Telescope', category: 'science', type: 'icon', svg: _icon('<path d="M22 2L14 10"/><path d="M2 22l8-8"/><circle cx="12" cy="12" r="3"/><path d="M18 6l-1.5 1.5"/><path d="M7.5 16.5L6 18"/>'), ariaLabel: 'Telescope icon', tags: ['telescope', 'astronomy', 'science'] },
  { id: 'bi-icon-magnet', title: 'Magnet', category: 'science', type: 'icon', svg: _icon('<path d="M4 8V6a8 8 0 0116 0v2"/><path d="M4 8h4v8a4 4 0 008 0V8h4"/>'), ariaLabel: 'Magnet icon', tags: ['magnet', 'physics', 'science'] },
  { id: 'bi-icon-beaker', title: 'Beaker', category: 'science', type: 'icon', svg: _icon('<path d="M6 2h12v8l3 10H3L6 10V2z"/><line x1="6" y1="2" x2="18" y2="2"/><line x1="5" y1="14" x2="19" y2="14"/>'), ariaLabel: 'Beaker icon', tags: ['beaker', 'lab', 'science'] },
  { id: 'bi-icon-test-tube', title: 'Test Tube', category: 'science', type: 'icon', svg: _icon('<path d="M16 2l-8 8v10a2 2 0 004 0V10l8-8"/><line x1="10" y1="14" x2="14" y2="14"/>'), ariaLabel: 'Test tube icon', tags: ['test-tube', 'lab', 'science'] },
  { id: 'bi-icon-radiation', title: 'Radiation', category: 'science', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="2"/><path d="M12 2a10 10 0 00-5 1.8l5 8.2"/><path d="M12 2a10 10 0 015 1.8l-5 8.2"/><path d="M2.6 16.4A10 10 0 007 18l5-8"/><path d="M21.4 16.4A10 10 0 0117 18l-5-8"/>'), ariaLabel: 'Radiation icon', tags: ['radiation', 'science'] },
  { id: 'bi-icon-satellite', title: 'Satellite', category: 'science', type: 'icon', svg: _icon('<rect x="8" y="8" width="8" height="8" rx="1" transform="rotate(45 12 12)"/><path d="M3.34 17l2.83-2.83"/><path d="M17 3.34l-2.83 2.83"/><path d="M5 5l2 2"/><path d="M17 17l2 2"/>'), ariaLabel: 'Satellite icon', tags: ['satellite', 'space', 'science'] }
]

// ─── Math Icons (10) ───

const MATH_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-plus', title: 'Plus', category: 'math', type: 'icon', svg: _icon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'), ariaLabel: 'Plus icon', tags: ['plus', 'add', 'math'] },
  { id: 'bi-icon-minus', title: 'Minus', category: 'math', type: 'icon', svg: _icon('<line x1="5" y1="12" x2="19" y2="12"/>'), ariaLabel: 'Minus icon', tags: ['minus', 'subtract', 'math'] },
  { id: 'bi-icon-x-sign', title: 'Multiply', category: 'math', type: 'icon', svg: _icon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'), ariaLabel: 'Multiply icon', tags: ['multiply', 'times', 'math'] },
  { id: 'bi-icon-divide', title: 'Divide', category: 'math', type: 'icon', svg: _icon('<circle cx="12" cy="6" r="2"/><line x1="5" y1="12" x2="19" y2="12"/><circle cx="12" cy="18" r="2"/>'), ariaLabel: 'Divide icon', tags: ['divide', 'math'] },
  { id: 'bi-icon-percent', title: 'Percent', category: 'math', type: 'icon', svg: _icon('<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'), ariaLabel: 'Percent icon', tags: ['percent', 'math'] },
  { id: 'bi-icon-infinity', title: 'Infinity', category: 'math', type: 'icon', svg: _icon('<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 100 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 000-8c-2 0-4 1.33-6 4z"/>'), ariaLabel: 'Infinity icon', tags: ['infinity', 'math'] },
  { id: 'bi-icon-sigma', title: 'Sigma', category: 'math', type: 'icon', svg: _icon('<path d="M18 3H6l6 9-6 9h12"/>'), ariaLabel: 'Sigma icon', tags: ['sigma', 'sum', 'math'] },
  { id: 'bi-icon-hash', title: 'Hash', category: 'math', type: 'icon', svg: _icon('<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>'), ariaLabel: 'Hash icon', tags: ['hash', 'number', 'math'] },
  { id: 'bi-icon-equal', title: 'Equal', category: 'math', type: 'icon', svg: _icon('<line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/>'), ariaLabel: 'Equal icon', tags: ['equal', 'math'] },
  { id: 'bi-icon-pi', title: 'Pi', category: 'math', type: 'icon', svg: _icon('<line x1="5" y1="4" x2="19" y2="4"/><path d="M10 4v16"/><path d="M15 4c0 8-1 16-5 16"/>'), ariaLabel: 'Pi icon', tags: ['pi', 'math'] }
]

// ─── Music Icons (10) ───

const MUSIC_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-music-note', title: 'Music Note', category: 'music-audio', type: 'icon', svg: _icon('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'), ariaLabel: 'Music note icon', tags: ['music', 'note', 'audio'] },
  { id: 'bi-icon-headphones', title: 'Headphones', category: 'music-audio', type: 'icon', svg: _icon('<path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>'), ariaLabel: 'Headphones icon', tags: ['headphones', 'audio'] },
  { id: 'bi-icon-mic-2', title: 'Microphone Stand', category: 'music-audio', type: 'icon', svg: _icon('<line x1="12" y1="1" x2="12" y2="17"/><circle cx="12" cy="17" r="4"/><path d="M8 1h8"/>'), ariaLabel: 'Microphone stand icon', tags: ['mic', 'recording', 'audio'] },
  { id: 'bi-icon-speaker', title: 'Speaker', category: 'music-audio', type: 'icon', svg: _icon('<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="6" x2="12.01" y2="6"/>'), ariaLabel: 'Speaker icon', tags: ['speaker', 'audio'] },
  { id: 'bi-icon-volume-x', title: 'Mute', category: 'music-audio', type: 'icon', svg: _icon('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'), ariaLabel: 'Mute icon', tags: ['mute', 'silent', 'audio'] },
  { id: 'bi-icon-radio', title: 'Radio', category: 'music-audio', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/>'), ariaLabel: 'Radio icon', tags: ['radio', 'broadcast', 'audio'] },
  { id: 'bi-icon-disc', title: 'Disc', category: 'music-audio', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>'), ariaLabel: 'Disc icon', tags: ['disc', 'vinyl', 'audio'] },
  { id: 'bi-icon-play-circle', title: 'Play Circle', category: 'music-audio', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>'), ariaLabel: 'Play circle icon', tags: ['play', 'media', 'audio'] },
  { id: 'bi-icon-pause', title: 'Pause', category: 'music-audio', type: 'icon', svg: _icon('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'), ariaLabel: 'Pause icon', tags: ['pause', 'audio'] },
  { id: 'bi-icon-skip-forward', title: 'Skip Forward', category: 'music-audio', type: 'icon', svg: _icon('<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>'), ariaLabel: 'Skip forward icon', tags: ['skip', 'next', 'audio'] }
]

// ─── Finance Icons (10) ───

const FINANCE_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-dollar', title: 'Dollar', category: 'finance', type: 'icon', svg: _icon('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'), ariaLabel: 'Dollar icon', tags: ['dollar', 'money', 'finance'] },
  { id: 'bi-icon-credit-card', title: 'Credit Card', category: 'finance', type: 'icon', svg: _icon('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'), ariaLabel: 'Credit card icon', tags: ['credit-card', 'payment', 'finance'] },
  { id: 'bi-icon-wallet', title: 'Wallet', category: 'finance', type: 'icon', svg: _icon('<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 14h2"/>'), ariaLabel: 'Wallet icon', tags: ['wallet', 'finance'] },
  { id: 'bi-icon-bar-chart', title: 'Bar Chart', category: 'finance', type: 'icon', svg: _icon('<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>'), ariaLabel: 'Bar chart icon', tags: ['chart', 'bar', 'finance'] },
  { id: 'bi-icon-trending-up', title: 'Trending Up', category: 'finance', type: 'icon', svg: _icon('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'), ariaLabel: 'Trending up icon', tags: ['trending', 'growth', 'finance'] },
  { id: 'bi-icon-trending-down', title: 'Trending Down', category: 'finance', type: 'icon', svg: _icon('<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>'), ariaLabel: 'Trending down icon', tags: ['trending', 'decline', 'finance'] },
  { id: 'bi-icon-pie-chart', title: 'Pie Chart', category: 'finance', type: 'icon', svg: _icon('<path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/>'), ariaLabel: 'Pie chart icon', tags: ['pie-chart', 'data', 'finance'] },
  { id: 'bi-icon-receipt', title: 'Receipt', category: 'finance', type: 'icon', svg: _icon('<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>'), ariaLabel: 'Receipt icon', tags: ['receipt', 'invoice', 'finance'] },
  { id: 'bi-icon-bank', title: 'Bank', category: 'finance', type: 'icon', svg: _icon('<path d="M3 21h18"/><path d="M3 10h18"/><path d="M12 3l9 7H3z"/><path d="M5 10v11"/><path d="M19 10v11"/><path d="M9 10v11"/><path d="M15 10v11"/>'), ariaLabel: 'Bank icon', tags: ['bank', 'finance'] },
  { id: 'bi-icon-briefcase', title: 'Briefcase', category: 'finance', type: 'icon', svg: _icon('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>'), ariaLabel: 'Briefcase icon', tags: ['briefcase', 'business', 'finance'] }
]

// ─── Sports Icons (10) ───

const SPORTS_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-trophy', title: 'Trophy', category: 'sports', type: 'icon', svg: _icon('<path d="M6 9H3V5h3"/><path d="M18 9h3V5h-3"/><path d="M6 5a6 6 0 0012 0"/><path d="M12 11v4"/><path d="M8 21h8"/><path d="M12 15a3 3 0 013 3v3H9v-3a3 3 0 013-3z"/>'), ariaLabel: 'Trophy icon', tags: ['trophy', 'winner', 'sports'] },
  { id: 'bi-icon-flag', title: 'Flag', category: 'sports', type: 'icon', svg: _icon('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'), ariaLabel: 'Flag icon', tags: ['flag', 'sports'] },
  { id: 'bi-icon-target', title: 'Target', category: 'sports', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'), ariaLabel: 'Target icon', tags: ['target', 'goal', 'sports'] },
  { id: 'bi-icon-timer', title: 'Timer', category: 'sports', type: 'icon', svg: _icon('<circle cx="12" cy="13" r="8"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="16.24" y1="9.76" x2="12" y2="13"/><line x1="10" y1="1" x2="14" y2="1"/><line x1="12" y1="1" x2="12" y2="5"/>'), ariaLabel: 'Timer icon', tags: ['timer', 'stopwatch', 'sports'] },
  { id: 'bi-icon-medal', title: 'Medal', category: 'sports', type: 'icon', svg: _icon('<circle cx="12" cy="14" r="6"/><path d="M8 4l4 10 4-10"/><line x1="8" y1="4" x2="16" y2="4"/><path d="M12 14v.01"/>'), ariaLabel: 'Medal icon', tags: ['medal', 'award', 'sports'] },
  { id: 'bi-icon-dumbbell', title: 'Dumbbell', category: 'sports', type: 'icon', svg: _icon('<path d="M6 5v14"/><path d="M18 5v14"/><path d="M3 7v10"/><path d="M21 7v10"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/>'), ariaLabel: 'Dumbbell icon', tags: ['dumbbell', 'fitness', 'sports'] },
  { id: 'bi-icon-bike', title: 'Bicycle', category: 'sports', type: 'icon', svg: _icon('<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 100-2 1 1 0 000 2z"/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/>'), ariaLabel: 'Bicycle icon', tags: ['bicycle', 'cycling', 'sports'] },
  { id: 'bi-icon-running', title: 'Running', category: 'sports', type: 'icon', svg: _icon('<circle cx="14" cy="4" r="2"/><path d="M10 22l4-8-3-2-2 4-4-1"/><path d="M14 14l5 2v6"/><path d="M9 12l-4 2"/>'), ariaLabel: 'Running icon', tags: ['running', 'exercise', 'sports'] },
  { id: 'bi-icon-whistle', title: 'Whistle', category: 'sports', type: 'icon', svg: _icon('<circle cx="16" cy="12" r="6"/><path d="M10 12H2"/><path d="M4 8l2 4-2 4"/>'), ariaLabel: 'Whistle icon', tags: ['whistle', 'referee', 'sports'] },
  { id: 'bi-icon-scoreboard', title: 'Scoreboard', category: 'sports', type: 'icon', svg: _icon('<rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M7 8v0"/><path d="M17 8v0"/>'), ariaLabel: 'Scoreboard icon', tags: ['scoreboard', 'score', 'sports'] }
]

// ─── Food Icons (10) ───

const FOOD_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-apple', title: 'Apple', category: 'food', type: 'icon', svg: _icon('<path d="M12 2c-1 0-2 .5-2 .5S8 2 7 3s-2 3-2 6 2.5 8 5 10c1 .8 2 1 2 1s1-.2 2-1c2.5-2 5-7 5-10s-1-5-2-6-3-.5-3-.5S13 2 12 2z"/><path d="M12 2c0-1 1-2 2-2"/>'), ariaLabel: 'Apple icon', tags: ['apple', 'fruit', 'food'] },
  { id: 'bi-icon-coffee', title: 'Coffee', category: 'food', type: 'icon', svg: _icon('<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'), ariaLabel: 'Coffee icon', tags: ['coffee', 'drink', 'food'] },
  { id: 'bi-icon-utensils', title: 'Utensils', category: 'food', type: 'icon', svg: _icon('<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>'), ariaLabel: 'Utensils icon', tags: ['utensils', 'dining', 'food'] },
  { id: 'bi-icon-cake', title: 'Cake', category: 'food', type: 'icon', svg: _icon('<path d="M2 18h20v4H2z"/><path d="M4 14v4h16v-4"/><path d="M4 14c0-3 3-5 8-5s8 2 8 5"/><path d="M12 4v5"/><circle cx="12" cy="3" r="1"/>'), ariaLabel: 'Cake icon', tags: ['cake', 'birthday', 'food'] },
  { id: 'bi-icon-pizza', title: 'Pizza', category: 'food', type: 'icon', svg: _icon('<path d="M12 2L2 22h20z"/><circle cx="10" cy="14" r="1"/><circle cx="14" cy="10" r="1"/><circle cx="12" cy="17" r="1"/>'), ariaLabel: 'Pizza icon', tags: ['pizza', 'food'] },
  { id: 'bi-icon-egg', title: 'Egg', category: 'food', type: 'icon', svg: _icon('<path d="M12 2C8 2 5 8 5 14a7 7 0 0014 0c0-6-3-12-7-12z"/>'), ariaLabel: 'Egg icon', tags: ['egg', 'food'] },
  { id: 'bi-icon-glass-water', title: 'Glass', category: 'food', type: 'icon', svg: _icon('<path d="M5 2l2 18h10l2-18z"/><path d="M7 10h10"/>'), ariaLabel: 'Glass icon', tags: ['glass', 'water', 'drink', 'food'] },
  { id: 'bi-icon-ice-cream', title: 'Ice Cream', category: 'food', type: 'icon', svg: _icon('<path d="M12 17l-5 5h10z"/><circle cx="8" cy="10" r="4"/><circle cx="16" cy="10" r="4"/><circle cx="12" cy="7" r="4"/>'), ariaLabel: 'Ice cream icon', tags: ['ice-cream', 'dessert', 'food'] },
  { id: 'bi-icon-leaf-food', title: 'Organic', category: 'food', type: 'icon', svg: _icon('<path d="M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 2c1 5-1 9.5-4 12.5"/><path d="M3 22c3-5 7-8 12-10"/>'), ariaLabel: 'Organic icon', tags: ['organic', 'leaf', 'food'] },
  { id: 'bi-icon-cherry', title: 'Cherry', category: 'food', type: 'icon', svg: _icon('<circle cx="8" cy="18" r="4"/><circle cx="18" cy="16" r="4"/><path d="M8 14c0-6 2-10 4-12"/><path d="M18 12c-2-6 0-10 2-12"/>'), ariaLabel: 'Cherry icon', tags: ['cherry', 'fruit', 'food'] }
]

// ─── Transport Icons (10) ───

const TRANSPORT_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-car', title: 'Car', category: 'transport', type: 'icon', svg: _icon('<path d="M5 17h14"/><path d="M3 11l2-5h14l2 5"/><rect x="2" y="11" width="20" height="8" rx="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>'), ariaLabel: 'Car icon', tags: ['car', 'auto', 'transport'] },
  { id: 'bi-icon-bus', title: 'Bus', category: 'transport', type: 'icon', svg: _icon('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="16" x2="21" y2="16"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>'), ariaLabel: 'Bus icon', tags: ['bus', 'transit', 'transport'] },
  { id: 'bi-icon-plane', title: 'Plane', category: 'transport', type: 'icon', svg: _icon('<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3s-3-1-4.5.5L13 7 4.8 5.2c-.5-.1-1 .1-1.1.6L2.7 9.4c-.2.5.2 1 .7 1l5.3 1.2L5.5 15l-2.7-.7c-.5-.1-1 .2-1 .7l-.5 3.5c0 .5.3.8.8.8l3.5-.5c.5 0 .8-.5.7-1L5.6 15l3.3-3.3L10.2 17c0 .5.5.8 1 .7l3.6-1c.5-.1.7-.6.6-1.1z"/>'), ariaLabel: 'Plane icon', tags: ['plane', 'flight', 'transport'] },
  { id: 'bi-icon-bicycle', title: 'Bicycle', category: 'transport', type: 'icon', svg: _icon('<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/>'), ariaLabel: 'Bicycle icon', tags: ['bicycle', 'bike', 'transport'] },
  { id: 'bi-icon-train', title: 'Train', category: 'transport', type: 'icon', svg: _icon('<rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/><path d="M6 22l2-3h8l2 3"/>'), ariaLabel: 'Train icon', tags: ['train', 'rail', 'transport'] },
  { id: 'bi-icon-rocket', title: 'Rocket', category: 'transport', type: 'icon', svg: _icon('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'), ariaLabel: 'Rocket icon', tags: ['rocket', 'launch', 'transport'] },
  { id: 'bi-icon-ship', title: 'Ship', category: 'transport', type: 'icon', svg: _icon('<path d="M2 20l2-2c2-2 5-2 7 0s5 2 7 0l2-2"/><path d="M4 18l7-14 7 14"/><line x1="11" y1="4" x2="11" y2="8"/>'), ariaLabel: 'Ship icon', tags: ['ship', 'boat', 'transport'] },
  { id: 'bi-icon-truck', title: 'Truck', category: 'transport', type: 'icon', svg: _icon('<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'), ariaLabel: 'Truck icon', tags: ['truck', 'delivery', 'transport'] },
  { id: 'bi-icon-anchor', title: 'Anchor', category: 'transport', type: 'icon', svg: _icon('<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/>'), ariaLabel: 'Anchor icon', tags: ['anchor', 'marine', 'transport'] },
  { id: 'bi-icon-compass', title: 'Compass', category: 'transport', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'), ariaLabel: 'Compass icon', tags: ['compass', 'direction', 'transport'] }
]

// ─── Nature Icons (10) ───

const NATURE_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-tree', title: 'Tree', category: 'nature', type: 'icon', svg: _icon('<path d="M12 22v-8"/><path d="M7 14l5-10 5 10z"/><path d="M5 18l7-8 7 8z"/>'), ariaLabel: 'Tree icon', tags: ['tree', 'nature'] },
  { id: 'bi-icon-leaf', title: 'Leaf', category: 'nature', type: 'icon', svg: _icon('<path d="M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 2c1 5-1 9.5-4 12.5"/><path d="M3 22c3-5 7-8 12-10"/>'), ariaLabel: 'Leaf icon', tags: ['leaf', 'nature'] },
  { id: 'bi-icon-flower', title: 'Flower', category: 'nature', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="3"/><circle cx="12" cy="19" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><path d="M12 15v7"/>'), ariaLabel: 'Flower icon', tags: ['flower', 'nature'] },
  { id: 'bi-icon-mountain', title: 'Mountain', category: 'nature', type: 'icon', svg: _icon('<path d="M8 21l4-10 4 10"/><path d="M2 21l6-12 4 6 4-6 6 12z"/>'), ariaLabel: 'Mountain icon', tags: ['mountain', 'nature'] },
  { id: 'bi-icon-wave', title: 'Water', category: 'nature', type: 'icon', svg: _icon('<path d="M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>'), ariaLabel: 'Water icon', tags: ['water', 'wave', 'nature'] },
  { id: 'bi-icon-flame', title: 'Fire', category: 'nature', type: 'icon', svg: _icon('<path d="M12 22c3.5 0 7-3 7-8 0-4-2-6-3.5-8-1.5 2-2 3-2 5s-1.5 3-3.5 3-3-2-3-4c0-1.5.5-3 2-5C5 8 5 12 5 14c0 5 3.5 8 7 8z"/>'), ariaLabel: 'Fire icon', tags: ['fire', 'flame', 'nature'] },
  { id: 'bi-icon-snowflake', title: 'Snowflake', category: 'nature', type: 'icon', svg: _icon('<line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>'), ariaLabel: 'Snowflake icon', tags: ['snowflake', 'winter', 'nature'] },
  { id: 'bi-icon-cloud-nature', title: 'Cloud', category: 'nature', type: 'icon', svg: _icon('<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>'), ariaLabel: 'Cloud icon', tags: ['cloud', 'sky', 'nature'] },
  { id: 'bi-icon-rainbow', title: 'Rainbow', category: 'nature', type: 'icon', svg: _icon('<path d="M2 18a10 10 0 0120 0"/><path d="M5 18a7 7 0 0114 0"/><path d="M8 18a4 4 0 018 0"/>'), ariaLabel: 'Rainbow icon', tags: ['rainbow', 'nature'] },
  { id: 'bi-icon-earth', title: 'Earth', category: 'nature', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z"/>'), ariaLabel: 'Earth icon', tags: ['earth', 'globe', 'nature'] }
]

// ─── Social Icons (10) ───

const SOCIAL_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-thumbs-up-2', title: 'Like', category: 'social', type: 'icon', svg: _icon('<path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>'), ariaLabel: 'Like icon', tags: ['like', 'thumbs-up', 'social'] },
  { id: 'bi-icon-heart-social', title: 'Love', category: 'social', type: 'icon', svg: _icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>'), ariaLabel: 'Love icon', tags: ['heart', 'love', 'social'] },
  { id: 'bi-icon-share', title: 'Share', category: 'social', type: 'icon', svg: _icon('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'), ariaLabel: 'Share icon', tags: ['share', 'social'] },
  { id: 'bi-icon-message-square', title: 'Comment', category: 'social', type: 'icon', svg: _icon('<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'), ariaLabel: 'Comment icon', tags: ['comment', 'chat', 'social'] },
  { id: 'bi-icon-at-sign-2', title: 'At Sign', category: 'social', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>'), ariaLabel: 'At sign icon', tags: ['at', 'mention', 'social'] },
  { id: 'bi-icon-hashtag', title: 'Hashtag', category: 'social', type: 'icon', svg: _icon('<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>'), ariaLabel: 'Hashtag icon', tags: ['hashtag', 'social'] },
  { id: 'bi-icon-users-social', title: 'Community', category: 'social', type: 'icon', svg: _icon('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'), ariaLabel: 'Community icon', tags: ['community', 'group', 'social'] },
  { id: 'bi-icon-link-social', title: 'Link', category: 'social', type: 'icon', svg: _icon('<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>'), ariaLabel: 'Link icon', tags: ['link', 'url', 'social'] },
  { id: 'bi-icon-globe-social', title: 'Website', category: 'social', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>'), ariaLabel: 'Website icon', tags: ['website', 'globe', 'social'] },
  { id: 'bi-icon-bookmark-social', title: 'Save', category: 'social', type: 'icon', svg: _icon('<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>'), ariaLabel: 'Save icon', tags: ['save', 'bookmark', 'social'] }
]

// ─── Tools Icons (10) ───

const TOOLS_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-wrench', title: 'Wrench', category: 'tools', type: 'icon', svg: _icon('<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>'), ariaLabel: 'Wrench icon', tags: ['wrench', 'repair', 'tools'] },
  { id: 'bi-icon-hammer', title: 'Hammer', category: 'tools', type: 'icon', svg: _icon('<path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0s-.83-2.17 0-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V6.5L14.17 2H10v4.56l1.93 1.93c.15.15.4.15.55 0l2.35-2.35 4.89 4.89c.6.6 1.57.6 2.17 0z"/>'), ariaLabel: 'Hammer icon', tags: ['hammer', 'build', 'tools'] },
  { id: 'bi-icon-scissors', title: 'Scissors', category: 'tools', type: 'icon', svg: _icon('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>'), ariaLabel: 'Scissors icon', tags: ['scissors', 'cut', 'tools'] },
  { id: 'bi-icon-ruler', title: 'Ruler', category: 'tools', type: 'icon', svg: _icon('<path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/><line x1="3" y1="7" x2="7" y2="7"/><line x1="3" y1="11" x2="6" y2="11"/><line x1="3" y1="15" x2="7" y2="15"/><line x1="3" y1="19" x2="6" y2="19"/>'), ariaLabel: 'Ruler icon', tags: ['ruler', 'measure', 'tools'] },
  { id: 'bi-icon-paint-brush', title: 'Paint Brush', category: 'tools', type: 'icon', svg: _icon('<path d="M18.37 2.63a2.12 2.12 0 013 3L14 13l-4 1 1-4z"/><path d="M9 14L4 19c-1 1-1 3 0 3s2-1 3 0c1 1 3 0 3 0l1-1"/>'), ariaLabel: 'Paint brush icon', tags: ['paint', 'brush', 'tools'] },
  { id: 'bi-icon-screwdriver', title: 'Screwdriver', category: 'tools', type: 'icon', svg: _icon('<path d="M14.7 2.3l4 4c.4.4.4 1 0 1.4L16 10.4l-5.7-5.7 2.7-2.7c.4-.4 1-.4 1.4 0z"/><path d="M5.05 18.95l-1.41 1.41a2 2 0 002.83 2.83L7.88 21.8"/><path d="M10.3 4.7L5.05 18.95"/>'), ariaLabel: 'Screwdriver icon', tags: ['screwdriver', 'tools'] },
  { id: 'bi-icon-tape', title: 'Tape Measure', category: 'tools', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v7"/>'), ariaLabel: 'Tape measure icon', tags: ['tape', 'measure', 'tools'] },
  { id: 'bi-icon-paperclip', title: 'Paperclip', category: 'tools', type: 'icon', svg: _icon('<path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>'), ariaLabel: 'Paperclip icon', tags: ['paperclip', 'attach', 'tools'] },
  { id: 'bi-icon-pen', title: 'Pen', category: 'tools', type: 'icon', svg: _icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>'), ariaLabel: 'Pen icon', tags: ['pen', 'write', 'tools'] },
  { id: 'bi-icon-zap-tool', title: 'Power', category: 'tools', type: 'icon', svg: _icon('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'), ariaLabel: 'Power icon', tags: ['power', 'electric', 'tools'] }
]

// ─── Security Icons (10) ───

const SECURITY_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-lock', title: 'Lock', category: 'security', type: 'icon', svg: _icon('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>'), ariaLabel: 'Lock icon', tags: ['lock', 'security'] },
  { id: 'bi-icon-unlock', title: 'Unlock', category: 'security', type: 'icon', svg: _icon('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/>'), ariaLabel: 'Unlock icon', tags: ['unlock', 'security'] },
  { id: 'bi-icon-shield', title: 'Shield', category: 'security', type: 'icon', svg: _icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'), ariaLabel: 'Shield icon', tags: ['shield', 'security'] },
  { id: 'bi-icon-key', title: 'Key', category: 'security', type: 'icon', svg: _icon('<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>'), ariaLabel: 'Key icon', tags: ['key', 'security'] },
  { id: 'bi-icon-fingerprint', title: 'Fingerprint', category: 'security', type: 'icon', svg: _icon('<path d="M2 12a10 10 0 0118-6"/><path d="M7 20.7a10 10 0 01-5-9"/><path d="M12 14a2 2 0 100-4 2 2 0 000 4z"/><path d="M22 12a10 10 0 01-5 8.7"/><path d="M12 2a10 10 0 018 4"/>'), ariaLabel: 'Fingerprint icon', tags: ['fingerprint', 'biometric', 'security'] },
  { id: 'bi-icon-alert-shield', title: 'Security Alert', category: 'security', type: 'icon', svg: _icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'), ariaLabel: 'Security alert icon', tags: ['alert', 'security'] },
  { id: 'bi-icon-eye-security', title: 'Surveillance', category: 'security', type: 'icon', svg: _icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'), ariaLabel: 'Surveillance icon', tags: ['surveillance', 'monitor', 'security'] },
  { id: 'bi-icon-shield-check', title: 'Shield Check', category: 'security', type: 'icon', svg: _icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'), ariaLabel: 'Shield check icon', tags: ['verified', 'secure', 'security'] },
  { id: 'bi-icon-scan', title: 'Scan', category: 'security', type: 'icon', svg: _icon('<path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/>'), ariaLabel: 'Scan icon', tags: ['scan', 'security'] },
  { id: 'bi-icon-lock-keyhole', title: 'Privacy', category: 'security', type: 'icon', svg: _icon('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/>'), ariaLabel: 'Privacy icon', tags: ['privacy', 'lock', 'security'] }
]

// ─── Files Icons (10) ───

const FILES_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-file', title: 'File', category: 'files', type: 'icon', svg: _icon('<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>'), ariaLabel: 'File icon', tags: ['file', 'document', 'files'] },
  { id: 'bi-icon-folder', title: 'Folder', category: 'files', type: 'icon', svg: _icon('<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>'), ariaLabel: 'Folder icon', tags: ['folder', 'directory', 'files'] },
  { id: 'bi-icon-clipboard', title: 'Clipboard', category: 'files', type: 'icon', svg: _icon('<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>'), ariaLabel: 'Clipboard icon', tags: ['clipboard', 'paste', 'files'] },
  { id: 'bi-icon-archive', title: 'Archive', category: 'files', type: 'icon', svg: _icon('<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>'), ariaLabel: 'Archive icon', tags: ['archive', 'storage', 'files'] },
  { id: 'bi-icon-database', title: 'Database', category: 'files', type: 'icon', svg: _icon('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>'), ariaLabel: 'Database icon', tags: ['database', 'data', 'files'] },
  { id: 'bi-icon-download', title: 'Download', category: 'files', type: 'icon', svg: _icon('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'), ariaLabel: 'Download icon', tags: ['download', 'save', 'files'] },
  { id: 'bi-icon-upload', title: 'Upload', category: 'files', type: 'icon', svg: _icon('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'), ariaLabel: 'Upload icon', tags: ['upload', 'files'] },
  { id: 'bi-icon-file-text', title: 'Text File', category: 'files', type: 'icon', svg: _icon('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'), ariaLabel: 'Text file icon', tags: ['text', 'document', 'files'] },
  { id: 'bi-icon-save', title: 'Save', category: 'files', type: 'icon', svg: _icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'), ariaLabel: 'Save icon', tags: ['save', 'floppy', 'files'] },
  { id: 'bi-icon-trash', title: 'Trash', category: 'files', type: 'icon', svg: _icon('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>'), ariaLabel: 'Trash icon', tags: ['trash', 'delete', 'files'] }
]

// ─── Time Icons (10) ───

const TIME_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-clock', title: 'Clock', category: 'time', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'), ariaLabel: 'Clock icon', tags: ['clock', 'time'] },
  { id: 'bi-icon-calendar', title: 'Calendar', category: 'time', type: 'icon', svg: _icon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'), ariaLabel: 'Calendar icon', tags: ['calendar', 'date', 'time'] },
  { id: 'bi-icon-hourglass', title: 'Hourglass', category: 'time', type: 'icon', svg: _icon('<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22"/><path d="M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2"/>'), ariaLabel: 'Hourglass icon', tags: ['hourglass', 'time'] },
  { id: 'bi-icon-alarm', title: 'Alarm', category: 'time', type: 'icon', svg: _icon('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3L2 6"/><path d="M22 6l-3-3"/>'), ariaLabel: 'Alarm icon', tags: ['alarm', 'alert', 'time'] },
  { id: 'bi-icon-stopwatch', title: 'Stopwatch', category: 'time', type: 'icon', svg: _icon('<circle cx="12" cy="13" r="8"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="10" y1="1" x2="14" y2="1"/><line x1="12" y1="1" x2="12" y2="5"/>'), ariaLabel: 'Stopwatch icon', tags: ['stopwatch', 'timer', 'time'] },
  { id: 'bi-icon-watch', title: 'Watch', category: 'time', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82H9.83a2 2 0 01-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 019.83 1h4.35a2 2 0 012 1.82l.35 3.83"/>'), ariaLabel: 'Watch icon', tags: ['watch', 'wrist', 'time'] },
  { id: 'bi-icon-history', title: 'History', category: 'time', type: 'icon', svg: _icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/><polyline points="12 7 12 12 16 14"/>'), ariaLabel: 'History icon', tags: ['history', 'time'] },
  { id: 'bi-icon-sunset', title: 'Sunset', category: 'time', type: 'icon', svg: _icon('<path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="16 5 12 9 8 5"/>'), ariaLabel: 'Sunset icon', tags: ['sunset', 'time'] },
  { id: 'bi-icon-fast-forward', title: 'Fast Forward', category: 'time', type: 'icon', svg: _icon('<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>'), ariaLabel: 'Fast forward icon', tags: ['fast-forward', 'time'] },
  { id: 'bi-icon-rewind', title: 'Rewind', category: 'time', type: 'icon', svg: _icon('<polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/>'), ariaLabel: 'Rewind icon', tags: ['rewind', 'time'] }
]

// ─── UI Icons (10) ───

const UI_ICONS: BuiltInAssetDef[] = [
  { id: 'bi-icon-settings', title: 'Settings', category: 'ui', type: 'icon', svg: _icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>'), ariaLabel: 'Settings icon', tags: ['settings', 'gear', 'ui'] },
  { id: 'bi-icon-filter', title: 'Filter', category: 'ui', type: 'icon', svg: _icon('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'), ariaLabel: 'Filter icon', tags: ['filter', 'sort', 'ui'] },
  { id: 'bi-icon-sort', title: 'Sort', category: 'ui', type: 'icon', svg: _icon('<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="8" y2="18"/>'), ariaLabel: 'Sort icon', tags: ['sort', 'order', 'ui'] },
  { id: 'bi-icon-grid', title: 'Grid', category: 'ui', type: 'icon', svg: _icon('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'), ariaLabel: 'Grid icon', tags: ['grid', 'layout', 'ui'] },
  { id: 'bi-icon-list', title: 'List', category: 'ui', type: 'icon', svg: _icon('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'), ariaLabel: 'List icon', tags: ['list', 'layout', 'ui'] },
  { id: 'bi-icon-layers', title: 'Layers', category: 'ui', type: 'icon', svg: _icon('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'), ariaLabel: 'Layers icon', tags: ['layers', 'stack', 'ui'] },
  { id: 'bi-icon-sliders', title: 'Sliders', category: 'ui', type: 'icon', svg: _icon('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'), ariaLabel: 'Sliders icon', tags: ['sliders', 'controls', 'ui'] },
  { id: 'bi-icon-toggle-left', title: 'Toggle Off', category: 'ui', type: 'icon', svg: _icon('<rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="8" cy="12" r="3"/>'), ariaLabel: 'Toggle off icon', tags: ['toggle', 'switch', 'ui'] },
  { id: 'bi-icon-toggle-right', title: 'Toggle On', category: 'ui', type: 'icon', svg: _icon('<rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3"/>'), ariaLabel: 'Toggle on icon', tags: ['toggle', 'switch', 'ui'] },
  { id: 'bi-icon-sidebar', title: 'Sidebar', category: 'ui', type: 'icon', svg: _icon('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>'), ariaLabel: 'Sidebar icon', tags: ['sidebar', 'layout', 'ui'] }
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

// ─── Basic Geometric Shapes Extended (+10) ───

const BASIC_SHAPES_EXT: BuiltInAssetDef[] = [
  { id: 'bi-shape-octagon', title: 'Octagon', category: 'basic-geometric', type: 'shape', svg: _shape('<polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Octagon shape', tags: ['octagon', 'geometric'] },
  { id: 'bi-shape-cross', title: 'Cross', category: 'basic-geometric', type: 'shape', svg: _shape('<polygon points="35,5 65,5 65,35 95,35 95,65 65,65 65,95 35,95 35,65 5,65 5,35 35,35" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Cross shape', tags: ['cross', 'plus', 'geometric'] },
  { id: 'bi-shape-parallelogram', title: 'Parallelogram', category: 'basic-geometric', type: 'shape', svg: _shape('<polygon points="25,15 95,15 75,85 5,85" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Parallelogram shape', tags: ['parallelogram', 'geometric'] },
  { id: 'bi-shape-trapezoid', title: 'Trapezoid', category: 'basic-geometric', type: 'shape', svg: _shape('<polygon points="20,15 80,15 95,85 5,85" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Trapezoid shape', tags: ['trapezoid', 'geometric'] },
  { id: 'bi-shape-right-triangle', title: 'Right Triangle', category: 'basic-geometric', type: 'shape', svg: _shape('<polygon points="5,95 5,5 95,95" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Right triangle shape', tags: ['right-triangle', 'geometric'] },
  { id: 'bi-shape-semicircle', title: 'Semicircle', category: 'basic-geometric', type: 'shape', svg: _shape('<path d="M5,50 A45,45 0 0,1 95,50 Z" fill="#6f2fa6" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Semicircle shape', tags: ['semicircle', 'geometric'] },
  { id: 'bi-shape-quarter-circle', title: 'Quarter Circle', category: 'basic-geometric', type: 'shape', svg: _shape('<path d="M5,95 L5,5 A90,90 0 0,1 95,95 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Quarter circle shape', tags: ['quarter-circle', 'geometric'] },
  { id: 'bi-shape-donut', title: 'Donut', category: 'basic-geometric', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="45" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="50" r="22" fill="white" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Donut shape', tags: ['donut', 'ring', 'geometric'] },
  { id: 'bi-shape-heptagon', title: 'Heptagon', category: 'basic-geometric', type: 'shape', svg: _shape('<polygon points="50,5 86,20 97,57 75,90 25,90 3,57 14,20" fill="#6f2fa6" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Heptagon shape', tags: ['heptagon', 'geometric'] },
  { id: 'bi-shape-decagon', title: 'Decagon', category: 'basic-geometric', type: 'shape', svg: _shape('<polygon points="50,3 73,10 90,28 95,53 85,77 65,92 35,92 15,77 5,53 10,28 27,10" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Decagon shape', tags: ['decagon', 'geometric'] }
]

// ─── Rounded Shapes Extended (+5) ───

const ROUNDED_SHAPES_EXT: BuiltInAssetDef[] = [
  { id: 'bi-shape-stadium', title: 'Stadium', category: 'rounded', type: 'shape', svg: _shape('<rect x="5" y="20" width="90" height="60" rx="30" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Stadium shape', tags: ['stadium', 'rounded'] },
  { id: 'bi-shape-super-ellipse', title: 'Super Ellipse', category: 'rounded', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" rx="35" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Super ellipse shape', tags: ['super-ellipse', 'rounded'] },
  { id: 'bi-shape-rounded-triangle', title: 'Rounded Triangle', category: 'rounded', type: 'shape', svg: _shape('<path d="M50,10 Q80,10 85,85 Q50,95 15,85 Q20,10 50,10 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Rounded triangle shape', tags: ['rounded-triangle', 'rounded'] },
  { id: 'bi-shape-rounded-diamond', title: 'Rounded Diamond', category: 'rounded', type: 'shape', svg: _shape('<path d="M50,5 Q65,5 95,50 Q65,95 50,95 Q35,95 5,50 Q35,5 50,5 Z" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Rounded diamond shape', tags: ['rounded-diamond', 'rounded'] },
  { id: 'bi-shape-rounded-hexagon', title: 'Rounded Hexagon', category: 'rounded', type: 'shape', svg: _shape('<path d="M50,5 Q60,5 90,25 Q95,50 90,75 Q60,95 50,95 Q40,95 10,75 Q5,50 10,25 Q40,5 50,5 Z" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Rounded hexagon shape', tags: ['rounded-hexagon', 'rounded'] }
]

// ─── Arrow Shapes Extended (+10) ───

const ARROW_SHAPES_EXT: BuiltInAssetDef[] = [
  { id: 'bi-shape-curved-arrow-right', title: 'Curved Arrow Right', category: 'arrows', type: 'shape', svg: _shape('<path d="M10,80 Q10,20 60,20 L60,5 L95,30 L60,55 L60,40 Q30,40 30,80 Z" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Curved arrow right shape', tags: ['curved-arrow', 'arrows'] },
  { id: 'bi-shape-curved-arrow-left', title: 'Curved Arrow Left', category: 'arrows', type: 'shape', svg: _shape('<path d="M90,80 Q90,20 40,20 L40,5 L5,30 L40,55 L40,40 Q70,40 70,80 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Curved arrow left shape', tags: ['curved-arrow', 'arrows'] },
  { id: 'bi-shape-double-arrow-h', title: 'Double Arrow Horizontal', category: 'arrows', type: 'shape', svg: _shape('<polygon points="5,50 25,25 25,38 75,38 75,25 95,50 75,75 75,62 25,62 25,75" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>', '0 0 100 100'), ariaLabel: 'Double arrow horizontal shape', tags: ['double-arrow', 'arrows'] },
  { id: 'bi-shape-double-arrow-v', title: 'Double Arrow Vertical', category: 'arrows', type: 'shape', svg: _shape('<polygon points="50,5 75,25 62,25 62,75 75,75 50,95 25,75 38,75 38,25 25,25" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Double arrow vertical shape', tags: ['double-arrow', 'arrows'] },
  { id: 'bi-shape-circular-arrow', title: 'Circular Arrow', category: 'arrows', type: 'shape', svg: _shape('<path d="M75,20 A35,35 0 1,1 30,25" fill="none" stroke="#6f2fa6" stroke-width="6"/><polygon points="30,10 45,30 20,30" fill="#6f2fa6"/>'), ariaLabel: 'Circular arrow shape', tags: ['circular-arrow', 'refresh', 'arrows'] },
  { id: 'bi-shape-chevron-right', title: 'Chevron Right', category: 'arrows', type: 'shape', svg: _shape('<polygon points="5,5 65,50 5,95 25,95 85,50 25,5" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>', '0 0 90 100'), ariaLabel: 'Chevron right shape', tags: ['chevron', 'arrows'] },
  { id: 'bi-shape-chevron-left', title: 'Chevron Left', category: 'arrows', type: 'shape', svg: _shape('<polygon points="85,5 25,50 85,95 65,95 5,50 65,5" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>', '0 0 90 100'), ariaLabel: 'Chevron left shape', tags: ['chevron', 'arrows'] },
  { id: 'bi-shape-fat-arrow-right', title: 'Fat Arrow Right', category: 'arrows', type: 'shape', svg: _shape('<polygon points="5,20 70,20 70,5 95,50 70,95 70,80 5,80" fill="#6f2fa6" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Fat arrow right shape', tags: ['fat-arrow', 'arrows'] },
  { id: 'bi-shape-fat-arrow-left', title: 'Fat Arrow Left', category: 'arrows', type: 'shape', svg: _shape('<polygon points="95,20 30,20 30,5 5,50 30,95 30,80 95,80" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Fat arrow left shape', tags: ['fat-arrow', 'arrows'] },
  { id: 'bi-shape-bent-arrow', title: 'Bent Arrow', category: 'arrows', type: 'shape', svg: _shape('<polygon points="60,5 95,30 60,55 60,40 30,40 30,95 10,95 10,20 60,20" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Bent arrow shape', tags: ['bent-arrow', 'arrows'] }
]

// ─── Callout Shapes Extended (+10) ───

const CALLOUT_SHAPES_EXT: BuiltInAssetDef[] = [
  { id: 'bi-shape-cloud-callout', title: 'Cloud Callout', category: 'callouts', type: 'shape', svg: _shape('<ellipse cx="50" cy="35" rx="40" ry="28" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="25" cy="70" r="8" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="18" cy="85" r="5" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Cloud callout shape', tags: ['cloud', 'callout'] },
  { id: 'bi-shape-explosion', title: 'Explosion', category: 'callouts', type: 'shape', svg: _shape('<polygon points="50,5 58,30 85,15 68,38 95,40 72,55 90,80 60,65 50,95 40,65 10,80 28,55 5,40 32,38 15,15 42,30" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Explosion shape', tags: ['explosion', 'burst', 'callout'] },
  { id: 'bi-shape-bookmark', title: 'Bookmark', category: 'callouts', type: 'shape', svg: _shape('<polygon points="20,5 80,5 80,95 50,75 20,95" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Bookmark shape', tags: ['bookmark', 'callout'] },
  { id: 'bi-shape-ribbon', title: 'Ribbon', category: 'callouts', type: 'shape', svg: _shape('<path d="M5,20 h90 v40 l-45,15 l-45,-15 z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>', '0 0 100 80'), ariaLabel: 'Ribbon shape', tags: ['ribbon', 'callout'] },
  { id: 'bi-shape-flag-shape', title: 'Flag', category: 'callouts', type: 'shape', svg: _shape('<path d="M10,5 L10,95 M10,5 L90,5 L75,30 L90,55 L10,55" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Flag shape', tags: ['flag', 'callout'] },
  { id: 'bi-shape-heart-shape', title: 'Heart', category: 'callouts', type: 'shape', svg: _shape('<path d="M50,90 L10,45 A25,25 0 0,1 50,30 A25,25 0 0,1 90,45 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Heart shape', tags: ['heart', 'love', 'callout'] },
  { id: 'bi-shape-note', title: 'Note', category: 'callouts', type: 'shape', svg: _shape('<path d="M5,5 h70 l20,20 v70 h-90 z M75,5 v20 h20" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Note shape', tags: ['note', 'document', 'callout'] },
  { id: 'bi-shape-pin', title: 'Pin', category: 'callouts', type: 'shape', svg: _shape('<circle cx="50" cy="35" r="30" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><polygon points="35,60 50,95 65,60" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Pin shape', tags: ['pin', 'location', 'callout'] },
  { id: 'bi-shape-tooltip', title: 'Tooltip', category: 'callouts', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="60" rx="8" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><polygon points="40,65 50,80 60,65" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Tooltip shape', tags: ['tooltip', 'callout'] },
  { id: 'bi-shape-scroll', title: 'Scroll', category: 'callouts', type: 'shape', svg: _shape('<path d="M15,15 Q15,5 25,5 H85 Q95,5 95,15 V75 Q95,85 85,85 H90 Q80,85 80,95 H15 Q5,95 5,85 V25 Q5,15 15,15 Z" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Scroll shape', tags: ['scroll', 'parchment', 'callout'] }
]

// ─── Flowchart Shapes (18) ───

const FLOWCHART_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-fc-process', title: 'Process', category: 'flowchart', type: 'shape', svg: _shape('<rect x="5" y="20" width="90" height="60" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Process shape', tags: ['process', 'flowchart'] },
  { id: 'bi-shape-fc-decision', title: 'Decision', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="50,5 95,50 50,95 5,50" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Decision shape', tags: ['decision', 'flowchart'] },
  { id: 'bi-shape-fc-terminator', title: 'Terminator', category: 'flowchart', type: 'shape', svg: _shape('<rect x="5" y="25" width="90" height="50" rx="25" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Terminator shape', tags: ['terminator', 'start', 'end', 'flowchart'] },
  { id: 'bi-shape-fc-data', title: 'Data (IO)', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="20,20 95,20 80,80 5,80" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Data IO shape', tags: ['data', 'input', 'output', 'flowchart'] },
  { id: 'bi-shape-fc-document', title: 'Document', category: 'flowchart', type: 'shape', svg: _shape('<path d="M5,15 h90 v60 Q73,65 50,80 Q27,65 5,75 z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Document shape', tags: ['document', 'flowchart'] },
  { id: 'bi-shape-fc-manual-input', title: 'Manual Input', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="5,30 95,15 95,85 5,85" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Manual input shape', tags: ['manual-input', 'flowchart'] },
  { id: 'bi-shape-fc-predefined', title: 'Predefined Process', category: 'flowchart', type: 'shape', svg: _shape('<rect x="5" y="20" width="90" height="60" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><line x1="18" y1="20" x2="18" y2="80" stroke="#6f2fa6" stroke-width="2"/><line x1="82" y1="20" x2="82" y2="80" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Predefined process shape', tags: ['predefined', 'subroutine', 'flowchart'] },
  { id: 'bi-shape-fc-preparation', title: 'Preparation', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="20,20 80,20 95,50 80,80 20,80 5,50" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Preparation shape', tags: ['preparation', 'flowchart'] },
  { id: 'bi-shape-fc-delay', title: 'Delay', category: 'flowchart', type: 'shape', svg: _shape('<path d="M5,20 h55 a30,30 0 0,1 0,60 h-55 z" fill="#6f2fa6" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Delay shape', tags: ['delay', 'wait', 'flowchart'] },
  { id: 'bi-shape-fc-display', title: 'Display', category: 'flowchart', type: 'shape', svg: _shape('<path d="M25,20 h50 l20,30 l-20,30 h-50 Q5,50 25,20 z" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Display shape', tags: ['display', 'flowchart'] },
  { id: 'bi-shape-fc-database', title: 'Database', category: 'flowchart', type: 'shape', svg: _shape('<ellipse cx="50" cy="20" rx="40" ry="12" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><path d="M10,20 v60 Q10,92 50,92 Q90,92 90,80 v-60" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Database shape', tags: ['database', 'storage', 'flowchart'] },
  { id: 'bi-shape-fc-merge', title: 'Merge', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="5,20 95,20 50,80" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Merge shape', tags: ['merge', 'flowchart'] },
  { id: 'bi-shape-fc-extract', title: 'Extract', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="50,20 95,80 5,80" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Extract shape', tags: ['extract', 'flowchart'] },
  { id: 'bi-shape-fc-connector', title: 'Connector', category: 'flowchart', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="25" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Connector shape', tags: ['connector', 'flowchart'] },
  { id: 'bi-shape-fc-off-page', title: 'Off-Page', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="20,15 80,15 80,65 50,90 20,65" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Off-page connector shape', tags: ['off-page', 'flowchart'] },
  { id: 'bi-shape-fc-manual-op', title: 'Manual Operation', category: 'flowchart', type: 'shape', svg: _shape('<polygon points="10,20 90,20 75,80 25,80" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Manual operation shape', tags: ['manual', 'operation', 'flowchart'] },
  { id: 'bi-shape-fc-internal-storage', title: 'Internal Storage', category: 'flowchart', type: 'shape', svg: _shape('<rect x="10" y="10" width="80" height="80" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><line x1="25" y1="10" x2="25" y2="90" stroke="#6f2fa6" stroke-width="1.5"/><line x1="10" y1="25" x2="90" y2="25" stroke="#6f2fa6" stroke-width="1.5"/>'), ariaLabel: 'Internal storage shape', tags: ['internal-storage', 'flowchart'] },
  { id: 'bi-shape-fc-multi-doc', title: 'Multiple Documents', category: 'flowchart', type: 'shape', svg: _shape('<path d="M15,10 h70 v55 Q58,55 42,68 Q26,55 15,65 z" fill="#3a2b95" stroke="#6f2fa6" stroke-width="1.5"/><path d="M10,15 h70 v55 Q53,60 37,73 Q21,60 10,70 z" fill="#6f2fa6" stroke="#3a2b95" stroke-width="1.5"/><path d="M5,20 h70 v55 Q48,65 32,78 Q16,65 5,75 z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Multiple documents shape', tags: ['multi-document', 'flowchart'] }
]

// ─── Connector Shapes (12) ──���

const CONNECTOR_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-line-h', title: 'Horizontal Line', category: 'connectors', type: 'shape', svg: _shape('<line x1="5" y1="50" x2="95" y2="50" stroke="#6f2fa6" stroke-width="4"/>', '0 0 100 100'), ariaLabel: 'Horizontal line', tags: ['line', 'horizontal', 'connector'] },
  { id: 'bi-shape-line-v', title: 'Vertical Line', category: 'connectors', type: 'shape', svg: _shape('<line x1="50" y1="5" x2="50" y2="95" stroke="#6f2fa6" stroke-width="4"/>'), ariaLabel: 'Vertical line', tags: ['line', 'vertical', 'connector'] },
  { id: 'bi-shape-line-diag', title: 'Diagonal Line', category: 'connectors', type: 'shape', svg: _shape('<line x1="5" y1="95" x2="95" y2="5" stroke="#a23b84" stroke-width="4"/>'), ariaLabel: 'Diagonal line', tags: ['line', 'diagonal', 'connector'] },
  { id: 'bi-shape-elbow-right', title: 'Elbow Right', category: 'connectors', type: 'shape', svg: _shape('<polyline points="5,20 50,20 50,80 95,80" fill="none" stroke="#3a2b95" stroke-width="4"/>'), ariaLabel: 'Elbow right connector', tags: ['elbow', 'connector'] },
  { id: 'bi-shape-elbow-left', title: 'Elbow Left', category: 'connectors', type: 'shape', svg: _shape('<polyline points="95,20 50,20 50,80 5,80" fill="none" stroke="#a23b84" stroke-width="4"/>'), ariaLabel: 'Elbow left connector', tags: ['elbow', 'connector'] },
  { id: 'bi-shape-curve-s', title: 'S-Curve', category: 'connectors', type: 'shape', svg: _shape('<path d="M5,20 C40,20 60,80 95,80" fill="none" stroke="#6f2fa6" stroke-width="4"/>'), ariaLabel: 'S-curve connector', tags: ['curve', 's-curve', 'connector'] },
  { id: 'bi-shape-arrow-line-r', title: 'Arrow Line Right', category: 'connectors', type: 'shape', svg: _shape('<line x1="5" y1="50" x2="85" y2="50" stroke="#3a2b95" stroke-width="4"/><polygon points="80,35 95,50 80,65" fill="#3a2b95"/>'), ariaLabel: 'Arrow line right', tags: ['arrow-line', 'connector'] },
  { id: 'bi-shape-arrow-line-l', title: 'Arrow Line Left', category: 'connectors', type: 'shape', svg: _shape('<line x1="15" y1="50" x2="95" y2="50" stroke="#a23b84" stroke-width="4"/><polygon points="20,35 5,50 20,65" fill="#a23b84"/>'), ariaLabel: 'Arrow line left', tags: ['arrow-line', 'connector'] },
  { id: 'bi-shape-double-line', title: 'Double Arrow Line', category: 'connectors', type: 'shape', svg: _shape('<line x1="20" y1="50" x2="80" y2="50" stroke="#6f2fa6" stroke-width="4"/><polygon points="15,35 0,50 15,65" fill="#6f2fa6"/><polygon points="85,35 100,50 85,65" fill="#6f2fa6"/>'), ariaLabel: 'Double arrow line', tags: ['double-arrow', 'connector'] },
  { id: 'bi-shape-bracket-left', title: 'Left Bracket', category: 'connectors', type: 'shape', svg: _shape('<path d="M60,5 Q20,5 20,50 Q20,95 60,95" fill="none" stroke="#3a2b95" stroke-width="5"/>'), ariaLabel: 'Left bracket', tags: ['bracket', 'connector'] },
  { id: 'bi-shape-bracket-right', title: 'Right Bracket', category: 'connectors', type: 'shape', svg: _shape('<path d="M40,5 Q80,5 80,50 Q80,95 40,95" fill="none" stroke="#a23b84" stroke-width="5"/>'), ariaLabel: 'Right bracket', tags: ['bracket', 'connector'] },
  { id: 'bi-shape-brace', title: 'Curly Brace', category: 'connectors', type: 'shape', svg: _shape('<path d="M60,5 Q40,5 40,25 Q40,45 20,50 Q40,55 40,75 Q40,95 60,95" fill="none" stroke="#6f2fa6" stroke-width="4"/>'), ariaLabel: 'Curly brace', tags: ['brace', 'connector'] }
]

// ─── Frame Shapes (12) ───

const FRAME_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-frame-square', title: 'Square Frame', category: 'frames', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" fill="none" stroke="#a23b84" stroke-width="6"/>'), ariaLabel: 'Square frame', tags: ['frame', 'square'] },
  { id: 'bi-shape-frame-rounded', title: 'Rounded Frame', category: 'frames', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" rx="15" fill="none" stroke="#3a2b95" stroke-width="6"/>'), ariaLabel: 'Rounded frame', tags: ['frame', 'rounded'] },
  { id: 'bi-shape-frame-circle', title: 'Circle Frame', category: 'frames', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="43" fill="none" stroke="#6f2fa6" stroke-width="6"/>'), ariaLabel: 'Circle frame', tags: ['frame', 'circle'] },
  { id: 'bi-shape-frame-double', title: 'Double Frame', category: 'frames', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" fill="none" stroke="#a23b84" stroke-width="3"/><rect x="12" y="12" width="76" height="76" fill="none" stroke="#a23b84" stroke-width="3"/>'), ariaLabel: 'Double frame', tags: ['frame', 'double'] },
  { id: 'bi-shape-frame-ornate', title: 'Ornate Frame', category: 'frames', type: 'shape', svg: _shape('<rect x="10" y="10" width="80" height="80" fill="none" stroke="#3a2b95" stroke-width="3"/><circle cx="10" cy="10" r="5" fill="#3a2b95"/><circle cx="90" cy="10" r="5" fill="#3a2b95"/><circle cx="10" cy="90" r="5" fill="#3a2b95"/><circle cx="90" cy="90" r="5" fill="#3a2b95"/>'), ariaLabel: 'Ornate frame', tags: ['frame', 'ornate', 'decorative'] },
  { id: 'bi-shape-frame-oval', title: 'Oval Frame', category: 'frames', type: 'shape', svg: _shape('<ellipse cx="50" cy="50" rx="43" ry="35" fill="none" stroke="#6f2fa6" stroke-width="6"/>'), ariaLabel: 'Oval frame', tags: ['frame', 'oval'] },
  { id: 'bi-shape-frame-diamond', title: 'Diamond Frame', category: 'frames', type: 'shape', svg: _shape('<polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#a23b84" stroke-width="5"/>'), ariaLabel: 'Diamond frame', tags: ['frame', 'diamond'] },
  { id: 'bi-shape-frame-hexagon', title: 'Hexagon Frame', category: 'frames', type: 'shape', svg: _shape('<polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="#3a2b95" stroke-width="5"/>'), ariaLabel: 'Hexagon frame', tags: ['frame', 'hexagon'] },
  { id: 'bi-shape-frame-star', title: 'Star Frame', category: 'frames', type: 'shape', svg: _shape('<polygon points="50,5 61,38 97,38 68,60 79,95 50,72 21,95 32,60 3,38 39,38" fill="none" stroke="#6f2fa6" stroke-width="4"/>'), ariaLabel: 'Star frame', tags: ['frame', 'star'] },
  { id: 'bi-shape-frame-arch', title: 'Arch Frame', category: 'frames', type: 'shape', svg: _shape('<path d="M10,90 V40 A40,40 0 0,1 90,40 V90 Z" fill="none" stroke="#a23b84" stroke-width="5"/>'), ariaLabel: 'Arch frame', tags: ['frame', 'arch'] },
  { id: 'bi-shape-frame-ticket', title: 'Ticket Frame', category: 'frames', type: 'shape', svg: _shape('<path d="M5,10 H95 V40 A10,10 0 0,0 95,60 V90 H5 V60 A10,10 0 0,0 5,40 Z" fill="none" stroke="#3a2b95" stroke-width="4"/>'), ariaLabel: 'Ticket frame', tags: ['frame', 'ticket'] },
  { id: 'bi-shape-frame-shield', title: 'Shield Frame', category: 'frames', type: 'shape', svg: _shape('<path d="M50,5 L90,20 V55 Q90,90 50,95 Q10,90 10,55 V20 Z" fill="none" stroke="#6f2fa6" stroke-width="5"/>'), ariaLabel: 'Shield frame', tags: ['frame', 'shield'] }
]

// ─── Infographic Shapes (15) ───

const INFOGRAPHIC_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-ig-pie', title: 'Pie Chart', category: 'infographic', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="42" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><path d="M50,50 L50,8 A42,42 0 0,1 88,65 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Pie chart shape', tags: ['pie-chart', 'infographic'] },
  { id: 'bi-shape-ig-donut', title: 'Donut Chart', category: 'infographic', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="42" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><path d="M50,50 L50,8 A42,42 0 0,1 88,65 Z" fill="#a23b84"/><circle cx="50" cy="50" r="22" fill="white" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Donut chart shape', tags: ['donut-chart', 'infographic'] },
  { id: 'bi-shape-ig-bar', title: 'Bar Chart', category: 'infographic', type: 'shape', svg: _shape('<rect x="10" y="60" width="15" height="35" fill="#a23b84"/><rect x="30" y="35" width="15" height="60" fill="#3a2b95"/><rect x="50" y="20" width="15" height="75" fill="#6f2fa6"/><rect x="70" y="45" width="15" height="50" fill="#a23b84"/><line x1="5" y1="95" x2="95" y2="95" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Bar chart shape', tags: ['bar-chart', 'infographic'] },
  { id: 'bi-shape-ig-funnel', title: 'Funnel', category: 'infographic', type: 'shape', svg: _shape('<polygon points="5,10 95,10 70,40 70,90 30,90 30,40" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Funnel shape', tags: ['funnel', 'infographic'] },
  { id: 'bi-shape-ig-timeline', title: 'Timeline Node', category: 'infographic', type: 'shape', svg: _shape('<line x1="50" y1="5" x2="50" y2="95" stroke="#6f2fa6" stroke-width="4"/><circle cx="50" cy="50" r="15" fill="#a23b84" stroke="#6f2fa6" stroke-width="3"/>'), ariaLabel: 'Timeline node shape', tags: ['timeline', 'node', 'infographic'] },
  { id: 'bi-shape-ig-pyramid', title: 'Pyramid', category: 'infographic', type: 'shape', svg: _shape('<polygon points="50,5 95,95 5,95" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><line x1="25" y1="55" x2="75" y2="55" stroke="#6f2fa6" stroke-width="1.5"/><line x1="35" y1="35" x2="65" y2="35" stroke="#6f2fa6" stroke-width="1.5"/><line x1="15" y1="75" x2="85" y2="75" stroke="#6f2fa6" stroke-width="1.5"/>'), ariaLabel: 'Pyramid shape', tags: ['pyramid', 'hierarchy', 'infographic'] },
  { id: 'bi-shape-ig-gauge', title: 'Gauge', category: 'infographic', type: 'shape', svg: _shape('<path d="M10,70 A45,45 0 0,1 90,70" fill="none" stroke="#3a2b95" stroke-width="8"/><path d="M10,70 A45,45 0 0,1 50,25" fill="none" stroke="#a23b84" stroke-width="8"/><circle cx="50" cy="70" r="5" fill="#6f2fa6"/>'), ariaLabel: 'Gauge shape', tags: ['gauge', 'meter', 'infographic'] },
  { id: 'bi-shape-ig-step-arrow', title: 'Step Arrow', category: 'infographic', type: 'shape', svg: _shape('<polygon points="5,20 70,20 85,50 70,80 5,80 20,50" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Step arrow shape', tags: ['step', 'process', 'infographic'] },
  { id: 'bi-shape-ig-hexagon-node', title: 'Hexagon Node', category: 'infographic', type: 'shape', svg: _shape('<polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#6f2fa6" stroke="#3a2b95" stroke-width="3"/>'), ariaLabel: 'Hexagon node shape', tags: ['hexagon', 'node', 'infographic'] },
  { id: 'bi-shape-ig-circle-node', title: 'Circle Node', category: 'infographic', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="40" fill="#3a2b95" stroke="#a23b84" stroke-width="4"/>'), ariaLabel: 'Circle node shape', tags: ['circle', 'node', 'infographic'] },
  { id: 'bi-shape-ig-tab', title: 'Tab', category: 'infographic', type: 'shape', svg: _shape('<path d="M5,25 H30 L40,5 H95 V95 H5 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Tab shape', tags: ['tab', 'infographic'] },
  { id: 'bi-shape-ig-callout-num', title: 'Number Callout', category: 'infographic', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="42" fill="#6f2fa6" stroke="#3a2b95" stroke-width="3"/><circle cx="50" cy="50" r="32" fill="none" stroke="white" stroke-width="2" stroke-dasharray="5,3"/>'), ariaLabel: 'Number callout shape', tags: ['number', 'callout', 'infographic'] },
  { id: 'bi-shape-ig-line-chart', title: 'Line Chart', category: 'infographic', type: 'shape', svg: _shape('<polyline points="10,70 30,40 50,55 70,20 90,35" fill="none" stroke="#a23b84" stroke-width="4"/><line x1="5" y1="90" x2="95" y2="90" stroke="#3a2b95" stroke-width="2"/><line x1="10" y1="5" x2="10" y2="90" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Line chart shape', tags: ['line-chart', 'infographic'] },
  { id: 'bi-shape-ig-area', title: 'Area Chart', category: 'infographic', type: 'shape', svg: _shape('<path d="M10,90 L10,70 L30,40 L50,55 L70,20 L90,35 L90,90 Z" fill="#a23b84" opacity="0.6" stroke="#6f2fa6" stroke-width="2"/><line x1="5" y1="90" x2="95" y2="90" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Area chart shape', tags: ['area-chart', 'infographic'] },
  { id: 'bi-shape-ig-scatter', title: 'Scatter Plot', category: 'infographic', type: 'shape', svg: _shape('<circle cx="20" cy="60" r="5" fill="#a23b84"/><circle cx="35" cy="35" r="5" fill="#3a2b95"/><circle cx="55" cy="50" r="5" fill="#6f2fa6"/><circle cx="70" cy="25" r="5" fill="#a23b84"/><circle cx="85" cy="40" r="5" fill="#3a2b95"/><circle cx="45" cy="75" r="5" fill="#6f2fa6"/><line x1="5" y1="90" x2="95" y2="90" stroke="#3a2b95" stroke-width="2"/><line x1="10" y1="5" x2="10" y2="90" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Scatter plot shape', tags: ['scatter', 'chart', 'infographic'] }
]

// ─── Decorative Shapes (15) ───

const DECORATIVE_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-wave', title: 'Wave', category: 'decorative', type: 'shape', svg: _shape('<path d="M0,50 Q25,20 50,50 Q75,80 100,50 V100 H0 Z" fill="#a23b84" stroke="none"/>'), ariaLabel: 'Wave shape', tags: ['wave', 'decorative'] },
  { id: 'bi-shape-zigzag', title: 'Zigzag', category: 'decorative', type: 'shape', svg: _shape('<polyline points="0,50 15,20 30,50 45,20 60,50 75,20 90,50" fill="none" stroke="#6f2fa6" stroke-width="5"/>'), ariaLabel: 'Zigzag shape', tags: ['zigzag', 'decorative'] },
  { id: 'bi-shape-spiral', title: 'Spiral', category: 'decorative', type: 'shape', svg: _shape('<path d="M50,50 Q50,30 65,30 Q80,30 80,50 Q80,70 55,70 Q30,70 30,45 Q30,15 60,15 Q90,15 90,50 Q90,85 50,85" fill="none" stroke="#3a2b95" stroke-width="4"/>'), ariaLabel: 'Spiral shape', tags: ['spiral', 'decorative'] },
  { id: 'bi-shape-sunburst', title: 'Sunburst', category: 'decorative', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="20" fill="#a23b84"/><polygon points="50,5 55,28 50,5 45,28" fill="#a23b84"/><polygon points="82,18 62,35 82,18 58,32" fill="#a23b84"/><polygon points="95,50 72,55 95,50 72,45" fill="#a23b84"/><polygon points="82,82 62,65 82,82 58,68" fill="#a23b84"/><polygon points="50,95 45,72 50,95 55,72" fill="#a23b84"/><polygon points="18,82 38,65 18,82 42,68" fill="#a23b84"/><polygon points="5,50 28,45 5,50 28,55" fill="#a23b84"/><polygon points="18,18 38,35 18,18 42,32" fill="#a23b84"/>'), ariaLabel: 'Sunburst shape', tags: ['sunburst', 'sun', 'decorative'] },
  { id: 'bi-shape-starburst', title: 'Starburst', category: 'decorative', type: 'shape', svg: _shape('<polygon points="50,2 56,30 80,8 64,33 98,28 72,46 100,58 70,58 88,82 58,66 58,98 46,68 22,92 36,62 2,70 30,52 2,36 32,40 18,12 40,32" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Starburst shape', tags: ['starburst', 'decorative'] },
  { id: 'bi-shape-blob-1', title: 'Blob 1', category: 'decorative', type: 'shape', svg: _shape('<path d="M50,10 Q80,5 90,35 Q95,65 70,85 Q45,95 20,75 Q5,55 15,30 Q25,15 50,10 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Blob shape', tags: ['blob', 'organic', 'decorative'] },
  { id: 'bi-shape-blob-2', title: 'Blob 2', category: 'decorative', type: 'shape', svg: _shape('<path d="M45,8 Q75,5 88,30 Q100,55 80,80 Q55,100 30,85 Q5,70 10,40 Q15,15 45,8 Z" fill="#3a2b95" stroke="#a23b84" stroke-width="2"/>'), ariaLabel: 'Blob 2 shape', tags: ['blob', 'organic', 'decorative'] },
  { id: 'bi-shape-divider-wave', title: 'Wave Divider', category: 'decorative', type: 'shape', svg: _shape('<path d="M0,30 Q25,5 50,30 Q75,55 100,30" fill="none" stroke="#6f2fa6" stroke-width="5"/>', '0 0 100 60'), ariaLabel: 'Wave divider', tags: ['divider', 'wave', 'decorative'] },
  { id: 'bi-shape-divider-dots', title: 'Dot Divider', category: 'decorative', type: 'shape', svg: _shape('<circle cx="10" cy="30" r="5" fill="#a23b84"/><circle cx="30" cy="30" r="5" fill="#3a2b95"/><circle cx="50" cy="30" r="5" fill="#6f2fa6"/><circle cx="70" cy="30" r="5" fill="#a23b84"/><circle cx="90" cy="30" r="5" fill="#3a2b95"/>', '0 0 100 60'), ariaLabel: 'Dot divider', tags: ['divider', 'dots', 'decorative'] },
  { id: 'bi-shape-corner-ornament', title: 'Corner Ornament', category: 'decorative', type: 'shape', svg: _shape('<path d="M5,5 Q50,5 50,50 Q5,50 5,5 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Corner ornament', tags: ['corner', 'ornament', 'decorative'] },
  { id: 'bi-shape-scallop', title: 'Scallop', category: 'decorative', type: 'shape', svg: _shape('<path d="M50,8 Q62,8 70,20 Q82,14 88,28 Q98,32 95,45 Q102,56 92,65 Q96,78 84,82 Q82,95 68,92 Q58,100 48,92 Q36,98 28,88 Q14,92 12,78 Q2,72 8,60 Q0,48 10,40 Q6,28 18,24 Q18,12 30,12 Q38,4 50,8 Z" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Scallop shape', tags: ['scallop', 'decorative'] },
  { id: 'bi-shape-wave-top', title: 'Wave Top', category: 'decorative', type: 'shape', svg: _shape('<path d="M0,40 Q25,10 50,40 Q75,70 100,40 V0 H0 Z" fill="#3a2b95" stroke="none"/>'), ariaLabel: 'Wave top shape', tags: ['wave', 'top', 'decorative'] },
  { id: 'bi-shape-wave-bottom', title: 'Wave Bottom', category: 'decorative', type: 'shape', svg: _shape('<path d="M0,60 Q25,90 50,60 Q75,30 100,60 V100 H0 Z" fill="#a23b84" stroke="none"/>'), ariaLabel: 'Wave bottom shape', tags: ['wave', 'bottom', 'decorative'] },
  { id: 'bi-shape-circle-pattern', title: 'Circle Pattern', category: 'decorative', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="45" fill="none" stroke="#6f2fa6" stroke-width="3"/><circle cx="50" cy="50" r="30" fill="none" stroke="#a23b84" stroke-width="3"/><circle cx="50" cy="50" r="15" fill="#3a2b95"/>'), ariaLabel: 'Circle pattern shape', tags: ['pattern', 'circles', 'decorative'] },
  { id: 'bi-shape-diamond-pattern', title: 'Diamond Pattern', category: 'decorative', type: 'shape', svg: _shape('<polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#a23b84" stroke-width="3"/><polygon points="50,20 80,50 50,80 20,50" fill="none" stroke="#3a2b95" stroke-width="3"/><polygon points="50,35 65,50 50,65 35,50" fill="#6f2fa6"/>'), ariaLabel: 'Diamond pattern shape', tags: ['pattern', 'diamond', 'decorative'] }
]

// ─── Badge Shapes (12) ───

const BADGE_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-ribbon-badge', title: 'Ribbon Badge', category: 'badges', type: 'shape', svg: _shape('<circle cx="50" cy="40" r="32" fill="#a23b84" stroke="#6f2fa6" stroke-width="3"/><polygon points="30,65 20,95 38,80 50,98 62,80 80,95 70,65" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Ribbon badge shape', tags: ['ribbon', 'badge'] },
  { id: 'bi-shape-shield-badge', title: 'Shield Badge', category: 'badges', type: 'shape', svg: _shape('<path d="M50,5 L90,20 V55 Q90,90 50,95 Q10,90 10,55 V20 Z" fill="#3a2b95" stroke="#6f2fa6" stroke-width="3"/>'), ariaLabel: 'Shield badge shape', tags: ['shield', 'badge'] },
  { id: 'bi-shape-seal', title: 'Seal', category: 'badges', type: 'shape', svg: _shape('<polygon points="50,5 58,25 78,15 70,35 92,35 75,48 88,66 68,60 65,82 50,66 35,82 32,60 12,66 25,48 8,35 30,35 22,15 42,25" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Seal shape', tags: ['seal', 'badge'] },
  { id: 'bi-shape-certificate', title: 'Certificate', category: 'badges', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="70" rx="4" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="10" y="10" width="80" height="60" rx="2" fill="none" stroke="#6f2fa6" stroke-width="1" stroke-dasharray="4,2"/><circle cx="50" cy="80" r="12" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><polygon points="42,88 50,98 58,88" fill="#3a2b95"/>'), ariaLabel: 'Certificate shape', tags: ['certificate', 'badge'] },
  { id: 'bi-shape-rosette', title: 'Rosette', category: 'badges', type: 'shape', svg: _shape('<circle cx="50" cy="45" r="30" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="45" r="20" fill="#6f2fa6"/><path d="M35,70 L25,95 L50,80 L75,95 L65,70" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Rosette shape', tags: ['rosette', 'badge'] },
  { id: 'bi-shape-star-badge', title: 'Star Badge', category: 'badges', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="42" fill="#3a2b95" stroke="#6f2fa6" stroke-width="3"/><polygon points="50,18 57,38 78,38 62,50 68,70 50,58 32,70 38,50 22,38 43,38" fill="#a23b84"/>'), ariaLabel: 'Star badge shape', tags: ['star', 'badge'] },
  { id: 'bi-shape-hexagon-badge', title: 'Hexagon Badge', category: 'badges', type: 'shape', svg: _shape('<polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#6f2fa6" stroke="#3a2b95" stroke-width="3"/><polygon points="50,18 78,32 78,68 50,82 22,68 22,32" fill="none" stroke="white" stroke-width="2"/>'), ariaLabel: 'Hexagon badge shape', tags: ['hexagon', 'badge'] },
  { id: 'bi-shape-banner-badge', title: 'Banner Badge', category: 'badges', type: 'shape', svg: _shape('<path d="M10,5 H90 V70 L50,90 L10,70 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="3"/>'), ariaLabel: 'Banner badge shape', tags: ['banner', 'badge'] },
  { id: 'bi-shape-circle-badge', title: 'Circle Badge', category: 'badges', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="44" fill="#3a2b95" stroke="#6f2fa6" stroke-width="4"/><circle cx="50" cy="50" r="34" fill="none" stroke="white" stroke-width="2"/>'), ariaLabel: 'Circle badge shape', tags: ['circle', 'badge'] },
  { id: 'bi-shape-medal-badge', title: 'Medal Badge', category: 'badges', type: 'shape', svg: _shape('<path d="M35,5 H65 L60,30 H40 Z" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="60" r="30" fill="#a23b84" stroke="#6f2fa6" stroke-width="3"/>'), ariaLabel: 'Medal badge shape', tags: ['medal', 'badge'] },
  { id: 'bi-shape-ribbon-flat', title: 'Flat Ribbon', category: 'badges', type: 'shape', svg: _shape('<path d="M0,30 L15,30 L15,10 H85 V30 L100,30 L85,45 L100,60 L85,60 V80 H15 V60 L0,60 L15,45 Z" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Flat ribbon shape', tags: ['ribbon', 'badge'] },
  { id: 'bi-shape-crest', title: 'Crest', category: 'badges', type: 'shape', svg: _shape('<path d="M50,5 Q75,5 85,25 V60 Q85,85 50,95 Q15,85 15,60 V25 Q25,5 50,5 Z" fill="#a23b84" stroke="#3a2b95" stroke-width="3"/>'), ariaLabel: 'Crest shape', tags: ['crest', 'emblem', 'badge'] }
]

// ─── Diagram Shapes (15) ──���

const DIAGRAM_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-venn-2', title: 'Venn Diagram 2', category: 'diagrams', type: 'shape', svg: _shape('<circle cx="38" cy="50" r="30" fill="#a23b84" opacity="0.6" stroke="#6f2fa6" stroke-width="2"/><circle cx="62" cy="50" r="30" fill="#3a2b95" opacity="0.6" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Venn diagram 2 circles', tags: ['venn', 'diagram'] },
  { id: 'bi-shape-venn-3', title: 'Venn Diagram 3', category: 'diagrams', type: 'shape', svg: _shape('<circle cx="50" cy="32" r="25" fill="#a23b84" opacity="0.5" stroke="#6f2fa6" stroke-width="2"/><circle cx="35" cy="62" r="25" fill="#3a2b95" opacity="0.5" stroke="#6f2fa6" stroke-width="2"/><circle cx="65" cy="62" r="25" fill="#6f2fa6" opacity="0.5" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Venn diagram 3 circles', tags: ['venn', 'diagram'] },
  { id: 'bi-shape-hierarchy', title: 'Hierarchy', category: 'diagrams', type: 'shape', svg: _shape('<rect x="35" y="5" width="30" height="18" rx="3" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="8" y="45" width="25" height="18" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="38" y="45" width="25" height="18" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="68" y="45" width="25" height="18" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><line x1="50" y1="23" x2="50" y2="35" stroke="#6f2fa6" stroke-width="2"/><line x1="20" y1="35" x2="80" y2="35" stroke="#6f2fa6" stroke-width="2"/><line x1="20" y1="35" x2="20" y2="45" stroke="#6f2fa6" stroke-width="2"/><line x1="50" y1="35" x2="50" y2="45" stroke="#6f2fa6" stroke-width="2"/><line x1="80" y1="35" x2="80" y2="45" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Hierarchy diagram', tags: ['hierarchy', 'org-chart', 'diagram'] },
  { id: 'bi-shape-cycle', title: 'Cycle', category: 'diagrams', type: 'shape', svg: _shape('<circle cx="50" cy="20" r="15" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="80" cy="65" r="15" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="20" cy="65" r="15" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><path d="M62,28 L72,52" stroke="#6f2fa6" stroke-width="2" fill="none"/><path d="M68,60 L35,60" stroke="#6f2fa6" stroke-width="2" fill="none"/><path d="M28,52 L38,28" stroke="#6f2fa6" stroke-width="2" fill="none"/>'), ariaLabel: 'Cycle diagram', tags: ['cycle', 'circular', 'diagram'] },
  { id: 'bi-shape-matrix', title: 'Matrix', category: 'diagrams', type: 'shape', svg: _shape('<rect x="5" y="5" width="42" height="42" rx="4" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="53" y="5" width="42" height="42" rx="4" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="5" y="53" width="42" height="42" rx="4" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><rect x="53" y="53" width="42" height="42" rx="4" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Matrix diagram', tags: ['matrix', '2x2', 'diagram'] },
  { id: 'bi-shape-process-flow', title: 'Process Flow', category: 'diagrams', type: 'shape', svg: _shape('<rect x="5" y="35" width="22" height="30" rx="3" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="39" y="35" width="22" height="30" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="73" y="35" width="22" height="30" rx="3" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><polygon points="30,50 36,44 36,56" fill="#6f2fa6"/><polygon points="64,50 70,44 70,56" fill="#6f2fa6"/>'), ariaLabel: 'Process flow diagram', tags: ['process', 'flow', 'diagram'] },
  { id: 'bi-shape-timeline-h', title: 'Horizontal Timeline', category: 'diagrams', type: 'shape', svg: _shape('<line x1="5" y1="50" x2="95" y2="50" stroke="#6f2fa6" stroke-width="3"/><circle cx="20" cy="50" r="8" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="50" r="8" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="80" cy="50" r="8" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Horizontal timeline', tags: ['timeline', 'diagram'] },
  { id: 'bi-shape-radial', title: 'Radial', category: 'diagrams', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="12" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="15" r="10" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="83" cy="35" r="10" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><circle cx="83" cy="70" r="10" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="88" r="10" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="17" cy="70" r="10" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><circle cx="17" cy="35" r="10" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><line x1="50" y1="38" x2="50" y2="25" stroke="#6f2fa6" stroke-width="1.5"/><line x1="60" y1="42" x2="73" y2="35" stroke="#6f2fa6" stroke-width="1.5"/><line x1="60" y1="58" x2="73" y2="65" stroke="#6f2fa6" stroke-width="1.5"/><line x1="50" y1="62" x2="50" y2="78" stroke="#6f2fa6" stroke-width="1.5"/><line x1="40" y1="58" x2="27" y2="65" stroke="#6f2fa6" stroke-width="1.5"/><line x1="40" y1="42" x2="27" y2="35" stroke="#6f2fa6" stroke-width="1.5"/>'), ariaLabel: 'Radial diagram', tags: ['radial', 'hub', 'diagram'] },
  { id: 'bi-shape-swot', title: 'SWOT Grid', category: 'diagrams', type: 'shape', svg: _shape('<rect x="5" y="5" width="43" height="43" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="52" y="5" width="43" height="43" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="5" y="52" width="43" height="43" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><rect x="52" y="52" width="43" height="43" fill="#a23b84" stroke="#3a2b95" stroke-width="2" opacity="0.7"/>'), ariaLabel: 'SWOT grid shape', tags: ['swot', 'quadrant', 'diagram'] },
  { id: 'bi-shape-fishbone', title: 'Fishbone', category: 'diagrams', type: 'shape', svg: _shape('<line x1="5" y1="50" x2="90" y2="50" stroke="#6f2fa6" stroke-width="3"/><polygon points="88,40 95,50 88,60" fill="#6f2fa6"/><line x1="25" y1="20" x2="35" y2="50" stroke="#a23b84" stroke-width="2"/><line x1="45" y1="20" x2="55" y2="50" stroke="#3a2b95" stroke-width="2"/><line x1="65" y1="20" x2="75" y2="50" stroke="#a23b84" stroke-width="2"/><line x1="25" y1="80" x2="35" y2="50" stroke="#3a2b95" stroke-width="2"/><line x1="45" y1="80" x2="55" y2="50" stroke="#a23b84" stroke-width="2"/><line x1="65" y1="80" x2="75" y2="50" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Fishbone diagram', tags: ['fishbone', 'cause-effect', 'diagram'] },
  { id: 'bi-shape-tree-diagram', title: 'Tree Diagram', category: 'diagrams', type: 'shape', svg: _shape('<circle cx="50" cy="15" r="10" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="25" cy="55" r="8" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="75" cy="55" r="8" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="12" cy="88" r="7" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><circle cx="38" cy="88" r="7" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><circle cx="62" cy="88" r="7" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><circle cx="88" cy="88" r="7" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><line x1="42" y1="22" x2="30" y2="48" stroke="#6f2fa6" stroke-width="2"/><line x1="58" y1="22" x2="70" y2="48" stroke="#6f2fa6" stroke-width="2"/><line x1="19" y1="61" x2="14" y2="81" stroke="#6f2fa6" stroke-width="1.5"/><line x1="31" y1="61" x2="36" y2="81" stroke="#6f2fa6" stroke-width="1.5"/><line x1="69" y1="61" x2="64" y2="81" stroke="#6f2fa6" stroke-width="1.5"/><line x1="81" y1="61" x2="86" y2="81" stroke="#6f2fa6" stroke-width="1.5"/>'), ariaLabel: 'Tree diagram', tags: ['tree', 'hierarchy', 'diagram'] },
  { id: 'bi-shape-mindmap', title: 'Mind Map', category: 'diagrams', type: 'shape', svg: _shape('<ellipse cx="50" cy="50" rx="20" ry="14" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><ellipse cx="15" cy="20" rx="12" ry="8" fill="#3a2b95" stroke="#6f2fa6" stroke-width="1.5"/><ellipse cx="85" cy="20" rx="12" ry="8" fill="#6f2fa6" stroke="#3a2b95" stroke-width="1.5"/><ellipse cx="15" cy="80" rx="12" ry="8" fill="#6f2fa6" stroke="#3a2b95" stroke-width="1.5"/><ellipse cx="85" cy="80" rx="12" ry="8" fill="#3a2b95" stroke="#6f2fa6" stroke-width="1.5"/><line x1="32" y1="42" x2="25" y2="26" stroke="#6f2fa6" stroke-width="2"/><line x1="68" y1="42" x2="75" y2="26" stroke="#6f2fa6" stroke-width="2"/><line x1="32" y1="58" x2="25" y2="74" stroke="#6f2fa6" stroke-width="2"/><line x1="68" y1="58" x2="75" y2="74" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Mind map shape', tags: ['mind-map', 'brainstorm', 'diagram'] },
  { id: 'bi-shape-comparison', title: 'Comparison', category: 'diagrams', type: 'shape', svg: _shape('<rect x="5" y="5" width="42" height="90" rx="5" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="53" y="5" width="42" height="90" rx="5" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><line x1="50" y1="15" x2="50" y2="85" stroke="#6f2fa6" stroke-width="2" stroke-dasharray="5,3"/>'), ariaLabel: 'Comparison diagram', tags: ['comparison', 'versus', 'diagram'] },
  { id: 'bi-shape-target-diagram', title: 'Target Diagram', category: 'diagrams', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="44" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><circle cx="50" cy="50" r="16" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Target diagram', tags: ['target', 'bullseye', 'diagram'] },
  { id: 'bi-shape-ladder', title: 'Ladder', category: 'diagrams', type: 'shape', svg: _shape('<rect x="10" y="70" width="80" height="18" rx="3" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="18" y="48" width="64" height="18" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="26" y="26" width="48" height="18" rx="3" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><rect x="34" y="4" width="32" height="18" rx="3" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Ladder diagram', tags: ['ladder', 'steps', 'diagram'] }
]

// ��── Container Shapes (12) ───

const CONTAINER_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-tab-box', title: 'Tab Box', category: 'containers', type: 'shape', svg: _shape('<path d="M5,25 H30 L35,8 H65 L70,25 H95 V90 H5 Z" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Tab box shape', tags: ['tab', 'container'] },
  { id: 'bi-shape-sidebar-box', title: 'Sidebar Box', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" rx="4" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><rect x="5" y="5" width="25" height="90" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Sidebar box shape', tags: ['sidebar', 'container'] },
  { id: 'bi-shape-card', title: 'Card', category: 'containers', type: 'shape', svg: _shape('<rect x="10" y="10" width="80" height="80" rx="8" fill="white" stroke="#6f2fa6" stroke-width="2"/><rect x="10" y="10" width="80" height="25" rx="8" fill="#a23b84"/>'), ariaLabel: 'Card shape', tags: ['card', 'container'] },
  { id: 'bi-shape-split-h', title: 'Split Horizontal', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="42" height="90" rx="4" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="53" y="5" width="42" height="90" rx="4" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Split horizontal shape', tags: ['split', 'container'] },
  { id: 'bi-shape-split-v', title: 'Split Vertical', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="42" rx="4" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><rect x="5" y="53" width="90" height="42" rx="4" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Split vertical shape', tags: ['split', 'container'] },
  { id: 'bi-shape-header-box', title: 'Header Box', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" rx="6" fill="white" stroke="#6f2fa6" stroke-width="2"/><line x1="5" y1="28" x2="95" y2="28" stroke="#6f2fa6" stroke-width="2"/><rect x="5" y="5" width="90" height="23" rx="6" fill="#3a2b95"/>'), ariaLabel: 'Header box shape', tags: ['header', 'container'] },
  { id: 'bi-shape-grid-2x2', title: 'Grid 2x2', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="42" height="42" rx="4" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="53" y="5" width="42" height="42" rx="4" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="5" y="53" width="42" height="42" rx="4" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="53" y="53" width="42" height="42" rx="4" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Grid 2x2 shape', tags: ['grid', '2x2', 'container'] },
  { id: 'bi-shape-thirds', title: 'Thirds', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="27" height="90" rx="3" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="36" y="5" width="28" height="90" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="68" y="5" width="27" height="90" rx="3" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Thirds layout shape', tags: ['thirds', 'columns', 'container'] },
  { id: 'bi-shape-accordion', title: 'Accordion', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="20" rx="3" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="5" y="30" width="90" height="20" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="5" y="55" width="90" height="20" rx="3" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/><rect x="5" y="80" width="90" height="15" rx="3" fill="#a23b84" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Accordion shape', tags: ['accordion', 'expandable', 'container'] },
  { id: 'bi-shape-list-box', title: 'List Box', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" rx="5" fill="white" stroke="#6f2fa6" stroke-width="2"/><line x1="15" y1="25" x2="85" y2="25" stroke="#6f2fa6" stroke-width="1.5"/><line x1="15" y1="45" x2="85" y2="45" stroke="#6f2fa6" stroke-width="1.5"/><line x1="15" y1="65" x2="85" y2="65" stroke="#6f2fa6" stroke-width="1.5"/><circle cx="20" cy="15" r="3" fill="#a23b84"/><circle cx="20" cy="35" r="3" fill="#a23b84"/><circle cx="20" cy="55" r="3" fill="#a23b84"/><circle cx="20" cy="75" r="3" fill="#a23b84"/>'), ariaLabel: 'List box shape', tags: ['list', 'container'] },
  { id: 'bi-shape-panel', title: 'Panel', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="90" rx="6" fill="white" stroke="#a23b84" stroke-width="3"/><line x1="5" y1="22" x2="95" y2="22" stroke="#a23b84" stroke-width="3"/>'), ariaLabel: 'Panel shape', tags: ['panel', 'container'] },
  { id: 'bi-shape-stepped', title: 'Stepped', category: 'containers', type: 'shape', svg: _shape('<rect x="5" y="5" width="90" height="22" rx="3" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="15" y="32" width="80" height="22" rx="3" fill="#3a2b95" stroke="#6f2fa6" stroke-width="2"/><rect x="25" y="59" width="70" height="22" rx="3" fill="#6f2fa6" stroke="#3a2b95" stroke-width="2"/>'), ariaLabel: 'Stepped shape', tags: ['stepped', 'cascade', 'container'] }
]

// ��── Progress Shapes (12) ───

const PROGRESS_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-progress-bar', title: 'Progress Bar', category: 'progress', type: 'shape', svg: _shape('<rect x="5" y="35" width="90" height="30" rx="15" fill="#3a2b95" opacity="0.3" stroke="#6f2fa6" stroke-width="2"/><rect x="5" y="35" width="60" height="30" rx="15" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Progress bar shape', tags: ['progress', 'bar'] },
  { id: 'bi-shape-meter', title: 'Meter', category: 'progress', type: 'shape', svg: _shape('<rect x="5" y="30" width="90" height="40" rx="5" fill="white" stroke="#6f2fa6" stroke-width="2"/><rect x="10" y="35" width="55" height="30" rx="3" fill="#a23b84"/>'), ariaLabel: 'Meter shape', tags: ['meter', 'gauge', 'progress'] },
  { id: 'bi-shape-thermometer-prog', title: 'Thermometer', category: 'progress', type: 'shape', svg: _shape('<rect x="40" y="5" width="20" height="70" rx="10" fill="white" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="82" r="14" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><rect x="44" y="35" width="12" height="40" rx="6" fill="#a23b84"/>'), ariaLabel: 'Thermometer progress shape', tags: ['thermometer', 'progress'] },
  { id: 'bi-shape-loading-ring', title: 'Loading Ring', category: 'progress', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="40" fill="none" stroke="#3a2b95" stroke-width="6" opacity="0.3"/><path d="M50,10 A40,40 0 0,1 90,50" fill="none" stroke="#a23b84" stroke-width="6" stroke-linecap="round"/>'), ariaLabel: 'Loading ring shape', tags: ['loading', 'spinner', 'progress'] },
  { id: 'bi-shape-steps', title: 'Steps', category: 'progress', type: 'shape', svg: _shape('<circle cx="15" cy="50" r="10" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="50" cy="50" r="10" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/><circle cx="85" cy="50" r="10" fill="#3a2b95" opacity="0.4" stroke="#6f2fa6" stroke-width="2"/><line x1="25" y1="50" x2="40" y2="50" stroke="#6f2fa6" stroke-width="3"/><line x1="60" y1="50" x2="75" y2="50" stroke="#6f2fa6" stroke-width="3" stroke-dasharray="4,3"/>'), ariaLabel: 'Steps progress shape', tags: ['steps', 'wizard', 'progress'] },
  { id: 'bi-shape-pie-progress', title: 'Pie Progress', category: 'progress', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="42" fill="#3a2b95" opacity="0.3" stroke="#6f2fa6" stroke-width="2"/><path d="M50,50 L50,8 A42,42 0 1,1 12,68 Z" fill="#a23b84" stroke="#6f2fa6" stroke-width="2"/>'), ariaLabel: 'Pie progress shape', tags: ['pie', 'progress'] },
  { id: 'bi-shape-battery', title: 'Battery', category: 'progress', type: 'shape', svg: _shape('<rect x="5" y="20" width="78" height="60" rx="5" fill="white" stroke="#6f2fa6" stroke-width="3"/><rect x="83" y="35" width="10" height="30" rx="3" fill="#6f2fa6"/><rect x="10" y="25" width="50" height="50" rx="3" fill="#a23b84"/>'), ariaLabel: 'Battery shape', tags: ['battery', 'charge', 'progress'] },
  { id: 'bi-shape-rating-stars', title: 'Rating Stars', category: 'progress', type: 'shape', svg: _shape('<polygon points="15,35 18,43 27,43 20,48 23,57 15,52 7,57 10,48 3,43 12,43" fill="#a23b84"/><polygon points="37,35 40,43 49,43 42,48 45,57 37,52 29,57 32,48 25,43 34,43" fill="#a23b84"/><polygon points="59,35 62,43 71,43 64,48 67,57 59,52 51,57 54,48 47,43 56,43" fill="#a23b84"/><polygon points="81,35 84,43 93,43 86,48 89,57 81,52 73,57 76,48 69,43 78,43" fill="#3a2b95" opacity="0.3"/>'), ariaLabel: 'Rating stars shape', tags: ['rating', 'stars', 'progress'] },
  { id: 'bi-shape-checklist', title: 'Checklist', category: 'progress', type: 'shape', svg: _shape('<rect x="10" y="10" width="80" height="80" rx="5" fill="white" stroke="#6f2fa6" stroke-width="2"/><rect x="18" y="20" width="12" height="12" rx="2" fill="#a23b84"/><path d="M20,26 L24,30 L28,22" stroke="white" stroke-width="2" fill="none"/><rect x="18" y="40" width="12" height="12" rx="2" fill="#a23b84"/><path d="M20,46 L24,50 L28,42" stroke="white" stroke-width="2" fill="none"/><rect x="18" y="60" width="12" height="12" rx="2" fill="#3a2b95" opacity="0.3"/><line x1="36" y1="26" x2="80" y2="26" stroke="#3a2b95" stroke-width="2"/><line x1="36" y1="46" x2="80" y2="46" stroke="#3a2b95" stroke-width="2"/><line x1="36" y1="66" x2="80" y2="66" stroke="#3a2b95" stroke-width="2" opacity="0.3"/>'), ariaLabel: 'Checklist shape', tags: ['checklist', 'todo', 'progress'] },
  { id: 'bi-shape-slider', title: 'Slider', category: 'progress', type: 'shape', svg: _shape('<rect x="5" y="45" width="90" height="10" rx="5" fill="#3a2b95" opacity="0.3"/><rect x="5" y="45" width="55" height="10" rx="5" fill="#a23b84"/><circle cx="60" cy="50" r="12" fill="#6f2fa6" stroke="white" stroke-width="3"/>'), ariaLabel: 'Slider shape', tags: ['slider', 'range', 'progress'] },
  { id: 'bi-shape-circular-progress', title: 'Circular Progress', category: 'progress', type: 'shape', svg: _shape('<circle cx="50" cy="50" r="38" fill="none" stroke="#3a2b95" stroke-width="8" opacity="0.3"/><path d="M50,12 A38,38 0 1,1 20,75" fill="none" stroke="#a23b84" stroke-width="8" stroke-linecap="round"/>'), ariaLabel: 'Circular progress shape', tags: ['circular', 'progress'] },
  { id: 'bi-shape-status-dots', title: 'Status Dots', category: 'progress', type: 'shape', svg: _shape('<circle cx="20" cy="50" r="12" fill="#a23b84"/><circle cx="50" cy="50" r="12" fill="#a23b84"/><circle cx="80" cy="50" r="12" fill="#3a2b95" opacity="0.3"/>'), ariaLabel: 'Status dots shape', tags: ['status', 'dots', 'progress'] }
]

// ─── Punctuation Shapes (10) ───

const PUNCTUATION_SHAPES: BuiltInAssetDef[] = [
  { id: 'bi-shape-curly-brace-l', title: 'Left Curly Brace', category: 'punctuation', type: 'shape', svg: _shape('<path d="M70,5 Q50,5 50,25 Q50,45 30,50 Q50,55 50,75 Q50,95 70,95" fill="none" stroke="#6f2fa6" stroke-width="5" stroke-linecap="round"/>'), ariaLabel: 'Left curly brace', tags: ['brace', 'punctuation'] },
  { id: 'bi-shape-curly-brace-r', title: 'Right Curly Brace', category: 'punctuation', type: 'shape', svg: _shape('<path d="M30,5 Q50,5 50,25 Q50,45 70,50 Q50,55 50,75 Q50,95 30,95" fill="none" stroke="#a23b84" stroke-width="5" stroke-linecap="round"/>'), ariaLabel: 'Right curly brace', tags: ['brace', 'punctuation'] },
  { id: 'bi-shape-bracket-l', title: 'Left Bracket', category: 'punctuation', type: 'shape', svg: _shape('<path d="M65,5 H35 V95 H65" fill="none" stroke="#3a2b95" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'), ariaLabel: 'Left bracket', tags: ['bracket', 'punctuation'] },
  { id: 'bi-shape-bracket-r', title: 'Right Bracket', category: 'punctuation', type: 'shape', svg: _shape('<path d="M35,5 H65 V95 H35" fill="none" stroke="#6f2fa6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'), ariaLabel: 'Right bracket', tags: ['bracket', 'punctuation'] },
  { id: 'bi-shape-paren-l', title: 'Left Parenthesis', category: 'punctuation', type: 'shape', svg: _shape('<path d="M65,5 Q25,50 65,95" fill="none" stroke="#a23b84" stroke-width="5" stroke-linecap="round"/>'), ariaLabel: 'Left parenthesis', tags: ['parenthesis', 'punctuation'] },
  { id: 'bi-shape-paren-r', title: 'Right Parenthesis', category: 'punctuation', type: 'shape', svg: _shape('<path d="M35,5 Q75,50 35,95" fill="none" stroke="#3a2b95" stroke-width="5" stroke-linecap="round"/>'), ariaLabel: 'Right parenthesis', tags: ['parenthesis', 'punctuation'] },
  { id: 'bi-shape-quote-open', title: 'Open Quote', category: 'punctuation', type: 'shape', svg: _shape('<path d="M15,55 Q15,25 35,25" fill="none" stroke="#6f2fa6" stroke-width="8" stroke-linecap="round"/><path d="M50,55 Q50,25 70,25" fill="none" stroke="#6f2fa6" stroke-width="8" stroke-linecap="round"/>'), ariaLabel: 'Open quote mark', tags: ['quote', 'punctuation'] },
  { id: 'bi-shape-quote-close', title: 'Close Quote', category: 'punctuation', type: 'shape', svg: _shape('<path d="M35,25 Q35,55 15,55" fill="none" stroke="#a23b84" stroke-width="8" stroke-linecap="round"/><path d="M70,25 Q70,55 50,55" fill="none" stroke="#a23b84" stroke-width="8" stroke-linecap="round"/>'), ariaLabel: 'Close quote mark', tags: ['quote', 'punctuation'] },
  { id: 'bi-shape-ampersand', title: 'Ampersand', category: 'punctuation', type: 'shape', svg: _shape('<path d="M60,85 Q30,75 30,55 Q30,40 50,40 Q65,40 65,28 Q65,15 50,15 Q35,15 25,30 L70,75" fill="none" stroke="#3a2b95" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'), ariaLabel: 'Ampersand shape', tags: ['ampersand', 'and', 'punctuation'] },
  { id: 'bi-shape-asterisk', title: 'Asterisk', category: 'punctuation', type: 'shape', svg: _shape('<line x1="50" y1="10" x2="50" y2="90" stroke="#6f2fa6" stroke-width="6" stroke-linecap="round"/><line x1="15" y1="30" x2="85" y2="70" stroke="#6f2fa6" stroke-width="6" stroke-linecap="round"/><line x1="15" y1="70" x2="85" y2="30" stroke="#6f2fa6" stroke-width="6" stroke-linecap="round"/>'), ariaLabel: 'Asterisk shape', tags: ['asterisk', 'star', 'punctuation'] }
]

// ─��─ Text Shapes — Callout Boxes (3) ───

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
  // Original icons
  ...NAV_ICONS, ...A11Y_ICONS, ...EDU_ICONS, ...PEOPLE_ICONS,
  ...TECH_ICONS, ...MEDIA_ICONS, ...FEEDBACK_ICONS,
  // Extended icons (+35)
  ...NAV_ICONS_EXT, ...A11Y_ICONS_EXT, ...EDU_ICONS_EXT, ...PEOPLE_ICONS_EXT,
  ...TECH_ICONS_EXT, ...MEDIA_ICONS_EXT, ...FEEDBACK_ICONS_EXT,
  // New icon categories (+170)
  ...COMMUNICATION_ICONS, ...WEATHER_ICONS, ...HEALTH_ICONS,
  ...SCIENCE_ICONS, ...MATH_ICONS, ...MUSIC_ICONS,
  ...FINANCE_ICONS, ...SPORTS_ICONS, ...FOOD_ICONS,
  ...TRANSPORT_ICONS, ...NATURE_ICONS, ...SOCIAL_ICONS,
  ...TOOLS_ICONS, ...SECURITY_ICONS, ...FILES_ICONS,
  ...TIME_ICONS, ...UI_ICONS,
  // Original shapes
  ...BASIC_SHAPES, ...ROUNDED_SHAPES, ...ARROW_SHAPES, ...CALLOUT_SHAPES,
  // Extended shapes (+35)
  ...BASIC_SHAPES_EXT, ...ROUNDED_SHAPES_EXT, ...ARROW_SHAPES_EXT, ...CALLOUT_SHAPES_EXT,
  // New shape categories (+166)
  ...FLOWCHART_SHAPES, ...CONNECTOR_SHAPES, ...FRAME_SHAPES,
  ...INFOGRAPHIC_SHAPES, ...DECORATIVE_SHAPES, ...BADGE_SHAPES,
  ...DIAGRAM_SHAPES, ...CONTAINER_SHAPES, ...PROGRESS_SHAPES,
  ...PUNCTUATION_SHAPES,
  // Text shapes
  ...CALLOUT_TEXT_SHAPES, ...HEADER_TEXT_SHAPES,
  ...LABEL_TEXT_SHAPES, ...PROMPT_TEXT_SHAPES
]

// ─── Category Metadata ───

export const BUILT_IN_CATEGORIES: Array<{ id: string; label: string; parentType: 'icon' | 'shape' | 'text-shape' }> = [
  // Icons — original
  { id: 'navigation', label: 'Navigation', parentType: 'icon' },
  { id: 'accessibility', label: 'Accessibility', parentType: 'icon' },
  { id: 'education', label: 'Education', parentType: 'icon' },
  { id: 'people', label: 'People', parentType: 'icon' },
  { id: 'technology', label: 'Technology', parentType: 'icon' },
  { id: 'media', label: 'Media', parentType: 'icon' },
  { id: 'feedback', label: 'Feedback', parentType: 'icon' },
  // Icons — new categories
  { id: 'communication', label: 'Communication', parentType: 'icon' },
  { id: 'weather', label: 'Weather', parentType: 'icon' },
  { id: 'health', label: 'Health', parentType: 'icon' },
  { id: 'science', label: 'Science', parentType: 'icon' },
  { id: 'math', label: 'Math', parentType: 'icon' },
  { id: 'music-audio', label: 'Music & Audio', parentType: 'icon' },
  { id: 'finance', label: 'Finance', parentType: 'icon' },
  { id: 'sports', label: 'Sports', parentType: 'icon' },
  { id: 'food', label: 'Food & Drink', parentType: 'icon' },
  { id: 'transport', label: 'Transport', parentType: 'icon' },
  { id: 'nature', label: 'Nature', parentType: 'icon' },
  { id: 'social', label: 'Social', parentType: 'icon' },
  { id: 'tools', label: 'Tools', parentType: 'icon' },
  { id: 'security', label: 'Security', parentType: 'icon' },
  { id: 'files', label: 'Files', parentType: 'icon' },
  { id: 'time', label: 'Time', parentType: 'icon' },
  { id: 'ui', label: 'UI Controls', parentType: 'icon' },
  // Shapes — original
  { id: 'basic-geometric', label: 'Basic Geometric', parentType: 'shape' },
  { id: 'rounded', label: 'Rounded', parentType: 'shape' },
  { id: 'arrows', label: 'Arrows', parentType: 'shape' },
  { id: 'callouts', label: 'Callouts', parentType: 'shape' },
  // Shapes — new categories
  { id: 'flowchart', label: 'Flowchart', parentType: 'shape' },
  { id: 'connectors', label: 'Connectors', parentType: 'shape' },
  { id: 'frames', label: 'Frames', parentType: 'shape' },
  { id: 'infographic', label: 'Infographic', parentType: 'shape' },
  { id: 'decorative', label: 'Decorative', parentType: 'shape' },
  { id: 'badges', label: 'Badges', parentType: 'shape' },
  { id: 'diagrams', label: 'Diagrams', parentType: 'shape' },
  { id: 'containers', label: 'Containers', parentType: 'shape' },
  { id: 'progress', label: 'Progress', parentType: 'shape' },
  { id: 'punctuation', label: 'Punctuation', parentType: 'shape' },
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
