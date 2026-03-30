/**
 * Canvas LMS API client.
 * Uses Electron net module via IPC for CORS-free requests.
 *
 * Canvas REST API docs: https://canvas.instructure.com/doc/api/
 */

import type { LmsConnectionResult, LmsCourse, LmsUploadResult } from './types'

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json'
  }
}

function apiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}/api/v1${path}`
}

/**
 * Test connection by fetching the current user profile.
 */
export async function canvasTestConnection(
  baseUrl: string,
  token: string
): Promise<LmsConnectionResult> {
  try {
    const res = await window.electronAPI.net.request({
      url: apiUrl(baseUrl, '/users/self'),
      headers: headers(token)
    })

    if (res.status === 200) {
      const user = JSON.parse(res.body)
      return { connected: true, userName: user.name || user.login_id }
    }

    return { connected: false, error: `HTTP ${res.status}: ${res.statusText}` }
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : 'Connection failed' }
  }
}

/**
 * List courses the user can manage (teacher/admin role).
 */
export async function canvasListCourses(
  baseUrl: string,
  token: string
): Promise<LmsCourse[]> {
  const res = await window.electronAPI.net.request({
    url: apiUrl(baseUrl, '/courses?enrollment_type=teacher&per_page=50&state[]=available'),
    headers: headers(token)
  })

  if (res.status !== 200) {
    throw new Error(`Failed to list courses: HTTP ${res.status}`)
  }

  const courses = JSON.parse(res.body) as Array<{ id: number; name: string }>
  return courses.map((c) => ({ id: String(c.id), name: c.name }))
}

/**
 * Upload a SCORM package to a Canvas course.
 *
 * Canvas file upload flow:
 * 1. POST /courses/:id/files to get upload URL
 * 2. POST to the upload URL with the file
 * 3. POST /courses/:id/content_migrations to import as SCORM
 */
export async function canvasUploadScorm(
  baseUrl: string,
  token: string,
  courseId: string,
  packageBlob: Blob,
  fileName: string
): Promise<LmsUploadResult> {
  try {
    // Step 1: Request upload slot
    const step1Res = await window.electronAPI.net.request({
      url: apiUrl(baseUrl, `/courses/${courseId}/files`),
      method: 'POST',
      headers: {
        ...headers(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fileName,
        size: packageBlob.size,
        content_type: 'application/zip',
        parent_folder_path: 'scorm_imports'
      })
    })

    if (step1Res.status !== 200) {
      return { success: false, error: `Failed to request upload slot: HTTP ${step1Res.status}` }
    }

    const uploadInfo = JSON.parse(step1Res.body)
    const uploadUrl: string = uploadInfo.upload_url
    const uploadParams: Record<string, string> = uploadInfo.upload_params || {}

    // Step 2: Upload file
    const fileBuffer = await packageBlob.arrayBuffer()
    const step2Res = await window.electronAPI.net.uploadFile({
      url: uploadUrl,
      headers: {}, // Canvas provides its own auth in upload_params
      fileData: fileBuffer,
      fileName,
      fieldName: 'file',
      extraFields: uploadParams
    })

    if (step2Res.status < 200 || step2Res.status >= 400) {
      return { success: false, error: `File upload failed: HTTP ${step2Res.status}` }
    }

    // Parse file ID from response (may be in redirect or body)
    let fileId: string | undefined
    try {
      const uploadResult = JSON.parse(step2Res.body)
      fileId = String(uploadResult.id)
    } catch {
      // Some Canvas instances return 3xx redirect; file is already uploaded
    }

    // Step 3: Create content migration (SCORM import)
    const migrationRes = await window.electronAPI.net.request({
      url: apiUrl(baseUrl, `/courses/${courseId}/content_migrations`),
      method: 'POST',
      headers: {
        ...headers(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        migration_type: 'scorm_package',
        settings: {
          file_url: fileId ? undefined : uploadUrl,
          source_course_id: fileId
        },
        pre_attachment: fileId
          ? undefined
          : { name: fileName, size: packageBlob.size, content_type: 'application/zip' }
      })
    })

    if (migrationRes.status >= 200 && migrationRes.status < 300) {
      return { success: true, courseId }
    }

    return {
      success: false,
      error: `Content migration failed: HTTP ${migrationRes.status}`
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed'
    }
  }
}
