// Re-export all trigger model types from the canonical source
export type {
  VariableType,
  VariableScope,
  Variable,
  ConditionOperator,
  ConditionSourceType,
  Condition,
  ConditionLogic,
  ConditionGroup,
  ActionType,
  ActionParams,
  Action,
  TriggerEvent,
  EventParams,
  TriggerScope,
  Trigger,
  ProgressionPolicy,
  ProgressionSettings,
  InteractivityConfig
} from '@/types/trigger-model'

export { INTERACTIVITY_SCHEMA_VERSION } from '@/types/trigger-model'
