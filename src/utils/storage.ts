import { BlocRubrique, ChargeDeFlux, Evaluation, ThemeBackgroundConfig, AppTheme, UserAccount, SessionState } from '../types';
import { INITIAL_BLOCS, INITIAL_CHARGES_DE_FLUX, INITIAL_EVALUATIONS, INITIAL_NIVEAUX } from '../data/initialData';
import { DEFAULT_BG_CONFIG, DEFAULT_THEME_ID } from '../data/themesData';

const STORAGE_KEYS = {
  CHARGES_DE_FLUX: 'cdf_eval_charges_de_flux_v1',
  BLOCS: 'cdf_eval_blocs_v1',
  EVALUATIONS: 'cdf_eval_evaluations_v1',
  NIVEAUX: 'cdf_eval_niveaux_v1',
  CLEARED_FLAG: 'cdf_eval_is_cleared_v1',
  THEME_ID: 'cdf_eval_theme_id_v1',
  THEME_BG: 'cdf_eval_theme_bg_v1',
  CUSTOM_THEMES: 'cdf_eval_custom_themes_v1',
  APP_NAME: 'cdf_eval_app_name_v1',
  USER_ACCOUNTS: 'cdf_eval_user_accounts_v1',
  CURRENT_SESSION: 'cdf_eval_current_session_v1'
};

// ==================== SQLITE API INTEGRATION ====================

export async function fetchSQLiteStatus(): Promise<{
  online: boolean;
  engine?: string;
  managersCount?: number;
  evaluationsCount?: number;
  dbFile?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      online: true,
      engine: data.engine,
      managersCount: data.managersCount,
      evaluationsCount: data.evaluationsCount,
      dbFile: data.dbFile
    };
  } catch (err: any) {
    console.warn('[SQLite] Backend inaccessible, mode secours actif:', err.message);
    return { online: false, error: err.message };
  }
}

export async function fetchAllDataFromSQLite(): Promise<{
  managers: ChargeDeFlux[];
  blocs: BlocRubrique[];
  evaluations: Evaluation[];
  niveaux: string[];
  themeId: string;
  themeBg?: ThemeBackgroundConfig;
  appName?: string;
} | null> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      // Sync local storage with authoritative SQLite database
      if (Array.isArray(json.data.managers) && json.data.managers.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CHARGES_DE_FLUX, JSON.stringify(json.data.managers));
      }
      if (Array.isArray(json.data.blocs) && json.data.blocs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BLOCS, JSON.stringify(json.data.blocs));
      }
      if (Array.isArray(json.data.evaluations)) {
        localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(json.data.evaluations));
      }
      if (Array.isArray(json.data.niveaux) && json.data.niveaux.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NIVEAUX, JSON.stringify(json.data.niveaux));
      }
      if (json.data.themeId) {
        localStorage.setItem(STORAGE_KEYS.THEME_ID, json.data.themeId);
      }
      if (json.data.themeBg) {
        localStorage.setItem(STORAGE_KEYS.THEME_BG, JSON.stringify(json.data.themeBg));
      }
      if (json.data.appName) {
        localStorage.setItem(STORAGE_KEYS.APP_NAME, json.data.appName);
      }
      return json.data;
    }
  } catch (err) {
    console.warn('[SQLite] Erreur récupération /api/data:', err);
  }
  return null;
}

export async function syncEvaluationToSQLite(evaluation: Evaluation): Promise<boolean> {
  try {
    const res = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation)
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur synchro évaluation vers SQLite:', err);
    return false;
  }
}

export async function syncManagersToSQLite(managers: ChargeDeFlux[]): Promise<boolean> {
  try {
    const res = await fetch('/api/managers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(managers)
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur synchro managers vers SQLite:', err);
    return false;
  }
}

export async function syncBlocsToSQLite(blocs: BlocRubrique[]): Promise<boolean> {
  try {
    const res = await fetch('/api/blocs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blocs)
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur synchro blocs vers SQLite:', err);
    return false;
  }
}

export async function syncNiveauxToSQLite(niveaux: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/niveaux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(niveaux)
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur synchro niveaux vers SQLite:', err);
    return false;
  }
}

export async function syncThemeToSQLite(themeId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeId })
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur synchro thème vers SQLite:', err);
    return false;
  }
}

export async function syncThemeBgToSQLite(bgConfig: ThemeBackgroundConfig): Promise<boolean> {
  try {
    const res = await fetch('/api/theme-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bgConfig)
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur synchro arrière-plan thème vers SQLite:', err);
    return false;
  }
}

export async function syncAppNameToSQLite(appName: string): Promise<boolean> {
  try {
    const res = await fetch('/api/app-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appName })
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur synchro nom outil vers SQLite:', err);
    return false;
  }
}

export async function resetDefaultsInSQLite(): Promise<boolean> {
  try {
    const res = await fetch('/api/reset-defaults', { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur reset-defaults SQLite:', err);
    return false;
  }
}

export async function clearAllInSQLite(): Promise<boolean> {
  try {
    const res = await fetch('/api/clear-all', { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.error('[SQLite] Erreur clear-all SQLite:', err);
    return false;
  }
}

// ==================== LOCALSTORAGE METHODS WITH AUTO-SYNC ====================

const VALID_BUILTIN_THEMES = ['moderne', 'celeste', 'obsidienne'];

export function loadCustomThemes(): AppTheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading custom themes:', e);
  }
  return [];
}

export function saveCustomThemes(themes: AppTheme[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(themes));
  } catch (e) {
    console.error('Error saving custom themes:', e);
  }
}

export function loadThemeId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME_ID);
    if (raw && typeof raw === 'string') {
      if (VALID_BUILTIN_THEMES.includes(raw)) {
        return raw;
      }
      const customThemes = loadCustomThemes();
      if (customThemes.some(t => t.id === raw)) {
        return raw;
      }
    }
  } catch (e) {
    console.error('Error loading theme:', e);
  }
  return DEFAULT_THEME_ID;
}

