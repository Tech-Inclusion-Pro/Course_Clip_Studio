import type { DeckObject } from '@/types/presentation'

export function deckFolderName(deck: DeckObject): string {
  const safe = deck.title
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 48)
  const suffix = deck.id.slice(-8)
  return `${safe}-${suffix}`
}

export async function saveDeckToWorkspace(
  workspacePath: string,
  deck: DeckObject
): Promise<void> {
  const presDir = `${workspacePath}/presentations`
  const folderName = deckFolderName(deck)
  const folderPath = `${presDir}/${folderName}`
  const filePath = `${folderPath}/deck.json`

  // Check for renamed folder (same id suffix)
  const suffix = deck.id.slice(-8)
  try {
    const entries = await window.electronAPI.fs.readDir(presDir)
    for (const entry of entries) {
      if (entry.isDirectory && entry.name.endsWith(`-${suffix}`) && entry.name !== folderName) {
        await window.electronAPI.fs.removeDir(`${presDir}/${entry.name}`)
      }
    }
  } catch {
    // presentations dir may not exist yet
  }

  await window.electronAPI.fs.writeFile(filePath, JSON.stringify(deck, null, 2))
}

export async function loadDecksFromWorkspace(workspacePath: string): Promise<DeckObject[]> {
  const presDir = `${workspacePath}/presentations`
  const decks: DeckObject[] = []

  try {
    const entries = await window.electronAPI.fs.readDir(presDir)
    for (const entry of entries) {
      if (!entry.isDirectory) continue
      const deckPath = `${presDir}/${entry.name}/deck.json`
      const exists = await window.electronAPI.fs.exists(deckPath)
      if (!exists) continue

      try {
        const json = await window.electronAPI.fs.readFile(deckPath, 'utf-8')
        const deck = JSON.parse(json) as DeckObject
        if (deck.id && deck.slides) {
          decks.push(deck)
        }
      } catch {
        console.warn(`Skipping corrupt deck at ${deckPath}`)
      }
    }
  } catch {
    // presentations dir doesn't exist yet
  }

  return decks
}

export async function deleteDeckFromWorkspace(
  workspacePath: string,
  deckId: string
): Promise<void> {
  const presDir = `${workspacePath}/presentations`
  const suffix = deckId.slice(-8)

  try {
    const entries = await window.electronAPI.fs.readDir(presDir)
    for (const entry of entries) {
      if (entry.isDirectory && entry.name.endsWith(`-${suffix}`)) {
        await window.electronAPI.fs.removeDir(`${presDir}/${entry.name}`)
        return
      }
    }
  } catch {
    // ignore if dir doesn't exist
  }
}

export function getDeckAssetsDir(workspacePath: string, deck: DeckObject): string {
  const presDir = `${workspacePath}/presentations`
  return `${presDir}/${deckFolderName(deck)}/assets`
}
