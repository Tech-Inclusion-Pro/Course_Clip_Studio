import type { ActionParams } from '@/types/trigger-model'
import type { ActionDeps } from './types'
import { registerAction } from './registry'

function executeAdjustVariable(params: ActionParams, deps: ActionDeps): void {
  if (!params.variableId || !params.operation || params.amount === undefined) {
    console.warn('[adjust_variable] Missing variableId, operation, or amount param')
    return
  }
  deps.adjustVariable(params.variableId, params.operation, params.amount)
}

registerAction('adjust_variable', executeAdjustVariable)
