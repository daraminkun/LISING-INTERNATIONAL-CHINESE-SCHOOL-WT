import { Student, StudentDocuments, UploadedDocument, DocumentKey } from '../types';
import { getDocPages } from './documentUtils';

export const CLOUD_ENVELOPE_MARKER = '@@SMS_CLOUD_V1@@';

// Google Sheets enforces a strict 50,000-character limit per cell.
// Keep total packed cell content comfortably below 48,000 chars.
const MAX_SHEETS_NOTES_CELL_CHARS = 47800;
const MAX_SHEETS_DOCS_COLUMN_CHARS = 45000;

export const ALL_DOCUMENT_KEYS: DocumentKey[] = [
  'idCard',
  'birthCert',
  'familyBook',
  'residenceBook',
  'academicCert',
  'traineeBook',
  'passport',
];

interface CompactDocPage {
  n: string;   // name
  s?: number;  // size
  t?: string;  // MIME type
  u?: string;  // uploadedAt
  p?: number;  // pageNumber
  d?: string;  // compact dataUrl
}

interface CloudSyncEnvelopeV1 {
  v: 1;
  m?: {
    r?: string;  // referrerName
    pa?: string; // previousSchoolAddressKhmer
    em?: string; // email
    ag?: string | number; // age
    fa?: string | number; // fatherAge
    ma?: string | number; // motherAge
  };
  d?: Partial<Record<DocumentKey, CompactDocPage[]>>;
}

/**
 * Checks whether a dataUrl is a real renderable/downloadable URL (not a placeholder).
 */
export function isValidDataUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url === 'STORED_IN_INDEXEDDB') return false;
  return (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:')
  );
}

/**
 * Strips any embedded cloud sync envelope from a student's notes string
 * so internal sync payloads never appear in UI, exports, or printouts.
 */
export function stripCloudEnvelopeFromNotes(notes?: string): string {
  if (!notes) return '';
  const idx = notes.indexOf(CLOUD_ENVELOPE_MARKER);
  if (idx === -1) return notes;
  return notes.slice(0, idx).replace(/\n+$/, '');
}

/**
 * Reads a File/Blob into a Base64 Data URL.
 */
export function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Optimizes an uploaded document image at selection time to crisp HD document grade
 * (max 1600px, WebP/JPEG) so multi-megabyte phone camera photos upload fast and cleanly
 * while keeping small text, dates, and ID numbers sharp.
 * Non-image files (such as PDFs) are returned untouched as full Data URLs.
 */
