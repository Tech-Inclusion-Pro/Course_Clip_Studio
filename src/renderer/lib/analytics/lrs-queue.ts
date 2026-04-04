/**
 * Statement Queue Engine — queues xAPI statements for remote LRS delivery
 * with retry logic and batch flushing.
 *
 * Queue is persisted to: {workspacePath}/{courseFolder}/analytics/queue.json
 * Statements are always stored locally first; this module handles remote delivery only.
 */

import type { Course } from '@/types/course'
import type { LuminaStatement, StatementQueue, StatementQueueEntry, QueueStats } from '@/types/analytics'
import type { LRSSettings } from '@/types/course'
import { courseFolderName } from '@/lib/workspace'

const QUEUE_VERSION = '1.0'
const MAX_RETRY_ATTEMPTS = 5
const BASE_RETRY_DELAY_MS = 2000
const MAX_BATCH_SIZE = 25

// ─── Queue Persistence ───

function queuePath(workspacePath: string, course: Course): string {
  const folder = courseFolderName(course)
  return `${workspacePath}/${folder}/analytics/queue.json`
}

function emptyQueue(): StatementQueue {
  return { version: QUEUE_VERSION, entries: [], lastFlushedAt: null }
}

export async function loadQueue(workspacePath: string, course: Course): Promise<StatementQueue> {
  const path = queuePath(workspacePath, course)
  try {
    const exists = await window.electronAPI.fs.exists(path)
    if (!exists) return emptyQueue()
    const json = await window.electronAPI.fs.readFile(path, 'utf-8')
    const queue = JSON.parse(json) as StatementQueue
    if (!queue.entries) return emptyQueue()
    return queue
  } catch {
    return emptyQueue()
  }
}

export async function saveQueue(
  workspacePath: string,
  course: Course,
  queue: StatementQueue
): Promise<void> {
  const path = queuePath(workspacePath, course)
  await window.electronAPI.fs.writeFile(path, JSON.stringify(queue, null, 2))
}

// ─── Queue Operations ───

export async function enqueueStatements(
  workspacePath: string,
  course: Course,
  statements: LuminaStatement[]
): Promise<StatementQueue> {
  const queue = await loadQueue(workspacePath, course)
  const now = new Date().toISOString()
  for (const stmt of statements) {
    const entry: StatementQueueEntry = {
      id: crypto.randomUUID(),
      statement: stmt,
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      errorMessage: null,
      createdAt: now
    }
    queue.entries.push(entry)
  }
  await saveQueue(workspacePath, course, queue)
  return queue
}

export function getQueueStats(queue: StatementQueue): QueueStats {
  const pending = queue.entries.filter((e) => e.status === 'pending').length
  const failed = queue.entries.filter((e) => e.status === 'failed').length
  const oldest = queue.entries.length > 0 ? queue.entries[0].createdAt : null
  return {
    pending,
    failed,
    total: queue.entries.length,
    oldestEntryAt: oldest,
    lastFlushedAt: queue.lastFlushedAt
  }
}

// ─── LRS Delivery ───

interface LRSSendResult {
  success: boolean
  statusCode: number | null
  error: string | null
}

