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
import { LoginModal, LoginScreen } from './components/LoginModal';
import { StudentPortalView } from './components/StudentPortalView';
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

const STORAGE_KEY_STUDENTS = 'sms_students_data_v1';
const STORAGE_KEY_CONFIG = 'sms_appscript_config_v1';
const STORAGE_KEY_LANG = 'sms_app_lang_v1';

// Official Master Web App URL for Google Sheets Backend
export const HARDCODED_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz01aE2jUA4-GgNEmanaWjCKPGXX3ge4A0DA3Y1EEEc7LFjHWQp13JsRd0rE_Uq63FNKQ/exec';

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

  // Students list state
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
    return list.map(s => ({
      ...s,
      dob: formatDobOnly(s.dob),
      fatherDob: formatDobOnly(s.fatherDob),
      motherDob: formatDobOnly(s.motherDob),
    }));
  });

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
        setStudents(result.students);
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

  // Persist students to localStorage (strictly without resurrecting deleted schools!)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
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

  // Open Add Student Modal
  const handleOpenAddStudent = () => {
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
/**
 * Re-sequences student order numbers (លេខរៀង Auto: 1, 2, 3...)
 * When a student at any index is deleted, the numbers shift and reorder sequentially.
 * e.g., If we have 1, 2, 3, 4, 5:
 * - Deleting #1 causes #2 to become #1, #3 -> #2, #4 -> #3, #5 -> #4.
 * - Deleting #4 causes #5 to become #4 (result: 1, 2, 3, 4).
 */
const resequenceStudentsList = (list: Student[]): Student[] => {
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

  // Save (Create or Update) Student
  const handleSaveStudent = async (studentData: Student, isEdit: boolean) => {
    // Ensure school and major are registered in catalog
    if (studentData.targetSchool?.trim()) {
      schoolMajorService.ensureSchoolAndMajor(studentData.targetSchool, studentData.major);
    }

    if (isEdit) {
      // Update in local state
      setStudents(prev =>
        prev.map(s => (s.studentId === studentData.studentId ? studentData : s))
      );

      // Also update detail modal if it's currently open
      if (selectedStudentForDetail?.studentId === studentData.studentId) {
        setSelectedStudentForDetail(studentData);
      }

      showNotification('success', t.studentUpdatedSuccess);

      // Sync to Google Sheets in background if URL configured
      if (appScriptConfig.webAppUrl) {
        try {
          await AppsScriptService.updateStudent(appScriptConfig.webAppUrl, studentData);
        } catch (err: any) {
          console.warn('Apps Script update sync warning:', err);
          showNotification('info', `Saved locally. Google Sheets sync: ${err.message}`);
        }
      }
    } else {
      // Create new student - append and maintain numeric sorting
      setStudents(prev => {
        const nextList = [...prev, studentData];
        return nextList.sort((a, b) => {
          const numA = parseInt((a.studentId || '').replace(/\D/g, '') || '0', 10);
          const numB = parseInt((b.studentId || '').replace(/\D/g, '') || '0', 10);
          if (numA !== numB) return numA - numB;
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        });
      });
      showNotification('success', t.studentAddedSuccess);

      // Sync to Google Sheets in background if URL configured
      if (appScriptConfig.webAppUrl) {
        try {
          await AppsScriptService.createStudent(appScriptConfig.webAppUrl, studentData);
        } catch (err: any) {
          console.warn('Apps Script create sync warning:', err);
          showNotification('info', `Saved locally. Google Sheets sync: ${err.message}`);
        }
      }
    }
  };

  // Confirm Delete Student with Auto-resequence (លេខរៀង Auto)
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);

    const targetId = studentToDelete.studentId;

    try {
      // 1. Remove deleted student from local array
      const remaining = students.filter(s => s.studentId !== targetId);

      // 2. Automatically re-sequence order numbers (លេខរៀង Auto)
      // ឧទាហរណ៍: ១, ២, ៣, ៤, ៥ -> លុបទី១ -> ២ ក្លាយជា ១, ៣ ក្លាយជា ២...
      // ឧទាហរណ៍: ១, ២, ៣, ៤, ៥ -> លុបទី៤ -> ៥ ក្លាយជា ៤...
      const resequenced = resequenceStudentsList(remaining);

      // 3. Update state
      setStudents(resequenced);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      showNotification('success', t.studentDeletedSuccess);

      // If viewing details of this deleted student, close details modal
      if (selectedStudentForDetail?.studentId === targetId) {
        setIsDetailModalOpen(false);
        setSelectedStudentForDetail(null);
      }

      // 4. Sync to Google Sheets if configured
      if (appScriptConfig.webAppUrl) {
        try {
          // Use syncAllStudents so Google Sheets rows also update to 1, 2, 3, 4...
          await AppsScriptService.syncAllStudents(appScriptConfig.webAppUrl, resequenced);
        } catch (err: any) {
          console.warn('Apps Script sync warning after delete:', err);
          try {
            await AppsScriptService.deleteStudent(appScriptConfig.webAppUrl, targetId);
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
  const handleBulkDelete = async (studentIds: string[]) => {
    const count = studentIds.length;
    if (count === 0) return;

    const confirmed = window.confirm(
      language === 'km'
        ? `តើអ្នកពិតជាចង់លុបសិស្សទាំង ${count} នាក់នេះមែនទេ?`
        : `Are you sure you want to delete these ${count} students?`
    );
    if (!confirmed) return;

    const remaining = students.filter(s => !studentIds.includes(s.studentId));
    const resequenced = resequenceStudentsList(remaining);

    setStudents(resequenced);
    showNotification('success', `${count} students deleted.`);

    if (appScriptConfig.webAppUrl) {
      try {
        await AppsScriptService.syncAllStudents(appScriptConfig.webAppUrl, resequenced);
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
          showNotification('success', `ចូលប្រព័ន្ធជោគជ័យ: ${user.adminName} (${user.role})`);
        }}
        language={language}
        onLanguageToggle={handleLanguageToggle}
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
          showNotification('info', 'បានចាកចេញពីប្រព័ន្ធ');
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

          {/* If Student: Show strictly only StudentPortalView */}
          {!isAdmin ? (
            <StudentPortalView
              onAddStudent={handleOpenAddStudent}
              language={language}
              currentUser={currentUser}
              onLogout={() => {
                authService.logout();
                showNotification('info', 'បានចាកចេញពីប្រព័ន្ធ');
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
                  onAddStudent={handleOpenAddStudent}
                  onViewStudent={handleOpenViewStudent}
                  onOpenSettings={() => {
                    if (!authService.isAdmin()) {
                      showNotification('error', 'ការកំណត់ Google Sheets ត្រូវបានអនុញ្ញាតសម្រាប់តែ Admin ប៉ុណ្ណោះ');
                      return;
                    }
                    setIsSettingsModalOpen(true);
                  }}
                  onNavigateToReports={() => setCurrentTab('reports')}
                />
              )}

              {/* Tab 2: Student Table View (Admin Only) */}
              {currentTab === 'students' && (
                <StudentTable
                  students={students}
                  language={language}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  onAddStudent={handleOpenAddStudent}
                  onEditStudent={handleOpenEditStudent}
                  onDeleteStudent={handleOpenDeleteStudent}
                  onViewStudent={handleOpenViewStudent}
                  onBulkDelete={handleBulkDelete}
                  onResequenceAll={handleResequenceAll}
                  isAdmin={isAdmin}
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
          showNotification('success', `ចូលប្រព័ន្ធជោគជ័យ: ${user.adminName} (${user.role})`);
        }}
        language={language}
      />

    </div>
  );
}
