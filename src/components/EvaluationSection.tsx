import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Save,
  AlertCircle,
  MessageSquare,
  Award,
  Sparkles,
  Lock,
  Unlock,
  ChevronRight,
  ShieldCheck,
  Plus,
  Trash2,
  FileText,
  TrendingUp,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  BlocRubrique,
  ChargeDeFlux,
  Evaluation,
  EvaluationRubriqueDetail,
  NoteValeur,
  StatutEvaluation,
  ActionSuivi,
  StatutSuiviAction
} from '../types';
import { getFilteredChargesForUser } from '../utils/roleAccess';
import {
  NOTE_OPTIONS,
  calculerScoresEvaluation,
  getScoreAppreciation,
  getStatutBadge
} from '../utils/scoring';
import { MOIS_LABELS, ANNEES_DISPONIBLES } from '../data/initialData';
import { ValidationModal } from './ValidationModal';
import { PdfExportModal } from './PdfExportModal';
import { Sparkline } from './Sparkline';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';

interface EvaluationSectionProps {
  chargesDeFlux: ChargeDeFlux[];
  blocs: BlocRubrique[];
  evaluations: Evaluation[];
  onSaveEvaluation: (evaluation: Evaluation) => void;
  selectedChargeIdInitial?: string;
  selectedMoisInitial?: number;
  selectedAnneeInitial?: number;
  onNavigateToMesDocs?: () => void;
}

