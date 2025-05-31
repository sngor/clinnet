import AWS from 'aws-sdk';

// IMPORTANT: AWS credentials should not be hardcoded.
// This is a placeholder and should be replaced with a secure
// credential management solution like Amplify Auth or Cognito Identity Pools.
AWS.config.update({
  accessKeyId: 'YOUR_ACCESS_KEY_ID', // Replace with secure method
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY', // Replace with secure method
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1' // Or your desired region, make this configurable
});

const translate = new AWS.Translate({ apiVersion: '2017-07-01' });

/**
 * Translates text to the target language using AWS Translate.
 * @param {string} text The text to translate.
 * @param {string} targetLanguageCode The ISO 639-1 code for the target language.
 * @returns {Promise<string|null>} The translated text or null if an error occurs.
 */
export const translateText = async (text, targetLanguageCode) => {
  const cacheKey = `${targetLanguageCode}_${text}`;

  try {
    // Check cache first
    const cachedTranslation = localStorage.getItem(cacheKey);
    if (cachedTranslation) {
      console.log('Returning cached translation:', cachedTranslation);
      return cachedTranslation;
    }

    const params = {
      Text: text,
      SourceLanguageCode: 'auto', // Or set to a specific source language like 'en'
      TargetLanguageCode: targetLanguageCode,
    };

    const data = await translate.translateText(params).promise();
    const translatedText = data.TranslatedText;

    // Store in cache
    if (translatedText) {
      localStorage.setItem(cacheKey, translatedText);
    }

    return translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    // In a real app, you might want to throw the error or handle it more gracefully
    // For example, by returning a specific error message or a fallback translation
    return null;
  }
};
