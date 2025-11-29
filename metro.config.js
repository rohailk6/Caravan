// Get the default configuration from Expo
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This tells the bundler to look for `.ttf` files as assets.
config.resolver.assetExts.push('ttf');

module.exports = config;
