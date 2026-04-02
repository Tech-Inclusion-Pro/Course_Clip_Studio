import { create } from 'zustand'
import { uid } from '@/lib/uid'
import { WIZARD_STEPS, DEFAULT_RUBRIC_LEVELS, DEFAULT_RUBRIC_ROWS } from '@/lib/syllabus-constants'
import type {
  Syllabus, SyllabusWizardStep, SyllabusObjective, SyllabusAssignment, SyllabusRubric,
  PoolObjective, PoolAssignment, PoolRubric,
  BloomsLevel, AssignmentType, RubricType, UDLAnnotation
} from '@/types/syllabus'

export type LibraryView = 'syllabi' | 'objectives' | 'assignments' | 'rubrics'

interface SyllabusState {
  // ─── State ───
  activeSyllabus: Syllabus | null
  wizardStep: SyllabusWizardStep
  syllabi: Syllabus[]
  objectivePool: PoolObjective[]
  assignmentPool: PoolAssignment[]
  rubricPool: PoolRubric[]
  isGenerating: boolean
  generatingTarget: string | null
  generationError: string | null
  libraryView: LibraryView

  // ─── Init ───
  loadSyllabusData: () => Promise<void>

  // ─── Wizard navigation ───
  setWizardStep: (step: SyllabusWizardStep) => void
  goNext: () => void
  goPrev: () => void

  // ─── Syllabus CRUD ───
  createNewSyllabus: () => void
  openSyllabus: (id: string) => void
  duplicateSyllabus: (id: string) => void
  deleteSyllabus: (id: string) => void
  saveSyllabus: () => void
  closeSyllabus: () => void

  // ─── Step 1: Identity ───
  setName: (name: string) => void
  setCourseGoal: (goal: string) => void
  toggleContentArea: (areaId: string) => void
  addCustomContentArea: (area: string) => void
  removeCustomContentArea: (area: string) => void

  // ─── Step 2: Audience ───
  setAudienceLevel: (level: string) => void
  setAudienceContext: (context: string) => void

  // ─── Step 3: Objectives ───
  addObjective: (obj?: Partial<SyllabusObjective>) => void
  updateObjective: (id: string, updates: Partial<SyllabusObjective>) => void
  removeObjective: (id: string) => void

  // ─── Step 4: Assignments ───
  addAssignment: (asn?: Partial<SyllabusAssignment>) => void
  updateAssignment: (id: string, updates: Partial<SyllabusAssignment>) => void
  removeAssignment: (id: string) => void
  updateAssignmentUDL: (id: string, udl: Partial<UDLAnnotation>) => void

  // ─── Step 5: Rubrics ───
  addRubric: (assignmentId: string, rubric?: Partial<SyllabusRubric>) => void
  updateRubric: (id: string, updates: Partial<SyllabusRubric>) => void
  removeRubric: (id: string) => void
  addRubricRow: (rubricId: string) => void
  addRubricColumn: (rubricId: string) => void
  removeRubricRow: (rubricId: string, rowId: string) => void
  removeRubricColumn: (rubricId: string, colId: string) => void
  updateRubricCell: (rubricId: string, key: string, value: string) => void
  setRubricType: (rubricId: string, type: RubricType) => void

  // ─── Pools ───
  saveObjectiveToPool: (obj: SyllabusObjective) => void
  removeObjectiveFromPool: (id: string) => void
  importObjectiveFromPool: (obj: PoolObjective) => void
  saveAssignmentToPool: (asn: SyllabusAssignment) => void
  removeAssignmentFromPool: (id: string) => void
  importAssignmentFromPool: (asn: PoolAssignment) => void
  saveRubricToPool: (rubric: SyllabusRubric, assignmentName?: string) => void
  removeRubricFromPool: (id: string) => void
  importRubricFromPool: (rubric: PoolRubric, assignmentId: string) => void

  // ─── AI ───
  startGeneration: (target: string) => void
  finishGeneration: () => void
  failGeneration: (error: string) => void

  // ─── Library view ───
  setLibraryView: (view: LibraryView) => void
}

function persistSyllabi(syllabi: Syllabus[]): void {
  window.electronAPI?.settings.set('syllabi', syllabi)
}

