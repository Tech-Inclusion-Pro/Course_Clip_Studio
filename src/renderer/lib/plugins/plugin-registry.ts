import type { PluginManifest, PluginBlockDefinition } from './types'

class PluginRegistry {
  private manifests: Map<string, PluginManifest> = new Map()
  private blocks: Map<string, PluginBlockDefinition & { pluginId: string }> = new Map()

  registerPlugin(manifest: PluginManifest): void {
    this.manifests.set(manifest.id, manifest)
    for (const block of manifest.blockTypes) {
      this.blocks.set(block.type, { ...block, pluginId: manifest.id })
    }
  }

  unregisterPlugin(pluginId: string): void {
    const manifest = this.manifests.get(pluginId)
    if (manifest) {
      for (const block of manifest.blockTypes) {
        this.blocks.delete(block.type)
      }
      this.manifests.delete(pluginId)
    }
  }

  getCustomBlocks(): Array<PluginBlockDefinition & { pluginId: string }> {
    return Array.from(this.blocks.values())
  }

  getBlock(type: string): (PluginBlockDefinition & { pluginId: string }) | undefined {
    return this.blocks.get(type)
  }

  getPlugins(): PluginManifest[] {
    return Array.from(this.manifests.values())
  }

  clear(): void {
    this.manifests.clear()
    this.blocks.clear()
  }
}

export const pluginRegistry = new PluginRegistry()