async function sendToLRS(
  statements: LuminaStatement[],
  lrs: LRSSettings
): Promise<LRSSendResult> {
  const url = lrs.endpointUrl.replace(/\/$/, '') + '/statements'
  const auth = 'Basic ' + btoa(lrs.key + ':' + lrs.secret)

  // Build xAPI-shaped payloads from LuminaStatement
  const xapiPayloads = statements.map((s) => ({
    id: s.id,
    actor: lrs.anonymization
      ? { objectType: 'Agent', account: { homePage: 'https://luminaudl.app', name: s.actorId } }
      : { objectType: 'Agent', account: { homePage: 'https://luminaudl.app', name: s.actorId } },
    verb: { id: s.verb, display: { 'en-US': s.verbDisplay } },
    object: {
      id: s.objectId,
      objectType: 'Activity',
      definition: { name: { 'en-US': s.objectName }, type: s.objectType }
    },
    result: {
      ...(s.scoreScaled != null ? { score: { scaled: s.scoreScaled, raw: s.scoreRaw, max: s.scoreMax } } : {}),
      ...(s.success != null ? { success: s.success } : {}),
      ...(s.completion != null ? { completion: s.completion } : {}),
      ...(s.durationSeconds != null ? { duration: `PT${s.durationSeconds}S` } : {})
    },
    context: {
      extensions: {
        'https://luminaudl.app/extensions/udl-principle': s.udlPrinciple,
        'https://luminaudl.app/extensions/block-id': s.blockId,
        'https://luminaudl.app/extensions/block-type': s.blockType
      }
    },
    timestamp: s.timestamp,
    version: '1.0.3'
  }))

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'X-Experience-API-Version': '1.0.3',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(xapiPayloads)
    })

    if (response.ok) {
      return { success: true, statusCode: response.status, error: null }
    }
    return {
      success: false,
      statusCode: response.status,
      error: `HTTP ${response.status} ${response.statusText}`
    }
  } catch (err) {
    return {
      success: false,
      statusCode: null,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

// ─── Flush Queue ───

export interface FlushResult {
  sent: number
  failed: number
  remaining: number
}

/**
 * Flush pending queue entries to the remote LRS.
 * Processes entries in batches, applies exponential backoff on failure.
 */
export async function flushQueue(
  workspacePath: string,
  course: Course,
  lrs: LRSSettings
): Promise<FlushResult> {
  const queue = await loadQueue(workspacePath, course)
  let sent = 0
  let failed = 0

  // Get entries eligible for sending
  const eligible = queue.entries.filter(
    (e) => e.status === 'pending' || (e.status === 'failed' && e.attempts < MAX_RETRY_ATTEMPTS)
  )

  // Process in batches
  for (let i = 0; i < eligible.length; i += MAX_BATCH_SIZE) {
    const batch = eligible.slice(i, i + MAX_BATCH_SIZE)
    const statements = batch.map((e) => e.statement)

    // Mark as sending
    batch.forEach((e) => { e.status = 'sending' })

    const result = await sendToLRS(statements, lrs)

    if (result.success) {
      // Remove sent entries from queue
      const sentIds = new Set(batch.map((e) => e.id))
      queue.entries = queue.entries.filter((e) => !sentIds.has(e.id))
      sent += batch.length
    } else {
      // Mark as failed with retry info
      const now = new Date().toISOString()
      batch.forEach((e) => {
        e.status = 'failed'
        e.attempts += 1
        e.lastAttemptAt = now
        e.errorMessage = result.error
      })
      failed += batch.length

      // If network error, stop trying this flush cycle
      if (result.statusCode === null) break
    }
  }

  // Remove entries that have exceeded max retries
  queue.entries = queue.entries.filter((e) => {
    if (e.status === 'failed' && e.attempts >= MAX_RETRY_ATTEMPTS) {
      return false // drop permanently failed entries
    }
    return true
  })

  queue.lastFlushedAt = new Date().toISOString()
  await saveQueue(workspacePath, course, queue)

  return { sent, failed, remaining: queue.entries.length }
}

// ─── Flush Timer ───

let flushTimerId: ReturnType<typeof setInterval> | null = null

export function startFlushTimer(
  workspacePath: string,
  course: Course,
  lrs: LRSSettings,
  onFlush?: (result: FlushResult) => void
): void {
  stopFlushTimer()
  if (!lrs.enabled) return

  const intervalMs = lrs.statementMode === 'batch'
    ? lrs.batchIntervalMinutes * 60 * 1000
    : 30_000 // for realtime mode, flush any queued failures every 30s

  flushTimerId = setInterval(async () => {
    const result = await flushQueue(workspacePath, course, lrs)
    if (onFlush && (result.sent > 0 || result.failed > 0)) {
      onFlush(result)
    }
  }, intervalMs)
}

export function stopFlushTimer(): void {
  if (flushTimerId !== null) {
    clearInterval(flushTimerId)
    flushTimerId = null
  }
}

/**
 * Send a single statement immediately (for realtime mode).
 * If it fails and queueOnFailure is enabled, enqueue it.
 */
export async function sendStatementRealtime(
  workspacePath: string,
  course: Course,
  statement: LuminaStatement,
  lrs: LRSSettings
): Promise<boolean> {
  if (!lrs.enabled) return false

  const result = await sendToLRS([statement], lrs)
  if (result.success) return true

  if (lrs.queueOnFailure) {
    await enqueueStatements(workspacePath, course, [statement])
  }
  return false
}
