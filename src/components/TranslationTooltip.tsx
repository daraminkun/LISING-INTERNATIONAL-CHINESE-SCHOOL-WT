import React, { useState, useRef, useEffect } from 'react';
import { Building2, GraduationCap, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { getSchoolTranslation, getMajorTranslation, SchoolTranslation, MajorTranslation } from '../utils/schoolMajorTranslations';
import { getPobTranslation, PobTranslation } from '../utils/pobTranslations';
import { getSchoolAgeRequirement } from '../constants/studentOptions';
import { Language } from '../types';

interface TranslationTooltipProps {
  text?: string;
  type: 'school' | 'major' | 'pob';
  currentLanguage?: Language;
  className?: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'auto';
  showBadge?: boolean;
}

export const TranslationTooltip: React.FC<TranslationTooltipProps> = ({
  text,
  type,
  currentLanguage = 'km',
  className = '',
  children,
  position = 'top',
  showBadge = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!text || !text.trim()) {
    return <span className={className}>-</span>;
  }

  const schoolData: SchoolTranslation | null = type === 'school' ? getSchoolTranslation(text) : null;
  const majorData: MajorTranslation | null = type === 'major' ? getMajorTranslation(text) : null;
  const pobData: PobTranslation | null = type === 'pob' ? getPobTranslation(text) : null;
  const ageReq = type === 'school' ? getSchoolAgeRequirement(text, currentLanguage) : undefined;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const updatePosition = () => {
    if (position !== 'auto' && (position === 'top' || position === 'bottom')) {
      setTooltipPos(position);
      return;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // If close to top of viewport, show below
      if (rect.top < 180) {
        setTooltipPos('bottom');
      } else {
        setTooltipPos('top');
      }
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  const khmerText = type === 'school' ? schoolData?.km : type === 'major' ? majorData?.km : pobData?.km;
  const englishText = type === 'school' ? schoolData?.en : type === 'major' ? majorData?.en : pobData?.en;
  const chineseText = type === 'school' ? (schoolData?.zh || text) : type === 'major' ? (majorData?.zh || text) : (pobData?.zh || text);

  // Native tooltip for fallback
  const nativeTitle = `🇰🇭 ខ្មែរ: ${khmerText || '-'}\n🇹🇼 中文(繁體): ${chineseText || '-'}\n🇬🇧 English: ${englishText || '-'}`;

  return (
    <div
      ref={triggerRef}
      onClick={toggleOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center group/trans cursor-help max-w-full ${className}`}
      title={nativeTitle}
    >
      {/* Content to display */}
      {children ? (
        children
      ) : (
        <span className="truncate border-b border-dotted border-slate-400/60 hover:border-indigo-500 transition-colors">
          {text}
        </span>
      )}

      {/* Floating Translation Tooltip Popover */}
      {isOpen && (
        <div
          ref={tooltipRef}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          className={`absolute z-50 left-1/2 -translate-x-1/2 min-w-[280px] max-w-[340px] sm:max-w-[380px] w-max p-3.5 rounded-xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150 text-left pointer-events-auto select-text font-sans ${
            tooltipPos === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-700/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              {type === 'school' ? (
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              ) : type === 'major' ? (
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>
                {type === 'school' 
                  ? 'បកប្រែឈ្មោះសាលា (School Translation)' 
                  : type === 'major'
                  ? 'បកប្រែជំនាញ (Major Translation)'
                  : 'បកប្រែទីកន្លែងកំណើត (Place of Birth Translation)'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {type === 'school' ? 'សាលារៀន' : type === 'major' ? 'ជំនាញ' : 'ទីកន្លែងកំណើត'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* 1. Khmer Translation (ភាសាខ្មែរ) */}
            <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 mb-0.5">
                <span>🇰🇭</span>
                <span>ភាសាខ្មែរ (Khmer):</span>
              </div>
              <p className="font-bold text-white text-xs leading-relaxed font-battambang pl-5">
                {khmerText || text}
              </p>
            </div>

            {/* 2. Traditional Chinese (ភាសាចិនបែបបុរាណ) */}
            <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 mb-0.5">
                <span>🇹🇼</span>
                <span>繁體中文 (Traditional Chinese):</span>
              </div>
              <p className="font-medium text-slate-200 text-xs pl-5 font-kai">
                {chineseText}
              </p>
            </div>

            {/* 3. English Translation (ភាសាអង់គ្លេស) */}
            <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-300 mb-0.5">
                <span>🇬🇧</span>
                <span>English (អង់គ្លេស):</span>
              </div>
              <p className="font-semibold text-slate-100 text-xs leading-snug pl-5 font-times">
                {englishText || text}
              </p>
            </div>

            {/* Additional details for schools: Location and Age criteria */}
            {type === 'school' && (schoolData || ageReq) && (
              <div className="pt-1 border-t border-slate-800/80 flex flex-col gap-1 text-[11px]">
                {schoolData?.locationKm && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{schoolData.locationKm} ({schoolData.locationEn})</span>
                  </div>
                )}
                {ageReq && (
                  <div className="flex items-center gap-1.5 text-purple-300 bg-purple-950/60 px-2 py-1 rounded border border-purple-800/50">
                    <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="font-medium">{ageReq}</span>
                  </div>
                )}
              </div>
            )}

            {/* Additional details for majors: Category */}
            {type === 'major' && majorData?.categoryKm && (
              <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>ប្រភេទជំនាញ៖</span>
                <span className="text-emerald-300 font-semibold">{majorData.categoryKm}</span>
              </div>
            )}
          </div>

          {/* Pointer Arrow */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 border-slate-700/80 ${
              tooltipPos === 'top'
                ? '-bottom-1.5 border-r border-b'
                : '-top-1.5 border-l border-t'
            }`}
          />
        </div>
      )}
    </div>
  );
};
