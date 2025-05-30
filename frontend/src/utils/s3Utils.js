// src/utils/s3Utils.js

/**
 * Converts an S3 URI (s3://bucket/key) or an existing HTTPS S3 URL 
 * to a displayable HTTPS URL.
 * If the input is already an HTTPS URL, it's returned directly.
 * Assumes 'us-east-1' as the default region if REACT_APP_AWS_REGION is not set.
 * 
 * @param {string} s3UriOrHttpsUrl - The S3 URI or existing HTTPS S3 URL.
 * @returns {string|null} The displayable HTTPS URL or null if input is invalid.
 */
export const getDisplayableS3Url = (s3UriOrHttpsUrl) => {
  if (!s3UriOrHttpsUrl) {
    return null;
  }

  if (s3UriOrHttpsUrl.startsWith('https://')) {
    return s3UriOrHttpsUrl;
  }

  if (s3UriOrHttpsUrl.startsWith('s3://')) {
    const parts = s3UriOrHttpsUrl.replace('s3://', '').split('/');
    const bucket = parts.shift();
    const key = parts.join('/');
    
    // Ensure bucket and key are valid
    if (!bucket || !key) {
      console.warn("Invalid S3 URI format (missing bucket or key):", s3UriOrHttpsUrl);
      return null;
    }

    // Fallback to 'us-east-1' if the environment variable is not set
    const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
  
  // Optional: Handle cases where it might just be a key, though current backend saves URI/URL
  // This part would require REACT_APP_PROFILE_IMAGE_BUCKET to be set.
  /*
  const bucket = process.env.REACT_APP_PROFILE_IMAGE_BUCKET;
  if (bucket && s3UriOrHttpsUrl && !s3UriOrHttpsUrl.includes('/')) { // Simple check if it's a key
    const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
    console.log(`Interpreting "${s3UriOrHttpsUrl}" as a key in bucket "${bucket}"`);
    return `https://${bucket}.s3.${region}.amazonaws.com/${s3UriOrHttpsUrl}`;
  }
  */
  
  console.warn("Unrecognized S3 URI or URL format:", s3UriOrHttpsUrl);
  // Return the original string if it's an unrecognized format but not clearly an S3 URI
  // This might be useful if some URLs are direct non-S3 HTTPS links not starting with s3:// or https:// (unlikely for profile images)
  // However, for stricter handling, one might return null here too.
  return s3UriOrHttpsUrl; // Or null for stricter handling
};
