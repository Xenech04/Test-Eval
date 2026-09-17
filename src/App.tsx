import React, { useState, useEffect } from 'react';
import {
  loadChargesDeFlux,
  saveChargesDeFlux,
  loadBlocs,
  saveBlocs,
  loadEvaluations,
  saveEvaluations,
  loadNiveaux,
  saveNiveaux,
  loadAppName,
  saveAppName,
  resetAllToDefaults,
  clearAllData,
  fetchAllDataFromSQLite,
  syncEvaluationToSQLite,
  fetchSQLiteStatus
} from './utils/storage';
import { BlocRubrique, ChargeDeFlux, Evaluation, OngletPrincipal } from './types';
import { Navbar } from './components/Navbar';
import { EvaluationSection } from './components/EvaluationSection';
import { MesDocsSection } from './components/MesDocsSection';
import { ParametresSection } from './components/ParametresSection';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { AttestationModal } from './components/AttestationModal';

function AppContent() {
  const { theme, setThemeId, bgConfig, setBgConfig } = useTheme();
  const { currentUser, isLoggedIn } = useAuth();
  const [ongletActif, setOngletActif] = useState<OngletPrincipal>(() => {
    return currentUser?.role === 'collaborateur' ? 'mes_docs' : 'evaluation';
  });
  const [appName, setAppName] = useState<string>(() => loadAppName());

  // Redirection d'accueil automatique à la connexion selon le profil utilisateur :
  // - Collaborateurs : tombent directement sur la section "Mes docs"
  // - Responsables N+1 & Administrateurs : tombent directement sur la section "Évaluation"
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'collaborateur') {
      setOngletActif('mes_docs');
    } else {
      setOngletActif('evaluation');
    }
  }, [currentUser?.id, currentUser?.role]);

  // Réinitialisation de l'onglet lors de la déconnexion
  useEffect(() => {
    if (!isLoggedIn) {
      setOngletActif('evaluation');
    }
  }, [isLoggedIn]);

  // Si un collaborateur se retrouve sur l'onglet 'evaluation' (accès interdit), redirection vers 'mes_docs'
  useEffect(() => {
    if (currentUser?.role === 'collaborateur' && ongletActif === 'evaluation') {
      setOngletActif('mes_docs');
    }
  }, [currentUser?.role, ongletActif]);

  // Core Persistent States
  const [chargesDeFlux, setChargesDeFlux] = useState<ChargeDeFlux[]>(() => loadChargesDeFlux());
  const [blocs, setBlocs] = useState<BlocRubrique[]>(() => loadBlocs());
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => loadEvaluations());
  const [niveaux, setNiveaux] = useState<string[]>(() => loadNiveaux());

  // Deep linking between sections
  const [preselectEval, setPreselectEval] = useState<{
    chargeId: string;
    mois: number;
    annee: number;
  } | null>(null);

  // Attestation modal state
  const [attestationEval, setAttestationEval] = useState<Evaluation | null>(null);

  // Bootstrap from SQLite on mount silently
  useEffect(() => {
    let isMounted = true;
    async function initSQLite() {
      try {
        const status = await fetchSQLiteStatus();
        if (status.online && isMounted) {
          const remoteData = await fetchAllDataFromSQLite();
          if (remoteData && isMounted) {
            if (remoteData.managers && remoteData.managers.length > 0) {
              setChargesDeFlux(remoteData.managers);
            }
            if (remoteData.blocs && remoteData.blocs.length > 0) {
              setBlocs(remoteData.blocs);
            }
            if (remoteData.evaluations) {
              setEvaluations(remoteData.evaluations);
            }
            if (remoteData.niveaux && remoteData.niveaux.length > 0) {
              setNiveaux(remoteData.niveaux);
            }
            if (remoteData.themeId) {
              setThemeId(remoteData.themeId);
            }
            if (remoteData.themeBg) {
              setBgConfig(remoteData.themeBg);
            }
            if (remoteData.appName) {
              setAppName(remoteData.appName);
            }
          }
        }
      } catch (err) {
        console.warn('Initialisation données:', err);
      }
    }
    initSQLite();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateAppName = (name: string) => {
    setAppName(name);
    saveAppName(name);
  };

  // Handlers for state updates
  const handleUpdateCharges = (updated: ChargeDeFlux[]) => {
    setChargesDeFlux(updated);
    saveChargesDeFlux(updated);
  };

  const handleUpdateBlocs = (updated: BlocRubrique[]) => {
    setBlocs(updated);
    saveBlocs(updated);
  };

  const handleUpdateNiveaux = (updated: string[]) => {
    setNiveaux(updated);
    saveNiveaux(updated);
  };

  const handleSaveEvaluation = (evalData: Evaluation) => {
    setEvaluations(prev => {
      const idx = prev.findIndex(
        e =>
          e.id === evalData.id ||
          (e.chargeDeFluxId === evalData.chargeDeFluxId &&
            e.mois === evalData.mois &&
            e.annee === evalData.annee)
      );
      let next: Evaluation[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = evalData;
      } else {
        next = [evalData, ...prev];
      }
      saveEvaluations(next);
      return next;
    });

    // Auto-save to SQLite in background
    syncEvaluationToSQLite(evalData);
  };

  // Restore Default Demo Data
  const handleResetDefaults = () => {
    resetAllToDefaults();
    const freshCharges = loadChargesDeFlux();
    const freshBlocs = loadBlocs();
    const freshEvals = loadEvaluations();
    const freshNiveaux = loadNiveaux();
    setChargesDeFlux(freshCharges);
    setBlocs(freshBlocs);
    setEvaluations(freshEvals);
    setNiveaux(freshNiveaux);
  };

  // Complete Data Wipe (Purge complète)
  const handleClearAllData = () => {
    clearAllData();
    setChargesDeFlux([]);
    setEvaluations([]);
  };

  const handleSelectEvaluationToEdit = (chargeId: string, mois: number, annee: number) => {
    setPreselectEval({ chargeId, mois, annee });
    setOngletActif('evaluation');
  };

  const handleAttestEvaluation = (evalId: string, commentaireCollaborateur: string) => {
    const target = evaluations.find(e => e.id === evalId);
    if (!target) return;
    const updatedEval: Evaluation = {
      ...target,
      isAttested: true,
      dateAttestation: new Date().toISOString(),
      signatureCollaborateur: currentUser?.nomAffiche || 'Collaborateur',
      commentaireCollaborateur: commentaireCollaborateur.trim() || undefined
    };
    handleSaveEvaluation(updatedEval);
    setAttestationEval(null);
  };

  const activeAttestationCharge = attestationEval
    ? chargesDeFlux.find(c => c.id === attestationEval.chargeDeFluxId) || chargesDeFlux[0]
    : null;

  // L'utilisateur doit d'abord insérer l'identifiant et mot de passe pour accéder à l'outil
  if (!isLoggedIn || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans antialiased relative selection:bg-blue-500 selection:text-white">
      {/* Dynamic Background Layer: Full Vivid Wallpaper Photo or Default Gradient */}
      {bgConfig?.imageUrl ? (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
            style={{
              backgroundImage: `url(${bgConfig.imageUrl})`,
              filter: bgConfig.blur > 0 ? `blur(${bgConfig.blur}px)` : 'none',
              transform: bgConfig.blur > 0 ? 'scale(1.06)' : 'scale(1.0)',
            }}
          />
          {/* Optional white overlay only if user chooses opacity > 0 */}
          {bgConfig.overlayOpacity > 0 && (
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${bgConfig.overlayOpacity / 100})`,
              }}
            />
          )}
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100/80" />
      )}

      {/* Liquid Glass Background Orbs matching dynamic theme (only active when no wallpaper image) */}
      {!bgConfig?.imageUrl && (
        <>
          <div
            style={{ backgroundColor: theme.orbBg1 }}
            className="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0 transition-colors duration-500"
          />
          <div
            style={{ backgroundColor: theme.orbBg2 }}
            className="fixed bottom-10 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0 transition-colors duration-500"
          />
        </>
      )}

      {/* Top Navbar */}
      <Navbar
        ongletActif={ongletActif}
        onChangerOnglet={(onglet) => {
          setOngletActif(onglet);
          if (onglet !== 'evaluation') {
            setPreselectEval(null);
          }
        }}
        nbCharges={chargesDeFlux.length}
        nbEvaluations={evaluations.length}
        appName={appName}
        evaluations={evaluations}
        onOpenAttestation={(evalItem) => setAttestationEval(evalItem)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 relative z-10">
        {ongletActif === 'evaluation' && (
          <EvaluationSection
            chargesDeFlux={chargesDeFlux}
            blocs={blocs}
            evaluations={evaluations}
            onSaveEvaluation={handleSaveEvaluation}
            selectedChargeIdInitial={preselectEval?.chargeId}
            selectedMoisInitial={preselectEval?.mois}
            selectedAnneeInitial={preselectEval?.annee}
            onNavigateToMesDocs={() => setOngletActif('mes_docs')}
          />
        )}

        {ongletActif === 'mes_docs' && (
          <MesDocsSection
            chargesDeFlux={chargesDeFlux}
            blocs={blocs}
            evaluations={evaluations}
            onSelectEvaluationToEdit={handleSelectEvaluationToEdit}
            onOpenAttestation={(evalItem) => setAttestationEval(evalItem)}
          />
        )}

        {ongletActif === 'parametres' && (
          <ParametresSection
            chargesDeFlux={chargesDeFlux}
            blocs={blocs}
            niveaux={niveaux}
            onUpdateChargesDeFlux={handleUpdateCharges}
            onUpdateBlocs={handleUpdateBlocs}
            onUpdateNiveaux={handleUpdateNiveaux}
            onResetDefaults={handleResetDefaults}
            onClearAllData={handleClearAllData}
            appName={appName}
            onUpdateAppName={handleUpdateAppName}
          />
        )}
      </main>

      {/* User Login Modal */}
      <LoginModal />

      {/* Attestation & Signature Modal for Collaborators */}
      {attestationEval && activeAttestationCharge && (
        <AttestationModal
          evaluation={attestationEval}
          charge={activeAttestationCharge}
          blocs={blocs}
          isOpen={Boolean(attestationEval)}
          onClose={() => setAttestationEval(null)}
          onAttest={handleAttestEvaluation}
        />
      )}

      {/* Footer without SQLite reference, plain CONCENTRIX Madagascar */}
      <footer className="border-t border-white/60 bg-white/50 backdrop-blur-md py-4 px-4 text-center text-xs text-slate-500 print:hidden max-w-[1700px] mx-auto w-full">
        <p>CONCENTRIX Madagascar</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

