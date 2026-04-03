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
| Math Rendering | KaTeX |
| Charts | Chart.js + react-chartjs-2 |
| Animations | lottie-react |
| Document Conversion | mammoth (DOCX), pdfjs-dist (PDF) |
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

- **33 content block types** — Text, Image/Media, Video, Audio, Quiz, Drag & Drop, Matching, Accordion, Tabs, Flashcard, Branching Scenario, URL/Embed, Code, Divider, Callout, H5P (with inline or new-tab display modes), HTML / Rich Text, Plugin, Feedback Form, Slide, File Upload, Save for Later, Timeline, Math/LaTeX, Chart, Lottie Animation, Interactive Video, PDF Viewer, Converted Document, Image Map, Reveal on Scroll, Writing, and Knowledge Check
- **Slide block** — Free-form canvas block (16:9) for placing buttons, embeds, quiz items, matching activities, text, and images with drag-to-position layout, background color/image, and per-element property editing
- **URL / Embed block** — Insert any URL with two display modes: "Show in Course" (inline iframe) or "Open External" (opens in browser/new tab)
- **HTML / Rich Text block** — Full code editor (HTML/CSS/JS tabs via Monaco) with live preview toggle, allowing users to add any custom content
- **Timeline block** — Vertical or horizontal timeline with ordered event nodes; each node has title, date, and content; configurable expand behavior (all open, one-at-a-time, click-to-expand) and line style (solid, dashed, dotted)
- **Math/LaTeX block** — LaTeX equation editor with live KaTeX preview, symbol shortcut toolbar, and display/inline mode toggle; renders to accessible `<section role="math">` in exports
- **Chart block** — Interactive chart editor supporting bar, line, pie, doughnut, radar, and polar area chart types; data grid for labels and datasets, axis labels, accessible data table fallback, and live Chart.js preview
- **Lottie Animation block** — Lottie JSON file upload with autoplay, loop, speed, and trigger mode (auto, hover, click, scroll) controls; supports fallback image for no-JS environments
- **Interactive Video block** — Video with timed quiz questions at configurable timestamps; supports pause, overlay, or no-pause behavior; includes transcript for accessibility
- **PDF Viewer block** — Embedded PDF viewer with page controls, download toggle, and accessibility tag warning for untagged PDFs
- **Converted Document block** — Upload DOCX, PDF, or PPTX files and convert to HTML; DOCX conversion powered by mammoth.js; manual HTML editing available for fine-tuning
- **Image Map block** — Interactive image with clickable hotspot regions (rectangle or circle); each hotspot has a label and popup content; coordinates editor for precise placement
- **Reveal on Scroll block** — Content items that animate into view on scroll or click; configurable animation per item (fade-in, slide-up, slide-left, scale), stagger delay, and visibility threshold
- **Writing block** — Learner writing activity with variants (essay, reflection, journal, short response); multiple prompt sections with word count limits; optional rubric and AI scoring with FERPA compliance warning
- **Knowledge Check block** — Assessment block with phase labels (pre-assessment, formative, post-assessment); linked learning objectives; reuses quiz question editor; optional progress report display
- **Slide hotspot callouts** — New slide element type for hotspot callouts with callout text, anchor point positioning, connector style (line, curve, elbow), anchor style (dot, ring, pin), trigger mode (hover, click, always), and connector color
- **Nested blocks in Accordion/Tabs** — Accordion items and tab panels now support optional nested child content blocks for richer, composable layouts
- **Quiz randomization** — Quiz blocks support question pool randomization with configurable pool size per attempt; questions also support difficulty level, Bloom's taxonomy level, and tags metadata
- **Block animations** — Fade-in, slide-up, slide-left, and scale with configurable duration and delay; animations trigger on scroll via IntersectionObserver in preview and exports with `@keyframes` and `prefers-reduced-motion` support
- **Rich text editing** — TipTap-powered editor with formatting toolbar and font size control (10–48px dropdown)
- **Drag-and-drop file uploads** — Drag image, video, and audio files directly onto their blocks; files are automatically copied into the course's assets folder for self-contained packaging
- **SRT/VTT transcript upload** — Video and audio blocks support drag-and-drop or click-to-upload of .srt/.vtt caption files with automatic parsing to plain text and configurable words-per-line wrapping
- **Block delete confirmation** — Deleting any block shows a confirmation dialog to prevent accidental content loss
- **Drag-and-drop reordering** — Reorder blocks within lessons, drag lessons within a module to reorder, or drag lessons between modules to move them — all via drag and drop with visual drag overlay feedback
- **Question bank** — Reusable quiz question library per course with CSV import/export, downloadable template, and linking to quiz blocks
- **Reading level analysis** — Automatic Flesch-Kincaid Grade Level calculation per text block and per course
- **Lesson completion criteria** — Per-lesson requirements including quiz pass score, interactive block completion, and minimum time on page
- **Completion criteria display** — Automatic "To complete this lesson" reference block rendered in preview/export when criteria are set
- **Course enrollment page** — Optional enrollment overlay on course start that captures the learner's name for certificate auto-population; sidebar navigation and next/previous buttons are locked until enrollment is completed

