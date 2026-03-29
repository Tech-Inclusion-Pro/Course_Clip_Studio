<p align="center">
  <img src="resources/icon.png" alt="Course Clip Studio logo" width="128" height="128" style="border-radius: 20px;" />
</p>

<h1 align="center">Course Clip Studio</h1>

<p align="center">
  A cross-platform desktop course authoring application built with Universal Design for Learning (UDL) as a first principle.
</p>

---

## What Is Course Clip Studio?

Course Clip Studio is a professional-grade desktop application for creating accessible, interactive e-learning courses. It exports to industry-standard formats (SCORM, xAPI, HTML5, PDF) and is designed from the ground up with WCAG 2.1 AA accessibility compliance.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron 33 |
| Frontend | React 18 + TypeScript |
| Build Tool | electron-vite 5 (Vite 7) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| State Management | Zustand |
| Icons | lucide-react |

## Features (Milestone 1)

- **5 application views** — Dashboard, Editor (3-panel layout), Preview, Settings, Publish
- **Full design token system** — light mode, dark mode, and system-preference detection
- **Collapsible sidebar** with route navigation
- **Theme toggle** — cycles between light, dark, and system
- **Accessibility built in** — skip link, visible focus rings (3px), ARIA landmarks, 44px minimum tap targets, `prefers-reduced-motion` support
- **IPC architecture** — theme persistence and file dialogs via Electron IPC with context isolation
- **TypeScript data model** — full course structure types (Course, Module, Lesson, 10+ content block types, UDL checklists, certificates, export settings)

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **macOS**, Windows, or Linux

### Install Dependencies

```bash
cd lumina-udl
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
│   │   ├── index.ts           # BrowserWindow, app lifecycle
│   │   └── ipc-handlers.ts    # Theme persistence, file dialogs
│   ├── preload/               # Context bridge (renderer ↔ main)
│   │   ├── index.ts           # Exposed electronAPI
│   │   └── index.d.ts         # Window type augmentation
│   └── renderer/              # React application
│       ├── main.tsx            # Entry point (HashRouter)
│       ├── App.tsx             # Route definitions
│       ├── assets/styles/      # Design tokens + Tailwind
│       ├── components/         # Layout (AppShell, Sidebar, TopBar) + UI (Button, ThemeToggle, SkipLink)
│       ├── views/              # Dashboard, Editor, Preview, Settings, Publish
│       ├── stores/             # Zustand stores (app, course, editor)
│       ├── hooks/              # useTheme (system preference detection)
│       ├── lib/                # Constants and utilities
│       └── types/              # Course data model TypeScript types
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

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Tab | Navigate between interactive elements |
| Tab (from page top) | Skip link appears — press Enter to jump to main content |
| Theme toggle button | Cycles: Light → Dark → System |

## Accessibility

Course Clip Studio follows WCAG 2.1 AA guidelines in the authoring UI itself:

- Semantic HTML (`<main>`, `<nav>`, `<aside>`, `<header>`)
- Skip-to-content link
- 3px focus-visible ring on all interactive elements
- 44px minimum tap/click targets
- 16px minimum body text
- `lang="en"` on the root element
- `prefers-reduced-motion` media query support
- Full keyboard operability

## License

See [LICENSE](LICENSE) for details.
