/**
 * timeUtils.ts
 * 
 * Utilitaires centralisés pour gérer les calculs de temps précis et cohérents
 * dans l'ensemble de l'application.
 */

import { Session, SessionStatus } from '../types';

/**
 * Constante représentant les millisecondes dans une minute
 */
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_SECOND = 1000;

/**
 * Calcule la différence exacte entre deux dates en millisecondes
 */
export const getTimeDiffMs = (targetTime: Date | string, fromTime: Date = new Date()): number => {
  const target = new Date(targetTime);
  return target.getTime() - fromTime.getTime();
};

/**
 * Calcule la différence exacte entre deux dates en secondes
 */
export const getTimeDiffSeconds = (targetTime: Date | string, fromTime: Date = new Date()): number => {
  return Math.floor(getTimeDiffMs(targetTime, fromTime) / MS_PER_SECOND);
};

/**
 * Calcule la différence exacte entre deux dates en minutes
 */
export const getTimeDiffMinutes = (targetTime: Date | string, fromTime: Date = new Date()): number => {
  return Math.floor(getTimeDiffMs(targetTime, fromTime) / MS_PER_MINUTE);
};

/**
 * Calcule le temps restant jusqu'à une date cible avec une précision à la seconde
 */
export const getTimeRemainingExact = (targetTime: Date | string): {
  totalSeconds: number;
  minutes: number;
  seconds: number;
  isNegative: boolean;
} => {
  const diffMs = getTimeDiffMs(targetTime);
  const isNegative = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);
  const totalSeconds = Math.floor(absDiffMs / MS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return {
    totalSeconds,
    minutes,
    seconds,
    isNegative
  };
};

/**
 * Calcule le temps écoulé depuis une date de début
 */
export const getTimeElapsedExact = (startTime: Date | string): {
  totalSeconds: number;
  minutes: number;
  seconds: number;
} => {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = now.getTime() - start.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / MS_PER_SECOND));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return {
    totalSeconds,
    minutes,
    seconds
  };
};

/**
 * Calcule les informations précises pour une session à venir
 */
export const getUpcomingSessionInfo = (session: Session): {
  isUpcoming: boolean;
  timeRemaining: {
    totalSeconds: number;
    minutes: number;
    seconds: number;
  };
  progress: number;
} => {
  // Si la session n'est pas en statut UPCOMING, elle n'est pas imminente
  if (session.status !== SessionStatus.UPCOMING) {
    return {
      isUpcoming: false,
      timeRemaining: { totalSeconds: 0, minutes: 0, seconds: 0 },
      progress: 0
    };
  }

  const sessionTime = new Date(session.dateTime);
  const now = new Date();
  
  // Calcul de la différence exacte
  const diffMs = sessionTime.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / MS_PER_SECOND);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const remainingSeconds = diffSeconds % 60;
  
  // Une session est considérée comme imminente si elle commence dans les 30 prochaines minutes
  // ou si elle vient de commencer (jusqu'à 1 minute après l'heure prévue)
  const diffMinutesExact = diffMs / MS_PER_MINUTE;
  const isUpcoming = diffMinutesExact >= -1 && diffMinutesExact <= 30;
  
  // Calculer la progression (0 à 1) où 0 = 30 minutes avant et 1 = maintenant
  const progress = isUpcoming ? Math.min(1, Math.max(0, 1 - (diffMinutesExact / 30))) : 0;
  
  return {
    isUpcoming,
    timeRemaining: {
      totalSeconds: Math.max(0, diffSeconds),
      minutes: Math.max(0, diffMinutes),
      seconds: remainingSeconds < 0 ? 60 + remainingSeconds : remainingSeconds
    },
    progress
  };
};

/**
 * Calcule les informations précises pour une session active
 */