### Multi-Panel Editor

- **Course tree navigator** — Hierarchical view of modules and lessons with drag-drop reordering within and across modules, grip handle on hover, and empty-module drop zones
- **Editor canvas** — Visual block editor with insertion toolbar and block property editing
- **Split preview pane** — Side-by-side editing and preview with scroll synchronization
- **Theme editor** — Customize colors, fonts, branding, player shell, and loading screens per course
- **AI assistant panel** — AI-powered content generation and analysis (see AI Features below)
- **Accessibility audit panel** — Real-time WCAG 2.1 AA compliance checking
- **Certificate designer** — Design and preview completion certificates
- **Version history panel** — Save named checkpoints and restore previous versions
- **Collaborator notes panel** — Threaded discussion notes attached to specific blocks
- **Branching graph view** — Visualize branching scenario connections
- **Media Library panel** — Centralized asset browser with built-in icons, shapes, uploads, and color palette tools (see Media Library below)

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

### Syllabus Builder

A dedicated dashboard tab with a 6-step wizard for creating WCAG-compliant course syllabi with AI assistance.

| Feature | Description |
|---|---|
| 6-Step Wizard | Course Identity → Audience & Level → Learning Objectives → Assignments → Rubrics → Review & Export |
| 20 Preset Content Areas | Special Education, STEM, Literacy, Counseling, Nursing, DEI, Ed Tech, and more — plus custom content areas |
| Bloom's Taxonomy Integration | Interactive reference panel with 6 levels, 10 action verbs each, and color-coded badges on every objective |
| AI-Generated Objectives | Generate 4–6 measurable learning objectives aligned to Bloom's Taxonomy from course context |
| AI-Generated Assignments | Generate assignments with UDL accommodations linked to objectives |
| AI-Generated Rubrics | Generate analytic, holistic, single-point, or checklist rubrics from assignment context; improved prompt ensures ALL criterion/level cells are filled |
| Generate All Rubrics | One-click button to sequentially generate rubrics for every assignment with progress indicator |
| UDL Accommodations | Per-assignment annotations across Representation, Action & Expression, and Engagement pillars with AI suggestions per pillar |
| 4 Rubric Types | Analytic (full grid editor), Holistic (level descriptors), Single-Point (growth/proficient/strengths), Checklist (yes/no items) |
| Reusable Pools | Save objectives, assignments, and rubrics to personal pools for reuse across syllabi |
| Import from Pool | Pull saved items from pools into any syllabus |
| .docx Export | Download syllabi as formatted Word documents with proper headings, numbered lists, and rubric tables |
| Syllabus Library | View, open, duplicate, and delete saved syllabi from a tabbed library |
| Send to AI Assistant | Load a saved syllabus as context into the main AI panel for further content generation |
| 14 Audience Levels | PreK through Graduate/Doctoral, plus Corporate, Healthcare, Parent/Caregiver, Community, and custom |

### Media Library

A centralized Media Library panel for browsing, uploading, and managing all course assets. Accessible from the **Dashboard** (sidebar section) and the **Editor** (right-side panel via toolbar button).

#### Five-Tab Interface

