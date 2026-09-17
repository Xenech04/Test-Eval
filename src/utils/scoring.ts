import { BlocRubrique, EvaluationRubriqueDetail, NoteValeur } from '../types';

export const NOTE_OPTIONS: { valeur: NoteValeur; label: string; description: string; badgeClass: string; bgSelected: string }[] = [
  {
    valeur: 0,
    label: '0%',
    description: 'Non atteint / Insuffisant',
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
    bgSelected: 'bg-rose-600 text-white border-rose-600 shadow-sm'
  },
  {
    valeur: 50,
    label: '50%',
    description: 'Partiellement atteint / En cours',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    bgSelected: 'bg-amber-500 text-white border-amber-500 shadow-sm'
  },
  {
    valeur: 100,
    label: '100%',
    description: 'Atteint / Conforme aux attentes',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200',
    bgSelected: 'bg-blue-600 text-white border-blue-600 shadow-sm'
  },
  {
    valeur: 120,
    label: '120%',
    description: 'Dépassé / Surperformance',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bgSelected: 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
  },
  {
    valeur: 'NA',
    label: 'N/A',
    description: 'Non applicable (neutralisé du calcul)',
    badgeClass: 'text-slate-600 bg-slate-100 border-slate-300',
    bgSelected: 'bg-slate-700 text-white border-slate-700 shadow-sm'
  }
];

export interface CalculScoresResult {
  scoreBehavior: number; // Max nominal 20
  scoreManagement: number; // Max nominal 20
  scoreDelivery: number; // Max nominal 60
  scoreTotal: number; // Max nominal 100
  noteSurVingt: number; // Note convertie sur 20
  rubriquesRemplies: number;
  rubriquesNonNotees: number; // Rubriques encore sans note ni N/A
  rubriquesNA: number; // Rubriques marquées N/A
  totalRubriques: number;
  tauxRemplissage: number; // in %
  scoresParBloc: Record<string, {
    nom: string;
    poids: number;
    poidsEffectif: number;
    scoreObtenu: number;
    tauxMoyenPourcentage: number;
    nbRubriques: number;
    nbNotees: number;
    nbNA: number;
    estTotalementNA: boolean;
  }>;
}

