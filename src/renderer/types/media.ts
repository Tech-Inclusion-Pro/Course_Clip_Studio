// ─── Media Library Types ───

export type AssetType = 'image' | 'video' | 'audio' | 'icon' | 'shape' | 'text-shape'
  | 'animated-block' | 'animation' | 'document' | 'chart' | 'diagram'

export type AssetTier = 'built-in' | 'api' | 'uploaded' | 'generated'

export type UDLPrinciple = 'representation' | 'action-expression' | 'engagement' | 'multiple'

export type WCAGStatus = 'complete' | 'incomplete' | 'flagged'

export type ProjectScope = 'project' | 'global'

export interface AssetMetadata {
  id: string
  title: string
  altText: string
  longDescription?: string
  captionFile?: string
  transcript?: string
  ariaLabel?: string
  source?: string
  license: string
  udlTag: UDLPrinciple
  wcagStatus: WCAGStatus
  contrastRatio?: number
  language: string
  tags: string[]
  dateAdded: string
  projectScope: ProjectScope
}

export interface MediaAsset {
  metadata: AssetMetadata
  type: AssetType
  tier: AssetTier
  filePath: string
  thumbnailPath?: string
  category: string
  subcategory?: string
  variants?: string[]
  mimeType: string
  fileSize?: number
}

export interface AssetManifest {
  version: string
  assets: Record<string, MediaAsset>
  lastUpdated: string
}

export interface ColorPalette {
  id: string
  name: string
  colors: PaletteColor[]
  isSystem: boolean
  createdAt: string
}

export interface PaletteColor {
  hex: string
  name: string
  contrastOnWhite: number
  contrastOnBlack: number
  meetsAA: boolean
  meetsAALarge: boolean
}

export type MediaLibraryTab = 'all' | 'built-in' | 'search-online' | 'my-uploads' | 'generated'

export interface MediaLibraryFilters {
  search: string
  assetType: AssetType | 'all'
  tier: AssetTier | 'all'
  wcagStatus: WCAGStatus | 'all'
  udlTag: UDLPrinciple | 'all'
  category: string | 'all'
}
