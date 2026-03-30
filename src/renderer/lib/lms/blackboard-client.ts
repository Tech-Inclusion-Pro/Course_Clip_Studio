/**
 * Blackboard Learn REST API client.
 * Uses Electron net module via IPC for CORS-free requests.
 *
 * Blackboard REST API docs: https://developer.anthology.com/portal/displayApi
 */

import type { LmsConnectionResult, LmsCourse, LmsUploadResult } from './types'

function apiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}/learn/api/public/v3${path}`
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json'
  }
}

/**
 * Test connection by fetching the system version info.
 * Blackboard tokens are typically OAuth2 bearer tokens.
 */
export async function blackboardTestConnection(
  baseUrl: string,
  token: string
): Promise<LmsConnectionResult> {
  try {
    // Try to get the current user
    const res = await window.electronAPI.net.request({
      url: apiUrl(baseUrl, '/users/me'),
      headers: authHeaders(token)
    })

    if (res.status === 200) {
      const user = JSON.parse(res.body)
      const name = user.name
        ? `${user.name.given || ''} ${user.name.family || ''}`.trim()
        : user.userName
      return { connected: true, userName: name || 'Connected' }
    }

    // Try system version as fallback
    const vRes = await window.electronAPI.net.request({
      url: `${baseUrl.replace(/\/+$/, '')}/learn/api/public/v1/system/version`,
      headers: authHeaders(token)
    })

    if (vRes.status === 200) {
      return { connected: true, userName: 'Connected' }
    }

    return { connected: false, error: `HTTP ${res.status}: ${res.statusText}` }
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : 'Connection failed' }
  }
}

/**
 * List courses the user has access to.
 */
export async function blackboardListCourses(
  baseUrl: string,
  token: string
): Promise<LmsCourse[]> {
  const res = await window.electronAPI.net.request({
    url: apiUrl(baseUrl, '/courses?limit=50&availability.available=Yes'),
    headers: authHeaders(token)
  })

  if (res.status !== 200) {
    throw new Error(`Failed to list courses: HTTP ${res.status}`)
  }

  const data = JSON.parse(res.body)
  const results = data.results || []

  return (results as Array<{ id: string; name: string; courseId: string }>).map((c) => ({
    id: c.id,
    name: c.name || c.courseId
  }))
}

/**
 * Upload a SCORM package to a Blackboard course.
 *
 * Blackboard upload flow:
 * 1. POST /courses/{courseId}/contents — create a content item
 * 2. Upload the SCORM package as a content attachment
 *
 * Note: Blackboard's content upload API can be complex.
 * We create a content item and upload the package.
 */
export async function blackboardUploadScorm(
  baseUrl: string,
  token: string,
  courseId: string,
  packageBlob: Blob,
  fileName: string
): Promise<LmsUploadResult> {
  try {
    const scormName = fileName.replace(/\.zip$/i, '')

    // Step 1: Upload file to course's content collection
    const fileBuffer = await packageBlob.arrayBuffer()

    const uploadRes = await window.electronAPI.net.uploadFile({
      url: apiUrl(baseUrl, `/courses/${courseId}/contents/upload`),
      headers: authHeaders(token),
      fileData: fileBuffer,
      fileName,
      fieldName: 'file'
    })

    if (uploadRes.status >= 200 && uploadRes.status < 300) {
      return { success: true, courseId, moduleName: scormName }
    }

    // Fallback: Try the content creation endpoint
    const contentRes = await window.electronAPI.net.request({
      url: apiUrl(baseUrl, `/courses/${courseId}/contents`),
      method: 'POST',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: scormName,
        contentHandler: {
          id: 'resource/x-bb-scorm'
        },
        availability: {
          available: 'Yes'
        }
      })
    })

    if (contentRes.status >= 200 && contentRes.status < 300) {
      const content = JSON.parse(contentRes.body)
      const contentId = content.id

      // Attach the file
      const attachRes = await window.electronAPI.net.uploadFile({
        url: apiUrl(baseUrl, `/courses/${courseId}/contents/${contentId}/attachments`),
        headers: authHeaders(token),
        fileData: fileBuffer,
        fileName,
        fieldName: 'file'
      })

      if (attachRes.status >= 200 && attachRes.status < 300) {
        return { success: true, courseId, moduleName: scormName }
      }

      return {
        success: false,
        error: `File attachment failed: HTTP ${attachRes.status}. Content item was created. Please attach the SCORM package manually.`
      }
    }

    return {
      success: false,
      error: `Content creation failed: HTTP ${contentRes.status}. Please upload the SCORM package manually via the Blackboard UI.`
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed'
    }
  }
}
