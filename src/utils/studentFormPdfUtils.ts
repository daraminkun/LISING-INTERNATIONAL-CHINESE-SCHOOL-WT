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

function sanitizeClonedDocumentOklch(clonedDoc: Document): void {
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
      margin: 6mm 6mm;
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
      padding: 10px 14px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .a4-sheet-page {
      page-break-after: always;
      break-after: page;
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

    const doc = iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve({ success: false, fallbackNeeded: true, error: 'Cannot access print frame' });
      return;
    }

    doc.open();
    doc.write(fullHtml);
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
            new Promise(r => setTimeout(r, 850)),
          ]);
        }
        win.focus();
        win.print();
        resolve({ success: true });
      } catch (e: any) {
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
}

async function renderPagesHtmlToA4Pdf(
  pageHtmlBlocks: string[],
  filename: string,
  language: Language = 'km',
  onProgress?: (status: string) => void
): Promise<void> {
  await waitForDocumentFonts();

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
      pageEl.style.minHeight = `${PAGE_MIN_HEIGHT_PX}px`;
      pageEl.style.padding = '14px 18px';
      pageEl.style.backgroundColor = '#ffffff';
      pageEl.style.color = '#000000';
      pageEl.style.fontFamily =
        "'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif";
      pageEl.style.boxSizing = 'border-box';
      pageEl.innerHTML = pageHtmlBlocks[i];

      container.appendChild(pageEl);
      await new Promise(r => setTimeout(r, 90));

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        width: PAGE_WIDTH_PX,
        windowWidth: PAGE_WIDTH_PX,
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

function squareCheckboxHtml(sizePx: number = 12.5, borderColor: string = '#0f172a'): string {
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
    `<div style="height: 21px; border-bottom: 1px dotted #475569; margin-top: 2px;"></div>`;

  return `
    <td colspan="${colSpan}" style="border: 1px solid #1e293b; padding: 3.5px 7px; vertical-align: top;">
      <div style="font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.25;">
        <span>${escapeHtml(labelKm)}</span>${reqHtml}
        <span style="font-weight: 600; font-size: 10px; color: #475569; margin-left: 4px;">${escapeHtml(labelSub)}</span>
      </div>
      ${innerLine}
    </td>
  `;
}

interface IndexedSchoolEntry {
  index: number;
  entry: SchoolMajorEntry;
  isUniversity: boolean;
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
  const headerLines = subText.length > 80 ? 28 : subText.length > 40 ? 15 : 0;
  const headerHeight = 42 + headerLines;
  const majors = item.entry.majors || [];
  if (majors.length === 0) {
    return headerHeight + 36;
  }
  let majorsHeight = 16;
  for (const maj of majors) {
    const mSub = getLocalizedMajorSubLabel(maj, language);
    const combinedLen = maj.length + mSub.length;
    majorsHeight += combinedLen > 72 ? 42 : combinedLen > 36 ? 31 : 20;
  }
  return headerHeight + majorsHeight + 12;
}

function renderSchoolChecklistCardHtml(item: IndexedSchoolEntry | undefined, language: Language): string {
  if (!item) {
    return `<td style="width: 50%; border: 1px solid transparent; padding: 0;"></td>`;
  }

  const { index, entry, isUniversity } = item;
  const schoolSubLabel = getLocalizedSchoolSubLabel(entry.school, language);
  const levelBadgeText = isUniversity
    ? language === 'en'
      ? 'University / College'
      : 'សាកលវិទ្យាល័យ/មហាវិទ្យាល័យ'
    : language === 'en'
    ? 'Vocational High School'
    : 'វិទ្យាល័យ';
  const levelBadgeColor = isUniversity ? '#1e3a8a' : '#701014';

  const majors = entry.majors || [];
  const majorsRowsHtml =
    majors.length > 0
      ? majors
          .map((maj) => {
            const majorSub = getLocalizedMajorSubLabel(maj, language);
            return `
              <div style="display: flex; align-items: flex-start; gap: 5px; padding: 1.5px 0; line-height: 1.25;">
                <span style="margin-top: 1.5px; display: inline-flex;">${squareCheckboxHtml(11.5, '#0f172a')}</span>
                <div style="font-size: 10.5px; color: #0f172a; word-break: break-word;">
                  <strong style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 11.5px; color: #000000;">${escapeHtml(maj)}</strong>
                  ${
                    majorSub
                      ? `<span style="color: #334155; font-size: 10px; margin-left: 3px;">(${escapeHtml(majorSub)})</span>`
                      : ''
                  }
                </div>
              </div>
            `;
          })
          .join('')
      : `
        <div style="display: flex; align-items: center; gap: 5px; padding: 2px 0; font-size: 10.5px; color: #334155;">
          ${squareCheckboxHtml(11.5, '#0f172a')}
          <span>មុខជំនាញ / 科系 / Major៖ .............................................</span>
        </div>
      `;

  return `
    <td style="width: 50%; border: 1px solid #1e293b; vertical-align: top; background: #ffffff; padding: 0;">
      <!-- School Checkbox Header -->
      <div style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; padding: 4px 6px;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 4px;">
          <div style="display: flex; align-items: flex-start; gap: 5px; min-width: 0;">
            <span style="margin-top: 2px; display: inline-flex;">${squareCheckboxHtml(13.5, '#701014')}</span>
            <div style="font-size: 11.5px; font-weight: 800; color: #000000; line-height: 1.25;">
              <span style="font-family: Arial, sans-serif; color: #701014; margin-right: 2px;">${index}.</span>
              <span style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12px;">${escapeHtml(entry.school)}</span>
            </div>
          </div>
          <span style="font-size: 8.5px; font-weight: 700; color: ${levelBadgeColor}; white-space: nowrap; flex-shrink: 0; padding-top: 1px;">
            ${escapeHtml(levelBadgeText)}
          </span>
        </div>
        ${
          schoolSubLabel
            ? `<div style="font-size: 9.8px; font-weight: 600; color: #334155; padding-left: 18.5px; margin-top: 1px; line-height: 1.22;">${escapeHtml(schoolSubLabel)}</div>`
            : ''
        }
      </div>

      <!-- Majors Checkboxes under this School -->
      <div style="padding: 3.5px 6px 4.5px 14px;">
        <div style="font-size: 9.2px; font-weight: 700; color: #64748b; margin-bottom: 1.5px;">
          ជ្រើសរើសមុខជំនាញ • 勾選科系 • Tick Major:
        </div>
        ${majorsRowsHtml}
      </div>
    </td>
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
  const indexedSchools: IndexedSchoolEntry[] = rawSchools.map((entry, idx) => ({
    index: idx + 1,
    entry,
    isUniversity: entry.school.includes('大學') || entry.school.includes('學院'),
  }));

  const highSchools = indexedSchools.filter((s) => !s.isUniversity);
  const universities = indexedSchools.filter((s) => s.isUniversity);

  type ChecklistBlock =
    | { kind: 'banner'; titleKm: string; titleZh: string; titleEn: string; bgColor: string; heightPx: number }
    | { kind: 'pair'; left: IndexedSchoolEntry; right?: IndexedSchoolEntry; heightPx: number }
    | { kind: 'other_box'; heightPx: number };

  const blocks: ChecklistBlock[] = [];

  const pushGroupBlocks = (
    items: IndexedSchoolEntry[],
    titleKm: string,
    titleZh: string,
    titleEn: string,
    bgColor: string
  ) => {
    if (items.length === 0) return;
    blocks.push({
      kind: 'banner',
      titleKm,
      titleZh,
      titleEn,
      bgColor,
      heightPx: 30,
    });
    for (let i = 0; i < items.length; i += 2) {
      const left = items[i];
      const right = items[i + 1];
      const rowHeight =
        Math.max(
          estimateSchoolChecklistCardHeightPx(left, language),
          right ? estimateSchoolChecklistCardHeightPx(right, language) : 0
        ) + 6;
      blocks.push({
        kind: 'pair',
        left,
        right,
        heightPx: rowHeight,
      });
    }
  };

  pushGroupBlocks(
    highSchools,
    `ផ្នែក ក៖ កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (${highSchools.length} សាលា • អាយុ ១៦–២២ ឆ្នាំ)`,
    '高中職學校',
    'Part A: Vocational High Schools (Age 16–22)',
    '#701014'
  );

  pushGroupBlocks(
    universities,
    `ផ្នែក ខ៖ កម្រិតមហាវិទ្យាល័យ និង សាកលវិទ្យាល័យ (${universities.length} សាលា • អាយុ ≤ ២៥ ឆ្នាំ)`,
    '大專院校與科技大學',
    'Part B: Universities & Colleges (Age ≤ 25)',
    '#1e293b'
  );

  blocks.push({ kind: 'other_box', heightPx: 88 });

  // Paginate checklist blocks cleanly within A4 Portrait body budget (855px)
  const MAX_CHECKLIST_BODY_PX = 855;
  const checklistPageChunks: ChecklistBlock[][] = [];
  let currentChunk: ChecklistBlock[] = [];
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const blk = blocks[i];
    // Avoid leaving a section banner orphaned at the very bottom of a page
    const nextBlkHeight =
      blk.kind === 'banner' && blocks[i + 1] ? blocks[i + 1].heightPx : 0;

    if (
      currentChunk.length > 0 &&
      currentHeight + blk.heightPx + nextBlkHeight > MAX_CHECKLIST_BODY_PX
    ) {
      checklistPageChunks.push(currentChunk);
      currentChunk = [];
      currentHeight = 0;
    }

    currentChunk.push(blk);
    currentHeight += blk.heightPx;
  }
  if (currentChunk.length > 0) {
    checklistPageChunks.push(currentChunk);
  }

  const totalPages = 1 + checklistPageChunks.length;

  const buildPageFooter = (pageNum: number) => `
    <div style="padding-top: 5px; margin-top: 6px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #475569;">
      <span>${escapeHtml(schoolNameKm)} (${escapeHtml(schoolNameZh)})</span>
      <span style="font-weight: 700; color: #0f172a;">ទំព័រទី ${pageNum} / ${totalPages} • 第 ${pageNum} / ${totalPages} 頁 • Page ${pageNum} of ${totalPages}</span>
    </div>
  `;

  // =========================================================================
  // PAGE 1: PERSONAL, PARENTS, PREVIOUS SCHOOL, DOCS CHECKLIST & SIGNATURES
  // =========================================================================
  const page1Html = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1085px; color: #000000;">
      <div>
        <!-- Official Header with 4x6 Photo Frame -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 7px; margin-bottom: 7px;">
          <!-- Left: School Logo & Name -->
          <div style="width: 245px; display: flex; align-items: center; gap: 8px; padding-top: 6px;">
            <div style="width: 54px; height: 54px; border-radius: 50%; border: 2px solid #1e1b4b; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
              <img src="${escapeHtml(schoolLogo)}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <div>
              <div style="font-size: 13.5px; font-weight: 900; color: #0f172a; line-height: 1.25;">${escapeHtml(schoolNameKm)}</div>
              <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 13px; font-weight: 700; color: #1e1b4b; line-height: 1.2;">${escapeHtml(schoolNameZh)}</div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5px; font-weight: 700; color: #334155; text-transform: uppercase;">${escapeHtml(schoolNameEn)}</div>
            </div>
          </div>

          <!-- Center: Trilingual Motto & Form Title -->
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 15.5px; font-weight: 900; color: #000000; line-height: 1.25;">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.25;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12.5px; font-weight: 700; color: #0f172a; margin-top: 1px;">柬埔寨王國 • 民族 宗教 國王</div>
            <div style="font-family: 'Times New Roman', serif; font-size: 9.5px; font-weight: 700; color: #334155; letter-spacing: 0.6px; text-transform: uppercase;">KINGDOM OF CAMBODIA • NATION RELIGION KING</div>

            <div style="margin-top: 7px; padding-top: 5px; border-top: 1px solid #cbd5e1;">
              <div style="font-size: 15.5px; font-weight: 900; color: #701014; line-height: 1.25;">ពាក្យសុំចុះឈ្មោះចូលរៀន (បំពេញដោយដៃ)</div>
              <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.2;">學生入學申請登記表 (手寫表格)</div>
              <div style="font-family: 'Times New Roman', serif; font-size: 10.5px; font-weight: 700; color: #1e293b; letter-spacing: 0.6px;">STUDENT REGISTRATION APPLICATION FORM</div>
            </div>
          </div>

          <!-- Right: 4x6 Student Photo Box -->
          <div style="width: 102px; height: 128px; border: 1.5px dashed #0f172a; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 6px; background: #fafafa; flex-shrink: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.3;">បិទរូបថត</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 11px; font-weight: 700; color: #334155; margin-top: 2px;">貼相片處</div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10px; font-weight: 700; color: #475569; margin-top: 2px;">Photo 4 × 6</div>
          </div>
        </div>

        <!-- Office Metadata Strip -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; margin-bottom: 6px; padding: 3px 8px; background: #f8fafc; border: 1px solid #cbd5e1;">
          <div>
            <strong>លេខរៀង (សម្រាប់រដ្ឋបាល / 編號 / Office No.):</strong>
            <span style="display: inline-block; width: 95px; border-bottom: 1px dotted #0f172a; margin-left: 4px;">&nbsp;</span>
          </div>
          <div>
            <strong>កាលបរិច្ឆេទដាក់ពាក្យ (申請日期 / Date):</strong>
            <span style="font-family: 'Times New Roman', serif; margin-left: 4px;">........ / ........ / 202....</span>
          </div>
        </div>

        <!-- SECTION 1: PERSONAL & CONTACT INFORMATION -->
        <div style="margin-bottom: 6px;">
          <div style="background: #701014; color: #ffffff; padding: 3.5px 8px; font-size: 12px; font-weight: 700;">
            ១. ព័ត៌មានផ្ទាល់ខ្លួន និងទំនាក់ទំនង • 個人基本與聯絡資料 • 1. Personal &amp; Contact Information
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
                  `<div style="height: 21px; display: flex; align-items: center; gap: 16px; font-size: 11.5px; margin-top: 2px;">
                    <span style="display: inline-flex; align-items: center; gap: 5px;">${squareCheckboxHtml(12)} ប្រុស / 男 / M</span>
                    <span style="display: inline-flex; align-items: center; gap: 5px;">${squareCheckboxHtml(12)} ស្រី / 女 / F</span>
                  </div>`
                )}
                ${blankFieldCell(
                  'ថ្ងៃខែឆ្នាំកំណើត',
                  '出生日期 / DOB',
                  true,
                  `<div style="height: 21px; display: flex; align-items: flex-end; font-family: 'Times New Roman', serif; font-size: 12px; color: #334155; margin-top: 2px;">
                    ........ / ........ / ................
                  </div>`
                )}
                ${blankFieldCell('អាយុ', '年齡 / Age', false)}
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
        <div style="margin-bottom: 6px;">
          <div style="background: #701014; color: #ffffff; padding: 3.5px 8px; font-size: 12px; font-weight: 700;">
            ២. ព័ត៌មានឪពុក និង ម្ដាយ • 父母親資料 • 2. Parents Information
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr style="background: #f8fafc;">
                <td colspan="4" style="border: 1px solid #1e293b; padding: 2px 7px; font-size: 10.8px; font-weight: 700; color: #1e1b4b;">
                  ▪ ព័ត៌មានឪពុក • 父親資料 • Father's Information
                </td>
              </tr>
              <tr>
                ${blankFieldCell('ឈ្មោះឪពុក (អង់គ្លេស/ខ្មែរ)', '父親英文姓名 / Father Name', true)}
                ${blankFieldCell('ឈ្មោះឪពុក (ភាសាចិន)', '父親中文姓名 / Chinese Name', false)}
                ${blankFieldCell(
                  'ថ្ងៃខែឆ្នាំកំណើត និង អាយុ',
                  '生日與年齡 / DOB & Age',
                  true,
                  `<div style="height: 21px; display: flex; align-items: flex-end; justify-content: space-between; font-size: 11px; color: #334155; margin-top: 2px;">
                    <span>....../....../..........</span>
                    <span>អាយុ: ........</span>
                  </div>`
                )}
                ${blankFieldCell('លេខទូរស័ព្ទឪពុក', '父親電話 / Father Phone', true)}
              </tr>
              <tr style="background: #f8fafc;">
                <td colspan="4" style="border: 1px solid #1e293b; padding: 2px 7px; font-size: 10.8px; font-weight: 700; color: #831843;">
                  ▪ ព័ត៌មានម្ដាយ • 母親資料 • Mother's Information
                </td>
              </tr>
              <tr>
                ${blankFieldCell('ឈ្មោះម្ដាយ (អង់គ្លេស/ខ្មែរ)', '母親英文姓名 / Mother Name', true)}
                ${blankFieldCell('ឈ្មោះម្ដាយ (ភាសាចិន)', '母親中文姓名 / Chinese Name', false)}
                ${blankFieldCell(
                  'ថ្ងៃខែឆ្នាំកំណើត និង អាយុ',
                  '生日與年齡 / DOB & Age',
                  true,
                  `<div style="height: 21px; display: flex; align-items: flex-end; justify-content: space-between; font-size: 11px; color: #334155; margin-top: 2px;">
                    <span>....../....../..........</span>
                    <span>អាយុ: ........</span>
                  </div>`
                )}
                ${blankFieldCell('លេខទូរស័ព្ទម្ដាយ', '母親電話 / Mother Phone', true)}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION 3: ACADEMIC & TARGET SCHOOL SUMMARY + CHECKLIST POINTER -->
        <div style="margin-bottom: 6px;">
          <div style="background: #701014; color: #ffffff; padding: 3.5px 8px; font-size: 12px; font-weight: 700;">
            ៣. ព័ត៌មានការសិក្សា និងការជ្រើសរើសសាលារៀន/មុខជំនាញ • 學歷與選讀學校科系 • 3. Academic &amp; School/Major Selection
          </div>
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tbody>
              <tr>
                ${blankFieldCell('ឈ្មោះសាលារៀននៅកម្ពុជា', '在柬就讀學校 / Previous School in Cambodia', true)}
                ${blankFieldCell('អាសយដ្ឋានសាលារៀននៅកម្ពុជា', '在柬學校地址 / School Address in Cambodia', true)}
              </tr>
              <tr style="background: #fffbeb;">
                <td colspan="2" style="border: 1px solid #1e293b; padding: 4.5px 8px; font-size: 10.8px; color: #701014; font-weight: 700; line-height: 1.35;">
                  <div>☞ សូមគូសធីកក្នុងប្រអប់ ${squareCheckboxHtml(11.5, '#701014')} ដើម្បីជ្រើសរើស «ឈ្មោះសាលារៀន» និង «មុខជំនាញ» នៅទំព័រទី ២ ដល់ទី ${totalPages} (សរុប ${indexedSchools.length} សាលា) រួចអាចសរសេរបញ្ជាក់សង្ខេបនៅខាងក្រោម៖</div>
                  <div style="font-size: 10px; color: #334155; font-weight: 600; margin-top: 1px;">
                    請於第 2 至 ${totalPages} 頁「學校與科系勾選表」勾選欲就讀之學校與科系 • Please tick your chosen school &amp; major on pages 2–${totalPages}.
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

        <!-- SECTION 4: REQUIRED DOCUMENTS CHECKLIST -->
        <div style="margin-bottom: 5px;">
          <div style="background: #1e293b; color: #ffffff; padding: 3.5px 8px; font-size: 11.5px; font-weight: 700;">
            ៤. បញ្ជីឯកសារភ្ជាប់មកជាមួយ • 必備證明文件核對清單 • 4. Attached Documents Checklist
          </div>
          <div style="border: 1px solid #1e293b; border-top: none; padding: 5px 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 3.5px 14px; font-size: 10.8px; color: #0f172a;">
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>១. រូបថតសិស្ស 4×6 (學生照片 / Student Photo)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>៥. សៀវភៅស្នាក់នៅ * (居住證明簿 / Residence Book)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>២. អត្តសញ្ញាបណ្ណ * (身分證 / National ID Card)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>៦. សញ្ញាបត្របឋមភូមិ ឬ ទុតិយភូមិ * (畢業證書 / Diploma)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>៣. សំបុត្រកំណើត * (出生證明書 / Birth Certificate)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>៧. សៀវភៅសិក្ខាគារិក * (學員紀錄手冊 / Trainee Book)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>៤. សៀវភៅគ្រួសារ * (戶口名簿 / Family Book)</span></div>
            <div style="display: flex; align-items: center; gap: 5px;">${squareCheckboxHtml(11.5)} <span>៨. លិខិតឆ្លងដែន (護照 / Passport - បើមាន)</span></div>
          </div>
        </div>
      </div>

      <!-- SECTION 5: SIGNATURES + PAGE 1 FOOTER -->
      <div>
        <div style="padding-top: 5px; border-top: 1px dashed #64748b; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center; font-size: 11px;">
          <div>
            <div style="font-weight: 700; color: #0f172a;">ហត្ថលេខាអាណាព្យាបាល</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', serif; color: #334155;">家長或監護人簽名 / Parent</div>
            <div style="height: 30px;"></div>
            <div style="border-bottom: 1px dotted #475569; width: 78%; margin: 0 auto 2px;"></div>
            <div style="font-size: 10px; color: #64748b;">ឈ្មោះ និងហត្ថលេខា / Name &amp; Sign</div>
          </div>
          <div>
            <div style="font-weight: 700; color: #0f172a;">ហត្ថលេខាសាមីខ្លួន (សិស្ស)</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', serif; color: #334155;">學生本人簽名 / Applicant</div>
            <div style="height: 30px;"></div>
            <div style="border-bottom: 1px dotted #475569; width: 78%; margin: 0 auto 2px;"></div>
            <div style="font-size: 10px; color: #64748b;">ឈ្មោះ និងហត្ថលេខា / Name &amp; Sign</div>
          </div>
          <div>
            <div style="font-weight: 700; color: #0f172a;">អ្នកទទួលពាក្យ / រដ្ឋបាល</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', serif; color: #334155;">行政收件審核 / Office Admin</div>
            <div style="height: 30px;"></div>
            <div style="border-bottom: 1px dotted #475569; width: 78%; margin: 0 auto 2px;"></div>
            <div style="font-size: 10px; color: #64748b;">ហត្ថលេខា និងត្រា / Sign &amp; Stamp</div>
          </div>
        </div>
        ${buildPageFooter(1)}
      </div>
    </div>
  `;

  // =========================================================================
  // PAGES 2..N: COMPLETE SCHOOL & MAJOR SELECTION CHECKLIST (គូសធីកជ្រើសរើស)
  // =========================================================================
  const checklistPagesHtml = checklistPageChunks.map((chunk, chunkIdx) => {
    const pageNumber = chunkIdx + 2;

    const rowsHtml = chunk
      .map((blk) => {
        if (blk.kind === 'banner') {
          return `
            <div style="background: ${blk.bgColor}; color: #ffffff; padding: 4px 8px; margin-top: 4px; margin-bottom: 4px; font-size: 11.5px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
              <span>${escapeHtml(blk.titleKm)}</span>
              <span style="font-size: 10.5px; font-weight: 600;">${escapeHtml(blk.titleZh)} • ${escapeHtml(blk.titleEn)}</span>
            </div>
          `;
        }
        if (blk.kind === 'pair') {
          return `
            <table style="width: 100%; border-collapse: separate; border-spacing: 5px 0; table-layout: fixed; margin-bottom: 5px;">
              <tbody>
                <tr>
                  ${renderSchoolChecklistCardHtml(blk.left, language)}
                  ${renderSchoolChecklistCardHtml(blk.right, language)}
                </tr>
              </tbody>
            </table>
          `;
        }
        return `
          <div style="margin-top: 6px; border: 1.5px solid #1e293b; background: #f8fafc; padding: 6px 9px;">
            <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 5px;">
              ▪ សាលារៀន ឬ មុខជំនាញផ្សេងទៀត (ប្រសិនបើមិនមានក្នុងបញ្ជីខាងលើ) • 其他學校或科系 • Other School / Major:
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; color: #0f172a; margin-bottom: 7px;">
              <div style="display: flex; align-items: center; gap: 5px;">
                ${squareCheckboxHtml(12, '#701014')}
                <span>ឈ្មោះសាលា / 學校 / School៖</span>
                <span style="flex: 1; border-bottom: 1px dotted #334155; height: 15px;">&nbsp;</span>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                ${squareCheckboxHtml(12, '#0f172a')}
                <span>មុខជំនាញ / 科系 / Major៖</span>
                <span style="flex: 1; border-bottom: 1px dotted #334155; height: 15px;">&nbsp;</span>
              </div>
            </div>
            <div style="padding-top: 5px; border-top: 1px dashed #94a3b8; display: flex; justify-content: space-between; align-items: center; gap: 14px; font-size: 10.8px; color: #1e293b;">
              <div style="flex: 1; display: flex; align-items: center; gap: 4px;">
                <strong>ឈ្មោះសិស្ស (學生姓名 / Student Name):</strong>
                <span style="flex: 1; border-bottom: 1px dotted #334155; height: 15px;">&nbsp;</span>
              </div>
              <div style="width: 240px; display: flex; align-items: center; gap: 4px;">
                <strong>ហត្ថលេខា (簽名 / Sign):</strong>
                <span style="flex: 1; border-bottom: 1px dotted #334155; height: 15px;">&nbsp;</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1085px; color: #000000;">
        <div>
          <!-- Compact Running Checklist Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #1e1b4b; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="${escapeHtml(schoolLogo)}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
              <div>
                <div style="font-size: 13.5px; font-weight: 900; color: #701014; line-height: 1.2;">
                  ៣-ក. តារាងគូសធីកជ្រើសរើសសាលារៀន និងមុខជំនាញនីមួយៗ
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.25;">
                  選讀學校與專業科系勾選表 • Target School &amp; Major Selection Checklist
                </div>
              </div>
            </div>

            <div style="text-align: right; font-size: 10.5px; color: #1e293b; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px; padding: 3.5px 8px;">
              <div style="font-weight: 700; color: #701014;">
                សូមគូសធីក ☑ ឈ្មោះសាលា ១ និង ☑ មុខជំនាញ ១
              </div>
              <div style="font-size: 9.5px; color: #475569;">
                請勾選 ☑ 所選學校及科系 • Tick ☑ Chosen School &amp; Major
              </div>
            </div>
          </div>

          ${rowsHtml}
        </div>

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
    onProgress
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
    <td colspan="${colSpan}" style="border: 1px solid #1e293b; padding: 4.5px 7px; vertical-align: top; background: #ffffff;">
      <div style="font-size: 10.5px; font-weight: 700; color: #475569; line-height: 1.2;">
        <span>${escapeHtml(labelKm)}</span>
        <span style="font-weight: 600; font-size: 9.5px; color: #64748b; margin-left: 3px;">${escapeHtml(labelSub)}</span>
      </div>
      <div style="font-size: ${emphasize ? '13px' : '12.5px'}; font-weight: ${emphasize ? '800' : '600'}; color: #000000; margin-top: 2px; line-height: 1.3; word-break: break-word;">
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
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 8px;">
          <!-- Left: School Logo & Name -->
          <div style="width: 245px; display: flex; align-items: center; gap: 8px; padding-top: 6px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid #1e1b4b; overflow: hidden; background: #ffffff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
              <img src="${escapeHtml(options.logoDataUrl)}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <div>
              <div style="font-size: 13.5px; font-weight: 900; color: #0f172a; line-height: 1.25;">${escapeHtml(schoolNameKm)}</div>
              <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 13px; font-weight: 700; color: #1e1b4b; line-height: 1.2;">${escapeHtml(schoolNameZh)}</div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5px; font-weight: 700; color: #334155; text-transform: uppercase;">${escapeHtml(schoolNameEn)}</div>
            </div>
          </div>

          <!-- Center: National Motto & Individual Student Report Title -->
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 15.5px; font-weight: 900; color: #000000; line-height: 1.25;">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.25;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 12.5px; font-weight: 700; color: #0f172a; margin-top: 1px;">柬埔寨王國 • 民族 宗教 國王</div>
            <div style="font-family: 'Times New Roman', serif; font-size: 9.5px; font-weight: 700; color: #334155; letter-spacing: 0.6px; text-transform: uppercase;">KINGDOM OF CAMBODIA • NATION RELIGION KING</div>

            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #cbd5e1;">
              <div style="font-size: 15.5px; font-weight: 900; color: #0f172a; line-height: 1.25;">របាយការណ៍ព័ត៌មានលម្អិតសិស្សម្នាក់ៗ</div>
              <div style="font-family: 'DFKai-SB', 'BiauKai', 'Noto Serif TC', serif; font-size: 13.5px; font-weight: 700; color: #1e1b4b; line-height: 1.2;">學生個人詳細資料表</div>
              <div style="font-family: 'Times New Roman', serif; font-size: 10.5px; font-weight: 700; color: #1e293b; letter-spacing: 0.6px;">INDIVIDUAL STUDENT INFORMATION REPORT</div>
            </div>
          </div>

          <!-- Right: Student 4x6 Portrait Photo -->
          <div style="width: 102px; height: 128px; border: 1.5px solid #0f172a; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc; flex-shrink: 0;">
            ${photoBoxContent}
          </div>
        </div>

        <!-- Sequence & Registration Metadata Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; margin-bottom: 7px; padding: 4px 10px; background: #f8fafc; border: 1px solid #1e293b;">
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
          <div style="background: #701014; color: #ffffff; padding: 3.5px 8px; font-size: 12px; font-weight: 700;">
            ១. ព័ត៌មានផ្ទាល់ខ្លួន និងទំនាក់ទំនង • 個人基本與聯絡資料 • 1. Personal &amp; Contact Information
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
          <div style="background: #701014; color: #ffffff; padding: 3.5px 8px; font-size: 12px; font-weight: 700;">
            ២. ព័ត៌មានឪពុក និង ម្ដាយ • 父母親資料 • 2. Parents Information
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
          <div style="background: #701014; color: #ffffff; padding: 3.5px 8px; font-size: 12px; font-weight: 700;">
            ៣. ព័ត៌មានការសិក្សា និងសាលារៀនជ្រើសរើស • 學歷與選讀學校科系 • 3. Academic &amp; Selected School
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
          <div style="background: #1e293b; color: #ffffff; padding: 3.5px 8px; font-size: 11.5px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
            <span>៤. ស្ថានភាពឯកសារភ្ជាប់ • 附件上傳狀態 • 4. Attached Documents Status</span>
            <span>ឯកសារចាំបាច់៖ ${docValidation.completedCount} / ${docValidation.totalRequired} *</span>
          </div>
          <div style="border: 1px solid #1e293b; border-top: none; padding: 5px 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px 14px; font-size: 10.5px; color: #0f172a;">
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
