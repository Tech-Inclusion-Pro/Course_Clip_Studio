/**
 * SCORM 2004 imsmanifest.xml generator.
 * Generates a valid SCORM 2004 manifest (2nd, 3rd, or 4th edition).
 */

import type { Course, SCORMConfig } from '@/types/course'
import type { ManifestResource } from './manifest-generator'

type Scorm2004Edition = '2004-2nd' | '2004-3rd' | '2004-4th'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getSchemaVersion(edition: Scorm2004Edition): string {
  switch (edition) {
    case '2004-2nd': return '2004 2nd Edition'
    case '2004-3rd': return '2004 3rd Edition'
    case '2004-4th': return '2004 4th Edition'
    default: return '2004 3rd Edition'
  }
}

/**
 * Generate a SCORM 2004 imsmanifest.xml string.
 */
export function generateScorm2004Manifest(course: Course, resources: ManifestResource[]): string {
  const scorm: SCORMConfig = course.settings.scorm ?? {
    version: '2004-3rd',
    completionCriteria: 'complete',
    masteryScore: 70,
    lessonMode: 'normal'
  }

  const edition = (scorm.version as Scorm2004Edition) || '2004-3rd'
  const schemaVersion = getSchemaVersion(edition)
  const orgId = `org-${course.id}`
  const manifestId = `manifest-${course.id}`
  const scaledMastery = (scorm.masteryScore / 100).toFixed(2)

  // Build organization items
  const orgItems = course.modules.map((mod, modIdx) => {
    const modIdentifier = `item-mod-${modIdx}`
    const lessonItems = mod.lessons.map((_lesson, lesIdx) => {
      const lesIdentifier = `item-les-${modIdx}-${lesIdx}`
      const resourceRef = `res-${modIdx}-${lesIdx}`
      return `          <item identifier="${lesIdentifier}" identifierref="${resourceRef}">
            <title>${escapeXml(_lesson.title)}</title>
            <imsss:sequencing>
              <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true" />
            </imsss:sequencing>
          </item>`
    }).join('\n')

    return `        <item identifier="${modIdentifier}">
          <title>${escapeXml(mod.title)}</title>
          <imsss:sequencing>
            <imsss:controlMode choice="true" flow="true" />
          </imsss:sequencing>
${lessonItems}
        </item>`
  }).join('\n')

  // Build resources
  const resourceEntries = resources.map((res) => {
    const files = res.files.map((f) => `          <file href="${escapeXml(f)}" />`).join('\n')
    return `      <resource identifier="${res.identifier}" type="webcontent" adlcp:scormType="${res.type === 'sco' ? 'sco' : 'asset'}" href="${escapeXml(res.href)}">
${files}
      </resource>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}"
  version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
    http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
    http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
    http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
    http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${schemaVersion}</schemaversion>
  </metadata>

  <organizations default="${orgId}">
    <organization identifier="${orgId}">
      <title>${escapeXml(course.meta.title)}</title>
${orgItems}
      <imsss:sequencing>
        <imsss:controlMode choice="true" flow="true" forwardOnly="false" />
        <imsss:objectives>
          <imsss:primaryObjective objectiveID="primary-obj" satisfiedByMeasure="true">
            <imsss:minNormalizedMeasure>${scaledMastery}</imsss:minNormalizedMeasure>
          </imsss:primaryObjective>
        </imsss:objectives>
      </imsss:sequencing>
    </organization>
  </organizations>

  <resources>
${resourceEntries}
  </resources>

</manifest>`
}
