// ─── Syllabus Builder Constants ───

import type { BloomsLevel, AssignmentType, RubricType, SyllabusWizardStep } from '@/types/syllabus'

// ─── Content Areas (20 presets) ───

export interface ContentAreaOption {
  id: string
  label: string
  icon: string // lucide-react icon name
}

export const CONTENT_AREAS: ContentAreaOption[] = [
  { id: 'special-education', label: 'Special Education', icon: 'Heart' },
  { id: 'general-education', label: 'General Education', icon: 'GraduationCap' },
  { id: 'early-childhood', label: 'Early Childhood (PreK-2)', icon: 'Baby' },
  { id: 'stem', label: 'STEM', icon: 'FlaskConical' },
  { id: 'literacy', label: 'Literacy & Language Arts', icon: 'BookOpen' },
  { id: 'social-studies', label: 'Social Studies & History', icon: 'Globe' },
  { id: 'arts-pe', label: 'Arts & Physical Education', icon: 'Palette' },
  { id: 'health-life-sciences', label: 'Health & Life Sciences', icon: 'Microscope' },
  { id: 'behavioral-science-aba', label: 'Behavioral Science & ABA', icon: 'Brain' },
  { id: 'counseling-psychology', label: 'Counseling & Psychology', icon: 'HeartHandshake' },
  { id: 'social-work', label: 'Social Work', icon: 'Users' },
  { id: 'nursing', label: 'Nursing & Allied Health', icon: 'Stethoscope' },
  { id: 'higher-ed', label: 'Higher Education & Faculty Development', icon: 'Building2' },
  { id: 'corporate-hr', label: 'Corporate HR & Workforce Training', icon: 'Briefcase' },
  { id: 'dei', label: 'Diversity Equity & Inclusion', icon: 'HandHeart' },
  { id: 'ed-tech', label: 'Educational Technology', icon: 'Monitor' },
  { id: 'leadership', label: 'Leadership & Administration', icon: 'Crown' },
  { id: 'adult-continuing', label: 'Adult & Continuing Education', icon: 'BookMarked' },
  { id: 'ell-esl', label: 'English Language Learning (ELL/ESL)', icon: 'Languages' },
  { id: 'vocational-cte', label: 'Vocational & Career & Technical Education', icon: 'Wrench' }
]

// ─── Grade / Audience Levels ───

export interface GradeLevel {
  id: string
  label: string
}

export const GRADE_LEVELS: GradeLevel[] = [
  { id: 'prek', label: 'PreK (Ages 3-5)' },
  { id: 'kindergarten', label: 'Kindergarten' },
  { id: 'grades-1-2', label: 'Grades 1-2' },
  { id: 'grades-3-5', label: 'Grades 3-5' },
  { id: 'grades-6-8', label: 'Grades 6-8' },
  { id: 'grades-9-12', label: 'Grades 9-12' },
  { id: 'undergraduate', label: 'Undergraduate' },
  { id: 'graduate', label: 'Graduate / Doctoral' },
  { id: 'adult-learners', label: 'Adult Learners' },
  { id: 'corporate-hr', label: 'Corporate / HR' },
  { id: 'healthcare-clinical', label: 'Healthcare / Clinical' },
  { id: 'parent-caregiver', label: 'Parent & Caregiver' },
  { id: 'community-education', label: 'Community Education' },
  { id: 'other', label: 'Other (specify)' }
]

// ─── Bloom's Taxonomy ───

export interface BloomsLevelConfig {
  id: BloomsLevel
  label: string
  description: string
  color: string
  verbs: string[]
}

