import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// English namespaces
import enCommon from './locales/en/common.json'
import enEditor from './locales/en/editor.json'
import enDashboard from './locales/en/dashboard.json'
import enSettings from './locales/en/settings.json'
import enPreview from './locales/en/preview.json'
import enPublish from './locales/en/publish.json'
import enAccessibility from './locales/en/accessibility.json'

// Spanish namespaces
import esCommon from './locales/es/common.json'
import esEditor from './locales/es/editor.json'
import esDashboard from './locales/es/dashboard.json'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      editor: enEditor,
      dashboard: enDashboard,
      settings: enSettings,
      preview: enPreview,
      publish: enPublish,
      accessibility: enAccessibility
    },
    es: {
      common: esCommon,
      editor: esEditor,
      dashboard: esDashboard
    }
  },
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'editor', 'dashboard', 'settings', 'preview', 'publish', 'accessibility'],
  interpolation: {
    escapeValue: false // React already handles XSS
  }
})

export default i18n
