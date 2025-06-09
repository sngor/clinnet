import axios from 'axios'; // Import axios for processRequestQueue

// Simulating hook usage for now - proper hook integration requires architectural changes.

const REQUEST_QUEUE_KEY = 'offlineRequestQueue';

// --- localStorage direct manipulation functions (simulating useLocalStorage queue part) ---
const appendToLocalStorageQueue = (item) => {
  try {
    const currentQueueString = localStorage.getItem(REQUEST_QUEUE_KEY);
    const currentQueue = currentQueueString ? JSON.parse(currentQueueString) : [];
    currentQueue.push(item);
    localStorage.setItem(REQUEST_QUEUE_KEY, JSON.stringify(currentQueue));
    console.log('[Offline Handler] Request appended to offline queue.');
  } catch (error) {
    console.error(`[Offline Handler] Error appending to queue in localStorage for key "${REQUEST_QUEUE_KEY}":`, error);
  }
};

const getLocalStorageQueue = () => {
  try {
    const queueString = localStorage.getItem(REQUEST_QUEUE_KEY);
    return queueString ? JSON.parse(queueString) : [];
  } catch (error) {
    console.error(`[Offline Handler] Error getting queue from localStorage for key "${REQUEST_QUEUE_KEY}":`, error);
    return [];
  }
};

const updateLocalStorageQueue = (queue) => {
  try {
    if (queue && queue.length > 0) {
      localStorage.setItem(REQUEST_QUEUE_KEY, JSON.stringify(queue));
    } else {
      localStorage.removeItem(REQUEST_QUEUE_KEY); // Clear if empty
    }
  } catch (error) {
    console.error(`[Offline Handler] Error updating queue in localStorage for key "${REQUEST_QUEUE_KEY}":`, error);
  }
};
// --- End of localStorage direct manipulation functions ---


/**
 * Handles GET requests during offline scenarios.
 * (Content from original file, no changes to this function in this step)
 */
export const handleOfflineGet = async (config) => {
  const isOffline = !navigator.onLine;

  if (isOffline) {
    console.log(`[Offline Handler] App is offline. Attempting to serve GET request for ${config.url} from cache.`);
    try {
      const cachedDataString = localStorage.getItem(config.url); // Assuming URL is a good key for GET cache
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString);
        console.log(`[Offline Handler] Data found in cache for ${config.url}.`);
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (from cache)',
          headers: {}, // Keep headers minimal for cached response
          config: config,
          isFromCache: true,
        });
      } else {
        console.warn(`[Offline Handler] No cached data found for ${config.url}.`);
        return Promise.reject(new Error(`Offline: No cached data available for ${config.url}.`));
      }
    } catch (error) {
      console.error(`[Offline Handler] Error retrieving data from localStorage for ${config.url}:`, error);
      return Promise.reject(new Error(`Offline: Error accessing cache for ${config.url}.`));
    }
  }
  // This part should ideally not be reached if called from api.js interceptor correctly
  return Promise.reject(new Error('handleOfflineGet called while online.'));
};


/**
 * Handles non-GET requests (POST, PUT, DELETE) during offline scenarios.
 * Queues the request to localStorage.
 *
 * @param {object} config The Axios request config.
 * @returns {Promise<object>} A promise that rejects, indicating the request is queued.
 */
export const handleOfflineMutation = async (config) => {
  const isOffline = !navigator.onLine; // Re-check, though api.js interceptor should also check

  if (isOffline) {
    console.log(`[Offline Handler] App is offline. Queuing request: ${config.method.toUpperCase()} ${config.url}`);
    const requestToQueue = {
      url: config.url, // Store relative URL, baseURL will be prefixed by axios/api instance
      method: config.method,
      data: config.data,
      headers: { // Only store essential headers
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers.Authorization, // Crucial for authenticated requests
        // Add any other critical custom headers your app uses
      },
      timestamp: new Date().toISOString(), // Optional: for debugging or TTL strategies
    };
    appendToLocalStorageQueue(requestToQueue);
    return Promise.reject(new Error(`Offline: Request ${config.method.toUpperCase()} ${config.url} has been queued.`));
  }
  // This part should ideally not be reached if called from api.js interceptor correctly
  return Promise.reject(new Error('handleOfflineMutation called while online.'));
};

