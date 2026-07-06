import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAppStore } from '@/stores/useAppStore'

function resetCitationApis() {
  useAppStore.setState({
    citationApis: {
      providers: [
        { id: 'crossref', name: 'Crossref', type: 'crossref', enabled: true, apiKey: null }
      ]
    }
  })
}

describe('useAppStore — citationApis slice', () => {
  beforeEach(() => {
    resetCitationApis()
    vi.mocked(window.electronAPI.settings.set).mockClear()
    vi.mocked(window.electronAPI.secrets.set).mockClear()
    vi.mocked(window.electronAPI.secrets.delete).mockClear()
  })

  it('updateCitationApiProvider persists non-sensitive config to settings', () => {
    useAppStore.getState().updateCitationApiProvider('crossref', { contactEmail: 'me@example.edu' })
    const provider = useAppStore.getState().citationApis.providers[0]
    expect(provider.contactEmail).toBe('me@example.edu')

    expect(window.electronAPI.settings.set).toHaveBeenCalledWith('citationApis', {
      providers: [expect.objectContaining({ id: 'crossref', contactEmail: 'me@example.edu' })]
    })
    // The persisted config must NOT carry the apiKey field.
    const persisted = vi.mocked(window.electronAPI.settings.set).mock.calls[0][1] as {
      providers: Record<string, unknown>[]
    }
    expect(persisted.providers[0]).not.toHaveProperty('apiKey')
  })

  it('stores an API key in the keychain, not in settings', () => {
    useAppStore.getState().updateCitationApiProvider('crossref', { apiKey: 'secret-key' })
    expect(window.electronAPI.secrets.set).toHaveBeenCalledWith('citationApi_crossref', 'secret-key')
  })

  it('clearing an API key deletes the secret', () => {
    useAppStore.getState().updateCitationApiProvider('crossref', { apiKey: null })
    expect(window.electronAPI.secrets.delete).toHaveBeenCalledWith('citationApi_crossref')
  })

  it('addCustomCitationApi creates a disabled custom provider with a uid', () => {
    useAppStore.getState().addCustomCitationApi()
    const providers = useAppStore.getState().citationApis.providers
    expect(providers).toHaveLength(2)
    const custom = providers[1]
    expect(custom.type).toBe('custom')
    expect(custom.enabled).toBe(false)
    expect(custom.id).toMatch(/^capi-/)
    expect(custom.headerName).toBe('Authorization')
  })

  it('removeCitationApi drops the provider and deletes its secret', () => {
    useAppStore.getState().addCustomCitationApi()
    const custom = useAppStore.getState().citationApis.providers[1]
    useAppStore.getState().removeCitationApi(custom.id)
    expect(useAppStore.getState().citationApis.providers).toHaveLength(1)
    expect(window.electronAPI.secrets.delete).toHaveBeenCalledWith(`citationApi_${custom.id}`)
  })
})
