import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMsg('Veuillez renseigner votre identifiant ou email.');
      return;
    }
    if (!password) {
      setErrorMsg('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    // Execute login
    const res = login(cleanUser, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Identifiant ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-sky-50/50 to-slate-200/70 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-sky-500 selection:text-white">
      {/* Decorative subtle light ambient orbs */}
      <div
        style={{ backgroundColor: `${theme.primaire}12` }}
        className="fixed top-10 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
      />
      <div
        style={{ backgroundColor: `${theme.accent}10` }}
        className="fixed bottom-10 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
      />

      {/* Main Login Card - Fenêtre de saisie en FOND CLAIR */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] p-7 sm:p-9 relative z-10 text-slate-800">
        {/* Brand header */}
        <div className="text-center space-y-3 mb-6">
          <div
            style={{ backgroundColor: `${theme.primaire}10`, borderColor: `${theme.primaire}30` }}
            className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto shadow-2xs text-[#003D5B]"
          >
            <Building2 className="w-8 h-8" style={{ color: theme.primaire }} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>CONCENTRIX Madagascar</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Portail d'Évaluation
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Veuillez saisir vos identifiants pour accéder à l'outil d'évaluation et de suivi de performance.
            </p>
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Identifiant, Matricule ou Email</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin, salami, CDF001..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-2xs font-medium"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Mot de passe</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Saisissez votre mot de passe"
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-2xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: theme.primaire }}
            className="w-full mt-2 py-3.5 px-5 rounded-2xl text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{isLoading ? 'Connexion en cours...' : "Accéder à l'outil"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Subtle footer */}
      <footer className="mt-6 text-center text-xs text-slate-500">
        <span>CONCENTRIX Madagascar • Gestion des Évaluations</span>
      </footer>
    </div>
  );
};
