// src/utils/fileUtils.js

/**
 * Convert a File to a base64 data URI string using FileReader
 * Always returns the full data URI (e.g., data:image/png;base64,....)
 *
 * @param {File|Blob} file
 * @returns {Promise<string>} data URI
 */
export const fileToDataUri = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert a File to a base64 string (without the data:[mime];base64, prefix)
 *
 * @param {File|Blob} file
 * @returns {Promise<string>} base64 only
 */
export const fileToBase64Only = async (file) => {
  const dataUri = await fileToDataUri(file);
  const commaIndex = typeof dataUri === "string" ? dataUri.indexOf(",") : -1;
  return commaIndex > -1 ? dataUri.slice(commaIndex + 1) : dataUri;
};

/**
 * Extract username from an email or return the string if already a username
 *
 * @param {string} emailOrUsername
 * @returns {string}
 */
export const extractUsername = (emailOrUsername) => {
  if (!emailOrUsername) return "";
  return emailOrUsername.includes("@")
    ? emailOrUsername.split("@")[0]
    : emailOrUsername;
};

