import { CONTENT_AREAS, GRADE_LEVELS, BLOOMS_LEVELS, ASSIGNMENT_TYPES, RUBRIC_TYPES } from '@/lib/syllabus-constants'
import type { Syllabus } from '@/types/syllabus'

interface SyllabusPreviewProps {
  syllabus: Syllabus
}

export function SyllabusPreview({ syllabus }: SyllabusPreviewProps): JSX.Element {
  const contentAreaLabels = syllabus.contentAreas
    .map((id) => CONTENT_AREAS.find((a) => a.id === id)?.label ?? id)
    .concat(syllabus.customContentAreas)

  const gradeLabel = GRADE_LEVELS.find((g) => g.id === syllabus.audience.level)?.label ?? syllabus.audience.level

  return (
    <div className="space-y-6 text-sm text-[var(--text-primary)]">
      {/* Title */}
      <div>
        <h2 className="text-xl font-[var(--font-weight-bold)]">{syllabus.name || 'Untitled Syllabus'}</h2>
        {contentAreaLabels.length > 0 && (
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Content Areas: {contentAreaLabels.join(', ')}
          </p>
        )}
      </div>

      {/* Course Goal */}
      {syllabus.courseGoal && (
        <section>
          <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Course Goal
          </h3>
          <p>{syllabus.courseGoal}</p>
        </section>
      )}

      {/* Audience */}
      <section>
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          Audience
        </h3>
        <p>Level: {gradeLabel || 'Not specified'}</p>
        {syllabus.audience.context && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{syllabus.audience.context}</p>}
      </section>

      {/* Objectives */}
      {syllabus.objectives.length > 0 && (
        <section>
          <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Learning Objectives
          </h3>
          <ol className="list-decimal list-inside space-y-1.5">
            {syllabus.objectives.map((obj) => {
              const bloom = BLOOMS_LEVELS.find((b) => b.id === obj.bloomsLevel)
              return (
                <li key={obj.id}>
                  <span>{obj.text}</span>
                  {bloom && (
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-[var(--font-weight-semibold)] text-white inline-block"
                      style={{ backgroundColor: bloom.color }}
                    >
                      {bloom.label}
                    </span>
                  )}
                  {obj.rationale && (
                    <p className="text-xs text-[var(--text-tertiary)] ml-5 mt-0.5">Rationale: {obj.rationale}</p>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* Assignments */}
      {syllabus.assignments.length > 0 && (
        <section>
          <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Assignments
          </h3>
          <div className="space-y-3">
            {syllabus.assignments.map((asn, i) => {
              const typeLabel = ASSIGNMENT_TYPES.find((t) => t.id === asn.type)?.label ?? asn.type
              const linkedObjs = syllabus.objectives.filter((o) => asn.linkedObjectiveIds.includes(o.id))
              return (
                <div key={asn.id} className="p-3 rounded border border-[var(--border-default)]">
                  <p className="font-[var(--font-weight-medium)]">{i + 1}. {asn.title || 'Untitled'}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Type: {typeLabel}</p>
                  {asn.description && <p className="text-xs mt-1">{asn.description}</p>}
                  {linkedObjs.length > 0 && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Linked objectives: {linkedObjs.map((o, j) => `#${syllabus.objectives.indexOf(o) + 1}`).join(', ')}
                    </p>
                  )}
                  {(asn.udl.representation || asn.udl.actionExpression || asn.udl.engagement) && (
                    <div className="mt-2 p-2 rounded bg-[var(--bg-muted)] text-xs space-y-1">
                      <p className="font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">UDL Accommodations:</p>
                      {asn.udl.representation && <p><strong>Representation:</strong> {asn.udl.representation}</p>}
                      {asn.udl.actionExpression && <p><strong>Action & Expression:</strong> {asn.udl.actionExpression}</p>}
                      {asn.udl.engagement && <p><strong>Engagement:</strong> {asn.udl.engagement}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Rubrics */}
      {syllabus.rubrics.length > 0 && (
        <section>
          <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Rubrics
          </h3>
          {syllabus.rubrics.map((rubric) => {
            const assignment = syllabus.assignments.find((a) => a.id === rubric.assignmentId)
            const typeLabel = RUBRIC_TYPES.find((t) => t.id === rubric.type)?.label ?? rubric.type
            return (
              <div key={rubric.id} className="mb-4">
                <p className="text-xs font-[var(--font-weight-semibold)] mb-1">
                  {assignment?.title || 'Untitled'} — {typeLabel} Rubric
                </p>
                {rubric.type === 'analytic' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th scope="col" className="p-1.5 text-left bg-[var(--bg-muted)] border border-[var(--border-default)]">Criteria</th>
                          {rubric.columns.map((col) => (
                            <th key={col.id} scope="col" className="p-1.5 bg-[var(--bg-muted)] border border-[var(--border-default)]">
                              {col.label} ({col.points}pt)
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rubric.rows.map((row) => (
                          <tr key={row.id}>
                            <th scope="row" className="p-1.5 text-left border border-[var(--border-default)] bg-[var(--bg-muted)]">
                              {row.label}
                            </th>
                            {rubric.columns.map((col) => (
                              <td key={col.id} className="p-1.5 border border-[var(--border-default)]">
                                {rubric.cells[`${row.id}:${col.id}`] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {rubric.type === 'holistic' && (
                  <div className="space-y-1">
                    {rubric.rows.map((row) => (
                      <div key={row.id} className="p-2 rounded border border-[var(--border-default)]">
                        <span className="font-[var(--font-weight-medium)]">{row.label}:</span>{' '}
                        {rubric.cells[`${row.id}:holistic`] || '—'}
                      </div>
                    ))}
                  </div>
                )}
                {rubric.type === 'single-point' && (
                  <div className="space-y-1">
                    {rubric.rows.map((row) => (
                      <div key={row.id} className="p-2 rounded border border-[var(--border-default)]">
                        <p className="font-[var(--font-weight-medium)]">{row.label}</p>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-[10px]">
                          <div><strong>Growth:</strong> {rubric.cells[`${row.id}:growth`] || '—'}</div>
                          <div><strong>Proficient:</strong> {rubric.cells[`${row.id}:proficient`] || '—'}</div>
                          <div><strong>Strengths:</strong> {rubric.cells[`${row.id}:strengths`] || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {rubric.type === 'checklist' && (
                  <ul className="space-y-0.5">
                    {rubric.rows.map((row) => (
                      <li key={row.id} className="flex items-center gap-1.5 text-xs">
                        <span className="w-3 h-3 rounded border border-[var(--border-default)]" aria-hidden="true" />
                        {row.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}
