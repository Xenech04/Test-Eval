import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserAccount, UserRole, SessionState, ChargeDeFlux } from '../types';
import { loadUserAccounts, saveUserAccounts, loadCurrentSession, saveCurrentSession, loadChargesDeFlux } from '../utils/storage';

interface AuthContextType {
  currentUser: UserAccount | null;
  currentRole: UserRole;
  isLoggedIn: boolean;
  allAccounts: UserAccount[];
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUserPassword: (userId: string, newPass: string) => void;
  updateAccount: (account: UserAccount) => void;
  createAccount: (acc: Omit<UserAccount, 'id'>) => void;
  deleteAccount: (userId: string) => void;
  syncAccountsWithCharges: (charges: ChargeDeFlux[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateInitialAccounts(charges: ChargeDeFlux[]): UserAccount[] {
  const accounts: UserAccount[] = [
    {
      id: 'usr_admin',
      username: 'admin',
      password: 'admin123',
      nomAffiche: 'Administrateur Principal',
      role: 'admin',
      actif: true,
      email: 'admin@concentrix.com'
    }
  ];

  // Extract unique N+1 managers
  const uniqueNPlusUn = Array.from(
    new Set(charges.map(c => c.nPlusUn).filter(n => Boolean(n && n.trim().length > 0)))
  );

  uniqueNPlusUn.forEach((nomN1, index) => {
    const slug = nomN1.toLowerCase().replace(/[^a-z0-9]/g, '');
    accounts.push({
      id: `usr_mgr_${slug || index}`,
      username: slug || `mgr_${index + 1}`,
      password: 'manager123',
      nomAffiche: `${nomN1} (N+1)`,
      role: 'n_plus_un',
      nPlusUnNom: nomN1,
      actif: true,
      email: `${slug || 'manager'}@concentrix.com`
    });
  });

  // Extract collaborateurs
  charges.forEach((charge) => {
    const matriculeSlug = (charge.matricule || charge.nomPrenom).toLowerCase().replace(/[^a-z0-9]/g, '');
    accounts.push({
      id: `usr_cdf_${charge.id}`,
      username: matriculeSlug || `collab_${charge.id.slice(0, 4)}`,
      password: 'collab123',
      nomAffiche: charge.nomPrenom,
      role: 'collaborateur',
      chargeDeFluxId: charge.id,
      nPlusUnNom: charge.nPlusUn,
      photoUrl: charge.photoUrl,
      actif: charge.actif,
      email: `${matriculeSlug}@concentrix.com`
    });
  });

  return accounts;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>(() => {
    const existing = loadUserAccounts();
    if (existing && existing.length > 0) {
      return existing;
    }
    const initialCharges = loadChargesDeFlux();
    const defaults = generateInitialAccounts(initialCharges);
    saveUserAccounts(defaults);
    return defaults;
  });

  const [currentSession, setCurrentSession] = useState<SessionState | null>(() => {
    const saved = loadCurrentSession();
    if (saved && saved.user && saved.isExplicit) {
      return saved;
    }
    return null;
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Keep session synced with accounts (e.g. if user data was updated)
  useEffect(() => {
    if (currentSession?.user) {
      const freshUser = allAccounts.find(a => a.id === currentSession.user.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentSession.user)) {
        const updatedSession = { ...currentSession, user: freshUser };
        setCurrentSession(updatedSession);
        saveCurrentSession(updatedSession);
      }
    }
  }, [allAccounts, currentSession]);

  const syncAccountsWithCharges = useCallback((charges: ChargeDeFlux[]) => {
    setAllAccounts(prev => {
      const next = [...prev];
      let hasChanges = false;

      // Ensure N+1 managers exist
      const uniqueNPlusUn = Array.from(
        new Set(charges.map(c => c.nPlusUn).filter(n => Boolean(n && n.trim().length > 0)))
      );

      uniqueNPlusUn.forEach((nomN1, idx) => {
        const existingMgr = next.find(a => a.role === 'n_plus_un' && a.nPlusUnNom === nomN1);
        if (!existingMgr) {
          const slug = nomN1.toLowerCase().replace(/[^a-z0-9]/g, '');
          next.push({
            id: `usr_mgr_${slug || Date.now()}_${idx}`,
            username: slug || `mgr_${Date.now()}`,
            password: 'manager123',
            nomAffiche: `${nomN1} (N+1)`,
            role: 'n_plus_un',
            nPlusUnNom: nomN1,
            actif: true,
            email: `${slug || 'mgr'}@concentrix.com`
          });
          hasChanges = true;
        }
      });

      // Ensure Collaborateurs exist and have updated info
      charges.forEach((charge) => {
        const existingCollabIndex = next.findIndex(a => a.chargeDeFluxId === charge.id);
        const matriculeSlug = (charge.matricule || charge.nomPrenom).toLowerCase().replace(/[^a-z0-9]/g, '');

        if (existingCollabIndex >= 0) {
          const acc = next[existingCollabIndex];
          if (
            acc.nomAffiche !== charge.nomPrenom ||
            acc.nPlusUnNom !== charge.nPlusUn ||
            acc.photoUrl !== charge.photoUrl ||
            acc.actif !== charge.actif ||
            acc.matricule !== charge.matricule
          ) {
            next[existingCollabIndex] = {
              ...acc,
              nomAffiche: charge.nomPrenom,
              nPlusUnNom: charge.nPlusUn,
              photoUrl: charge.photoUrl,
              actif: charge.actif,
              matricule: charge.matricule
            };
            hasChanges = true;
          }
        } else {
          next.push({
            id: `usr_cdf_${charge.id}`,
            username: matriculeSlug || `collab_${charge.id.slice(0, 4)}`,
            password: 'collab123',
            nomAffiche: charge.nomPrenom,
            role: 'collaborateur',
            chargeDeFluxId: charge.id,
            matricule: charge.matricule,
            nPlusUnNom: charge.nPlusUn,
            photoUrl: charge.photoUrl,
            actif: charge.actif,
            email: `${matriculeSlug}@concentrix.com`
          });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        saveUserAccounts(next);
      }
      return hasChanges ? next : prev;
    });
  }, []);

  const login = useCallback((username: string, pass: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const target = allAccounts.find(
      a => (a.username.toLowerCase() === cleanUser || a.email?.toLowerCase() === cleanUser)
    );

    if (!target) {
      return { success: false, error: 'Identifiant ou email introuvable.' };
    }

    if (!target.actif) {
      return { success: false, error: 'Ce compte utilisateur est désactivé.' };
    }

    if (target.password !== pass) {
      return { success: false, error: 'Mot de passe incorrect.' };
    }

    // Success: register session
    const updatedUser = {
      ...target,
      derniereConnexion: new Date().toISOString()
    };

    const newSession: SessionState = {
      user: updatedUser,
      loginTime: new Date().toISOString(),
      isExplicit: true
    };

    setCurrentSession(newSession);
    saveCurrentSession(newSession);

    // Update account with last connection timestamp
    setAllAccounts(prev => {
      const updated = prev.map(a => a.id === updatedUser.id ? updatedUser : a);
      saveUserAccounts(updated);
      return updated;
    });

    setShowLoginModal(false);
    return { success: true };
  }, [allAccounts]);

  const logout = useCallback(() => {
    setCurrentSession(null);
    saveCurrentSession(null);
    setShowLoginModal(false);
  }, []);

  const switchUser = useCallback((_userId?: string) => {
    logout();
  }, [logout]);

  const updateUserPassword = useCallback((userId: string, newPass: string) => {
    setAllAccounts(prev => {
      const updated = prev.map(a => a.id === userId ? { ...a, password: newPass } : a);
      saveUserAccounts(updated);
      return updated;
    });
    // Update active session if target is current user
    setCurrentSession(curr => {
      if (curr?.user && curr.user.id === userId) {
        const updated = { ...curr, user: { ...curr.user, password: newPass } };
        saveCurrentSession(updated);
        return updated;
      }
      return curr;
    });
  }, []);

  const updateAccount = useCallback((account: UserAccount) => {
    setAllAccounts(prev => {
      const updated = prev.map(a => a.id === account.id ? account : a);
      saveUserAccounts(updated);
      return updated;
    });
  }, []);

  const createAccount = useCallback((accData: Omit<UserAccount, 'id'>) => {
    const newAcc: UserAccount = {
      ...accData,
      id: `usr_custom_${Date.now()}`
    };
    setAllAccounts(prev => {
      const updated = [newAcc, ...prev];
      saveUserAccounts(updated);
      return updated;
    });
  }, []);

  const deleteAccount = useCallback((userId: string) => {
    setAllAccounts(prev => {
      const updated = prev.filter(a => a.id !== userId);
      saveUserAccounts(updated);
      return updated;
    });
  }, []);

  const currentUser = currentSession?.user || null;
  const currentRole: UserRole = currentUser?.role || 'admin';
  const isLoggedIn = Boolean(currentUser);

  const contextValue = useMemo(() => ({
    currentUser,
    currentRole,
    isLoggedIn,
    allAccounts,
    showLoginModal,
    setShowLoginModal,
    login,
    logout,
    switchUser,
    updateUserPassword,
    updateAccount,
    createAccount,
    deleteAccount,
    syncAccountsWithCharges
  }), [
    currentUser,
    currentRole,
    isLoggedIn,
    allAccounts,
    showLoginModal,
    login,
    logout,
    switchUser,
    updateUserPassword,
    updateAccount,
    createAccount,
    deleteAccount,
    syncAccountsWithCharges
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
