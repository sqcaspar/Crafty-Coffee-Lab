import { useState, useEffect, useCallback } from 'react';
import { BeanInfo, BrewingParameters, TurbulenceInfo, MeasurementsInput, SensationRecord, RoastingLevel, BrewingMethod, TurbulenceStep } from '../shared/types/recipe';
import { COFFEE_ORIGIN_GROUPS, CoffeeOrigin } from '../../../shared/src/constants/coffeeOrigins';
import { PROCESSING_METHOD_OPTIONS, ProcessingMethod } from '../../../shared/src/constants/processingMethods';
import { WATER_TEMPERATURE_OPTIONS, parseTemperature } from '../../../shared/src/constants/waterTemperature';
import { GRINDER_MODEL_OPTIONS, OTHERS_VALUE } from '../../../shared/src/constants/grinderModels';
import { GRINDER_SETTING_OPTIONS } from '../../../shared/src/constants/grinderSettings';
import { FILTERING_TOOL_OPTIONS } from '../../../shared/src/constants/filteringTools';
import { useRecipeValidation } from '../hooks/useRecipeValidation';
import { useFormDirtyState } from '../hooks/useFormDirtyState';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { recipeService, formatRecipeForSave } from '../services/recipeService';
import { useToast } from './ui/ToastContainer';
import { transformRecipeInput } from '../../../shared/src/validation/recipeSchema';
import TextInput from './forms/TextInput';
import NumberInput from './forms/NumberInput';
import Select from './forms/Select';
import GroupedSelect from './forms/GroupedSelect';
import SelectWithCustom from './forms/SelectWithCustom';
import RatingSlider from './forms/RatingSlider';
import TextArea from './forms/TextArea';
import ValidationSummary from './forms/ValidationSummary';
import { TurbulenceSteps } from './forms/TurbulenceSteps';
import TabbedEvaluationPanel, { TastingNotesData } from './ui/TabbedEvaluationPanel';
import LoadingSpinner from './ui/LoadingSpinner';
import UnsavedChangesModal from './UnsavedChangesModal';

// Form props interface
interface RecipeInputProps {
  mode?: 'create' | 'edit';
  recipeId?: string;
  onSaveSuccess?: (recipeId: string) => void;
  onCancel?: () => void;
}

// Form data interface
interface FormData {
  recipeName: string;
  isFavorite: boolean;
  collections: string[];
  beanInfo: BeanInfo;
  brewingParameters: BrewingParameters;
  turbulenceInfo: TurbulenceInfo;
  measurements: MeasurementsInput;
  sensationRecord: SensationRecord;
}

// Options for select dropdowns
const roastingLevelOptions = [
  { value: RoastingLevel.LIGHT, label: 'Light' },
  { value: RoastingLevel.MEDIUM, label: 'Medium' },
  { value: RoastingLevel.DARK, label: 'Dark' },
  { value: RoastingLevel.CUSTOM, label: 'Custom' }
];

const brewingMethodOptions = [
  { value: BrewingMethod.POUR_OVER, label: 'Pour-over' },
  { value: BrewingMethod.FRENCH_PRESS, label: 'French Press' },
  { value: BrewingMethod.AEROPRESS, label: 'Aeropress' },
  { value: BrewingMethod.COLD_BREW, label: 'Cold Brew' }
];

// Coffee origin groups for grouped select
const coffeeOriginGroups = COFFEE_ORIGIN_GROUPS.map(group => ({
  label: group.continent,
  options: group.countries.map(country => ({
    value: country,
    label: country
  }))
}));

// Processing method options for select
const processingMethodOptions = PROCESSING_METHOD_OPTIONS.map(option => ({
  value: option.value,
  label: option.label
}));

const initialFormData: FormData = {
  recipeName: '',
  isFavorite: false,
  collections: [],
  beanInfo: {
    coffeeBeanBrand: undefined,
    origin: '',
    processingMethod: '',
    altitude: undefined,
    roastingDate: undefined,
    roastingLevel: undefined
  },
  brewingParameters: {
    waterTemperature: undefined,
    brewingMethod: undefined,
    grinderModel: '',
    grinderUnit: '',
    filteringTools: undefined,
    additionalNotes: undefined
  },
  turbulenceInfo: {
    turbulence: undefined
  },
  measurements: {
    coffeeBeans: '' as any,
    water: '' as any,
    brewedCoffeeWeight: undefined,
    tds: undefined,
    extractionYield: undefined
  },
  sensationRecord: {
    overallImpression: '' as any,
    acidity: undefined,
    body: undefined,
    sweetness: undefined,
    flavor: undefined,
    aftertaste: undefined,
    balance: undefined,
    tastingNotes: undefined
  }
};

