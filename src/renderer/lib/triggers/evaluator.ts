import type { Condition, ConditionGroup, ConditionOperator } from '@/types/trigger-model'

// ─── Evaluation Context ───

export interface EvaluationContext {
  getValue: (id: string) => boolean | number | string | undefined
  getBlockState?: (blockId: string) => string | undefined
  getProgression?: () => Record<string, unknown>
  getTime?: () => number
}

// ─── Trace Types ───

export interface ConditionTrace {
  conditionId: string
  result: boolean
  sourceType: string
  sourceId: string
  operator: string
  actualValue: unknown
  expectedValue: unknown
  warning?: string
}

export interface EvaluationTrace {
  result: boolean
  logic?: string
  conditions: ConditionTrace[]
}

// ─── Single Condition Evaluation ───

export function evaluateCondition(
  condition: Condition,
  context: EvaluationContext
): { result: boolean; trace: ConditionTrace } {
  const trace: ConditionTrace = {
    conditionId: condition.id,
    result: false,
    sourceType: condition.sourceType,
    sourceId: condition.sourceId,
    operator: condition.operator,
    actualValue: undefined,
    expectedValue: condition.value
  }

  // Phase 1: Only variable source type
  if (condition.sourceType !== 'variable') {
    trace.warning = `Source type "${condition.sourceType}" not implemented in Phase 1`
    trace.result = false
    return { result: false, trace }
  }

  const actual = context.getValue(condition.sourceId)
  trace.actualValue = actual

  // Deleted or missing variable → false
  if (actual === undefined) {
    trace.warning = `Variable "${condition.sourceId}" not found`
    trace.result = false
    return { result: false, trace }
  }

  const result = compareValues(actual, condition.operator, condition.value)
  if (result === null) {
    trace.warning = `Type mismatch: ${typeof actual} vs ${typeof condition.value}`
    trace.result = false
    return { result: false, trace }
  }

  trace.result = result
  return { result, trace }
}

// ─── Group Evaluation ───

export function evaluateConditions(
  group: ConditionGroup | undefined,
  context: EvaluationContext
): { result: boolean; trace: EvaluationTrace } {
  // No conditions = unconditional = true
  if (!group || group.conditions.length === 0) {
    return {
      result: true,
      trace: { result: true, logic: undefined, conditions: [] }
    }
  }

  const traces: ConditionTrace[] = []
  const logic = group.logic

  if (logic === 'and') {
    for (const cond of group.conditions) {
      const { result, trace } = evaluateCondition(cond, context)
      traces.push(trace)
      if (!result) {
        // Short-circuit: first false stops AND
        return { result: false, trace: { result: false, logic: 'and', conditions: traces } }
      }
    }
    return { result: true, trace: { result: true, logic: 'and', conditions: traces } }
  }

  // OR logic
  for (const cond of group.conditions) {
    const { result, trace } = evaluateCondition(cond, context)
    traces.push(trace)
    if (result) {
      // Short-circuit: first true stops OR
      return { result: true, trace: { result: true, logic: 'or', conditions: traces } }
    }
  }
  return { result: false, trace: { result: false, logic: 'or', conditions: traces } }
}

// ─── Comparison Helper ───

function compareValues(
  actual: boolean | number | string,
  operator: ConditionOperator,
  expected: boolean | number | string
): boolean | null {
  // String operators
  if (operator === 'is_empty') {
    return typeof actual === 'string' ? actual === '' : null
  }
  if (operator === 'is_not_empty') {
    return typeof actual === 'string' ? actual !== '' : null
  }
  if (operator === 'contains') {
    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.includes(expected)
    }
    return null
  }
  if (operator === 'not_contains') {
    if (typeof actual === 'string' && typeof expected === 'string') {
      return !actual.includes(expected)
    }
    return null
  }
  if (operator === 'starts_with') {
    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.startsWith(expected)
    }
    return null
  }
  if (operator === 'ends_with') {
    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.endsWith(expected)
    }
    return null
  }

  // Equality (works across all types if same type)
  if (operator === 'eq') {
    if (typeof actual !== typeof expected) return null
    return actual === expected
  }
  if (operator === 'neq') {
    if (typeof actual !== typeof expected) return null
    return actual !== expected
  }

  // Numeric comparisons
  if (typeof actual === 'number' && typeof expected === 'number') {
    switch (operator) {
      case 'gt': return actual > expected
      case 'gte': return actual >= expected
      case 'lt': return actual < expected
      case 'lte': return actual <= expected
      default: return null
    }
  }

  // Type mismatch for numeric operators
  return null
}
