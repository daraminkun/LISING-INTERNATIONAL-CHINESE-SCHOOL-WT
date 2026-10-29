import { Student } from '../types';
import { schoolMajorService } from '../services/schoolMajorService';
import { canonicalizeSchoolName } from './imageUtils';
import { formatDobOnly } from './ageUtils';

// In-memory fallbacks for strict mobile WebViews / iOS Safari Private Browsing
const memoryLocalStore = new Map<string, string>();
const memorySessionStore = new Map<string, string>();

export function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // Fallback to in-memory map when storage is restricted
  }
  return memoryLocalStore.get(key) ?? null;
}

export function safeSetLocalStorage(key: string, value: string): boolean {
  memoryLocalStore.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // Storage quota or security restriction — kept in memoryLocalStore
  }
  return false;
}

export function safeRemoveLocalStorage(key: string): void {
  memoryLocalStore.delete(key);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage restriction
  }
}

export function safeGetSessionStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const val = window.sessionStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // Fallback to in-memory map when sessionStorage is restricted
  }
  return memorySessionStore.get(key) ?? null;
}

export function safeSetSessionStorage(key: string, value: string): boolean {
  memorySessionStore.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
      return true;
    }
  } catch {
    // Ignore storage restriction
  }
  return false;
}

export function safeRemoveSessionStorage(key: string): void {
  memorySessionStore.delete(key);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage restriction
  }
}

/**
 * Cross-device safe clipboard copy (works on desktop, iOS Safari, Android Chrome, and in-app WebViews)
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to textarea copy below
  }

  try {
    if (typeof document === 'undefined') return false;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Cross-device safe file download for PDF, CSV, and HTML blobs.
 * Delays URL revocation so iOS Safari, Android Chrome, and mobile WebViews finish reading the blob.
 */
export function triggerSafeBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 250);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 15000);
}

interface CatalogOrderMaps {
  schoolRankMap: Map<string, number>;
  majorRankBySchool: Map<string, Map<string, number>>;
}

export function buildCatalogOrderMaps(): CatalogOrderMaps {
  const schoolRankMap = new Map<string, number>();
  const majorRankBySchool = new Map<string, Map<string, number>>();

  const schools = schoolMajorService.getSchools();
  schools.forEach((entry, sIdx) => {
    const cSchool = canonicalizeSchoolName(entry.school || '').trim();
    const sKey = cSchool.toLowerCase();
    if (!sKey) return;

    if (!schoolRankMap.has(sKey)) {
      schoolRankMap.set(sKey, sIdx);
    }

    let mMap = majorRankBySchool.get(sKey);
    if (!mMap) {
      mMap = new Map<string, number>();
      majorRankBySchool.set(sKey, mMap);
    }
    (entry.majors || []).forEach((maj, mIdx) => {
      const mKey = (maj || '').trim().toLowerCase();
      if (mKey && !mMap!.has(mKey)) {
        mMap!.set(mKey, mIdx);
      }
    });
  });

  return { schoolRankMap, majorRankBySchool };
}

function resolveSchoolRank(cSchoolLower: string, maps: CatalogOrderMaps): number {
  if (!cSchoolLower) return 999999;
  const direct = maps.schoolRankMap.get(cSchoolLower);
  if (direct !== undefined) return direct;

  for (const [catalogSchoolLower, rank] of maps.schoolRankMap.entries()) {
    if (catalogSchoolLower.includes(cSchoolLower) || cSchoolLower.includes(catalogSchoolLower)) {
      return rank;
    }
  }
  return 100000;
}

function resolveMajorRank(cSchoolLower: string, cMajorLower: string, maps: CatalogOrderMaps): number {
  if (!cMajorLower) return 999999;
  const mMap = maps.majorRankBySchool.get(cSchoolLower);
  if (mMap) {
    const direct = mMap.get(cMajorLower);
    if (direct !== undefined) return direct;
  }

  // Fallback check via schoolMajorService.getMajorsForSchool
  if (cSchoolLower) {
    const schoolMajors = schoolMajorService.getMajorsForSchool(cSchoolLower);
    const idx = schoolMajors.findIndex(m => m.trim().toLowerCase() === cMajorLower);
    if (idx !== -1) return idx;
  }

  return 100000;
}

