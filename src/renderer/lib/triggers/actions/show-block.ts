import type { ActionParams } from '@/types/trigger-model'
import type { ActionDeps } from './types'
import { registerAction } from './registry'

function executeShowBlock(params: ActionParams, deps: ActionDeps): void {
  if (!params.blockId) {
    console.warn('[show_block] Missing blockId param')
    return
  }
  deps.setBlockVisibility(params.blockId, true)
  if (params.announcement) {
    deps.announcePolite(params.announcement)
  }
}

registerAction('show_block', executeShowBlock)
