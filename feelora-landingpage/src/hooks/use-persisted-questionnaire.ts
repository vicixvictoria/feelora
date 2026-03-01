import { useState, useEffect } from 'react';

// Custom hook to manage a multi-step questionnaire with persistence in localStorage
export function usePersistedQuestionnaire<T>(storageKey: string, initialData: T) {
  // 1. Initialize State (with error handling for SSR/Corrupt JSON)
  const [data, setData] = useState<T>(() => {
    if (typeof window === 'undefined') return initialData; // SSR guard
    try {
      const saved = window.localStorage.getItem(storageKey); // Load from localStorage
      return saved ? JSON.parse(saved) : initialData; // Parse or use initial data
    } catch (error) {
      console.error(`Error loading ${storageKey}:`, error);
      return initialData;
    }
  });

  // Step tracking
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const savedStep = window.localStorage.getItem(`${storageKey}_step`);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  // 2. Sync to LocalStorage on change
  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
    window.localStorage.setItem(`${storageKey}_step`, currentStep.toString());
  }, [data, currentStep, storageKey]);

  // 3. Helper functions to update fields and clear progress
  const updateField = (field: keyof T, value: T[keyof T]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const clearProgress = () => {
    // 1. Remove from browser storage
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(`${storageKey}_step`);

    // 2. Reset React state so it doesn't "re-save" old data
    setData(initialData);
    setCurrentStep(0);
  };

  return {
    data,
    currentStep,
    setCurrentStep,
    updateField,
    clearProgress,
  };
}