function parseTimestampSafe(iso?: string): number | null {
  if (!iso || !iso.trim()) return null;
  const ts = Date.parse(iso.trim());
  return Number.isFinite(ts) ? ts : null;
}

/**
 * Comparator that sorts students strictly by:
 * 1. Partner School catalog order (តាមលំដាប់ឈ្មោះសាលារៀននីមួយៗ)
 * 2. Major order within that school (តាមលំដាប់ជំនាញនីមួយៗ)
 * 3. Registration / sequence order within the same (School, Major) group (តាម No និង លេខរៀង)
 */
export function compareStudentsBySchoolMajorOrder(
  a: Student,
  b: Student,
  idxA: number = 0,
  idxB: number = 0,
  maps: CatalogOrderMaps = buildCatalogOrderMaps()
): number {
  const schoolA = a.targetSchool?.trim() ? canonicalizeSchoolName(a.targetSchool.trim()) : '';
  const schoolB = b.targetSchool?.trim() ? canonicalizeSchoolName(b.targetSchool.trim()) : '';
  const sLowerA = schoolA.toLowerCase();
  const sLowerB = schoolB.toLowerCase();

  if (sLowerA !== sLowerB) {
    const sRankA = resolveSchoolRank(sLowerA, maps);
    const sRankB = resolveSchoolRank(sLowerB, maps);
    if (sRankA !== sRankB) return sRankA - sRankB;
    return schoolA.localeCompare(schoolB, 'zh-Hant-TW');
  }

  const majorA = (a.major || '').trim();
  const majorB = (b.major || '').trim();
  const mLowerA = majorA.toLowerCase();
  const mLowerB = majorB.toLowerCase();

  if (mLowerA !== mLowerB) {
    const mRankA = resolveMajorRank(sLowerA, mLowerA, maps);
    const mRankB = resolveMajorRank(sLowerB, mLowerB, maps);
    if (mRankA !== mRankB) return mRankA - mRankB;
    return majorA.localeCompare(majorB, 'zh-Hant-TW');
  }

  // Within the exact same (School, Major) group: preserve registration order
  const tsA = parseTimestampSafe(a.createdAt);
  const tsB = parseTimestampSafe(b.createdAt);
  if (tsA !== null && tsB !== null && tsA !== tsB) {
    return tsA - tsB;
  }

  const numA = parseInt((a.studentId || '').replace(/\D/g, '') || '0', 10);
  const numB = parseInt((b.studentId || '').replace(/\D/g, '') || '0', 10);
  if (numA > 0 && numB > 0 && numA !== numB) {
    return numA - numB;
  }

  return idxA - idxB;
}

/**
 * Sorts students by (School -> Major -> Registration Order) and assigns
 * gapless sequential លេខរៀង (studentId = "1", "2", "3", ...).
 */
export function sortAndSequenceStudents(list: Student[]): Student[] {
  if (!Array.isArray(list) || list.length === 0) return [];
  const maps = buildCatalogOrderMaps();

  const indexed = list.map((student, idx) => ({
    student: {
      ...student,
      targetSchool: student.targetSchool?.trim()
        ? canonicalizeSchoolName(student.targetSchool.trim())
        : student.targetSchool,
    },
    idx,
  }));

  indexed.sort((x, y) => compareStudentsBySchoolMajorOrder(x.student, y.student, x.idx, y.idx, maps));

  return indexed.map((item, index) => ({
    ...item.student,
    studentId: String(index + 1),
  }));
}

export interface StudentNumberedItem {
  student: Student;
  sequenceNo: number;     // លេខរៀង (1, 2, 3, ... gapless)
  schoolMajorNo: number;  // No (1, 2, 3, ... gapless within each School + Major group)
}

/**
 * Computes gapless លេខរៀង (sequenceNo) and coupled per-(School, Major) No (schoolMajorNo).
 * Deleting any row automatically shifts both លេខរៀង and No with zero gaps.
 */
