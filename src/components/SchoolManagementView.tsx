import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Plus, 
  Edit3, 
  Trash2, 
  UploadCloud, 
  Search, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Settings
} from 'lucide-react';
import { schoolMajorService } from '../services/schoolMajorService';
import { SchoolMajorEntry } from '../constants/studentOptions';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';
import { SchoolMajorManageModal, ManageActionType } from './SchoolMajorManageModal';
import { Language } from '../types';
import { useInstitution } from '../services/institutionService';
import { InstitutionSettingsModal } from './InstitutionSettingsModal';
import { dbStorage } from '../services/dbStorage';
import { compressSchoolLogo } from '../utils/imageUtils';

interface SchoolManagementViewProps {
  language: Language;
  onNavigateToDashboard?: () => void;
  webAppUrl?: string;
  onSyncSchools?: () => Promise<void>;
}

export const SchoolManagementView: React.FC<SchoolManagementViewProps> = ({
  language,
  onNavigateToDashboard,
  webAppUrl,
  onSyncSchools,
}) => {
  const institution = useInstitution();
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [schools, setSchools] = useState<SchoolMajorEntry[]>(() => schoolMajorService.getSchools());
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    actionType: ManageActionType;
    selectedSchool?: string;
    selectedMajor?: string;
  }>({
    isOpen: false,
    actionType: 'add_school',
  });

  // Subscribe to changes in schoolMajorService and IndexedDB logo hydration
  const [, setLogoVersion] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setSchools(schoolMajorService.getSchools());
      setLogoVersion(v => v + 1);
    };
    const unsub = schoolMajorService.subscribe(refresh);
    window.addEventListener('school_logos_updated', refresh);
    dbStorage.whenReady().then(refresh);
    return () => {
      unsub();
      window.removeEventListener('school_logos_updated', refresh);
    };
  }, []);

  // Handle direct file upload for a specific school logo
  const handleDirectLogoUpload = async (schoolName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSyncNotice(language === 'km' ? 'ទំហំរូបភាពមិនត្រូវលើសពី 10MB ឡើយ' : 'Image size cannot exceed 10MB');
      setTimeout(() => setSyncNotice(null), 3500);
      return;
    }

    try {
      const logoDataUrl = await compressSchoolLogo(file);
      await dbStorage.saveSchoolLogo(schoolName, logoDataUrl);

      const currentList = schoolMajorService.getSchools();
      const schoolObj = currentList.find(s => s.school === schoolName);
      if (schoolObj) {
        const trans = getSchoolTranslation(schoolName);
        schoolMajorService.updateSchool(
          schoolName,
          {
            ...schoolObj,
            logoUrl: logoDataUrl,
          },
          {
            km: trans?.km || schoolName,
            en: trans?.en || schoolName,
            location: trans?.locationKm || 'តៃវ៉ាន់',
            logoUrl: logoDataUrl,
          }
        );
        setSchools(schoolMajorService.getSchools());
        setSyncNotice(
          language === 'km'
            ? 'បាន Upload និងរក្សាទុក Logo សាលាដោយជោគជ័យ'
            : 'School logo uploaded & saved permanently'
        );
        setTimeout(() => setSyncNotice(null), 3500);
      }
    } catch (err: any) {
      setSyncNotice(
        language === 'km'
          ? 'មានបញ្ហាក្នុងការ Upload រូបភាព Logo សូមសាកល្បងម្ដងទៀត'
          : err?.message || 'Failed to process logo image'
      );
      setTimeout(() => setSyncNotice(null), 3500);
    }
  };

  // Remove logo from a specific school
  const handleRemoveLogo = async (schoolName: string) => {
    await dbStorage.deleteSchoolLogo(schoolName);
    const currentList = schoolMajorService.getSchools();
    const schoolObj = currentList.find(s => s.school === schoolName);
    if (schoolObj) {
      const trans = getSchoolTranslation(schoolName);
      schoolMajorService.updateSchool(
        schoolName,
        {
          ...schoolObj,
          logoUrl: undefined,
        },
        {
          km: trans?.km || schoolName,
          en: trans?.en || schoolName,
          location: trans?.locationKm || 'តៃវ៉ាន់',
          logoUrl: undefined,
        },
        { clearLogo: true }
      );
      setSchools(schoolMajorService.getSchools());
      setSyncNotice(language === 'km' ? 'បានលុប Profile Logo សាលា' : 'School logo removed');
      setTimeout(() => setSyncNotice(null), 3000);
    }
  };

  // Handle manual sync
  const handleManualSync = async () => {
    if (!onSyncSchools) return;
    setIsSyncing(true);
    try {
      await onSyncSchools();
      setSyncNotice(language === 'km' ? 'បាន Sync ទៅកាន់ Google Sheets រួចរាល់' : 'Synced to Google Sheets successfully');
      setTimeout(() => setSyncNotice(null), 3500);
    } catch (e: any) {
      setSyncNotice(`Sync Error: ${e.message || 'Failed'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter schools
  const filteredSchools = schools.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const trans = getSchoolTranslation(s.school);
    const zh = s.school.toLowerCase();
    const km = (trans?.km || '').toLowerCase();
    const en = (trans?.en || '').toLowerCase();
    const majorsStr = s.majors.join(' ').toLowerCase();
    return zh.includes(q) || km.includes(q) || en.includes(q) || majorsStr.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {language === 'km' 
                    ? 'គ្រប់គ្រងសាលារៀន & Profile Logo សាលា' 
                    : language === 'zh-TW' 
                    ? '學校與校徽管理系統 (School & Logo Management)' 
                    : 'School & Logo Profile Management'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {schools.length} {language === 'km' ? 'សាលារៀន' : 'Schools'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'km'
                  ? 'កែប្រែឈ្មោះសាលាទាំង ៣ ភាសា (ខ្មែរ / អង់គ្លេស / ចិន), Upload Profile Logo សាលា និងបន្ថែម/លុបជំនាញ'
                  : language === 'zh-TW'
                  ? '管理學校中文/高棉文/英文三語名稱、上傳校徽 Profile Logo 及科系專業'
                  : 'Manage 3-language school names (Khmer, English, Chinese), upload profile logos & majors'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {webAppUrl && onSyncSchools && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                title="Sync schools to Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
                <span>{language === 'km' ? 'Sync សាលាទៅ Google Sheets' : 'Sync to Sheets'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalState({ isOpen: true, actionType: 'add_school' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'km' ? 'បន្ថែមសាលារៀនថ្មី' : language === 'zh-TW' ? '新增學校' : 'Add New School'}</span>
            </button>
          </div>
        </div>

        {/* Sync / Success Notice Alert */}
        {syncNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncNotice}</span>
          </div>
        )}

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={
                language === 'km' 
                  ? 'ស្វែងរកឈ្មោះសាលាជា ខ្មែរ / ចិន / អង់គ្លេស ឬ ជំនាញ...' 
                  : language === 'zh-TW'
                  ? '搜尋學校中文、英文、高棉文名稱或科系...'
                  : 'Search by Khmer, English, Chinese school name or major...'
              }
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-hidden"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 self-start sm:self-auto flex items-center gap-2">
            <span>
              {language === 'km' 
                ? `បង្ហាញសាលារៀន ${filteredSchools.length} ក្នុងចំណោម ${schools.length}` 
                : `Showing ${filteredSchools.length} of ${schools.length} schools`}
            </span>
          </div>
        </div>
      </div>

      {/* Official Host Institution Card: Lising International Chinese School (សាលារៀនចិនលិស៊ីងអន្តរជាតិ) */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-indigo-700/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1.5 shadow-xl ring-4 ring-amber-400 overflow-hidden flex items-center justify-center">
              <img
                src={institution.logoUrl || '/logo.jpg'}
                alt={institution.nameKm}
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 shadow-xs">
              {institution.shortName || 'LSIS'}
            </span>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                <Sparkles className="w-3 h-3" />
                <span>{language === 'km' ? 'ស្ថាប័នមេ / Host Institution' : 'Host Institution'}</span>
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white font-battambang leading-tight truncate">
              {institution.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ'}
            </h2>
            <div className="text-xs sm:text-sm font-bold text-amber-300 font-kai">
              {institution.nameZh || '日興國際學校'}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-indigo-200 uppercase tracking-wide">
              {institution.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsInstitutionModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border border-amber-300 shadow-md shadow-amber-500/20 cursor-pointer whitespace-nowrap transition-all active:scale-95 shrink-0"
        >
          <Settings className="w-4 h-4 text-slate-950" />
          <span>{language === 'km' ? 'កែប្រែស្ថាប័ន & Upload Logo' : language === 'zh-TW' ? '管理校名與上傳校徽' : 'Edit Institution & Logo'}</span>
        </button>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchools.map((item, idx) => {
          const trans = getSchoolTranslation(item.school);
          const logo = item.logoUrl || trans?.logoUrl || dbStorage.getCachedSchoolLogo(item.school);

          return (
            <div
              key={item.school}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 space-y-3.5 flex flex-col justify-between"
            >
              {/* Card Top: Logo, 3-Language Names & Action Buttons */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  {/* School Profile Logo Area */}
                  <div className="flex items-center gap-3">
                    <div className="relative group w-14 h-14 rounded-2xl border-2 border-purple-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                      {logo ? (
                        <img
                          src={logo}
                          alt={item.school}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}

                      {/* Quick Hover Upload Overlay */}
                      <label 
                        className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity cursor-pointer rounded-xl"
                        title={language === 'km' ? 'ចុចដើម្បីប្តូរ Logo' : 'Click to change logo'}
                      >
                        <UploadCloud className="w-4 h-4 mb-0.5" />
                        <span>Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleDirectLogoUpload(item.school, e)}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    {/* School Order Index */}
                    <div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                        #{idx + 1}
                      </span>
                      {logo ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveLogo(item.school)}
                          className="block text-[10px] text-rose-500 hover:underline mt-1 cursor-pointer"
                        >
                          {language === 'km' ? 'លុប Logo' : 'Remove Logo'}
                        </button>
                      ) : (
                        <label className="block text-[10px] text-purple-600 hover:underline mt-1 cursor-pointer font-medium">
                          <span>+ Upload Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleDirectLogoUpload(item.school, e)}
                            className="sr-only"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setModalState({
                        isOpen: true,
                        actionType: 'edit_school',
                        selectedSchool: item.school,
                      })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 transition-colors cursor-pointer"
                      title={language === 'km' ? 'កែប្រែឈ្មោះសាលាទាំង ៣ ភាសា & Logo' : 'Edit 3-Language Names & Logo'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalState({
                        isOpen: true,
                        actionType: 'delete_school',
                        selectedSchool: item.school,
                      })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                      title={language === 'km' ? 'លុបសាលារៀន' : 'Delete School'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3-Language Names Section */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  {/* Chinese Name (Primary / Original) */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      🇹🇼 ឈ្មោះជាភាសាចិន (Chinese):
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm font-kai">
                      {item.school}
                    </h3>
                  </div>

                  {/* Khmer Name */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      🇰🇭 ឈ្មោះជាភាសាខ្មែរ (Khmer):
                    </span>
                    <p className="text-xs font-semibold text-purple-900 font-battambang">
                      {trans?.km || item.school}
                    </p>
                  </div>

                  {/* English Name */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      🇬🇧 ឈ្មោះជាភាសាអង់គ្លេស (English):
                    </span>
                    <p className="text-[11px] font-medium text-slate-600 truncate" title={trans?.en || item.school}>
                      {trans?.en || item.school}
                    </p>
                  </div>
                </div>

                {/* Age Requirement Badge */}
                <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-200/70 text-[11px] text-purple-900 space-y-0.5">
                  <div className="flex items-center gap-1 font-bold text-[10px] text-purple-800">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span>{language === 'km' ? 'លក្ខខណ្ឌអាយុ៖' : 'Age Requirement:'}</span>
                  </div>
                  <p className="text-[11px] leading-tight">
                    {language === 'km' ? item.ageRequirementKm : item.ageRequirementEn}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Majors List & Add Major Button */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'km' ? `ជំនាញសិក្សា (${item.majors.length})` : `Majors (${item.majors.length})`}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setModalState({
                      isOpen: true,
                      actionType: 'add_major',
                      selectedSchool: item.school,
                    })}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'km' ? 'បន្ថែមជំនាញ' : 'Add Major'}</span>
                  </button>
                </div>

                {/* Majors Chips */}
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {item.majors.map(m => {
                    const mTrans = getMajorTranslation(m);
                    return (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium border border-slate-200/80 transition-colors"
                        title={mTrans ? `🇰🇭 ${mTrans.km}\n🇬🇧 ${mTrans.en}` : m}
                      >
                        <span>{m}</span>
                        <button
                          type="button"
                          onClick={() => setModalState({
                            isOpen: true,
                            actionType: 'delete_major',
                            selectedSchool: item.school,
                            selectedMajor: m,
                          })}
                          className="hover:text-rose-600 ml-0.5 cursor-pointer"
                          title="Delete major"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    );
                  })}
                  {item.majors.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">
                      {language === 'km' ? 'មិនទាន់មានជំនាញនៅឡើយ' : 'No majors listed yet'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* School / Major Management Modal */}
      <SchoolMajorManageModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        actionType={modalState.actionType}
        selectedSchool={modalState.selectedSchool}
        selectedMajor={modalState.selectedMajor}
        language={language}
        onSuccess={() => {
          setSchools(schoolMajorService.getSchools());
          setSyncNotice(language === 'km' ? 'រក្សាទុកទិន្នន័យសាលាជោគជ័យ' : 'Saved successfully');
          setTimeout(() => setSyncNotice(null), 3000);
        }}
      />

      {/* Institution Profile & Logo Settings Modal */}
      <InstitutionSettingsModal
        isOpen={isInstitutionModalOpen}
        onClose={() => setIsInstitutionModalOpen(false)}
        language={language}
        onSuccess={(msg) => {
          setSyncNotice(msg);
          setTimeout(() => setSyncNotice(null), 3500);
        }}
      />
    </div>
  );
};
