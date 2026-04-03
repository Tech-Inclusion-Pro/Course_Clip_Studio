/**
 * Certificate starter templates.
 * Each template is an HTML string with {{variable}} placeholders.
 *
 * Available variables:
 *   {{learner_name}}     - The learner's name
 *   {{course_title}}     - Course title
 *   {{completion_date}}  - Date of completion
 *   {{score}}            - Quiz score (percentage)
 *   {{instructor}}       - Instructor / author name
 *   {{signature}}        - Signature line text
 *   {{logo}}             - Logo image (base64 data URI or path)
 */

export interface CertificateTemplate {
  id: string
  name: string
  description: string
  html: string
}

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'formal',
    name: 'Formal',
    description: 'Traditional certificate with elegant borders and serif typography',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @page { size: landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 297mm; height: 210mm;
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #1a1a2e; display: flex; align-items: center; justify-content: center;
    background: #fff;
  }
  .certificate {
    width: 267mm; height: 190mm; position: relative;
    border: 3px solid #3a2b95; padding: 24mm 32mm;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
  }
  .certificate::before {
    content: ''; position: absolute; inset: 4mm;
    border: 1px solid #3a2b95; pointer-events: none;
  }
  .logo { max-height: 48px; margin-bottom: 12px; }
  .header { font-size: 14pt; letter-spacing: 4px; text-transform: uppercase; color: #3a2b95; margin-bottom: 8px; }
  .title { font-size: 32pt; font-weight: bold; color: #1a1a2e; margin-bottom: 16px; border-bottom: 2px solid #a23b84; padding-bottom: 12px; }
  .body { font-size: 13pt; line-height: 1.8; color: #4a4a6a; max-width: 500px; margin-bottom: 20px; }
  .learner { font-size: 26pt; font-weight: bold; color: #3a2b95; margin: 8px 0; font-style: italic; }
  .course { font-size: 16pt; color: #6f2fa6; margin-bottom: 24px; }
  .footer { display: flex; justify-content: space-between; width: 100%; margin-top: auto; padding-top: 16px; }
  .footer-col { text-align: center; min-width: 140px; }
  .footer-line { border-top: 1px solid #1a1a2e; padding-top: 6px; font-size: 10pt; color: #4a4a6a; }
  .date { font-size: 10pt; color: #4a4a6a; margin-top: 8px; }
</style>
</head>
<body>
<div class="certificate">
  {{logo_img}}
  <div class="header">Certificate of Completion</div>
  <div class="title">{{course_title}}</div>
  <div class="body">This is to certify that</div>
  <div class="learner">{{learner_name}}</div>
  <div class="body">has successfully completed the course requirements.</div>
  <div class="date">{{completion_date}}</div>
  <div class="footer">
    <div class="footer-col">
      <div class="footer-line">{{instructor}}</div>
      <div style="font-size:9pt;color:#999;margin-top:2px;">Instructor</div>
    </div>
    <div class="footer-col">
      <div class="footer-line">{{score}}</div>
      <div style="font-size:9pt;color:#999;margin-top:2px;">Score</div>
    </div>
    <div class="footer-col">
      <div class="footer-line">{{signature}}</div>
      <div style="font-size:9pt;color:#999;margin-top:2px;">Signature</div>
    </div>
  </div>
</div>
</body>
</html>`
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean contemporary design with gradient accent and sans-serif type',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @page { size: landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 297mm; height: 210mm;
    font-family: 'Arial', 'Helvetica', sans-serif;
    color: #1a1a2e; background: #fff;
  }
  .certificate {
    width: 100%; height: 100%; display: flex; position: relative; overflow: hidden;
  }
  .accent-bar {
    width: 24mm; height: 100%;
    background: linear-gradient(180deg, #3a2b95 0%, #6f2fa6 50%, #a23b84 100%);
    flex-shrink: 0;
  }
  .content {
    flex: 1; padding: 28mm 32mm; display: flex; flex-direction: column; justify-content: center;
  }
  .logo { max-height: 40px; margin-bottom: 20px; }
  .label { font-size: 10pt; letter-spacing: 3px; text-transform: uppercase; color: #a23b84; font-weight: 700; margin-bottom: 4px; }
  .title { font-size: 28pt; font-weight: 800; color: #1a1a2e; margin-bottom: 20px; line-height: 1.2; }
  .body { font-size: 12pt; color: #4a4a6a; line-height: 1.6; margin-bottom: 8px; }
  .learner { font-size: 24pt; font-weight: 800; color: #3a2b95; margin: 12px 0 16px; }
  .course-name { font-size: 14pt; font-weight: 600; color: #6f2fa6; margin-bottom: 24px; }
  .meta-row { display: flex; gap: 32px; margin-top: auto; padding-top: 20px; border-top: 1px solid #e5e5e5; }
  .meta-item { }
  .meta-label { font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 2px; }
  .meta-value { font-size: 11pt; font-weight: 600; color: #1a1a2e; }
  .circle-accent {
    position: absolute; right: -40mm; bottom: -40mm;
    width: 120mm; height: 120mm; border-radius: 50%;
    background: linear-gradient(135deg, rgba(58,43,149,0.06), rgba(162,59,132,0.06));
  }
</style>
</head>
<body>
<div class="certificate">
  <div class="accent-bar"></div>
  <div class="content">
    {{logo_img}}
    <div class="label">Certificate of Completion</div>
    <div class="title">{{course_title}}</div>
    <div class="body">Awarded to</div>
    <div class="learner">{{learner_name}}</div>
    <div class="body">For successfully completing all course requirements.</div>
    <div class="meta-row">
      <div class="meta-item">
        <div class="meta-label">Date</div>
        <div class="meta-value">{{completion_date}}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Instructor</div>
        <div class="meta-value">{{instructor}}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Score</div>
        <div class="meta-value">{{score}}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Signature</div>
        <div class="meta-value">{{signature}}</div>
      </div>
    </div>
  </div>
  <div class="circle-accent"></div>
</div>
</body>
</html>`
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, understated design with maximum whitespace',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @page { size: landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 297mm; height: 210mm;
    font-family: 'Arial', 'Helvetica', sans-serif;
    color: #1a1a2e; background: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  .certificate {
    width: 247mm; height: 170mm;
    padding: 32mm 40mm; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
  }
  .logo { max-height: 36px; margin-bottom: 24px; }
  .label { font-size: 10pt; letter-spacing: 6px; text-transform: uppercase; color: #999; margin-bottom: 24px; }
  .learner { font-size: 28pt; font-weight: 300; color: #1a1a2e; margin-bottom: 8px; }
  .divider { width: 60px; height: 2px; background: #a23b84; margin: 16px auto; }
  .course { font-size: 14pt; color: #4a4a6a; margin-bottom: 32px; }
  .date { font-size: 10pt; color: #999; margin-bottom: 32px; }
  .footer { display: flex; gap: 48px; align-items: flex-end; }
  .footer-col { text-align: center; }
  .footer-name { font-size: 11pt; font-weight: 600; color: #1a1a2e; padding-bottom: 4px; border-bottom: 1px solid #ddd; min-width: 120px; }
  .footer-role { font-size: 8pt; color: #999; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="certificate">
  {{logo_img}}
  <div class="label">Certificate</div>
  <div class="learner">{{learner_name}}</div>
  <div class="divider"></div>
  <div class="course">{{course_title}}</div>
  <div class="date">{{completion_date}} &middot; Score: {{score}}</div>
  <div class="footer">
    <div class="footer-col">
      <div class="footer-name">{{instructor}}</div>
      <div class="footer-role">Instructor</div>
    </div>
    <div class="footer-col">
      <div class="footer-name">{{signature}}</div>
      <div class="footer-role">Authorized Signature</div>
    </div>
  </div>
</div>
</body>
</html>`
  }
]

/**
 * Substitute template variables in a certificate HTML template.
 */
export function renderCertificate(
  template: string,
  variables: {
    learner_name: string
    course_title: string
    completion_date: string
    score: string
    instructor: string
    signature: string
    logoPath: string | null
    backgroundImage?: string | null
  }
): string {
  let html = template
  html = html.replace(/\{\{learner_name\}\}/g, variables.learner_name)
  html = html.replace(/\{\{course_title\}\}/g, variables.course_title)
  html = html.replace(/\{\{completion_date\}\}/g, variables.completion_date)
  html = html.replace(/\{\{score\}\}/g, variables.score)
  html = html.replace(/\{\{instructor\}\}/g, variables.instructor)
  html = html.replace(/\{\{signature\}\}/g, variables.signature)

  // Handle logo
  if (variables.logoPath) {
    html = html.replace(
      /\{\{logo_img\}\}/g,
      `<img class="logo" src="${variables.logoPath}" alt="Organization logo" />`
    )
  } else {
    html = html.replace(/\{\{logo_img\}\}/g, '')
  }

  // Inject background image as CSS
  if (variables.backgroundImage) {
    const bgUrl = variables.backgroundImage.startsWith('data:')
      ? variables.backgroundImage
      : `file://${variables.backgroundImage}`
    const bgStyle = `<style>body{background:url("${bgUrl}") center/cover no-repeat !important;}</style>`
    html = html.replace('</head>', bgStyle + '\n</head>')
  }

  return html
}
