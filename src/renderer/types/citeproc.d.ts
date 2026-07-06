// Minimal ambient types for citeproc-js (no official types ship).
declare module 'citeproc' {
  interface CiteprocSys {
    retrieveLocale(lang: string): string
    retrieveItem(id: string | number): Record<string, unknown>
  }

  class Engine {
    constructor(sys: CiteprocSys, style: string, lang?: string, forceLang?: boolean)
    updateItems(ids: (string | number)[]): void
    makeBibliography(): [Record<string, unknown>, string[]]
  }

  const CSL: { Engine: typeof Engine; PROCESSOR_VERSION: string } & Record<string, unknown>
  export default CSL
}

// Vite ?raw imports
declare module '*.csl?raw' {
  const content: string
  export default content
}
declare module '*.xml?raw' {
  const content: string
  export default content
}