export async function compressUploadedDocumentFile(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.84
): Promise<{ dataUrl: string; mimeType: string }> {
  const isImage =
    file.type.startsWith('image/') ||
    /\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name);

  if (!isImage || file.type === 'image/svg+xml') {
    const rawUrl = await readBlobAsDataUrl(file);
    return {
      dataUrl: rawUrl,
      mimeType: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Unsupported image format'));
      el.src = objectUrl;
    });

    const srcW = img.naturalWidth || img.width || 1200;
    const srcH = img.naturalHeight || img.height || 1200;
    const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
    const targetW = Math.max(1, Math.round(srcW * scale));
    const targetH = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const rawUrl = await readBlobAsDataUrl(file);
      return { dataUrl: rawUrl, mimeType: file.type || 'image/jpeg' };
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const webp = canvas.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) {
      return { dataUrl: webp, mimeType: 'image/webp' };
    }

    const jpeg = canvas.toDataURL('image/jpeg', quality);
    return { dataUrl: jpeg, mimeType: 'image/jpeg' };
  } catch {
    const rawUrl = await readBlobAsDataUrl(file);
    return { dataUrl: rawUrl, mimeType: file.type || 'image/jpeg' };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Compresses an image Data URL to fit within a target character budget using
 * progressive resolution and quality tiers.
 */
async function compressImageDataUrlToCharBudget(
  dataUrl: string,
  maxChars: number
): Promise<string> {
  if (!isValidDataUrl(dataUrl) || !dataUrl.startsWith('data:image/')) {
    return dataUrl.length <= maxChars ? dataUrl : '';
  }

  if (dataUrl.length <= maxChars) {
    return dataUrl;
  }

  if (typeof document === 'undefined') {
    return '';
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image decode failed'));
      el.src = dataUrl;
    });

    const srcW = img.naturalWidth || img.width || 800;
    const srcH = img.naturalHeight || img.height || 800;

    const tiers = [
      { dim: 1000, q: 0.68 },
      { dim: 840, q: 0.60 },
      { dim: 720, q: 0.54 },
      { dim: 600, q: 0.48 },
      { dim: 500, q: 0.44 },
      { dim: 420, q: 0.40 },
      { dim: 340, q: 0.36 },
      { dim: 260, q: 0.32 },
      { dim: 200, q: 0.28 },
      { dim: 150, q: 0.24 },
    ];

    let smallestCandidate = '';

    for (const tier of tiers) {
      const scale = Math.min(1, tier.dim / Math.max(srcW, srcH));
      const w = Math.max(1, Math.round(srcW * scale));
      const h = Math.max(1, Math.round(srcH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      let encoded = canvas.toDataURL('image/webp', tier.q);
      if (!encoded.startsWith('data:image/webp')) {
        encoded = canvas.toDataURL('image/jpeg', tier.q);
      }

      smallestCandidate = encoded;
      if (encoded.length <= maxChars) {
        return encoded;
      }
    }

    return smallestCandidate.length <= maxChars ? smallestCandidate : '';
  } catch {
    return '';
  }
}

/**
 * Detects built-in demo/mock documents from mockStudents.ts so they never overwrite
 * or pollute real student documents in IndexedDB or Google Sheets.
 */
export function isMockStudentDocuments(docs?: StudentDocuments | null): boolean {
  if (!docs) return false;
  let totalPages = 0;
  let mockPages = 0;
  for (const key of ALL_DOCUMENT_KEYS) {
    const pages = getDocPages(docs[key]);
    for (const p of pages) {
      totalPages++;
      if (
        p.uploadedAt?.startsWith('2026-09-15T') ||
        p.dataUrl?.startsWith('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400"')
      ) {
        mockPages++;
      }
    }
  }
  return totalPages > 0 && mockPages === totalPages;
}

/**
 * Merges multiple StudentDocuments sources (e.g. IndexedDB HD cache + React state + Google Sheets cloud),
 * never allowing empty `{}` objects or `'STORED_IN_INDEXEDDB'` placeholders to overwrite real documents,
 * and preferring higher-resolution Data URLs when both local HD and cloud compact previews exist.
 */
export function mergeBestStudentDocuments(
  ...sources: (StudentDocuments | undefined | null)[]
): StudentDocuments | undefined {
  const merged: StudentDocuments = {};
  let hasAnyCategory = false;

  for (const key of ALL_DOCUMENT_KEYS) {
    let bestPages: UploadedDocument[] = [];

    for (const src of sources) {
      if (!src) continue;
      const candidatePages = getDocPages(src[key]);
      if (candidatePages.length === 0) continue;

      if (bestPages.length === 0) {
        bestPages = candidatePages.map(p => ({ ...p }));
      } else {
        const maxLen = Math.max(bestPages.length, candidatePages.length);
        const combined: UploadedDocument[] = [];
        for (let i = 0; i < maxLen; i++) {
          const cur = bestPages[i];
          const cand = candidatePages[i];
          if (!cur && cand) {
            combined.push({ ...cand });
          } else if (cur && !cand) {
            combined.push(cur);
          } else if (cur && cand) {
            const curValid = isValidDataUrl(cur.dataUrl);
            const candValid = isValidDataUrl(cand.dataUrl);
            let chosenUrl = cur.dataUrl;
            if (!curValid && candValid) {
              chosenUrl = cand.dataUrl;
            } else if (curValid && candValid) {
              // Prefer the higher-fidelity (larger) valid Data URL
              chosenUrl =
                (cand.dataUrl?.length || 0) > (cur.dataUrl?.length || 0)
                  ? cand.dataUrl
                  : cur.dataUrl;
            } else if (!curValid && !candValid) {
              chosenUrl = undefined;
            }

            combined.push({
              ...cand,
              ...cur,
              name: cur.name || cand.name,
              size: cur.size || cand.size,
              type: cur.type || cand.type,
              uploadedAt: cur.uploadedAt || cand.uploadedAt,
              pageNumber: cur.pageNumber || cand.pageNumber || i + 1,
              dataUrl: chosenUrl,
            });
          }
        }
        bestPages = combined;
      }
    }

    if (bestPages.length > 0) {
      merged[key] = bestPages;
      hasAnyCategory = true;
    }
  }

  return hasAnyCategory ? merged : undefined;
}

/**
 * Packs a Student record for universal Google Sheets synchronization.
 * Embeds a compact, adaptive-compressed Cloud Sync Envelope (`@@SMS_CLOUD_V1@@`) inside `notes`
 * guaranteed to stay strictly under Google Sheets' 50,000-character single-cell limit,
 * so ALL uploaded documents (6/6*) and extra fields sync across every device immediately—
 * even on legacy 24-column Apps Script deployments!
 */
export async function packStudentForSheets(student: Student): Promise<Student> {
  const cleanNotes = stripCloudEnvelopeFromNotes(student.notes);

  const meta: CloudSyncEnvelopeV1['m'] = {};
  if (student.referrerName?.trim()) meta.r = student.referrerName.trim();
  if (student.previousSchoolAddressKhmer?.trim()) meta.pa = student.previousSchoolAddressKhmer.trim();
  if (student.email?.trim()) meta.em = student.email.trim();
  if (student.age !== undefined && student.age !== '') meta.ag = student.age;
  if (student.fatherAge !== undefined && student.fatherAge !== '') meta.fa = student.fatherAge;
  if (student.motherAge !== undefined && student.motherAge !== '') meta.ma = student.motherAge;

  const hasMeta = Object.keys(meta).length > 0;

  // Collect all uploaded pages across all 7 categories
  const flatItems: { key: DocumentKey; page: UploadedDocument; index: number }[] = [];
  if (student.documents) {
    for (const key of ALL_DOCUMENT_KEYS) {
      const pages = getDocPages(student.documents[key]);
      pages.forEach((page, idx) => {
        flatItems.push({ key, page, index: idx });
      });
    }
  }

  if (!hasMeta && flatItems.length === 0) {
    return {
      ...student,
      notes: cleanNotes,
      documents: undefined,
    };
  }

  // Reserve space for cleanNotes + marker + JSON structural overhead
  const baseOverhead =
    cleanNotes.length +
    CLOUD_ENVELOPE_MARKER.length +
    JSON.stringify({ v: 1, m: hasMeta ? meta : undefined }).length +
    flatItems.length * 165 +
    400;

  let remainingDataBudget = Math.max(0, MAX_SHEETS_NOTES_CELL_CHARS - baseOverhead);

  const packedDocsMap: Partial<Record<DocumentKey, CompactDocPage[]>> = {};
  const compactStudentDocs: StudentDocuments = {};

  for (let i = 0; i < flatItems.length; i++) {
    const { key, page, index } = flatItems[i];
    const remainingItems = flatItems.length - i;
    const perItemAllowance =
      remainingItems > 0 ? Math.floor(remainingDataBudget / remainingItems) : 0;

    let compactUrl = '';
    if (isValidDataUrl(page.dataUrl) && perItemAllowance > 600) {
      if (page.dataUrl!.startsWith('data:image/')) {
        compactUrl = await compressImageDataUrlToCharBudget(
          page.dataUrl!,
          perItemAllowance
        );
      } else if (page.dataUrl!.length <= perItemAllowance) {
        compactUrl = page.dataUrl!;
      }
    }

    if (compactUrl) {
      remainingDataBudget = Math.max(0, remainingDataBudget - compactUrl.length);
    }

    const compactEntry: CompactDocPage = {
      n: page.name || `${key}_p${index + 1}`,
      s: page.size,
      t: page.type,
      u: page.uploadedAt,
      p: page.pageNumber || index + 1,
      ...(compactUrl ? { d: compactUrl } : {}),
    };

    if (!packedDocsMap[key]) packedDocsMap[key] = [];
    packedDocsMap[key]!.push(compactEntry);

    if (!compactStudentDocs[key]) compactStudentDocs[key] = [];
    (compactStudentDocs[key] as UploadedDocument[]).push({
      name: compactEntry.n,
      size: compactEntry.s,
      type: compactEntry.t,
      uploadedAt: compactEntry.u,
      pageNumber: compactEntry.p,
      ...(compactUrl ? { dataUrl: compactUrl } : {}),
    });
  }

  const envelope: CloudSyncEnvelopeV1 = {
    v: 1,
    ...(hasMeta ? { m: meta } : {}),
    ...(Object.keys(packedDocsMap).length > 0 ? { d: packedDocsMap } : {}),
  };

  let serializedEnvelope = JSON.stringify(envelope);
  let packedNotes = cleanNotes
    ? `${cleanNotes}\n${CLOUD_ENVELOPE_MARKER}${serializedEnvelope}`
    : `${CLOUD_ENVELOPE_MARKER}${serializedEnvelope}`;

  // Final safety guard: never exceed Google Sheets' 50,000-character cell limit
  if (packedNotes.length > MAX_SHEETS_NOTES_CELL_CHARS && envelope.d) {
    for (const key of [...ALL_DOCUMENT_KEYS].reverse()) {
      const list = envelope.d[key];
      if (!list) continue;
      for (let j = list.length - 1; j >= 0; j--) {
        if (packedNotes.length <= MAX_SHEETS_NOTES_CELL_CHARS) break;
        if (list[j].d) {
          delete list[j].d;
          serializedEnvelope = JSON.stringify(envelope);
          packedNotes = cleanNotes
            ? `${cleanNotes}\n${CLOUD_ENVELOPE_MARKER}${serializedEnvelope}`
            : `${CLOUD_ENVELOPE_MARKER}${serializedEnvelope}`;
        }
      }
    }
  }

  // Also ensure `documents` field on wire never exceeds 45,000 chars (for v2.4+ Column 25 safety)
  let safeWireDocs: StudentDocuments | undefined =
    Object.keys(compactStudentDocs).length > 0 ? compactStudentDocs : undefined;
  if (safeWireDocs && JSON.stringify(safeWireDocs).length > MAX_SHEETS_DOCS_COLUMN_CHARS) {
    const metadataOnlyDocs: StudentDocuments = {};
    for (const key of ALL_DOCUMENT_KEYS) {
      const pages = getDocPages(safeWireDocs[key]);
      if (pages.length > 0) {
        metadataOnlyDocs[key] = pages.map(p => ({
          name: p.name,
          size: p.size,
          type: p.type,
          uploadedAt: p.uploadedAt,
          pageNumber: p.pageNumber,
        }));
      }
    }
    safeWireDocs = metadataOnlyDocs;
  }

  return {
    ...student,
    notes: packedNotes,
    documents: safeWireDocs,
  };
}

/**
 * Unpacks a Student record fetched from Google Sheets, extracting any embedded
 * `@@SMS_CLOUD_V1@@` envelope from `notes` and restoring clean `notes`, extra fields,
 * and uploaded `documents`.
 */
export function unpackStudentFromSheets(raw: Student): Student {
  const rawNotes = raw.notes || '';
  const markerIdx = rawNotes.indexOf(CLOUD_ENVELOPE_MARKER);

  if (markerIdx === -1) {
    return raw;
  }

  const cleanNotes = rawNotes.slice(0, markerIdx).replace(/\n+$/, '');
  const jsonPart = rawNotes.slice(markerIdx + CLOUD_ENVELOPE_MARKER.length).trim();

  try {
    const parsed = JSON.parse(jsonPart) as CloudSyncEnvelopeV1;
    let envelopeDocs: StudentDocuments | undefined = undefined;

    if (parsed?.d && typeof parsed.d === 'object') {
      const restored: StudentDocuments = {};
      for (const key of ALL_DOCUMENT_KEYS) {
        const compactList = parsed.d[key];
        if (Array.isArray(compactList) && compactList.length > 0) {
          restored[key] = compactList.map((item, idx) => ({
            name: item.n || `${key}_p${idx + 1}`,
            size: item.s,
            type: item.t,
            uploadedAt: item.u,
            pageNumber: item.p || idx + 1,
            ...(item.d ? { dataUrl: item.d } : {}),
          }));
        }
      }
      if (Object.keys(restored).length > 0) {
        envelopeDocs = restored;
      }
    }

    const mergedDocs = mergeBestStudentDocuments(raw.documents, envelopeDocs);
    const meta = parsed?.m || {};

    return {
      ...raw,
      notes: cleanNotes,
      referrerName: raw.referrerName || meta.r || '',
      previousSchoolAddressKhmer: raw.previousSchoolAddressKhmer || meta.pa || '',
      email: raw.email || meta.em || '',
      age: raw.age !== undefined && raw.age !== '' ? raw.age : meta.ag,
      fatherAge: raw.fatherAge !== undefined && raw.fatherAge !== '' ? raw.fatherAge : meta.fa,
      motherAge: raw.motherAge !== undefined && raw.motherAge !== '' ? raw.motherAge : meta.ma,
      documents: mergedDocs,
    };
  } catch (err) {
    console.warn('Cloud envelope parse warning:', err);
    return {
      ...raw,
      notes: cleanNotes,
    };
  }
}

/**
 * Splits full-resolution StudentDocuments into <= 42,000-char chunks for Apps Script v3.0
 * high-capacity `StudentDocs` sheet storage (supports full multi-MB PDFs & HD scans).
 */
export interface StudentDocChunkRow {
  docKey: string;
  studentKey: string;
  studentId: string;
  category: DocumentKey;
  pageIndex: number;
  chunkIndex: number;
  totalChunks: number;
  metaJson: string;
  dataChunk: string;
}

const CHUNK_SIZE_CHARS = 42000;

export function getStableStudentCloudKey(student: Pick<Student, 'createdAt' | 'studentId' | 'nameKhmer' | 'phone'>): string {
  if (student.createdAt && student.createdAt.trim()) {
    return `ts_${student.createdAt.trim()}`;
  }
  const nk = (student.nameKhmer || '').trim();
  const ph = (student.phone || '').trim();
  if (nk || ph) {
    return `np_${nk}_${ph}`;
  }
  return `id_${(student.studentId || '').trim()}`;
}

export function splitStudentDocsIntoChunks(student: Student): StudentDocChunkRow[] {
  if (!student.documents) return [];
  const studentKey = getStableStudentCloudKey(student);
  const chunks: StudentDocChunkRow[] = [];

  for (const cat of ALL_DOCUMENT_KEYS) {
    const pages = getDocPages(student.documents[cat]);
    pages.forEach((page, pageIdx) => {
      const rawData = isValidDataUrl(page.dataUrl) ? page.dataUrl! : '';
      const metaJson = JSON.stringify({
        name: page.name,
        size: page.size,
        type: page.type,
        uploadedAt: page.uploadedAt,
        pageNumber: page.pageNumber || pageIdx + 1,
      });

      if (!rawData) {
        chunks.push({
          docKey: `${studentKey}::${cat}::${pageIdx}`,
          studentKey,
          studentId: student.studentId || '',
          category: cat,
          pageIndex: pageIdx,
          chunkIndex: 0,
          totalChunks: 1,
          metaJson,
          dataChunk: '',
        });
        return;
      }

      const totalChunks = Math.max(1, Math.ceil(rawData.length / CHUNK_SIZE_CHARS));
      for (let c = 0; c < totalChunks; c++) {
        chunks.push({
          docKey: `${studentKey}::${cat}::${pageIdx}`,
          studentKey,
          studentId: student.studentId || '',
          category: cat,
          pageIndex: pageIdx,
          chunkIndex: c,
          totalChunks,
          metaJson: c === 0 ? metaJson : '',
          dataChunk: rawData.slice(c * CHUNK_SIZE_CHARS, (c + 1) * CHUNK_SIZE_CHARS),
        });
      }
    });
  }

  return chunks;
}

export function reassembleChunksToStudentDocs(rows: StudentDocChunkRow[]): StudentDocuments | undefined {
  if (!Array.isArray(rows) || rows.length === 0) return undefined;

  const grouped = new Map<string, StudentDocChunkRow[]>();
  for (const r of rows) {
    if (!r || !r.docKey) continue;
    if (!grouped.has(r.docKey)) grouped.set(r.docKey, []);
    grouped.get(r.docKey)!.push(r);
  }

  const docs: StudentDocuments = {};
  let hasAny = false;

  grouped.forEach(chunkList => {
    chunkList.sort((a, b) => a.chunkIndex - b.chunkIndex);
    const first = chunkList[0];
    const cat = first.category as DocumentKey;
    if (!ALL_DOCUMENT_KEYS.includes(cat)) return;

    let meta: Partial<UploadedDocument> = {};
    for (const item of chunkList) {
      if (item.metaJson) {
        try {
          meta = JSON.parse(item.metaJson);
          break;
        } catch {}
      }
    }

    const fullDataUrl = chunkList.map(c => c.dataChunk || '').join('');
    const pageObj: UploadedDocument = {
      name: meta.name || `${cat}_p${first.pageIndex + 1}`,
      size: meta.size,
      type: meta.type,
      uploadedAt: meta.uploadedAt,
      pageNumber: meta.pageNumber || first.pageIndex + 1,
      ...(fullDataUrl ? { dataUrl: fullDataUrl } : {}),
    };

    if (!docs[cat]) docs[cat] = [];
    const arr = docs[cat] as UploadedDocument[];
    arr[first.pageIndex] = pageObj;
    hasAny = true;
  });

  if (!hasAny) return undefined;

  // Compact sparse arrays if any
  for (const cat of ALL_DOCUMENT_KEYS) {
    if (Array.isArray(docs[cat])) {
      docs[cat] = (docs[cat] as UploadedDocument[]).filter(Boolean);
    }
  }

  return docs;
}
