const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Ajout du support pour les fichiers web spécifiques
  config.resolve.extensions.push('.web.ts', '.web.tsx');
  
  // Configuration du point d'entrée web
  config.entry = path.resolve(__dirname, 'src/index.web.ts');
  
  // Configuration du HTML template
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.template = path.resolve(__dirname, 'web/index.html');
    }
  });

  return config;
}; 