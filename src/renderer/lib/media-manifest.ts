/**
 * Media asset manifest read/write helpers.
 * Uses the existing electronAPI.fs for all file operations.
 */

import type { AssetManifest, MediaAsset } from '@/types/media'
import { courseFolderName } from './workspace'
import type { Course } from '@/types/course'

const MANIFEST_VERSION = '1.0.0'

function emptyManifest(): AssetManifest {
  return {
    version: MANIFEST_VERSION,
    assets: {},
    lastUpdated: new Date().toISOString()
  }
}

// ─── Project Manifest ───

export async function loadProjectManifest(
  workspacePath: string,
  course: Course
): Promise<AssetManifest> {
  const folder = courseFolderName(course)
  const path = `${workspacePath}/${folder}/asset-manifest.json`
  try {
    const exists = await window.electronAPI.fs.exists(path)
    if (!exists) return emptyManifest()
    const raw = await window.electronAPI.fs.readFile(path, 'utf-8')
    return JSON.parse(raw) as AssetManifest
  } catch {
    return emptyManifest()
  }
}

export async function saveProjectManifest(
  workspacePath: string,
  course: Course,
  manifest: AssetManifest
): Promise<void> {
  const folder = courseFolderName(course)
  const path = `${workspacePath}/${folder}/asset-manifest.json`
  manifest.lastUpdated = new Date().toISOString()
  await window.electronAPI.fs.writeFile(path, JSON.stringify(manifest, null, 2))
}

// ─── Global Manifest ───

function globalManifestPath(): string {
  // Store in user home directory
  const home = typeof process !== 'undefined' ? process.env.HOME ?? '' : ''
  return `${home}/lumina-global/global-manifest.json`
}

export async function loadGlobalManifest(): Promise<AssetManifest> {
  const path = globalManifestPath()
  try {
    const exists = await window.electronAPI.fs.exists(path)
    if (!exists) return emptyManifest()
    const raw = await window.electronAPI.fs.readFile(path, 'utf-8')
    return JSON.parse(raw) as AssetManifest
  } catch {
    return emptyManifest()
  }
}

export async function saveGlobalManifest(manifest: AssetManifest): Promise<void> {
  const path = globalManifestPath()
  const dir = path.replace('/global-manifest.json', '')
  const exists = await window.electronAPI.fs.exists(dir)
  if (!exists) {
    await window.electronAPI.fs.mkdir(dir)
  }
  manifest.lastUpdated = new Date().toISOString()
  await window.electronAPI.fs.writeFile(path, JSON.stringify(manifest, null, 2))
}

// ─── Directory Helpers ───

const ASSET_SUBDIRS = ['images', 'video', 'audio', 'documents', 'generated', 'captions']

export async function ensureAssetDirectories(
  workspacePath: string,
  course: Course
): Promise<void> {
  const folder = courseFolderName(course)
  const assetsRoot = `${workspacePath}/${folder}/assets`

  const rootExists = await window.electronAPI.fs.exists(assetsRoot)
  if (!rootExists) {
    await window.electronAPI.fs.mkdir(assetsRoot)
  }

  for (const sub of ASSET_SUBDIRS) {
    const subPath = `${assetsRoot}/${sub}`
    const subExists = await window.electronAPI.fs.exists(subPath)
    if (!subExists) {
      await window.electronAPI.fs.mkdir(subPath)
    }
  }
}

// ─── Manifest CRUD ───

export function addAssetToManifest(manifest: AssetManifest, asset: MediaAsset): AssetManifest {
  return {
    ...manifest,
    assets: { ...manifest.assets, [asset.metadata.id]: asset },
    lastUpdated: new Date().toISOString()
  }
}

export function removeAssetFromManifest(manifest: AssetManifest, assetId: string): AssetManifest {
  const { [assetId]: _, ...rest } = manifest.assets
  return {
    ...manifest,
    assets: rest,
    lastUpdated: new Date().toISOString()
  }
}

export function updateAssetInManifest(
  manifest: AssetManifest,
  assetId: string,
  updates: Partial<MediaAsset>
): AssetManifest {
  const existing = manifest.assets[assetId]
  if (!existing) return manifest
  return {
    ...manifest,
    assets: {
      ...manifest.assets,
      [assetId]: { ...existing, ...updates }
    },
    lastUpdated: new Date().toISOString()
  }
}
