/**
 * Dynamic School and Major Management Service
 * Provides full CRUD operations for Schools and Majors with persistent storage
 * and non-destructive Google Sheets synchronization.
 */

import { SchoolMajorEntry, SCHOOL_MAJORS_DATA } from '../constants/studentOptions';
import { AUTHENTIC_SCHOOL_MAJORS } from '../data/detailedSchoolsData';
import { SchoolTranslation, MajorTranslation } from '../utils/schoolMajorTranslations';
import { Language } from '../types';
import { dbStorage } from './dbStorage';
import {
  normalizeSchoolKey,
  canonicalizeSchoolName,
  LEGACY_SCHOOL_ALIAS_MAP,
  isRetiredLegacySchool,
  MAX_SHEETS_SAFE_DATA_URL_LENGTH,
} from '../utils/imageUtils';

const STORAGE_KEY_SCHOOLS = 'sms_schools_majors_list_v2';
const STORAGE_KEY_CUSTOM_TRANS = 'sms_custom_translations_v2';
const STORAGE_KEY_DELETED_SCHOOLS = 'sms_deleted_schools_v3';
const STORAGE_KEY_DELETED_MAJORS = 'sms_deleted_majors_v3';
const STORAGE_KEY_CATALOG_PATCH = 'sms_catalog_patch_20261027_v2';

const CATALOG_ADDED_MAJORS: Record<string, string[]> = {
  '臺北市私立 育達高級中等學校': ['餐飲管理科'],
  '新北市私立 豫章高級工商職業學校': ['餐飲管理科'],
  '桃園市私立 方曙商工高級中等學校': ['資訊科'],
  '臺中市私立 青年高級中學': ['餐飲管理科'],
  '臺中市私立 致用高級中學': ['照護服務科'],
  '臺中市私立 慈明高級中學': ['電子商務科'],
  '高雄市 立志高級中學': ['電子科', '資訊科'],
  '高雄市私立 中山高級工商職業學校': ['資訊科', '電子科', '餐飲管理科'],
};

const CATALOG_REMOVED_MAJORS: Record<string, string[]> = {
  '新竹市私立 光復高級中學': ['餐飲管理科'],
  '臺中市私立 青年高級中學': ['汽車科', '商用資訊科', '烘焙食品科'],
  '嘉義縣私立 萬能高級工商職業學校': ['烘焙食品科'],
  '高雄市私立 中山高級工商職業學校': ['烘焙食品科', '美容科'],
  '高雄市私立 高苑高級工業商業職業學校': ['烘焙科', '烘焙食品科'],
};

/**
 * Generic departments that were previously auto-injected onto the 27 duplicate university cards (#61-#87).
 * Used during v2 deduplication so collapsing duplicates keeps the official partner recruitment majors
 * (plus any custom Admin-added majors) rather than polluting universities with unoffered departments.
 */
const LEGACY_DUPLICATE_UNIV_MAJORS: Record<string, string[]> = {
  '中信金學校財團法人中信科技大學': ['財務金融學系', '財經法律學系', '企業管理學系', '人工智慧學系', '運動產業管理學系', '金融科技學系'],
  '中華學校財團法人中華科技大學': ['航空機械系', '航空電子系', '航空服務管理系', '機械工程系', '電機工程系', '建築與室內設計系', '食品科學系', '生物科技系'],
  '中臺科技大學': ['醫學檢驗生物技術系', '醫學影像暨放射科學系', '護理系', '牙體技術暨材料系', '視光系', '食品科技系', '醫療暨健康產業管理系', '老人照顧系'],
  '元培醫事科技大學': ['醫事檢驗生物技術系', '醫學影像暨放射技術系', '護理系', '視光系', '醫務管理系', '生物醫學工程系', '食品營養系', '寵物保健系', '環境工程衛生系'],
  '台南應用科技大學': ['服裝設計系', '美容造型設計系', '室內設計系', '視覺傳達設計系', '旅館管理系', '餐飲系', '商品設計系', '幼兒保育系', '音樂系', '舞蹈系'],
  '台鋼學校財團法人台鋼科技大學': ['機械與自動化工程系', '電機工程系', '土木工程系', '智慧科技應用系', '休閒運動管理系', '數位機電工程系'],
  '正修科技大學': ['機械工程系', '電子工程系', '土木與空間資訊系', '數位多媒體設計系', '餐飲管理系', '幼兒保育系', '視覺傳達設計系', '觀光遊憩系', '電機工程系'],
  '吳鳳科技大學': ['消防學系', '安全科技與管理系', '機械工程系車輛組', '電機工程系', '應用數位媒體系', '觀光餐旅管理系', '幼兒保育系'],
  '宏國德霖科技大學': ['營建科技系', '室內設計系', '不動產經營系', '機械工程系', '餐旅管理系', '園藝與景觀設計系', '資訊工程系'],
  '東南科技大學': ['機械工程系(車輛組)', '電機工程系', '數位媒體設計系', '室內設計系', '表演藝術系', '餐旅管理系', '休閒事業管理系'],
  '南開科技大學': ['機械工程系(先進車輛組)', '自動化工程系', '電機與資訊技術系', '長期照顧與健康促進系', '休閒事業管理系', '多媒體動畫設計系'],
  '建國科技大學': ['機械工程系', '自動化工程系暨機電光系統', '電子工程系', '美容科技系', '空間設計系', '數位媒體設計系', '觀光與休閒管理系'],
  '美和科技大學': ['護理系', '健康事業管理系', '食品營養系', '生物科技系', '社會工作系', '運動與休閒系', '餐旅管理系'],
  '修平科技大學': ['機械工程系', '電機工程系', '電子工程系', '工業工程與管理系', '數位媒體設計系', '觀光與遊憩管理系', '應用日語系'],
  '國立高雄餐旅大學': ['烘焙管理系', '中餐廚藝系', '西餐廚藝系', '餐飲管理系', '旅館管理系', '航空暨運輸服務管理系', '觀光事業系', '休閒暨遊憩管理系'],
  '國立勤益科技大學': ['冷凍空調與能源系', '精密機械工程系', '電機工程系', '電子工程系', '人工智慧應用工程系', '資訊工程系', '工業工程與管理系', '企業管理系'],
  '崑山科技大學': ['視訊傳播設計系', '機械工程系', '電機工程系', '電子工程系', '空間設計系', '餐飲管理及廚藝系', '旅遊文化發展系', '電腦與通訊系'],
  '景文科技大學': ['餐飲管理系', '旅館管理系', '旅遊管理系', '應用外語系', '行動商務與數位行銷系', '視覺傳達設計系', '電腦與通訊工程系'],
  '萬能學校財團法人萬能科技大學': ['航空光機電系', '航空暨運輸服務管理系', '精密機械工程系', '觀光與休閒事業管理系', '餐飲管理系', '時尚造型設計系', '商業專案管理系'],
  '僑光科技大學': ['觀光與餐旅管理系', '國際貿易系', '財務金融系', '企業管理系', '資訊科技系', '多媒體與遊戲設計系', '應用英語系'],
  '德育學校財團法人德育護理健康學院': ['護理系', '幼兒保育系', '口腔衛生照護系', '餐旅管理系', '美容流行設計系', '高齡照顧福利系', '食品保健系'],
  '德明財經科技大學': ['財務金融系', '財稅系', '會計資訊系', '國際貿易系', '企業管理系', '行銷管理系', '資訊科技系', '多媒體設計系'],
  '樹德科技大學': ['動畫與遊戲設計系', '流行設計系', '室內設計系', '視覺傳達設計系', '演藝事業系', '電競產業管理學士學位學程', '資訊工程系', '兒童與家庭服務系'],
  '龍華科技大學': ['半導體工程系', '機械工程系', '電機工程系', '電子工程系', '資訊網路工程系', '遊戲產學學士學位學程', '數位行銷跨境電商系', '應用外語系'],
  '亞東科技大學': ['通訊工程系', '材料與纖維系', '機械工程系', '電機工程系', '電子工程系', '護理系', '醫務管理系', '工業設計系'],
  '弘光科技大學': ['護理系', '物理治療系', '食品科技系(烘培科技)', '餐旅管理系', '美髮造型設計系', '化妝品應用系', '老人福利與長期照顧事業系', '幼兒保育系'],
  '中國科技大學': ['建築系', '室內設計系', '視覺傳達設計系', '數位多媒體設計系', '觀光與休閒事業管理系', '企業管理系', '資訊工程系'],
};

