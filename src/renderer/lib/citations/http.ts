// ─── Citation HTTP helper ───
//
// All external citation calls go through the main-process `net:request` channel
// (bypasses CORS). That handler has NO timeout and buffers the whole body, so we
// wrap every call in a client-side timeout via Promise.race (integration risk #1).
//
// DATA-MINIMIZATION GUARD (spec §5 / §6.4): callers must pass only bibliographic
// identifiers or queries — a DOI, ORCID iD, title/author, or the user's search
// terms — NEVER learner data or course content. Because nothing identifying a
// learner ever leaves here, citation lookups do not trip the FERPA cloud gate.

export interface CitationHttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
}

export class CitationHttpError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = 'CitationHttpError'
  }
}

const DEFAULT_TIMEOUT_MS = 12_000

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new CitationHttpError('Request timed out')), ms)
  )
}

/** Issue a GET/POST via net:request with a hard client-side timeout. */
export async function citationRequest(opts: {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: string
  timeoutMs?: number
}): Promise<CitationHttpResponse> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...req } = opts
  return Promise.race([window.electronAPI.net.request(req), timeout(timeoutMs)])
}

/** GET + JSON.parse with retry/backoff on 429/503 (spec §5, §11). */
export async function citationGetJson<T = unknown>(
  url: string,
  headers: Record<string, string> = {},
  maxAttempts = 5
): Promise<T> {
  let attempt = 0
  // Exponential backoff: 400ms, 800ms, 1600ms, ...
  for (;;) {
    attempt += 1
    const res = await citationRequest({ url, headers })
    if (res.status === 429 || res.status === 503) {
      if (attempt >= maxAttempts) {
        throw new CitationHttpError('Rate limited. Retrying shortly.', res.status)
      }
      await new Promise((r) => setTimeout(r, 400 * 2 ** (attempt - 1)))
      continue
    }
    if (res.status < 200 || res.status >= 300) {
      throw new CitationHttpError(`Request failed (${res.status})`, res.status)
    }
    return JSON.parse(res.body) as T
  }
}
