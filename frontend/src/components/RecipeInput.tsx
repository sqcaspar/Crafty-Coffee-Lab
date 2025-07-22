import { useState, useEffect, useCallback } from 'react';
import { BeanInfo, BrewingParameters, MeasurementsInput, SensationRecord, RoastingLevel, BrewingMethod } from '../../../shared/src/types/recipe';
import { useRecipeValidation } from '../hooks/useRecipeValidation';
import { useFormDirtyState } from '../hooks/useFormDirtyState';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { recipeService, formatRecipeForSave } from '../services/recipeService';
import { useToast } from './ui/ToastContainer';
import { transformRecipeInput } from '../../../shared/src/validation/recipeSchema';
import TextInput from './forms/TextInput';
import NumberInput from './forms/NumberInput';
import Select from './forms/Select';
import RatingSlider from './forms/RatingSlider';
import TextArea from './forms/TextArea';
import ValidationSummary from './forms/ValidationSummary';
import TastingNotesPanel, { TastingNotesData } from './ui/TastingNotesPanel';
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

const initialFormData: FormData = {
  recipeName: '',
  isFavorite: false,
  collections: [],
  beanInfo: {
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
    turbulence: undefined,
    additionalNotes: undefined
  },
  measurements: {
    coffeeBeans: '' as any,
    water: '' as any,
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'edit' ? 'Edit Recipe' : 'Create New Recipe'}
              </h2>
              {isDirty && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                {mode === 'edit' 
                  ? 'Update your brewing parameters and tasting notes'
                  : 'Enter your brewing parameters and tasting notes'
                }
              </p>
              <div className="text-xs text-gray-400 space-x-2">
                <span>💾 Ctrl+S to save</span>
                <span>⎋ Esc to cancel</span>
              </div>
            </div>
            {mode === 'edit' && lastModified && (
              <p className="text-xs text-gray-500 mt-1">
                Last modified: {new Date(lastModified).toLocaleString()}
              </p>
            )}
          </div>
          {lastSaved && (
            <div className="text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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

      <div className="space-y-8">
        {/* Recipe Name */}
        <div className="pb-4 border-b border-gray-200">
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
            <p className="mt-2 text-sm text-gray-500">
              Auto-generated: <span className="font-medium">{generateRecipeName()}</span>
            </p>
          )}
        </div>

        {/* Bean Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bean Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInput
              id="origin"
              label="Origin"
              value={formData.beanInfo.origin}
              onChange={(value) => updateFormData('beanInfo.origin', value)}
              onBlur={(value) => handleFieldBlur('beanInfo.origin', value)}
              placeholder="e.g., Ethiopia, Colombia, Guatemala"
              required
              error={getFieldValidation('beanInfo.origin').error}
            />
            <TextInput
              id="processingMethod"
              label="Processing Method"
              value={formData.beanInfo.processingMethod}
              onChange={(value) => updateFormData('beanInfo.processingMethod', value)}
              onBlur={(value) => handleFieldBlur('beanInfo.processingMethod', value)}
              placeholder="e.g., Washed, Natural, Honey"
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
              <label htmlFor="roastingDate" className="block text-sm font-medium text-gray-700">
                Roasting Date
              </label>
              <input
                type="date"
                id="roastingDate"
                value={formData.beanInfo.roastingDate || ''}
                onChange={(e) => updateFormData('beanInfo.roastingDate', e.target.value || undefined)}
                max={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
        </div>

        {/* Brewing Parameters Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Brewing Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <NumberInput
              id="waterTemperature"
              label="Water Temperature"
              value={formData.brewingParameters.waterTemperature || ''}
              onChange={(value) => updateFormData('brewingParameters.waterTemperature', value === '' ? undefined : value)}
              unit="°C"
              placeholder="e.g., 93"
              min={60}
              max={100}
            />
            <Select
              id="brewingMethod"
              label="Brewing Method"
              value={formData.brewingParameters.brewingMethod || ''}
              onChange={(value) => updateFormData('brewingParameters.brewingMethod', value || undefined)}
              options={brewingMethodOptions}
              placeholder="Select brewing method"
            />
            <TextInput
              id="grinderModel"
              label="Grinder Model"
              value={formData.brewingParameters.grinderModel}
              onChange={(value) => updateFormData('brewingParameters.grinderModel', value)}
              onBlur={(value) => handleFieldBlur('brewingParameters.grinderModel', value)}
              placeholder="e.g., Baratza Encore"
              required
              error={getFieldValidation('brewingParameters.grinderModel').error}
            />
            <TextInput
              id="grinderUnit"
              label="Grinder Setting"
              value={formData.brewingParameters.grinderUnit}
              onChange={(value) => updateFormData('brewingParameters.grinderUnit', value)}
              onBlur={(value) => handleFieldBlur('brewingParameters.grinderUnit', value)}
              placeholder="e.g., Medium-coarse, Setting 20"
              required
              error={getFieldValidation('brewingParameters.grinderUnit').error}
            />
            <TextInput
              id="filteringTools"
              label="Filtering Tools"
              value={formData.brewingParameters.filteringTools || ''}
              onChange={(value) => updateFormData('brewingParameters.filteringTools', value || undefined)}
              placeholder="e.g., V60 filters, Metal mesh"
            />
            <TextInput
              id="turbulence"
              label="Turbulence"
              value={formData.brewingParameters.turbulence || ''}
              onChange={(value) => updateFormData('brewingParameters.turbulence', value || undefined)}
              placeholder="e.g., 3 stirs, gentle agitation"
            />
          </div>
          <div className="mt-4">
            <TextArea
              id="additionalNotes"
              label="Additional Notes"
              value={formData.brewingParameters.additionalNotes || ''}
              onChange={(value) => updateFormData('brewingParameters.additionalNotes', value || undefined)}
              placeholder="Any extra brewing notes, observations, or techniques used..."
              rows={3}
            />
          </div>
        </div>

        {/* Measurements Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Measurements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coffee-to-Water Ratio
              </label>
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800 font-medium">
                {coffeeWaterRatio || 'Enter coffee and water amounts'}
              </div>
            </div>
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
          </div>
        </div>

        {/* Enhanced Tasting Evaluation Section */}
        <div className="pb-6">
          <TastingNotesPanel
            data={{
              overallImpression: formData.sensationRecord.overallImpression === '' ? undefined : formData.sensationRecord.overallImpression,
              acidity: formData.sensationRecord.acidity,
              body: formData.sensationRecord.body,
              sweetness: formData.sensationRecord.sweetness,
              flavor: formData.sensationRecord.flavor,
              aftertaste: formData.sensationRecord.aftertaste,
              balance: formData.sensationRecord.balance,
              tastingNotes: formData.sensationRecord.tastingNotes
            }}
            onChange={(data: TastingNotesData) => {
              // Update all sensation record fields at once
              updateFormData('sensationRecord', {
                overallImpression: data.overallImpression,
                acidity: data.acidity,
                body: data.body,
                sweetness: data.sweetness,
                flavor: data.flavor,
                aftertaste: data.aftertaste,
                balance: data.balance,
                tastingNotes: data.tastingNotes
              });
              
              // Trigger validation for required overall impression
              if (data.overallImpression !== undefined) {
                handleFieldBlur('sensationRecord.overallImpression', data.overallImpression);
              }
            }}
            disabled={isLoading}
            showPresets={!isLoading}
          />
          {getFieldValidation('sensationRecord.overallImpression').error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {getFieldValidation('sensationRecord.overallImpression').error}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button"
            onClick={handleClearForm}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Form
          </button>
          <button 
            type="button"
            onClick={handleSaveRecipe}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && (
              <LoadingSpinner size="small" color="white" />
            )}
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
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="medium" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {loadingMessage}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
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