export function computeStudentNumbersList(students: Student[]): StudentNumberedItem[] {
  const groupCounters = new Map<string, number>();

  return students.map((student, index) => {
    const cSchool = student.targetSchool?.trim()
      ? canonicalizeSchoolName(student.targetSchool.trim()).toLowerCase()
      : '__unspecified_school__';
    const cMajor = (student.major || '').trim().toLowerCase() || '__unspecified_major__';
    const groupKey = `${cSchool}::${cMajor}`;

    const nextGroupNo = (groupCounters.get(groupKey) || 0) + 1;
    groupCounters.set(groupKey, nextGroupNo);

    return {
      student,
      sequenceNo: index + 1,
      schoolMajorNo: nextGroupNo,
    };
  });
}

export function getStudentLookupKey(s: Student): string {
  if (s.studentId) return `id:${s.studentId}`;
  if (s.createdAt) return `ts:${s.createdAt.trim()}`;
  return `np:${(s.nameKhmer || s.nameLatin || '').trim().toLowerCase()}_${(s.phone || '').replace(/\s+/g, '')}`;
}

/**
 * Builds a fast lookup map from Student -> No (1, 2, 3... within each School + Major group)
 */
export function getStudentSchoolMajorNoMap(students: Student[]): Map<string, number> {
  const map = new Map<string, number>();
  const numbered = computeStudentNumbersList(students);
  numbered.forEach(({ student, schoolMajorNo }) => {
    map.set(getStudentLookupKey(student), schoolMajorNo);
    if (student.studentId) {
      map.set(student.studentId, schoolMajorNo);
    }
    if (student.createdAt) {
      map.set(`ts:${student.createdAt.trim()}`, schoolMajorNo);
    }
  });
  return map;
}

/**
 * Formats partner school Chinese name concisely for official A4 Portrait reports
 * matching the official sample (e.g. 東吳高級, 莊敬高級, 世紀綠能高級, 青年高級, 醒吾高中, 弘光科技大學).
 */
export function formatConciseSchoolForReport(school?: string): string {
  if (!school || !school.trim()) return '';
  let s = canonicalizeSchoolName(school.trim());

  // Strip legal foundation prefix if before city/name
  s = s.replace(/^.+?學校財團法人\s*/g, '');

  // Strip Taiwan city/county and ownership prefixes
  s = s.replace(
    /^(臺北市|台北市|新北市|桃園市|臺中市|台中市|臺南市|台南市|高雄市|基隆市|新竹市|新竹縣|嘉義市|嘉義縣|苗栗縣|彰化縣|南投縣|雲林縣|屏東縣|宜蘭縣|花蓮縣|臺東縣|台東縣|澎湖縣|金門縣|連江縣)\s*(私立|市立|縣立)?\s*/g,
    ''
  );
  s = s.replace(/^(私立|市立|縣立)\s*/g, '');
  s = s.replace(/^.+?學校財團法人\s*/g, '');

  // Shorten vocational / senior high school suffixes to 高級 matching sample table
  s = s.replace(
    /(工商高級中等學校|商工高級中等學校|高級工業家事職業學校|高級家事商業職業學校|高級工業商業職業學校|高級工商職業學校|高級商業職業學校|高級工業職業學校|高級餐旅職業學校|高級家事職業學校|高級農工職業學校|高級海事水產職業學校|工業家事職業學校|高級中等學校|高級中學)$/g,
    '高級'
  );

  return s.trim();
}

/**
 * Formats DOB with dots (YYYY.MM.DD) matching the official report sample (e.g. 2006.12.15)
 */
export function formatDobDot(dob?: string): string {
  const clean = formatDobOnly(dob);
  if (!clean) return '';
  return clean.replace(/[-/]/g, '.');
}

/**
 * Formats Gender as M / F matching the official report sample
 */
export function formatGenderCode(gender?: string): string {
  if (!gender || !gender.trim()) return '';
  const g = gender.trim().toLowerCase();
  if (g === 'male' || g === 'm' || g === 'ប្រុស' || g === '男') return 'M';
  if (g === 'female' || g === 'f' || g === 'ស្រី' || g === '女') return 'F';
  return gender.trim();
}
