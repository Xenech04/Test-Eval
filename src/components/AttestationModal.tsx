import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Lock, AlertTriangle, MessageSquare, X, Calendar, User, Award } from 'lucide-react';
import { Evaluation, ChargeDeFlux, BlocRubrique } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MOIS_LABELS } from '../data/initialData';
import { getScoreAppreciation } from '../utils/scoring';

interface AttestationModalProps {
  evaluation: Evaluation;
  charge: ChargeDeFlux;
  blocs: BlocRubrique[];
  isOpen: boolean;
  onClose: () => void;
  onAttest: (evalId: string, commentaireCollaborateur: string) => void;
}

export const AttestationModal: React.FC<AttestationModalProps> = ({
  evaluation,
  charge,
  blocs,
  isOpen,
  onClose,
  onAttest
}) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [commentaire, setCommentaire] = useState('');
  const [agreeCheck, setAgreeCheck] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const moisNom = MOIS_LABELS[evaluation.mois - 1] || `Mois ${evaluation.mois}`;
  const appreciation = getScoreAppreciation(evaluation.scoreTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreeCheck) {
      setErrorMsg("Veuillez cocher la case d'attestation pour confirmer la prise de connaissance.");
      return;
    }

    onAttest(evaluation.id, commentaire.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          style={{ backgroundColor: theme.sombre }}
          className="p-6 text-white flex items-center justify-between relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider text-emerald-300 mb-1">
                <Lock className="w-3 h-3" />
                <span>Attestation & Figeage des Données</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Attester l'Évaluation de {moisNom} {evaluation.annee}
              </h3>
              <p className="text-xs text-slate-300">
                Collaborateur : {charge.nomPrenom} ({charge.matricule})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs">Avis important de clôture</div>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Votre responsable <strong>{evaluation.nPlusUn || charge.nPlusUn}</strong> a validé et signé cette évaluation.
                En procédant à l'attestation, <strong>les données de cette fiche seront définitivement figées</strong>. Ni vous ni votre responsable ne pourrez plus modifier les notes ni les commentaires.
              </p>
            </div>
          </div>

          {/* Scores Overview Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Note Finale Mensuelle</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-black text-slate-900">{evaluation.scoreTotal}%</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${appreciation.badgeColor}`}>
                    {appreciation.texte}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Behavior (20%)</span>
                  <span className="font-bold text-slate-800">{evaluation.scoreBehavior}/20</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Management (20%)</span>
                  <span className="font-bold text-slate-800">{evaluation.scoreManagement}/20</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Delivery (60%)</span>
                  <span className="font-bold text-slate-800">{evaluation.scoreDelivery}/60</span>
                </div>
              </div>
            </div>

            {/* Manager Comment */}
            {evaluation.commentaireGlobal ? (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Commentaire du Responsable ({evaluation.nPlusUn || charge.nPlusUn})</span>
                </span>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 italic">
                  "{evaluation.commentaireGlobal}"
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">Aucun commentaire rédigé par le responsable.</p>
            )}

            {evaluation.dateValidation && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Validé le {new Date(evaluation.dateValidation).toLocaleDateString('fr-FR')} par {evaluation.validePar || evaluation.nPlusUn}</span>
              </div>
            )}
          </div>

          {/* Collaborator Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Commentaire ou observation du collaborateur (facultatif)</span>
                <span className="text-[10px] text-slate-400 font-normal">Sera enregistré sur la fiche officielle</span>
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Indiquez ici vos remarques, vos engagements ou vos perspectives pour le mois prochain..."
                rows={3}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeCheck}
                onChange={(e) => setAgreeCheck(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-blue-950 leading-relaxed font-medium">
                Je confirme avoir pris connaissance de l'évaluation, des notes attribuées et des commentaires. J'atteste ce résultat et confirme le figeage définitif de cette fiche.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Attester & Figer Définitivement</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
