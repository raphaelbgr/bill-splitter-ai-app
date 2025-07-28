const { i18n } = require('./lib/internationalization');

console.log('Testing i18n system...');

// Check if translations are loaded
const translations = i18n.translations;
console.log('Available languages:', Array.from(translations.keys()));

// Check PT-BR translations
const ptBRTranslations = translations.get('pt-BR');
console.log('PT-BR translations:', ptBRTranslations);

// Test translation
i18n.setLanguage('pt-BR');
const translation = i18n.t('message.welcome');
console.log('Translation result:', translation);

// Test current language
console.log('Current language:', i18n.getCurrentLanguage());
console.log('Current region:', i18n.getCurrentRegion()); 