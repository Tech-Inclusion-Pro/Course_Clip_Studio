import type { TriggerEvent, EventParams } from '@/types/trigger-model'

const EVENT_OPTIONS: { group: string; events: { value: TriggerEvent; label: string }[] }[] = [
  {
    group: 'Block',
    events: [
      { value: 'on_block_load', label: 'Block loads' },
      { value: 'on_block_complete', label: 'Block is completed' },
      { value: 'on_click', label: 'Block is clicked' }
    ]
  },
  {
    group: 'Assessment',
    events: [
      { value: 'on_answer_submit', label: 'Answer is submitted' }
    ]
  },
  {
    group: 'Lesson',
    events: [
      { value: 'on_lesson_start', label: 'Lesson starts' },
      { value: 'on_lesson_complete', label: 'Lesson is completed' }
    ]
  },
  {
    group: 'Course',
    events: [
      { value: 'on_course_start', label: 'Course starts' },
      { value: 'on_course_complete', label: 'Course is completed' }
    ]
  },
  {
    group: 'Variable',
    events: [
      { value: 'on_variable_change', label: 'Variable changes' }
    ]
  }
]

interface EventPickerProps {
  event: TriggerEvent
  eventParams: EventParams
  onChange: (event: TriggerEvent, params: EventParams) => void
}

export function EventPicker({ event, eventParams, onChange }: EventPickerProps): JSX.Element {
  return (
    <div className="space-y-2">
      <select
        value={event}
        onChange={(e) => onChange(e.target.value as TriggerEvent, {})}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
      >
        {EVENT_OPTIONS.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.events.map((evt) => (
              <option key={evt.value} value={evt.value}>{evt.label}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Conditional param fields */}
      {event === 'on_variable_change' && (
        <input
          type="text"
          value={eventParams.variableId ?? ''}
          onChange={(e) => onChange(event, { ...eventParams, variableId: e.target.value })}
          placeholder="Variable ID (optional — triggers on any variable if empty)"
          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      )}
    </div>
  )
}
