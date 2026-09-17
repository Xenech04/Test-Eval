export type NoteValeur = 0 | 50 | 100 | 120 | 'NA';

export type NiveauChargeDeFlux = string;

export interface ChargeDeFlux {
  id: string;
  matricule: string;
  nomPrenom: string;
  niveau: NiveauChargeDeFlux;
  nPlusUn: string;
  actif: boolean;
  dateCreation: string;
  photoUrl?: string;
}

export interface Rubrique {
  id: string;
  blocId: string;
  titre: string;
  description: string;
  actif: boolean;
}

export interface BlocRubrique {
  id: string;
  nom: string;
  titreAffiche: string;
  poidsPourcentage: number; // e.g. 20, 20, 60
  description: string;
  couleurBadge: string;
  rubriques: Rubrique[];
}

export type StatutEvaluation = 'pas_commence' | 'en_cours' | 'termine';

export interface EvaluationRubriqueDetail {
  note: NoteValeur | null;
  commentaire: string;
}

export type StatutSuiviAction = 'OK' | 'KO' | 'En cours';

export interface ActionSuivi {
  id: string;
  titre: string;
  statut: StatutSuiviAction;
  datePrevue?: string;
  commentaire?: string;
  provenanceEvaluation?: string;
}

export interface Evaluation {
  id: string;
  chargeDeFluxId: string;
  mois: number; // 1 - 12
  annee: number; // e.g. 2025, 2026
  dateEntretien: string; // YYYY-MM-DD
  statut: StatutEvaluation;
  nPlusUn: string;
  notes: Record<string, EvaluationRubriqueDetail>; // rubricId -> detail
  actionsSuivi?: ActionSuivi[]; // Rubrique Suivi (non noté, avec OK / KO / En cours)
  commentaireGlobal: string;
  scoreBehavior: number; // 0 - 20
  scoreManagement: number; // 0 - 20
  scoreDelivery: number; // 0 - 60
  scoreTotal: number; // 0 - 100 (or up to 120 with bonuses)
  dateValidation?: string;
  validePar?: string;
  derniereModification: string;
  // Collaborator Attestation & Freezing
  isAttested?: boolean;
  dateAttestation?: string;
  signatureCollaborateur?: string;
  commentaireCollaborateur?: string;
}

export type UserRole = 'admin' | 'n_plus_un' | 'collaborateur';

export interface UserAccount {
  id: string;
  username: string; // Identifier for login (e.g. 'admin', 'jdupont', 'CDF001')
  password: string; // Password visible & manageable solely by Admin
  nomAffiche: string;
  role: UserRole;
  chargeDeFluxId?: string; // Associated chargeDeFluxId if role === 'collaborateur'
  matricule?: string; // Matricule identifier if available
  nPlusUnNom?: string; // Associated N+1 manager name if role === 'n_plus_un'
  actif: boolean;
  photoUrl?: string;
  email?: string;
  derniereConnexion?: string;
}

export interface SessionState {
  user: UserAccount;
  loginTime: string;
  isExplicit?: boolean;
}

export type OngletPrincipal = 'evaluation' | 'mes_docs' | 'parametres';

export interface ThemeBackgroundConfig {
  imageUrl: string;
  blur: number; // 0 to 30px
  overlayOpacity: number; // 0 to 100%
}

export interface AppTheme {
  id: string;
  nom: string;
  description: string;
  isCustom?: boolean;
  primaire: string; // Hex e.g. '#003D5B'
  bordure: string; // Hex e.g. '#002b40'
  sombre: string; // Hex e.g. '#002538'
  accent: string; // Hex e.g. '#0077B6'
  accentClair: string; // Hex e.g. '#E0F2FE'
  degrade: string; // Tailwind e.g. 'from-[#003D5B] to-[#005f73]'
  texteEnTete: string; // Tailwind e.g. 'text-white'
  sousTexteEnTete: string; // Tailwind e.g. 'text-sky-100/80'
  badgeBg: string; // Tailwind e.g. 'bg-sky-50'
  badgeBordure: string; // Tailwind e.g. 'border-sky-200'
  badgeTexte: string; // Tailwind e.g. 'text-[#003D5B]'
  boutonHover: string; // Hex e.g. '#002d44'
  anneauFocus: string; // Hex e.g. '#003D5B'
  orbBg1: string; // CSS color string e.g. 'rgba(0, 61, 91, 0.14)'
  orbBg2: string; // CSS color string e.g. 'rgba(0, 119, 182, 0.10)'
  // Liquid Glass Specific Styling
  headerBg: string; // RGBA translucent e.g. 'rgba(15, 23, 42, 0.70)'
  headerBorder: string; // RGBA border e.g. 'rgba(56, 189, 248, 0.35)'
  headerReflectColor: string; // Highlight reflection e.g. 'rgba(255, 255, 255, 0.25)'
  liquidGlassGlow: string; // Shadow glow e.g. 'rgba(56, 189, 248, 0.25)'
  swatch: {
    primaire: string;
    sombre: string;
    accent: string;
    clair: string;
  };
}
