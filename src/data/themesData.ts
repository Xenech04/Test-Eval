import { AppTheme, ThemeBackgroundConfig } from '../types';

export interface WallpaperPreset {
  id: string;
  nom: string;
  description: string;
  url: string;
  miniature: string;
  blurSuggere: number;
  opaciteSuggeree: number;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'aurora',
    nom: 'Céleste Aurore',
    description: 'Aurore liquide aux reflets opalescents et lumineux',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80',
    miniature: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=70',
    blurSuggere: 0,
    opaciteSuggeree: 0
  },
  {
    id: 'prism-glass',
    nom: 'Verre & Prisme',
    description: 'Réfraction prismatique sur verre contemporain',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80',
    miniature: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=70',
    blurSuggere: 0,
    opaciteSuggeree: 0
  },
  {
    id: 'arch-minimal',
    nom: 'Verrière Moderne',
    description: 'Géométrie architecturale lumineuse et verrières épurées',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
    miniature: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=70',
    blurSuggere: 0,
    opaciteSuggeree: 0
  },
  {
    id: 'waves-pastel',
    nom: 'Ondes Fluides',
    description: 'Vagues soyeuses aux nuances satinées',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    miniature: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=70',
    blurSuggere: 0,
    opaciteSuggeree: 0
  }
];

export const DEFAULT_BG_CONFIG: ThemeBackgroundConfig = {
  imageUrl: '',
  blur: 0,
  overlayOpacity: 0
};

export const APP_THEMES: AppTheme[] = [
  {
    id: 'moderne',
    nom: 'Moderne',
    description: 'Liquid Glass Cyber : bleu minéral translucide souligné d’une lueur émeraude prismatique.',
    primaire: '#0B132B',
    bordure: '#1C2541',
    sombre: '#050914',
    accent: '#10B981',
    accentClair: '#ECFDF5',
    degrade: 'from-[#0B132B]/80 via-[#1C2541]/70 to-[#047857]/65',
    texteEnTete: 'text-white',
    sousTexteEnTete: 'text-emerald-100/90',
    badgeBg: 'bg-emerald-50',
    badgeBordure: 'border-emerald-200',
    badgeTexte: 'text-emerald-800',
    boutonHover: '#1C2541',
    anneauFocus: '#10B981',
    orbBg1: 'rgba(11, 19, 43, 0.18)',
    orbBg2: 'rgba(16, 185, 129, 0.16)',
    headerBg: 'rgba(11, 19, 43, 0.76)',
    headerBorder: 'rgba(16, 185, 129, 0.35)',
    headerReflectColor: 'rgba(255, 255, 255, 0.24)',
    liquidGlassGlow: 'rgba(16, 185, 129, 0.30)',
    swatch: {
      primaire: '#0B132B',
      sombre: '#050914',
      accent: '#10B981',
      clair: '#ECFDF5'
    }
  },
  {
    id: 'celeste',
    nom: 'Céleste Indigo',
    description: 'Liquid Glass Céleste : bleu nuit et indigo profond illuminé par une lueur ultraviolette.',
    primaire: '#1E1B4B',
    bordure: '#312E81',
    sombre: '#0F0E2A',
    accent: '#6366F1',
    accentClair: '#EEF2FF',
    degrade: 'from-[#1E1B4B]/80 via-[#312E81]/70 to-[#4F46E5]/65',
    texteEnTete: 'text-white',
    sousTexteEnTete: 'text-indigo-100/90',
    badgeBg: 'bg-indigo-50',
    badgeBordure: 'border-indigo-200',
    badgeTexte: 'text-indigo-800',
    boutonHover: '#312E81',
    anneauFocus: '#6366F1',
    orbBg1: 'rgba(30, 27, 75, 0.20)',
    orbBg2: 'rgba(99, 102, 241, 0.18)',
    headerBg: 'rgba(30, 27, 75, 0.78)',
    headerBorder: 'rgba(99, 102, 241, 0.35)',
    headerReflectColor: 'rgba(255, 255, 255, 0.25)',
    liquidGlassGlow: 'rgba(99, 102, 241, 0.32)',
    swatch: {
      primaire: '#1E1B4B',
      sombre: '#0F0E2A',
      accent: '#6366F1',
      clair: '#EEF2FF'
    }
  },
  {
    id: 'obsidienne',
    nom: 'Obsidienne & Or',
    description: 'Liquid Glass Précieux : noir d’encre épuré réhaussé d’ambre chaud et doré.',
    primaire: '#18181B',
    bordure: '#27272A',
    sombre: '#09090B',
    accent: '#F59E0B',
    accentClair: '#FFFBEB',
    degrade: 'from-[#18181B]/85 via-[#27272A]/75 to-[#B45309]/65',
    texteEnTete: 'text-white',
    sousTexteEnTete: 'text-amber-100/90',
    badgeBg: 'bg-amber-50',
    badgeBordure: 'border-amber-200',
    badgeTexte: 'text-amber-800',
    boutonHover: '#27272A',
    anneauFocus: '#F59E0B',
    orbBg1: 'rgba(24, 24, 27, 0.18)',
    orbBg2: 'rgba(245, 158, 11, 0.16)',
    headerBg: 'rgba(24, 24, 27, 0.80)',
    headerBorder: 'rgba(245, 158, 11, 0.35)',
    headerReflectColor: 'rgba(255, 255, 255, 0.25)',
    liquidGlassGlow: 'rgba(245, 158, 11, 0.28)',
    swatch: {
      primaire: '#18181B',
      sombre: '#09090B',
      accent: '#F59E0B',
      clair: '#FFFBEB'
    }
  }
];

