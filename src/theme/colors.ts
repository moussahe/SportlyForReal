export const colors = {
  // Couleurs principales
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  
  // Couleurs de fond
  background: {
    light: '#F7F7F7',
    white: '#FFFFFF',
    card: '#FFFFFF',
  },
  
  // Couleurs de texte
  text: {
    primary: '#2D3436',
    secondary: '#636E72',
    light: '#B2BEC3',
    white: '#FFFFFF',
  },
  
  // Couleurs de statut
  status: {
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#FF7675',
    info: '#74B9FF',
  },
  
  // Couleurs des niveaux
  level: {
    beginner: '#4ECDC4',
    intermediate: '#FFD93D',
    advanced: '#E17055', // Changé de #FF6B6B à #E17055 pour diversifier la palette
  },
  
  // Couleurs des états de session
  session: {
    upcoming: '#74B9FF',
    inProgress: '#00B894',
    completed: '#B2BEC3',
    cancelled: '#D63031', // Changé de #FF6B6B à #D63031 pour diversifier la palette
  },
  
  // Couleurs des boutons
  button: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    disabled: '#B2BEC3',
  },
  
  // Couleurs des bordures
  border: {
    light: '#DFE6E9',
    dark: '#B2BEC3',
  },
  
  // Couleurs des ombres
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

export type Colors = typeof colors;

export default colors;