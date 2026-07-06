// ─── Document text extraction for presentation input ───
// Pulls plain text out of an uploaded file so the outline generator can work from
// a PDF, Word doc, or plain-text/markdown source. Heavy parsers are dynamically
// imported so they don't bloat the initial bundle.

const PDF_WORKER_SET = { done: false }

async function extractPdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  if (!PDF_WORKER_SET.done) {
    // Vite resolves the worker to a URL; pdfjs runs it off the main thread.
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    PDF_WORKER_SET.done = true
  }
  const doc = await pdfjs.getDocument({ data: buffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((it) => ('str' in it ? (it as { str: string }).str : ''))
      .join(' ')
    pages.push(text)
  }
  return pages.join('\n\n')
}

async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

/** Extract plain text from a file path by extension. Throws with a plain-language
 *  message the UI can show. */
export async function extractTextFromFile(path: string): Promise<string> {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
    return window.electronAPI.fs.readFile(path, 'utf-8')
  }
  const buffer = await window.electronAPI.fs.readFileBuffer(path)
  if (ext === 'pdf') return extractPdf(buffer)
  if (ext === 'docx') return extractDocx(buffer)
  throw new Error('Unsupported file type. Choose a PDF, Word (.docx), text, or Markdown file.')
}

export const DOC_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'markdown']