export const EvaluationSection: React.FC<EvaluationSectionProps> = ({
  chargesDeFlux,
  blocs,
  evaluations,
  onSaveEvaluation,
  selectedChargeIdInitial,
  selectedMoisInitial,
  selectedAnneeInitial,
  onNavigateToMesDocs
}) => {
  const { theme } = useTheme();
  const { currentRole, currentUser } = useAuth();

  // Restrict charges list strictly based on role: N+1 only sees members of their team, Collaborateur only sees themselves
  const availableCharges = useMemo(() => {
    return getFilteredChargesForUser(chargesDeFlux, currentUser);
  }, [chargesDeFlux, currentUser]);

  // Current selection state
  const [selectedChargeId, setSelectedChargeId] = useState<string>(
    selectedChargeIdInitial || (availableCharges[0]?.id || '')
  );

  // Sync selectedChargeId if availableCharges changes
  useEffect(() => {
    if (availableCharges.length > 0 && !availableCharges.some(c => c.id === selectedChargeId)) {
      setSelectedChargeId(availableCharges[0].id);
    }
  }, [availableCharges, selectedChargeId]);

  const [selectedMois, setSelectedMois] = useState<number>(
    selectedMoisInitial || new Date().getMonth() + 1
  );
  const [selectedAnnee, setSelectedAnnee] = useState<number>(
    selectedAnneeInitial || new Date().getFullYear()
  );

  // Active evaluation form fields
  const [dateEntretien, setDateEntretien] = useState<string>('');
  const [statut, setStatut] = useState<StatutEvaluation>('pas_commence');
  const [nPlusUn, setNPlusUn] = useState<string>('');
  const [notes, setNotes] = useState<Record<string, EvaluationRubriqueDetail>>({});
  const [commentaireGlobal, setCommentaireGlobal] = useState<string>('');
  const [dateValidation, setDateValidation] = useState<string | undefined>(undefined);

  // Rubrique Suivi (plans d'actions discutés précédemment: non noté, OK / KO / En cours)
  const [actionsSuivi, setActionsSuivi] = useState<ActionSuivi[]>([]);
  const [nouvelleActionTitre, setNouvelleActionTitre] = useState('');
  const [nouvelleActionDate, setNouvelleActionDate] = useState('');
  const [nouvelleActionComment, setNouvelleActionComment] = useState('');
  const [isAddingAction, setIsAddingAction] = useState(false);

  // Modals & notifications
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showStickyScoreBubble, setShowStickyScoreBubble] = useState<boolean>(false);

  // Check if current evaluation is frozen (attested by collaborator)
  const existingEval = useMemo(() => {
    return evaluations.find(
      e => e.chargeDeFluxId === selectedChargeId && e.mois === selectedMois && e.annee === selectedAnnee
    );
  }, [evaluations, selectedChargeId, selectedMois, selectedAnnee]);

  const isFrozen = Boolean(existingEval?.isAttested);
  const isReadOnly = isFrozen || currentRole === 'collaborateur';

  // Monitor scroll position to display minimalist sticky score bubble
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 260) {
        setShowStickyScoreBubble(true);
      } else {
        setShowStickyScoreBubble(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Currently selected ChargeDeFlux object
  const activeCharge = useMemo(() => {
    return chargesDeFlux.find(c => c.id === selectedChargeId) || chargesDeFlux[0];
  }, [chargesDeFlux, selectedChargeId]);

  // Sync selection when initial props change
  useEffect(() => {
    if (selectedChargeIdInitial) setSelectedChargeId(selectedChargeIdInitial);
    if (selectedMoisInitial) setSelectedMois(selectedMoisInitial);
    if (selectedAnneeInitial) setSelectedAnnee(selectedAnneeInitial);
  }, [selectedChargeIdInitial, selectedMoisInitial, selectedAnneeInitial]);

  const lastLoadedKeyRef = useRef<string>('');

  // Find prior evaluation for this flow manager to propose carrying over actions
  const priorEvaluation = useMemo(() => {
    if (!selectedChargeId) return null;
    const sameFlowManagerEvals = evaluations
      .filter(e => e.chargeDeFluxId === selectedChargeId && (e.annee < selectedAnnee || (e.annee === selectedAnnee && e.mois < selectedMois)))
      .sort((a, b) => (b.annee === a.annee ? b.mois - a.mois : b.annee - a.annee));
    return sameFlowManagerEvals[0] || null;
  }, [selectedChargeId, selectedMois, selectedAnnee, evaluations]);

  // Load existing evaluation or start fresh when charge/month/year changes
  useEffect(() => {
    if (!selectedChargeId) return;

    const currentKey = `${selectedChargeId}-${selectedMois}-${selectedAnnee}`;
    const isSameKey = lastLoadedKeyRef.current === currentKey;

    const existing = evaluations.find(
      e => e.chargeDeFluxId === selectedChargeId && e.mois === selectedMois && e.annee === selectedAnnee
    );

    // If we have already loaded this key, do NOT overwrite the user's active draft
    if (isSameKey) {
      if (existing && Object.keys(notes).length === 0 && statut === 'pas_commence') {
        setDateEntretien(existing.dateEntretien || '');
        setStatut(existing.statut);
        setNPlusUn(existing.nPlusUn || (activeCharge?.nPlusUn || ''));
        setNotes(existing.notes || {});
        setCommentaireGlobal(existing.commentaireGlobal || '');
        setDateValidation(existing.dateValidation);
        setActionsSuivi(existing.actionsSuivi || []);
      }
      return;
    }

    lastLoadedKeyRef.current = currentKey;

    if (existing) {
      setDateEntretien(existing.dateEntretien || '');
      setStatut(existing.statut);
      setNPlusUn(existing.nPlusUn || (activeCharge?.nPlusUn || ''));
      setNotes(existing.notes || {});
      setCommentaireGlobal(existing.commentaireGlobal || '');
      setDateValidation(existing.dateValidation);
      setActionsSuivi(existing.actionsSuivi || []);
    } else {
      // Start a draft
      setDateEntretien(new Date().toISOString().split('T')[0]);
      setStatut('pas_commence');
      setNPlusUn(activeCharge?.nPlusUn || '');
      setNotes({});
      setCommentaireGlobal('');
      setDateValidation(undefined);

      // Pre-fill actions from prior evaluation if available
      if (priorEvaluation && priorEvaluation.actionsSuivi && priorEvaluation.actionsSuivi.length > 0) {
        setActionsSuivi(
          priorEvaluation.actionsSuivi.map(act => ({
            ...act,
            id: `act-carried-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            provenanceEvaluation: `${MOIS_LABELS[priorEvaluation.mois - 1]} ${priorEvaluation.annee}`
          }))
        );
      } else {
        setActionsSuivi([]);
      }
    }
  }, [selectedChargeId, selectedMois, selectedAnnee, evaluations, activeCharge, priorEvaluation]);

  // Calculate live scores
  const scoreResults = useMemo(() => {
    return calculerScoresEvaluation(blocs, notes);
  }, [blocs, notes]);

  const appreciation = useMemo(() => {
    return getScoreAppreciation(scoreResults.scoreTotal);
  }, [scoreResults.scoreTotal]);

  const statutBadge = getStatutBadge(statut);

  // Handle note selection for a rubric
  const handleSetNote = (rubriqueId: string, valeur: NoteValeur) => {
    setNotes(prev => {
      const current = prev[rubriqueId] || { note: null, commentaire: '' };
      const newNote = current.note === valeur ? null : valeur;
      return {
        ...prev,
        [rubriqueId]: {
          ...current,
          note: newNote
        }
      };
    });

    setStatut(prev => (prev === 'pas_commence' ? 'en_cours' : prev));
  };

  // Handle comment update for a rubric
  const handleSetComment = (rubriqueId: string, commentaire: string) => {
    setNotes(prev => {
      const current = prev[rubriqueId] || { note: null, commentaire: '' };
      return {
        ...prev,
        [rubriqueId]: {
          ...current,
          commentaire
        }
      };
    });

    setStatut(prev => (prev === 'pas_commence' && commentaire.trim().length > 0 ? 'en_cours' : prev));
  };

  // --- Handlers for Rubrique Suivi (Actions) ---
  const handleSetActionStatut = (actionId: string, nouveauStatut: StatutSuiviAction) => {
    setActionsSuivi(prev =>
      prev.map(act => (act.id === actionId ? { ...act, statut: nouveauStatut } : act))
    );
    if (statut === 'pas_commence') setStatut('en_cours');
  };

  const handleSetActionCommentaire = (actionId: string, commentaire: string) => {
    setActionsSuivi(prev =>
      prev.map(act => (act.id === actionId ? { ...act, commentaire } : act))
    );
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouvelleActionTitre.trim()) return;

    const newAction: ActionSuivi = {
      id: `act-${Date.now()}`,
      titre: nouvelleActionTitre.trim(),
      statut: 'En cours',
      datePrevue: nouvelleActionDate || undefined,
      commentaire: nouvelleActionComment.trim() || undefined
    };

    setActionsSuivi([...actionsSuivi, newAction]);
    setNouvelleActionTitre('');
    setNouvelleActionDate('');
    setNouvelleActionComment('');
    setIsAddingAction(false);
    triggerToast('Plan d’action ajouté à la rubrique Suivi.');
    if (statut === 'pas_commence') setStatut('en_cours');
  };

  const handleDeleteAction = (actionId: string) => {
    setActionsSuivi(prev => prev.filter(a => a.id !== actionId));
    triggerToast('Point de suivi retiré.');
  };

  const handleImportPriorActions = () => {
    if (!priorEvaluation || !priorEvaluation.actionsSuivi || priorEvaluation.actionsSuivi.length === 0) {
      triggerToast('Aucun plan d’action trouvé sur l’évaluation précédente.');
      return;
    }

    const imported = priorEvaluation.actionsSuivi.map(act => ({
      ...act,
      id: `act-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      provenanceEvaluation: `${MOIS_LABELS[priorEvaluation.mois - 1]} ${priorEvaluation.annee}`
    }));

    setActionsSuivi(prev => [...prev, ...imported]);
    triggerToast(`${imported.length} plan(s) d'action importé(s) de ${MOIS_LABELS[priorEvaluation.mois - 1]}.`);
  };

  // Build current evaluation object
  const buildCurrentEvaluation = (newStatut?: StatutEvaluation, validatedDate?: string): Evaluation => {
    const existing = evaluations.find(
      e => e.chargeDeFluxId === selectedChargeId && e.mois === selectedMois && e.annee === selectedAnnee
    );

    return {
      id: existing ? existing.id : `eval-${selectedChargeId}-${selectedMois}-${selectedAnnee}-${Date.now()}`,
      chargeDeFluxId: selectedChargeId,
      mois: selectedMois,
      annee: selectedAnnee,
      dateEntretien: dateEntretien || new Date().toISOString().split('T')[0],
      statut: newStatut || statut,
      nPlusUn: nPlusUn.trim() || (activeCharge?.nPlusUn || ''),
      notes,
      actionsSuivi,
      commentaireGlobal,
      scoreBehavior: scoreResults.scoreBehavior,
      scoreManagement: scoreResults.scoreManagement,
      scoreDelivery: scoreResults.scoreDelivery,
      scoreTotal: scoreResults.scoreTotal,
      dateValidation: validatedDate !== undefined ? validatedDate : dateValidation,
      validePar: newStatut === 'termine' ? (nPlusUn.trim() || activeCharge?.nPlusUn) : undefined,
      derniereModification: new Date().toISOString(),
      isAttested: existing?.isAttested,
      dateAttestation: existing?.dateAttestation,
      signatureCollaborateur: existing?.signatureCollaborateur,
      commentaireCollaborateur: existing?.commentaireCollaborateur
    };
  };

  // Save as in progress (Brouillon)
  const handleSaveDraft = () => {
    const currentStatut = statut === 'termine' ? 'termine' : 'en_cours';
    const evalData = buildCurrentEvaluation(currentStatut);
    onSaveEvaluation(evalData);
    setStatut(currentStatut);
    triggerToast('Évaluation enregistrée en tant que brouillon (En cours).');
  };

  // Open validation warning modal
  const handleOpenValidateModal = () => {
    if (scoreResults.rubriquesNonNotees > 0) {
      triggerToast(
        `Impossible de valider : il reste ${scoreResults.rubriquesNonNotees} rubrique(s) non notée(s). Attribuez une note ou sélectionnez N/A.`
      );
      return;
    }
    setIsValidationModalOpen(true);
  };

  // Confirm final validation
  const handleConfirmValidation = () => {
    const nowIso = new Date().toISOString();
    const evalData = buildCurrentEvaluation('termine', nowIso);
    onSaveEvaluation(evalData);
    setStatut('termine');
    setDateValidation(nowIso);
    setIsValidationModalOpen(false);
    triggerToast('Évaluation validée avec succès ! Statut passé à Terminé.');
  };

  // Unlock evaluation if needed
  const handleUnlockEvaluation = () => {
    if (isFrozen) {
      triggerToast('Impossible de déverrouiller : cette évaluation a été officiellement attestée et figée par le collaborateur.');
      return;
    }
    setStatut('en_cours');
    const evalData = buildCurrentEvaluation('en_cours');
    onSaveEvaluation(evalData);
    triggerToast('Évaluation déverrouillée pour modification.');
  };

  const isCompleted = statut === 'termine';

  // History scores for sparkline of active manager
  const managerHistoryScores = useMemo(() => {
    return evaluations
      .filter(e => e.chargeDeFluxId === selectedChargeId)
      .sort((a, b) => (a.annee === b.annee ? a.mois - b.mois : a.annee - b.annee))
      .map(e => e.scoreTotal);
  }, [evaluations, selectedChargeId]);

  if (!activeCharge) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">
          {currentRole === 'n_plus_un' ? 'Aucun collaborateur dans votre équipe' : 'Aucun collaborateur configuré'}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {currentRole === 'n_plus_un'
            ? "Aucun collaborateur n'est actuellement rattaché à votre équipe. Veuillez contacter un administrateur."
            : "Rendez-vous dans la section Paramètres pour ajouter vos collaborateurs."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#003D5B] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2 border border-sky-400/30 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Minimalist Final Score Bubble on Scroll (Dark theme for vivid badge text contrast) */}
      {showStickyScoreBubble && activeCharge && (
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed top-20 right-4 sm:right-8 z-40 cursor-pointer animate-in fade-in slide-in-from-top-3 duration-300 transition-all hover:scale-105 select-none"
          title="Cliquer pour remonter au tableau récapitulatif"
        >
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-full pl-2.5 pr-4 py-2 flex items-center gap-3 border border-slate-700/80 shadow-[0_16px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/10 hover:border-slate-500 transition-all">
            {/* Manager Avatar */}
            <div className="relative">
              <Avatar photoUrl={activeCharge.photoUrl} nomPrenom={activeCharge.nomPrenom} size="sm" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>

            {/* Manager Info */}
            <div className="hidden sm:block text-left pr-1">
              <div className="text-xs font-black text-white leading-tight max-w-[140px] truncate">
                {activeCharge.nomPrenom}
              </div>
              <div className="text-[10px] text-slate-300 font-medium">
                {scoreResults.rubriquesRemplies}/{scoreResults.totalRubriques} critères notés
              </div>
            </div>

            <div className="h-5 w-px bg-slate-700/80 hidden sm:block" />

            {/* Final Score in % */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700 shadow-inner">
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">Note</span>
              <span className="text-sm sm:text-base font-black text-white">
                {scoreResults.scoreTotal}%
              </span>
            </div>

            {/* Appreciation Badge - vivid color pops with high contrast on dark bubble */}
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shadow-sm ${appreciation.badgeColor}`}>
              {appreciation.texte}
            </span>
          </div>
        </div>
      )}

      {/* TOP SELECTION BAR - Liquid Glass Card */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Header bar with Liquid Glass dynamic theme */}
        <div
          style={{
            backgroundColor: theme.headerBg || `${theme.primaire}c0`,
            borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
            boxShadow: `0 8px 24px 0 rgba(0, 0, 0, 0.12), 0 0 20px 0 ${theme.liquidGlassGlow || 'transparent'}`
          }}
          className="p-4 sm:p-5 text-white flex items-center justify-between backdrop-blur-2xl border-b transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sélection de la Session d'Évaluation</h2>
              <p className="text-[11px] text-sky-100/75">Choisissez le Manager et la période mensuelle à évaluer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statutBadge.badgeColor}`}
            >
              <span className={`w-2 h-2 rounded-full ${statutBadge.dotColor}`} />
              {statutBadge.label}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Col 1: Manager Selection with Large Photo */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-inner celestial-interactive">
            <Avatar
              photoUrl={activeCharge?.photoUrl}
              nomPrenom={activeCharge?.nomPrenom || ''}
              size="xl"
              border
              className="ring-2 ring-blue-500/30 shadow-md shrink-0 self-center sm:self-auto"
            />
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Manager sélectionné
                </label>
                {activeCharge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {activeCharge.niveau} • {activeCharge.matricule}
                  </span>
                )}
              </div>
              <select
                id="select-charge-de-flux"
                value={selectedChargeId}
                onChange={e => setSelectedChargeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#003D5B] focus:border-[#003D5B] outline-none transition-all cursor-pointer shadow-xs"
              >
                {availableCharges.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nomPrenom} ({c.matricule}) — {c.niveau}
                  </option>
                ))}
              </select>

              {/* Sparkline & quick info */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Responsable N+1 : <strong className="text-slate-700">{nPlusUn || activeCharge?.nPlusUn || 'Non défini'}</strong>
                </span>
                {managerHistoryScores.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Tendance</span>
                    <Sparkline data={managerHistoryScores} width={65} height={18} showTrend={true} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Month & Year Picker */}
          <div className="flex items-center gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Mois
              </label>
              <select
                id="select-mois-evaluation"
                value={selectedMois}
                onChange={e => setSelectedMois(Number(e.target.value))}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#003D5B] focus:bg-white outline-none cursor-pointer transition-all shadow-xs"
              >
                {MOIS_LABELS.map((nom, idx) => (
                  <option key={idx} value={idx + 1}>
                    {nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Année
              </label>
              <input
                id="input-annee-evaluation"
                type="number"
                min="2000"
                max="2100"
                step="1"
                value={selectedAnnee}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setSelectedAnnee(val);
                  }
                }}
                className="w-24 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#003D5B] focus:bg-white outline-none transition-all shadow-xs text-center font-bold"
                placeholder="2026"
              />
            </div>
          </div>

          {/* Col 3: PDF Action */}
          <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-6">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#003D5B] hover:bg-[#002d44] rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer celestial-interactive"
              title="Exporter et partager au collaborateur en PDF avec graphiques"
            >
              <FileText className="w-4 h-4 text-sky-200" />
              <span>Aperçu & Partager PDF</span>
            </button>
          </div>
        </div>

        {/* Metadata sub-row: Date entretien & N+1 */}
        <div className="px-6 pb-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600">Date d'entretien :</span>
            <input
              id="input-date-entretien"
              type="date"
              disabled={isCompleted || isReadOnly}
              value={dateEntretien}
              onChange={e => setDateEntretien(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-[#003D5B] disabled:opacity-60"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Responsable N+1 :</span>
            <input
              id="input-nplusun"
              type="text"
              disabled={isCompleted || isReadOnly}
              value={nPlusUn}
              placeholder="Nom du responsable N+1"
              onChange={e => setNPlusUn(e.target.value)}
              className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-[#003D5B] disabled:opacity-60"
            />
          </div>

          {isCompleted && (
            <div className="flex items-center justify-end gap-2 text-emerald-700 font-semibold sm:col-span-2 lg:col-span-1">
              <Lock className="w-4 h-4" />
              <span>Validé par {nPlusUn || 'le N+1'}</span>
              {isFrozen ? (
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300 ml-1">
                  Attesté & Figé
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleUnlockEvaluation}
                  className="text-xs text-blue-600 underline hover:text-blue-800 ml-2 cursor-pointer"
                >
                  Déverrouiller
                </button>
              )}
            </div>
          )}
        </div>

        {/* Frozen Alert Banner when Attested */}
        {isFrozen && (
          <div className="mx-6 mb-5 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 shadow-xs animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <span>Évaluation officielle validée & attestée</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                    Données figées
                  </span>
                </div>
                <div className="text-xs text-emerald-800 mt-0.5">
                  Signé électroniquement par <strong>{existingEval?.signatureCollaborateur || activeCharge?.nomPrenom}</strong>
                  {existingEval?.dateAttestation && ` le ${new Date(existingEval.dateAttestation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}.
                  Cette fiche est archivée et non modifiable.
                </div>
                {existingEval?.commentaireCollaborateur && (
                  <div className="mt-1.5 text-xs italic bg-white/80 p-2 rounded-xl border border-emerald-200 text-emerald-900">
                    Remarque du collaborateur : « {existingEval.commentaireCollaborateur} »
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REAL-TIME KPI SCORING DASHBOARD - Liquid Glass Technology */}
      <div
        style={{
          backgroundColor: theme.headerBg || `${theme.primaire}c0`,
          borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.16), 0 0 25px 0 ${theme.liquidGlassGlow || 'transparent'}`
        }}
        className="relative overflow-hidden group text-white rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-2xl border transition-all duration-300 celestial-card before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"
      >
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Dynamic Subscores for all blocks - Placed on the LEFT/CENTER */}
          <div className="flex-1 flex flex-wrap gap-3 order-2 xl:order-1">
            {blocs.map(bloc => {
              const scoreObj = scoreResults.scoresParBloc[bloc.id];
              const scorePct = scoreObj?.estTotalementNA ? 'N/A' : `${scoreObj?.tauxMoyenPourcentage || 0}%`;
              const ratio = scoreObj?.tauxMoyenPourcentage || 0;

              return (
                <div
                  key={bloc.id}
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center min-w-[130px] flex-1 celestial-interactive transition-all"
                >
                  <div className="text-[11px] uppercase font-bold text-sky-200 truncate">{bloc.nom}</div>
                  <div className="text-xl font-black text-white mt-1">
                    {scorePct}
                  </div>
                  <div className="text-[10px] text-sky-100/75 mt-0.5 font-medium">
                    Poids : {scoreObj?.poidsEffectif ?? bloc.poidsPourcentage}%
                  </div>
                  <div className="w-full bg-white/15 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Taux Global on the FAR RIGHT as requested */}
          <div className="flex flex-col sm:flex-row items-center justify-between xl:justify-end gap-5 xl:border-l xl:border-white/20 xl:pl-6 shrink-0 order-1 xl:order-2">
            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-sky-200">
                  Note finale calculée
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${appreciation.badgeColor}`}>
                  {appreciation.texte}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {activeCharge.nomPrenom} • {activeCharge.niveau}
              </h2>
              <p className="text-xs text-sky-100/80 mt-0.5">
                {scoreResults.rubriquesRemplies} sur {scoreResults.totalRubriques} critères évalués
              </p>
            </div>

            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center shadow-inner celestial-interactive">
                <span className="text-3xl font-black tracking-tight text-white">
                  {scoreResults.scoreTotal}%
                </span>
                <span className="text-[11px] font-bold text-sky-100/85 mt-0.5">
                  Taux global
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scale guide / helper */}
      <div className="p-4 bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Barème de notation par critère :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {NOTE_OPTIONS.map(opt => (
            <span
              key={opt.valeur}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs"
            >
              <strong className="text-slate-900 font-bold">{opt.label}</strong> : {opt.description}
            </span>
          ))}
        </div>
      </div>

      {/* 3 BLOCKS OF RUBRICS */}
      <div className="space-y-8">
        {blocs.map(bloc => {
          const rubriquesActives = bloc.rubriques.filter(r => r.actif);
          const blockScore = scoreResults.scoresParBloc[bloc.id];

          return (
            <div
              key={bloc.id}
              id={`evaluation-bloc-${bloc.id}`}
              className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-400/50 transition-all duration-300"
            >
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />

              <div className="relative">
                {/* Block Header with Liquid Glass dynamic theme */}
                <div
                  style={{
                    backgroundColor: theme.headerBg || `${theme.primaire}c0`,
                    borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
                    boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.1), 0 0 15px 0 ${theme.liquidGlassGlow || 'transparent'}`
                  }}
                  className="p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-2xl border-b transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-0.5 text-xs font-black rounded-full bg-white/20 text-sky-100 border border-white/20">
                        {bloc.poidsPourcentage}% des points
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {bloc.titreAffiche}
                      </h3>
                    </div>
                    <p className="text-xs text-sky-100/75 mt-1">
                      {bloc.description}
                    </p>
                  </div>

                  {/* Subtotal for this block in % */}
                  <div className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-right shadow-inner self-start sm:self-auto celestial-interactive">
                    <div className="text-[10px] uppercase font-bold text-sky-200">Taux atteint</div>
                    <div className="text-base font-bold text-white">
                      {blockScore?.estTotalementNA ? 'N/A' : `${blockScore?.tauxMoyenPourcentage || 0}%`}
                      <span className="text-xs font-normal text-sky-100/75 ml-1.5">
                        (Poids {blockScore?.poidsEffectif ?? bloc.poidsPourcentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rubric rows */}
                <div className="divide-y divide-slate-100">
                  {rubriquesActives.map((rub, idx) => {
                    const currentDetail = notes[rub.id] || { note: null, commentaire: '' };
                    const isRated = currentDetail.note !== null && currentDetail.note !== undefined;

                    return (
                      <div
                        key={rub.id}
                        className={`p-6 transition-colors ${isRated ? 'bg-white' : 'bg-slate-50/30'}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Title & description */}
                          <div className="lg:max-w-md xl:max-w-lg space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800">
                                {rub.titre}
                              </h4>
                            </div>
                            {rub.description && (
                              <p className="text-xs text-slate-500 pl-7 leading-relaxed">
                                {rub.description}
                              </p>
                            )}
                          </div>

                          {/* Note Buttons (0% - 50% - 100% - 120%) */}
                          <div className="flex flex-wrap items-center gap-2 pl-7 lg:pl-0">
                            {NOTE_OPTIONS.map(opt => {
                              const isSelected = currentDetail.note === opt.valeur;
                              return (
                                <button
                                  key={opt.valeur}
                                  id={`btn-note-${rub.id}-${opt.valeur}`}
                                  type="button"
                                  disabled={isCompleted || isReadOnly}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetNote(rub.id, opt.valeur);
                                  }}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                    isSelected
                                      ? opt.bgSelected
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-50'
                                  }`}
                                  title={opt.description}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Comment Input for this rubric */}
                        <div className="mt-3.5 pl-7">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              id={`input-comment-${rub.id}`}
                              type="text"
                              disabled={isCompleted || isReadOnly}
                              placeholder="Ajouter un commentaire ou une justification pour cette note..."
                              value={currentDetail.commentaire || ''}
                              onChange={e => handleSetComment(rub.id, e.target.value)}
                              className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RUBRIQUE SUIVI — PLANS D'ACTIONS PRECEDENTS (Placé juste au dessus de Synthèse générale) */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] celestial-card">
        {/* Header with Liquid Glass dynamic theme */}
        <div
          style={{
            backgroundColor: theme.headerBg || `${theme.primaire}c0`,
            borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
            boxShadow: `0 8px 24px 0 rgba(0, 0, 0, 0.12), 0 0 20px 0 ${theme.liquidGlassGlow || 'transparent'}`
          }}
          className="p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-2xl border-b transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Rubrique Suivi — Réalisation des plans d'actions précédents
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-sky-100 border border-white/20">
                  Non noté • Suivi opérationnel
                </span>
              </div>
              <p className="text-xs text-sky-100/75 mt-0.5">
                Vérifiez si les plans d'actions discutés lors des entretiens précédents ont été réalisés ou non.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && priorEvaluation && (
              <button
                type="button"
                onClick={handleImportPriorActions}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer celestial-interactive"
                title="Importer les actions discutées lors de la période précédente"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-200" />
                <span>Importer de {MOIS_LABELS[priorEvaluation.mois - 1]}</span>
              </button>
            )}

            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setIsAddingAction(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-[#003D5B] bg-white hover:bg-sky-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer celestial-interactive"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un plan d'action</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Add Action Mini Form */}
          {isAddingAction && !isReadOnly && (
            <form onSubmit={handleAddAction} className="mt-2 p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Nouveau point de suivi / plan d'action</span>
                <button
                  type="button"
                  onClick={() => setIsAddingAction(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Annuler
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Intitulé du plan d'action (ex: Suivre la formation WMS niveau 2)..."
                    value={nouvelleActionTitre}
                    onChange={e => setNouvelleActionTitre(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Échéance"
                    value={nouvelleActionDate}
                    onChange={e => setNouvelleActionDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Commentaire ou résultat attendu (optionnel)..."
                  value={nouvelleActionComment}
                  onChange={e => setNouvelleActionComment(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  Enregistrer l'action
                </button>
              </div>
            </form>
          )}

          {/* List of Action Items */}
          <div className="mt-2 space-y-3">
            {actionsSuivi.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">
                  Aucun plan d'action enregistré pour le moment.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cliquez sur « Ajouter un plan d'action » ou importez les actions de la période précédente pour suivre si les engagements ont été tenus.
                </p>
              </div>
            ) : (
              actionsSuivi.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 celestial-interactive"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{act.titre}</span>
                      {act.provenanceEvaluation && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          Origine : {act.provenanceEvaluation}
                        </span>
                      )}
                    </div>
                    {act.datePrevue && (
                      <span className="text-[11px] text-slate-500 block">
                        Échéance convenue : <strong className="text-slate-700">{act.datePrevue}</strong>
                      </span>
                    )}
                    <input
                      type="text"
                      disabled={isCompleted || isReadOnly}
                      placeholder="Commentaire de suivi opérationnel..."
                      value={act.commentaire || ''}
                      onChange={e => handleSetActionCommentaire(act.id, e.target.value)}
                      className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none mt-1"
                    />
                  </div>

                  {/* 3 Status Buttons : OK | En cours | KO */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button
                      type="button"
                      disabled={isCompleted || isReadOnly}
                      onClick={() => handleSetActionStatut(act.id, 'OK')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                        act.statut === 'OK'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OK (Réalisé)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCompleted || isReadOnly}
                      onClick={() => handleSetActionStatut(act.id, 'En cours')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                        act.statut === 'En cours'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>En cours</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCompleted || isReadOnly}
                      onClick={() => handleSetActionStatut(act.id, 'KO')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                        act.statut === 'KO'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>KO (Non réalisé)</span>
                    </button>

                    {!isCompleted && !isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAction(act.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Supprimer ce point de suivi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Global comment section */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div
          style={{
            backgroundColor: theme.headerBg || `${theme.primaire}c0`,
            borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
            boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.1), 0 0 15px 0 ${theme.liquidGlassGlow || 'transparent'}`
          }}
          className="p-5 text-white flex items-center gap-2.5 backdrop-blur-2xl border-b transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent"
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Synthèse générale & Conclusion de l'entretien
            </h3>
            <p className="text-xs text-sky-100/75">
              Appréciation d'ensemble, points forts constatés, axes d'amélioration prioritaires et engagements mutuels.
            </p>
          </div>
        </div>
        <div className="p-6">
          <textarea
            id="textarea-commentaire-global"
            rows={4}
            disabled={isCompleted || isReadOnly}
            placeholder="Rédigez ici la synthèse de l'entretien mensuel..."
            value={commentaireGlobal}
            onChange={e => setCommentaireGlobal(e.target.value)}
            className="w-full p-4 text-sm bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none disabled:bg-slate-100 disabled:text-slate-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="sticky bottom-4 z-20 bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">{activeCharge.nomPrenom}</span> — {MOIS_LABELS[selectedMois - 1]} {selectedAnnee}
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="text-xs font-bold text-slate-900 hidden sm:inline">
            Note globale : <span className="text-emerald-600 text-sm font-black">{scoreResults.scoreTotal}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Export PDF Button */}
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Partager PDF</span>
          </button>

          {/* Frozen Status / Draft / Validation Buttons */}
          {isFrozen ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-100/90 border border-emerald-400 text-emerald-950 text-xs font-bold rounded-2xl shadow-xs">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Attestée & Figée (Archivée)</span>
            </div>
          ) : !isCompleted ? (
            <>
              {currentRole !== 'collaborateur' && (
                <button
                  id="btn-sauvegarder-brouillon"
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-2xl transition-all shadow-2xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer brouillon</span>
                </button>
              )}

              {currentRole !== 'collaborateur' && (
                <button
                  id="btn-valider-note-finale"
                  type="button"
                  disabled={scoreResults.rubriquesNonNotees > 0}
                  onClick={handleOpenValidateModal}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl transition-all ${
                    scoreResults.rubriquesNonNotees > 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 cursor-pointer'
                  }`}
                  title={
                    scoreResults.rubriquesNonNotees > 0
                      ? `${scoreResults.rubriquesNonNotees} rubrique(s) restante(s) sans note. Veuillez noter toutes les rubriques ou sélectionner N/A pour débloquer la validation.`
                      : 'Valider définitivement la note finale'
                  }
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {scoreResults.rubriquesNonNotees > 0
                      ? `Valider (${scoreResults.rubriquesNonNotees} restante${scoreResults.rubriquesNonNotees > 1 ? 's' : ''})`
                      : 'Valider la note finale'}
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-2xl">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Validée • En attente d'attestation</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Warning Modal */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        charge={activeCharge}
        mois={selectedMois}
        annee={selectedAnnee}
        dateEntretien={dateEntretien}
        scores={scoreResults}
        onConfirm={handleConfirmValidation}
        onCancel={() => setIsValidationModalOpen(false)}
      />

      {/* PDF Export Modal */}
      {isPdfModalOpen && (
        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          evaluation={buildCurrentEvaluation()}
          chargeDeFlux={activeCharge}
          blocs={blocs}
          historiqueEvaluations={evaluations}
        />
      )}
    </div>
  );
};
