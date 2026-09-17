import { ChargeDeFlux, Evaluation, UserAccount, UserRole } from '../types';

/**
 * Normalise a string for loose, robust matching
 */
function cleanStr(s?: string | null): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Tests if a collaborator belongs strictly to the team of the given N+1 manager
 */
export function isCollaborateurInTeam(charge: ChargeDeFlux, manager: UserAccount): boolean {
  if (!charge.nPlusUn || !charge.nPlusUn.trim()) return false;

  const cMgr = cleanStr(charge.nPlusUn);
  if (!cMgr) return false;

  const mgrTargets = [
    cleanStr(manager.nPlusUnNom),
    cleanStr(manager.nomAffiche?.replace(/\(n\+1\)/gi, '')),
    cleanStr(manager.username)
  ].filter(Boolean);

  return mgrTargets.some(target => target && (cMgr.includes(target) || target.includes(cMgr)));
}

/**
 * Tests if a charge record belongs to the logged-in collaborator
 */
export function isCollaborateurSelf(charge: ChargeDeFlux, user: UserAccount): boolean {
  if (user.chargeDeFluxId && charge.id === user.chargeDeFluxId) {
    return true;
  }
  const cleanMatricule = cleanStr(user.matricule);
  if (cleanMatricule && cleanStr(charge.matricule) === cleanMatricule) {
    return true;
  }
  const cleanUname = cleanStr(user.username);
  if (cleanUname && (cleanStr(charge.matricule) === cleanUname || cleanStr(charge.nomPrenom) === cleanUname)) {
    return true;
  }
  const cleanNom = cleanStr(user.nomAffiche);
  if (cleanNom && cleanStr(charge.nomPrenom) === cleanNom) {
    return true;
  }
  return false;
}

/**
 * Returns strictly allowed charges based on user role
 */
export function getFilteredChargesForUser(charges: ChargeDeFlux[], user: UserAccount | null): ChargeDeFlux[] {
  if (!user) return [];

  if (user.role === 'admin') {
    return charges;
  }

  if (user.role === 'n_plus_un') {
    return charges.filter(c => isCollaborateurInTeam(c, user));
  }

  if (user.role === 'collaborateur') {
    return charges.filter(c => isCollaborateurSelf(c, user));
  }

  return [];
}

/**
 * Returns strictly allowed evaluations based on user role and available charges
 */
export function getFilteredEvaluationsForUser(
  evaluations: Evaluation[],
  allowedCharges: ChargeDeFlux[],
  user: UserAccount | null
): Evaluation[] {
  if (!user) return [];

  if (user.role === 'admin') {
    return evaluations;
  }

  const allowedChargeIds = new Set(allowedCharges.map(c => c.id));
  return evaluations.filter(e => allowedChargeIds.has(e.chargeDeFluxId));
}
