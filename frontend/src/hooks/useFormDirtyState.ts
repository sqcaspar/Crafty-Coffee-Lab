import { useState, useEffect, useRef } from 'react';

interface UseFormDirtyStateOptions {
  initialData: any;
  currentData: any;
  onBeforeUnload?: (isDirty: boolean) => string | undefined;
  onNavigationAttempt?: (isDirty: boolean) => boolean; // return true to allow navigation
}

interface UseFormDirtyStateReturn {
  isDirty: boolean;
  markClean: () => void;
  markDirty: () => void;
  hasUnsavedChanges: () => boolean;
  confirmNavigation: () => boolean;
}

export function useFormDirtyState({
  initialData,
  currentData,
  onBeforeUnload,
  onNavigationAttempt
}: UseFormDirtyStateOptions): UseFormDirtyStateReturn {
  const [isDirty, setIsDirty] = useState(false);
  const initialDataRef = useRef(initialData);
  const hasBeenDirtyRef = useRef(false);

  // Update initial data reference when it changes (e.g., when loading new data for edit)
  useEffect(() => {
    initialDataRef.current = initialData;
    setIsDirty(false);
    hasBeenDirtyRef.current = false;
  }, [initialData]);

  // Check if form data has changed from initial state
  useEffect(() => {
    const dataChanged = JSON.stringify(currentData) !== JSON.stringify(initialDataRef.current);
    setIsDirty(dataChanged);
    
    if (dataChanged) {
      hasBeenDirtyRef.current = true;
    }
  }, [currentData]);

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && hasBeenDirtyRef.current) {
        const message = onBeforeUnload?.(isDirty) || 'You have unsaved changes. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, onBeforeUnload]);

  // Handle navigation attempts within the app
  useEffect(() => {
    const handlePopState = () => {
      if (isDirty && hasBeenDirtyRef.current) {
        const shouldContinue = onNavigationAttempt?.(isDirty) ?? true;
        if (!shouldContinue) {
          // Prevent navigation by pushing the current state back
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty, onNavigationAttempt]);

  const markClean = () => {
    setIsDirty(false);
    hasBeenDirtyRef.current = false;
    // Update the initial data to current data
    initialDataRef.current = currentData;
  };

  const markDirty = () => {
    setIsDirty(true);
    hasBeenDirtyRef.current = true;
  };

  const hasUnsavedChanges = () => {
    return isDirty && hasBeenDirtyRef.current;
  };

  const confirmNavigation = () => {
    if (!hasUnsavedChanges()) return true;
    
    return window.confirm('You have unsaved changes. Are you sure you want to leave?');
  };

  return {
    isDirty,
    markClean,
    markDirty,
    hasUnsavedChanges,
    confirmNavigation
  };
}

// Utility function to deeply compare objects (basic implementation)
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}