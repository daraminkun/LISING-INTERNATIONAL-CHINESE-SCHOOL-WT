/**
 * High-Fidelity A4 Portrait PDF and Print Document Generator (Full Trilingual Edition: ខ្មែរ • 繁體中文 • English)
 * Matches the official 9-column student report table specification with:
 * - A4 Portrait orientation (ក្រដាសបញ្ឈរ)
 * - 14px text & number size inside table data rows (ទំហំអក្សរ ទំហំលេខ ១៤)
 * - Full 3-Language (Khmer, Traditional Chinese, English) Motto, School Name, Date & Total Metadata,
 *   Report Title, 9 Table Column Headers, Pagination Footer, and Official Signatures
 * - Gapless sequential លេខរៀង (1..N) coupled with per-(School, Major) No (1..K)
 * - Full Desktop & Mobile reliability (no window.open, inline Base64 logo, fixed 794px viewport capture)
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, Language } from '../types';
import { institutionService } from '../services/institutionService';
import {
  computeStudentNumbersList,
  formatConciseSchoolForReport,
  formatDobDot,
  formatGenderCode,
  triggerSafeBlobDownload,
} from './studentOrderUtils';

function escapeHtml(raw?: string | number | null): string {
  if (raw === null || raw === undefined) return '';
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatCurrentReportDateDot(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export interface TrilingualReportTitles {
  km: string;
  zh: string;
  en: string;
}

export function getTrilingualReportTitles(_rawTitle?: string): TrilingualReportTitles {
  return {
    km: 'តារាងរបាយការណ៍សិស្ស',
    zh: '學生綜合報表',
    en: 'STUDENT COMPREHENSIVE REPORT',
  };
}

export const TRILINGUAL_REPORT_COLUMNS: Array<{
  key: string;
  widthPx: number;
  km: string;
  zh: string;
  en: string;
}> = [
  { key: 'seq', widthPx: 54, km: 'លេខរៀង', zh: '序號', en: 'Seq.' },
  { key: 'no', widthPx: 40, km: 'ល.រ', zh: '編號', en: 'No' },
  { key: 'latinName', widthPx: 142, km: 'ឈ្មោះឡាតាំង', zh: '英文姓名', en: 'Latin Name' },
  { key: 'chineseName', widthPx: 72, km: 'ឈ្មោះចិន', zh: '中文姓名', en: 'Chinese Name' },
  { key: 'dob', widthPx: 92, km: 'ថ្ងៃខែឆ្នាំកំណើត', zh: '出生日期', en: 'Date of Birth' },
  { key: 'gender', widthPx: 44, km: 'ភេទ', zh: '性別', en: 'Gender' },
  { key: 'school', widthPx: 112, km: 'សាលាដែលជ្រើសរើសសិក្សា', zh: '選讀學校', en: 'Selected School' },
  { key: 'major', widthPx: 106, km: 'ជំនាញដែលជ្រើសរើសសិក្សា', zh: '選讀科系', en: 'Selected Major' },
  { key: 'referrer', widthPx: 92, km: 'អ្នកណែនាំ', zh: '推薦人', en: 'Referrer' },
];

let cachedDefaultLogoDataUrl: string | null = null;

async function resolveImageAsDataUrl(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:')) return src;
  if (src === '/logo.jpg' && cachedDefaultLogoDataUrl) {
    return cachedDefaultLogoDataUrl;
  }

  try {
    const res = await fetch(src, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : src);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    if (src === '/logo.jpg' && dataUrl.startsWith('data:')) {
      cachedDefaultLogoDataUrl = dataUrl;
    }
    return dataUrl;
  } catch {
    if (src !== '/logo.jpg') {
      return resolveImageAsDataUrl('/logo.jpg');
    }
    return src;
  }
}

function buildOfficialHeaderHtml(options: {
  schoolLogoSrc: string;
  schoolNameKm: string;
  schoolNameZh: string;
  schoolNameEn: string;
  titles: TrilingualReportTitles;
  currentDateDot: string;
  totalStudents: number;
  pageInfo?: string;
}): string {
  const {
    schoolLogoSrc,
    schoolNameKm,
    schoolNameZh,
    schoolNameEn,
    titles,
    currentDateDot,
    totalStudents,
    pageInfo,
  } = options;

  return `
    <div style="margin-bottom: 8px; padding-bottom: 7px; border-bottom: 2px solid #0f172a;">
      <!-- Centered National Motto in 3 Languages (Enlarged proportionally) -->
      <div style="text-align: center; margin-bottom: 8px;">
        <div style="font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; font-size: 18.5px; font-weight: 900; color: #000000; line-height: 1.3;">
          ព្រះរាជាណាចក្រកម្ពុជា
        </div>
        <div style="font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 1px; line-height: 1.3;">
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </div>
        <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px; line-height: 1.25;">
          柬埔寨王國 • 民族 宗教 國王
        </div>
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 11.5px; font-weight: 700; color: #1e293b; letter-spacing: 0.9px; text-transform: uppercase; margin-top: 2px;">
          KINGDOM OF CAMBODIA • NATION RELIGION KING
        </div>
      </div>

      <!-- School Logo, Enlarged 3-Language School Name & 3-Language Report Metadata -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 7px; border-top: 1px solid #cbd5e1;">
        <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
          <div style="width: 62px; height: 62px; border-radius: 50%; border: 2px solid #1e1b4b; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <img src="${escapeHtml(schoolLogoSrc)}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <div>
            <div style="font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; font-size: 17px; font-weight: 900; color: #0f172a; line-height: 1.28;">
              ${escapeHtml(schoolNameKm)}
            </div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 15.5px; font-weight: 700; color: #1e1b4b; margin-top: 1px; line-height: 1.22;">
              ${escapeHtml(schoolNameZh)}
            </div>
            <div style="font-family: 'Times New Roman', Times, serif; font-size: 11.5px; font-weight: 700; color: #334155; letter-spacing: 0.4px; text-transform: uppercase; margin-top: 1px;">
              ${escapeHtml(schoolNameEn)}
            </div>
          </div>
        </div>

        <!-- 3-Language Metadata Block (Date, Page, Total Students) -->
        <div style="text-align: right; font-size: 12px; color: #0f172a; line-height: 1.45; flex-shrink: 0; font-family: 'Battambang', 'Noto Serif TC', 'Times New Roman', sans-serif;">
          <div>
            <strong>កាលបរិច្ឆេទ / 日期 / Date:</strong>
            <span style="font-family: 'Times New Roman', Arial, serif; font-weight: 700; margin-left: 3px;">${escapeHtml(currentDateDot)}</span>
          </div>
          ${
            pageInfo
              ? `<div>
                  <strong>ទំព័រទី / 頁碼 / Page:</strong>
                  <span style="font-family: 'Times New Roman', Arial, serif; font-weight: 700; margin-left: 3px;">${escapeHtml(pageInfo)}</span>
                </div>`
              : ''
          }
          <div>
            <strong>ចំនួនសិស្សសរុប / 學生總數 / Total:</strong>
            <span style="font-weight: 800; color: #000000; margin-left: 3px;">${totalStudents} នាក់ / 人 / Students</span>
          </div>
        </div>
      </div>

      <!-- Centered 3-Language Report Title -->
      <div style="text-align: center; margin: 7px 0 1px;">
        <div style="font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; font-size: 17px; font-weight: 900; color: #0f172a; line-height: 1.3;">
          ${escapeHtml(titles.km)}
        </div>
        <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 15px; font-weight: 700; color: #1e1b4b; margin-top: 1px; line-height: 1.25;">
          ${escapeHtml(titles.zh)}
        </div>
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 11.5px; font-weight: 700; color: #1e293b; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 1px; line-height: 1.2;">
          ${escapeHtml(titles.en)}
        </div>
      </div>
    </div>
  `;
}

function buildOfficialTableHtml(
  items: ReturnType<typeof computeStudentNumbersList>
): string {
  const colgroupHtml = TRILINGUAL_REPORT_COLUMNS.map(
    col => `<col style="width: ${col.widthPx}px;" />`
  ).join('');

  const theadCellsHtml = TRILINGUAL_REPORT_COLUMNS.map(
    col => `
      <th style="border: 1px solid #000000; padding: 5px 2px; text-align: center; vertical-align: middle; background-color: #f8fafc; color: #000000;">
        <div style="font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; font-size: 13.5px; font-weight: 700; color: #000000; line-height: 1.25;">
          ${escapeHtml(col.km)}
        </div>
        <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.2; margin-top: 1px;">
          ${escapeHtml(col.zh)}
        </div>
        <div style="font-family: 'Times New Roman', Arial, serif; font-size: 10.5px; font-weight: 700; color: #1e293b; line-height: 1.15; margin-top: 1px;">
          ${escapeHtml(col.en)}
        </div>
      </th>
    `
  ).join('');

  const rowsHtml = items
    .map(({ student: s, sequenceNo, schoolMajorNo }) => {
      const latinName = (s.nameLatin || s.nameKhmer || s.name || '').trim().toUpperCase();
      const chineseName = (s.nameChinese || '').trim();
      const dobDot = formatDobDot(s.dob);
      const genderCode = formatGenderCode(s.gender);
      const conciseSchool = formatConciseSchoolForReport(s.targetSchool);
      const majorName = (s.major || '').trim();
      const referrer = (s.referrerName || '').trim();

      return `
        <tr style="page-break-inside: avoid; background-color: #ffffff;">
          <td style="border: 1px solid #000000; padding: 4.5px 3px; text-align: center; vertical-align: middle; font-size: 14px; font-family: Arial, 'Times New Roman', sans-serif; color: #000000; line-height: 1.22;">
            ${sequenceNo}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 3px; text-align: center; vertical-align: middle; font-size: 14px; font-family: Arial, 'Times New Roman', sans-serif; color: #000000; line-height: 1.22;">
            ${schoolMajorNo}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 5px; text-align: center; vertical-align: middle; font-size: 14px; font-family: Arial, 'Times New Roman', sans-serif; color: #000000; word-break: break-word; line-height: 1.22;">
            ${escapeHtml(latinName)}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 3px; text-align: center; vertical-align: middle; font-size: 14px; font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; color: #000000; word-break: break-word; line-height: 1.22;">
            ${escapeHtml(chineseName)}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 3px; text-align: center; vertical-align: middle; font-size: 14px; font-family: 'Times New Roman', Times, serif; color: #000000; white-space: nowrap; line-height: 1.22;">
            ${escapeHtml(dobDot)}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 2px; text-align: center; vertical-align: middle; font-size: 14px; font-family: Arial, 'Times New Roman', sans-serif; color: #000000; line-height: 1.22;">
            ${escapeHtml(genderCode)}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 4px; text-align: center; vertical-align: middle; font-size: 14px; font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; color: #000000; word-break: break-word; line-height: 1.22;">
            ${escapeHtml(conciseSchool)}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 4px; text-align: center; vertical-align: middle; font-size: 14px; font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; color: #000000; word-break: break-word; line-height: 1.22;">
            ${escapeHtml(majorName)}
          </td>
          <td style="border: 1px solid #000000; padding: 4.5px 4px; text-align: center; vertical-align: middle; font-size: 14px; font-family: 'DFKai-SB', 'BiauKai', 'Times New Roman', 'Battambang', serif; color: #000000; word-break: break-word; line-height: 1.2;">
            ${escapeHtml(referrer)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #000000; background-color: #ffffff;">
      <colgroup>${colgroupHtml}</colgroup>
      <thead>
        <tr>${theadCellsHtml}</tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

function buildOfficialSignaturesHtml(): string {
  return `
    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: center; page-break-inside: avoid;">
      <!-- Left Column: Approver / Administration in 3 Languages -->
      <div>
        <div style="font-family: 'Battambang', 'Kantumruy Pro', sans-serif; font-size: 12.5px; color: #1e293b; line-height: 1.3;">
          បានឃើញ និងពិនិត្យត្រឹមត្រូវ
        </div>
        <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 12px; color: #334155; line-height: 1.25; margin-top: 1px;">
          已審閱並核對無誤
        </div>
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 10.5px; color: #475569; line-height: 1.2; margin-top: 1px;">
          Seen and Verified Correct
        </div>

        <div style="margin-top: 5px;">
          <div style="font-family: 'Battambang', 'Kantumruy Pro', sans-serif; font-size: 13.5px; font-weight: 700; color: #000000; line-height: 1.3;">
            ប្រធានការិយាល័យ / រដ្ឋបាល
          </div>
          <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.25; margin-top: 1px;">
            辦公室主任 / 行政主管
          </div>
          <div style="font-family: 'Times New Roman', Times, serif; font-size: 11px; font-weight: 700; color: #1e293b; line-height: 1.2; margin-top: 1px;">
            Head of Office / Administration
          </div>
        </div>

        <div style="height: 42px;"></div>

        <div style="font-family: 'Battambang', 'Noto Serif TC', 'Times New Roman', sans-serif; font-size: 11px; color: #64748b; line-height: 1.3;">
          ( ហត្ថលេខា និងត្រា / 簽名及蓋章 / Signature &amp; Stamp )
        </div>
      </div>

      <!-- Right Column: Location, Date & Report Preparer in 3 Languages -->
      <div>
        <div style="font-family: 'Battambang', 'Kantumruy Pro', sans-serif; font-size: 12.5px; color: #1e293b; line-height: 1.3;">
          រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...
        </div>
        <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 12px; color: #334155; line-height: 1.25; margin-top: 1px;">
          金邊市，202...年......月......日
        </div>
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 10.5px; color: #475569; line-height: 1.2; margin-top: 1px;">
          Phnom Penh, Date: ....... / ....... / 202...
        </div>

        <div style="margin-top: 5px;">
          <div style="font-family: 'Battambang', 'Kantumruy Pro', sans-serif; font-size: 13.5px; font-weight: 700; color: #000000; line-height: 1.3;">
            អ្នករៀបចំរបាយការណ៍
          </div>
          <div style="font-family: 'DFKai-SB', 'BiauKai', 'Kaiti TC', 'KaiTi', 'Noto Serif TC', serif; font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.25; margin-top: 1px;">
            報表編製人
          </div>
          <div style="font-family: 'Times New Roman', Times, serif; font-size: 11px; font-weight: 700; color: #1e293b; line-height: 1.2; margin-top: 1px;">
            Report Preparer
          </div>
        </div>

        <div style="height: 42px;"></div>

        <div style="font-family: 'Battambang', 'Noto Serif TC', 'Times New Roman', sans-serif; font-size: 11px; color: #64748b; line-height: 1.3;">
          ( ហត្ថលេខា / 簽名 / Signature )
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate standalone, self-contained HTML for an official A4 Portrait printable report (3 Languages)
 */
