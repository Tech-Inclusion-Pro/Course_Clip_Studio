# LuminaUDL Feature Reference — TIPPY Knowledge Base
Version: 1.0.0
Last Updated: 2026-04-04

## Course Structure

LuminaUDL organizes content into a three-level hierarchy: **Courses > Modules > Lessons**. Each lesson contains **blocks** — the individual content units the learner interacts with.

**Creating a Course:** From the Dashboard, click "New Course" to start a blank course or choose from templates (Corporate Training, Employee Onboarding, Compliance Training, Higher Education, and more). You can also import from PowerPoint, Markdown, DOCX, PDF, or SCORM packages.

**Modules and Lessons:** A course contains one or more modules. Each module contains one or more lessons. Modules can be reordered by drag-and-drop in the Outline panel. Each module has a UDL checklist to track representation, action/expression, and engagement coverage.

**Course Settings:**
- **Navigation:** Linear navigation (require sequential lesson completion) or free navigation (allow skipping).
- **Completion criteria:** Visit all lessons, pass quizzes, or both.
- **Learner features:** Progress bar, estimated time display, learner notes, bookmarks, feedback form, accessibility mode toggle.
- **Enrollment page:** Optional landing page with course description and start button.
- **Course readme:** Documentation displayed to learners before starting.

**Publishing:** Courses move through Draft → Review → Published → Archived statuses. A pre-flight check catches missing alt text, missing transcripts, and insufficient lesson counts before publishing.

**Export Formats:** SCORM 1.2, SCORM 2004 4th Edition, xAPI (Tin Can), HTML5 standalone, PDF (accessible), and cmi5. Each format has specific configuration options (mastery score, completion criteria, xAPI endpoint, page size for PDF).

## Block Library

LuminaUDL has 32 content block types. Each block can be added from the Block Palette in the editor toolbar.

**Text Blocks:**
- **Text** — Rich text content with formatting, headings, lists, and inline media. Supports reading level analysis and plain-language suggestions.

**Media Blocks:**
- **Media (Image)** — Single image with required alt text and optional long description. Supports built-in assets, API search (Pexels, Unsplash, Pixabay), and user uploads.
- **Video** — Embedded or uploaded video with required captions and optional transcript.
- **Audio** — Audio player with required transcript. Supports uploaded files and AI-generated narration.
- **Lottie** — Animated illustrations using Lottie JSON format. Supports built-in animated blocks.
- **PDF Viewer** — Embedded PDF display for supplementary documents.

**Interactive Blocks:**
- **Quiz** — Assessment block with multiple question types: multiple-choice, true/false, short-answer, Likert scale. Configurable pass threshold, feedback, question shuffling, answer shuffling, randomization with pool size.
- **Drag and Drop** — Interactive drag-and-drop matching activity.
- **Matching** — Match items from two lists.
- **Flashcard** — Flip cards for study and review.
- **Interactive Video** — Video with timed questions, pause points, and overlays.
- **Image Map (Hotspot)** — Clickable regions on an image. Each hotspot can contain content or navigate to a lesson.
- **Writing Block** — Open-ended response with variants: essay, reflection, journal, short-response. Supports rubric-based assessment and AI scoring (FERPA-protected).
- **Knowledge Check** — Pre/post/formative assessment linked to learning objectives. Shows learner growth between phases.
- **Feedback Form** — Collect learner feedback with Likert scales, free text, ratings, and multiple choice.

**Layout Blocks:**
- **Accordion** — Expandable/collapsible content sections.
- **Tabs** — Tabbed content panels.
- **Divider** — Visual separator between content sections.
- **Callout** — Highlighted content box for tips, warnings, or important notes.
- **Reveal Scroll** — Content that reveals as the learner scrolls.

**Advanced Blocks:**
- **Chart** — Data visualization with AI generation support. Uses QuickChart, Chart.js, D3, Recharts, or Observable Plot.
- **Math** — Mathematical notation using LaTeX/KaTeX rendering.
- **Code** — Syntax-highlighted code display.
- **Timeline** — Chronological event display.
- **Branching** — Scenario-based branching paths. Modes: user-choice (learner picks path) or criteria-based (path selected by quiz score, lesson completion, or time spent). Includes consequence tracking and visual branching graph.
- **Embed** — External content embed via iframe (YouTube, Google Slides, etc.).
- **H5P** — H5P interactive content integration.
- **Custom HTML** — Raw HTML/CSS/JS for custom interactions.
- **Plugin** — Custom plugin-based content.
- **Slide** — Presentation-style slide content.
- **File Upload** — Allow learners to upload files.
- **Save for Later** — Bookmarkable content for learner reference.
- **Converted Document** — Content imported from PDF, DOCX, or PPTX conversion.

