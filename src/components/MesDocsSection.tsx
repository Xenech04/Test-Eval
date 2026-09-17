import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  FileText,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  X,
  ExternalLink,
  Award,
  Layers,
  Users,
  AlertTriangle,
  Trophy,
  Sparkles,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import { BlocRubrique, ChargeDeFlux, Evaluation, EvaluationRubriqueDetail } from '../types';
import { MOIS_LABELS, ANNEES_DISPONIBLES } from '../data/initialData';
import { getStatutBadge, getScoreAppreciation } from '../utils/scoring';
import { getFilteredChargesForUser, getFilteredEvaluationsForUser } from '../utils/roleAccess';
import { Sparkline } from './Sparkline';
import { RadarChartComp } from './RadarChartComp';
import { PdfExportModal } from './PdfExportModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

interface MesDocsSectionProps {
  chargesDeFlux: ChargeDeFlux[];
  blocs: BlocRubrique[];
  evaluations: Evaluation[];
  onSelectEvaluationToEdit: (chargeId: string, mois: number, annee: number) => void;
  onOpenAttestation?: (evalItem: Evaluation) => void;
}

type SousOngletDocs = 'equipe' | 'personnel' | 'classement' | 'fiches';

export const MesDocsSection: React.FC<MesDocsSectionProps> = ({
  chargesDeFlux,
  blocs,
  evaluations,
  onSelectEvaluationToEdit,
  onOpenAttestation
}) => {
  const { theme } = useTheme();
  const { currentRole, currentUser } = useAuth();
  const [sousOnglet, setSousOnglet] = useState<SousOngletDocs>(() => {
    return currentRole === 'collaborateur' ? 'personnel' : 'equipe';
  });

  // Strict RBAC: Les collaborateurs n'ont accès qu'à "Performance Personnelle & Progression" et "Toutes les fiches"
  useEffect(() => {
    if (currentRole === 'collaborateur') {
      if (sousOnglet === 'equipe' || sousOnglet === 'classement') {
        setSousOnglet('personnel');
      }
    }
  }, [currentRole, sousOnglet]);

  // Initialisation du sous-onglet par défaut à chaque connexion
  useEffect(() => {
    if (currentRole === 'collaborateur') {
      setSousOnglet('personnel');
    } else {
      setSousOnglet('equipe');
    }
  }, [currentUser?.id, currentRole]);

  // Restrict charges list strictly based on role:
  // - Admin: all charges
  // - N+1: only their team members (cannot see other teams)
  // - Collaborateur: strictly their own data
  const availableCharges = useMemo(() => {
    return getFilteredChargesForUser(chargesDeFlux, currentUser);
  }, [chargesDeFlux, currentUser]);

  const availableEvaluations = useMemo(() => {
    return getFilteredEvaluationsForUser(evaluations, availableCharges, currentUser);
  }, [evaluations, availableCharges, currentUser]);

  // Filter state for fiches
  const [selectedChargeFilter, setSelectedChargeFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [selectedStatutFilter, setSelectedStatutFilter] = useState<string>('all');

  // Selected flow manager for personal performance view
  const [selectedPersonalChargeId, setSelectedPersonalChargeId] = useState<string>(
    availableCharges[0]?.id || ''
  );

  // Sync personal charge id if availableCharges changes
  useEffect(() => {
    if (availableCharges.length > 0 && !availableCharges.some(c => c.id === selectedPersonalChargeId)) {
      setSelectedPersonalChargeId(availableCharges[0].id);
    }
  }, [availableCharges, selectedPersonalChargeId]);

  // Multi-selection of periods for comparison chart
  const [selectedEvalIdsForComparison, setSelectedEvalIdsForComparison] = useState<string[]>([]);

  // Detailed Modals
  const [modalEvaluation, setModalEvaluation] = useState<Evaluation | null>(null);
  const [pdfExportEval, setPdfExportEval] = useState<Evaluation | null>(null);

  // Available years (extends up to 2040)
  const anneesDisponibles = useMemo(() => {
    const set = new Set<number>(ANNEES_DISPONIBLES);
    availableEvaluations.forEach(e => set.add(e.annee));
    return Array.from(set).sort((a, b) => b - a);
  }, [availableEvaluations]);

  // Filtered evaluations
  const evaluationsFiltrees = useMemo(() => {
    return availableEvaluations.filter(e => {
      if (selectedChargeFilter !== 'all' && e.chargeDeFluxId !== selectedChargeFilter) return false;
      if (selectedYearFilter !== 'all' && e.annee !== Number(selectedYearFilter)) return false;
      if (selectedStatutFilter !== 'all' && e.statut !== selectedStatutFilter) return false;
      return true;
    }).sort((a, b) => {
      if (b.annee !== a.annee) return b.annee - a.annee;
      return b.mois - a.mois;
    });
  }, [availableEvaluations, selectedChargeFilter, selectedYearFilter, selectedStatutFilter]);

  // Comparison evals
  const activeComparisonEvals = useMemo(() => {
    if (selectedEvalIdsForComparison.length > 0) {
      return availableEvaluations
        .filter(e => selectedEvalIdsForComparison.includes(e.id))
        .sort((a, b) => (a.annee === b.annee ? a.mois - b.mois : a.annee - b.annee));
    }
    return evaluationsFiltrees.slice(0, 5).reverse();
  }, [availableEvaluations, selectedEvalIdsForComparison, evaluationsFiltrees]);

  const toggleComparisonEval = (id: string) => {
    if (selectedEvalIdsForComparison.includes(id)) {
      setSelectedEvalIdsForComparison(selectedEvalIdsForComparison.filter(item => item !== id));
    } else {
      setSelectedEvalIdsForComparison([...selectedEvalIdsForComparison, id]);
    }
  };

  // --- STATS GLOBALES EQUIPE ---
  const teamStats = useMemo(() => {
    if (evaluations.length === 0) {
      return {
        moyenneTotale: 0,
        moyenneBehavior: 0,
        moyenneManagement: 0,
        moyenneDelivery: 0,
        totalEvals: 0,
        scoresParBloc: [],
        scoresParRubrique: []
      };
    }

    const count = evaluations.length;
    const sumTotal = evaluations.reduce((acc, e) => acc + e.scoreTotal, 0);
    const sumBeh = evaluations.reduce((acc, e) => acc + e.scoreBehavior, 0);
    const sumMan = evaluations.reduce((acc, e) => acc + e.scoreManagement, 0);
    const sumDel = evaluations.reduce((acc, e) => acc + e.scoreDelivery, 0);

    // Bloc stats
    const scoresParBloc = [
      {
        nom: 'Behavior (20%)',
        moyenneObtenue: Math.round((sumBeh / count) * 10) / 10,
        maxPoids: 20,
        pourcentageAtteinte: Math.round(((sumBeh / count) / 20) * 100)
      },
      {
        nom: 'Management (20%)',
        moyenneObtenue: Math.round((sumMan / count) * 10) / 10,
        maxPoids: 20,
        pourcentageAtteinte: Math.round(((sumMan / count) / 20) * 100)
      },
      {
        nom: 'Delivery (60%)',
        moyenneObtenue: Math.round((sumDel / count) * 10) / 10,
        maxPoids: 60,
        pourcentageAtteinte: Math.round(((sumDel / count) / 60) * 100)
      }
    ];

    // Rubrics stats across all evaluations
    const rubricScoresMap: Record<string, { sum: number; count: number; titre: string; blocId: string }> = {};

    blocs.forEach(b => {
      b.rubriques.forEach(r => {
        rubricScoresMap[r.id] = { sum: 0, count: 0, titre: r.titre, blocId: b.id };
      });
    });

    evaluations.forEach(ev => {
      if (ev.notes) {
        Object.entries(ev.notes).forEach(([rId, val]) => {
          const detail = val as EvaluationRubriqueDetail;
          if (detail && typeof detail.note === 'number' && rubricScoresMap[rId]) {
            rubricScoresMap[rId].sum += detail.note;
            rubricScoresMap[rId].count += 1;
          }
        });
      }
    });

    const scoresParRubrique = Object.entries(rubricScoresMap)
      .map(([id, data]) => {
        const avg = data.count > 0 ? Math.round(data.sum / data.count) : 0;
        return {
          id,
          titre: data.titre,
          blocId: data.blocId,
          moyenne: avg
        };
      })
      .sort((a, b) => b.moyenne - a.moyenne);

    return {
      moyenneTotale: Math.round((sumTotal / count) * 10) / 10,
      moyenneBehavior: Math.round((sumBeh / count) * 10) / 10,
      moyenneManagement: Math.round((sumMan / count) * 10) / 10,
      moyenneDelivery: Math.round((sumDel / count) * 10) / 10,
      totalEvals: count,
      scoresParBloc,
      scoresParRubrique
    };
  }, [evaluations, blocs]);

  // Team Radar Data - mapped by individual active rubrics
  const teamRadarData = useMemo(() => {
    const activeRubrics: { id: string; axe: string }[] = [];
    blocs.forEach(b => {
      b.rubriques.filter(r => r.actif).forEach(r => {
        const shortName = r.titre.length > 20 ? r.titre.substring(0, 18) + '…' : r.titre;
        activeRubrics.push({ id: r.id, axe: shortName });
      });
    });

    const rubricMap = new Map<string, number>(teamStats.scoresParRubrique.map(s => [s.id, s.moyenne]));

    return activeRubrics.map(r => ({
      axe: r.axe,
      score: Math.min(120, Math.round(rubricMap.get(r.id) ?? 0)),
      cible: 100,
      fullMark: 120
    }));
  }, [blocs, teamStats]);

  // --- LEADERBOARD / CLASSEMENT DES CHARGES DE FLUX ---
  const leaderboard = useMemo(() => {
    return chargesDeFlux.map(c => {
      const cEvals = evaluations
        .filter(e => e.chargeDeFluxId === c.id)
        .sort((a, b) => (a.annee === b.annee ? a.mois - b.mois : a.annee - b.annee));

      const count = cEvals.length;
      const avg = count > 0 ? Math.round((cEvals.reduce((s, e) => s + e.scoreTotal, 0) / count) * 10) / 10 : 0;
      const latest = cEvals[cEvals.length - 1] || null;
      const prev = cEvals[cEvals.length - 2] || null;
      const progression = latest && prev ? Math.round((latest.scoreTotal - prev.scoreTotal) * 10) / 10 : 0;
      const historyScores = cEvals.map(e => e.scoreTotal);

      return {
        collaborateur: c,
        nombreEvals: count,
        moyenneTotale: avg,
        derniereNote: latest?.scoreTotal ?? 0,
        progression,
        historyScores,
        derniereEvaluation: latest
      };
    }).sort((a, b) => b.moyenneTotale - a.moyenneTotale);
  }, [chargesDeFlux, evaluations]);

  // --- STATS PERSONNELLES POUR LE COLLABORATEUR SELECTIONNE ---
  const personalStats = useMemo(() => {
    const c = chargesDeFlux.find(item => item.id === selectedPersonalChargeId) || chargesDeFlux[0];
    if (!c) return null;

    const cEvals = evaluations
      .filter(e => e.chargeDeFluxId === c.id)
      .sort((a, b) => (a.annee === b.annee ? a.mois - b.mois : a.annee - b.annee));

    const count = cEvals.length;
    const avg = count > 0 ? Math.round((cEvals.reduce((s, e) => s + e.scoreTotal, 0) / count) * 10) / 10 : 0;
    const latest = cEvals[cEvals.length - 1] || null;
    const prev = cEvals[cEvals.length - 2] || null;
    const delta = latest && prev ? Math.round((latest.scoreTotal - prev.scoreTotal) * 10) / 10 : null;

    // Individual Line curve data
    const curveData = cEvals.map(ev => ({
      mois: `${MOIS_LABELS[ev.mois - 1]?.substring(0, 4)} ${ev.annee}`,
      Total: ev.scoreTotal,
      Behavior: ev.scoreBehavior,
      Management: ev.scoreManagement,
      Delivery: ev.scoreDelivery,
      MoyenneEquipe: teamStats.moyenneTotale
    }));

    // Rubriques à rectifier (Weak points: notes <= 50% on latest evaluation or overall)
    const rubriquesARectifier: Array<{
      rubriqueId: string;
      titre: string;
      blocNom: string;
      noteObtenue: number;
      commentaire?: string;
    }> = [];

    if (latest && latest.notes) {
      Object.entries(latest.notes).forEach(([rId, val]) => {
        const detail = val as EvaluationRubriqueDetail;
        if (detail && typeof detail.note === 'number' && detail.note <= 50) {
          // Find rubric title & block
          let rubTitle = rId;
          let blocTitle = 'Compétence';
          blocs.forEach(b => {
            const found = b.rubriques.find(r => r.id === rId);
            if (found) {
              rubTitle = found.titre;
              blocTitle = b.nom;
            }
          });

          rubriquesARectifier.push({
            rubriqueId: rId,
            titre: rubTitle,
            blocNom: blocTitle,
            noteObtenue: detail.note,
            commentaire: detail.commentaire
          });
        }
      });
    }

    // Personal Radar Data - mapped by individual active rubrics
    const activeRubrics: { id: string; axe: string }[] = [];
    blocs.forEach(b => {
      b.rubriques.filter(r => r.actif).forEach(r => {
        const shortName = r.titre.length > 20 ? r.titre.substring(0, 18) + '…' : r.titre;
        activeRubrics.push({ id: r.id, axe: shortName });
      });
    });

    const teamRubricMap = new Map<string, number>(teamStats.scoresParRubrique.map(s => [s.id, s.moyenne]));

    const personalRadarData = activeRubrics.map(r => {
      const detail = latest?.notes?.[r.id];
      let scoreRubrique = 0;
      if (detail && typeof detail.note === 'number') {
        scoreRubrique = detail.note;
      }
      const teamAvg = teamRubricMap.get(r.id) ?? 0;

      return {
        axe: r.axe,
        score: Math.min(120, Math.round(scoreRubrique)),
        moyenneEquipe: Math.min(120, Math.round(teamAvg)),
        cible: 100,
        fullMark: 120
      };
    });

    return {
      charge: c,
      evaluations: cEvals,
      derniereEvaluation: latest,
      moyenneTotale: avg,
      progressionDelta: delta,
      curveData,
      rubriquesARectifier,
      radarData: personalRadarData
    };
  }, [availableCharges, selectedPersonalChargeId, availableEvaluations, blocs, teamStats]);

  // Comparison Chart Data for Fiches tab
  const comparisonChartData = useMemo(() => {
    return activeComparisonEvals.map(ev => {
      const cdf = availableCharges.find(c => c.id === ev.chargeDeFluxId) || chargesDeFlux.find(c => c.id === ev.chargeDeFluxId);
      const moisNom = MOIS_LABELS[ev.mois - 1]?.substring(0, 4) || `M${ev.mois}`;
      const periodLabel = `${cdf?.nomPrenom.split(' ')[0] || ''} (${moisNom} ${ev.annee})`;

      return {
        id: ev.id,
        label: periodLabel,
        Total: ev.scoreTotal,
        Behavior: ev.scoreBehavior,
        Management: ev.scoreManagement,
        Delivery: ev.scoreDelivery
      };
    });
  }, [activeComparisonEvals, availableCharges, chargesDeFlux]);

  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header with dynamic theme */}
      <div
        style={{ backgroundColor: theme.primaire }}
        className="text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 transition-colors duration-300"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <span>Mes docs — Tableaux de bord & Historique des bilans</span>
          </h1>
          <p className="text-sm text-white/80 mt-1">
            Visualisez les performances collectives et individuelles, analysez les progressions, détectez les axes à rectifier et téléchargez les fiches en PDF.
          </p>
        </div>
      </div>

      {/* Segmented Navigation Tabs - Liquid Glass */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 backdrop-blur-xl border border-white/60 rounded-2xl w-fit">
        {/* Performance Globale / Équipe (Admin & Responsable N+1 uniquement) */}
        {currentRole !== 'collaborateur' && (
          <button
            type="button"
            onClick={() => setSousOnglet('equipe')}
            style={sousOnglet === 'equipe' ? { color: theme.primaire } : undefined}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              sousOnglet === 'equipe'
                ? 'bg-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{currentRole === 'n_plus_un' ? 'Performance de mon Équipe' : 'Performance Globale Équipe'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setSousOnglet('personnel')}
          style={sousOnglet === 'personnel' ? { color: theme.primaire } : undefined}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            sousOnglet === 'personnel'
              ? 'bg-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Performance Personnelle & Progression</span>
        </button>

        {/* Classement (Admin & Responsable N+1 uniquement) */}
        {currentRole !== 'collaborateur' && (
          <button
            type="button"
            onClick={() => setSousOnglet('classement')}
            style={sousOnglet === 'classement' ? { color: theme.primaire } : undefined}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              sousOnglet === 'classement'
                ? 'bg-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>
              {currentRole === 'n_plus_un'
                ? `Classement de mon Équipe (${availableCharges.length})`
                : `TOP Classement (${chargesDeFlux.length})`}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setSousOnglet('fiches')}
          style={sousOnglet === 'fiches' ? { color: theme.primaire } : undefined}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            sousOnglet === 'fiches'
              ? 'bg-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Toutes les Fiches ({evaluationsFiltrees.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. SECTION PERFORMANCE GLOBALE EQUIPE */}
      {/* ======================================================== */}
      {sousOnglet === 'equipe' && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 celestial-card">
              <span className="text-[11px] font-bold text-blue-700 uppercase block">Moyenne Globale Équipe</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {teamStats.moyenneTotale}%
              </div>
              <span className="text-xs text-slate-500 block mt-1 font-medium">
                Taux moyen d'atteinte collectif
              </span>
            </div>

            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 celestial-card">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Moyenne Behavior</span>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {Math.round((teamStats.moyenneBehavior / 20) * 100)}%
              </div>
              <span className="text-xs text-amber-700 font-medium block mt-1">
                Poids dans la note : 20%
              </span>
            </div>

            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-indigo-400/50 transition-all duration-300 celestial-card">
              <span className="text-[11px] font-bold text-indigo-800 uppercase block">Moyenne Management</span>
              <div className="text-2xl font-black text-indigo-950 mt-1">
                {Math.round((teamStats.moyenneManagement / 20) * 100)}%
              </div>
              <span className="text-xs text-indigo-700 font-medium block mt-1">
                Poids dans la note : 20%
              </span>
            </div>

            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-400/50 transition-all duration-300 celestial-card">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Moyenne Delivery</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {Math.round((teamStats.moyenneDelivery / 60) * 100)}%
              </div>
              <span className="text-xs text-emerald-700 font-medium block mt-1">
                Poids dans la note : 60%
              </span>
            </div>
          </div>

          {/* Charts Row: Performance par Groupe de Rubrique & Graphique en Toile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart: Blocs */}
            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-400/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Notes globales de l'équipe par groupe de rubriques
                  </h3>
                  <p className="text-xs text-slate-500">
                    Niveau d'atteinte moyen constaté sur les 3 piliers opérationnels.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.scoresParBloc}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="nom" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis domain={[0, 120]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, `Taux d'atteinte moyen`]}
                    />
                    <Bar
                      dataKey="pourcentageAtteinte"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar / Spider Chart: Profil équipe */}
            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-purple-400/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Graphique en toile globale de l'équipe
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vision multidimensionnelle de l'équilibre des compétences.
                  </p>
                </div>
              </div>

              <RadarChartComp
                data={teamRadarData}
                collaborateurNom="Moyenne Équipe"
                hauteur={240}
                afficherMoyenneEquipe={false}
              />
            </div>
          </div>

          {/* Detailed table of rubrics across the team */}
          <div className="relative overflow-hidden bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Notes globales de l'équipe par rubrique individuelle
                </h3>
                <p className="text-xs text-slate-500">
                  Moyenne des notes attribuées à chaque critère sur l'ensemble des évaluations de l'équipe.
                </p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {teamStats.scoresParRubrique.map((r, i) => {
                const isTop = r.moyenne >= 100;
                const isWeak = r.moyenne <= 60;

                return (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{r.titre}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {r.blocId.replace('bloc-', '')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            isTop ? 'bg-emerald-500' : isWeak ? 'bg-rose-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, r.moyenne)}%` }}
                        />
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black min-w-[54px] text-center ${
                          isTop
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWeak
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {r.moyenne}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SECTION PERFORMANCE PERSONNELLE & PROGRESSION */}
      {/* ======================================================== */}
      {sousOnglet === 'personnel' && personalStats && (
        <div className="space-y-8">
          {/* Flow Manager Selector Bar */}
          <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-400/50 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar
                  photoUrl={personalStats.charge.photoUrl}
                  nomPrenom={personalStats.charge.nomPrenom}
                  size="lg"
                  border
                  className="ring-2 ring-white shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{personalStats.charge.nomPrenom}</h2>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      {personalStats.charge.niveau}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Matricule : {personalStats.charge.matricule} • N+1 : {personalStats.charge.nPlusUn}
                  </p>
                </div>
              </div>

              {/* Selector dropdown (only for Admin and N+1) */}
              <div className="flex items-center gap-3">
                {currentRole !== 'collaborateur' ? (
                  <select
                    value={selectedPersonalChargeId}
                    onChange={e => setSelectedPersonalChargeId(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {availableCharges.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nomPrenom} ({c.matricule})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    Mes données personnelles
                  </div>
                )}

                {personalStats.derniereEvaluation && (
                  <button
                    type="button"
                    onClick={() => setPdfExportEval(personalStats.derniereEvaluation)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Sortir PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xs celestial-card">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Dernière Note</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {personalStats.derniereEvaluation?.scoreTotal ?? '—'}%
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
                {personalStats.derniereEvaluation
                  ? "Taux d'atteinte global"
                  : 'Non évalué'}
              </span>
            </div>

            <div className="p-5 bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xs celestial-card">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Moyenne Globale</span>
              <div className="text-2xl font-black text-blue-900 mt-1">
                {personalStats.moyenneTotale}%
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
                Sur {personalStats.evaluations.length} évaluation(s)
              </span>
            </div>

            <div className="p-5 bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xs celestial-card">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Progression vs N-1</span>
              <div className="flex items-center gap-2 mt-1">
                {personalStats.progressionDelta !== null ? (
                  <>
                    <div
                      className={`text-2xl font-black flex items-center ${
                        personalStats.progressionDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {personalStats.progressionDelta >= 0 ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                      <span>
                        {personalStats.progressionDelta >= 0 ? '+' : ''}
                        {personalStats.progressionDelta}%
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic">1ère évaluation</span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Évolution mensuelle</span>
            </div>

            <div className="p-5 bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xs celestial-card">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Tendance Sparkline</span>
              <div className="mt-2">
                <Sparkline
                  data={personalStats.evaluations.map(e => e.scoreTotal)}
                  width={100}
                  height={26}
                  showTrend={true}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Courbe historique</span>
            </div>
          </div>

          {/* Graphique individuel en courbe & Graphique en toile — Mis en valeur en premier */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Individuel en Courbe */}
            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 celestial-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Graphique individuel en courbe d'évolution</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Progression du score total et comparaison avec la moyenne d'équipe.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={personalStats.curveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis domain={[0, 120]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      name="Score Total"
                      dataKey="Total"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#2563eb' }}
                    />
                    <Line
                      type="monotone"
                      name="Moyenne Équipe"
                      dataKey="MoyenneEquipe"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Toile personnelle */}
            <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-purple-400/50 transition-all duration-300 celestial-card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Graphique en toile individuel vs Équipe</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparatif des piliers de compétences vs la moyenne collective.
                  </p>
                </div>
              </div>

              <RadarChartComp
                data={personalStats.radarData}
                collaborateurNom={personalStats.charge.nomPrenom.split(' ')[0]}
                hauteur={240}
                afficherMoyenneEquipe={true}
              />
            </div>
          </div>

          {/* RUBRIQUES A RECTIFIER EN PRIORITE — Placé tout en bas comme demandé */}
          <div className="relative overflow-hidden group bg-rose-50/70 backdrop-blur-xl border border-rose-200 rounded-3xl p-6 shadow-sm celestial-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">
                  Rubriques qui sont à rectifier en priorité
                </h3>
                <p className="text-xs text-rose-700">
                  Critères identifiés comme axes d'amélioration (score ≤ 50% sur la dernière évaluation).
                </p>
              </div>
            </div>

            {personalStats.rubriquesARectifier.length === 0 ? (
              <div className="p-4 bg-white/80 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Excellente performance ! Aucune rubrique critique à rectifier sur la dernière évaluation (tous les critères sont à 100% ou plus).</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {personalStats.rubriquesARectifier.map(item => (
                  <div
                    key={item.rubriqueId}
                    className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-2 celestial-interactive"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                          Pilier : {item.blocNom}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.titre}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-800 shrink-0">
                        {item.noteObtenue}%
                      </span>
                    </div>
                    {item.commentaire && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                        « {item.commentaire} »
                      </p>
                    )}
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-rose-700">
                      <span>Plan d'action préconisé :</span>
                      <span className="underline cursor-pointer">Programmer un point de suivi d'ici 15 jours</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SECTION TOP CLASSEMENT (LEADERBOARD) */}
      {/* ======================================================== */}
      {sousOnglet === 'classement' && (
        <div className="space-y-8">
          {/* Podium for TOP 3 */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* 2nd Place (Silver) */}
              <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-slate-300/80 rounded-3xl p-6 shadow-md flex flex-col items-center text-center order-2 md:order-1 mt-4">
                <span className="text-3xl mb-1">🥈</span>
                <span className="text-xs font-bold uppercase text-slate-500">2ème Place</span>
                <Avatar
                  photoUrl={leaderboard[1].collaborateur.photoUrl}
                  nomPrenom={leaderboard[1].collaborateur.nomPrenom}
                  size="md"
                  border
                  className="my-2 ring-2 ring-slate-300 shadow-sm"
                />
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {leaderboard[1].collaborateur.nomPrenom}
                </h3>
                <span className="text-xs text-slate-500">{leaderboard[1].collaborateur.niveau}</span>
                <div className="text-2xl font-black text-slate-800 mt-3">
                  {leaderboard[1].moyenneTotale}%
                </div>
                <div className="mt-2">
                  <Sparkline data={leaderboard[1].historyScores} width={80} height={22} showTrend={true} />
                </div>
              </div>

              {/* 1st Place (Gold) */}
              <div className="relative overflow-hidden group bg-gradient-to-b from-amber-50/90 to-white/95 backdrop-blur-xl border-2 border-amber-400 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center order-1 md:order-2 scale-105 z-10">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-2xl mb-1 shadow-sm">
                  🥇
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Meilleur Manager
                </span>
                <Avatar
                  photoUrl={leaderboard[0].collaborateur.photoUrl}
                  nomPrenom={leaderboard[0].collaborateur.nomPrenom}
                  size="lg"
                  border
                  className="my-2.5 ring-4 ring-amber-400 shadow-md"
                />
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {leaderboard[0].collaborateur.nomPrenom}
                </h3>
                <span className="text-xs font-semibold text-amber-700">{leaderboard[0].collaborateur.niveau}</span>
                <div className="text-3xl font-black text-amber-950 mt-3">
                  {leaderboard[0].moyenneTotale}%
                </div>
                <span className="text-xs text-slate-500 mt-0.5">
                  Moyenne sur {leaderboard[0].nombreEvals} évaluation(s)
                </span>
                <div className="mt-3">
                  <Sparkline data={leaderboard[0].historyScores} width={95} height={26} color="#d97706" showTrend={true} />
                </div>
              </div>

              {/* 3rd Place (Bronze) */}
              <div className="relative overflow-hidden group bg-white/85 backdrop-blur-xl border border-amber-200/80 rounded-3xl p-6 shadow-md flex flex-col items-center text-center order-3 mt-4">
                <span className="text-3xl mb-1">🥉</span>
                <span className="text-xs font-bold uppercase text-amber-700">3ème Place</span>
                <Avatar
                  photoUrl={leaderboard[2].collaborateur.photoUrl}
                  nomPrenom={leaderboard[2].collaborateur.nomPrenom}
                  size="md"
                  border
                  className="my-2 ring-2 ring-amber-300 shadow-sm"
                />
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {leaderboard[2].collaborateur.nomPrenom}
                </h3>
                <span className="text-xs text-slate-500">{leaderboard[2].collaborateur.niveau}</span>
                <div className="text-2xl font-black text-slate-800 mt-3">
                  {leaderboard[2].moyenneTotale}%
                </div>
                <div className="mt-2">
                  <Sparkline data={leaderboard[2].historyScores} width={80} height={22} showTrend={true} />
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="relative overflow-hidden bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Classement complet de performance des Managers</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculé d'après la moyenne générale des évaluations enregistrées et la tendance historique.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5 text-center">Rang</th>
                    <th className="py-3.5 px-5">Manager</th>
                    <th className="py-3.5 px-5">Niveau</th>
                    <th className="py-3.5 px-5 text-center">Évaluations</th>
                    <th className="py-3.5 px-5 text-center">Moyenne Générale</th>
                    <th className="py-3.5 px-5 text-center">Dernière note</th>
                    <th className="py-3.5 px-5 text-center">Tendance</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {leaderboard.map((item, idx) => {
                    const rank = idx + 1;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

                    return (
                      <tr key={item.collaborateur.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5 text-center font-bold text-sm">
                          {medal}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              photoUrl={item.collaborateur.photoUrl}
                              nomPrenom={item.collaborateur.nomPrenom}
                              size="sm"
                            />
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">{item.collaborateur.nomPrenom}</div>
                              <span className="text-[11px] text-slate-400 font-mono">{item.collaborateur.matricule}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.collaborateur.niveau}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center font-bold text-slate-700">
                          {item.nombreEvals}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="font-black text-slate-900 text-sm">{item.moyenneTotale}%</span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="font-bold text-slate-800">{item.derniereNote}%</span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <Sparkline data={item.historyScores} width={75} height={20} showTrend={true} />
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPersonalChargeId(item.collaborateur.id);
                              setSousOnglet('personnel');
                            }}
                            className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all cursor-pointer"
                          >
                            Voir profil
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SECTION TOUTES LES FICHES D'EVALUATION */}
      {/* ======================================================== */}
      {sousOnglet === 'fiches' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtres de recherche</span>
            </div>

            <div className={`grid grid-cols-1 ${currentRole === 'collaborateur' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
              {currentRole !== 'collaborateur' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Collaborateur
                  </label>
                  <select
                    value={selectedChargeFilter}
                    onChange={e => setSelectedChargeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">
                      {currentRole === 'n_plus_un' ? 'Tous les collaborateurs de mon équipe' : 'Tous les collaborateurs'}
                    </option>
                    {availableCharges.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nomPrenom} ({c.matricule})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Année
                </label>
                <select
                  value={selectedYearFilter}
                  onChange={e => setSelectedYearFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les années</option>
                  {anneesDisponibles.map(an => (
                    <option key={an} value={String(an)}>
                      Année {an}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statut
                </label>
                <select
                  value={selectedStatutFilter}
                  onChange={e => setSelectedStatutFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="termine">Terminé / Validé</option>
                  <option value="en_cours">En cours</option>
                  <option value="pas_commence">Pas encore commencé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Evaluations Single-Column List (Une seule colonne) */}
          <div className="space-y-3">
            {evaluationsFiltrees.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic bg-white/70 rounded-3xl border border-slate-200">
                Aucune fiche d'évaluation ne correspond à ces critères.
              </div>
            ) : (
              evaluationsFiltrees.map(ev => {
                const cdf = chargesDeFlux.find(c => c.id === ev.chargeDeFluxId);
                const moisNom = MOIS_LABELS[ev.mois - 1] || `Mois ${ev.mois}`;
                const statutBadge = getStatutBadge(ev.statut);
                const appreciation = getScoreAppreciation(ev.scoreTotal);

                return (
                  <div
                    key={ev.id}
                    className="relative overflow-hidden group bg-white/90 backdrop-blur-xl border border-slate-200/80 hover:border-blue-400/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 celestial-interactive"
                  >
                    {/* Manager & Period Info */}
                    <div className="flex items-center gap-3.5 min-w-[280px]">
                      <Avatar
                        photoUrl={cdf?.photoUrl}
                        nomPrenom={cdf?.nomPrenom || 'Collaborateur'}
                        size="md"
                        border
                        className="shrink-0 ring-2 ring-slate-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 leading-tight">
                            {cdf?.nomPrenom || 'Collaborateur inconnu'}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            {cdf?.niveau}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="font-mono text-[11px] text-slate-400">{cdf?.matricule}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-700">{moisNom} {ev.annee}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statutBadge.badgeColor}`}>
                            {statutBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scores in % (Total, Behavior, Delivery) */}
                    <div className="flex items-center gap-4 sm:gap-6 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/70 shrink-0">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Taux Total</span>
                        <span className="text-lg font-black text-blue-700">{ev.scoreTotal}%</span>
                      </div>
                      <div className="w-px h-7 bg-slate-200" />
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Behavior</span>
                        <span className="text-xs font-bold text-slate-800">
                          {Math.round((ev.scoreBehavior / 20) * 100)}%
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Management</span>
                        <span className="text-xs font-bold text-slate-800">
                          {Math.round((ev.scoreManagement / 20) * 100)}%
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Delivery</span>
                        <span className="text-xs font-bold text-slate-800">
                          {Math.round((ev.scoreDelivery / 60) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {ev.isAttested ? (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Attestée & Figée</span>
                        </span>
                      ) : ev.statut === 'termine' && onOpenAttestation ? (
                        <button
                          type="button"
                          onClick={() => onOpenAttestation(ev)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Signer électroniquement cette évaluation validée"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Attester & Signer</span>
                        </button>
                      ) : null}

                      {ev.actionsSuivi && ev.actionsSuivi.length > 0 && (
                        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mr-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ev.actionsSuivi.length} plan(s)</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setPdfExportEval(ev)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Télécharger ou imprimer en PDF avec graphiques"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalEvaluation(ev)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        Détails
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectEvaluationToEdit(ev.chargeDeFluxId, ev.mois, ev.annee)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                      >
                        {ev.isAttested || currentRole === 'collaborateur' ? 'Consulter' : 'Modifier'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* DETAILED INSPECTION MODAL */}
      {modalEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">
                  Détail complet de l'évaluation
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {chargesDeFlux.find(c => c.id === modalEvaluation.chargeDeFluxId)?.nomPrenom} —{' '}
                  {MOIS_LABELS[modalEvaluation.mois - 1]} {modalEvaluation.annee}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEvaluation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scores summary in % */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                <span className="text-xl font-black text-blue-700">{modalEvaluation.scoreTotal}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Behavior</span>
                <span className="text-base font-bold text-slate-800">
                  {Math.round((modalEvaluation.scoreBehavior / 20) * 100)}%
                </span>
                <span className="text-[9px] text-slate-400 block">Poids 20%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Management</span>
                <span className="text-base font-bold text-slate-800">
                  {Math.round((modalEvaluation.scoreManagement / 20) * 100)}%
                </span>
                <span className="text-[9px] text-slate-400 block">Poids 20%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery</span>
                <span className="text-base font-bold text-slate-800">
                  {Math.round((modalEvaluation.scoreDelivery / 60) * 100)}%
                </span>
                <span className="text-[9px] text-slate-400 block">Poids 60%</span>
              </div>
            </div>

            {/* Rubrics details with comments */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Détail des rubriques et justifications</h4>
              {blocs.map(bloc => (
                <div key={bloc.id} className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="p-3 bg-slate-50 font-bold text-slate-800 border-b border-slate-200">
                    {bloc.titreAffiche} ({bloc.poidsPourcentage}%)
                  </div>
                  <div className="divide-y divide-slate-100">
                    {bloc.rubriques.map(rub => {
                      const detail = modalEvaluation.notes?.[rub.id];
                      return (
                        <div key={rub.id} className="p-3 flex items-start justify-between gap-4">
                          <div>
                            <span className="font-semibold text-slate-900 block">{rub.titre}</span>
                            {detail?.commentaire && (
                              <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 italic mt-1">
                                « {detail.commentaire} »
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 px-2.5 py-1 bg-slate-100 rounded-lg shrink-0">
                            {detail?.note !== null && detail?.note !== undefined ? `${detail.note}%` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Rubrique Suivi actions */}
            {modalEvaluation.actionsSuivi && modalEvaluation.actionsSuivi.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Rubrique Suivi — Plans d'actions</span>
                {modalEvaluation.actionsSuivi.map(act => (
                  <div key={act.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{act.titre}</span>
                      {act.commentaire && <span className="text-[11px] text-slate-500 italic">{act.commentaire}</span>}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${
                        act.statut === 'OK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.statut === 'KO'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {act.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Global comment */}
            {modalEvaluation.commentaireGlobal && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Synthèse générale :</span>
                <p className="text-slate-700 italic leading-relaxed">{modalEvaluation.commentaireGlobal}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setPdfExportEval(modalEvaluation);
                  setModalEvaluation(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exporter en PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF EXPORT MODAL */}
      {pdfExportEval && (
        <PdfExportModal
          isOpen={Boolean(pdfExportEval)}
          onClose={() => setPdfExportEval(null)}
          evaluation={pdfExportEval}
          chargeDeFlux={chargesDeFlux.find(c => c.id === pdfExportEval.chargeDeFluxId) || chargesDeFlux[0]}
          blocs={blocs}
          historiqueEvaluations={evaluations}
        />
      )}
    </div>
  );
};
