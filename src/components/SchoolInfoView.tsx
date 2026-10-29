import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  MapPin,
  Globe,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  School,
  X
} from 'lucide-react';
import { Language } from '../types';
import {
  SchoolCategory,
  getAllDetailedSchools
} from '../data/detailedSchoolsData';
import { formatNumberByLanguage } from '../utils/numberUtils';
import { dbStorage } from '../services/dbStorage';
import { schoolMajorService } from '../services/schoolMajorService';

interface SchoolInfoViewProps {
  language: Language;
  onNavigateToAddStudent?: (preselectedSchool?: string) => void;
  onNavigateToDashboard?: () => void;
}

export const SchoolInfoView: React.FC<SchoolInfoViewProps> = ({
  language
}) => {
  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setCatalogVersion((v) => v + 1);
    const unsub = schoolMajorService.subscribe(refresh);
    window.addEventListener('school_logos_updated', refresh);
    window.addEventListener('school_majors_data_updated', refresh);
    dbStorage.whenReady().then(refresh);
    return () => {
      unsub();
      window.removeEventListener('school_logos_updated', refresh);
      window.removeEventListener('school_majors_data_updated', refresh);
    };
  }, []);

  const allSchools = useMemo(
    () => getAllDetailedSchools(schoolMajorService.getSchools()),
    [catalogVersion]
  );

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<'all' | SchoolCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(() => allSchools[0]?.id || '');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // Unique cities with localized labels
  const availableCities = useMemo(() => {
    const cityMap = new Map<string, { zh: string; km: string; en: string }>();
    allSchools.forEach((s) => {
      if (!cityMap.has(s.city)) {
        cityMap.set(s.city, { zh: s.city, km: s.cityKm, en: s.cityEn });
      }
    });
    return Array.from(cityMap.values());
  }, [allSchools]);

  // Filtered schools list
  const filteredSchools = useMemo(() => {
    return allSchools.filter((school) => {
      if (selectedCategory !== 'all' && school.category !== selectedCategory) {
        return false;
      }
      if (selectedCity !== 'all' && school.city !== selectedCity) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName =
          school.name.toLowerCase().includes(q) ||
          school.nameKm.toLowerCase().includes(q) ||
          school.nameEn.toLowerCase().includes(q);
        const matchAddress = school.address.toLowerCase().includes(q);
        const matchCity =
          school.city.toLowerCase().includes(q) ||
          school.cityKm.toLowerCase().includes(q) ||
          school.cityEn.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchCity) {
          return false;
        }
      }
      return true;
    });
  }, [allSchools, selectedCategory, selectedCity, searchQuery]);

  // Active selected school
  const currentSchool = useMemo(() => {
    const found = filteredSchools.find((s) => s.id === selectedSchoolId);
    if (found) return found;
    return filteredSchools[0] || null;
  }, [filteredSchools, selectedSchoolId]);

  useEffect(() => {
    setLogoFailed(false);
    setCopiedAddress(false);
  }, [currentSchool?.id]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const highSchoolCount = useMemo(
    () => allSchools.filter((s) => s.category === 'high_school').length,
    [allSchools]
  );
  const univCount = useMemo(
    () => allSchools.filter((s) => s.category === 'university').length,
    [allSchools]
  );

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedCity !== 'all' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setSearchQuery('');
  };

  const embedMapUrl = currentSchool
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        `${currentSchool.name} ${currentSchool.address}`
      )}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    : '';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div className="rounded-2xl bg-[#701014] px-6 py-6 sm:px-8 sm:py-7 text-white shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-battambang">
            {language === 'km'
              ? 'ព័ត៌មានអំពីសាលារៀន'
              : language === 'zh-TW'
              ? '臺灣合作學校資訊'
              : 'School Information'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-red-100/90 font-battambang">
            <span>
              {language === 'km'
                ? `អនុវិទ្យាល័យ/វិទ្យាល័យ ${formatNumberByLanguage(highSchoolCount, language)}`
                : language === 'zh-TW'
                ? `高中職 ${formatNumberByLanguage(highSchoolCount, language)} 所`
                : `${formatNumberByLanguage(highSchoolCount, language)} High Schools`}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {language === 'km'
                ? `មហាវិទ្យាល័យ/សាកលវិទ្យាល័យ ${formatNumberByLanguage(univCount, language)}`
                : language === 'zh-TW'
                ? `科技大學 ${formatNumberByLanguage(univCount, language)} 所`
                : `${formatNumberByLanguage(univCount, language)} Universities`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter & School Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm font-battambang">
            <Filter className="w-4 h-4 text-[#701014]" />
            <span>
              {language === 'km'
                ? 'Filter ជ្រើសរើសឈ្មោះសាលារៀន'
                : language === 'zh-TW'
                ? '篩選與選擇學校'
                : 'Filter & Select School'}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors self-start sm:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>
                {language === 'km'
                  ? 'កំណត់ឡើងវិញ'
                  : language === 'zh-TW'
                  ? '重設篩選'
                  : 'Reset Filters'}
              </span>
            </button>
          )}
        </div>

        {/* Category Segmented Controls & City Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 font-battambang ${
                selectedCategory === 'all'
                  ? 'bg-[#701014] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>
                {language === 'km'
                  ? 'ទាំងអស់'
                  : language === 'zh-TW'
                  ? '全部學校'
                  : 'All'}
              </span>
              <span className="opacity-80 tabular-nums">
                ({formatNumberByLanguage(allSchools.length, language)})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('high_school')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 font-battambang ${
                selectedCategory === 'high_school'
                  ? 'bg-[#701014] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>
                {language === 'km'
                  ? 'អនុវិទ្យាល័យ/វិទ្យាល័យ'
                  : language === 'zh-TW'
                  ? '高中職'
                  : 'High Schools'}
              </span>
              <span className="opacity-80 tabular-nums">
                ({formatNumberByLanguage(highSchoolCount, language)})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('university')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 font-battambang ${
                selectedCategory === 'university'
                  ? 'bg-[#701014] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {language === 'km'
                  ? 'មហាវិទ្យាល័យ/សាកលវិទ្យាល័យ'
                  : language === 'zh-TW'
                  ? '科技大學'
                  : 'Universities'}
              </span>
              <span className="opacity-80 tabular-nums">
                ({formatNumberByLanguage(univCount, language)})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="school-city-filter"
              className="text-xs font-medium text-slate-600 shrink-0 font-battambang"
            >
              {language === 'km'
                ? 'ទីក្រុង/តំបន់៖'
                : language === 'zh-TW'
                ? '縣市地區：'
                : 'City/Region:'}
            </label>
            <select
              id="school-city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#701014]/20 focus:border-[#701014] cursor-pointer font-battambang"
            >
              <option value="all">
                {language === 'km'
                  ? 'គ្រប់ទីក្រុងទាំងអស់'
                  : language === 'zh-TW'
                  ? '全臺灣縣市'
                  : 'All Cities'}
              </option>
              {availableCities.map((c) => (
                <option key={c.zh} value={c.zh}>
                  {language === 'km'
                    ? `${c.km} (${c.zh})`
                    : language === 'zh-TW'
                    ? c.zh
                    : `${c.en} (${c.zh})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & School Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'km'
                  ? 'ស្វែងរកឈ្មោះសាលា ឬ អាសយដ្ឋាន...'
                  : language === 'zh-TW'
                  ? '搜尋學校名稱或地址...'
                  : 'Search school name or address...'
              }
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#701014] focus:ring-2 focus:ring-[#701014]/20 font-battambang"
            />
          </div>

          <div className="md:col-span-7 relative">
            <School className="w-4 h-4 text-[#701014] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              aria-label={
                language === 'km'
                  ? 'ជ្រើសរើសឈ្មោះសាលារៀន'
                  : language === 'zh-TW'
                  ? '選擇學校'
                  : 'Select school'
              }
              value={currentSchool?.id || ''}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              disabled={filteredSchools.length === 0}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 hover:bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#701014] focus:ring-2 focus:ring-[#701014]/20 transition-colors cursor-pointer truncate font-battambang disabled:opacity-50"
            >
              {filteredSchools.length === 0 ? (
                <option value="">
                  {language === 'km'
                    ? 'រកមិនឃើញសាលារៀនទេ'
                    : language === 'zh-TW'
                    ? '找不到符合條件的學校'
                    : 'No matching schools found'}
                </option>
              ) : (
                filteredSchools.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    {formatNumberByLanguage(idx + 1, language)}. {s.name} —{' '}
                    {language === 'km'
                      ? s.nameKm
                      : language === 'en'
                      ? s.nameEn
                      : s.city}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Selected School Details: Strictly Official Website, Address, and Google Map */}
      {currentSchool ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {/* Selected School Identity Header */}
          <div className="p-6 sm:p-7 flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 text-[#701014] flex items-center justify-center font-bold text-xl shrink-0 border border-slate-200 overflow-hidden">
              {currentSchool.logoUrl && !logoFailed ? (
                <img
                  src={currentSchool.logoUrl}
                  alt={currentSchool.name}
                  className="w-full h-full object-contain p-1.5 bg-white"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <span>{currentSchool.name.replace(/\s+/g, '').slice(0, 2)}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 font-battambang">
                <span>
                  {language === 'km'
                    ? currentSchool.categoryLabelKm
                    : language === 'zh-TW'
                    ? currentSchool.categoryLabelZh
                    : currentSchool.categoryLabelEn}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {language === 'km'
                    ? `${currentSchool.cityKm} (${currentSchool.city})`
                    : language === 'zh-TW'
                    ? currentSchool.city
                    : `${currentSchool.cityEn} (${currentSchool.city})`}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentSchool.name}
              </h2>

              <p className="text-sm text-slate-600 font-battambang">
                {language === 'km'
                  ? currentSchool.nameKm
                  : currentSchool.nameEn}
              </p>
            </div>
          </div>

          {/* Item 1: Official Website */}
          <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#701014] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-medium text-slate-500 font-battambang">
                  Official Website
                  {language === 'km'
                    ? ' · គេហទំព័រផ្លូវការ'
                    : language === 'zh-TW'
                    ? ' · 官方網站'
                    : ''}
                </div>
                <a
                  href={currentSchool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm sm:text-base font-semibold text-[#701014] hover:underline break-all"
                >
                  {currentSchool.websiteUrl}
                </a>
              </div>
            </div>

            <a
              href={currentSchool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#701014] hover:bg-red-900 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 font-battambang"
            >
              <span>
                {language === 'km'
                  ? 'ចូលមើលគេហទំព័រផ្លូវការ'
                  : language === 'zh-TW'
                  ? '前往官方網站'
                  : 'Visit Official Website'}
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Item 2: Address */}
          <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-medium text-slate-500 font-battambang">
                  Address
                  {language === 'km'
                    ? ' · អាសយដ្ឋានសាលា'
                    : language === 'zh-TW'
                    ? ' · 學校地址'
                    : ''}
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-900 select-all">
                  {currentSchool.address}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyAddress(currentSchool.address)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shrink-0 font-battambang"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">
                    {language === 'km'
                      ? 'បានចម្លងទុក'
                      : language === 'zh-TW'
                      ? '已複製地址'
                      : 'Copied'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>
                    {language === 'km'
                      ? 'ចម្លងអាសយដ្ឋាន'
                      : language === 'zh-TW'
                      ? '複製地址'
                      : 'Copy Address'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Item 3: Google Map */}
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-medium text-slate-500 font-battambang">
                    Google Map
                    {language === 'km'
                      ? ' · ផែនទីទីតាំងសាលា'
                      : language === 'zh-TW'
                      ? ' · Google 地圖位置'
                      : ''}
                  </div>
                  <p className="text-sm text-slate-700 font-battambang">
                    {language === 'km'
                      ? 'មើលទីតាំងផ្ទាល់នៅលើផែនទី Google Maps'
                      : language === 'zh-TW'
                      ? '於 Google 地圖檢視學校精確位置'
                      : 'View school campus location on Google Maps'}
                  </p>
                </div>
              </div>

              <a
                href={currentSchool.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors shrink-0 font-battambang"
              >
                <span>
                  {language === 'km'
                    ? 'បើកក្នុង Google Maps'
                    : language === 'zh-TW'
                    ? '在 Google 地圖開啟'
                    : 'Open in Google Maps'}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-72 sm:h-80">
              <iframe
                key={currentSchool.id}
                title={`Google Map - ${currentSchool.name}`}
                src={embedMapUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700 font-battambang">
            {language === 'km'
              ? 'រកមិនឃើញសាលារៀនតាមការស្វែងរកនេះទេ'
              : language === 'zh-TW'
              ? '找不到符合篩選條件的學校'
              : 'No schools match your current filter'}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#701014] text-white text-xs font-semibold hover:bg-red-900 transition-colors font-battambang"
          >
            {language === 'km'
              ? 'បង្ហាញសាលាទាំងអស់ឡើងវិញ'
              : language === 'zh-TW'
              ? '顯示全部學校'
              : 'Show All Schools'}
          </button>
        </div>
      )}
    </div>
  );
};
