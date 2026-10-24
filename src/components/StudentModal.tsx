import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  User, 
  Users, 
  GraduationCap, 
  FileText, 
  MapPin, 
  Phone, 
  Calendar,
  Globe,
  UploadCloud,
  FileCheck,
  Building2,
  BookOpen,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Student, Gender, Language, StudentDocuments, UploadedDocument } from '../types';
import { translations } from '../translations';
import { DocumentUploadCard } from './DocumentUploadCard';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { OptionSelector } from './OptionSelector';
import { 
  PLACES_OF_BIRTH, 
  TARGET_SCHOOLS, 
  MAJORS, 
  getMajorsForSchool,
  getSchoolAgeRequirement,
  getSchoolShortAgeBadge
} from '../constants/studentOptions';
import { 
  areAllRequiredDocumentsUploaded, 
  hasDocUploaded, 
  getDocPages, 
  countUploadedCategories,
  getEffectiveStudentDocuments
} from '../utils/documentUtils';
import { calculateAge, formatAge, formatDobOnly } from '../utils/ageUtils';
import { TranslationTooltip } from './TranslationTooltip';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';
import { authService } from '../services/authService';
import { schoolMajorService } from '../services/schoolMajorService';
import { AdminPinModal } from './AdminPinModal';
import { downloadAllDocumentsForStudent, generateStandardDocFilename } from '../utils/documentDownloadUtils';
import { useInstitution } from '../services/institutionService';
import { stripCloudEnvelopeFromNotes } from '../utils/cloudDocSyncUtils';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student, isEdit: boolean) => Promise<void>;
  studentToEdit?: Student | null;
  existingStudentIds: string[];
  existingStudents?: Student[];
  language: Language;
  initialSchool?: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  existingStudentIds,
  existingStudents = [],
  language,
  initialSchool,
}) => {
  const t = translations[language];
  const isEdit = !!studentToEdit;
  const institution = useInstitution();
  const institutionLogoUrl = institution.logoUrl || '/logo.jpg';

  // Personal Info
  const [studentId, setStudentId] = useState('');
  const [nameKhmer, setNameKhmer] = useState('');
  const [nameLatin, setNameLatin] = useState('');
  const [nameChinese, setNameChinese] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [referrerName, setReferrerName] = useState('');

  // Identity & Contact
  const [idCardNumber, setIdCardNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');

  // Father Info
  const [fatherNameEnglish, setFatherNameEnglish] = useState('');
  const [fatherNameChinese, setFatherNameChinese] = useState('');
  const [fatherDob, setFatherDob] = useState('');
  const [fatherAge, setFatherAge] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');

  // Mother Info
  const [motherNameEnglish, setMotherNameEnglish] = useState('');
  const [motherNameChinese, setMotherNameChinese] = useState('');
  const [motherDob, setMotherDob] = useState('');
  const [motherAge, setMotherAge] = useState('');
  const [motherPhone, setMotherPhone] = useState('');

  // Academic Info
  const [previousSchoolKhmer, setPreviousSchoolKhmer] = useState('');
  const [previousSchoolAddressKhmer, setPreviousSchoolAddressKhmer] = useState('');
  const [targetSchool, setTargetSchool] = useState('');
  const [major, setMajor] = useState('');
  const [notes, setNotes] = useState('');

  // Documents
  const [documents, setDocuments] = useState<StudentDocuments>({});

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<{ 
    doc: UploadedDocument; 
    title: string;
    pageIndex?: number;
    allPages?: UploadedDocument[];
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllMajors, setShowAllMajors] = useState(false);

  // 4-Step Wizard Form Navigation (1 -> 2 -> 3 -> 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  const STEPS = [
    {
      step: 1,
      titleKm: 'ព័ត៌មានផ្ទាល់ខ្លួន',
      titleZh: '個人資料與地址',
      titleEn: 'Personal & Contact',
      shortKm: 'ព័ត៌មានផ្ទាល់ខ្លួន',
      icon: User,
    },
    {
      step: 2,
      titleKm: 'ព័ត៌មានឪពុក និង ម្ដាយ',
      titleZh: '父母親資料',
      titleEn: 'Parents Information',
      shortKm: 'ព័ត៌មានឪពុក និង ម្ដាយ',
      icon: Users,
    },
    {
      step: 3,
      titleKm: 'ព័ត៌មានការសិក្សា & សាលារៀន',
      titleZh: '在柬學歷與就讀學校',
      titleEn: 'Academic & School',
      shortKm: 'ព័ត៌មានការសិក្សា & សាលារៀន',
      icon: GraduationCap,
    },
    {
      step: 4,
      titleKm: 'Upload ឯកសារភ្ជាប់',
      titleZh: '上傳必要附件',
      titleEn: 'Upload Documents',
      shortKm: 'Upload ឯកសារភ្ជាប់',
      icon: UploadCloud,
    },
  ];

  // Auto age calculation handlers
  const handleDobChange = (newDob: string) => {
    setDob(newDob);
    const calculated = calculateAge(newDob);
    if (calculated !== null) {
      setAge(calculated.toString());
    } else {
      setAge('');
    }
    if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
  };

  const handleFatherDobChange = (newDob: string) => {
    setFatherDob(newDob);
    const calculated = calculateAge(newDob);
    if (calculated !== null) {
      setFatherAge(calculated.toString());
    } else {
      setFatherAge('');
    }
    if (errors.fatherDob) setErrors(prev => ({ ...prev, fatherDob: '' }));
  };

  const handleMotherDobChange = (newDob: string) => {
    setMotherDob(newDob);
    const calculated = calculateAge(newDob);
    if (calculated !== null) {
      setMotherAge(calculated.toString());
    } else {
      setMotherAge('');
    }
    if (errors.motherDob) setErrors(prev => ({ ...prev, motherDob: '' }));
  };

  // Dynamic Schools & Majors state from schoolMajorService
  const [schoolsData, setSchoolsData] = useState(() => schoolMajorService.getSchools());

  useEffect(() => {
    const unsub = schoolMajorService.subscribe(() => {
      setSchoolsData(schoolMajorService.getSchools());
    });
    return unsub;
  }, []);

  const dynamicTargetSchools = schoolsData.map(s => s.school);

  // Admin Mode & Authorization state
  const [isAdmin, setIsAdmin] = useState(() => authService.isAdminAuthenticated());
  const [showOrderNumber, setShowOrderNumber] = useState(false);
  const [hasManuallyEditedOrderNumber, setHasManuallyEditedOrderNumber] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  const MASKED_ORDER_SYMBOL = '••••••';
  const isOrderMasked = !isAdmin || !showOrderNumber;

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      const nextAdmin = !!e.detail?.isAdmin || authService.isAdminAuthenticated();
      setIsAdmin(nextAdmin);
      if (!nextAdmin) setShowOrderNumber(false);
    };
    const unsubAuth = authService.subscribe(() => {
      const nextAdmin = authService.isAdminAuthenticated();
      setIsAdmin(nextAdmin);
      if (!nextAdmin) setShowOrderNumber(false);
    });
    window.addEventListener('admin_auth_changed', handleAuthChange);
    return () => {
      unsubAuth();
      window.removeEventListener('admin_auth_changed', handleAuthChange);
    };
  }, []);

  const ensureAdmin = (action: () => void) => {
    if (authService.isAdminAuthenticated()) {
      setIsAdmin(true);
      action();
    } else {
      setPendingAdminAction(() => action);
      setIsAdminPinModalOpen(true);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      authService.logoutAdmin();
      setIsAdmin(false);
    } else {
      setIsAdminPinModalOpen(true);
    }
  };


  // Handle Target School change and auto-filter majors
  const handleSchoolChange = (newSchool: string) => {
    setTargetSchool(newSchool);
    setShowAllMajors(false);
    const available = schoolMajorService.getMajorsForSchool(newSchool);
    // If the currently selected major is not in the new school's majors, clear it
    if (major && available.length > 0 && !available.includes(major)) {
      setMajor('');
    }
  };

  const schoolSpecificMajors = schoolMajorService.getMajorsForSchool(targetSchool);
  const allMajorsList = schoolMajorService.getAllMajors();
  const activeMajorsList = targetSchool && schoolSpecificMajors.length > 0 && !showAllMajors
    ? schoolSpecificMajors
    : allMajorsList;

  // Compute next sequential Order Number (e.g. 1, 2, 3...)
  const computeNextOrderNumber = (ids: string[] = existingStudentIds): string => {
    let maxNum = 0;
    ids.forEach(id => {
      const match = String(id).match(/(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    return (maxNum + 1).toString();
  };

  // Auto-generate next Order Number (e.g. 1, 2, 3...)
  const generateNextId = () => {
    const nextId = computeNextOrderNumber();
    setStudentId(nextId);
    setHasManuallyEditedOrderNumber(false);
    setErrors(prev => ({ ...prev, studentId: '' }));
  };

  // Keep auto-assigned order number up to date if remote students finish loading while modal is open
  useEffect(() => {
    if (isOpen && !studentToEdit && !hasManuallyEditedOrderNumber) {
      const nextId = computeNextOrderNumber(existingStudentIds);
      if (nextId !== studentId) {
        setStudentId(nextId);
      }
    }
  }, [isOpen, studentToEdit, existingStudentIds, hasManuallyEditedOrderNumber]);

  useEffect(() => {
    if (isOpen) {
      setSubmittedAttempt(false);
      setShowOrderNumber(false);
      setHasManuallyEditedOrderNumber(false);
      if (studentToEdit) {
        setStudentId(studentToEdit.studentId || '');
        setNameKhmer(studentToEdit.nameKhmer || studentToEdit.name || '');
        setNameLatin(studentToEdit.nameLatin || '');
        setNameChinese(studentToEdit.nameChinese || '');
        setGender(studentToEdit.gender === 'Female' ? 'Female' : 'Male');
        setDob(formatDobOnly(studentToEdit.dob));
        setAge(
          studentToEdit.age !== undefined && studentToEdit.age !== '' 
            ? studentToEdit.age.toString() 
            : (calculateAge(studentToEdit.dob)?.toString() || '')
        );
        setPlaceOfBirth(studentToEdit.placeOfBirth || '');
        setReferrerName(studentToEdit.referrerName || '');
        setIdCardNumber(studentToEdit.idCardNumber || '');
        setPassportNumber(studentToEdit.passportNumber || '');
        setPhone(studentToEdit.phone || '');
        setEmail(studentToEdit.email || '');
        setCurrentAddress(studentToEdit.currentAddress || '');

        // Father
        setFatherNameEnglish(studentToEdit.fatherNameEnglish || '');
        setFatherNameChinese(studentToEdit.fatherNameChinese || '');
        setFatherDob(formatDobOnly(studentToEdit.fatherDob));
        setFatherAge(
          studentToEdit.fatherAge !== undefined && studentToEdit.fatherAge !== ''
            ? studentToEdit.fatherAge.toString()
            : (calculateAge(studentToEdit.fatherDob)?.toString() || '')
        );
        setFatherPhone(studentToEdit.fatherPhone || '');

        // Mother
        setMotherNameEnglish(studentToEdit.motherNameEnglish || '');
        setMotherNameChinese(studentToEdit.motherNameChinese || '');
        setMotherDob(formatDobOnly(studentToEdit.motherDob));
        setMotherAge(
          studentToEdit.motherAge !== undefined && studentToEdit.motherAge !== ''
            ? studentToEdit.motherAge.toString()
            : (calculateAge(studentToEdit.motherDob)?.toString() || '')
        );
        setMotherPhone(studentToEdit.motherPhone || '');

        setPreviousSchoolKhmer(studentToEdit.previousSchoolKhmer || '');
        setPreviousSchoolAddressKhmer(studentToEdit.previousSchoolAddressKhmer || '');
        setTargetSchool(studentToEdit.targetSchool || '');
        setMajor(studentToEdit.major || '');
        setNotes(stripCloudEnvelopeFromNotes(studentToEdit.notes));
        setDocuments(getEffectiveStudentDocuments(studentToEdit) || {});
      } else {
        // Reset form for new student
        setNameKhmer('');
        setNameLatin('');
        setNameChinese('');
        setGender('Male');
        setDob('');
        setAge('');
        setPlaceOfBirth('');
        setReferrerName('');
        setIdCardNumber('');
        setPassportNumber('');
        setPhone('');
        setEmail('');
        setCurrentAddress('');

        setFatherNameEnglish('');
        setFatherNameChinese('');
        setFatherDob('');
        setFatherAge('');
        setFatherPhone('');

        setMotherNameEnglish('');
        setMotherNameChinese('');
        setMotherDob('');
        setMotherAge('');
        setMotherPhone('');

        setPreviousSchoolKhmer('');
        setPreviousSchoolAddressKhmer('');
        setTargetSchool(typeof initialSchool === 'string' ? initialSchool : '');
        setMajor('');
        setNotes('');
        setDocuments({});
        generateNextId();
      }
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, studentToEdit, initialSchool]);

  if (!isOpen) return null;

  const validateStep = (step: number): { isValid: boolean; stepErrors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // 1. Student ID * (auto-resolve if masked so students never hit ID collisions)
      const effectiveId = !isEdit && isOrderMasked && (!studentId.trim() || existingStudentIds.includes(studentId.trim()))
        ? computeNextOrderNumber(existingStudentIds)
        : studentId.trim();
      if (!isEdit && isOrderMasked && effectiveId !== studentId) {
        setStudentId(effectiveId);
      }

      if (!effectiveId) {
        newErrors.studentId = 'required';
      } else if (!isEdit && existingStudentIds.includes(effectiveId)) {
        newErrors.studentId = t.idExists;
      }

      // 2. Names *
      if (!nameKhmer.trim()) {
        newErrors.nameKhmer = 'required';
      }

      if (!nameLatin.trim()) {
        newErrors.nameLatin = 'required';
      }

      // Check for duplicate student name in database
      const trimmedKhmer = nameKhmer.trim().toLowerCase();
      const trimmedLatin = nameLatin.trim().toLowerCase();
      const trimmedChinese = nameChinese.trim().toLowerCase();

      const otherStudents = (existingStudents || []).filter(s => {
        if (isEdit && studentToEdit) {
          return s.studentId !== studentToEdit.studentId;
        }
        return true;
      });

      const duplicateStudent = otherStudents.find(s => {
        const sKhmer = (s.nameKhmer || s.name || '').trim().toLowerCase();
        const sLatin = (s.nameLatin || '').trim().toLowerCase();
        const sChinese = (s.nameChinese || '').trim().toLowerCase();

        // Match Khmer name
        if (trimmedKhmer && sKhmer && trimmedKhmer === sKhmer) return true;
        // Match Latin / English name
        if (trimmedLatin && sLatin && trimmedLatin === sLatin) return true;
        // Match Chinese name if entered
        if (trimmedChinese && sChinese && trimmedChinese === sChinese) return true;

        return false;
      });

      if (duplicateStudent) {
        const dupName = duplicateStudent.nameKhmer || duplicateStudent.nameLatin || duplicateStudent.name || '';
        const idSuffixKm = !isOrderMasked ? ` (លេខរៀង #${duplicateStudent.studentId})` : '';
        const idSuffixZh = !isOrderMasked ? ` (編號 #${duplicateStudent.studentId})` : '';
        const idSuffixEn = !isOrderMasked ? ` (ID #${duplicateStudent.studentId})` : '';
        const dupMsg = language === 'km'
          ? `ឈ្មោះសិស្ស "${dupName}"${idSuffixKm} មាននៅក្នុងប្រព័ន្ធរួចហើយ មិនអាចបញ្ចូលឈ្មោះដូចគ្នាបានទេ!`
          : language === 'zh-TW'
          ? `學生姓名 "${dupName}"${idSuffixZh} 已存在於系統中，無法儲存重複學生！`
          : `Student name "${dupName}"${idSuffixEn} already exists in database! Duplicate names are not allowed.`;
        
        newErrors.nameKhmer = dupMsg;
        newErrors.nameLatin = dupMsg;
        newErrors.duplicateName = dupMsg;
      }

      // 3. DOB *
      if (!dob.trim()) {
        newErrors.dob = 'required';
      }

      // 4. Place of Birth *
      if (!placeOfBirth.trim()) {
        newErrors.placeOfBirth = 'required';
      }

      // 5. ID Card Number *
      if (!idCardNumber.trim()) {
        newErrors.idCardNumber = 'required';
      }

      // 6. Phone *
      if (!phone.trim()) {
        newErrors.phone = 'required';
      }

      // 7. Student E-mail (Optional)
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        newErrors.email = language === 'km' ? 'ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ (ឧ. name@example.com)' : 'Invalid email format';
      }

      // 8. Current Address *
      if (!currentAddress.trim()) {
        newErrors.currentAddress = 'required';
      }
    }

    if (step === 2) {
      // Father Info
      if (!fatherNameEnglish.trim()) {
        newErrors.fatherNameEnglish = 'required';
      }
      if (!fatherDob.trim()) {
        newErrors.fatherDob = 'required';
      }
      if (!fatherPhone.trim()) {
        newErrors.fatherPhone = 'required';
      }

      // Mother Info
      if (!motherNameEnglish.trim()) {
        newErrors.motherNameEnglish = 'required';
      }
      if (!motherDob.trim()) {
        newErrors.motherDob = 'required';
      }
      if (!motherPhone.trim()) {
        newErrors.motherPhone = 'required';
      }
    }

    if (step === 3) {
      if (!previousSchoolKhmer.trim()) {
        newErrors.previousSchoolKhmer = 'required';
      }
      if (!previousSchoolAddressKhmer.trim()) {
        newErrors.previousSchoolAddressKhmer = 'required';
      }
    }

    if (step === 4) {
      const docValidation = areAllRequiredDocumentsUploaded(documents);
      if (!docValidation.isValid) {
        const missingList = docValidation.missingDocs
          .map(d => language === 'km' ? d.labelKm : language === 'zh-TW' ? d.labelZh : d.labelEn)
          .join('、 ');
        newErrors.documents = language === 'km'
          ? `សូម Upload ឯកសារចាំបាច់ (មានសញ្ញា *) ឱ្យបានគ្រប់គ្រាន់មុនពេលចុះឈ្មោះ៖ ${missingList}`
          : language === 'zh-TW'
          ? `儲存前請完整上傳所有必要證明文件 (標示 *)：${missingList}`
          : `Please upload all required documents (*) before saving: ${missingList}`;
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      stepErrors: newErrors
    };
  };

  const isStepValid = (st: number): boolean => {
    if (st === 1) {
      return !!(
        studentId.trim() &&
        nameKhmer.trim() &&
        nameLatin.trim() &&
        dob.trim() &&
        placeOfBirth.trim() &&
        idCardNumber.trim() &&
        phone.trim() &&
        currentAddress.trim()
      );
    }
    if (st === 2) {
      return !!(
        fatherNameEnglish.trim() &&
        fatherDob.trim() &&
        fatherPhone.trim() &&
        motherNameEnglish.trim() &&
        motherDob.trim() &&
        motherPhone.trim()
      );
    }
    if (st === 3) {
      return !!(
        previousSchoolKhmer.trim() &&
        previousSchoolAddressKhmer.trim()
      );
    }
    if (st === 4) {
      return areAllRequiredDocumentsUploaded(documents).isValid;
    }
    return false;
  };

  const handleNextStep = () => {
    setSubmittedAttempt(true);
    const { isValid, stepErrors } = validateStep(currentStep);
    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        ...stepErrors,
        form: language === 'km' ? 'ព័ត៌មានមិនត្រឹមត្រូវ' : language === 'zh-TW' ? '資料未完整' : 'Information is incomplete'
      }));
      const modalEl = document.getElementById('student-modal-body');
      if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy.form;
      return copy;
    });

    setCurrentStep(prev => Math.min(4, prev + 1));
    const modalEl = document.getElementById('student-modal-body');
    if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    const modalEl = document.getElementById('student-modal-body');
    if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep > currentStep) {
      setSubmittedAttempt(true);
      const { isValid, stepErrors } = validateStep(currentStep);
      if (!isValid) {
        setErrors(prev => ({
          ...prev,
          ...stepErrors,
          form: language === 'km' ? 'ព័ត៌មានមិនត្រឹមត្រូវ' : language === 'zh-TW' ? '資料未完整' : 'Information is incomplete'
        }));
        const modalEl = document.getElementById('student-modal-body');
        if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setCurrentStep(targetStep);
    const modalEl = document.getElementById('student-modal-body');
    if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedAttempt(true);

    // Validate Step 1
    const step1Check = validateStep(1);
    if (!step1Check.isValid) {
      setCurrentStep(1);
      setErrors({
        ...step1Check.stepErrors,
        form: language === 'km' ? 'ព័ត៌មានមិនត្រឹមត្រូវ' : language === 'zh-TW' ? '資料未完整' : 'Information is incomplete'
      });
      const modalEl = document.getElementById('student-modal-body');
      if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate Step 2
    const step2Check = validateStep(2);
    if (!step2Check.isValid) {
      setCurrentStep(2);
      setErrors({
        ...step2Check.stepErrors,
        form: language === 'km' ? 'ព័ត៌មានមិនត្រឹមត្រូវ' : language === 'zh-TW' ? '資料未完整' : 'Information is incomplete'
      });
      const modalEl = document.getElementById('student-modal-body');
      if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate Step 3
    const step3Check = validateStep(3);
    if (!step3Check.isValid) {
      setCurrentStep(3);
      setErrors({
        ...step3Check.stepErrors,
        form: language === 'km' ? 'ព័ត៌មានមិនត្រឹមត្រូវ' : language === 'zh-TW' ? '資料未完整' : 'Information is incomplete'
      });
      const modalEl = document.getElementById('student-modal-body');
      if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate Step 4
    const step4Check = validateStep(4);
    if (!step4Check.isValid) {
      setCurrentStep(4);
      setErrors({
        ...step4Check.stepErrors,
        form: language === 'km' ? 'ខ្វះឯកសារចាំបាច់ សូមពិនិត្យមើលការ Upload ឯកសារ' : 'Please upload all required documents'
      });
      const modalEl = document.getElementById('student-modal-body');
      if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalStudentId =
        !isEdit && (!studentId.trim() || (isOrderMasked && existingStudentIds.includes(studentId.trim())))
          ? computeNextOrderNumber(existingStudentIds)
          : studentId.trim();

      // Stamp uploaded documents with the true sequential studentId for Admin records
      const normalizedDocuments: StudentDocuments = { ...documents };
      (Object.keys(normalizedDocuments) as (keyof StudentDocuments)[]).forEach(catKey => {
        const rawDoc = normalizedDocuments[catKey];
        if (!rawDoc) return;
        const pages = getDocPages(rawDoc);
        if (pages.length > 0) {
          normalizedDocuments[catKey] = pages.map((p, idx) => ({
            ...p,
            name: generateStandardDocFilename(
              { studentId: finalStudentId, nameKhmer: nameKhmer.trim(), nameLatin: nameLatin.trim() },
              catKey,
              idx,
              p.name,
              p.type
            ),
          }));
        }
      });

      const studentPayload: Student = {
        studentId: finalStudentId,
        nameKhmer: nameKhmer.trim(),
        nameLatin: nameLatin.trim(),
        nameChinese: nameChinese.trim(),
        gender,
        dob: formatDobOnly(dob),
        age: age.trim() || (calculateAge(dob)?.toString() || ''),
        placeOfBirth: placeOfBirth.trim(),
        referrerName: referrerName.trim(),
        idCardNumber: idCardNumber.trim(),
        passportNumber: passportNumber.trim(),

        // Father
        fatherNameEnglish: fatherNameEnglish.trim(),
        fatherNameChinese: fatherNameChinese.trim(),
        fatherDob: formatDobOnly(fatherDob),
        fatherAge: fatherAge.trim() || (calculateAge(fatherDob)?.toString() || ''),
        fatherPhone: fatherPhone.trim(),

        // Mother
        motherNameEnglish: motherNameEnglish.trim(),
        motherNameChinese: motherNameChinese.trim(),
        motherDob: formatDobOnly(motherDob),
        motherAge: motherAge.trim() || (calculateAge(motherDob)?.toString() || ''),
        motherPhone: motherPhone.trim(),

        previousSchoolKhmer: previousSchoolKhmer.trim(),
        previousSchoolAddressKhmer: previousSchoolAddressKhmer.trim(),
        targetSchool: targetSchool.trim(),
        major: major.trim(),
        currentAddress: currentAddress.trim(),
        phone: phone.trim(),
        email: email.trim(),
        documents: normalizedDocuments,
        notes: notes.trim(),
        createdAt: studentToEdit?.createdAt || new Date().toISOString(),
        name: `${nameKhmer.trim()} (${nameLatin.trim()})`,
      };

      // Ensure written / selected school and major are registered in catalog
      if (studentPayload.targetSchool) {
        schoolMajorService.ensureSchoolAndMajor(studentPayload.targetSchool, studentPayload.major);
      }

      await onSave(studentPayload, isEdit);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save student' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUploadPages = (key: keyof StudentDocuments, pages: UploadedDocument[]) => {
    setDocuments(prev => ({
      ...prev,
      [key]: pages,
    }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[key];
      delete copy.documents;
      return copy;
    });
  };

  const handleDocumentRemovePage = (key: keyof StudentDocuments, pageIndex: number) => {
    setDocuments(prev => {
      const currentPages = getDocPages(prev[key]);
      const updated = currentPages.filter((_, idx) => idx !== pageIndex);
      return {
        ...prev,
        [key]: updated.length > 0 ? updated : undefined,
      };
    });
  };

  const handleDocumentRemoveAll = (key: keyof StudentDocuments) => {
    setDocuments(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const docValidation = areAllRequiredDocumentsUploaded(documents);
  const uploadedCategoryCount = countUploadedCategories(documents);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="relative z-20 px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-2.5 sm:gap-4 bg-slate-50 shrink-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="truncate">{isEdit ? t.editStudent : t.addStudent}</span>
                {isEdit && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 whitespace-nowrap shrink-0">
                    #{isOrderMasked ? MASKED_ORDER_SYMBOL : studentId}
                  </span>
                )}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate sm:whitespace-normal mt-0.5 sm:mt-0">
                {language === 'km' 
                  ? 'ព័ត៌មានលម្អិតសិស្ស ឪពុក ម្ដាយ សាលារៀន និង Upload ឯកសារភ្ជាប់' 
                  : language === 'zh-TW'
                  ? '學生基本資料、父母資訊、目標學校與文件上傳'
                  : 'Student details, separated parents, target school & document uploads'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="inline-flex items-center justify-center whitespace-nowrap shrink-0 tabular-nums text-[11px] sm:text-xs font-semibold leading-snug px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {language === 'km' 
                  ? `ជំហានទី ${currentStep} នៃ ៤` 
                  : language === 'zh-TW' 
                  ? `第 ${currentStep} 步 / 共 4 步` 
                  : `Step ${currentStep} of 4`}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Official Lising International Chinese School Background Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-x-0 top-16 bottom-14 z-0 flex items-center justify-center p-6 sm:p-10 overflow-hidden"
          >
            <img
              src={institutionLogoUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/logo.jpg')) {
                  target.src = '/logo.jpg';
                }
              }}
              className="w-72 h-72 sm:w-96 sm:h-96 md:w-[430px] md:h-[430px] max-w-full max-h-full object-contain opacity-[0.18] mix-blend-multiply"
            />
          </div>

          {/* Modal Form Content */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep < 4) {
                handleNextStep();
              } else {
                handleSubmit();
              }
            }} 
            className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm" 
            id="student-modal-body"
          >
            
            {errors.form && (
              <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 flex items-center gap-2.5 text-rose-800 text-xs sm:text-sm shadow-xs animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <div className="flex-1">
                  <span className="font-bold text-rose-700">{errors.form}</span>
                </div>
              </div>
            )}

            {errors.documents && currentStep === 4 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-2.5 text-rose-800 text-xs shadow-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <span>*</span>
                    <span>{language === 'km' ? 'ខ្វះឯកសារចាំបាច់ដើម្បីចុះឈ្មោះ' : 'Missing Required Documents'}</span>
                  </div>
                  <p className="leading-relaxed">{errors.documents}</p>
                </div>
              </div>
            )}

            {errors.duplicateName && currentStep === 1 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-start gap-2.5 text-amber-900 text-xs sm:text-sm shadow-xs animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-950 block">{errors.duplicateName}</span>
                  <p className="text-amber-800 text-xs">
                    {language === 'km' 
                      ? 'ដោយសារឈ្មោះនេះមាននៅក្នុងទិន្នន័យរួចហើយ ប្រព័ន្ធមិនអនុញ្ញាតឱ្យរក្សាទុកឈ្មោះដូចគ្នាបានឡើយ។ សូមពិនិត្យមើលឈ្មោះឡើងវិញ។' 
                      : language === 'zh-TW'
                      ? '由於此姓名已存在於資料庫中，系統不允許儲存重複學生姓名，請確認姓名無誤。'
                      : 'Because this name already exists in the database, duplicate names are not allowed to be saved.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Personal Info & Identity/Address */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Section 1: Personal Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-indigo-700">
                    <User className="w-4 h-4" />
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight">
                      {language === 'km' ? 'ព័ត៌មានផ្ទាល់ខ្លួន' : t.personalInfo}
                    </h4>
                  </div>

                  {/* Order Number (លេខរៀង) - Masked with symbols to hide sequence number from students */}
              <div>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <label className="font-semibold text-slate-700">
                    {t.studentId} <span className="text-rose-500">*</span>
                  </label>
                  {!isOrderMasked && !isEdit && (
                    <button
                      type="button"
                      onClick={generateNextId}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {t.autoGenerateId}
                    </button>
                  )}
                </div>
                <div className="relative">
                  {isOrderMasked && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={isOrderMasked ? MASKED_ORDER_SYMBOL : studentId}
                    onChange={e => {
                      if (isOrderMasked || isEdit) return;
                      setStudentId(e.target.value);
                      setHasManuallyEditedOrderNumber(true);
                      if (errors.studentId) setErrors(prev => ({ ...prev, studentId: '' }));
                    }}
                    readOnly={isOrderMasked || isEdit}
                    placeholder={isOrderMasked ? MASKED_ORDER_SYMBOL : '1, 2, 3...'}
                    aria-label={t.studentId}
                    className={`w-full py-2 rounded-lg border font-mono ${
                      isOrderMasked
                        ? 'pl-9 pr-10 bg-slate-100/75 text-slate-600 tracking-[0.28em] select-none cursor-default'
                        : isEdit
                        ? 'px-3.5 pr-10 bg-slate-100/65 text-slate-500 cursor-not-allowed'
                        : 'px-3.5 pr-10 bg-white/60 focus:bg-white/90 text-slate-900'
                    } border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      errors.studentId ? 'border-rose-300 ring-1 ring-rose-300' : ''
                    }`}
                  />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowOrderNumber(prev => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title={
                        showOrderNumber
                          ? language === 'km'
                            ? 'លាក់លេខរៀងជាសញ្ញា'
                            : language === 'zh-TW'
                            ? '隱藏編號'
                            : 'Hide order number'
                          : language === 'km'
                          ? 'បង្ហាញលេខរៀងពិត (Admin)'
                          : language === 'zh-TW'
                          ? '顯示實際編號 (管理員)'
                          : 'Show actual order number (Admin)'
                      }
                    >
                      {showOrderNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors.studentId && errors.studentId !== 'required' && (
                  <p className="mt-1 text-xs text-rose-600">{errors.studentId}</p>
                )}
              </div>

              {/* Student Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.nameKhmer} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameKhmer}
                    onChange={e => {
                      setNameKhmer(e.target.value);
                      if (errors.nameKhmer) setErrors(prev => ({ ...prev, nameKhmer: '' }));
                    }}
                    placeholder="e.g. សុខ ពិសិដ្ឋ"
                    className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      errors.nameKhmer ? 'border-rose-300 ring-1 ring-rose-300' : ''
                    }`}
                  />
                  {errors.nameKhmer && errors.nameKhmer !== 'required' && (
                    <p className="mt-1 text-xs text-rose-600">{errors.nameKhmer}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.nameLatin} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameLatin}
                    onChange={e => {
                      setNameLatin(e.target.value);
                      if (errors.nameLatin) setErrors(prev => ({ ...prev, nameLatin: '' }));
                    }}
                    placeholder="e.g. Sok Piseth"
                    className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      errors.nameLatin ? 'border-rose-300 ring-1 ring-rose-300' : ''
                    }`}
                  />
                  {errors.nameLatin && errors.nameLatin !== 'required' && (
                    <p className="mt-1 text-xs text-rose-600">{errors.nameLatin}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.nameChinese}
                  </label>
                  <input
                    type="text"
                    value={nameChinese}
                    onChange={e => setNameChinese(e.target.value)}
                    placeholder="e.g. 苏比瑟"
                    className="w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Gender, DOB & Auto Age */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.gender}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGender('Male')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        gender === 'Male'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                          : 'bg-white/65 text-slate-700 border-slate-200 hover:bg-blue-50/90 hover:text-blue-700 hover:border-blue-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t.male}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('Female')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        gender === 'Female'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-600/20'
                          : 'bg-white/65 text-slate-700 border-slate-200 hover:bg-rose-50/90 hover:text-rose-700 hover:border-rose-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t.female}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      {t.dob} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100/80 text-slate-600 border border-slate-200">
                      yyyy-mm-dd
                    </span>
                  </div>
                  <input
                    type="date"
                    lang="en-CA"
                    placeholder="yyyy-mm-dd"
                    value={dob}
                    onChange={e => handleDobChange(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      errors.dob ? 'border-rose-300 ring-1 ring-rose-300' : ''
                    }`}
                  />
                  {errors.dob && errors.dob !== 'required' && (
                    <p className="mt-1 text-xs text-rose-600">{errors.dob}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.age}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={age ? formatAge(age, language) : ''}
                      readOnly
                      placeholder={language === 'km' ? 'ស្វ័យប្រវត្តិតាមថ្ងៃខែឆ្នាំកំណើត' : 'Auto from DOB'}
                      className="w-full px-3.5 py-2 rounded-lg border bg-slate-50/65 text-indigo-700 font-bold border-slate-200 cursor-not-allowed"
                    />
                    {age && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {language === 'km' ? 'ស្វ័យប្រវត្តិ' : 'Auto'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Place of Birth Selection with Buttons - Required * */}
              <div className="pt-1">
                <OptionSelector
                  id="student-place-of-birth"
                  label={t.placeOfBirth}
                  icon={<MapPin className="w-4 h-4 text-indigo-600" />}
                  value={placeOfBirth}
                  onChange={val => {
                    setPlaceOfBirth(val);
                    if (errors.placeOfBirth) setErrors(prev => ({ ...prev, placeOfBirth: '' }));
                  }}
                  options={PLACES_OF_BIRTH}
                  placeholder={language === 'km' ? 'ស្វែងរកទីកន្លែងកំណើត (ឧ. PHNOM PENH, BATTAMBANG...)' : 'Search place of birth...'}
                  language={language}
                  colorScheme="blue"
                  required={true}
                  translationType="pob"
                />
                {errors.placeOfBirth && errors.placeOfBirth !== 'required' && (
                  <p className="mt-1 text-xs text-rose-600">{errors.placeOfBirth}</p>
                )}
              </div>

              {/* Referrer Name (ឈ្មោះអ្នកណែនាំ) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  <span>{t.referrerName}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={referrerName}
                    onChange={e => setReferrerName(e.target.value)}
                    placeholder={language === 'km' ? 'ឧ. លោក ឈុន វណ្ណា / សាលា / ដៃគូសហការ...' : 'e.g. Referrer name / agent / partner...'}
                    className="w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Identity Documents & Address */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-indigo-700">
                <FileText className="w-4 h-4" />
                <h4 className="font-bold text-slate-800 text-sm tracking-tight">
                  {t.identityInfo}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.idCardNumber} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={idCardNumber}
                    onChange={e => {
                      setIdCardNumber(e.target.value);
                      if (errors.idCardNumber) setErrors(prev => ({ ...prev, idCardNumber: '' }));
                    }}
                    placeholder="e.g. 020456789"
                    className={`w-full px-3.5 py-2 rounded-lg border font-mono bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      errors.idCardNumber ? 'border-rose-300 ring-1 ring-rose-300' : ''
                    }`}
                  />
                  {errors.idCardNumber && errors.idCardNumber !== 'required' && (
                    <p className="mt-1 text-xs text-rose-600">{errors.idCardNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.passportNumber}
                  </label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={e => setPassportNumber(e.target.value)}
                    placeholder="e.g. N01234567"
                    className="w-full px-3.5 py-2 rounded-lg border font-mono bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.phone} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    placeholder="e.g. 012 889 900"
                    className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      errors.phone ? 'border-rose-300 ring-1 ring-rose-300' : ''
                    }`}
                  />
                  {errors.phone && errors.phone !== 'required' && (
                    <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="e.g. student@gmail.com"
                    className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      errors.email ? 'border-rose-300 ring-1 ring-rose-300' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.currentAddress} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentAddress}
                  onChange={e => {
                    setCurrentAddress(e.target.value);
                    if (errors.currentAddress) setErrors(prev => ({ ...prev, currentAddress: '' }));
                  }}
                  placeholder="e.g. សង្កាត់ទួលទំពូង១ ខណ្ឌចំការមន រាជធានីភ្នំពេញ"
                  className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.currentAddress ? 'border-rose-300 ring-1 ring-rose-300' : ''
                  }`}
                />
                {errors.currentAddress && errors.currentAddress !== 'required' && (
                  <p className="mt-1 text-xs text-rose-600">{errors.currentAddress}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Parents Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Section 3: Father & Mother Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-indigo-700">
                <Users className="w-4 h-4" />
                <h4 className="font-bold text-slate-800 text-sm tracking-tight">
                  {language === 'km' 
                    ? 'ព័ត៌មានឪពុក និង ម្ដាយ' 
                    : language === 'zh-TW' 
                    ? '父母親資料 (家長資訊)' 
                    : 'Parents Information'}
                </h4>
              </div>

              {/* Father Sub-Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/45 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  {t.fatherInfo}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.fatherNameEnglish} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fatherNameEnglish}
                      onChange={e => {
                        setFatherNameEnglish(e.target.value);
                        if (errors.fatherNameEnglish) setErrors(prev => ({ ...prev, fatherNameEnglish: '' }));
                      }}
                      placeholder="e.g. Sok Vichea"
                      className={`w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm ${
                        errors.fatherNameEnglish ? 'border-rose-300 ring-1 ring-rose-300' : ''
                      }`}
                    />
                    {errors.fatherNameEnglish && errors.fatherNameEnglish !== 'required' && (
                      <p className="mt-1 text-xs text-rose-600">{errors.fatherNameEnglish}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.fatherNameChinese}
                    </label>
                    <input
                      type="text"
                      value={fatherNameChinese}
                      onChange={e => setFatherNameChinese(e.target.value)}
                      placeholder="e.g. 苏维查"
                      className="w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        {t.fatherDob} <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-mono font-medium px-1 py-0.2 rounded bg-slate-100/80 text-slate-600 border border-slate-200">
                        yyyy-mm-dd
                      </span>
                    </div>
                    <input
                      type="date"
                      lang="en-CA"
                      placeholder="yyyy-mm-dd"
                      value={fatherDob}
                      onChange={e => handleFatherDobChange(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm ${
                        errors.fatherDob ? 'border-rose-300 ring-1 ring-rose-300' : ''
                      }`}
                    />
                    {errors.fatherDob && errors.fatherDob !== 'required' && (
                      <p className="mt-1 text-xs text-rose-600">{errors.fatherDob}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.fatherAge || t.age}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fatherAge ? formatAge(fatherAge, language) : ''}
                        readOnly
                        placeholder={language === 'km' ? 'ស្វ័យប្រវត្តិតាមកំណើត' : 'Auto from DOB'}
                        className="w-full px-3 py-1.5 rounded-lg border bg-slate-100/65 text-indigo-700 font-bold border-slate-200 text-xs sm:text-sm cursor-not-allowed"
                      />
                      {fatherAge && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold px-1 rounded bg-indigo-100 text-indigo-800">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.fatherPhone} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={fatherPhone}
                      onChange={e => {
                        setFatherPhone(e.target.value);
                        if (errors.fatherPhone) setErrors(prev => ({ ...prev, fatherPhone: '' }));
                      }}
                      placeholder="e.g. 012 334 455"
                      className={`w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm ${
                        errors.fatherPhone ? 'border-rose-300 ring-1 ring-rose-300' : ''
                      }`}
                    />
                    {errors.fatherPhone && errors.fatherPhone !== 'required' && (
                      <p className="mt-1 text-xs text-rose-600">{errors.fatherPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mother Sub-Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/45 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  {t.motherInfo}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.motherNameEnglish} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={motherNameEnglish}
                      onChange={e => {
                        setMotherNameEnglish(e.target.value);
                        if (errors.motherNameEnglish) setErrors(prev => ({ ...prev, motherNameEnglish: '' }));
                      }}
                      placeholder="e.g. Chhay Lin"
                      className={`w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm ${
                        errors.motherNameEnglish ? 'border-rose-300 ring-1 ring-rose-300' : ''
                      }`}
                    />
                    {errors.motherNameEnglish && errors.motherNameEnglish !== 'required' && (
                      <p className="mt-1 text-xs text-rose-600">{errors.motherNameEnglish}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.motherNameChinese}
                    </label>
                    <input
                      type="text"
                      value={motherNameChinese}
                      onChange={e => setMotherNameChinese(e.target.value)}
                      placeholder="e.g. 蔡琳"
                      className="w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        {t.motherDob} <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-mono font-medium px-1 py-0.2 rounded bg-slate-100/80 text-slate-600 border border-slate-200">
                        yyyy-mm-dd
                      </span>
                    </div>
                    <input
                      type="date"
                      lang="en-CA"
                      placeholder="yyyy-mm-dd"
                      value={motherDob}
                      onChange={e => handleMotherDobChange(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm ${
                        errors.motherDob ? 'border-rose-300 ring-1 ring-rose-300' : ''
                      }`}
                    />
                    {errors.motherDob && errors.motherDob !== 'required' && (
                      <p className="mt-1 text-xs text-rose-600">{errors.motherDob}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.motherAge || t.age}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={motherAge ? formatAge(motherAge, language) : ''}
                        readOnly
                        placeholder={language === 'km' ? 'ស្វ័យប្រវត្តិតាមកំណើត' : 'Auto from DOB'}
                        className="w-full px-3 py-1.5 rounded-lg border bg-slate-100/65 text-indigo-700 font-bold border-slate-200 text-xs sm:text-sm cursor-not-allowed"
                      />
                      {motherAge && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold px-1 rounded bg-indigo-100 text-indigo-800">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.motherPhone} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={motherPhone}
                      onChange={e => {
                        setMotherPhone(e.target.value);
                        if (errors.motherPhone) setErrors(prev => ({ ...prev, motherPhone: '' }));
                      }}
                      placeholder="e.g. 092 667 788"
                      className={`w-full px-3 py-1.5 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm ${
                        errors.motherPhone ? 'border-rose-300 ring-1 ring-rose-300' : ''
                      }`}
                    />
                    {errors.motherPhone && errors.motherPhone !== 'required' && (
                      <p className="mt-1 text-xs text-rose-600">{errors.motherPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Academic & School Information */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Section 4: Academic & School Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-indigo-700">
                <GraduationCap className="w-4 h-4" />
                <h4 className="font-bold text-slate-800 text-sm tracking-tight">
                  {language === 'km' ? 'ព័ត៌មានការសិក្សា & សាលារៀន' : t.academicInfo}
                </h4>
              </div>

              {/* Previous School in Cambodia * */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  <span>{t.previousSchoolKhmer}</span>
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={previousSchoolKhmer}
                  onChange={e => {
                    setPreviousSchoolKhmer(e.target.value);
                    if (errors.previousSchoolKhmer) setErrors(prev => ({ ...prev, previousSchoolKhmer: '' }));
                  }}
                  placeholder="e.g. វិទ្យាល័យ នេត យ៉ង់"
                  className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm ${
                    errors.previousSchoolKhmer ? 'border-rose-300 ring-1 ring-rose-300' : ''
                  }`}
                />
                {errors.previousSchoolKhmer && errors.previousSchoolKhmer !== 'required' && (
                  <p className="mt-1 text-xs text-rose-600">{errors.previousSchoolKhmer}</p>
                )}
              </div>

              {/* Previous School Address in Cambodia * */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  <span>{t.previousSchoolAddressKhmer}</span>
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={previousSchoolAddressKhmer}
                  onChange={e => {
                    setPreviousSchoolAddressKhmer(e.target.value);
                    if (errors.previousSchoolAddressKhmer) setErrors(prev => ({ ...prev, previousSchoolAddressKhmer: '' }));
                  }}
                  placeholder={language === 'km' ? 'ឧ. ក្រុងបាត់ដំបង ខេត្តបាត់ដំបង' : 'e.g. Battambang City, Battambang Province'}
                  className={`w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm ${
                    errors.previousSchoolAddressKhmer ? 'border-rose-300 ring-1 ring-rose-300' : ''
                  }`}
                />
                {errors.previousSchoolAddressKhmer && errors.previousSchoolAddressKhmer !== 'required' && (
                  <p className="mt-1 text-xs text-rose-600">{errors.previousSchoolAddressKhmer}</p>
                )}
              </div>

              {/* Target School with Option Buttons */}
              <div className="pt-1 space-y-1.5">
                <OptionSelector
                  id="student-target-school"
                  label={t.targetSchool}
                  icon={<Building2 className="w-4 h-4 text-purple-600" />}
                  value={targetSchool}
                  onChange={handleSchoolChange}
                  options={dynamicTargetSchools}
                  placeholder={language === 'km' ? 'ស្វែងរកសាលា (ឧ. 中山, 莊敬, 龍華, Chung Shan, ជុងសាន...)' : 'Search target school (Chinese, English, Khmer)...'}
                  language={language}
                  colorScheme="purple"
                  translationType="school"
                  getOptionTooltip={(opt) => schoolMajorService.getSchoolAgeRequirement(opt, language)}
                  getOptionBadge={(opt) => schoolMajorService.getSchoolShortAgeBadge(opt, language)}
                />

                {/* Selected School Translation Preview Card */}
                {targetSchool && (
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 font-bold text-[11px]">
                          🎯 {language === 'km' ? 'សាលាដែលបានជ្រើសរើស' : 'Selected School'}
                        </span>
                        <TranslationTooltip text={targetSchool} type="school" currentLanguage={language} showBadge>
                          <span className="font-bold text-purple-950 text-xs sm:text-sm hover:text-purple-700 underline decoration-dotted">
                            {targetSchool}
                          </span>
                        </TranslationTooltip>
                      </div>
                      {getSchoolAgeRequirement(targetSchool, language) && (
                        <span className="font-semibold text-purple-800 text-[11px] bg-purple-100 px-2 py-0.5 rounded-md">
                          {getSchoolAgeRequirement(targetSchool, language)}
                        </span>
                      )}
                    </div>
                    {/* Bilingual preview */}
                    {(() => {
                      const schoolTrans = getSchoolTranslation(targetSchool);
                      if (!schoolTrans) return null;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-purple-200/70 text-[11px]">
                          <div className="flex items-baseline gap-1 text-purple-950 font-battambang">
                            <span className="font-bold text-amber-600">🇰🇭</span>
                            <span className="font-semibold">{schoolTrans.km}</span>
                          </div>
                          <div className="flex items-baseline gap-1 text-purple-900 font-times">
                            <span className="font-bold text-sky-600">🇬🇧</span>
                            <span>{schoolTrans.en}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Major with Dynamic Option Buttons linked to School */}
              <div className="pt-1 space-y-1.5">
                {targetSchool && schoolSpecificMajors.length > 0 ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs">
                    <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {language === 'km' 
                          ? `ជំនាញនៃសាលាដែលបានជ្រើសរើស (${schoolSpecificMajors.length} ជំនាញ)៖` 
                          : `Matching majors for selected school (${schoolSpecificMajors.length}):`}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAllMajors(!showAllMajors)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                    >
                      {showAllMajors 
                        ? (language === 'km' ? 'បង្ហាញតែជំនាញរបស់សាលានេះ' : 'Show only this school majors') 
                        : (language === 'km' ? 'បង្ហាញជំនាញទាំងអស់' : 'Show all majors')}
                    </button>
                  </div>
                ) : !targetSchool ? (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{t.selectSchoolFirst}</span>
                    </div>
                  </div>
                ) : null}

                <OptionSelector
                  id="student-major"
                  label={t.major}
                  icon={<BookOpen className="w-4 h-4 text-emerald-600" />}
                  value={major}
                  onChange={setMajor}
                  options={activeMajorsList}
                  placeholder={language === 'km' ? 'ស្វែងរក ឬជ្រើសរើសជំនាញ (ខ្មែរ, អង់គ្លេស, ចិន)...' : 'Search major (Khmer, English, Chinese)...'}
                  language={language}
                  colorScheme="emerald"
                  translationType="major"
                />

                {/* Selected Major Translation Preview Card */}
                {major && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[11px]">
                        🎓 {language === 'km' ? 'ជំនាញដែលបានជ្រើសរើស' : 'Selected Major'}
                      </span>
                      <TranslationTooltip text={major} type="major" currentLanguage={language} showBadge>
                        <span className="font-bold text-emerald-950 text-xs sm:text-sm hover:text-emerald-700 underline decoration-dotted">
                          {major}
                        </span>
                      </TranslationTooltip>
                    </div>
                    {(() => {
                      const majorTrans = getMajorTranslation(major);
                      if (!majorTrans) return null;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-emerald-200/70 text-[11px]">
                          <div className="flex items-baseline gap-1 text-emerald-950 font-battambang">
                            <span className="font-bold text-amber-600">🇰🇭</span>
                            <span className="font-semibold">{majorTrans.km}</span>
                          </div>
                          <div className="flex items-baseline gap-1 text-emerald-900 font-times">
                            <span className="font-bold text-sky-600">🇬🇧</span>
                            <span>{majorTrans.en}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Notes / Remarks */}
              <div className="pt-1">
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' 
                    ? 'កំណត់សម្គាល់បន្ថែម (ផ្សេងៗ)' 
                    : language === 'zh-TW' 
                    ? '備註 / 補充說明' 
                    : 'Notes / Remarks'}
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={language === 'km' ? 'កំណត់សម្គាល់ ឬព័ត៌មានបន្ថែម...' : 'Additional notes...'}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-lg border bg-white/60 focus:bg-white/90 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Upload Required Documents */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150" id="document-upload-section">
            {/* Section 5: Document Uploads (6 Required Categories * + 1 Optional) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-indigo-700">
                  <UploadCloud className="w-4 h-4" />
                  <h4 className="font-bold text-slate-800 text-sm tracking-tight">
                    {language === 'km' ? 'Upload ឯកសារភ្ជាប់' : t.documentsSection}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    docValidation.isValid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <FileCheck className="w-3.5 h-3.5" />
                    {docValidation.completedCount} / {docValidation.totalRequired} {language === 'km' ? 'ឯកសារចាំបាច់' : 'required files'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  {t.documentsDesc}
                </p>
              </div>

              {/* Student Document Identification & Batch Download Header */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/75 to-purple-50/75 border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {language === 'km' ? 'កញ្ចប់ឯកសារសិស្ស៖' : 'Student Document Folder:'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
                        #{isOrderMasked ? MASKED_ORDER_SYMBOL : (studentId || 'New')}
                      </span>
                      <span className="font-bold text-indigo-950 text-xs sm:text-sm truncate">
                        {nameKhmer || nameLatin || (language === 'km' ? '(មិនទាន់បំពេញឈ្មោះ)' : '(No name yet)')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'km'
                        ? 'រាល់ឯកសារដែល Upload នឹងត្រូវកត់សម្គាល់ឈ្មោះសិស្សស្វ័យប្រវត្តិ (មិនច្រឡំគ្នា)'
                        : 'All uploaded files are automatically organized under the student profile'}
                    </p>
                  </div>
                </div>

                {uploadedCategoryCount > 0 && isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      downloadAllDocumentsForStudent({
                        studentId: isOrderMasked ? '••••' : studentId,
                        nameKhmer,
                        nameLatin,
                        nameChinese,
                        gender,
                        dob,
                        age,
                        placeOfBirth,
                        idCardNumber,
                        passportNumber,
                        phone,
                        email,
                        currentAddress,
                        fatherNameEnglish,
                        fatherPhone,
                        motherNameEnglish,
                        motherPhone,
                        targetSchool,
                        major,
                        documents,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    title={language === 'km' ? 'ទាញយកឯកសារទាំងអស់របស់សិស្សនេះ' : 'Download all student documents'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'ទាញយកឯកសារទាំងអស់' : 'Download All Docs'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. National ID Card * */}
                <DocumentUploadCard
                  id="doc-id-card"
                  categoryKey="idCard"
                  title={t.docIdCard}
                  subtitle={language === 'km' ? 'ច្បាប់ថតចម្លង ឬរូបភាព (១-៦ ទំព័រ)' : language === 'zh-TW' ? '身分證影本或清晰相片 (1-6 頁)' : 'Copy or photo (1-6 pages)'}
                  required={true}
                  maxPages={6}
                  document={documents.idCard}
                  studentId={isOrderMasked ? undefined : studentId}
                  maskStudentId={isOrderMasked}
                  studentName={nameKhmer || nameLatin}
                  onUploadPages={(pages) => handleDocumentUploadPages('idCard', pages)}
                  onRemovePage={(idx) => handleDocumentRemovePage('idCard', idx)}
                  onRemoveAll={() => handleDocumentRemoveAll('idCard')}
                  onPreview={(doc, title, pageIdx, allPages) => setPreviewDoc({ doc, title, pageIndex: pageIdx, allPages })}
                  language={language}
                  showRequiredError={submittedAttempt && !hasDocUploaded(documents.idCard)}
                />

                {/* 2. Birth Certificate * */}
                <DocumentUploadCard
                  id="doc-birth-cert"
                  categoryKey="birthCert"
                  title={t.docBirthCert}
                  subtitle={language === 'km' ? 'សំបុត្រកំណើតច្បាប់ដើម ឬចម្លង (១-៥ ទំព័រ)' : language === 'zh-TW' ? '正本或驗證影本 (1-5 頁)' : 'Original or certified copy (1-5 pages)'}
                  required={true}
                  document={documents.birthCert}
                  studentId={isOrderMasked ? undefined : studentId}
                  maskStudentId={isOrderMasked}
                  studentName={nameKhmer || nameLatin}
                  onUploadPages={(pages) => handleDocumentUploadPages('birthCert', pages)}
                  onRemovePage={(idx) => handleDocumentRemovePage('birthCert', idx)}
                  onRemoveAll={() => handleDocumentRemoveAll('birthCert')}
                  onPreview={(doc, title, pageIdx, allPages) => setPreviewDoc({ doc, title, pageIndex: pageIdx, allPages })}
                  language={language}
                  showRequiredError={submittedAttempt && !hasDocUploaded(documents.birthCert)}
                />

                {/* 3. Family Book * */}
                <DocumentUploadCard
                  id="doc-family-book"
                  categoryKey="familyBook"
                  title={t.docFamilyBook}
                  subtitle={language === 'km' ? 'ទំព័រគ្រួសារ & សមាជិក (១-៥ ទំព័រ)' : language === 'zh-TW' ? '戶長與全戶成員頁 (1-5 頁)' : 'Family & members pages (1-5 pages)'}
                  required={true}
                  document={documents.familyBook}
                  studentId={isOrderMasked ? undefined : studentId}
                  maskStudentId={isOrderMasked}
                  studentName={nameKhmer || nameLatin}
                  onUploadPages={(pages) => handleDocumentUploadPages('familyBook', pages)}
                  onRemovePage={(idx) => handleDocumentRemovePage('familyBook', idx)}
                  onRemoveAll={() => handleDocumentRemoveAll('familyBook')}
                  onPreview={(doc, title, pageIdx, allPages) => setPreviewDoc({ doc, title, pageIndex: pageIdx, allPages })}
                  language={language}
                  showRequiredError={submittedAttempt && !hasDocUploaded(documents.familyBook)}
                />

                {/* 4. Residence / Stay Book * */}
                <DocumentUploadCard
                  id="doc-residence-book"
                  categoryKey="residenceBook"
                  title={t.docResidenceBook}
                  subtitle={language === 'km' ? 'សៀវភៅស្នាក់នៅ (ក២) (១-៥ ទំព័រ)' : language === 'zh-TW' ? '居住證明 (K2) (1-5 頁)' : 'Stay / Residence book (1-5 pages)'}
                  required={true}
                  document={documents.residenceBook}
                  studentId={isOrderMasked ? undefined : studentId}
                  maskStudentId={isOrderMasked}
                  studentName={nameKhmer || nameLatin}
                  onUploadPages={(pages) => handleDocumentUploadPages('residenceBook', pages)}
                  onRemovePage={(idx) => handleDocumentRemovePage('residenceBook', idx)}
                  onRemoveAll={() => handleDocumentRemoveAll('residenceBook')}
                  onPreview={(doc, title, pageIdx, allPages) => setPreviewDoc({ doc, title, pageIndex: pageIdx, allPages })}
                  language={language}
                  showRequiredError={submittedAttempt && !hasDocUploaded(documents.residenceBook)}
                />

                {/* 5. Secondary / High School Diploma / Certificate * */}
                <DocumentUploadCard
                  id="doc-academic-cert"
                  categoryKey="academicCert"
                  title={t.docAcademicCert}
                  subtitle={language === 'km' ? 'បឋមភូមិ ឬ ទុតិយភូមិ (១-៥ ទំព័រ)' : language === 'zh-TW' ? '初中或高中畢業證書 (1-5 頁)' : 'Secondary / High School Diploma (1-5 pages)'}
                  required={true}
                  document={documents.academicCert}
                  studentId={isOrderMasked ? undefined : studentId}
                  maskStudentId={isOrderMasked}
                  studentName={nameKhmer || nameLatin}
                  onUploadPages={(pages) => handleDocumentUploadPages('academicCert', pages)}
                  onRemovePage={(idx) => handleDocumentRemovePage('academicCert', idx)}
                  onRemoveAll={() => handleDocumentRemoveAll('academicCert')}
                  onPreview={(doc, title, pageIdx, allPages) => setPreviewDoc({ doc, title, pageIndex: pageIdx, allPages })}
                  language={language}
                  showRequiredError={submittedAttempt && !hasDocUploaded(documents.academicCert)}
                />

                {/* 6. Trainee Record Book * (សៀវភៅសិក្ខាគារិក *) */}
                <DocumentUploadCard
                  id="doc-trainee-book"
                  categoryKey="traineeBook"
                  title={t.docTraineeBook || (language === 'km' ? 'សៀវភៅសិក្ខាគារិក' : language === 'zh-TW' ? '學員學習紀錄手冊' : 'Trainee Record Book')}
                  subtitle={language === 'km' ? 'ច្បាប់ចម្លង ឬរូបភាព (១-៥ ទំព័រ)' : language === 'zh-TW' ? '影本或照片 (1-5 頁)' : 'Copy or photo (1-5 pages)'}
                  required={true}
                  document={documents.traineeBook}
                  studentId={isOrderMasked ? undefined : studentId}
                  maskStudentId={isOrderMasked}
                  studentName={nameKhmer || nameLatin}
                  onUploadPages={(pages) => handleDocumentUploadPages('traineeBook', pages)}
                  onRemovePage={(idx) => handleDocumentRemovePage('traineeBook', idx)}
                  onRemoveAll={() => handleDocumentRemoveAll('traineeBook')}
                  onPreview={(doc, title, pageIdx, allPages) => setPreviewDoc({ doc, title, pageIndex: pageIdx, allPages })}
                  language={language}
                  showRequiredError={submittedAttempt && !hasDocUploaded(documents.traineeBook)}
                />

                {/* 7. Passport (លិខិតឆ្លងដែន) */}
                <DocumentUploadCard
                  id="doc-passport"
                  categoryKey="passport"
                  title={t.docPassport}
                  subtitle={language === 'km' ? 'ទំព័រព័ត៌មានលម្អិត (១-៥ ទំព័រ)' : 'Photo bio page (1-5 pages)'}
                  required={false}
                  document={documents.passport}
                  studentId={isOrderMasked ? undefined : studentId}
                  maskStudentId={isOrderMasked}
                  studentName={nameKhmer || nameLatin}
                  onUploadPages={(pages) => handleDocumentUploadPages('passport', pages)}
                  onRemovePage={(idx) => handleDocumentRemovePage('passport', idx)}
                  onRemoveAll={() => handleDocumentRemoveAll('passport')}
                  onPreview={(doc, title, pageIdx, allPages) => setPreviewDoc({ doc, title, pageIndex: pageIdx, allPages })}
                  language={language}
                />
              </div>
            </div>
          </div>
        )}

      </form>

      {/* Modal Footer */}
      <div className="relative z-20 px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {submittedAttempt && Object.keys(errors).length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{t.invalidInfoAlert || (language === 'km' ? 'ព័ត៌មានមិនត្រឹមត្រូវ' : 'Information is incorrect')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 sm:px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors text-xs sm:text-sm cursor-pointer"
          >
            {t.cancel}
          </button>

          {/* Previous / Back Button */}
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="px-3.5 sm:px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'km' ? 'ថយក្រោយ' : language === 'zh-TW' ? '上一步' : 'Back'}</span>
            </button>
          )}

          {/* Next Step Button (Pages 1, 2, 3) */}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="px-4 sm:px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {language === 'km' 
                  ? (currentStep === 1 ? 'បន្ទាប់ ២' : currentStep === 2 ? 'បន្ទាប់ ៣' : 'បន្ទាប់ ៤')
                  : language === 'zh-TW'
                  ? `下一步 (${currentStep + 1})`
                  : `Next ${currentStep + 1}`}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            /* Save Button (Page 4) */
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs hover:shadow-emerald-500/20 transition-all text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'km' ? 'កំពុងរក្សាទុក...' : language === 'zh-TW' ? '正在儲存...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    {isEdit 
                      ? (language === 'km' ? 'រក្សាទុកការកែប្រែ' : language === 'zh-TW' ? '儲存修改資料' : 'Save Changes') 
                      : (language === 'km' ? 'រក្សាទុក' : language === 'zh-TW' ? '儲存資料' : 'Save')}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
        </div>
      </div>

      {/* Lightbox / Document Preview Modal */}
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

      {/* Admin PIN Authorization Modal */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => {
          setIsAdminPinModalOpen(false);
          setPendingAdminAction(null);
        }}
        onSuccess={() => {
          setIsAdmin(true);
          if (pendingAdminAction) {
            pendingAdminAction();
            setPendingAdminAction(null);
          }
        }}
        language={language}
      />

    </>
  );
};
