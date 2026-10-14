import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle, 
  Languages,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';
import { schoolMajorService } from '../services/schoolMajorService';
import { SchoolMajorEntry } from '../constants/studentOptions';
import { Language } from '../types';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';

export type SchoolMajorModalMode = 
  | 'add-school' 
  | 'edit-school' 
  | 'delete-school' 
  | 'add-major' 
  | 'edit-major' 
  | 'delete-major';

interface SchoolMajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: SchoolMajorModalMode;
  targetSchool?: string;
  targetMajor?: string;
  language: Language;
  onSuccess?: (affectedItem?: string) => void;
}

export const SchoolMajorModal: React.FC<SchoolMajorModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetSchool = '',
  targetMajor = '',
  language,
  onSuccess,
}) => {
  // Common states
  const [selectedSchool, setSelectedSchool] = useState(targetSchool);
  const [selectedMajor, setSelectedMajor] = useState(targetMajor);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // School Form states
  const [schoolName, setSchoolName] = useState('');
  const [schoolNameKm, setSchoolNameKm] = useState('');
  const [schoolNameEn, setSchoolNameEn] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('Taiwan');
  const [ageReqPreset, setAgeReqPreset] = useState<'16-22' | '25-under' | '26-27' | 'custom'>('16-22');
  const [customAgeKm, setCustomAgeKm] = useState('');
  const [customAgeEn, setCustomAgeEn] = useState('');
  const [schoolMajorsList, setSchoolMajorsList] = useState<string[]>([]);
  const [newMajorInput, setNewMajorInput] = useState('');

  // Major Form states
  const [majorName, setMajorName] = useState('');
  const [majorNameKm, setMajorNameKm] = useState('');
  const [majorNameEn, setMajorNameEn] = useState('');

  const allSchools = schoolMajorService.getSchools();
  const allSchoolNames = allSchools.map(s => s.school);

  // Populate data on open or target change
  useEffect(() => {
    if (!isOpen) return;
    setError('');

    setSelectedSchool(targetSchool || (allSchoolNames[0] || ''));
    setSelectedMajor(targetMajor || '');

    if (mode === 'add-school') {
      setSchoolName('');
      setSchoolNameKm('');
      setSchoolNameEn('');
      setSchoolLocation('Kaohsiung City, Taiwan');
      setAgeReqPreset('16-22');
      setSchoolMajorsList([]);
      setNewMajorInput('');
    } else if (mode === 'edit-school') {
      const current = targetSchool || allSchoolNames[0] || '';
      setSelectedSchool(current);
      const schoolObj = allSchools.find(s => s.school === current);
      const trans = getSchoolTranslation(current);
      if (schoolObj) {
        setSchoolName(schoolObj.school);
        setSchoolNameKm(trans?.km || '');
        setSchoolNameEn(trans?.en || '');
        setSchoolLocation(trans?.locationEn || 'Taiwan');
        setSchoolMajorsList([...schoolObj.majors]);

        if (schoolObj.ageRequirementEn.includes('16 to 22')) {
          setAgeReqPreset('16-22');
        } else if (schoolObj.ageRequirementEn.includes('25 & under')) {
          setAgeReqPreset('25-under');
        } else if (schoolObj.ageRequirementEn.includes('26 to 27')) {
          setAgeReqPreset('26-27');
        } else {
          setAgeReqPreset('custom');
          setCustomAgeKm(schoolObj.ageRequirementKm);
          setCustomAgeEn(schoolObj.ageRequirementEn);
        }
      }
    } else if (mode === 'add-major') {
      setSelectedSchool(targetSchool || allSchoolNames[0] || '');
      setMajorName('');
      setMajorNameKm('');
      setMajorNameEn('');
    } else if (mode === 'edit-major') {
      const sch = targetSchool || allSchoolNames[0] || '';
      setSelectedSchool(sch);
      const maj = targetMajor || (schoolMajorService.getMajorsForSchool(sch)[0] || '');
      setSelectedMajor(maj);
      setMajorName(maj);
      const trans = getMajorTranslation(maj);
      setMajorNameKm(trans?.km || '');
      setMajorNameEn(trans?.en || '');
    }
  }, [isOpen, mode, targetSchool, targetMajor]);

  // When changing selected school in edit-school mode
  const handleSelectSchoolToEdit = (sName: string) => {
    setSelectedSchool(sName);
    const schoolObj = allSchools.find(s => s.school === sName);
    const trans = getSchoolTranslation(sName);
    if (schoolObj) {
      setSchoolName(schoolObj.school);
      setSchoolNameKm(trans?.km || '');
      setSchoolNameEn(trans?.en || '');
      setSchoolLocation(trans?.locationEn || 'Taiwan');
      setSchoolMajorsList([...schoolObj.majors]);

      if (schoolObj.ageRequirementEn.includes('16 to 22')) {
        setAgeReqPreset('16-22');
      } else if (schoolObj.ageRequirementEn.includes('25 & under')) {
        setAgeReqPreset('25-under');
      } else if (schoolObj.ageRequirementEn.includes('26 to 27')) {
        setAgeReqPreset('26-27');
      } else {
        setAgeReqPreset('custom');
        setCustomAgeKm(schoolObj.ageRequirementKm);
        setCustomAgeEn(schoolObj.ageRequirementEn);
      }
    }
  };

  // When changing selected major in edit-major mode
  const handleSelectMajorToEdit = (mName: string) => {
    setSelectedMajor(mName);
    setMajorName(mName);
    const trans = getMajorTranslation(mName);
    setMajorNameKm(trans?.km || '');
    setMajorNameEn(trans?.en || '');
  };

  const handleAddMajorChip = () => {
    if (!newMajorInput.trim()) return;
    const trimmed = newMajorInput.trim();
    if (!schoolMajorsList.includes(trimmed)) {
      setSchoolMajorsList(prev => [...prev, trimmed]);
    }
    setNewMajorInput('');
  };

  const handleRemoveMajorChip = (idx: number) => {
    setSchoolMajorsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'add-school') {
        if (!schoolName.trim()) {
          setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះសាលារៀន' : 'School name is required');
          setIsSubmitting(false);
          return;
        }

        let ageKm = 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
        let ageEn = 'Age 16 to 22 years old (For High School)';
        let shortKm = 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
        let shortEn = 'Age 16-22 (High School)';

        if (ageReqPreset === '25-under') {
          ageKm = 'អាយុ ២៥ឆ្នាំ ចុះក្រោម (កើតក្រោយថ្ងៃទី ០១ ខែកក្កដា) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
          ageEn = 'Age 25 & under (Born after July 1st) (College & University)';
          shortKm = 'អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ០១/០៧) (មហាវិទ្យាល័យ)';
          shortEn = 'Age ≤25 (Born after July 1) (College)';
        } else if (ageReqPreset === '26-27') {
          ageKm = 'អាយុ ចាប់ពី ២៦ឆ្នាំ ដល់ ២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
          ageEn = 'Age 26 to 27 years old (For College & University)';
          shortKm = 'អាយុ ២៦-២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ)';
          shortEn = 'Age 26-27 (College & University)';
        } else if (ageReqPreset === 'custom') {
          ageKm = customAgeKm || ageKm;
          ageEn = customAgeEn || ageEn;
          shortKm = customAgeKm || shortKm;
          shortEn = customAgeEn || shortEn;
        }

        const newEntry: SchoolMajorEntry = {
          school: schoolName.trim(),
          majors: schoolMajorsList,
          ageRequirementKm: ageKm,
          ageRequirementEn: ageEn,
          shortAgeKm: shortKm,
          shortAgeEn: shortEn,
        };

        const res = schoolMajorService.addSchool(newEntry, {
          km: schoolNameKm.trim() || schoolName.trim(),
          en: schoolNameEn.trim() || schoolName.trim(),
          location: schoolLocation.trim(),
        });

        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }

        onSuccess?.(schoolName.trim());
        onClose();
      } else if (mode === 'edit-school') {
        if (!selectedSchool) {
          setError(language === 'km' ? 'សូមជ្រើសរើសសាលាដែលត្រូវកែប្រែ' : 'Please select a school to edit');
          setIsSubmitting(false);
          return;
        }
        if (!schoolName.trim()) {
          setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះសាលារៀន' : 'School name is required');
          setIsSubmitting(false);
          return;
        }

        let ageKm = 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
        let ageEn = 'Age 16 to 22 years old (For High School)';
        let shortKm = 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
        let shortEn = 'Age 16-22 (High School)';

        if (ageReqPreset === '25-under') {
          ageKm = 'អាយុ ២៥ឆ្នាំ ចុះក្រោម (កើតក្រោយថ្ងៃទី ០១ ខែកក្កដា) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
          ageEn = 'Age 25 & under (Born after July 1st) (College & University)';
          shortKm = 'អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ០១/០៧) (មហាវិទ្យាល័យ)';
          shortEn = 'Age ≤25 (Born after July 1) (College)';
        } else if (ageReqPreset === '26-27') {
          ageKm = 'អាយុ ចាប់ពី ២៦ឆ្នាំ ដល់ ២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
          ageEn = 'Age 26 to 27 years old (For College & University)';
          shortKm = 'អាយុ ២៦-២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ)';
          shortEn = 'Age 26-27 (College & University)';
        } else if (ageReqPreset === 'custom') {
          ageKm = customAgeKm || ageKm;
          ageEn = customAgeEn || ageEn;
          shortKm = customAgeKm || shortKm;
          shortEn = customAgeEn || shortEn;
        }

        const updatedEntry: SchoolMajorEntry = {
          school: schoolName.trim(),
          majors: schoolMajorsList,
          ageRequirementKm: ageKm,
          ageRequirementEn: ageEn,
          shortAgeKm: shortKm,
          shortAgeEn: shortEn,
        };

        const res = schoolMajorService.updateSchool(selectedSchool, updatedEntry, {
          km: schoolNameKm.trim(),
          en: schoolNameEn.trim(),
          location: schoolLocation.trim(),
        });

        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }

        onSuccess?.(schoolName.trim());
        onClose();
      } else if (mode === 'delete-school') {
        if (!selectedSchool) {
          setError(language === 'km' ? 'សូមជ្រើសរើសសាលាដែលត្រូវលុប' : 'Please select a school to delete');
          setIsSubmitting(false);
          return;
        }
        const res = schoolMajorService.deleteSchool(selectedSchool);
        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }
        onSuccess?.();
        onClose();
      } else if (mode === 'add-major') {
        if (!selectedSchool) {
          setError(language === 'km' ? 'សូមជ្រើសរើសសាលារៀន' : 'Please select a school');
          setIsSubmitting(false);
          return;
        }
        if (!majorName.trim()) {
          setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះជំនាញ' : 'Major name is required');
          setIsSubmitting(false);
          return;
        }
        const res = schoolMajorService.addMajorToSchool(selectedSchool, majorName.trim(), {
          km: majorNameKm.trim() || majorName.trim(),
          en: majorNameEn.trim() || majorName.trim(),
        });
        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }
        onSuccess?.(majorName.trim());
        onClose();
      } else if (mode === 'edit-major') {
        if (!selectedSchool) {
          setError(language === 'km' ? 'សូមជ្រើសរើសសាលារៀន' : 'Please select a school');
          setIsSubmitting(false);
          return;
        }
        if (!selectedMajor) {
          setError(language === 'km' ? 'សូមជ្រើសរើសជំនាញដែលត្រូវកែប្រែ' : 'Please select a major');
          setIsSubmitting(false);
          return;
        }
        if (!majorName.trim()) {
          setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះជំនាញថ្មី' : 'New major name is required');
          setIsSubmitting(false);
          return;
        }
        const res = schoolMajorService.updateMajorInSchool(selectedSchool, selectedMajor, majorName.trim(), {
          km: majorNameKm.trim(),
          en: majorNameEn.trim(),
        });
        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }
        onSuccess?.(majorName.trim());
        onClose();
      } else if (mode === 'delete-major') {
        if (!selectedSchool || !selectedMajor) {
          setError(language === 'km' ? 'សូមជ្រើសរើសសាលា និងជំនាញដែលត្រូវលុប' : 'Please select school and major to delete');
          setIsSubmitting(false);
          return;
        }
        const res = schoolMajorService.deleteMajorFromSchool(selectedSchool, selectedMajor);
        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Error processing request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Title and subtitle depending on mode
  const getHeaderInfo = () => {
    switch (mode) {
      case 'add-school':
        return {
          title: language === 'km' ? 'បន្ថែមសាលារៀនថ្មី (Add School)' : 'Add New Target School',
          sub: language === 'km' ? 'បញ្ចូលឈ្មោះសាលារៀន ការបកប្រែ លក្ខខណ្ឌអាយុ និងជំនាញ' : 'Enter school name, translations, age criteria, and majors',
          icon: <Plus className="w-5 h-5 text-purple-600" />,
          color: 'purple',
        };
      case 'edit-school':
        return {
          title: language === 'km' ? 'កែប្រែឈ្មោះសាលារៀន (Edit School)' : 'Edit Target School',
          sub: language === 'km' ? 'កែប្តូរឈ្មោះសាលា ការបកប្រែ លក្ខខណ្ឌអាយុ ឬបញ្ជីជំនាញ' : 'Modify school name, translations, age criteria, or majors',
          icon: <Edit3 className="w-5 h-5 text-blue-600" />,
          color: 'blue',
        };
      case 'delete-school':
        return {
          title: language === 'km' ? 'លុបសាលារៀន (Delete School)' : 'Delete Target School',
          sub: language === 'km' ? 'ការលុបសាលារៀននេះ នឹងដកសាលានេះចេញពីបញ្ជីជ្រើសរើស' : 'This will remove the school from the selection list',
          icon: <Trash2 className="w-5 h-5 text-rose-600" />,
          color: 'rose',
        };
      case 'add-major':
        return {
          title: language === 'km' ? 'បន្ថែមជំនាញថ្មី (Add Major)' : 'Add New Major',
          sub: language === 'km' ? 'បន្ថែមជំនាញថ្មីទៅក្នុងសាលារៀនដែលបានជ្រើសរើស' : 'Add a new major to the selected target school',
          icon: <Plus className="w-5 h-5 text-emerald-600" />,
          color: 'emerald',
        };
      case 'edit-major':
        return {
          title: language === 'km' ? 'កែប្រែឈ្មោះជំនាញ (Edit Major)' : 'Edit Major',
          sub: language === 'km' ? 'កែប្តូរឈ្មោះជំនាញ និងការបកប្រែជាភាសាខ្មែរ/អង់គ្លេស' : 'Change major name and its Khmer/English translations',
          icon: <Edit3 className="w-5 h-5 text-indigo-600" />,
          color: 'indigo',
        };
      case 'delete-major':
        return {
          title: language === 'km' ? 'លុបជំនាញ (Delete Major)' : 'Delete Major',
          sub: language === 'km' ? 'ដកជំនាញនេះចេញពីសាលារៀនដែលបានជ្រើសរើស' : 'Remove this major from the target school',
          icon: <Trash2 className="w-5 h-5 text-rose-600" />,
          color: 'rose',
        };
    }
  };

  const header = getHeaderInfo();
  const schoolSpecificMajors = schoolMajorService.getMajorsForSchool(selectedSchool);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              {header.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>{header.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Admin Only
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {header.sub}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE: ADD OR EDIT SCHOOL */}
          {(mode === 'add-school' || mode === 'edit-school') && (
            <div className="space-y-4">
              {mode === 'edit-school' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'ជ្រើសរើសសាលារៀនដែលត្រូវកែប្រែ:' : 'Select School to Edit:'}
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={e => handleSelectSchoolToEdit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    {allSchoolNames.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះសាលារៀន (ភាសាចិន / ឈ្មោះដើម) *' : 'School Name (Chinese / Original) *'}
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="e.g. 高雄市私立 中山高級工商職業學校"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="font-bold text-amber-600">🇰🇭</span>
                    <span>{language === 'km' ? 'ឈ្មោះបកប្រែជាភាសាខ្មែរ:' : 'Khmer Translation:'}</span>
                  </label>
                  <input
                    type="text"
                    value={schoolNameKm}
                    onChange={e => setSchoolNameKm(e.target.value)}
                    placeholder="e.g. វិទ្យាល័យបច្ចេកទេស និងពាណិជ្ជកម្ម ជុងសាន"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="font-bold text-sky-600">🇬🇧</span>
                    <span>{language === 'km' ? 'ឈ្មោះបកប្រែជាភាសាអង់គ្លេស:' : 'English Translation:'}</span>
                  </label>
                  <input
                    type="text"
                    value={schoolNameEn}
                    onChange={e => setSchoolNameEn(e.target.value)}
                    placeholder="e.g. Chung Shan Industrial & Commercial School"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'km' ? 'ទីតាំង / ក្រុង (Location):' : 'Location:'}</span>
                </label>
                <input
                  type="text"
                  value={schoolLocation}
                  onChange={e => setSchoolLocation(e.target.value)}
                  placeholder="e.g. Kaohsiung City, Taiwan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              {/* Age requirement preset */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'km' ? 'លក្ខខណ្ឌអាយុទទួលសិស្ស (Age Requirement):' : 'Age Requirement:'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAgeReqPreset('16-22')}
                    className={`p-2 rounded-lg border text-xs font-semibold text-left transition-all ${
                      ageReqPreset === '16-22' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>១៦-២២ឆ្នាំ</div>
                    <div className="text-[10px] text-slate-400 font-normal">វិទ្យាល័យ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgeReqPreset('25-under')}
                    className={`p-2 rounded-lg border text-xs font-semibold text-left transition-all ${
                      ageReqPreset === '25-under' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>≤២៥ឆ្នាំ</div>
                    <div className="text-[10px] text-slate-400 font-normal">មហាវិទ្យាល័យ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgeReqPreset('26-27')}
                    className={`p-2 rounded-lg border text-xs font-semibold text-left transition-all ${
                      ageReqPreset === '26-27' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>២៦-២៧ឆ្នាំ</div>
                    <div className="text-[10px] text-slate-400 font-normal">មហាវិទ្យាល័យ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgeReqPreset('custom')}
                    className={`p-2 rounded-lg border text-xs font-semibold text-left transition-all ${
                      ageReqPreset === 'custom' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>កំណត់ដោយខ្លួនឯង</div>
                    <div className="text-[10px] text-slate-400 font-normal">Custom</div>
                  </button>
                </div>

                {ageReqPreset === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      value={customAgeKm}
                      onChange={e => setCustomAgeKm(e.target.value)}
                      placeholder="e.g. អាយុ ចាប់ពី ១៨ ដល់ ២៤ឆ្នាំ"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      value={customAgeEn}
                      onChange={e => setCustomAgeEn(e.target.value)}
                      placeholder="e.g. Age 18 to 24 years old"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Majors list for this school */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'km' ? 'បញ្ជីជំនាញនៃសាលានេះ:' : 'Majors in this School:'} ({schoolMajorsList.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'km' ? 'អាចបន្ថែមជំនាញច្រើនបាន' : 'Multiple majors allowed'}
                  </span>
                </label>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 min-h-[50px] max-h-36 overflow-y-auto">
                  {schoolMajorsList.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      {language === 'km' ? 'មិនទាន់មានជំនាញនៅឡើយ សូមបញ្ចូលខាងក្រោម...' : 'No majors yet, add below...'}
                    </span>
                  ) : (
                    schoolMajorsList.map((m, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-medium shadow-2xs group"
                      >
                        <span>{m}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMajorChip(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add new major chip input */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newMajorInput}
                    onChange={e => setNewMajorInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMajorChip();
                      }
                    }}
                    placeholder={language === 'km' ? 'វាយឈ្មោះជំនាញ រួចចុច Add...' : 'Type major name and press Add...'}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddMajorChip}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'បញ្ចូល' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE: DELETE SCHOOL */}
          {mode === 'delete-school' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>{language === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបសាលារៀននេះមែនទេ?' : 'Confirm delete school?'}</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {language === 'km'
                    ? 'សាលារៀននេះ និងរាល់ជំនាញដែលពាក់ព័ន្ធទាំងអស់ នឹងត្រូវដកចេញពីប្រព័ន្ធភ្លាមៗ។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។'
                    : 'This school and all of its associated majors will be removed from the system. This action cannot be undone.'}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ជ្រើសរើសសាលាដែលត្រូវលុប:' : 'Select School to Delete:'}
                </label>
                <select
                  value={selectedSchool}
                  onChange={e => setSelectedSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                >
                  {allSchoolNames.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {selectedSchool && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">{selectedSchool}</div>
                  <div className="text-slate-500">
                    {language === 'km' ? `មាន ${schoolSpecificMajors.length} ជំនាញក្នុងសាលានេះ` : `${schoolSpecificMajors.length} majors in this school`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE: ADD OR EDIT MAJOR */}
          {(mode === 'add-major' || mode === 'edit-major') && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'សាលារៀនដែលពាក់ព័ន្ធ (Target School):' : 'Target School:'}
                </label>
                <select
                  value={selectedSchool}
                  onChange={e => {
                    setSelectedSchool(e.target.value);
                    if (mode === 'edit-major') {
                      const majs = schoolMajorService.getMajorsForSchool(e.target.value);
                      if (majs.length > 0) {
                        handleSelectMajorToEdit(majs[0]);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-xs sm:text-sm"
                >
                  {allSchoolNames.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {mode === 'edit-major' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'ជ្រើសរើសជំនាញដែលត្រូវកែប្រែ:' : 'Select Major to Edit:'}
                  </label>
                  <select
                    value={selectedMajor}
                    onChange={e => handleSelectMajorToEdit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-xs sm:text-sm"
                  >
                    {schoolSpecificMajors.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះជំនាញ (ភាសាចិន / ឈ្មោះដើម) *:' : 'Major Name (Chinese / Original) *:'}
                </label>
                <input
                  type="text"
                  value={majorName}
                  onChange={e => setMajorName(e.target.value)}
                  placeholder="e.g. 資訊科 / 烘焙食品科"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="font-bold text-amber-600">🇰🇭</span>
                    <span>{language === 'km' ? 'ឈ្មោះបកប្រែជាភាសាខ្មែរ:' : 'Khmer Translation:'}</span>
                  </label>
                  <input
                    type="text"
                    value={majorNameKm}
                    onChange={e => setMajorNameKm(e.target.value)}
                    placeholder="e.g. ព័ត៌មានវិទ្យា (IT) / ធ្វើនំខេក និងនំប៉័ង"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="font-bold text-sky-600">🇬🇧</span>
                    <span>{language === 'km' ? 'ឈ្មោះបកប្រែជាភាសាអង់គ្លេស:' : 'English Translation:'}</span>
                  </label>
                  <input
                    type="text"
                    value={majorNameEn}
                    onChange={e => setMajorNameEn(e.target.value)}
                    placeholder="e.g. Information Technology / Bakery & Pastry"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE: DELETE MAJOR */}
          {mode === 'delete-major' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>{language === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបជំនាញនេះមែនទេ?' : 'Confirm delete major?'}</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {language === 'km'
                    ? 'ជំនាញនេះនឹងត្រូវដកចេញពីបញ្ជីនៃសាលារៀននេះភ្លាមៗ។'
                    : 'This major will be removed from the selected school immediately.'}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'សាលារៀនដែលពាក់ព័ន្ធ:' : 'Target School:'}
                </label>
                <select
                  value={selectedSchool}
                  onChange={e => {
                    setSelectedSchool(e.target.value);
                    const majs = schoolMajorService.getMajorsForSchool(e.target.value);
                    if (majs.length > 0) setSelectedMajor(majs[0]);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-xs sm:text-sm"
                >
                  {allSchoolNames.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ជ្រើសរើសជំនាញដែលត្រូវលុប:' : 'Select Major to Delete:'}
                </label>
                <select
                  value={selectedMajor}
                  onChange={e => setSelectedMajor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-xs sm:text-sm"
                >
                  {schoolSpecificMajors.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 ${
                mode.startsWith('delete') 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isSubmitting ? (
                <span>{language === 'km' ? 'កំពុងដំណើរការ...' : 'Saving...'}</span>
              ) : mode.startsWith('delete') ? (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បាទ/ចាស, លុប' : 'Yes, Delete'}</span>
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
