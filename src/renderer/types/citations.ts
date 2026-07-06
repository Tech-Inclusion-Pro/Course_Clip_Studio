// ─── Knowledge Web: Citation types ───
//
// Citation sources are metadata/verification lookups only. Per the data-minimization
// guard, adapters send ONLY a DOI, ORCID iD, title/author, or user query — never
// learner data or course content — so these lookups never trip the FERPA cloud gate.

/** A configurable citation/research source. Mirrors VisualApiProvider so it plugs into
 *  the same settings + secrets persistence pattern. Most sources are keyless, so
 *  `apiKey` stays nullable and enable/search guards must allow `apiKey === null`. */
export interface CitationSourceProvider {
  id: string
  name: string
  type:
    | 'crossref'
    | 'datacite'
    | 'openalex'
    | 'semanticScholar'
    | 'pubmed'
    | 'unpaywall'
    | 'arxiv'
    | 'core'
    | 'grobid'
    | 'custom'
  enabled: boolean
  apiKey: string | null
  contactEmail?: string // polite-pool APIs (Crossref/Unpaywall mailto)
  endpoint?: string // custom sources
  headerName?: string // custom sources (e.g. 'Authorization')
  headerValuePrefix?: string // custom sources (e.g. 'Bearer ')
  local?: boolean // runs on-device (e.g. Grobid)
  localEndpoint?: string // e.g. http://localhost:8070
}

/** Minimal CSL-JSON record — the lingua franca fed to citeproc for APA 7 formatting. */
export interface CslName {
  family?: string
  given?: string
  literal?: string
  /** ORCID iD when the source vouches for it (non-CSL; used for identity badges). */
  ORCID?: string
}

/** ORCID identity settings (spec §4). Pass-through is keyless and always available;
 *  native own-record is an opt-in read-public OAuth (client-credentials) integration.
 *  Secrets (client secret, cached token) live in the OS keychain, not here. */
export interface OrcidSettings {
  passThroughDisambiguation: boolean // default true; no credentials
  nativeOwnRecord: {
    enabled: boolean // default false
    clientId?: string
    clientSecret?: string | null // runtime only; persisted in the OS keychain, not settings
    userOrcidId?: string
    environment: 'production' | 'sandbox'
  }
}

export interface CslDate {
  'date-parts'?: number[][]
  raw?: string
}

export interface CitationSourceRecord {
  id: string
  type: string // CSL type, e.g. 'article-journal', 'book', 'webpage'
  title?: string
  author?: CslName[]
  issued?: CslDate
  DOI?: string
  URL?: string
  'container-title'?: string
  publisher?: string
  volume?: string
  issue?: string
  page?: string
  abstract?: string
  retrievedFrom?: CitationSourceProvider['type']
}

// ─── Verification states ───

export type DoiVerification = 'verified' | 'mismatch' | 'not_found' | 'no_doi'
export type ClaimReview =
  | 'human_supported'
  | 'human_rejected'
  | 'unclear'
  | 'abstract_unavailable'
export type AuthorIdentity = 'orcid_verified' | 'unverified'

export interface Tier1Result {
  state: DoiVerification
  resolvedTitle?: string
  resolvedFirstAuthor?: string
  resolvedYear?: number
}

/** Provenance bundle (spec §9). A condensed form lands in ContentAreaFile.context. */
export interface CitationProvenance {
  sourceClass: 'vetted_corpus' | 'obsidian_vault' | 'open_web'
  doiVerification: DoiVerification
  claimReview?: ClaimReview
  authorIdentity?: AuthorIdentity
  retrievedFrom: CitationSourceProvider['type'][]
}

/** Metadata for a bound Knowledge Web note (kept in the citations store, keyed by
 *  ContentAreaFile.id — the heavy payload that stays out of types/course.ts). */
export interface CitationNote {
  id: string
  contentAreaFileId?: string
  record: CitationSourceRecord
  apa: string
  apaIncomplete?: { missingField: string }
  tier1: Tier1Result
  tier2?: { review: ClaimReview; claim?: string; reviewer?: string; reviewedAt?: string }
  provenance: CitationProvenance
}