/**
 * Caches response data for GET requests.
 * (Content from original file, no changes to this function in this step)
 * Conceptually, this would use useLocalStorage.
 *
 * @param {object} response The Axios response object.
 */
export const cacheGetResponse = (response) => {
  if (response && response.config && response.config.method === 'get' && response.status === 200) {
    try {
      // Use response.config.url as key for caching GET responses
      localStorage.setItem(response.config.url, JSON.stringify(response.data));
      console.log(`[Offline Handler] GET response for ${response.config.url} cached.`);
    } catch (error) {
      console.error(`[Offline Handler] Error caching GET response for ${response.config.url}:`, error);
    }
  }
};

/**
 * Checks the current online status.
 * @returns {boolean} True if offline, false otherwise.
 */
export const isCurrentlyOffline = () => {
  return !navigator.onLine;
};

/**
 * Processes the stored request queue when the app comes online.
 */
export const processRequestQueue = async () => {
  if (isCurrentlyOffline()) {
    console.log('[Offline Handler] App is still offline. Queue processing deferred.');
    return;
  }

  const queue = getLocalStorageQueue();
  if (queue.length === 0) {
    console.log('[Offline Handler] Request queue is empty. Nothing to process.');
    return;
  }

  console.log(`[Offline Handler] Processing ${queue.length} requests from the offline queue.`);

  const remainingQueue = [...queue]; // Work with a copy

  for (let i = 0; i < queue.length; i++) {
    const requestConfig = queue[i];
    try {
      console.log(`[Offline Handler] Attempting to send queued request: ${requestConfig.method.toUpperCase()} ${requestConfig.url}`);
      // IMPORTANT: Use a basic axios instance or configure one that WON'T re-trigger these offline interceptors.
      // For simplicity, using a new axios instance here.
      // Ensure baseURL is correctly prefixed if requestConfig.url is relative.
      // The original `api` instance from `api.js` might have interceptors that could cause loops.
      // A more robust solution might involve an axios instance specifically for queue processing.
      // Ensure baseURL is correctly prefixed. VITE_API_ENDPOINT is the base URL.
      const fullUrl = `${import.meta.env.VITE_API_ENDPOINT}${requestConfig.url.startsWith('/') ? '' : '/'}${requestConfig.url}`;
      const response = await axios({
        method: requestConfig.method,
        url: fullUrl,
        data: requestConfig.data,
        headers: requestConfig.headers,
        timeout: 15000, // Give queued requests a bit more time
      });

      console.log(`[Offline Handler] Queued request ${requestConfig.method.toUpperCase()} ${requestConfig.url} successful:`, response.status);
      // Remove from local copy of remainingQueue on success
      const indexInRemaining = remainingQueue.findIndex(r => r.timestamp === requestConfig.timestamp); // Assuming timestamp is unique enough
      if (indexInRemaining > -1) {
        remainingQueue.splice(indexInRemaining, 1);
      }
    } catch (error) {
      console.error(`[Offline Handler] Failed to send queued request ${requestConfig.method.toUpperCase()} ${requestConfig.url}:`, error.response?.data || error.message);
      // For this subtask, keep failed requests in the queue for the next attempt.
      // A more advanced implementation might have retry counts, backoff strategies, or move to a "dead letter queue".
    }
  }

  updateLocalStorageQueue(remainingQueue);
  if (remainingQueue.length === 0) {
    console.log('[Offline Handler] Offline request queue successfully processed and emptied.');
  } else {
    console.log(`[Offline Handler] ${remainingQueue.length} requests remain in the queue after processing attempt.`);
  }
};

// --- Setup online event listener ---
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Handler] Application came online. Attempting to process request queue.');
    processRequestQueue();
  });

  // Attempt to process queue on initial load as well, in case app was closed offline and reopened online
  // Or if there are items from a previous session.
  if (!isCurrentlyOffline()) {
     console.log('[Offline Handler] Application is online on load. Checking request queue.');
     processRequestQueue();
  } else {
    console.log('[Offline Handler] Application is offline on load. Queue processing deferred.');
  }
}
