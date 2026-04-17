import type { InteractivityConfig } from '@/types/trigger-model'
import type { Course } from '@/types/course'
import { findLesson, findBlock } from '@/lib/course-helpers'

export interface ValidationIssue {
  type: 'error' | 'warning'
  message: string
  triggerId?: string
  variableId?: string
}

export function validateInteractivity(
  config: InteractivityConfig,
  course: Course
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Check unique variable names
  const varNames = new Set<string>()
  for (const v of config.variables) {
    if (varNames.has(v.name)) {
      issues.push({
        type: 'error',
        message: `Duplicate variable name: "${v.name}"`,
        variableId: v.id
      })
    }
    varNames.add(v.name)
  }

  const variableIds = new Set(config.variables.map((v) => v.id))

  for (const trigger of config.triggers) {
    // Validate variable references in actions
    for (const action of trigger.actions) {
      if (
        (action.type === 'set_variable' || action.type === 'adjust_variable') &&
        action.params.variableId &&
        !variableIds.has(action.params.variableId)
      ) {
        issues.push({
          type: 'error',
          message: `Trigger "${trigger.name || trigger.id}" references unknown variable "${action.params.variableId}"`,
          triggerId: trigger.id
        })
      }

      // Validate block references
      if (
        (action.type === 'show_block' || action.type === 'hide_block') &&
        action.params.blockId &&
        !findBlock(course, action.params.blockId)
      ) {
        issues.push({
          type: 'warning',
          message: `Trigger "${trigger.name || trigger.id}" references unknown block "${action.params.blockId}"`,
          triggerId: trigger.id
        })
      }

      // Validate lesson references
      if (
        action.type === 'navigate' &&
        action.params.lessonId &&
        !findLesson(course, action.params.lessonId)
      ) {
        issues.push({
          type: 'error',
          message: `Trigger "${trigger.name || trigger.id}" navigates to unknown lesson "${action.params.lessonId}"`,
          triggerId: trigger.id
        })
      }
    }

    // Validate condition variable references
    if (trigger.conditions) {
      for (const cond of trigger.conditions.conditions) {
        if (cond.sourceType === 'variable' && !variableIds.has(cond.sourceId)) {
          issues.push({
            type: 'warning',
            message: `Trigger "${trigger.name || trigger.id}" condition references unknown variable "${cond.sourceId}"`,
            triggerId: trigger.id
          })
        }
      }

      // Check nesting depth (Phase 1: max 3, but we only have flat conditions in Phase 1)
      if (trigger.conditions.conditions.length > 3) {
        issues.push({
          type: 'warning',
          message: `Trigger "${trigger.name || trigger.id}" has ${trigger.conditions.conditions.length} conditions (recommended max 3)`,
          triggerId: trigger.id
        })
      }
    }
  }

  return issues
}
