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

  // Common UI
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.deleteTemplate': 'Delete template',

  // Translation banner
  'translation.translating': 'Translating to {{language}}...',
  'translation.complete': 'Translation complete',
  'translation.error': 'Translation failed. Using English.',
  'translation.clearCache': 'Clear translation cache'
}

export const EN_STRINGS: Record<string, string> = {
  ...namespaceStrings,
  ...hardcodedStrings
}
