export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  blockTypes: PluginBlockDefinition[]
}

export interface PluginBlockDefinition {
  type: string
  label: string
  icon: string
  defaultData: Record<string, unknown>
  editorComponent?: string
  previewComponent?: string
}