**Nested Blocks:** Some blocks can contain other blocks. For example, a quiz can be nested inside an accordion or a flashcard. There are depth limits to prevent overly complex nesting.

**Block Accessibility:** Every block type has specific accessibility requirements. Images require alt text. Videos require captions. Audio requires transcripts. Interactive blocks must be keyboard navigable. TIPPY can check these requirements and guide the author to fix issues.

## Media Library

The Media Library is accessed from the editor toolbar or by clicking "Browse" on any media block.

**Tabs:**
- **All** — View all available assets across all sources.
- **Built-in** — LuminaUDL's bundled assets: icons, shapes, text shapes, and animated blocks.
- **Search Online** — Search connected API providers for images, videos, icons, and more.
- **My Uploads** — Assets the author has uploaded.
- **Generated** — AI-generated assets (charts, diagrams, narration).

**API Providers (configured in Settings > Media Sources):**
- **Images:** Pexels, Unsplash, Pixabay, custom endpoints.
- **Video:** Pexels Video, Pixabay Video, YouTube, Vimeo, custom.
- **Icons:** Noun Project, Font Awesome, Lottie Files.
- **Charts:** QuickChart, Chart.js, D3, Recharts, Observable Plot.
- **Audio/Narration:** OpenAI Whisper, ElevenLabs, Kokoro/Piper (local).
- **Diagrams:** Mermaid, Excalidraw, Kroki, D3 Diagrams.
- **Math:** MathJax, KaTeX, Chemistry RDKit.

**Accessibility Metadata:** Every asset tracks: alt text, long description, captions/subtitles, transcript, ARIA labels, source attribution, license info, WCAG compliance status, and UDL principle mapping (representation, action-expression, engagement).

**Filtering:** Filter assets by type, tier (built-in/API/uploaded/AI-generated), WCAG status, UDL principle, or category.

## Quiz and Assessment

**Quiz Block Configuration:**
- Add questions directly or import from a Question Bank via CSV.
- Question types: multiple-choice, true/false, short-answer, Likert scale.
- Each question can have: difficulty level (easy/medium/hard), Bloom's taxonomy level (remember through create), tags, and bank linkage.
- Randomization: set pool size and seed for reproducible random draws.
- Shuffle questions and/or answer choices.
- Set a pass threshold (percentage).
- Configure per-question feedback for correct and incorrect answers.

**Question Banks:** Reusable pools of questions stored at the course level. Import/export via CSV. Link bank questions to quiz blocks. Bank questions retain difficulty and Bloom's level metadata.

**Pre/Post Knowledge Check:** A specialized block that appears in three phases — Pre (baseline), Formative (during instruction), and Post (after instruction). Linked to learning objectives. Shows learner growth as score deltas between phases.

**Writing Block:** Open-ended response with rubric support. Variants: essay, reflection, journal, short-response. Each variant can have multiple prompt sections with word count constraints. AI scoring is available but FERPA-protected — the author must acknowledge before enabling.

**Assessment Analytics:** After learners interact, the analytics dashboard shows question difficulty, discrimination indices, answer distribution, pre/post comparisons, objective mastery rates, and item analysis with distractor effectiveness.

## Analytics and Reports

**Analytics Dashboard:** Accessed from the course editor via the Analytics panel or from the main navigation.

**Course Summary:**
- Enrollment count, completion rate, average score, average time spent.
- Drop-off analysis showing which lessons lose learners.
- Most replayed blocks.

**Assessment Analytics:**
- Question difficulty and discrimination indices.
- Answer distribution per choice.
- Pre/post knowledge check comparisons with objective mastery deltas.
- Phase-based scoring (pre, formative, post).

**UDL Engagement Summary:**
- Audio alternative usage rate.
- Caption and transcript access rates.
- Language toggle usage.
- Text-to-speech activation.
- Response type distribution.
- Extended time usage.
- Learner pathway choices.
- Bookmark and replay rates.

**Accessibility Report:**
- Reduced motion, screen reader, captions, high contrast usage rates.
- Accommodation tracking.

**Item Analysis (Advanced):**
- Difficulty index, discrimination index, point-biserial correlation per question.
- Distractor effectiveness analysis.
- KR-20 reliability estimate.
- Item flagging: good, review, or poor.

**Educator Progress Report:** Generate HTML or CSV reports showing per-learner progress, module completion, assessment scores, knowledge check phase scores, UDL pathway usage, and activity logs. Supports anonymization and date range filtering.

**Learner Self-Report:** Learners can download their own progress as a text file or printable PDF. Includes plain-language activity summaries grouped by date.

**LRS Integration:** Configure a Learning Record Store endpoint in Settings > Analytics. Supports Basic auth, realtime or batch statement delivery, queue-on-failure with retry, and anonymization toggle. All learner interactions are logged as xAPI statements.