export function generateReportHtml(
  students: Student[],
  title: string,
  _language: Language = 'km',
  currentDateDot: string = formatCurrentReportDateDot(),
  overrideLogoSrc?: string
): string {
  const inst = institutionService.getSettings();
  const schoolLogo = overrideLogoSrc || inst.logoUrl || '/logo.jpg';
  const schoolNameKm = inst.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ';
  const schoolNameZh = inst.nameZh || '日興國際學校';
  const schoolNameEn = inst.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL';

  const titles = getTrilingualReportTitles(title);
  const numberedItems = computeStudentNumbersList(students);
  const headerHtml = buildOfficialHeaderHtml({
    schoolLogoSrc: schoolLogo,
    schoolNameKm,
    schoolNameZh,
    schoolNameEn,
    titles,
    currentDateDot,
    totalStudents: students.length,
  });
  const tableHtml = buildOfficialTableHtml(numberedItems);
  const signaturesHtml = buildOfficialSignaturesHtml();

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(`${titles.km} • ${titles.zh} • ${titles.en}`)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700;900&family=Kantumruy+Pro:wght@400;600;700&family=Noto+Sans+Khmer:wght@400;600;700&family=Noto+Serif+TC:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 7mm 6mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif;
      color: #000000;
      background: #ffffff;
      width: 100%;
      max-width: 794px;
      margin: 0 auto;
      padding: 12px 12px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
    }
    @media print {
      body {
        max-width: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  ${headerHtml}
  ${tableHtml}
  ${signaturesHtml}
</body>
</html>`;
}

/**
 * High-resolution A4 Portrait PDF generator (1:1 794px -> 210mm mapping so 14px renders at true 14px)
 * Works identically on Desktop PCs, iPhones, iPads, and Android phones.
 */
export async function generateHighQualityPDF(
  students: Student[],
  title: string,
  filenamePrefix: string = 'Student_Report',
  language: Language = 'km',
  onProgress?: (status: string) => void
): Promise<void> {
  onProgress?.(
    language === 'zh-TW'
      ? '正在準備 A4 直向三語報表 (14號字)...'
      : language === 'en'
      ? 'Preparing A4 Portrait trilingual report (Size 14)...'
      : 'កំពុងរៀបចំទិន្នន័យក្រដាសបញ្ឈរ A4 ៣ភាសា (Font ទំហំ ១៤)...'
  );

  // Ensure web fonts are loaded before canvas capture
  try {
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise(r => setTimeout(r, 1500)),
      ]);
    }
  } catch {
    // Proceed safely
  }

  const inst = institutionService.getSettings();
  const logoDataUrl = await resolveImageAsDataUrl(inst.logoUrl || '/logo.jpg');
  const schoolNameKm = inst.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ';
  const schoolNameZh = inst.nameZh || '日興國際學校';
  const schoolNameEn = inst.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL';
  const titles = getTrilingualReportTitles(title);

  // Compute gapless លេខរៀង and coupled per-(School, Major) No across the full report list first
  const allNumberedItems = computeStudentNumbersList(students);

  const ROWS_PER_PAGE = 15; // Matches the 15-row A4 Portrait official layout
  const totalPages = Math.ceil(allNumberedItems.length / ROWS_PER_PAGE) || 1;
  const currentDateDot = formatCurrentReportDateDot();

  // Fixed off-screen 794px A4 Portrait container so mobile phone viewports never clip or shrink layout
  const PAGE_WIDTH_PX = 794;
  const PAGE_MIN_HEIGHT_PX = 1123;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0px';
  container.style.left = '-10000px';
  container.style.width = `${PAGE_WIDTH_PX}px`;
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-99999';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidthMm = 210;
    const pdfHeightMm = 297;

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      onProgress?.(
        language === 'zh-TW'
          ? `正在產出第 ${pageIdx + 1} / ${totalPages} 頁 (A4 直向)...`
          : language === 'en'
          ? `Rendering A4 Portrait Page ${pageIdx + 1} of ${totalPages}...`
          : `កំពុងបង្កើតទំព័រទី ${pageIdx + 1} នៃ ${totalPages} (ក្រដាសបញ្ឈរ A4)...`
      );

      const pageItems = allNumberedItems.slice(
        pageIdx * ROWS_PER_PAGE,
        (pageIdx + 1) * ROWS_PER_PAGE
      );
      const isLastPage = pageIdx === totalPages - 1;

      const pageEl = document.createElement('div');
      pageEl.style.width = `${PAGE_WIDTH_PX}px`;
      pageEl.style.minHeight = `${PAGE_MIN_HEIGHT_PX}px`;
      pageEl.style.padding = '16px 20px';
      pageEl.style.backgroundColor = '#ffffff';
      pageEl.style.color = '#000000';
      pageEl.style.fontFamily =
        "'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif";
      pageEl.style.boxSizing = 'border-box';
      pageEl.style.display = 'flex';
      pageEl.style.flexDirection = 'column';
      pageEl.style.justifyContent = 'space-between';

      const headerHtml = buildOfficialHeaderHtml({
        schoolLogoSrc: logoDataUrl,
        schoolNameKm,
        schoolNameZh,
        schoolNameEn,
        titles,
        currentDateDot,
        totalStudents: allNumberedItems.length,
        pageInfo: `${pageIdx + 1} / ${totalPages}`,
      });

      const tableHtml = buildOfficialTableHtml(pageItems);

      pageEl.innerHTML = `
        <div>
          ${headerHtml}
          ${tableHtml}
        </div>

        ${
          isLastPage
            ? buildOfficialSignaturesHtml()
            : `
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 10px; font-size: 11px; color: #475569; font-family: 'Battambang', 'Noto Serif TC', 'Times New Roman', sans-serif;">
            <span>${escapeHtml(schoolNameKm)} • ${escapeHtml(schoolNameZh)} • ${escapeHtml(schoolNameEn)}</span>
            <span>ទំព័រទី ${pageIdx + 1} នៃ ${totalPages} • 第 ${pageIdx + 1} / ${totalPages} 頁 • Page ${pageIdx + 1} of ${totalPages}</span>
          </div>
        `
        }
      `;

      container.appendChild(pageEl);
      await new Promise(r => setTimeout(r, 80));

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        width: PAGE_WIDTH_PX,
        windowWidth: PAGE_WIDTH_PX,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const stylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          stylesheets.forEach(sheet => {
            if (sheet.textContent && sheet.textContent.includes('oklch')) {
              sheet.textContent = sheet.textContent.replace(/oklch\([^)]+\)/g, '#0f172a');
            }
          });
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              if (htmlEl.style.color?.includes('oklch')) htmlEl.style.color = '#000000';
              if (htmlEl.style.backgroundColor?.includes('oklch')) htmlEl.style.backgroundColor = '#ffffff';
              if (htmlEl.style.borderColor?.includes('oklch')) htmlEl.style.borderColor = '#000000';
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);

      if (pageIdx > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Fit 794px -> 210mm 1:1, or scale down slightly only if content exceeded 297mm height
      const naturalHeightMm = (canvas.height * pdfWidthMm) / canvas.width;
      if (naturalHeightMm <= pdfHeightMm) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, naturalHeightMm);
      } else {
        const fitWidthMm = (canvas.width * pdfHeightMm) / canvas.height;
        const offsetX = Math.max(0, (pdfWidthMm - fitWidthMm) / 2);
        pdf.addImage(imgData, 'JPEG', offsetX, 0, fitWidthMm, pdfHeightMm);
      }

      container.removeChild(pageEl);
    }

    onProgress?.(
      language === 'zh-TW'
        ? '正在下載 PDF 檔案...'
        : language === 'en'
        ? 'Downloading PDF...'
        : 'កំពុងទាញយកឯកសារ PDF...'
    );
    const dateStr = new Date().toISOString().split('T')[0];
    const pdfBlob = pdf.output('blob');
    triggerSafeBlobDownload(pdfBlob, `${filenamePrefix}_${dateStr}.pdf`);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Cross-Browser & Iframe-Safe Print Handler (Zero window.open calls)
 */
export async function executePrintDocument(
  students: Student[],
  title: string,
  language: Language = 'km'
): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  try {
    const inst = institutionService.getSettings();
    const logoDataUrl = await resolveImageAsDataUrl(inst.logoUrl || '/logo.jpg');
    const currentDateDot = formatCurrentReportDateDot();
    const htmlContent = generateReportHtml(
      students,
      title,
      language,
      currentDateDot,
      logoDataUrl
    );

    return await new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-10000px';
      iframe.style.top = '0';
      iframe.style.width = '794px';
      iframe.style.height = '1123px';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc || !iframe.contentWindow) {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve({ success: false, fallbackNeeded: true, error: 'Cannot access print frame' });
        return;
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      const runPrint = async () => {
        try {
          const win = iframe.contentWindow;
          if (!win) {
            resolve({ success: false, fallbackNeeded: true });
            return;
          }
          if ((win.document as any).fonts?.ready) {
            await Promise.race([
              (win.document as any).fonts.ready,
              new Promise(r => setTimeout(r, 800)),
            ]);
          }
          win.focus();
          win.print();
          resolve({ success: true });
        } catch (e: any) {
          console.warn('Iframe print notice:', e);
          resolve({ success: false, fallbackNeeded: true, error: e?.message });
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 5000);
        }
      };

      setTimeout(runPrint, 450);
    });
  } catch (err: any) {
    console.error('Print preparation error:', err);
    return { success: false, fallbackNeeded: true, error: err?.message };
  }
}

/**
 * Downloads a standalone A4 Portrait .html file with inline Base64 logo
 * so users on any computer or phone can open and print offline with 100% fidelity.
 */
export async function downloadPrintableHtml(
  students: Student[],
  title: string,
  filenamePrefix: string = 'Student_Report',
  language: Language = 'km'
): Promise<void> {
  const inst = institutionService.getSettings();
  const logoDataUrl = await resolveImageAsDataUrl(inst.logoUrl || '/logo.jpg');
  const currentDateDot = formatCurrentReportDateDot();
  const html = generateReportHtml(students, title, language, currentDateDot, logoDataUrl);
  const blob = new Blob(['\uFEFF' + html], { type: 'text/html;charset=utf-8;' });
  const dateStr = new Date().toISOString().split('T')[0];
  triggerSafeBlobDownload(blob, `${filenamePrefix}_Printable_${dateStr}.html`);
}
