import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { CalculScoresResult } from '../utils/scoring';
import { ChargeDeFlux } from '../types';
import { MOIS_LABELS } from '../data/initialData';
import { useTheme } from '../context/ThemeContext';

interface ValidationModalProps {
  isOpen: boolean;
  charge: ChargeDeFlux;
  mois: number;
  annee: number;
  dateEntretien: string;
  scores: CalculScoresResult;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  charge,
  mois,
  annee,
  dateEntretien,
  scores,
  onConfirm,
  onCancel
}) => {
  const { theme } = useTheme();
  if (!isOpen) return null;

  const moisNom = MOIS_LABELS[mois - 1] || `Mois ${mois}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with dynamic theme */}
        <div
          style={{ backgroundColor: theme.primaire }}
          className="text-white p-5 flex items-center justify-between transition-colors duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Validation définitive de la note
              </h3>
              <p className="text-xs text-sky-100/75">
                Vérifiez les données avant de figer l'évaluation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {/* Evaluation recap card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Manager</span>
              <span className="font-semibold text-slate-900">{charge.nomPrenom} ({charge.matricule})</span>
            </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">Période évaluée</span>
            <span className="font-semibold text-slate-900">{moisNom} {annee}</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">Date de l'entretien</span>
            <span className="font-semibold text-slate-900">{dateEntretien || 'Non renseignée'}</span>
          </div>

          {/* Scores breakdown */}
          <div className="pt-1">
            <div className="text-xs font-semibold text-slate-700 mb-2">Récapitulatif des blocs :</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                <div className="text-[10px] text-amber-700 font-medium uppercase">Behavior (20%)</div>
                <div className="text-sm font-bold text-amber-900">{scores.scoreBehavior} / 20</div>
              </div>
              <div className="p-2 bg-blue-50/70 border border-blue-200/60 rounded-lg">
                <div className="text-[10px] text-blue-700 font-medium uppercase">Management (20%)</div>
                <div className="text-sm font-bold text-blue-900">{scores.scoreManagement} / 20</div>
              </div>
              <div className="p-2 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                <div className="text-[10px] text-emerald-700 font-medium uppercase">Delivery (60%)</div>
                <div className="text-sm font-bold text-emerald-900">{scores.scoreDelivery} / 60</div>
              </div>
            </div>

            {/* Total note */}
            <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium">Note finale globale</span>
                <div className="text-xs text-slate-400">Équivalent sur 20 points</div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-400">{scores.scoreTotal}%</span>
                <span className="text-xs text-slate-300 ml-2 font-semibold">({scores.noteSurVingt} / 20)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning message */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
          <strong>Avertissement :</strong> En confirmant, le statut de cette évaluation passera définitivement à <strong>« Terminé »</strong>. Elle sera enregistrée et consultable dans la section <strong>Mes docs</strong>.
        </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              id="btn-cancel-modal-validation"
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              Revenir à la saisie
            </button>
            <button
              id="btn-confirm-modal-validation"
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmer la validation finale</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