const DRAFT_KEY = 'coffeeTracker_recipeDraft';

// Helper functions for turbulence data conversion
const convertTurbulenceToSteps = (turbulence?: string | TurbulenceStep[]): TurbulenceStep[] => {
  if (!turbulence) {
    return [{ actionTime: '0:00', actionDetails: '', volume: '' }];
  }
  
  if (Array.isArray(turbulence)) {
    return turbulence.length > 0 ? turbulence : [{ actionTime: '0:00', actionDetails: '', volume: '' }];
  }
  
  // Convert legacy string to single step
  return [{ actionTime: '0:00', actionDetails: turbulence, volume: '' }];
};

const convertStepsToTurbulence = (steps: TurbulenceStep[]): TurbulenceStep[] => {
  return steps.filter(step => 
    step.actionTime.trim() !== '' || 
    step.actionDetails.trim() !== '' || 
    step.volume.trim() !== ''
  );
};

// SCA Extraction Yield calculation function
const calculateExtractionYield = (brewedWeight: number, tds: number, coffeeWeight: number): number => {
  if (!brewedWeight || !tds || !coffeeWeight || brewedWeight <= 0 || tds <= 0 || coffeeWeight <= 0) {
    return 0;
  }
  // SCA Formula: Extraction Yield (%) = (Brewed Coffee Weight (g) × TDS (%)) / Coffee Beans (g)
  const extractionYield = (brewedWeight * tds) / coffeeWeight;
  return Math.round(extractionYield * 100) / 100; // Round to 2 decimal places
};

