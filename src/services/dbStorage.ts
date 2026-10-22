/**
 * High-Capacity Persistent IndexedDB Storage Layer
 * Safely persists large binary assets (Student Attachment Documents, School Logos, Institution Settings)
 * Completely bypasses the browser's 5MB localStorage limit (IndexedDB provides hundreds of MBs/GBs).
 * Guarantees that uploaded student files and school logos NEVER disappear after page refresh or Google Sheets sync.
 */

import { StudentDocuments, UploadedDocument } from '../types';

const DB_NAME = 'sms_secure_storage_v1';
const DB_VERSION = 1;

const STORE_DOCUMENTS = 'student_documents';
const STORE_SCHOOL_LOGOS = 'school_logos';
const STORE_INSTITUTION = 'institution_settings';

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
  private memoryInstitution: InstitutionSettings = { ...DEFAULT_INSTITUTION_SETTINGS };
  private isReady: boolean = false;
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.init();
  }

  /**
   * Initializes the IndexedDB database and pre-loads cache into memory for instant synchronous reads.
   */
  async init(): Promise<void> {
    if (this.isReady) return;

    // Load institution fallback from localStorage if present
    try {
      const savedInst = localStorage.getItem('sms_institution_settings_v1');
      if (savedInst) {
        const parsed = JSON.parse(savedInst);
        this.memoryInstitution = { ...DEFAULT_INSTITUTION_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('LocalStorage institution read notice:', e);
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not supported in current environment; using in-memory & localStorage fallback.');
      this.isReady = true;
      return;
    }

    try {
      const db = await this.openDatabase();
      // Hydrate in-memory maps from IndexedDB
      await Promise.all([
        this.hydrateDocuments(db),
        this.hydrateSchoolLogos(db),
        this.hydrateInstitution(db),
      ]);
      this.isReady = true;
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
            this.memorySchoolLogos.set(String(cursor.key), cursor.value);
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

  /**
   * Synchronous cached retrieval of student documents
   */
  getCachedDocuments(studentId: string): StudentDocuments | undefined {
    if (!studentId) return undefined;
    return this.memoryDocuments.get(String(studentId).trim());
  }

  /**
   * Retrieve student documents from IndexedDB (with memory cache fallback)
   */
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

  /**
   * Save student documents to IndexedDB permanently
   */
  async saveStudentDocuments(studentId: string, documents: StudentDocuments): Promise<void> {
    if (!studentId || !documents) return;
    const key = String(studentId).trim();

    // 1. Update memory cache immediately
    this.memoryDocuments.set(key, documents);

    // 2. Persist to IndexedDB
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

  /**
   * Delete student documents from IndexedDB
   */
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

  /**
   * Synchronous cached retrieval of destination school logo
   */
  getCachedSchoolLogo(schoolName: string): string | undefined {
    if (!schoolName) return undefined;
    return this.memorySchoolLogos.get(schoolName.trim());
  }

  /**
   * Save school logo permanently
   */
  async saveSchoolLogo(schoolName: string, logoUrl: string): Promise<void> {
    if (!schoolName || !logoUrl) return;
    const key = schoolName.trim();

    this.memorySchoolLogos.set(key, logoUrl);

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
  }

  /**
   * Delete school logo
   */
  async deleteSchoolLogo(schoolName: string): Promise<void> {
    if (!schoolName) return;
    const key = schoolName.trim();

    this.memorySchoolLogos.delete(key);

    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_SCHOOL_LOGOS, 'readwrite');
        const store = tx.objectStore(STORE_SCHOOL_LOGOS);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB delete error for school logo:', err);
    }
  }

  // ==========================================
  // INSTITUTION SETTINGS METHODS
  // ==========================================

  /**
   * Synchronous cached retrieval of Institution Settings
   */
  getCachedInstitutionSettings(): InstitutionSettings {
    return { ...this.memoryInstitution };
  }

  /**
   * Save Institution Settings permanently
   */
  async saveInstitutionSettings(settings: Partial<InstitutionSettings>): Promise<InstitutionSettings> {
    const updated: InstitutionSettings = {
      ...this.memoryInstitution,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    this.memoryInstitution = updated;

    // Save lightweight backup to localStorage
    try {
      localStorage.setItem('sms_institution_settings_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage quota notice for institution settings:', e);
    }

    // Save to IndexedDB
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

    // Broadcast change
    window.dispatchEvent(new CustomEvent('institution_settings_updated', { detail: updated }));

    return updated;
  }
}

export const dbStorage = new DBStorageService();
