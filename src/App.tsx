/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentTable } from './components/StudentTable';
import { StudentReport } from './components/StudentReport';
import { StudentModal } from './components/StudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GoogleAppsScriptModal } from './components/GoogleAppsScriptModal';
import { UserManagement } from './components/UserManagement';
import { SchoolManagementView } from './components/SchoolManagementView';
import { SchoolInfoView } from './components/SchoolInfoView';
import { LoginModal, LoginScreen } from './components/LoginModal';
import { StudentPortalView } from './components/StudentPortalView';
import { InstitutionSettingsModal } from './components/InstitutionSettingsModal';
import { dbStorage } from './services/dbStorage';
import { authService, UserAccount } from './services/authService';
import { 
  Student, 
  TabType, 
  Language, 
  FilterState, 
  AppScriptConfig, 
  ConnectionStatus 
} from './types';
import { INITIAL_STUDENTS } from './data/mockStudents';
import { AppsScriptService } from './services/appsScriptService';
import { translations } from './translations';
import { formatDobOnly } from './utils/ageUtils';
import { schoolMajorService } from './services/schoolMajorService';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import {
  mergeBestStudentDocuments,
  stripCloudEnvelopeFromNotes,
  unpackStudentFromSheets,
  isMockStudentDocuments,
} from './utils/cloudDocSyncUtils';
import { countUploadedCategories } from './utils/documentUtils';

const STORAGE_KEY_STUDENTS = 'sms_students_data_v1';
const STORAGE_KEY_CONFIG = 'sms_appscript_config_v1';
const STORAGE_KEY_LANG = 'sms_app_lang_v1';

// Official Master Web App URL for Google Sheets Backend
export const HARDCODED_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz01aE2jUA4-GgNEmanaWjCKPGXX3ge4A0DA3Y1EEEc7LFjHWQp13JsRd0rE_Uq63FNKQ/exec';

const MOCK_CREATED_AT_SET = new Set(
  INITIAL_STUDENTS.map(m => (m.createdAt || '').trim()).filter(Boolean)
);

function isBuiltInMockStudent(s?: Partial<Student> | null): boolean {
  if (!s) return false;
  if (s.createdAt && MOCK_CREATED_AT_SET.has(s.createdAt.trim())) return true;
  if (isMockStudentDocuments(s.documents)) return true;
  return false;
}

function isSameStudentIdentity(a: Student, b: Student): boolean {
  if (a.createdAt && b.createdAt && a.createdAt.trim() === b.createdAt.trim()) {
    return true;
  }
  const nkA = (a.nameKhmer || '').trim().toLowerCase();
  const nkB = (b.nameKhmer || '').trim().toLowerCase();
  const phA = (a.phone || '').replace(/\s+/g, '');
  const phB = (b.phone || '').replace(/\s+/g, '');
  if (nkA && nkB && nkA === nkB && phA && phB && phA === phB) {
    return true;
  }
  return false;
}

/**
 * Re-sequences student order numbers (លេខរៀង Auto: 1, 2, 3...)
 * When a student at any index is deleted or loaded with gaps (e.g. starts from 2, or missing 4),
 * the numbers shift and reorder sequentially (1, 2, 3, 4, 5...).
 * e.g., If we have 2, 3, 4, 5 -> becomes 1, 2, 3, 4.
 * e.g., If we have 1, 2, 3, 5 -> becomes 1, 2, 3, 4.
 */
