# Offline Mode Functionality

## Overview

The offline mode feature aims to enhance user experience when network connectivity is lost or unreliable. It provides mechanisms to inform the user about their offline status, serve cached data for read operations, and queue data modification requests until connectivity is restored. This ensures that users can continue to access some information and perform certain actions even without an active internet connection.

## Features Implemented

### 1. Global Offline Indicator
- **How it works:** A global banner is displayed at the top of the application when the browser detects an offline state.
- **Implementation:**
    - The `frontend/src/hooks/useOfflineStatus.js` hook listens to browser `online` and `offline` events to determine the connectivity status.
    - This hook is consumed by `frontend/src/components/Layout/AppLayout.jsx`, which conditionally renders the banner.
- **User Feedback:** The banner clearly states "You are currently offline. Some functionality may be limited."

### 2. GET Request Caching
- **Functionality:** Successful responses to GET requests are cached in the browser's `localStorage`. When the application is offline, subsequent identical GET requests are served from this cache.
- **Implementation:**
    - The response interceptor in `frontend/src/services/api.js` calls `cacheGetResponse` from `frontend/src/services/offlineApiHandler.js` for successful GET requests.
    - `cacheGetResponse` stores the response data in `localStorage`. The cache key is typically the relative URL of the request (e.g., `/patients`).
    - When offline, the request interceptor in `api.js` calls `handleOfflineGet` from `offlineApiHandler.js`. This function attempts to retrieve and return the cached data.
- **User Feedback:** Data is displayed as usual. Currently, there is no explicit UI indicator that displayed data is from cache (see Limitations).

### 3. Mutation Queuing (POST, PUT, DELETE)
- **Functionality:** When the application is offline, attempts to modify data via POST, PUT, or DELETE requests do not fail immediately. Instead, these requests are serialized and stored in a queue in `localStorage`.
- **Implementation:**
    - The request interceptor in `api.js` detects offline status for mutation requests and calls `handleOfflineMutation` from `offlineApiHandler.js`.
    - `handleOfflineMutation` constructs a request object (containing URL, method, data, essential headers, and a timestamp) and adds it to a queue stored under the `REQUEST_QUEUE_KEY` (`offlineRequestQueue`) in `localStorage`.
- **User Feedback:** The API call will appear to fail, and the promise will be rejected with a message indicating the request has been queued (e.g., "Offline: Request POST /patients has been queued."). UI components need to handle this error to inform the user.