export const getActiveSessionInfo = (session: Session): {
  isActive: boolean;
  elapsed: {
    totalSeconds: number;
    minutes: number;
    seconds: number;
  };
  remaining: {
    totalSeconds: number;
    minutes: number;
    seconds: number;
  };
  progress: number;
  shouldEnd: boolean;
} => {
  // Si le statut n'est pas IN_PROGRESS, la session n'est pas active
  if (session.status !== SessionStatus.IN_PROGRESS) {
    return {
      isActive: false,
      elapsed: { totalSeconds: 0, minutes: 0, seconds: 0 },
      remaining: { totalSeconds: 0, minutes: 0, seconds: 0 },
      progress: 0,
      shouldEnd: false
    };
  }

  const now = new Date();
  const startTime = new Date(session.dateTime);
  const durationMs = session.duration * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationMs);
  
  // Calcul du temps écoulé
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedSeconds = Math.floor(elapsedMs / MS_PER_SECOND);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecondsRemainder = elapsedSeconds % 60;
  
  // Calcul du temps restant
  const remainingMs = Math.max(0, endTime.getTime() - now.getTime());
  const remainingSeconds = Math.floor(remainingMs / MS_PER_SECOND);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsRemainder = remainingSeconds % 60;
  
  // Calcul de la progression en pourcentage (0-100)
  const totalDurationS = session.duration * 60;
  // Calcul de la progression en pourcentage (0-100)
  // Utiliser un calcul précis pour garantir que la progression arrive exactement à 100% à la fin
  const progress = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationS) * 100));
  
  // La session devrait se terminer si l'heure actuelle est après l'heure de fin prévue
  const shouldEnd = now >= endTime;
  
  // La session est active si l'heure actuelle est entre le début et la fin
  const isActive = now >= startTime && now < endTime;
  
  return {
    isActive,
    elapsed: {
      totalSeconds: elapsedSeconds,
      minutes: elapsedMinutes,
      seconds: elapsedSecondsRemainder
    },
    remaining: {
      totalSeconds: remainingSeconds,
      minutes: remainingMinutes,
      seconds: remainingSecondsRemainder
    },
    progress,
    shouldEnd
  };
};

/**
 * Vérifie le statut d'une session et détermine si elle doit changer
 */
export const determineSessionStatus = (session: Session): {
  currentStatus: SessionStatus;
  shouldBeStatus: SessionStatus | null;
  shouldStart: boolean;
  shouldEnd: boolean;
} => {
  const now = new Date();
  const startTime = new Date(session.dateTime);
  const durationMs = session.duration * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationMs);
  
  const shouldStart = session.status === SessionStatus.UPCOMING && now >= startTime;
  const shouldEnd = session.status === SessionStatus.IN_PROGRESS && now >= endTime;
  
  let shouldBeStatus: SessionStatus | null = null;
  
  if (shouldStart) {
    shouldBeStatus = SessionStatus.IN_PROGRESS;
  } else if (shouldEnd) {
    shouldBeStatus = SessionStatus.TERMINATED;
  }
  
  return {
    currentStatus: session.status as SessionStatus,
    shouldBeStatus,
    shouldStart,
    shouldEnd
  };
};

/**
 * Formate le temps restant pour l'affichage
 */
export const formatTimeRemaining = (minutes: number, seconds?: number): string => {
  if (minutes <= 0 && (!seconds || seconds <= 0)) return "Maintenant";
  
  if (minutes === 0 && seconds && seconds > 0) {
    return `Dans ${seconds} seconde${seconds > 1 ? 's' : ''}`;
  }
  
  if (minutes === 1) {
    return `Dans 1 minute${seconds && seconds > 0 ? ` et ${seconds} seconde${seconds > 1 ? 's' : ''}` : ''}`;
  }
  
  return `Dans ${minutes} minutes`;
};

/**
 * Formate le temps restant pendant une session active
 */
export const formatRemainingTime = (minutes: number, seconds?: number): string => {
  if (minutes <= 0 && (!seconds || seconds <= 0)) return "Session terminée";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0 && seconds !== undefined && seconds > 0) {
    return `${seconds} seconde${seconds > 1 ? 's' : ''} restante${seconds > 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}min` : ''} restantes`;
  }
  
  return `${mins} minute${mins > 1 ? 's' : ''} restante${mins > 1 ? 's' : ''}`;
};
