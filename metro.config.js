// metro.config.js
// Expo SDK 56 — extends the default Expo Metro config.
// We add 'html' to assetExts so that .html files inside assets/
// are bundled as static assets (required by JeuScreen via expo-asset).

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to treat .html files as assets (not JS modules)
config.resolver.assetExts.push('html');

module.exports = config;