### 4. Queue Processing
- **Functionality:** When the application regains network connectivity, the queued mutation requests are automatically processed and sent to the server.
- **Implementation:**
    - `offlineApiHandler.js` sets up a `window` event listener for the `'online'` event.
    - Upon this event (or if the app loads online with an existing queue), the `processRequestQueue` function is called.
    - `processRequestQueue` retrieves all requests from the `offlineRequestQueue` in `localStorage`.
    - It then attempts to send each request to the server using a direct `axios` call.
    - **`baseURL` Fix:** The `processRequestQueue` function was updated to prepend the `VITE_API_ENDPOINT` (the application's base API URL) to the stored relative URLs, ensuring requests are replayed to the correct absolute endpoint.
    - Successfully processed requests are removed from the queue. Failed requests currently remain in the queue for the next attempt.
- **User Feedback:** Console logs indicate queue processing status. No direct UI notifications for individual request success/failure during queue processing are implemented yet.

## Key Modules and Hooks

-   **`frontend/src/hooks/useOfflineStatus.js`**:
    -   A custom React hook that detects and provides the browser's online/offline status.
-   **`frontend/src/hooks/useLocalStorage.js`**:
    -   A custom React hook providing utility functions for interacting with `localStorage`, including queue-specific helpers like `appendToQueue`, `getQueue`, and `clearQueue`.
    -   *Note:* `offlineApiHandler.js` currently uses direct `localStorage` API calls for simplicity and to avoid React hook rule violations in a non-component module.
-   **`frontend/src/services/api.js`**:
    -   The central Axios instance used for API communication.
    -   Contains request and response interceptors that integrate the offline handling logic by calling functions from `offlineApiHandler.js`.
-   **`frontend/src/services/offlineApiHandler.js`**:
    -   The core module for offline functionality. It includes:
        -   Logic for caching GET responses (`cacheGetResponse`).
        -   Logic for retrieving GET responses from cache when offline (`handleOfflineGet`).
        -   Logic for queuing mutation requests when offline (`handleOfflineMutation`).
        -   Logic for processing the request queue when online (`processRequestQueue`).
        -   Management of the `localStorage` queue (`REQUEST_QUEUE_KEY`).

## User Experience

-   **Global Offline Banner:** Users are immediately informed of their offline status via a persistent banner.
-   **Cached Data Access:** Users can still view data that was previously fetched and cached, though they are not explicitly told it's cached via the UI (apart from developers seeing console logs).
-   **Queued Mutations:** Users attempting to save or delete data while offline will have their requests queued. The UI should ideally reflect the "pending" or "queued" state based on the error message from the API call.
-   **Developer Feedback:** Extensive console logging is in place for caching, queuing, and queue processing activities, aiding developers in monitoring and debugging.

## Limitations & Future Enhancements

-   **Component-Level Cache Feedback:**
    -   While data hooks like `usePatientData` have been made offline-aware (returning `isOffline` and `isDataFromCache`), this hook is not currently integrated into any UI components.
    -   **Enhancement:** Integrate `usePatientData` (and similar hooks for other features) into their respective UI components to display messages like "Displaying cached data, which might be outdated" or to handle offline errors more gracefully at the component level.
-   **Advanced Queue Management:**
    -   The current queue processing attempts to resend failed requests on the next "online" event. There's no limit to retries or sophisticated backoff strategy.
    -   **Enhancement:** Implement maximum retry counts for queued requests, exponential backoff delays, and potentially move persistently failing requests to a "dead letter queue" or notify the user.
-   **Conflict Resolution:**
    -   The system does not currently handle potential data conflicts (e.g., if data on the server was changed by another user while one user was offline and had a related mutation queued).
    -   **Enhancement:** This is a complex area. Solutions could range from "last write wins" (current implicit behavior) to more complex UI-driven conflict resolution strategies if critical.
-   **Service Workers:**
    -   For more comprehensive offline capabilities, including caching of static assets (JS, CSS, images) and true background synchronization, Service Workers are the standard technology.
    -   **Enhancement:** Implement a Service Worker to manage asset caching and potentially background sync for the request queue.
-   **Direct Hook Usage in `offlineApiHandler.js`:**
    -   `offlineApiHandler.js` uses direct browser APIs (`localStorage`, `navigator.onLine`, `window.addEventListener`) instead of the `useLocalStorage` and `useOfflineStatus` hooks. This is because it's a regular JavaScript module, not a React component or custom hook, and Axios interceptors are typically set up outside the React component lifecycle.
    -   **Enhancement:** If the Axios instance (`api.js`) were initialized within a React Context or a top-level component, it could be provided with functions/values derived from these hooks, allowing `offlineApiHandler.js` to be refactored to use them more directly or be structured as a hook itself.
-   **UI Feedback for Queue Processing:**
    -   Users currently don't get explicit UI notifications (e.g., toasts) about the status of queued requests being processed.
    -   **Enhancement:** Integrate a notification system to inform users when "Offline changes are now being synced" or if "Some offline changes failed to sync."

## Testing

-   The offline features have undergone manual simulation testing using browser developer tools to toggle connectivity.
-   Key scenarios tested include the visibility of the offline banner, caching of GET requests and retrieval from cache, and queuing of mutation requests with subsequent processing upon regaining connectivity.
-   A critical `baseURL` issue in `offlineApiHandler.js` for replaying queued requests was identified and fixed during the testing phase, ensuring requests are dispatched to the correct absolute API endpoints.
-   Conceptual unit test cases have been designed for `useOfflineStatus` and the various functions within `offlineApiHandler.js` to ensure their logic is sound.

This documentation provides an overview of the offline mode capabilities, its implementation details, and areas for future improvement.
