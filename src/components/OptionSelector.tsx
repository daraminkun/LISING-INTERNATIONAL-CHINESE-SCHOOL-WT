import React, { useState } from 'react';
import { Check, Search, Plus, Edit3, Trash2, X, RotateCcw, Languages, Shield, Lock, Unlock } from 'lucide-react';
import { Language } from '../types';
import { getSchoolTranslation, getMajorTranslation, SchoolTranslation, MajorTranslation } from '../utils/schoolMajorTranslations';
import { getPobTranslation, PobTranslation } from '../utils/pobTranslations';
import { TranslationTooltip } from './TranslationTooltip';

interface OptionSelectorProps {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  language: Language;
  colorScheme?: 'indigo' | 'blue' | 'purple' | 'emerald';
  getOptionTooltip?: (option: string) => string | undefined;
  getOptionBadge?: (option: string) => string | undefined;
  translationType?: 'school' | 'major' | 'pob';
  // Admin Action Handlers
  onAddClick?: () => void;
  onEditClick?: (option: string) => void;
  onDeleteClick?: (option: string) => void;
  isAdmin?: boolean;
  onAdminToggle?: () => void;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  language,
  colorScheme = 'indigo',
  getOptionTooltip,
  getOptionBadge,
  translationType,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isAdmin = false,
  onAdminToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  // Helper to fetch translation
  const getTrans = (opt: string) => {
    if (translationType === 'school') return getSchoolTranslation(opt);
    if (translationType === 'major') return getMajorTranslation(opt);
    if (translationType === 'pob') return getPobTranslation(opt);
    return null;
  };