export default function RecipeInput({ 
  mode = 'create', 
  recipeId, 
  onSaveSuccess,
  onCancel 
}: RecipeInputProps = {}) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [initialFormState, setInitialFormState] = useState<FormData>(initialFormData);
  const [coffeeWaterRatio, setCoffeeWaterRatio] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [turbulenceSteps, setTurbulenceSteps] = useState<TurbulenceStep[]>([{ actionTime: '0:00', actionDetails: '', volume: '' }]);
  
  // Initialize validation hook
  const { 
    updateFieldValidation, 
    validateForm, 
    getFieldValidation, 
    hasAttemptedSubmit,
    clearValidation 
  } = useRecipeValidation();

  // Initialize toast notifications
  const { showSuccess, showError, showInfo } = useToast();

  // Initialize form dirty state tracking
  const { isDirty, markClean, hasUnsavedChanges } = useFormDirtyState({
    initialData: initialFormState,
    currentData: formData,
    onBeforeUnload: (isDirty) => isDirty ? 'You have unsaved changes. Are you sure you want to leave?' : undefined
  });

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...COMMON_SHORTCUTS.SAVE,
        callback: (e) => {
          e.preventDefault();
          handleSaveRecipe();
        }
      },
      {
        ...COMMON_SHORTCUTS.CANCEL,
        callback: () => {
          if (hasUnsavedChanges()) {
            setShowUnsavedChangesModal(true);
          } else {
            onCancel?.();
          }
        }
      }
    ],
    enabled: !isLoading
  });

  // Load existing recipe for edit mode
  useEffect(() => {
    const loadRecipe = async () => {
      if (mode === 'edit' && recipeId) {
        setIsLoading(true);
        setLoadingMessage('Loading recipe...');

        try {
          const response = await recipeService.getRecipe(recipeId);
          
          if (response.success && response.data) {
            const recipe = response.data;
            
            // Convert recipe to form data format
            const loadedFormData: FormData = {
              recipeName: recipe.recipeName,
              isFavorite: recipe.isFavorite,
              collections: recipe.collections,
              beanInfo: recipe.beanInfo,
              brewingParameters: recipe.brewingParameters,
              measurements: {
                coffeeBeans: recipe.measurements.coffeeBeans,
                water: recipe.measurements.water,
                brewedCoffeeWeight: recipe.measurements.brewedCoffeeWeight,
                tds: recipe.measurements.tds,
                extractionYield: recipe.measurements.extractionYield,
              },
              sensationRecord: recipe.sensationRecord,
            };

            setFormData(loadedFormData);
            setInitialFormState(loadedFormData);
            setLastModified(recipe.dateModified);
            
            // Calculate coffee-to-water ratio
            if (recipe.measurements.coffeeBeans && recipe.measurements.water) {
              const ratio = recipe.measurements.water / recipe.measurements.coffeeBeans;
              setCoffeeWaterRatio(`1:${ratio.toFixed(1)}`);
            }

          } else {
            showError('Failed to Load Recipe', response.error || 'Recipe not found.');
            onCancel?.();
          }
        } catch (error) {
          console.error('Error loading recipe:', error);
          showError('Failed to Load Recipe', 'An unexpected error occurred.');
          onCancel?.();
        } finally {
          setIsLoading(false);
          setLoadingMessage('');
        }
      }
    };

    loadRecipe();
  }, [mode, recipeId, onCancel, showError]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setFormData(draft.formData);
        setLastSaved(new Date(draft.timestamp));
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, []);

  // Auto-save draft every 30 seconds and when form changes
  useEffect(() => {
    const saveDraft = () => {
      try {
        const draft = {
          formData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    };

    // Save immediately when form changes (debounced)
    const timeoutId = setTimeout(saveDraft, 1000);
    
    // Also save every 30 seconds
    const intervalId = setInterval(saveDraft, 30000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [formData]);
  
  // Auto-generate recipe name
  const generateRecipeName = useCallback(() => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const origin = formData.beanInfo?.origin || 'Coffee';
    const method = formData.brewingParameters?.brewingMethod 
      ? brewingMethodOptions.find(opt => opt.value === formData.brewingParameters.brewingMethod)?.label
      : 'Recipe';
    
    return `${origin} ${method} - ${timestamp}`;
  }, [formData.beanInfo?.origin, formData.brewingParameters?.brewingMethod]);

  // Auto-calculate coffee-to-water ratio
  useEffect(() => {
    const { coffeeBeans, water } = formData.measurements;
    if (typeof coffeeBeans === 'number' && typeof water === 'number' && water > 0) {
      const ratio = water / coffeeBeans;
      setCoffeeWaterRatio(`1:${ratio.toFixed(1)}`);
    } else {
      setCoffeeWaterRatio('');
    }
  }, [formData.measurements.coffeeBeans, formData.measurements.water]);

  // Sync turbulence steps when formData changes (for edit mode)
  useEffect(() => {
    const steps = convertTurbulenceToSteps(formData.turbulenceInfo.turbulence);
    setTurbulenceSteps(steps);
  }, [formData.turbulenceInfo.turbulence]);

  // Auto-calculate extraction yield using SCA formula
  useEffect(() => {
    const { brewedCoffeeWeight, tds, coffeeBeans } = formData.measurements;
    if (typeof brewedCoffeeWeight === 'number' && typeof tds === 'number' && typeof coffeeBeans === 'number') {
      const calculatedYield = calculateExtractionYield(brewedCoffeeWeight, tds, coffeeBeans);
      if (calculatedYield > 0 && calculatedYield !== formData.measurements.extractionYield) {
        updateFormData('measurements.extractionYield', calculatedYield);
      }
    }
  }, [formData.measurements.brewedCoffeeWeight, formData.measurements.tds, formData.measurements.coffeeBeans]);

  // Update form data with validation
  const updateFormData = (path: string, value: any, shouldValidate = false) => {
    const newFormData = { ...formData };
    const keys = path.split('.');
    let current: any = newFormData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (key && !current[key]) {
        current[key] = {};
      }
      if (key && current[key]) {
        current[key] = { ...current[key] };
        current = current[key];
      }
    }
    
    const finalKey = keys[keys.length - 1];
    if (finalKey && current) {
      current[finalKey] = value;
    }
    
    setFormData(newFormData);
    
    // Validate field if requested or if form has been submitted
    if (shouldValidate || hasAttemptedSubmit) {
      updateFieldValidation(path, value, newFormData);
    }
    
    // Hide validation summary when user starts correcting errors
    if (showValidationSummary) {
      setShowValidationSummary(false);
    }
  };

  // Handle field blur events for validation
  const handleFieldBlur = (path: string, value: any) => {
    updateFieldValidation(path, value, formData);
  };

  // Clear form and draft
  const handleClearForm = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChangesModal(true);
    } else {
      clearForm();
    }
  };

  const clearForm = () => {
    setFormData(initialFormData);
    setInitialFormState(initialFormData);
    setCoffeeWaterRatio('');
    setLastSaved(null);
    setShowValidationSummary(false);
    setValidationErrors([]);
    localStorage.removeItem(DRAFT_KEY);
    clearValidation();
  };

  // Handle unsaved changes modal actions
  const handleSaveAndContinue = async () => {
    await handleSaveRecipe();
    setShowUnsavedChangesModal(false);
  };

  const handleDiscardChanges = () => {
    if (mode === 'edit') {
      // Reset to initial loaded state
      setFormData(initialFormState);
      markClean();
    } else {
      // Clear form completely
      clearForm();
    }
    setShowUnsavedChangesModal(false);
    onCancel?.();
  };

  const handleCancelUnsavedModal = () => {
    setShowUnsavedChangesModal(false);
  };

  // Clear draft after successful save
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setLastSaved(null);
  }, []);

  // Save form with validation and API integration
  const handleSaveRecipe = async () => {
    // Validate entire form
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setShowValidationSummary(true);
      
      // Focus on first invalid field
      const firstInvalidField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    // Start loading state
    setIsLoading(true);
    setLoadingMessage('Saving recipe...');

    try {
      // Prepare recipe data for API
      const recipeName = formData.recipeName.trim() || generateRecipeName();
      const recipeData = {
        ...formData,
        recipeName,
      };

      // Clean and format data
      const cleanedData = formatRecipeForSave(recipeData);
      
      // Transform data using shared validation
      const transformedData = transformRecipeInput(cleanedData);

      // Save to API (create or update based on mode)
      let response;
      if (mode === 'edit' && recipeId) {
        response = await recipeService.updateRecipe(recipeId, transformedData, {
          timeout: 20000,
          retries: 2
        });
      } else {
        response = await recipeService.createRecipe(transformedData, {
          timeout: 20000,
          retries: 2
        });
      }

      if (response.success) {
        // Success - show appropriate message based on mode
        const isEdit = mode === 'edit';
        showSuccess(
          isEdit ? 'Recipe Updated Successfully!' : 'Recipe Saved Successfully!', 
          `"${transformedData.recipeName}" has been ${isEdit ? 'updated' : 'saved to your collection'}.`
        );

        // Clear validation state
        clearValidation();
        setShowValidationSummary(false);
        setValidationErrors([]);

        // Mark form as clean (no unsaved changes)
        markClean();

        if (isEdit) {
          // For edit mode, update initial form state and call callback
          setInitialFormState(formData);
          onSaveSuccess?.(recipeId!);
        } else {
          // For create mode, clear form and draft
          clearDraft();
          setFormData(initialFormData);
          setInitialFormState(initialFormData);
          setCoffeeWaterRatio('');
          
          // Show info about viewing the recipe
          showInfo('View Recipe', 'Switch to the Recipes tab to see your saved recipe.');
        }
        
      } else {
        // API returned error
        showError(
          'Failed to Save Recipe',
          response.error || 'Please check your connection and try again.'
        );
      }

    } catch (error) {
      // Unexpected error
      console.error('Unexpected error saving recipe:', error);
      showError(
        'Unexpected Error',
        'An unexpected error occurred while saving. Please try again.'
      );
    } finally {
      // Clear loading state
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Warning before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (lastSaved && formData !== initialFormData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [lastSaved, formData]);

  // Accordion state management
  const [activePanel, setActivePanel] = useState<string>('basic');
  
  const togglePanel = (panelId: string) => {
    setActivePanel(activePanel === panelId ? '' : panelId);
  };

  // Accordion panel configuration
  const accordionPanels = [
    { 
      id: 'basic', 
      title: 'Bean Information', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    { 
      id: 'brewing', 
      title: 'Brewing Parameters', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 'turbulence', 
      title: 'Turbulence', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'measurements', 
      title: 'Measurements', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    { 
      id: 'tasting', 
      title: 'Tasting Evaluation', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="container-mono">
      <div className="card-mono">
        {/* Header Section */}
        <div className="mb-section">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="heading-xl text-mono-900">
                  {mode === 'edit' ? 'Edit Recipe' : 'Create New Recipe'}
                </h1>
                {isDirty && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-caption font-medium bg-stone-100 text-stone-700 border border-stone-200">
                    <div className="w-2 h-2 bg-stone-400 rounded-full mr-2 animate-pulse"></div>
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                <p className="text-body text-mono-600">
                  {mode === 'edit' 
                    ? 'Update your brewing parameters and tasting notes'
                    : 'Enter your brewing parameters and tasting notes'
                  }
                </p>
                <div className="flex items-center space-x-4 text-caption text-mono-400">
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Ctrl+S to save</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Esc to cancel</span>
                  </span>
                </div>
              </div>
              {mode === 'edit' && lastModified && (
                <p className="text-caption text-mono-500 mt-2">
                  Last modified: {new Date(lastModified).toLocaleString()}
                </p>
              )}
            </div>
            {lastSaved && (
              <div className="text-body-sm text-mono-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-mono-400 rounded-full animate-pulse"></div>
                  <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Summary */}
        <ValidationSummary 
          errors={validationErrors}
          isVisible={showValidationSummary}
          onClose={() => setShowValidationSummary(false)}
        />

        {/* Recipe Name - Outside Accordion */}
        <div className="mb-section">
          <TextInput
            id="recipeName"
            label="Recipe Name"
            value={formData.recipeName}
            onChange={(value) => updateFormData('recipeName', value)}
            onBlur={(value) => handleFieldBlur('recipeName', value)}
            placeholder="Leave blank for auto-generated name"
            maxLength={200}
            error={getFieldValidation('recipeName').error}
          />
          {!formData.recipeName && (
            <p className="mt-2 text-body-sm text-mono-500">
              Auto-generated: <span className="font-medium text-mono-700">{generateRecipeName()}</span>
            </p>
          )}
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">{accordionPanels.map((panel) => (
            <div
              key={panel.id}
              className="border border-mono-200 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:border-mono-300"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => togglePanel(panel.id)}
                className="w-full px-6 py-4 bg-mono-50 hover:bg-mono-100 flex items-center justify-between text-left transition-colors duration-200 focus-mono"
                aria-expanded={activePanel === panel.id}
                aria-controls={`panel-${panel.id}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-mono-600">{panel.icon}</span>
                  <h3 className="heading-md text-mono-900">{panel.title}</h3>
                </div>
                <svg
                  className={`w-5 h-5 text-mono-600 transition-transform duration-300 ease-in-out ${
                    activePanel === panel.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Accordion Content */}
              <div
                id={`panel-${panel.id}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activePanel === panel.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
                style={{
                  transitionProperty: 'max-height, opacity',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="p-6 bg-mono-white border-t border-mono-200">
                  {panel.id === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <TextInput
                        id="coffeeBeanBrand"
                        label="Coffee Bean Brand"
                        value={formData.beanInfo.coffeeBeanBrand || ''}
                        onChange={(value) => updateFormData('beanInfo.coffeeBeanBrand', value === '' ? undefined : value)}
                        onBlur={(value) => handleFieldBlur('beanInfo.coffeeBeanBrand', value)}
                        placeholder="Enter coffee bean brand or producer..."
                        error={getFieldValidation('beanInfo.coffeeBeanBrand').error}
                      />
                      <GroupedSelect
                        id="origin"
                        label="Origin"
                        value={formData.beanInfo.origin}
                        onChange={(value) => updateFormData('beanInfo.origin', value)}
                        onBlur={(value) => handleFieldBlur('beanInfo.origin', value)}
                        groups={coffeeOriginGroups}
                        placeholder="Select coffee origin country..."
                        required
                        error={getFieldValidation('beanInfo.origin').error}
                      />
                      <Select
                        id="processingMethod"
                        label="Processing Method"
                        value={formData.beanInfo.processingMethod}
                        onChange={(value) => updateFormData('beanInfo.processingMethod', value)}
                        options={processingMethodOptions}
                        placeholder="Select processing method..."
                        required
                        error={getFieldValidation('beanInfo.processingMethod').error}
                      />
                      <NumberInput
                        id="altitude"
                        label="Altitude"
                        value={formData.beanInfo.altitude || ''}
                        onChange={(value) => updateFormData('beanInfo.altitude', value === '' ? undefined : value)}
                        unit="meters"
                        placeholder="e.g., 1200"
                        min={0}
                      />
                      <div>
                        <label htmlFor="roastingDate" className="block text-body-sm font-medium text-mono-700 mb-2">
                          Roasting Date
                        </label>
                        <input
                          type="date"
                          id="roastingDate"
                          value={formData.beanInfo.roastingDate || ''}
                          onChange={(e) => updateFormData('beanInfo.roastingDate', e.target.value || undefined)}
                          max={new Date().toISOString().split('T')[0]}
                          className="input-mono"
                        />
                      </div>
                      <Select
                        id="roastingLevel"
                        label="Roasting Level"
                        value={formData.beanInfo.roastingLevel || ''}
                        onChange={(value) => updateFormData('beanInfo.roastingLevel', value || undefined)}
                        options={roastingLevelOptions}
                        placeholder="Select roasting level"
                      />
                    </div>
                  )}

                  {panel.id === 'brewing' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Select
                          id="waterTemperature"
                          label="Water Temperature"
                          value={formData.brewingParameters.waterTemperature?.toString() || ''}
                          onChange={(value) => updateFormData('brewingParameters.waterTemperature', parseTemperature(value))}
                          options={WATER_TEMPERATURE_OPTIONS}
                          placeholder="Select temperature..."
                        />
                        <Select
                          id="brewingMethod"
                          label="Brewing Method"
                          value={formData.brewingParameters.brewingMethod || ''}
                          onChange={(value) => updateFormData('brewingParameters.brewingMethod', value || undefined)}
                          options={brewingMethodOptions}
                          placeholder="Select brewing method"
                        />
                        <SelectWithCustom
                          id="grinderModel"
                          label="Grinder Model"
                          value={formData.brewingParameters.grinderModel}
                          onChange={(value) => updateFormData('brewingParameters.grinderModel', value)}
                          onBlur={(value) => handleFieldBlur('brewingParameters.grinderModel', value)}
                          options={GRINDER_MODEL_OPTIONS}
                          othersValue={OTHERS_VALUE}
                          placeholder="Select grinder model..."
                          customPlaceholder="Enter custom grinder model..."
                          customLabel="Custom Grinder Model"
                          required
                          error={getFieldValidation('brewingParameters.grinderModel').error}
                        />
                        <Select
                          id="grinderUnit"
                          label="Grinder Setting"
                          value={formData.brewingParameters.grinderUnit}
                          onChange={(value) => updateFormData('brewingParameters.grinderUnit', value)}
                          options={GRINDER_SETTING_OPTIONS}
                          placeholder="Select grinder setting..."
                          required
                          error={getFieldValidation('brewingParameters.grinderUnit').error}
                        />
                        <Select
                          id="filteringTools"
                          label="Filtering Tools"
                          value={formData.brewingParameters.filteringTools || ''}
                          onChange={(value) => updateFormData('brewingParameters.filteringTools', value || undefined)}
                          options={FILTERING_TOOL_OPTIONS}
                          placeholder="Select filter type..."
                        />
                      </div>
                      <div className="mt-6">
                        <TextArea
                          id="additionalNotes"
                          label="Additional Notes"
                          value={formData.brewingParameters.additionalNotes || ''}
                          onChange={(value) => updateFormData('brewingParameters.additionalNotes', value || undefined)}
                          placeholder="Any extra brewing notes, observations, or techniques used..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {panel.id === 'turbulence' && (
                    <div>
                      <TurbulenceSteps
                        value={turbulenceSteps}
                        onChange={(steps) => {
                          setTurbulenceSteps(steps);
                          const filteredSteps = convertStepsToTurbulence(steps);
                          updateFormData('turbulenceInfo.turbulence', filteredSteps.length > 0 ? filteredSteps : undefined);
                        }}
                        error={getFieldValidation('turbulenceInfo.turbulence').error}
                      />
                    </div>
                  )}

                  {panel.id === 'measurements' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <NumberInput
                        id="coffeeBeans"
                        label="Coffee Beans"
                        value={formData.measurements.coffeeBeans}
                        onChange={(value) => updateFormData('measurements.coffeeBeans', value)}
                        onBlur={(value) => handleFieldBlur('measurements.coffeeBeans', value)}
                        unit="g"
                        placeholder="e.g., 25"
                        min={0}
                        required
                        error={getFieldValidation('measurements.coffeeBeans').error}
                      />
                      <NumberInput
                        id="water"
                        label="Water"
                        value={formData.measurements.water}
                        onChange={(value) => updateFormData('measurements.water', value)}
                        onBlur={(value) => handleFieldBlur('measurements.water', value)}
                        unit="g"
                        placeholder="e.g., 400"
                        min={0}
                        required
                        error={getFieldValidation('measurements.water').error}
                      />
                      <div>
                        <label className="block text-body-sm font-medium text-mono-700 mb-2">
                          Coffee-to-Water Ratio
                        </label>
                        <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium">
                          {coffeeWaterRatio || 'Enter coffee and water amounts'}
                        </div>
                      </div>
                      <NumberInput
                        id="brewedCoffeeWeight"
                        label="Brewed Coffee Weight"
                        value={formData.measurements.brewedCoffeeWeight || ''}
                        onChange={(value) => updateFormData('measurements.brewedCoffeeWeight', value === '' ? undefined : value)}
                        onBlur={(value) => handleFieldBlur('measurements.brewedCoffeeWeight', value === '' ? undefined : value)}
                        unit="g"
                        placeholder="e.g., 320"
                        min={0}
                        max={1000}
                        step={0.1}
                        error={getFieldValidation('measurements.brewedCoffeeWeight').error}
                      />
                      <NumberInput
                        id="tds"
                        label="TDS"
                        value={formData.measurements.tds || ''}
                        onChange={(value) => updateFormData('measurements.tds', value === '' ? undefined : value)}
                        unit="%"
                        placeholder="e.g., 1.35"
                        min={0}
                        max={5}
                        step={0.01}
                      />
                      <div>
                        <NumberInput
                          id="extractionYield"
                          label="Extraction Yield"
                          value={formData.measurements.extractionYield || ''}
                          onChange={(value) => updateFormData('measurements.extractionYield', value === '' ? undefined : value)}
                          unit="%"
                          placeholder="e.g., 20"
                          min={0}
                          max={30}
                          step={0.1}
                        />
                        {formData.measurements.brewedCoffeeWeight && formData.measurements.tds && formData.measurements.coffeeBeans && (
                          <p className="text-xs text-gray-600 mt-1">
                            Auto-calculated using SCA formula: (Brewed Weight × TDS) ÷ Coffee Beans
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {panel.id === 'tasting' && (
                    <>
                      <TabbedEvaluationPanel
                        value={formData.sensationRecord}
                        onChange={(updatedSensationRecord) => {
                          updateFormData('sensationRecord', updatedSensationRecord);
                        }}
                        onBlur={handleFieldBlur}
                      />
                      {getFieldValidation('sensationRecord.overallImpression').error && (
                        <div className="mt-4 p-4 bg-mono-100 border border-mono-300 rounded-lg">
                          <p className="text-body-sm text-mono-700">
                            {getFieldValidation('sensationRecord.overallImpression').error}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}</div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-section border-t border-mono-200">
          <button 
            type="button"
            onClick={handleClearForm}
            disabled={isLoading}
            className="btn-mono-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear Form</span>
          </button>
          <button 
            type="button"
            onClick={handleSaveRecipe}
            disabled={isLoading}
            className="btn-mono-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <LoadingSpinner size="small" color="white" />
            )}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>
              {isLoading 
                ? (mode === 'edit' ? 'Updating...' : 'Saving...') 
                : (mode === 'edit' ? 'Update Recipe' : 'Save Recipe')
              }
            </span>
          </button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-mono-900 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="card-mono max-w-sm mx-4 shadow-xl">
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="medium" />
                <div>
                  <h3 className="heading-md text-mono-900">
                    {loadingMessage}
                  </h3>
                  <p className="text-body-sm text-mono-600 mt-1">
                    Please don't close this window...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Modal */}
        <UnsavedChangesModal
          isOpen={showUnsavedChangesModal}
          onSave={handleSaveAndContinue}
          onDiscard={handleDiscardChanges}
          onCancel={handleCancelUnsavedModal}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}