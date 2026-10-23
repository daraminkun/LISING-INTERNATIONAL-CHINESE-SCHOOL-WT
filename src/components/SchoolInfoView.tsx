import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  GraduationCap, 
  MapPin, 
  Globe, 
  Phone, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Award, 
  Home, 
  RefreshCw, 
  Share2, 
  FileCheck,
  ChevronRight,
  Layers,
  School,
  FileText
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { 
  DetailedSchool, 
  SchoolCategory, 
  getAllDetailedSchools, 
  generateDailyAnnouncements 
} from '../data/detailedSchoolsData';
import { formatNumberByLanguage } from '../utils/numberUtils';
import { getMajorTranslation } from '../utils/schoolMajorTranslations';

interface SchoolInfoViewProps {
  language: Language;
  onNavigateToAddStudent?: (preselectedSchool?: string) => void;
  onNavigateToDashboard?: () => void;
}

export const SchoolInfoView: React.FC<SchoolInfoViewProps> = ({
  language,
  onNavigateToAddStudent,
  onNavigateToDashboard
}) => {
  const t = translations[language];
  const allSchools = useMemo(() => getAllDetailedSchools(), []);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<'all' | SchoolCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(() => allSchools[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'admissions' | 'majors' | 'campus' | 'updates'>('admissions');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Cities list
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allSchools.forEach(s => set.add(s.city));
    return Array.from(set);
  }, [allSchools]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return allSchools.filter(school => {
      // Category filter
      if (selectedCategory !== 'all' && school.category !== selectedCategory) {
        return false;
      }
      // City filter
      if (selectedCity !== 'all' && school.city !== selectedCity) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = school.name.toLowerCase().includes(q) ||
                          school.nameKm.toLowerCase().includes(q) ||
                          school.nameEn.toLowerCase().includes(q);
        const matchAddress = school.address.toLowerCase().includes(q);
        const matchCity = school.city.toLowerCase().includes(q) || school.cityKm.toLowerCase().includes(q);
        const matchMajor = school.majors.some(m => m.toLowerCase().includes(q));
        if (!matchName && !matchAddress && !matchCity && !matchMajor) {
          return false;
        }
      }
      return true;
    });
  }, [allSchools, selectedCategory, selectedCity, searchQuery]);

  // Active School
  const currentSchool = useMemo(() => {
    const found = filteredSchools.find(s => s.id === selectedSchoolId);
    if (found) return found;
    return filteredSchools[0] || allSchools[0];
  }, [filteredSchools, selectedSchoolId, allSchools]);

  // Dynamic daily announcements for the current school
  const announcements = useMemo(() => {
    if (!currentSchool) return [];
    return generateDailyAnnouncements(currentSchool.name, currentSchool.category);
  }, [currentSchool, lastRefreshedTime]);

  // Handle address copy
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Simulate refresh live bulletins
  const handleRefreshNews = () => {
    setIsRefreshingNews(true);
    setTimeout(() => {
      setIsRefreshingNews(false);
      setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  // Count stats
  const highSchoolCount = useMemo(() => allSchools.filter(s => s.category === 'high_school').length, [allSchools]);
  const univCount = useMemo(() => allSchools.filter(s => s.category === 'university').length, [allSchools]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        style={{ backgroundColor: '#701014' }}
      >
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Building2 className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'km' 
                  ? 'បណ្តាញសាលារៀនដៃគូផ្លូវការនៅសាធារណរដ្ឋចិន (តៃវ៉ាន់)' 
                  : language === 'zh-TW' 
                  ? '臺灣教育部核准・合作高中職與科技大學名冊' 
                  : 'Official Taiwan Partner Schools & Universities Directory'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight font-battambang">
              {language === 'km'
                ? 'ព័ត៌មានអំពីសាលារៀន & បច្ចុប្បន្នភាពប្រចាំថ្ងៃ'
                : language === 'zh-TW'
                ? '臺灣各校簡介、招生資訊與每日動態'
                : 'School Directory, Admissions & Daily Updates'}
            </h1>

            <p className="text-xs sm:text-sm text-red-100 font-battambang leading-relaxed">
              {language === 'km'
                ? `រុករកព័ត៌មានលម្អិតនៃសាលារៀនទាំង ${formatNumberByLanguage(allSchools.length, language)} (វិទ្យាល័យ ${formatNumberByLanguage(highSchoolCount, language)} និង សាកលវិទ្យាល័យ ${formatNumberByLanguage(univCount, language)}) ព្រមទាំងអាសយដ្ឋាន ការចូលរៀន មុខជំនាញ និងព័ត៌មានប្រកាសថ្មីៗជារៀងរាល់ថ្ងៃពី Web Site សាលាផ្ទាល់។`
                : language === 'zh-TW'
                ? `共收錄 ${allSchools.length} 所合作學校（高中職 3+4 計 ${highSchoolCount} 所、科技大學計 ${univCount} 所）。提供完整地址、入學資格、專門科系及每日即時官方公告。`
                : `Explore detailed information for all ${allSchools.length} partner institutions (${highSchoolCount} Vocational High Schools and ${univCount} Tech Universities).`}
            </p>
          </div>

          {/* Quick Apply CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            {onNavigateToAddStudent && (
              <button
                type="button"
                onClick={() => onNavigateToAddStudent(currentSchool?.name)}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm text-red-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] shadow-lg shadow-black/20 hover:shadow-xl transition-all font-battambang group"
              >
                <GraduationCap className="w-5 h-5 text-red-900 group-hover:scale-110 transition-transform" />
                <span>
                  {language === 'km' 
                    ? 'ចុះឈ្មោះចូលរៀនឥឡូវ (Apply Now)' 
                    : language === 'zh-TW' 
                    ? '線上填表登記入學' 
                    : 'Apply for Admission'}
                </span>
                <ArrowRight className="w-4 h-4 text-red-900 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-amber-200 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'km' ? 'Auto-Update ប្រចាំថ្ងៃ' : language === 'zh-TW' ? '每日即時動態連線' : 'Live Daily Feed'} ({lastRefreshedTime})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter & Selection Shelf */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
        
        {/* Tier 1: Category Badges and City Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-red-700 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4" />
              <span>
                {language === 'km' ? 'សាលាទាំងអស់' : language === 'zh-TW' ? '全部學校' : 'All Schools'}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'all' ? 'bg-red-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {formatNumberByLanguage(allSchools.length, language)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('high_school')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 ${
                selectedCategory === 'high_school'
                  ? 'bg-red-700 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>
                {language === 'km' ? 'អនុវិទ្យាល័យ / វិទ្យាល័យ' : language === 'zh-TW' ? '高中職專班 (3+4)' : 'High / Vocational'}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'high_school' ? 'bg-red-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {formatNumberByLanguage(highSchoolCount, language)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('university')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 ${
                selectedCategory === 'university'
                  ? 'bg-red-700 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>
                {language === 'km' ? 'មហាវិទ្យាល័យ / សាកលវិទ្យាល័យ' : language === 'zh-TW' ? '科技大學 (學士)' : 'Universities'}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'university' ? 'bg-red-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {formatNumberByLanguage(univCount, language)}
              </span>
            </button>
          </div>

          {/* City / Region Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{language === 'km' ? 'តំបន់/ទីក្រុង៖' : language === 'zh-TW' ? '所在縣市：' : 'City/Region:'}</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="py-1.5 px-3 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-red-600 focus:border-red-600 shadow-2xs cursor-pointer"
            >
              <option value="all">
                {language === 'km' ? 'គ្រប់ទីក្រុងទាំងអស់ (All Regions)' : language === 'zh-TW' ? '全台灣所有縣市' : 'All Regions in Taiwan'}
              </option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tier 2: Search Input and School Dropdown Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          
          {/* Quick Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'km'
                  ? 'ស្វែងរកតាមឈ្មោះសាលា ចិន/ខ្មែរ/អង់គ្លេស ជំនាញ ឬអាសយដ្ឋាន...'
                  : language === 'zh-TW'
                  ? '搜尋學校名稱、高棉名稱、專業科系或地址...'
                  : 'Search by school name, major, or address...'
              }
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-500/20 shadow-2xs"
            />
          </div>

          {/* School Selector Dropdown (Filter ជ្រើសរើស ឈ្មោះសាលារៀន) */}
          <div className="md:col-span-7 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-700 pointer-events-none">
                <School className="w-4 h-4" />
              </div>
              <select
                value={currentSchool?.id || ''}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border-2 border-red-200/80 bg-red-50/30 hover:bg-white text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer truncate shadow-xs font-battambang"
              >
                {filteredSchools.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    {idx + 1}. {s.name} ({s.city}) - {s.nameKm}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleRefreshNews}
              disabled={isRefreshingNews}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
              title="Refresh Live Bulletins from School Website"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-600 ${isRefreshingNews ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{language === 'km' ? 'ព័ត៌មានថ្មី' : language === 'zh-TW' ? '即時更新' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Detailed School Information Presentation Card */}
      {currentSchool ? (
        <div className="space-y-6">
          
          {/* Main Hero Card for the Selected School */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            
            {/* School Header Stripe */}
            <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-red-50/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                <div className="flex items-start gap-4">
                  {/* Logo or Emblem Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 border-2 border-white overflow-hidden">
                    {currentSchool.logoUrl ? (
                      <img 
                        src={currentSchool.logoUrl} 
                        alt={currentSchool.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span>{currentSchool.name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        currentSchool.category === 'high_school'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      }`}>
                        {language === 'km' 
                          ? currentSchool.categoryLabelKm 
                          : language === 'zh-TW' 
                          ? currentSchool.categoryLabelZh 
                          : currentSchool.categoryLabelEn}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-600" />
                        <span>{currentSchool.city} · {currentSchool.cityKm}</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      {currentSchool.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 font-battambang">
                      <span className="text-red-700 font-bold">🇰🇭 {currentSchool.nameKm}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-sans">{currentSchool.nameEn}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Actions: Visit Web & Direct Apply */}
                <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
                  <a
                    href={currentSchool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs hover:border-slate-400 group"
                  >
                    <Globe className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>{language === 'km' ? 'Website ផ្លូវការ' : language === 'zh-TW' ? '官方網站' : 'Official Website'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  {onNavigateToAddStudent && (
                    <button
                      type="button"
                      onClick={() => onNavigateToAddStudent(currentSchool.name)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-xs font-black transition-all shadow-md shadow-red-950/20 font-battambang group"
                    >
                      <GraduationCap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                      <span>{language === 'km' ? 'ចុះឈ្មោះសាលានេះ' : language === 'zh-TW' ? '立即申請就讀' : 'Apply for this School'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>

              {/* Address Strip with Google Maps & Copy */}
              <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-bold text-slate-900">{language === 'km' ? 'អាសយដ្ឋាន៖' : language === 'zh-TW' ? '校址：' : 'Address:'}</span>
                  <span className="font-mono">{currentSchool.address}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(currentSchool.address)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedAddress ? (language === 'km' ? 'បានចម្លង!' : '已複製!') : (language === 'km' ? 'ចម្លងអាសយដ្ឋាន' : '複製地址')}</span>
                  </button>

                  <a
                    href={currentSchool.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200/60 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'km' ? 'បើកមើលលើ Google Maps' : language === 'zh-TW' ? '在 Google 地圖開啟' : 'View on Google Maps'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {currentSchool.phone && (
                    <a
                      href={`tel:${currentSchool.phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200/60 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentSchool.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Information Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('admissions')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'admissions'
                    ? 'border-red-600 text-red-700 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>{language === 'km' ? 'ការចូលរៀន & លក្ខខណ្ឌ' : language === 'zh-TW' ? '招生簡章與資格' : 'Admissions & Requirements'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('majors')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'majors'
                    ? 'border-red-600 text-red-700 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-red-600" />
                <span>{language === 'km' ? 'មុខជំនាញសិក្សា' : language === 'zh-TW' ? '專門科系與專業' : 'Offered Majors'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">
                  {formatNumberByLanguage(currentSchool.majors.length, language)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('campus')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'campus'
                    ? 'border-red-600 text-red-700 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-4 h-4 text-red-600" />
                <span>{language === 'km' ? 'អន្តេវាសិកដ្ឋាន & ជីវិតនិស្សិត' : language === 'zh-TW' ? '宿舍環境與校園生活' : 'Campus & Dormitory'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('updates')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'updates'
                    ? 'border-red-600 text-red-700 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'km' ? 'ព័ត៌មាន ថ្មីៗ Auto ប្រចាំថ្ងៃ' : language === 'zh-TW' ? '每日即時動態公告' : 'Daily Live Updates'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                  NEW
                </span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="p-6 sm:p-7">
              
              {/* TAB 1: Admissions */}
              {activeTab === 'admissions' && (
                <div className="space-y-6">
                  
                  {/* Highlight Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Age Criteria */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{language === 'km' ? 'លក្ខខណ្ឌអាយុ (Age Criteria)' : language === 'zh-TW' ? '年齡限制條件' : 'Age Requirements'}</span>
                      </div>
                      <p className="text-sm font-extrabold text-amber-950 font-battambang">
                        {language === 'km' ? currentSchool.ageRequirementKm : language === 'zh-TW' ? currentSchool.ageRequirementZh : currentSchool.ageRequirementEn}
                      </p>
                      <p className="text-[11px] text-amber-800/80">
                        {currentSchool.category === 'high_school'
                          ? (language === 'km' ? 'គិតត្រឹមថ្ងៃចុះឈ្មោះចូលរៀនថ្នាក់វិទ្យាល័យ 3+4' : '符合台灣教育部僑生建教專班規定')
                          : (language === 'km' ? 'គិតត្រឹមថ្ងៃទី ០១ ខែកក្កដា សម្រាប់ថ្នាក់បរិញ្ញាបត្រ' : '大學部秋季入學年齡標準')}
                      </p>
                    </div>

                    {/* Scholarship & Monthly Stipend */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'km' ? 'អាហារូបករណ៍ & ប្រាក់បៀវត្សរ៍' : language === 'zh-TW' ? '獎助學金與實習津貼' : 'Scholarships & Stipends'}</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-950 font-battambang leading-relaxed">
                        {language === 'km' ? currentSchool.scholarshipKm : language === 'zh-TW' ? currentSchool.scholarshipZh : currentSchool.scholarshipEn}
                      </p>
                    </div>

                    {/* Academic Qualification */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                        <FileCheck className="w-4 h-4 text-indigo-600" />
                        <span>{language === 'km' ? 'កម្រិតវប្បធម៌តម្រូវ' : language === 'zh-TW' ? '學歷報考資格' : 'Prerequisite Education'}</span>
                      </div>
                      <p className="text-xs font-bold text-indigo-950 font-battambang leading-relaxed">
                        {currentSchool.category === 'high_school'
                          ? (language === 'km' ? 'វិញ្ញាបនបត្រមធ្យមសិក្សាបឋមភូមិ (ឌីប្លូម / ជាប់ថ្នាក់ទី៩)' : '國中畢業或具同等學歷證件')
                          : (language === 'km' ? 'វិញ្ញាបនបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប / ជាប់ថ្នាក់ទី១២)' : '高中職畢業或同等學歷')}
                      </p>
                    </div>

                  </div>

                  {/* Admissions Description Block */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-battambang">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span>{language === 'km' ? 'ព័ត៌មានលម្អិតអំពីកម្មវិធីសិក្សា & ការចូលរៀន' : language === 'zh-TW' ? '就學輔導與專案說明' : 'Program Overview'}</span>
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-battambang">
                      {language === 'km' ? currentSchool.admissionsOverviewKm : language === 'zh-TW' ? currentSchool.admissionsOverviewZh : currentSchool.admissionsOverviewEn}
                    </p>
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {language === 'km' ? 'ឯកសារចាំបាច់ត្រូវ Upload ក្នុងការចុះឈ្មោះ៖' : language === 'zh-TW' ? '報名登記必備文件清單：' : 'Required Upload Documents:'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2 font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{language === 'km' ? 'សំបុត្រកំណើត' : '出生證明 (Birth Cert)'}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2 font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{language === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ' : '身分證 (National ID)'}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2 font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{language === 'km' ? 'សៀវភៅគ្រួសារ / ស្នាក់នៅ' : '戶籍或居住手冊'}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2 font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{language === 'km' ? 'សញ្ញាបត្រ / លិខិតបញ្ជាក់' : '畢業證書或在學證明'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Majors */}
              {activeTab === 'majors' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-battambang">
                        {language === 'km' ? `ជំនាញដែលបើកបង្រៀន (${formatNumberByLanguage(currentSchool.majors.length, language)} មុខជំនាញ)` : `本校招生科系與專門領域（共 ${currentSchool.majors.length} 個科系）`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {language === 'km' ? 'ចុចលើជំនាញដើម្បីដាក់ពាក្យស្នើសុំ ឬពិនិត្យមើលព័ត៌មានបន្ថែម' : '點選專門科系即可直接填表申請'}
                      </p>
                    </div>

                    {onNavigateToAddStudent && (
                      <button
                        type="button"
                        onClick={() => onNavigateToAddStudent(currentSchool.name)}
                        className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
                      >
                        <span>{language === 'km' ? 'ជ្រើសរើសជំនាញចុះឈ្មោះ' : '前往登記'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentSchool.majors.map((major, idx) => {
                      const mTrans = getMajorTranslation(major);
                      return (
                        <div
                          key={major}
                          onClick={() => onNavigateToAddStudent && onNavigateToAddStudent(currentSchool.name)}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-red-400 hover:shadow-xs transition-all cursor-pointer group space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="w-6 h-6 rounded-md bg-red-50 text-red-700 font-black text-xs flex items-center justify-center font-battambang">
                              {formatNumberByLanguage(idx + 1, language)}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {currentSchool.category === 'high_school' ? '高職科' : '大學部'}
                            </span>
                          </div>

                          <div className="font-extrabold text-slate-900 group-hover:text-red-700 transition-colors text-sm">
                            {major}
                          </div>

                          {mTrans && (
                            <div className="text-xs text-slate-500 font-battambang">
                              🇰🇭 {mTrans.km}
                              <span className="block text-[11px] text-slate-400 font-sans">{mTrans.en}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Campus & Dormitory */}
              {activeTab === 'campus' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Dormitory Card */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Home className="w-5 h-5 text-red-600" />
                        <span>{language === 'km' ? 'ព័ត៌មានអន្តេវាសិកដ្ឋាន (Student Dormitory)' : '學生宿舍環境與生活機能'}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-battambang">
                        {language === 'km' ? currentSchool.dormitoryKm : language === 'zh-TW' ? currentSchool.dormitoryZh : currentSchool.dormitoryEn}
                      </p>
                      <ul className="text-xs space-y-2 text-slate-600 font-medium">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{language === 'km' ? 'បំពាក់ម៉ាស៊ីនត្រជាក់ និងកង្ហារគ្រប់បន្ទប់' : '全天候冷氣設備與通風設計'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{language === 'km' ? 'Wi-Fi អ៊ីនធឺណិតល្បឿនលឿនឥតគិតថ្លៃ' : '全區覆蓋高速光纖無線網路'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{language === 'km' ? 'ប្រព័ន្ធសន្តិសុខ និងគ្រូប្រចាំការ ២៤ម៉ោង' : '門禁刷卡感應與24小時生活輔導老師'}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Location & Public Transportation */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>{language === 'km' ? 'ទីតាំងភូមិសាស្ត្រ & ការធ្វើដំណើរ' : '交通指南與地理位置'}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-battambang">
                        {language === 'km'
                          ? `សាលាស្ថិតនៅ ${currentSchool.cityKm} (${currentSchool.address}) មានភាពងាយស្រួលក្នុងការធ្វើដំណើរតាមរថភ្លើង រថភ្លើងក្រោមដី (MRT) និងរថយន្តក្រុងសាធារណៈ។`
                          : `本校位於 ${currentSchool.city}，鄰近大眾捷運、火車站與公車站，生活交通極為便利。`}
                      </p>
                      <div className="pt-2">
                        <a
                          href={currentSchool.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          <MapPin className="w-4 h-4 text-white" />
                          <span>{language === 'km' ? 'បើកផែនទី Google Maps ផ្ទាល់' : '立即在 Google 地圖導航'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: Daily Live Web Updates */}
              {activeTab === 'updates' && (
                <div className="space-y-4">
                  
                  {/* Live Feed Header */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5 text-amber-950" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-950 font-battambang">
                          {language === 'km' ? 'ព័ត៌មាន និងសេចក្តីប្រកាសថ្មីៗ Updated ជារៀងរាល់ថ្ងៃ' : '學校官方每日最新公告與即時訊息'}
                        </h4>
                        <p className="text-[11px] text-amber-800">
                          {language === 'km' 
                            ? 'ទាញយក និងបង្ហាញព័ត៌មានស្វ័យប្រវត្តពីគេហទំព័រផ្លូវការរបស់សាលារៀន' 
                            : '即時串接學校官方網站公告欄位與教育部專案發布'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRefreshNews}
                      disabled={isRefreshingNews}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 transition-colors shadow-2xs self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isRefreshingNews ? 'animate-spin' : ''}`} />
                      <span>{isRefreshingNews ? (language === 'km' ? 'កំពុងទាញយក...' : '更新中...') : (language === 'km' ? 'ទាញយកទិន្នន័យថ្មី' : '立即重新整理')}</span>
                    </button>
                  </div>

                  {/* Bulletins List */}
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div 
                        key={ann.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          ann.isImportant 
                            ? 'bg-red-50/40 border-red-200' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              ann.category === 'Admissions'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : ann.category === 'Scholarship'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : ann.category === 'Campus'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                              {language === 'km' ? ann.categoryKm : ann.categoryZh}
                            </span>
                            {ann.isImportant && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                HOT 🔥
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{ann.date}</span>
                          </div>
                        </div>

                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-battambang mb-1">
                          {language === 'km' ? ann.titleKm : ann.title}
                        </h5>

                        <p className="text-xs text-slate-600 font-battambang leading-relaxed">
                          {language === 'km' ? ann.contentKm : ann.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Link to School's Official Newsroom */}
                  <div className="pt-2 text-center">
                    <a
                      href={currentSchool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 font-bold underline decoration-dotted"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>
                        {language === 'km' 
                          ? `ចូលមើលក្តារព័ត៌មានផ្សាយផ្ទាល់លើគេហទំព័រ ${currentSchool.name}` 
                          : `前往 ${currentSchool.name} 官方網站瀏覽完整歷史公告`}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* 4. Other Recommended Partner Schools in the Same Region / Category */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-red-700" />
                <h3 className="font-extrabold text-slate-900 text-base font-battambang">
                  {language === 'km' 
                    ? `សាលារៀនផ្សេងទៀតក្នុងបញ្ជី (${formatNumberByLanguage(filteredSchools.length, language)} សាលា)` 
                    : `其他同類合作學校推薦（共 ${filteredSchools.length} 所）`}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {language === 'km' ? 'ចុចលើសាលាដើម្បីមើលលម្អិត' : '點選以切換查看'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredSchools.slice(0, 8).map(sch => {
                const isCurrent = sch.id === currentSchool.id;
                return (
                  <div
                    key={sch.id}
                    onClick={() => {
                      setSelectedSchoolId(sch.id);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-red-50/60 border-red-600 ring-2 ring-red-600/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold text-slate-500">
                      <span>{sch.city}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                        sch.category === 'high_school' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {sch.category === 'high_school' ? '3+4' : '大學'}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs truncate" title={sch.name}>
                      {sch.name}
                    </div>

                    <div className="text-[11px] text-slate-500 font-battambang truncate mt-0.5">
                      {sch.nameKm}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{sch.majors.length} {language === 'km' ? 'ជំនាញ' : '科系'}</span>
                      <span className="text-red-700 font-bold flex items-center gap-0.5">
                        {language === 'km' ? 'មើលលម្អិត' : '詳情'}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
          {t.noStudentsFound}
        </div>
      )}

    </div>
  );
};
