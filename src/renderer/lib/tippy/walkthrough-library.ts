/**
 * TIPPY Walkthrough Library — 15 built-in guided walkthroughs.
 *
 * Each walkthrough defines step-by-step instructions, CSS selectors for
 * highlighting, and trigger phrases for auto-detection.
 */

import type { TIPPYWalkthrough } from '@/types/analytics'

export const WALKTHROUGH_LIBRARY: TIPPYWalkthrough[] = [
  // 1. Adding Your First Block
  {
    id: 'wt-add-block',
    title: 'Adding Your First Block',
    triggerPhrases: ['how do i add a block', 'add a block', 'get started', 'add block', 'first block', 'insert block'],
    featureSection: 'Block Library',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'ab-1',
        instruction: 'This is the **Block Palette**. It contains all 32 block types you can add to your lessons. Click the "+" button or press the palette icon to open it.',
        targetSelector: '[data-tour="block-palette"], [data-panel="block-inserter"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'ab-2',
        instruction: 'Block types are organized by category: Text, Media, Interactive, Layout, and Advanced. Browse or search to find the block you need.',
        targetSelector: '[data-tour="block-palette"], [data-panel="block-inserter"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'ab-3',
        instruction: 'Click any block type to add it to the current lesson. It appears on the **Canvas** — the main editing area where you build your content.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'ab-4',
        instruction: 'Once a block is added, select it to see its settings in the **Properties Panel** on the right. Every block type has different configuration options.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 2. Setting Up a Question Bank
  {
    id: 'wt-quiz-bank',
    title: 'Setting Up a Question Bank',
    triggerPhrases: ['question bank', 'quiz bank', 'randomize questions', 'question pool', 'import questions'],
    featureSection: 'Quiz and Assessment',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'qb-1',
        instruction: 'First, add a **Quiz** block to your lesson from the Block Palette. The Quiz block supports multiple-choice, true/false, short-answer, and Likert scale questions.',
        targetSelector: '[data-tour="block-palette"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'qb-2',
        instruction: 'In the Quiz block\'s Properties Panel, find the **Question Bank** section. Here you can create a reusable pool of questions and set how many to randomly draw for each learner.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'qb-3',
        instruction: 'You can also **import questions from CSV**. Prepare a CSV file with columns for question text, answer choices, correct answer, difficulty, and Bloom\'s level, then use the Import button.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'qb-4',
        instruction: 'Set the **randomization** options: pool size (how many questions each learner sees), question shuffle, and answer choice shuffle. This helps prevent cheating and provides variety.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 3. Using the Media Library
  {
    id: 'wt-media-library',
    title: 'Using the Media Library',
    triggerPhrases: ['media library', 'find an image', 'add a photo', 'upload image', 'browse media', 'add image'],
    featureSection: 'Media Library',
    dummyCourseRequired: false,
    steps: [
      {
        id: 'ml-1',
        instruction: 'Open the **Media Library** from the editor toolbar or by clicking "Browse" on any media block. The library has five tabs: All, Built-in, Search Online, My Uploads, and Generated.',
        targetSelector: '[data-tour="toolbar"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'ml-2',
        instruction: 'The **Built-in** tab has icons, shapes, text shapes, and animated blocks included with the app — no API key needed.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'ml-3',
        instruction: 'The **Search Online** tab searches connected providers like Pexels, Unsplash, and Pixabay. Configure providers in Settings > Media Sources.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'ml-4',
        instruction: 'Every image needs **alt text** for accessibility. When you add an image, LuminaUDL prompts you for alt text immediately. TIPPY can also suggest alt text using AI.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 4. Generating Narration
  {
    id: 'wt-narration',
    title: 'Generating Narration',
    triggerPhrases: ['narration', 'audio version', 'text to speech', 'tts', 'generate audio', 'narrate'],
    featureSection: 'AI Features',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'nr-1',
        instruction: 'Select a lesson in the **Outline Panel** that you want to narrate. The narration feature works at the lesson level — it generates a script from all the text content in the lesson.',
        targetSelector: '[data-tour="outline"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'nr-2',
        instruction: 'Open the **AI Assistant** panel and select "Write Narration Script." TIPPY will use the lesson content, your tone preferences, and audience context to draft a narration.',
        targetSelector: '[data-tour="ai-assistant"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'nr-3',
        instruction: 'Review and edit the narration script. Then use a connected audio provider (ElevenLabs, Kokoro/Piper, or OpenAI Whisper) to convert the script to audio. Configure providers in Settings > Audio APIs.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 5. Translating a Block
  {
    id: 'wt-translate',
    title: 'Translating a Block',
    triggerPhrases: ['translate', 'spanish version', 'bilingual', 'other language', 'translate lesson'],
    featureSection: 'AI Features',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'tr-1',
        instruction: 'Select the lesson you want to translate in the **Outline Panel**. Translation works at the lesson level to keep context consistent.',
        targetSelector: '[data-tour="outline"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'tr-2',
        instruction: 'Open the **AI Assistant** panel and select "Translate Lesson." Choose your target language. The AI translates all text content while preserving formatting and block structure.',
        targetSelector: '[data-tour="ai-assistant"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'tr-3',
        instruction: 'Review the translation carefully. AI translations should always be reviewed by a native speaker before publishing, especially for instructional content.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 6. Pre/Post Knowledge Checks
  {
    id: 'wt-knowledge-check',
    title: 'Setting Up Pre/Post Knowledge Checks',
    triggerPhrases: ['knowledge check', 'pre post', 'baseline', 'pre-test', 'post-test', 'growth measurement'],
    featureSection: 'Quiz and Assessment',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'kc-1',
        instruction: 'Add a **Knowledge Check** block from the Block Palette. This is different from a regular Quiz — it tracks learner growth across three phases: Pre, Formative, and Post.',
        targetSelector: '[data-tour="block-palette"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'kc-2',
        instruction: 'In the Properties Panel, set the **phase** (Pre, Formative, or Post) and link the check to specific **learning objectives**. Pre checks are placed before instruction; Post checks after.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'kc-3',
        instruction: 'After learners complete both Pre and Post checks, the **Analytics Dashboard** shows score deltas per objective — so you can measure exactly which concepts learners improved on.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 7. Building Nested Blocks
  {
    id: 'wt-nested-blocks',
    title: 'Building Nested Blocks',
    triggerPhrases: ['nested blocks', 'quiz inside a card', 'put a block inside', 'block inside block', 'nested content'],
    featureSection: 'Block Library',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'nb-1',
        instruction: 'Some blocks can **contain other blocks**. For example, you can nest a Quiz inside an Accordion, or a Video inside a Tab panel. This creates rich, interactive layouts.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'nb-2',
        instruction: 'To nest a block, select a container block (Accordion, Tabs, Flashcard, etc.) and use the Block Palette to add a child block inside it.',
        targetSelector: '[data-tour="block-palette"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'nb-3',
        instruction: 'There are depth limits to prevent overly complex nesting. The Properties Panel shows the nesting level and warns if you approach the limit.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 8. Creating a Hotspot Image Map
  {
    id: 'wt-hotspot',
    title: 'Creating a Hotspot Image Map',
    triggerPhrases: ['hotspot', 'image map', 'clickable image', 'interactive image', 'hotspot map'],
    featureSection: 'Block Library',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'hs-1',
        instruction: 'Add an **Image Map** block from the Block Palette (under Interactive). This creates a clickable image with defined regions (hotspots).',
        targetSelector: '[data-tour="block-palette"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'hs-2',
        instruction: 'Upload or select your base image. Then use the editor to draw rectangular or circular hotspot regions on the image.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'hs-3',
        instruction: 'Each hotspot can display content when clicked or navigate to a specific lesson. Configure the action and content for each region in the Properties Panel.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 9. Fixing a WCAG Issue
  {
    id: 'wt-wcag-fix',
    title: 'Fixing a WCAG Issue',
    triggerPhrases: ['wcag error', 'accessibility flag', 'fix this issue', 'accessibility error', 'wcag fix', 'fix accessibility'],
    featureSection: 'Accessibility',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'wf-1',
        instruction: 'The **Accessibility Audit** panel shows all WCAG issues in your current lesson. Open it from the toolbar. Issues are ranked: Critical, Serious, Moderate, and Minor.',
        targetSelector: '[data-tour="toolbar"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'wf-2',
        instruction: 'Click on any issue to see the affected block, the WCAG success criterion, and a plain-language explanation. Critical issues must be fixed before publishing.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'wf-3',
        instruction: 'Many issues have suggested fixes. For example, missing alt text can be added directly in the block\'s Properties Panel. TIPPY can also suggest alt text using AI.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 10. Exporting to SCORM
  {
    id: 'wt-export-scorm',
    title: 'Exporting to SCORM',
    triggerPhrases: ['export', 'scorm', 'publish to lms', 'export course', 'download course', 'scorm package'],
    featureSection: 'Export',
    dummyCourseRequired: false,
    steps: [
      {
        id: 'es-1',
        instruction: 'Navigate to the **Publish** view using the sidebar. Here you\'ll configure your export format and download the package.',
        targetSelector: '[data-tour="sidebar"]',
        highlightStyle: 'border',
        navigateTo: { panel: 'publish' },
        action: 'none',
        allowSkip: true
      },
      {
        id: 'es-2',
        instruction: 'Choose your export format: SCORM 1.2, SCORM 2004, xAPI, HTML5, PDF, or cmi5. For most LMS platforms, SCORM 1.2 or 2004 is the safest choice.',
        targetSelector: '[data-tour="publish"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'es-3',
        instruction: 'Configure your publish settings: mastery score, completion criteria, and any LMS-specific options. Then click **Export** to download the package.',
        targetSelector: '[data-tour="publish"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 11. Reading the Analytics Dashboard
  {
    id: 'wt-analytics',
    title: 'Reading the Analytics Dashboard',
    triggerPhrases: ['analytics', 'learner data', 'quiz results', 'completion rate', 'dashboard data', 'student progress'],
    featureSection: 'Analytics and Reports',
    dummyCourseRequired: false,
    steps: [
      {
        id: 'an-1',
        instruction: 'The **Analytics Dashboard** is available from the editor\'s side panel. It shows enrollment, completion rates, average scores, and time spent for the active course.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'an-2',
        instruction: 'The **Assessment Analytics** section shows question difficulty, discrimination indices, and pre/post knowledge check comparisons. This helps you identify weak questions.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'an-3',
        instruction: 'The **UDL Engagement** section shows how learners interact with accessibility features: captions, transcripts, audio alternatives, language toggles, and more.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 12. Setting Up Your TIPPY Profile
  {
    id: 'wt-tippy-profile',
    title: 'Setting Up Your TIPPY Profile',
    triggerPhrases: ['get to know you', 'update my profile', 'tell tippy about me', 'tippy profile', 'my profile'],
    featureSection: 'TIPPY',
    dummyCourseRequired: false,
    steps: [
      {
        id: 'tp-1',
        instruction: 'Go to **Settings > TIPPY** to find the Get to Know You section. This is where TIPPY learns about your role, audience, design philosophy, and preferences.',
        targetSelector: '[data-tour="sidebar"]',
        highlightStyle: 'border',
        navigateTo: { panel: 'settings', subPanel: 'tippy' },
        action: 'none',
        allowSkip: true
      },
      {
        id: 'tp-2',
        instruction: 'The onboarding is a conversation — not a form. TIPPY asks questions across 6 sections. You can complete them in any order or skip sections to come back later.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'tp-3',
        instruction: 'Once you\'ve completed your profile, TIPPY uses it to personalize every suggestion. You can export your profile as a markdown file or reset it at any time from Settings.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 13. Building a Chart with AI
  {
    id: 'wt-chart-block',
    title: 'Building a Chart with AI',
    triggerPhrases: ['chart block', 'data visualization', 'add a chart', 'create chart', 'graph block'],
    featureSection: 'Block Library',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'cb-1',
        instruction: 'Add a **Chart** block from the Block Palette (under Advanced). Chart blocks can display bar, line, pie, scatter, and other chart types.',
        targetSelector: '[data-tour="block-palette"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'cb-2',
        instruction: 'You can enter data manually or use AI to generate a chart from a description. Open the AI Assistant and describe the data you want to visualize.',
        targetSelector: '[data-tour="ai-assistant"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'cb-3',
        instruction: 'Configure the chart appearance in the Properties Panel: colors, labels, axes, and accessibility settings. Charts use your brand palette by default. Always include alt text describing the chart\'s key takeaway.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 14. Writing Block with Rubric
  {
    id: 'wt-writing-block',
    title: 'Setting Up a Writing Block with Rubric',
    triggerPhrases: ['writing block', 'open response', 'rubric', 'ai feedback', 'essay block', 'reflection block'],
    featureSection: 'Quiz and Assessment',
    dummyCourseRequired: true,
    steps: [
      {
        id: 'wb-1',
        instruction: 'Add a **Writing** block from the Block Palette (under Interactive). Choose the variant: essay, reflection, journal, or short-response.',
        targetSelector: '[data-tour="block-palette"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'wb-2',
        instruction: 'In the Properties Panel, configure prompt sections with word count constraints. You can add multiple prompts within a single Writing block.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'wb-3',
        instruction: 'Enable **rubric-based assessment** to attach a rubric to the writing block. You can create rubrics in the Syllabus Builder and link them here.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'wb-4',
        instruction: 'AI scoring is available but **FERPA-protected**. You must acknowledge the FERPA warning before enabling it. For privacy, use local Ollama for AI scoring.',
        targetSelector: '[data-tour="properties"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      }
    ]
  },

  // 15. Converting a PDF to Accessible HTML
  {
    id: 'wt-pdf-convert',
    title: 'Converting a PDF to Accessible HTML',
    triggerPhrases: ['convert pdf', 'pdf to html', 'make my pdf accessible', 'import pdf', 'pdf conversion'],
    featureSection: 'Import and Conversion',
    dummyCourseRequired: false,
    steps: [
      {
        id: 'pc-1',
        instruction: 'From the **Dashboard**, use the Import button or the File menu to start a PDF conversion. Select your PDF file to begin.',
        targetSelector: '[data-tour="dashboard"]',
        highlightStyle: 'border',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'pc-2',
        instruction: 'LuminaUDL extracts text, images, and structure from the PDF and converts them into accessible content blocks. The conversion preserves headings, lists, and formatting.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      },
      {
        id: 'pc-3',
        instruction: 'After conversion, review the content carefully. Add alt text to any extracted images, check heading hierarchy, and verify reading order. The Accessibility Audit panel will flag any remaining issues.',
        targetSelector: '[data-tour="canvas"]',
        highlightStyle: 'spotlight',
        action: 'none',
        allowSkip: true
      }
    ]
  }
]

/**
 * Get a walkthrough by ID.
 */
export function getWalkthroughById(id: string): TIPPYWalkthrough | null {
  return WALKTHROUGH_LIBRARY.find((w) => w.id === id) ?? null
}

/**
 * Get all walkthrough summaries for the settings panel.
 */
export function getWalkthroughSummaries(): Array<{ id: string; title: string; stepCount: number }> {
  return WALKTHROUGH_LIBRARY.map((w) => ({
    id: w.id,
    title: w.title,
    stepCount: w.steps.length
  }))
}
