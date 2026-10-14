import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  FileSpreadsheet, 
  ArrowRight, 
  Phone, 
  Calendar,
  ExternalLink,
  Plus,
  FileText,
  FileCheck,
  Building2,
  BarChart3,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Student, Language, ConnectionStatus } from '../types';
import { translations } from '../translations';
import { areAllRequiredDocumentsUploaded, countUploadedCategories } from '../utils/documentUtils';
import { TranslationTooltip } from './TranslationTooltip';
import { getMajorTranslation, getSchoolTranslation } from '../utils/schoolMajorTranslations';
import { SchoolMajorAnalytics } from './SchoolMajorAnalytics';

interface DashboardProps {
  students: Student[];
  language: Language;
  connectionStatus: ConnectionStatus;
  onNavigateToStudents: (filterMajor?: string) => void;
  onAddStudent: () => void;
  onViewStudent: (student: Student) => void;
  onOpenSettings: () => void;
  onNavigateToReports?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  language,
  connectionStatus,
  onNavigateToStudents,
  onAddStudent,
  onViewStudent,
  onOpenSettings,
  onNavigateToReports
}) => {
  const t = translations[language];

  const total = students.length;
  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;
  const otherCount = students.filter(s => s.gender === 'Other').length;

  const malePercent = total > 0 ? Math.round((maleCount / total) * 100) : 0;
  const femalePercent = total > 0 ? Math.round((femaleCount / total) * 100) : 0;
  const otherPercent = total > 0 ? Math.max(0, 100 - malePercent - femalePercent) : 0;

  // Major distribution
  const majorMap = students.reduce<Record<string, number>>((acc, s) => {
    const major = s.major?.trim() || (language === 'km' ? 'មិនទាន់បញ្ជាក់' : language === 'zh-TW' ? '未指定專業' : 'Unspecified');
    acc[major] = (acc[major] || 0) + 1;
    return acc;
  }, {});

  const majorList = Object.entries(majorMap).sort((a, b) => b[1] - a[1]);
  const totalMajors = majorList.length;

  // Bar Chart Mode: 'major' or 'school'
  const [barChartMode, setBarChartMode] = useState<'major' | 'school'>('major');

  // Computed Major Bar Chart Data
  const majorBarData = useMemo(() => {
    const map: Record<string, { total: number; male: number; female: number; other: number }> = {};
    students.forEach(s => {
      const m = s.major?.trim() || (language === 'km' ? 'មិនទាន់បញ្ជាក់' : language === 'zh-TW' ? '未指定專業' : 'Unspecified');
      if (!map[m]) map[m] = { total: 0, male: 0, female: 0, other: 0 };
      map[m].total++;
      if (s.gender === 'Male') map[m].male++;
      else if (s.gender === 'Female') map[m].female++;
      else map[m].other++;
    });

    return Object.entries(map).map(([name, stats]) => {
      const trans = getMajorTranslation(name);
      return {
        name,
        nameKm: trans?.km || name,
        nameEn: trans?.en || name,
        total: stats.total,
        male: stats.male,
        female: stats.female,
        other: stats.other,
        percentage: total > 0 ? Math.round((stats.total / total) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [students, language, total]);

  // Computed School Bar Chart Data
  const schoolBarData = useMemo(() => {
    const map: Record<string, { total: number; male: number; female: number; other: number }> = {};
    students.forEach(s => {
      const sc = s.targetSchool?.trim() || (language === 'km' ? 'មិនទាន់បញ្ជាក់' : language === 'zh-TW' ? '未指定學校' : 'Unspecified');
      if (!map[sc]) map[sc] = { total: 0, male: 0, female: 0, other: 0 };
      map[sc].total++;
      if (s.gender === 'Male') map[sc].male++;
      else if (s.gender === 'Female') map[sc].female++;
      else map[sc].other++;
    });

    return Object.entries(map).map(([name, stats]) => {
      const trans = getSchoolTranslation(name);
      return {
        name,
        nameKm: trans?.km || name,
        nameEn: trans?.en || name,
        shortZh: trans?.shortZh,
        total: stats.total,
        male: stats.male,
        female: stats.female,
        other: stats.other,
        percentage: total > 0 ? Math.round((stats.total / total) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [students, language, total]);

  const activeBarList = barChartMode === 'major' ? majorBarData : schoolBarData;
  const maxBarCount = activeBarList.length > 0 ? Math.max(...activeBarList.map(item => item.total), 1) : 1;

  // Document upload completion statistics (requires all 5 mandatory documents)
  const studentsWithAllDocs = students.filter(s => areAllRequiredDocumentsUploaded(s.documents).isValid).length;
  const studentsWithAnyDocs = students.filter(s => countUploadedCategories(s.documents) > 0).length;

  // Recent students (last 5, sorted by numeric studentId or createdAt desc)
  const recentStudents = [...students].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA && timeB) return timeB - timeA;
    const numA = parseInt(a.studentId.replace(/\D/g, '') || '0', 10);
    const numB = parseInt(b.studentId.replace(/\D/g, '') || '0', 10);
    return numB - numA;
  }).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome & Overview Header (Official Institution Header with School Logo) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
        
        {/* Left Side: Official School Emblem & 3-Language Typography */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
          
          {/* Round Emblem Badge */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-amber-400/90 ring-offset-2 ring-offset-slate-950 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:ring-amber-300">
              <img
                src="/logo.jpg"
                alt="Logo សាលារៀនចិនលីស៊ីងអន្តរជាតិ"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md border border-amber-200">
              LSIS
            </span>
          </div>

          {/* School Name Hierarchy in 3 Official Languages */}
          <div className="space-y-1 min-w-0">
            {/* Institution Badge + Cloud Status */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'km' ? 'គ្រឹះស្ថានអប់រំផ្លូវការ' : 'Official Educational Institution'}</span>
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-medium border border-indigo-400/20">
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>Google Sheets Cloud Database</span>
              </div>
            </div>

            {/* 1. Khmer Name (Primary, dignified, bold) */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-battambang leading-snug drop-shadow-sm">
              សាលារៀនចិនលីស៊ីងអន្តរជាតិ
            </h1>

            {/* 2. Traditional Chinese Name */}
            <div className="text-base sm:text-lg font-bold text-amber-300 font-kai tracking-widest drop-shadow-xs">
              日興國際學校
            </div>

            {/* 3. English Name */}
            <div className="text-xs sm:text-sm font-bold text-indigo-200 tracking-wider uppercase font-sans">
              LISING INTERNATIONAL CHINESE SCHOOL
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm border border-indigo-400/30 backdrop-blur transition-all shadow-sm hover:shadow-indigo-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>{t.studentReport}</span>
            </button>
          )}
          <button
            onClick={onAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-indigo-700" />
            <span>{t.addStudent}</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 backdrop-blur transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t.setupScript}</span>
          </button>
        </div>

        {/* Decorative lighting aura */}
        <div className="absolute -right-16 -bottom-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div 
          onClick={() => onNavigateToStudents()}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.totalStudents}</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500 font-medium">{t.students}</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 flex items-center gap-1 font-medium">
            <span>{t.studentTable}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Male Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.maleStudents}</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{maleCount}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
              {malePercent}%
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${malePercent}%` }} 
            />
          </div>
        </div>

        {/* Female Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.femaleStudents}</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{femaleCount}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50">
              {femalePercent}%
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${femalePercent}%` }} 
            />
          </div>
        </div>

        {/* Uploaded Documents Stats */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{language === 'km' ? 'សិស្សមានឯកសារ' : 'Students with Docs'}</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{studentsWithAnyDocs}</span>
            <span className="text-xs text-slate-500 font-medium">
              ({studentsWithAllDocs} {language === 'km' ? 'គ្រប់ ៦ ឯកសារចាំបាច់' : 'full 6/6 required'})
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span>{totalMajors} {t.majors}</span>
          </div>
        </div>

      </div>

      {/* Dedicated Student Enrollment Bar Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        
        {/* Bar Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-battambang">
                {language === 'km' ? 'ក្រាហ្វិករបារស្ថិតិចំនួនសិស្ស (Bar Chart)' : 'Student Enrollment Bar Chart'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {activeBarList.length} {barChartMode === 'major' ? (language === 'km' ? 'ជំនាញ' : 'majors') : (language === 'km' ? 'សាលារៀន' : 'schools')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'km' 
                ? 'បង្ហាញការប្រៀបធៀបចំនួនសិស្ស ភាគរយ និងសមាមាត្រភេទ (ប្រុស/ស្រី) យ៉ាងច្បាស់លាស់' 
                : 'Clear visual comparison of student enrollment, percentages, and gender breakdown'}
            </p>
          </div>

          {/* Mode Switcher: By Major vs By School */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 self-start sm:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBarChartMode('major')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                barChartMode === 'major'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'តាមជំនាញ' : 'By Major'}</span>
            </button>
            <button
              type="button"
              onClick={() => setBarChartMode('school')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                barChartMode === 'school'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'តាមសាលា' : 'By School'}</span>
            </button>
          </div>
        </div>

        {/* Empty state if no data */}
        {activeBarList.length === 0 || total === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {t.noStudentsFound}
          </div>
        ) : (
          /* Horizontal Bar Chart List */
          <div className="space-y-3">
            {activeBarList.slice(0, 10).map((item, idx) => {
              const barFillPercent = maxBarCount > 0 ? (item.total / maxBarCount) * 100 : 0;
              const rankColor = idx === 0 
                ? 'bg-amber-100 text-amber-800 border-amber-300' 
                : idx === 1 
                ? 'bg-slate-100 text-slate-700 border-slate-300' 
                : idx === 2 
                ? 'bg-orange-100 text-orange-800 border-orange-300' 
                : 'bg-slate-50 text-slate-500 border-slate-200';

              return (
                <div
                  key={item.name}
                  onClick={() => barChartMode === 'major' ? onNavigateToStudents(item.name) : onNavigateToStudents()}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                >
                  {/* Row Top: Rank, Label, Numbers */}
                  <div className="flex items-center justify-between gap-3 text-xs mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 border ${rankColor}`}>
                        #{idx + 1}
                      </span>
                      {/* Name in Chinese and Khmer */}
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {item.name}
                        </span>
                        {item.nameKm && item.nameKm !== item.name && (
                          <span className="text-slate-500 ml-1.5 font-medium hidden sm:inline text-[11px]">
                            🇰🇭 {item.nameKm}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats pill: Count & Percent */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline-flex items-center gap-1">
                        <span className="text-blue-600 font-bold">👨 {item.male}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-rose-600 font-bold">👩 {item.female}</span>
                      </span>
                      <span className="font-black text-slate-900 text-xs sm:text-sm">
                        {item.total} {language === 'km' ? 'នាក់' : 'students'}
                      </span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] border border-indigo-200/60 min-w-[38px] text-center">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar Visual with Gradient Fill */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      style={{ width: `${Math.max(4, barFillPercent)}%` }}
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        idx === 0 
                          ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700' 
                          : idx === 1 
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' 
                          : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bar Chart Quick Insights Strip */}
        {activeBarList.length > 0 && total > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {language === 'km' ? 'ចំណាត់ថ្នាក់លេខ ១៖' : 'Top Enrolled:'}{' '}
                <strong className="text-slate-800">{activeBarList[0]?.name}</strong> ({activeBarList[0]?.total} {language === 'km' ? 'នាក់' : 'students'})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {language === 'km' ? 'មធ្យមភាគក្នុងមួយក្រុម៖' : 'Average per category:'}{' '}
                <strong className="text-indigo-700">{Math.round(total / activeBarList.length)} នាក់</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive School & Major Analytics Suite (Column, Pie, Line, Summary) */}
      <SchoolMajorAnalytics
        students={students}
        language={language}
        onNavigateToStudents={onNavigateToStudents}
      />

      {/* Analytics Row: Gender Ratio & Major Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gender Breakdown Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t.genderDistribution}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {total} {t.students}
              </span>
            </div>

            {/* Visual ratio stack bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 mb-6">
              <div 
                style={{ width: `${malePercent}%` }} 
                className="bg-blue-600 transition-all duration-500" 
                title={`${t.male}: ${maleCount} (${malePercent}%)`}
              />
              <div 
                style={{ width: `${femalePercent}%` }} 
                className="bg-rose-500 transition-all duration-500" 
                title={`${t.female}: ${femaleCount} (${femalePercent}%)`}
              />
              {otherCount > 0 && (
                <div 
                  style={{ width: `${otherPercent}%` }} 
                  className="bg-amber-500 transition-all duration-500" 
                  title={`${t.other}: ${otherCount} (${otherPercent}%)`}
                />
              )}
            </div>

            {/* Detailed metric list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">{t.male}</span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {maleCount} <span className="text-slate-500 font-normal">({malePercent}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs font-semibold text-slate-800">{t.female}</span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {femaleCount} <span className="text-slate-500 font-normal">({femalePercent}%)</span>
                </div>
              </div>

              {otherCount > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-800">{t.other}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {otherCount} <span className="text-slate-500 font-normal">({otherPercent}%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>{t.syncStatus}:</span>
            <span className={`font-semibold ${connectionStatus === 'connected' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {connectionStatus === 'connected' ? t.connected : t.disconnected}
            </span>
          </div>
        </div>

        {/* Students per Major Breakdown (2 columns wide) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {language === 'km' ? 'ការបែងចែកតាមជំនាញដែលជ្រើសរើស' : 'Distribution by Chosen Major'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'km' ? 'ស្ថិតិចំនួនសិស្សតាមជំនាញនីមួយៗ' : 'Student enrollment counts across academic majors'}
                </p>
              </div>
              <button
                onClick={() => onNavigateToStudents()}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>{t.studentTable}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {majorList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {t.noStudentsFound}
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {majorList.map(([major, count]) => {
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div 
                      key={major}
                      onClick={() => onNavigateToStudents(major)}
                      className="p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <TranslationTooltip text={major} type="major" currentLanguage={language}>
                            <span className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors underline decoration-dotted">
                              {major}
                            </span>
                          </TranslationTooltip>
                          {(() => {
                            const mTrans = getMajorTranslation(major);
                            if (!mTrans) return null;
                            const sub = language === 'km' ? mTrans.km : mTrans.en;
                            return (
                              <span className="text-[11px] text-slate-400 font-normal hidden sm:inline truncate max-w-[140px]">
                                • {sub}
                              </span>
                            );
                          })()}
                          <span className="text-slate-400 font-normal">
                            ({count} {t.students})
                          </span>
                        </div>
                        <span className="font-semibold text-indigo-600">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 group-hover:bg-indigo-700" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t.majors}: <strong className="text-slate-800">{totalMajors}</strong></span>
            <span>{language === 'km' ? 'សិស្សសរុប' : 'Total Students'}: <strong className="text-slate-800">{total}</strong></span>
          </div>
        </div>

      </div>

      {/* Recent Students Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.recentStudents}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'km' ? 'អត់ទាន់ មានសិស្សចុះឈ្មោះទេ' : 'No students registered yet'}
            </p>
          </div>
          <button
            onClick={() => onNavigateToStudents()}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <span>{t.studentTable}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentStudents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {language === 'km' ? 'អត់ទាន់ មានសិស្សចុះឈ្មោះទេ' : t.noStudentsFound}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentStudents.map(student => {
              const val = areAllRequiredDocumentsUploaded(student.documents);

              return (
                <div 
                  key={student.studentId}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      student.gender === 'Female' 
                        ? 'bg-rose-100 text-rose-700' 
                        : student.gender === 'Male'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {(student.nameKhmer || student.name || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {student.nameKhmer || student.name}
                        </span>
                        {student.nameLatin && (
                          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                            ({student.nameLatin})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          #{student.studentId}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                        {student.targetSchool && (
                          <TranslationTooltip text={student.targetSchool} type="school" currentLanguage={language}>
                            <span className="flex items-center gap-1 font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[160px]">{student.targetSchool}</span>
                            </span>
                          </TranslationTooltip>
                        )}
                        {student.major && (
                          <TranslationTooltip text={student.major} type="major" currentLanguage={language}>
                            <span className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors truncate max-w-[150px]">
                              {student.major}
                            </span>
                          </TranslationTooltip>
                        )}
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.phone}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          val.isValid 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          <FileText className="w-3 h-3" />
                          <span>{val.completedCount}/{val.totalRequired}* {language === 'km' ? 'ឯកសារ' : 'docs'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      student.gender === 'Female' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : student.gender === 'Male'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {student.gender === 'Male' ? t.male : student.gender === 'Female' ? t.female : t.other}
                    </span>
                    <button
                      onClick={() => onViewStudent(student)}
                      className="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
