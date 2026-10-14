/**
 * Place of Birth (ទីកន្លែងកំណើត) Translation Dictionary
 * Provides complete translations in Khmer (ភាសាខ្មែរ),
 * Chinese Traditional (繁體中文), and English for all Cambodian provinces and cities.
 */

export interface PobTranslation {
  code: string;
  km: string;
  zh: string;
  en: string;
}

export const POB_TRANSLATIONS: Record<string, PobTranslation> = {
  "PHNOM PENH": {
    code: "PHNOM PENH",
    km: "រាជធានីភ្នំពេញ (ភ្នំពេញ)",
    zh: "金邊市 (金邊)",
    en: "Phnom Penh Capital",
  },
  "KANDAL": {
    code: "KANDAL",
    km: "ខេត្តកណ្ដាល",
    zh: "干丹省",
    en: "Kandal Province",
  },
  "BATTAMBANG": {
    code: "BATTAMBANG",
    km: "ខេត្តបាត់ដំបង",
    zh: "馬德望省",
    en: "Battambang Province",
  },
  "SIEMREAP": {
    code: "SIEMREAP",
    km: "ខេត្តសៀមរាប",
    zh: "暹粒省",
    en: "Siem Reap Province",
  },
  "SIEM REAP": {
    code: "SIEM REAP",
    km: "ខេត្តសៀមរាប",
    zh: "暹粒省",
    en: "Siem Reap Province",
  },
  "SIHANOUKVILLE": {
    code: "SIHANOUKVILLE",
    km: "ខេត្តព្រះសីហនុ (កំពង់សោម)",
    zh: "西哈努克省 (西港)",
    en: "Preah Sihanouk (Sihanoukville)",
  },
  "PREAH SIHANOUK": {
    code: "PREAH SIHANOUK",
    km: "ខេត្តព្រះសីហនុ",
    zh: "西哈努克省",
    en: "Preah Sihanouk",
  },
  "KOMPOT": {
    code: "KOMPOT",
    km: "ខេត្តកំពត",
    zh: "貢布省",
    en: "Kampot Province",
  },
  "KAMPOT": {
    code: "KAMPOT",
    km: "ខេត្តកំពត",
    zh: "貢布省",
    en: "Kampot Province",
  },
  "KOMPONG CHAM": {
    code: "KOMPONG CHAM",
    km: "ខេត្តកំពង់ចាម",
    zh: "磅湛省",
    en: "Kampong Cham Province",
  },
  "KAMPONG CHAM": {
    code: "KAMPONG CHAM",
    km: "ខេត្តកំពង់ចាម",
    zh: "磅湛省",
    en: "Kampong Cham Province",
  },
  "KOMPONG CHHANG": {
    code: "KOMPONG CHHANG",
    km: "ខេត្តកំពង់ឆ្នាំង",
    zh: "磅清揚省",
    en: "Kampong Chhnang Province",
  },
  "KOMPONG CHHNANG": {
    code: "KOMPONG CHHNANG",
    km: "ខេត្តកំពង់ឆ្នាំង",
    zh: "磅清揚省",
    en: "Kampong Chhnang Province",
  },
  "KAMPONG CHHNANG": {
    code: "KAMPONG CHHNANG",
    km: "ខេត្តកំពង់ឆ្នាំង",
    zh: "磅清揚省",
    en: "Kampong Chhnang Province",
  },
  "KOMPONG SPEU": {
    code: "KOMPONG SPEU",
    km: "ខេត្តកំពង់ស្ពឺ",
    zh: "磅士卑省",
    en: "Kampong Speu Province",
  },
  "KAMPONG SPEU": {
    code: "KAMPONG SPEU",
    km: "ខេត្តកំពង់ស្ពឺ",
    zh: "磅士卑省",
    en: "Kampong Speu Province",
  },
  "KOMPONG THOM": {
    code: "KOMPONG THOM",
    km: "ខេត្តកំពង់ធំ",
    zh: "磅同省",
    en: "Kampong Thom Province",
  },
  "KAMPONG THOM": {
    code: "KAMPONG THOM",
    km: "ខេត្តកំពង់ធំ",
    zh: "磅同省",
    en: "Kampong Thom Province",
  },
  "PREY VENG": {
    code: "PREY VENG",
    km: "ខេត្តព្រៃវែង",
    zh: "波蘿勉省",
    en: "Prey Veng Province",
  },
  "SVAY RIENG": {
    code: "SVAY RIENG",
    km: "ខេត្តស្វាយរៀង",
    zh: "柴楨省",
    en: "Svay Rieng Province",
  },
  "TAKEO": {
    code: "TAKEO",
    km: "ខេត្តតាកែវ",
    zh: "茶膠省",
    en: "Takeo Province",
  },
  "BANTEAY MEANCHEY": {
    code: "BANTEAY MEANCHEY",
    km: "ខេត្តបន្ទាយមានជ័យ",
    zh: "班迭棉吉省",
    en: "Banteay Meanchey Province",
  },
  "KOH KONG": {
    code: "KOH KONG",
    km: "ខេត្តកោះកុង",
    zh: "國公省",
    en: "Koh Kong Province",
  },
  "KRATIE": {
    code: "KRATIE",
    km: "ខេត្តក្រចេះ",
    zh: "桔井省",
    en: "Kratie Province",
  },
  "MONDUL KIRI": {
    code: "MONDUL KIRI",
    km: "ខេត្តមណ្ឌលគិរី",
    zh: "蒙多基里省",
    en: "Mondulkiri Province",
  },
  "MONDULKIRI": {
    code: "MONDULKIRI",
    km: "ខេត្តមណ្ឌលគិរី",
    zh: "蒙多基里省",
    en: "Mondulkiri Province",
  },
  "ODDAR MEANCHEY": {
    code: "ODDAR MEANCHEY",
    km: "ខេត្តឧត្តរមានជ័យ",
    zh: "奧多棉吉省",
    en: "Oddar Meanchey Province",
  },
  "PREAH VIHEAR": {
    code: "PREAH VIHEAR",
    km: "ខេត្តព្រះវិហារ",
    zh: "柏威夏省",
    en: "Preah Vihear Province",
  },
  "PURSAT": {
    code: "PURSAT",
    km: "ខេត្តពោធិ៍សាត់",
    zh: "菩薩省",
    en: "Pursat Province",
  },
  "RATTANAK KIRI": {
    code: "RATTANAK KIRI",
    km: "ខេត្តរតនគិរី",
    zh: "臘塔納基里省",
    en: "Ratanakiri Province",
  },
  "RATANAKIRI": {
    code: "RATANAKIRI",
    km: "ខេត្តរតនគិរី",
    zh: "臘塔納基里省",
    en: "Ratanakiri Province",
  },
  "STUNG TRENG": {
    code: "STUNG TRENG",
    km: "ខេត្តស្ទឹងត្រែង",
    zh: "上丁省",
    en: "Stung Treng Province",
  },
  "KRONG KEP": {
    code: "KRONG KEP",
    km: "ខេត្តកែប (ក្រុងកែប)",
    zh: "白馬市 (白馬省)",
    en: "Kep Province / City",
  },
  "KEP": {
    code: "KEP",
    km: "ខេត្តកែប",
    zh: "白馬省",
    en: "Kep",
  },
  "KRONG PAILIN": {
    code: "KRONG PAILIN",
    km: "ខេត្តប៉ៃលិន (ក្រុងប៉ៃលិន)",
    zh: "拜林市 (拜林省)",
    en: "Pailin Province / City",
  },
  "PAILIN": {
    code: "PAILIN",
    km: "ខេត្តប៉ៃលិន",
    zh: "拜林省",
    en: "Pailin",
  },
  "TBOUNG KHMUM": {
    code: "TBOUNG KHMUM",
    km: "ខេត្តត្បូងឃ្មុំ",
    zh: "特本克蒙省",
    en: "Tboung Khmum Province",
  },
  "TBONG KHMUM": {
    code: "TBONG KHMUM",
    km: "ខេត្តត្បូងឃ្មុំ",
    zh: "特本克蒙省",
    en: "Tboung Khmum Province",
  }
};

/**
 * Lookup Place of Birth translation
 */
export function getPobTranslation(pob?: string): PobTranslation | null {
  if (!pob || !pob.trim()) return null;
  const normalized = pob.trim().toUpperCase();

  if (POB_TRANSLATIONS[normalized]) {
    return POB_TRANSLATIONS[normalized];
  }

  // Partial match fallback
  for (const [key, value] of Object.entries(POB_TRANSLATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return {
    code: pob,
    km: pob,
    zh: pob,
    en: pob
  };
}

/**
 * Format native tooltip string for Place of Birth
 */
export function getPobTooltipTitle(pob?: string): string {
  if (!pob || !pob.trim()) return '';
  const trans = getPobTranslation(pob);
  if (!trans) return pob;
  return `🇰🇭 ខ្មែរ: ${trans.km}\n🇹🇼 繁體中文: ${trans.zh}\n🇬🇧 English: ${trans.en}`;
}
