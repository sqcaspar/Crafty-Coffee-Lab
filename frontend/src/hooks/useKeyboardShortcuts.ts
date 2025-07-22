import { useEffect, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  
  // Update shortcuts reference when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable;

      // Allow Ctrl+S even when typing
      const isGlobalShortcut = event.ctrlKey && event.key.toLowerCase() === 's';

      if (isTyping && !isGlobalShortcut) return;

      shortcutsRef.current.forEach(shortcut => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = (shortcut.ctrlKey ?? false) === event.ctrlKey;
        const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey;
        const altMatches = (shortcut.altKey ?? false) === event.altKey;
        const metaMatches = (shortcut.metaKey ?? false) === event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback(event);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return {
    shortcuts: shortcutsRef.current
  };
}

// Predefined common shortcuts
export const COMMON_SHORTCUTS = {
  SAVE: {
    key: 's',
    ctrlKey: true,
    description: 'Save (Ctrl+S)'
  },
  CANCEL: {
    key: 'Escape',
    description: 'Cancel (Escape)'
  },
  SUBMIT: {
    key: 'Enter',
    ctrlKey: true,
    description: 'Submit (Ctrl+Enter)'
  },
  UNDO: {
    key: 'z',
    ctrlKey: true,
    description: 'Undo (Ctrl+Z)'
  },
  REDO: {
    key: 'y',
    ctrlKey: true,
    description: 'Redo (Ctrl+Y)'
  },
  SELECT_ALL: {
    key: 'a',
    ctrlKey: true,
    description: 'Select All (Ctrl+A)'
  },
  FIND: {
    key: 'f',
    ctrlKey: true,
    description: 'Find (Ctrl+F)'
  },
  NEW: {
    key: 'n',
    ctrlKey: true,
    description: 'New (Ctrl+N)'
  },
  DELETE: {
    key: 'Delete',
    description: 'Delete'
  },
  EDIT: {
    key: 'e',
    ctrlKey: true,
    description: 'Edit (Ctrl+E)'
  }
} as const;

// Helper function to format shortcut for display
export function formatShortcut(shortcut: Partial<KeyboardShortcut>): string {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('Cmd');
  
  if (shortcut.key) {
    const key = shortcut.key === ' ' ? 'Space' : shortcut.key;
    parts.push(key.charAt(0).toUpperCase() + key.slice(1));
  }
  
  return parts.join('+');
}

// Helper to create keyboard shortcut hint component props
export function createShortcutHint(shortcut: Partial<KeyboardShortcut>) {
  return {
    title: shortcut.description || formatShortcut(shortcut),
    'data-shortcut': formatShortcut(shortcut)
  };
}