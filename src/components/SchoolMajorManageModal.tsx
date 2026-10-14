import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { schoolMajorService } from '../services/schoolMajorService';
import { SchoolMajorEntry } from '../constants/studentOptions';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';
import { Language } from '../types';

export type ManageActionType = 'add_school' | 'edit_school' | 'delete_school' | 'add_major' | 'edit_major' | 'delete_major';

interface SchoolMajorManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ManageActionType;
  selectedSchool?: string;
  selectedMajor?: string;
  language: Language;
  onSuccess: (result: { type: 'school' | 'major'; action: 'add' | 'edit' | 'delete'; value: string }) => void;
}

export const SchoolMajorManageModal: React.FC<SchoolMajorManageModalProps> = ({
  isOpen,
  onClose,
  actionType,
  selectedSchool = '',
  selectedMajor = '',
  language,
  onSuccess,
}) => {
  // School fields
  const [targetSchoolName, setTargetSchoolName] = useState('');
  const [schoolNameZh, setSchoolNameZh] = useState('');
  const [schoolNameKm, setSchoolNameKm] = useState('');
  const [schoolNameEn, setSchoolNameEn] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [ageLevel, setAgeLevel] = useState<'high_school' | 'university' | 'master'>('high_school');
  const [schoolMajorsText, setSchoolMajorsText] = useState('');

  // Major fields
  const [targetSchoolForMajor, setTargetSchoolForMajor] = useState('');
  const [majorNameZh, setMajorNameZh] = useState('');
  const [majorNameKm, setMajorNameKm] = useState('');
  const [majorNameEn, setMajorNameEn] = useState('');

  // Status & error
  const [error, setError] = useState('');
  const [allSchools, setAllSchools] = useState<SchoolMajorEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      const schools = schoolMajorService.getSchools();
      setAllSchools(schools);

      if (actionType === 'edit_school' || actionType === 'delete_school') {
        const schoolObj = schools.find(s => s.school === selectedSchool) || schools[0];
        if (schoolObj) {
          setTargetSchoolName(schoolObj.school);
          setSchoolNameZh(schoolObj.school);
          const trans = getSchoolTranslation(schoolObj.school);
          setSchoolNameKm(trans?.km || '');
          setSchoolNameEn(trans?.en || '');
          setSchoolLocation(trans?.locationKm || 'តៃវ៉ាន់');
          setSchoolMajorsText(schoolObj.majors.join(', '));
          
          if (schoolObj.ageRequirementEn.includes('25 & under')) {
            setAgeLevel('university');
          } else if (schoolObj.ageRequirementEn.includes('26 to 27')) {
            setAgeLevel('master');
          } else {
            setAgeLevel('high_school');
          }
        }
      } else if (actionType === 'add_school') {
        setTargetSchoolName('');
        setSchoolNameZh('');
        setSchoolNameKm('');
        setSchoolNameEn('');
        setSchoolLocation('តៃវ៉ាន់ (Taiwan)');
        setAgeLevel('high_school');
        setSchoolMajorsText('');
      } else if (actionType === 'add_major') {
        setTargetSchoolForMajor(selectedSchool || (schools[0]?.school || ''));
        setMajorNameZh('');
        setMajorNameKm('');
        setMajorNameEn('');
      } else if (actionType === 'edit_major' || actionType === 'delete_major') {
        setTargetSchoolForMajor(selectedSchool || (schools[0]?.school || ''));
        setMajorNameZh(selectedMajor);
        const trans = getMajorTranslation(selectedMajor);
        setMajorNameKm(trans?.km || '');
        setMajorNameEn(trans?.en || '');
      }
    }
  }, [isOpen, actionType, selectedSchool, selectedMajor]);

  if (!isOpen) return null;

  // Handle switching school in edit school mode
  const handleSelectSchoolToEdit = (name: string) => {
    const schoolObj = allSchools.find(s => s.school === name);
    if (schoolObj) {
      setTargetSchoolName(schoolObj.school);
      setSchoolNameZh(schoolObj.school);
      const trans = getSchoolTranslation(schoolObj.school);
      setSchoolNameKm(trans?.km || '');
      setSchoolNameEn(trans?.en || '');
      setSchoolLocation(trans?.locationKm || 'តៃវ៉ាន់');
      setSchoolMajorsText(schoolObj.majors.join(', '));
      if (schoolObj.ageRequirementEn.includes('25 & under')) {
        setAgeLevel('university');
      } else if (schoolObj.ageRequirementEn.includes('26 to 27')) {
        setAgeLevel('master');
      } else {
        setAgeLevel('high_school');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (actionType === 'add_school') {
      if (!schoolNameZh.trim()) {
        setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះសាលារៀន (ភាសាចិន/ដើម)' : 'Please enter school name (Chinese/Original)');
        return;
      }

      const majorsList = schoolMajorsText
        .split(/[,،、\n]+/)
        .map(m => m.trim())
        .filter(Boolean);

      let ageReqKm = 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
      let ageReqEn = 'Age 16 to 22 years old (For High School)';
      let shortKm = 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
      let shortEn = 'Age 16-22 (High School)';

      if (ageLevel === 'university') {
        ageReqKm = 'អាយុ ចាប់ពី ២៥ឆ្នាំ ចុះក្រោម កើតក្រោយថ្ងៃទី ០១ ខែ កក្កដា (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
        ageReqEn = 'Age 25 & under, born after July 1st (For College & University)';
        shortKm = 'អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ០១ កក្កដា)';
        shortEn = 'Age ≤25 (Born after July 1)';
      } else if (ageLevel === 'master') {
        ageReqKm = 'អាយុ ចាប់ពី ២៦ឆ្នាំ ដល់ ២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
        ageReqEn = 'Age 26 to 27 years old (For College & University)';
        shortKm = 'អាយុ ២៦-២៧ឆ្នាំ (មហាវិទ្យាល័យ/សកលវិទ្យាល័យ)';
        shortEn = 'Age 26-27 (College/University)';
      }

      const res = schoolMajorService.addSchool(
        {
          school: schoolNameZh.trim(),
          majors: majorsList,
          ageRequirementKm: ageReqKm,
          ageRequirementEn: ageReqEn,
          shortAgeKm: shortKm,
          shortAgeEn: shortEn,
        },
        {
          km: schoolNameKm.trim() || schoolNameZh.trim(),
          en: schoolNameEn.trim() || schoolNameZh.trim(),
          location: schoolLocation.trim() || 'តៃវ៉ាន់',
        }
      );

      if (res.success) {
        onSuccess({ type: 'school', action: 'add', value: schoolNameZh.trim() });
        onClose();
      } else {
        setError(res.message);
      }
    } else if (actionType === 'edit_school') {
      if (!schoolNameZh.trim()) {
        setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះសាលារៀន' : 'Please enter school name');
        return;
      }

      const majorsList = schoolMajorsText
        .split(/[,،、\n]+/)
        .map(m => m.trim())
        .filter(Boolean);

      let ageReqKm = 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
      let ageReqEn = 'Age 16 to 22 years old (For High School)';
      let shortKm = 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
      let shortEn = 'Age 16-22 (High School)';

      if (ageLevel === 'university') {
        ageReqKm = 'អាយុ ចាប់ពី ២៥ឆ្នាំ ចុះក្រោម កើតក្រោយថ្ងៃទី ០១ ខែ កក្កដា (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
        ageReqEn = 'Age 25 & under, born after July 1st (For College & University)';
        shortKm = 'អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ០១ កក្កដា)';
        shortEn = 'Age ≤25 (Born after July 1)';
      } else if (ageLevel === 'master') {
        ageReqKm = 'អាយុ ចាប់ពី ២៦ឆ្នាំ ដល់ ២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
        ageReqEn = 'Age 26 to 27 years old (For College & University)';
        shortKm = 'អាយុ ២៦-២៧ឆ្នាំ (មហាវិទ្យាល័យ/សកលវិទ្យាល័យ)';
        shortEn = 'Age 26-27 (College/University)';
      }

      const res = schoolMajorService.updateSchool(
        targetSchoolName,
        {
          school: schoolNameZh.trim(),
          majors: majorsList,
          ageRequirementKm: ageReqKm,
          ageRequirementEn: ageReqEn,
          shortAgeKm: shortKm,
          shortAgeEn: shortEn,
        },
        {
          km: schoolNameKm.trim() || schoolNameZh.trim(),
          en: schoolNameEn.trim() || schoolNameZh.trim(),
          location: schoolLocation.trim() || 'តៃវ៉ាន់',
        }
      );

      if (res.success) {
        onSuccess({ type: 'school', action: 'edit', value: schoolNameZh.trim() });
        onClose();
      } else {
        setError(res.message);
      }
    } else if (actionType === 'delete_school') {
      const res = schoolMajorService.deleteSchool(targetSchoolName);
      if (res.success) {
        onSuccess({ type: 'school', action: 'delete', value: targetSchoolName });
        onClose();
      } else {
        setError(res.message);
      }
    } else if (actionType === 'add_major') {
      if (!targetSchoolForMajor) {
        setError(language === 'km' ? 'សូមជ្រើសរើសសាលារៀនជាមុន' : 'Please select school first');
        return;
      }
      if (!majorNameZh.trim()) {
        setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះជំនាញ' : 'Please enter major name');
        return;
      }

      const res = schoolMajorService.addMajorToSchool(
        targetSchoolForMajor,
        majorNameZh.trim(),
        {
          km: majorNameKm.trim() || majorNameZh.trim(),
          en: majorNameEn.trim() || majorNameZh.trim(),
        }
      );

      if (res.success) {
        onSuccess({ type: 'major', action: 'add', value: majorNameZh.trim() });
        onClose();
      } else {
        setError(res.message);
      }
    } else if (actionType === 'edit_major') {
      if (!targetSchoolForMajor) {
        setError(language === 'km' ? 'សូមជ្រើសរើសសាលារៀន' : 'Please select school');
        return;
      }
      if (!majorNameZh.trim()) {
        setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះជំនាញ' : 'Please enter major name');
        return;
      }

      const res = schoolMajorService.updateMajorInSchool(
        targetSchoolForMajor,
        selectedMajor,
        majorNameZh.trim(),
        {
          km: majorNameKm.trim() || majorNameZh.trim(),
          en: majorNameEn.trim() || majorNameZh.trim(),
        }
      );

      if (res.success) {
        onSuccess({ type: 'major', action: 'edit', value: majorNameZh.trim() });
        onClose();
      } else {
        setError(res.message);
      }
    } else if (actionType === 'delete_major') {
      const res = schoolMajorService.deleteMajorFromSchool(targetSchoolForMajor, selectedMajor);
      if (res.success) {
        onSuccess({ type: 'major', action: 'delete', value: selectedMajor });
        onClose();
      } else {
        setError(res.message);
      }
    }
  };

  const isDelete = actionType.includes('delete');
  const isSchool = actionType.includes('school');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDelete ? 'bg-rose-100 text-rose-700' : isSchool ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isDelete ? <Trash2 className="w-4 h-4" /> : isSchool ? <Building2 className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {actionType === 'add_school' && (language === 'km' ? 'បន្ថែម ឈ្មោះសាលារៀនថ្មី (Add School)' : 'Add New School')}
                {actionType === 'edit_school' && (language === 'km' ? 'កែប្រែ ឈ្មោះសាលារៀន (Edit School)' : 'Edit School Name & Majors')}
                {actionType === 'delete_school' && (language === 'km' ? 'លុប ឈ្មោះសាលារៀន (Delete School)' : 'Delete School')}
                {actionType === 'add_major' && (language === 'km' ? 'បន្ថែម ជំនាញថ្មី (Add Major)' : 'Add New Major')}
                {actionType === 'edit_major' && (language === 'km' ? 'កែប្រែ ឈ្មោះជំនាញ (Edit Major)' : 'Edit Major Name')}
                {actionType === 'delete_major' && (language === 'km' ? 'លុប ជំនាញសិក្សា (Delete Major)' : 'Delete Major')}
              </h3>
              <p className="text-[11px] text-amber-700 font-medium">
                {language === 'km' ? '🔐 សិទ្ធិ Admin បានផ្ទៀងផ្ទាត់' : '🔐 Admin Privileges Active'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs sm:text-sm">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* DELETE CONFIRMATION */}
          {isDelete ? (
            <div className="py-2 space-y-3">
              <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs sm:text-sm space-y-2">
                <p className="font-semibold">
                  {language === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបទិន្នន័យនេះមែនទេ?' : 'Are you sure you want to delete this item?'}
                </p>
                <div className="p-2.5 rounded-lg bg-white border border-rose-200 font-bold text-slate-800">
                  {isSchool ? targetSchoolName : `${selectedMajor} (សាលា: ${targetSchoolForMajor})`}
                </div>
                <p className="text-slate-600 text-xs">
                  {language === 'km' 
                    ? '⚠️ ការលុបនេះនឹងដកទិន្នន័យនេះចេញពីបញ្ជីជ្រើសរើស។ អ្នកអាចកំណត់ឡើងវិញបានគ្រប់ពេល។'
                    : 'This item will be removed from future selection dropdowns.'}
                </p>
              </div>
            </div>
          ) : isSchool ? (
            /* ADD OR EDIT SCHOOL */
            <div className="space-y-3">
              {actionType === 'edit_school' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'ជ្រើសរើសសាលារៀនដែលចង់កែប្រែ:' : 'Select School to Edit:'}
                  </label>
                  <select
                    value={targetSchoolName}
                    onChange={e => handleSelectSchoolToEdit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                  >
                    {allSchools.map(s => (
                      <option key={s.school} value={s.school}>{s.school}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះសាលារៀន (ភាសាចិន / ឈ្មោះដើម) *:' : 'School Name (Chinese / Original) *:'}
                </label>
                <input
                  type="text"
                  value={schoolNameZh}
                  onChange={e => setSchoolNameZh(e.target.value)}
                  placeholder="e.g. 高雄市私立 中山高級工商職業學校"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? '🇰🇭 ឈ្មោះសាលាជាភាសាខ្មែរ:' : '🇰🇭 School Name in Khmer:'}
                  </label>
                  <input
                    type="text"
                    value={schoolNameKm}
                    onChange={e => setSchoolNameKm(e.target.value)}
                    placeholder="e.g. វិទ្យាល័យបច្ចេកទេស និងពាណិជ្ជកម្ម ជុងសាន"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? '🇬🇧 ឈ្មោះសាលាជាភាសាអង់គ្លេស:' : '🇬🇧 School Name in English:'}
                  </label>
                  <input
                    type="text"
                    value={schoolNameEn}
                    onChange={e => setSchoolNameEn(e.target.value)}
                    placeholder="e.g. Chung Shan Industrial & Commercial School"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? '🎯 លក្ខខណ្ឌកម្រិតសិក្សា & អាយុទទួលសិស្ស:' : '🎯 Age Criteria / Level:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`p-2.5 rounded-lg border cursor-pointer flex flex-col text-xs transition-all ${
                    ageLevel === 'high_school' ? 'border-purple-500 bg-purple-50/70 text-purple-900 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="age_level"
                      checked={ageLevel === 'high_school'}
                      onChange={() => setAgeLevel('high_school')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900">វិទ្យាល័យ (High School)</span>
                    <span className="text-[11px] text-slate-500">អាយុ ១៦ ដល់ ២២ ឆ្នាំ</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border cursor-pointer flex flex-col text-xs transition-all ${
                    ageLevel === 'university' ? 'border-purple-500 bg-purple-50/70 text-purple-900 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="age_level"
                      checked={ageLevel === 'university'}
                      onChange={() => setAgeLevel('university')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900">មហាវិទ្យាល័យ / សកល</span>
                    <span className="text-[11px] text-slate-500">អាយុ ≤ ២៥ ឆ្នាំ (ក្រោយ ០១ កក្កដា)</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border cursor-pointer flex flex-col text-xs transition-all ${
                    ageLevel === 'master' ? 'border-purple-500 bg-purple-50/70 text-purple-900 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="age_level"
                      checked={ageLevel === 'master'}
                      onChange={() => setAgeLevel('master')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900">កម្រិតខ្ពស់ (Senior)</span>
                    <span className="text-[11px] text-slate-500">អាយុ ២៦ ដល់ ២៧ ឆ្នាំ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'បញ្ជីជំនាញនៃសាលានេះ (ញែកដោយសញ្ញាក្បៀស , ) :' : 'Majors for this School (comma-separated):'}
                </label>
                <textarea
                  rows={3}
                  value={schoolMajorsText}
                  onChange={e => setSchoolMajorsText(e.target.value)}
                  placeholder="e.g. 資訊科, 電子科, 汽車科, 商業經營科, 烘焙食品科, 美容科"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono text-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === 'km' 
                    ? '💡 អ្នកអាចបន្ថែមឈ្មោះជំនាញជាអក្សរចិនជាច្រើន ដោយប្រើសញ្ញាក្បៀស (,) ដើម្បីខណ្ឌ។'
                    : 'Add majors separated by commas. Hover translations will auto-apply.'}
                </span>
              </div>
            </div>
          ) : (
            /* ADD OR EDIT MAJOR */
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'សាលារៀនដែលពាក់ព័ន្ធ (Related School) *:' : 'Target School *:'}
                </label>
                <select
                  value={targetSchoolForMajor}
                  onChange={e => setTargetSchoolForMajor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                  required
                >
                  {allSchools.map(s => (
                    <option key={s.school} value={s.school}>{s.school}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះជំនាញ (ភាសាចិន / ឈ្មោះដើម) *:' : 'Major Name (Chinese / Original) *:'}
                </label>
                <input
                  type="text"
                  value={majorNameZh}
                  onChange={e => setMajorNameZh(e.target.value)}
                  placeholder="e.g. 資訊工程系 ឬ 資訊科"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? '🇰🇭 ឈ្មោះជំនាញជាភាសាខ្មែរ:' : '🇰🇭 Major Name in Khmer:'}
                  </label>
                  <input
                    type="text"
                    value={majorNameKm}
                    onChange={e => setMajorNameKm(e.target.value)}
                    placeholder="e.g. វិស្វកម្មព័ត៌មានវិទ្យា"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? '🇬🇧 ឈ្មោះជំនាញជាភាសាអង់គ្លេស:' : '🇬🇧 Major Name in English:'}
                  </label>
                  <input
                    type="text"
                    value={majorNameEn}
                    onChange={e => setMajorNameEn(e.target.value)}
                    placeholder="e.g. Information Engineering"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs text-white shadow-xs transition-all flex items-center gap-1.5 ${
                isDelete 
                  ? 'bg-rose-600 hover:bg-rose-700' 
                  : isSchool 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isDelete ? (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'រក្សាទុក' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
