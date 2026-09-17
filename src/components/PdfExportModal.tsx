import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  X,
  Award,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BlocRubrique, ChargeDeFlux, Evaluation } from '../types';
import { MOIS_LABELS } from '../data/initialData';
import { getScoreAppreciation } from '../utils/scoring';
import { RadarChartComp } from './RadarChartComp';
import { Sparkline } from './Sparkline';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './Avatar';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation;
  chargeDeFlux: ChargeDeFlux;
  blocs: BlocRubrique[];
  historiqueEvaluations?: Evaluation[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  chargeDeFlux,
  blocs,
  historiqueEvaluations = []
}) => {
  const { theme } = useTheme();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const moisNom = MOIS_LABELS[evaluation.mois - 1] || `Mois ${evaluation.mois}`;
  const appreciation = getScoreAppreciation(evaluation.scoreTotal);

  // Filter history for this flow manager up to current evaluation
  const flowManagerHistory = historiqueEvaluations
    .filter(e => e.chargeDeFluxId === chargeDeFlux.id)
    .sort((a, b) => (a.annee === b.annee ? a.mois - b.mois : a.annee - b.annee));

  const historyScores = flowManagerHistory.map(e => e.scoreTotal);

  const curveData = flowManagerHistory.map(e => ({
    label: `${MOIS_LABELS[e.mois - 1]?.substring(0, 3)} ${e.annee}`,
    Total: e.scoreTotal,
    Behavior: e.scoreBehavior,
    Management: e.scoreManagement,
    Delivery: e.scoreDelivery
  }));

  // Radar data for the current evaluation across individual rubrics
  const radarData = blocs.flatMap(b =>
    b.rubriques
      .filter(r => r.actif)
      .map(r => {
        const detail = evaluation.notes?.[r.id];
        let scoreRubrique = 0;
        if (detail && typeof detail.note === 'number') {
          scoreRubrique = detail.note;
        }
        const shortName = r.titre.length > 18 ? r.titre.substring(0, 16) + '…' : r.titre;
        return {
          axe: shortName,
          score: Math.min(120, Math.round(scoreRubrique)),
          cible: 100,
          fullMark: 120
        };
      })
  );

  // Direct PDF Download handler via html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGenerating(true);

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Subsequent pages if content overflows A4
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const cleanNom = chargeDeFlux.nomPrenom.replace(/\s+/g, '_');
      pdf.save(`Bilan_Performance_${cleanNom}_${moisNom}_${evaluation.annee}.pdf`);
    } catch (err) {
      console.error('Erreur de génération PDF:', err);
      // Fallback to browser print
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar dynamic theme */}
        <div
          style={{ backgroundColor: theme.primaire }}
          className="px-6 py-4 text-white flex items-center justify-between gap-4 shrink-0 transition-colors duration-300"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Export Bilan PDF & Partage Collaborateur
              </h2>
              <p className="text-xs text-white/80">
                {chargeDeFlux.nomPrenom} • {moisNom} {evaluation.annee}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-200" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadPdf}
              style={{ color: theme.primaire }}
              className="px-4 py-2 text-xs font-bold bg-white hover:bg-sky-50 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger le PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60">
          <div
            ref={printRef}
            id="printable-pdf-document"
            className="w-full max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 text-slate-900 space-y-6"
          >
            {/* Header Document */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <div>
                <span className="inline-block text-[11px] font-bold tracking-widest text-[#003D5B] uppercase bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md mb-2">
                  BILAN MENSUEL DE PERFORMANCE
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Fiche d'Évaluation du Manager
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-0.5">
                  Période évaluée : <span className="text-slate-900 font-bold">{moisNom} {evaluation.annee}</span>
                </p>
              </div>

              <div className="text-right sm:self-start bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 min-w-[200px]">
                <div>
                  <span className="text-slate-500">Date d'entretien : </span>
                  <span className="font-semibold text-slate-900">{evaluation.dateEntretien || 'Non renseignée'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Responsable N+1 : </span>
                  <span className="font-semibold text-slate-900">{evaluation.nPlusUn}</span>
                </div>
                <div>
                  <span className="text-slate-500">Statut : </span>
                  <span className="font-bold text-emerald-700 uppercase">{evaluation.statut}</span>
                </div>
              </div>
            </div>

            {/* Identité Collaborateur avec Photo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-3.5">
                <Avatar
                  photoUrl={chargeDeFlux.photoUrl}
                  nomPrenom={chargeDeFlux.nomPrenom}
                  size="lg"
                  border
                  className="ring-2 ring-slate-200 shrink-0"
                />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Manager évalué</span>
                  <span className="font-bold text-slate-900 text-base">{chargeDeFlux.nomPrenom}</span>
                  <span className="text-slate-500 block mt-0.5 font-mono">{chargeDeFlux.matricule}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:border-l sm:border-slate-200 sm:pl-6">
                <div>
                  <span className="text-slate-500 block font-semibold">Niveau de poste</span>
                  <span className="inline-block px-2.5 py-1 bg-blue-100/70 text-blue-800 font-bold rounded-lg mt-0.5">
                    {chargeDeFlux.niveau}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Tendance</span>
                  <div className="mt-1">
                    <Sparkline data={historyScores} width={80} height={20} showTrend={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* Score Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="text-[11px] font-bold text-blue-700 uppercase block">Score Total</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-blue-900">{evaluation.scoreTotal}%</span>
                </div>
                <span className="text-[10px] text-blue-700 font-medium block mt-1">{appreciation.texte}</span>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Behavior (20%)</span>
                <div className="text-xl font-black text-amber-950 mt-1">
                  {Math.round((evaluation.scoreBehavior / 20) * 100)}%
                </div>
                <span className="text-[10px] text-amber-700 block mt-1">
                  Poids dans la note : 20%
                </span>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <span className="text-[11px] font-bold text-indigo-800 uppercase block">Management (20%)</span>
                <div className="text-xl font-black text-indigo-950 mt-1">
                  {Math.round((evaluation.scoreManagement / 20) * 100)}%
                </div>
                <span className="text-[10px] text-indigo-700 block mt-1">
                  Poids dans la note : 20%
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Delivery (60%)</span>
                <div className="text-xl font-black text-emerald-950 mt-1">
                  {Math.round((evaluation.scoreDelivery / 60) * 100)}%
                </div>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  Poids dans la note : 60%
                </span>
              </div>
            </div>

            {/* GRAPHIQUES : Courbe Individuelle + Toile (Spider / Radar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Courbe Individuelle d'évolution */}
              <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>Courbe individuelle d'évolution</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">Scores mensuels</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curveData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[0, 120]} tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="Total"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique en toile (Radar) */}
              <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>Graphique en toile (Profil compétences)</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">Équilibre des blocs</span>
                </div>
                <RadarChartComp
                  data={radarData}
                  collaborateurNom={chargeDeFlux.nomPrenom.split(' ')[0]}
                  hauteur={175}
                  afficherMoyenneEquipe={false}
                />
              </div>
            </div>

            {/* RUBRIQUE SUIVI (Non noté : OK, KO, En cours) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Rubrique Suivi — Plans d'actions discutés
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                  Non noté • Réalisé ou non
                </span>
              </div>

              <div className="p-4 space-y-2.5 text-xs">
                {evaluation.actionsSuivi && evaluation.actionsSuivi.length > 0 ? (
                  evaluation.actionsSuivi.map((act, i) => (
                    <div
                      key={act.id || i}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">{act.titre}</span>
                        {act.commentaire && (
                          <p className="text-slate-600 italic text-[11px]">{act.commentaire}</p>
                        )}
                        {act.datePrevue && (
                          <span className="text-[10px] text-slate-400 block">Échéance : {act.datePrevue}</span>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-1 text-[11px] font-black rounded-lg shrink-0 ${
                          act.statut === 'OK'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : act.statut === 'KO'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {act.statut}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-center py-2">
                    Aucun plan d'action spécifique renseigné pour cette période.
                  </p>
                )}
              </div>
            </div>

            {/* Détail par Rubrique */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                Détail des évaluations par groupe de rubrique
              </h3>

              {blocs.map(bloc => {
                let scoreBloc = 0;
                let maxBloc = bloc.poidsPourcentage;
                if (bloc.id === 'bloc-behavior') scoreBloc = evaluation.scoreBehavior;
                else if (bloc.id === 'bloc-management') scoreBloc = evaluation.scoreManagement;
                else if (bloc.id === 'bloc-delivery') scoreBloc = evaluation.scoreDelivery;

                return (
                  <div key={bloc.id} className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{bloc.titreAffiche}</span>
                      <span className="font-bold text-slate-900">
                        {maxBloc > 0 ? Math.round((scoreBloc / maxBloc) * 100) : 0}% (Poids {maxBloc}%)
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {bloc.rubriques.map(rub => {
                        const detail = evaluation.notes?.[rub.id];
                        const noteVal = detail?.note !== undefined && detail?.note !== null ? `${detail.note}%` : 'Non noté';
                        const isSurperf = detail?.note === 120;
                        const isKo = detail?.note === 0;

                        return (
                          <div key={rub.id} className="p-3 flex items-start justify-between gap-4">
                            <div className="space-y-0.5 max-w-[75%]">
                              <span className="font-semibold text-slate-900 block">{rub.titre}</span>
                              <p className="text-[11px] text-slate-500">{rub.description}</p>
                              {detail?.commentaire && (
                                <p className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100 italic mt-1">
                                  « {detail.commentaire} »
                                </p>
                              )}
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-md font-bold text-xs shrink-0 ${
                                isSurperf
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : isKo
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : detail?.note === 100
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {noteVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Synthèse générale */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 block">Synthèse générale et conclusion de l'entretien :</span>
              <p className="text-slate-700 leading-relaxed italic">
                {evaluation.commentaireGlobal || 'Aucun commentaire général saisi.'}
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-xs">
              <div className="space-y-8">
                <span className="text-slate-500 font-semibold block">Signature du Responsable N+1 :</span>
                <div className="border-b border-dashed border-slate-400 pb-1 font-medium text-slate-800">
                  {evaluation.nPlusUn}
                </div>
              </div>

              <div className="space-y-8">
                <span className="text-slate-500 font-semibold block">Signature du Manager :</span>
                <div className="border-b border-dashed border-slate-400 pb-1 font-medium text-slate-800">
                  {chargeDeFlux.nomPrenom}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
