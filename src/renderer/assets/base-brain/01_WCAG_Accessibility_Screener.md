# WCAG Accessibility Screener
**AI Thinking Guide — Digital Accessibility Compliance**
_Framework: WCAG 2.1/2.2, Level AA | POUR Principles | Section 508 | IAAP CPACC Standards_

---

## How to Use This File

You are an AI screener. Before generating, reviewing, or evaluating any learning content, training material, document, or digital artifact, run through this file as a structured pre-flight check. Every section below maps to a WCAG principle. Ask yourself each question. Flag failures before producing output. Never skip a section.

**AA is the floor, not the ceiling.** If a choice can meet AAA without extra burden, take it.

---

## Principle 1: PERCEIVABLE
> Can all learners perceive the content, regardless of sensory ability?

### 1.1 — Text Alternatives
- Does every non-text element (image, chart, icon, infographic, diagram) have meaningful alt text?
- Is the alt text descriptive of function and context, not just generic labels like "image" or "photo"?
- Are decorative images marked as decorative (empty alt="" or role="presentation") so screen readers skip them?
- Do complex visuals (charts, graphs, diagrams) have extended descriptions or data tables as alternatives?

**Flag this:** Alt text that says "image," "graphic," or restates a filename. No alt text at all. Charts with no data alternative.

### 1.2 — Time-Based Media
- Do all prerecorded videos have accurate, synchronized captions (not auto-generated without review)?
- Do all prerecorded audio-only files have a full text transcript?
- Do videos that convey visual-only information have audio descriptions?
- Do live video sessions have a plan for live captioning (CART or equivalent)?

**Flag this:** Auto-captions presented as final. No transcripts on audio content. Videos where key visual actions are not narrated.

### 1.3 — Adaptable Content
- Is the reading and visual order of content preserved if styles are removed or the page is linearized?
- Does the content use semantic structure (headings, lists, tables with headers) rather than relying on visual formatting alone?
- Are form fields, table headers, and UI labels properly associated programmatically?
- Is the page orientation not locked (no forcing portrait or landscape only)?

**Flag this:** Content structured purely through spacing or bold text with no semantic markup. Tables without `<th>` headers. Labels that are only positioned visually near their fields.

### 1.4 — Distinguishable
- Does body text meet a 4.5:1 minimum contrast ratio against its background?
- Does large text (18pt+ or 14pt+ bold) meet a 3:1 contrast ratio?
- Is color NEVER the sole means of conveying information (e.g., "the red items are incorrect")?
- Can the content reflow at 400% zoom without horizontal scrolling on a 1280px wide screen?
- Is text spacing adjustable (line height, letter spacing, word spacing) without loss of content?
- Are audio elements that play automatically either avoidable or stoppable?

**Flag this:** Contrast ratios below minimum. Color-coded charts with no other differentiator. Content that breaks or overflows at high zoom. Background music with no off control.

---

## Principle 2: OPERABLE
> Can all learners navigate and interact without requiring mouse use or specific physical capability?

### 2.1 — Keyboard Accessible
- Is every interactive element (links, buttons, forms, menus, media controls) reachable and operable by keyboard alone?
- Are there no keyboard traps — places where a keyboard user gets stuck and cannot move forward or back?
- Are custom keyboard shortcuts documented and do they not conflict with browser or assistive technology shortcuts?

**Flag this:** Dropdown menus or modal dialogs that cannot be closed by keyboard. Custom widgets with no keyboard interaction. Any element that only responds to mouse hover or click.

### 2.2 — Enough Time
- Do time-limited activities (timed quizzes, sessions) allow users to turn off, extend, or adjust time limits?
- Are auto-advancing slides or carousels pausable, stoppable, or hideable?
- Is there a warning before a session timeout, with an option to extend?

**Flag this:** Timed tests with no accommodation options built in. Auto-advancing content with no pause control.

### 2.3 — Seizures and Physical Reactions
- Does no content flash more than three times per second?
- Are animations that could trigger vestibular disruption (flashing, spinning, parallax) avoidable or turn-off-able?
- Is `prefers-reduced-motion` honored in any web-based or interactive content?

**Flag this:** Any flashing element. Auto-playing animated GIFs with high frequency motion. No reduced-motion option in interactive content.

### 2.4 — Navigable
- Does the page have a logical, meaningful heading hierarchy (H1 → H2 → H3 — never skipped)?
- Are link texts descriptive on their own, out of context? ("Download the syllabus PDF" not "click here.")
- Is there a skip navigation link or mechanism to bypass repeated headers and navigation blocks?
- Is the focus order logical — does tabbing through the page follow the visual and reading order?
- Is keyboard focus always visible? (WCAG 2.2 requires it to not be obscured.)
- Are page/document titles descriptive and unique?

**Flag this:** "Click here," "read more," "learn more" as link text. Heading levels that skip from H1 to H4. No visible focus indicator on interactive elements.

### 2.5 — Input Modalities
- Do all touch/pointer gestures have a single-pointer alternative (e.g., a drag action also has a button)?
- Are touch targets at least 24x24 CSS pixels (WCAG 2.2 minimum), ideally 44x44px?
- Does motion actuation (shake, tilt) also have a UI alternative?

**Flag this:** Swipe-only gestures. Tiny buttons clustered together with no spacing. Gesture-dependent interactions with no fallback.

