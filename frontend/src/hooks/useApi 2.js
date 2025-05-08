// src/hooks/useApi.js
import { useState, useCallback } from 'react';

/**
 * A custom hook for handling API calls with loading, error, and data states
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - Object containing data, loading, error, and execute function
 */
const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute };
};

export default useApi;