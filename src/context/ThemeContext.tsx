import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppTheme, ThemeBackgroundConfig } from '../types';
import { APP_THEMES, getThemeById, DEFAULT_BG_CONFIG, DEFAULT_THEME_ID } from '../data/themesData';
import { loadThemeId, saveThemeId, loadThemeBg, saveThemeBg, loadCustomThemes, saveCustomThemes } from '../utils/storage';

interface ThemeContextType {
  theme: AppTheme;
  themeId: string;
  setThemeId: (id: string) => void;
  allThemes: AppTheme[];
  customThemes: AppTheme[];
  addCustomTheme: (newTheme: AppTheme) => void;
  deleteCustomTheme: (id: string) => void;
  bgConfig: ThemeBackgroundConfig;
  setBgConfig: (config: ThemeBackgroundConfig) => void;
  updateBgImage: (url: string) => void;
  updateBgBlur: (blur: number) => void;
  updateBgOpacity: (opacity: number) => void;
  resetBg: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(() => loadThemeId());
  const [bgConfig, setBgConfigState] = useState<ThemeBackgroundConfig>(() => loadThemeBg());
  const [customThemes, setCustomThemes] = useState<AppTheme[]>(() => loadCustomThemes());

  const allThemes = useMemo(() => [...APP_THEMES, ...customThemes], [customThemes]);
  const currentTheme = useMemo(() => getThemeById(themeId, customThemes), [themeId, customThemes]);

  const setThemeId = useCallback((newId: string) => {
    setThemeIdState(newId);
    saveThemeId(newId);
  }, []);

  const addCustomTheme = useCallback((newTheme: AppTheme) => {
    setCustomThemes(prev => {
      const filtered = prev.filter(t => t.id !== newTheme.id);
      const updated = [newTheme, ...filtered];
      saveCustomThemes(updated);
      return updated;
    });
    setThemeIdState(newTheme.id);
    saveThemeId(newTheme.id);
  }, []);

  const deleteCustomTheme = useCallback((id: string) => {
    setCustomThemes(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveCustomThemes(updated);
      return updated;
    });
    setThemeIdState(prev => {
      if (prev === id) {
        saveThemeId(DEFAULT_THEME_ID);
        return DEFAULT_THEME_ID;
      }
      return prev;
    });
  }, []);

  const setBgConfig = useCallback((config: ThemeBackgroundConfig) => {
    setBgConfigState(config);
    saveThemeBg(config);
  }, []);

  const updateBgImage = useCallback((url: string) => {
    setBgConfigState(prev => {
      const next = { ...prev, imageUrl: url };
      saveThemeBg(next);
      return next;
    });
  }, []);

  const updateBgBlur = useCallback((blur: number) => {
    setBgConfigState(prev => {
      const next = { ...prev, blur: Math.min(30, Math.max(0, blur)) };
      saveThemeBg(next);
      return next;
    });
  }, []);

  const updateBgOpacity = useCallback((opacity: number) => {
    setBgConfigState(prev => {
      const next = { ...prev, overlayOpacity: Math.min(100, Math.max(0, opacity)) };
      saveThemeBg(next);
      return next;
    });
  }, []);

  const resetBg = useCallback(() => {
    const emptyConfig: ThemeBackgroundConfig = {
      ...DEFAULT_BG_CONFIG,
      imageUrl: ''
    };
    setBgConfigState(emptyConfig);
    saveThemeBg(emptyConfig);
  }, []);

  useEffect(() => {
    // Inject dynamic CSS custom properties for global styling
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.primaire);
    root.style.setProperty('--theme-border', currentTheme.bordure);
    root.style.setProperty('--theme-dark', currentTheme.sombre);
    root.style.setProperty('--theme-accent', currentTheme.accent);
    root.style.setProperty('--theme-accent-light', currentTheme.accentClair);
    root.style.setProperty('--theme-hover', currentTheme.boutonHover);
    root.style.setProperty('--theme-header-bg', currentTheme.headerBg);
    root.style.setProperty('--theme-header-border', currentTheme.headerBorder);
    root.style.setProperty('--theme-glow', currentTheme.liquidGlassGlow);
  }, [currentTheme]);

  const contextValue = React.useMemo(
    () => ({
      theme: currentTheme,
      themeId,
      setThemeId,
      allThemes,
      customThemes,
      addCustomTheme,
      deleteCustomTheme,
      bgConfig,
      setBgConfig,
      updateBgImage,
      updateBgBlur,
      updateBgOpacity,
      resetBg
    }),
    [
      currentTheme,
      themeId,
      setThemeId,
      allThemes,
      customThemes,
      addCustomTheme,
      deleteCustomTheme,
      bgConfig,
      setBgConfig,
      updateBgImage,
      updateBgBlur,
      updateBgOpacity,
      resetBg
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
