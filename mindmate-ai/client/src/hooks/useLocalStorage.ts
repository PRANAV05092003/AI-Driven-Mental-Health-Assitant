import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export interface UseLocalStorageOptions<T> {
  /**
   * The key under which the value is stored in localStorage
   */
  key: string;
  
  /**
   * The initial value to use if there is no value in localStorage
   */
  initialValue: T;
  
  /**
   * Whether to parse the stored value as JSON
   * @default true
   */
  parseJSON?: boolean;
  
  /**
   * Time to live in milliseconds
   * If provided, the value will be considered expired after this duration
   */
  ttl?: number;
  
  /**
   * Whether to sync changes across tabs
   * @default false
   */
  syncAcrossTabs?: boolean;
  
  /**
   * Callback when the value is read from localStorage
   */
  onInit?: (value: T) => void;
  
  /**
   * Callback when the value is updated
   */
  onUpdate?: (value: T) => void;
  
  /**
   * Callback when the value is removed
   */
  onRemove?: () => void;
}

/**
 * A custom hook to handle localStorage with type safety and expiration support
 * @param options Configuration options for the hook
 * @returns A tuple containing the stored value and a function to update it
 */
function useLocalStorage<T>(
  options: UseLocalStorageOptions<T>,
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    key,
    initialValue,
    parseJSON = true,
    ttl,
    syncAcrossTabs = false,
    onInit,
    onUpdate,
    onRemove,
  } = options;
  
  // Get the stored value from localStorage or use the initial value
  const getStoredValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      
      // If no item exists, return the initial value
      if (item === null) {
        return initialValue;
      }
      
      // Parse the JSON if needed
      const parsed = parseJSON ? JSON.parse(item) : item;
      
      // Check if the item has expired
      if (ttl && parsed?.__expiresAt && Date.now() > parsed.__expiresAt) {
        window.localStorage.removeItem(key);
        onRemove?.();
        return initialValue;
      }
      
      // Return the parsed value (without the __expiresAt property)
      return parsed?.__expiresAt ? parsed.value : parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, parseJSON, ttl, onRemove]);
  
  // State to store the current value
  const [storedValue, setStoredValue] = useState<T>(() => {
    const value = getStoredValue();
    onInit?.(value);
    return value;
  });
  
  // Update the stored value in localStorage and state
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const item = ttl
          ? JSON.stringify({
              value: valueToStore,
              __expiresAt: Date.now() + ttl,
            })
          : parseJSON
          ? JSON.stringify(valueToStore)
          : String(valueToStore);
        
        window.localStorage.setItem(key, item);
      }
      
      // Call the update callback
      onUpdate?.(valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, ttl, parseJSON, onUpdate]);
  
  // Remove the value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      // Reset the state
      setStoredValue(initialValue);
      
      // Remove from localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      
      // Call the remove callback
      onRemove?.();
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, onRemove]);
  
  // Handle storage events to sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== event.oldValue) {
        const newValue = getStoredValue();
        setStoredValue(newValue);
        onUpdate?.(newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, getStoredValue, onUpdate, syncAcrossTabs]);
  
  // Check for expired items on mount
  useEffect(() => {
    if (ttl) {
      const stored = getStoredValue();
      if (stored !== storedValue) {
        setStoredValue(stored);
      }
    }
  }, [getStoredValue, storedValue, ttl]);
  
  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
