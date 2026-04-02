import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { SyllabusLibraryView } from './library/SyllabusLibraryView'
import { SyllabusWizardShell } from './SyllabusWizardShell'

export function SyllabusBuilderSection(): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)

  if (activeSyllabus) {
    return <SyllabusWizardShell />
  }

  return <SyllabusLibraryView />
}
