import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  BookOpen, 
  Calendar, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  User,
  Users,
  GraduationCap,
  FileText,
  MapPin,
  CreditCard,
  Building2,
  ExternalLink,
  Eye,
  Download,
  FileCheck,
  AlertCircle,
  Mail
} from 'lucide-react';
import { Student, Language, UploadedDocument } from '../types';
import { translations } from '../translations';
import { getSchoolAgeRequirement } from '../constants/studentOptions';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { 
  getDocPages, 
  areAllRequiredDocumentsUploaded, 
  countUploadedCategories, 
  formatDocFileSize 
} from '../utils/documentUtils';
import { calculateAge, formatAge, formatDobOnly } from '../utils/ageUtils';
import { TranslationTooltip } from './TranslationTooltip';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';
import { downloadDocumentWithStandardName, downloadAllDocumentsForStudent } from '../utils/documentDownloadUtils';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  language: Language;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  language,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ 
    doc: UploadedDocument; 
    title: string;
    pageIndex?: number;
    allPages?: UploadedDocument[];
  } | null>(null);

  if (!isOpen || !student) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayName = student.nameKhmer || student.name || student.nameLatin || '-';

  const formattedDate = student.createdAt 
    ? new Date(student.createdAt).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '-';

  const docs = student.documents || {};
  const docList = [
    { key: 'idCard' as const, label: t.docIdCard, doc: docs.idCard, required: true },
    { key: 'birthCert' as const, label: t.docBirthCert, doc: docs.birthCert, required: true },
    { key: 'familyBook' as const, label: t.docFamilyBook, doc: docs.familyBook, required: true },
    { key: 'residenceBook' as const, label: t.docResidenceBook, doc: docs.residenceBook, required: true },
    { key: 'academicCert' as const, label: t.docAcademicCert, doc: docs.academicCert, required: true },
    { key: 'traineeBook' as const, label: t.docTraineeBook || (language === 'km' ? 'សៀវភៅសិក្ខាគារិក' : 'Trainee Record Book'), doc: docs.traineeBook, required: true },
    { key: 'passport' as const, label: t.docPassport, doc: docs.passport, required: false },
  ];

  const docValidation = areAllRequiredDocumentsUploaded(docs);
  const totalUploadedCategories = countUploadedCategories(docs);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Profile Card Header */}
          <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-900 p-5 sm:p-6 text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-white/30 shrink-0 ${
                student.gender === 'Female' 
                  ? 'bg-rose-100 text-rose-700' 
                  : student.gender === 'Male'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {displayName.charAt(0)}
              </div>

              <div className="space-y-1 min-w-0 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {student.nameKhmer || student.name || '-'}
                  </h3>
                  {student.nameLatin && (
                    <span className="text-sm font-medium text-indigo-200">
                      ({student.nameLatin})
                    </span>
                  )}
                  {student.nameChinese && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-white/15 text-indigo-100">
                      {student.nameChinese}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-mono px-2.5 py-0.5 rounded-md bg-white/20 font-bold backdrop-blur">
                    {t.orderNumber}: #{student.studentId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-medium bg-white/20">
                    {student.gender === 'Male' ? t.male : student.gender === 'Female' ? t.female : t.other}
                  </span>
                  {(student.age || calculateAge(student.dob)) && (
                    <span className="px-2 py-0.5 rounded-full font-medium bg-white/20">
                      {formatAge(student.age || calculateAge(student.dob), language)}
                    </span>
                  )}
                  {student.major && (
                    <TranslationTooltip text={student.major} type="major" currentLanguage={language}>
                      <span className="px-2 py-0.5 rounded-md font-medium bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/50 transition-colors">
                        {student.major}
                      </span>
                    </TranslationTooltip>
                  )}
                  <span className={`px-2 py-0.5 rounded-md font-medium border ${
                    docValidation.isValid
                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30'
                      : 'bg-amber-500/30 text-amber-200 border-amber-400/30'
                  }`}>
                    {docValidation.completedCount}/{docValidation.totalRequired}* {language === 'km' ? 'ឯកសារចាំបាច់' : language === 'zh-TW' ? '必要附件' : 'required'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Detailed Info */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
            
            {/* Section 1: Personal Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>{t.personalInfo}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.orderNumber}</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">#{student.studentId}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.nameKhmer}</span>
                  <span className="font-bold text-slate-800">{student.nameKhmer || '-'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.nameLatin}</span>
                  <span className="font-semibold text-slate-800">{student.nameLatin || '-'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.nameChinese}</span>
                  <span className="font-semibold text-slate-800">{student.nameChinese || '-'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.gender}</span>
                  <span className="font-medium text-slate-800">
                    {student.gender === 'Male' ? t.male : student.gender === 'Female' ? t.female : t.other}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.dob}</span>
                  <span className="font-semibold text-slate-800">{formatDobOnly(student.dob) || '-'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.age}</span>
                  <span className="font-semibold text-indigo-700">
                    {formatAge(student.age || calculateAge(student.dob), language) || '-'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.placeOfBirth}</span>
                  {student.placeOfBirth ? (
                    <TranslationTooltip text={student.placeOfBirth} type="pob" currentLanguage={language}>
                      <span className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors cursor-help">
                        {student.placeOfBirth}
                      </span>
                    </TranslationTooltip>
                  ) : (
                    <span className="font-medium text-slate-400">-</span>
                  )}
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.referrerName}</span>
                  <span className="font-medium text-slate-800">{student.referrerName || '-'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Identity Documents & Student Contact */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>{t.identityInfo}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">{t.idCardNumber}</span>
                    <span className="font-mono font-bold text-slate-800">{student.idCardNumber || '-'}</span>
                  </div>
                  {student.idCardNumber && (
                    <button
                      onClick={() => handleCopy(student.idCardNumber || '', 'idCard')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Copy ID"
                    >
                      {copied === 'idCard' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">{t.passportNumber}</span>
                    <span className="font-mono font-bold text-slate-800">{student.passportNumber || '-'}</span>
                  </div>
                  {student.passportNumber && (
                    <button
                      onClick={() => handleCopy(student.passportNumber || '', 'passport')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Copy Passport"
                    >
                      {copied === 'passport' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">{t.phone}</span>
                    <a
                      href={`tel:${student.phone.replace(/\s+/g, '')}`}
                      className="font-mono font-bold text-indigo-600 hover:underline"
                    >
                      {student.phone}
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopy(student.phone, 'phone')}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                    title={t.copyPhone}
                  >
                    {copied === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">{t.email}</span>
                    {student.email ? (
                      <a
                        href={`mailto:${student.email}`}
                        className="font-semibold text-indigo-600 hover:underline truncate block max-w-[140px]"
                        title={student.email}
                      >
                        {student.email}
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-800">-</span>
                    )}
                  </div>
                  {student.email && (
                    <button
                      onClick={() => handleCopy(student.email || '', 'email')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Copy Email"
                    >
                      {copied === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="sm:col-span-2 lg:col-span-4 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.currentAddress}</span>
                  <span className="font-medium text-slate-800">{student.currentAddress || '-'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Father & Mother Information */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>{language === 'km' ? 'ព័ត៌មានឪពុក និង ម្ដាយ' : language === 'zh-TW' ? '父母親資料' : 'Parents Information'}</span>
              </div>

              {/* Father Box */}
              <div className="bg-white rounded-xl border border-indigo-100 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>{t.fatherInfo}</span>
                  </div>
                  {student.fatherPhone && (
                    <a
                      href={`tel:${student.fatherPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t.callFather}</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.fatherNameEnglish}</span>
                    <span className="font-semibold text-slate-800">{student.fatherNameEnglish || '-'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.fatherNameChinese}</span>
                    <span className="font-semibold text-slate-800">{student.fatherNameChinese || '-'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.fatherDob}</span>
                    <span className="font-semibold text-slate-800">{formatDobOnly(student.fatherDob) || '-'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.fatherAge || t.age}</span>
                    <span className="font-semibold text-indigo-700">
                      {formatAge(student.fatherAge || calculateAge(student.fatherDob), language) || '-'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">{t.fatherPhone}</span>
                      <span className="font-mono font-bold text-slate-800">{student.fatherPhone || '-'}</span>
                    </div>
                    {student.fatherPhone && (
                      <button
                        onClick={() => handleCopy(student.fatherPhone || '', 'fPhone')}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                        title={t.copyPhone}
                      >
                        {copied === 'fPhone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mother Box */}
              <div className="bg-white rounded-xl border border-pink-100 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    <span>{t.motherInfo}</span>
                  </div>
                  {student.motherPhone && (
                    <a
                      href={`tel:${student.motherPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t.callMother}</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.motherNameEnglish}</span>
                    <span className="font-semibold text-slate-800">{student.motherNameEnglish || '-'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.motherNameChinese}</span>
                    <span className="font-semibold text-slate-800">{student.motherNameChinese || '-'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.motherDob}</span>
                    <span className="font-semibold text-slate-800">{formatDobOnly(student.motherDob) || '-'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">{t.motherAge || t.age}</span>
                    <span className="font-semibold text-pink-700">
                      {formatAge(student.motherAge || calculateAge(student.motherDob), language) || '-'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">{t.motherPhone}</span>
                      <span className="font-mono font-bold text-slate-800">{student.motherPhone || '-'}</span>
                    </div>
                    {student.motherPhone && (
                      <button
                        onClick={() => handleCopy(student.motherPhone || '', 'mPhone')}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                        title={t.copyPhone}
                      >
                        {copied === 'mPhone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Academic Information */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>{t.academicInfo}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.previousSchoolKhmer}</span>
                  <span className="font-medium text-slate-800">{student.previousSchoolKhmer || '-'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">{t.previousSchoolAddressKhmer}</span>
                  <span className="font-medium text-slate-800">{student.previousSchoolAddressKhmer || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs block">{t.targetSchool}</span>
                  </div>
                  {student.targetSchool ? (
                    <div>
                      <TranslationTooltip text={student.targetSchool} type="school" currentLanguage={language} showBadge>
                        <span className="font-bold text-indigo-900 text-sm hover:text-indigo-600 underline decoration-dotted transition-colors">
                          {student.targetSchool}
                        </span>
                      </TranslationTooltip>

                      {/* Immediate bilingual preview */}
                      {(() => {
                        const sTrans = getSchoolTranslation(student.targetSchool);
                        if (!sTrans) return null;
                        return (
                          <div className="mt-1.5 space-y-0.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="text-slate-700 font-battambang">
                              <span className="font-bold text-amber-600 mr-1">🇰🇭</span>
                              <span>{sTrans.km}</span>
                            </div>
                            <div className="text-slate-600 font-times text-[11px]">
                              <span className="font-bold text-sky-600 mr-1">🇬🇧</span>
                              <span>{sTrans.en}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="font-bold text-slate-400 block">-</span>
                  )}
                  {student.targetSchool && getSchoolAgeRequirement(student.targetSchool, language) && (
                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                      🎯 {getSchoolAgeRequirement(student.targetSchool, language)}
                    </span>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs block">{t.major}</span>
                  </div>
                  {student.major ? (
                    <div>
                      <TranslationTooltip text={student.major} type="major" currentLanguage={language} showBadge>
                        <span className="font-bold text-slate-900 text-sm hover:text-emerald-700 underline decoration-dotted transition-colors">
                          {student.major}
                        </span>
                      </TranslationTooltip>

                      {/* Immediate bilingual preview */}
                      {(() => {
                        const mTrans = getMajorTranslation(student.major);
                        if (!mTrans) return null;
                        return (
                          <div className="mt-1.5 space-y-0.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="text-slate-700 font-battambang">
                              <span className="font-bold text-amber-600 mr-1">🇰🇭</span>
                              <span>{mTrans.km}</span>
                            </div>
                            <div className="text-slate-600 font-times text-[11px]">
                              <span className="font-bold text-sky-600 mr-1">🇬🇧</span>
                              <span>{mTrans.en}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="font-bold text-slate-400 block">-</span>
                  )}
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-0.5">
                    {language === 'km' ? 'កាលបរិច្ឆេទចុះឈ្មោះ' : 'Registration Date'}
                  </span>
                  <span className="font-medium text-slate-700">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Section 5: Uploaded Documents Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <FileCheck className="w-4 h-4" />
                  <span>{t.documentsSection}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    docValidation.isValid 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {docValidation.completedCount} / {docValidation.totalRequired} {language === 'km' ? 'ឯកសារចាំបាច់ (*)' : 'required (*)'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ({totalUploadedCategories} / 7 {language === 'km' ? 'សរុប' : 'total'})
                  </span>

                  {totalUploadedCategories > 0 && (
                    <button
                      type="button"
                      onClick={() => downloadAllDocumentsForStudent(student)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer ml-1"
                      title={language === 'km' ? 'ទាញយកឯកសារទាំងអស់របស់សិស្សនេះ' : 'Download all student documents'}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{language === 'km' ? 'ទាញយកទាំងអស់' : 'Download All'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {docList.map(({ key, label, doc, required }) => {
                  const pages = getDocPages(doc);
                  const hasPages = pages.length > 0;

                  return (
                    <div 
                      key={key}
                      className={`p-3 rounded-xl border transition-all ${
                        hasPages 
                          ? 'bg-white border-emerald-200 shadow-2xs' 
                          : required 
                          ? 'bg-rose-50/30 border-rose-200/80' 
                          : 'bg-white/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-800 text-xs truncate block" title={label}>
                            {label}
                            {required && <span className="text-rose-500 font-bold ml-1">*</span>}
                          </span>
                        </div>
                        {hasPages ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                            ✓ {pages.length} {language === 'km' ? 'ទំព័រ' : (pages.length > 1 ? 'pages' : 'page')}
                          </span>
                        ) : required ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 shrink-0">
                            {language === 'km' ? 'ខ្វះ *' : 'Missing *'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400 shrink-0">
                            {language === 'km' ? 'គ្មាន' : 'None'}
                          </span>
                        )}
                      </div>

                      {hasPages ? (
                        <div className="space-y-2">
                          {/* List of uploaded pages (1 to 5) */}
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                            {pages.map((page, idx) => {
                              const isImage = page.type?.startsWith('image/') || page.dataUrl?.startsWith('data:image/');
                              return (
                                <div 
                                  key={idx} 
                                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/40 transition-colors"
                                >
                                  {isImage && page.dataUrl ? (
                                    <img 
                                      src={page.dataUrl} 
                                      alt={`${label} p.${idx + 1}`} 
                                      className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0 bg-white cursor-pointer"
                                      onClick={() => setPreviewDoc({ doc: page, title: label, pageIndex: idx, allPages: pages })}
                                    />
                                  ) : (
                                    <div 
                                      className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0 cursor-pointer"
                                      onClick={() => setPreviewDoc({ doc: page, title: label, pageIndex: idx, allPages: pages })}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-semibold text-slate-800">
                                        {language === 'km' ? `ទំព័រ ${idx + 1}` : `Page ${idx + 1}`}
                                      </span>
                                      <span className="text-[9px] text-slate-400">
                                        {formatDocFileSize(page.size)}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate" title={page.name}>
                                      {page.name}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {page.dataUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewDoc({ doc: page, title: label, pageIndex: idx, allPages: pages })}
                                        className="p-1 rounded text-indigo-600 hover:bg-indigo-100 transition-colors"
                                        title={t.viewFile}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {page.dataUrl && (
                                      <button
                                        type="button"
                                        onClick={() => downloadDocumentWithStandardName(page, student, key, idx)}
                                        className="p-1 rounded text-slate-600 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
                                        title={language === 'km' ? `ទាញយក (${page.name})` : `Download (${page.name})`}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Full-Gallery View Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ doc: pages[0], title: label, pageIndex: 0, allPages: pages })}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>
                              {language === 'km' ? `មើលទំព័រទាំងអស់ (${pages.length})` : `View All Pages (${pages.length})`}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic py-3 text-center">
                          {language === 'km' ? 'មិនទាន់បាន Upload នៅឡើយ' : 'No document uploaded'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Actions Bottom Bar */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50 shrink-0">
            <button
              onClick={() => {
                onClose();
                onDelete(student);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.delete}</span>
            </button>

            <div className="flex items-center gap-2">
              {totalUploadedCategories > 0 && (
                <button
                  type="button"
                  onClick={() => downloadAllDocumentsForStudent(student)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  title={language === 'km' ? 'ទាញយកឯកសារទាំងអស់របស់សិស្សនេះ' : 'Download all student documents'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'km' ? 'ទាញយកឯកសារទាំងអស់' : 'Download All Docs'}</span>
                </button>
              )}

              <a
                href={`tel:${student.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.callNow}</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onEdit(student);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.editStudent}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc.doc}
          allPages={previewDoc.allPages}
          initialPageIndex={previewDoc.pageIndex || 0}
          title={previewDoc.title}
          language={language}
        />
      )}
    </>
  );
};
