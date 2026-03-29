/**
 * SCORM 1.2 imsmanifest.xml generator.
 * Generates a valid SCORM 1.2 manifest from course data.
 */

import type { Course, SCORMConfig } from '@/types/course'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export interface ManifestOptions {
  courseId: string
  title: string
  description: string
  version: string
  author: string
  scormConfig: SCORMConfig
  resources: ManifestResource[]
}

export interface ManifestResource {
  identifier: string
  href: string
  type: 'sco' | 'asset'
  title: string
  files: string[]
}

/**
 * Generate a SCORM 1.2 imsmanifest.xml string.
 */
export function generateManifest(course: Course, resources: ManifestResource[]): string {
  const scorm = course.settings.scorm ?? {
    version: '1.2' as const,
    completionCriteria: 'complete' as const,
    masteryScore: 70,
    lessonMode: 'normal' as const
  }

  const orgId = `org-${course.id}`
  const manifestId = `manifest-${course.id}`

  // Build organization items (one per module, with lesson sub-items)
  const orgItems = course.modules.map((mod, modIdx) => {
    const modIdentifier = `item-mod-${modIdx}`
    const lessonItems = mod.lessons.map((lesson, lesIdx) => {
      const lesIdentifier = `item-les-${modIdx}-${lesIdx}`
      const resourceRef = `res-${modIdx}-${lesIdx}`
      return `        <item identifier="${lesIdentifier}" identifierref="${resourceRef}">
          <title>${escapeXml(lesson.title)}</title>
          <adlcp:masteryscore>${scorm.masteryScore}</adlcp:masteryscore>
        </item>`
    }).join('\n')

    return `      <item identifier="${modIdentifier}">
        <title>${escapeXml(mod.title)}</title>
${lessonItems}
      </item>`
  }).join('\n')

  // Build resources (one SCO per lesson)
  const resourceEntries = resources.map((res) => {
    const files = res.files.map((f) => `        <file href="${escapeXml(f)}" />`).join('\n')
    return `      <resource identifier="${res.identifier}" type="webcontent" adlcp:scormtype="${res.type === 'sco' ? 'sco' : 'asset'}" href="${escapeXml(res.href)}">
${files}
      </resource>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}"
  version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
    http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="${orgId}">
    <organization identifier="${orgId}">
      <title>${escapeXml(course.meta.title)}</title>
${orgItems}
    </organization>
  </organizations>

  <resources>
${resourceEntries}
  </resources>

</manifest>`
}