| Tab | Description |
|-----|-------------|
| **All Assets** | Combined search view across built-in, uploaded, and global assets with filtering by type, UDL principle, and WCAG status |
| **Built-In** | Browse 50 built-in SVG assets organized by type (Icons, Shapes, Text Shapes) and category (Navigation, Education, Accessibility, Geometric, Arrows, Callouts, Section Headers, Labels, Instructional Prompts) |
| **Search Online** | Placeholder for Phase 2 API-connected search (Pexels, Unsplash, Pixabay) |
| **My Uploads** | Upload images, video, audio, and documents via file dialog or drag-and-drop with automatic metadata entry |
| **Generated** | View generated assets; Chart Builder, Diagram Builder, and Narration Studio stubs for Phase 2 |

#### Built-In Asset Library (50 Starter Assets)

| Category | Count | Examples |
|----------|-------|---------|
| **Navigation Icons** | 5 | Home, Arrow Right/Left, Menu, Search |
| **Accessibility Icons** | 3 | Accessibility, Vision Impaired, Closed Captions |
| **Education Icons** | 4 | Book Open, Graduation Cap, Lightbulb, Pencil |
| **People Icons** | 2 | User, Users Group |
| **Technology Icons** | 2 | Monitor, Link |
| **Media Icons** | 2 | Image, Play |
| **Feedback Icons** | 2 | Check Circle, Alert Triangle |
| **Basic Geometric Shapes** | 8 | Circle, Square, Triangle, Diamond, Pentagon, Hexagon, Star, Oval |
| **Rounded Shapes** | 4 | Rounded Rectangle, Pill, Rounded Square, Squircle |
| **Arrow Shapes** | 4 | Right, Left, Up, Down |
| **Callout Shapes** | 4 | Speech Bubble, Thought Bubble, Banner, Badge |
| **Text Shapes** | 10 | Tip Box, Warning Box, Note Box, Section Headers (Underline, Pill, Gradient), Tag Label, Step Number, Question Prompt, Activity Prompt |

All built-in assets include pre-filled accessibility metadata (alt text, ARIA labels, UDL tags, WCAG status).

#### Upload Workflow

1. Click **Browse Files** or drag-and-drop a file onto the upload zone
2. Supported formats: Images (PNG, JPG, GIF, SVG, WebP — 10MB), Video (MP4, WebM, MOV — 500MB), Audio (MP3, WAV, OGG, M4A — 50MB), Documents (PDF, DOCX, PPTX — 50MB)
3. The **Asset Metadata Editor** opens automatically, prompting for:
   - Title and alt text (required)
   - Long description, ARIA label, source/credit
   - License (CC0, CC BY 4.0, Royalty-Free, etc.)
   - UDL principle tag (Representation, Action & Expression, Engagement)
   - WCAG accessibility status
   - Language and keyword tags
   - Scope toggle (project-only or global across all projects)
4. File is copied to the course's `assets/` folder and recorded in the asset manifest

#### Asset Grid

- Responsive grid layout with thumbnail previews (inline SVG for built-in assets, `<img>` for uploaded images)
- **Keyboard navigation** — Arrow keys to move between tiles, Enter/Space to insert
- Each tile shows: type badge, WCAG status indicator (green/yellow/red dot), truncated title
- Click to select, double-click to insert into the active block

#### Color Palette Manager

Accessible from the palette icon in the Media Library header:

