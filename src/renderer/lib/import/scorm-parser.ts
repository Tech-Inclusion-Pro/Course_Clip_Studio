import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import { htmlToBlocks } from './html-to-blocks'
import type { ImportResult, ParsedModule, ParsedLesson } from './types'

interface ManifestItem {
  title?: string
  item?: ManifestItem | ManifestItem[]
  '@_identifier': string
  '@_identifierref'?: string
}

interface ManifestResource {
  '@_identifier': string
  '@_href'?: string
  '@_type'?: string
}

/**
 * Parse a SCORM ZIP package and extract course structure.
 */
export async function parseScormPackage(data: ArrayBuffer): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(data)
  const warnings: string[] = []

  // Find imsmanifest.xml
  const manifestFile = zip.file('imsmanifest.xml')
  if (!manifestFile) {
    throw new Error('No imsmanifest.xml found in SCORM package')
  }

  const manifestXml = await manifestFile.async('string')
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  })
  const manifest = parser.parse(manifestXml)

  // Extract organizations
  const manifestRoot = manifest.manifest || manifest
  const organizations = manifestRoot.organizations
  const resources = manifestRoot.resources?.resource

  // Build resource map
  const resourceMap = new Map<string, ManifestResource>()
  const resourceList = Array.isArray(resources) ? resources : resources ? [resources] : []
  for (const res of resourceList) {
    resourceMap.set(res['@_identifier'], res)
  }

  // Parse organization structure
  const org = organizations?.organization
  const orgObj = Array.isArray(org) ? org[0] : org

  const modules: ParsedModule[] = []
  let totalBlocks = 0
  let totalLessons = 0

  if (orgObj) {
    const items = normalizeItems(orgObj.item)

    for (const item of items) {
      const subItems = normalizeItems(item.item)

      if (subItems.length > 0) {
        // This is a module with sub-items (lessons)
        const lessons: ParsedLesson[] = []
        for (const subItem of subItems) {
          const lesson = await parseItemAsLesson(subItem, resourceMap, zip, warnings)
          lessons.push(lesson)
          totalBlocks += lesson.blocks.length
          totalLessons++
        }
        modules.push({
          title: item.title || `Module ${modules.length + 1}`,
          description: '',
          lessons
        })
      } else {
        // This is a flat item (single lesson)
        const lesson = await parseItemAsLesson(item, resourceMap, zip, warnings)
        if (modules.length === 0) {
          modules.push({ title: 'Imported Content', description: '', lessons: [] })
        }
        modules[modules.length - 1].lessons.push(lesson)
        totalBlocks += lesson.blocks.length
        totalLessons++
      }
    }
  }

  // Ensure at least one module
  if (modules.length === 0) {
    modules.push({
      title: 'Imported Content',
      description: '',
      lessons: [{ title: 'Imported Lesson', blocks: [] }]
    })
    totalLessons = 1
  }

  const suggestedTitle = orgObj?.title || manifestRoot['@_identifier'] || 'Imported SCORM Course'

  return {
    format: 'scorm',
    suggestedTitle: typeof suggestedTitle === 'string' ? suggestedTitle : 'Imported SCORM Course',
    modules,
    warnings,
    totalBlocks,
    totalLessons
  }
}

function normalizeItems(item: ManifestItem | ManifestItem[] | undefined): ManifestItem[] {
  if (!item) return []
  return Array.isArray(item) ? item : [item]
}

async function parseItemAsLesson(
  item: ManifestItem,
  resourceMap: Map<string, ManifestResource>,
  zip: JSZip,
  warnings: string[]
): Promise<ParsedLesson> {
  const title = item.title || item['@_identifier'] || 'Untitled'
  const resRef = item['@_identifierref']

  if (!resRef) {
    return { title: typeof title === 'string' ? title : 'Untitled', blocks: [] }
  }

  const resource = resourceMap.get(resRef)
  if (!resource || !resource['@_href']) {
    warnings.push(`Resource not found for item: ${title}`)
    return { title: typeof title === 'string' ? title : 'Untitled', blocks: [] }
  }

  const href = resource['@_href']
  const file = zip.file(href)
  if (!file) {
    warnings.push(`File not found in package: ${href}`)
    return { title: typeof title === 'string' ? title : 'Untitled', blocks: [] }
  }

  try {
    const html = await file.async('string')
    const blocks = htmlToBlocks(html)
    return { title: typeof title === 'string' ? title : 'Untitled', blocks }
  } catch (err) {
    warnings.push(`Failed to parse ${href}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    return { title: typeof title === 'string' ? title : 'Untitled', blocks: [] }
  }
}