function sanitizeUniversityDuplicateMajors(canonicalSchool: string, majors: string[]): string[] {
  const legacyBloat = LEGACY_DUPLICATE_UNIV_MAJORS[canonicalSchool];
  const official = AUTHENTIC_SCHOOL_MAJORS[canonicalSchool];
  if (!legacyBloat || !official) return majors;

  const officialSet = new Set(official.map(m => m.trim().toLowerCase()));
  const bloatOnlySet = new Set(
    legacyBloat
      .map(m => m.trim().toLowerCase())
      .filter(m => !officialSet.has(m))
  );

  const cleaned = majors.filter(m => !bloatOnlySet.has(m.trim().toLowerCase()));
  // Ensure official partner majors are present if cleaning emptied the duplicate card
  if (cleaned.length === 0) {
    return [...official];
  }
  return cleaned;
}

const NEW_HSING_WU_SCHOOL: SchoolMajorEntry = {
  school: '新北市私立 醒吾高中',
  majors: ['資料處理科'],
  ageRequirementKm: 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
  ageRequirementEn: 'Age 16 to 22 years old (For High School)',
  shortAgeKm: 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
  shortAgeEn: 'Age 16-22 (High School)',
};

export interface CustomTranslationsStore {
  schools: Record<string, Partial<SchoolTranslation>>;
  majors: Record<string, Partial<MajorTranslation>>;
}

class SchoolMajorService {
  private listeners: Set<() => void> = new Set();
  private syncRemoteHandler?: ((schools: SchoolMajorEntry[], translations: CustomTranslationsStore) => void) | null;
  private hasPushedCatalogPatch = false;

  constructor() {
    this.runCatalogMigrationIfNeeded();

    dbStorage.whenReady().then(() => {
      for (const [legacyName, canonicalName] of Object.entries(LEGACY_SCHOOL_ALIAS_MAP)) {
        const legacyLogo = dbStorage.getCachedSchoolLogo(legacyName);
        if (legacyLogo && !dbStorage.isSchoolLogoDeleted(canonicalName)) {
          void dbStorage.saveSchoolLogo(canonicalName, legacyLogo, true);
        }
      }
      this.notify();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('school_logos_updated', () => {
        this.notify();
      });
    }
  }

  /**
   * One-time local catalog migration so existing browser storage reflects the unified 60
   * partner schools and majors while preserving custom logos and future Admin edits.
   */
  private runCatalogMigrationIfNeeded(): void {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(STORAGE_KEY_CATALOG_PATCH) === '1') return;

      // 1. Clean legacy bare major deletions (without "::") and seed scoped school::major removals
      const rawDeletedMajors = this.getDeletedMajors();
      const scopedSet = new Set<string>();
      rawDeletedMajors.forEach(item => {
        const trimmed = String(item || '').trim();
        if (trimmed.includes('::')) {
          const [sch, maj] = trimmed.split('::');
          const cSchool = canonicalizeSchoolName(sch);
          const cMajor = (maj || '').trim();
          if (cSchool && cMajor) {
            const addedForSchool = CATALOG_ADDED_MAJORS[cSchool] || [];
            if (!addedForSchool.some(a => a.toLowerCase() === cMajor.toLowerCase())) {
              scopedSet.add(`${cSchool}::${cMajor}`);
            }
          }
        }
      });

      for (const [sch, removedList] of Object.entries(CATALOG_REMOVED_MAJORS)) {
        removedList.forEach(maj => {
          scopedSet.add(`${sch}::${maj}`);
        });
      }
      localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(Array.from(scopedSet)));

      // 2. Migrate custom school translations from legacy address-prefixed keys to canonical keys
      const savedTrans = localStorage.getItem(STORAGE_KEY_CUSTOM_TRANS);
      if (savedTrans) {
        try {
          const parsedTrans = JSON.parse(savedTrans);
          if (parsedTrans?.schools && typeof parsedTrans.schools === 'object') {
            const nextSchoolsTrans: Record<string, Partial<SchoolTranslation>> = {};
            for (const [rawKey, val] of Object.entries(parsedTrans.schools)) {
              if (!val || isRetiredLegacySchool(rawKey)) continue;
              const cKey = canonicalizeSchoolName(rawKey);
              const existing = nextSchoolsTrans[cKey] || {};
              nextSchoolsTrans[cKey] = {
                ...existing,
                ...(val as Partial<SchoolTranslation>),
                logoUrl: (val as Partial<SchoolTranslation>).logoUrl || existing.logoUrl,
              };
            }
            this.persistCustomTranslationsStore({
              schools: nextSchoolsTrans,
              majors: parsedTrans.majors || {},
            });
          }
        } catch (transErr) {
          console.warn('Custom translation migration notice:', transErr);
        }
      }

