import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, ShadingType, BorderStyle,
  LevelFormat, convertInchesToTwip
} from 'docx'
import { CONTENT_AREAS, GRADE_LEVELS, BLOOMS_LEVELS, ASSIGNMENT_TYPES, RUBRIC_TYPES } from '@/lib/syllabus-constants'
import type { Syllabus, SyllabusRubric } from '@/types/syllabus'

const FONT = 'Arial'
const PAGE_WIDTH = 12240 // US Letter in DXA (twips)
const MARGIN = convertInchesToTwip(1) // 1 inch

function text(content: string, opts?: { bold?: boolean; size?: number; color?: string }): TextRun {
  return new TextRun({
    text: content,
    font: FONT,
    size: (opts?.size ?? 12) * 2, // half-points
    bold: opts?.bold,
    color: opts?.color
  })
}

function heading(content: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({
    heading: level,
    children: [text(content, { bold: true, size: level === HeadingLevel.HEADING_1 ? 24 : level === HeadingLevel.HEADING_2 ? 18 : 14 })]
  })
}

function bodyParagraph(content: string, opts?: { bold?: boolean; indent?: number }): Paragraph {
  return new Paragraph({
    children: [text(content, { bold: opts?.bold })],
    indent: opts?.indent ? { left: convertInchesToTwip(opts.indent) } : undefined
  })
}

function emptyLine(): Paragraph {
  return new Paragraph({ children: [] })
}

function buildAnalyticTable(rubric: SyllabusRubric): Table {
  const colCount = rubric.columns.length + 1
  const colWidth = Math.floor((PAGE_WIDTH - MARGIN * 2) / colCount)

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: 'D9D9D9' },
        children: [new Paragraph({ children: [text('Criteria', { bold: true, size: 10 })] })]
      }),
      ...rubric.columns.map((col) =>
        new TableCell({
          width: { size: colWidth, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'D9D9D9' },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [text(`${col.label} (${col.points}pt)`, { bold: true, size: 10 })]
          })]
        })
      )
    ]
  })

  const bodyRows = rubric.rows.map((row) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: colWidth, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
          children: [new Paragraph({ children: [text(row.label, { bold: true, size: 10 })] })]
        }),
        ...rubric.columns.map((col) =>
          new TableCell({
            width: { size: colWidth, type: WidthType.DXA },
            children: [new Paragraph({ children: [text(rubric.cells[`${row.id}:${col.id}`] || '', { size: 9 })] })]
          })
        )
      ]
    })
  )

  return new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE }
  })
}

