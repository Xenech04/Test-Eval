import React, { useState, useRef } from 'react';
import {
  Check,
  Palette,
  Sparkles,
  RefreshCw,
  Image,
  Sliders,
  Upload,
  Trash2,
  Link as LinkIcon,
  Eye,
  Plus,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_THEME_ID, WALLPAPER_PRESETS, createCustomThemeFromHex } from '../data/themesData';

export const ThemeSelectorAdmin: React.FC = () => {
  const {
    theme,
    themeId,
    setThemeId,
    allThemes,
    customThemes,
    addCustomTheme,
    deleteCustomTheme,
    bgConfig,
    updateBgImage,
    updateBgBlur,
    updateBgOpacity,
    resetBg
  } = useTheme();

  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom theme creator state
  const [showHexCreator, setShowHexCreator] = useState(false);
  const [customNom, setCustomNom] = useState('');
  const [customHexPrimaire, setCustomHexPrimaire] = useState('#0B132B');
  const [customHexAccent, setCustomHexAccent] = useState('#10B981');
  const [customHexSombre, setCustomHexSombre] = useState('#050914');
  const [hexError, setHexError] = useState('');

  const isValidHex = (hex: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());

  const handleCreateCustomTheme = (e: React.FormEvent) => {
    e.preventDefault();
    setHexError('');

    const prim = customHexPrimaire.startsWith('#') ? customHexPrimaire : `#${customHexPrimaire}`;
    const acc = customHexAccent.startsWith('#') ? customHexAccent : `#${customHexAccent}`;
    const somb = customHexSombre.startsWith('#') ? customHexSombre : `#${customHexSombre}`;

    if (!isValidHex(prim)) {
      setHexError('Le code HEX primaire est invalide (ex: #0B132B).');
      return;
    }
    if (!isValidHex(acc)) {
      setHexError("Le code HEX d'accent est invalide (ex: #10B981).");
      return;
    }
    if (somb && !isValidHex(somb)) {
      setHexError('Le code HEX de fond sombre est invalide (ex: #050914).');
      return;
    }

    const themeNom = customNom.trim() || `Thème HEX ${prim}`;
    const newTheme = createCustomThemeFromHex({
      nom: themeNom,
      hexPrimaire: prim,
      hexAccent: acc,
      hexSombre: somb
    });

    addCustomTheme(newTheme);
    setShowHexCreator(false);
    setCustomNom('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateBgImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    updateBgImage(urlInput.trim());
    setShowUrlInput(false);
    setUrlInput('');
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: THEMES SELECTION WITH LIQUID GLASS TECHNOLOGY */}
      <div className="overflow-hidden bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.06)]">
        {/* Dynamic header with current theme - Liquid Glass styling */}
        <div
          style={{
            backgroundColor: theme.headerBg || `${theme.primaire}c0`,
            borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
            boxShadow: `0 8px 24px 0 rgba(0, 0, 0, 0.12), 0 0 20px 0 ${theme.liquidGlassGlow || 'transparent'}`
          }}
          className="p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-2xl border-b transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0 shadow-inner border border-white/25">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Thèmes Visuels — Technologie Liquid Glass</h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  {allThemes.length} thèmes
                </span>
              </div>
              <p className="text-xs text-white/85 mt-0.5">
                Chaque thème intègre la translucidité Liquid Glass avec en-têtes transparents et reflets célestes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowHexCreator(prev => !prev)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
            >
              {showHexCreator ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showHexCreator ? 'Fermer le créateur' : 'Nouveau Thème (HEX)'}</span>
            </button>

            {themeId !== DEFAULT_THEME_ID && (
              <button
                type="button"
                onClick={() => setThemeId(DEFAULT_THEME_ID)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 celestial-interactive"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rétablir le thème par défaut</span>
              </button>
            )}
          </div>
        </div>

        {/* CUSTOM THEME CREATOR VIA MANUAL HEX CODES */}
        {showHexCreator && (
          <div className="p-6 bg-slate-900 text-white border-b border-slate-700/80 animate-in slide-in-from-top-3 duration-200">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Créer un Thème Personnalisé à partir de codes HEX</h4>
                    <p className="text-xs text-slate-400">
                      Saisissez manuellement vos codes HEX ou utilisez les sélecteurs de couleur avec aperçu dynamique.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHexCreator(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {hexError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                  {hexError}
                </div>
              )}

              <form onSubmit={handleCreateCustomTheme} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Theme Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nom du Thème</label>
                    <input
                      type="text"
                      value={customNom}
                      onChange={(e) => setCustomNom(e.target.value)}
                      placeholder="ex: Cyber Midnight, Néon Gold..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Primary Hex */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Couleur Primaire (HEX)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customHexPrimaire.startsWith('#') && customHexPrimaire.length === 7 ? customHexPrimaire : '#0B132B'}
                        onChange={(e) => setCustomHexPrimaire(e.target.value.toUpperCase())}
                        className="w-10 h-9 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={customHexPrimaire}
                        onChange={(e) => setCustomHexPrimaire(e.target.value.toUpperCase())}
                        placeholder="#0B132B"
                        maxLength={7}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                      />
                    </div>
                  </div>

                  {/* Accent Hex */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Couleur d'Accent (HEX)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customHexAccent.startsWith('#') && customHexAccent.length === 7 ? customHexAccent : '#10B981'}
                        onChange={(e) => setCustomHexAccent(e.target.value.toUpperCase())}
                        className="w-10 h-9 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={customHexAccent}
                        onChange={(e) => setCustomHexAccent(e.target.value.toUpperCase())}
                        placeholder="#10B981"
                        maxLength={7}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                      />
                    </div>
                  </div>

                  {/* Dark/Background Hex */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nuance Sombre (HEX)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customHexSombre.startsWith('#') && customHexSombre.length === 7 ? customHexSombre : '#050914'}
                        onChange={(e) => setCustomHexSombre(e.target.value.toUpperCase())}
                        className="w-10 h-9 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={customHexSombre}
                        onChange={(e) => setCustomHexSombre(e.target.value.toUpperCase())}
                        placeholder="#050914"
                        maxLength={7}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview of the entered HEX colors */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>Aperçu en Direct du Thème Généré</span>
                    <span className="font-mono text-[11px] text-sky-400">
                      {customHexPrimaire} • {customHexAccent} • {customHexSombre}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Simulated capsule */}
                    <div
                      style={{ backgroundColor: customHexPrimaire }}
                      className="w-40 h-20 rounded-xl p-3 flex flex-col justify-between text-white relative overflow-hidden shadow-md border border-white/20"
                    >
                      <div
                        style={{ backgroundColor: customHexAccent }}
                        className="absolute -right-2 -top-2 w-12 h-12 rounded-full blur-md opacity-60 pointer-events-none"
                      />
                      <div className="text-[11px] font-black uppercase truncate tracking-wider">
                        {customNom.trim() || 'Aperçu Thème'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ backgroundColor: customHexPrimaire }} className="w-3 h-3 rounded-full border border-white/40" />
                        <span style={{ backgroundColor: customHexAccent }} className="w-3 h-3 rounded-full border border-white/40" />
                        <span style={{ backgroundColor: customHexSombre }} className="w-3 h-3 rounded-full border border-white/40" />
                      </div>
                    </div>

                    {/* Simulated score badge and button */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        style={{ backgroundColor: customHexPrimaire }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" style={{ color: customHexAccent }} />
                        <span>Bouton d'action</span>
                      </div>

                      <div
                        style={{ borderColor: customHexAccent, color: customHexAccent }}
                        className="px-3 py-1.5 rounded-full text-xs font-black border bg-white/5"
                      >
                        Badge 100%
                      </div>

                      {/* Quick Palette Inspiration */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Suggestions rapides :</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomNom('Néon Cyber');
                            setCustomHexPrimaire('#0A192F');
                            setCustomHexAccent('#64FFDA');
                            setCustomHexSombre('#020C1B');
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Néon Cyber
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomNom('Ambre Impérial');
                            setCustomHexPrimaire('#1C1917');
                            setCustomHexAccent('#F59E0B');
                            setCustomHexSombre('#0C0A09');
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Ambre
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomNom('Bordeaux & Or');
                            setCustomHexPrimaire('#4A0404');
                            setCustomHexAccent('#FBBF24');
                            setCustomHexSombre('#2A0202');
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Bordeaux
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHexCreator(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enregistrer et Activer ce Thème</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Single Column List of Themes with Celestial Hover Effects */}
        <div className="p-6">
          <div className="flex flex-col gap-3.5">
            {allThemes.map(t => {
              const isActive = t.id === themeId;

              return (
                <div
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 transition-all duration-200 cursor-pointer border celestial-row ${
                    isActive
                      ? 'bg-slate-50/95 shadow-md ring-2'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-xs'
                  }`}
                  style={{
                    borderColor: isActive ? t.primaire : undefined,
                    boxShadow: isActive ? `0 10px 28px -4px ${t.orbBg1}` : undefined
                  }}
                >
                  {/* Left: Swatch Mini Banner + Details */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Miniature preview capsule with Liquid Glass Header simulation */}
                    <div
                      style={{ backgroundColor: t.primaire }}
                      className="w-24 sm:w-28 h-16 rounded-xl p-2.5 flex flex-col justify-between text-white shrink-0 relative overflow-hidden shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
                    >
                      {/* Simulated liquid glass header overlay */}
                      <div
                        style={{ backgroundColor: t.headerBg }}
                        className="absolute inset-x-0 top-0 h-4 backdrop-blur-xs border-b border-white/20"
                      />
                      <div
                        style={{ backgroundColor: t.accent }}
                        className="absolute -right-2 -top-2 w-10 h-10 rounded-full blur-md opacity-50 pointer-events-none"
                      />
                      <div className="text-[10px] font-black tracking-wider uppercase opacity-90 truncate pt-2">
                        {t.nom}
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          style={{ backgroundColor: t.swatch.primaire }}
                          className="w-2.5 h-2.5 rounded-full border border-white/30"
                        />
                        <div
                          style={{ backgroundColor: t.swatch.accent }}
                          className="w-2.5 h-2.5 rounded-full border border-white/30"
                        />
                        <div
                          style={{ backgroundColor: t.swatch.clair }}
                          className="w-2.5 h-2.5 rounded-full border border-white/30"
                        />
                      </div>
                    </div>

                    {/* Content & Description */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                          {t.nom}
                        </h4>
                        {t.isCustom ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            Personnalisé (HEX)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            Liquid Glass
                          </span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Thème Actuel</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                        {t.description}
                      </p>

                      {/* Color dots bar */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex items-center gap-1">
                          <span
                            title="Couleur Primaire"
                            style={{ backgroundColor: t.swatch.primaire }}
                            className="w-4 h-4 rounded-md border border-slate-300 shadow-2xs inline-block"
                          />
                          <span
                            title="Nuance Sombre"
                            style={{ backgroundColor: t.swatch.sombre }}
                            className="w-4 h-4 rounded-md border border-slate-300 shadow-2xs inline-block"
                          />
                          <span
                            title="Nuance d'Accent"
                            style={{ backgroundColor: t.swatch.accent }}
                            className="w-4 h-4 rounded-md border border-slate-300 shadow-2xs inline-block"
                          />
                          <span
                            title="Teinte Douce"
                            style={{ backgroundColor: t.swatch.clair }}
                            className="w-4 h-4 rounded-md border border-slate-300 shadow-2xs inline-block"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium font-mono">
                          {t.primaire} • {t.accent}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button & Custom Delete */}
                  <div className="sm:pl-4 shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setThemeId(t.id);
                      }}
                      style={{
                        backgroundColor: isActive ? t.primaire : undefined
                      }}
                      className={`w-full sm:w-36 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer celestial-interactive ${
                        isActive
                          ? 'text-white shadow-md ring-2 ring-white/30'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Appliqué</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                          <span>Activer ce thème</span>
                        </>
                      )}
                    </button>

                    {t.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Supprimer le thème personnalisé "${t.nom}" ?`)) {
                            deleteCustomTheme(t.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                        title="Supprimer ce thème personnalisé"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: PERSONNALISATION DE LA PHOTO D'ARRIÈRE-PLAN & RÉGLAGE DU FLOU */}
      <div className="overflow-hidden bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.06)]">
        {/* Card Header with Liquid Glass style */}
        <div
          style={{
            backgroundColor: theme.headerBg || `${theme.primaire}c0`,
            borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
            boxShadow: `0 8px 24px 0 rgba(0, 0, 0, 0.12), 0 0 20px 0 ${theme.liquidGlassGlow || 'transparent'}`
          }}
          className="p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-2xl border-b transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0 shadow-inner border border-white/25">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Image d'Arrière-Plan & Réglage du Flou</h3>
                {bgConfig.imageUrl ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                    Arrière-plan actif
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 border border-white/20">
                    Fond par défaut
                  </span>
                )}
              </div>
              <p className="text-xs text-white/85 mt-0.5">
                Sublimez les 5 thèmes en associant une photo de fond avec flou gaussien réglable et translucidité Liquid Glass.
              </p>
            </div>
          </div>

          {bgConfig.imageUrl && (
            <button
              type="button"
              onClick={resetBg}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-500/30 hover:bg-red-500/50 rounded-xl border border-red-400/40 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer l'image</span>
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Preset Wallpapers Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Sélectionner une ambiance recommandée (Presets Liquid Glass)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Optimisées pour le confort visuel & la lisibilité
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WALLPAPER_PRESETS.map(preset => {
                const isSelected = bgConfig.imageUrl === preset.url;

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      updateBgImage(preset.url);
                      updateBgBlur(preset.blurSuggere);
                      updateBgOpacity(preset.opaciteSuggeree);
                    }}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 celestial-card ${
                      isSelected
                        ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-lg scale-[1.02]'
                        : 'border-slate-200 hover:border-blue-400 shadow-xs'
                    }`}
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={preset.miniature}
                        alt={preset.nom}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <div className="text-xs font-black truncate">{preset.nom}</div>
                        <div className="text-[10px] text-slate-200/85 truncate">{preset.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Upload or URL */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer celestial-interactive"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Importer une photo depuis mon ordinateur</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer celestial-interactive"
            >
              <LinkIcon className="w-4 h-4 text-slate-500" />
              <span>{showUrlInput ? 'Masquer le champ URL' : 'Ajouter via une URL d’image web'}</span>
            </button>
          </div>

          {/* Collapsible URL Input */}
          {showUrlInput && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... ou URL directe"
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Appliquer cette image
              </button>
            </div>
          )}

          {/* Sliders: Blur & Voile Clair Opacity */}
          {bgConfig.imageUrl ? (
            <div className="p-5 bg-gradient-to-br from-blue-50/50 via-white to-sky-50/40 rounded-2xl border border-blue-200/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Réglages d'Affichage & Lisibilité</span>
                </div>

                {/* Quick Presets for Visibility */}
                <div className="flex items-center flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      updateBgBlur(0);
                      updateBgOpacity(0);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-black rounded-lg border transition-all cursor-pointer ${
                      bgConfig.blur === 0 && bgConfig.overlayOpacity === 0
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    Photo 100% Nette & Visible (0 blanc)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateBgBlur(3);
                      updateBgOpacity(10);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      bgConfig.blur === 3 && bgConfig.overlayOpacity === 10
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    Voile Léger (3px / 10%)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateBgBlur(10);
                      updateBgOpacity(20);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      bgConfig.blur === 10 && bgConfig.overlayOpacity === 20
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    Verre Doux (10px / 20%)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blur Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Intensité du Flou (Blur)</span>
                    <span className={`font-black px-2 py-0.5 rounded-md text-xs ${
                      bgConfig.blur === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {bgConfig.blur === 0 ? '0 px — Net (aucun flou)' : `${bgConfig.blur} px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={bgConfig.blur}
                    onChange={(e) => updateBgBlur(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span className="font-bold text-emerald-700">100% Net (0px)</span>
                    <span>Modéré (8px)</span>
                    <span>Flou doux (25px)</span>
                  </div>
                </div>

                {/* Overlay Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Voile Blanc de Lisibilité</span>
                    <span className={`font-black px-2 py-0.5 rounded-md text-xs ${
                      bgConfig.overlayOpacity === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {bgConfig.overlayOpacity === 0 ? '0% — Transparent pur (0 blanc)' : `${bgConfig.overlayOpacity}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="75"
                    step="5"
                    value={bgConfig.overlayOpacity}
                    onChange={(e) => updateBgOpacity(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span className="font-bold text-emerald-700">0% (Aucun blanc)</span>
                    <span>15% (Léger contraste)</span>
                    <span>50%+ (Voile atténué)</span>
                  </div>
                </div>
              </div>

              {bgConfig.blur === 0 && bgConfig.overlayOpacity === 0 && (
                <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Mode Photo Haute Visibilité Actif :</strong> L'image d'arrière-plan s'affiche dans son éclat original sans aucun filtre blanc ni flou artificiel.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-3">
              <Eye className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Sélectionnez une ambiance ci-dessus ou importez une photo pour activer les curseurs de réglage du flou et de la translucidité.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
