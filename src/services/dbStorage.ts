/**
 * High-Capacity Persistent IndexedDB Storage Layer
 * Safely persists binary assets (Student Attachment Documents, School Logos, Institution Settings)
 * with synchronous localStorage mirroring for school logos & institution settings so uploaded
 * logos appear instantaneously on page refresh and NEVER disappear during remote Google Sheets sync.
 */

import { StudentDocuments } from '../types';
import { normalizeSchoolKey, MAX_SHEETS_SAFE_DATA_URL_LENGTH } from '../utils/imageUtils';

const DB_NAME = 'sms_secure_storage_v1';
const DB_VERSION = 1;

const STORE_DOCUMENTS = 'student_documents';
const STORE_SCHOOL_LOGOS = 'school_logos';
const STORE_INSTITUTION = 'institution_settings';

const LS_SCHOOL_LOGOS_BACKUP = 'sms_school_logos_backup_v1';
const LS_DELETED_SCHOOL_LOGOS = 'sms_deleted_school_logos_v1';
const LS_INSTITUTION_BACKUP = 'sms_institution_settings_v1';

export interface InstitutionSettings {
  nameKm: string;
  nameZh: string;
  nameEn: string;
  shortName: string;
  taglineKm?: string;
  taglineEn?: string;
  logoUrl?: string;
  updatedAt?: string;
}

export const DEFAULT_INSTITUTION_SETTINGS: InstitutionSettings = {
  nameKm: 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ',
  nameZh: '日興國際學校',
  nameEn: 'LISING INTERNATIONAL CHINESE SCHOOL',
  shortName: 'LSIS',
  taglineKm: 'គ្រឹះស្ថានអប់រំផ្លូវការ',
  taglineEn: 'Official Educational Institution',
  logoUrl: '/logo.jpg',
  updatedAt: new Date().toISOString(),
};

class DBStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryDocuments: Map<string, StudentDocuments> = new Map();
  private memorySchoolLogos: Map<string, string> = new Map();
  private deletedSchoolLogos: Set<string> = new Set();
  private memoryInstitution: InstitutionSettings = { ...DEFAULT_INSTITUTION_SETTINGS };
  private isReady: boolean = false;
  private readyPromise: Promise<void>;

  constructor() {
    this.loadSyncBackups();
    this.readyPromise = this.init();
  }

  /**
   * Synchronously hydrates lightweight backups from localStorage before IndexedDB opens,
   * preventing initial-render flicker or premature overwrite by remote sync.
   */
  private loadSyncBackups(): void {
    if (typeof window === 'undefined') return;

    try {
      const savedInst = localStorage.getItem(LS_INSTITUTION_BACKUP);
      if (savedInst) {
        const parsed = JSON.parse(savedInst);
        this.memoryInstitution = { ...DEFAULT_INSTITUTION_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('LocalStorage institution read notice:', e);
    }

    try {
      const deletedRaw = localStorage.getItem(LS_DELETED_SCHOOL_LOGOS);
      if (deletedRaw) {
        const parsed = JSON.parse(deletedRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((k) => {
            const norm = normalizeSchoolKey(String(k));
            if (norm) this.deletedSchoolLogos.add(norm);
          });
        }
      }
    } catch (e) {
      console.warn('LocalStorage deleted logos read notice:', e);
    }

    try {
      const savedLogos = localStorage.getItem(LS_SCHOOL_LOGOS_BACKUP);
      if (savedLogos) {
        const parsed = JSON.parse(savedLogos);
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            const norm = normalizeSchoolKey(k);
            if (norm && typeof v === 'string' && v && !this.deletedSchoolLogos.has(norm)) {
              this.memorySchoolLogos.set(norm, v);
            }
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage school logos read notice:', e);
    }
  }

  private persistLogosBackupToLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, string> = {};
      this.memorySchoolLogos.forEach((val, key) => {
        // Only mirror compact logos to localStorage so we never hit 5MB quota
        if (val && val.length <= MAX_SHEETS_SAFE_DATA_URL_LENGTH + 8000) {
          obj[key] = val;
        }
      });
      localStorage.setItem(LS_SCHOOL_LOGOS_BACKUP, JSON.stringify(obj));
    } catch (e) {
      console.warn('LocalStorage school logos backup quota notice:', e);
    }

    try {
      localStorage.setItem(
        LS_DELETED_SCHOOL_LOGOS,
        JSON.stringify(Array.from(this.deletedSchoolLogos))
      );
    } catch (e) {
      // Ignore quota notice
    }
  }

  private broadcastSchoolLogosUpdated(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('school_logos_updated'));
    }
  }

  /**
   * Initializes the IndexedDB database and pre-loads cache into memory for instant synchronous reads.
   */
  async init(): Promise<void> {
    if (this.isReady) return;

    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isReady = true;
      return;
    }

    try {
      const db = await this.openDatabase();
      await Promise.all([
        this.hydrateDocuments(db),
        this.hydrateSchoolLogos(db),
        this.hydrateInstitution(db),
      ]);
      this.isReady = true;
      this.persistLogosBackupToLocalStorage();
      this.broadcastSchoolLogosUpdated();
    } catch (err) {
      console.error('Failed to initialize IndexedDB:', err);
      this.isReady = true;
    }
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
          db.createObjectStore(STORE_DOCUMENTS);
        }
        if (!db.objectStoreNames.contains(STORE_SCHOOL_LOGOS)) {
          db.createObjectStore(STORE_SCHOOL_LOGOS);
        }
        if (!db.objectStoreNames.contains(STORE_INSTITUTION)) {
          db.createObjectStore(STORE_INSTITUTION);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async hydrateDocuments(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
        const store = tx.objectStore(STORE_DOCUMENTS);
        const req = store.openCursor();

        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue | null;
          if (cursor) {
            this.memoryDocuments.set(String(cursor.key), cursor.value);
            cursor.continue();
          } else {
            resolve();
          }
        };

        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  private async hydrateSchoolLogos(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_SCHOOL_LOGOS, 'readonly');
        const store = tx.objectStore(STORE_SCHOOL_LOGOS);
        const req = store.openCursor();

        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue | null;
          if (cursor) {
            const normKey = normalizeSchoolKey(String(cursor.key));
            if (
              normKey &&
              typeof cursor.value === 'string' &&
              cursor.value &&
              !this.deletedSchoolLogos.has(normKey)
            ) {
              this.memorySchoolLogos.set(normKey, cursor.value);
            }
            cursor.continue();
          } else {
            resolve();
          }
        };

        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  private async hydrateInstitution(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_INSTITUTION, 'readonly');
        const store = tx.objectStore(STORE_INSTITUTION);
        const req = store.get('main_institution');

        req.onsuccess = () => {
          if (req.result) {
            this.memoryInstitution = { ...DEFAULT_INSTITUTION_SETTINGS, ...req.result };
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('institution_settings_updated', { detail: this.memoryInstitution })
              );
            }
          }
          resolve();
        };

        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  // ==========================================
  // STUDENT DOCUMENTS METHODS
  // ==========================================

  getCachedDocuments(studentId: string): StudentDocuments | undefined {
    if (!studentId) return undefined;
    return this.memoryDocuments.get(String(studentId).trim());
  }

  async getStudentDocuments(studentId: string): Promise<StudentDocuments | null> {
    if (!studentId) return null;
    const key = String(studentId).trim();

    if (this.memoryDocuments.has(key)) {
      return this.memoryDocuments.get(key) || null;
    }

    try {
      const db = await this.openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
        const store = tx.objectStore(STORE_DOCUMENTS);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result) {
            this.memoryDocuments.set(key, req.result);
            resolve(req.result);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async saveStudentDocuments(studentId: string, documents: StudentDocuments): Promise<void> {
    if (!studentId || !documents) return;
    const key = String(studentId).trim();

    this.memoryDocuments.set(key, documents);

    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
        const store = tx.objectStore(STORE_DOCUMENTS);
        const req = store.put(documents, key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB write error for student documents:', err);
    }
  }

  async deleteStudentDocuments(studentId: string): Promise<void> {
    if (!studentId) return;
    const key = String(studentId).trim();

    this.memoryDocuments.delete(key);

    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
        const store = tx.objectStore(STORE_DOCUMENTS);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB delete error for student documents:', err);
    }
  }

  // ==========================================
  // DESTINATION SCHOOL LOGO METHODS
  // ==========================================

  isSchoolLogoDeleted(schoolName: string): boolean {
    const key = normalizeSchoolKey(schoolName);
    if (!key) return false;
    return this.deletedSchoolLogos.has(key);
  }

  /**
   * Synchronous cached retrieval of destination school logo (normalized key match)
   */
  getCachedSchoolLogo(schoolName: string): string | undefined {
    const key = normalizeSchoolKey(schoolName);
    if (!key || this.deletedSchoolLogos.has(key)) return undefined;
    return this.memorySchoolLogos.get(key);
  }

  /**
   * Save school logo permanently to memory, localStorage backup, and IndexedDB
   */
  async saveSchoolLogo(schoolName: string, logoUrl: string, silent = false): Promise<void> {
    const key = normalizeSchoolKey(schoolName);
    if (!key || !logoUrl) return;

    this.deletedSchoolLogos.delete(key);
    this.memorySchoolLogos.set(key, logoUrl);
    this.persistLogosBackupToLocalStorage();

    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_SCHOOL_LOGOS, 'readwrite');
        const store = tx.objectStore(STORE_SCHOOL_LOGOS);
        const req = store.put(logoUrl, key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB write error for school logo:', err);
    }

    if (!silent) {
      this.broadcastSchoolLogosUpdated();
    }
  }

  /**
   * Delete school logo permanently and record deletion tombstone
   */
  async deleteSchoolLogo(schoolName: string): Promise<void> {
    const rawKey = (schoolName || '').trim();
    const normKey = normalizeSchoolKey(schoolName);
    if (!normKey) return;

    this.deletedSchoolLogos.add(normKey);
    this.memorySchoolLogos.delete(normKey);
    this.persistLogosBackupToLocalStorage();

    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_SCHOOL_LOGOS, 'readwrite');
        const store = tx.objectStore(STORE_SCHOOL_LOGOS);
        store.delete(normKey);
        if (rawKey && rawKey !== normKey) {
          store.delete(rawKey);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB delete error for school logo:', err);
    }

    this.broadcastSchoolLogosUpdated();
  }

  // ==========================================
  // INSTITUTION SETTINGS METHODS
  // ==========================================

  getCachedInstitutionSettings(): InstitutionSettings {
    return { ...this.memoryInstitution };
  }

  async saveInstitutionSettings(settings: Partial<InstitutionSettings>): Promise<InstitutionSettings> {
    const updated: InstitutionSettings = {
      ...this.memoryInstitution,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    this.memoryInstitution = updated;

    try {
      localStorage.setItem(LS_INSTITUTION_BACKUP, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage quota notice for institution settings:', e);
    }

    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_INSTITUTION, 'readwrite');
        const store = tx.objectStore(STORE_INSTITUTION);
        const req = store.put(updated, 'main_institution');

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB write error for institution settings:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('institution_settings_updated', { detail: updated }));
    }

    return updated;
  }
}

export const dbStorage = new DBStorageService();
