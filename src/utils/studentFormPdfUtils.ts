/**
 * Official A4 Portrait Generator for:
 * 1) Blank Student Registration Form (សម្រាប់បំពេញព័ត៌មានសិស្សដោយដៃ • 手寫入學申請表 • Blank Manual Form)
 * 2) Individual Student Information Sheet (ព័ត៌មានលម្អិតសិស្សម្នាក់ៗ • 學生個人詳細資料表 • Individual Student Report)
 *
 * Uses iframe-safe printing (zero window.open / window.alert) and 794px off-screen A4 Portrait
 * html2canvas + jsPDF rendering so Khmer, Traditional Chinese, and English fonts render crisply
 * across all Desktop PCs, iPhones, iPads, and Android phones.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, Language } from '../types';
import { institutionService } from '../services/institutionService';
import { schoolMajorService } from '../services/schoolMajorService';
import type { SchoolMajorEntry } from '../constants/studentOptions';
import {
  areAllRequiredDocumentsUploaded,
  getDocPages,
  getEffectiveStudentDocuments,
  getStudentPhotoDataUrl,
} from './documentUtils';
import { stripCloudEnvelopeFromNotes, isValidDataUrl } from './cloudDocSyncUtils';
import { calculateAge, formatDobOnly } from './ageUtils';
import { getSchoolTranslation, getMajorTranslation } from './schoolMajorTranslations';
import { getSafeStudentName } from './documentDownloadUtils';
import {
  NumberedStudentItem,
  computeStudentNumbersList,
  formatDobDot,
  triggerSafeBlobDownload,
} from './studentOrderUtils';
import { formatCurrentReportDateDot } from './pdfRenderUtils';

function escapeHtml(raw?: string | number | null): string {
  if (raw === null || raw === undefined) return '';
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let cachedDefaultLogoDataUrl: string | null = null;

export async function resolveAssetAsDataUrl(src?: string): Promise<string> {
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
      return resolveAssetAsDataUrl('/logo.jpg');
    }
    return src;
  }
}

// Pre-warm default school logo cache so native print stays within transient user activation
if (typeof window !== 'undefined') {
  void resolveAssetAsDataUrl('/logo.jpg');
}

function ensureMainDocHtml2CanvasFontFix(): void {
  if (typeof document === 'undefined' || !document.head) return;
  const fixId = 'h2c-main-doc-fontmetrics-fix';
  if (!document.getElementById(fixId)) {
    const styleEl = document.createElement('style');
    styleEl.id = fixId;
    styleEl.textContent = `
      img[width="1"][height="1"],
      img[src^="data:image/gif;base64,R0lGODlhAQAB"] {
        display: inline !important;
        vertical-align: baseline !important;
        position: relative !important;
        top: -1px !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

function sanitizeClonedDocumentOklch(clonedDoc: Document): void {
  if (clonedDoc.head) {
    const h2cBaselineFix = clonedDoc.createElement('style');
    h2cBaselineFix.textContent = `
      img[width="1"][height="1"],
      img[src^="data:image/gif;base64,R0lGODlhAQAB"] {
        display: inline !important;
        vertical-align: baseline !important;
        position: relative !important;
        top: -1px !important;
      }
    `;
    clonedDoc.head.appendChild(h2cBaselineFix);
  }

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
}

async function waitForDocumentFonts(): Promise<void> {
  try {
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise(r => setTimeout(r, 1400)),
      ]);
    }
  } catch {
    // Ignore font wait timeout
  }
}

function wrapStandaloneA4Html(title: string, bodyContentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700;900&family=Kantumruy+Pro:wght@400;600;700&family=Noto+Sans+Khmer:wght@400;600;700&family=Noto+Serif+TC:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 5mm 6mm;
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
      padding: 8px 12px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .a4-sheet-page {
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid-page;
    }
    .a4-sheet-page:last-child {
      page-break-after: auto;
      break-after: auto;
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
  ${bodyContentHtml}
</body>
</html>`;
}

async function printHtmlInHiddenIframe(
  fullHtml: string
): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  return new Promise(resolve => {
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

    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!doc || !win) {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve({ success: false, fallbackNeeded: true, error: 'Cannot access print frame' });
      return;
    }

    let beforePrintFired = false;
    const markBeforePrint = () => {
      beforePrintFired = true;
    };
    win.addEventListener('beforeprint', markBeforePrint);
    window.addEventListener('beforeprint', markBeforePrint);

    doc.open();
    doc.write(fullHtml);
    doc.close();

    const runPrint = async () => {
      try {
        const frameWin = iframe.contentWindow;
        if (!frameWin) {
          resolve({ success: false, fallbackNeeded: true });
          return;
        }
        if ((frameWin.document as any).fonts?.ready) {
          await Promise.race([
            (frameWin.document as any).fonts.ready,
            new Promise(r => setTimeout(r, 160)),
          ]);
        }
        frameWin.focus();
        frameWin.print();
        await new Promise(r => setTimeout(r, 90));

        if (!beforePrintFired) {
          resolve({
            success: false,
            fallbackNeeded: true,
            error: 'Print dialog suppressed by browser or sandboxed iframe',
          });
          return;
        }
        resolve({ success: true });
      } catch (e: any) {
        resolve({ success: false, fallbackNeeded: true, error: e?.message });
      } finally {
        window.removeEventListener('beforeprint', markBeforePrint);
        try {
          iframe.contentWindow?.removeEventListener('beforeprint', markBeforePrint);
        } catch {
          // ignore
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      }
    };

    setTimeout(runPrint, 120);
  });
}

async function renderPagesHtmlToA4Pdf(
  pageHtmlBlocks: string[],
  filename: string,
  language: Language = 'km',
  onProgress?: (status: string) => void,
  options?: { enforceFullPageHeight?: boolean }
): Promise<void> {
  ensureMainDocHtml2CanvasFontFix();
  await waitForDocumentFonts();

  const PAGE_WIDTH_PX = 794;
  const PAGE_MIN_HEIGHT_PX = 1123;
  const enforceFullPageHeight = options?.enforceFullPageHeight !== false;

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
    const totalPages = pageHtmlBlocks.length || 1;

    for (let i = 0; i < pageHtmlBlocks.length; i++) {
      if (totalPages > 1) {
        onProgress?.(
          language === 'zh-TW'
            ? `正在產出第 ${i + 1} / ${totalPages} 頁...`
            : language === 'en'
            ? `Rendering page ${i + 1} of ${totalPages}...`
            : `កំពុងបង្កើតទំព័រទី ${i + 1} នៃ ${totalPages}...`
        );
      } else {
        onProgress?.(
          language === 'zh-TW'
            ? '正在產出 A4 PDF 檔案...'
            : language === 'en'
            ? 'Rendering A4 Portrait PDF...'
            : 'កំពុងរៀបចំឯកសារ PDF (ក្រដាសបញ្ឈរ A4)...'
        );
      }

      const pageEl = document.createElement('div');
      pageEl.style.width = `${PAGE_WIDTH_PX}px`;
      if (enforceFullPageHeight) {
        pageEl.style.minHeight = `${PAGE_MIN_HEIGHT_PX}px`;
      }
      pageEl.style.padding = '10px 16px';
      pageEl.style.backgroundColor = '#ffffff';
      pageEl.style.color = '#000000';
      pageEl.style.fontFamily =
        "'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif";
      pageEl.style.boxSizing = 'border-box';
      pageEl.innerHTML = pageHtmlBlocks[i];

      container.appendChild(pageEl);
      await new Promise(r => setTimeout(r, 85));

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        width: PAGE_WIDTH_PX,
        windowWidth: PAGE_WIDTH_PX,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: sanitizeClonedDocumentOklch,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const canvasW = canvas.width;
      const canvasH = canvas.height;
      // Immediately release backing buffer for iOS Safari / mobile multi-page stability
      canvas.width = 1;
      canvas.height = 1;

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const naturalHeightMm = (canvasH * pdfWidthMm) / canvasW;
      if (naturalHeightMm <= pdfHeightMm) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, naturalHeightMm);
      } else {
        const fitWidthMm = (canvasW * pdfHeightMm) / canvasH;
        const offsetX = Math.max(0, (pdfWidthMm - fitWidthMm) / 2);
        pdf.addImage(imgData, 'JPEG', offsetX, 0, fitWidthMm, pdfHeightMm);
      }

      container.removeChild(pageEl);
    }

    const pdfBlob = pdf.output('blob');
    triggerSafeBlobDownload(pdfBlob, filename);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

// ============================================================================
// PART 1: BLANK STUDENT REGISTRATION FORM (សម្រាប់បំពេញព័ត៌មានសិស្សដោយដៃ)
// ============================================================================

function squareCheckboxHtml(sizePx: number = 12, borderColor: string = '#0f172a'): string {
  return `<span style="display: inline-block; width: ${sizePx}px; height: ${sizePx}px; border: 1.6px solid ${borderColor}; border-radius: 2px; background: #ffffff; vertical-align: middle; flex-shrink: 0;"></span>`;
}

function blankFieldCell(
  labelKm: string,
  labelSub: string,
  required: boolean = false,
  customValueHtml?: string,
  colSpan: number = 1
): string {
  const reqHtml = required ? `<span style="color: #dc2626; font-weight: 900;"> *</span>` : '';
  const innerLine =
    customValueHtml ||
    `<div style="height: 16px; border-bottom: 1px dotted #475569; margin-top: 1.5px;"></div>`;

  return `
    <td colspan="${colSpan}" style="border: 1px solid #1e293b; padding: 3px 6.5px 3.5px 6.5px; vertical-align: middle;">
      <div style="font-size: 10.6px; font-weight: 700; color: #0f172a; line-height: 1.35;">
        <span>${escapeHtml(labelKm)}</span>${reqHtml}
        <span style="font-weight: 600; font-size: 9.6px; color: #475569; margin-left: 4px;">${escapeHtml(labelSub)}</span>
      </div>
      ${innerLine}
    </td>
  `;
}

interface IndexedSchoolEntry {
  index: number;
  categoryOrderNo: number;
  entry: SchoolMajorEntry;
  isUniversity: boolean;
}

function isUniversitySchoolEntry(entry: SchoolMajorEntry): boolean {
  const name = entry.school || '';
  return Boolean(
    name.includes('大學') ||
      name.includes('學院') ||
      name.includes('專科') ||
      entry.ageRequirementEn?.toLowerCase().includes('university') ||
      entry.ageRequirementEn?.toLowerCase().includes('college') ||
      entry.ageRequirementKm?.includes('សកលវិទ្យាល័យ') ||
      entry.ageRequirementKm?.includes('សាកលវិទ្យាល័យ')
  );
}

function getLocalizedSchoolSubLabel(schoolName: string, language: Language): string {
  const sTrans = getSchoolTranslation(schoolName);
  if (!sTrans) return '';
  const km = sTrans.km && sTrans.km !== schoolName ? sTrans.km : '';
  const en = sTrans.en && sTrans.en !== schoolName ? sTrans.en : '';
  if (language === 'en' && en) {
    return km ? `${km} · ${en}` : en;
  }
  return km || en;
}

function getLocalizedMajorSubLabel(majorName: string, language: Language): string {
  const mTrans = getMajorTranslation(majorName);
  if (!mTrans) return '';
  const km = mTrans.km && mTrans.km !== majorName ? mTrans.km : '';
  const en = mTrans.en && mTrans.en !== majorName ? mTrans.en : '';
  if (language === 'en' && en) {
    return km ? `${km} · ${en}` : en;
  }
  return km || en;
}

function estimateSchoolChecklistCardHeightPx(item: IndexedSchoolEntry, language: Language): number {
  const subText = getLocalizedSchoolSubLabel(item.entry.school, language);
  const headerLines = subText.length > 78 ? 22 : subText.length > 38 ? 12 : 0;
  const headerHeight = 36 + headerLines;
  const majors = item.entry.majors || [];
  if (majors.length === 0) {
    return headerHeight + 30;
  }
  let majorsHeight = 14;
  for (const maj of majors) {
    const mSub = getLocalizedMajorSubLabel(maj, language);
    const combinedLen = maj.length + mSub.length;
    majorsHeight += combinedLen > 75 ? 32 : combinedLen > 38 ? 22 : 16;
  }
  return headerHeight + majorsHeight + 8;
}

function renderSchoolChecklistCardHtml(item: IndexedSchoolEntry | undefined, language: Language): string {
  if (!item) {
    return `<td style="width: 50%; border: 1px solid transparent; padding: 0;"></td>`;
  }

  const { index, entry, isUniversity } = item;
  const schoolSubLabel = getLocalizedSchoolSubLabel(entry.school, language);

  const accentColor = isUniversity ? '#1e3a8a' : '#701014';
  const headerBgColor = isUniversity ? '#eff6ff' : '#fdf2f2';
  const headerBorderColor = isUniversity ? '#bfdbfe' : '#fecdd3';

  const majors = entry.majors || [];
  const majorsRowsHtml =
    majors.length > 0
      ? majors
          .map((maj, mIdx) => {
            const majorSub = getLocalizedMajorSubLabel(maj, language);
            return `
              <div style="display: flex; align-items: flex-start; gap: 4.5px; padding: 1.2px 0; line-height: 1.35;">
                <span style="margin-top: 2px; display: inline-block; width: 11px; height: 11px; border: 1.5px solid #0f172a; border-radius: 2px; background: #ffffff; flex-shrink: 0;"></span>
                <div style="font-size: 10.3px; color: #0f172a; word-break: break-word;">
                  <span style="font-family: Arial, sans-serif; font-weight: 700; font-size: 10px; color: #334155; margin-right: 2px;">${mIdx + 1}.</span>
                  <strong style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 11.2px; color: #000000;">${escapeHtml(maj)}</strong>
                  ${
                    majorSub
                      ? `<span style="color: #334155; font-size: 9.6px; margin-left: 3px;">(${escapeHtml(majorSub)})</span>`
                      : ''
                  }
                </div>
              </div>
            `;
          })
          .join('')
      : `
        <div style="display: flex; align-items: center; gap: 5px; padding: 2px 0; font-size: 10.2px; color: #334155; line-height: 1.35;">
          ${squareCheckboxHtml(11, '#0f172a')}
          <span>១. មុខជំនាញ / 科系 / Major៖ .........................................</span>
        </div>
      `;

  return `
    <td style="width: 50%; border: 1px solid #1e293b; vertical-align: top; background: #ffffff; padding: 0;">
      <!-- School Checkbox Header -->
      <div style="background: ${headerBgColor}; border-bottom: 1px solid ${headerBorderColor}; padding: 4px 6px;">
        <div style="display: flex; align-items: flex-start; gap: 4.5px; min-width: 0;">
          <span style="margin-top: 1.5px; display: inline-block; width: 12.5px; height: 12.5px; border: 1.7px solid ${accentColor}; border-radius: 2px; background: #ffffff; flex-shrink: 0;"></span>
          <div style="font-size: 11.2px; font-weight: 800; color: #000000; line-height: 1.3;">
            <span style="font-family: Arial, sans-serif; color: ${accentColor}; margin-right: 2px;">${index}.</span>
            <span style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 11.6px;">${escapeHtml(entry.school)}</span>
          </div>
        </div>
        ${
          schoolSubLabel
            ? `<div style="font-size: 9.4px; font-weight: 600; color: #334155; padding-left: 17px; margin-top: 1px; line-height: 1.35;">${escapeHtml(schoolSubLabel)}</div>`
            : ''
        }
      </div>

      <!-- Majors Checkboxes under this School -->
      <div style="padding: 3px 6px 4px 11px;">
        <div style="font-size: 8.9px; font-weight: 700; color: #64748b; margin-bottom: 1.5px; line-height: 1.25;">
          ជ្រើសរើសមុខជំនាញ • 勾選科系 • Tick Major:
        </div>
        ${majorsRowsHtml}
      </div>
    </td>
  `;
}

function renderOtherSchoolMajorBoxHtml(): string {
  return `
    <div style="margin-top: 4px; border: 1.5px solid #1e293b; background: #f8fafc; padding: 5.5px 8px;">
      <div style="font-size: 10.5px; font-weight: 700; color: #0f172a; margin-bottom: 4.5px; text-align: center; line-height: 1.32;">
        ▪ សាលារៀន ឬ មុខជំនាញផ្សេងទៀត • 其他學校或科系 • Other School or Major
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 10.5px; color: #0f172a; margin-bottom: 5px;">
        <div style="display: flex; align-items: center; gap: 5px; line-height: 1.3;">
          ${squareCheckboxHtml(11.5, '#701014')}
          <span>ឈ្មោះសាលា / 學校 / School៖</span>
          <span style="flex: 1; border-bottom: 1px dotted #334155; height: 14px;">&nbsp;</span>
        </div>
        <div style="display: flex; align-items: center; gap: 5px; line-height: 1.3;">
          ${squareCheckboxHtml(11.5, '#0f172a')}
          <span>មុខជំនាញ / 科系 / Major៖</span>
          <span style="flex: 1; border-bottom: 1px dotted #334155; height: 14px;">&nbsp;</span>
        </div>
      </div>
      <div style="padding-top: 4px; border-top: 1px dashed #94a3b8; display: flex; justify-content: space-between; align-items: center; gap: 14px; font-size: 10.5px; color: #1e293b; line-height: 1.3;">
        <div style="flex: 1; display: flex; align-items: center; gap: 4px;">
          <strong>ឈ្មោះសិស្ស (學生姓名 / Student Name):</strong>
          <span style="flex: 1; border-bottom: 1px dotted #334155; height: 14px;">&nbsp;</span>
        </div>
        <div style="width: 230px; display: flex; align-items: center; gap: 4px;">
          <strong>ហត្ថលេខា (簽名 / Sign):</strong>
          <span style="flex: 1; border-bottom: 1px dotted #334155; height: 14px;">&nbsp;</span>
        </div>
      </div>
    </div>
  `;
}

export function buildBlankRegistrationFormPagesHtml(
  logoDataUrl?: string,
  language: Language = 'km'
): string[] {
  const inst = institutionService.getSettings();
  const schoolLogo = logoDataUrl || inst.logoUrl || '/logo.jpg';
  const schoolNameKm = inst.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ';
  const schoolNameZh = inst.nameZh || '日興國際學校';
  const schoolNameEn = inst.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL';

  const rawSchools = schoolMajorService.getSchools().filter((s) => {
    const n = (s.school || '').trim();
    if (!n) return false;
    return (
      n !== '日興國際學校' &&
      n !== 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ' &&
      n !== 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' &&
      !n.toLowerCase().includes('lising international')
    );
  });

  // Separate High Schools first and Universities second BEFORE numbering so លេខរៀង is 100% sequential (1..N)
  const rawHighSchools = rawSchools.filter((s) => !isUniversitySchoolEntry(s));
  const rawUniversities = rawSchools.filter((s) => isUniversitySchoolEntry(s));

  const highSchools: IndexedSchoolEntry[] = rawHighSchools.map((entry, idx) => ({
    index: idx + 1,
    categoryOrderNo: idx + 1,
    entry,
    isUniversity: false,
  }));

  const universities: IndexedSchoolEntry[] = rawUniversities.map((entry, idx) => ({
    index: highSchools.length + idx + 1,
    categoryOrderNo: idx + 1,
    entry,
    isUniversity: true,
  }));

  const hsFirstIdx = highSchools.length > 0 ? highSchools[0].index : 1;
  const hsLastIdx = highSchools.length > 0 ? highSchools[highSchools.length - 1].index : 0;
  const univFirstIdx = universities.length > 0 ? universities[0].index : hsLastIdx + 1;
  const univLastIdx = universities.length > 0 ? universities[universities.length - 1].index : hsLastIdx;

  type ChecklistRowUnit =
    | {
        kind: 'pair';
        category: 'high_school' | 'university';
        left: IndexedSchoolEntry;
        right?: IndexedSchoolEntry;
        html: string;
        heightPx: number;
      }
    | {
        kind: 'other_box';
        category: 'university';
        html: string;
        heightPx: number;
      };

  const units: ChecklistRowUnit[] = [];

  for (let i = 0; i < highSchools.length; i += 2) {
    const left = highSchools[i];
    const right = highSchools[i + 1];
    const html = `
      <table style="width: 100%; border-collapse: separate; border-spacing: 4px 0; table-layout: fixed; margin-bottom: 3.5px;">
        <tbody>
          <tr>
            ${renderSchoolChecklistCardHtml(left, language)}
            ${renderSchoolChecklistCardHtml(right, language)}
          </tr>
        </tbody>
      </table>
    `;
    const fallbackH =
      Math.max(
        estimateSchoolChecklistCardHeightPx(left, language),
        right ? estimateSchoolChecklistCardHeightPx(right, language) : 0
      ) + 4;
    units.push({
      kind: 'pair',
      category: 'high_school',
      left,
      right,
      html,
      heightPx: fallbackH,
    });
  }

  for (let i = 0; i < universities.length; i += 2) {
    const left = universities[i];
    const right = universities[i + 1];
    const html = `
      <table style="width: 100%; border-collapse: separate; border-spacing: 4px 0; table-layout: fixed; margin-bottom: 3.5px;">
        <tbody>
          <tr>
            ${renderSchoolChecklistCardHtml(left, language)}
            ${renderSchoolChecklistCardHtml(right, language)}
          </tr>
        </tbody>
      </table>
    `;
    const fallbackH =
      Math.max(
        estimateSchoolChecklistCardHeightPx(left, language),
        right ? estimateSchoolChecklistCardHeightPx(right, language) : 0
      ) + 4;
    units.push({
      kind: 'pair',
      category: 'university',
      left,
      right,
      html,
      heightPx: fallbackH,
    });
  }

  units.push({
    kind: 'other_box',
    category: 'university',
    html: renderOtherSchoolMajorBoxHtml(),
    heightPx: 76,
  });

  // Measure actual rendered DOM pixel heights on a 762px A4 inner canvas so pages pack tightly with ZERO blank paper
  let runningHeaderHeightPx = 56;
  let footerHeightPx = 24;

  if (typeof document !== 'undefined' && document.body) {
    const probe = document.createElement('div');
    probe.style.position = 'fixed';
    probe.style.left = '-10000px';
    probe.style.top = '0';
    probe.style.width = '762px';
    probe.style.padding = '0';
    probe.style.margin = '0';
    probe.style.backgroundColor = '#ffffff';
    probe.style.color = '#000000';
    probe.style.fontFamily =
      "'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif";
    probe.style.boxSizing = 'border-box';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.zIndex = '-99999';
    document.body.appendChild(probe);

    try {
      probe.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 5px;">
          <div style="display: flex; align-items: center; gap: 7px;">
            <div style="width: 44px; height: 44px;"></div>
            <div>
              <div style="font-size: 11.8px; line-height: 1.28;">School KM</div>
              <div style="font-size: 11.2px; line-height: 1.2;">School ZH</div>
              <div style="font-size: 8px; line-height: 1.2;">SCHOOL EN</div>
            </div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 11.8px; line-height: 1.32;">Title</div>
            <div style="font-size: 10px; line-height: 1.32;">Subtitle</div>
          </div>
        </div>
      `;
      runningHeaderHeightPx = Math.max(54, probe.offsetHeight + 4);

      probe.innerHTML = `
        <div style="padding-top: 4px; margin-top: 5px; border-top: 1px solid #cbd5e1; font-size: 9.6px;">Footer</div>
      `;
      footerHeightPx = Math.max(22, probe.offsetHeight + 6);

      const unitWrappers = units
        .map((u, idx) => `<div data-unit-idx="${idx}" style="overflow: hidden;">${u.html}</div>`)
        .join('');
      probe.innerHTML = unitWrappers;
      const measuredNodes = probe.querySelectorAll('[data-unit-idx]');
      measuredNodes.forEach((node) => {
        const el = node as HTMLElement;
        const idx = Number(el.getAttribute('data-unit-idx'));
        if (!Number.isNaN(idx) && units[idx] && el.offsetHeight > 0) {
          units[idx].heightPx = el.offsetHeight;
        }
      });
    } finally {
      if (document.body.contains(probe)) {
        document.body.removeChild(probe);
      }
    }
  }

  // Max inner page height ~1050px fills ~95% of A4 Portrait (1103px inner) while staying safely inside @media print
  const MAX_INNER_PAGE_PX = 1052;
  const availableBodyPx = Math.max(760, MAX_INNER_PAGE_PX - runningHeaderHeightPx - footerHeightPx);

  const pageChunks: ChecklistRowUnit[][] = [];
  const pageChunkHeights: number[] = [];
  let currentUnits: ChecklistRowUnit[] = [];
  let currentBodyH = 0;

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];

    if (currentUnits.length > 0 && currentBodyH + unit.heightPx > availableBodyPx) {
      pageChunks.push(currentUnits);
      pageChunkHeights.push(currentBodyH);
      currentUnits = [unit];
      currentBodyH = unit.heightPx;
    } else {
      currentUnits.push(unit);
      currentBodyH += unit.heightPx;
    }
  }

  if (currentUnits.length > 0) {
    // Prevent an almost-empty trailing page if only the "Other School/Major" box spilled by a small margin
    if (
      pageChunks.length > 0 &&
      currentBodyH <= 115 &&
      pageChunkHeights[pageChunkHeights.length - 1] + currentBodyH <= availableBodyPx + 36
    ) {
      const prev = pageChunks[pageChunks.length - 1];
      prev.push(...currentUnits);
      pageChunkHeights[pageChunkHeights.length - 1] += currentBodyH;
    } else {
      pageChunks.push(currentUnits);
      pageChunkHeights.push(currentBodyH);
    }
  }

  const totalPages = 1 + pageChunks.length;

  // Compute exact page ranges for High Schools vs Universities so Page 1 and every page header match 100%
  let hsStartPage = 0;
  let hsEndPage = 0;
  let univStartPage = 0;
  let univEndPage = 0;

  pageChunks.forEach((chunk, cIdx) => {
    const pageNum = cIdx + 2;
    const hasHs = chunk.some((u) => u.kind === 'pair' && u.category === 'high_school');
    const hasUniv = chunk.some((u) => u.category === 'university');
    if (hasHs) {
      if (!hsStartPage) hsStartPage = pageNum;
      hsEndPage = pageNum;
    }
    if (hasUniv) {
      if (!univStartPage) univStartPage = pageNum;
      univEndPage = pageNum;
    }
  });

  if (!hsStartPage) {
    hsStartPage = 2;
    hsEndPage = 2;
  }
  if (!univStartPage) {
    univStartPage = totalPages;
    univEndPage = totalPages;
  }

  const formatPageSpanKm = (startP: number, endP: number) =>
    startP === endP ? `ទំព័រទី ${startP}` : `ទំព័រទី ${startP} ដល់ទី ${endP}`;

  const hsPageSpanKm = formatPageSpanKm(hsStartPage, hsEndPage);
  const univPageSpanKm = formatPageSpanKm(univStartPage, univEndPage);

  const buildPageFooter = (pageNum: number) => `
    <div style="padding-top: 4px; margin-top: 5px; border-top: 1px solid #cbd5e1; display: flex; justify-content: center; align-items: center; font-size: 9.6px; color: #0f172a; line-height: 1.35;">
      <span style="font-weight: 800; white-space: nowrap;">ទំព័រទី ${pageNum} / ${totalPages} • 第 ${pageNum} / ${totalPages} 頁 • Page ${pageNum} of ${totalPages}</span>
    </div>
  `;

  // =========================================================================
  // PAGE 1: PERSONAL, PARENTS, AGE/PAGE GUIDE, DOCS CHECKLIST & SIGNATURES
  // =========================================================================
  const page1Html = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1040px; color: #000000;">
      <div>
        <!-- Official Header + Office Metadata Strip alongside True Physical 4x6 cm (160x238px) Photo Paste Box -->
        <div style="display: flex; align-items: stretch; justify-content: space-between; gap: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 4.5px;">
          <!-- Left + Center Column (Upper: Logo + Page-Centered Motto/Title; Bottom: Office Seq. & Date Strip) -->
          <div style="flex: 1 1 0%; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex: 1; display: flex; align-items: center;">
              <!-- Left: School Logo & Name (flex-basis 172px offsets the 160px+12px right photo column so Center sits at exact 50% of full 762px page) -->
              <div style="flex: 1 1 172px; min-width: 0; padding-top: 26px; display: flex; align-items: center; justify-content: flex-start; gap: 7px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #1e1b4b; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <img src="${escapeHtml(schoolLogo)}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <div>
                  <div style="font-size: 12.6px; font-weight: 900; color: #0f172a; line-height: 1.28; white-space: nowrap;">${escapeHtml(schoolNameKm)}</div>
                  <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12px; font-weight: 700; color: #1e1b4b; line-height: 1.22; white-space: nowrap;">${escapeHtml(schoolNameZh)}</div>
                  <div style="font-family: 'Times New Roman', serif; font-size: 8.6px; font-weight: 700; color: #334155; text-transform: uppercase; white-space: nowrap; line-height: 1.22;">${escapeHtml(schoolNameEn)}</div>
                </div>
              </div>

              <!-- Center: Trilingual Motto & Form Title (Exact 50% Horizontal Center of Full A4 Page) -->
              <div style="flex: 0 0 auto; text-align: center; padding: 0 6px;">
                <div style="font-size: 15px; font-weight: 900; color: #000000; line-height: 1.26;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.26;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 1px;">柬埔寨王國 • 民族 宗教 國王</div>
                <div style="font-family: 'Times New Roman', serif; font-size: 9px; font-weight: 700; color: #334155; letter-spacing: 0.4px; text-transform: uppercase;">KINGDOM OF CAMBODIA • NATION RELIGION KING</div>

                <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid #cbd5e1;">
                  <div style="font-size: 14.8px; font-weight: 900; color: #701014; line-height: 1.25;">ពាក្យសុំចុះឈ្មោះចូលរៀន</div>
                  <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.2;">學生入學申請登記表 (手寫表格)</div>
                  <div style="font-family: 'Times New Roman', serif; font-size: 10px; font-weight: 700; color: #1e293b; letter-spacing: 0.4px;">STUDENT REGISTRATION APPLICATION FORM</div>
                </div>
              </div>

              <!-- Right Balancing Spacer -->
              <div style="flex: 1 1 0px; min-width: 0;"></div>
            </div>

            <!-- Office Metadata Strip (Positioned beside the bottom of the 4x6 Photo Box so physical photo never overlaps it) -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 10.5px; line-height: 1.35; padding: 4px 8px; background: #f8fafc; border: 1px solid #cbd5e1;">
              <div style="display: flex; align-items: center; white-space: nowrap;">
                <strong>លេខរៀងសិស្ស (សម្រាប់រដ្ឋបាល / 編號 / Seq. No.):</strong>
                <span style="display: inline-block; width: 68px; border-bottom: 1px dotted #0f172a; margin-left: 5px; height: 13px;">&nbsp;</span>
              </div>
              <div style="display: flex; align-items: center; white-space: nowrap;">
                <strong>កាលបរិច្ឆេទដាក់ពាក្យ (申請日期 / Date):</strong>
                <span style="font-family: 'Times New Roman', serif; margin-left: 4px;">....... / ....... / 202....</span>
              </div>
            </div>
          </div>

          <!-- Right: True-Scale Physical 4x6 cm (42.3mm x 63.0mm = 160px x 238px) Student Photo Paste Box -->
          <div style="width: 160px; height: 238px; border: 1.6px dashed #0f172a; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8px; background: #fafafa; flex-shrink: 0;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.35;">បិទរូបថត</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12px; font-weight: 700; color: #334155; margin-top: 3px; line-height: 1.25;">貼相片處</div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5px; font-weight: 700; color: #475569; margin-top: 3px; line-height: 1.25;">Photo 4 × 6 cm</div>
          </div>
        </div>

        <!-- SECTION 1: PERSONAL & CONTACT INFORMATION -->
        <div style="margin-bottom: 4px;">
          <div style="background: #701014; color: #ffffff; min-height: 24px; padding: 3.5px 10px; font-size: 11.4px; font-weight: 700; line-height: 1.45; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span>១. ព័ត៌មានផ្ទាល់ខ្លួន និងទំនាក់ទំនង • 個人基本與聯絡資料 • 1. Personal &amp; Contact Information</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr>
                ${blankFieldCell('ឈ្មោះខ្មែរ', '高棉姓名 / Khmer Name', true)}
                ${blankFieldCell('ឈ្មោះឡាតាំង (អក្សរធំ)', '英文姓名 / Latin Name', true)}
                ${blankFieldCell('ឈ្មោះភាសាចិន', '中文姓名 / Chinese Name', false)}
              </tr>
              <tr>
                ${blankFieldCell(
                  'ភេទ',
                  '性別 / Gender',
                  true,
                  `<div style="height: 17px; display: flex; align-items: center; gap: 14px; font-size: 10.8px; line-height: 1.25; margin-top: 1.5px;">
                    <span style="display: inline-flex; align-items: center; gap: 4.5px;">${squareCheckboxHtml(11)} <span>ប្រុស / 男 / M</span></span>
                    <span style="display: inline-flex; align-items: center; gap: 4.5px;">${squareCheckboxHtml(11)} <span>ស្រី / 女 / F</span></span>
                  </div>`
                )}
                ${blankFieldCell(
                  'ថ្ងៃខែឆ្នាំកំណើត',
                  '出生日期 / DOB',
                  true,
                  `<div style="height: 17px; display: flex; align-items: center; font-family: 'Times New Roman', serif; font-size: 11px; color: #334155; margin-top: 1.5px;">
                    ........ / ........ / ................
                  </div>`
                )}
                ${blankFieldCell(
                  'អាយុ',
                  '年齡 / Age (វិទ្យាល័យ 16–22 | សកល ≤25)',
                  false,
                  `<div style="height: 17px; display: flex; align-items: center; justify-content: space-between; font-size: 10.2px; color: #334155; margin-top: 1.5px;">
                    <span style="flex: 1; border-bottom: 1px dotted #475569; height: 13px;">&nbsp;</span>
                    <span style="margin-left: 5px; font-size: 9.6px; color: #475569; line-height: 1.2;">ឆ្នាំ/歲</span>
                  </div>`
                )}
              </tr>
              <tr>
                ${blankFieldCell('ទីកន្លែងកំណើត (ខេត្ត/រាជធានី)', '出生地點 / Place of Birth', true, undefined, 2)}
                ${blankFieldCell('ឈ្មោះអ្នកណែនាំ', '推薦人 / Referrer Name', false)}
              </tr>
              <tr>
                ${blankFieldCell('លេខអត្តសញ្ញាបណ្ណ', '身分證號碼 / National ID No.', true)}
                ${blankFieldCell('លេខលិខិតឆ្លងដែន', '護照號碼 / Passport No.', false)}
                ${blankFieldCell('លេខទូរស័ព្ទសិស្ស', '學生電話 / Student Phone', true)}
              </tr>
              <tr>
                ${blankFieldCell('អ៊ីមែលសិស្ស', '電子郵件 / Student E-mail', false)}
                ${blankFieldCell('អាសយដ្ឋានបច្ចុប្បន្ន (ភូមិ ឃុំ/សង្កាត់ ស្រុក/ខណ្ឌ ខេត្ត/រាជធានី)', '現居詳細地址 / Current Residential Address', true, undefined, 2)}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION 2: PARENTS INFORMATION -->
        <div style="margin-bottom: 4px;">
          <div style="background: #701014; color: #ffffff; min-height: 24px; padding: 3.5px 10px; font-size: 11.4px; font-weight: 700; line-height: 1.45; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span>២. ព័ត៌មានឪពុក និង ម្ដាយ • 父母親資料 • 2. Parents Information</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr style="background: #f8fafc;">
                <td colspan="4" style="border: 1px solid #1e293b; padding: 2px 8px; vertical-align: middle;">
                  <div style="display: flex; align-items: center; justify-content: center; min-height: 19px; font-size: 10.4px; font-weight: 700; color: #1e1b4b; line-height: 1.4; text-align: center;">
                    <span>▪ ២.១ ព័ត៌មានឪពុក • 父親資料 • Father's Information</span>
                  </div>
                </td>
              </tr>
              <tr>
                ${blankFieldCell('ឈ្មោះឪពុក (អង់គ្លេស/ខ្មែរ)', '父親英文姓名 / Father Name', true)}
                ${blankFieldCell('ឈ្មោះឪពុក (ភាសាចិន)', '父親中文姓名 / Chinese Name', false)}
                ${blankFieldCell(
                  'ថ្ងៃខែឆ្នាំកំណើត និង អាយុ',
                  '生日與年齡 / DOB & Age',
                  true,
                  `<div style="height: 16.5px; display: flex; align-items: center; justify-content: space-between; font-size: 10.2px; color: #334155; line-height: 1.3; margin-top: 1.5px;">
                    <span>....../....../..........</span>
                    <span>អាយុ: ........</span>
                  </div>`
                )}
                ${blankFieldCell('លេខទូរស័ព្ទឪពុក', '父親電話 / Father Phone', true)}
              </tr>
              <tr style="background: #f8fafc;">
                <td colspan="4" style="border: 1px solid #1e293b; padding: 2px 8px; vertical-align: middle;">
                  <div style="display: flex; align-items: center; justify-content: center; min-height: 19px; font-size: 10.4px; font-weight: 700; color: #831843; line-height: 1.4; text-align: center;">
                    <span>▪ ២.២ ព័ត៌មានម្ដាយ • 母親資料 • Mother's Information</span>
                  </div>
                </td>
              </tr>
              <tr>
                ${blankFieldCell('ឈ្មោះម្ដាយ (អង់គ្លេស/ខ្មែរ)', '母親英文姓名 / Mother Name', true)}
                ${blankFieldCell('ឈ្មោះម្ដាយ (ភាសាចិន)', '母親中文姓名 / Chinese Name', false)}
                ${blankFieldCell(
                  'ថ្ងៃខែឆ្នាំកំណើត និង អាយុ',
                  '生日與年齡 / DOB & Age',
                  true,
                  `<div style="height: 16.5px; display: flex; align-items: center; justify-content: space-between; font-size: 10.2px; color: #334155; line-height: 1.3; margin-top: 1.5px;">
                    <span>....../....../..........</span>
                    <span>អាយុ: ........</span>
                  </div>`
                )}
                ${blankFieldCell('លេខទូរស័ព្ទម្ដាយ', '母親電話 / Mother Phone', true)}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION 3: ACADEMIC, EXPLICIT AGE RULES & EXACT PAGE DIRECTORY -->
        <div style="margin-bottom: 4px;">
          <div style="background: #701014; color: #ffffff; min-height: 24px; padding: 3.5px 10px; font-size: 11.4px; font-weight: 700; line-height: 1.45; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span>៣. ព័ត៌មានការសិក្សា និងលក្ខខណ្ឌអាយុតាមកម្រិតសាលារៀន • 學歷與學校年齡規定 • 3. Academic &amp; School Age Guide</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr>
                ${blankFieldCell('ឈ្មោះសាលារៀននៅកម្ពុជា', '在柬就讀學校 / Previous School in Cambodia', true)}
                ${blankFieldCell('អាសយដ្ឋានសាលារៀននៅកម្ពុជា', '在柬學校地址 / School Address in Cambodia', true)}
              </tr>
              <tr>
                <td colspan="2" style="border: 1px solid #1e293b; padding: 4px 8px; background: #fffbeb; font-size: 10px; color: #0f172a; line-height: 1.3; vertical-align: middle;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: 800; color: #701014; text-align: center; margin-bottom: 3px;">
                    <span>សូមពិនិត្យលក្ខខណ្ឌអាយុ និងទំព័រ (Page) មុនគូសធីក</span>
                    ${squareCheckboxHtml(10.5, '#701014')}
                    <span>ជ្រើសរើសសាលា និងជំនាញ</span>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    <div style="background: #fdf2f2; border: 1px solid #fecdd3; border-radius: 4px; padding: 3px 6px; text-align: center;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 4.5px; font-weight: 800; color: #701014; font-size: 9.8px; line-height: 1.25;">
                        ${squareCheckboxHtml(10, '#701014')}
                        <span>ផ្នែក ក៖ សាលាវិទ្យាល័យ (高中職 / High School)</span>
                      </div>
                      <div style="color: #0f172a; font-size: 9.4px; font-weight: 600; margin-top: 1px; line-height: 1.22;">
                        អាយុចាប់ពី <strong>១៦ឆ្នាំ ដល់ ២២ឆ្នាំ</strong> • <strong>ល.រ #${hsFirstIdx}–#${hsLastIdx} (${hsPageSpanKm})</strong>
                      </div>
                    </div>
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 3px 6px; text-align: center;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 4.5px; font-weight: 800; color: #1e3a8a; font-size: 9.8px; line-height: 1.25;">
                        ${squareCheckboxHtml(10, '#1e3a8a')}
                        <span>ផ្នែក ខ៖ មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ (大學/科大)</span>
                      </div>
                      <div style="color: #0f172a; font-size: 9.4px; font-weight: 600; margin-top: 1px; line-height: 1.22;">
                        អាយុ <strong>≤២៥ឆ្នាំ (កើតក្រោយ ០១/០៧)</strong> • <strong>ល.រ #${univFirstIdx}–#${univLastIdx} (${univPageSpanKm})</strong>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                ${blankFieldCell('សាលារៀនដែលបានជ្រើសរើស (សង្ខេប)', '選讀台灣學校 / Selected School', false)}
                ${blankFieldCell('មុខជំនាញដែលបានជ្រើសរើស (សង្ខេប)', '選讀專業科系 / Selected Major', false)}
              </tr>
              <tr>
                ${blankFieldCell('កំណត់សម្គាល់បន្ថែម (ផ្សេងៗ)', '備註說明 / Additional Notes & Remarks', false, undefined, 2)}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION 4: REQUIRED DOCUMENTS CHECKLIST (Sequential 1..8 Left-to-Right) -->
        <div style="margin-bottom: 3.5px;">
          <div style="background: #1e293b; color: #ffffff; min-height: 23px; padding: 3.5px 10px; font-size: 10.8px; font-weight: 700; line-height: 1.4; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span>៤. បញ្ជីឯកសារភ្ជាប់មកជាមួយ (តាមលំដាប់ ១ ដល់ ៨) • 必備證明文件清單 • 4. Attached Documents Checklist</span>
          </div>
          <div style="border: 1px solid #1e293b; border-top: none; padding: 4px 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5px 14px; font-size: 10.2px; line-height: 1.34; color: #0f172a;">
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>១. រូបថតសិស្ស 4×6 (學生照片 / Student Photo)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>២. អត្តសញ្ញាបណ្ណ * (身分證 / National ID Card)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>៣. សំបុត្រកំណើត * (出生證明書 / Birth Certificate)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>៤. សៀវភៅគ្រួសារ * (戶口名簿 / Family Book)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>៥. សៀវភៅស្នាក់នៅ * (居住證明簿 / Residence Book)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>៦. សញ្ញាបត្របឋមភូមិ ឬ ទុតិយភូមិ * (畢業證書 / Diploma)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>៧. សៀវភៅសិក្ខាគារិក * (學員紀錄手冊 / Trainee Book)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(10.5)} <span>៨. លិខិតឆ្លងដែន (護照 / Passport - បើមាន)</span></div>
          </div>
        </div>
      </div>

      <!-- SECTION 5: SIGNATURES + PAGE 1 FOOTER -->
      <div>
        <div style="padding-top: 3.5px; border-top: 1px dashed #64748b; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center; font-size: 10.3px;">
          <div>
            <div style="font-weight: 700; color: #0f172a; line-height: 1.25;">ហត្ថលេខាអាណាព្យាបាល</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', serif; color: #334155; line-height: 1.2;">家長或監護人簽名 / Parent</div>
            <div style="height: 20px;"></div>
            <div style="border-bottom: 1px dotted #475569; width: 78%; margin: 0 auto 2px;"></div>
            <div style="font-size: 9.4px; color: #64748b;">ឈ្មោះ និងហត្ថលេខា / Name &amp; Sign</div>
          </div>
          <div>
            <div style="font-weight: 700; color: #0f172a; line-height: 1.25;">ហត្ថលេខាសាមីខ្លួន (សិស្ស)</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', serif; color: #334155; line-height: 1.2;">學生本人簽名 / Applicant</div>
            <div style="height: 20px;"></div>
            <div style="border-bottom: 1px dotted #475569; width: 78%; margin: 0 auto 2px;"></div>
            <div style="font-size: 9.4px; color: #64748b;">ឈ្មោះ និងហត្ថលេខា / Name &amp; Sign</div>
          </div>
          <div>
            <div style="font-weight: 700; color: #0f172a; line-height: 1.25;">អ្នកទទួលពាក្យ / រដ្ឋបាល</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', serif; color: #334155; line-height: 1.2;">行政收件審核 / Office Admin</div>
            <div style="height: 20px;"></div>
            <div style="border-bottom: 1px dotted #475569; width: 78%; margin: 0 auto 2px;"></div>
            <div style="font-size: 9.4px; color: #64748b;">ហត្ថលេខា និងត្រា / Sign &amp; Stamp</div>
          </div>
        </div>
        ${buildPageFooter(1)}
      </div>
    </div>
  `;

  // =========================================================================
  // PAGES 2..N: DENSE ZERO-WHITESPACE CHECKLIST (AGE & PAGE AT TOP HEADER ONLY)
  // =========================================================================
  const checklistPagesHtml = pageChunks.map((chunk, chunkIdx) => {
    const pageNumber = chunkIdx + 2;

    const hsPairs = chunk.filter((u): u is Extract<ChecklistRowUnit, { kind: 'pair' }> => u.kind === 'pair' && u.category === 'high_school');
    const univPairs = chunk.filter((u): u is Extract<ChecklistRowUnit, { kind: 'pair' }> => u.kind === 'pair' && u.category === 'university');

    const hsMin = hsPairs.length > 0 ? hsPairs[0].left.index : undefined;
    const hsMax =
      hsPairs.length > 0
        ? (hsPairs[hsPairs.length - 1].right || hsPairs[hsPairs.length - 1].left).index
        : undefined;

    const univMin = univPairs.length > 0 ? univPairs[0].left.index : undefined;
    const univMax =
      univPairs.length > 0
        ? (univPairs[univPairs.length - 1].right || univPairs[univPairs.length - 1].left).index
        : undefined;

    const fmtRange = (min: number, max: number) => (min === max ? `#${min}` : `#${min}–#${max}`);

    let pageScopeTitleKm = '';
    if (hsMin !== undefined && hsMax !== undefined && univMin !== undefined && univMax !== undefined) {
      pageScopeTitleKm = `វិទ្យាល័យ (ល.រ ${fmtRange(hsMin, hsMax)} • អាយុ ១៦–២២ឆ្នាំ) + សកលវិទ្យាល័យ (ល.រ ${fmtRange(univMin, univMax)} • អាយុ ≤២៥ឆ្នាំ កើតក្រោយ ០១/០៧)`;
    } else if (hsMin !== undefined && hsMax !== undefined) {
      pageScopeTitleKm = `ផ្នែក ក៖ សាលាវិទ្យាល័យ (ល.រ ${fmtRange(hsMin, hsMax)}) • អាយុចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ`;
    } else if (univMin !== undefined && univMax !== undefined) {
      pageScopeTitleKm = `ផ្នែក ខ៖ សកលវិទ្យាល័យ (ល.រ ${fmtRange(univMin, univMax)}) • អាយុ ២៥ឆ្នាំចុះក្រោម (កើតក្រោយ ០១/០៧)`;
    } else {
      pageScopeTitleKm = `សាលារៀន ឬ មុខជំនាញផ្សេងទៀត`;
    }

    const renderedRowsHtml = chunk.map((unit) => unit.html).join('');

    return `
      <div style="color: #000000;">
        <!-- Running Checklist Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 5px;">
          <div style="flex-shrink: 0; display: flex; align-items: center; gap: 7px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #1e1b4b; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
              <img src="${escapeHtml(schoolLogo)}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <div>
              <div style="font-size: 11.8px; font-weight: 900; color: #0f172a; line-height: 1.28; white-space: nowrap;">${escapeHtml(schoolNameKm)}</div>
              <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 11.2px; font-weight: 700; color: #1e1b4b; line-height: 1.2; white-space: nowrap;">${escapeHtml(schoolNameZh)}</div>
              <div style="font-family: 'Times New Roman', serif; font-size: 8px; font-weight: 700; color: #334155; text-transform: uppercase; line-height: 1.2; white-space: nowrap;">${escapeHtml(schoolNameEn)}</div>
            </div>
          </div>
          <div style="min-width: 0; flex: 1; text-align: center;">
            <div style="font-size: 11.8px; font-weight: 900; color: #701014; line-height: 1.32;">
              តារាងគូសធីកជ្រើសរើសសាលារៀន និងមុខជំនាញ — ទំព័រទី ${pageNumber} / ${totalPages} (Page ${pageNumber}/${totalPages})
            </div>
            <div style="font-size: 10px; font-weight: 800; color: #0f172a; line-height: 1.32; margin-top: 1px;">
              ${escapeHtml(pageScopeTitleKm)}
            </div>
          </div>
        </div>

        ${renderedRowsHtml}

        ${buildPageFooter(pageNumber)}
      </div>
    `;
  });

  return [page1Html, ...checklistPagesHtml];
}

export function buildBlankRegistrationFormPageHtml(
  logoDataUrl?: string,
  language: Language = 'km'
): string {
  const pages = buildBlankRegistrationFormPagesHtml(logoDataUrl, language);
  return pages.join(
    `<div style="margin: 18px 0; border-bottom: 2px dashed #94a3b8;"></div>`
  );
}

export async function saveBlankFormAsPDF(
  language: Language = 'km',
  onProgress?: (status: string) => void
): Promise<void> {
  const inst = institutionService.getSettings();
  const logoDataUrl = await resolveAssetAsDataUrl(inst.logoUrl || '/logo.jpg');
  const pageBlocks = buildBlankRegistrationFormPagesHtml(logoDataUrl, language);
  const dateStr = new Date().toISOString().split('T')[0];
  await renderPagesHtmlToA4Pdf(
    pageBlocks,
    `Student_Registration_Blank_Form_${dateStr}.pdf`,
    language,
    onProgress,
    { enforceFullPageHeight: false }
  );
}

export async function printBlankRegistrationForm(
  language: Language = 'km'
): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  const inst = institutionService.getSettings();
  const logoDataUrl = await resolveAssetAsDataUrl(inst.logoUrl || '/logo.jpg');
  const pageBlocks = buildBlankRegistrationFormPagesHtml(logoDataUrl, language);
  const wrappedPages = pageBlocks
    .map((p) => `<div class="a4-sheet-page">${p}</div>`)
    .join('\n');
  const fullHtml = wrapStandaloneA4Html(
    'ពាក្យសុំចុះឈ្មោះចូលរៀន • 學生入學申請登記表 • Student Registration Form',
    wrappedPages
  );
  return printHtmlInHiddenIframe(fullHtml);
}

// ============================================================================
// PART 2: INDIVIDUAL STUDENT INFORMATION SHEET (ព័ត៌មានសិស្សម្នាក់ៗ)
// ============================================================================

function filledFieldCell(
  labelKm: string,
  labelSub: string,
  valueText: string,
  colSpan: number = 1,
  emphasize: boolean = false
): string {
  const displayVal = valueText && valueText.trim() ? escapeHtml(valueText.trim()) : '-';
  return `
    <td colspan="${colSpan}" style="border: 1px solid #1e293b; padding: 4.5px 7px; vertical-align: middle; background: #ffffff;">
      <div style="font-size: 10.5px; font-weight: 700; color: #475569; line-height: 1.25;">
        <span>${escapeHtml(labelKm)}</span>
        <span style="font-weight: 600; font-size: 9.5px; color: #64748b; margin-left: 3px;">${escapeHtml(labelSub)}</span>
      </div>
      <div style="font-size: ${emphasize ? '13px' : '12.5px'}; font-weight: ${emphasize ? '800' : '600'}; color: #000000; margin-top: 2px; line-height: 1.32; word-break: break-word;">
        ${displayVal}
      </div>
    </td>
  `;
}

export function buildIndividualStudentPageHtml(
  item: NumberedStudentItem,
  options: {
    logoDataUrl: string;
    studentPhotoDataUrl?: string;
    reportDateDot?: string;
  }
): string {
  const { student: s, sequenceNo, schoolMajorNo } = item;
  const inst = institutionService.getSettings();
  const schoolNameKm = inst.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ';
  const schoolNameZh = inst.nameZh || '日興國際學校';
  const schoolNameEn = inst.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL';
  const currentDateDot = options.reportDateDot || formatCurrentReportDateDot();

  const effectiveDocs = getEffectiveStudentDocuments(s) || {};
  const docValidation = areAllRequiredDocumentsUploaded(effectiveDocs);
  const photoUrl = options.studentPhotoDataUrl || getStudentPhotoDataUrl(s);

  const studentAge = s.age !== undefined && s.age !== ''
    ? String(s.age)
    : (calculateAge(s.dob)?.toString() || '');
  const fatherAge = s.fatherAge !== undefined && s.fatherAge !== ''
    ? String(s.fatherAge)
    : (calculateAge(s.fatherDob)?.toString() || '');
  const motherAge = s.motherAge !== undefined && s.motherAge !== ''
    ? String(s.motherAge)
    : (calculateAge(s.motherDob)?.toString() || '');

  const genderTrilingual =
    s.gender === 'Female'
      ? 'ស្រី / 女 / Female (F)'
      : s.gender === 'Male'
      ? 'ប្រុស / 男 / Male (M)'
      : 'ផ្សេងៗ / 其他 / Other';

  const schoolTrans = getSchoolTranslation(s.targetSchool);
  const schoolDisplay = s.targetSchool
    ? [
        s.targetSchool,
        schoolTrans?.km ? `(${schoolTrans.km})` : '',
        schoolTrans?.en ? `- ${schoolTrans.en}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    : '-';

  const majorTrans = getMajorTranslation(s.major);
  const majorDisplay = s.major
    ? [
        s.major,
        majorTrans?.km ? `(${majorTrans.km})` : '',
        majorTrans?.en ? `- ${majorTrans.en}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    : '-';

  const cleanNotes = stripCloudEnvelopeFromNotes(s.notes);
  const regDateStr = s.createdAt ? formatDobOnly(s.createdAt) : currentDateDot;

  const checklistItems: Array<{ label: string; count: number; req?: boolean }> = [
    { label: 'រូបថតសិស្ស (學生照片 / Photo)', count: photoUrl ? Math.max(1, getDocPages(effectiveDocs.photo).length) : 0 },
    { label: 'អត្តសញ្ញាបណ្ណ * (身分證 / ID Card)', count: getDocPages(effectiveDocs.idCard).length, req: true },
    { label: 'សំបុត្រកំណើត * (出生證明 / Birth Cert)', count: getDocPages(effectiveDocs.birthCert).length, req: true },
    { label: 'សៀវភៅគ្រួសារ * (戶口名簿 / Family Book)', count: getDocPages(effectiveDocs.familyBook).length, req: true },
    { label: 'សៀវភៅស្នាក់នៅ * (居住證明 / Residence Book)', count: getDocPages(effectiveDocs.residenceBook).length, req: true },
    { label: 'សញ្ញាបត្រមធ្យមសិក្សា * (畢業證書 / Diploma)', count: getDocPages(effectiveDocs.academicCert).length, req: true },
    { label: 'សៀវភៅសិក្ខាគារិក * (學員手冊 / Trainee Book)', count: getDocPages(effectiveDocs.traineeBook).length, req: true },
    { label: 'លិខិតឆ្លងដែន (護照 / Passport)', count: getDocPages(effectiveDocs.passport).length },
  ];

  const checklistHtml = checklistItems
    .map(c => {
      const checked = c.count > 0;
      const symbol = checked ? '☑' : '☐';
      const statusBadge = checked
        ? `<span style="color: #047857; font-weight: 700;">(${c.count} ទំព័រ/P)</span>`
        : `<span style="color: ${c.req ? '#b91c1c' : '#64748b'};">${c.req ? '(ខ្វះ/未附)' : '(គ្មាន/無)'}</span>`;
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 2px 4px; border-bottom: 1px dashed #e2e8f0;">
          <span><strong>${symbol}</strong> ${escapeHtml(c.label)}</span>
          ${statusBadge}
        </div>
      `;
    })
    .join('');

  const photoBoxContent =
    photoUrl && isValidDataUrl(photoUrl)
      ? `<img src="${escapeHtml(photoUrl)}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover;" />`
      : `
        <div style="padding: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #334155;">រូបថតសិស្ស</div>
          <div style="font-family: 'DFKai-SB', 'BiauKai', serif; font-size: 11px; color: #475569; margin-top: 2px;">學生相片</div>
          <div style="font-family: 'Times New Roman', serif; font-size: 9.5px; color: #64748b; margin-top: 2px;">Photo 4 × 6</div>
        </div>
      `;

  return `
    <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1085px; color: #000000;">
      <div>
        <!-- Official Trilingual Header + Student 4x6 Portrait -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 8px;">
          <!-- Left: School Logo & Name (Equal-width 1fr flex wrapper so Center sits at true 50% page center) -->
          <div style="flex: 1 1 0%; min-width: 0; display: flex; align-items: center; justify-content: flex-start; gap: 7px; padding-top: 6px;">
            <div style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid #1e1b4b; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
              <img src="${escapeHtml(options.logoDataUrl)}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 900; color: #0f172a; line-height: 1.28; white-space: nowrap;">${escapeHtml(schoolNameKm)}</div>
              <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12.5px; font-weight: 700; color: #1e1b4b; line-height: 1.22; white-space: nowrap;">${escapeHtml(schoolNameZh)}</div>
              <div style="font-family: 'Times New Roman', serif; font-size: 8.8px; font-weight: 700; color: #334155; text-transform: uppercase; white-space: nowrap; line-height: 1.22;">${escapeHtml(schoolNameEn)}</div>
            </div>
          </div>

          <!-- Center: National Motto & Individual Student Report Title (Exact Horizontal Center of A4 Page) -->
          <div style="flex: 0 0 auto; text-align: center; padding: 0 8px;">
            <div style="font-size: 15px; font-weight: 900; color: #000000; line-height: 1.25;">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.25;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 1px;">柬埔寨王國 • 民族 宗教 國王</div>
            <div style="font-family: 'Times New Roman', serif; font-size: 9px; font-weight: 700; color: #334155; letter-spacing: 0.4px; text-transform: uppercase;">KINGDOM OF CAMBODIA • NATION RELIGION KING</div>

            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #cbd5e1;">
              <div style="font-size: 15px; font-weight: 900; color: #0f172a; line-height: 1.25;">របាយការណ៍ព័ត៌មានលម្អិតសិស្សម្នាក់ៗ</div>
              <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 13px; font-weight: 700; color: #1e1b4b; line-height: 1.2;">學生個人詳細資料表</div>
              <div style="font-family: 'Times New Roman', serif; font-size: 10px; font-weight: 700; color: #1e293b; letter-spacing: 0.4px;">INDIVIDUAL STUDENT INFORMATION REPORT</div>
            </div>
          </div>

          <!-- Right: Student 4x6 Portrait Photo (Equal-width 1fr flex wrapper aligned right) -->
          <div style="flex: 1 1 0%; min-width: 0; display: flex; justify-content: flex-end;">
            <div style="width: 102px; height: 128px; border: 1.5px solid #0f172a; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc; flex-shrink: 0;">
              ${photoBoxContent}
            </div>
          </div>
        </div>

        <!-- Sequence & Registration Metadata Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; line-height: 1.3; margin-bottom: 7px; padding: 4.5px 10px; background: #f8fafc; border: 1px solid #1e293b;">
          <div>
            <strong>លេខរៀងរួម (總序號 / Seq.):</strong>
            <span style="font-family: Arial, sans-serif; font-weight: 800; color: #701014; margin-left: 4px;">#${sequenceNo}</span>
          </div>
          <div>
            <strong>ល.រ សាលា/ជំនាញ (編號 / No.):</strong>
            <span style="font-family: Arial, sans-serif; font-weight: 800; color: #047857; margin-left: 4px;">#${schoolMajorNo}</span>
          </div>
          <div>
            <strong>ថ្ងៃចុះឈ្មោះ (登記日 / Reg.):</strong>
            <span style="font-family: 'Times New Roman', serif; font-weight: 700; margin-left: 3px;">${escapeHtml(regDateStr)}</span>
          </div>
          <div>
            <strong>ថ្ងៃបោះពុម្ព (列印日 / Printed):</strong>
            <span style="font-family: 'Times New Roman', serif; font-weight: 700; margin-left: 3px;">${escapeHtml(currentDateDot)}</span>
          </div>
        </div>

        <!-- SECTION 1: PERSONAL & CONTACT INFORMATION -->
        <div style="margin-bottom: 7px;">
          <div style="background: #701014; color: #ffffff; min-height: 27px; padding: 5px 10px; font-size: 12px; font-weight: 700; line-height: 1.45; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span>១. ព័ត៌មានផ្ទាល់ខ្លួន និងទំនាក់ទំនង • 個人基本與聯絡資料 • 1. Personal &amp; Contact Information</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr>
                ${filledFieldCell('ឈ្មោះខ្មែរ', '高棉姓名 / Khmer Name', s.nameKhmer || s.name || '-', 1, true)}
                ${filledFieldCell('ឈ្មោះឡាតាំង', '英文姓名 / Latin Name', (s.nameLatin || '').toUpperCase(), 1, true)}
                ${filledFieldCell('ឈ្មោះភាសាចិន', '中文姓名 / Chinese Name', s.nameChinese || '-', 1, true)}
              </tr>
              <tr>
                ${filledFieldCell('ភេទ', '性別 / Gender', genderTrilingual)}
                ${filledFieldCell('ថ្ងៃខែឆ្នាំកំណើត', '出生日期 / Date of Birth', formatDobDot(s.dob) || formatDobOnly(s.dob) || '-')}
                ${filledFieldCell('អាយុ', '年齡 / Age', studentAge ? `${studentAge} ឆ្នាំ / 歲 / yrs` : '-')}
              </tr>
              <tr>
                ${filledFieldCell('ទីកន្លែងកំណើត', '出生地點 / Place of Birth', s.placeOfBirth || '-', 2)}
                ${filledFieldCell('ឈ្មោះអ្នកណែនាំ', '推薦人 / Referrer', s.referrerName || '-')}
              </tr>
              <tr>
                ${filledFieldCell('លេខអត្តសញ្ញាបណ្ណ', '身分證號碼 / ID Card No.', s.idCardNumber || '-')}
                ${filledFieldCell('លេខលិខិតឆ្លងដែន', '護照號碼 / Passport No.', s.passportNumber || '-')}
                ${filledFieldCell('លេខទូរស័ព្ទសិស្ស', '聯絡電話 / Phone', s.phone || '-', 1, true)}
              </tr>
              <tr>
                ${filledFieldCell('អ៊ីមែលសិស្ស', '電子郵件 / E-mail', s.email || '-')}
                ${filledFieldCell('អាសយដ្ឋានបច្ចុប្បន្ន', '現居地址 / Current Address', s.currentAddress || '-', 2)}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION 2: PARENTS INFORMATION -->
        <div style="margin-bottom: 7px;">
          <div style="background: #701014; color: #ffffff; min-height: 27px; padding: 5px 10px; font-size: 12px; font-weight: 700; line-height: 1.45; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span>២. ព័ត៌មានឪពុក និង ម្ដាយ • 父母親資料 • 2. Parents Information</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr>
                ${filledFieldCell('ឈ្មោះឪពុក (អង់គ្លេស)', '父親英文名 / Father Name', s.fatherNameEnglish || '-')}
                ${filledFieldCell('ឈ្មោះឪពុក (ចិន)', '父親中文名 / Chinese', s.fatherNameChinese || '-')}
                ${filledFieldCell(
                  'ថ្ងៃកំណើត និង អាយុឪពុក',
                  '父親生日年齡 / DOB & Age',
                  `${formatDobDot(s.fatherDob) || formatDobOnly(s.fatherDob) || '-'}${fatherAge ? ` (${fatherAge} ឆ្នាំ)` : ''}`
                )}
                ${filledFieldCell('ទូរស័ព្ទឪពុក', '父親電話 / Father Phone', s.fatherPhone || '-')}
              </tr>
              <tr>
                ${filledFieldCell('ឈ្មោះម្ដាយ (អង់គ្លេស)', '母親英文名 / Mother Name', s.motherNameEnglish || '-')}
                ${filledFieldCell('ឈ្មោះម្ដាយ (ចិន)', '母親中文名 / Chinese', s.motherNameChinese || '-')}
                ${filledFieldCell(
                  'ថ្ងៃកំណើត និង អាយុម្ដាយ',
                  '母親生日年齡 / DOB & Age',
                  `${formatDobDot(s.motherDob) || formatDobOnly(s.motherDob) || '-'}${motherAge ? ` (${motherAge} ឆ្នាំ)` : ''}`
                )}
                ${filledFieldCell('ទូរស័ព្ទម្ដាយ', '母親電話 / Mother Phone', s.motherPhone || '-')}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION 3: ACADEMIC & SELECTED SCHOOL -->
        <div style="margin-bottom: 7px;">
          <div style="background: #701014; color: #ffffff; min-height: 27px; padding: 5px 10px; font-size: 12px; font-weight: 700; line-height: 1.45; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span>៣. ព័ត៌មានការសិក្សា និងសាលារៀនជ្រើសរើស • 學歷與選讀學校科系 • 3. Academic &amp; Selected School</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr>
                ${filledFieldCell('សាលារៀននៅកម្ពុជា', '在柬學校 / Previous School', s.previousSchoolKhmer || '-')}
                ${filledFieldCell('អាសយដ្ឋានសាលានៅកម្ពុជា', '在柬學校地址 / School Address', s.previousSchoolAddressKhmer || '-')}
              </tr>
              <tr>
                ${filledFieldCell('សាលាដែលជ្រើសរើសសិក្សា', '選讀學校 / Selected School', schoolDisplay, 1, true)}
                ${filledFieldCell('ជំនាញដែលជ្រើសរើសសិក្សា', '選讀科系 / Selected Major', majorDisplay, 1, true)}
              </tr>
              <tr>
                ${filledFieldCell('កំណត់សម្គាល់បន្ថែម', '備註說明 / Remarks & Notes', cleanNotes || '-', 2)}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION 4: ATTACHED DOCUMENTS STATUS -->
        <div style="margin-bottom: 6px;">
          <div style="background: #1e293b; color: #ffffff; min-height: 26px; padding: 5px 10px; font-size: 11.5px; font-weight: 700; line-height: 1.45; display: flex; align-items: center; justify-content: center; gap: 12px; text-align: center;">
            <span>៤. ស្ថានភាពឯកសារភ្ជាប់ • 附件上傳狀態 • 4. Attached Documents Status</span>
            <span>(ឯកសារចាំបាច់៖ ${docValidation.completedCount} / ${docValidation.totalRequired} *)</span>
          </div>
          <div style="border: 1px solid #1e293b; border-top: none; padding: 5px 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 3px 14px; font-size: 10.5px; line-height: 1.3; color: #0f172a;">
            ${checklistHtml}
          </div>
        </div>
      </div>

      <!-- SECTION 5: OFFICIAL 3-LANGUAGE SIGNATURES -->
      <div style="padding-top: 8px; border-top: 1px dashed #64748b; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; text-align: center;">
        <div>
          <div style="font-size: 11.5px; color: #1e293b;">បានឃើញ និងពិនិត្យត្រឹមត្រូវ • 已審閱並核對無誤 • Seen &amp; Verified</div>
          <div style="font-size: 12.5px; font-weight: 700; color: #000000; margin-top: 3px;">
            ប្រធានការិយាល័យ / រដ្ឋបាល • 辦公室主任 / Head of Admin
          </div>
          <div style="height: 36px;"></div>
          <div style="font-size: 10.5px; color: #64748b;">
            ( ហត្ថលេខា និងត្រា / 簽名及蓋章 / Signature &amp; Stamp )
          </div>
        </div>

        <div>
          <div style="font-size: 11.5px; color: #1e293b;">រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២... • 金邊市</div>
          <div style="font-size: 12.5px; font-weight: 700; color: #000000; margin-top: 3px;">
            អ្នករៀបចំរបាយការណ៍ / សាមីខ្លួន • 報表編製人 / Prepared By
          </div>
          <div style="height: 36px;"></div>
          <div style="font-size: 10.5px; color: #64748b;">
            ( ហត្ថលេខា / 簽名 / Signature )
          </div>
        </div>
      </div>
    </div>
  `;
}

function normalizeNumberedItems(
  input: Student | Student[] | NumberedStudentItem | NumberedStudentItem[]
): NumberedStudentItem[] {
  const arr = Array.isArray(input) ? input : [input];
  if (arr.length === 0) return [];
  const first = arr[0] as any;
  if (first && typeof first === 'object' && 'student' in first && 'sequenceNo' in first) {
    return arr as NumberedStudentItem[];
  }
  return computeStudentNumbersList(arr as Student[]);
}

export async function saveIndividualStudentPDF(
  input: Student | Student[] | NumberedStudentItem | NumberedStudentItem[],
  language: Language = 'km',
  onProgress?: (status: string) => void
): Promise<void> {
  const items = normalizeNumberedItems(input);
  if (items.length === 0) return;

  const inst = institutionService.getSettings();
  const logoDataUrl = await resolveAssetAsDataUrl(inst.logoUrl || '/logo.jpg');
  const currentDateDot = formatCurrentReportDateDot();

  const pageBlocks: string[] = [];
  for (const item of items) {
    const rawPhoto = getStudentPhotoDataUrl(item.student);
    const resolvedPhoto = rawPhoto ? await resolveAssetAsDataUrl(rawPhoto) : undefined;
    pageBlocks.push(
      buildIndividualStudentPageHtml(item, {
        logoDataUrl,
        studentPhotoDataUrl: resolvedPhoto,
        reportDateDot: currentDateDot,
      })
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const filename =
    items.length === 1
      ? `[Seq.${items[0].sequenceNo}]_${getSafeStudentName(items[0].student)}_Student_Info_${dateStr}.pdf`
      : `Individual_Students_Profile_Report_${items.length}_${dateStr}.pdf`;

  await renderPagesHtmlToA4Pdf(pageBlocks, filename, language, onProgress);
}

export async function printIndividualStudentDocument(
  input: Student | Student[] | NumberedStudentItem | NumberedStudentItem[],
  _language: Language = 'km'
): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  const items = normalizeNumberedItems(input);
  if (items.length === 0) return { success: false, error: 'No student selected' };

  const inst = institutionService.getSettings();
  const logoDataUrl = await resolveAssetAsDataUrl(inst.logoUrl || '/logo.jpg');
  const currentDateDot = formatCurrentReportDateDot();

  const htmlPages: string[] = [];
  for (const item of items) {
    const rawPhoto = getStudentPhotoDataUrl(item.student);
    const resolvedPhoto = rawPhoto ? await resolveAssetAsDataUrl(rawPhoto) : undefined;
    const sheet = buildIndividualStudentPageHtml(item, {
      logoDataUrl,
      studentPhotoDataUrl: resolvedPhoto,
      reportDateDot: currentDateDot,
    });
    htmlPages.push(`<div class="a4-sheet-page">${sheet}</div>`);
  }

  const title =
    items.length === 1
      ? `${items[0].student.nameLatin || items[0].student.nameKhmer || 'Student'} - ព័ត៌មានសិស្សម្នាក់ៗ`
      : 'របាយការណ៍ព័ត៌មានសិស្សម្នាក់ៗ • Individual Student Reports';

  const fullHtml = wrapStandaloneA4Html(title, htmlPages.join('\n'));
  return printHtmlInHiddenIframe(fullHtml);
}
