'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AppSettings {
  appName: string;
  logoUrl: string;
  theme: 'light' | 'dark';
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  appName: 'CLC Finances',
  logoUrl: '/CLC logo2.png',
  theme: 'dark',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from database
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const dbSettings = await response.json();
          setSettings(dbSettings);
        }
      } catch (error) {
        console.error('Failed to load settings from database:', error);
      }
    };

    loadSettings();

    // Load theme from localStorage for immediate theme switching (fallback)
    const stored = localStorage.getItem('app-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.theme) {
          setSettings(prev => ({ ...prev, theme: parsed.theme }));
        }
      } catch (error) {
        console.error('Failed to parse theme from localStorage:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    // Save theme changes to localStorage for immediate switching
    if (newSettings.theme !== undefined) {
      const stored = localStorage.getItem('app-settings');
      const existing = stored ? JSON.parse(stored) : {};
      localStorage.setItem('app-settings', JSON.stringify({ ...existing, theme: newSettings.theme }));
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
