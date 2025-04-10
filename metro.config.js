const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ajout du support pour les fichiers web
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Configuration pour le web
config.transformer.minifierPath = 'metro-minify-terser';

// Alias pour les imports
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@store': path.resolve(__dirname, 'src/store'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@assets': path.resolve(__dirname, 'assets'),
  'react-native$': 'react-native-web',
};

module.exports = config; 