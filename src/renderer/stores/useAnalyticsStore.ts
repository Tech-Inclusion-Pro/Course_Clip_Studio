import { create } from 'zustand'
import type { Course } from '@/types/course'
import type { LuminaStatement, CourseAnalyticsSummary, AssessmentAnalyticsSummary, UDLEngagementSummary, AccessibilityReportSummary, QueueStats } from '@/types/analytics'
import {
  loadStatements,
  clearStatements,
  addStatements,
  importStatementsFromJson
} from '@/lib/analytics/statement-store'
import { computeCourseSummary } from '@/lib/analytics/analytics-aggregator'
import { computeAssessmentAnalytics } from '@/lib/analytics/assessment-aggregator'
import { computeUDLEngagement, computeAccessibilityReport } from '@/lib/analytics/udl-aggregator'
import {
  loadQueue,
  getQueueStats,
  enqueueStatements,
  flushQueue,
  sendStatementRealtime,
  startFlushTimer,
  stopFlushTimer
} from '@/lib/analytics/lrs-queue'

interface AnalyticsState {
  statements: LuminaStatement[]
  summary: CourseAnalyticsSummary | null
  assessmentSummary: AssessmentAnalyticsSummary | null
  udlSummary: UDLEngagementSummary | null
  accessibilitySummary: AccessibilityReportSummary | null
  selectedAssessmentId: string | null
  isLoading: boolean
  dateRange: { start: string; end: string } | null

  // Phase 4: LRS queue state
  queueStats: QueueStats | null
  isFlushing: boolean
  lastFlushResult: { sent: number; failed: number } | null

  loadStatements: (workspacePath: string, course: Course) => Promise<void>
  refreshSummary: (course: Course) => void
  refreshAssessmentSummary: (course: Course) => void
  setSelectedAssessment: (blockId: string | null) => void
  clearData: (workspacePath: string, course: Course) => Promise<void>
  importData: (jsonString: string, workspacePath: string, course: Course) => Promise<void>
  setDateRange: (range: { start: string; end: string } | null) => void

  // Phase 4: LRS queue actions
  refreshQueueStats: (workspacePath: string, course: Course) => Promise<void>
  flushLRSQueue: (workspacePath: string, course: Course) => Promise<void>
  startLRSSync: (workspacePath: string, course: Course) => void
  stopLRSSync: () => void
  sendToLRS: (workspacePath: string, course: Course, statement: LuminaStatement) => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  statements: [],
  summary: null,
  assessmentSummary: null,
  udlSummary: null,
  accessibilitySummary: null,
  selectedAssessmentId: null,
  isLoading: false,
  dateRange: null,

  // Phase 4 state
  queueStats: null,
  isFlushing: false,
  lastFlushResult: null,

  loadStatements: async (workspacePath, course) => {
    set({ isLoading: true })
    try {
      const store = await loadStatements(workspacePath, course)
      const filtered = filterByDateRange(store.statements, get().dateRange)
      set({
        statements: store.statements,
        summary: computeCourseSummary(filtered, course),
        assessmentSummary: computeAssessmentAnalytics(filtered, course),
        udlSummary: computeUDLEngagement(filtered),
        accessibilitySummary: computeAccessibilityReport(filtered),
        isLoading: false
      })
      // Also load queue stats
      const queue = await loadQueue(workspacePath, course)
      set({ queueStats: getQueueStats(queue) })
    } catch {
      set({ isLoading: false })
    }
  },

  refreshSummary: (course) => {
    const { statements, dateRange } = get()
    const filtered = filterByDateRange(statements, dateRange)
    set({
      summary: computeCourseSummary(filtered, course),
      assessmentSummary: computeAssessmentAnalytics(filtered, course),
      udlSummary: computeUDLEngagement(filtered),
      accessibilitySummary: computeAccessibilityReport(filtered),
    })
  },

  refreshAssessmentSummary: (course) => {
    const { statements, dateRange } = get()
    const filtered = filterByDateRange(statements, dateRange)
    set({ assessmentSummary: computeAssessmentAnalytics(filtered, course) })
  },

  setSelectedAssessment: (blockId) => {
    set({ selectedAssessmentId: blockId })
  },

  clearData: async (workspacePath, course) => {
    await clearStatements(workspacePath, course)
    set({ statements: [], summary: null, assessmentSummary: null, udlSummary: null, accessibilitySummary: null, selectedAssessmentId: null, queueStats: null })
  },

  importData: async (jsonString, workspacePath, course) => {
    set({ isLoading: true })
    try {
      const newStatements = importStatementsFromJson(jsonString)
      const store = await addStatements(workspacePath, course, newStatements)
      const filtered = filterByDateRange(store.statements, get().dateRange)
      set({
        statements: store.statements,
        summary: computeCourseSummary(filtered, course),
        assessmentSummary: computeAssessmentAnalytics(filtered, course),
        udlSummary: computeUDLEngagement(filtered),
        accessibilitySummary: computeAccessibilityReport(filtered),
        isLoading: false
      })
    } catch {
      set({ isLoading: false })
    }
  },

  setDateRange: (range) => {
    set({ dateRange: range })
  },

  // Phase 4: LRS queue actions

  refreshQueueStats: async (workspacePath, course) => {
    const queue = await loadQueue(workspacePath, course)
    set({ queueStats: getQueueStats(queue) })
  },

  flushLRSQueue: async (workspacePath, course) => {
    const lrs = course.settings.lrs
    if (!lrs?.enabled) return
    set({ isFlushing: true })
    try {
      const result = await flushQueue(workspacePath, course, lrs)
      const queue = await loadQueue(workspacePath, course)
      set({
        queueStats: getQueueStats(queue),
        lastFlushResult: { sent: result.sent, failed: result.failed },
        isFlushing: false
      })
    } catch {
      set({ isFlushing: false })
    }
  },

  startLRSSync: (workspacePath, course) => {
    const lrs = course.settings.lrs
    if (!lrs?.enabled) return
    startFlushTimer(workspacePath, course, lrs, async (result) => {
      const queue = await loadQueue(workspacePath, course)
      set({
        queueStats: getQueueStats(queue),
        lastFlushResult: { sent: result.sent, failed: result.failed }
      })
    })
  },

  stopLRSSync: () => {
    stopFlushTimer()
  },

  sendToLRS: async (workspacePath, course, statement) => {
    const lrs = course.settings.lrs
    if (!lrs?.enabled) return
    if (lrs.statementMode === 'realtime') {
      await sendStatementRealtime(workspacePath, course, statement, lrs)
    } else {
      await enqueueStatements(workspacePath, course, [statement])
    }
    const queue = await loadQueue(workspacePath, course)
    set({ queueStats: getQueueStats(queue) })
  }
}))

function filterByDateRange(
  statements: LuminaStatement[],
  range: { start: string; end: string } | null
): LuminaStatement[] {
  if (!range) return statements
  return statements.filter((s) => s.timestamp >= range.start && s.timestamp <= range.end)
}
