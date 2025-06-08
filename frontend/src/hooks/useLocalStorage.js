/**
 * Custom React hook to interact with localStorage.
 *
 * @param {string} key The key to use for localStorage.
 * @param {*} initialValue The initial value to use if the key is not found in localStorage.
 * @returns {{
 *   getItem: () => any,
 *   setItem: (value: any) => void,
 *   removeItem: () => void
 * }} An object containing functions to get, set, and remove the item from localStorage.
 *
 * @example
 * ```jsx
 * import useLocalStorage from './useLocalStorage';
 *
 * function MyComponent() {
 *   const { getItem, setItem, removeItem } = useLocalStorage('myKey', 'initialValue');
 *
 *   const value = getItem();
 *
 *   const updateValue = () => {
 *     setItem('newValue');
 *   };
 *
 *   const deleteValue = () => {
 *     removeItem();
 *   };
 *
 *   return (
 *     <div>
 *       <p>Value: {value}</p>
 *       <button onClick={updateValue}>Update Value</button>
 *       <button onClick={deleteValue}>Delete Value</button>
 *     </div>
 *   );
 * }
 * ```
 */
const useLocalStorage = (key, initialValue) => {
  /**
   * Retrieves an item from localStorage.
   *
   * @returns {*} The parsed item from localStorage, or the initialValue if not found or on error.
   */
  const getItem = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error getting item from localStorage for key "${key}":`, error);
      return initialValue;
    }
  };

  /**
   * Saves an item to localStorage.
   *
   * @param {*} value The value to save to localStorage.
   */
  const setItem = (value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage for key "${key}":`, error);
    }
  };

  /**
   * Removes an item from localStorage.
   */
  const removeItem = () => {
    try {
      window.localStorage.removeItem(key);
    } catch (error)      console.error(`Error removing item from localStorage for key "${key}":`, error);
    }
  };

  /**
   * Appends an item to a queue (array) in localStorage.
   *
   * @param {string} queueKey The localStorage key for the queue.
   * @param {*} item The item to add to the queue.
   */
  const appendToQueue = (queueKey, item) => {
    try {
      const currentQueueString = window.localStorage.getItem(queueKey);
      const currentQueue = currentQueueString ? JSON.parse(currentQueueString) : [];
      currentQueue.push(item);
      window.localStorage.setItem(queueKey, JSON.stringify(currentQueue));
    } catch (error) {
      console.error(`Error appending to queue in localStorage for key "${queueKey}":`, error);
    }
  };

  /**
   * Retrieves a queue (array) from localStorage.
   *
   * @param {string} queueKey The localStorage key for the queue.
   * @returns {Array} The queue, or an empty array if not found or on error.
   */
  const getQueue = (queueKey) => {
    try {
      const queueString = window.localStorage.getItem(queueKey);
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error(`Error getting queue from localStorage for key "${queueKey}":`, error);
      return [];
    }
  };

  /**
   * Clears a queue (removes it) from localStorage.
   *
   * @param {string} queueKey The localStorage key for the queue to clear.
   */
  const clearQueue = (queueKey) => {
    try {
      window.localStorage.removeItem(queueKey);
    } catch (error) {
      console.error(`Error clearing queue from localStorage for key "${queueKey}":`, error);
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    appendToQueue, // Added new function
    getQueue,      // Added new function
    clearQueue,    // Added new function
  };
};

export default useLocalStorage;
