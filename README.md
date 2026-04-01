<p align="center">
  <img src="resources/icon.png" alt="Course Clip Studio logo" width="128" height="128" style="border-radius: 20px;" />
</p>

<h1 align="center">Course Clip Studio</h1>

<p align="center">
  A cross-platform desktop course authoring application built with Universal Design for Learning (UDL) as a first principle.
</p>

---

## What Is Course Clip Studio?

Course Clip Studio is a professional-grade desktop application for creating accessible, interactive e-learning courses. It exports to industry-standard formats (SCORM 1.2, SCORM 2004, xAPI, HTML5, PDF) and is designed from the ground up with WCAG 2.1 AA accessibility compliance. Every feature — from the floating accessibility widget to the built-in audit engine — ensures that both course authors and learners have an inclusive experience.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron 33 |
| Frontend | React 18 + TypeScript |
| Build Tool | electron-vite 5 (Vite 7) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| State Management | Zustand |
| Icons | lucide-react |
| Internationalization | i18next |
| AI Providers | Anthropic (Claude), OpenAI (GPT), Ollama (local) |

## Features

### Sign-In & User Profiles

Course Clip Studio includes a local authentication system — no server or internet required.

| Feature | Description |
|---|---|
| Local User Profiles | Register with name and email, stored in the app's settings |
| PIN Authentication | Set a 4-, 5-, or 6-digit PIN for quick sign-in |
| Stay Signed In | Toggle to skip PIN entry on subsequent app launches |
| Session Management | Sign out from Settings > General > Session card |
| Secure PIN Storage | PINs encrypted via Electron's `safeStorage` API (OS keychain) |

### First-Launch Onboarding Wizard

New users are guided through a 7-step setup wizard on their first login:

1. **Welcome** — Introduction and overview
2. **General** — Author name, default language, auto-save interval, theme selection
3. **AI / LLM** — Connect an AI provider (Anthropic, OpenAI, or Ollama) and set API keys
4. **Visual APIs** — Enable stock image providers (Pexels, Unsplash, Pixabay) or add custom APIs
5. **Branding** — Create a brand kit with custom colors and fonts
6. **Accessibility** — Configure high contrast, font size, reduced motion, color blind mode, and reading aids
7. **Complete** — Summary and "Get Started" button

Each step is optional and can be skipped. All settings can be changed later from the Settings page.

### Course Authoring

- **19 content block types** — Text, Image/Media, Video, Audio, Quiz, Drag & Drop, Matching, Accordion, Tabs, Flashcard, Branching Scenario, Embed, Code, Divider, Callout, H5P, HTML / Rich Text, Plugin, and Feedback Form
- **HTML / Rich Text block** — Full code editor (HTML/CSS/JS tabs via Monaco) with live preview toggle, allowing users to add any custom content
- **Block animations** — Fade-in, slide-up, slide-left, and scale with configurable duration and delay
- **Rich text editing** — TipTap-powered editor with formatting toolbar
- **Drag-and-drop reordering** — Reorder blocks, lessons, and modules via drag and drop
- **Question bank** — Reusable quiz question library per course with CSV import/export, downloadable template, and linking to quiz blocks
- **Reading level analysis** — Automatic Flesch-Kincaid Grade Level calculation per text block and per course
- **Lesson completion criteria** — Per-lesson requirements including quiz pass score, interactive block completion, and minimum time on page
- **Completion criteria display** — Automatic "To complete this lesson" reference block rendered in preview/export when criteria are set
- **Course enrollment page** — Optional enrollment overlay on course start that captures the learner's name for certificate auto-population

### Multi-Panel Editor

- **Course tree navigator** — Hierarchical view of modules and lessons with drag-drop reordering
- **Editor canvas** — Visual block editor with insertion toolbar and block property editing
- **Split preview pane** — Side-by-side editing and preview with scroll synchronization
- **Theme editor** — Customize colors, fonts, branding, player shell, and loading screens per course
- **AI assistant panel** — AI-powered content generation and analysis (see AI Features below)
- **Accessibility audit panel** — Real-time WCAG 2.1 AA compliance checking
- **Certificate designer** — Design and preview completion certificates
- **Version history panel** — Save named checkpoints and restore previous versions
- **Collaborator notes panel** — Threaded discussion notes attached to specific blocks
- **Branching graph view** — Visualize branching scenario connections

