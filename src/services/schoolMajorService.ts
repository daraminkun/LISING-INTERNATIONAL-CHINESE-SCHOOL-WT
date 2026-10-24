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
import { normalizeSchoolKey, MAX_SHEETS_SAFE_DATA_URL_LENGTH } from '../utils/imageUtils';

const STORAGE_KEY_SCHOOLS = 'sms_schools_majors_list_v2';
const STORAGE_KEY_CUSTOM_TRANS = 'sms_custom_translations_v2';
const STORAGE_KEY_DELETED_SCHOOLS = 'sms_deleted_schools_v3';
const STORAGE_KEY_DELETED_MAJORS = 'sms_deleted_majors_v3';

export interface CustomTranslationsStore {
  schools: Record<string, Partial<SchoolTranslation>>;
  majors: Record<string, Partial<MajorTranslation>>;
}

class SchoolMajorService {
  private listeners: Set<() => void> = new Set();
  private syncRemoteHandler?: ((schools: SchoolMajorEntry[], translations: CustomTranslationsStore) => void) | null;

  constructor() {
    dbStorage.whenReady().then(() => {
      this.notify();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('school_logos_updated', () => {
        this.notify();
      });
    }
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
    const name = normalizeSchoolKey(schoolName).toLowerCase();
    return this.getDeletedSchools().some(s => normalizeSchoolKey(s).toLowerCase() === name);
  }

  isMajorDeleted(schoolName: string, majorName: string): boolean {
    if (!majorName) return false;
    const mName = majorName.trim().toLowerCase();
    const key = `${normalizeSchoolKey(schoolName)}::${majorName.trim()}`.toLowerCase();
    return this.getDeletedMajors().some(m => {
      const lower = m.trim().toLowerCase();
      return lower === mName || lower === key;
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
    const deletedSchools = this.getDeletedSchools().map(s => normalizeSchoolKey(s).toLowerCase());
    const deletedMajors = this.getDeletedMajors().map(m => m.trim().toLowerCase());
    const customTrans = this.getCustomTranslations();

    const isExcluded = (name: string) => {
      if (!name) return true;
      const trimmed = normalizeSchoolKey(name);
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
      const normSchool = normalizeSchoolKey(schoolName);
      return majors.filter(m => {
        if (!m || !m.trim()) return false;
        const mLower = m.trim().toLowerCase();
        const key = `${normSchool}::${m.trim()}`.toLowerCase();
        const rawKey = `${schoolName.trim()}::${m.trim()}`.toLowerCase();
        return !deletedMajors.includes(mLower) && !deletedMajors.includes(key) && !deletedMajors.includes(rawKey);
      });
    };

    let baseList: SchoolMajorEntry[] = [];
    const saved = localStorage.getItem(STORAGE_KEY_SCHOOLS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored schools data:', e);
      }
    }
    if (baseList.length === 0) {
      baseList = [...SCHOOL_MAJORS_DATA];
    }

    // Merge authentic school majors for all 59 partner schools using normalized keys
    const listMap = new Map<string, SchoolMajorEntry>();
    baseList.forEach(item => {
      if (item && item.school) {
        const norm = normalizeSchoolKey(item.school);
        listMap.set(norm, { ...item, school: norm });
      }
    });

    for (const [schName, authMajors] of Object.entries(AUTHENTIC_SCHOOL_MAJORS)) {
      const normName = normalizeSchoolKey(schName);
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
      const cur = this.getDeletedMajors();
      const merged = Array.from(new Set([...cur, ...remoteDeletedMajors]));
      try {
        localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to persist deleted majors:', e);
      }
    }

    if (!Array.isArray(remoteSchools) || remoteSchools.length === 0) return;
    const deletedSchools = this.getDeletedSchools().map(s => normalizeSchoolKey(s).toLowerCase());
    const deletedMajors = this.getDeletedMajors().map(m => m.trim().toLowerCase());

    const isExcluded = (name: string) => {
      if (!name) return true;
      const trimmed = normalizeSchoolKey(name);
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
      const normSchool = normalizeSchoolKey(schoolName);
      return majors.filter(m => {
        if (!m || !m.trim()) return false;
        const mLower = m.trim().toLowerCase();
        const key = `${normSchool}::${m.trim()}`.toLowerCase();
        return !deletedMajors.includes(mLower) && !deletedMajors.includes(key);
      });
    };

    const existingSchools = this.getSchools();
    const mergedMap = new Map<string, SchoolMajorEntry>();

    // Start with existing schools so schools missing from an older Google Sheet are never dropped
    existingSchools.forEach(s => {
      const key = normalizeSchoolKey(s.school).toLowerCase();
      if (key && !isExcluded(s.school)) {
        mergedMap.set(key, { ...s, school: normalizeSchoolKey(s.school) });
      }
    });

    // Merge remote schools while strictly preserving local IndexedDB/cached logos
    remoteSchools.forEach(s => {
      if (!s || !s.school || isExcluded(s.school)) return;
      const normName = normalizeSchoolKey(s.school);
      const key = normName.toLowerCase();
      const existing = mergedMap.get(key);

      const remoteLogo = s.logoUrl?.trim() || undefined;
      if (remoteLogo && !dbStorage.isSchoolLogoDeleted(normName) && !dbStorage.getCachedSchoolLogo(normName)) {
        // Persist newly discovered remote logo locally for offline/instant access
        void dbStorage.saveSchoolLogo(normName, remoteLogo, true);
      }

      const preservedLogo = dbStorage.isSchoolLogoDeleted(normName)
        ? undefined
        : dbStorage.getCachedSchoolLogo(normName) || remoteLogo || existing?.logoUrl;

      mergedMap.set(key, {
        ...(existing || {}),
        ...s,
        school: normName,
        logoUrl: preservedLogo,
        majors: filterMajors(normName, s.majors && s.majors.length > 0 ? s.majors : existing?.majors || []),
      });
    });

    if (remoteTranslations) {
      const existingTrans = this.getCustomTranslations();
      const mergedSchoolsTrans: Record<string, Partial<SchoolTranslation>> = { ...existingTrans.schools };

      for (const [rawKey, remoteVal] of Object.entries(remoteTranslations.schools || {})) {
        if (!remoteVal) continue;
        const normKey = normalizeSchoolKey(rawKey);
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

    this.saveSchools(Array.from(mergedMap.values()), true);
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
    const normalized = normalizeSchoolKey(schoolName);
    const schools = this.getSchools();

    const direct = schools.find(s => normalizeSchoolKey(s.school) === normalized);
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
      const f = schools.find(s => s.school.includes('志高級'));
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
    const normalized = normalizeSchoolKey(schoolName);
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
    const normalized = normalizeSchoolKey(schoolName);
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
    const trimmed = normalizeSchoolKey(entry.school);
    const list = this.getSchools();
    if (list.some(s => normalizeSchoolKey(s.school).toLowerCase() === trimmed.toLowerCase())) {
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
    const normOld = normalizeSchoolKey(oldSchoolName);
    const index = list.findIndex(
      s => s.school === oldSchoolName || normalizeSchoolKey(s.school) === normOld
    );
    if (index === -1) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const newName = normalizeSchoolKey(updatedEntry.school);
    if (
      newName.toLowerCase() !== normOld.toLowerCase() &&
      list.some(s => normalizeSchoolKey(s.school).toLowerCase() === newName.toLowerCase())
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
    const trimmed = normalizeSchoolKey(schoolName);
    if (!trimmed) {
      return { success: false, message: 'សូមជ្រើសរើសសាលារៀនដែលត្រូវលុប' };
    }

    const deleted = this.getDeletedSchools();
    if (!deleted.some(s => normalizeSchoolKey(s).toLowerCase() === trimmed.toLowerCase())) {
      deleted.push(trimmed);
      try {
        localStorage.setItem(STORAGE_KEY_DELETED_SCHOOLS, JSON.stringify(deleted));
      } catch (e) {
        console.warn('Error saving deleted schools:', e);
      }
    }

    const list = this.getSchools();
    const filtered = list.filter(s => normalizeSchoolKey(s.school).toLowerCase() !== trimmed.toLowerCase());
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
    const normSchool = normalizeSchoolKey(schoolName);
    const list = this.getSchools();
    const school = list.find(s => normalizeSchoolKey(s.school) === normSchool);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const deletedMajors = this.getDeletedMajors().filter(
      m =>
        m.trim().toLowerCase() !== trimmedMajor.toLowerCase() &&
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
    const trimmedSchool = normalizeSchoolKey(schoolName);
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
    const school = list.find(s => normalizeSchoolKey(s.school).toLowerCase() === trimmedSchool.toLowerCase());

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
    const normSchool = normalizeSchoolKey(schoolName);
    const list = this.getSchools();
    const school = list.find(s => normalizeSchoolKey(s.school) === normSchool);
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
    const normSchool = normalizeSchoolKey(schoolName);
    const list = this.getSchools();
    const school = list.find(s => normalizeSchoolKey(s.school) === normSchool);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const trimmedMajor = major.trim();
    const filtered = school.majors.filter(m => m.trim().toLowerCase() !== trimmedMajor.toLowerCase());
    school.majors = filtered;

    const deletedMajors = this.getDeletedMajors();
    const key1 = `${normSchool}::${trimmedMajor}`;
    if (!deletedMajors.some(m => m.toLowerCase() === key1.toLowerCase())) {
      deletedMajors.push(key1);
    }
    if (!deletedMajors.some(m => m.toLowerCase() === trimmedMajor.toLowerCase())) {
      deletedMajors.push(trimmedMajor);
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
    const enrichedSchools: Record<string, Partial<SchoolTranslation>> = { ...store.schools };
    for (const [k, v] of Object.entries(enrichedSchools)) {
      const norm = normalizeSchoolKey(k);
      if (dbStorage.isSchoolLogoDeleted(norm)) {
        enrichedSchools[k] = { ...v, logoUrl: undefined };
      } else {
        const cached = dbStorage.getCachedSchoolLogo(norm);
        if (cached) {
          enrichedSchools[k] = { ...v, logoUrl: cached };
        }
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
      const normKey = normalizeSchoolKey(key);
      store.schools[normKey] = { ...(store.schools[normKey] || {}), ...trans };
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
    this.notify();
  }
}

export const schoolMajorService = new SchoolMajorService();