export const resequenceStudentsList = (list: Student[]): Student[] => {
  const sorted = [...list].sort((a, b) => {
    const numA = parseInt((a.studentId || '').replace(/\D/g, '') || '0', 10);
    const numB = parseInt((b.studentId || '').replace(/\D/g, '') || '0', 10);
    if (numA !== numB) return numA - numB;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  return sorted.map((student, index) => ({
    ...student,
    studentId: String(index + 1),
  }));
};

export default function App() {
  // Language state (defaults to Khmer 'km')
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return (saved === 'en' || saved === 'km' || saved === 'zh-TW') ? saved : 'km';
  });

  const t = translations[language];

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const isAdmin = currentUser?.role === 'Admin';

  // Tab navigation (Students default to 'student_portal', Admins to 'dashboard')
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const u = authService.getCurrentUser();
    return u?.role === 'Admin' ? 'dashboard' : 'student_portal';
  });

  // Students list state (strictly re-sequenced 1, 2, 3... with zero gaps)
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    let list: Student[] = INITIAL_STUDENTS;
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local students data:', e);
      }
    }
    const formatted = list.map(raw => {
      const s = unpackStudentFromSheets(raw);
      const isMock = isBuiltInMockStudent(s);
      const dbDocs = isMock ? undefined : dbStorage.getCachedDocumentsForStudent(s);
      return {
        ...s,
        notes: stripCloudEnvelopeFromNotes(s.notes),
        dob: formatDobOnly(s.dob),
        fatherDob: formatDobOnly(s.fatherDob),
        motherDob: formatDobOnly(s.motherDob),
        documents: isMock ? s.documents : mergeBestStudentDocuments(dbDocs, s.documents),
      };
    });
    return resequenceStudentsList(formatted);
  });

  const backfilledCloudKeysRef = React.useRef<Set<string>>(new Set());

  const defaultEnvUrl = ((import.meta as any).env?.VITE_APPS_SCRIPT_URL as string | undefined)?.trim() || HARDCODED_APPS_SCRIPT_URL;

  // Google Apps Script Configuration (auto-connects with built-in default URL)
  const [appScriptConfig, setAppScriptConfig] = useState<AppScriptConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validUrl = (parsed.webAppUrl && parsed.webAppUrl.trim()) ? parsed.webAppUrl.trim() : defaultEnvUrl;
        return {
          ...parsed,
          webAppUrl: validUrl,
          autoSync: true,
        };
      } catch (e) {
        console.error('Failed to parse appscript config:', e);
      }
    }
    return {
      webAppUrl: defaultEnvUrl,
      sheetName: 'Students',
      autoSync: true,
    };
  });

  // Connection and Sync states
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() => {
    return appScriptConfig.webAppUrl ? 'connected' : 'disconnected';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastSyncTimeRef = React.useRef<number>(0);

  // Notification Toast state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Filter state for Student Table
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    gender: 'all',
    major: 'all',
    targetSchool: 'all',
  });

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Listen to Auth Changes
  useEffect(() => {
    const unsub = authService.subscribe(() => {
      const u = authService.getCurrentUser();
      setCurrentUser(u);
      if (u?.role === 'Admin') {
        if (currentTab === 'student_portal') {
          setCurrentTab('dashboard');
        }
      } else {
        setCurrentTab('student_portal');
      }
    });
    return unsub;
  }, [currentTab]);

  // Central Data Fetcher: Pulls both Students and Schools & Majors from Google Sheets
  const fetchAllFromSheets = useCallback(async (silent = false) => {
    if (!appScriptConfig.webAppUrl) return;
    setIsSyncing(true);
    setConnectionStatus('syncing');
    try {
      const result = await AppsScriptService.fetchAllData(appScriptConfig.webAppUrl);
      if (Array.isArray(result.students)) {
        // Automatically re-sequence so there are never any gaps or starting from 2
        const resequenced = resequenceStudentsList(result.students);
        const studentsNeedingCloudBackfill: Student[] = [];

        const preHydrated = resequenced.map(s => {
          const dbDocs = dbStorage.getCachedDocumentsForStudent(s);
          const mergedDocs = mergeBestStudentDocuments(dbDocs, s.documents);
          const remoteDocCount = countUploadedCategories(s.documents);
          const localDocCount = countUploadedCategories(mergedDocs);
          const bKey = s.createdAt || `${s.studentId}_${s.nameKhmer}`;

          const nextStudent: Student = {
            ...s,
            notes: stripCloudEnvelopeFromNotes(s.notes),
            documents: mergedDocs,
          };

          if (localDocCount > remoteDocCount && !backfilledCloudKeysRef.current.has(bKey)) {
            backfilledCloudKeysRef.current.add(bKey);
            studentsNeedingCloudBackfill.push(nextStudent);
          }

          return nextStudent;
        });

        setStudents(prev => {
          const realPrev = prev.filter(p => !isBuiltInMockStudent(p));
          return preHydrated.map(s => {
            const sameLocal = realPrev.find(p => isSameStudentIdentity(p, s));
            if (!sameLocal) return s;
            return {
              ...s,
              referrerName: s.referrerName || sameLocal.referrerName || '',
              previousSchoolAddressKhmer: s.previousSchoolAddressKhmer || sameLocal.previousSchoolAddressKhmer || '',
              email: s.email || sameLocal.email || '',
              documents: mergeBestStudentDocuments(s.documents, sameLocal.documents),
            };
          });
        });

        // If Google Sheets had gaps OR local browser had unsynced documents, push back to Google Sheets
        const hasGap = result.students.some((s, idx) => String(s.studentId).trim() !== String(idx + 1));
        if (hasGap) {
          AppsScriptService.syncAllStudents(appScriptConfig.webAppUrl, preHydrated).catch(e => {
            console.warn('Auto re-sequence sheets sync notice:', e);
          });
        } else if (studentsNeedingCloudBackfill.length > 0) {
          Promise.all(
            studentsNeedingCloudBackfill.map(st =>
              AppsScriptService.updateStudent(appScriptConfig.webAppUrl, st)
            )
          ).catch(e => {
            console.warn('Auto document cloud backfill notice:', e);
          });
        }
      }
      if (result.schools && result.schools.length > 0) {
        schoolMajorService.setSchoolsFromRemote(
          result.schools, 
          result.customTranslations,
          result.deletedSchools,
          result.deletedMajors
        );
      } else if (result.schools === null && authService.isAdmin() && appScriptConfig.webAppUrl) {
        // Seed schools once so SchoolsMajors tab is created in Google Sheets
        AppsScriptService.syncSchools(
          appScriptConfig.webAppUrl,
          schoolMajorService.getSchools(),
          schoolMajorService.getCustomTranslations(),
          schoolMajorService.getDeletedSchools(),
          schoolMajorService.getDeletedMajors()
        ).catch(e => console.warn('Initial school sync warning:', e));
      }

      // Sync Users (Accounts, Passwords, Roles) across all devices and browsers
      if (result.users && result.users.length > 0) {
        authService.setUsersFromRemote(result.users);
      } else if (result.users === null && authService.isAdmin() && appScriptConfig.webAppUrl) {
        // Seed users once so Users tab is created in Google Sheets
        AppsScriptService.syncUsers(appScriptConfig.webAppUrl, authService.getUsers()).catch(e => {
          console.warn('Initial users sync warning:', e);
        });
      }

      setConnectionStatus('connected');
      lastSyncTimeRef.current = Date.now();
      if (!silent) {
        const studentCount = result.students?.length || 0;
        const schoolCount = result.schools?.length || 0;
        showNotification(
          'success',
          language === 'km'
            ? `✨ បានសមកាលកម្មពី Google Sheets (សិស្ស ${studentCount} នាក់, សាលារៀន ${schoolCount})`
            : `✨ Synced ${studentCount} students and ${schoolCount} schools from Google Sheets!`
        );
      }
    } catch (err: any) {
      console.warn('Google Sheets fetch warning:', err);
      setConnectionStatus(appScriptConfig.webAppUrl ? 'connected' : 'error');
      if (!silent) {
        showNotification('error', `Sync failed: ${err.message || 'Network error'}`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [appScriptConfig.webAppUrl, language, showNotification]);

  // Auto-Fetch on initial load and whenever URL changes
  useEffect(() => {
    if (appScriptConfig.webAppUrl) {
      fetchAllFromSheets(true);
    } else {
      setConnectionStatus('disconnected');
    }
  }, [appScriptConfig.webAppUrl, fetchAllFromSheets]);

  // Window Focus and Visibility Auto-Sync: When user switches back to this tab/window, refresh immediately
  useEffect(() => {
    const handleSyncOnVisible = () => {
      if (document.visibilityState === 'visible' && appScriptConfig.webAppUrl && appScriptConfig.autoSync) {
        // Refresh silently if more than 15 seconds since last sync
        if (Date.now() - lastSyncTimeRef.current > 15000) {
          fetchAllFromSheets(true);
        }
      }
    };
    window.addEventListener('focus', handleSyncOnVisible);
    document.addEventListener('visibilitychange', handleSyncOnVisible);
    return () => {
      window.removeEventListener('focus', handleSyncOnVisible);
      document.removeEventListener('visibilitychange', handleSyncOnVisible);
    };
  }, [appScriptConfig.webAppUrl, appScriptConfig.autoSync, fetchAllFromSheets]);

  // Periodic Auto-Sync (Every 20s) for real-time multi-device collaboration
  useEffect(() => {
    if (!appScriptConfig.webAppUrl || !appScriptConfig.autoSync) return;
    const interval = setInterval(() => {
      if (Date.now() - lastSyncTimeRef.current > 18000) {
        fetchAllFromSheets(true);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [appScriptConfig.webAppUrl, appScriptConfig.autoSync, fetchAllFromSheets]);

  // Auto-push school & major changes to Google Sheets whenever updated
  useEffect(() => {
    if (appScriptConfig.webAppUrl) {
      schoolMajorService.setRemoteSyncHandler((schools, trans) => {
        AppsScriptService.syncSchools(
          appScriptConfig.webAppUrl, 
          schools, 
          trans,
          schoolMajorService.getDeletedSchools(),
          schoolMajorService.getDeletedMajors()
        ).catch(e => {
          console.warn('Auto-sync schools to Google Sheets warning:', e);
        });
      });
    } else {
      schoolMajorService.setRemoteSyncHandler(null);
    }
    return () => {
      schoolMajorService.setRemoteSyncHandler(null);
    };
  }, [appScriptConfig.webAppUrl]);

  // Auto-push user accounts (Username, Password, Role) to Google Sheets whenever updated
  useEffect(() => {
    if (appScriptConfig.webAppUrl) {
      authService.setRemoteSyncHandler((users) => {
        AppsScriptService.syncUsers(appScriptConfig.webAppUrl, users).catch(e => {
          console.warn('Auto-sync users to Google Sheets warning:', e);
        });
      });
    } else {
      authService.setRemoteSyncHandler(null);
    }
    return () => {
      authService.setRemoteSyncHandler(null);
    };
  }, [appScriptConfig.webAppUrl]);

  // Mobile Sync: Auto-Connect via URL Query Param (?sheetUrl=...&autoSync=true)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sheetUrlParam = urlParams.get('sheetUrl');
      if (sheetUrlParam && sheetUrlParam.startsWith('http')) {
        const decodedUrl = decodeURIComponent(sheetUrlParam).trim();
        setAppScriptConfig(prev => ({
          ...prev,
          webAppUrl: decodedUrl,
          autoSync: true,
        }));
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
          webAppUrl: decodedUrl,
          sheetName: 'Students',
          autoSync: true,
        }));

        fetchAllFromSheets(false);

        // Clean query parameter from URL
        const cleanUrlObj = new URL(window.location.href);
        cleanUrlObj.searchParams.delete('sheetUrl');
        cleanUrlObj.searchParams.delete('autoSync');
        window.history.replaceState({}, document.title, cleanUrlObj.pathname + (cleanUrlObj.hash || ''));
      }
    } catch (e) {
      console.warn('Mobile sync url parse error:', e);
    }
  }, [fetchAllFromSheets]);

  // Hydrate students' documents from IndexedDB once dbStorage is ready and whenever updated
  useEffect(() => {
    const syncDocsFromCache = () => {
      setStudents(prev => {
        let changed = false;
        const hydrated = prev.map(s => {
          if (isBuiltInMockStudent(s)) return s;
          const storedDocs = dbStorage.getCachedDocumentsForStudent(s);
          const mergedDocs = mergeBestStudentDocuments(storedDocs, s.documents);
          const prevCount = countUploadedCategories(s.documents);
          const nextCount = countUploadedCategories(mergedDocs);
          const hadPlaceholder = s.documents ? JSON.stringify(s.documents).includes('STORED_IN_INDEXEDDB') : false;

          if (mergedDocs && (nextCount > prevCount || hadPlaceholder)) {
            changed = true;
            // If Google Sheets row was missing these newly hydrated IndexedDB docs, push them once!
            const bKey = s.createdAt || `${s.studentId}_${s.nameKhmer}`;
            if (prevCount === 0 && nextCount > 0 && appScriptConfig.webAppUrl && !backfilledCloudKeysRef.current.has(bKey)) {
              backfilledCloudKeysRef.current.add(bKey);
              AppsScriptService.updateStudent(appScriptConfig.webAppUrl, {
                ...s,
                documents: mergedDocs,
              }).catch(() => {});
            }
            return {
              ...s,
              documents: mergedDocs,
            };
          }
          return s;
        });
        return changed ? hydrated : prev;
      });
    };

    dbStorage.whenReady().then(syncDocsFromCache);
    window.addEventListener('student_documents_updated', syncDocsFromCache);
    return () => {
      window.removeEventListener('student_documents_updated', syncDocsFromCache);
    };
  }, [appScriptConfig.webAppUrl]);

  // Keep detail modal student synchronized when students list updates
  useEffect(() => {
    if (!selectedStudentForDetail) return;
    const latest = students.find(s => isSameStudentIdentity(s, selectedStudentForDetail) || s.studentId === selectedStudentForDetail.studentId);
    if (latest && latest !== selectedStudentForDetail) {
      setSelectedStudentForDetail(latest);
    }
  }, [students, selectedStudentForDetail]);

  // Persist real students to IndexedDB (full heavy attachments) and safe localStorage
  useEffect(() => {
    // 1. Permanently store real student document attachments in IndexedDB (never store mock SVGs)
    students.forEach(s => {
      if (!isBuiltInMockStudent(s) && s.documents && Object.keys(s.documents).length > 0) {
        dbStorage.saveStudentDocumentsForStudent(s, s.documents, true);
      }
    });

    // 2. Safe save to localStorage without hitting 5MB quota
    try {
      const cleanForLs = students.map(s => ({
        ...s,
        notes: stripCloudEnvelopeFromNotes(s.notes),
      }));
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(cleanForLs));
    } catch (quotaErr) {
      console.warn('LocalStorage quota limit reached, saving lightweight student manifest with full IndexedDB storage backup:', quotaErr);
      try {
        const lightweight = students.map(s => {
          const base = { ...s, notes: stripCloudEnvelopeFromNotes(s.notes) };
          if (!base.documents) return base;
          const lightDocs: any = {};
          Object.entries(base.documents).forEach(([cat, docPages]) => {
            if (Array.isArray(docPages)) {
              lightDocs[cat] = docPages.map(p => ({
                name: p.name,
                size: p.size,
                type: p.type,
                uploadedAt: p.uploadedAt,
                pageNumber: p.pageNumber,
                dataUrl: 'STORED_IN_INDEXEDDB',
              }));
            } else if (docPages && typeof docPages === 'object') {
              lightDocs[cat] = {
                name: (docPages as any).name,
                size: (docPages as any).size,
                type: (docPages as any).type,
                uploadedAt: (docPages as any).uploadedAt,
                pageNumber: (docPages as any).pageNumber,
                dataUrl: 'STORED_IN_INDEXEDDB',
              };
            }
          });
          return { ...base, documents: lightDocs };
        });
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(lightweight));
      } catch (e2) {
        console.error('Critical localStorage write notice:', e2);
      }
    }
  }, [students]);

  // Persist config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(appScriptConfig));
  }, [appScriptConfig]);

  // Persist language and update document attributes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, language);
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-lang', language);
  }, [language]);

  // Cycle Language handler: km -> en -> zh-TW -> km
  const handleLanguageToggle = () => {
    setLanguage(prev => {
      if (prev === 'km') return 'en';
      if (prev === 'en') return 'zh-TW';
      return 'km';
    });
  };

  // Unique list of student IDs for uniqueness validation
  const existingStudentIds = useMemo(() => {
    return students.map(s => s.studentId);
  }, [students]);

  // Preselected school state when applying directly from School Information directory
  const [preselectedSchool, setPreselectedSchool] = useState<string | undefined>(undefined);

  // Open Add Student Modal (guards against SyntheticEvent when wired directly to onClick)
  const handleOpenAddStudent = (school?: unknown) => {
    setPreselectedSchool(typeof school === 'string' ? school : undefined);
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  // Open Edit Student Modal (Admin Only)
  const handleOpenEditStudent = (student: Student) => {
    if (!authService.isAdmin()) {
      showNotification('error', 'សិទ្ធិសិស្ស មិនអាចកែប្រែព័ត៌មានសិស្សដទៃបានទេ (Only Admin can edit student records)');
      return;
    }
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  // Open View Student Details Modal
  const handleOpenViewStudent = (student: Student) => {
    setSelectedStudentForDetail(student);
    setIsDetailModalOpen(true);
  };

  // Open Delete Confirmation Modal (Admin Only)
  const handleOpenDeleteStudent = (student: Student) => {
    if (!authService.isAdmin()) {
      showNotification('error', 'សិទ្ធិសិស្ស មិនអាចលុបទិន្នន័យបានទេ (Only Admin can delete student records)');
      return;
    }
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  // Navigate to Table with specific major filter from dashboard
  const handleNavigateToStudents = (filterMajor?: string) => {
    if (filterMajor) {
      setFilterState({ search: '', gender: 'all', major: filterMajor, targetSchool: 'all' });
    }
    setCurrentTab('students');
  };

  // Save (Create or Update) Student
  const handleSaveStudent = async (studentData: Student, isEdit: boolean) => {
    // Ensure school and major are registered in catalog
    if (studentData.targetSchool?.trim()) {
      schoolMajorService.ensureSchoolAndMajor(studentData.targetSchool, studentData.major);
    }

    const cleanStudentData: Student = {
      ...studentData,
      notes: stripCloudEnvelopeFromNotes(studentData.notes),
    };

    // Persist full HD documents in IndexedDB permanently under stable student identity keys
    if (cleanStudentData.documents && Object.keys(cleanStudentData.documents).length > 0) {
      await dbStorage.saveStudentDocumentsForStudent(cleanStudentData, cleanStudentData.documents);
    }

    if (isEdit) {
      setStudents(prev =>
        prev.map(s => (s.studentId === cleanStudentData.studentId ? cleanStudentData : s))
      );

      if (selectedStudentForDetail?.studentId === cleanStudentData.studentId) {
        setSelectedStudentForDetail(cleanStudentData);
      }

      if (appScriptConfig.webAppUrl) {
        try {
          await AppsScriptService.updateStudent(appScriptConfig.webAppUrl, cleanStudentData);
          lastSyncTimeRef.current = Date.now();
        } catch (err: any) {
          console.warn('Apps Script update sync warning:', err);
          showNotification('info', `Saved locally. Google Sheets sync: ${err.message}`);
        }
      }

      const updateSuccessText = language === 'km'
        ? 'ជោគជ័យ'
        : language === 'zh-TW'
        ? '儲存成功'
        : 'Successfully';
      showNotification('success', updateSuccessText);
    } else {
      let savedStudent = cleanStudentData;

      // Sync to Google Sheets first while submit spinner is active so mobile WebViews never abort upload
      if (appScriptConfig.webAppUrl) {
        try {
          savedStudent = await AppsScriptService.createStudent(appScriptConfig.webAppUrl, cleanStudentData);
          lastSyncTimeRef.current = Date.now();
        } catch (err: any) {
          console.warn('Apps Script create sync warning:', err);
          showNotification('info', `Saved locally. Google Sheets sync: ${err.message}`);
        }
      }

      setStudents(prev => {
        const realPrev = prev.filter(p => !isBuiltInMockStudent(p));
        const nextList = [...realPrev, savedStudent];
        return resequenceStudentsList(nextList);
      });

      const addSuccessText = language === 'km'
        ? 'ជោគជ័យ'
        : language === 'zh-TW'
        ? '儲存成功'
        : 'Successfully';
      showNotification('success', addSuccessText);
    }
  };

  // Confirm Delete Student with Auto-resequence (លេខរៀង Auto)
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);

    const targetStudent = studentToDelete;
    const targetId = targetStudent.studentId;

    try {
      const remaining = students.filter(s => s.studentId !== targetId);
      const finalResequenced = resequenceStudentsList(remaining);

      // Delete documents from IndexedDB
      await dbStorage.deleteStudentDocumentsForStudent(targetStudent);

      // Immediately update local state
      setStudents(finalResequenced);

      setIsDeleteModalOpen(false);
      setStudentToDelete(null);

      const delSuccessText = language === 'km'
        ? 'ជោគជ័យ (បានលុបសិស្សដោយជោគជ័យ)'
        : language === 'zh-TW'
        ? '刪除成功'
        : 'Deleted successfully';
      showNotification('success', delSuccessText);

      if (selectedStudentForDetail?.studentId === targetId) {
        setIsDetailModalOpen(false);
        setSelectedStudentForDetail(null);
      }

      if (appScriptConfig.webAppUrl) {
        try {
          if (finalResequenced.length > 0) {
            await AppsScriptService.syncAllStudents(appScriptConfig.webAppUrl, finalResequenced);
          } else {
            await AppsScriptService.deleteStudent(appScriptConfig.webAppUrl, targetId, targetStudent);
          }
        } catch (err: any) {
          console.warn('Apps Script sync warning after delete:', err);
          try {
            await AppsScriptService.deleteStudent(appScriptConfig.webAppUrl, targetId, targetStudent);
          } catch (delErr) {
            console.warn('Apps Script delete fallback warning:', delErr);
          }
        }
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete with Auto-resequence (លេខរៀង Auto)
  // FIXED: Synchronously compute remaining and resequence to prevent wiping
  const handleBulkDelete = async (studentIds: string[]) => {
    const count = studentIds.length;
    if (count === 0) return;

    const confirmed = window.confirm(
      language === 'km'
        ? `តើអ្នកពិតជាចង់លុបសិស្សទាំង ${count} នាក់នេះមែនទេ?`
        : language === 'zh-TW'
        ? `您確定要刪除這 ${count} 位學生嗎？`
        : `Are you sure you want to delete these ${count} students?`
    );
    if (!confirmed) return;

    const deletedStudents = students.filter(s => studentIds.includes(s.studentId));
    await Promise.all(deletedStudents.map(st => dbStorage.deleteStudentDocumentsForStudent(st)));

    const remaining = students.filter(s => !studentIds.includes(s.studentId));
    const finalResequenced = resequenceStudentsList(remaining);
    setStudents(finalResequenced);

    const bulkDelText = language === 'km'
      ? `ជោគជ័យ (បានលុបសិស្ស ${count} នាក់)`
      : language === 'zh-TW'
      ? `刪除成功 (${count} 位學生)`
      : `Successfully deleted ${count} students.`;
    showNotification('success', bulkDelText);

    if (appScriptConfig.webAppUrl) {
      try {
        await AppsScriptService.syncAllStudents(appScriptConfig.webAppUrl, finalResequenced);
      } catch (err: any) {
        console.warn('Failed bulk sync delete:', err);
      }
    }
  };

  // Manual Re-sequence all student order numbers (Admin Only)
  const handleResequenceAll = async () => {
    if (!authService.isAdmin()) return;
    const resequenced = resequenceStudentsList(students);
    setStudents(resequenced);
    showNotification('success', t.resequenceSuccess);

    if (appScriptConfig.webAppUrl) {
      try {
        await AppsScriptService.syncAllStudents(appScriptConfig.webAppUrl, resequenced);
      } catch (err: any) {
        console.warn('Failed to sync resequenced students to sheets:', err);
      }
    }
  };

  // Test Connection
  const handleTestConnection = async (urlToTest: string): Promise<boolean> => {
    try {
      const res = await AppsScriptService.ping(urlToTest);
      setConnectionStatus('connected');
      return !!res.success;
    } catch (e) {
      setConnectionStatus('error');
      throw e;
    }
  };

  // Manual Pull from Google Sheets
  const handlePullFromSheets = async () => {
    if (!appScriptConfig.webAppUrl) {
      throw new Error('Google Apps Script Web App URL is not set');
    }
    await fetchAllFromSheets(false);
  };

  // Manual Push to Google Sheets (Both Students and Schools & Majors)
  const handlePushToSheets = async () => {
    if (!appScriptConfig.webAppUrl) {
      throw new Error('Google Apps Script Web App URL is not set');
    }
    setConnectionStatus('syncing');
    setIsSyncing(true);
    try {
      const schools = schoolMajorService.getSchools();
      const trans = schoolMajorService.getCustomTranslations();
      const deletedSchools = schoolMajorService.getDeletedSchools();
      const deletedMajors = schoolMajorService.getDeletedMajors();
      await AppsScriptService.syncAllData(
        appScriptConfig.webAppUrl, 
        students, 
        schools, 
        trans, 
        deletedSchools, 
        deletedMajors
      );
      setConnectionStatus('connected');
      lastSyncTimeRef.current = Date.now();
      showNotification('success', t.syncedWithSheets);
    } catch (err: any) {
      setConnectionStatus('error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick Sync handler from Navbar
  const handleQuickSync = async () => {
    if (!appScriptConfig.webAppUrl) {
      setIsSettingsModalOpen(true);
      return;
    }
    await fetchAllFromSheets(false);
  };

  // Protect Access: Strictly require login before accessing the application
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showNotification(
            'success',
            language === 'km'
              ? `ចូលប្រព័ន្ធជោគជ័យ: ${user.adminName} (${user.role})`
              : language === 'zh-TW'
              ? `登入系統成功：${user.adminName} (${user.role})`
              : `Successfully logged in: ${user.adminName} (${user.role})`
          );
        }}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onSelectLanguage={setLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'users' && !authService.isAdmin()) {
            showNotification('error', 'Access Restricted (មិនមានសិទ្ធិចូលប្រើប្រាស់)');
            setCurrentTab('dashboard');
            return;
          }
          setCurrentTab(tab);
        }}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onSelectLanguage={setLanguage}
        connectionStatus={connectionStatus}
        onOpenSettings={() => {
          if (!authService.isAdmin()) {
            showNotification('error', 'ការកំណត់ Google Sheets ត្រូវបានអនុញ្ញាតសម្រាប់តែ Admin ប៉ុណ្ណោះ (Google Sheets Settings is restricted to Admin)');
            return;
          }
          setIsSettingsModalOpen(true);
        }}
        onAddStudent={handleOpenAddStudent}
        onSync={handleQuickSync}
        isSyncing={isSyncing}
        studentCount={students.length}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          authService.logout();
          showNotification(
            'info',
            language === 'km'
              ? 'បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ'
              : language === 'zh-TW'
              ? '已成功登出系統'
              : 'Successfully logged out'
          );
        }}
      />

      {/* Main Content Area with Desktop Left Padding */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Floating Notification Toast */}
          {notification && (
            <div className="fixed top-6 right-6 z-50 max-w-md animate-in slide-in-from-top-3 duration-200 shadow-xl rounded-xl overflow-hidden border">
              <div className={`p-4 flex items-center gap-3 text-xs sm:text-sm font-medium ${
                notification.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : notification.type === 'error'
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-slate-800 text-white border-slate-900'
              }`}>
                {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {notification.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                {notification.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
                <span className="flex-1">{notification.message}</span>
                <button 
                  onClick={() => setNotification(null)}
                  className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* School Information & Daily Updates View (Accessible to BOTH Admin and Student) */}
          {currentTab === 'school_info' ? (
            <SchoolInfoView
              language={language}
              onNavigateToAddStudent={(preselected) => handleOpenAddStudent(preselected)}
              onNavigateToDashboard={() => setCurrentTab(isAdmin ? 'dashboard' : 'student_portal')}
            />
          ) : !isAdmin ? (
            <StudentPortalView
              onAddStudent={() => handleOpenAddStudent()}
              onOpenSchoolInfo={() => setCurrentTab('school_info')}
              language={language}
              currentUser={currentUser}
              onLogout={() => {
                authService.logout();
                showNotification(
                  'info',
                  language === 'km'
                    ? 'បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ'
                    : language === 'zh-TW'
                    ? '已成功登出系統'
                    : 'Successfully logged out'
                );
              }}
            />
          ) : (
            <>
              {/* Tab 1: Dashboard View (Admin Only) */}
              {currentTab === 'dashboard' && (
                <Dashboard
                  students={students}
                  language={language}
                  connectionStatus={connectionStatus}
                  onNavigateToStudents={handleNavigateToStudents}
                  onAddStudent={() => handleOpenAddStudent()}
                  onViewStudent={handleOpenViewStudent}
                  onOpenSettings={() => {
                    if (!authService.isAdmin()) {
                      showNotification('error', 'ការកំណត់ Google Sheets ត្រូវបានអនុញ្ញាតសម្រាប់តែ Admin ប៉ុណ្ណោះ');
                      return;
                    }
                    setIsSettingsModalOpen(true);
                  }}
                  onNavigateToReports={() => setCurrentTab('reports')}
                  onNavigateToSchools={() => setCurrentTab('schools')}
                />
              )}

              {/* Tab 2: Student Table View (Admin Only) */}
              {currentTab === 'students' && (
                <StudentTable
                  students={students}
                  language={language}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  onAddStudent={() => handleOpenAddStudent()}
                  onEditStudent={handleOpenEditStudent}
                  onDeleteStudent={handleOpenDeleteStudent}
                  onViewStudent={handleOpenViewStudent}
                  onBulkDelete={handleBulkDelete}
                  onResequenceAll={handleResequenceAll}
                  isAdmin={isAdmin}
                  onNavigateToSchools={() => setCurrentTab('schools')}
                />
              )}

              {/* Tab 3: Student Reports View (Admin Only) */}
              {currentTab === 'reports' && (
                <StudentReport
                  students={students}
                  language={language}
                  onViewStudent={handleOpenViewStudent}
                  isAdmin={isAdmin}
                />
              )}

              {/* Tab 4: User Management View (Admin Only) */}
              {currentTab === 'users' && (
                <UserManagement
                  language={language}
                  onNavigateToDashboard={() => setCurrentTab('dashboard')}
                  webAppUrl={appScriptConfig.webAppUrl}
                  onSyncUsers={async () => {
                    if (appScriptConfig.webAppUrl) {
                      await AppsScriptService.syncUsers(appScriptConfig.webAppUrl, authService.getUsers());
                      await fetchAllFromSheets(true);
                    }
                  }}
                />
              )}

              {/* Tab 5: School & Logo Management View (Admin Only) */}
              {currentTab === 'schools' && (
                <SchoolManagementView
                  language={language}
                  onNavigateToDashboard={() => setCurrentTab('dashboard')}
                  webAppUrl={appScriptConfig.webAppUrl}
                  onSyncSchools={async () => {
                    if (appScriptConfig.webAppUrl) {
                      await AppsScriptService.syncSchools(
                        appScriptConfig.webAppUrl,
                        schoolMajorService.getSchools(),
                        schoolMajorService.getCustomTranslations(),
                        schoolMajorService.getDeletedSchools(),
                        schoolMajorService.getDeletedMajors()
                      );
                    }
                  }}
                />
              )}
            </>
          )}

        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              {t.appName} • {t.appSub}
            </span>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  {t.setupScript}
                </button>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {students.length} {t.students}
                </span>
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
        existingStudentIds={existingStudentIds}
        existingStudents={students}
        language={language}
        initialSchool={preselectedSchool}
      />

      {/* View Student Details Modal */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={student => {
          setIsDetailModalOpen(false);
          handleOpenEditStudent(student);
        }}
        onDelete={student => {
          setIsDetailModalOpen(false);
          handleOpenDeleteStudent(student);
        }}
        language={language}
        webAppUrl={appScriptConfig.webAppUrl}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        student={studentToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        language={language}
      />

      {/* Google Apps Script Integration & Instructions Modal */}
      <GoogleAppsScriptModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={appScriptConfig}
        onSaveConfig={setAppScriptConfig}
        connectionStatus={connectionStatus}
        onTestConnection={handleTestConnection}
        onPullFromSheets={handlePullFromSheets}
        onPushToSheets={handlePushToSheets}
        studentCount={students.length}
        language={language}
      />

      {/* User Login & Switch Account Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showNotification(
            'success',
            language === 'km'
              ? `ចូលប្រព័ន្ធជោគជ័យ: ${user.adminName} (${user.role})`
              : language === 'zh-TW'
              ? `登入系統成功：${user.adminName} (${user.role})`
              : `Successfully logged in: ${user.adminName} (${user.role})`
          );
        }}
        language={language}
        onSelectLanguage={setLanguage}
        onLanguageToggle={handleLanguageToggle}
      />

    </div>
  );
}
