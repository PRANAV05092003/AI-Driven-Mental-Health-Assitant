import { useCallback, useEffect, useRef } from 'react';

type KeyCombo = {
  /**
   * The key to listen for (e.g., 'a', 'Enter', 'Escape')
   */
  key: string;
  
  /**
   * Whether the Ctrl key needs to be pressed
   * @default false
   */
  ctrl?: boolean;
  
  /**
   * Whether the Shift key needs to be pressed
   * @default false
   */
  shift?: boolean;
  
  /**
   * Whether the Alt/Option key needs to be pressed
   * @default false
   */
  alt?: boolean;
  
  /**
   * Whether the Meta/Command key needs to be pressed
   * @default false
   */
  meta?: boolean;
  
  /**
   * A custom function to determine if the key combo matches
   * Overrides the default key combination matching
   */
  match?: (event: KeyboardEvent) => boolean;
};

type ShortcutHandler = (event: KeyboardEvent) => void;

interface UseKeyboardShortcutOptions {
  /**
   * Whether the shortcut is currently enabled
   * @default true
   */
  enabled?: boolean;
  
  /**
   * The event target to attach the event listener to
   * @default window
   */
  target?: EventTarget | null;
  
  /**
   * The event type to listen for
   * @default 'keydown'
   */
  eventType?: 'keydown' | 'keyup' | 'keypress';
  
  /**
   * Whether to prevent the default browser behavior for the key event
   * @default true
   */
  preventDefault?: boolean;
  
  /**
   * Whether to stop event propagation
   * @default true
   */
  stopPropagation?: boolean;
  
  /**
   * Whether to listen for the event in the capture phase
   * @default false
   */
  capture?: boolean;
}

/**
 * A custom hook for handling keyboard shortcuts
 * @param shortcut The key combination to listen for
 * @param handler The function to call when the shortcut is triggered
 * @param options Additional options for the shortcut
 */
function useKeyboardShortcut(
  shortcut: string | KeyCombo,
  handler: ShortcutHandler,
  options: UseKeyboardShortcutOptions = {}
) {
  const {
    enabled = true,
    target = typeof window !== 'undefined' ? window : null,
    eventType = 'keydown',
    preventDefault = true,
    stopPropagation = true,
    capture = false,
  } = options;
  
  const savedHandler = useRef<ShortcutHandler>(handler);
  
  // Update the handler if it changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  // Parse the shortcut string into a KeyCombo object
  const parseShortcut = useCallback((shortcut: string | KeyCombo): KeyCombo => {
    if (typeof shortcut !== 'string') {
      return shortcut;
    }
    
    const parts = shortcut.toLowerCase().split('+').map(part => part.trim());
    const combo: KeyCombo = { key: '' };
    
    for (const part of parts) {
      switch (part) {
        case 'ctrl':
        case 'control':
          combo.ctrl = true;
          break;
        case 'shift':
          combo.shift = true;
          break;
        case 'alt':
        case 'option':
          combo.alt = true;
          break;
        case 'meta':
        case 'cmd':
        case 'command':
          combo.meta = true;
          break;
        default:
          combo.key = part;
      }
    }
    
    return combo;
  }, []);
  
  // Check if the event matches the shortcut
  const matchesShortcut = useCallback((event: KeyboardEvent, combo: KeyCombo) => {
    // If a custom match function is provided, use it
    if (combo.match) {
      return combo.match(event);
    }
    
    // Check if the key matches (case-insensitive)
    const keyMatches = 
      event.key.toLowerCase() === combo.key.toLowerCase() ||
      event.code.toLowerCase() === `key${combo.key.toLowerCase()}` ||
      event.key.toLowerCase() === combo.key.toLowerCase();
    
    if (!keyMatches) {
      return false;
    }
    
    // Check modifier keys
    return (
      (combo.ctrl === undefined || event.ctrlKey === !!combo.ctrl) &&
      (combo.shift === undefined || event.shiftKey === !!combo.shift) &&
      (combo.alt === undefined || event.altKey === !!combo.alt) &&
      (combo.meta === undefined || event.metaKey === !!combo.meta)
    );
  }, []);
  
  // Set up the event listener
  useEffect(() => {
    if (!enabled || !target) {
      return;
    }
    
    const combo = parseShortcut(shortcut);
    
    const handleKeyEvent = (event: KeyboardEvent) => {
      if (matchesShortcut(event, combo)) {
        if (preventDefault) {
          event.preventDefault();
        }
        
        if (stopPropagation) {
          event.stopPropagation();
        }
        
        savedHandler.current(event);
      }
    };
    
    target.addEventListener(eventType, handleKeyEvent as EventListener, capture);
    
    return () => {
      target.removeEventListener(eventType, handleKeyEvent as EventListener, capture);
    };
  }, [
    enabled,
    target,
    eventType,
    shortcut,
    parseShortcut,
    matchesShortcut,
    preventDefault,
    stopPropagation,
    capture,
  ]);
}

export default useKeyboardShortcut;

// Helper hook for common shortcuts
export function useKeyPress(
  key: string,
  handler: ShortcutHandler,
  options: Omit<UseKeyboardShortcutOptions, 'enabled'> & { enabled?: boolean } = {}
) {
  return useKeyboardShortcut(key, handler, options);
}

// Helper hook for Ctrl/Command + key shortcuts
export function useCtrlShortcut(
  key: string,
  handler: ShortcutHandler,
  options: Omit<UseKeyboardShortcutOptions, 'enabled'> & { enabled?: boolean } = {}
) {
  return useKeyboardShortcut(
    { key, ctrl: true },
    handler,
    options
  );
}

// Helper hook for global keyboard shortcuts
export function useGlobalShortcut(
  shortcut: string | KeyCombo,
  handler: ShortcutHandler,
  options: Omit<UseKeyboardShortcutOptions, 'target'> = {}
) {
  return useKeyboardShortcut(shortcut, handler, {
    ...options,
    target: typeof window !== 'undefined' ? window : null,
  });
}

// Helper hook for form submission on Enter key
export function useSubmitOnEnter(
  handler: (event: KeyboardEvent) => void,
  options: Omit<UseKeyboardShortcutOptions, 'enabled'> & { enabled?: boolean } = {}
) {
  return useKeyboardShortcut(
    { 
      key: 'Enter',
      match: (event) => 
        event.key === 'Enter' && 
        !event.ctrlKey && 
        !event.metaKey && 
        !event.shiftKey && 
        !event.altKey &&
        (event.target as HTMLElement)?.tagName !== 'TEXTAREA'
    },
    handler,
    options
  );
}
