import type { ActionParams } from '@/types/trigger-model'
import type { ActionDeps } from './types'
import { registerAction } from './registry'

function executeNavigate(params: ActionParams, deps: ActionDeps): void {
  if (!params.lessonId) {
    console.warn('[navigate] Missing lessonId param')
    return
  }
  deps.navigateToLesson(params.lessonId)
}

registerAction('navigate', executeNavigate)