| Feature | Description |
|---------|-------------|
| **Lumina Brand Palette** | Pre-loaded system palette (Magenta #a23b84, Indigo #3a2b95, Purple #6f2fa6) — non-deletable |
| **Custom Palettes** | Create, rename, and delete custom color palettes |
| **Color Picker** | Visual color picker with hex input |
| **Contrast Ratios** | Each color displays contrast ratio against white and black backgrounds |
| **WCAG Warnings** | AA (4.5:1 normal text) and AA Large (3:1 large text) pass/fail indicators |
| **Persistence** | Palettes saved via Electron settings across sessions |

#### Asset Manifest Storage

- **Project manifest** — `{courseFolder}/asset-manifest.json` stores uploaded and generated assets per course
- **Global manifest** — `~/lumina-global/global-manifest.json` for assets shared across all projects
- **Auto-directory creation** — `assets/{images,video,audio,documents,generated,captions}` folders created automatically

#### Editor Integration

- **Toolbar button** — Media Library toggle in the editor toolbar (Image icon) opens a w-96 panel alongside the canvas
- **Asset insertion** — Double-click or press Enter on a selected asset to update the currently selected block (image src, video src, or audio src)
- **Dashboard section** — Full-page Media Library view in the Dashboard sidebar alongside Courses, Templates, Content Areas, and Syllabus

#### Walkthrough: Using the Media Library

1. **From the Dashboard**: Click "Media Library" in the left sidebar to open the full-page view. Browse built-in assets, upload files, or manage color palettes.

2. **From the Editor**: Click the Image icon in the editor toolbar (right section, next to Theme Editor). The Media Library panel opens on the right side of the canvas.

3. **Browse Built-In Assets**: Switch to the "Built-In" tab. Use the type tabs (Icons, Shapes, Text Shapes) and category sidebar to filter. Type in the search bar to find assets by name or tag.

4. **Upload an Asset**: Switch to the "My Uploads" tab. Click "Browse Files" or drag a file onto the drop zone. Fill in the metadata form (at minimum: title and alt text) and click "Add Asset."

5. **Insert into a Block**: Select a content block in the editor (e.g., an Image/Media block). In the Media Library panel, double-click any asset to insert it into the selected block.

6. **Manage Color Palettes**: Click the Palette icon in the Media Library header. Create a new palette, add colors with the color picker, and review contrast ratios for WCAG compliance.

7. **Search & Filter**: Use the search bar and filter dropdowns (Type, UDL Principle, Accessibility Status) in the "All Assets" tab to find assets across all sources.

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
| Reference File Categories | Tag each reference file with multiple categories (design, content, assignment, quiz, format, activity, assessment, rubric, standards, template) via clickable chips — AI groups files by category and applies contextual instructions per category |
| Content Areas | Create reusable content area profiles on the Dashboard with audience, objectives, prior knowledge, tone, format, and accessibility needs — select a content area per project in the AI panel to automatically supplement interview answers |
| Base Brain | Persistent design DNA settings (design assumptions, tone & voice, visual preferences, goals, reference files) that inform all AI generation when enabled |
| Base Brain Screener Files | Three bundled screener frameworks (WCAG Accessibility, UDL, DisCrit Inclusive Identity) auto-loaded on first launch — organized by category with view, delete, and drag-and-drop replacement |
| Categorized Base Brain Context | AI prompts automatically group Base Brain reference files by framework (Accessibility, UDL, Inclusive Teaching, General) with framework-specific instructions for each category |

### Inline AI Generation & Stock Media Search

Every content block in the editor includes contextual "Generate with AI" buttons that appear when an AI provider is configured. Stock media search is integrated directly into image and video upload areas.

| Block Type | AI Feature | Description |
|---|---|---|
| Image / Media | Search Stock Photo | Opens a stock photo search dialog (Pexels, Unsplash, Pixabay); downloads and inserts the selected image |
| Image / Media | Generate Alt Text | Generates WCAG-compliant alt text from filename and context |
| Video | Search Stock Video | Opens a stock video search dialog (Pexels, Pixabay); downloads and inserts the selected video |
| Video | Generate Transcript | Generates a transcript from video context |
| Audio | Generate Narration | Generates a narration script from lesson content |
| Audio | Generate Transcript | Generates a transcript from audio context |
| Quiz | Generate Questions | Generates multiple-choice and true/false questions with feedback |
| Flashcard | Generate Cards | Generates front/back flashcard pairs from topic |
| Accordion | Generate Sections | Generates accordion sections with titles and content |
| Tabs | Generate Tabs | Generates tab labels and content |
| Callout | Generate Content | Generates title and content matching the callout variant (info, warning, tip, etc.) |
| Code | Generate Code | Generates code examples in the selected programming language |
| Matching | Generate Pairs | Generates left/right matching pairs with correct pairings |
| Drag & Drop | Generate Items | Generates drop zones and drag items with correct categorization |
| Branching | Generate Scenario | Generates scenario text and branching choices with consequences |
| Embed | Generate Title | Generates an accessible iframe title from the embed URL |
| Slide | Search Background | Opens stock photo search for slide background images |
| Theme | Search Logo | Opens stock photo search for course logo |
| Certificate | Search Background | Opens stock photo search for certificate background images |
| Properties Panel | Generate Alt Text | Generates alt text for any media block from the properties sidebar |

The stock media search dialog supports paginated results, thumbnail previews, photographer attribution, and automatic download to the course assets folder.

### Tippy — Context-Aware AI Assistant

<p align="center">
  <img src="resources/tippy-icon.png" alt="Tippy AI Assistant" width="120" height="120" />
</p>

Tippy is a friendly, draggable AI assistant that lives inside Course Clip Studio. Powered by the same AI provider you configure in Settings (Anthropic, OpenAI, or Ollama), Tippy understands where you are in the app and what you're working on — then gives you targeted help, wayfinding, and instructional design guidance.

| Feature | Description |
|---|---|
| **Context-Aware Chat** | Tippy reads the current view, active course, module, lesson, selected block, open panels, and accessibility settings — then responds with help specific to your situation |
| **Guided Tour** | Click "Give me a tour" and Tippy walks you through every area of the app step-by-step, narrating each highlight with a chat message and advancing when you're ready |
| **Quick Actions** | Three one-click prompts on first open: "Give me a tour," "Help me get started," and "What can I do here?" |
| **Draggable Button** | Drag Tippy's floating button anywhere on screen — position persists across sessions |
| **Error Recovery** | Tippy automatically detects AI or translation errors, opens the chat, and offers to help resolve them |
| **Session Save / Restore** | Save your conversation, reload it later, or clear and start fresh |
| **Markdown Responses** | Tippy's responses render with bold, links, inline code, and bullet lists |
| **Onboarding Tour Highlights** | 10-step tour with animated highlight rings around sidebar, dashboard, toolbar, outline, canvas, properties, block palette, AI assistant, preview, and publish |
| **Full Accessibility** | `role="dialog"`, `aria-label`, `aria-expanded`, keyboard navigation (Escape to close, arrow keys during tour), focus management, and reduced-motion awareness |
| **Localized** | Tippy responds in your selected UI language |

#### How to Use Tippy

1. **Click the Tippy icon** — the floating purple character in the bottom-left corner of the app
2. **Ask anything** — type a question about course authoring, accessibility, UDL, or how to use a feature
3. **Use quick actions** — click a suggestion button to start a tour, get onboarded, or learn what's available on the current screen
4. **Drag to reposition** — grab and move Tippy's button to any edge of the screen
5. **Save conversations** — click the save icon to preserve your chat; reload saved sessions anytime

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
| SCORM 1.2 | Legacy SCORM packaging with API script, manifest, lesson HTML, and bundled media assets |
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
- Block-specific background and text colors for interactive elements (quiz, flashcard, matching, drag & drop, branching, accordion) with WCAG contrast indicator
- **Automatic contrast correction** — Preview and SCORM export automatically detect insufficient text/background contrast (below WCAG AA 4.5:1) and substitute readable dark or light text to ensure legibility
- **Matching & Drag-Drop contrast** — Match items and drop zones now render with explicit background colors, ensuring text visibility on all themes
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
- **Unified preview/edit popout** — "Show Preview" opens a large popout modal; click "Edit" to switch to the visual field designer with canvas and properties sidebar, then "Preview" to switch back — all in one modal
- **Background image in edit mode** — Uploaded background images are visible behind draggable fields in both the inline and popout editor canvases, so you can position fields precisely over your certificate design
- **Background image filename** — Uploaded background images display the actual filename (with icon) and a Remove button, instead of generic text
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

#### Custom User Templates

- **Save as Template** — Save any existing course as a reusable template from the editor toolbar (BookmarkPlus icon)
- **Structure-only option** — Optionally strip all content while keeping block types and course structure
- **Template metadata** — Set name, description, and icon for each custom template
- **My Templates section** — User templates appear in the Dashboard Templates tab above built-in templates
- **Delete templates** — Remove user templates with a hover-reveal delete button

### Internationalization

- **English** and **Spanish** interface translations
- UI language selection independent of course content language
- i18n namespaces: common, editor, dashboard, settings, preview, publish, accessibility

### Additional Features

- **Auto-save** — Debounced course saves to workspace (configurable interval: 1–10 minutes)
- **Workspace management** — Multi-course workspace with file system persistence
- **Publish status tracking** — Draft, In Review, Published, Archived workflow
- **Course metadata** — Title, description, author, language, estimated duration, tags, thumbnail, version
- **Asset management** — All uploaded files (images, audio, video, SRT/VTT, theme logos, certificate backgrounds and logos) are automatically copied into the course's `assets/` folder, ensuring courses are fully self-contained for export and packaging
- **Learner preview** — Full interactive preview with device modes (Desktop, Tablet, Mobile), with working flashcard 3D flip, drag & drop, matching, branching, quiz interactions, in-iframe navigation buttons, and responsive H5P iframe sizing (70–80vh)
- **Flashcard self-test & review** — After flipping a flashcard, learners can mark "Got It" or "Review Again"; after completing the deck, a "Review Missed" button filters to only the missed cards for targeted study
- **Per-block feedback** — Optional collapsible feedback section on any content block, shown to learners as a `<details>` element; configured via the "Block Feedback" field in the Properties panel
- **Student progress saving** — HTML exports track per-lesson completion, quiz scores, and interactive block state in localStorage; SCORM exports persist progress via `cmi.suspend_data` across sessions
- **Manual save** — Toolbar Save button creates a named "Manual save" snapshot in Version History with visual confirmation flash
- **Learner notes** — Note-taking and bookmarking in preview mode
- **UDL checklists** — Per-module tracking across Representation, Action & Expression, and Engagement pillars
- **Reading level display** — Automatic Flesch-Kincaid Grade Level per text block
- **Plugin system** — Extensible plugin block type for custom integrations
- **Question bank CSV workflow** — Download a CSV template, fill it in Excel/Google Sheets/Numbers, and import questions in bulk; export existing questions to CSV
- **Content areas** — Dashboard section for creating reusable content area profiles (audience, objectives, prior knowledge, tone, format, accessibility needs) that persist across sessions and can be selected per project to supplement AI generation; supports file uploads with priority levels (Low, Medium, High) per content area

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
│       │   ├── fonts/          # OpenDyslexic woff2 font files
│       │   ├── base-brain/     # Bundled screener MD files (WCAG, UDL, DisCrit)
│       │   └── tippy/          # Tippy AI assistant icon
│       ├── components/
│       │   ├── layout/         # AppShell, Sidebar, TopBar
│       │   ├── editor/         # Block editors, AI panel, tree navigator
│       │   ├── dashboard/      # Course cards, import dialog, templates, MediaLibrarySection
│       │   ├── media-library/  # MediaLibraryPanel, tabs, AssetGrid, AssetTile, AssetMetadataEditor, ColorPaletteManager
│       │   ├── syllabus/       # Syllabus Builder wizard, cards, library, preview
│       │   │   ├── steps/      # 6 wizard step components
│       │   │   ├── cards/      # ObjectiveCard, AssignmentCard, RubricEditor
│       │   │   └── library/    # SyllabusLibraryView, SyllabusCard
│       │   ├── tippy/          # Tippy AI assistant (button, panel, chat, tour, error watcher)
│       │   ├── publish/        # Export wizard, LMS upload
│       │   ├── auth/           # PinInput component
│       │   ├── onboarding/     # First-launch setup wizard
│       │   └── ui/             # Button, ThemeToggle, SettingsCard, FieldRow, ToggleSwitch, ColorInput, AIGenerateButton, StockSearchDialog
│       ├── views/              # Dashboard, Editor, Preview, Settings, SignIn, Publish
│       ├── stores/             # Zustand stores (app, auth, course, editor, media-library)
│       ├── hooks/              # useTheme, useAccessibility, useWorkspaceInit, useAssetUpload, useAssetInsert, useAIGenerate
│       ├── lib/
│       │   ├── export/         # HTML packager, PDF renderer, syllabus .docx export
│       │   ├── import/         # Markdown, PPTX, SCORM parsers
│       │   ├── scorm/          # SCORM 1.2 & 2004 packagers
│       │   ├── xapi/           # xAPI packager
│       │   ├── ai/             # LLM provider abstraction + syllabus AI prompts + inline generation prompts
│       │   ├── stock-api.ts   # Unified stock media API client (Pexels, Unsplash, Pixabay)
│       │   ├── tippy/          # Tippy context gatherer, system prompt, tour steps
│       │   ├── built-in-assets.ts # 50 built-in SVG icon, shape, and text-shape definitions
│       │   ├── media-manifest.ts  # Asset manifest read/write helpers
│       │   └── accessibility/  # Audit engine, contrast checker
│       ├── types/              # Course data model + media library TypeScript types
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
| Escape | Close accessibility widget / Tippy panel / tour / dialogs |
| Tab (from page top) | Skip link appears — press Enter to jump to main content |

## License

See [LICENSE](LICENSE) for details.
