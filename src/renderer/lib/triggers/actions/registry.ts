import type { ActionType, ActionParams } from '@/types/trigger-model'
import type { ActionDeps } from './types'

export type ActionExecutor = (params: ActionParams, deps: ActionDeps) => void

const executors = new Map<ActionType, ActionExecutor>()

export function registerAction(type: ActionType, executor: ActionExecutor): void {
  executors.set(type, executor)
}

export function getActionExecutor(type: ActionType): ActionExecutor | undefined {
  return executors.get(type)
}

export function executeAction(type: ActionType, params: ActionParams, deps: ActionDeps): void {
  const executor = executors.get(type)
  if (!executor) {
    console.warn(`[ActionRegistry] No executor for action type "${type}"`)
    return
  }
  try {
    executor(params, deps)
  } catch (err) {
    console.error(`[ActionRegistry] Error executing "${type}":`, err)
  }
}