function persistPools(
  objectivePool: PoolObjective[],
  assignmentPool: PoolAssignment[],
  rubricPool: PoolRubric[]
): void {
  window.electronAPI?.settings.set('objectivePool', objectivePool)
  window.electronAPI?.settings.set('assignmentPool', assignmentPool)
  window.electronAPI?.settings.set('rubricPool', rubricPool)
}

function mapSyllabus(state: SyllabusState, fn: (s: Syllabus) => Syllabus): Partial<SyllabusState> {
  if (!state.activeSyllabus) return {}
  return { activeSyllabus: fn(state.activeSyllabus) }
}

export const useSyllabusStore = create<SyllabusState>((set, get) => ({
  // ─── Defaults ───
  activeSyllabus: null,
  wizardStep: 'identity',
  syllabi: [],
  objectivePool: [],
  assignmentPool: [],
  rubricPool: [],
  isGenerating: false,
  generatingTarget: null,
  generationError: null,
  libraryView: 'syllabi',

  // ─── Init ───
  loadSyllabusData: async () => {
    try {
      const [syllabi, objPool, asnPool, rubPool] = await Promise.all([
        window.electronAPI.settings.get('syllabi'),
        window.electronAPI.settings.get('objectivePool'),
        window.electronAPI.settings.get('assignmentPool'),
        window.electronAPI.settings.get('rubricPool')
      ])
      set({
        syllabi: (syllabi as Syllabus[] | null) ?? [],
        objectivePool: (objPool as PoolObjective[] | null) ?? [],
        assignmentPool: (asnPool as PoolAssignment[] | null) ?? [],
        rubricPool: (rubPool as PoolRubric[] | null) ?? []
      })
    } catch (err) {
      console.error('Failed to load syllabus data:', err)
    }
  },

  // ─── Wizard navigation ───
  setWizardStep: (step) => set({ wizardStep: step }),

  goNext: () => {
    const idx = WIZARD_STEPS.indexOf(get().wizardStep)
    if (idx < WIZARD_STEPS.length - 1) set({ wizardStep: WIZARD_STEPS[idx + 1] })
  },

  goPrev: () => {
    const idx = WIZARD_STEPS.indexOf(get().wizardStep)
    if (idx > 0) set({ wizardStep: WIZARD_STEPS[idx - 1] })
  },

  // ─── Syllabus CRUD ───
  createNewSyllabus: () => {
    const now = new Date().toISOString()
    set({
      activeSyllabus: {
        id: uid('syl'),
        name: '',
        contentAreas: [],
        customContentAreas: [],
        courseGoal: '',
        audience: { level: '', context: '' },
        objectives: [],
        assignments: [],
        rubrics: [],
        createdAt: now,
        updatedAt: now
      },
      wizardStep: 'identity'
    })
  },

  openSyllabus: (id) => {
    const found = get().syllabi.find((s) => s.id === id)
    if (found) set({ activeSyllabus: { ...found }, wizardStep: 'identity' })
  },

  duplicateSyllabus: (id) => {
    const found = get().syllabi.find((s) => s.id === id)
    if (!found) return
    const now = new Date().toISOString()
    const dup: Syllabus = {
      ...JSON.parse(JSON.stringify(found)),
      id: uid('syl'),
      name: `${found.name} (Copy)`,
      createdAt: now,
      updatedAt: now
    }
    const updated = [...get().syllabi, dup]
    set({ syllabi: updated })
    persistSyllabi(updated)
  },

  deleteSyllabus: (id) => {
    const updated = get().syllabi.filter((s) => s.id !== id)
    set({ syllabi: updated })
    persistSyllabi(updated)
  },

  saveSyllabus: () => {
    const active = get().activeSyllabus
    if (!active) return
    const now = new Date().toISOString()
    const saved = { ...active, updatedAt: now }
    const existing = get().syllabi
    const idx = existing.findIndex((s) => s.id === saved.id)
    const updated = idx >= 0
      ? existing.map((s) => (s.id === saved.id ? saved : s))
      : [...existing, saved]
    set({ syllabi: updated, activeSyllabus: saved })
    persistSyllabi(updated)
  },

  closeSyllabus: () => set({ activeSyllabus: null, wizardStep: 'identity' }),

  // ─── Step 1: Identity ───
  setName: (name) => set((s) => mapSyllabus(s, (syl) => ({ ...syl, name }))),

  setCourseGoal: (goal) => set((s) => mapSyllabus(s, (syl) => ({ ...syl, courseGoal: goal }))),

  toggleContentArea: (areaId) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    contentAreas: syl.contentAreas.includes(areaId)
      ? syl.contentAreas.filter((a) => a !== areaId)
      : [...syl.contentAreas, areaId]
  }))),

  addCustomContentArea: (area) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    customContentAreas: syl.customContentAreas.includes(area)
      ? syl.customContentAreas
      : [...syl.customContentAreas, area]
  }))),

  removeCustomContentArea: (area) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    customContentAreas: syl.customContentAreas.filter((a) => a !== area)
  }))),

  // ─── Step 2: Audience ───
  setAudienceLevel: (level) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl, audience: { ...syl.audience, level }
  }))),

  setAudienceContext: (context) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl, audience: { ...syl.audience, context }
  }))),

  // ─── Step 3: Objectives ───
  addObjective: (obj) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    objectives: [...syl.objectives, {
      id: uid('obj'),
      text: '',
      bloomsLevel: 'understand' as BloomsLevel,
      rationale: '',
      savedToPool: false,
      ...obj
    }]
  }))),

  updateObjective: (id, updates) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    objectives: syl.objectives.map((o) => (o.id === id ? { ...o, ...updates } : o))
  }))),

  removeObjective: (id) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    objectives: syl.objectives.filter((o) => o.id !== id),
    assignments: syl.assignments.map((a) => ({
      ...a,
      linkedObjectiveIds: a.linkedObjectiveIds.filter((oid) => oid !== id)
    }))
  }))),

  // ─── Step 4: Assignments ───
  addAssignment: (asn) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    assignments: [...syl.assignments, {
      id: uid('asn'),
      title: '',
      description: '',
      type: 'written-essay' as AssignmentType,
      linkedObjectiveIds: [],
      udl: { representation: '', actionExpression: '', engagement: '' },
      savedToPool: false,
      ...asn
    }]
  }))),

  updateAssignment: (id, updates) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    assignments: syl.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a))
  }))),

  removeAssignment: (id) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    assignments: syl.assignments.filter((a) => a.id !== id),
    rubrics: syl.rubrics.filter((r) => r.assignmentId !== id)
  }))),

  updateAssignmentUDL: (id, udl) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    assignments: syl.assignments.map((a) =>
      a.id === id ? { ...a, udl: { ...a.udl, ...udl } } : a
    )
  }))),

  // ─── Step 5: Rubrics ───
  addRubric: (assignmentId, rubric) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: [...syl.rubrics, {
      id: uid('rub'),
      assignmentId,
      type: 'analytic' as RubricType,
      columns: DEFAULT_RUBRIC_LEVELS.map((l) => ({ ...l, id: uid('lvl') })),
      rows: DEFAULT_RUBRIC_ROWS.map((r) => ({ ...r, id: uid('crit') })),
      cells: {},
      savedToPool: false,
      ...rubric
    }]
  }))),

  updateRubric: (id, updates) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.map((r) => (r.id === id ? { ...r, ...updates } : r))
  }))),

  removeRubric: (id) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.filter((r) => r.id !== id)
  }))),

  addRubricRow: (rubricId) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.map((r) => r.id !== rubricId ? r : {
      ...r,
      rows: [...r.rows, { id: uid('crit'), label: `Criterion ${r.rows.length + 1}`, weight: 1 }]
    })
  }))),

  addRubricColumn: (rubricId) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.map((r) => r.id !== rubricId ? r : {
      ...r,
      columns: [...r.columns, { id: uid('lvl'), label: `Level ${r.columns.length + 1}`, points: r.columns.length + 1 }]
    })
  }))),

  removeRubricRow: (rubricId, rowId) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.map((r) => {
      if (r.id !== rubricId) return r
      const cells = { ...r.cells }
      for (const key of Object.keys(cells)) {
        if (key.startsWith(`${rowId}:`)) delete cells[key]
      }
      return { ...r, rows: r.rows.filter((row) => row.id !== rowId), cells }
    })
  }))),

  removeRubricColumn: (rubricId, colId) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.map((r) => {
      if (r.id !== rubricId) return r
      const cells = { ...r.cells }
      for (const key of Object.keys(cells)) {
        if (key.endsWith(`:${colId}`)) delete cells[key]
      }
      return { ...r, columns: r.columns.filter((c) => c.id !== colId), cells }
    })
  }))),

  updateRubricCell: (rubricId, key, value) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.map((r) => r.id !== rubricId ? r : {
      ...r, cells: { ...r.cells, [key]: value }
    })
  }))),

  setRubricType: (rubricId, type) => set((s) => mapSyllabus(s, (syl) => ({
    ...syl,
    rubrics: syl.rubrics.map((r) => r.id !== rubricId ? r : { ...r, type })
  }))),

  // ─── Pools ───
  saveObjectiveToPool: (obj) => {
    const name = get().activeSyllabus?.name
    const pool = [...get().objectivePool, { ...obj, savedToPool: true, syllabusName: name }]
    set({ objectivePool: pool })
    // Also mark in active syllabus
    set((s) => mapSyllabus(s, (syl) => ({
      ...syl,
      objectives: syl.objectives.map((o) => (o.id === obj.id ? { ...o, savedToPool: true } : o))
    })))
    persistPools(pool, get().assignmentPool, get().rubricPool)
  },

  removeObjectiveFromPool: (id) => {
    const pool = get().objectivePool.filter((o) => o.id !== id)
    set({ objectivePool: pool })
    persistPools(pool, get().assignmentPool, get().rubricPool)
  },

  importObjectiveFromPool: (obj) => {
    set((s) => mapSyllabus(s, (syl) => ({
      ...syl,
      objectives: [...syl.objectives, { ...obj, id: uid('obj'), savedToPool: false }]
    })))
  },

  saveAssignmentToPool: (asn) => {
    const name = get().activeSyllabus?.name
    const pool = [...get().assignmentPool, { ...asn, savedToPool: true, syllabusName: name }]
    set({ assignmentPool: pool })
    set((s) => mapSyllabus(s, (syl) => ({
      ...syl,
      assignments: syl.assignments.map((a) => (a.id === asn.id ? { ...a, savedToPool: true } : a))
    })))
    persistPools(get().objectivePool, pool, get().rubricPool)
  },

  removeAssignmentFromPool: (id) => {
    const pool = get().assignmentPool.filter((a) => a.id !== id)
    set({ assignmentPool: pool })
    persistPools(get().objectivePool, pool, get().rubricPool)
  },

  importAssignmentFromPool: (asn) => {
    set((s) => mapSyllabus(s, (syl) => ({
      ...syl,
      assignments: [...syl.assignments, { ...asn, id: uid('asn'), savedToPool: false, linkedObjectiveIds: [] }]
    })))
  },

  saveRubricToPool: (rubric, assignmentName) => {
    const name = get().activeSyllabus?.name
    const pool = [...get().rubricPool, { ...rubric, savedToPool: true, syllabusName: name, assignmentName }]
    set({ rubricPool: pool })
    set((s) => mapSyllabus(s, (syl) => ({
      ...syl,
      rubrics: syl.rubrics.map((r) => (r.id === rubric.id ? { ...r, savedToPool: true } : r))
    })))
    persistPools(get().objectivePool, get().assignmentPool, pool)
  },

  removeRubricFromPool: (id) => {
    const pool = get().rubricPool.filter((r) => r.id !== id)
    set({ rubricPool: pool })
    persistPools(get().objectivePool, get().assignmentPool, pool)
  },

  importRubricFromPool: (rubric, assignmentId) => {
    set((s) => mapSyllabus(s, (syl) => ({
      ...syl,
      rubrics: [...syl.rubrics, { ...rubric, id: uid('rub'), assignmentId, savedToPool: false }]
    })))
  },

  // ─── AI ───
  startGeneration: (target) => set({ isGenerating: true, generatingTarget: target, generationError: null }),
  finishGeneration: () => set({ isGenerating: false, generatingTarget: null }),
  failGeneration: (error) => set({ isGenerating: false, generatingTarget: null, generationError: error }),

  // ─── Library view ───
  setLibraryView: (view) => set({ libraryView: view })
}))