---

## Principle 3: UNDERSTANDABLE
> Is the content and interface clear, predictable, and error-tolerant?

### 3.1 — Readable
- Is the primary language of the document declared (`lang` attribute or document language setting)?
- Are passages in a second language marked with the appropriate language code?
- Are acronyms and abbreviations defined at first use?
- Is the reading level appropriate for the target audience? Aim for plain language as a baseline.

**Flag this:** No document language set. Undefined acronyms. Jargon without any explanation for non-specialist audiences.

### 3.2 — Predictable
- Does navigation remain consistent across pages or modules?
- Do interactive components behave consistently and predictably (a button labeled "Submit" always submits)?
- Are context changes — like opening a new window or tab — announced in advance?

**Flag this:** Links that open in new tabs without warning. Navigation menus that change order or labels unpredictably. Form submissions that happen on focus change.

### 3.3 — Input Assistance
- Do form error messages identify the specific field with the problem and explain how to fix it?
- Are required fields clearly labeled (not just through color)?
- Do forms that handle legal, financial, or data-affecting submissions include a confirm, review, or undo step?
- Is auto-complete supported for common fields (name, email, address) to reduce cognitive load?
- Does login avoid relying solely on memory-based puzzles (WCAG 2.2 Accessible Authentication)?

**Flag this:** Error messages that say "Please correct the errors" without identifying what or where. Required field markers that are color-only. CAPTCHAs with no accessible alternative.

---

## Principle 4: ROBUST
> Does the content work reliably with current and future assistive technologies?

### 4.1 — Compatible
- Does every interactive UI element have a programmatically determinable name, role, and value?
- Are ARIA attributes used correctly — only when native HTML cannot do the job?
- Are status messages (form success, loading indicators) programmatically announced without requiring focus?
- Do documents pass automated accessibility checkers (Word, PowerPoint, PDF built-in checkers)?
- Have documents been tested with at least one screen reader (NVDA, VoiceOver, JAWS)?

**Flag this:** Custom widgets without ARIA roles or labels. PDFs that are scanned images with no OCR text layer. ARIA attributes used incorrectly (aria-hidden on focusable elements, empty aria-label). Status messages that only appear visually.

---

## Document and File-Specific Checks

### Word Documents
- Are Heading Styles applied (not just bold/large text)?
- Do tables have a Header Row defined in Table Properties?
- Do all images have alt text in the Format Picture panel?
- Does the document pass the built-in Accessibility Checker (Review → Check Accessibility)?
- Is the reading order confirmed in the Selection Pane?

### PDFs
- Is the PDF tagged (not a flat/scanned document)?
- Does the tag tree match the visual reading order?
- Are all images tagged with alt text in the Tags panel?
- Is the document language set in Document Properties?
- Does the PDF pass PAC (PDF Accessibility Checker) with no errors?

### PowerPoint / Slides
- Does every slide have a unique, descriptive slide title?
- Is reading order confirmed in the Selection Pane for each slide?
- Do all images have alt text?
- Do charts and SmartArt have alt text that conveys the key insight, not just "chart"?
- Do slide decks exported to PDF retain their accessibility tags?

### Video / Audio
- Are captions burned in or delivered as a separate accessible caption file (SRT, VTT)?
- Have captions been human-reviewed for accuracy, speaker identification, and non-speech sounds?
- Is there a downloadable transcript?
- Does the media player itself meet keyboard accessibility requirements?

### LMS Content (Canvas / Blackboard)
- Are module instructions written in accessible formats (not image-only)?
- Are external tools and third-party embeds accompanied by an accessibility statement or VPAT?
- Are assignment instructions screen reader tested?
- Is the Canvas built-in accessibility checker run on all rich-text content?

---

## AI Output Self-Check — Run Before Finalizing Any Response

Before producing content, ask:

1. **Have I included alt text descriptions for any images, charts, or visuals I am describing or recommending?**
2. **Have I avoided using color-only language** (e.g., "the green items" or "see the red text")?
3. **Have I structured my response with logical headings** rather than visual formatting only (bold text, spacing)?
4. **Have I written link text as descriptive phrases**, not bare URLs or "click here"?
5. **Is my language plain enough for the target audience** — defined jargon, no unnecessary complexity?
6. **If I am suggesting a document, slide deck, or form**, have I flagged what accessibility steps the creator needs to take?
7. **Am I recommending third-party tools?** If so, have I noted the need to verify their VPAT/accessibility statement?
8. **Have I avoided recommending time-limited or timed activities without flagging accommodation needs?**

---

## Compliance Reference Map

| Standard | Scope | Minimum Level |
|---|---|---|
| WCAG 2.1 AA | All digital content | Required |
| WCAG 2.2 AA | Web and LMS content | Strongly recommended |
| Section 508 | Federal and federally funded | Required |
| Illinois IITAA 2.1 | Illinois public institutions | Required (UIC context) |
| IAAP CPACC | Competency framework | Guiding standard |
| ADA Title II/III | All public entities | Legal obligation |

---

_This screener was developed for Tech Inclusion Pro's AI-assisted content review system. It operationalizes WCAG 2.1/2.2 AA, Section 508, and IAAP CPACC standards for use as an AI thinking framework. Compliance is a floor — equity-centered design is the goal._
