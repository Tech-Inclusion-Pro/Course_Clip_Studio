export interface ActionDeps {
  navigateToLesson: (lessonId: string) => void
  setVariable: (id: string, value: boolean | number | string) => void
  adjustVariable: (id: string, op: 'increment' | 'decrement' | 'append', amount: number | string) => void
  setBlockVisibility: (blockId: string, visible: boolean) => void
  announcePolite: (message: string) => void
  announceAssertive: (message: string) => void
}
