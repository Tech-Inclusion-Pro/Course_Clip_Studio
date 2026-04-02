// ─── Syllabus Builder Data Model ───

export type BloomsLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'

export type AssignmentType =
  | 'written-essay' | 'project-portfolio' | 'presentation' | 'discussion'
  | 'quiz-exam' | 'lab-hands-on' | 'reflection-journal' | 'group-work'
  | 'case-study' | 'other'

export type RubricType = 'analytic' | 'holistic' | 'single-point' | 'checklist'

export type SyllabusWizardStep = 'identity' | 'audience' | 'objectives' | 'assignments' | 'rubrics' | 'review'

export interface SyllabusObjective {
  id: string
  text: string
  bloomsLevel: BloomsLevel
  rationale: string
  savedToPool: boolean
}

export interface UDLAnnotation {
  representation: string
  actionExpression: string
  engagement: string
}

export interface SyllabusAssignment {
  id: string
  title: string
  description: string
  type: AssignmentType
  linkedObjectiveIds: string[]
  udl: UDLAnnotation
  savedToPool: boolean
}

export interface RubricCriterion { id: string; label: string; weight: number }
export interface RubricLevel { id: string; label: string; points: number }
export interface RubricCell { criterionId: string; levelId: string; description: string }

export interface SyllabusRubric {
  id: string
  assignmentId: string
  type: RubricType
  columns: RubricLevel[]
  rows: RubricCriterion[]
  cells: Record<string, string>  // key = `${criterionId}:${levelId}`
  savedToPool: boolean
}

export interface Syllabus {
  id: string
  name: string
  contentAreas: string[]
  customContentAreas: string[]
  courseGoal: string
  audience: { level: string; context: string }
  objectives: SyllabusObjective[]
  assignments: SyllabusAssignment[]
  rubrics: SyllabusRubric[]
  createdAt: string
  updatedAt: string
}

// Pool items extend the base types with origin tracking
export interface PoolObjective extends SyllabusObjective { syllabusName?: string }
export interface PoolAssignment extends SyllabusAssignment { syllabusName?: string }
export interface PoolRubric extends SyllabusRubric { assignmentName?: string; syllabusName?: string }
