/**
 * Institution Branding Service
 * Provides centralized management of the school's official identity:
 * - Logo URL (stored permanently in IndexedDB)
 * - 3 Official Language Names (Khmer, Chinese 繁體中文, English)
 * - Abbreviation / Badge (e.g. LSIS)
 * - Real-time subscription and React hook for live UI updates across all components.
 */

import { useState, useEffect } from 'react';
import { dbStorage, InstitutionSettings, DEFAULT_INSTITUTION_SETTINGS } from './dbStorage';

class InstitutionService {
  private currentSettings: InstitutionSettings = { ...DEFAULT_INSTITUTION_SETTINGS };
  private listeners: Set<(settings: InstitutionSettings) => void> = new Set();

  constructor() {
    this.currentSettings = dbStorage.getCachedInstitutionSettings();

    // Listen to dbStorage ready or window events
    dbStorage.whenReady().then(() => {
      this.currentSettings = dbStorage.getCachedInstitutionSettings();
      this.notify();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('institution_settings_updated', (e: any) => {
        if (e.detail) {
          this.currentSettings = e.detail;
          this.notify();
        }
      });
    }
  }

  getSettings(): InstitutionSettings {
    return { ...this.currentSettings };
  }

  getLogoUrl(): string {
    return this.currentSettings.logoUrl || '/logo.jpg';
  }

  getName(language: string): string {
    if (language === 'zh-TW' || language === 'zh') {
      return this.currentSettings.nameZh || this.currentSettings.nameKm;
    }
    if (language === 'en') {
      return this.currentSettings.nameEn || this.currentSettings.nameKm;
    }
    return this.currentSettings.nameKm;
  }

  subscribe(callback: (settings: InstitutionSettings) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.getSettings()));
  }

  async updateSettings(updates: Partial<InstitutionSettings>): Promise<InstitutionSettings> {
    const updated = await dbStorage.saveInstitutionSettings(updates);
    this.currentSettings = updated;
    this.notify();
    return updated;
  }

  async resetToDefault(): Promise<InstitutionSettings> {
    return this.updateSettings(DEFAULT_INSTITUTION_SETTINGS);
  }
}

export const institutionService = new InstitutionService();

/**
 * React hook to access and subscribe to current Institution Settings
 */
export function useInstitution(): InstitutionSettings {
  const [settings, setSettings] = useState<InstitutionSettings>(() => institutionService.getSettings());

  useEffect(() => {
    const unsub = institutionService.subscribe(setSettings);
    return unsub;
  }, []);

  return settings;
}