  // Filter options by search term across original text, Khmer translation, and English translation
  const filteredOptions = options.filter(opt => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    if (opt.toLowerCase().includes(term)) return true;
    
    if (translationType) {
      const trans: any = getTrans(opt);
      if (trans) {
        if (trans.km && trans.km.toLowerCase().includes(term)) return true;
        if (trans.en && trans.en.toLowerCase().includes(term)) return true;
        if (trans.zh && trans.zh.toLowerCase().includes(term)) return true;
      }
    }
    return false;
  });

  const isValueInOptions = options.includes(value);

  // Styling based on color scheme
  const colors = {
    indigo: {
      active: 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold ring-2 ring-indigo-600/20',
      hover: 'hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 bg-white border-slate-200',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accent: 'text-indigo-600',
    },
    blue: {
      active: 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold ring-2 ring-blue-600/20',
      hover: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 bg-white border-slate-200',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      accent: 'text-blue-600',
    },
    purple: {
      active: 'bg-purple-600 text-white border-purple-600 shadow-xs font-semibold ring-2 ring-purple-600/20',
      hover: 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 bg-white border-slate-200',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      accent: 'text-purple-600',
    },
    emerald: {
      active: 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold ring-2 ring-emerald-600/20',
      hover: 'hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 bg-white border-slate-200',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accent: 'text-emerald-600',
    },
  }[colorScheme];

  // If the value exists but is not in the predefined list, default to showing custom mode
  React.useEffect(() => {
    if (value && !isValueInOptions) {
      setIsCustomMode(true);
    }
  }, [value, isValueInOptions]);

  const handleSelectOption = (opt: string) => {
    if (value === opt) {
      onChange(''); // Deselect if clicked again
    } else {
      onChange(opt);
    }
    setIsCustomMode(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  // Limit initially displayed options to 12 if not expanded
  const displayOptions = isExpanded || searchTerm ? filteredOptions : filteredOptions.slice(0, 12);
  const hasMore = filteredOptions.length > 12 && !searchTerm;

  return (
    <div className="space-y-2" id={id}>
      {/* Label and Admin Action Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 text-xs sm:text-sm">
            {icon}
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>

          {/* Admin Mode Badge */}
          {onAdminToggle && (
            <button
              type="button"
              onClick={onAdminToggle}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                isAdmin 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title={isAdmin ? (language === 'km' ? 'Admin Mode បានបើក - ចុចដើម្បីចាក់សោរវិញ' : 'Admin Mode Active - Click to lock') : (language === 'km' ? 'ចុចដើម្បីផ្ទៀងផ្ទាត់សិទ្ធិ Admin' : 'Click to unlock Admin Mode')}
            >
              {isAdmin ? <Unlock className="w-2.5 h-2.5 text-emerald-600" /> : <Lock className="w-2.5 h-2.5 text-slate-400" />}
              <span>{isAdmin ? 'Admin' : 'Admin Only'}</span>
            </button>
          )}
        </div>

        {/* Action Buttons: Add, Edit, Delete */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onAddClick && (
            <button
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs"
              title={language === 'km' ? 'បន្ថែមថ្មី (សម្រាប់តែ Admin)' : 'Add new item (Admin only)'}
            >
              <Plus className="w-3 h-3" />
              <span>add</span>
            </button>
          )}

          {onEditClick && (
            <button
              type="button"
              onClick={() => onEditClick(value)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors shadow-2xs ${
                value 
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={language === 'km' ? 'កែប្រែឈ្មោះ (សម្រាប់តែ Admin)' : 'Edit item (Admin only)'}
            >
              <Edit3 className="w-3 h-3" />
              <span>edit</span>
            </button>
          )}

          {onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(value)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors shadow-2xs ${
                value 
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={language === 'km' ? 'លុបចេញ (សម្រាប់តែ Admin)' : 'Delete item (Admin only)'}
            >
              <Trash2 className="w-3 h-3" />
              <span>delete</span>
            </button>
          )}

          {value && (
            <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-200">
              {translationType ? (
                <TranslationTooltip text={value} type={translationType} currentLanguage={language}>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 cursor-help ${colors.badge}`}>
                    <Check className="w-3 h-3 shrink-0" />
                    <span className="font-semibold truncate max-w-[130px]">{value}</span>
                  </span>
                </TranslationTooltip>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 ${colors.badge}`}>
                  <Check className="w-3 h-3 shrink-0" />
                  <span className="font-semibold truncate max-w-[130px]">{value}</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleClear}
                title={language === 'km' ? 'ដោះការជ្រើសរើស' : 'Clear selection'}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Custom Input Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={placeholder || (language === 'km' ? 'ស្វែងរកជម្រើសរហ័ស...' : 'Quick search options...')}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Custom Input Toggle Button */}
        <button
          type="button"
          onClick={() => {
            setIsCustomMode(!isCustomMode);
            if (!isCustomMode && !value) {
              // focus will be handled
            }
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-colors shrink-0 ${
            isCustomMode || (value && !isValueInOptions)
              ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Edit3 className="w-3 h-3" />
          <span>{language === 'km' ? 'វាយបញ្ចូលដោយដៃ' : language === 'zh-TW' ? '自訂輸入' : 'Custom'}</span>
        </button>
      </div>

      {/* Custom Text Input when active */}
      {(isCustomMode || (value && !isValueInOptions)) && (
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
            <span>{language === 'km' ? 'បញ្ចូលទិន្នន័យជាក់លាក់ដោយដៃ៖' : language === 'zh-TW' ? '直接輸入自訂內容：' : 'Type custom value:'}</span>
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className="text-[11px] text-amber-700 hover:underline"
            >
              {language === 'km' ? 'ជ្រើសរើសពីប៊ូតុងវិញ' : language === 'zh-TW' ? '改由列表點選' : 'Pick from buttons'}
            </button>
          </div>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={language === 'km' ? 'វាយបញ្ចូលទីនេះ...' : language === 'zh-TW' ? '在此輸入內容...' : 'Enter custom value here...'}
            autoFocus
            className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-md border border-amber-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      )}

      {/* Buttons / Chips Grid */}
      <div 
        className="max-h-56 overflow-y-auto pr-1 p-2 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-2"
        onMouseLeave={() => setHoveredOption(null)}
      >
        {filteredOptions.length === 0 ? (
          <div className="text-center py-3 text-slate-400 text-xs">
            {language === 'km' ? 'រកមិនឃើញជម្រើសសមស្រប' : language === 'zh-TW' ? '查無符合選項' : 'No matching options found'}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {displayOptions.map(option => {
              const isSelected = value === option;
              const tooltip = getOptionTooltip?.(option);
              const badge = getOptionBadge?.(option);
              const trans: any = getTrans(option);
              const zhText = trans?.zh || option;

              const nativeTitle = trans 
                ? `🇰🇭 ខ្មែរ: ${trans.km}\n🇹🇼 繁體中文: ${zhText}\n🇬🇧 English: ${trans.en}${tooltip ? `\n🎯 ${tooltip}` : ''}`
                : tooltip ? `${option} • ${tooltip}` : option;

              return (
                <div 
                  key={option} 
                  className="relative group inline-flex"
                  onMouseEnter={() => setHoveredOption(option)}
                  onMouseLeave={() => {
                    if (hoveredOption === option) setHoveredOption(null);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    title={nativeTitle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer select-none ${
                      isSelected ? colors.active : colors.hover
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                    <span>{option}</span>
                    {translationType && (
                      <Languages className={`w-3 h-3 transition-opacity ${isSelected ? 'text-white/70' : 'text-slate-400 opacity-60 group-hover:opacity-100'}`} />
                    )}
                    {badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                        isSelected 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Hover / Active Selection Hint Bar */}
        {hoveredOption ? (
          (() => {
            const trans: any = getTrans(hoveredOption);
            const tooltip = getOptionTooltip?.(hoveredOption);
            if (!trans && !tooltip) return null;
            const zhText = trans?.zh || hoveredOption;

            return (
              <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs space-y-1.5 shadow-lg border border-slate-700 animate-fadeIn">
                <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-amber-400" />
                    <span>{hoveredOption}</span>
                  </span>
                  {tooltip && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 border border-purple-700 text-[10px] font-semibold">
                      🎯 {tooltip}
                    </span>
                  )}
                </div>
                {trans && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] pt-0.5">
                    <div className="text-slate-200 flex items-baseline gap-1">
                      <span className="text-amber-400 font-bold shrink-0">🇰🇭</span>
                      <span className="font-battambang font-medium text-amber-100">{trans.km}</span>
                    </div>
                    <div className="text-slate-200 flex items-baseline gap-1">
                      <span className="text-emerald-400 font-bold shrink-0">🇹🇼</span>
                      <span className="font-medium text-emerald-100">{zhText}</span>
                    </div>
                    <div className="text-slate-200 flex items-baseline gap-1">
                      <span className="text-sky-400 font-bold shrink-0">🇬🇧</span>
                      <span className="font-times font-medium text-sky-100">{trans.en}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : null}

        {/* Show More / Less Toggle */}
        {hasMore && (
          <div className="text-center pt-1 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs font-semibold ${colors.accent} hover:underline`}
            >
              {isExpanded
                ? (language === 'km' ? '↑ បង្រួមជម្រើស' : language === 'zh-TW' ? '↑ 收合選項' : '↑ Show less')
                : (language === 'km' ? `↓ បង្ហាញបន្ថែម (${filteredOptions.length - 12} ទៀត)` : language === 'zh-TW' ? `↓ 顯示更多 (+${filteredOptions.length - 12})` : `↓ Show more (+${filteredOptions.length - 12} more)`)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
