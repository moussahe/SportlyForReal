/**
 * @file theme.ts
 * @description Constantes de style et thème pour l'application Sportly.
 * Ce fichier centralise :
 * - Les couleurs de l'application
 * - Les espacements standards
 * - Les styles d'ombre
 * - Les styles de texte
 * 
 * @theme
 * Palette de couleurs principale :
 * - Primary: #F78800 (Orange vif)
 * - Secondary: #FFB65C (Orange clair)
 * - Tertiary: #FFE0BA (Beige clair)
 * - Background: #FFF2E3 (Beige très clair)
 */

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#5C6BC0',
  tertiary: '#F5F5F5',
  success: '#4CAF50',
  background: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666'
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const SHADOW = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

export const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary
  },
  body: {
    fontSize: 16,
    color: COLORS.text.secondary
  },
  caption: {
    fontSize: 14,
    color: COLORS.text.secondary
  }
}; 