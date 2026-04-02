// ─── Master English String Dictionary ───
// Flattened from 7 JSON namespace files + hardcoded UI strings

import enCommon from '@/i18n/locales/en/common.json'
import enEditor from '@/i18n/locales/en/editor.json'
import enDashboard from '@/i18n/locales/en/dashboard.json'
import enSettings from '@/i18n/locales/en/settings.json'
import enPreview from '@/i18n/locales/en/preview.json'
import enPublish from '@/i18n/locales/en/publish.json'
import enAccessibility from '@/i18n/locales/en/accessibility.json'

/** Recursively flatten a nested object into dotted keys */
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      result[fullKey] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey))
    }
  }
  return result
}

const namespaceStrings: Record<string, string> = {
  ...flatten(enCommon, 'common'),
  ...flatten(enEditor, 'editor'),
  ...flatten(enDashboard, 'dashboard'),
  ...flatten(enSettings, 'settings'),
  ...flatten(enPreview, 'preview'),
  ...flatten(enPublish, 'publish'),
  ...flatten(enAccessibility, 'accessibility')
}

// Hardcoded strings found in components that don't use i18n
const hardcodedStrings: Record<string, string> = {
  // DashboardSidebar
  'sidebar.myCourses': 'My Courses',
  'sidebar.templates': 'Templates',
  'sidebar.contentAreas': 'Content Areas',
  'sidebar.syllabusBuilder': 'Syllabus Builder',
  'sidebar.brandKit': 'Brand Kit',
  'sidebar.recent': 'Recent',
  'sidebar.noRecentCourses': 'No recent courses',
  'sidebar.expandSidebar': 'Expand sidebar',
  'sidebar.collapseSidebar': 'Collapse sidebar',

  // DashboardView
  'dashboard.myCourses': 'My Courses',
  'dashboard.createAndManage': 'Create and manage your course content',
  'dashboard.import': 'Import',
  'dashboard.newCourse': 'New Course',
  'dashboard.noMatchingCourses': 'No matching courses',
  'dashboard.noCourses': 'No courses yet',
  'dashboard.noMatchingDescription': "Try adjusting your search or filters to find what you're looking for.",
  'dashboard.getStartedDescription': 'Get started by creating your first course. You can add modules, lessons, and interactive content blocks.',
  'dashboard.createFirstCourse': 'Create Your First Course',
  'dashboard.templates': 'Templates',
  'dashboard.startWithTemplate': 'Start with a pre-built course structure',
  'dashboard.myTemplates': 'My Templates',
  'dashboard.createTemplate': 'Create Template',
  'dashboard.buildCustomTemplate': 'Build a custom template from scratch',
  'dashboard.builtInTemplates': 'Built-in Templates',
  'dashboard.loadingWorkspace': 'Loading workspace...',
  'dashboard.templateName': 'Template Name',
  'dashboard.description': 'Description',
  'dashboard.icon': 'Icon',
  'dashboard.modules': 'Modules',
  'dashboard.lessonsPerModule': 'Lessons per Module',
  'dashboard.cancel': 'Cancel',

  // EditorToolbar
  'toolbar.backToDashboard': 'Back to dashboard',
  'toolbar.clickToRename': 'Click to rename course',
  'toolbar.undo': 'Undo',
  'toolbar.redo': 'Redo',
  'toolbar.splitPreview': 'Split preview',
  'toolbar.preview': 'Preview',
  'toolbar.publish': 'Publish',
  'toolbar.saveAsTemplate': 'Save as Template',
  'toolbar.themeEditor': 'Theme Editor',
  'toolbar.certificateDesigner': 'Certificate Designer',
  'toolbar.accessibilityAudit': 'Accessibility Audit',
  'toolbar.aiAssistant': 'AI Assistant',
  'toolbar.save': 'Save',
  'toolbar.saved': 'Saved!',
  'toolbar.versionHistory': 'Version History',
  'toolbar.notes': 'Notes',
  'toolbar.hideOutline': 'Hide outline',
  'toolbar.showOutline': 'Show outline',
  'toolbar.hideProperties': 'Hide properties',
  'toolbar.showProperties': 'Show properties',
  'toolbar.switchToSlide': 'Switch to Slide view',
  'toolbar.switchToBlock': 'Switch to Block view',
  'toolbar.toggleGrid': 'Toggle Grid',
  'toolbar.smartGuides': 'Smart Guides',
  'toolbar.branchingGraph': 'Branching Graph',
  'toolbar.questionBank': 'Question Bank',
  'toolbar.desktop': 'Desktop',
  'toolbar.tablet': 'Tablet',
  'toolbar.mobile': 'Mobile',
  'toolbar.untitledCourse': 'Untitled Course',

  // SettingsView
  'settingsView.general': 'General',
  'settingsView.brandKits': 'Brand Kits',
  'settingsView.aiLlm': 'AI / LLM',
  'settingsView.accessibility': 'Accessibility',
  'settingsView.settings': 'Settings',
  'settingsView.author': 'Author',
  'settingsView.authorName': 'Author Name',
  'settingsView.authorNameDesc': 'Used in collaborator notes and certificates',
  'settingsView.preferences': 'Preferences',
  'settingsView.defaultLanguage': 'Default Language',
  'settingsView.defaultLanguageDesc': 'Language for new courses',
  'settingsView.appearance': 'Appearance',
  'settingsView.theme': 'Theme',
  'settingsView.themeDesc': 'Controls the authoring UI appearance',
  'settingsView.workspace': 'Workspace',
  'settingsView.workspaceFolder': 'Workspace Folder',
  'settingsView.workspaceFolderDesc': 'Where your courses are stored on disk',
  'settingsView.notSet': 'Not set',
  'settingsView.change': 'Change',

  // AIPanel
  'ai.generateCourseOutline': 'Generate Course Outline',
  'ai.generateLessonContent': 'Generate Lesson Content',
  'ai.generateQuizQuestions': 'Generate Quiz Questions',
  'ai.writeNarrationScript': 'Write Narration Script',
  'ai.generateAltText': 'Generate Alt Text',
  'ai.translateLesson': 'Translate Lesson',
  'ai.wcagReview': 'WCAG Accessibility Review',
  'ai.udlSuggestions': 'UDL Improvement Suggestions',

  // Onboarding
  'onboarding.chooseLanguage': 'Choose Your Language',
  'onboarding.languageDescription': 'Select the language for the application interface. The UI will be translated using AI.',
  'onboarding.ltrLanguages': 'Languages (Left-to-Right)',
  'onboarding.rtlLanguages': 'Languages (Right-to-Left)',

  // Common UI
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.deleteTemplate': 'Delete template',

  // Translation banner
  'translation.translating': 'Translating to {{language}}...',
  'translation.complete': 'Translation complete',
  'translation.error': 'Translation failed. Using English.',
  'translation.clearCache': 'Clear translation cache',

  // Tippy AI Assistant
  'tippy.label': 'Tippy',
  'tippy.ariaLabel': 'Tippy AI Assistant',
  'tippy.title': 'Tippy',
  'tippy.placeholder': 'Ask Tippy anything...',
  'tippy.inputLabel': 'Message Tippy',
  'tippy.send': 'Send',
  'tippy.clear': 'Clear chat',
  'tippy.save': 'Save session',
  'tippy.close': 'Close',
  'tippy.sessions': 'Sessions',
  'tippy.noSessions': 'No saved sessions',
  'tippy.greeting': "Hi! I'm Tippy, your AI assistant. How can I help?",
  'tippy.quickTour': 'Give me a tour',
  'tippy.quickStart': 'Help me get started',
  'tippy.quickContext': 'What can I do here?',
  'tippy.generating': 'Thinking...',
  'tippy.tourComplete': 'Tour complete! Feel free to ask me anything as you explore.',
  'tippy.tourSkipped': 'Tour skipped. Ask me anytime if you want to continue!',
  'tippy.errorNotice': 'I noticed an error. Would you like help?',

  // Tippy Tour Steps
  'tippy.tour.sidebarTitle': 'Sidebar Navigation',
  'tippy.tour.sidebarDesc': 'Use the sidebar to switch between Dashboard, Editor, Preview, Settings, and Publish views.',
  'tippy.tour.dashboardTitle': 'Dashboard',
  'tippy.tour.dashboardDesc': 'Your home base — create, open, and manage courses, templates, content areas, and syllabi.',
  'tippy.tour.toolbarTitle': 'Editor Toolbar',
  'tippy.tour.toolbarDesc': 'Access undo/redo, preview, publish, AI assistant, theme editor, and more from the toolbar.',
  'tippy.tour.outlineTitle': 'Course Outline',
  'tippy.tour.outlineDesc': 'The outline panel shows your course structure — modules, lessons, and blocks. Drag to reorder.',
  'tippy.tour.canvasTitle': 'Content Canvas',
  'tippy.tour.canvasDesc': 'This is where you build lessons. Add content blocks, arrange them, and switch between Block and Slide views.',
  'tippy.tour.propertiesTitle': 'Properties Panel',
  'tippy.tour.propertiesDesc': 'Select a block to see its properties here. Customize text, media, quiz settings, and accessibility options.',
  'tippy.tour.blockPaletteTitle': 'Block Palette',
  'tippy.tour.blockPaletteDesc': 'Add new content blocks — text, images, video, audio, quizzes, accordions, tabs, and more.',
  'tippy.tour.aiAssistantTitle': 'AI Assistant',
  'tippy.tour.aiAssistantDesc': 'Use AI to generate outlines, lesson content, quizzes, narration, alt text, translations, and accessibility reviews.',
  'tippy.tour.previewTitle': 'Preview',
  'tippy.tour.previewDesc': 'Preview your course as a learner would see it. Switch between desktop, tablet, and mobile views.',
  'tippy.tour.publishTitle': 'Publish',
  'tippy.tour.publishDesc': 'Export your course as SCORM, xAPI, or HTML5. Configure settings and download the package.',

  // Tippy Tour Narration Messages (what Tippy says in chat for each step)
  'tippy.tour.sidebarMsg': "This is the **Sidebar** — your main navigation hub! From here you can jump between the Dashboard, Editor, Preview, Settings, and Publish views. Think of it as your home base for moving around the app. Ready? Let's move on!",
  'tippy.tour.dashboardMsg': "Welcome to the **Dashboard**! This is where all your courses live. You can create new courses, open existing ones, import content, browse templates, manage content areas, and build syllabi. It's your course command center!",
  'tippy.tour.toolbarMsg': "Here's the **Editor Toolbar** — packed with powerful tools! You'll find undo/redo, split preview, the AI assistant, theme editor, accessibility audit, save, and publish buttons. Pro tip: hover over any icon to see what it does.",
  'tippy.tour.outlineMsg': "This is the **Course Outline** panel. It shows your entire course structure — modules, lessons, and content blocks — in a tree view. You can drag and drop to reorder anything. Click a lesson to open it in the canvas.",
  'tippy.tour.canvasMsg': "This is the **Content Canvas** — your creative workspace! This is where you build lessons by adding and arranging content blocks. You can switch between **Block view** (stacked) and **Slide view** (presentation-style) using the toolbar toggle.",
  'tippy.tour.propertiesMsg': "The **Properties Panel** appears when you select a content block. Here you can customize everything — text formatting, media settings, quiz options, accessibility attributes like alt text, and more. Each block type has its own set of properties.",
  'tippy.tour.blockPaletteMsg': "The **Block Palette** is your content toolkit! Add text blocks, images, video, audio, quizzes, accordions, tabs, hotspots, timelines, and many more interactive elements. Just click or drag a block type to add it to your lesson.",
  'tippy.tour.aiAssistantMsg': "Meet the **AI Assistant** panel! This is where AI-powered magic happens. Generate course outlines, lesson content, quiz questions, narration scripts, alt text, translations, and even WCAG accessibility reviews — all powered by your configured AI provider.",
  'tippy.tour.previewMsg': "The **Preview** view lets you experience your course exactly as a learner would see it. Switch between desktop, tablet, and mobile views to test responsiveness. You can also add learner notes and bookmarks to test the full experience.",
  'tippy.tour.publishMsg': "Finally, the **Publish** view! When your course is ready, export it as a **SCORM**, **xAPI**, or **HTML5** package. Configure your export settings and download — your course is ready to deploy to any LMS!"
}

export const EN_STRINGS: Record<string, string> = {
  ...namespaceStrings,
  ...hardcodedStrings
}
