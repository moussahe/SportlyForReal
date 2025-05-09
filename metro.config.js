const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Passez de true à false
config.resolver.unstable_enablePackageExports = false;

// (le reste peut rester tel quel)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];
config.watchFolders = [path.resolve(__dirname)];

module.exports = config;