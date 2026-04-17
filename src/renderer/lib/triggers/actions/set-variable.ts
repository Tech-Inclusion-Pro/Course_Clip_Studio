import type { ActionParams } from '@/types/trigger-model'
import type { ActionDeps } from './types'
import { registerAction } from './registry'

function executeSetVariable(params: ActionParams, deps: ActionDeps): void {
  if (!params.variableId || params.value === undefined) {
    console.warn('[set_variable] Missing variableId or value param')
    return
  }
  deps.setVariable(params.variableId, params.value)
}

registerAction('set_variable', executeSetVariable)