export const BLOOMS_LEVELS: BloomsLevelConfig[] = [
  {
    id: 'remember',
    label: 'Remember',
    description: 'Retrieve relevant knowledge from long-term memory',
    color: 'var(--color-danger-500)',
    verbs: ['define', 'list', 'recall', 'identify', 'name', 'recognize', 'state', 'describe', 'match', 'label']
  },
  {
    id: 'understand',
    label: 'Understand',
    description: 'Construct meaning from instructional messages',
    color: 'var(--color-warning-500)',
    verbs: ['explain', 'summarize', 'paraphrase', 'classify', 'compare', 'interpret', 'discuss', 'predict', 'distinguish', 'illustrate']
  },
  {
    id: 'apply',
    label: 'Apply',
    description: 'Carry out or use a procedure in a given situation',
    color: '#2563eb',
    verbs: ['apply', 'demonstrate', 'implement', 'solve', 'use', 'execute', 'compute', 'operate', 'practice', 'illustrate']
  },
  {
    id: 'analyze',
    label: 'Analyze',
    description: 'Break material into constituent parts and detect relationships',
    color: '#7c3aed',
    verbs: ['analyze', 'differentiate', 'organize', 'deconstruct', 'attribute', 'compare', 'contrast', 'examine', 'categorize', 'investigate']
  },
  {
    id: 'evaluate',
    label: 'Evaluate',
    description: 'Make judgments based on criteria and standards',
    color: '#0891b2',
    verbs: ['evaluate', 'judge', 'critique', 'justify', 'assess', 'argue', 'defend', 'appraise', 'prioritize', 'recommend']
  },
  {
    id: 'create',
    label: 'Create',
    description: 'Put elements together to form a coherent or functional whole',
    color: '#059669',
    verbs: ['create', 'design', 'construct', 'develop', 'formulate', 'produce', 'compose', 'invent', 'plan', 'generate']
  }
]

// ─── Assignment Types ───

export interface AssignmentTypeConfig {
  id: AssignmentType
  label: string
  description: string
}

export const ASSIGNMENT_TYPES: AssignmentTypeConfig[] = [
  { id: 'written-essay', label: 'Written / Essay', description: 'Written papers, reports, or essays' },
  { id: 'project-portfolio', label: 'Project / Portfolio', description: 'Cumulative projects or portfolio artifacts' },
  { id: 'presentation', label: 'Presentation', description: 'Oral or multimedia presentations' },
  { id: 'discussion', label: 'Discussion / Participation', description: 'Forum posts, in-class discussion, participation' },
  { id: 'quiz-exam', label: 'Quiz / Exam', description: 'Formative or summative assessments' },
  { id: 'lab-hands-on', label: 'Lab / Hands-On', description: 'Laboratory work, simulations, or practical exercises' },
  { id: 'reflection-journal', label: 'Reflection Journal', description: 'Reflective writing or learning journals' },
  { id: 'group-work', label: 'Group Work', description: 'Collaborative or team-based assignments' },
  { id: 'case-study', label: 'Case Study', description: 'Analysis of real-world scenarios or cases' },
  { id: 'other', label: 'Other', description: 'Custom assignment type' }
]

// ─── Rubric Types ───

export interface RubricTypeConfig {
  id: RubricType
  label: string
  description: string
}

export const RUBRIC_TYPES: RubricTypeConfig[] = [
  { id: 'analytic', label: 'Analytic', description: 'Criteria evaluated separately with individual scores per dimension' },
  { id: 'holistic', label: 'Holistic', description: 'Single overall score with level descriptors for the whole performance' },
  { id: 'single-point', label: 'Single-Point', description: 'Criteria listed with space for strengths and areas for growth' },
  { id: 'checklist', label: 'Checklist', description: 'Yes/No criteria list for completeness checking' }
]

// ─── Default Rubric Levels ───

export const DEFAULT_RUBRIC_LEVELS = [
  { id: 'lvl-beginning', label: 'Beginning', points: 1 },
  { id: 'lvl-developing', label: 'Developing', points: 2 },
  { id: 'lvl-proficient', label: 'Proficient', points: 3 }
]

export const DEFAULT_RUBRIC_ROWS = [
  { id: 'crit-1', label: 'Criterion 1', weight: 1 },
  { id: 'crit-2', label: 'Criterion 2', weight: 1 },
  { id: 'crit-3', label: 'Criterion 3', weight: 1 }
]

// ─── Wizard Steps ───

export const WIZARD_STEPS: SyllabusWizardStep[] = [
  'identity', 'audience', 'objectives', 'assignments', 'rubrics', 'review'
]

export const WIZARD_STEP_LABELS: Record<SyllabusWizardStep, string> = {
  identity: 'Course Identity',
  audience: 'Audience & Level',
  objectives: 'Learning Objectives',
  assignments: 'Assignments',
  rubrics: 'Rubrics',
  review: 'Review & Export'
}
