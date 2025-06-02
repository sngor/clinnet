import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend'; // To load translations from /public/locales

// At the top, before i18n.use(HttpApi)...
let preferredLanguage = 'en'; // Default
try {
  const storedLang = localStorage.getItem('userLanguagePreference');
  if (storedLang) {
    preferredLanguage = storedLang;
    console.log(`Initial language set from localStorage: ${preferredLanguage}`);
  }
} catch (error) {
  console.error('Could not retrieve language preference for i18n init:', error);
}

i18n
  .use(HttpApi) // Use HttpApi to load translations from files
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    lng: preferredLanguage, // Use the retrieved preference
    fallbackLng: 'en', // Fallback language if selected language is not available
    ns: ['translation'], // Namespace for translations
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    react: {
      useSuspense: true, // Use suspense for loading translations
    },
  });

export default i18n;
