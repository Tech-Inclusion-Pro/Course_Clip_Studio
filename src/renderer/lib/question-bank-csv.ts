/**
 * CSV template generation and parsing for the Question Bank.
 * Generates .csv files that open in Excel, Google Sheets, etc.
 */

import { uid } from './uid'
import type { QuizQuestion, QuizChoice } from '@/types/course'

const CSV_HEADERS = [
  'Type',
  'Prompt',
  'Choice1',
  'Choice2',
  'Choice3',
  'Choice4',
  'CorrectChoice',
  'FeedbackCorrect',
  'FeedbackIncorrect'
]

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current.trim())
  return fields
}

/**
 * Generate a CSV template string with example rows.
 */
export function generateQuestionBankTemplate(): string {
  const rows = [
    CSV_HEADERS.join(','),
    // Example rows
    'multiple-choice,"What is the capital of France?",Paris,London,Berlin,Madrid,1,"Correct! Paris is the capital of France.","Incorrect. The capital of France is Paris."',
    'true-false,"The Earth is flat.",True,False,,,2,"Correct! The Earth is not flat.","Incorrect. The Earth is round."',
    'multiple-choice,"Which planet is closest to the Sun?",Mercury,Venus,Earth,Mars,1,"Correct!","Incorrect. Mercury is closest to the Sun."',
    'short-answer,"Name one programming language.",,,,,,"","(Short answer questions are not auto-graded)"',
    ''
  ]
  return rows.join('\n')
}

/**
 * Parse a CSV string into QuizQuestion objects.
 */
export function parseQuestionBankCsv(csvText: string): QuizQuestion[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  // Skip header row
  const dataLines = lines.slice(1)
  const questions: QuizQuestion[] = []

  for (const line of dataLines) {
    const fields = parseCsvLine(line)
    if (fields.length < 2) continue

    const [type, prompt, c1, c2, c3, c4, correctStr, fbCorrect, fbIncorrect] = fields
    const qType = type?.toLowerCase().trim() as QuizQuestion['type']

    if (!prompt?.trim()) continue
    if (!['multiple-choice', 'true-false', 'short-answer', 'likert'].includes(qType)) continue

    const choices: QuizChoice[] = []
    const correctIdx = parseInt(correctStr || '0') - 1 // 1-based in CSV

    if (qType === 'multiple-choice' || qType === 'true-false') {
      const choiceLabels = [c1, c2, c3, c4].filter((c) => c?.trim())
      choiceLabels.forEach((label, idx) => {
        choices.push({
          id: uid('choice'),
          label: label.trim(),
          isCorrect: idx === correctIdx
        })
      })
    }

    const question: QuizQuestion = {
      id: uid('q'),
      type: qType,
      prompt: prompt.trim(),
      choices,
      correctId: choices.find((c) => c.isCorrect)?.id ?? '',
      feedbackCorrect: fbCorrect?.trim() ?? '',
      feedbackIncorrect: fbIncorrect?.trim() ?? ''
    }
    questions.push(question)
  }

  return questions
}

/**
 * Export existing questions to CSV string.
 */
export function exportQuestionsToCsv(questions: QuizQuestion[]): string {
  const rows = [CSV_HEADERS.join(',')]

  for (const q of questions) {
    const choiceLabels = q.choices.map((c) => c.label)
    const correctIdx = q.choices.findIndex((c) => c.isCorrect) + 1 // 1-based

    rows.push([
      escapeCsvField(q.type),
      escapeCsvField(q.prompt),
      escapeCsvField(choiceLabels[0] ?? ''),
      escapeCsvField(choiceLabels[1] ?? ''),
      escapeCsvField(choiceLabels[2] ?? ''),
      escapeCsvField(choiceLabels[3] ?? ''),
      String(correctIdx || ''),
      escapeCsvField(q.feedbackCorrect),
      escapeCsvField(q.feedbackIncorrect)
    ].join(','))
  }

  return rows.join('\n')
}
