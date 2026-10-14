import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Phone, 
  Check, 
  Copy,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  Building2,
  FileCheck,
  FileText,
  Mail,
  FileSpreadsheet,
  Loader2,
  MapPin,
  LayoutGrid
} from 'lucide-react';
import { Student, FilterState, SortConfig, SortField, Language } from '../types';
import { translations } from '../translations';
import { MAJORS, TARGET_SCHOOLS } from '../constants/studentOptions';
import { schoolMajorService } from '../services/schoolMajorService';
import { areAllRequiredDocumentsUploaded, countUploadedCategories } from '../utils/documentUtils';
import { calculateAge, formatAge, formatDobOnly } from '../utils/ageUtils';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { TranslationTooltip } from './TranslationTooltip';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';
import { downloadAllDocumentsForStudent } from '../utils/documentDownloadUtils';
import { authService } from '../services/authService';

interface StudentTableProps {
  students: Student[];
  language: Language;
  filterState: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onViewStudent: (student: Student) => void;
  onBulkDelete?: (studentIds: string[]) => void;
  isAdmin?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  language,
  filterState,
  onFilterChange,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onViewStudent,
  onBulkDelete,
  isAdmin = authService.isAdmin(),
}) => {
  const t = translations[language];

  // Sorting state - defaults to numeric order by studentId
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'studentId',
    order: 'asc',
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // View Mode: 'table' or 'cards' (Cards mode is ideal for mobile phones and compact screens)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Subscribe to dynamic schools and majors updates
  const [schoolsVersion, setSchoolsVersion] = useState(0);
  useEffect(() => {
    const unsub = schoolMajorService.subscribe(() => {
      setSchoolsVersion(v => v + 1);
    });
    return unsub;
  }, []);

  // Extract unique majors and target schools
  const uniqueMajors = useMemo(() => {
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

  const uniqueSchools = useMemo(() => {
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

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { field, order: 'asc' };
    });
  };

  // Filter & Sort computation
  const filteredAndSortedStudents = useMemo(() => {
    return students
      .filter(s => {
        // Search match
        const q = filterState.search.trim().toLowerCase();
        if (q) {
          const matchId = (s.studentId || '').toLowerCase().includes(q);
          const matchKhmer = (s.nameKhmer || s.name || '').toLowerCase().includes(q);
          const matchLatin = (s.nameLatin || '').toLowerCase().includes(q);
          const matchChinese = (s.nameChinese || '').toLowerCase().includes(q);
          const matchPhone = (s.phone || '').toLowerCase().includes(q);
          const matchEmail = (s.email || '').toLowerCase().includes(q);
          const matchAge = (s.age ? s.age.toString() : (calculateAge(s.dob)?.toString() || '')).includes(q);
          const matchFatherPhone = (s.fatherPhone || '').toLowerCase().includes(q);
          const matchMotherPhone = (s.motherPhone || '').toLowerCase().includes(q);
          const matchFatherName = (s.fatherNameEnglish || s.fatherNameChinese || '').toLowerCase().includes(q);
          const matchMotherName = (s.motherNameEnglish || s.motherNameChinese || '').toLowerCase().includes(q);
          const matchIdCard = (s.idCardNumber || '').toLowerCase().includes(q);
          const matchPassport = (s.passportNumber || '').toLowerCase().includes(q);
          const matchSchool = (s.targetSchool || '').toLowerCase().includes(q) ||
            Boolean(getSchoolTranslation(s.targetSchool)?.km.toLowerCase().includes(q)) ||
            Boolean(getSchoolTranslation(s.targetSchool)?.en.toLowerCase().includes(q));
          const matchMajor = (s.major || '').toLowerCase().includes(q) ||
            Boolean(getMajorTranslation(s.major)?.km.toLowerCase().includes(q)) ||
            Boolean(getMajorTranslation(s.major)?.en.toLowerCase().includes(q));

          if (
            !matchId && 
            !matchKhmer && 
            !matchLatin && 
            !matchChinese && 
            !matchPhone && 
            !matchEmail &&
            !matchAge &&
            !matchFatherPhone && 
            !matchMotherPhone && 
            !matchFatherName && 
            !matchMotherName && 
            !matchIdCard && 
            !matchPassport && 
            !matchSchool && 
            !matchMajor
          ) {
            return false;
          }
        }

        // Gender match
        if (filterState.gender && filterState.gender !== 'all') {
          if (s.gender !== filterState.gender) return false;
        }

        // Major match
        if (filterState.major && filterState.major !== 'all') {
          const selMajor = filterState.major.trim().toLowerCase();
          const stuMajor = (s.major || '').trim().toLowerCase();
          const selTrans = getMajorTranslation(filterState.major);
          const stuTrans = getMajorTranslation(s.major);
          const isMatch = stuMajor === selMajor ||
            (selTrans && stuTrans && selTrans.zh.toLowerCase() === stuTrans.zh.toLowerCase()) ||
            (selTrans && (stuMajor === selTrans.km.toLowerCase() || stuMajor === selTrans.en.toLowerCase() || stuMajor === selTrans.zh.toLowerCase())) ||
            (stuTrans && (selMajor === stuTrans.km.toLowerCase() || selMajor === stuTrans.en.toLowerCase() || selMajor === stuTrans.zh.toLowerCase()));
          if (!isMatch) return false;
        }

        // Target school match
        if (filterState.targetSchool && filterState.targetSchool !== 'all') {
          const selSchool = filterState.targetSchool.trim().toLowerCase();
          const stuSchool = (s.targetSchool || '').trim().toLowerCase();
          const selTrans = getSchoolTranslation(filterState.targetSchool);
          const stuTrans = getSchoolTranslation(s.targetSchool);
          const isMatch = stuSchool === selSchool ||
            (selTrans && stuTrans && selTrans.zh.toLowerCase() === stuTrans.zh.toLowerCase()) ||
            (selTrans && (stuSchool === selTrans.km.toLowerCase() || stuSchool === selTrans.en.toLowerCase() || stuSchool === selTrans.zh.toLowerCase())) ||
            (stuTrans && (selSchool === stuTrans.km.toLowerCase() || selSchool === stuTrans.en.toLowerCase() || selSchool === stuTrans.zh.toLowerCase()));
          if (!isMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = sortConfig.field;
        // Numeric sort for studentId (លេខរៀង)
        if (field === 'studentId') {
          const numA = parseInt(a.studentId.replace(/\D/g, '') || '0', 10);
          const numB = parseInt(b.studentId.replace(/\D/g, '') || '0', 10);
          if (numA !== numB) {
            return sortConfig.order === 'asc' ? numA - numB : numB - numA;
          }
        }
        const valA = ((a as any)[field] || (field === 'nameKhmer' ? a.name : '') || '').toString().toLowerCase();
        const valB = ((b as any)[field] || (field === 'nameKhmer' ? b.name : '') || '').toString().toLowerCase();
        const res = valA.localeCompare(valB, undefined, { numeric: true });
        return sortConfig.order === 'asc' ? res : -res;
      });
  }, [students, filterState, sortConfig]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAndSortedStudents.map(s => s.studentId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Copy phone handler
  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const listToExport = selectedIds.length > 0 
      ? students.filter(s => selectedIds.includes(s.studentId))
      : filteredAndSortedStudents;

    if (listToExport.length === 0) return;

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

    const csvRows = [
      headers.join(','),
      ...listToExport.map(s => {
        const val = areAllRequiredDocumentsUploaded(s.documents);
        const docCount = `${val.completedCount}/${val.totalRequired}`;
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
          `"${docCount}"`,
          `"${(s.notes || '').replace(/"/g, '""')}"`,
          `"${s.createdAt || ''}"`
        ].join(',');
      })
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Students_List_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Excel (.xlsx)
  const handleExportExcel = () => {
    const listToExport = selectedIds.length > 0 
      ? students.filter(s => selectedIds.includes(s.studentId))
      : filteredAndSortedStudents;
    if (listToExport.length === 0) return;
    exportToExcel(listToExport, 'Students_List', language);
  };

  // Export PDF (.pdf) with 100% Khmer and Chinese Font Support
  const handleExportPdf = async () => {
    const listToExport = selectedIds.length > 0 
      ? students.filter(s => selectedIds.includes(s.studentId))
      : filteredAndSortedStudents;
    if (listToExport.length === 0) return;
    setIsExportingPdf(true);
    try {
      const reportTitle = language === 'zh-TW' 
        ? '學生名冊總覽 (Student Directory)' 
        : language === 'en' 
        ? 'Student Directory' 
        : 'តារាងបញ្ជីឈ្មោះសិស្ស (Student Directory)';
      await exportToPDF(listToExport, reportTitle, 'Students_List', language);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Pagination calculation
  const totalItems = filteredAndSortedStudents.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * rowsPerPage;
  const paginatedStudents = filteredAndSortedStudents.slice(startIndex, startIndex + rowsPerPage);

  // Render Sort Icon
  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 ml-1 inline" />;
    }
    return sortConfig.order === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />
    );
  };

  const hasActiveFilters = 
    filterState.search !== '' || 
    filterState.gender !== 'all' || 
    (filterState.major && filterState.major !== 'all') ||
    (filterState.targetSchool && filterState.targetSchool !== 'all');

  return (
    <div className="space-y-4">
      {/* Top Controls Bar: Search, Filters & Action CTAs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filterState.search}
              onChange={e => {
                onFilterChange({ ...filterState, search: e.target.value });
                setCurrentPage(1);
              }}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden"
            />
            {filterState.search && (
              <button
                onClick={() => onFilterChange({ ...filterState, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Export & Add Student */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {isAdmin && selectedIds.length > 0 && onBulkDelete && (
              <button
                onClick={() => onBulkDelete(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'km' ? `លុប (${selectedIds.length})` : `Delete (${selectedIds.length})`}</span>
              </button>
            )}

            {/* Export buttons: CSV, Excel, PDF (Admin Only) */}
            {isAdmin && (
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  title={t.exportCsv}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <span className="w-px h-4 bg-slate-200" />
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                  title={t.exportExcel}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel</span>
                </button>
                <span className="w-px h-4 bg-slate-200" />
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                  title={t.exportPdf}
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{isExportingPdf ? (language === 'km' ? 'PDF...' : 'PDF...') : 'PDF'}</span>
                </button>
              </div>
            )}

            {/* View Mode Switcher: Table vs Cards (Ideal for Phone / Laptop) */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={language === 'km' ? 'ទម្រង់តារាង (Table View)' : 'Table View'}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'km' ? 'តារាង' : 'Table'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={language === 'km' ? 'ទម្រង់កាត (Card View - ងាយស្រួលមើលលើទូរស័ព្ទ)' : 'Card View (Mobile friendly)'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'km' ? 'កាត' : 'Cards'}</span>
              </button>
            </div>

            <button
              onClick={onAddStudent}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addStudent}</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'តម្រង:' : 'Filters:'}</span>
          </div>

          {/* Gender Filter */}
          <select
            value={filterState.gender}
            onChange={e => {
              onFilterChange({ ...filterState, gender: e.target.value });
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 font-medium text-slate-700 outline-hidden focus:border-indigo-500"
          >
            <option value="all">{t.allGenders}</option>
            <option value="Male">{t.male}</option>
            <option value="Female">{t.female}</option>
            <option value="Other">{t.other}</option>
          </select>

          {/* Major Filter */}
          {uniqueMajors.length > 0 && (
            <select
              value={filterState.major || 'all'}
              onChange={e => {
                onFilterChange({ ...filterState, major: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 font-medium text-slate-700 outline-hidden focus:border-indigo-500 max-w-[220px] truncate"
            >
              <option value="all">{t.allMajors}</option>
              {uniqueMajors.map(m => {
                const trans = getMajorTranslation(m);
                const suffix = trans ? (language === 'km' ? ` (${trans.km})` : ` (${trans.en})`) : '';
                return (
                  <option key={m} value={m}>{m}{suffix}</option>
                );
              })}
            </select>
          )}

          {/* Target School Filter */}
          {uniqueSchools.length > 0 && (
            <select
              value={filterState.targetSchool || 'all'}
              onChange={e => {
                onFilterChange({ ...filterState, targetSchool: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 font-medium text-slate-700 outline-hidden focus:border-indigo-500 max-w-[220px] truncate"
            >
              <option value="all">{t.allSchools}</option>
              {uniqueSchools.map(sch => {
                const trans = getSchoolTranslation(sch);
                const suffix = trans ? (language === 'km' ? ` (${trans.km})` : ` (${trans.en})`) : '';
                return (
                  <option key={sch} value={sch}>{sch}{suffix}</option>
                );
              })}
            </select>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                onFilterChange({
                  search: '',
                  gender: 'all',
                  major: 'all',
                  targetSchool: 'all',
                });
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          )}

          <div className="ml-auto text-slate-500 text-[11px]">
            {language === 'km' ? 'រកឃើញ' : language === 'zh-TW' ? '共找到' : 'Found'} <strong className="text-slate-800">{totalItems}</strong> {t.students}
          </div>
        </div>
      </div>

      {/* Main Content Area: Cards or Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {viewMode === 'cards' ? (
          /* CARD VIEW: Highly readable and comfortable for mobile phones & compact screens */
          <div className="p-4 sm:p-5">
            {/* Top Selection & Action Bar for Cards */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={paginatedStudents.length > 0 && selectedIds.length === filteredAndSortedStudents.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span>{language === 'km' ? 'ជ្រើសរើសទាំងអស់ (Select All)' : 'Select All'}</span>
              </label>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ប្តូរទៅមើលជាតារាង' : 'Switch to Table'}</span>
              </button>
            </div>

            {paginatedStudents.length === 0 ? (
              <div className="py-12 text-center">
                <div className="max-w-xs mx-auto space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {t.noStudentsFound}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t.noStudentsDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedStudents.map(student => {
                  const isSelected = selectedIds.includes(student.studentId);
                  const docValidation = areAllRequiredDocumentsUploaded(student.documents);
                  const uploadedCategoryCount = countUploadedCategories(student.documents);
                  const sTrans = getSchoolTranslation(student.targetSchool);
                  const mTrans = getMajorTranslation(student.major);

                  return (
                    <div
                      key={student.studentId}
                      className={`bg-white rounded-2xl border transition-all p-4 space-y-3.5 shadow-2xs hover:shadow-sm ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Select Checkbox, ID, Gender & Actions */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(student.studentId)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            #{student.studentId}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            student.gender === 'Male'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : student.gender === 'Female'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {student.gender === 'Male' ? `👨 ${t.male}` : student.gender === 'Female' ? `👩 ${t.female}` : t.other}
                            {(student.age || calculateAge(student.dob)) && (
                              <span> · {formatAge(student.age || calculateAge(student.dob), language)}</span>
                            )}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onViewStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title={t.viewDetails}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => onEditStudent(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title={t.editStudent}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteStudent(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title={t.deleteStudent}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Student Names: Khmer (large bold), Latin, Chinese */}
                      <div className="space-y-0.5">
                        <h4 
                          onClick={() => onViewStudent(student)}
                          className="text-base font-bold text-slate-900 font-battambang hover:text-indigo-600 cursor-pointer transition-colors"
                        >
                          {student.nameKhmer || student.name || '-'}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                          {student.nameLatin && (
                            <span className="font-semibold text-slate-700">{student.nameLatin}</span>
                          )}
                          {student.nameLatin && student.nameChinese && (
                            <span className="text-slate-300">•</span>
                          )}
                          {student.nameChinese && (
                            <span className="font-semibold text-indigo-700 font-biaukai">
                              {student.nameChinese}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Target School & Major */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                        <div className="flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-800 block truncate">
                              {student.targetSchool || '-'}
                            </span>
                            {sTrans && (
                              <span className="text-[11px] text-amber-700 font-medium block truncate">
                                🇰🇭 {sTrans.km}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200/60">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-indigo-700 block truncate">
                              {student.major || '-'}
                            </span>
                            {mTrans && (
                              <span className="text-[11px] text-slate-500 font-medium block truncate">
                                {mTrans.km}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact & Personal Meta */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        {student.dob && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t.dob}: {formatDobOnly(student.dob)}</span>
                          </div>
                        )}

                        {student.placeOfBirth && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <TranslationTooltip text={student.placeOfBirth} type="pob" currentLanguage={language}>
                              <span className="hover:text-indigo-600 truncate cursor-help">
                                {student.placeOfBirth}
                              </span>
                            </TranslationTooltip>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 group/phone">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <a 
                              href={`tel:${student.phone.replace(/\s+/g, '')}`}
                              className="font-mono text-slate-700 hover:text-indigo-600 hover:underline"
                            >
                              {student.phone}
                            </a>
                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(student.phone, e)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-all"
                              title={t.copyPhone}
                            >
                              {copiedPhone === student.phone ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Document upload badge */}
                          <button
                            type="button"
                            onClick={() => onViewStudent(student)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                              docValidation.isValid 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : uploadedCategoryCount > 0 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                            title={language === 'km' 
                              ? `បាន ${docValidation.completedCount}/${docValidation.totalRequired} ឯកសារចាំបាច់ (*)` 
                              : `${docValidation.completedCount}/${docValidation.totalRequired} required documents (*)`}
                          >
                            <FileText className="w-3 h-3" />
                            <span>{docValidation.completedCount}/{docValidation.totalRequired}*</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TABLE VIEW WITH MOBILE SWIPE HINT */
          <div>
            {/* Mobile Horizontal Scroll Cue */}
            <div className="md:hidden px-3.5 py-2 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-800">
              <span className="flex items-center gap-1 font-medium">
                <span>👈👉</span>
                <span>{language === 'km' ? 'អូសតារាងទៅឆ្វេង-ស្តាំ ដើម្បីមើលជួរឈរពេញ' : 'Swipe horizontally to view all columns'}</span>
              </span>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className="font-bold underline text-indigo-700 hover:text-indigo-900 shrink-0 ml-2"
              >
                {language === 'km' ? 'មើលជាកាត 📱' : 'Card View 📱'}
              </button>
            </div>

            <div className="overflow-x-auto min-h-[300px] scrollbar-thin">
              <table className="w-full min-w-[880px] text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider select-none">
                  <tr>
                    {/* Select All Checkbox */}
                    <th className="py-3.5 pl-4 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedStudents.length > 0 && selectedIds.length === filteredAndSortedStudents.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>

                    {/* លេខរៀង (No.) */}
                    <th 
                      onClick={() => handleSort('studentId')}
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors w-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center gap-1 font-bold">
                          <span>{t.studentId}</span>
                          {renderSortIcon('studentId')}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal">No. / 編號</span>
                      </div>
                    </th>

                    {/* ឈ្មោះសិស្ស (Student Name) */}
                    <th 
                      onClick={() => handleSort('nameKhmer')}
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center gap-1 font-bold">
                          <span>ឈ្មោះសិស្ស</span>
                          {renderSortIcon('nameKhmer')}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal">Name (KH/EN/CN) / 學生姓名</span>
                      </div>
                    </th>

                    {/* ភេទ & ថ្ងៃកំណើត (Gender & DOB) */}
                    <th 
                      onClick={() => handleSort('gender')}
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors w-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center gap-1 font-bold">
                          <span>{t.gender} & {t.dob}</span>
                          {renderSortIcon('gender')}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal">Sex & DOB / 性別與生日</span>
                      </div>
                    </th>

                    {/* សាលា & ជំនាញ (Target School & Major) */}
                    <th 
                      onClick={() => handleSort('major')}
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors text-center min-w-[200px]"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center gap-1 font-bold">
                          <span>សាលា & ជំនាញ</span>
                          {renderSortIcon('major')}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal">School & Major / 學校與專業</span>
                      </div>
                    </th>

                    {/* ទូរស័ព្ទសិស្ស (Student Phone) */}
                    <th className="py-3.5 px-3 w-36 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold">{t.phone}</span>
                        <span className="text-[11px] text-slate-500 font-normal">Phone / 電話</span>
                      </div>
                    </th>

                    {/* ឯកសារភ្ជាប់ (Attached Docs) */}
                    <th className="py-3.5 px-3 text-center w-32">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold">{t.attachedDocs}</span>
                        <span className="text-[11px] text-slate-500 font-normal">Docs / 附件</span>
                      </div>
                    </th>

                    {/* សកម្មភាព (Actions) */}
                    <th className="py-3.5 pr-4 pl-3 text-center w-28">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold">{t.actions}</span>
                        <span className="text-[11px] text-slate-500 font-normal">Actions / 操作</span>
                      </div>
                    </th>
                  </tr>
                </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {t.noStudentsFound}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {t.noStudentsDesc}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => {
                  const isSelected = selectedIds.includes(student.studentId);
                  const displayName = student.nameKhmer || student.name || '-';
                  const docValidation = areAllRequiredDocumentsUploaded(student.documents);
                  const uploadedCategoryCount = countUploadedCategories(student.documents);

                  return (
                    <tr 
                      key={student.studentId}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(student.studentId)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Order Number (លេខរៀង) */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 inline-block">
                          #{student.studentId}
                        </span>
                      </td>

                      {/* Name Details */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <button
                            onClick={() => onViewStudent(student)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors block text-sm"
                          >
                            {displayName}
                          </button>
                          
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {student.nameLatin && (
                              <span className="text-slate-600 font-medium">
                                {student.nameLatin}
                              </span>
                            )}
                            {student.nameChinese && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold border border-amber-200/60">
                                {student.nameChinese}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Gender & DOB */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              student.gender === 'Male'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : student.gender === 'Female'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                : 'bg-slate-100 text-slate-700'
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
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{formatDobOnly(student.dob)}</span>
                            </div>
                          )}

                          {student.placeOfBirth && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <TranslationTooltip text={student.placeOfBirth} type="pob" currentLanguage={language}>
                                <span className="hover:text-indigo-600 truncate max-w-[140px] cursor-help">
                                  {student.placeOfBirth}
                                </span>
                              </TranslationTooltip>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Target School & Major */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          {student.targetSchool ? (
                            <TranslationTooltip 
                              text={student.targetSchool} 
                              type="school" 
                              currentLanguage={language}
                            >
                              <span className="font-bold text-slate-800 text-xs sm:text-sm block truncate max-w-[220px] hover:text-indigo-600 transition-colors">
                                {student.targetSchool}
                              </span>
                            </TranslationTooltip>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}

                          {student.major && (
                            <TranslationTooltip 
                              text={student.major} 
                              type="major" 
                              currentLanguage={language}
                            >
                              <div className="max-w-[220px]">
                                <span className="text-xs text-indigo-700 font-bold block truncate hover:text-indigo-900 transition-colors">
                                  {student.major}
                                </span>
                                {getMajorTranslation(student.major) && (
                                  <span className="text-[11px] text-slate-500 font-medium block truncate">
                                    {getMajorTranslation(student.major)?.km}
                                  </span>
                                )}
                              </div>
                            </TranslationTooltip>
                          )}
                        </div>
                      </td>

                      {/* Student Phone & Email */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 group/phone">
                            <a 
                              href={`tel:${student.phone.replace(/\s+/g, '')}`}
                              className="font-mono text-xs sm:text-sm text-slate-700 hover:text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-slate-400 group-hover/phone:text-indigo-500" />
                              <span>{student.phone}</span>
                            </a>
                            <button
                              onClick={(e) => handleCopyPhone(student.phone, e)}
                              className="opacity-0 group-hover/phone:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-all"
                              title={t.copyPhone}
                            >
                              {copiedPhone === student.phone ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {student.email && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[150px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <a 
                                href={`mailto:${student.email}`} 
                                className="hover:underline hover:text-indigo-600 truncate"
                                title={student.email}
                              >
                                {student.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Attached Documents Status */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onViewStudent(student)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            docValidation.isValid 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : uploadedCategoryCount > 0 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                          title={language === 'km' 
                            ? `បាន ${docValidation.completedCount}/${docValidation.totalRequired} ឯកសារចាំបាច់ (*)` 
                            : `${docValidation.completedCount}/${docValidation.totalRequired} required documents (*)`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{docValidation.completedCount}/{docValidation.totalRequired}*</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title={t.viewDetails}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <>
                              {uploadedCategoryCount > 0 && (
                                <button
                                  onClick={() => downloadAllDocumentsForStudent(student)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title={language === 'km' ? 'ទាញយកឯកសារទាំងអស់របស់សិស្សនេះ' : 'Download all student documents'}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => onEditStudent(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title={t.editStudent}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onDeleteStudent(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title={t.deleteStudent}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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
      </div>
    )}

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>{t.rowsPerPage}</span>
              <select
                value={rowsPerPage}
                onChange={e => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded border border-slate-300 bg-white font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-slate-400">|</span>
              <span>
                {t.showingResults} <strong className="text-slate-800">{startIndex + 1}</strong> {t.to}{' '}
                <strong className="text-slate-800">{Math.min(startIndex + rowsPerPage, totalItems)}</strong> {t.of}{' '}
                <strong className="text-slate-800">{totalItems}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                disabled={validPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2 font-medium">
                {validPage} / {totalPages}
              </div>

              <button
                disabled={validPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
