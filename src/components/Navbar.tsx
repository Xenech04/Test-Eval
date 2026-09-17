import React from 'react';
import { ClipboardList, FolderKanban, Settings, Award, Palette, User, LogOut, Bell, ShieldCheck, ChevronDown, Lock } from 'lucide-react';
import { OngletPrincipal, Evaluation } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

interface NavbarProps {
  ongletActif: OngletPrincipal;
  onChangerOnglet: (onglet: OngletPrincipal) => void;
  nbCharges: number;
  nbEvaluations: number;
  appName?: string;
  evaluations?: Evaluation[];
  onOpenAttestation?: (evalItem: Evaluation) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  ongletActif,
  onChangerOnglet,
  nbCharges,
  nbEvaluations,
  appName = 'CONCENTRIX',
  evaluations = [],
  onOpenAttestation
}) => {
  const { theme } = useTheme();
  const { currentUser, currentRole, setShowLoginModal, logout } = useAuth();

  // Find evaluations needing attestation for the logged-in collaborator
  const pendingAttestation = React.useMemo(() => {
    if (currentRole !== 'collaborateur' || !currentUser?.chargeDeFluxId) return [];
    return evaluations.filter(
      e => e.chargeDeFluxId === currentUser.chargeDeFluxId && e.statut === 'termine' && !e.isAttested
    );
  }, [currentRole, currentUser, evaluations]);

  const getRoleLabel = () => {
    if (currentRole === 'admin') return 'Administrateur';
    if (currentRole === 'n_plus_un') return 'Responsable N+1';
    return 'Collaborateur';
  };

  return (
    <header
      style={{
        backgroundColor: theme.headerBg || `${theme.primaire}c0`,
        borderColor: theme.headerBorder || 'rgba(255, 255, 255, 0.25)',
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.16), 0 0 25px 0 ${theme.liquidGlassGlow || 'rgba(255, 255, 255, 0.1)'}`
      }}
      className="sticky top-0 z-40 text-white border-b backdrop-blur-2xl transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* App title without logo as requested */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-black text-xl text-white tracking-wider">
              {appName || 'CONCENTRIX'}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 shadow-xs hidden sm:inline-block">
              Managers
            </span>
          </div>

          {/* Navigation Tabs - Liquid Glass pill style in header */}
          <nav
            style={{ backgroundColor: `${theme.sombre}cc` }}
            className="flex items-center gap-1.5 p-1 backdrop-blur-md rounded-2xl border border-white/15 shadow-inner"
          >
            {/* Tab Evaluation (Only for Admin and Responsable N+1) */}
            {currentRole !== 'collaborateur' && (
              <button
                id="nav-tab-evaluation"
                type="button"
                onClick={() => onChangerOnglet('evaluation')}
                style={ongletActif === 'evaluation' ? { color: theme.primaire } : undefined}
                className={`relative overflow-hidden group flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ongletActif === 'evaluation'
                    ? 'bg-white shadow-md font-extrabold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Évaluation</span>
              </button>
            )}

            <button
              id="nav-tab-mes-docs"
              type="button"
              onClick={() => onChangerOnglet('mes_docs')}
              style={ongletActif === 'mes_docs' ? { color: theme.primaire } : undefined}
              className={`relative overflow-hidden group flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ongletActif === 'mes_docs'
                  ? 'bg-white shadow-md font-extrabold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Mes docs</span>
              {nbEvaluations > 0 && (
                <span
                  style={ongletActif === 'mes_docs' ? { backgroundColor: `${theme.primaire}25`, color: theme.primaire } : undefined}
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    ongletActif === 'mes_docs'
                      ? ''
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {nbEvaluations}
                </span>
              )}
            </button>

            {/* Paramètres Tab visible to all users (Admins, N+1 and Collaborators) */}
            <button
              id="nav-tab-parametres"
              type="button"
              onClick={() => onChangerOnglet('parametres')}
              style={ongletActif === 'parametres' ? { color: theme.primaire } : undefined}
              className={`relative overflow-hidden group flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ongletActif === 'parametres'
                  ? 'bg-white shadow-md font-extrabold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
              title={currentRole === 'admin' ? 'Paramètres administrateur' : 'Mon compte & mot de passe'}
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
              {currentRole === 'admin' && nbCharges > 0 && (
                <span
                  style={ongletActif === 'parametres' ? { backgroundColor: `${theme.primaire}25`, color: theme.primaire } : undefined}
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black hidden md:inline-block ${
                    ongletActif === 'parametres'
                      ? ''
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {nbCharges}
                </span>
              )}
            </button>
          </nav>

          {/* User Session Bar */}
          <div className="flex items-center gap-2.5">
            {/* Collaborator Attestation Alert Pill */}
            {pendingAttestation.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenAttestation && onOpenAttestation(pendingAttestation[0])}
                className="animate-bounce flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] shadow-lg cursor-pointer hover:bg-amber-300 transition-all border border-amber-300 ring-2 ring-amber-400/40"
                title="Vous avez une évaluation en attente d'attestation !"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-900" />
                <span className="hidden sm:inline">À Attester</span>
                <span className="w-4 h-4 rounded-full bg-amber-900 text-white text-[9px] flex items-center justify-center font-black">
                  {pendingAttestation.length}
                </span>
              </button>
            )}

            {/* Session Bubble & Disconnect Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md cursor-pointer transition-all shadow-sm group"
                  title="Détails du compte et gestion de session"
                >
                  <Avatar
                    photoUrl={currentUser.photoUrl}
                    nomPrenom={currentUser.nomAffiche}
                    size="sm"
                    className="ring-1 ring-white/40"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                      <span className="max-w-[130px] truncate">{currentUser.nomAffiche}</span>
                      <ChevronDown className="w-3 h-3 text-white/70 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[10px] text-sky-200/90 font-medium">
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>

                {/* Bouton Se Déconnecter pour changer de session */}
                <button
                  id="nav-logout-btn"
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/15 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 hover:border-rose-400 shadow-xs group"
                  title="Se déconnecter pour basculer sur une autre session ou quitter"
                >
                  <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

