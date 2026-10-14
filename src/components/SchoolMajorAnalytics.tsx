import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  FileText, 
  Users, 
  Award, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  Sparkles,
  LayoutGrid,
  AlignLeft,
  Info
} from 'lucide-react';
import { Student, Language } from '../types';
import { translations } from '../translations';
import { schoolMajorService } from '../services/schoolMajorService';
import { getMajorTranslation, getSchoolTranslation } from '../utils/schoolMajorTranslations';
import { areAllRequiredDocumentsUploaded } from '../utils/documentUtils';
import { TranslationTooltip } from './TranslationTooltip';

interface SchoolMajorAnalyticsProps {
  students: Student[];
  language: Language;
  onNavigateToStudents: (major?: string) => void;
}

type ChartViewType = 'all' | 'column' | 'bar' | 'pie' | 'line' | 'summary';
type ColumnOrientation = 'vertical' | 'horizontal';

// Distinct modern color palette with 16 vibrant colors for high contrast
const CHART_COLORS = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // purple-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
  '#d946ef', // fuchsia-500
  '#0284c7', // sky-600
  '#e11d48', // rose-600
  '#ca8a04', // yellow-600
  '#059669', // emerald-600
];

export const SchoolMajorAnalytics: React.FC<SchoolMajorAnalyticsProps> = ({
  students,
  language,
  onNavigateToStudents
}) => {
  const t = translations[language];

  // Subscribe to dynamic schools and majors updates
  const [schoolsVersion, setSchoolsVersion] = useState(0);
  useEffect(() => {
    const unsub = schoolMajorService.subscribe(() => {
      setSchoolsVersion(v => v + 1);
    });
    return unsub;
  }, []);

  // List of all schools available from service and from students data
  const schoolOptions = useMemo(() => {
    const fromService = schoolMajorService.getSchools().map(e => e.school);
    const fromStudents = students.map(s => s.targetSchool).filter((s): s is string => !!s && s.trim().length > 0);
    const combined = Array.from(new Set([...fromService, ...fromStudents]));
    return combined;
  }, [students, schoolsVersion]);

  // Selected School filter state ('all' or specific school name)
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [activeView, setActiveView] = useState<ChartViewType>('all');
  const [columnOrientation, setColumnOrientation] = useState<ColumnOrientation>('vertical');
  const [hoveredMajorIndex, setHoveredMajorIndex] = useState<number | null>(null);

  // Filter students based on selected school
  const schoolStudents = useMemo(() => {
    if (selectedSchool === 'all') return students;
    return students.filter(s => s.targetSchool === selectedSchool);
  }, [students, selectedSchool]);

  // Compute majors data for the selected school (including all known majors of this school)
  const majorsData = useMemo(() => {
    // Collect majors known for this school if a specific school is selected
    const knownMajors = selectedSchool === 'all' 
      ? schoolMajorService.getAllMajors()
      : schoolMajorService.getMajorsForSchool(selectedSchool);

    // Map counts
    const countMap: Record<string, { total: number; male: number; female: number; other: number }> = {};

    schoolStudents.forEach(s => {
      const m = s.major?.trim() || (language === 'km' ? 'មិនទាន់បញ្ជាក់' : language === 'zh-TW' ? '未指定專業' : 'Unspecified');
      if (!countMap[m]) {
        countMap[m] = { total: 0, male: 0, female: 0, other: 0 };
      }
      countMap[m].total++;
      if (s.gender === 'Male') countMap[m].male++;
      else if (s.gender === 'Female') countMap[m].female++;
      else countMap[m].other++;
    });

    // Ensure all known majors for this school are included even if count is 0
    knownMajors.forEach(m => {
      if (!countMap[m]) {
        countMap[m] = { total: 0, male: 0, female: 0, other: 0 };
      }
    });

    const totalStudentsInSelection = schoolStudents.length;

    // Convert to sorted array (majors with students first, sorted descending)
    const list = Object.entries(countMap).map(([major, stats], index) => {
      const percentage = totalStudentsInSelection > 0 
        ? Math.round((stats.total / totalStudentsInSelection) * 100) 
        : 0;
      const trans = getMajorTranslation(major);
      return {
        major,
        majorKm: trans?.km || major,
        majorEn: trans?.en || major,
        majorZh: trans?.zh || major,
        count: stats.total,
        male: stats.male,
        female: stats.female,
        other: stats.other,
        percentage,
        color: CHART_COLORS[index % CHART_COLORS.length]
      };
    }).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.major.localeCompare(b.major);
    });

    return list;
  }, [schoolStudents, selectedSchool, language, schoolsVersion]);

  // Overall KPIs for the selected school
  const totalStudents = schoolStudents.length;
  const maleCount = schoolStudents.filter(s => s.gender === 'Male').length;
  const femaleCount = schoolStudents.filter(s => s.gender === 'Female').length;
  const activeMajorsCount = majorsData.filter(m => m.count > 0).length;
  const topMajor = majorsData.find(m => m.count > 0);
  const completeDocsCount = schoolStudents.filter(s => areAllRequiredDocumentsUploaded(s.documents).isValid).length;
  const completeDocsRate = totalStudents > 0 ? Math.round((completeDocsCount / totalStudents) * 100) : 0;

  // Selected school translations
  const schoolTrans = selectedSchool !== 'all' ? getSchoolTranslation(selectedSchool) : null;

  // Max count for column chart scaling
  const maxMajorCount = useMemo(() => {
    const max = Math.max(...majorsData.map(m => m.count), 0);
    return max > 0 ? max : 5;
  }, [majorsData]);

  // Pie chart calculation with clean pull-out offsets and percentage labels
  const pieSlices = useMemo(() => {
    // Only slice majors that have students (count > 0)
    const activeList = majorsData.filter(m => m.count > 0);
    if (activeList.length === 0 || totalStudents === 0) return [];

    let accumulatedAngle = 0;
    return activeList.map((item, idx) => {
      const sliceAngle = (item.count / totalStudents) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle += sliceAngle;

      // Arc coordinates for SVG
      const radius = 80;
      const innerRadius = 46; // Donut hole
      const cx = 100;
      const cy = 100;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = ((midAngle - 90) * Math.PI) / 180;

      // Clean pull-out offset on hover (no radial scaling collision)
      const pullDist = 5;
      const pullX = Math.round(Math.cos(midRad) * pullDist * 10) / 10;
      const pullY = Math.round(Math.sin(midRad) * pullDist * 10) / 10;

      // Position for percentage label on slice (if slice >= 8%)
      const labelRadius = 64;
      const labelX = cx + labelRadius * Math.cos(midRad);
      const labelY = cy + labelRadius * Math.sin(midRad);

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const ix1 = cx + innerRadius * Math.cos(endRad);
      const iy1 = cy + innerRadius * Math.sin(endRad);
      const ix2 = cx + innerRadius * Math.cos(startRad);
      const iy2 = cy + innerRadius * Math.sin(startRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      // SVG path for donut segment
      const pathData = sliceAngle >= 359.99
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} Z`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

      return {
        ...item,
        pathData,
        startAngle,
        endAngle,
        midAngle,
        pullX,
        pullY,
        labelX,
        labelY,
        sliceAngle,
        originalIndex: idx
      };
    });
  }, [majorsData, totalStudents]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-5 sm:p-6">
      
      {/* Header & School Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
              {language === 'km' 
                ? 'ស្ថិតិវិភាគតាមមុខជំនាញ នៃសាលារៀននីមួយៗ' 
                : language === 'zh-TW'
                ? '各校專屬科系學生分佈與統計圖表'
                : 'School & Major Analytics Dashboard'}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {language === 'km'
              ? 'ក្រាហ្វិកសសរ (Column), ក្រាហ្វិករង្វង់ (Pie), បន្ទាត់និន្នាការ (Line) និងសេចក្តីសង្ខេប (Summary) តាមសាលានីមួយៗ'
              : 'Column chart, Pie chart, Line chart & Summary by school majors'}
          </p>
        </div>

        {/* School Dropdown Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none">
              <Building2 className="w-4 h-4" />
            </div>
            <select
              value={selectedSchool}
              onChange={e => {
                setSelectedSchool(e.target.value);
                setHoveredMajorIndex(null);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-200 bg-indigo-50/40 text-slate-800 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer truncate shadow-2xs"
            >
              <option value="all">
                {language === 'km' ? '🏫 គ្រប់សាលារៀនចិនទាំងអស់ (All Schools)' : language === 'zh-TW' ? '🏫 所有學校總覽 (All Schools)' : '🏫 All Target Schools'}
              </option>
              {schoolOptions.map(sch => {
                const sTrans = getSchoolTranslation(sch);
                const count = students.filter(s => s.targetSchool === sch).length;
                return (
                  <option key={sch} value={sch}>
                    {sch} ({count} {t.students})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Chart View Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveView('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'all' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show all charts & summary"
            >
              {language === 'km' ? 'ទាំងអស់' : 'All'}
            </button>
            <button
              onClick={() => setActiveView('column')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'column' 
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vertical Column Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'សសរ' : 'Column'}</span>
            </button>
            <button
              onClick={() => {
                setActiveView('bar');
                setColumnOrientation('horizontal');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'bar' 
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Horizontal Bar Chart"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'របារដេក' : 'Bar'}</span>
            </button>
            <button
              onClick={() => setActiveView('pie')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'pie' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Pie Chart"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'រង្វង់' : 'Pie'}</span>
            </button>
            <button
              onClick={() => setActiveView('line')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'line' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Line Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បន្ទាត់' : 'Line'}</span>
            </button>
            <button
              onClick={() => setActiveView('summary')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'summary' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Summary Table"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'សង្ខេប' : 'Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected School Banner Details */}
      {selectedSchool !== 'all' && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/80 via-slate-50 to-purple-50/80 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{selectedSchool}</span>
              {schoolTrans?.shortZh && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  {schoolTrans.shortZh}
                </span>
              )}
            </div>
            {schoolTrans && (
              <p className="text-slate-600">
                <span className="text-amber-600 font-medium">🇰🇭 {schoolTrans.km}</span>
                <span className="mx-1.5">•</span>
                <span className="text-slate-500 font-medium">{schoolTrans.locationKm}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedSchool('all')}
            className="self-start sm:self-auto text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
          >
            {language === 'km' ? '← បង្ហាញគ្រប់សាលាវិញ' : '← Show all schools'}
          </button>
        </div>
      )}

      {/* 1. SUMMARY KPI CARDS (សេចក្តីសង្ខេប / SUMMARY) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Students */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
            <span>{language === 'km' ? 'សរុបសិស្ស' : 'Total Students'}</span>
            <Users className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
          <div className="text-[10px] text-slate-400 font-medium">{t.students}</div>
        </div>

        {/* Male Students */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
          <div className="flex items-center justify-between text-blue-600 text-[11px] font-medium">
            <span>{t.maleStudents}</span>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{maleCount}</div>
          <div className="text-[10px] text-blue-500 font-medium">
            {totalStudents > 0 ? `${Math.round((maleCount / totalStudents) * 100)}%` : '0%'}
          </div>
        </div>

        {/* Female Students */}
        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
          <div className="flex items-center justify-between text-rose-600 text-[11px] font-medium">
            <span>{t.femaleStudents}</span>
            <span className="w-2 h-2 rounded-full bg-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{femaleCount}</div>
          <div className="text-[10px] text-rose-500 font-medium">
            {totalStudents > 0 ? `${Math.round((femaleCount / totalStudents) * 100)}%` : '0%'}
          </div>
        </div>

        {/* Total Active Majors */}
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
          <div className="flex items-center justify-between text-purple-600 text-[11px] font-medium">
            <span>{language === 'km' ? 'មុខជំនាញ' : 'Active Majors'}</span>
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{activeMajorsCount}</div>
          <div className="text-[10px] text-purple-500 font-medium">
            {majorsData.length} {language === 'km' ? 'ជំនាញសរុប' : 'total offerings'}
          </div>
        </div>

        {/* Top Major */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
          <div className="flex items-center justify-between text-amber-700 text-[11px] font-medium">
            <span>{language === 'km' ? 'ជំនាញពេញនិយម' : 'Top Major'}</span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-amber-900 truncate" title={topMajor ? topMajor.major : '-'}>
            {topMajor ? topMajor.major : '-'}
          </div>
          <div className="text-[10px] text-amber-700 font-medium">
            {topMajor ? `${topMajor.count} ${t.students} (${topMajor.percentage}%)` : '-'}
          </div>
        </div>

        {/* Required Docs Complete Rate */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
          <div className="flex items-center justify-between text-emerald-700 text-[11px] font-medium">
            <span>{language === 'km' ? 'ឯកសារគ្រប់' : 'Full Docs'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{completeDocsRate}%</div>
          <div className="text-[10px] text-emerald-600 font-medium">
            {completeDocsCount}/{totalStudents} {t.students}
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION (COLUMN CHART, PIE CHART, LINE CHART) */}
      <div className="space-y-6">
        
        {/* ROW: Column Chart (Culum Chart) / Bar Chart & Pie Chart */}
        {(activeView === 'all' || activeView === 'column' || activeView === 'bar' || activeView === 'pie') && (
          <div className={`grid grid-cols-1 ${activeView === 'all' ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-6`}>
            
            {/* COLUMN / BAR CHART */}
            {(activeView === 'all' || activeView === 'column' || activeView === 'bar') && (
              <div className={`${activeView === 'all' ? 'lg:col-span-7 xl:col-span-8' : ''} bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col justify-between`}>
                <div className="space-y-2 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        {columnOrientation === 'horizontal' || activeView === 'bar' ? (
                          <AlignLeft className="w-4 h-4" />
                        ) : (
                          <BarChart3 className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {activeView === 'bar' || columnOrientation === 'horizontal'
                            ? (language === 'km' 
                                ? 'ក្រាហ្វិករបារដេក (Bar Chart) ចំនួនសិស្សតាមជំនាញ' 
                                : language === 'zh-TW'
                                ? '各科系選讀人數橫向長條圖 (Bar Chart)'
                                : 'Student Count by Major (Bar Chart)')
                            : (language === 'km' 
                                ? 'ក្រាហ្វិកសសរ (Column Chart) ចំនួនសិស្សតាមជំនាញ' 
                                : language === 'zh-TW'
                                ? '各科系選讀人數長條圖 (Column Chart)'
                                : 'Student Count by Major (Column Chart)')}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {selectedSchool === 'all' 
                            ? (language === 'km' ? 'គ្រប់សាលាទាំងអស់' : 'All Schools Combined') 
                            : selectedSchool}
                        </span>
                      </div>
                    </div>

                    {/* Chart Orientation Switcher: Vertical vs Horizontal */}
                    <div className="flex items-center self-start sm:self-auto bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold">
                      <button
                        onClick={() => setColumnOrientation('vertical')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                          columnOrientation === 'vertical'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title={language === 'km' ? 'ក្រាហ្វិកឈរ (Vertical Columns)' : 'Vertical Columns'}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>{language === 'km' ? 'ឈរ' : 'Vertical'}</span>
                      </button>
                      <button
                        onClick={() => setColumnOrientation('horizontal')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                          columnOrientation === 'horizontal'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title={language === 'km' ? 'ក្រាហ្វិកដេក (Horizontal Bars)' : 'Horizontal Bars'}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>{language === 'km' ? 'ដេក' : 'Horizontal'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {language === 'km' 
                      ? 'ស្ថិតិចំនួនសិស្សតាមជំនាញនីមួយៗ ដោយមានទំហំធំទូលាយ និងគ្មានការជាន់លើគ្នា' 
                      : 'Clear, spacious visualization of student enrollment per major with no overlapping'}
                  </p>
                </div>

                {majorsData.length === 0 || totalStudents === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    {t.noStudentsFound}
                  </div>
                ) : (columnOrientation === 'vertical' && activeView !== 'bar') ? (
                  /* VERTICAL COLUMN CHART WITH RESERVED HEADROOM & ROOMY SPACING */
                  <div className="space-y-3">
                    {/* Live Interactive Major Info Banner (Prominent & Never Clipped) */}
                    <div className={`p-3 rounded-xl border transition-all duration-200 min-h-[58px] flex items-center justify-between gap-3 shadow-2xs ${
                      hoveredMajorIndex !== null && majorsData[hoveredMajorIndex]
                        ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-700/60'
                        : 'bg-white border-slate-200/80 text-slate-600'
                    }`}>
                      {hoveredMajorIndex !== null && majorsData[hoveredMajorIndex] ? (
                        (() => {
                          const hm = majorsData[hoveredMajorIndex];
                          return (
                            <>
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: hm.color }} />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-sm text-amber-300 truncate">{hm.major}</span>
                                    <span className="text-[11px] text-indigo-200 font-medium">🇰🇭 {hm.majorKm}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">{hm.majorEn}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <span className="text-xs font-black text-white block">{hm.count} នាក់ ({hm.percentage}%)</span>
                                  <span className="text-[10px] text-slate-300">👨 {hm.male} · 👩 {hm.female}</span>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-2 py-1 rounded-lg hidden sm:inline">
                                  {language === 'km' ? 'ចុចដើម្បីត្រង' : 'Click to filter'}
                                </span>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-500 w-full justify-between">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>
                              {language === 'km' 
                                ? 'ដាក់ Mouse លើសសរដើម្បីមើលព័ត៌មានលម្អិតនៃជំនាញ ឬចុចដើម្បីត្រងបញ្ជីសិស្ស' 
                                : 'Hover over any column bar to view major details, or click to filter students'}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                            {majorsData.length} {language === 'km' ? 'ជំនាញ' : 'majors'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mobile Hint for Vertical Column Chart */}
                    <div className="sm:hidden px-2.5 py-1.5 rounded-lg bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-[11px] text-indigo-700">
                      <span>👈👉 {language === 'km' ? 'អូសទៅស្តាំមើលជំនាញទាំងអស់' : 'Swipe right to see all majors'}</span>
                      <button
                        type="button"
                        onClick={() => setColumnOrientation('horizontal')}
                        className="font-bold underline text-indigo-800"
                      >
                        {language === 'km' ? 'ប្តូរជាដេក (Fit Screen)' : 'Horizontal (Fit)'}
                      </button>
                    </div>

                    <div className="overflow-x-auto pb-2 scrollbar-thin">
                      <div 
                        className="relative pt-6 pb-2 px-2"
                        style={{ minWidth: `${Math.max(540, Math.min(10, majorsData.length) * 82)}px` }}
                      >
                        {/* Background Grid Scale Lines */}
                        <div className="absolute inset-0 top-6 bottom-14 pointer-events-none flex flex-col justify-between">
                          <div className="border-b border-dashed border-slate-200/90 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{maxMajorCount}</span>
                          </div>
                          <div className="border-b border-dashed border-slate-200/80 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{Math.round(maxMajorCount * 0.75)}</span>
                          </div>
                          <div className="border-b border-dashed border-slate-200/80 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{Math.round(maxMajorCount * 0.5)}</span>
                          </div>
                          <div className="border-b border-dashed border-slate-200/80 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{Math.round(maxMajorCount * 0.25)}</span>
                          </div>
                          <div className="border-b-2 border-slate-300 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>0</span>
                          </div>
                        </div>

                        {/* Column Bars Area */}
                        <div className="flex items-end justify-between gap-3 sm:gap-4 h-56 sm:h-64 border-b-2 border-slate-300 relative z-10">
                          {majorsData.slice(0, 10).map((item, idx) => {
                            // Capped at 72% height to ensure 28% top headroom for value badges
                            const heightPercent = maxMajorCount > 0 
                              ? Math.max(6, (item.count / maxMajorCount) * 72) 
                              : 6;
                            const isHovered = hoveredMajorIndex === idx;

                            return (
                              <div 
                                key={item.major} 
                                className="flex-1 min-w-[68px] sm:min-w-[80px] max-w-[110px] min-w-0 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                                onMouseEnter={() => setHoveredMajorIndex(idx)}
                                onMouseLeave={() => setHoveredMajorIndex(null)}
                                onClick={() => onNavigateToStudents(item.major)}
                              >
                                {/* Value Label on Top of Column (Always inside container headroom) */}
                                <div className={`text-xs font-black mb-1.5 px-2 py-0.5 rounded-md transition-all ${
                                  item.count > 0 
                                    ? isHovered 
                                      ? 'bg-indigo-600 text-white shadow-sm scale-110 ring-2 ring-indigo-300' 
                                      : 'text-slate-800 bg-white/90 border border-slate-200/80 shadow-2xs' 
                                    : 'text-slate-300 font-normal'
                                }`}>
                                  {item.count}
                                </div>

                                {/* The Column Bar */}
                                <div 
                                  style={{ 
                                    height: `${heightPercent}%`,
                                    backgroundColor: item.color 
                                  }}
                                  className={`w-full max-w-[46px] rounded-t-xl transition-all duration-300 shadow-xs relative ${
                                    isHovered ? 'brightness-110 ring-2 ring-indigo-500 ring-offset-2' : 'hover:brightness-105'
                                  }`}
                                >
                                  {item.count > 0 && (
                                    <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-xl" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* X-Axis Major Labels Below Columns (Zero overlap guarantee) */}
                        <div className="flex items-start justify-between gap-3 sm:gap-4 pt-3">
                          {majorsData.slice(0, 10).map((item, idx) => (
                            <div 
                              key={item.major} 
                              onClick={() => onNavigateToStudents(item.major)}
                              className="flex-1 min-w-[68px] sm:min-w-[80px] max-w-[110px] min-w-0 text-center cursor-pointer group px-0.5"
                              title={`${item.major}\n${item.majorKm}`}
                            >
                              <span className="font-bold text-[11px] text-slate-800 block truncate group-hover:text-indigo-600 transition-colors">
                                {item.major}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-medium">
                                {item.majorKm}
                              </span>
                              <span className="inline-flex items-center gap-0.5 mt-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors border border-slate-200/60">
                                {item.count} {t.students}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* HORIZONTAL BAR CHART VIEW: 100% IMMUNE TO OVERLAPPING */
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {majorsData.map((item, idx) => {
                      const barPercent = maxMajorCount > 0 ? (item.count / maxMajorCount) * 100 : 0;
                      const isHovered = hoveredMajorIndex === idx;

                      return (
                        <div
                          key={item.major}
                          onClick={() => onNavigateToStudents(item.major)}
                          onMouseEnter={() => setHoveredMajorIndex(idx)}
                          onMouseLeave={() => setHoveredMajorIndex(null)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isHovered 
                              ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs' 
                              : 'bg-white border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span 
                                className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                                style={{ backgroundColor: item.color }} 
                              />
                              <span className="font-bold text-slate-800 truncate" title={item.major}>
                                {item.major}
                              </span>
                              <span className="text-slate-400 font-normal truncate hidden sm:inline text-[11px]">
                                • {item.majorKm}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                👨 {item.male} · 👩 {item.female}
                              </span>
                              <span className="font-black text-slate-900 text-xs">
                                {item.count} នាក់
                              </span>
                              <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] min-w-[34px] text-right border border-indigo-100">
                                {item.percentage}%
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${Math.max(item.count > 0 ? 3 : 0, barPercent)}%`,
                                backgroundColor: item.color 
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PIE CHART / DONUT CHART */}
            {(activeView === 'all' || activeView === 'pie') && (
              <div className={`${activeView === 'all' ? 'lg:col-span-5 xl:col-span-4' : ''} bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col justify-between`}>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <PieIcon className="w-4 h-4 text-emerald-600" />
                      <span>
                        {language === 'km' 
                          ? 'ក្រាហ្វិករង្វង់មូល (Pie Chart) សមាមាត្រ' 
                          : language === 'zh-TW'
                          ? '科系選讀比例圓餅圖 (Pie Chart)'
                          : 'Major Distribution (Pie Chart)'}
                      </span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {activeMajorsCount} {language === 'km' ? 'ជំនាញ' : 'majors'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {language === 'km' ? 'សមាមាត្រភាគរយនៃសិស្សតាមជំនាញនីមួយៗ' : 'Percentage breakdown per major'}
                  </p>
                </div>

                {totalStudents === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    {t.noStudentsFound}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* SVG Donut Chart with clean slice pull-out and labels */}
                    <div className="relative flex items-center justify-center py-2">
                      <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-52 sm:h-52 drop-shadow-xs overflow-visible">
                        {pieSlices.map((slice, idx) => {
                          const isHovered = hoveredMajorIndex === idx;
                          return (
                            <g key={slice.major}>
                              <path
                                d={slice.pathData}
                                fill={slice.color}
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 3 : 1.5}
                                className="transition-transform duration-200 cursor-pointer"
                                transform={isHovered ? `translate(${slice.pullX}, ${slice.pullY})` : undefined}
                                onMouseEnter={() => setHoveredMajorIndex(idx)}
                                onMouseLeave={() => setHoveredMajorIndex(null)}
                                onClick={() => onNavigateToStudents(slice.major)}
                              />
                              {/* Percentage Label on Slice (Only for slices >= 8%) */}
                              {slice.percentage >= 8 && (
                                <text
                                  x={slice.labelX + (isHovered ? slice.pullX : 0)}
                                  y={slice.labelY + (isHovered ? slice.pullY : 0)}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#ffffff"
                                  fontSize="8.5"
                                  fontWeight="bold"
                                  className="pointer-events-none select-none drop-shadow-sm transition-transform duration-200"
                                >
                                  {slice.percentage}%
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {/* Center Donut Hole Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                        {hoveredMajorIndex !== null && majorsData[hoveredMajorIndex] ? (
                          <>
                            <span className="text-xl sm:text-2xl font-black text-indigo-600 leading-none">
                              {majorsData[hoveredMajorIndex].count}
                            </span>
                            <span className="text-xs font-bold text-slate-700 mt-0.5">
                              {majorsData[hoveredMajorIndex].percentage}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[90px] block mt-0.5">
                              {majorsData[hoveredMajorIndex].major}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                              {totalStudents}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                              {t.students}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 mt-0.5">
                              {activeMajorsCount} {language === 'km' ? 'ជំនាញសកម្ម' : 'active majors'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Color-Coded Pie Legend with Spacing & Zero Collision */}
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {majorsData.filter(m => m.count > 0).map((item, idx) => (
                        <div
                          key={item.major}
                          onClick={() => onNavigateToStudents(item.major)}
                          onMouseEnter={() => setHoveredMajorIndex(idx)}
                          onMouseLeave={() => setHoveredMajorIndex(null)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer border ${
                            hoveredMajorIndex === idx 
                              ? 'bg-indigo-100/70 border-indigo-200 font-bold shadow-2xs' 
                              : 'bg-white/80 border-slate-200/70 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span 
                              className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-800 block truncate" title={`${item.major} (${item.majorKm})`}>
                                {item.major}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate font-medium">
                                {item.majorKm}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pl-2">
                            <span className="font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                              {item.count}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. LINE CHART (ក្រាហ្វិកបន្ទាត់និន្នាការ) */}
        {(activeView === 'all' || activeView === 'line') && (
          <div className="bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>
                    {language === 'km' 
                      ? 'ក្រាហ្វិកបន្ទាត់ (Line Chart) និន្នាការតាមមុខជំនាញ' 
                      : language === 'zh-TW'
                      ? '各專業人數走勢折線圖 (Line Chart)'
                      : 'Enrollment Trend by Major (Line Chart)'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'km' ? 'បន្ទាត់តភ្ជាប់បង្ហាញពីកម្រិតសិស្សចុះឈ្មោះតាមជំនាញនីមួយៗ' : 'Line trajectory across academic majors'}
                </p>
              </div>
              <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                {activeMajorsCount} {language === 'km' ? 'ជំនាញសកម្ម' : 'active majors'}
              </span>
            </div>

            {majorsData.length === 0 || totalStudents === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {t.noStudentsFound}
              </div>
            ) : (
              <div className="pt-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[500px]">
                    <svg viewBox="0 0 600 180" className="w-full h-44 sm:h-48 overflow-visible">
                      <defs>
                        <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = 140 - ratio * 110;
                        const val = Math.round(ratio * maxMajorCount);
                        return (
                          <g key={i}>
                            <line x1="40" y1={y} x2="580" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                            <text x="32" y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="monospace">
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Compute points for the line */}
                      {(() => {
                        const displayList = majorsData.slice(0, 10);
                        const n = displayList.length;
                        if (n === 0) return null;
                        const stepX = (580 - 60) / Math.max(1, n - 1);

                        const points = displayList.map((item, i) => {
                          const x = 60 + i * stepX;
                          const ratio = maxMajorCount > 0 ? item.count / maxMajorCount : 0;
                          const y = 140 - ratio * 110;
                          return { x, y, ...item };
                        });

                        // Path string
                        const pathD = points.reduce((acc, pt, i) => {
                          return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                        }, '');

                        // Area path string
                        const areaD = `${pathD} L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z`;

                        return (
                          <>
                            {/* Area fill */}
                            <path d={areaD} fill="url(#lineAreaGradient)" />

                            {/* Main connecting line */}
                            <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Data points & labels */}
                            {points.map((pt, i) => {
                              const isHovered = hoveredMajorIndex === i;
                              return (
                                <g 
                                  key={pt.major} 
                                  className="cursor-pointer"
                                  onClick={() => onNavigateToStudents(pt.major)}
                                  onMouseEnter={() => setHoveredMajorIndex(i)}
                                  onMouseLeave={() => setHoveredMajorIndex(null)}
                                >
                                  {/* Dot */}
                                  <circle 
                                    cx={pt.x} 
                                    cy={pt.y} 
                                    r={isHovered ? 6 : 4} 
                                    fill="#ffffff" 
                                    stroke="#7c3aed" 
                                    strokeWidth={isHovered ? 3 : 2}
                                    className="transition-all"
                                  />

                                  {/* Value label */}
                                  <text 
                                    x={pt.x} 
                                    y={pt.y - 8} 
                                    textAnchor="middle" 
                                    fontSize="10" 
                                    fontWeight="bold" 
                                    fill={isHovered ? '#6d28d9' : '#1e293b'}
                                  >
                                    {pt.count}
                                  </text>

                                  {/* X-axis Major label */}
                                  <text 
                                    x={pt.x} 
                                    y="160" 
                                    textAnchor="middle" 
                                    fontSize="9.5" 
                                    fontWeight="600" 
                                    fill="#475569"
                                    className="select-none"
                                  >
                                    {pt.major.slice(0, 4)}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SUMMARY BREAKDOWN TABLE (សេចក្តីសង្ខេប / SUMMARY) */}
        {(activeView === 'all' || activeView === 'summary') && (
          <div className="bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>
                    {language === 'km' 
                      ? 'តារាងសង្ខេបលម្អិត តាមជំនាញនៃសាលានីមួយៗ' 
                      : language === 'zh-TW'
                      ? '各校專業詳細統計摘要表 (Summary Table)'
                      : 'Detailed Summary Table by School & Major'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'km' ? 'បញ្ជីរាយនាមមុខជំនាញ សមាមាត្រភាគរយ និងការបែងចែកភេទ' : 'Comprehensive breakdown with gender distribution'}
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500 font-bold">
                {totalStudents} {t.students}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[150px]">
                      {language === 'km' ? 'មុខជំនាញ (Major)' : 'Major / 專業科系'}
                    </th>
                    <th className="py-2.5 px-3 min-w-[160px]">
                      {language === 'km' ? 'បកប្រែជាភាសាខ្មែរ (Khmer)' : 'Khmer Translation'}
                    </th>
                    <th className="py-2.5 px-3 text-center">
                      {language === 'km' ? 'ចំនួនសិស្ស' : 'Students'}
                    </th>
                    <th className="py-2.5 px-3 min-w-[140px]">
                      {language === 'km' ? 'សមាមាត្រ (%)' : 'Share (%)'}
                    </th>
                    <th className="py-2.5 px-3 text-center">
                      {t.male}
                    </th>
                    <th className="py-2.5 px-3 text-center">
                      {t.female}
                    </th>
                    <th className="py-2.5 px-3 text-center w-20">
                      {language === 'km' ? 'មើល' : 'View'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {majorsData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        {t.noStudentsFound}
                      </td>
                    </tr>
                  ) : (
                    majorsData.map((item, index) => (
                      <tr 
                        key={item.major} 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => onNavigateToStudents(item.major)}
                      >
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <span>{item.major}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium font-battambang">
                          {item.majorKm}
                        </td>
                        <td className="py-2.5 px-3 text-center font-black text-slate-900">
                          {item.count}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${item.percentage}%`,
                                  backgroundColor: item.color 
                                }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[11px] text-slate-600 min-w-[32px]">
                              {item.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-blue-700">
                          {item.male}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-rose-700">
                          {item.female}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 font-bold text-[11px]">
                            <span>{language === 'km' ? 'មើល' : 'View'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