export function saveThemeId(themeId: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_ID, themeId);
    syncThemeToSQLite(themeId);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
}

export function loadThemeBg(): ThemeBackgroundConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME_BG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          imageUrl: typeof parsed.imageUrl === 'string' ? parsed.imageUrl : DEFAULT_BG_CONFIG.imageUrl,
          blur: typeof parsed.blur === 'number' ? Math.min(30, Math.max(0, parsed.blur)) : DEFAULT_BG_CONFIG.blur,
          overlayOpacity: typeof parsed.overlayOpacity === 'number' ? Math.min(100, Math.max(0, parsed.overlayOpacity)) : DEFAULT_BG_CONFIG.overlayOpacity
        };
      }
    }
  } catch (e) {
    console.error('Error loading theme bg:', e);
  }
  return { ...DEFAULT_BG_CONFIG };
}

export function saveThemeBg(bgConfig: ThemeBackgroundConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_BG, JSON.stringify(bgConfig));
    syncThemeBgToSQLite(bgConfig);
  } catch (e) {
    console.error('Error saving theme bg:', e);
  }
}

export function loadAppName(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_NAME);
    if (raw && typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
  } catch (e) {
    console.error('Error loading app name:', e);
  }
  return 'CONCENTRIX';
}

export function saveAppName(appName: string) {
  try {
    const clean = appName.trim() || 'CONCENTRIX';
    localStorage.setItem(STORAGE_KEYS.APP_NAME, clean);
    syncAppNameToSQLite(clean);
  } catch (e) {
    console.error('Error saving app name:', e);
  }
}

export function loadNiveaux(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NIVEAUX);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading niveaux:', e);
  }
  return INITIAL_NIVEAUX;
}

export function saveNiveaux(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NIVEAUX, JSON.stringify(items));
    syncNiveauxToSQLite(items);
  } catch (e) {
    console.error('Error saving niveaux:', e);
  }
}

export function loadChargesDeFlux(): ChargeDeFlux[] {
  try {
    const isCleared = localStorage.getItem(STORAGE_KEYS.CLEARED_FLAG) === 'true';
    const raw = localStorage.getItem(STORAGE_KEYS.CHARGES_DE_FLUX);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    if (isCleared) return [];
  } catch (e) {
    console.error('Error loading charges de flux:', e);
  }
  return INITIAL_CHARGES_DE_FLUX;
}

export function saveChargesDeFlux(items: ChargeDeFlux[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHARGES_DE_FLUX, JSON.stringify(items));
    localStorage.removeItem(STORAGE_KEYS.CLEARED_FLAG);
    syncManagersToSQLite(items);
  } catch (e) {
    console.error('Error saving charges de flux:', e);
  }
}

export function loadBlocs(): BlocRubrique[] {
  try {
    const isCleared = localStorage.getItem(STORAGE_KEYS.CLEARED_FLAG) === 'true';
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    if (isCleared) return [];
  } catch (e) {
    console.error('Error loading blocs:', e);
  }
  return INITIAL_BLOCS;
}

export function saveBlocs(items: BlocRubrique[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCS, JSON.stringify(items));
    localStorage.removeItem(STORAGE_KEYS.CLEARED_FLAG);
    syncBlocsToSQLite(items);
  } catch (e) {
    console.error('Error saving blocs:', e);
  }
}

export function loadEvaluations(): Evaluation[] {
  try {
    const isCleared = localStorage.getItem(STORAGE_KEYS.CLEARED_FLAG) === 'true';
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    if (isCleared) return [];
  } catch (e) {
    console.error('Error loading evaluations:', e);
  }
  return INITIAL_EVALUATIONS;
}

export function saveEvaluations(items: Evaluation[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(items));
    localStorage.removeItem(STORAGE_KEYS.CLEARED_FLAG);
  } catch (e) {
    console.error('Error saving evaluations:', e);
  }
}

/**
 * Resets storage back to initial pre-loaded demo/template data
 */
export function resetAllToDefaults() {
  localStorage.removeItem(STORAGE_KEYS.CHARGES_DE_FLUX);
  localStorage.removeItem(STORAGE_KEYS.BLOCS);
  localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
  localStorage.removeItem(STORAGE_KEYS.NIVEAUX);
  localStorage.removeItem(STORAGE_KEYS.CLEARED_FLAG);
  resetDefaultsInSQLite();
}

/**
 * Completely wipes all records (empty database)
 */
export function clearAllData() {
  localStorage.setItem(STORAGE_KEYS.CLEARED_FLAG, 'true');
  localStorage.setItem(STORAGE_KEYS.CHARGES_DE_FLUX, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.BLOCS);
  clearAllInSQLite();
}

// ==================== USER ACCOUNTS & SESSION STORAGE ====================

export function loadUserAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading user accounts:', e);
  }
  return [];
}

export function saveUserAccounts(accounts: UserAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving user accounts:', e);
  }
}

export function loadCurrentSession(): SessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.isExplicit === true) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading current session:', e);
  }
  return null;
}

export function saveCurrentSession(session: SessionState | null) {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  } catch (e) {
    console.error('Error saving current session:', e);
  }
}


