import type {
  Course,
  Module,
  Lesson,
  ContentBlock,
  UDLChecklist
} from '@/types/course'

// ─── Tree Traversal ───

/** Find a module by ID within a course. */
export function findModule(course: Course, moduleId: string): Module | undefined {
  return course.modules.find((m) => m.id === moduleId)
}

/** Find a lesson by ID within a course. Returns the lesson and its parent module. */
export function findLesson(
  course: Course,
  lessonId: string
): { lesson: Lesson; module: Module } | undefined {
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId)
    if (lesson) return { lesson, module: mod }
  }
  return undefined
}

/** Find a block by ID within a course. Returns block, parent lesson, and parent module. */
export function findBlock(
  course: Course,
  blockId: string
): { block: ContentBlock; lesson: Lesson; module: Module } | undefined {
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const block = lesson.blocks.find((b) => b.id === blockId)
      if (block) return { block, lesson, module: mod }
    }
  }
  return undefined
}

/** Get all lessons in a course, flattened. */
export function getAllLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons)
}

/** Get all blocks in a course, flattened. */
export function getAllBlocks(course: Course): ContentBlock[] {
  return course.modules.flatMap((m) => m.lessons.flatMap((l) => l.blocks))
}

/** Count total lessons across all modules. */
export function countLessons(course: Course): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
}

/** Count total blocks across all modules and lessons. */
export function countBlocks(course: Course): number {
  return course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.blocks.length, 0),
    0
  )
}

// ─── Array Reordering ───

/** Move an item in an array from one index to another. Returns a new array. */
export function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...list]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  return result
}

// ─── UDL Scoring ───

/** Count how many items are checked in a UDL checklist (out of 12 total). */
export function udlChecklistScore(checklist: UDLChecklist): { checked: number; total: number } {
  const rep = checklist.representation
  const act = checklist.action
  const eng = checklist.engagement

  const items = [
    rep.multipleFormats,
    rep.altTextPresent,
    rep.transcriptsPresent,
    rep.captionsPresent,
    rep.readingLevelAppropriate,
    act.keyboardNavigable,
    act.multipleResponseModes,
    act.sufficientTime,
    eng.choiceAndAutonomy,
    eng.relevantContext,
    eng.feedbackPresent,
    eng.progressVisible
  ]

  return {
    checked: items.filter(Boolean).length,
    total: items.length
  }
}

/** Get a UDL status color based on completion fraction. */
export function udlStatusColor(checklist: UDLChecklist): 'red' | 'yellow' | 'green' {
  const { checked, total } = udlChecklistScore(checklist)
  const ratio = checked / total
  if (ratio >= 0.75) return 'green'
  if (ratio >= 0.4) return 'yellow'
  return 'red'
}

/** Compute per-pillar UDL completion percentages. */
export function udlPillarScores(checklist: UDLChecklist): {
  representation: number
  action: number
  engagement: number
} {
  const rep = checklist.representation
  const repItems = [rep.multipleFormats, rep.altTextPresent, rep.transcriptsPresent, rep.captionsPresent, rep.readingLevelAppropriate]
  const act = checklist.action
  const actItems = [act.keyboardNavigable, act.multipleResponseModes, act.sufficientTime]
  const eng = checklist.engagement
  const engItems = [eng.choiceAndAutonomy, eng.relevantContext, eng.feedbackPresent, eng.progressVisible]

  return {
    representation: Math.round((repItems.filter(Boolean).length / repItems.length) * 100),
    action: Math.round((actItems.filter(Boolean).length / actItems.length) * 100),
    engagement: Math.round((engItems.filter(Boolean).length / engItems.length) * 100)
  }
}

// ─── Accessibility Helpers ───

/** Check if a course has any blocks missing required alt text. */
export function findMissingAltText(course: Course): Array<{ block: ContentBlock; lessonTitle: string }> {
  const issues: Array<{ block: ContentBlock; lessonTitle: string }> = []
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if (block.type === 'media' && !block.altText) {
          issues.push({ block, lessonTitle: lesson.title })
        }
      }
    }
  }
  return issues
}

/** Check if a course has any video/audio blocks missing transcripts. */
export function findMissingTranscripts(course: Course): Array<{ block: ContentBlock; lessonTitle: string }> {
  const issues: Array<{ block: ContentBlock; lessonTitle: string }> = []
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if ((block.type === 'video' || block.type === 'audio') && !block.transcript) {
          issues.push({ block, lessonTitle: lesson.title })
        }
      }
    }
  }
  return issues
}

// ─── Serialization ───

/** Serialize a course to a JSON string (for snapshots or file save). */
export function serializeCourse(course: Course): string {
  return JSON.stringify(course)
}

/** Deserialize a JSON string back to a Course object. */
export function deserializeCourse(json: string): Course {
  return JSON.parse(json) as Course
}

/** Compute estimated course duration from module/lesson counts (rough heuristic). */
export function estimateDuration(course: Course): number {
  // Simple heuristic: 5 min per lesson + 2 min per block
  let minutes = 0
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      minutes += 5
      for (const block of lesson.blocks) {
        if (block.type === 'quiz') minutes += 5
        else if (block.type === 'video') minutes += 8
        else if (block.type === 'audio') minutes += 4
        else minutes += 2
      }
    }
  }
  return minutes
}
