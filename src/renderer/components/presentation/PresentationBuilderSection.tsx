import { usePresentationStore } from '@/stores/usePresentationStore'
import { PresentationLibraryView } from './PresentationLibraryView'
import { PresentationBuilderShell } from './PresentationBuilderShell'

export function PresentationBuilderSection(): JSX.Element {
  const activeDraft = usePresentationStore((s) => s.activeDraft)
  const activeDeck = usePresentationStore((s) => s.activeDeck)

  if (activeDraft || activeDeck) {
    return <PresentationBuilderShell />
  }

  return <PresentationLibraryView />
}