export async function exportSyllabusDocx(syllabus: Syllabus): Promise<Blob> {
  const contentAreaLabels = syllabus.contentAreas
    .map((id) => CONTENT_AREAS.find((a) => a.id === id)?.label ?? id)
    .concat(syllabus.customContentAreas)

  const gradeLabel = GRADE_LEVELS.find((g) => g.id === syllabus.audience.level)?.label ?? syllabus.audience.level

  const children: Paragraph[] = []

  // Title
  children.push(heading(syllabus.name || 'Untitled Syllabus', HeadingLevel.HEADING_1))

  if (contentAreaLabels.length > 0) {
    children.push(bodyParagraph(`Content Areas: ${contentAreaLabels.join(', ')}`))
  }
  children.push(emptyLine())

  // Course Goal
  if (syllabus.courseGoal) {
    children.push(heading('Course Goal', HeadingLevel.HEADING_2))
    children.push(bodyParagraph(syllabus.courseGoal))
    children.push(emptyLine())
  }

  // Audience
  children.push(heading('Audience', HeadingLevel.HEADING_2))
  children.push(bodyParagraph(`Level: ${gradeLabel || 'Not specified'}`))
  if (syllabus.audience.context) {
    children.push(bodyParagraph(syllabus.audience.context))
  }
  children.push(emptyLine())

  // Learning Objectives
  if (syllabus.objectives.length > 0) {
    children.push(heading('Learning Objectives', HeadingLevel.HEADING_2))
    syllabus.objectives.forEach((obj, i) => {
      const bloom = BLOOMS_LEVELS.find((b) => b.id === obj.bloomsLevel)
      children.push(bodyParagraph(`${i + 1}. ${obj.text}${bloom ? ` [${bloom.label}]` : ''}`))
      if (obj.rationale) {
        children.push(bodyParagraph(`   Rationale: ${obj.rationale}`, { indent: 0.25 }))
      }
    })
    children.push(emptyLine())
  }

  // Assignments
  if (syllabus.assignments.length > 0) {
    children.push(heading('Assignments', HeadingLevel.HEADING_2))
    syllabus.assignments.forEach((asn, i) => {
      const typeLabel = ASSIGNMENT_TYPES.find((t) => t.id === asn.type)?.label ?? asn.type
      children.push(heading(`${i + 1}. ${asn.title || 'Untitled'}`, HeadingLevel.HEADING_3))
      children.push(bodyParagraph(`Type: ${typeLabel}`))
      if (asn.description) {
        children.push(bodyParagraph(asn.description))
      }

      const linkedObjs = syllabus.objectives.filter((o) => asn.linkedObjectiveIds.includes(o.id))
      if (linkedObjs.length > 0) {
        children.push(bodyParagraph(
          `Linked Objectives: ${linkedObjs.map((o) => `#${syllabus.objectives.indexOf(o) + 1}`).join(', ')}`
        ))
      }

      if (asn.udl.representation || asn.udl.actionExpression || asn.udl.engagement) {
        children.push(bodyParagraph('UDL Accommodations:', { bold: true }))
        if (asn.udl.representation) children.push(bodyParagraph(`  Representation: ${asn.udl.representation}`, { indent: 0.25 }))
        if (asn.udl.actionExpression) children.push(bodyParagraph(`  Action & Expression: ${asn.udl.actionExpression}`, { indent: 0.25 }))
        if (asn.udl.engagement) children.push(bodyParagraph(`  Engagement: ${asn.udl.engagement}`, { indent: 0.25 }))
      }
      children.push(emptyLine())
    })
  }

  // Rubrics
  const rubricParagraphs: (Paragraph | Table)[] = []
  if (syllabus.rubrics.length > 0) {
    rubricParagraphs.push(heading('Rubrics', HeadingLevel.HEADING_2))
    for (const rubric of syllabus.rubrics) {
      const assignment = syllabus.assignments.find((a) => a.id === rubric.assignmentId)
      const typeLabel = RUBRIC_TYPES.find((t) => t.id === rubric.type)?.label ?? rubric.type
      rubricParagraphs.push(heading(
        `${assignment?.title || 'Untitled'} - ${typeLabel} Rubric`,
        HeadingLevel.HEADING_3
      ))

      if (rubric.type === 'analytic') {
        rubricParagraphs.push(buildAnalyticTable(rubric))
      } else if (rubric.type === 'holistic') {
        for (const row of rubric.rows) {
          rubricParagraphs.push(bodyParagraph(`${row.label}: ${rubric.cells[`${row.id}:holistic`] || ''}`, { bold: false }))
        }
      } else if (rubric.type === 'single-point') {
        for (const row of rubric.rows) {
          rubricParagraphs.push(bodyParagraph(row.label, { bold: true }))
          rubricParagraphs.push(bodyParagraph(`  Growth: ${rubric.cells[`${row.id}:growth`] || ''}`, { indent: 0.25 }))
          rubricParagraphs.push(bodyParagraph(`  Proficient: ${rubric.cells[`${row.id}:proficient`] || ''}`, { indent: 0.25 }))
          rubricParagraphs.push(bodyParagraph(`  Strengths: ${rubric.cells[`${row.id}:strengths`] || ''}`, { indent: 0.25 }))
        }
      } else if (rubric.type === 'checklist') {
        for (const row of rubric.rows) {
          rubricParagraphs.push(bodyParagraph(`[ ] ${row.label}`))
        }
      }
      rubricParagraphs.push(emptyLine())
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
        }
      },
      children: [...children, ...rubricParagraphs]
    }]
  })

  return await Packer.toBlob(doc)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