### Canvas Editing Modes

- **Block canvas mode** — Default vertical block layout
- **Slide-based layout mode** — Presentation-style editing with freeform positioning
- **Grid overlay** — Pixel-perfect alignment guide
- **Smart guides** — Automatic alignment detection
- **Snap-to-grid** — Precision block placement

### Branching Scenarios

- **User-choice mode** — Learners click a choice to navigate between branches
- **Criteria-based mode** — System routes learners based on quiz score, lesson completion, or time spent
- **Up to 6 branches** per branching block with configurable criteria per branch
- **Destination selection** — Navigate to any lesson grouped by module
- **Restart / wipe progress** — Branch action to restart the course and clear all learner progress
- **Consequence feedback** — Display feedback text after each branch choice

### AI Features

Supports **Anthropic (Claude)**, **OpenAI (GPT-4)**, and **Ollama (local models)** as LLM providers. All API calls route through Electron IPC (`net.request`) to bypass CORS restrictions.

| Feature | Description |
|---|---|
| Course Outline Generation | Interactive interview-based course creation with learning objectives, audience, tone, and format selection |
| Lesson Content Generation | AI-generated text blocks, callouts, accordions, and tabs based on lesson descriptions |
| Quiz Generation | Auto-generate multiple-choice and true/false questions with feedback |
| Narration Script Generation | Conversational narration for audio accompaniment |
| Alt Text Generation | WCAG-compliant alt text for images based on context |
| Content Translation | Translate course content while preserving structure and IDs |
| WCAG Review | Analyze lessons for WCAG 2.1 AA issues with severity levels |
| UDL Suggestions | Recommendations across Representation, Action & Expression, and Engagement pillars |
| Master Key Upload | Load a markdown reference document for context-aware generation with enable/disable toggle |
| Reference Files | Upload multiple reference files (.md, .txt, .html, etc.) with per-file notes describing what you like and how the AI should use each file |
| Base Brain | Persistent design DNA settings (design assumptions, tone & voice, visual preferences, goals, reference files) that inform all AI generation when enabled |

### Visual / Image API Integration

Connect stock image providers to search and insert photos directly into courses.

| Provider | Type | Description |
|---|---|---|
| Pexels | Built-in | Free stock photos with API key |
| Unsplash | Built-in | Free high-resolution photos with API key |
| Pixabay | Built-in | Free images, videos, and vectors with API key |
| Custom | User-defined | Any image API with configurable endpoint, auth header, and key |

API keys are encrypted via Electron's `safeStorage` API. Provider settings are managed in Settings > AI/LLM > Visual / Image APIs.

### Export Formats

| Format | Description |
|---|---|
| SCORM 1.2 | Legacy SCORM packaging with API script, manifest, and lesson HTML |
| SCORM 2004 | Modern SCORM 2004 (2nd, 3rd, 4th edition) with updated API and manifest |
| xAPI (Experience API) | LRS-compatible statements with configurable endpoint and authentication |
| HTML5 | Self-contained ZIP with localStorage-based progress tracking — no server required |
| PDF | Print-optimized export with optional quiz answers and UDL checklist inclusion |

### Import Capabilities

| Format | Description |
|---|---|
| Markdown | H1 → Course title, H2 → Modules, H3 → Lessons, paragraphs/images/code blocks mapped to content blocks |
| PowerPoint (PPTX) | Extracts slides as lessons with text blocks, embedded images, and speaker notes |
| SCORM Package | Parses imsmanifest.xml to reconstruct course structure from SCORM resources |
| Lumina Format | Native import for previously exported Course Clip Studio courses |

### LMS Upload Integration

Direct upload to learning management systems via a guided wizard:

- **Canvas** (Instructure) — OAuth token-based authentication
- **Moodle** — Web services token-based authentication
- **Blackboard Learn** — Application key/secret-based authentication

Includes connection testing, course/module selection, and progress tracking.

### Accessibility

#### Authoring UI Accessibility (WCAG 2.1 AA)

- Semantic HTML (`<main>`, `<nav>`, `<aside>`, `<header>`)
- Skip-to-content link
- 3px focus-visible ring on all interactive elements
- 44px minimum tap/click targets
- 16px minimum body text
- `lang` attribute on the root element
- `prefers-reduced-motion` media query support
- Full keyboard operability

#### Floating Accessibility Widget

