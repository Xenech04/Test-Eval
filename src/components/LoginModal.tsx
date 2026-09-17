import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, X, ArrowRight, LogOut, ShieldCheck, Building2, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './Avatar';
import { UserRole } from '../types';

export const LoginModal: React.FC = () => {
  const { theme } = useTheme();
  const {
    currentUser,
    isLoggedIn,
    showLoginModal,
    setShowLoginModal,
    login,
    logout
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!showLoginModal) {
    return null;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Veuillez saisir votre identifiant ou email.');
      return;
    }
    if (!password) {
      setErrorMsg('Veuillez saisir votre mot de passe.');
      return;
    }

    const res = login(username, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Échec de la connexion.');
    } else {
      setUsername('');
      setPassword('');
      setErrorMsg('');
      setShowLoginModal(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrateur', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'n_plus_un':
        return { label: 'Responsable N+1', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'collaborateur':
        return { label: 'Collaborateur', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      {/* Fenêtre de saisie en FOND CLAIR */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl text-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${theme.primaire}15`, borderColor: `${theme.primaire}30` }}
              className="w-11 h-11 rounded-2xl border flex items-center justify-center text-[#003D5B] shadow-2xs"
            >
              <Lock className="w-5 h-5" style={{ color: theme.primaire }} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>{isLoggedIn ? 'Gestion de Session' : 'Connexion au Portail'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                CONCENTRIX Madagascar • Espace sécurisé
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLoginModal(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* If already logged in, show current session and disconnect button to switch */}
          {isLoggedIn && currentUser ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <Avatar
                  photoUrl={currentUser.photoUrl}
                  nomPrenom={currentUser.nomAffiche}
                  size="md"
                  className="ring-2 ring-white shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base font-black text-slate-900">{currentUser.nomAffiche}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getRoleBadge(currentUser.role).color}`}>
                      {getRoleBadge(currentUser.role).label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5 font-medium">
                    <p>Identifiant : <span className="font-mono text-slate-800 font-bold">{currentUser.username}</span></p>
                    {currentUser.email && <p>Email : {currentUser.email}</p>}
                    {currentUser.nPlusUnNom && <p>Responsable N+1 : {currentUser.nPlusUnNom}</p>}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Changement de session</span>
                </div>
                <p>
                  Pour basculer sur une autre session (Admin, Responsable N+1 ou Collaborateur), vous devez d'abord vous déconnecter de la session actuelle, puis saisir les identifiants du compte souhaité.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowLoginModal(false);
                }}
                className="w-full py-3.5 px-5 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter pour changer de session</span>
              </button>
            </div>
          ) : (
            /* Login Form in fond clair */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Identifiant, Matricule ou Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: admin, salami, CDF001..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15"
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: theme.primaire }}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              >
                <span>Accéder à l'outil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
