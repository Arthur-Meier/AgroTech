// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Trate .wasm como asset para o bundler
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;
