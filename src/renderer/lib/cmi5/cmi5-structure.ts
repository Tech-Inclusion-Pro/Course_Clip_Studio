/**
 * Generates the cmi5.xml course structure file from a LuminaUDL course.
 * The course structure defines the AU (Assignable Unit) hierarchy.
 */

import type { Course, Module, Lesson } from '@/types/course'
import type { Cmi5CourseStructure, Cmi5BlockDefinition, Cmi5AUDefinition, Cmi5ExportOptions } from '@/types/analytics'

/**
 * Build the cmi5 course structure from a LuminaUDL course.
 */
export function buildCmi5Structure(
  course: Course,
  options: Cmi5ExportOptions
): Cmi5CourseStructure {
  const blocks: Cmi5BlockDefinition[] = course.modules.map((mod) =>
    moduleToBlock(mod, course.id, options)
  )

  return {
    courseId: course.id,
    courseTitle: course.meta.title,
    courseDescription: course.meta.description,
    publisher: course.meta.author,
    version: course.meta.version,
    blocks
  }
}

function moduleToBlock(
  mod: Module,
  courseId: string,
  options: Cmi5ExportOptions
): Cmi5BlockDefinition {
  return {
    id: mod.id,
    title: mod.title,
    description: mod.description,
    children: mod.lessons.map((lesson) => lessonToBlock(lesson, courseId, mod.id, options))
  }
}

function lessonToBlock(
  lesson: Lesson,
  courseId: string,
  moduleId: string,
  options: Cmi5ExportOptions
): Cmi5BlockDefinition {
  const auUrl = `index.html#/lesson/${lesson.id}`

  const au: Cmi5AUDefinition = {
    id: `${courseId}-${moduleId}-${lesson.id}`,
    title: lesson.title,
    description: `Lesson: ${lesson.title}`,
    url: auUrl,
    launchMethod: options.launchMethod,
    moveOn: options.moveOnCriteria,
    masteryScore: options.masteryScore > 0 ? options.masteryScore / 100 : undefined
  }

  // Extract objectives from knowledge check blocks
  const objectives: { id: string; title: string }[] = []
  for (const block of lesson.blocks) {
    if (block.type === 'knowledge-check') {
      for (const obj of block.objectives) {
        if (!objectives.find((o) => o.id === obj)) {
          objectives.push({ id: obj, title: obj })
        }
      }
    }
  }

  return {
    id: lesson.id,
    title: lesson.title,
    description: `Lesson content for ${lesson.title}`,
    objectives: objectives.length > 0 ? objectives : undefined,
    au
  }
}

/**
 * Generate the cmi5.xml content from the course structure.
 */
export function generateCmi5XML(structure: Cmi5CourseStructure): string {
  const lines: string[] = []
  lines.push('<?xml version="1.0" encoding="utf-8"?>')
  lines.push('<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">')
  lines.push(`  <course id="${esc(structure.courseId)}">`)
  lines.push(`    <title><langstring lang="en-US">${esc(structure.courseTitle)}</langstring></title>`)
  lines.push(`    <description><langstring lang="en-US">${esc(structure.courseDescription)}</langstring></description>`)
  lines.push(`  </course>`)

  for (const block of structure.blocks) {
    renderBlock(block, lines, 1)
  }

  lines.push('</courseStructure>')
  return lines.join('\n')
}

function renderBlock(block: Cmi5BlockDefinition, lines: string[], depth: number): void {
  const indent = '  '.repeat(depth)

  if (block.au) {
    // Assignable Unit
    lines.push(`${indent}<au id="${esc(block.au.id)}">`)
    lines.push(`${indent}  <title><langstring lang="en-US">${esc(block.au.title)}</langstring></title>`)
    lines.push(`${indent}  <description><langstring lang="en-US">${esc(block.au.description)}</langstring></description>`)
    lines.push(`${indent}  <url>${esc(block.au.url)}</url>`)
    lines.push(`${indent}  <launchMethod>${block.au.launchMethod}</launchMethod>`)
    lines.push(`${indent}  <moveOn>${block.au.moveOn}</moveOn>`)
    if (block.au.masteryScore != null) {
      lines.push(`${indent}  <masteryScore>${block.au.masteryScore}</masteryScore>`)
    }

    // Objectives
    if (block.objectives && block.objectives.length > 0) {
      lines.push(`${indent}  <objectives>`)
      for (const obj of block.objectives) {
        lines.push(`${indent}    <objective id="${esc(obj.id)}">`)
        lines.push(`${indent}      <title><langstring lang="en-US">${esc(obj.title)}</langstring></title>`)
        lines.push(`${indent}    </objective>`)
      }
      lines.push(`${indent}  </objectives>`)
    }

    lines.push(`${indent}</au>`)
  } else {
    // Block (container)
    lines.push(`${indent}<block id="${esc(block.id)}">`)
    lines.push(`${indent}  <title><langstring lang="en-US">${esc(block.title)}</langstring></title>`)
    lines.push(`${indent}  <description><langstring lang="en-US">${esc(block.description)}</langstring></description>`)

    if (block.children) {
      for (const child of block.children) {
        renderBlock(child, lines, depth + 1)
      }
    }

    lines.push(`${indent}</block>`)
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