A persistent floating action button (FAB) available on every screen with quick access to:

| Feature | Description |
|---|---|
| Font Size Controls | +/- buttons with reset (range: 12px–28px) |
| High Contrast Mode | Black/white/yellow color scheme override |
| Reduced Motion | Disables all animations and transitions |
| Enhanced Text Spacing | Increased line height (1.8), letter spacing (0.12em), and word spacing (0.16em) per WCAG 1.4.12 |
| Enhanced Focus Indicators | High-visibility orange focus outlines (4px + glow) per WCAG 2.4.7 |
| Color Blind Modes | Protanopia, Deuteranopia, Tritanopia, and Achromatopsia (monochrome) via SVG color matrix filters |
| Custom Cursors | Large, Crosshair, and High Contrast cursor options |
| Cursor Trail | Visual trail that follows the mouse pointer |
| OpenDyslexic Font | Dyslexia-friendly typeface toggle (SIL Open Font License) |
| Bionic Reading | Bolds the first half of each word to create fixation points for faster reading |
| Color Theme Selector | Quick switching between all built-in and brand kit themes |
| Reset All | One-click reset to default settings |

All settings persist across sessions.

#### Accessibility Audit Engine

- Real-time WCAG 2.1 AA compliance scanning across 19 audit categories
- Issues classified by severity: Critical, Serious, Moderate, Minor
- Checks for missing alt text (1.1.1), missing transcripts (1.2.1–1.2.3), captions (1.2.1–1.2.2), heading structure (1.3.1), color contrast (1.4.3), form labels (4.1.2), reading level (3.1.5), and language attributes (3.1.1)
- UDL compliance scoring (0–100) across Representation, Action & Expression, and Engagement pillars
- Exportable audit report as PDF

### Theme System

#### 7 Built-In Color Themes

| Theme | Description |
|---|---|
| System | Follows OS light/dark preference |
| Light | Default light theme with purple brand accents |
| Dark | Dark theme with muted purple tones |
| Sepia | Warm paper-like reading theme |
| Midnight | GitHub-dark-inspired deep theme |
| Forest | Green nature-inspired light theme |
| Ocean | Deep blue dark theme |

#### Brand Kit Themes

- Create unlimited brand kits with custom primary, secondary, and accent colors
- Google Fonts integration with live font picker for body and heading fonts
- Apply any brand kit as an app-wide theme
- Brand colors are injected as CSS custom properties for consistent styling

#### Per-Course Theme Customization

- Full color palette customization (primary, secondary, accent, background, surface, text)
- Custom CSS injection
- Dark mode toggle
- Player shell configuration (header color, button style, progress bar color, logo display)
- Loading screen customization (logo, background, progress ring, custom message)
- Color contrast ratio analysis with WCAG AA/AAA feedback

### Collaboration

- **Collaborator notes** — Threaded discussion attached to specific content blocks with author attribution and timestamps
- **Note resolution** — Mark notes as resolved/unresolved for team coordination
- **Version history** — Manual and auto-save checkpoints with named snapshots
- **Snapshot restore** — Roll back to any previous version (current state saved automatically before restoring)
- **Undo/redo** — Full undo/redo stack with Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z

### Certificate Designer

- Multiple pre-designed templates (Formal, Elegant, Modern, Achievement, and more)
- **Visual field designer** — Drag fields to position them on the certificate canvas
- **Enlarge mode** — Full-screen overlay for detailed field positioning with properties sidebar
- **Custom template upload** — Upload HTML templates or background images (recommended: A4 Landscape, 3508 x 2480 px at 300 DPI)
- Dynamic field rendering with variables: `{{learner_name}}`, `{{course_title}}`, `{{completion_date}}`, `{{completion_timestamp}}`, `{{score}}`, `{{instructor}}`, `{{signature}}`
- Configurable field properties: font size, weight, color, alignment, and position
- Logo and signature line customization
- Brand color application toggle
- Pass score requirements
- Trigger on course completion
- Live PDF preview and export
- **Auto-populated learner name** — Captures name from enrollment page and populates certificate fields

### Course Templates

Start new courses from pre-designed templates:

- **Blank Course** — Empty starting point
- **Corporate Training** — Professional development structure
- **Employee Onboarding** — New hire orientation flow
- **Compliance Training** — Regulatory and policy training
- **Higher Education** — Academic course structure
- **UDL Showcase** — Demonstrates UDL principles with example content

