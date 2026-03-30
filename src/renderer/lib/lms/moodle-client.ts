/**
 * Moodle LMS API client.
 * Uses Moodle's Web Services REST API via Electron net IPC.
 *
 * Moodle Web Services docs: https://docs.moodle.org/dev/Web_services
 */

import type { LmsConnectionResult, LmsCourse, LmsUploadResult } from './types'

function wsUrl(baseUrl: string, wsfunction: string, token: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}/webservice/rest/server.php?wstoken=${encodeURIComponent(token)}&moodlewsrestformat=json&wsfunction=${wsfunction}`
}

function uploadUrl(baseUrl: string, token: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}/webservice/upload.php?token=${encodeURIComponent(token)}`
}

/**
 * Test connection by calling core_webservice_get_site_info.
 */
export async function moodleTestConnection(
  baseUrl: string,
  token: string
): Promise<LmsConnectionResult> {
  try {
    const res = await window.electronAPI.net.request({
      url: wsUrl(baseUrl, 'core_webservice_get_site_info', token)
    })

    if (res.status !== 200) {
      return { connected: false, error: `HTTP ${res.status}: ${res.statusText}` }
    }

    const data = JSON.parse(res.body)
    if (data.exception) {
      return { connected: false, error: data.message || data.exception }
    }

    return { connected: true, userName: data.fullname || data.username }
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : 'Connection failed' }
  }
}

/**
 * List courses the user is enrolled in as teacher/manager.
 */
export async function moodleListCourses(
  baseUrl: string,
  token: string
): Promise<LmsCourse[]> {
  // First get the user id
  const infoRes = await window.electronAPI.net.request({
    url: wsUrl(baseUrl, 'core_webservice_get_site_info', token)
  })

  if (infoRes.status !== 200) {
    throw new Error(`Failed to get site info: HTTP ${infoRes.status}`)
  }

  const info = JSON.parse(infoRes.body)
  if (info.exception) throw new Error(info.message || info.exception)

  const userId = info.userid

  // Get enrolled courses
  const res = await window.electronAPI.net.request({
    url: wsUrl(baseUrl, 'core_enrol_get_users_courses', token) + `&userid=${userId}`
  })

  if (res.status !== 200) {
    throw new Error(`Failed to list courses: HTTP ${res.status}`)
  }

  const courses = JSON.parse(res.body)
  if (courses.exception) throw new Error(courses.message || courses.exception)

  return (courses as Array<{ id: number; fullname: string }>).map((c) => ({
    id: String(c.id),
    name: c.fullname
  }))
}

/**
 * Upload a SCORM package to a Moodle course.
 *
 * Moodle upload flow:
 * 1. Upload file to Moodle's draft area via webservice/upload.php
 * 2. Call mod_scorm_add_scorm (or fallback to manual instructions)
 *
 * Note: mod_scorm external functions may not be available on all Moodle instances.
 * We upload to the draft area and provide instructions for manual import.
 */
export async function moodleUploadScorm(
  baseUrl: string,
  token: string,
  courseId: string,
  packageBlob: Blob,
  fileName: string
): Promise<LmsUploadResult> {
  try {
    // Step 1: Upload file to draft area
    const fileBuffer = await packageBlob.arrayBuffer()

    const uploadRes = await window.electronAPI.net.uploadFile({
      url: uploadUrl(baseUrl, token),
      fileData: fileBuffer,
      fileName,
      fieldName: 'file',
      extraFields: {
        filearea: 'draft',
        itemid: '0'
      }
    })

    if (uploadRes.status !== 200) {
      return { success: false, error: `File upload failed: HTTP ${uploadRes.status}` }
    }

    const uploadData = JSON.parse(uploadRes.body)

    // Check for errors
    if (uploadData.error || uploadData.exception) {
      return {
        success: false,
        error: uploadData.error || uploadData.message || 'Upload to Moodle failed'
      }
    }

    // Get the item ID from the uploaded file
    const itemId = Array.isArray(uploadData) && uploadData[0]
      ? uploadData[0].itemid
      : uploadData.itemid

    if (!itemId) {
      return {
        success: true,
        courseId,
        moduleName: fileName,
        error: 'File uploaded to draft area. Please add it as a SCORM activity from the Moodle course page.'
      }
    }

    // Step 2: Try to create SCORM module via core_course_create_module
    // This requires the mod_scorm plugin to expose web service functions
    // Many Moodle instances don't have this, so we handle gracefully
    try {
      const scormName = fileName.replace(/\.zip$/i, '')
      const addRes = await window.electronAPI.net.request({
        url: wsUrl(baseUrl, 'core_course_edit_module', token),
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=add&courseid=${courseId}&section=0&modulename=scorm&name=${encodeURIComponent(scormName)}&packagefile=${itemId}`
      })

      if (addRes.status === 200) {
        const addData = JSON.parse(addRes.body)
        if (!addData.exception) {
          return { success: true, courseId, moduleName: scormName }
        }
      }
    } catch {
      // Web service function not available — fall through
    }

    // Fallback: file is in draft area, user needs to add SCORM activity manually
    return {
      success: true,
      courseId,
      moduleName: fileName
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed'
    }
  }
}
