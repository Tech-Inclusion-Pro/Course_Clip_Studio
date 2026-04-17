import type { ActionParams } from '@/types/trigger-model'
import type { ActionDeps } from './types'
import { registerAction } from './registry'

function executeAnnounce(params: ActionParams, deps: ActionDeps): void {
  if (!params.message) {
    console.warn('[announce] Missing message param')
    return
  }
  if (params.politeness === 'assertive') {
    deps.announceAssertive(params.message)
  } else {
    deps.announcePolite(params.message)
  }
}

registerAction('announce', executeAnnounce)