### Internationalization

- **English** and **Spanish** interface translations
- UI language selection independent of course content language
- i18n namespaces: common, editor, dashboard, settings, preview, publish, accessibility

### Additional Features

- **Auto-save** — Debounced course saves to workspace (configurable interval: 1–10 minutes)
- **Workspace management** — Multi-course workspace with file system persistence
- **Publish status tracking** — Draft, In Review, Published, Archived workflow
- **Course metadata** — Title, description, author, language, estimated duration, tags, thumbnail, version
- **Learner preview** — Full interactive preview with device modes (Desktop, Tablet, Mobile), with working flashcard 3D flip, drag & drop, matching, branching, and quiz interactions
- **Learner notes** — Note-taking and bookmarking in preview mode
- **UDL checklists** — Per-module tracking across Representation, Action & Expression, and Engagement pillars
- **Reading level display** — Automatic Flesch-Kincaid Grade Level per text block
- **Plugin system** — Extensible plugin block type for custom integrations
- **Question bank CSV workflow** — Download a CSV template, fill it in Excel/Google Sheets/Numbers, and import questions in bulk; export existing questions to CSV

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **macOS**, Windows, or Linux

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run dev
```

This launches the Electron app with hot module replacement. Changes to renderer code update instantly; changes to main/preload code trigger an automatic rebuild.

### Build for Production

```bash
npm run build
```

Compiles all three processes (main, preload, renderer) to the `out/` directory.

### Package as Desktop App

```bash
npm run dist
```

Builds and packages the app using electron-builder. Output goes to `dist/`.

### Install to Applications (macOS)

```bash
npm run install-app
```

Builds, packages, code-signs (ad-hoc), and copies `Course Clip Studio.app` to `/Applications`.

## Project Structure

```
lumina-udl/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── index.ts           # BrowserWindow, app lifecycle, auto-update
│   │   └── ipc-handlers.ts    # Theme persistence, file dialogs, secrets
│   ├── preload/               # Context bridge (renderer ↔ main)
│   │   ├── index.ts           # Exposed electronAPI
│   │   └── index.d.ts         # Window type augmentation
│   └── renderer/              # React application
│       ├── main.tsx            # Entry point (HashRouter)
│       ├── App.tsx             # Route definitions
│       ├── assets/
│       │   ├── styles/         # Design tokens, themes, Tailwind
│       │   └── fonts/          # OpenDyslexic woff2 font files
│       ├── components/
│       │   ├── layout/         # AppShell, Sidebar, TopBar
│       │   ├── editor/         # Block editors, AI panel, tree navigator
│       │   ├── dashboard/      # Course cards, import dialog, templates
│       │   ├── publish/        # Export wizard, LMS upload
│       │   ├── auth/           # PinInput component
│       │   ├── onboarding/     # First-launch setup wizard
│       │   └── ui/             # Button, ThemeToggle, SettingsCard, FieldRow, ToggleSwitch, ColorInput
│       ├── views/              # Dashboard, Editor, Preview, Settings, SignIn, Publish
│       ├── stores/             # Zustand stores (app, auth, course, editor)
│       ├── hooks/              # useTheme, useAccessibility, useWorkspaceInit
│       ├── lib/
│       │   ├── export/         # HTML packager, PDF renderer
│       │   ├── import/         # Markdown, PPTX, SCORM parsers
│       │   ├── scorm/          # SCORM 1.2 & 2004 packagers
│       │   ├── xapi/           # xAPI packager
│       │   ├── ai/             # LLM provider abstraction
│       │   └── accessibility/  # Audit engine, contrast checker
│       ├── types/              # Course data model TypeScript types
│       └── i18n/               # Internationalization (en, es)
├── resources/
│   ├── icon.png               # App icon source (512x512)
│   └── icon.icns              # macOS app icon
├── electron.vite.config.ts    # Vite config for all 3 processes
└── package.json
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `out/` |
| `npm run dist` | Package as platform-native app |
| `npm run install-app` | Build + install to `/Applications` (macOS) |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run test suite |

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |
| Tab | Navigate between interactive elements |
| Escape | Close accessibility widget / dialogs |
| Tab (from page top) | Skip link appears — press Enter to jump to main content |

## License

See [LICENSE](LICENSE) for details.
