import React, { useState, useEffect } from 'react';
import {
  Users,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Info,
  ShieldCheck,
  Briefcase,
  Layers,
  Percent,
  Search,
  KeyRound
} from 'lucide-react';
import { BlocRubrique, ChargeDeFlux, Rubrique } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { useTheme } from '../context/ThemeContext';
import { ThemeSelectorAdmin } from './ThemeSelectorAdmin';
import { Avatar } from './Avatar';
import { PhotoUploader } from './PhotoUploader';
import { AccountsAdminSection } from './AccountsAdminSection';
import { MonCompteSecuriteSection } from './MonCompteSecuriteSection';
import { useAuth } from '../context/AuthContext';

interface ParametresSectionProps {
  chargesDeFlux: ChargeDeFlux[];
  blocs: BlocRubrique[];
  niveaux: string[];
  onUpdateChargesDeFlux: (items: ChargeDeFlux[]) => void;
  onUpdateBlocs: (blocs: BlocRubrique[]) => void;
  onUpdateNiveaux: (niveaux: string[]) => void;
  onResetDefaults: () => void;
  onClearAllData: () => void;
  appName?: string;
  onUpdateAppName?: (name: string) => void;
}

export const ParametresSection: React.FC<ParametresSectionProps> = ({
  chargesDeFlux,
  blocs,
  niveaux,
  onUpdateChargesDeFlux,
  onUpdateBlocs,
  onUpdateNiveaux,
  onClearAllData,
  appName = 'CONCENTRIX',
  onUpdateAppName
}) => {
  const { theme } = useTheme();
  const { currentRole } = useAuth();

  // Pour les collaborateurs et responsables N+1 : interface stricte de gestion de leur propre mot de passe
  if (currentRole !== 'admin') {
    return <MonCompteSecuriteSection />;
  }

  const [sousOnglet, setSousOnglet] = useState<'charges' | 'rubriques' | 'niveaux' | 'comptes' | 'admin'>('charges');

  // Custom tool name
  const [customAppName, setCustomAppName] = useState(appName || 'CONCENTRIX');
  const [appNameSavedToast, setAppNameSavedToast] = useState(false);

  useEffect(() => {
    if (appName) {
      setCustomAppName(appName);
    }
  }, [appName]);

  const handleSaveAppName = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateAppName && customAppName.trim()) {
      onUpdateAppName(customAppName.trim());
      setAppNameSavedToast(true);
      setTimeout(() => setAppNameSavedToast(false), 3000);
    }
  };

  // Search filter
  const [searchCharge, setSearchCharge] = useState('');

  // Collaborator Modal Bubble ("Bulle d'édition") State
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null);
  const [formMatricule, setFormMatricule] = useState('');
  const [formNomPrenom, setFormNomPrenom] = useState('');
  const [formNiveau, setFormNiveau] = useState<string>(niveaux[0] || 'Confirmé');
  const [formNPlusUn, setFormNPlusUn] = useState('');
  const [formActif, setFormActif] = useState(true);
  const [formPhotoUrl, setFormPhotoUrl] = useState<string | undefined>(undefined);
  const [chargeFormError, setChargeFormError] = useState('');

  // Rubric adding/editing State
  const [modalRubriqueBlocId, setModalRubriqueBlocId] = useState<string | null>(null);
  const [editingRubriqueId, setEditingRubriqueId] = useState<string | null>(null);
  const [rubriqueTitre, setRubriqueTitre] = useState('');
  const [rubriqueDescription, setRubriqueDescription] = useState('');

  // Bloc Group Modal State (Add or Edit Group & Taux)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlocId, setEditingBlocId] = useState<string | null>(null);
  const [blockNom, setBlockNom] = useState('');
  const [blockTitreAffiche, setBlockTitreAffiche] = useState('');
  const [blockPoids, setBlockPoids] = useState<number>(20);
  const [blockDescription, setBlockDescription] = useState('');
  const [blockBadgeColor, setBlockBadgeColor] = useState('bg-blue-100 text-blue-800 border-blue-300');

  // Job Levels (Niveaux de postes) State
  const [newNiveauNom, setNewNiveauNom] = useState('');
  const [editingNiveauIndex, setEditingNiveauIndex] = useState<number | null>(null);
  const [editingNiveauNom, setEditingNiveauNom] = useState('');

  // Notification message
  const [succesMessage, setSuccesMessage] = useState<string | null>(null);

  // In-App Confirm Modal States
  const [deleteChargeTarget, setDeleteChargeTarget] = useState<ChargeDeFlux | null>(null);
  const [deleteRubriqueTarget, setDeleteRubriqueTarget] = useState<{
    blocId: string;
    rubriqueId: string;
    titre: string;
  } | null>(null);
  const [deleteBlocTarget, setDeleteBlocTarget] = useState<BlocRubrique | null>(null);
  const [deleteNiveauTarget, setDeleteNiveauTarget] = useState<string | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const showNotification = (msg: string) => {
    setSuccesMessage(msg);
    setTimeout(() => setSuccesMessage(null), 3500);
  };

  // --- Handlers for Managers (Bulle d'édition) ---
  const handleOpenAddCharge = () => {
    setEditingChargeId(null);
    setFormMatricule(`MGR-${new Date().getFullYear()}-${String(chargesDeFlux.length + 1).padStart(3, '0')}`);
    setFormNomPrenom('');
    setFormNiveau(niveaux[0] || 'Confirmé');
    setFormNPlusUn('');
    setFormActif(true);
    setFormPhotoUrl(undefined);
    setChargeFormError('');
    setIsCollaboratorModalOpen(true);
  };

  const handleOpenEditCharge = (cf: ChargeDeFlux) => {
    setEditingChargeId(cf.id);
    setFormMatricule(cf.matricule);
    setFormNomPrenom(cf.nomPrenom);
    setFormNiveau(cf.niveau);
    setFormNPlusUn(cf.nPlusUn);
    setFormActif(cf.actif !== false);
    setFormPhotoUrl(cf.photoUrl);
    setChargeFormError('');
    setIsCollaboratorModalOpen(true);
  };

  const handleSaveCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMatricule.trim()) {
      setChargeFormError('Le matricule est obligatoire.');
      return;
    }
    if (!formNomPrenom.trim()) {
      setChargeFormError('Le nom et prénom sont obligatoires.');
      return;
    }
    if (!formNPlusUn.trim()) {
      setChargeFormError('Le nom du responsable N+1 est obligatoire.');
      return;
    }

    if (editingChargeId) {
      const updated = chargesDeFlux.map(c => {
        if (c.id === editingChargeId) {
          return {
            ...c,
            matricule: formMatricule.trim(),
            nomPrenom: formNomPrenom.trim(),
            niveau: formNiveau,
            nPlusUn: formNPlusUn.trim(),
            actif: formActif,
            photoUrl: formPhotoUrl
          };
        }
        return c;
      });
      onUpdateChargesDeFlux(updated);
      showNotification(`Le collaborateur ${formNomPrenom} a été mis à jour.`);
    } else {
      const newCharge: ChargeDeFlux = {
        id: `cf-${Date.now()}`,
        matricule: formMatricule.trim(),
        nomPrenom: formNomPrenom.trim(),
        niveau: formNiveau,
        nPlusUn: formNPlusUn.trim(),
        actif: formActif,
        photoUrl: formPhotoUrl,
        dateCreation: new Date().toISOString().split('T')[0]
      };
      onUpdateChargesDeFlux([...chargesDeFlux, newCharge]);
      showNotification(`Le collaborateur ${newCharge.nomPrenom} a été ajouté avec succès.`);
    }

    setIsCollaboratorModalOpen(false);
    setEditingChargeId(null);
  };

  const handleConfirmDeleteCharge = () => {
    if (!deleteChargeTarget) return;
    onUpdateChargesDeFlux(chargesDeFlux.filter(c => c.id !== deleteChargeTarget.id));
    showNotification(`Manager "${deleteChargeTarget.nomPrenom}" supprimé.`);
    setDeleteChargeTarget(null);
  };

  // --- Handlers for Groups (BlocRubrique) & Taux ---
  const handleOpenAddBlock = () => {
    setEditingBlocId(null);
    setBlockNom('');
    setBlockTitreAffiche(`Bloc ${blocs.length + 1}`);
    setBlockPoids(10);
    setBlockDescription('');
    setBlockBadgeColor('bg-blue-100 text-blue-800 border-blue-300');
    setIsBlockModalOpen(true);
  };

  const handleOpenEditBlock = (bloc: BlocRubrique) => {
    setEditingBlocId(bloc.id);
    setBlockNom(bloc.nom);
    setBlockTitreAffiche(bloc.titreAffiche);
    setBlockPoids(bloc.poidsPourcentage);
    setBlockDescription(bloc.description);
    setBlockBadgeColor(bloc.couleurBadge);
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockNom.trim()) return;

    if (editingBlocId) {
      const updated = blocs.map(b => {
        if (b.id === editingBlocId) {
          return {
            ...b,
            nom: blockNom.trim(),
            titreAffiche: blockTitreAffiche.trim() || blockNom.trim(),
            poidsPourcentage: Number(blockPoids),
            description: blockDescription.trim()
          };
        }
        return b;
      });
      onUpdateBlocs(updated);
      showNotification(`Groupe "${blockNom}" mis à jour.`);
    } else {
      const newBloc: BlocRubrique = {
        id: `bloc-${Date.now()}`,
        nom: blockNom.trim(),
        titreAffiche: blockTitreAffiche.trim() || `Bloc ${blocs.length + 1} — ${blockNom.trim()}`,
        poidsPourcentage: Number(blockPoids),
        description: blockDescription.trim(),
        couleurBadge: blockBadgeColor,
        rubriques: [
          {
            id: `rub-${Date.now()}-1`,
            blocId: `bloc-${Date.now()}`,
            titre: `Critère 1 - ${blockNom.trim()}`,
            description: 'Critère principal d’évaluation de la performance.',
            actif: true
          }
        ]
      };
      onUpdateBlocs([...blocs, newBloc]);
      showNotification(`Nouveau groupe "${blockNom}" créé avec succès.`);
    }

    setIsBlockModalOpen(false);
    setEditingBlocId(null);
  };

  const handleQuickUpdatePoids = (blocId: string, newPoids: number) => {
    if (newPoids < 0) return;
    const updated = blocs.map(b => (b.id === blocId ? { ...b, poidsPourcentage: newPoids } : b));
    onUpdateBlocs(updated);
  };

  const handleConfirmDeleteBloc = () => {
    if (!deleteBlocTarget) return;
    const updated = blocs.filter(b => b.id !== deleteBlocTarget.id);
    onUpdateBlocs(updated);
    showNotification(`Groupe de compétences "${deleteBlocTarget.nom}" supprimé.`);
    setDeleteBlocTarget(null);
  };

  // --- Handlers for Rubriques ---
  const handleOpenAddRubrique = (blocId: string) => {
    setModalRubriqueBlocId(blocId);
    setEditingRubriqueId(null);
    setRubriqueTitre('');
    setRubriqueDescription('');
  };

  const handleOpenEditRubrique = (blocId: string, rub: Rubrique) => {
    setModalRubriqueBlocId(blocId);
    setEditingRubriqueId(rub.id);
    setRubriqueTitre(rub.titre);
    setRubriqueDescription(rub.description);
  };

  const handleSaveRubrique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRubriqueBlocId || !rubriqueTitre.trim()) return;

    const updatedBlocs = blocs.map(b => {
      if (b.id !== modalRubriqueBlocId) return b;

      if (editingRubriqueId) {
        return {
          ...b,
          rubriques: b.rubriques.map(r => {
            if (r.id === editingRubriqueId) {
              return {
                ...r,
                titre: rubriqueTitre.trim(),
                description: rubriqueDescription.trim()
              };
            }
            return r;
          })
        };
      } else {
        const newRub: Rubrique = {
          id: `rub-${Date.now()}`,
          blocId: modalRubriqueBlocId,
          titre: rubriqueTitre.trim(),
          description: rubriqueDescription.trim(),
          actif: true
        };
        return {
          ...b,
          rubriques: [...b.rubriques, newRub]
        };
      }
    });

    onUpdateBlocs(updatedBlocs);
    showNotification(editingRubriqueId ? 'Rubrique modifiée.' : 'Nouvelle rubrique ajoutée.');
    setModalRubriqueBlocId(null);
    setEditingRubriqueId(null);
  };

  const handleConfirmDeleteRubrique = () => {
    if (!deleteRubriqueTarget) return;
    const { blocId, rubriqueId, titre } = deleteRubriqueTarget;
    const updatedBlocs = blocs.map(b => {
      if (b.id !== blocId) return b;
      return {
        ...b,
        rubriques: b.rubriques.filter(r => r.id !== rubriqueId)
      };
    });
    onUpdateBlocs(updatedBlocs);
    showNotification(`Rubrique "${titre}" supprimée.`);
    setDeleteRubriqueTarget(null);
  };

  // --- Handlers for Niveaux de Postes ---
  const handleAddNiveau = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNiveauNom.trim();
    if (!trimmed) return;
    if (niveaux.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(`Le niveau "${trimmed}" existe déjà.`);
      return;
    }
    const updated = [...niveaux, trimmed];
    onUpdateNiveaux(updated);
    setNewNiveauNom('');
    showNotification(`Niveau de poste "${trimmed}" ajouté.`);
  };

  const handleSaveEditNiveau = (index: number) => {
    const trimmed = editingNiveauNom.trim();
    if (!trimmed) return;
    const oldName = niveaux[index];
    const updated = [...niveaux];
    updated[index] = trimmed;
    onUpdateNiveaux(updated);

    const updatedCharges = chargesDeFlux.map(c => (c.niveau === oldName ? { ...c, niveau: trimmed } : c));
    onUpdateChargesDeFlux(updatedCharges);

    setEditingNiveauIndex(null);
    setEditingNiveauNom('');
    showNotification(`Niveau renommé en "${trimmed}".`);
  };

  const handleConfirmDeleteNiveau = () => {
    if (!deleteNiveauTarget) return;
    const updated = niveaux.filter(n => n !== deleteNiveauTarget);
    onUpdateNiveaux(updated);
    showNotification(`Niveau "${deleteNiveauTarget}" supprimé.`);
    setDeleteNiveauTarget(null);
  };

  // Weight check
  const totalPoids = blocs.reduce((acc, b) => acc + (b.poidsPourcentage || 0), 0);

  const chargesFiltres = chargesDeFlux.filter(c =>
    c.nomPrenom.toLowerCase().includes(searchCharge.toLowerCase()) ||
    c.matricule.toLowerCase().includes(searchCharge.toLowerCase()) ||
    c.nPlusUn.toLowerCase().includes(searchCharge.toLowerCase()) ||
    c.niveau.toLowerCase().includes(searchCharge.toLowerCase())
  );

  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Title bar with dynamic theme accent & adaptive contrast glass container */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2">
            <Sliders style={{ color: theme.primaire }} className="w-3.5 h-3.5" />
            <span>Administration & Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Paramètres de l'application & Configuration</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
            Gérez vos Managers, personnalisez les groupes de compétences et leurs taux de calcul, ajustez les niveaux de postes, sélectionnez vos thèmes et administrez la base locale.
          </p>
        </div>

        {sousOnglet === 'charges' && (
          <button
            type="button"
            onClick={handleOpenAddCharge}
            style={{ backgroundColor: theme.primaire }}
            className="px-5 py-3 text-xs font-bold text-white rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto hover:opacity-95 shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Manager</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {succesMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 backdrop-blur-md border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{succesMessage}</span>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setSousOnglet('charges')}
          style={sousOnglet === 'charges' ? { backgroundColor: theme.primaire } : undefined}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            sousOnglet === 'charges'
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Managers ({chargesDeFlux.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSousOnglet('rubriques')}
          style={sousOnglet === 'rubriques' ? { backgroundColor: theme.primaire } : undefined}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            sousOnglet === 'rubriques'
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Groupes & Taux de calcul ({blocs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSousOnglet('niveaux')}
          style={sousOnglet === 'niveaux' ? { backgroundColor: theme.primaire } : undefined}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            sousOnglet === 'niveaux'
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Niveaux de postes ({niveaux.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSousOnglet('comptes')}
          style={sousOnglet === 'comptes' ? { backgroundColor: theme.primaire } : undefined}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            sousOnglet === 'comptes'
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Comptes & Mots de passe</span>
        </button>

        <button
          type="button"
          onClick={() => setSousOnglet('admin')}
          style={sousOnglet === 'admin' ? { backgroundColor: theme.primaire } : undefined}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            sousOnglet === 'admin'
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Administration & Thèmes</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. SECTION MANAGERS */}
      {/* ======================================================== */}
      {sousOnglet === 'charges' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Liste des Managers en équipe ({chargesFiltres.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Cliquez sur Éditer pour modifier les données d'un manager dans sa bulle d'édition.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, matricule, niveau..."
                    value={searchCharge}
                    onChange={e => setSearchCharge(e.target.value)}
                    className="w-full sm:w-64 pl-8 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#003D5B]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCharge}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#003D5B] hover:bg-[#002d44] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    style={{ backgroundColor: theme.primaire }}
                    className="text-white text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
                  >
                    <th className="py-3.5 px-5">Manager & Photo</th>
                    <th className="py-3.5 px-5">Matricule</th>
                    <th className="py-3.5 px-5">Niveau de poste</th>
                    <th className="py-3.5 px-5">Responsable N+1</th>
                    <th className="py-3.5 px-5">Statut</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {chargesFiltres.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Aucun manager trouvé.
                      </td>
                    </tr>
                  ) : (
                    chargesFiltres.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar photoUrl={c.photoUrl} nomPrenom={c.nomPrenom} size="sm" />
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{c.nomPrenom}</span>
                              <span className="text-[10px] text-slate-400">Ajouté le {c.dateCreation}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{c.matricule}</td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {c.niveau}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">{c.nPlusUn}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.actif !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                            {c.actif !== false ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCharge(c)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#003D5B] bg-blue-50 hover:bg-[#003D5B] hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                              title="Éditer dans la bulle professionnelle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Éditer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteChargeTarget(c)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer ce collaborateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SECTION GROUPES DE RUBRIQUES & GESTION DES TAUX */}
      {/* ======================================================== */}
      {sousOnglet === 'rubriques' && (
        <div className="space-y-6">
          {/* Summary Weights Card */}
          <div className="p-6 bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-base">
                  Gestion des Groupes de compétences & Taux par groupe
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    totalPoids === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                  }`}
                >
                  Total des Taux : {totalPoids}% {totalPoids === 100 ? '✓ (Équilibré)' : '⚠️ (Ajuster pour atteindre 100%)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ajoutez ou supprimez des groupes de rubriques et modifiez directement le taux / pourcentage appliqué à chaque groupe pour le calcul final de la note.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddBlock}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#003D5B] hover:bg-[#002d44] rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un nouveau groupe</span>
            </button>
          </div>

          {/* Blocks List */}
          <div className="grid grid-cols-1 gap-6">
            {blocs.map(bloc => (
              <div
                key={bloc.id}
                className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* Header with #003D5B */}
                <div className="p-4 sm:p-5 bg-[#003D5B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-black rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-md">
                      {bloc.poidsPourcentage}% des points
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white">{bloc.titreAffiche}</h4>
                      <p className="text-xs text-sky-100/80">{bloc.description}</p>
                    </div>
                  </div>

                  {/* Actions for this group */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Inline Rate/Poids Adjuster */}
                    <div className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-xl border border-white/20 text-xs">
                      <Percent className="w-3.5 h-3.5 text-sky-200" />
                      <span className="text-[11px] text-sky-200">Taux :</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={bloc.poidsPourcentage}
                        onChange={e => handleQuickUpdatePoids(bloc.id, Number(e.target.value))}
                        className="w-14 px-1.5 py-0.5 text-xs font-bold bg-white text-[#003D5B] rounded text-center outline-none"
                        title="Modifier le taux de calcul"
                      />
                      <span className="text-white font-bold">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditBlock(bloc)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
                      title="Modifier les détails du groupe"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteBlocTarget(bloc)}
                      className="p-1.5 text-white/70 hover:text-rose-200 hover:bg-rose-500/25 rounded-xl transition-colors cursor-pointer"
                      title="Supprimer ce groupe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAddRubrique(bloc.id)}
                      className="px-3 py-1.5 text-xs font-bold text-[#003D5B] bg-white hover:bg-sky-50 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un critère</span>
                    </button>
                  </div>
                </div>

                {/* Rubric items list */}
                <div className="divide-y divide-slate-100">
                  {bloc.rubriques.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      Aucun critère dans ce groupe. Cliquez sur "Ajouter un critère" pour en créer.
                    </div>
                  ) : (
                    bloc.rubriques.map(rub => (
                      <div key={rub.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                        <div className="space-y-0.5 flex-1">
                          <span className="text-sm font-bold text-slate-900 block">{rub.titre}</span>
                          <p className="text-xs text-slate-500 leading-relaxed">{rub.description}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRubrique(bloc.id, rub)}
                            className="p-1.5 text-slate-400 hover:text-[#003D5B] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier ce critère"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteRubriqueTarget({
                                blocId: bloc.id,
                                rubriqueId: rub.id,
                                titre: rub.titre
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer ce critère"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SECTION NIVEAUX DE POSTES PERSONNALISABLES */}
      {/* ======================================================== */}
      {sousOnglet === 'niveaux' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#003D5B]" />
                  <span>Niveaux de postes personnalisables</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ajoutez, renommez ou supprimez les qualifications applicables à vos managers.
                </p>
              </div>
            </div>

            {/* Add Niveau Form */}
            <form onSubmit={handleAddNiveau} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                required
                placeholder="Intitulé du niveau (ex: Manager Senior, Alternant, Lead, Superviseur)..."
                value={newNiveauNom}
                onChange={e => setNewNiveauNom(e.target.value)}
                className="flex-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-[#003D5B] hover:bg-[#002d44] rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter ce niveau</span>
              </button>
            </form>

            {/* Levels Single Column List */}
            <div className="mt-6 flex flex-col gap-3">
              {niveaux.map((niv, index) => {
                const isEditing = editingNiveauIndex === index;
                const countAssigned = chargesDeFlux.filter(c => c.niveau === niv).length;

                return (
                  <div
                    key={niv}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-blue-300 transition-all flex items-center justify-between gap-3 celestial-row"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingNiveauNom}
                          onChange={e => setEditingNiveauNom(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-blue-400 rounded-lg outline-none font-bold text-slate-900"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditNiveau(index)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                          title="Sauvegarder"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNiveauIndex(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md cursor-pointer"
                          title="Annuler"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-900 block">{niv}</span>
                          <span className="text-[11px] text-slate-400">
                            {countAssigned} manager(s) assigné(s)
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNiveauIndex(index);
                              setEditingNiveauNom(niv);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#003D5B] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Renommer ce niveau"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteNiveauTarget(niv)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer ce niveau"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SECTION ADMINISTRATION & THÈMES */}
      {/* ======================================================== */}
      {sousOnglet === 'admin' && (
        <div className="space-y-8">
          {/* PERSONNALISATION DU NOM DE L'OUTIL (ENTÊTE) */}
          <div className="overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div
              style={{ backgroundColor: theme.primaire }}
              className="p-5 text-white flex items-center justify-between gap-4 transition-colors duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nom de l'outil dans l'entête</h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Modifiez le nom officiel qui s'affiche dans la barre de navigation supérieure.
                  </p>
                </div>
              </div>

              {appNameSavedToast && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/30 border border-emerald-300/40 text-white rounded-xl text-xs font-bold animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Enregistré avec succès !</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <form onSubmit={handleSaveAppName} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Titre affiché dans l'entête
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={customAppName}
                      onChange={e => setCustomAppName(e.target.value)}
                      placeholder="ex: CONCENTRIX"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                      required
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.primaire }}
                      className="px-6 py-2.5 text-xs font-bold text-white rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer celestial-interactive shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>Appliquer</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    La modification est immédiatement répercutée dans l'entête et synchronisée dans la base.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* SÉLECTEUR DE THÈMES (5 THÈMES EN COLONNE UNIQUE) */}
          <ThemeSelectorAdmin />

          {/* GESTION DES DONNÉES LOCALES */}
          <div className="overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div
              style={{ backgroundColor: theme.primaire }}
              className="p-5 text-white flex items-center gap-3 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Administration des données de l'application</h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Gestion de l'espace de stockage et réinitialisation de la base locale.
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Réinitialiser la base de données locale
                  </span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                    Efface l'ensemble des fiches d'évaluation et la liste des managers stockés dans votre navigateur pour démarrer avec une base vierge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="px-5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Réinitialiser la base</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SECTION COMPTES & MOTS DE PASSE (ADMINISTRATION) */}
      {/* ======================================================== */}
      {sousOnglet === 'comptes' && (
        <AccountsAdminSection chargesDeFlux={chargesDeFlux} />
      )}

      {/* ======================================================== */}
      {/* BULLE D'ÉDITION MODALE PROFESSIONNELLE DU COLLABORATEUR */}
      {/* ======================================================== */}
      {isCollaboratorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            {/* Header with dynamic theme */}
            <div
              style={{ backgroundColor: theme.primaire }}
              className="p-5 text-white flex items-center justify-between transition-colors duration-300"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingChargeId ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {editingChargeId ? `Fiche Manager • ${formMatricule}` : 'Créer une fiche manager'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCollaboratorModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCharge} className="p-6 space-y-4">
              {chargeFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{chargeFormError}</span>
                </div>
              )}

              {/* Photo Upload & Selection */}
              <PhotoUploader
                photoUrl={formPhotoUrl}
                nomPrenom={formNomPrenom}
                onChangePhoto={setFormPhotoUrl}
                accentColor={theme.primaire}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Matricule *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: MGR-2026-001"
                    value={formMatricule}
                    onChange={e => setFormMatricule(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Niveau de poste *
                  </label>
                  <select
                    value={formNiveau}
                    onChange={e => setFormNiveau(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none cursor-pointer"
                  >
                    {niveaux.map(niv => (
                      <option key={niv} value={niv}>
                        {niv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean Dupont"
                  value={formNomPrenom}
                  onChange={e => setFormNomPrenom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Responsable N+1 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Marc Delattre (Directeur des Opérations)"
                  value={formNPlusUn}
                  onChange={e => setFormNPlusUn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="checkbox-manager-actif"
                  checked={formActif}
                  onChange={e => setFormActif(e.target.checked)}
                  className="w-4 h-4 text-[#003D5B] rounded border-slate-300 focus:ring-[#003D5B] cursor-pointer"
                />
                <label htmlFor="checkbox-manager-actif" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Manager en activité (Actif pour les évaluations)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCollaboratorModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primaire }}
                  className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingChargeId ? 'Mettre à jour le collaborateur' : 'Enregistrer le collaborateur'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALE DE CRÉATION / ÉDITION DE GROUPE & TAUX */}
      {/* ======================================================== */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: theme.primaire }}
              className="p-5 text-white flex items-center justify-between transition-colors duration-300"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingBlocId ? 'Modifier le groupe de compétences' : 'Nouveau groupe de compétences'}
                  </h3>
                  <p className="text-xs text-white/80">
                    Définissez l'intitulé et le taux de pondération pour le calcul
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Nom du groupe *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Sécurité & Qualité"
                    value={blockNom}
                    onChange={e => setBlockNom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Taux (% du total) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={blockPoids}
                      onChange={e => setBlockPoids(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#003D5B] focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Titre complet affiché
                </label>
                <input
                  type="text"
                  placeholder="ex: Bloc 4 — Sécurité & Qualité"
                  value={blockTitreAffiche}
                  onChange={e => setBlockTitreAffiche(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Description des objectifs du groupe
                </label>
                <textarea
                  rows={2}
                  placeholder="Périmètre et attentes associées à ce groupe de compétences..."
                  value={blockDescription}
                  onChange={e => setBlockDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primaire }}
                  className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer le groupe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALE D'AJOUT / ÉDITION DE CRITÈRE (RUBRIQUE) */}
      {/* ======================================================== */}
      {modalRubriqueBlocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: theme.primaire }}
              className="p-5 text-white flex items-center justify-between transition-colors duration-300"
            >
              <h3 className="text-base font-bold text-white">
                {editingRubriqueId ? 'Modifier le critère d’évaluation' : 'Ajouter un critère d’évaluation'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalRubriqueBlocId(null);
                  setEditingRubriqueId(null);
                }}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRubrique} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Intitulé du critère *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Gestion proactive des ruptures de cadences"
                  value={rubriqueTitre}
                  onChange={e => setRubriqueTitre(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Description des critères attendus
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez précisément ce que le manager doit réaliser pour atteindre 100%..."
                  value={rubriqueDescription}
                  onChange={e => setRubriqueDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003D5B] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setModalRubriqueBlocId(null);
                    setEditingRubriqueId(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primaire }}
                  className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer hover:opacity-95"
                >
                  Enregistrer le critère
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALES DE CONFIRMATION DE SUPPRESSION SÉCURISÉES */}
      {/* ======================================================== */}
      {/* 1. Delete Manager Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteChargeTarget)}
        title="Supprimer le Manager"
        message={`Êtes-vous certain de vouloir supprimer le profil "${deleteChargeTarget?.nomPrenom}" (${deleteChargeTarget?.matricule}) ?`}
        details="Le manager ne figurera plus dans la liste des collaborateurs sélectionnables pour les évaluations."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDanger={true}
        onConfirm={handleConfirmDeleteCharge}
        onCancel={() => setDeleteChargeTarget(null)}
      />

      {/* 2. Delete Bloc Group Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteBlocTarget)}
        title="Supprimer le groupe de compétences"
        message={`Confirmez-vous la suppression du groupe "${deleteBlocTarget?.nom}" (${deleteBlocTarget?.poidsPourcentage}% des points) ?`}
        details="Toutes les rubriques et critères contenus dans ce groupe seront également supprimés. Pensez à rééquilibrer les taux des autres groupes pour atteindre 100%."
        confirmText="Supprimer le groupe"
        cancelText="Annuler"
        isDanger={true}
        onConfirm={handleConfirmDeleteBloc}
        onCancel={() => setDeleteBlocTarget(null)}
      />

      {/* 3. Delete Rubrique Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteRubriqueTarget)}
        title="Supprimer le critère"
        message={`Confirmez-vous la suppression du critère "${deleteRubriqueTarget?.titre}" ?`}
        details="Ce critère ne figurera plus dans les futures grilles d'évaluation."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDanger={true}
        onConfirm={handleConfirmDeleteRubrique}
        onCancel={() => setDeleteRubriqueTarget(null)}
      />

      {/* 4. Delete Niveau Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteNiveauTarget)}
        title="Supprimer le niveau de poste"
        message={`Confirmez-vous la suppression du niveau "${deleteNiveauTarget}" ?`}
        details="Les collaborateurs conservent leur fiche mais ce niveau ne figurera plus dans les options."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDanger={true}
        onConfirm={handleConfirmDeleteNiveau}
        onCancel={() => setDeleteNiveauTarget(null)}
      />

      {/* 5. Clear All Data Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Réinitialiser la base locale"
        message="Êtes-vous certain de vouloir réinitialiser l'ensemble des données de l'application ?"
        details="L'ensemble des collaborateurs et des fiches d'évaluation enregistrées seront effacés de la mémoire locale de votre navigateur."
        confirmText="Confirmer la réinitialisation"
        cancelText="Annuler"
        isDanger={true}
        onConfirm={() => {
          onClearAllData();
          setIsClearAllModalOpen(false);
          showNotification('Les données locales ont été réinitialisées.');
        }}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </div>
  );
};
