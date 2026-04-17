// ─── Interactivity Schema Version ───

export const INTERACTIVITY_SCHEMA_VERSION = 1

// ─── Variable Types ───

export type VariableType = 'boolean' | 'number' | 'text'
export type VariableScope = 'course' | 'module' | 'lesson'

export interface Variable {
  id: string
  name: string
  type: VariableType
  scope: VariableScope
  scopeId?: string
  defaultValue: boolean | number | string
  description: string
  system: boolean
  createdAt: string
  updatedAt: string
}

// ─── Condition Types ───

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'

export type ConditionSourceType =
  | 'variable'
  | 'block_state'
  | 'progression'
  | 'time'

export interface Condition {
  id: string
  sourceType: ConditionSourceType
  sourceId: string
  operator: ConditionOperator
  value: boolean | number | string
}

export type ConditionLogic = 'and' | 'or'

export interface ConditionGroup {
  logic: ConditionLogic
  conditions: Condition[]
}

// ─── Action Types ───

export type ActionType =
  | 'navigate'
  | 'set_variable'
  | 'adjust_variable'
  | 'show_block'
  | 'hide_block'
  | 'announce'

export interface ActionParams {
  // navigate
  lessonId?: string
  // set_variable
  variableId?: string
  value?: boolean | number | string
  // adjust_variable
  operation?: 'increment' | 'decrement' | 'append'
  amount?: number | string
  // show_block / hide_block
  blockId?: string
  announcement?: string
  // announce
  message?: string
  politeness?: 'polite' | 'assertive'
}

export interface Action {
  id: string
  type: ActionType
  params: ActionParams
}

// ─── Trigger Event Types ───

export type TriggerEvent =
  | 'on_block_load'
  | 'on_block_complete'
  | 'on_click'
  | 'on_answer_submit'
  | 'on_lesson_start'
  | 'on_lesson_complete'
  | 'on_course_start'
  | 'on_course_complete'
  | 'on_variable_change'
  | 'on_timer'

export interface EventParams {
  // on_click
  blockId?: string
  // on_answer_submit
  quizBlockId?: string
  questionId?: string
  // on_variable_change
  variableId?: string
  // on_timer
  delayMs?: number
  // on_block_load / on_block_complete
  targetBlockId?: string
}

// ─── Trigger ───

export type TriggerScope = 'block' | 'lesson' | 'module' | 'course'

export interface Trigger {
  id: string
  name: string
  description: string
  event: TriggerEvent
  eventParams: EventParams
  conditions?: ConditionGroup
  actions: Action[]
  scope: TriggerScope
  scopeId: string
  enabled: boolean
  executionOrder: number
  createdAt: string
  updatedAt: string
}

// ─── Progression ───

export type ProgressionPolicy = 'linear_strict' | 'fail_open' | 'open_always'

export interface ProgressionSettings {
  policy: ProgressionPolicy
  whatsNextOptions: {
    retry: boolean
    pickAnother: boolean
    reviewProgress: boolean
    startOver: boolean
    continueAnyway: boolean
  }
}

// ─── Interactivity Config (on Course) ───

export interface InteractivityConfig {
  schemaVersion: number
  variables: Variable[]
  triggers: Trigger[]
  progression: ProgressionSettings
}
