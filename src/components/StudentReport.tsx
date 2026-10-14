import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  RotateCcw, 
  Search, 
  Calendar, 
  Users, 
  GraduationCap, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  FileSpreadsheet,
  Building2,
  X,
  FileCheck,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Student, Language, ReportFilterState, SortConfig, SortField } from '../types';
import { translations } from '../translations';
import { MAJORS, TARGET_SCHOOLS } from '../constants/studentOptions';
import { areAllRequiredDocumentsUploaded, countUploadedCategories } from '../utils/documentUtils';
import { calculateAge, formatAge, formatDobOnly } from '../utils/ageUtils';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { TranslationTooltip } from './TranslationTooltip';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';
import { schoolMajorService } from '../services/schoolMajorService';
import { PrintReportModal } from './PrintReportModal';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

interface StudentReportProps {
  students: Student[];
  language: Language;
  onViewStudent?: (student: Student) => void;
  isAdmin?: boolean;
}

export const StudentReport: React.FC<StudentReportProps> = ({
  students,
  language,
  onViewStudent,
  isAdmin = authService.isAdmin(),
}) => {
  const t = translations[language];

  // Report filter state
  const [filters, setFilters] = useState<ReportFilterState>({
    search: '',
    gender: 'all',
    major: 'all',
    targetSchool: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    hasNotes: 'all',
  });

  const [docFilter, setDocFilter] = useState<'all' | 'complete' | 'partial' | 'none'>('all');

  // Table sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'studentId',
    order: 'asc',
  });

  // Subscribe to dynamic schools and majors updates
  const [schoolsVersion, setSchoolsVersion] = useState(0);
  React.useEffect(() => {
    const unsub = schoolMajorService.subscribe(() => {
      setSchoolsVersion(v => v + 1);
    });
    return unsub;
  }, []);

  // Unique majors for filter dropdown
  const majorList = useMemo(() => {
    const set = new Set<string>();
    // 1. From schoolMajorService (includes all custom & pre-configured majors)
    schoolMajorService.getAllMajors().forEach(m => {
      if (m && m.trim()) set.add(m.trim());
    });
    // 2. From standard MAJORS list
    MAJORS.forEach(m => {
      if (m && m.trim()) set.add(m.trim());
    });
    // 3. From students records (including custom entered majors)
    students.forEach(s => {
      if (s.major?.trim()) set.add(s.major.trim());
    });
    return Array.from(set);
  }, [students, schoolsVersion]);

  // Unique schools for filter dropdown
  const schoolList = useMemo(() => {
    const isExcluded = (name: string) => 
      !name || 
      name.trim() === '日興國際學校' || 
      name.trim() === 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' ||
      name.toLowerCase().includes('lising international');

    const set = new Set<string>();
    // 1. From schoolMajorService (includes all newly added schools)
    schoolMajorService.getSchoolNames().forEach(s => {
      if (s && s.trim() && !isExcluded(s)) set.add(s.trim());
    });
    // 2. From standard TARGET_SCHOOLS list
    TARGET_SCHOOLS.forEach(s => {
      if (s && s.trim() && !isExcluded(s)) set.add(s.trim());
    });
    // 3. From students records (including custom entered schools)
    students.forEach(s => {
      if (s.targetSchool?.trim() && !isExcluded(s.targetSchool.trim())) {
        set.add(s.targetSchool.trim());
      }
    });
    return Array.from(set);
  }, [students, schoolsVersion]);

  // Filter logic
  const filteredStudents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of this week (Monday)
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1).getTime();

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return students.filter(student => {
      // Search query filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesKhmer = (student.nameKhmer || student.name || '').toLowerCase().includes(query);
        const matchesLatin = (student.nameLatin || '').toLowerCase().includes(query);
        const matchesChinese = (student.nameChinese || '').toLowerCase().includes(query);
        const matchesId = (student.studentId || '').toLowerCase().includes(query);
        const matchesPhone = (student.phone || '').toLowerCase().includes(query);
        const matchesEmail = (student.email || '').toLowerCase().includes(query);
        const matchesAge = (student.age ? student.age.toString() : (calculateAge(student.dob)?.toString() || '')).includes(query);
        const matchesFather = (student.fatherNameEnglish || student.fatherNameChinese || student.fatherPhone || '').toLowerCase().includes(query);
        const matchesMother = (student.motherNameEnglish || student.motherNameChinese || student.motherPhone || '').toLowerCase().includes(query);
        const matchesPassport = (student.passportNumber || '').toLowerCase().includes(query);
        const matchesIdCard = (student.idCardNumber || '').toLowerCase().includes(query);
        const matchesSchool = (student.targetSchool || '').toLowerCase().includes(query) ||
          Boolean(getSchoolTranslation(student.targetSchool)?.km.toLowerCase().includes(query)) ||
          Boolean(getSchoolTranslation(student.targetSchool)?.en.toLowerCase().includes(query));
        const matchesMajor = (student.major || '').toLowerCase().includes(query) ||
          Boolean(getMajorTranslation(student.major)?.km.toLowerCase().includes(query)) ||
          Boolean(getMajorTranslation(student.major)?.en.toLowerCase().includes(query));

        if (!matchesKhmer && !matchesLatin && !matchesChinese && !matchesId && !matchesPhone && !matchesEmail && !matchesAge && !matchesFather && !matchesMother && !matchesPassport && !matchesIdCard && !matchesSchool && !matchesMajor) {
          return false;
        }
      }

      // Gender filter
      if (filters.gender !== 'all' && student.gender !== filters.gender) {
        return false;
      }

      // Major filter
      if (filters.major && filters.major !== 'all') {
        const selMajor = filters.major.trim().toLowerCase();
        const stuMajor = (student.major || '').trim().toLowerCase();
        const selTrans = getMajorTranslation(filters.major);
        const stuTrans = getMajorTranslation(student.major);
        const isMatch = stuMajor === selMajor ||
          (selTrans && stuTrans && selTrans.zh.toLowerCase() === stuTrans.zh.toLowerCase()) ||
          (selTrans && (stuMajor === selTrans.km.toLowerCase() || stuMajor === selTrans.en.toLowerCase() || stuMajor === selTrans.zh.toLowerCase())) ||
          (stuTrans && (selMajor === stuTrans.km.toLowerCase() || selMajor === stuTrans.en.toLowerCase() || selMajor === stuTrans.zh.toLowerCase()));
        if (!isMatch) return false;
      }

      // Target School filter
      if (filters.targetSchool && filters.targetSchool !== 'all') {
        const selSchool = filters.targetSchool.trim().toLowerCase();
        const stuSchool = (student.targetSchool || '').trim().toLowerCase();
        const selTrans = getSchoolTranslation(filters.targetSchool);
        const stuTrans = getSchoolTranslation(student.targetSchool);
        const isMatch = stuSchool === selSchool ||
          (selTrans && stuTrans && selTrans.zh.toLowerCase() === stuTrans.zh.toLowerCase()) ||
          (selTrans && (stuSchool === selTrans.km.toLowerCase() || stuSchool === selTrans.en.toLowerCase() || stuSchool === selTrans.zh.toLowerCase())) ||
          (stuTrans && (selSchool === stuTrans.km.toLowerCase() || selSchool === stuTrans.en.toLowerCase() || selSchool === stuTrans.zh.toLowerCase()));
        if (!isMatch) return false;
      }

      // Document filter (based on 5 required documents)
      const docVal = areAllRequiredDocumentsUploaded(student.documents);
      const catCount = countUploadedCategories(student.documents);
      if (docFilter === 'complete' && !docVal.isValid) return false;
      if (docFilter === 'partial' && (catCount === 0 || docVal.isValid)) return false;
      if (docFilter === 'none' && catCount > 0) return false;

      // Notes filter
      if (filters.hasNotes === 'yes' && (!student.notes || !student.notes.trim())) {
        return false;
      }
      if (filters.hasNotes === 'no' && student.notes && student.notes.trim()) {
        return false;
      }

      // Date Range filter
      if (filters.dateRange !== 'all' && student.createdAt) {
        const studentTime = new Date(student.createdAt).getTime();

        if (filters.dateRange === 'today') {
          if (studentTime < startOfToday) return false;
        } else if (filters.dateRange === 'week') {
          if (studentTime < startOfWeek) return false;
        } else if (filters.dateRange === 'month') {
          if (studentTime < startOfMonth) return false;
        } else if (filters.dateRange === 'custom') {
          if (filters.startDate) {
            const customStart = new Date(filters.startDate).getTime();
            if (studentTime < customStart) return false;
          }
          if (filters.endDate) {
            const customEnd = new Date(filters.endDate).getTime() + 86400000;
            if (studentTime > customEnd) return false;
          }
        }
      }

      return true;
    });
  }, [students, filters, docFilter]);

  // Handle Sort
  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Sort computation
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const field = sortConfig.field;
      if (field === 'studentId') {
        const numA = parseInt(a.studentId.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.studentId.replace(/\D/g, '') || '0', 10);
        if (numA !== numB) {
          return sortConfig.order === 'asc' ? numA - numB : numB - numA;
        }
      }

      if (field === 'targetSchool') {
        const schA = (a.targetSchool || '').toLowerCase();
        const schB = (b.targetSchool || '').toLowerCase();
        if (schA !== schB) {
          return sortConfig.order === 'asc' ? schA.localeCompare(schB) : schB.localeCompare(schA);
        }
        // Sub-sort by major
        const majA = (a.major || '').toLowerCase();
        const majB = (b.major || '').toLowerCase();
        if (majA !== majB) {
          return majA.localeCompare(majB);
        }
        // Sub-sort by studentId
        const numA = parseInt(a.studentId.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.studentId.replace(/\D/g, '') || '0', 10);
        return numA - numB;
      }

      const valA = ((a as any)[field] || (field === 'nameKhmer' ? a.name : '') || '').toString().toLowerCase();
      const valB = ((b as any)[field] || (field === 'nameKhmer' ? b.name : '') || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return sortConfig.order === 'asc' ? comp : -comp;
    });
  }, [filteredStudents, sortConfig]);

  // Hierarchical breakdown: School -> Majors -> Student Counts
  const schoolMajorHierarchy = useMemo(() => {
    const map = new Map<string, { total: number; majors: Map<string, number> }>();

    filteredStudents.forEach(s => {
      const sch = s.targetSchool?.trim() || (language === 'km' ? 'មិនទាន់បញ្ជាក់សាលា' : language === 'zh-TW' ? '未指定學校' : 'Unspecified School');
      const maj = s.major?.trim() || (language === 'km' ? 'មិនទាន់បញ្ជាក់ជំនាញ' : language === 'zh-TW' ? '未指定專業' : 'Unspecified Major');

      if (!map.has(sch)) {
        map.set(sch, { total: 0, majors: new Map() });
      }
      const schoolEntry = map.get(sch)!;
      schoolEntry.total++;
      schoolEntry.majors.set(maj, (schoolEntry.majors.get(maj) || 0) + 1);
    });

    const result: Array<{
      school: string;
      total: number;
      majors: Array<{ major: string; count: number; percentage: number }>;
    }> = [];

    map.forEach((data, school) => {
      const majorsList: Array<{ major: string; count: number; percentage: number }> = [];
      data.majors.forEach((count, major) => {
        majorsList.push({
          major,
          count,
          percentage: data.total > 0 ? Math.round((count / data.total) * 100) : 0,
        });
      });
      majorsList.sort((a, b) => b.count - a.count);

      result.push({
        school,
        total: data.total,
        majors: majorsList,
      });
    });

    result.sort((a, b) => b.total - a.total);
    return result;
  }, [filteredStudents, language]);

  // Quick statistics
  const totalCount = filteredStudents.length;
  const maleCount = filteredStudents.filter(s => s.gender === 'Male').length;
  const femaleCount = filteredStudents.filter(s => s.gender === 'Female').length;
  const withDocsCount = filteredStudents.filter(s => {
    return s.documents && Object.keys(s.documents).some(k => !!(s.documents as any)[k]);
  }).length;

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      gender: 'all',
      major: 'all',
      targetSchool: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      hasNotes: 'all',
    });
    setDocFilter('all');
  };

  // Print & PDF modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');

  // Print trigger: opens Print & PDF Center with direct print attempt & preview
  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (sortedStudents.length === 0) return;

    const headers = [
      'លេខរៀង (No.)',
      'ឈ្មោះខ្មែរ (Name Khmer)',
      'ឈ្មោះអង់គ្លេស (Name Latin)',
      'ឈ្មោះចិន (Name Chinese)',
      'ភេទ (Gender)',
      'ថ្ងៃកំណើតសិស្ស (Student DOB)',
      'អាយុ (Age)',
      'ទីកន្លែងកំណើត (Place of Birth)',
      'អត្តសញ្ញាបណ្ណ (ID Card)',
      'លិខិតឆ្លងដែន (Passport)',
      'ឈ្មោះអ្នកណែនាំ (Referrer Name)',
      'ទូរស័ព្ទសិស្ស (Student Phone)',
      'អ៊ីមែល (E-mail)',
      'អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)',
      'ឈ្មោះឪពុកអង់គ្លេស (Father Name EN)',
      'ឈ្មោះឪពុកចិន (Father Name CN)',
      'ថ្ងៃកំណើតឪពុក (Father DOB)',
      'អាយុឪពុក (Father Age)',
      'ទូរស័ព្ទឪពុក (Father Phone)',
      'ឈ្មោះម្ដាយអង់គ្លេស (Mother Name EN)',
      'ឈ្មោះម្ដាយចិន (Mother Name CN)',
      'ថ្ងៃកំណើតម្ដាយ (Mother DOB)',
      'អាយុម្ដាយ (Mother Age)',
      'ទូរស័ព្ទម្ដាយ (Mother Phone)',
      'សាលានៅខ្មែរ (School in Cambodia)',
      'អាសយដ្ឋានសាលានៅខ្មែរ (School Address in Cambodia)',
      'សាលាដែលជ្រើសរើស (Target School)',
      'ជំនាញដែលជ្រើសរើស (Major)',
      'ចំនួនឯកសារភ្ជាប់ (Attached Docs)',
      'កំណត់សម្គាល់ (Notes)',
      'កាលបរិច្ឆេទចុះឈ្មោះ (Created At)'
    ];

    const rows = sortedStudents.map(s => {
      const docVal = areAllRequiredDocumentsUploaded(s.documents);
      const docCount = `${docVal.completedCount} / ${docVal.totalRequired}`;
      const studentAgeStr = s.age ? s.age.toString() : (calculateAge(s.dob)?.toString() || '');
      const fatherAgeStr = s.fatherAge ? s.fatherAge.toString() : (calculateAge(s.fatherDob)?.toString() || '');
      const motherAgeStr = s.motherAge ? s.motherAge.toString() : (calculateAge(s.motherDob)?.toString() || '');

      return [
        `"${s.studentId}"`,
        `"${(s.nameKhmer || s.name || '').replace(/"/g, '""')}"`,
        `"${(s.nameLatin || '').replace(/"/g, '""')}"`,
        `"${(s.nameChinese || '').replace(/"/g, '""')}"`,
        `"${s.gender}"`,
        `"${formatDobOnly(s.dob)}"`,
        `"${studentAgeStr}"`,
        `"${(s.placeOfBirth || '').replace(/"/g, '""')}"`,
        `"${s.idCardNumber || ''}"`,
        `"${s.passportNumber || ''}"`,
        `"${(s.referrerName || '').replace(/"/g, '""')}"`,
        `"${s.phone}"`,
        `"${s.email || ''}"`,
        `"${(s.currentAddress || '').replace(/"/g, '""')}"`,
        `"${(s.fatherNameEnglish || '').replace(/"/g, '""')}"`,
        `"${(s.fatherNameChinese || '').replace(/"/g, '""')}"`,
        `"${formatDobOnly(s.fatherDob)}"`,
        `"${fatherAgeStr}"`,
        `"${s.fatherPhone || ''}"`,
        `"${(s.motherNameEnglish || '').replace(/"/g, '""')}"`,
        `"${(s.motherNameChinese || '').replace(/"/g, '""')}"`,
        `"${formatDobOnly(s.motherDob)}"`,
        `"${motherAgeStr}"`,
        `"${s.motherPhone || ''}"`,
        `"${(s.previousSchoolKhmer || '').replace(/"/g, '""')}"`,
        `"${(s.previousSchoolAddressKhmer || '').replace(/"/g, '""')}"`,
        `"${(s.targetSchool || '').replace(/"/g, '""')}"`,
        `"${(s.major || '').replace(/"/g, '""')}"`,
        `"${docCount} / 5"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
        `"${s.createdAt || ''}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Student_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Excel (.xlsx)
  const handleExportExcel = () => {
    if (sortedStudents.length === 0) return;
    exportToExcel(sortedStudents, 'Student_Report', language);
  };

  // Export PDF (.pdf) with 100% Khmer and Chinese Font Support
  const handleExportPdf = async () => {
    if (sortedStudents.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      const reportTitle = language === 'zh-TW' 
        ? '學生報表統計 (Student Comprehensive Report)' 
        : language === 'en' 
        ? 'Student Comprehensive Report' 
        : 'តារាងរបាយការណ៍សិស្ស (Student Comprehensive Report)';
      await exportToPDF(sortedStudents, reportTitle, 'Student_Report', language, (msg) => {
        setPdfProgress(msg);
      });
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.gender !== 'all' ||
    filters.major !== 'all' ||
    filters.targetSchool !== 'all' ||
    docFilter !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.hasNotes !== 'all';

  const currentDateFormatted = new Date().toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* TOP HEADER & ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-indigo-600 shadow-xs shrink-0 overflow-hidden hidden sm:flex items-center justify-center">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>{t.studentReport}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              សាលារៀនចិនលីស៊ីងអន្តរជាតិ (日興國際學校) • {t.reportSubtitle}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          )}

          {/* Export & Print buttons (Admin Only) */}
          {isAdmin ? (
            <>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  title={t.exportCsv}
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>
                <span className="w-px h-4 bg-slate-200" />
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                  title={t.exportExcel}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel</span>
                </button>
                <span className="w-px h-4 bg-slate-200" />
                <button
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                  title={t.exportPdf}
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{isGeneratingPdf ? (language === 'km' ? 'កំពុងបង្កើត PDF...' : 'PDF...') : 'PDF'}</span>
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title={language === 'km' ? 'បើកផ្ទាំងបោះពុម្ព និងទាញយករបាយការណ៍' : 'Open Print & PDF Export Center'}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printReport}</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
              🔒 ទាញយក និងបោះពុម្ព (Admin Only)
            </div>
          )}
        </div>
      </div>

      {/* COMPREHENSIVE FILTER PANEL */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>{t.filterOptions}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Search Box */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">{t.search}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white outline-hidden"
              />
            </div>
          </div>

          {/* 2. Gender Filter */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">{t.gender}</label>
            <select
              value={filters.gender}
              onChange={e => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="all">{t.allGenders}</option>
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
              <option value="Other">{t.other}</option>
            </select>
          </div>

          {/* 3. Major Filter */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">{t.major}</label>
            <select
              value={filters.major || 'all'}
              onChange={e => setFilters(prev => ({ ...prev, major: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white truncate"
            >
              <option value="all">{t.filterByMajor}</option>
              {majorList.map(m => {
                const trans = getMajorTranslation(m);
                const suffix = trans ? (language === 'km' ? ` (${trans.km})` : ` (${trans.en})`) : '';
                return (
                  <option key={m} value={m}>{m}{suffix}</option>
                );
              })}
            </select>
          </div>

          {/* 4. Target School Filter */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">{t.targetSchool}</label>
            <select
              value={filters.targetSchool || 'all'}
              onChange={e => setFilters(prev => ({ ...prev, targetSchool: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white truncate"
            >
              <option value="all">{t.allSchools}</option>
              {schoolList.map(sch => {
                const trans = getSchoolTranslation(sch);
                const suffix = trans ? (language === 'km' ? ` (${trans.km})` : ` (${trans.en})`) : '';
                return (
                  <option key={sch} value={sch}>{sch}{suffix}</option>
                );
              })}
            </select>
          </div>

          {/* 5. Document Upload Filter */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">{t.documentsSection}</label>
            <select
              value={docFilter}
              onChange={e => setDocFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="all">{language === 'km' ? 'ឯកសារទាំងអស់' : language === 'zh-TW' ? '所有附件狀態' : 'All Documents'}</option>
              <option value="complete">{language === 'km' ? 'គ្រប់ ៦ ឯកសារចាំបាច់ (*)' : language === 'zh-TW' ? '已備齊 6 份必備文件 (*)' : 'All 6 Required Documents (*)'}</option>
              <option value="partial">{language === 'km' ? 'មិនទាន់គ្រប់ (Partial)' : language === 'zh-TW' ? '未齊全 (部分上傳)' : 'Partial Documents'}</option>
              <option value="none">{language === 'km' ? 'គ្មានឯកសារ (No Documents)' : 'No Documents'}</option>
            </select>
          </div>

          {/* 6. Date Range Filter */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">{t.filterByDate}</label>
            <select
              value={filters.dateRange}
              onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="all">{t.allDates}</option>
              <option value="today">{t.today}</option>
              <option value="week">{t.thisWeek}</option>
              <option value="month">{t.thisMonth}</option>
              <option value="custom">{t.customDate}</option>
            </select>
          </div>

          {/* 7. Custom Start Date */}
          {filters.dateRange === 'custom' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">{t.startDate}</label>
              <input
                type="date"
                lang="en-CA"
                placeholder="yyyy-mm-dd"
                value={filters.startDate}
                onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
              />
            </div>
          )}

          {/* 8. Custom End Date */}
          {filters.dateRange === 'custom' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">{t.endDate}</label>
              <input
                type="date"
                lang="en-CA"
                placeholder="yyyy-mm-dd"
                value={filters.endDate}
                onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* METRIC SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">{t.totalFiltered}</span>
            <span className="text-xl font-black text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            {t.male.charAt(0)}
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">{t.maleStudents}</span>
            <span className="text-xl font-black text-blue-600">{maleCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
            {t.female.charAt(0)}
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">{t.femaleStudents}</span>
            <span className="text-xl font-black text-rose-600">{femaleCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">{language === 'km' ? 'មានឯកសារភ្ជាប់' : 'With Documents'}</span>
            <span className="text-xl font-black text-emerald-700">{withDocsCount}</span>
          </div>
        </div>
      </div>

      {/* HIERARCHICAL SCHOOL & MAJOR BREAKDOWN (រៀបចំតាមលំដាប់លំដោយ នៃឈ្មោះសាលា និង ឈ្មោះនៃជំនាញ) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 print:border print:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                {language === 'km' 
                  ? 'របាយការណ៍សង្ខេបតាមលំដាប់លំដោយ សាលារៀនចិន និង មុខជំនាញនីមួយៗ' 
                  : language === 'zh-TW'
                  ? '各校與對應科系人數排序總表 (學校與科系層級分析)'
                  : 'Hierarchical Breakdown by Chinese School & Major'}
              </h4>
              <p className="text-xs text-slate-500">
                {language === 'km' 
                  ? 'បង្ហាញចំនួនសិស្សជាក់លាក់ក្នុងជំនាញនីមួយៗ នៃសាលានីមួយៗយ៉ាងច្បាស់លាស់' 
                  : 'Student counts grouped neatly by school and major'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 self-start sm:self-auto">
            {schoolMajorHierarchy.length} {language === 'km' ? 'សាលារៀន' : 'Schools'} • {filteredStudents.length} {t.students}
          </span>
        </div>

        {schoolMajorHierarchy.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            {t.noStudentsFound}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolMajorHierarchy.map((group) => {
              const sTrans = getSchoolTranslation(group.school);
              return (
                <div 
                  key={group.school} 
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5 hover:border-indigo-300 transition-colors shadow-2xs"
                >
                  {/* School Title & Total */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <TranslationTooltip text={group.school} type="school" currentLanguage={language}>
                          <span className="truncate hover:text-indigo-600 transition-colors block">
                            {group.school}
                          </span>
                        </TranslationTooltip>
                      </div>
                      {sTrans && (
                        <p className="text-[11px] text-amber-700 font-medium truncate mt-0.5 font-battambang">
                          🇰🇭 {sTrans.km}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0 shadow-2xs">
                      {group.total} {t.students}
                    </span>
                  </div>

                  {/* Majors List under this School */}
                  <div className="space-y-1.5">
                    {group.majors.map((mItem) => {
                      const mTrans = getMajorTranslation(mItem.major);
                      return (
                        <div 
                          key={mItem.major}
                          onClick={() => setFilters(prev => ({ ...prev, targetSchool: group.school, major: mItem.major }))}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer group/major"
                          title="Click to filter by this school & major"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover/major:text-indigo-700 transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              <TranslationTooltip text={mItem.major} type="major" currentLanguage={language}>
                                <span className="truncate">{mItem.major}</span>
                              </TranslationTooltip>
                            </div>
                            {mTrans && (
                              <p className="text-[10px] text-slate-500 font-battambang truncate pl-3">
                                {mTrans.km}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-xs">
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">
                              {mItem.count} {t.students}
                            </span>
                            <span className="text-[10px] font-semibold text-indigo-600 min-w-[28px] text-right">
                              {mItem.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRINT-READY REPORT SHEET / TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Printable Official Letterhead */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 print:bg-white print:p-0 print:border-b-2 print:border-slate-800">
          {/* Centered National Motto in 3 Languages */}
          <div className="text-center mb-4 pb-3 border-b border-slate-200/80">
            <div className="font-battambang font-black text-sm sm:text-base text-slate-900 leading-tight">
              ព្រះរាជាណាចក្រកម្ពុជា
            </div>
            <div className="font-battambang font-bold text-xs sm:text-sm text-slate-700 mt-0.5">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </div>
            <div className="font-kai font-bold text-xs text-slate-700 mt-1">
              柬埔寨王國 • 民族 宗教 國王
            </div>
            <div className="font-sans font-semibold text-[10px] sm:text-[11px] text-slate-600 tracking-wider uppercase mt-0.5">
              KINGDOM OF CAMBODIA • NATION RELIGION KING
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs print:border print:border-slate-800">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {t.appName}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.studentReport} • {currentDateFormatted}
                </p>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="text-xs text-slate-600 space-y-0.5 sm:text-right">
              <div>
                <span className="font-semibold">{t.major}: </span>
                <span className="font-bold text-indigo-700">
                  {!filters.major || filters.major === 'all' ? (
                    t.allMajors
                  ) : (
                    <TranslationTooltip text={filters.major} type="major" currentLanguage={language}>
                      <span className="underline decoration-dotted">{filters.major}</span>
                    </TranslationTooltip>
                  )}
                </span>
              </div>
              <div>
                <span className="font-semibold">{t.gender}: </span>
                <span>
                  {filters.gender === 'all' ? t.allGenders : filters.gender === 'Male' ? t.male : filters.gender === 'Female' ? t.female : t.other}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scroll Indicator */}
        <div className="md:hidden px-3.5 py-2 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-800">
          <span className="flex items-center gap-1.5 font-medium">
            <span>👈👉</span>
            <span>{language === 'km' ? 'អូសតារាងរបាយការណ៍ទៅឆ្វេង-ស្តាំ ដើម្បីមើលជួរឈរពេញ' : 'Swipe horizontally to view all report columns'}</span>
          </span>
          <span className="font-mono text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
            {filteredStudents.length} {t.students}
          </span>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1080px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 font-bold text-xs tracking-wider print:bg-slate-200 text-center">
                <th 
                  className="py-3 px-2 cursor-pointer hover:bg-slate-200/60 transition-colors print:cursor-default w-20 text-center"
                  onClick={() => handleSort('studentId')}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-1 font-bold">
                      <span>{t.orderNumber}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400 print:hidden" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">No. / 編號</span>
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors print:cursor-default min-w-[180px] text-center"
                  onClick={() => handleSort('nameKhmer')}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-1 font-bold">
                      <span>ឈ្មោះសិស្ស</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400 print:hidden" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">Name (KH/EN/CN) / 學生姓名</span>
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors print:cursor-default text-center min-w-[140px]"
                  onClick={() => handleSort('gender')}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-1 font-bold">
                      <span>{t.gender} & {t.dob}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400 print:hidden" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">Sex & DOB / 性別與生日</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-mono text-center">
                  <div className="flex flex-col items-center justify-center font-bold">
                    <span>{t.idCardNumber}</span>
                    <span className="text-[11px] text-slate-500 font-normal">ID Card / 身分證</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-mono text-center">
                  <div className="flex flex-col items-center justify-center font-bold">
                    <span>{t.passportNumber}</span>
                    <span className="text-[11px] text-slate-500 font-normal">Passport / 護照</span>
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[130px] text-center">
                  <div className="flex flex-col items-center justify-center font-bold">
                    <span>{t.referrerName}</span>
                    <span className="text-[11px] text-slate-500 font-normal">Referrer / 推薦人</span>
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors print:cursor-default min-w-[180px] text-center"
                  onClick={() => handleSort('targetSchool')}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-1 font-bold">
                      <span>{t.targetSchool} / {t.major}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400 print:hidden" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">School & Major / 學校與科系</span>
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[180px] text-center">
                  <div className="flex flex-col items-center justify-center font-bold">
                    <span>ឪពុក & ម្ដាយ</span>
                    <span className="text-[11px] text-slate-500 font-normal">Parents Info / 父母親</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex flex-col items-center justify-center font-bold">
                    <span>{t.attachedDocs}</span>
                    <span className="text-[11px] text-slate-500 font-normal">Docs / 附件</span>
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center justify-center font-bold">
                    <span>{t.phone}</span>
                    <span className="text-[11px] text-slate-500 font-normal">Phone / 電話</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">{t.noStudentsFound}</p>
                    <p className="text-xs mt-1">{t.noStudentsDesc}</p>
                  </td>
                </tr>
              ) : (
                sortedStudents.map(student => {
                  const docVal = areAllRequiredDocumentsUploaded(student.documents);
                  const catCount = countUploadedCategories(student.documents);
                  return (
                    <tr 
                      key={student.studentId}
                      className="hover:bg-slate-50/80 transition-colors print:hover:bg-transparent"
                    >
                      <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                        #{student.studentId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">
                              {student.nameKhmer || student.name || '-'}
                            </span>
                            {student.nameChinese && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                                {student.nameChinese}
                              </span>
                            )}
                          </div>
                          {student.nameLatin && (
                            <p className="text-xs text-slate-600 font-medium">
                              {student.nameLatin}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              student.gender === 'Female' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/60' 
                                : student.gender === 'Male'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {student.gender === 'Male' ? t.male : student.gender === 'Female' ? t.female : t.other}
                            </span>
                            {(student.age || calculateAge(student.dob)) && (
                              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                                {formatAge(student.age || calculateAge(student.dob), language)}
                              </span>
                            )}
                          </div>
                          {student.dob && (
                            <div className="text-xs text-slate-600 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatDobOnly(student.dob)}</span>
                            </div>
                          )}
                          {student.placeOfBirth && (
                            <div className="flex items-center gap-1 text-xs text-slate-600 pt-0.5">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <TranslationTooltip text={student.placeOfBirth} type="pob" currentLanguage={language}>
                                <span className="hover:text-indigo-600 truncate max-w-[130px] font-medium cursor-help">
                                  {student.placeOfBirth}
                                </span>
                              </TranslationTooltip>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs">
                        <span className={student.idCardNumber ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                          {student.idCardNumber || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs">
                        <span className={student.passportNumber ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                          {student.passportNumber || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <span className={student.referrerName ? 'font-medium text-indigo-900 bg-indigo-50/70 px-1.5 py-0.5 rounded border border-indigo-100' : 'text-slate-400'}>
                          {student.referrerName || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {student.targetSchool ? (
                            <TranslationTooltip text={student.targetSchool} type="school" currentLanguage={language}>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm hover:text-indigo-600 transition-colors">
                                {student.targetSchool}
                              </div>
                            </TranslationTooltip>
                          ) : (
                            <div className="text-slate-400 text-xs">-</div>
                          )}
                          {student.major && (
                            <TranslationTooltip text={student.major} type="major" currentLanguage={language}>
                              <div>
                                <span className="text-xs text-indigo-700 font-bold block hover:text-indigo-900 transition-colors">
                                  {student.major}
                                </span>
                                {getMajorTranslation(student.major) && (
                                  <span className="text-[11px] text-slate-500 font-medium block">
                                    {getMajorTranslation(student.major)?.km}
                                  </span>
                                )}
                              </div>
                            </TranslationTooltip>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <div className="space-y-1">
                          {(student.fatherNameEnglish || student.fatherPhone) && (
                            <div className="text-slate-700">
                              <span className="text-slate-400 font-medium">ឳ: </span>
                              <span>{student.fatherNameEnglish || '-'}</span>
                              {(student.fatherAge || calculateAge(student.fatherDob)) && (
                                <span className="text-slate-500 text-[10px] ml-1">
                                  [{formatAge(student.fatherAge || calculateAge(student.fatherDob), language)}]
                                </span>
                              )}
                              {student.fatherPhone && <span className="font-mono text-slate-500 ml-1">({student.fatherPhone})</span>}
                            </div>
                          )}
                          {(student.motherNameEnglish || student.motherPhone) && (
                            <div className="text-slate-700">
                              <span className="text-slate-400 font-medium">ម្ដ: </span>
                              <span>{student.motherNameEnglish || '-'}</span>
                              {(student.motherAge || calculateAge(student.motherDob)) && (
                                <span className="text-slate-500 text-[10px] ml-1">
                                  [{formatAge(student.motherAge || calculateAge(student.motherDob), language)}]
                                </span>
                              )}
                              {student.motherPhone && <span className="font-mono text-slate-500 ml-1">({student.motherPhone})</span>}
                            </div>
                          )}
                          {!student.fatherNameEnglish && !student.fatherPhone && !student.motherNameEnglish && !student.motherPhone && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          docVal.isValid 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : catCount > 0 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {docVal.completedCount}/{docVal.totalRequired}*
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-mono font-medium text-slate-800">{student.phone}</div>
                          {student.email && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{student.email}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Official Signatures Footer */}
        <div className="p-8 border-t border-slate-200 mt-4 print:mt-12 bg-slate-50/40 print:bg-transparent">
          <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
            <div className="space-y-16">
              <p className="font-semibold text-slate-800">{t.signatureTeacher}</p>
              <div className="border-b border-dashed border-slate-400 w-48 mx-auto" />
            </div>
            <div className="space-y-16">
              <p className="font-semibold text-slate-800">{t.signaturePrincipal}</p>
              <div className="border-b border-dashed border-slate-400 w-48 mx-auto" />
            </div>
          </div>
        </div>

      </div>

      {/* Print & PDF Export Center Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        students={sortedStudents}
        language={language}
        reportTitle={
          language === 'zh-TW' 
            ? '學生報表統計 (Student Comprehensive Report)' 
            : language === 'en' 
            ? 'Student Comprehensive Report' 
            : 'តារាងរបាយការណ៍សិស្ស (Student Comprehensive Report)'
        }
      />
    </div>
  );
};
