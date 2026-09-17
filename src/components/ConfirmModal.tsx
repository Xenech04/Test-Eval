import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDanger = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Liquid glass backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal dialog with liquid glass styling */}
      <div className="relative w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200 z-10 overflow-hidden group">
        {/* Subtle glass liquid gradient shimmer on hover */}
        <div className="absolute -inset-px bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-60 pointer-events-none rounded-2xl" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
                  isDanger
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}
              >
                {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-slate-700 leading-relaxed">{message}</p>
            {details && (
              <p className="text-xs text-slate-500 bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5">
                {details}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 ${
                isDanger
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/20 hover:shadow-rose-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
              }`}
            >
              {isDanger && <Trash2 className="w-4 h-4" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