**Privacy and FERPA:** Identified learner reporting requires explicit FERPA acknowledgment. Analytics default to anonymized mode. Cloud-based LRS connections show privacy warnings.

## Settings

**Settings > General:**
- Author display name.
- UI language (supports runtime translation via AI).
- Auto-save interval.
- Default export folder.
- Theme mode (light/dark).
- Active brand kit selection.

**Settings > Brand Kits:**
- Create and manage brand kits with logo, primary/secondary/accent colors, body and heading fonts.
- Google Fonts integration for custom typography.
- Apply brand kits to courses for consistent visual identity.

**Settings > AI/LLM (AI Connections):**
- Select AI provider: Anthropic (Claude), OpenAI (GPT-4o), or Ollama (local).
- Enter API keys for Anthropic and OpenAI.
- Configure Ollama endpoint URL and model name.
- Set default AI language for generation tasks.
- Test connection button to verify provider access.

**Settings > Accessibility:**
- High contrast mode toggle.
- Base font size adjustment.
- Reduced motion toggle.
- Color blind simulation modes (protanopia, deuteranopia, tritanopia, achromatopsia).
- Cursor styles (default, large, crosshair, high-contrast) with optional trail.
- OpenDyslexic font option.
- Bionic reading mode.
- Enhanced text spacing.
- Enhanced focus indicators.

**Settings > Analytics:**
- LRS endpoint, key, secret configuration.
- Statement delivery mode (realtime or batch with interval).
- Anonymization toggle.
- Queue-on-failure toggle.
- FERPA-gated identified learner reporting toggle.
- Data management (clear analytics data).

## Accessibility

**Live WCAG Checker:** The editor includes an accessibility audit panel that checks content against WCAG 2.1 AA criteria in real time. Issues are flagged with severity levels: critical, serious, moderate, or minor.

**How to Read WCAG Annotations:** Each flagged issue shows the WCAG success criterion, the affected block, a plain-language explanation, and suggested remediation. Critical issues must be resolved before publishing.

**Alt Text:** Every image block requires alt text. TIPPY can suggest alt text using AI (via the "Generate Alt Text" action). Decorative images should use empty alt text (`alt=""`).

**Captions and Transcripts:** Video blocks require captions. Audio blocks require transcripts. These can be uploaded manually or generated using connected audio APIs (ElevenLabs, Kokoro/Piper).

**Reading Level:** Text blocks show a Flesch-Kincaid reading level indicator. TIPPY can suggest plain-language alternatives for complex text.

**Color Contrast:** The theme editor validates color contrast ratios against WCAG AA (4.5:1 for text, 3:1 for large text). The accessibility settings panel includes color blind simulation modes.

**Keyboard Navigation:** All interactive blocks are keyboard accessible. Tab to navigate, Enter/Space to activate, Escape to dismiss. The editor itself is fully keyboard navigable.

**Screen Reader Support:** All content uses semantic HTML and ARIA attributes. The preview mode simulates screen reader announcement order.

**UDL Checklist:** Each module includes a UDL checklist tracking coverage across three principles:
- **Representation:** Multiple formats, alt text, transcripts, captions, appropriate reading level.
- **Action and Expression:** Keyboard navigation, multiple response modes, sufficient time.
- **Engagement:** Choice and autonomy, relevant context, feedback, progress visibility.

## Export

**SCORM 1.2:** Export a SCORM 1.2 compliant package for legacy LMS platforms. Configure mastery score and completion criteria.

**SCORM 2004:** Export a SCORM 2004 4th Edition package with advanced sequencing support.

**xAPI (Tin Can):** Export an xAPI-compliant package. Configure the xAPI endpoint URL and Basic auth credentials. All learner interactions generate xAPI statements with UDL extensions.

**HTML5:** Export a standalone HTML5 player package that runs without an LMS. Includes all course content, media, and the interactive player.

**PDF:** Generate an accessible PDF with configurable page size (A4 or Letter). Options to include quiz answers and UDL notes. PDFs are tagged for screen reader compatibility.

**cmi5:** Export a cmi5-compliant package with course structure XML, per-lesson entry pages, and an embedded AU runtime script. Configure mastery score, moveOn criteria, and launch method.

**LMS Integration:** Direct upload wizards for Canvas, Blackboard, and Moodle. Map course metadata to LMS fields and synchronize content.

## TIPPY

**Using TIPPY:** TIPPY is always available via the floating button in the bottom-left corner. Click to open the chat panel. Type a question or use one of the quick action buttons: "Give me a tour," "Help me get started," or "What can I do here?"

**TIPPY Tours:** TIPPY can walk you through the interface with guided tours. The current tour covers 10 areas: Sidebar, Dashboard, Toolbar, Outline, Canvas, Properties, Block Palette, AI Assistant, Preview, and Publish. During a tour, TIPPY highlights each area with a pulsing border and explains what it does.

