import React, { useState } from 'react';
import {
  Users,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Plus,
  Edit2,
  Check,
  X,
  UserCheck,
  Lock,
  Filter,
  UserPlus,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserAccount, UserRole, ChargeDeFlux } from '../types';
import { Avatar } from './Avatar';

interface AccountsAdminSectionProps {
  chargesDeFlux: ChargeDeFlux[];
}

export const AccountsAdminSection: React.FC<AccountsAdminSectionProps> = ({ chargesDeFlux }) => {
  const { theme } = useTheme();
  const {
    allAccounts,
    updateUserPassword,
    updateAccount,
    createAccount,
    logout,
    currentUser,
    syncAccountsWithCharges
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  
  // Password edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Create new account modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createNom, setCreateNom] = useState('');
  const [createPassword, setCreatePassword] = useState('pass123');
  const [createRole, setCreateRole] = useState<UserRole>('n_plus_un');
  const [createN1Nom, setCreateN1Nom] = useState('');
  const [createError, setCreateError] = useState('');

  const toggleReveal = (userId: string) => {
    setRevealedPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleStartEditPassword = (acc: UserAccount) => {
    setEditingUserId(acc.id);
    setNewPasswordInput(acc.password);
    setEditSuccessMsg('');
  };

  const handleSavePassword = (userId: string) => {
    if (!newPasswordInput.trim()) return;
    updateUserPassword(userId, newPasswordInput.trim());
    setEditingUserId(null);
    setEditSuccessMsg('Mot de passe mis à jour avec succès.');
    setTimeout(() => setEditSuccessMsg(''), 3000);
  };

  const handleToggleStatus = (acc: UserAccount) => {
    updateAccount({ ...acc, actif: !acc.actif });
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!createUsername.trim() || !createNom.trim() || !createPassword.trim()) {
      setCreateError('Tous les champs obligatoires doivent être renseignés.');
      return;
    }

    if (allAccounts.some(a => a.username.toLowerCase() === createUsername.trim().toLowerCase())) {
      setCreateError('Cet identifiant est déjà utilisé.');
      return;
    }

    createAccount({
      username: createUsername.trim().toLowerCase(),
      nomAffiche: createNom.trim(),
      password: createPassword.trim(),
      role: createRole,
      nPlusUnNom: createRole === 'n_plus_un' ? createNom.trim() : (createN1Nom.trim() || undefined),
      actif: true,
      email: `${createUsername.trim().toLowerCase()}@concentrix.com`
    });

    setShowCreateModal(false);
    setCreateUsername('');
    setCreateNom('');
    setCreatePassword('pass123');
    setEditSuccessMsg('Nouveau compte créé avec succès.');
    setTimeout(() => setEditSuccessMsg(''), 3000);
  };

  const filteredAccounts = allAccounts.filter(acc => {
    if (roleFilter !== 'all' && acc.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        acc.nomAffiche.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        (acc.nPlusUnNom && acc.nPlusUnNom.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrateur', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'n_plus_un':
        return { label: 'Responsable N+1', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'collaborateur':
        return { label: 'Collaborateur', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Sécurité & Contrôle d'Accès</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Gestion des Mots de Passe & Comptes Utilisateurs
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Seul l'Administrateur peut voir et modifier les mots de passe. Les Responsables N+1 sont automatiquement restreints à la gestion exclusive de leurs collaborateurs N-1.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => syncAccountsWithCharges(chargesDeFlux)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Synchroniser avec la liste des Managers"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resynchroniser Managers</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: theme.primaire }}
            className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un Compte</span>
          </button>
        </div>
      </div>

      {editSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{editSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, identifiant..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Role Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 backdrop-blur-md rounded-xl border border-white/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              roleFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({allAccounts.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              roleFilter === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admins
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('n_plus_un')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              roleFilter === 'n_plus_un'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Responsables N+1
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('collaborateur')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              roleFilter === 'collaborateur'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Collaborateurs
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Utilisateur & Nom</th>
                <th className="py-3.5 px-5">Identifiant (Login)</th>
                <th className="py-3.5 px-5">Rôle & Périmètre</th>
                <th className="py-3.5 px-5">
                  <div className="flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mot de passe (Admin seul)</span>
                  </div>
                </th>
                <th className="py-3.5 px-5 text-center">Statut</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredAccounts.map((acc) => {
                const isCurrentSession = currentUser?.id === acc.id;
                const isEditingPassword = editingUserId === acc.id;
                const isPasswordRevealed = Boolean(revealedPasswords[acc.id]);
                const roleInfo = getRoleBadge(acc.role);

                // Count N-1 collaborateurs if this is an N+1 manager
                const nMoinsUnCount = acc.role === 'n_plus_un' && acc.nPlusUnNom
                  ? chargesDeFlux.filter(c => c.nPlusUn === acc.nPlusUnNom).length
                  : null;

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          photoUrl={acc.photoUrl}
                          nomPrenom={acc.nomAffiche}
                          size="sm"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{acc.nomAffiche}</span>
                            {isCurrentSession && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                Session actuelle
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{acc.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {acc.username}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                        {acc.role === 'n_plus_un' && (
                          <div className="text-[11px] text-indigo-700 font-medium">
                            {nMoinsUnCount} collaborateur(s) dans son équipe
                          </div>
                        )}
                        {acc.role === 'collaborateur' && acc.nPlusUnNom && (
                          <div className="text-[11px] text-slate-500">
                            N+1 : <strong className="text-slate-700">{acc.nPlusUnNom}</strong>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Password Management */}
                    <td className="py-4 px-5">
                      {isEditingPassword ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-blue-400 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePassword(acc.id)}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="Valider"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="p-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                            title="Annuler"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 min-w-[90px] text-center">
                            {isPasswordRevealed ? acc.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(acc.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title={isPasswordRevealed ? 'Masquer' : 'Afficher'}
                          >
                            {isPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEditPassword(acc)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Modifier le mot de passe"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(acc)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          acc.actif
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                        title="Cliquer pour changer le statut"
                      >
                        {acc.actif ? 'Actif' : 'Désactivé'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => logout()}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                          title={`Se déconnecter pour basculer sur la session de ${acc.nomAffiche} (${acc.username})`}
                        >
                          <LogOut className="w-3 h-3 text-slate-500" />
                          <span>Se déconnecter pour basculer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Créer un Compte & Mot de Passe</h3>
                  <p className="text-xs text-slate-500">Ajout d'un nouvel utilisateur dans le système</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAccountSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Rôle de l'utilisateur</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="n_plus_un">Responsable N+1</option>
                  <option value="collaborateur">Collaborateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nom & Prénom</label>
                <input
                  type="text"
                  value={createNom}
                  onChange={(e) => setCreateNom(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Identifiant de connexion (Username)</label>
                <input
                  type="text"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="ex: jdupont"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mot de passe initial</label>
                <input
                  type="text"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {createRole === 'collaborateur' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nom du Responsable N+1 rattaché</label>
                  <input
                    type="text"
                    value={createN1Nom}
                    onChange={(e) => setCreateN1Nom(e.target.value)}
                    placeholder="ex: Sarah Alami"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primaire }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
