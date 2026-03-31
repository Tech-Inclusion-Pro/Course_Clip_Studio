import { useEffect, useRef } from 'react'

interface ScrollSyncOptions {
  editorRef: React.RefObject<HTMLDivElement | null>
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  enabled: boolean
  activeLessonId: string | null
}

export function useScrollSync({
  editorRef,
  iframeRef,
  enabled,
  activeLessonId
}: ScrollSyncOptions) {
  const source = useRef<'editor' | 'preview' | null>(null)
  const lastEditorFire = useRef(0)

  // Reset scroll positions when lesson changes
  useEffect(() => {
    const el = editorRef.current
    if (el) el.scrollTop = 0
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'lumina:scroll-sync', fraction: 0 },
      '*'
    )
  }, [activeLessonId, editorRef, iframeRef])

  // Editor → Preview (throttled)
  useEffect(() => {
    if (!enabled) return
    const el = editorRef.current
    if (!el) return

    const onScroll = () => {
      if (source.current === 'preview') return
      const now = performance.now()
      if (now - lastEditorFire.current < 16) return // ~60fps throttle
      lastEditorFire.current = now

      source.current = 'editor'
      const max = el.scrollHeight - el.clientHeight
      const fraction = max > 0 ? el.scrollTop / max : 0
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'lumina:scroll-sync', fraction },
        '*'
      )
      requestAnimationFrame(() => { source.current = null })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [editorRef, iframeRef, enabled])

  // Preview → Editor
  useEffect(() => {
    if (!enabled) return

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== 'lumina:scroll-sync') return
      if (source.current === 'editor') return
      source.current = 'preview'
      const el = editorRef.current
      if (el) {
        el.scrollTop = e.data.fraction * (el.scrollHeight - el.clientHeight)
      }
      requestAnimationFrame(() => { source.current = null })
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [editorRef, enabled])
}
