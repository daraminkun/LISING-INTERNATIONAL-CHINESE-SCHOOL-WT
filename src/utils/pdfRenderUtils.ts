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

import { jsPDF } from 'jspdf';
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

export interface GeneratedPdfResult {
  blob: Blob;
  url: string;
  filename: string;
}

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

const cachedLogoDataUrls = new Map<string, string>();

export async function resolveImageAsDataUrl(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:')) return src;
  const cached = cachedLogoDataUrls.get(src);
  if (cached) return cached;

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
    if (dataUrl.startsWith('data:')) {
      cachedLogoDataUrls.set(src, dataUrl);
    }
    return dataUrl;
  } catch {
    if (src !== '/logo.jpg') {
      return resolveImageAsDataUrl('/logo.jpg');
    }
    return src;
  }
}

export function getResolvedLogoSync(src?: string): string {
  const target = src || '/logo.jpg';
  if (target.startsWith('data:')) return target;
  return cachedLogoDataUrls.get(target) || cachedLogoDataUrls.get('/logo.jpg') || target;
}

if (typeof window !== 'undefined') {
  void resolveImageAsDataUrl('/logo.jpg');
  const currentLogo = institutionService.getLogoUrl();
  if (currentLogo && currentLogo !== '/logo.jpg') {
    void resolveImageAsDataUrl(currentLogo);
  }
  institutionService.subscribe((settings) => {
    if (settings.logoUrl && !settings.logoUrl.startsWith('data:')) {
      void resolveImageAsDataUrl(settings.logoUrl);
    }
  });
}

/**
 * Isolates a cloned A4 page inside html2canvas's clone document from Tailwind CSS v4
 * stylesheets (`oklab`, `oklch`, `color-mix`) while preserving Google Fonts `<link>` tags.
 * Prevents html2canvas@1.4.1 color-parser crashes on both dev `<style>` and prod `<link>` bundles.
 */
