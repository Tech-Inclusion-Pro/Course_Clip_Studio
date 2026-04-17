import type { Trigger } from '@/types/trigger-model'
import { TriggerRow } from './TriggerRow'

export function TriggerList({ triggers }: { triggers: Trigger[] }): JSX.Element {
  if (triggers.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
        No triggers yet. Create one to add interactivity.
      </p>
    )
  }

  // Group by event type
  const groups = new Map<string, Trigger[]>()
  for (const t of triggers) {
    const key = t.event
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  }

  return (
    <div role="list" className="space-y-1">
      {Array.from(groups.entries()).map(([event, groupTriggers]) => (
        <div key={event}>
          <p className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider px-1 py-1">
            {formatEventLabel(event)}
          </p>
          {groupTriggers.map((trigger) => (
            <TriggerRow key={trigger.id} trigger={trigger} />
          ))}
        </div>
      ))}
    </div>
  )
}

function formatEventLabel(event: string): string {
  const labels: Record<string, string> = {
    on_block_load: 'On Block Load',
    on_block_complete: 'On Block Complete',
    on_click: 'On Click',
    on_answer_submit: 'On Answer Submit',
    on_lesson_start: 'On Lesson Start',
    on_lesson_complete: 'On Lesson Complete',
    on_course_start: 'On Course Start',
    on_course_complete: 'On Course Complete',
    on_variable_change: 'On Variable Change',
    on_timer: 'On Timer'
  }
  return labels[event] ?? event
}