export function calculerScoresEvaluation(
  blocs: BlocRubrique[],
  notes: Record<string, EvaluationRubriqueDetail>
): CalculScoresResult {
  let rubriquesRemplies = 0;
  let rubriquesNA = 0;
  let totalRubriques = 0;

  // Step 1: Analyze each block's notes and applicable rubrics
  interface BlocRawStat {
    bloc: BlocRubrique;
    sommeNotes: number;
    nbNotees: number;
    nbNA: number;
    nbActives: number;
  }

  const rawStats: BlocRawStat[] = [];
  let sommePoidsBlocsApplicables = 0;

  for (const bloc of blocs) {
    const rubriquesActives = bloc.rubriques.filter(r => r.actif);
    totalRubriques += rubriquesActives.length;

    let sommeNotes = 0;
    let nbNotees = 0;
    let nbNA = 0;

    for (const rub of rubriquesActives) {
      const detail = notes[rub.id];
      if (detail && detail.note !== null && detail.note !== undefined) {
        if (detail.note === 'NA') {
          nbNA++;
          rubriquesNA++;
          rubriquesRemplies++;
        } else if (typeof detail.note === 'number') {
          sommeNotes += detail.note;
          nbNotees++;
          rubriquesRemplies++;
        }
      }
    }

    rawStats.push({
      bloc,
      sommeNotes,
      nbNotees,
      nbNA,
      nbActives: rubriquesActives.length
    });

    if (nbNotees > 0) {
      sommePoidsBlocsApplicables += bloc.poidsPourcentage;
    }
  }

  // Step 2: Compute weighted scores with dynamic normalization if a block is fully N/A
  let scoreBehavior = 0;
  let scoreManagement = 0;
  let scoreDelivery = 0;
  let totalScore = 0;
  const scoresParBloc: Record<string, any> = {};

  for (const item of rawStats) {
    const { bloc, sommeNotes, nbNotees, nbNA, nbActives } = item;
    const estTotalementNA = nbActives > 0 && nbNA === nbActives;
    const tauxMoyenPourcentage = nbNotees > 0 ? (sommeNotes / nbNotees) : 0;

    // Weight redistribution: if some blocks are fully N/A, normalize active weights to 100%
    let poidsEffectif = bloc.poidsPourcentage;
    if (sommePoidsBlocsApplicables > 0 && sommePoidsBlocsApplicables < 100 && nbNotees > 0) {
      poidsEffectif = Number(((bloc.poidsPourcentage / sommePoidsBlocsApplicables) * 100).toFixed(2));
    } else if (estTotalementNA) {
      poidsEffectif = 0;
    }

    const scoreObtenu = Number(((tauxMoyenPourcentage / 100) * poidsEffectif).toFixed(2));

    scoresParBloc[bloc.id] = {
      nom: bloc.nom,
      poids: bloc.poidsPourcentage,
      poidsEffectif,
      scoreObtenu,
      tauxMoyenPourcentage: Number(tauxMoyenPourcentage.toFixed(1)),
      nbRubriques: nbActives,
      nbNotees,
      nbNA,
      estTotalementNA
    };

    totalScore += scoreObtenu;

    if (bloc.id === 'bloc-behavior' || bloc.nom.toLowerCase().includes('behavior')) {
      scoreBehavior = scoreObtenu;
    } else if (bloc.id === 'bloc-management' || bloc.nom.toLowerCase().includes('management')) {
      scoreManagement = scoreObtenu;
    } else if (bloc.id === 'bloc-delivery' || bloc.nom.toLowerCase().includes('delivery')) {
      scoreDelivery = scoreObtenu;
    }
  }

  const scoreTotalFixed = Number(totalScore.toFixed(2));
  const noteSurVingt = Number(((scoreTotalFixed / 100) * 20).toFixed(2));
  const tauxRemplissage = totalRubriques > 0 ? Math.round((rubriquesRemplies / totalRubriques) * 100) : 0;
  const rubriquesNonNotees = Math.max(0, totalRubriques - rubriquesRemplies);

  return {
    scoreBehavior,
    scoreManagement,
    scoreDelivery,
    scoreTotal: scoreTotalFixed,
    noteSurVingt,
    rubriquesRemplies,
    rubriquesNonNotees,
    rubriquesNA,
    totalRubriques,
    tauxRemplissage,
    scoresParBloc
  };
}

export function getStatutBadge(statut: string) {
  switch (statut) {
    case 'termine':
      return {
        label: 'Terminé / Validé',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500'
      };
    case 'en_cours':
      return {
        label: 'En cours',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500'
      };
    case 'pas_commence':
    default:
      return {
        label: 'Pas encore commencé',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
        badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
        dotColor: 'bg-slate-400'
      };
  }
}

export function getScoreAppreciation(scoreTotal: number): { texte: string; couleur: string; badgeColor: string } {
  if (scoreTotal >= 105) {
    return {
      texte: 'Surperformance exceptionnelle',
      couleur: 'text-emerald-700',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
    };
  }
  if (scoreTotal >= 95) {
    return {
      texte: 'Très bonne performance, objectifs atteints',
      couleur: 'text-emerald-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
    };
  }
  if (scoreTotal >= 80) {
    return {
      texte: 'Performance satisfaisante, conforme aux attentes',
      couleur: 'text-blue-600',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
    };
  }
  if (scoreTotal >= 60) {
    return {
      texte: 'Objectifs partiellement atteints, axes de progrès identifiés',
      couleur: 'text-amber-600',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
    };
  }
  return {
    texte: 'Insuffisant, plan d’accompagnement requis',
    couleur: 'text-rose-600',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30'
  };
}