export function isolateClonedPageForHtml2Canvas(
  clonedDoc: Document,
  clonedEl: HTMLElement,
  pageWidthPx: number
): void {
  const sheets = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
  for (const node of sheets) {
    if (node.tagName.toLowerCase() === 'link') {
      const href = (node.getAttribute('href') || '').toLowerCase();
      if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
        continue;
      }
    }
    node.parentNode?.removeChild(node);
  }

  if (clonedDoc.head) {
    const cleanReset = clonedDoc.createElement('style');
    cleanReset.textContent = `
      *, *::before, *::after {
        box-sizing: border-box;
        border-color: #000000;
        outline-color: transparent;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      h1, h2, h3, h4, h5, h6, p {
        margin: 0;
        padding: 0;
      }
      table {
        border-collapse: collapse;
      }
      img {
        display: block;
        max-width: 100%;
      }
      img[width="1"][height="1"],
      img[src^="data:image/gif;base64,R0lGODlhAQAB"] {
        display: inline !important;
        vertical-align: baseline !important;
        position: relative !important;
        top: -1px !important;
      }
    `;
    clonedDoc.head.appendChild(cleanReset);
  }

  if (clonedDoc.documentElement) {
    clonedDoc.documentElement.className = '';
    clonedDoc.documentElement.style.cssText =
      'margin:0 !important;padding:0 !important;background:#ffffff !important;color:#000000 !important;';
  }

  if (clonedDoc.body) {
    clonedDoc.body.className = '';
    clonedDoc.body.style.cssText =
      'margin:0 !important;padding:0 !important;background:#ffffff !important;color:#000000 !important;';
  }

  const parent = clonedEl.parentElement;
  if (parent && parent !== clonedDoc.body) {
    parent.className = '';
    parent.style.cssText = `position:static !important;left:0 !important;top:0 !important;margin:0 !important;padding:0 !important;width:${pageWidthPx}px !important;background:#ffffff !important;z-index:auto !important;transform:none !important;`;
  }

  const sanitizeInline = (el: HTMLElement) => {
    const rawCss = el.style?.cssText;
    if (
      rawCss &&
      (rawCss.includes('oklch') || rawCss.includes('oklab') || rawCss.includes('color-mix'))
    ) {
      el.style.cssText = rawCss.replace(/(?:color-mix|oklab|oklch)\([^;"]+\)/gi, '#0f172a');
    }
  };

  sanitizeInline(clonedEl);
  clonedEl.querySelectorAll('*').forEach((node) => sanitizeInline(node as HTMLElement));
}

/**
 * Renders a 794px A4 page element to an HTMLCanvasElement while skipping `#root`
 * and automatically falling back to scale 1.5 on memory-constrained mobile phones.
 */
export async function captureHtml2CanvasPage(
  pageEl: HTMLElement,
  pageWidthPx: number
): Promise<HTMLCanvasElement> {
  const runWithScale = (scale: number) =>
    html2canvas(pageEl, {
      scale,
      width: pageWidthPx,
      windowWidth: pageWidthPx,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (el) => el.id === 'root' || el.id === 'lising-direct-print-root',
      onclone: (clonedDoc, clonedEl) =>
        isolateClonedPageForHtml2Canvas(clonedDoc, clonedEl, pageWidthPx),
    });

  try {
    return await runWithScale(2);
  } catch (firstErr) {
    console.warn('Retrying html2canvas at mobile-safe scale 1.5:', firstErr);
    return await runWithScale(1.5);
  }
}

/**
 * Synchronous top-level `@media print` engine (zero window.open, zero sub-iframes).
 * Works across Desktop (Chrome, Edge, Safari, Firefox) and Mobile (Android Chrome Print Spooler,
 * iPhone/iPad Safari AirPrint) because `window.print()` is invoked synchronously inside the
 * user's tap/click gesture while keeping `#lising-direct-print-root` hidden on screen.
 */
export function triggerDirectPagePrint(
  printBodyHtml: string,
  pageMarginCss: string = '5mm 6mm'
): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof window.print !== 'function'
  ) {
    return Promise.resolve({
      success: false,
      fallbackNeeded: true,
      error: 'Print API unavailable',
    });
  }

  const styleId = 'lising-direct-print-style';
  const rootId = 'lising-direct-print-root';

  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    @media screen {
      #${rootId} {
        display: none !important;
      }
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: ${pageMarginCss};
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        line-height: normal !important;
        letter-spacing: normal !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#${rootId}) {
        display: none !important;
      }
      #${rootId} {
        display: block !important;
        position: static !important;
        width: 100% !important;
        max-width: 794px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: 'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', 'Noto Serif TC', 'Times New Roman', sans-serif !important;
        line-height: normal !important;
        letter-spacing: normal !important;
        overflow: visible !important;
      }
      #${rootId} .a4-sheet-page {
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid-page !important;
      }
      #${rootId} .a4-sheet-page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  `;

  let printRoot = document.getElementById(rootId) as HTMLDivElement | null;
  if (!printRoot) {
    printRoot = document.createElement('div');
    printRoot.id = rootId;
    document.body.appendChild(printRoot);
  }
  printRoot.innerHTML = printBodyHtml;

  let beforePrintFired = false;
  let afterPrintFired = false;
  let printMediaMatched = false;
  let windowBlurredOrHidden = false;
  const startTs = Date.now();
  let afterPrintElapsedMs = 0;

  const cleanupDom = () => {
    const existingRoot = document.getElementById(rootId);
    if (existingRoot && existingRoot.parentNode) {
      existingRoot.parentNode.removeChild(existingRoot);
    }
    const existingStyle = document.getElementById(styleId);
    if (existingStyle && existingStyle.parentNode) {
      existingStyle.parentNode.removeChild(existingStyle);
    }
  };

  const onBeforePrint = () => {
    beforePrintFired = true;
  };
  const onAfterPrint = () => {
    afterPrintFired = true;
    afterPrintElapsedMs = Date.now() - startTs;
    setTimeout(cleanupDom, 1800);
  };
  const onWindowBlur = () => {
    windowBlurredOrHidden = true;
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      windowBlurredOrHidden = true;
    }
  };

  const mql = typeof window.matchMedia === 'function' ? window.matchMedia('print') : null;
  const onMqlChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      printMediaMatched = true;
    }
  };

  window.addEventListener('beforeprint', onBeforePrint);
  window.addEventListener('afterprint', onAfterPrint, { once: true });
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (mql) {
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onMqlChange);
    } else if (typeof (mql as any).addListener === 'function') {
      (mql as any).addListener(onMqlChange);
    }
  }

  const detachTrackingListeners = () => {
    window.removeEventListener('beforeprint', onBeforePrint);
    window.removeEventListener('blur', onWindowBlur);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (mql) {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onMqlChange);
      } else if (typeof (mql as any).removeListener === 'function') {
        (mql as any).removeListener(onMqlChange);
      }
    }
  };

  let syncElapsedMs = 0;
  try {
    const t0 = Date.now();
    window.print();
    syncElapsedMs = Date.now() - t0;
  } catch (err: any) {
    detachTrackingListeners();
    window.removeEventListener('afterprint', onAfterPrint);
    cleanupDom();
    return Promise.resolve({
      success: false,
      fallbackNeeded: true,
      error: err?.message || 'window.print threw an error',
    });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      detachTrackingListeners();

      const anySignal =
        beforePrintFired || printMediaMatched || windowBlurredOrHidden || syncElapsedMs >= 140;
      const abortedInstantly =
        afterPrintFired &&
        afterPrintElapsedMs < 80 &&
        !windowBlurredOrHidden &&
        syncElapsedMs < 80;

      if (!anySignal || abortedInstantly) {
        window.removeEventListener('afterprint', onAfterPrint);
        cleanupDom();
        resolve({
          success: false,
          fallbackNeeded: true,
          error: 'Print dialog suppressed by browser or embedded frame',
        });
        return;
      }

      // Keep hidden #lising-direct-print-root mounted for async mobile print spoolers (Android / AirPrint)
      setTimeout(cleanupDom, 60000);
      resolve({ success: true });
    }, 260);
  });
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
            <div style="font-family: 'Times New Roman', Times, serif; font-size: 11.5px; font-weight: 700; color: #334155; letter-spacing: 0.4px; text-transform: uppercase; margin-top: 1px; white-space: nowrap;">
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
): Promise<GeneratedPdfResult> {
  onProgress?.(
    language === 'zh-TW'
      ? '正在準備 A4 直向三語報表 (14號字)...'
      : language === 'en'
      ? 'Preparing A4 Portrait trilingual report (Size 14)...'
      : 'កំពុងរៀបចំទិន្នន័យក្រដាសបញ្ឈរ A4 ៣ភាសា (Font ទំហំ ១៤)...'
  );

  if (typeof document !== 'undefined' && document.head) {
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
          <div style="display: flex; justify-content: center; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 10px; font-size: 11px; font-weight: 700; color: #334155; font-family: 'Battambang', 'Noto Serif TC', 'Times New Roman', sans-serif;">
            <span>ទំព័រទី ${pageIdx + 1} នៃ ${totalPages} • 第 ${pageIdx + 1} / ${totalPages} 頁 • Page ${pageIdx + 1} of ${totalPages}</span>
          </div>
        `
        }
      `;

      container.appendChild(pageEl);
      await new Promise(r => setTimeout(r, 60));

      const canvas = await captureHtml2CanvasPage(pageEl, PAGE_WIDTH_PX);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const canvasW = canvas.width;
      const canvasH = canvas.height;
      canvas.width = 1;
      canvas.height = 1;

      if (pageIdx > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Fit 794px -> 210mm 1:1, or scale down slightly only if content exceeded 297mm height
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

    onProgress?.(
      language === 'zh-TW'
        ? '正在下載 PDF 檔案...'
        : language === 'en'
        ? 'Downloading PDF...'
        : 'កំពុងទាញយកឯកសារ PDF...'
    );
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${filenamePrefix}_${dateStr}.pdf`;
    const pdfBlob = pdf.output('blob');
    const url = triggerSafeBlobDownload(pdfBlob, filename);
    return { blob: pdfBlob, url, filename };
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Cross-Browser & Mobile Direct Print Handler (Zero window.open, synchronous user gesture)
 */
export async function executePrintDocument(
  students: Student[],
  title: string,
  _language: Language = 'km'
): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  try {
    const inst = institutionService.getSettings();
    const schoolLogo = getResolvedLogoSync(inst.logoUrl || '/logo.jpg');
    const schoolNameKm = inst.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ';
    const schoolNameZh = inst.nameZh || '日興國際學校';
    const schoolNameEn = inst.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL';
    const currentDateDot = formatCurrentReportDateDot();
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

    const printBodyHtml = `
      <div style="color: #000000; background: #ffffff;">
        ${headerHtml}
        ${tableHtml}
        ${signaturesHtml}
      </div>
    `;

    return await triggerDirectPagePrint(printBodyHtml, '7mm 6mm');
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
