/**
 * Dynamic School and Major Management Service
 * Provides full CRUD operations for Schools and Majors with persistent localStorage storage.
 */

import { SchoolMajorEntry, SCHOOL_MAJORS_DATA } from '../constants/studentOptions';
import { AUTHENTIC_SCHOOL_MAJORS } from '../data/detailedSchoolsData';
import { SchoolTranslation, MajorTranslation } from '../utils/schoolMajorTranslations';
import { Language } from '../types';
import { dbStorage } from './dbStorage';

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
    window.dispatchEvent(new CustomEvent('school_majors_data_updated'));
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
    const name = schoolName.trim().toLowerCase();
    return this.getDeletedSchools().some(s => s.trim().toLowerCase() === name);
  }

  isMajorDeleted(schoolName: string, majorName: string): boolean {
    if (!majorName) return false;
    const mName = majorName.trim().toLowerCase();
    const key = `${schoolName.trim()}::${majorName.trim()}`.toLowerCase();
    return this.getDeletedMajors().some(m => {
      const lower = m.trim().toLowerCase();
      return lower === mName || lower === key;
    });
  }

  /**
   * Get all schools with their majors
   */
  getSchools(): SchoolMajorEntry[] {
    const deletedSchools = this.getDeletedSchools().map(s => s.trim().toLowerCase());
    const deletedMajors = this.getDeletedMajors().map(m => m.trim().toLowerCase());

    const isExcluded = (name: string) => {
      if (!name) return true;
      const trimmed = name.trim();
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
      return majors.filter(m => {
        if (!m || !m.trim()) return false;
        const mLower = m.trim().toLowerCase();
        const key = `${schoolName.trim()}::${m.trim()}`.toLowerCase();
        return !deletedMajors.includes(mLower) && !deletedMajors.includes(key);
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

    // Merge authentic school majors for all 59 partner schools
    const listMap = new Map<string, SchoolMajorEntry>();
    baseList.forEach(item => {
      if (item && item.school) {
        listMap.set(item.school.trim(), { ...item });
      }
    });

    for (const [schName, authMajors] of Object.entries(AUTHENTIC_SCHOOL_MAJORS)) {
      const existing = listMap.get(schName);
      const isUniv = schName.includes('大學') || schName.includes('學院');
      if (!existing) {
        listMap.set(schName, {
          school: schName,
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
        const isGenericFallback = currentMajors.length === 5 && 
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
      .map(s => ({
        ...s,
        majors: filterMajors(s.school, s.majors)
      }));
  }

  /**
   * Save schools data to localStorage and optionally sync to remote
   */
  saveSchools(data: SchoolMajorEntry[], skipRemote = false): void {
    localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(data));
    this.notify();
    if (!skipRemote && this.syncRemoteHandler) {
      try {
        this.syncRemoteHandler(data, this.getCustomTranslations());
      } catch (e) {
        console.warn('Error in syncRemoteHandler:', e);
      }
    }
  }

  /**
   * Update schools and translations from Google Sheets
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
      localStorage.setItem(STORAGE_KEY_DELETED_SCHOOLS, JSON.stringify(merged));
    }
    if (Array.isArray(remoteDeletedMajors) && remoteDeletedMajors.length > 0) {
      const cur = this.getDeletedMajors();
      const merged = Array.from(new Set([...cur, ...remoteDeletedMajors]));
      localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(merged));
    }

    if (!Array.isArray(remoteSchools) || remoteSchools.length === 0) return;
    const deletedSchools = this.getDeletedSchools().map(s => s.trim().toLowerCase());
    const deletedMajors = this.getDeletedMajors().map(m => m.trim().toLowerCase());

    const isExcluded = (name: string) => {
      if (!name) return true;
      const trimmed = name.trim();
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
      return majors.filter(m => {
        if (!m || !m.trim()) return false;
        const mLower = m.trim().toLowerCase();
        const key = `${schoolName.trim()}::${m.trim()}`.toLowerCase();
        return !deletedMajors.includes(mLower) && !deletedMajors.includes(key);
      });
    };

    const existingSchools = this.getSchools();
    const existingMap = new Map(existingSchools.map(s => [s.school.trim().toLowerCase(), s]));

    const filtered = remoteSchools
      .filter(s => !isExcluded(s.school))
      .map(s => {
        const existing = existingMap.get(s.school.trim().toLowerCase());
        const logo = s.logoUrl || existing?.logoUrl || dbStorage.getCachedSchoolLogo(s.school);
        return {
          ...s,
          logoUrl: logo,
          majors: filterMajors(s.school, s.majors)
        };
      });

    if (remoteTranslations) {
      const existing = this.getCustomTranslations();
      const merged: CustomTranslationsStore = {
        schools: { ...existing.schools, ...(remoteTranslations.schools || {}) },
        majors: { ...existing.majors, ...(remoteTranslations.majors || {}) },
      };
      localStorage.setItem(STORAGE_KEY_CUSTOM_TRANS, JSON.stringify(merged));
    }
    this.saveSchools(filtered, true);
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
    if (!schoolName || !schoolName.trim()) return [];
    const cleanSpacing = (str: string) => str.replace(/\s+/g, ' ').trim();
    const normalized = cleanSpacing(schoolName);
    const schools = this.getSchools();

    // 1. Direct or spacing-cleaned match
    const direct = schools.find(s => cleanSpacing(s.school) === normalized);
    if (direct) return direct.majors;

    // 2. Substring matching
    const partial = schools.find(s => cleanSpacing(s.school).includes(normalized) || normalized.includes(cleanSpacing(s.school)));
    if (partial) return partial.majors;

    // 3. Known shortcuts
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

    // 4. Normalized key token match (strip geographic prefixes)
    const coreKey = normalized
      .replace(/(高雄市|臺北市|臺南市|桃園市|嘉義市|新竹縣|新竹市|臺中市|新北市|嘉義縣|雲林縣|台灣|宜蘭縣|私立|市立|區|鄉|路|段|號|臺灣大道六段|沙鹿區|湖口鄉|中山路三段|龜山區|萬壽路一段|板橋區|四川路二段58號|大寮區|泰山區|三星鄉|三星路二段|新市區|中華路49號|南港區|研究院路三段|245號|北屯區|廍子路666號|中信金學校財團法人|中華學校財團法人)/g, '')
      .trim();

    if (coreKey) {
      const matched = schools.find(s => cleanSpacing(s.school).includes(coreKey) || coreKey.includes(cleanSpacing(s.school).replace(/私立|市立/g, '')));
      if (matched) return matched.majors;
    }

    return [];
  }

  /**
   * Get age requirement for a school
   */
  getSchoolAgeRequirement(schoolName?: string, language: Language = 'km'): string | undefined {
    if (!schoolName || !schoolName.trim()) return undefined;
    const normalized = schoolName.trim();
    const schools = this.getSchools();
    const found = schools.find(s => s.school === normalized || s.school.includes(normalized) || normalized.includes(s.school));
    if (found) {
      if (language === 'zh-TW') {
        if (found.ageRequirementEn.includes('16 to 22')) return '年齡 16 至 22 歲 (高中職)';
        if (found.ageRequirementEn.includes('25 & under')) return '年齡 25 歲以下 (7月1日後出生) (大專與大學部)';
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
    if (!schoolName || !schoolName.trim()) return undefined;
    const normalized = schoolName.trim();
    const schools = this.getSchools();
    const found = schools.find(s => s.school === normalized || s.school.includes(normalized) || normalized.includes(s.school));
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
  addSchool(entry: SchoolMajorEntry, translations?: { km?: string; en?: string; location?: string; logoUrl?: string }): { success: boolean; message: string } {
    if (!entry.school || !entry.school.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះសាលា (School name is required)' };
    }
    const trimmed = entry.school.trim();
    const list = this.getSchools();
    if (list.some(s => s.school.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, message: 'សាលារៀននេះមានរួចហើយ (This school already exists)' };
    }

    const newEntry: SchoolMajorEntry = {
      school: trimmed,
      majors: (entry.majors || []).map(m => m.trim()).filter(Boolean),
      ageRequirementKm: entry.ageRequirementKm || 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
      ageRequirementEn: entry.ageRequirementEn || 'Age 16 to 22 years old (For High School)',
      shortAgeKm: entry.shortAgeKm || 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
      shortAgeEn: entry.shortAgeEn || 'Age 16-22 (High School)',
      logoUrl: entry.logoUrl || translations?.logoUrl,
    };

    const updated = [newEntry, ...list];
    this.saveSchools(updated);

    if (translations) {
      this.saveCustomTranslation('school', trimmed, {
        km: translations.km || trimmed,
        en: translations.en || trimmed,
        locationKm: translations.location || 'តៃវ៉ាន់ (Taiwan)',
        locationEn: translations.location || 'Taiwan',
        logoUrl: translations.logoUrl || entry.logoUrl,
      });
    }

    return { success: true, message: 'បានបន្ថែមសាលារៀនថ្មីជោគជ័យ (School added successfully)' };
  }

  /**
   * Update an existing school
   */
  updateSchool(oldSchoolName: string, updatedEntry: SchoolMajorEntry, translations?: { km?: string; en?: string; location?: string; logoUrl?: string }): { success: boolean; message: string } {
    const list = this.getSchools();
    const index = list.findIndex(s => s.school === oldSchoolName);
    if (index === -1) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const newName = updatedEntry.school.trim();
    if (newName !== oldSchoolName && list.some(s => s.school.toLowerCase() === newName.toLowerCase())) {
      return { success: false, message: 'ឈ្មោះសាលានេះមានរួចហើយ (School name already exists)' };
    }

    const resolvedLogo = updatedEntry.logoUrl || translations?.logoUrl || list[index].logoUrl;

    list[index] = {
      school: newName,
      majors: updatedEntry.majors.map(m => m.trim()).filter(Boolean),
      ageRequirementKm: updatedEntry.ageRequirementKm || list[index].ageRequirementKm,
      ageRequirementEn: updatedEntry.ageRequirementEn || list[index].ageRequirementEn,
      shortAgeKm: updatedEntry.shortAgeKm || list[index].shortAgeKm,
      shortAgeEn: updatedEntry.shortAgeEn || list[index].shortAgeEn,
      logoUrl: resolvedLogo,
    };

    this.saveSchools(list);

    if (translations) {
      this.saveCustomTranslation('school', newName, {
        km: translations.km,
        en: translations.en,
        locationKm: translations.location,
        locationEn: translations.location,
        logoUrl: resolvedLogo,
      });
    }

    return { success: true, message: 'បានកែប្រែសាលារៀនជោគជ័យ (School updated successfully)' };
  }

  /**
   * Delete a school
   */
  deleteSchool(schoolName: string): { success: boolean; message: string } {
    const trimmed = (schoolName || '').trim();
    if (!trimmed) {
      return { success: false, message: 'សូមជ្រើសរើសសាលារៀនដែលត្រូវលុប' };
    }

    // 1. Add to permanent deletedSchools tombstone
    const deleted = this.getDeletedSchools();
    if (!deleted.some(s => s.trim().toLowerCase() === trimmed.toLowerCase())) {
      deleted.push(trimmed);
      localStorage.setItem(STORAGE_KEY_DELETED_SCHOOLS, JSON.stringify(deleted));
    }

    const list = this.getSchools();
    const filtered = list.filter(s => s.school.trim().toLowerCase() !== trimmed.toLowerCase());
    this.saveSchools(filtered);
    return { success: true, message: 'បានលុបសាលារៀនជោគជ័យ (School deleted successfully)' };
  }

  // --- CRUD for Majors ---

  /**
   * Add a major to a specific school
   */
  addMajorToSchool(schoolName: string, majorName: string, translations?: { km?: string; en?: string }): { success: boolean; message: string } {
    if (!majorName || !majorName.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះជំនាញ (Major name is required)' };
    }
    const trimmedMajor = majorName.trim();
    const list = this.getSchools();
    const school = list.find(s => s.school === schoolName);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    // If previously deleted, un-delete it
    const deletedMajors = this.getDeletedMajors().filter(
      m => m.trim().toLowerCase() !== trimmedMajor.toLowerCase() &&
           m.trim().toLowerCase() !== `${schoolName.trim()}::${trimmedMajor}`.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(deletedMajors));

    if (school.majors.some(m => m.toLowerCase() === trimmedMajor.toLowerCase())) {
      return { success: false, message: 'ជំនាញនេះមានរួចហើយក្នុងសាលានេះ (Major already exists in this school)' };
    }

    school.majors.push(trimmedMajor);
    this.saveSchools(list);

    if (translations) {
      this.saveCustomTranslation('major', trimmedMajor, {
        km: translations.km || trimmedMajor,
        en: translations.en || trimmedMajor,
      });
    }

    return { success: true, message: 'បានបន្ថែមជំនាញជោគជ័យ (Major added successfully)' };
  }

  /**
   * Register or ensure a school and/or major exists in the catalog
   */
  ensureSchoolAndMajor(schoolName?: string, majorName?: string): void {
    if (!schoolName || !schoolName.trim()) return;
    const trimmedSchool = schoolName.trim();
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
    const school = list.find(s => s.school.toLowerCase() === trimmedSchool.toLowerCase());

    if (!school) {
      this.addSchool({
        school: trimmedSchool,
        majors: (trimmedMajor && !this.isMajorDeleted(trimmedSchool, trimmedMajor)) ? [trimmedMajor] : [],
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

  /**
   * Update a major in a school (or across all schools)
   */
  updateMajorInSchool(schoolName: string, oldMajor: string, newMajor: string, translations?: { km?: string; en?: string }): { success: boolean; message: string } {
    if (!newMajor || !newMajor.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះជំនាញថ្មី (New major name is required)' };
    }
    const trimmedNew = newMajor.trim();
    const list = this.getSchools();
    const school = list.find(s => s.school === schoolName);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const index = school.majors.indexOf(oldMajor);
    if (index === -1) {
      return { success: false, message: 'រកមិនឃើញជំនាញនេះទេ (Major not found)' };
    }

    school.majors[index] = trimmedNew;
    this.saveSchools(list);

    if (translations) {
      this.saveCustomTranslation('major', trimmedNew, {
        km: translations.km,
        en: translations.en,
      });
    }

    return { success: true, message: 'បានកែប្រែជំនាញជោគជ័យ (Major updated successfully)' };
  }

  /**
   * Delete a major from a school
   */
  deleteMajorFromSchool(schoolName: string, major: string): { success: boolean; message: string } {
    const list = this.getSchools();
    const school = list.find(s => s.school === schoolName);
    if (!school) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const trimmedMajor = major.trim();
    const filtered = school.majors.filter(m => m.trim().toLowerCase() !== trimmedMajor.toLowerCase());
    school.majors = filtered;

    // Record in deletedMajors tombstone
    const deletedMajors = this.getDeletedMajors();
    const key1 = `${schoolName.trim()}::${trimmedMajor}`;
    if (!deletedMajors.some(m => m.toLowerCase() === key1.toLowerCase())) {
      deletedMajors.push(key1);
    }
    if (!deletedMajors.some(m => m.toLowerCase() === trimmedMajor.toLowerCase())) {
      deletedMajors.push(trimmedMajor);
    }
    localStorage.setItem(STORAGE_KEY_DELETED_MAJORS, JSON.stringify(deletedMajors));

    this.saveSchools(list);
    return { success: true, message: 'បានលុបជំនាញជោគជ័យ (Major deleted successfully)' };
  }

  // --- Custom Translations Management ---

  getCustomTranslations(): CustomTranslationsStore {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_TRANS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse custom translations:', e);
      }
    }
    return { schools: {}, majors: {} };
  }

  saveCustomTranslation(type: 'school' | 'major', key: string, trans: Partial<SchoolTranslation | MajorTranslation>): void {
    const store = this.getCustomTranslations();
    if (type === 'school') {
      store.schools[key] = { ...(store.schools[key] || {}), ...trans };
    } else {
      store.majors[key] = { ...(store.majors[key] || {}), ...trans };
    }
    localStorage.setItem(STORAGE_KEY_CUSTOM_TRANS, JSON.stringify(store));
    if (this.syncRemoteHandler) {
      try {
        this.syncRemoteHandler(this.getSchools(), store);
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
