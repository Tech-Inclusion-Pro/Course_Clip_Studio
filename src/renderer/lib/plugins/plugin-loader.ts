import { pluginRegistry } from './plugin-registry'
import type { PluginManifest } from './types'

/**
 * Load plugins from a workspace plugins directory.
 * Each plugin folder should have a manifest.json file.
 */
export async function loadPlugins(pluginsPath: string): Promise<{ loaded: string[]; errors: string[] }> {
  const loaded: string[] = []
  const errors: string[] = []

  try {
    const exists = await window.electronAPI.fs.exists(pluginsPath)
    if (!exists) return { loaded, errors }

    const entries = await window.electronAPI.fs.readDir(pluginsPath)
    for (const entry of entries) {
      if (!entry.isDirectory) continue

      const manifestPath = `${pluginsPath}/${entry.name}/manifest.json`
      try {
        const manifestExists = await window.electronAPI.fs.exists(manifestPath)
        if (!manifestExists) continue

        const json = await window.electronAPI.fs.readFile(manifestPath, 'utf-8')
        const manifest = JSON.parse(json) as PluginManifest

        if (!manifest.id || !manifest.name || !manifest.blockTypes) {
          errors.push(`${entry.name}: Invalid manifest (missing id, name, or blockTypes)`)
          continue
        }

        pluginRegistry.registerPlugin(manifest)
        loaded.push(manifest.name)
      } catch (err) {
        errors.push(`${entry.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  } catch (err) {
    errors.push(`Failed to read plugins directory: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }

  return { loaded, errors }
}
