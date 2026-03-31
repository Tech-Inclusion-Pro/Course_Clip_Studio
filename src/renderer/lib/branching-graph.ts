import type { Course } from '@/types/course'

export interface GraphNode {
  id: string
  type: 'lesson'
  data: {
    title: string
    moduleTitle: string
    blockCount: number
    hasBranching: boolean
    isStart: boolean
    isEnd: boolean
  }
  position: { x: number; y: number }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
}

export function extractBranchingGraph(course: Course): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const allLessons: Array<{ lesson: typeof course.modules[0]['lessons'][0]; moduleTitle: string; globalIdx: number }> = []

  // Flatten lessons
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      allLessons.push({ lesson, moduleTitle: mod.title, globalIdx: allLessons.length })
    }
  }

  // Create nodes
  for (let i = 0; i < allLessons.length; i++) {
    const { lesson, moduleTitle } = allLessons[i]
    const hasBranching = lesson.blocks.some((b) => b.type === 'branching')

    nodes.push({
      id: lesson.id,
      type: 'lesson',
      data: {
        title: lesson.title,
        moduleTitle,
        blockCount: lesson.blocks.length,
        hasBranching,
        isStart: i === 0,
        isEnd: i === allLessons.length - 1
      },
      position: { x: 0, y: 0 } // Will be laid out by dagre
    })
  }

  // Create edges: linear flow + branching
  for (let i = 0; i < allLessons.length; i++) {
    const { lesson } = allLessons[i]

    // Linear flow to next lesson
    if (i < allLessons.length - 1) {
      edges.push({
        id: `linear-${i}`,
        source: lesson.id,
        target: allLessons[i + 1].lesson.id
      })
    }

    // Branching edges
    for (const block of lesson.blocks) {
      if (block.type === 'branching') {
        for (const choice of block.choices) {
          if (choice.nextLessonId) {
            edges.push({
              id: `branch-${block.id}-${choice.id}`,
              source: lesson.id,
              target: choice.nextLessonId,
              label: choice.label
            })
          }
        }
      }
    }
  }

  return { nodes, edges }
}
