/**
 * Dynamic School and Major Management Service
 * Provides full CRUD operations for Schools and Majors with persistent localStorage storage.
 */

import { SchoolMajorEntry, SCHOOL_MAJORS_DATA } from '../constants/studentOptions';
import { SchoolTranslation, MajorTranslation } from '../utils/schoolMajorTranslations';
import { Language } from '../types';

const STORAGE_KEY_SCHOOLS = 'sms_schools_majors_list_v2';
const STORAGE_KEY_CUSTOM_TRANS = 'sms_custom_translations_v2';

export interface CustomTranslationsStore {
  schools: Record<string, Partial<SchoolTranslation>>;
  majors: Record<string, Partial<MajorTranslation>>;
}

class SchoolMajorService {
  private listeners: Set<() => void> = new Set();

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

  /**
   * Get all schools with their majors
   */
  getSchools(): SchoolMajorEntry[] {
    const isExcluded = (name: string) => 
      !name || 
      name.trim() === '日興國際學校' || 
      name.trim() === 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' ||
      name.toLowerCase().includes('lising international');

    const saved = localStorage.getItem(STORAGE_KEY_SCHOOLS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(s => !isExcluded(s.school));
          if (filtered.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(filtered));
          }
          return filtered;
        }
      } catch (e) {
        console.error('Failed to parse stored schools data:', e);
      }
    }
    return SCHOOL_MAJORS_DATA.filter(s => !isExcluded(s.school));
  }

  /**
   * Save schools data to localStorage
   */
  saveSchools(data: SchoolMajorEntry[]): void {
    localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(data));
    this.notify();
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
    const normalized = schoolName.trim();
    const schools = this.getSchools();

    // 1. Direct match
    const direct = schools.find(s => s.school === normalized);
    if (direct) return direct.majors;

    // 2. Partial match
    const partial = schools.find(s => s.school.includes(normalized) || normalized.includes(s.school));
    if (partial) return partial.majors;

    // 3. Normalized key token match (strip geographic prefixes)
    const coreKey = normalized
      .replace(/(高雄市|臺南市|桃園市|嘉義市|新竹縣|臺中市|新北市|嘉義縣|台灣|宜蘭縣|私立|區|鄉|路|段|號|臺灣大道六段|沙鹿區|湖口鄉|中山路三段|龜山區|萬壽路一段|板橋區|四川路二段58號|大寮區|泰山區|三星鄉|三星路二段)/g, '')
      .trim();

    if (coreKey) {
      const matched = schools.find(s => s.school.includes(coreKey) || coreKey.includes(s.school.replace(/私立/g, '')));
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
  addSchool(entry: SchoolMajorEntry, translations?: { km?: string; en?: string; location?: string }): { success: boolean; message: string } {
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
    };

    const updated = [newEntry, ...list];
    this.saveSchools(updated);

    if (translations) {
      this.saveCustomTranslation('school', trimmed, {
        km: translations.km || trimmed,
        en: translations.en || trimmed,
        locationKm: translations.location || 'តៃវ៉ាន់ (Taiwan)',
        locationEn: translations.location || 'Taiwan',
      });
    }

    return { success: true, message: 'បានបន្ថែមសាលារៀនថ្មីជោគជ័យ (School added successfully)' };
  }

  /**
   * Update an existing school
   */
  updateSchool(oldSchoolName: string, updatedEntry: SchoolMajorEntry, translations?: { km?: string; en?: string; location?: string }): { success: boolean; message: string } {
    const list = this.getSchools();
    const index = list.findIndex(s => s.school === oldSchoolName);
    if (index === -1) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }

    const newName = updatedEntry.school.trim();
    if (newName !== oldSchoolName && list.some(s => s.school.toLowerCase() === newName.toLowerCase())) {
      return { success: false, message: 'ឈ្មោះសាលានេះមានរួចហើយ (School name already exists)' };
    }

    list[index] = {
      school: newName,
      majors: updatedEntry.majors.map(m => m.trim()).filter(Boolean),
      ageRequirementKm: updatedEntry.ageRequirementKm || list[index].ageRequirementKm,
      ageRequirementEn: updatedEntry.ageRequirementEn || list[index].ageRequirementEn,
      shortAgeKm: updatedEntry.shortAgeKm || list[index].shortAgeKm,
      shortAgeEn: updatedEntry.shortAgeEn || list[index].shortAgeEn,
    };

    this.saveSchools(list);

    if (translations) {
      this.saveCustomTranslation('school', newName, {
        km: translations.km,
        en: translations.en,
        locationKm: translations.location,
        locationEn: translations.location,
      });
    }

    return { success: true, message: 'បានកែប្រែសាលារៀនជោគជ័យ (School updated successfully)' };
  }

  /**
   * Delete a school
   */
  deleteSchool(schoolName: string): { success: boolean; message: string } {
    const list = this.getSchools();
    const filtered = list.filter(s => s.school !== schoolName);
    if (filtered.length === list.length) {
      return { success: false, message: 'រកមិនឃើញសាលារៀននេះទេ (School not found)' };
    }
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
      name.trim() === 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' ||
      name.toLowerCase().includes('lising international');

    if (isExcluded(trimmedSchool)) return;

    const list = this.getSchools();
    const school = list.find(s => s.school.toLowerCase() === trimmedSchool.toLowerCase());

    if (!school) {
      this.addSchool({
        school: trimmedSchool,
        majors: trimmedMajor ? [trimmedMajor] : [],
        ageRequirementKm: 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
        ageRequirementEn: 'Age 16 to 22 years old (For High School)',
        shortAgeKm: 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)',
        shortAgeEn: 'Age 16-22 (High School)',
      });
    } else if (trimmedMajor && !school.majors.some(m => m.toLowerCase() === trimmedMajor.toLowerCase())) {
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

    const filtered = school.majors.filter(m => m !== major);
    if (filtered.length === school.majors.length) {
      return { success: false, message: 'រកមិនឃើញជំនាញនេះទេ (Major not found)' };
    }

    school.majors = filtered;
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
