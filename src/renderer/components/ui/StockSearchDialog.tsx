import { useState } from 'react'
import { Search, X, Loader2, Download, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { searchStockMedia, getFirstEnabledProvider, type StockResult } from '@/lib/stock-api'
import { getCourseAssetsDir } from '@/lib/asset-manager'

interface StockSearchDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (localPath: string, result: StockResult) => void
  mediaType: 'image' | 'video'
  initialQuery?: string
  title?: string
}

export function StockSearchDialog({
  open,
  onClose,
  onSelect,
  mediaType,
  initialQuery = '',
  title
}: StockSearchDialogProps): JSX.Element | null {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<StockResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [page, setPage] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const visualApis = useAppStore((s) => s.visualApis)
  const videoApis = useAppStore((s) => s.videoApis)
  const workspacePath = useAppStore((s) => s.workspacePath)
  const course = useCourseStore((s) => s.getActiveCourse())

  if (!open) return null

  const providers = mediaType === 'video' ? videoApis.providers : visualApis.providers
  const providerMatch = getFirstEnabledProvider(providers as Array<{ type: string; apiKey: string | null; enabled: boolean }>)
  const hasProvider = !!providerMatch
  // Get the full provider object for display name
  const providerFull = providerMatch
    ? providers.find((p) => p.type === providerMatch.type && p.enabled && p.apiKey)
    : null

  async function handleSearch(searchPage = 1) {
    if (!query.trim() || !providerMatch) return
    setIsSearching(true)
    setError(null)
    try {
      const response = await searchStockMedia(
        providerMatch.type,
        providerMatch.apiKey!,
        query.trim(),
        searchPage
      )
      if (searchPage === 1) {
        setResults(response.results)
      } else {
        setResults((prev) => [...prev, ...response.results])
      }
      setTotalResults(response.totalResults)
      setPage(searchPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSelect(result: StockResult) {
    if (!workspacePath || !course) return
    setIsDownloading(result.id)
    try {
      const assetsDir = getCourseAssetsDir(workspacePath, course)
      await window.electronAPI.fs.mkdir(assetsDir)

      const ext = mediaType === 'video' ? '.mp4' : '.jpg'
      const safeName = result.title.replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 40).trim() || result.provider
      const fileName = `${safeName}-${result.id}-${Date.now().toString(36)}${ext}`
      const destPath = `${assetsDir}/${fileName}`

      await window.electronAPI.net.downloadFile({
        url: result.downloadUrl,
        destPath
      })

      onSelect(destPath, result)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsDownloading(null)
    }
  }

  const hasMore = results.length < totalResults

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {title ?? `Search Stock ${mediaType === 'video' ? 'Videos' : 'Photos'}`}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-[var(--border-default)]">
          {!hasProvider ? (
            <div className="text-xs text-[var(--text-tertiary)] p-2 rounded bg-[var(--bg-muted)]">
              No {mediaType} API provider configured. Go to Settings to enable Pexels, Unsplash, or Pixabay.
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSearch(1) }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${providerFull?.name ?? 'stock'} for ${mediaType}s...`}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-[var(--brand-magenta)] rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
              </button>
            </form>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-xs text-[var(--color-danger-600)] p-2 rounded bg-red-50 mb-3">
              {error}
            </div>
          )}

          {results.length === 0 && !isSearching && !error && (
            <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">
              {hasProvider ? 'Search for stock media above' : 'Configure an API provider in Settings'}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {results.map((result) => (
              <div
                key={`${result.provider}-${result.id}`}
                className="group relative rounded-lg overflow-hidden border border-[var(--border-default)] bg-[var(--bg-muted)] hover:border-[var(--brand-magenta)] cursor-pointer transition-colors"
                onClick={() => handleSelect(result)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={result.thumbnailUrl}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-[var(--text-primary)] truncate">{result.title}</p>
                  <p className="text-[9px] text-[var(--text-tertiary)] truncate">{result.attribution}</p>
                </div>
                {isDownloading === result.id && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={20} className="text-white animate-spin" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1 rounded bg-black/50 text-white">
                    <Download size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isSearching && results.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="text-[var(--text-tertiary)] animate-spin" />
            </div>
          )}

          {hasMore && !isSearching && results.length > 0 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => handleSearch(page + 1)}
                className="flex items-center gap-1 px-4 py-2 text-xs text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
              >
                <ChevronDown size={12} />
                Load More ({results.length} of {totalResults})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