**Session Management:** Save your TIPPY conversations for later reference. Load or delete saved sessions from the sessions dropdown in the panel header.

**Context Awareness:** TIPPY knows where you are in the application and what you're working on. It adjusts its responses based on whether you're on the Dashboard, in the Editor, in Preview, in Settings, or on the Publish page. It knows your active course, module, lesson, and selected block.

**AI Reasoning Transparency:** Every substantive TIPPY recommendation includes a "How does TIPPY reason?" panel showing: sources cited, confidence level, known limitations, and what human review is required. This ensures transparency about AI-generated advice.

**Error Assistance:** When an error occurs in the application, TIPPY automatically opens and offers to help resolve it. It shows the error message and suggests troubleshooting steps.

**FERPA Awareness:** TIPPY warns you before any action that would send learner data to a cloud AI provider. It recommends using local Ollama for privacy-sensitive work.

## AI Features

**Generate Course Outline:** AI creates a structured outline of modules and lessons based on your topic, audience, and objectives. Uses the Base Brain context (design assumptions, tone, goals) and any reference files you've provided.

**Generate Lesson Content:** AI drafts content blocks for a lesson based on its title, position in the course, and your design preferences. The author reviews and edits all generated content.

**Generate Quiz Questions:** AI creates quiz questions from lesson content. Questions include difficulty levels and Bloom's taxonomy alignment. The author reviews all questions before publishing.

**Write Narration Script:** AI generates a narration script for a lesson, suitable for text-to-speech conversion or voice recording. Matches the author's specified tone and audience level.

**Generate Alt Text:** AI suggests alt text for images based on visual content analysis. The author must verify that the alt text accurately describes the image's instructional purpose.

**Translate Lesson:** AI translates lesson content to a target language. Supports all major languages. The author should have a native speaker review translations before publishing.

**WCAG Accessibility Review:** AI analyzes course content against WCAG 2.1 AA criteria and identifies potential issues. Uses axe-core for automated testing plus AI for contextual analysis.

**UDL Improvement Suggestions:** AI suggests ways to improve Universal Design for Learning coverage. Identifies gaps in representation, action/expression, and engagement and recommends specific block types or content additions.

**AI Interview:** Before generating content, AI can conduct a brief interview asking about audience, objectives, prior knowledge, preferred tone, format, and accessibility needs. This context improves generation quality.

**Base Brain:** Configure persistent AI context in the course settings: design assumptions, tone and voice guidelines, visual preferences, course goals, and reference files by category (design, content, assignment, quiz, rubric, standards, template).

## Design and Branding

**Course Theme:** Each course has a customizable theme: primary, secondary, and accent colors; background and surface colors; text colors; body and heading fonts (with Google Fonts support); custom CSS; dark mode support; and logo.

**Player Shell:** Configure the learner-facing player: header color, button style (rounded, square, pill), progress bar color, and logo visibility.

**Loading Screen:** Customize the course loading screen with logo, background color, progress ring, and welcome message.

**Certificate Designer:** Design completion certificates with templates, logo, signature lines, brand colors, custom fields, and font styling. Certificates trigger automatically on course completion or passing score.

**Brand Kits:** Save and reuse brand configurations across courses. A brand kit includes logo, color palette, and typography settings.

## Syllabus Builder

The Syllabus Builder is a guided wizard for planning course structure before building content.

**Wizard Steps:**
1. **Course Identity** — Title, description, and metadata.
2. **Audience Level** — Define target learner characteristics.
3. **Learning Objectives** — Create objectives aligned to Bloom's Taxonomy levels (remember, understand, apply, analyze, evaluate, create).
4. **Assignments** — Define assignment types: essay, project, presentation, discussion, quiz, lab, reflection, group work, case study.
5. **Rubrics** — Create rubrics: analytic, holistic, single-point, or checklist format.
6. **Review and Export** — Review the complete syllabus and export or start building.

**UDL Annotations:** Each objective, assignment, and rubric can be annotated with UDL principle alignment (representation, action-expression, engagement).

**Reusable Pools:** Objectives, assignments, and rubrics are saved as reusable items that can be shared across courses.

## Import and Conversion

**PowerPoint Import:** Import .pptx files and convert slides to course lessons with content blocks.

**Markdown Import:** Import .md files as text content blocks with formatting preserved.

**Document Conversion:** Convert DOCX, PDF, and PPTX files into accessible HTML content blocks. The converter extracts text, images, and structure.

**SCORM Import:** Import existing SCORM packages to edit and re-export.

## Collaboration and Version History

**Version History:** The editor maintains a snapshot-based version history. Each save creates a labeled, timestamped version. Authors can restore any previous version.

**Collaborator Notes:** Team members can add notes to individual blocks. Notes track author attribution, timestamps, and resolution status.
