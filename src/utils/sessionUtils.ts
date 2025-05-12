import { Session, SessionStatus } from '../types';

/**
 * Vérifie si une session est sur le point de commencer (dans les 30 prochaines minutes)
 * @param session La session à vérifier
 * @returns Un objet contenant isUpcoming (boolean) et minutesRemaining (number)
 */
export const isSessionUpcoming = (session: Session): { isUpcoming: boolean; minutesRemaining: number; progress: number } => {
  // Si la session n'est pas en statut UPCOMING, elle n'est pas imminente
  if (session.status !== SessionStatus.UPCOMING) {
    return { isUpcoming: false, minutesRemaining: 0, progress: 0 };
  }

  const sessionDate = new Date(session.dateTime);
  const now = new Date();
  
  // Calcul de la différence en minutes
  const diffMs = sessionDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Une session est considérée comme imminente si elle commence dans les 30 prochaines minutes
  const isUpcoming = diffMinutes >= 0 && diffMinutes <= 30;
  
  // Calculer la progression (0 à 1) où 0 = 30 minutes avant et 1 = maintenant
  const progress = isUpcoming ? 1 - (diffMinutes / 30) : 0;
  
  return { 
    isUpcoming,
    minutesRemaining: Math.max(0, diffMinutes),
    progress: Math.min(1, Math.max(0, progress))
  };
};

/**
 * Vérifie si une session approche de son début (dans l'heure qui précède)
 * et si le verrouillage d'équipe doit être activé
 * @param session La session à vérifier
 * @returns Un objet contenant isTeamLocked (boolean) et minutesRemaining (number)
 */
export const isTeamLocked = (session: Session): { isTeamLocked: boolean; minutesRemaining: number } => {
  if (session.status !== SessionStatus.UPCOMING) {
    // Si la session est en cours, les équipes sont verrouillées
    return { isTeamLocked: session.status === SessionStatus.IN_PROGRESS, minutesRemaining: 0 };
  }

  const sessionDate = new Date(session.dateTime);
  const now = new Date();
  
  // Calcul de la différence en minutes
  const diffMs = sessionDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Les équipes sont verrouillées dans l'heure qui précède le début de la session
  const isTeamLocked = diffMinutes >= 0 && diffMinutes <= 60;
  
  return { 
    isTeamLocked,
    minutesRemaining: Math.max(0, diffMinutes)
  };
};

/**
 * Vérifie si une session est actuellement active (a commencé et n'est pas terminée)
 * @param session La session à vérifier
 * @returns Un objet contenant des informations sur la session active
 */
export const isSessionActive = (session: Session): { 
  isActive: boolean; 
  elapsedMinutes: number; 
  remainingMinutes: number;
  progressPercent: number;
} => {
  // Si le statut n'est pas IN_PROGRESS, la session n'est pas active
  if (session.status !== SessionStatus.IN_PROGRESS) {
    return { 
      isActive: false, 
      elapsedMinutes: 0, 
      remainingMinutes: 0,
      progressPercent: 0
    };
  }

  const startTime = new Date(session.dateTime);
  const now = new Date();
  const durationMs = session.duration * 60 * 1000; // Durée en ms
  const endTime = new Date(startTime.getTime() + durationMs);
  
  // Calcul du temps écoulé et restant en minutes
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
  
  const remainingMs = Math.max(0, endTime.getTime() - now.getTime());
  const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
  
  // Calcul de la progression en pourcentage
  const totalMinutes = session.duration;
  const progressPercent = Math.min(100, Math.max(0, (elapsedMinutes / totalMinutes) * 100));
  
  // La session est active si l'heure actuelle est entre le début et la fin
  const isActive = now >= startTime && now < endTime;
  
  return {
    isActive,
    elapsedMinutes,
    remainingMinutes,
    progressPercent
  };
};

/**
 * Récupère la prochaine session à laquelle l'utilisateur participe
 * @param sessions Liste des sessions
 * @param userId ID de l'utilisateur
 * @returns La session imminente ou null
 */
export const getNextUpcomingSession = (sessions: Session[], userId: string): Session | null => {
  if (!sessions || sessions.length === 0) return null;
  
  // Filtrer les sessions à venir auxquelles l'utilisateur participe
  const userUpcomingSessions = sessions
    .filter(session => 
      session.status === 'UPCOMING' && 
      (session.participants.some(participant => participant.id === userId) || 
       session.host.id === userId)
    )
    .map(session => ({
      session,
      ...isSessionUpcoming(session)
    }))
    .filter(item => item.isUpcoming);
  
  // Trier par temps restant (du plus proche au plus lointain)
  userUpcomingSessions.sort((a, b) => a.minutesRemaining - b.minutesRemaining);
  
  // Retourner la session la plus proche ou null
  return userUpcomingSessions.length > 0 ? userUpcomingSessions[0].session : null;
};
