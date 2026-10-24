import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Trash2, 
  RotateCcw, 
  Check, 
  Building2, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info
} from 'lucide-react';
import { Language } from '../types';
import { institutionService, useInstitution } from '../services/institutionService';
import { DEFAULT_INSTITUTION_SETTINGS, InstitutionSettings } from '../services/dbStorage';
import { compressSchoolLogo } from '../utils/imageUtils';

interface InstitutionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccess?: (msg: string) => void;
}

export const InstitutionSettingsModal: React.FC<InstitutionSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onSuccess
}) => {
  const currentInstitution = useInstitution();
  
  const [nameKm, setNameKm] = useState(currentInstitution.nameKm);
  const [nameZh, setNameZh] = useState(currentInstitution.nameZh);
  const [nameEn, setNameEn] = useState(currentInstitution.nameEn);
  const [shortName, setShortName] = useState(currentInstitution.shortName || 'LSIS');
  const [taglineKm, setTaglineKm] = useState(currentInstitution.taglineKm || 'គ្រឹះស្ថានអប់រំផ្លូវការ');
  const [taglineEn, setTaglineEn] = useState(currentInstitution.taglineEn || 'Official Educational Institution');
  const [logoUrl, setLogoUrl] = useState(currentInstitution.logoUrl || '/logo.jpg');
  
  const [isSaving, setIsSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setNameKm(currentInstitution.nameKm);
      setNameZh(currentInstitution.nameZh);
      setNameEn(currentInstitution.nameEn);
      setShortName(currentInstitution.shortName || 'LSIS');
      setTaglineKm(currentInstitution.taglineKm || 'គ្រឹះស្ថានអប់រំផ្លូវការ');
      setTaglineEn(currentInstitution.taglineEn || 'Official Educational Institution');
      setLogoUrl(currentInstitution.logoUrl || '/logo.jpg');
      setPreviewError(false);
      setFileError(null);
    }
  }, [isOpen, currentInstitution]);

  if (!isOpen) return null;

  // Handle Logo Upload
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // Check size (allow up to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError(language === 'km' ? 'ទំហំរូបភាពមិនត្រូវលើសពី 10MB ឡើយ' : 'Image size cannot exceed 10MB');
      return;
    }

    try {
      const compressed = await compressSchoolLogo(file);
      setLogoUrl(compressed);
      setPreviewError(false);
    } catch (err) {
      setFileError(language === 'km' ? 'មានបញ្ហាក្នុងការអានឯកសាររូបភាព' : 'Failed to read image file');
    }
  };

  // Reset Logo to default /logo.jpg
  const handleResetLogo = () => {
    setLogoUrl('/logo.jpg');
    setPreviewError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset all to factory default
  const handleResetAllDefaults = () => {
    setNameKm(DEFAULT_INSTITUTION_SETTINGS.nameKm);
    setNameZh(DEFAULT_INSTITUTION_SETTINGS.nameZh);
    setNameEn(DEFAULT_INSTITUTION_SETTINGS.nameEn);
    setShortName(DEFAULT_INSTITUTION_SETTINGS.shortName);
    setTaglineKm(DEFAULT_INSTITUTION_SETTINGS.taglineKm || 'គ្រឹះស្ថានអប់រំផ្លូវការ');
    setTaglineEn(DEFAULT_INSTITUTION_SETTINGS.taglineEn || 'Official Educational Institution');
    setLogoUrl(DEFAULT_INSTITUTION_SETTINGS.logoUrl || '/logo.jpg');
    setPreviewError(false);
    setFileError(null);
  };

  // Save changes
  const handleSave = async () => {
    if (!nameKm.trim()) {
      setFileError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ' : 'Please enter Khmer name');
      return;
    }

    setIsSaving(true);
    try {
      await institutionService.updateSettings({
        nameKm: nameKm.trim(),
        nameZh: nameZh.trim(),
        nameEn: nameEn.trim(),
        shortName: shortName.trim() || 'LSIS',
        taglineKm: taglineKm.trim(),
        taglineEn: taglineEn.trim(),
        logoUrl: logoUrl,
      });

      const successMsg = language === 'km'
        ? 'បានរក្សាទុកព័ត៌មាន និង Logo សាលារួចរាល់ដោយជោគជ័យ'
        : language === 'zh-TW'
        ? '學校資訊與校徽已成功儲存'
        : 'Institution profile & logo updated successfully';

      if (onSuccess) onSuccess(successMsg);
      onClose();
    } catch (err: any) {
      setFileError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Building2 className="w-5 h-5 text-indigo-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-battambang leading-tight">
                {language === 'km' 
                  ? 'កែសម្រួលព័ត៌មានស្ថាប័ន & Logo សាលា' 
                  : language === 'zh-TW' 
                  ? '學校基本設定與校徽管理' 
                  : 'Institution Profile & Logo Settings'}
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                {language === 'km'
                  ? 'កែប្រែ Logo និងឈ្មោះសាលាទាំង ៣ ភាសា (នឹងបង្ហាញស្វ័យប្រវត្តគ្រប់ទីកន្លែង)'
                  : 'Customize school emblem and 3-language names across the whole system'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {fileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Section 1: Logo Upload & Live Frame */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-900">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-sm">
                  {language === 'km' ? 'Logo សាលារៀន (School Emblem)' : 'School Official Logo'}
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {logoUrl && logoUrl !== '/logo.jpg' 
                  ? (language === 'km' ? 'Logo ផ្ទាល់ខ្លួន' : 'Custom Uploaded')
                  : (language === 'km' ? 'Logo លំនាំដើម' : 'Default Logo')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Emblem Frame */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-2 shadow-xl ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-100 overflow-hidden flex items-center justify-center">
                  {!previewError && logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="School Logo"
                      className="w-full h-full object-contain rounded-full"
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-full">
                      <Building2 className="w-8 h-8 text-slate-300" />
                      <span className="text-[9px] font-bold mt-1">No Image</span>
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md border border-amber-200">
                  {shortName || 'LSIS'}
                </span>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
                <p className="text-xs text-slate-600">
                  {language === 'km' 
                    ? 'Upload រូបភាព Logo សាលាថ្មី (PNG, JPG, SVG, WEBP)។ រូបភាពនឹងត្រូវរក្សាទុកជាអចិន្ត្រៃយ៍ក្នុងប្រព័ន្ធ IndexedDB ដោយមិនបាត់បង់ឡើយ។' 
                    : 'Upload high-resolution school emblem (PNG, JPG, SVG). Securely stored in IndexedDB so it will never disappear.'}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                    id="school-logo-input"
                  />
                  <label
                    htmlFor="school-logo-input"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{language === 'km' ? 'Upload Logo ថ្មី' : 'Upload New Logo'}</span>
                  </label>

                  {logoUrl && logoUrl !== '/logo.jpg' && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === 'km' ? 'ប្រើ Logo ដើមវិញ' : 'Reset to Default'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 3-Language Names */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>{language === 'km' ? 'ឈ្មោះសាលាទាំង ៣ ភាសាផ្លូវការ' : 'Official 3-Language School Names'}</span>
              </h4>
              <span className="text-xs text-slate-400">
                {language === 'km' ? 'កែប្រែបានគ្រប់ពេលវេលា' : 'Editable anytime'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* 1. Khmer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="text-base">🇰🇭</span>
                  <span>{language === 'km' ? 'ឈ្មោះជាភាសាខ្មែរ (Khmer Name)' : 'Khmer Name'}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameKm}
                  onChange={e => setNameKm(e.target.value)}
                  placeholder="ឧ. សាលារៀនចិនលិស៊ីងអន្តរជាតិ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-battambang font-bold text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                />
              </div>

              {/* 2. Traditional Chinese Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="text-base">🇹🇼</span>
                  <span>{language === 'km' ? 'ឈ្មោះជាភាសាចិន (Chinese Name - 繁體中文)' : 'Chinese Name (Traditional)'}</span>
                </label>
                <input
                  type="text"
                  value={nameZh}
                  onChange={e => setNameZh(e.target.value)}
                  placeholder="例：日興國際學校"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-kai font-bold text-sm text-amber-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white"
                />
              </div>

              {/* 3. English Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="text-base">🇬🇧</span>
                  <span>{language === 'km' ? 'ឈ្មោះជាភាសាអង់គ្លេស (English Name)' : 'English Name'}</span>
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. LISING INTERNATIONAL CHINESE SCHOOL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-sans uppercase font-bold text-xs text-indigo-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                />
              </div>

              {/* 4. Abbreviation & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'អក្សរកាត់ផ្លាកសញ្ញា (Abbreviation)' : 'Badge Code'}
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={e => setShortName(e.target.value.toUpperCase())}
                    placeholder="e.g. LSIS"
                    maxLength={8}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ពាក្យស្លោក/ប្រភេទ (Khmer Tagline)' : 'Institution Tagline'}
                  </label>
                  <input
                    type="text"
                    value={taglineKm}
                    onChange={e => setTaglineKm(e.target.value)}
                    placeholder="ឧ. គ្រឹះស្ថានអប់រំផ្លូវការ"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-battambang text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Live Real-Time Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'km' ? 'ការបង្ហាញសាកល្បងផ្ទាល់ (Live Preview)' : 'Live Preview Banner'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-700/50 flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
                  {!previewError && logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                  {shortName || 'LSIS'}
                </span>
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-sm font-black text-white font-battambang truncate leading-tight">
                  {nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ'}
                </div>
                <div className="text-xs font-bold text-amber-300 font-kai truncate">
                  {nameZh || '日興國際學校'}
                </div>
                <div className="text-[10px] font-bold text-indigo-200 font-sans tracking-wide truncate uppercase">
                  {nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetAllDefaults}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'កំណត់លំនាំដើមឡើងវិញ' : 'Reset Defaults'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-medium transition-colors text-xs sm:text-sm cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{language === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