      // 3. Patch stored schools list if already persisted in localStorage
      const savedSchools = localStorage.getItem(STORAGE_KEY_SCHOOLS);
      if (savedSchools) {
        const parsed = JSON.parse(savedSchools);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const patched = this.applyCatalogPatchToEntries(parsed);
          localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(patched));
        }
      }

      localStorage.setItem(STORAGE_KEY_CATALOG_PATCH, '1');
    } catch (e) {
      console.warn('Catalog migration warning:', e);
    }
  }

  private applyCatalogPatchToEntries(entries: SchoolMajorEntry[]): SchoolMajorEntry[] {
    const map = new Map<string, SchoolMajorEntry>();

    entries.forEach(item => {
      if (!item || !item.school || isRetiredLegacySchool(item.school)) return;
      const cName = canonicalizeSchoolName(item.school);
      const prev = map.get(cName);
      const combinedMajors = Array.from(
        new Set([...(prev?.majors || []), ...(Array.isArray(item.majors) ? item.majors : [])].map(m => m.trim()).filter(Boolean))
      );
      const cleanedMajors = sanitizeUniversityDuplicateMajors(cName, combinedMajors);
      map.set(cName, {
        ...(prev || item),
        ...item,
        school: cName,
        logoUrl: item.logoUrl || prev?.logoUrl || dbStorage.getCachedSchoolLogo(cName),
        majors: cleanedMajors,
      });
    });

    // Ensure 新北市私立 醒吾高中 exists unless explicitly deleted by Admin
    if (!this.isSchoolDeleted(NEW_HSING_WU_SCHOOL.school) && !map.has(NEW_HSING_WU_SCHOOL.school)) {
      map.set(NEW_HSING_WU_SCHOOL.school, {
        ...NEW_HSING_WU_SCHOOL,
        majors: [...NEW_HSING_WU_SCHOOL.majors],
      });
    }

    // Apply requested major removals
    for (const [sch, toRemove] of Object.entries(CATALOG_REMOVED_MAJORS)) {
      const target = map.get(sch);
      if (target) {
        const removeLower = toRemove.map(m => m.toLowerCase());
        target.majors = target.majors.filter(m => !removeLower.includes(m.trim().toLowerCase()));
      }
    }

    // Apply requested major additions
    for (const [sch, toAdd] of Object.entries(CATALOG_ADDED_MAJORS)) {
      const target = map.get(sch);
      if (target) {
        toAdd.forEach(addMaj => {
          if (!target.majors.some(m => m.trim().toLowerCase() === addMaj.toLowerCase())) {
            target.majors.push(addMaj);
          }
        });
      }
    }

    return Array.from(map.values());
  }

  /**
   * Set remote sync handler to sync with Google Sheets
   */
  setRemoteSyncHandler(handler: ((schools: SchoolMajorEntry[], translations: CustomTranslationsStore) => void) | null): void {
    this.syncRemoteHandler = handler;
  }

  /**
   * Subscribe to changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('school_majors_data_updated'));
    }
  }

  getDeletedSchools(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DELETED_SCHOOLS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading deleted schools:', e);
    }
    return [];
  }

  getDeletedMajors(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DELETED_MAJORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading deleted majors:', e);
    }
    return [];
  }

  isSchoolDeleted(schoolName: string): boolean {
    if (!schoolName) return false;
    const name = canonicalizeSchoolName(schoolName).toLowerCase();
    return this.getDeletedSchools().some(s => canonicalizeSchoolName(s).toLowerCase() === name);
  }

  isMajorDeleted(schoolName: string, majorName: string): boolean {
    if (!schoolName || !majorName) return false;
    const cSchool = canonicalizeSchoolName(schoolName);
    const key = `${cSchool}::${majorName.trim()}`.toLowerCase();
    const rawKey = `${normalizeSchoolKey(schoolName)}::${majorName.trim()}`.toLowerCase();
    return this.getDeletedMajors().some(m => {
      const lower = m.trim().toLowerCase();
      return lower.includes('::') && (lower === key || lower === rawKey);
    });
  }

  private resolveSchoolLogo(schoolName: string, entryLogo?: string, transLogo?: string): string | undefined {
    if (dbStorage.isSchoolLogoDeleted(schoolName)) {
      return undefined;
    }
    return dbStorage.getCachedSchoolLogo(schoolName) || entryLogo || transLogo || undefined;
  }

  /**
   * Get all schools with their majors and persisted logos
   */
  getSchools(): SchoolMajorEntry[] {
    const deletedSchools = this.getDeletedSchools().map(s => canonicalizeSchoolName(s).toLowerCase());
    const deletedMajors = this.getDeletedMajors()
      .map(m => m.trim().toLowerCase())
      .filter(m => m.includes('::'));
    const customTrans = this.getCustomTranslations();

    const isExcluded = (name: string) => {
      if (!name) return true;
      if (isRetiredLegacySchool(name)) return true;
      const trimmed = canonicalizeSchoolName(name);
      const lower = trimmed.toLowerCase();
      return (
        trimmed === '日興國際學校' ||
        trimmed === 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ' ||
        trimmed === 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' ||
        lower.includes('lising international') ||
        deletedSchools.includes(lower)
      );
    };

    const filterMajors = (schoolName: string, majors: string[]) => {
      if (!Array.isArray(majors)) return [];
      const normSchool = canonicalizeSchoolName(schoolName);
      return majors.filter(m => {
        if (!m || !m.trim()) return false;
        const key = `${normSchool}::${m.trim()}`.toLowerCase();
        const rawKey = `${schoolName.trim()}::${m.trim()}`.toLowerCase();
        return !deletedMajors.includes(key) && !deletedMajors.includes(rawKey);
      });
    };

    let baseList: SchoolMajorEntry[] = [];
    try {
      const saved = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(STORAGE_KEY_SCHOOLS) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = parsed;
        }
      }
    } catch (e) {
      console.warn('Stored schools read notice:', e);
    }
    if (baseList.length === 0) {
      baseList = [...SCHOOL_MAJORS_DATA];
    }

    // Merge authentic school majors for all partner schools using canonical keys
    const listMap = new Map<string, SchoolMajorEntry>();
    baseList.forEach(item => {
      if (item && item.school) {
        const norm = canonicalizeSchoolName(item.school);
        const existing = listMap.get(norm);
        if (existing) {
          const combinedMajors = Array.from(new Set([...(existing.majors || []), ...(item.majors || [])]));
          listMap.set(norm, { ...existing, ...item, school: norm, majors: combinedMajors });
        } else {
          listMap.set(norm, { ...item, school: norm });
        }
      }
    });

    for (const [schName, authMajors] of Object.entries(AUTHENTIC_SCHOOL_MAJORS)) {
      const normName = canonicalizeSchoolName(schName);
      const existing = listMap.get(normName);
      const isUniv = normName.includes('大學') || normName.includes('學院');
      if (!existing) {
        listMap.set(normName, {
          school: normName,
          majors: authMajors,
          ageRequirementKm: isUniv
            ? "អាយុ ២៥ឆ្នាំ ចុះក្រោម (កើតក្រោយថ្ងៃទី ០១ ខែកក្កដា) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)"
            : "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
          ageRequirementEn: isUniv
            ? "Age 25 and under (Born after July 1st) for University / College"
            : "Age 16 to 22 years old (For High School)",
          shortAgeKm: isUniv
            ? "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)"
            : "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
          shortAgeEn: isUniv ? "Age ≤25 (Born after Jul 1)" : "Age 16-22 (High School)"
        });
      } else {
        const currentMajors = existing.majors || [];
        const isGenericFallback =
          currentMajors.length === 5 &&
          currentMajors.includes("資訊工程系") &&
          currentMajors.includes("餐旅管理系") &&
          currentMajors.includes("應用外語系");
        if (currentMajors.length === 0 || isGenericFallback) {
          existing.majors = authMajors;
        }
      }
    }

    return Array.from(listMap.values())
      .filter(s => !isExcluded(s.school))
      .map(s => {
        const cTrans = customTrans.schools[s.school];
        const logoUrl = this.resolveSchoolLogo(s.school, s.logoUrl, cTrans?.logoUrl);
        return {
          ...s,
          logoUrl,
          majors: filterMajors(s.school, s.majors),
        };
      });
  }

  /**
   * Save schools data to localStorage safely and optionally sync to remote
   */
  saveSchools(data: SchoolMajorEntry[], skipRemote = false): void {
    try {
      const storageSafeData = data.map(item => ({
        ...item,
        logoUrl:
          item.logoUrl && item.logoUrl.length <= MAX_SHEETS_SAFE_DATA_URL_LENGTH + 8000
            ? item.logoUrl
            : undefined,
      }));
      localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(storageSafeData));
    } catch (e) {
      // Fallback: save school records without inline base64 logos if localStorage quota is tight
      try {
        const slimData = data.map(({ logoUrl: _logo, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(slimData));
      } catch (innerErr) {
        console.warn('LocalStorage write warning for schools:', innerErr);
      }
    }

    this.notify();
    if (!skipRemote && this.syncRemoteHandler) {
      try {
        this.syncRemoteHandler(this.getSchools(), this.getCustomTranslations());
      } catch (e) {
        console.warn('Error in syncRemoteHandler:', e);
      }
    }
  }

  /**
   * Update schools and translations from Google Sheets without ever losing local school logos
   * or dropping partner schools not yet present in the remote sheet.
   */
  setSchoolsFromRemote(
    remoteSchools: SchoolMajorEntry[],
    remoteTranslations?: CustomTranslationsStore | null,
    remoteDeletedSchools?: string[],
    remoteDeletedMajors?: string[]
  ): void {
    if (Array.isArray(remoteDeletedSchools) && remoteDeletedSchools.length > 0) {
      const cur = this.getDeletedSchools();
      const merged = Array.from(new Set([...cur, ...remoteDeletedSchools]));
      try {
        localStorage.setItem(STORAGE_KEY_DELETED_SCHOOLS, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to persist deleted schools:', e);
      }
    }
    if (Array.isArray(remoteDeletedMajors) && remoteDeletedMajors.length > 0) {
      const scopedRemoteDeleted = remoteDeletedMajors
        .map(m => String(m || '').trim())
        .filter(m => m.includes('::'))
        .map(m => {
          const [sch, maj] = m.split('::');
          return `${canonicalizeSchoolName(sch)}::${(maj || '').trim()}`;
        });
      if (scopedRemoteDeleted.length > 0) {
        const cur = this.getDeletedMajors().filter(m => m.includes('::'));
        const merged = Array.from(new Set([...cur, ...scopedRemoteDeleted]));
        try {
          localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(merged));
        } catch (e) {
          console.warn('Failed to persist deleted majors:', e);
        }
      }
    }

    if (!Array.isArray(remoteSchools) || remoteSchools.length === 0) return;

    // Detect if the remote Google Sheet still holds pre-v2 duplicate or non-canonical school rows (e.g. 87 rows instead of 60)
    const remoteCanonicalSet = new Set(
      remoteSchools
        .map(s => canonicalizeSchoolName(s?.school))
        .filter(Boolean)
        .map(s => s.toLowerCase())
    );
    const hasLegacyAliasInRemote = remoteSchools.some(s => {
      const rawNorm = normalizeSchoolKey(s?.school);
      return Boolean(rawNorm && rawNorm !== canonicalizeSchoolName(rawNorm));
    });
    const hasDuplicatesInRemote = remoteSchools.length > remoteCanonicalSet.size;
    const hasRetiredInRemote = remoteSchools.some(s => isRetiredLegacySchool(s?.school));

    const isRemotePrePatch =
      hasLegacyAliasInRemote ||
      hasDuplicatesInRemote ||
      hasRetiredInRemote ||
      (!remoteSchools.some(s => s?.school?.includes('醒吾')) &&
        !this.isSchoolDeleted(NEW_HSING_WU_SCHOOL.school));

    const deletedSchools = this.getDeletedSchools().map(s => canonicalizeSchoolName(s).toLowerCase());
    const deletedMajors = this.getDeletedMajors()
      .map(m => m.trim().toLowerCase())
      .filter(m => m.includes('::'));

    const isExcluded = (name: string) => {
      if (!name) return true;
      if (isRetiredLegacySchool(name)) return true;
      const trimmed = canonicalizeSchoolName(name);
      const lower = trimmed.toLowerCase();
      return (
        trimmed === '日興國際學校' ||
        trimmed === 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ' ||
        trimmed === 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' ||
        lower.includes('lising international') ||
        deletedSchools.includes(lower)
      );
    };

    const filterMajors = (schoolName: string, majors: string[]) => {
      if (!Array.isArray(majors)) return [];
      const normSchool = canonicalizeSchoolName(schoolName);
      return majors.filter(m => {
        if (!m || !m.trim()) return false;
        const key = `${normSchool}::${m.trim()}`.toLowerCase();
        return !deletedMajors.includes(key);
      });
    };

    const existingSchools = this.getSchools();
    const mergedMap = new Map<string, SchoolMajorEntry>();

    // Start with existing schools so schools missing from an older Google Sheet are never dropped
    existingSchools.forEach(s => {
      const cName = canonicalizeSchoolName(s.school);
      const key = cName.toLowerCase();
      if (key && !isExcluded(cName)) {
        mergedMap.set(key, { ...s, school: cName });
      }
    });

    // Collapse remote schools by canonical key first so duplicate pairs merge cleanly
    const collapsedRemoteMap = new Map<string, SchoolMajorEntry>();
    remoteSchools.forEach(s => {
      if (!s || !s.school || isExcluded(s.school)) return;
      const normName = canonicalizeSchoolName(s.school);
      const key = normName.toLowerCase();
      const prevRemote = collapsedRemoteMap.get(key);
      const combinedRemoteMajors = Array.from(
        new Set([
          ...(prevRemote?.majors || []),
          ...(Array.isArray(s.majors) ? s.majors : []),
        ].map(m => m.trim()).filter(Boolean))
      );
      collapsedRemoteMap.set(key, {
        ...(prevRemote || s),
        ...s,
        school: normName,
        logoUrl: s.logoUrl?.trim() || prevRemote?.logoUrl?.trim() || undefined,
        majors: isRemotePrePatch
          ? sanitizeUniversityDuplicateMajors(normName, combinedRemoteMajors)
          : combinedRemoteMajors,
      });
    });

    // Merge collapsed remote schools while strictly preserving local IndexedDB/cached logos
    collapsedRemoteMap.forEach((s, key) => {
      const normName = s.school;
      const existing = mergedMap.get(key);

      const remoteLogo = s.logoUrl?.trim() || undefined;
      if (remoteLogo && !dbStorage.isSchoolLogoDeleted(normName) && !dbStorage.getCachedSchoolLogo(normName)) {
        // Persist newly discovered remote logo locally for offline/instant access
        void dbStorage.saveSchoolLogo(normName, remoteLogo, true);
      }

      const preservedLogo = dbStorage.isSchoolLogoDeleted(normName)
        ? undefined
        : dbStorage.getCachedSchoolLogo(normName) || remoteLogo || existing?.logoUrl;

      let nextMajors = filterMajors(normName, s.majors && s.majors.length > 0 ? s.majors : existing?.majors || []);

      if (isRemotePrePatch) {
        nextMajors = sanitizeUniversityDuplicateMajors(normName, nextMajors);
        const toRemove = CATALOG_REMOVED_MAJORS[normName];
        if (toRemove) {
          const removeLower = toRemove.map(m => m.toLowerCase());
          nextMajors = nextMajors.filter(m => !removeLower.includes(m.trim().toLowerCase()));
        }
        const toAdd = CATALOG_ADDED_MAJORS[normName];
        if (toAdd) {
          toAdd.forEach(addMaj => {
            if (
              !this.isMajorDeleted(normName, addMaj) &&
              !nextMajors.some(m => m.trim().toLowerCase() === addMaj.toLowerCase())
            ) {
              nextMajors.push(addMaj);
            }
          });
        }
      }

      mergedMap.set(key, {
        ...(existing || {}),
        ...s,
        school: normName,
        logoUrl: preservedLogo,
        majors: nextMajors,
      });
    });

    if (remoteTranslations) {
      const existingTrans = this.getCustomTranslations();
      const mergedSchoolsTrans: Record<string, Partial<SchoolTranslation>> = { ...existingTrans.schools };

      for (const [rawKey, remoteVal] of Object.entries(remoteTranslations.schools || {})) {
        if (!remoteVal || isRetiredLegacySchool(rawKey)) continue;
        const normKey = canonicalizeSchoolName(rawKey);
        const prev = mergedSchoolsTrans[normKey] || mergedSchoolsTrans[rawKey] || {};
        const remoteTransLogo = remoteVal.logoUrl?.trim() || undefined;

        if (remoteTransLogo && !dbStorage.isSchoolLogoDeleted(normKey) && !dbStorage.getCachedSchoolLogo(normKey)) {
          void dbStorage.saveSchoolLogo(normKey, remoteTransLogo, true);
        }

        const preservedTransLogo = dbStorage.isSchoolLogoDeleted(normKey)
          ? undefined
          : dbStorage.getCachedSchoolLogo(normKey) || remoteTransLogo || prev.logoUrl;

        mergedSchoolsTrans[normKey] = {
          ...prev,
          ...remoteVal,
          logoUrl: preservedTransLogo,
        };
      }

      const mergedTransStore: CustomTranslationsStore = {
        schools: mergedSchoolsTrans,
        majors: { ...existingTrans.majors, ...(remoteTranslations.majors || {}) },
      };

      this.persistCustomTranslationsStore(mergedTransStore);
    }

    const shouldPushPatchToSheets = isRemotePrePatch && !this.hasPushedCatalogPatch;
    if (shouldPushPatchToSheets) {
      this.hasPushedCatalogPatch = true;
    }
    this.saveSchools(Array.from(mergedMap.values()), !shouldPushPatchToSheets);
  }

  private persistCustomTranslationsStore(store: CustomTranslationsStore): void {
    try {
      const safeSchools: Record<string, Partial<SchoolTranslation>> = {};
      for (const [k, v] of Object.entries(store.schools || {})) {
        safeSchools[k] = {
          ...v,
          logoUrl:
            v?.logoUrl && v.logoUrl.length <= MAX_SHEETS_SAFE_DATA_URL_LENGTH + 8000
              ? v.logoUrl
              : undefined,
        };
      }
      localStorage.setItem(
        STORAGE_KEY_CUSTOM_TRANS,
        JSON.stringify({ schools: safeSchools, majors: store.majors || {} })
      );
    } catch (e) {
      try {
        const slimSchools: Record<string, Partial<SchoolTranslation>> = {};
        for (const [k, v] of Object.entries(store.schools || {})) {
          const { logoUrl: _logo, ...rest } = v || {};
          slimSchools[k] = rest;
        }
        localStorage.setItem(
          STORAGE_KEY_CUSTOM_TRANS,
          JSON.stringify({ schools: slimSchools, majors: store.majors || {} })
        );
      } catch (innerErr) {
        console.warn('LocalStorage custom translations quota warning:', innerErr);
      }
    }
  }

  /**
   * Get list of all school names
   */
  getSchoolNames(): string[] {
    return this.getSchools().map(s => s.school);
  }

  /**
   * Get deduplicated list of all majors across all schools
   */
  getAllMajors(): string[] {
    const set = new Set<string>();
    this.getSchools().forEach(s => {
      s.majors.forEach(m => {
        if (m && m.trim()) set.add(m.trim());
      });
    });
    return Array.from(set);
  }

  /**
   * Get majors for a specific school
   */
  getMajorsForSchool(schoolName?: string): string[] {
    if (typeof schoolName !== 'string' || !schoolName.trim()) return [];
    const normalized = canonicalizeSchoolName(schoolName);
    const schools = this.getSchools();

    const direct = schools.find(s => canonicalizeSchoolName(s.school) === normalized);
    if (direct) return direct.majors;

    const partial = schools.find(
      s => normalizeSchoolKey(s.school).includes(normalized) || normalized.includes(normalizeSchoolKey(s.school))
    );
    if (partial) return partial.majors;

    if (normalized.includes('中信')) {
      const f = schools.find(s => s.school.includes('中信'));
      if (f) return f.majors;
    }
    if (normalized.includes('中華科')) {
      const f = schools.find(s => s.school.includes('中華'));
      if (f) return f.majors;
    }
    if (normalized.includes('中臺') || normalized.includes('中台')) {
      const f = schools.find(s => s.school.includes('中臺'));
      if (f) return f.majors;
    }
    if (normalized.includes('立志') || normalized.includes('志高級')) {
      const f = schools.find(s => s.school.includes('立志') || s.school.includes('志高級'));
      if (f) return f.majors;
    }
    if (normalized.includes('醒吾')) {
      const f = schools.find(s => s.school.includes('醒吾'));
      if (f) return f.majors;
    }

    const coreKey = normalized
      .replace(/(高雄市|臺北市|臺南市|桃園市|嘉義市|新竹縣|新竹市|臺中市|新北市|嘉義縣|雲林縣|台灣|宜蘭縣|私立|市立|區|鄉|路|段|號|臺灣大道六段|沙鹿區|湖口鄉|中山路三段|龜山區|萬壽路一段|板橋區|四川路二段58號|大寮區|泰山區|三星鄉|三星路二段|新市區|中華路49號|南港區|研究院路三段|245號|北屯區|廍子路666號|中信金學校財團法人|中華學校財團法人)/g, '')
      .trim();

    if (coreKey) {
      const matched = schools.find(
        s =>
          normalizeSchoolKey(s.school).includes(coreKey) ||
          coreKey.includes(normalizeSchoolKey(s.school).replace(/私立|市立/g, ''))
      );
      if (matched) return matched.majors;
    }

    return [];
  }

  /**
   * Get age requirement for a school
   */
  getSchoolAgeRequirement(schoolName?: string, language: Language = 'km'): string | undefined {
    if (typeof schoolName !== 'string' || !schoolName.trim()) return undefined;
    const normalized = canonicalizeSchoolName(schoolName);
    const schools = this.getSchools();
    const found = schools.find(
      s => s.school === normalized || s.school.includes(normalized) || normalized.includes(s.school)
    );
    if (found) {
      if (language === 'zh-TW') {
        if (found.ageRequirementEn.includes('16 to 22')) return '年齡 16 至 22 歲 (高中職)';
        if (found.ageRequirementEn.includes('25 & under') || found.ageRequirementEn.includes('25 and under')) {
          return '年齡 25 歲以下 (7月1日後出生) (大專與大學部)';
        }
        if (found.ageRequirementEn.includes('26 to 27')) return '年齡 26 至 27 歲 (大專與大學部)';
        return found.ageRequirementEn;
      }
      return language === 'km' ? found.ageRequirementKm : found.ageRequirementEn;
    }
    return undefined;
  }

  /**
   * Get short age badge for a school
   */
  getSchoolShortAgeBadge(schoolName?: string, language: Language = 'km'): string | undefined {
    if (typeof schoolName !== 'string' || !schoolName.trim()) return undefined;
    const normalized = canonicalizeSchoolName(schoolName);
    const schools = this.getSchools();
    const found = schools.find(
      s => s.school === normalized || s.school.includes(normalized) || normalized.includes(s.school)
    );
    if (found) {
      if (language === 'zh-TW') {
        if (found.shortAgeEn.includes('16-22')) return '16-22歲 (高中)';
        if (found.shortAgeEn.includes('≤25')) return '≤25歲 (7/1後) (大專)';
        if (found.shortAgeEn.includes('26-27')) return '26-27歲 (大專)';
        return found.shortAgeEn;
      }
      return language === 'km' ? found.shortAgeKm : found.shortAgeEn;
    }
    return undefined;
  }

  // --- CRUD for Schools ---

  /**
   * Add a new school
   */
  addSchool(
    entry: SchoolMajorEntry,
    translations?: { km?: string; en?: string; location?: string; logoUrl?: string }
  ): { success: boolean; message: string } {
    if (!entry.school || !entry.school.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះសាលា (School name is required)' };
    }
    const trimmed = canonicalizeSchoolName(entry.school);
    const list = this.getSchools();
    if (list.some(s => canonicalizeSchoolName(s.school).toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, message: 'សាលារៀននេះមានរួចហើយ (This school already exists)' };
    }

    const resolvedLogo = entry.logoUrl?.trim() || translations?.logoUrl?.trim() || undefined;
    if (resolvedLogo) {
      void dbStorage.saveSchoolLogo(trimmed, resolvedLogo, true);
    }

    const newEntry: SchoolMajorEntry = {
      school: trimmed,
      majors: (entry.majors || []).map(m => m.trim()).filter(Boolean),
      ageRequirementKm: entry.ageRequirementKm || 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
      ageRequirementEn: entry.ageRequirementEn || 'Age 16 to 22 years old (For High School)',
      shortAgeKm: entry.shortAgeKm || 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
      shortAgeEn: entry.shortAgeEn || 'Age 16-22 (High School)',
      logoUrl: resolvedLogo,
    };

    const updated = [newEntry, ...list];
    if (translations) {
      this.saveCustomTranslation(
        'school',
        trimmed,
        {
          km: translations.km || trimmed,
          en: translations.en || trimmed,
          locationKm: translations.location || 'តៃវ៉ាន់ (Taiwan)',
          locationEn: translations.location || 'Taiwan',
          logoUrl: resolvedLogo,
        },
        true
      );
    }
    this.saveSchools(updated);

    return { success: true, message: 'បានបន្ថែមសាលារៀនថ្មីជោគជ័យ (School added successfully)' };
  }

  /**
   * Update an existing school (and persist or clear its logo in IndexedDB)
   */
  updateSchool(
    oldSchoolName: string,
    updatedEntry: SchoolMajorEntry,
    translations?: { km?: string; en?: string; location?: string; logoUrl?: string },
    options?: { clearLogo?: boolean }
  ): { success: boolean; message: string } {
    const list = this.getSchools();
    const normOld = canonicalizeSchoolName(oldSchoolName);
    const index = list.findIndex(
      s => s.school === oldSchoolName || canonicalizeSchoolName(s.school) === normOld
    );
    if (index === -1) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const newName = canonicalizeSchoolName(updatedEntry.school);
    if (
      newName.toLowerCase() !== normOld.toLowerCase() &&
      list.some(s => canonicalizeSchoolName(s.school).toLowerCase() === newName.toLowerCase())
    ) {
      return { success: false, message: 'ឈ្មោះសាលានេះមានរួចហើយ (School name already exists)' };
    }

    let resolvedLogo: string | undefined;
    if (options?.clearLogo) {
      resolvedLogo = undefined;
      void dbStorage.deleteSchoolLogo(normOld);
      if (newName !== normOld) {
        void dbStorage.deleteSchoolLogo(newName);
      }
    } else {
      const incomingLogo = updatedEntry.logoUrl?.trim() || translations?.logoUrl?.trim();
      resolvedLogo =
        incomingLogo || list[index].logoUrl || dbStorage.getCachedSchoolLogo(normOld) || undefined;

      if (resolvedLogo) {
        void dbStorage.saveSchoolLogo(newName, resolvedLogo, true);
      }
      if (newName !== normOld && dbStorage.getCachedSchoolLogo(normOld)) {
        void dbStorage.deleteSchoolLogo(normOld);
        if (resolvedLogo) {
          void dbStorage.saveSchoolLogo(newName, resolvedLogo, true);
        }
      }
    }

    list[index] = {
      school: newName,
      majors: updatedEntry.majors.map(m => m.trim()).filter(Boolean),
      ageRequirementKm: updatedEntry.ageRequirementKm || list[index].ageRequirementKm,
      ageRequirementEn: updatedEntry.ageRequirementEn || list[index].ageRequirementEn,
      shortAgeKm: updatedEntry.shortAgeKm || list[index].shortAgeKm,
      shortAgeEn: updatedEntry.shortAgeEn || list[index].shortAgeEn,
      logoUrl: resolvedLogo,
    };

    if (translations) {
      this.saveCustomTranslation(
        'school',
        newName,
        {
          km: translations.km,
          en: translations.en,
          locationKm: translations.location,
          locationEn: translations.location,
          logoUrl: resolvedLogo,
        },
        true
      );
    }

    this.saveSchools(list);

    return { success: true, message: 'បានកែប្រែសាលារៀនជោគជ័យ (School updated successfully)' };
  }

  /**
   * Delete a school
   */
  deleteSchool(schoolName: string): { success: boolean; message: string } {
    const trimmed = canonicalizeSchoolName(schoolName);
    if (!trimmed) {
      return { success: false, message: 'សូមជ្រើសរើសសាលារៀនដែលត្រូវលុប' };
    }

    const deleted = this.getDeletedSchools();
    if (!deleted.some(s => canonicalizeSchoolName(s).toLowerCase() === trimmed.toLowerCase())) {
      deleted.push(trimmed);
      try {
        localStorage.setItem(STORAGE_KEY_DELETED_SCHOOLS, JSON.stringify(deleted));
      } catch (e) {
        console.warn('Error saving deleted schools:', e);
      }
    }

    const list = this.getSchools();
    const filtered = list.filter(s => canonicalizeSchoolName(s.school).toLowerCase() !== trimmed.toLowerCase());
    this.saveSchools(filtered);
    return { success: true, message: 'បានលុបសាលារៀនជោគជ័យ (School deleted successfully)' };
  }

  // --- CRUD for Majors ---

  addMajorToSchool(
    schoolName: string,
    majorName: string,
    translations?: { km?: string; en?: string }
  ): { success: boolean; message: string } {
    if (!majorName || !majorName.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះជំនាញ (Major name is required)' };
    }
    const trimmedMajor = majorName.trim();
    const normSchool = canonicalizeSchoolName(schoolName);
    const list = this.getSchools();
    const school = list.find(s => canonicalizeSchoolName(s.school) === normSchool);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const deletedMajors = this.getDeletedMajors().filter(
      m =>
        m.includes('::') &&
        m.trim().toLowerCase() !== `${normSchool}::${trimmedMajor}`.toLowerCase()
    );
    try {
      localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(deletedMajors));
    } catch (e) {
      // ignore
    }

    if (school.majors.some(m => m.toLowerCase() === trimmedMajor.toLowerCase())) {
      return { success: false, message: 'ជំនាញនេះមានរួចហើយក្នុងសាលានេះ (Major already exists in this school)' };
    }

    school.majors.push(trimmedMajor);
    if (translations) {
      this.saveCustomTranslation(
        'major',
        trimmedMajor,
        {
          km: translations.km || trimmedMajor,
          en: translations.en || trimmedMajor,
        },
        true
      );
    }
    this.saveSchools(list);

    return { success: true, message: 'បានបន្ថែមជំនាញជោគជ័យ (Major added successfully)' };
  }

  ensureSchoolAndMajor(schoolName?: string, majorName?: string): void {
    if (!schoolName || !schoolName.trim()) return;
    const trimmedSchool = canonicalizeSchoolName(schoolName);
    const trimmedMajor = majorName?.trim();

    const isExcluded = (name: string) =>
      !name ||
      name.trim() === '日興國際學校' ||
      name.trim() === 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ' ||
      name.trim() === 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' ||
      name.toLowerCase().includes('lising international') ||
      this.isSchoolDeleted(name);

    if (isExcluded(trimmedSchool)) return;

    const list = this.getSchools();
    const school = list.find(s => canonicalizeSchoolName(s.school).toLowerCase() === trimmedSchool.toLowerCase());

    if (!school) {
      this.addSchool({
        school: trimmedSchool,
        majors: trimmedMajor && !this.isMajorDeleted(trimmedSchool, trimmedMajor) ? [trimmedMajor] : [],
        ageRequirementKm: 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
        ageRequirementEn: 'Age 16 to 22 years old (For High School)',
        shortAgeKm: 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
        shortAgeEn: 'Age 16-22 (High School)',
      });
    } else if (
      trimmedMajor &&
      !this.isMajorDeleted(school.school, trimmedMajor) &&
      !school.majors.some(m => m.toLowerCase() === trimmedMajor.toLowerCase())
    ) {
      this.addMajorToSchool(school.school, trimmedMajor);
    }
  }

  updateMajorInSchool(
    schoolName: string,
    oldMajor: string,
    newMajor: string,
    translations?: { km?: string; en?: string }
  ): { success: boolean; message: string } {
    if (!newMajor || !newMajor.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះជំនាញថ្មី (New major name is required)' };
    }
    const trimmedNew = newMajor.trim();
    const normSchool = canonicalizeSchoolName(schoolName);
    const list = this.getSchools();
    const school = list.find(s => canonicalizeSchoolName(s.school) === normSchool);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const index = school.majors.indexOf(oldMajor);
    if (index === -1) {
      return { success: false, message: 'រកមិនឃើញជំនាញនេះទេ (Major not found)' };
    }

    school.majors[index] = trimmedNew;
    if (translations) {
      this.saveCustomTranslation(
        'major',
        trimmedNew,
        {
          km: translations.km,
          en: translations.en,
        },
        true
      );
    }
    this.saveSchools(list);

    return { success: true, message: 'បានកែប្រែជំនាញជោគជ័យ (Major updated successfully)' };
  }

  deleteMajorFromSchool(schoolName: string, major: string): { success: boolean; message: string } {
    const normSchool = canonicalizeSchoolName(schoolName);
    const list = this.getSchools();
    const school = list.find(s => canonicalizeSchoolName(s.school) === normSchool);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const trimmedMajor = major.trim();
    const filtered = school.majors.filter(m => m.trim().toLowerCase() !== trimmedMajor.toLowerCase());
    school.majors = filtered;

    const deletedMajors = this.getDeletedMajors().filter(m => m.includes('::'));
    const scopedKey = `${normSchool}::${trimmedMajor}`;
    if (!deletedMajors.some(m => m.toLowerCase() === scopedKey.toLowerCase())) {
      deletedMajors.push(scopedKey);
    }
    try {
      localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(deletedMajors));
    } catch (e) {
      // ignore
    }

    this.saveSchools(list);
    return { success: true, message: 'បានលុបជំនាញជោគជ័យ (Major deleted successfully)' };
  }

  // --- Custom Translations Management ---

  getCustomTranslations(): CustomTranslationsStore {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_TRANS);
    let store: CustomTranslationsStore = { schools: {}, majors: {} };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        store = {
          schools: parsed?.schools || {},
          majors: parsed?.majors || {},
        };
      } catch (e) {
        console.error('Failed to parse custom translations:', e);
      }
    }

    // Enrich custom translations with any cached IndexedDB school logos
    const enrichedSchools: Record<string, Partial<SchoolTranslation>> = {};
    for (const [k, v] of Object.entries(store.schools)) {
      if (!v || isRetiredLegacySchool(k)) continue;
      const canon = canonicalizeSchoolName(k);
      const prev = enrichedSchools[canon] || {};
      if (dbStorage.isSchoolLogoDeleted(canon)) {
        enrichedSchools[canon] = { ...prev, ...v, logoUrl: undefined };
      } else {
        const cached = dbStorage.getCachedSchoolLogo(canon);
        enrichedSchools[canon] = { ...prev, ...v, logoUrl: cached || v.logoUrl || prev.logoUrl };
      }
    }

    return {
      schools: enrichedSchools,
      majors: store.majors,
    };
  }

  saveCustomTranslation(
    type: 'school' | 'major',
    key: string,
    trans: Partial<SchoolTranslation | MajorTranslation>,
    skipRemote = false
  ): void {
    const store = this.getCustomTranslations();
    if (type === 'school') {
      const canonKey = canonicalizeSchoolName(key);
      store.schools[canonKey] = { ...(store.schools[canonKey] || {}), ...trans };
    } else {
      store.majors[key] = { ...(store.majors[key] || {}), ...trans };
    }
    this.persistCustomTranslationsStore(store);

    if (!skipRemote && this.syncRemoteHandler) {
      try {
        this.syncRemoteHandler(this.getSchools(), this.getCustomTranslations());
      } catch (e) {
        console.warn('Error in syncRemoteHandler:', e);
      }
    }
  }

  /**
   * Reset all schools and majors to factory defaults
   */
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY_SCHOOLS);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_TRANS);
    localStorage.removeItem(STORAGE_KEY_DELETED_SCHOOLS);
    localStorage.removeItem(STORAGE_KEY_DELETED_MAJORS);
    localStorage.removeItem(STORAGE_KEY_CATALOG_PATCH);
    this.runCatalogMigrationIfNeeded();
    this.notify();
  }
}

export const schoolMajorService = new SchoolMajorService();
