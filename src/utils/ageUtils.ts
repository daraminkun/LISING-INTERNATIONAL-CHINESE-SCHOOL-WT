/**
 * Age calculation utilities based on Date of Birth string (YYYY-MM-DD or standard date format).
 */

export function calculateAge(dobString?: string): number | null {
  if (!dobString || !dobString.trim()) return null;
  
  const trimmed = dobString.trim();
  const parts = trimmed.split('-');
  let birthDate: Date;
  
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    birthDate = new Date(year, month, day);
  } else {
    birthDate = new Date(trimmed);
  }
  
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 && age < 130 ? age : null;
}

export function formatAge(age: number | string | null | undefined, language: 'km' | 'en' | 'zh-TW' = 'km'): string {
  if (age === null || age === undefined || age === '') return '';
  const num = typeof age === 'number' ? age : parseInt(age.toString().replace(/\D/g, ''), 10);
  if (isNaN(num)) return age.toString();
  if (language === 'zh-TW') return `${num} 歲`;
  return language === 'km' ? `${num} ឆ្នាំ` : `${num} yrs`;
}

/**
 * Cleans Date of Birth strings to show only YYYY-MM-DD, stripping any time, ISO hours (e.g. T00:00:00.000Z),
 * AM/PM or GMT timestamps.
 */
export function formatDobOnly(dob?: string): string {
  if (!dob || !dob.trim()) return '';
  const s = dob.trim();

  // If ISO string like 2005-04-12T15:30:00.000Z
  if (s.includes('T')) {
    const datePart = s.split('T')[0];
    if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  }

  // If format like "2005-04-12 14:30:00" or "2005/04/12 00:00"
  const spaceSplit = s.split(/\s+/);
  if (spaceSplit.length > 1) {
    const firstToken = spaceSplit[0];
    // Check if first token is date format YYYY-MM-DD or DD/MM/YYYY
    if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(firstToken) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(firstToken)) {
      return firstToken;
    }
  }

  // Attempt parse as Date if string contains time indicators
  if (/:\d{2}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  return s;
}
