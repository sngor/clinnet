import { useState, useEffect } from 'react';

/**
 * Custom React hook to track online/offline status.
 *
 * @returns {boolean} True if the browser is offline, false otherwise.
 *
 * @example
 * ```jsx
 * import useOfflineStatus from './useOfflineStatus';
 *
 * function MyComponent() {
 *   const isOffline = useOfflineStatus();
 *
 *   return (
 *     <div>
 *       {isOffline ? <p>You are offline.</p> : <p>You are online.</p>}
 *     </div>
 *   );
 * }
 * ```
 */
const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and unmount

  return isOffline;
};

export default useOfflineStatus;