export const DEFAULT_THEME_ID = 'moderne';

// Hex color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length !== 6) {
    return { r: 15, g: 23, b: 42 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darkenHex(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = Math.max(0, 1 - percent / 100);
  const dr = Math.round(r * factor).toString(16).padStart(2, '0');
  const dg = Math.round(g * factor).toString(16).padStart(2, '0');
  const db = Math.round(b * factor).toString(16).padStart(2, '0');
  return `#${dr}${dg}${db}`.toUpperCase();
}

export function lightenHex(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = Math.min(100, Math.max(0, percent)) / 100;
  const lr = Math.round(r + (255 - r) * factor).toString(16).padStart(2, '0');
  const lg = Math.round(g + (255 - g) * factor).toString(16).padStart(2, '0');
  const lb = Math.round(b + (255 - b) * factor).toString(16).padStart(2, '0');
  return `#${lr}${lg}${lb}`.toUpperCase();
}

export function createCustomThemeFromHex(params: {
  id?: string;
  nom: string;
  hexPrimaire: string;
  hexAccent: string;
  hexSombre?: string;
}): AppTheme {
  const id = params.id || `custom-${Date.now()}`;
  const nom = params.nom.trim() || 'Mon Thème Perso';
  const hexPrimaire = params.hexPrimaire.startsWith('#') ? params.hexPrimaire : `#${params.hexPrimaire}`;
  const hexAccent = params.hexAccent.startsWith('#') ? params.hexAccent : `#${params.hexAccent}`;
  const hexSombre = params.hexSombre
    ? (params.hexSombre.startsWith('#') ? params.hexSombre : `#${params.hexSombre}`)
    : darkenHex(hexPrimaire, 40);

  const bordure = darkenHex(hexPrimaire, 15);
  const accentClair = lightenHex(hexAccent, 85);
  const boutonHover = darkenHex(hexPrimaire, 20);

  return {
    id,
    nom,
    description: `Thème personnalisé créé à partir des codes HEX (${hexPrimaire} / ${hexAccent}).`,
    isCustom: true,
    primaire: hexPrimaire,
    bordure,
    sombre: hexSombre,
    accent: hexAccent,
    accentClair,
    degrade: `from-[${hexPrimaire}]/80 via-[${hexSombre}]/70 to-[${hexAccent}]/65`,
    texteEnTete: 'text-white',
    sousTexteEnTete: 'text-white/85',
    badgeBg: 'bg-slate-50',
    badgeBordure: 'border-slate-200',
    badgeTexte: 'text-slate-800',
    boutonHover,
    anneauFocus: hexAccent,
    orbBg1: hexToRgba(hexPrimaire, 0.20),
    orbBg2: hexToRgba(hexAccent, 0.18),
    headerBg: hexToRgba(hexPrimaire, 0.78),
    headerBorder: hexToRgba(hexAccent, 0.35),
    headerReflectColor: 'rgba(255, 255, 255, 0.25)',
    liquidGlassGlow: hexToRgba(hexAccent, 0.30),
    swatch: {
      primaire: hexPrimaire,
      sombre: hexSombre,
      accent: hexAccent,
      clair: accentClair
    }
  };
}

export function getThemeById(id: string, customThemes: AppTheme[] = []): AppTheme {
  const all = [...APP_THEMES, ...customThemes];
  const found = all.find(t => t.id === id);
  return found || APP_THEMES[0];
}
