import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { persistWorkspacePath, loadWorkspace } from '@/lib/workspace'

export function WorkspacePickerDialog(): JSX.Element {
  const setWorkspacePath = useAppStore((s) => s.setWorkspacePath)
  const setCourses = useCourseStore((s) => s.setCourses)

  async function handleChooseFolder() {
    const result = await window.electronAPI.dialog.openDirectory()
    if (result.canceled || !result.filePaths[0]) return

    const path = result.filePaths[0]
    await persistWorkspacePath(path)
    setWorkspacePath(path)

    const courses = await loadWorkspace(path)
    if (courses.length > 0) {
      setCourses(courses)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center">
        <FolderOpen size={32} className="text-[var(--text-tertiary)]" />
      </div>
      <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
        Choose a Workspace Folder
      </h2>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
        Pick a folder on your computer where courses will be saved. Each course is stored as a
        subfolder with a <code className="text-xs bg-[var(--bg-muted)] px-1 py-0.5 rounded">course.json</code> file.
      </p>
      <Button variant="primary" size="lg" onClick={handleChooseFolder}>
        <FolderOpen size={18} />
        Choose Folder
      </Button>
    </div>
  )
}
