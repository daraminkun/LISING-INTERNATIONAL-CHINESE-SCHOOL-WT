import { Language } from '../types';

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

/**
 * Converts numbers or numeric strings to Khmer numerals (០, ១, ២, ៣...)
 * when language is 'km', and returns standard Western Arabic digits when language is 'en' or 'zh-TW'.
 */
export function formatNumberByLanguage(val: number | string | undefined | null, language: Language): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (language === 'km') {
    return str.replace(/[0-9]/g, (digit) => KHMER_DIGITS[parseInt(digit, 10)]);
  }
  return str;
}

/**
 * Formats a percentage number with % sign according to current language
 */
export function formatPercentByLanguage(val: number | string | undefined | null, language: Language): string {
  const formatted = formatNumberByLanguage(val, language);
  return `${formatted}%`;
}
