import { BlocRubrique, ChargeDeFlux, Evaluation } from '../types';

export const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const ANNEES_DISPONIBLES: number[] = Array.from({ length: 18 }, (_, i) => 2023 + i); // 2023 to 2040

export const INITIAL_NIVEAUX: string[] = [
  'Junior',
  'Confirmé',
  'Senior',
  'Lead / Expert'
];

export const INITIAL_CHARGES_DE_FLUX: ChargeDeFlux[] = [
  {
    id: 'cf-1',
    matricule: 'MGR-2023-014',
    nomPrenom: 'Thomas Legrand',
    niveau: 'Senior',
    nPlusUn: 'Marc Delattre (Directeur des Opérations)',
    actif: true,
    dateCreation: '2023-02-15',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'cf-2',
    matricule: 'MGR-2024-042',
    nomPrenom: 'Sarah Benali',
    niveau: 'Confirmé',
    nPlusUn: 'Marc Delattre (Directeur des Opérations)',
    actif: true,
    dateCreation: '2024-01-10',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'cf-3',
    matricule: 'MGR-2025-007',
    nomPrenom: 'Lucas Fontaine',
    niveau: 'Junior',
    nPlusUn: 'Claire Rousseau (Superviseur Opérations)',
    actif: true,
    dateCreation: '2025-01-05',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'cf-4',
    matricule: 'MGR-2022-003',
    nomPrenom: 'Élodie Mercier',
    niveau: 'Lead / Expert',
    nPlusUn: 'David Moreau (Dir. Exécutif)',
    actif: true,
    dateCreation: '2022-09-01',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_BLOCS: BlocRubrique[] = [
  {
    id: 'bloc-behavior',
    nom: 'Behavior',
    titreAffiche: 'Bloc 1 — Behavior',
    poidsPourcentage: 20,
    description: 'Posture professionnelle, communication, dynamique collective et gestion des situations tendues.',
    couleurBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    rubriques: [
      {
        id: 'rub-beh-1',
        blocId: 'bloc-behavior',
        titre: 'Posture professionnelle & Communication',
        description: 'Clarté dans les échanges oraux et écrits, courtoisie et transparence avec les parties prenantes.',
        actif: true
      },
      {
        id: 'rub-beh-2',
        blocId: 'bloc-behavior',
        titre: 'Esprit d’équipe & Entraide opérationnelle',
        description: 'Capacité à soutenir ses collègues lors des pics d’activité et maintenir une ambiance positive.',
        actif: true
      },
      {
        id: 'rub-beh-3',
        blocId: 'bloc-behavior',
        titre: 'Gestion du stress & Adaptabilité',
        description: 'Maintien du calme face aux ruptures de flux, pannes ou réorientations de priorités.',
        actif: true
      },
      {
        id: 'rub-beh-4',
        blocId: 'bloc-behavior',
        titre: 'Ponctualité & Respect des engagements',
        description: 'Prise de poste à l’heure, présence aux points d’équipe et respect scrupuleux des délais annoncés.',
        actif: true
      }
    ]
  },
  {
    id: 'bloc-management',
    nom: 'Management',
    titreAffiche: 'Bloc 2 — Management',
    poidsPourcentage: 20,
    description: 'Animation d’équipe, transmission des consignes, organisation et montée en compétences.',
    couleurBadge: 'bg-blue-100 text-blue-800 border-blue-300',
    rubriques: [
      {
        id: 'rub-man-1',
        blocId: 'bloc-management',
        titre: 'Animation des briefs & Passation de consignes',
        description: 'Structure et précision des briefs de démarrage et transmission fluide des informations entre shifts.',
        actif: true
      },
      {
        id: 'rub-man-2',
        blocId: 'bloc-management',
        titre: 'Accompagnement & Montée en compétences',
        description: 'Partage des bonnes pratiques avec les nouveaux arrivants et tutorat opérationnel.',
        actif: true
      },
      {
        id: 'rub-man-3',
        blocId: 'bloc-management',
        titre: 'Organisation & Équilibrage de la charge',
        description: 'Répartition intelligente des volumes de flux en fonction des capacités individuelles.',
        actif: true
      },
      {
        id: 'rub-man-4',
        blocId: 'bloc-management',
        titre: 'Gestion des imprévus & Escalade N+1',
        description: 'Résolution autonome des premiers blocages et remontée d’alerte documentée et opportune.',
        actif: true
      }
    ]
  },
  {
    id: 'bloc-delivery',
    nom: 'Delivery',
    titreAffiche: 'Bloc 3 — Delivery',
    poidsPourcentage: 60,
    description: 'Atteinte des objectifs quantitatifs et qualitatifs, respect des SLA et maîtrise des processus.',
    couleurBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    rubriques: [
      {
        id: 'rub-del-1',
        blocId: 'bloc-delivery',
        titre: 'Respect des SLA & Cadences de traitement',
        description: 'Respect des temps cibles de rotation et atteinte des objectifs de débit opérationnel.',
        actif: true
      },
      {
        id: 'rub-del-2',
        blocId: 'bloc-delivery',
        titre: 'Qualité d’exécution & Taux de conformité',
        description: 'Taux d’anomalies et d’erreurs sous le seuil contractuel, zéro écart critique.',
        actif: true
      },
      {
        id: 'rub-del-3',
        blocId: 'bloc-delivery',
        titre: 'Rigueur du pilotage & Suivi des KPI',
        description: 'Tenue irréprochable des outils de supervision, saisie en temps réel et exactitude des métriques.',
        actif: true
      },
      {
        id: 'rub-del-4',
        blocId: 'bloc-delivery',
        titre: 'Proactivité & Détection des goulets d’étranglement',
        description: 'Anticipation des saturations de ligne et mise en œuvre immédiate de plans de délestage.',
        actif: true
      }
    ]
  }
];

export const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    chargeDeFluxId: 'cf-2', // Sarah Benali
    mois: 1, // Janvier
    annee: 2026,
    dateEntretien: '2026-01-28',
    statut: 'termine',
    nPlusUn: 'Marc Delattre (Resp. Flux & Pilotage)',
    commentaireGlobal: 'Très bon mois de démarrage. Sarah a démontré une grande rigueur sur le Delivery et une excellente cohésion d’équipe. Poursuivre les efforts sur la formalisation des passations de consignes.',
    scoreBehavior: 19.0,
    scoreManagement: 17.5,
    scoreDelivery: 55.0,
    scoreTotal: 91.5,
    dateValidation: '2026-01-28T16:30:00Z',
    validePar: 'Marc Delattre',
    derniereModification: '2026-01-28T16:30:00Z',
    actionsSuivi: [
      {
        id: 'act-1-1',
        titre: 'Mise en place d’un support visuel pour les briefs du matin',
        statut: 'OK',
        datePrevue: '2026-02-15',
        commentaire: 'Fiche brief plastifiée installée au poste de commandement.'
      },
      {
        id: 'act-1-2',
        titre: 'Formation de perfectionnement sur la détection anticipée des saturations',
        statut: 'En cours',
        datePrevue: '2026-03-10',
        commentaire: 'Session de binômage programmée avec Élodie.'
      }
    ],
    notes: {
      'rub-beh-1': { note: 100, commentaire: 'Communication claire et respectueuse avec le dispatching.' },
      'rub-beh-2': { note: 100, commentaire: 'Très appréciée par ses pairs, toujours disponible pour dépanner.' },
      'rub-beh-3': { note: 100, commentaire: 'A su garder son calme lors de la panne du trieur automatique.' },
      'rub-beh-4': { note: 100, commentaire: 'Ponctualité exemplaire.' },
      'rub-man-1': { note: 50, commentaire: 'Briefs un peu rapides le matin, à étoffer pour les intérimaires.' },
      'rub-man-2': { note: 100, commentaire: 'Bon accompagnement du nouveau stagiaire flux.' },
      'rub-man-3': { note: 100, commentaire: 'Équilibrage efficace des postes de travail.' },
      'rub-man-4': { note: 100, commentaire: 'Bonne réactivité sur les escalades.' },
      'rub-del-1': { note: 100, commentaire: 'SLA tenus à 98.4% sur le mois.' },
      'rub-del-2': { note: 100, commentaire: 'Taux de rebut quasi nul.' },
      'rub-del-3': { note: 100, commentaire: 'Tableaux de bord à jour quotidiennement.' },
      'rub-del-4': { note: 50, commentaire: 'Anticipation des saturations à affiner en fin d’après-midi.' }
    }
  },
  {
    id: 'eval-2',
    chargeDeFluxId: 'cf-2', // Sarah Benali
    mois: 2, // Février
    annee: 2026,
    dateEntretien: '2026-02-27',
    statut: 'termine',
    nPlusUn: 'Marc Delattre (Resp. Flux & Pilotage)',
    commentaireGlobal: 'Progression notable sur la partie management et anticipation. Surperformance remarquable sur le Delivery lors de la période de pointe.',
    scoreBehavior: 20.0,
    scoreManagement: 20.0,
    scoreDelivery: 66.0,
    scoreTotal: 106.0,
    dateValidation: '2026-02-27T17:00:00Z',
    validePar: 'Marc Delattre',
    derniereModification: '2026-02-27T17:00:00Z',
    notes: {
      'rub-beh-1': { note: 100, commentaire: 'Excellente clarté, échanges fluides avec la logistique.' },
      'rub-beh-2': { note: 120, commentaire: 'Rôle moteur évident dans la bonne ambiance et solidarité.' },
      'rub-beh-3': { note: 100, commentaire: 'Parfaite maîtrise en situation de rush.' },
      'rub-beh-4': { note: 100, commentaire: 'Toujours en avance pour la préparation du shift.' },
      'rub-man-1': { note: 100, commentaire: 'Briefs désormais structurés avec support visuel.' },
      'rub-man-2': { note: 100, commentaire: 'Tutorat très apprécié par l’équipe.' },
      'rub-man-3': { note: 100, commentaire: 'Très bonne répartition de la charge.' },
      'rub-man-4': { note: 100, commentaire: 'Anticipation des alertes sans sollicitation excessive.' },
      'rub-del-1': { note: 120, commentaire: 'SLA dépassés à 101.5% avec record de traitement.' },
      'rub-del-2': { note: 100, commentaire: 'Qualité conforme et zéro litige.' },
      'rub-del-3': { note: 100, commentaire: 'Reporting parfait et envoyé avant 18h.' },
      'rub-del-4': { note: 120, commentaire: 'A détecté et débloqué un goulot 45 min avant l’impact.' }
    }
  },
  {
    id: 'eval-3',
    chargeDeFluxId: 'cf-1', // Thomas Legrand
    mois: 1, // Janvier
    annee: 2026,
    dateEntretien: '2026-01-29',
    statut: 'termine',
    nPlusUn: 'Marc Delattre (Resp. Flux & Pilotage)',
    commentaireGlobal: 'Thomas maintient un niveau de Delivery solide grâce à son expérience. Attention à garder de la souplesse dans le management et la communication interservices.',
    scoreBehavior: 16.0,
    scoreManagement: 16.0,
    scoreDelivery: 60.0,
    scoreTotal: 92.0,
    dateValidation: '2026-01-29T15:00:00Z',
    validePar: 'Marc Delattre',
    derniereModification: '2026-01-29T15:00:00Z',
    notes: {
      'rub-beh-1': { note: 50, commentaire: 'Ton parfois un peu direct lors des escalades avec le transport.' },
      'rub-beh-2': { note: 100, commentaire: 'Soutien technique apprécié des plus jeunes.' },
      'rub-beh-3': { note: 100, commentaire: 'Très solide sous pression.' },
      'rub-beh-4': { note: 100, commentaire: 'Impeccable.' },
      'rub-man-1': { note: 100, commentaire: 'Briefs techniques très complets.' },
      'rub-man-2': { note: 100, commentaire: 'Partage spontanément ses astuces sur le logiciel de flux.' },
      'rub-man-3': { note: 50, commentaire: 'Tendance à vouloir tout gérer lui-même sans déléguer.' },
      'rub-man-4': { note: 100, commentaire: 'Remontées précises et étayées.' },
      'rub-del-1': { note: 100, commentaire: 'Cadences nominales respectées à 100%.' },
      'rub-del-2': { note: 100, commentaire: 'Très haute rigueur sur les process.' },
      'rub-del-3': { note: 100, commentaire: 'Reporting d’une grande exactitude.' },
      'rub-del-4': { note: 100, commentaire: 'Sens aigu de la détection des anomalies.' }
    }
  },
  {
    id: 'eval-4',
    chargeDeFluxId: 'cf-3', // Lucas Fontaine
    mois: 2, // Février
    annee: 2026,
    dateEntretien: '2026-02-25',
    statut: 'en_cours',
    nPlusUn: 'Claire Rousseau (Superviseur Flux)',
    commentaireGlobal: 'Entretien entamé, bons débuts opérationnels pour Lucas, évaluation en cours de finalisation.',
    scoreBehavior: 17.5,
    scoreManagement: 12.5,
    scoreDelivery: 45.0,
    scoreTotal: 75.0,
    derniereModification: '2026-02-25T11:20:00Z',
    notes: {
      'rub-beh-1': { note: 100, commentaire: 'Très poli, bonne écoute active.' },
      'rub-beh-2': { note: 100, commentaire: 'S’intègre très bien dans le groupe.' },
      'rub-beh-3': { note: 50, commentaire: 'Encore un peu déstabilisé par les à-coups de flux rapides.' },
      'rub-beh-4': { note: 100, commentaire: 'Toujours à l’heure.' },
      'rub-man-1': { note: 50, commentaire: 'Doit gagner en assurance lors des briefings.' },
      'rub-man-2': { note: 50, commentaire: 'En phase d’apprentissage, normal à ce stade.' },
      'rub-man-3': { note: 50, commentaire: 'Accompagnement nécessaire sur la répartition.' },
      'rub-man-4': { note: 50, commentaire: 'Escalade encore parfois trop tardive.' },
      'rub-del-1': { note: 100, commentaire: 'Bon rythme sur les flux standards.' },
      'rub-del-2': { note: 50, commentaire: 'Quelques erreurs de typage corrigées rapidement.' },
      'rub-del-3': { note: 50, commentaire: 'Prise en main du tableur de suivi en cours.' },
      'rub-del-4': { note: 50, commentaire: 'Dépend encore de son tuteur pour les alertes.' }
    }
  }
];
