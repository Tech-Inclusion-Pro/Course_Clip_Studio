// ─── Unified Stock Media API Client ───

export interface StockResult {
  id: string
  thumbnailUrl: string
  previewUrl: string
  downloadUrl: string
  title: string
  attribution: string
  width: number
  height: number
  mediaType: 'image' | 'video'
  provider: string
}

export interface StockSearchResponse {
  results: StockResult[]
  totalResults: number
  page: number
  perPage: number
}

// ─── Pexels Images ───

export async function searchPexelsImages(
  apiKey: string,
  query: string,
  page = 1,
  perPage = 20
): Promise<StockSearchResponse> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const res = await window.electronAPI.net.request({
    url,
    headers: { Authorization: apiKey }
  })
  const data = JSON.parse(res.body)
  return {
    results: (data.photos ?? []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      thumbnailUrl: (p.src as Record<string, string>).medium,
      previewUrl: (p.src as Record<string, string>).large,
      downloadUrl: (p.src as Record<string, string>).original,
      title: (p.alt as string) || 'Pexels photo',
      attribution: `Photo by ${(p.photographer as string) || 'Unknown'} on Pexels`,
      width: p.width as number,
      height: p.height as number,
      mediaType: 'image' as const,
      provider: 'pexels'
    })),
    totalResults: data.total_results ?? 0,
    page,
    perPage
  }
}

// ─── Unsplash Images ───

export async function searchUnsplashImages(
  apiKey: string,
  query: string,
  page = 1,
  perPage = 20
): Promise<StockSearchResponse> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const res = await window.electronAPI.net.request({
    url,
    headers: { Authorization: `Client-ID ${apiKey}` }
  })
  const data = JSON.parse(res.body)
  return {
    results: (data.results ?? []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      thumbnailUrl: (p.urls as Record<string, string>).small,
      previewUrl: (p.urls as Record<string, string>).regular,
      downloadUrl: (p.urls as Record<string, string>).full,
      title: (p.description as string) || (p.alt_description as string) || 'Unsplash photo',
      attribution: `Photo by ${(p.user as Record<string, string>)?.name || 'Unknown'} on Unsplash`,
      width: p.width as number,
      height: p.height as number,
      mediaType: 'image' as const,
      provider: 'unsplash'
    })),
    totalResults: data.total ?? 0,
    page,
    perPage
  }
}

// ─── Pixabay Images ───

export async function searchPixabayImages(
  apiKey: string,
  query: string,
  page = 1,
  perPage = 20
): Promise<StockSearchResponse> {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&image_type=photo`
  const res = await window.electronAPI.net.request({ url })
  const data = JSON.parse(res.body)
  return {
    results: (data.hits ?? []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      thumbnailUrl: p.previewURL as string,
      previewUrl: p.webformatURL as string,
      downloadUrl: p.largeImageURL as string,
      title: (p.tags as string) || 'Pixabay photo',
      attribution: `Image by ${(p.user as string) || 'Unknown'} on Pixabay`,
      width: p.imageWidth as number,
      height: p.imageHeight as number,
      mediaType: 'image' as const,
      provider: 'pixabay'
    })),
    totalResults: data.totalHits ?? 0,
    page,
    perPage
  }
}

// ─── Pexels Videos ───

export async function searchPexelsVideos(
  apiKey: string,
  query: string,
  page = 1,
  perPage = 20
): Promise<StockSearchResponse> {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const res = await window.electronAPI.net.request({
    url,
    headers: { Authorization: apiKey }
  })
  const data = JSON.parse(res.body)
  return {
    results: (data.videos ?? []).map((v: Record<string, unknown>) => {
      const files = (v.video_files as Record<string, unknown>[]) ?? []
      const best = files.find((f) => f.quality === 'hd') || files[0] || {}
      return {
        id: String(v.id),
        thumbnailUrl: (v.image as string) || '',
        previewUrl: (v.image as string) || '',
        downloadUrl: (best.link as string) || '',
        title: `Pexels video #${v.id}`,
        attribution: `Video by ${(v.user as Record<string, string>)?.name || 'Unknown'} on Pexels`,
        width: (best.width as number) || (v.width as number) || 0,
        height: (best.height as number) || (v.height as number) || 0,
        mediaType: 'video' as const,
        provider: 'pexels'
      }
    }),
    totalResults: data.total_results ?? 0,
    page,
    perPage
  }
}

// ─── Pixabay Videos ───

export async function searchPixabayVideos(
  apiKey: string,
  query: string,
  page = 1,
  perPage = 20
): Promise<StockSearchResponse> {
  const url = `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const res = await window.electronAPI.net.request({ url })
  const data = JSON.parse(res.body)
  return {
    results: (data.hits ?? []).map((v: Record<string, unknown>) => {
      const videos = v.videos as Record<string, Record<string, unknown>>
      const medium = videos?.medium || videos?.small || {}
      return {
        id: String(v.id),
        thumbnailUrl: `https://i.vimeocdn.com/video/${v.picture_id}_295x166.jpg`,
        previewUrl: `https://i.vimeocdn.com/video/${v.picture_id}_640x360.jpg`,
        downloadUrl: (medium.url as string) || '',
        title: (v.tags as string) || 'Pixabay video',
        attribution: `Video by ${(v.user as string) || 'Unknown'} on Pixabay`,
        width: (medium.width as number) || 0,
        height: (medium.height as number) || 0,
        mediaType: 'video' as const,
        provider: 'pixabay'
      }
    }),
    totalResults: data.totalHits ?? 0,
    page,
    perPage
  }
}

// ─── Dispatcher ───

type ProviderLike = { type: string; apiKey: string | null; enabled: boolean }

export function getFirstEnabledProvider<T extends ProviderLike>(providers: T[]): T | null {
  return providers.find((p) => p.enabled && p.apiKey) ?? null
}

export async function searchStockMedia(
  providerType: string,
  apiKey: string,
  query: string,
  page = 1,
  perPage = 20
): Promise<StockSearchResponse> {
  switch (providerType) {
    case 'pexels':
      return searchPexelsImages(apiKey, query, page, perPage)
    case 'unsplash':
      return searchUnsplashImages(apiKey, query, page, perPage)
    case 'pixabay':
      return searchPixabayImages(apiKey, query, page, perPage)
    case 'pexels-video':
      return searchPexelsVideos(apiKey, query, page, perPage)
    case 'pixabay-video':
      return searchPixabayVideos(apiKey, query, page, perPage)
    default:
      return { results: [], totalResults: 0, page, perPage }
  }
}
