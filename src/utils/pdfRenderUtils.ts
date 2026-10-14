/**
 * High-Fidelity PDF and Print Document Generator
 * Supports 100% authentic Khmer Unicode (Battambang / Noto Sans Khmer)
 * and Chinese (Noto Serif TC / Traditional & Simplified CJK).
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, Language } from '../types';
import { areAllRequiredDocumentsUploaded } from './documentUtils';
import { calculateAge, formatDobOnly } from './ageUtils';
import { getSchoolTranslation, getMajorTranslation } from './schoolMajorTranslations';

/**
 * Generate standalone, self-contained HTML for an official printable report
 */
export function generateReportHtml(
  students: Student[],
  title: string,
  language: Language = 'km',
  currentDateFormatted: string = new Date().toLocaleDateString('km-KH')
): string {
  const isZh = language === 'zh-TW';
  const isEn = language === 'en';

  const rowsHtml = students.map((s, idx) => {
    const docVal = areAllRequiredDocumentsUploaded(s.documents);
    const docCount = `${docVal.completedCount}/${docVal.totalRequired}`;
    const studentAge = s.age || calculateAge(s.dob);
    const ageStr = studentAge ? `${studentAge}` : '-';

    const genderText = s.gender === 'Male'
      ? (isZh ? '男' : isEn ? 'Male' : 'ប្រុស')
      : s.gender === 'Female'
      ? (isZh ? '女' : isEn ? 'Female' : 'ស្រី')
      : (s.gender || '-');

    const schoolTrans = getSchoolTranslation(s.targetSchool);
    const majorTrans = getMajorTranslation(s.major);

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px; page-break-inside: avoid;">
        <td style="padding: 7px 5px; text-align: center; font-weight: bold; color: #475569; font-family: monospace;">
          ${s.studentId || (idx + 1)}
        </td>
        <td style="padding: 7px 5px; font-weight: 700; color: #0f172a; font-family: 'Battambang', system-ui, sans-serif;">
          ${s.nameKhmer || s.name || '-'}
        </td>
        <td style="padding: 7px 5px; font-weight: 600; color: #334155; font-family: 'Times New Roman', serif;">
          ${s.nameLatin || '-'}
        </td>
        <td style="padding: 7px 5px; font-weight: 600; color: #0f172a; font-family: 'Noto Serif TC', 'DFKai-SB', 'BiauKai', 'KaiTi', serif;">
          ${s.nameChinese || '-'}
        </td>
        <td style="padding: 7px 5px; text-align: center; color: #475569;">
          ${genderText}
        </td>
        <td style="padding: 7px 5px; color: #334155; font-family: monospace; white-space: nowrap;">
          ${formatDobOnly(s.dob) || '-'} ${studentAge ? `<span style="color: #64748b; font-size: 10px;">(${ageStr}ឆ្នាំ)</span>` : ''}
        </td>
        <td style="padding: 7px 5px; color: #334155; font-family: monospace; font-size: 10.5px;">
          ${s.idCardNumber || '-'}
        </td>
        <td style="padding: 7px 5px; color: #334155; font-family: monospace; font-size: 10.5px;">
          ${s.passportNumber || '-'}
        </td>
        <td style="padding: 7px 5px; color: #1e1b4b; font-family: 'Battambang', sans-serif;">
          ${s.referrerName || '-'}
        </td>
        <td style="padding: 7px 5px; color: #334155; font-family: monospace; white-space: nowrap;">
          ${s.phone || '-'}
        </td>
        <td style="padding: 7px 5px; color: #0f172a;">
          <div style="font-weight: 600; font-family: 'Battambang', sans-serif;">${s.previousSchoolKhmer || '-'}</div>
          ${s.previousSchoolAddressKhmer ? `<div style="font-size: 9.5px; color: #64748b; font-family: 'Battambang', sans-serif;">${s.previousSchoolAddressKhmer}</div>` : ''}
        </td>
        <td style="padding: 7px 5px; color: #1e1b4b;">
          <div style="font-weight: 600; font-family: 'Noto Serif TC', 'DFKai-SB', serif;">${s.targetSchool || '-'}</div>
          ${schoolTrans?.km && schoolTrans.km !== s.targetSchool ? `<div style="font-size: 9.5px; color: #64748b; font-family: 'Battambang', sans-serif;">${schoolTrans.km}</div>` : ''}
        </td>
        <td style="padding: 7px 5px; color: #064e3b;">
          <div style="font-weight: 600; font-family: 'Noto Serif TC', 'DFKai-SB', serif;">${s.major || '-'}</div>
          ${majorTrans?.km && majorTrans.km !== s.major ? `<div style="font-size: 9.5px; color: #059669; font-family: 'Battambang', sans-serif;">${majorTrans.km}</div>` : ''}
        </td>
        <td style="padding: 7px 5px; text-align: center;">
          <span style="display: inline-block; padding: 2px 5px; border-radius: 9999px; font-size: 10px; font-weight: bold; ${
            docVal.isValid 
              ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;' 
              : 'background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
          }">
            ${docCount}*
          </span>
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700;900&family=Noto+Sans+Khmer:wght@400;600;700&family=Noto+Serif+TC:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Battambang', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 12px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .header-container {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #4f46e5;
    }
    .emblem-title {
      font-family: 'Battambang', serif;
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.5px;
      line-height: 1.25;
    }
    .emblem-motto {
      font-family: 'Battambang', serif;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      margin-top: 2px;
    }
    .emblem-zh {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin-top: 3px;
      font-family: 'Noto Serif TC', serif;
    }
    .emblem-sub {
      font-size: 9.5px;
      color: #475569;
      margin-top: 2px;
      font-family: 'Times New Roman', serif;
      letter-spacing: 0.8px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .main-title {
      font-size: 17px;
      font-weight: 900;
      color: #312e81;
      margin-top: 4px;
      font-family: 'Battambang', sans-serif;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #475569;
      margin-top: 6px;
      padding: 0 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th {
      background-color: #4f46e5 !important;
      color: #ffffff !important;
      font-size: 10px;
      font-weight: 700;
      padding: 8px 4px;
      text-align: center;
      vertical-align: middle;
      border: 1px solid #4338ca;
      line-height: 1.35;
    }
    th.center {
      text-align: center;
    }
    .th-km {
      font-family: 'Battambang', sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      display: block;
    }
    .th-sub {
      font-size: 9px;
      font-weight: 500;
      opacity: 0.92;
      display: block;
      margin-top: 1px;
    }
    td {
      border: 1px solid #cbd5e1;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .footer-signatures {
      margin-top: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      text-align: center;
      font-size: 10.5px;
      page-break-inside: avoid;
    }
    .sig-space {
      height: 55px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div class="emblem-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
    <div class="emblem-motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
    <div class="emblem-zh">柬埔寨王國 • 民族 宗教 國王</div>
    <div class="emblem-sub">KINGDOM OF CAMBODIA • NATION RELIGION KING</div>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
        <img src="/logo.jpg" style="width: 46px; height: 46px; border-radius: 50%; border: 1.5px solid #4f46e5; object-fit: contain;" />
        <div>
          <div style="font-family: 'Battambang', sans-serif; font-size: 13px; font-weight: bold; color: #1e1b4b; line-height: 1.2;">សាលារៀនចិនលីស៊ីងអន្តរជាតិ</div>
          <div style="font-size: 11px; font-weight: bold; color: #4338ca; font-family: 'Noto Serif TC', serif; margin-top: 1px;">日興國際學校</div>
          <div style="font-size: 9px; font-weight: bold; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">LISING INTERNATIONAL CHINESE SCHOOL</div>
        </div>
      </div>
      <div style="text-align: right; font-size: 10px; color: #475569;">
        <div><strong>កាលបរិច្ឆេទ (Date):</strong> ${currentDateFormatted}</div>
        <div><strong>ចំនួនសិស្សសរុប (Total Students):</strong> ${students.length} នាក់</div>
        <div><strong>ប្រព័ន្ធគ្រប់គ្រងសិស្ស:</strong> SMS</div>
      </div>
    </div>

    <h1 class="main-title">${title}</h1>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: 38px;">
          <span class="th-km">ល.រ</span>
          <span class="th-sub">No. / 編號</span>
        </th>
        <th class="center" style="width: 105px;">
          <span class="th-km">ឈ្មោះខ្មែរ</span>
          <span class="th-sub">Khmer / 高棉名</span>
        </th>
        <th class="center" style="width: 105px;">
          <span class="th-km">ឈ្មោះឡាតាំង</span>
          <span class="th-sub">Latin / 英文名</span>
        </th>
        <th class="center" style="width: 95px;">
          <span class="th-km">ឈ្មោះចិន</span>
          <span class="th-sub">Chinese / 中文名</span>
        </th>
        <th class="center" style="width: 45px;">
          <span class="th-km">ភេទ</span>
          <span class="th-sub">Sex / 性別</span>
        </th>
        <th class="center" style="width: 90px;">
          <span class="th-km">ថ្ងៃកំណើត</span>
          <span class="th-sub">DOB / 生日</span>
        </th>
        <th class="center" style="width: 85px;">
          <span class="th-km">អត្តសញ្ញាបណ្ណ</span>
          <span class="th-sub">ID Card / 身分證</span>
        </th>
        <th class="center" style="width: 85px;">
          <span class="th-km">លិខិតឆ្លងដែន</span>
          <span class="th-sub">Passport / 護照</span>
        </th>
        <th class="center" style="width: 95px;">
          <span class="th-km">អ្នកណែនាំ</span>
          <span class="th-sub">Referrer / 推薦人</span>
        </th>
        <th class="center" style="width: 85px;">
          <span class="th-km">ទូរស័ព្ទ</span>
          <span class="th-sub">Phone / 電話</span>
        </th>
        <th class="center" style="min-width: 120px;">
          <span class="th-km">សាលានៅខ្មែរ</span>
          <span class="th-sub">School KH / 原校</span>
        </th>
        <th class="center" style="width: 120px;">
          <span class="th-km">សាលារៀន</span>
          <span class="th-sub">School / 學校</span>
        </th>
        <th class="center" style="width: 115px;">
          <span class="th-km">ជំនាញ</span>
          <span class="th-sub">Major / 科系</span>
        </th>
        <th class="center" style="width: 55px;">
          <span class="th-km">ឯកសារ*</span>
          <span class="th-sub">Docs / 文件</span>
        </th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer-signatures">
    <div>
      <div>បានឃើញ និងពិនិត្យត្រឹមត្រូវ</div>
      <div style="font-weight: bold; margin-top: 2px;">ប្រធានការិយាល័យ / រដ្ឋបាល</div>
      <div class="sig-space"></div>
      <div style="color: #94a3b8;">( ហត្ថលេខា និងត្រា )</div>
    </div>
    <div>
      <div>រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</div>
      <div style="font-weight: bold; margin-top: 2px;">អ្នករៀបចំរបាយការណ៍</div>
      <div class="sig-space"></div>
      <div style="color: #94a3b8;">( ហត្ថលេខា )</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * High-resolution canvas-based PDF generation that renders Khmer and Chinese fonts accurately
 */
export async function generateHighQualityPDF(
  students: Student[],
  title: string,
  filenamePrefix: string = 'Student_Report',
  language: Language = 'km',
  onProgress?: (status: string) => void
): Promise<void> {
  onProgress?.(language === 'km' ? 'កំពុងរៀបចំទិន្នន័យ Font ខ្មែរ និង ចិន...' : 'Preparing Khmer and Chinese typography...');

  const ROWS_PER_PAGE = 8; // Optimal row count for A4 landscape with headers & footer
  const totalPages = Math.ceil(students.length / ROWS_PER_PAGE) || 1;
  const currentDateFormatted = new Date().toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US');

  // Create an on-screen hidden layer (visible to DOM calculation but hidden from user view)
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0px';
  container.style.left = '0px';
  container.style.width = '1200px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-99999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 297;
    const pdfHeight = 210;
    const margin = 8;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      onProgress?.(
        language === 'km' 
          ? `កំពុងបង្កើតទំព័រទី ${pageIdx + 1} នៃ ${totalPages} (Font ខ្មែរ & ចិន)...` 
          : `Rendering Page ${pageIdx + 1} of ${totalPages}...`
      );

      const pageStudents = students.slice(pageIdx * ROWS_PER_PAGE, (pageIdx + 1) * ROWS_PER_PAGE);
      const isLastPage = pageIdx === totalPages - 1;

      // Construct Page HTML
      const pageEl = document.createElement('div');
      pageEl.style.width = '1200px';
      pageEl.style.minHeight = '840px';
      pageEl.style.padding = '30px 35px';
      pageEl.style.backgroundColor = '#ffffff';
      pageEl.style.color = '#0f172a';
      pageEl.style.fontFamily = "'Battambang', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif";
      pageEl.style.boxSizing = 'border-box';
      pageEl.style.display = 'flex';
      pageEl.style.flexDirection = 'column';
      pageEl.style.justifyContent = 'space-between';

      const rowsHtml = pageStudents.map((s, idx) => {
        const globalIdx = pageIdx * ROWS_PER_PAGE + idx + 1;
        const docVal = areAllRequiredDocumentsUploaded(s.documents);
        const docCount = `${docVal.completedCount}/${docVal.totalRequired}`;
        const studentAge = s.age || calculateAge(s.dob);
        const ageStr = studentAge ? `${studentAge} ឆ្នាំ` : '-';

        const genderText = s.gender === 'Male'
          ? (language === 'zh-TW' ? '男' : language === 'en' ? 'Male' : 'ប្រុស')
          : s.gender === 'Female'
          ? (language === 'zh-TW' ? '女' : language === 'en' ? 'Female' : 'ស្រី')
          : (s.gender || '-');

        const schoolTrans = getSchoolTranslation(s.targetSchool);
        const majorTrans = getMajorTranslation(s.major);

        return `
          <tr style="border-bottom: 1px solid #cbd5e1; font-size: 11.5px; background-color: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'};">
            <td style="padding: 9px 6px; text-align: center; font-weight: bold; color: #475569; font-family: monospace;">
              ${s.studentId || globalIdx}
            </td>
            <td style="padding: 9px 6px; font-weight: 700; color: #0f172a; font-family: 'Battambang', system-ui, sans-serif; font-size: 12.5px;">
              ${s.nameKhmer || s.name || '-'}
            </td>
            <td style="padding: 9px 6px; font-weight: 600; color: #334155; font-family: 'Times New Roman', serif; font-size: 12.5px;">
              ${s.nameLatin || '-'}
            </td>
            <td style="padding: 9px 6px; font-weight: 600; color: #0f172a; font-family: 'Noto Serif TC', 'DFKai-SB', 'BiauKai', 'KaiTi', serif; font-size: 13.5px;">
              ${s.nameChinese || '-'}
            </td>
            <td style="padding: 9px 6px; text-align: center; color: #475569; font-weight: 600;">
              ${genderText}
            </td>
            <td style="padding: 8px 5px; color: #334155; font-family: monospace; white-space: nowrap;">
              <div>${formatDobOnly(s.dob) || '-'}</div>
              ${studentAge ? `<div style="font-size: 10px; color: #64748b;">(${ageStr})</div>` : ''}
            </td>
            <td style="padding: 8px 5px; color: #334155; font-family: monospace; font-size: 11px;">
              ${s.idCardNumber || '-'}
            </td>
            <td style="padding: 8px 5px; color: #334155; font-family: monospace; font-size: 11px;">
              ${s.passportNumber || '-'}
            </td>
            <td style="padding: 8px 5px; color: #1e1b4b; font-family: 'Battambang', sans-serif; font-size: 11px;">
              ${s.referrerName || '-'}
            </td>
            <td style="padding: 8px 5px; color: #334155; font-family: monospace; font-weight: 600;">
              ${s.phone || '-'}
            </td>
            <td style="padding: 9px 6px; color: #0f172a;">
              <div style="font-weight: 600; font-family: 'Battambang', sans-serif;">${s.previousSchoolKhmer || '-'}</div>
              ${s.previousSchoolAddressKhmer ? `<div style="font-size: 10px; color: #64748b; font-family: 'Battambang', sans-serif;">${s.previousSchoolAddressKhmer}</div>` : ''}
            </td>
            <td style="padding: 9px 6px; color: #1e1b4b;">
              <div style="font-weight: 700; font-family: 'Noto Serif TC', 'DFKai-SB', serif; font-size: 12px;">${s.targetSchool || '-'}</div>
              ${schoolTrans?.km && schoolTrans.km !== s.targetSchool ? `<div style="font-size: 10px; color: #64748b; font-family: 'Battambang', sans-serif;">${schoolTrans.km}</div>` : ''}
            </td>
            <td style="padding: 9px 6px; color: #064e3b;">
              <div style="font-weight: 700; font-family: 'Noto Serif TC', 'DFKai-SB', serif; font-size: 12px;">${s.major || '-'}</div>
              ${majorTrans?.km && majorTrans.km !== s.major ? `<div style="font-size: 10px; color: #059669; font-family: 'Battambang', sans-serif;">${majorTrans.km}</div>` : ''}
            </td>
            <td style="padding: 9px 6px; text-align: center;">
              <span style="display: inline-block; padding: 2.5px 7px; border-radius: 9999px; font-size: 10.5px; font-weight: 800; ${
                docVal.isValid 
                  ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;' 
                  : 'background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
              }">
                ${docCount}*
              </span>
            </td>
          </tr>
        `;
      }).join('');

      pageEl.innerHTML = `
        <div>
          <!-- Header with Official School Emblem -->
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #4f46e5;">
            <!-- Top Centered National Motto in 3 Languages -->
            <div style="text-align: center; margin-bottom: 8px;">
              <div style="font-family: 'Battambang', sans-serif; font-size: 14px; font-weight: 900; color: #0f172a; line-height: 1.2;">
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div style="font-family: 'Battambang', sans-serif; font-size: 12px; font-weight: bold; color: #334155; margin-top: 2px;">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
              <div style="font-family: 'Noto Serif TC', serif; font-size: 11px; font-weight: bold; color: #334155; margin-top: 3px;">
                柬埔寨王國 • 民族 宗教 國王
              </div>
              <div style="font-size: 9px; font-weight: bold; color: #475569; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 2px;">
                KINGDOM OF CAMBODIA • NATION RELIGION KING
              </div>
            </div>

            <!-- School Info & Page Meta Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 6px; border-top: 1px solid #e2e8f0; margin-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #4f46e5; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <img src="/logo.jpg" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <div>
                  <div style="font-family: 'Battambang', sans-serif; font-size: 13px; font-weight: 900; color: #1e1b4b; line-height: 1.2;">
                    សាលារៀនចិនលីស៊ីងអន្តរជាតិ
                  </div>
                  <div style="font-size: 11px; font-weight: bold; color: #4338ca; font-family: 'Noto Serif TC', serif; margin-top: 1px;">
                    日興國際學校
                  </div>
                  <div style="font-size: 9px; font-weight: bold; color: #64748b; font-family: sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">
                    LISING INTERNATIONAL CHINESE SCHOOL
                  </div>
                </div>
              </div>
              <div style="text-align: right; font-size: 10px; color: #475569; flex-shrink: 0;">
                <div><strong>កាលបរិច្ឆេទ:</strong> ${currentDateFormatted}</div>
                <div><strong>ទំព័រទី:</strong> ${pageIdx + 1} / ${totalPages}</div>
                <div><strong>ចំនួនសិស្សសរុប:</strong> ${students.length} នាក់</div>
              </div>
            </div>

            <h1 style="font-size: 16px; font-weight: 900; color: #312e81; text-align: center; margin: 4px 0 2px; font-family: 'Battambang', sans-serif;">
              ${title}
            </h1>
          </div>

          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background-color: #4f46e5; color: #ffffff;">
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 38px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ល.រ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">No./編號</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 110px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ឈ្មោះខ្មែរ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Khmer/高棉名</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 110px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ឈ្មោះឡាតាំង</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Latin/英文名</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 95px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ឈ្មោះចិន</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Chinese/中文名</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 45px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ភេទ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Sex/性別</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 90px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ថ្ងៃកំណើត</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">DOB/生日</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 85px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">អត្តសញ្ញាបណ្ណ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">ID Card/身分證</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 85px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">លិខិតឆ្លងដែន</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Passport/護照</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 95px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">អ្នកណែនាំ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Referrer/推薦人</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 85px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ទូរស័ព្ទ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Phone/電話</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; min-width: 120px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">សាលានៅខ្មែរ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">School KH/原校</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 120px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">សាលារៀន</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">School/學校</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 115px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ជំនាញ</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Major/科系</div>
                </th>
                <th style="padding: 7px 4px; border: 1px solid #4338ca; text-align: center; width: 55px; font-size: 10px; vertical-align: middle;">
                  <div style="font-family: 'Battambang', sans-serif; font-size: 10.5px; font-weight: bold;">ឯកសារ*</div>
                  <div style="font-size: 9px; opacity: 0.92; margin-top: 1px;">Docs/文件</div>
                </th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Footer signatures on last page -->
        ${isLastPage ? `
          <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-size: 11px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
            <div>
              <div style="color: #475569;">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</div>
              <div style="font-weight: bold; margin-top: 2px; font-size: 11.5px;">ប្រធានការិយាល័យ / រដ្ឋបាល</div>
              <div style="height: 45px;"></div>
              <div style="color: #94a3b8; font-size: 10px;">( ហត្ថលេខា និងត្រា )</div>
            </div>
            <div>
              <div style="color: #475569;">រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</div>
              <div style="font-weight: bold; margin-top: 2px; font-size: 11.5px;">អ្នករៀបចំរបាយការណ៍</div>
              <div style="height: 45px;"></div>
              <div style="color: #94a3b8; font-size: 10px;">( ហត្ថលេខា )</div>
            </div>
          </div>
        ` : `
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 9.5px; color: #94a3b8;">
            <span>ប្រព័ន្ធគ្រប់គ្រងសិស្ស Student Management System (SMS)</span>
            <span>ទំព័រទី ${pageIdx + 1} នៃ ${totalPages}</span>
          </div>
        `}
      `;

      container.appendChild(pageEl);

      // Wait a moment for web fonts to stabilize
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Remove all stylesheet links and style tags that might have oklch from Tailwind v4
          const stylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          stylesheets.forEach(sheet => {
            if (sheet.textContent && sheet.textContent.includes('oklch')) {
              // Replace oklch expressions in stylesheet if any
              sheet.textContent = sheet.textContent.replace(/oklch\([^)]+\)/g, '#4f46e5');
            }
          });

          // Sanitize any computed or inline oklch colors on all elements in cloned page
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const inlineColor = htmlEl.style.color;
              const inlineBg = htmlEl.style.backgroundColor;
              const inlineBorder = htmlEl.style.borderColor;
              if (inlineColor && inlineColor.includes('oklch')) htmlEl.style.color = '#0f172a';
              if (inlineBg && inlineBg.includes('oklch')) htmlEl.style.backgroundColor = '#ffffff';
              if (inlineBorder && inlineBorder.includes('oklch')) htmlEl.style.borderColor = '#cbd5e1';
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (pageIdx > 0) {
        pdf.addPage('a4', 'landscape');
      }

      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      const finalHeight = Math.min(imgHeight, usableHeight);
      pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, finalHeight);

      container.removeChild(pageEl);
    }

    onProgress?.(language === 'km' ? 'កំពុងទាញយកឯកសារ PDF...' : 'Downloading PDF...');
    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`${filenamePrefix}_${dateStr}.pdf`);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Robust Cross-Browser Print Handler
 * Directly opens print view or triggers browser print cleanly
 */
export function executePrintDocument(
  students: Student[],
  title: string,
  language: Language = 'km'
): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const htmlContent = generateReportHtml(students, title, language);

      // Try opening a new clean print window
      try {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.open();
          printWin.document.write(htmlContent);
          printWin.document.close();
          setTimeout(() => {
            try {
              printWin.focus();
              printWin.print();
            } catch (e) {
              console.warn('printWin.print() error:', e);
            }
          }, 350);
          resolve({ success: true });
          return;
        }
      } catch (winErr) {
        console.warn('window.open blocked in iframe, trying hidden iframe fallback:', winErr);
      }

      // Fallback: hidden iframe method
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        resolve({ success: false, fallbackNeeded: true, error: 'Cannot access iframe document' });
        return;
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve({ success: true });
        } catch (e: any) {
          console.warn('Iframe print failed:', e);
          resolve({ success: false, fallbackNeeded: true, error: e?.message });
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 400);
    } catch (err: any) {
      console.error('Print preparation error:', err);
      resolve({ success: false, fallbackNeeded: true, error: err?.message });
    }
  });
}

/**
 * Downloads a standalone .html file that user can double-click locally
 * to view or print anytime with 100% perfect fonts.
 */
export function downloadPrintableHtml(
  students: Student[],
  title: string,
  filenamePrefix: string = 'Student_Report',
  language: Language = 'km'
): void {
  const html = generateReportHtml(students, title, language);
  const blob = new Blob(['\uFEFF' + html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `${filenamePrefix}_Printable_${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
