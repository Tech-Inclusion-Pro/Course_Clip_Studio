// Import all action executors to register them
import './navigate'
import './set-variable'
import './adjust-variable'
import './show-block'
import './hide-block'
import './announce'

export { executeAction, getActionExecutor } from './registry'
export type { ActionDeps } from './types'
