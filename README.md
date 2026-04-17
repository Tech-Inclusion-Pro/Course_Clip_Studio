<p align="center">
  <img src="resources/icon.png" alt="Course Clip Studio logo" width="128" height="128" style="border-radius: 20px;" />
</p>

<h1 align="center">Course Clip Studio</h1>

<p align="center">
  A cross-platform desktop course authoring application built with Universal Design for Learning (UDL) as a first principle.
</p>

---

## We Want Your Feedback

Course Clip Studio is built for everyone, and we need your help to keep improving. Whether you're an instructor, instructional designer, learner, or accessibility advocate — your feedback helps us make this tool more usable, effective, and inclusive with every update.

**[Share Your Feedback Here](https://docs.google.com/forms/d/1CbqoUOcwcdODo_2YBuZ37wig2bl2aaSgTyr_rQWbc-8/edit)**

---

## Download

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | [Course Clip Studio DMG (arm64)](https://github.com/Tech-Inclusion-Pro/Course_Clip_Studio/releases/latest/download/Course.Clip.Studio-0.1.0-arm64.dmg) |
| macOS (Intel) | [Course Clip Studio DMG (x64)](https://github.com/Tech-Inclusion-Pro/Course_Clip_Studio/releases/latest/download/Course.Clip.Studio-0.1.0.dmg) |
| Windows (x64) | [Course Clip Studio Setup (exe)](https://github.com/Tech-Inclusion-Pro/Course_Clip_Studio/releases/latest/download/Course.Clip.Studio.Setup.0.1.0.exe) |
| Linux (x64) | [Course Clip Studio AppImage](https://github.com/Tech-Inclusion-Pro/Course_Clip_Studio/releases/latest/download/Course.Clip.Studio-0.1.0.AppImage) |
| Documentation | [CourseClipStudio-Guide.docx](https://github.com/Tech-Inclusion-Pro/Course_Clip_Studio/releases/latest/download/CourseClipStudio-Guide.docx) |

> **macOS:** The app is unsigned. On first launch, right-click the `.app` and select **Open** to bypass Gatekeeper.
>
> **Windows:** You may see a SmartScreen warning. Click **More info** → **Run anyway**.
>
> **Linux:** Make the AppImage executable before running: `chmod +x Course\ Clip\ Studio-0.1.0.AppImage`

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
- **Triggers panel** — Block-scope trigger management with variable editor and event/action configuration
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

### Conditional Interactivity System

A block-scope trigger engine with course-scope variables, providing Articulate Storyline 360 parity with UDL, WCAG 2.1 AA, and DisCrit as load-bearing constraints.

#### Triggers & Variables

| Feature | Description |
|---|---|
| **Triggers Panel** | Right-side editor panel (384px) with "This Block" tab showing triggers for the selected block, search/filter, and one-click trigger creation |
| **Trigger Editor Modal** | Full modal (720px) with five sections: Name, Event (When), Actions (Do), Conditions (If), and Advanced settings |
| **Variables Manager** | Modal with Project Variables (CRUD) and System Variables (read-only) tabs, search, and inline editing |
| **6 Action Types** | Navigate to lesson, set variable, adjust variable (increment/decrement/append), show block, hide block, screen reader announce |
| **10 Event Types** | Block load, block complete, click, answer submit, lesson start, lesson complete, course start, course complete, variable change, timer |
| **Condition Evaluator** | 12 operators (eq, neq, gt, gte, lt, lte, contains, not_contains, starts_with, ends_with, is_empty, is_not_empty) with short-circuit AND/OR logic |
| **Event Bus** | Pub/sub `TriggerEventBus` class for high-frequency synchronous event dispatch |
| **Runtime Engine** | `TriggerRuntime` class with scope-ordered execution (block → lesson → module → course), re-entrancy protection (max depth 10), and never-throw error handling |
| **9 System Variables** | `course.score_pct`, `course.completion_pct`, `course.time_spent_sec`, `course.lessons_completed`, `course.total_lessons`, `course.attempts`, plus learner accessibility variables |
| **Schema Migration** | Automatic `migrateInteractivity()` on course load for backward compatibility |
| **Validation Engine** | Validates unique variable names, valid references, and condition nesting depth |
| **Cascading Delete** | Removing a variable automatically cleans up all trigger conditions and actions that reference it |

#### Progression Policies

| Policy | Description |
|---|---|
| **Linear Strict** | Learner must complete all criteria before advancing — no bypass |
| **Fail Open** (default) | When criteria aren't met, the "What's Next?" modal appears with non-punitive options |
| **Open Always** | Learner navigates freely with no restrictions |

#### "What's Next?" Modal (Fail-Open Progression)

A non-punitive dialog that appears when a learner attempts to advance without meeting completion criteria. All language follows DisCrit guidelines — no "failed," "wrong," or "bad."

| Option | Description |
|---|---|
| Try this lesson again | Triggers lesson-attempt wipe confirmation, then restarts the lesson |
| Choose another lesson | Unlocks the sidebar and moves focus to the course outline |
| Review my progress | Opens progress summary in the course outline |
| Start the course over | Resets all progress and variables, returns to lesson 1 |
| Continue anyway | Author-opt-in only; includes a sub-confirmation before proceeding |

#### Lesson-Attempt Wipe

- `role="alertdialog"` confirmation dialog with clear, non-destructive language
- Resets quiz scores and lesson-scoped variables for the current lesson only
- Other lesson progress is preserved

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
| **Built-In** | Browse 420+ built-in SVG assets organized by type (Icons, Shapes, Text Shapes) and 38 categories including Navigation, Education, Communication, Science, Health, Finance, Flowchart, Diagrams, Badges, and more |
| **Search Online** | Placeholder for Phase 2 API-connected search (Pexels, Unsplash, Pixabay) |
| **My Uploads** | Upload images, video, audio, and documents via file dialog or drag-and-drop with automatic metadata entry |
| **Generated** | View generated assets; Chart Builder, Diagram Builder, and Narration Studio stubs for Phase 2 |

#### Built-In Asset Library (420+ Assets)

| Category Group | Categories | Total |
|----------------|-----------|-------|
| **Icons — Original** | Navigation (10), Accessibility (8), Education (9), People (7), Technology (7), Media (7), Feedback (7) | 55 |
| **Icons — Communication & Social** | Communication (10), Social (10) | 20 |
| **Icons — Science & Math** | Science (10), Math (10), Health (10) | 30 |
| **Icons — Lifestyle** | Weather (10), Food & Drink (10), Sports (10), Nature (10) | 40 |
| **Icons — Professional** | Finance (10), Transport (10), Music & Audio (10) | 30 |
| **Icons — Technical** | Security (10), Files (10), Time (10), Tools (10), UI Controls (10) | 50 |
| **Shapes — Geometric** | Basic Geometric (18), Rounded (9), Arrows (14), Callouts (14) | 55 |
| **Shapes — Flowchart & Diagrams** | Flowchart (18), Connectors (12), Diagrams (15) | 45 |
| **Shapes — Visual Design** | Frames (12), Infographic (15), Decorative (15), Badges (12) | 54 |
| **Shapes — Layout & UI** | Containers (12), Progress (12), Punctuation (10) | 34 |
| **Text Shapes** | Callout Boxes (3), Section Headers (3), Labels (2), Instructional Prompts (2) | 10 |

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

### TIPPY — Teaching Inclusion and Pedagogy Partner for You

<p align="center">
  <img src="resources/tippy-icon.png" alt="Tippy AI Assistant" width="120" height="120" />
</p>

TIPPY is a pedagogically grounded AI co-pilot built into Course Clip Studio. Unlike a generic chatbot, every TIPPY response is filtered through Universal Design for Learning (UDL), WCAG 2.1/2.2 accessibility standards, and inclusive instructional design principles. TIPPY runs on the active AI provider configured in Settings (Anthropic, OpenAI, or Ollama) and recommends local Ollama for privacy-sensitive work.

#### Core Chat and Context Awareness

| Feature | Description |
|---|---|
| **4-Layer System Prompt** | TIPPY assembles its context from: (1) core identity rules, (2) a searchable features knowledge base, (3) the author's personal design profile, and (4) live session context — active panel, block type, recent actions, and WCAG flags |
| **Features Knowledge Base** | A comprehensive 15-section reference covering all Course Clip Studio features. TIPPY retrieves the most relevant sections for each query using keyword-scored retrieval |
| **Context-Aware Chat** | TIPPY reads the current view, active course, module, lesson, selected block, open panels, AI provider, and accessibility settings — then responds with help specific to your situation |
| **Quick Actions** | Four one-click prompts: "Give me a tour" (20-step guided tour), "Help me get started," "TIPPY Assess," and "How do you use AI?" |
| **Draggable Button** | Drag TIPPY's floating button anywhere on screen — position persists across sessions |
| **Session Save / Restore** | Save your conversation, reload it later, or clear and start fresh |
| **Markdown Responses** | TIPPY's responses render with bold, links, inline code, and bullet lists |
| **Localized** | TIPPY responds in your selected UI language |

#### AI Reasoning Transparency

Every substantive TIPPY response includes an expandable "How does TIPPY reason?" panel with five sections:

| Section | What It Shows |
|---|---|
| **Sources** | Specific sources TIPPY drew on — WCAG criteria, UDL checkpoints, features KB sections, author profile data, axe-core results, AI provider info |
| **Confidence** | Overall confidence level (High / Medium / Low / Uncertain) with per-category breakdown |
| **Limitations** | What TIPPY cannot evaluate or what might be wrong — e.g., cultural context, lived experience, domain vocabulary |
| **Human Review Required** | Specific, actionable items the author needs to verify or decide |
| **AI Note** | A persistent reminder that AI supports but does not replace human judgment in accessibility work |

Cloud provider responses are marked with a visible indicator. Confidence levels are color-coded (green/yellow/orange/red).

#### FERPA Compliance

TIPPY detects when messages contain learner data keywords (student, grade, score, disability, IEP, Section 504, etc.) and blocks cloud AI transmission until the author acknowledges a non-dismissible FERPA warning. Options: proceed with cloud, switch to Ollama (local), or cancel. The FERPA warning toggle is always on and cannot be disabled.

#### Get to Know You — Author Design Profile

TIPPY conducts a warm, conversational onboarding flow across six sections:

| Section | What TIPPY Learns |
|---|---|
| **About You** | Name, role, organization, credentials (CPACC, BCBA, UDL certification, etc.) |
| **Your Audience** | Learner demographics, disability communities, multilingual needs |
| **Design Philosophy** | Accessibility principles, UDL approach, inclusion values, frameworks (DisCrit, etc.) |
| **Brand & Visual Style** | Brand colors, typography, visual preferences — pre-populated from Settings > Brand if configured |
| **Workflow** | How you start courses, team composition, pain points |
| **AI Preferences** | Draft vs. check preference, reasoning detail level, privacy defaults |

The profile is stored locally and injected into TIPPY's system prompt so every response is personally relevant. Export your profile as markdown, update any section anytime, or reset to start fresh. Manage in **Settings > TIPPY > Get to Know You**.

#### Full App Tour — 20-Step Guided Tour

Ask TIPPY "Give me a tour" or click the **Give me a tour** quick action to start a comprehensive 20-step guided tour of the entire application. The tour navigates you through the app automatically, highlighting each feature with a border overlay and narrating detailed descriptions directly in the TIPPY chat panel with **Next / Back / Stop** navigation buttons.

| Step | Feature | What It Covers |
|------|---------|----------------|
| 1 | Sidebar Navigation | Switching between Dashboard, Editor, Preview, Settings, Publish |
| 2 | Dashboard | Creating, opening, and managing courses |
| 3 | Editor Toolbar | Overview of all toolbar tools |
| 4 | Course Outline | Module/lesson tree with drag-drop reordering |
| 5 | Content Canvas | Block editing workspace, Block vs Slide view |
| 6 | Properties Panel | Block customization and accessibility options |
| 7 | Block Palette | Adding content blocks to lessons |
| 8 | Media Library | Uploading and managing media assets |
| 9 | Theme Editor | Colors, fonts, player shell, brand kits |
| 10 | Certificate Designer | Completion certificates with templates and dynamic fields |
| 11 | Question Bank | Reusable quiz questions across lessons |
| 12 | Branching Graph | Non-linear learning paths and decision trees |
| 13 | Accessibility Audit | WCAG compliance scanning and guided fixes |
| 14 | Analytics Dashboard | Learner engagement and quiz performance data |
| 15 | AI Assistant | AI-powered content generation and analysis |
| 16 | Version History | Browsing, comparing, and restoring previous versions |
| 17 | Notes Panel | Personal annotations during development |
| 18 | Save as Template | Saving courses as reusable templates |
| 19 | Preview | Testing the learner experience across devices |
| 20 | Publish | Exporting to SCORM, xAPI, or HTML5 |

#### Full Help — 15 Guided Walkthroughs

When you ask "how do I..." or mention a feature, TIPPY detects the topic and offers a step-by-step walkthrough. Click **Show Me** in the chat to launch it. Each walkthrough highlights UI elements with a dark red dotted border (`#8B0000`) and narrates each step in the TIPPY chat panel.

| Walkthrough | What It Covers |
|---|---|
| Adding Your First Block | Block palette, inserting, configuring |
| Setting Up a Question Bank | Quiz bank creation, CSV import, randomization |
| Using the Media Library | Built-in assets, API search, uploads |
| Generating Narration | AI text-to-speech, voice selection |
| Translating a Block | Multi-language translation workflow |
| Pre/Post Knowledge Checks | Baseline assessments, phase setup |
| Building Nested Blocks | Blocks inside blocks, depth limits |
| Creating a Hotspot Image Map | Interactive image regions |
| Fixing a WCAG Issue | Accessibility flag resolution |
| Exporting to SCORM | LMS-ready packaging |
| Reading the Analytics Dashboard | Learner data, quiz results, completion |
| Setting Up Your TIPPY Profile | Get to Know You onboarding |
| Building a Chart with AI | Data visualization blocks |
| Writing Block with Rubric | Open response, AI feedback setup |
| Converting PDF to Accessible HTML | PDF import and remediation |

Keyboard navigation: Arrow Right/Enter = next step, Arrow Left = back, Escape = stop. Reduced motion: pulse animations disabled when `prefers-reduced-motion` is active. All 15 walkthroughs are also launchable from **Settings > TIPPY > Walkthrough Library**.

#### TIPPY Assesses — Course Accessibility Assessment

TIPPY Assesses evaluates your course against three frameworks simultaneously:

**WCAG 2.1 AA** — Runs the built-in accessibility audit engine checking alt text, transcripts, captions, color contrast, heading structure, ARIA labels, reading level, and quiz accessibility. Findings organized by POUR principle (Perceivable, Operable, Understandable, Robust) and impact level (Critical, Serious, Moderate, Minor).

**UDL (CAST Guidelines 3.0)** — Maps content against 12 checkpoints across three principles:
- *Representation*: multiple formats, reading level, visuals explained, language options, transcripts
- *Action & Expression*: multiple response options, goals stated, scaffolding before assessment
- *Engagement*: relevance communicated, learner choice, self-monitoring checkpoints, actionable feedback

**Inclusion (DisCrit Framework)** — Pattern analysis checking for deficit language, medical model framing, assessment format diversity, access flexibility, and representation of diverse communities. Rated: Exemplary / Proficient / Developing / Needs Review.

**Overall Grade**: Weighted composite — WCAG 50%, UDL 30%, Inclusion 20% — yielding a letter grade (A through F).

The report is displayed in a tabbed interface with: Summary Scorecard, WCAG Findings (with Fix It / Show Me actions), UDL Findings (strengths and gaps per principle), Inclusion Findings, Top 5 Recommendations (prioritized by combined impact with estimated time), and a Methodology Appendix (AI provider, tool versions, confidence notes, limitations, human review statement).

Trigger by typing "assess this course," "check accessibility," "run assessment," or clicking the "TIPPY Assess" quick action. When multiple courses exist, TIPPY shows a course picker so you can choose which course to assess; if only one course is open, it runs automatically. Enable **auto-run Assesses on export** in Settings > TIPPY.

#### How to Use TIPPY

1. **Click the TIPPY icon** — the floating character in the bottom-left corner of the app
2. **Ask anything** — type a question about course authoring, accessibility, UDL, or how to use a feature
3. **Use quick actions** — start a 20-step guided tour of the full app, get onboarded, run TIPPY Assess, or ask how TIPPY uses AI
4. **Ask "How do you use AI?"** — TIPPY displays a detailed, hardcoded explanation of its Knowledge Base, AI models, confidence system, and FERPA safeguards — with five interactive "Show Me" buttons that navigate to and highlight each AI-powered area (TIPPY Chat, AI Assistant Panel, AI Course Generation, TIPPY Assess, Content Block AI)
5. **Say "Show me"** — TIPPY detects feature questions and offers guided walkthroughs with highlighted UI
6. **Assess your course** — type "assess this course" or click "TIPPY Assess" — if multiple courses exist, TIPPY shows a course picker first
7. **Set up your profile** — go to Settings > TIPPY > Get to Know You for personalized suggestions
8. **Drag to reposition** — grab and move TIPPY's button to any edge of the screen
9. **Save conversations** — click the save icon to preserve your chat; reload saved sessions anytime

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
| HTML5 | Self-contained ZIP with localStorage-based progress tracking, per-lesson pages, and a combined all-lessons page with table of contents — no server required |
| PDF | Print-optimized export with optional quiz answers and UDL checklist inclusion |
| cmi5 | LRS-backed Assignable Unit export with `cmi5.xml` course structure, per-lesson AU entry points, session lifecycle management (initialized/completed/passed/failed/terminated), and optional UDL context extensions |

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

### Analytics & Reporting

Course Clip Studio includes a full analytics and reporting engine built on the xAPI 1.0.3 standard with UDL-mapped tracking. All analytics run locally by default — no learner data leaves the machine unless the author explicitly configures a remote LRS.

#### LRS Integration (Settings > Analytics)

| Feature | Description |
|---|---|
| Remote LRS | Optional xAPI endpoint with Basic auth (key/secret stored in Electron safeStorage) |
| Statement Mode | Real-time (send immediately) or batch (flush at configurable intervals: 1–30 minutes) |
| Connection Test | One-click test button that sends a GET request to the LRS and reports HTTP status |
| Statement Queue | Automatic local queue with retry (up to 5 attempts, exponential backoff) when the LRS is unreachable |
| Queue Dashboard | Live queue stats (pending/failed/total) with manual flush button in the analytics store |
| Anonymization | On by default — strips learner name and email before sending to the LRS |
| FERPA Notice | Warning displayed when anonymization is disabled, reminding authors to verify their LRS provider's DPA |

#### Identified Learner Mode

| Feature | Description |
|---|---|
| Anonymized by Default | Learners appear as `Learner A1B2C3` until identified mode is explicitly enabled |
| FERPA Gating | Non-dismissible FERPA compliance modal before enabling identified reporting |
| Identity Map | Maps anonymized UUIDs to real names/emails; stored per-course at `analytics/identity-map.json` |
| Bulk Roster Import | Import learner identities from structured data for pre-enrollment |
| Re-Authentication | Downloading identified reports requires password re-entry to prevent unauthorized access |

#### Educator Reports

| Feature | Description |
|---|---|
| Educator Learner Progress Report | Per-learner table with completion %, scores, time, phase scores, UDL pathways, and activity log |
| HTML Report | WCAG-tagged printable HTML with Print/Save as PDF button; page breaks between learners |
| CSV Export | Raw data export with learner ID, scores, time, and UDL pathway columns |
| Anonymize Toggle | Generate reports with real names or anonymized IDs |
| Activity Log Inclusion | Optional plain-language activity log per learner in educator voice ("Completed Lesson 2, scored 80%") |

#### Learner Self-Report

| Feature | Description |
|---|---|
| Plain-Language Log | First-person activity summaries ("You completed Lesson 2. You scored 80% on the Module 2 quiz.") |
| Verb Template System | 26 verb-specific templates for natural-language statement rendering |
| Grouped by Date | Activity entries grouped by day with daily summaries |
| Text Download | Plain-text export grouped by date with scores, UDL pathways, and activity entries |
| PDF Download | Opens a print-ready HTML page with auto-print dialog |
| Dual Download Buttons | "Download as Text" and "Download as PDF" in the learner progress overlay |

#### Item Analysis (Psychometrics)

| Feature | Description |
|---|---|
| Difficulty Index | Proportion of learners who answered each question correctly |
| Discrimination Index | Upper 27% vs. lower 27% comparison to flag questions that don't distinguish performers |
| Point-Biserial Correlation | Per-choice correlation between selecting an option and total test score |
| Distractor Analysis | Each incorrect choice flagged as Effective, Non-functional (<5% selection), or Implausible |
| KR-20 Reliability | Kuder-Richardson Formula 20 estimate for overall assessment reliability |
| Item Flags | Automatic quality flags: Good, Needs Review, Poor — with plain-language reasons |
| Expandable Detail | Click any question in the item analysis table to see distractor distribution, point-biserial values, and improvement suggestions |

#### cmi5 Export

| Feature | Description |
|---|---|
| Course Structure | Generates `cmi5.xml` with module/lesson hierarchy mapped to cmi5 blocks and Assignable Units |
| AU Player Runtime | Embedded JavaScript handles fetch-based auth token retrieval, session lifecycle (initialize → complete/pass/fail → terminate), and xAPI statement delivery |
| Per-Lesson Entry Points | Each lesson gets a standalone HTML entry page for LMS AU launch |
| MoveOn Criteria | Configurable per-export: Completed, Passed, CompletedAndPassed, CompletedOrPassed, NotApplicable |
| Mastery Score | Configurable pass threshold injected into AU definitions |
| UDL Extensions | Optional UDL principle context extensions on all cmi5 statements |

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

#### Learner Accessibility Widget (Published Courses)

Every published and exported course (SCORM 1.2, SCORM 2004, xAPI, HTML5, Preview) includes a self-contained floating accessibility widget for learners — no React, no bundler, zero dependencies. The widget appears as a draggable button (bottom-right) and opens a settings panel with the same 10 accessibility features available to course authors:

| Feature | Description |
|---------|-------------|
| High Contrast | Toggle high-contrast mode (black text on white) |
| Font Size | Range slider (100%–200%) for text scaling |
| Reduced Motion | Disable all animations and transitions |
| Color Blind Mode | Protanopia, Deuteranopia, Tritanopia, Achromatopsia filters |
| Cursor Style | Default, Large, or Crosshair cursor |
| Cursor Trail | Visual dots following the mouse pointer |
| OpenDyslexic Font | Dyslexia-friendly typeface (CDN-loaded) |
| Bionic Reading | Bold first half of each word for reading aids |
| Enhanced Text Spacing | Increased letter, word, and line spacing |
| Enhanced Focus Indicators | Thick purple focus outlines on interactive elements |

Settings persist in `localStorage` per course. The widget uses the `la11y-` CSS prefix to avoid collisions with course content styles. Draggable button position persists across sessions.

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
- **Certificate display in published courses** — When a learner clicks "Complete Course" in any published format (SCORM 1.2, SCORM 2004, xAPI, HTML5, Preview), the custom certificate is rendered as a fullscreen overlay with all fields auto-populated (learner name, course title, completion date, quiz score, instructor, signature, logo). Includes a **Print Certificate** button and a **Continue** button. If `passScoreRequired` is set, the certificate only appears when the learner's score meets the threshold. Works across all export formats and player scripts.

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
- **Learner preview** — Full interactive preview with device modes (Desktop, Tablet, Mobile), with working flashcard 3D flip, drag & drop, matching, branching, quiz interactions, in-iframe navigation buttons, responsive H5P iframe sizing (70–80vh), conditional interactivity runtime (triggers, variables, live regions), and progression policy enforcement (linear strict, fail-open with "What's Next?" modal, open always)
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
│       │   └── tippy/          # TIPPY AI assistant icon
│       ├── components/
│       │   ├── layout/         # AppShell, Sidebar, TopBar
│       │   ├── editor/         # Block editors, AI panel, analytics panel, tree navigator
│       │   ├── analytics/      # Dashboards, charts, item analysis, educator report dialog
│       │   ├── settings/       # AnalyticsSettingsTab (LRS config, FERPA controls)
│       │   ├── dashboard/      # Course cards, import dialog, templates, MediaLibrarySection
│       │   ├── media-library/  # MediaLibraryPanel, tabs, AssetGrid, AssetTile, AssetMetadataEditor, ColorPaletteManager
│       │   ├── syllabus/       # Syllabus Builder wizard, cards, library, preview
│       │   │   ├── steps/      # 6 wizard step components
│       │   │   ├── cards/      # ObjectiveCard, AssignmentCard, RubricEditor
│       │   │   └── library/    # SyllabusLibraryView, SyllabusCard
│       │   ├── triggers/       # Conditional interactivity system
│       │   │   ├── editor/     # EventPicker, ActionList, ActionRow, ActionParamsEditor, ConditionBuilder, ConditionRow
│       │   │   └── variables/  # VariablesManagerModal, VariableForm, VariableRow
│       │   ├── wipe/           # WipeProgressDialog (lesson-attempt wipe confirmation)
│       │   ├── tippy/          # TIPPY AI assistant (chat panel, tour, highlights, reasoning panel, FERPA warning, Get to Know You, Assesses report)
│       │   ├── publish/        # Export wizard, LMS upload
│       │   ├── auth/           # PinInput component
│       │   ├── onboarding/     # First-launch setup wizard
│       │   └── ui/             # Button, ThemeToggle, SettingsCard, FieldRow, ToggleSwitch, ColorInput, AIGenerateButton, StockSearchDialog, FerpaWarningModal, ReauthPrompt
│       ├── views/              # Dashboard, Editor, Preview, Settings, SignIn, Publish
│       ├── stores/             # Zustand stores (app, auth, course, editor, media-library, analytics, tippy, author-profile, triggers, variables)
│       ├── hooks/              # useTheme, useAccessibility, useWorkspaceInit, useAssetUpload, useAssetInsert, useAIGenerate, useInteractivityRuntime
│       ├── lib/
│       │   ├── analytics/      # Statement store, aggregators (course, assessment, UDL), LRS queue, identity map, activity log generator, educator report renderer, item analysis
│       │   ├── cmi5/           # cmi5 verbs, course structure XML, AU player script, packager
│       │   ├── export/         # HTML packager, PDF renderer, syllabus .docx export, learner progress script
│       │   ├── import/         # Markdown, PPTX, SCORM parsers
│       │   ├── scorm/          # SCORM 1.2 & 2004 packagers
│       │   ├── xapi/           # xAPI packager
│       │   ├── ai/             # LLM provider abstraction + syllabus AI prompts + inline generation prompts
│       │   ├── stock-api.ts    # Unified stock media API client (Pexels, Unsplash, Pixabay)
│       │   ├── triggers/       # Trigger engine (evaluator, event bus, runtime, actions, migration, validation, defaults)
│       │   ├── tippy/          # TIPPY 4-layer prompt, features KB, profile generator, walkthrough engine/library, assesses engine/prompts, demo course
│       │   ├── built-in-assets.ts # 420+ built-in SVG icon, shape, and text-shape definitions
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
