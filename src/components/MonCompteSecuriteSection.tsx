import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Mail,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './Avatar';

export const MonCompteSecuriteSection: React.FC = () => {
  const { theme } = useTheme();
  const { currentUser, updateUserPassword } = useAuth();

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');

  // Status feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) {
    return null;
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!ancienMotDePasse) {
      setErrorMsg('Veuillez renseigner votre mot de passe actuel.');
      return;
    }

    if (ancienMotDePasse !== currentUser.password) {
      setErrorMsg('Le mot de passe actuel saisi est incorrect.');
      return;
    }

    if (!nouveauMotDePasse || nouveauMotDePasse.length < 4) {
      setErrorMsg('Le nouveau mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    if (nouveauMotDePasse === currentUser.password) {
      setErrorMsg('Le nouveau mot de passe doit être différent du mot de passe actuel.');
      return;
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErrorMsg('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    // Update password
    updateUserPassword(currentUser.id, nouveauMotDePasse);

    setAncienMotDePasse('');
    setNouveauMotDePasse('');
    setConfirmationMotDePasse('');
    setSuccessMsg('Votre mot de passe a été modifié avec succès !');
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'n_plus_un':
        return 'Responsable N+1';
      case 'collaborateur':
        return 'Collaborateur (Chargé de Flux)';
      default:
        return 'Utilisateur';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: `${theme.primaire}15`, borderColor: `${theme.primaire}30` }}
            className="w-12 h-12 rounded-2xl border flex items-center justify-center text-[#003D5B] shadow-2xs"
          >
            <ShieldCheck className="w-6 h-6" style={{ color: theme.primaire }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mon Profil & Sécurité
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez vos informations de compte et modifiez votre mot de passe d'accès
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>CONCENTRIX Madagascar</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Details (Identifiant et informations) */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <Avatar
              photoUrl={currentUser.photoUrl}
              nomPrenom={currentUser.nomAffiche}
              size="lg"
              className="mx-auto ring-4 ring-sky-50 shadow-sm"
            />
            <div>
              <h2 className="text-base font-black text-slate-900">{currentUser.nomAffiche}</h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                {getRoleLabel()}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Identifiant de connexion</span>
              </span>
              <p className="font-mono text-sm font-black text-slate-900">{currentUser.username}</p>
            </div>

            {currentUser.email && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Adresse e-mail</span>
                </span>
                <p className="font-semibold text-slate-800 break-all">{currentUser.email}</p>
              </div>
            )}

            {currentUser.nPlusUnNom && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentUser.role === 'collaborateur' ? 'Responsable N+1' : 'Équipe / Réf.'}</span>
                </span>
                <p className="font-semibold text-slate-800">{currentUser.nPlusUnNom}</p>
              </div>
            )}

            {/* Current Password reveal box */}
            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                  <span>Mon Mot de Passe Actuel</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(p => !p)}
                  className="text-sky-700 hover:text-sky-900 transition-colors p-1 cursor-pointer"
                  title={showCurrentPassword ? 'Masquer' : 'Afficher'}
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="font-mono text-sm font-bold text-slate-800 tracking-wider">
                {showCurrentPassword ? currentUser.password : '••••••••••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-600" />
              <span>Modifier mon mot de passe</span>
            </h2>
            <p className="text-xs text-slate-500">
              Mettez à jour vos identifiants pour sécuriser votre session d'évaluation.
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Ancien mot de passe */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Mot de passe actuel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={ancienMotDePasse}
                  onChange={(e) => setAncienMotDePasse(e.target.value)}
                  placeholder="Saisissez votre mot de passe actuel"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Nouveau mot de passe */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={nouveauMotDePasse}
                    onChange={(e) => setNouveauMotDePasse(e.target.value)}
                    placeholder="Min. 4 caractères"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmationMotDePasse}
                    onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                style={{ backgroundColor: theme.primaire }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistrer mon nouveau mot de passe</span>
              </button>
            </div>
          </form>

          {/* Security tips */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 mt-6">
            <span className="font-bold text-slate-800">Sécurité de votre compte :</span>
            <p className="text-[11px] text-slate-500">
              Une fois votre mot de passe mis à jour, il sera requis lors de votre prochaine connexion après vous être déconnecté.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
