import type { ActionParams } from '@/types/trigger-model'
import type { ActionDeps } from './types'
import { registerAction } from './registry'

function executeHideBlock(params: ActionParams, deps: ActionDeps): void {
  if (!params.blockId) {
    console.warn('[hide_block] Missing blockId param')
    return
  }
  deps.setBlockVisibility(params.blockId, false)
  if (params.announcement) {
    deps.announcePolite(params.announcement)
  }
}

registerAction('hide_block', executeHideBlock)
