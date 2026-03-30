/**
 * LMS integration types.
 */

export type LmsProvider = 'canvas' | 'moodle' | 'blackboard'

export interface LmsCredentials {
  provider: LmsProvider
  /** Base URL of the LMS instance (e.g., https://myschool.instructure.com) */
  baseUrl: string
  /** API token / key */
  apiToken: string
}

export interface LmsCourse {
  id: string
  name: string
}

export interface LmsUploadResult {
  success: boolean
  courseId?: string
  moduleName?: string
  error?: string
}

export interface LmsConnectionResult {
  connected: boolean
  userName?: string
  error?: string
}

export const LMS_PROVIDERS: Array<{
  id: LmsProvider
  label: string
  description: string
  tokenHelp: string
  urlPlaceholder: string
}> = [
  {
    id: 'canvas',
    label: 'Canvas LMS',
    description: 'Instructure Canvas — widely used in higher education',
    tokenHelp: 'Go to Account → Settings → New Access Token. Copy the generated token.',
    urlPlaceholder: 'https://yourschool.instructure.com'
  },
  {
    id: 'moodle',
    label: 'Moodle',
    description: 'Open-source LMS — popular worldwide for K-12 and higher ed',
    tokenHelp: 'Go to Site Administration → Plugins → Web services → Manage tokens. Create a token with upload capabilities.',
    urlPlaceholder: 'https://moodle.yourschool.edu'
  },
  {
    id: 'blackboard',
    label: 'Blackboard Learn',
    description: 'Anthology Blackboard — enterprise learning management',
    tokenHelp: 'Go to System Admin → REST API Integrations → Create Integration. Use the Application Key and Secret to obtain a bearer token.',
    urlPlaceholder: 'https://yourschool.blackboard.com'
  }
]
