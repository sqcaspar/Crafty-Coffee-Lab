import { useState, useCallback, useMemo } from 'react';
import { ZodError, ZodIssue } from 'zod';
import { 
  RecipeInputSchema, 
  BeanInfoSchema, 
  BrewingParametersSchema, 
  MeasurementsInputSchema, 
  SensationRecordSchema,
  // Individual field schemas for isolated validation
  OriginFieldSchema,
  ProcessingMethodFieldSchema,
  AltitudeFieldSchema,
  RoastingDateFieldSchema,
  RoastingLevelFieldSchema,
  WaterTemperatureFieldSchema,
  BrewingMethodFieldSchema,
  GrinderModelFieldSchema,
  GrinderUnitFieldSchema,
  FilteringToolsFieldSchema,
  TurbulenceFieldSchema,
  AdditionalNotesFieldSchema,
  CoffeeBeansFieldSchema,
  WaterFieldSchema,
  TdsFieldSchema,
  ExtractionYieldFieldSchema,
  OverallImpressionFieldSchema,
  AcidityFieldSchema,
  BodyFieldSchema,
  SweetnessFieldSchema,
  FlavorFieldSchema,
  AftertasteFieldSchema,
  BalanceFieldSchema,
  TastingNotesFieldSchema
} from '../../../shared/src/validation/recipeSchema';

// Individual field validation result
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Form section validation results
export interface ValidationState {
  recipeName: FieldValidationResult;
  beanInfo: {
    origin: FieldValidationResult;
    processingMethod: FieldValidationResult;
    altitude: FieldValidationResult;
    roastingDate: FieldValidationResult;
    roastingLevel: FieldValidationResult;
  };
  brewingParameters: {
    waterTemperature: FieldValidationResult;
    brewingMethod: FieldValidationResult;
    grinderModel: FieldValidationResult;
    grinderUnit: FieldValidationResult;
    filteringTools: FieldValidationResult;
    turbulence: FieldValidationResult;
    additionalNotes: FieldValidationResult;
  };
  measurements: {
    coffeeBeans: FieldValidationResult;
    water: FieldValidationResult;
    tds: FieldValidationResult;
    extractionYield: FieldValidationResult;
  };
  sensationRecord: {
    overallImpression: FieldValidationResult;
    acidity: FieldValidationResult;
    body: FieldValidationResult;
    sweetness: FieldValidationResult;
    flavor: FieldValidationResult;
    aftertaste: FieldValidationResult;
    balance: FieldValidationResult;
    tastingNotes: FieldValidationResult;
  };
}

// Create initial validation state (all valid)
const createInitialValidationState = (): ValidationState => ({
  recipeName: { isValid: true },
  beanInfo: {
    origin: { isValid: true },
    processingMethod: { isValid: true },
    altitude: { isValid: true },
    roastingDate: { isValid: true },
    roastingLevel: { isValid: true }
  },
  brewingParameters: {
    waterTemperature: { isValid: true },
    brewingMethod: { isValid: true },
    grinderModel: { isValid: true },
    grinderUnit: { isValid: true },
    filteringTools: { isValid: true },
    turbulence: { isValid: true },
    additionalNotes: { isValid: true }
  },
  measurements: {
    coffeeBeans: { isValid: true },
    water: { isValid: true },
    tds: { isValid: true },
    extractionYield: { isValid: true }
  },
  sensationRecord: {
    overallImpression: { isValid: true },
    acidity: { isValid: true },
    body: { isValid: true },
    sweetness: { isValid: true },
    flavor: { isValid: true },
    aftertaste: { isValid: true },
    balance: { isValid: true },
    tastingNotes: { isValid: true }
  }
});

// Extract error message for a specific field from Zod error
const getFieldError = (error: ZodError, fieldPath: string): string | undefined => {
  const fieldError = error.issues.find((issue: ZodIssue) => {
    const path = issue.path.join('.');
    return path === fieldPath;
  });
  return fieldError?.message;
};

// Safe value conversion for validation
const safeValue = (value: any): any => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

export const useRecipeValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>(createInitialValidationState());
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validate individual field
  const validateField = useCallback((fieldPath: string, value: any, formData: any) => {
    try {
      const cleanValue = safeValue(value);
      
      // Use individual field schemas for isolated validation
      let schema;
      let dataToValidate = cleanValue;
      
      // BeanInfo field validation
      if (fieldPath === 'beanInfo.origin') {
        schema = OriginFieldSchema;
      } else if (fieldPath === 'beanInfo.processingMethod') {
        schema = ProcessingMethodFieldSchema;
      } else if (fieldPath === 'beanInfo.altitude') {
        schema = AltitudeFieldSchema;
      } else if (fieldPath === 'beanInfo.roastingDate') {
        schema = RoastingDateFieldSchema;
      } else if (fieldPath === 'beanInfo.roastingLevel') {
        schema = RoastingLevelFieldSchema;
      }
      // BrewingParameters field validation
      else if (fieldPath === 'brewingParameters.waterTemperature') {
        schema = WaterTemperatureFieldSchema;
      } else if (fieldPath === 'brewingParameters.brewingMethod') {
        schema = BrewingMethodFieldSchema;
      } else if (fieldPath === 'brewingParameters.grinderModel') {
        schema = GrinderModelFieldSchema;
      } else if (fieldPath === 'brewingParameters.grinderUnit') {
        schema = GrinderUnitFieldSchema;
      } else if (fieldPath === 'brewingParameters.filteringTools') {
        schema = FilteringToolsFieldSchema;
      } else if (fieldPath === 'brewingParameters.turbulence') {
        schema = TurbulenceFieldSchema;
      } else if (fieldPath === 'brewingParameters.additionalNotes') {
        schema = AdditionalNotesFieldSchema;
      }
      // Measurements field validation
      else if (fieldPath === 'measurements.coffeeBeans') {
        schema = CoffeeBeansFieldSchema;
      } else if (fieldPath === 'measurements.water') {
        schema = WaterFieldSchema;
      } else if (fieldPath === 'measurements.tds') {
        schema = TdsFieldSchema;
      } else if (fieldPath === 'measurements.extractionYield') {
        schema = ExtractionYieldFieldSchema;
      }
      // SensationRecord field validation
      else if (fieldPath === 'sensationRecord.overallImpression') {
        schema = OverallImpressionFieldSchema;
      } else if (fieldPath === 'sensationRecord.acidity') {
        schema = AcidityFieldSchema;
      } else if (fieldPath === 'sensationRecord.body') {
        schema = BodyFieldSchema;
      } else if (fieldPath === 'sensationRecord.sweetness') {
        schema = SweetnessFieldSchema;
      } else if (fieldPath === 'sensationRecord.flavor') {
        schema = FlavorFieldSchema;
      } else if (fieldPath === 'sensationRecord.aftertaste') {
        schema = AftertasteFieldSchema;
      } else if (fieldPath === 'sensationRecord.balance') {
        schema = BalanceFieldSchema;
      } else if (fieldPath === 'sensationRecord.tastingNotes') {
        schema = TastingNotesFieldSchema;
      } else if (fieldPath === 'recipeName') {
        // Recipe name is optional, just check length
        if (cleanValue && typeof cleanValue === 'string' && cleanValue.length > 200) {
          return { isValid: false, error: 'Recipe name must be 200 characters or less' };
        }
        return { isValid: true };
      }

      if (!schema) {
        return { isValid: true };
      }

      // Individual field validation - validate only the specific field value
      const result = schema.safeParse(dataToValidate);
      
      if (result.success) {
        return { isValid: true };
      } else {
        // For individual field validation, use the direct error message
        const error = result.error.issues[0]?.message || 'Invalid value';
        return { isValid: false, error };
      }
    } catch (error) {
      return { isValid: false, error: 'Validation error' };
    }
  }, []);

  // Update validation state for a specific field
  const updateFieldValidation = useCallback((fieldPath: string, value: any, formData: any) => {
    const result = validateField(fieldPath, value, formData);
    
    setValidationState(prev => {
      const newState = { ...prev };
      const keys = fieldPath.split('.');
      
      if (keys.length === 1 && keys[0]) {
        (newState as any)[keys[0]] = result;
      } else if (keys.length === 2 && keys[0] && keys[1]) {
        if ((newState as any)[keys[0]]) {
          (newState as any)[keys[0]][keys[1]] = result;
        }
      }
      
      return newState;
    });
    
    return result;
  }, [validateField]);

  // Validate entire form
  const validateForm = useCallback((formData: any) => {
    setHasAttemptedSubmit(true);
    
    try {
      const result = RecipeInputSchema.safeParse(formData);
      
      if (result.success) {
        // Clear all validation errors
        setValidationState(createInitialValidationState());
        return { isValid: true, errors: [] };
      } else {
        // Update validation state with all errors
        const newState = createInitialValidationState();
        const errors: string[] = [];
        
        result.error.issues.forEach((issue: ZodIssue) => {
          const path = issue.path.join('.');
          const keys = path.split('.');
          
          errors.push(`${keys.join(' → ')}: ${issue.message}`);
          
          if (keys.length === 1 && keys[0]) {
            (newState as any)[keys[0]] = { isValid: false, error: issue.message };
          } else if (keys.length === 2 && keys[0] && keys[1]) {
            if ((newState as any)[keys[0]]) {
              (newState as any)[keys[0]][keys[1]] = { isValid: false, error: issue.message };
            }
          }
        });
        
        setValidationState(newState);
        return { isValid: false, errors };
      }
    } catch (error) {
      return { isValid: false, errors: ['Validation failed'] };
    }
  }, []);

  // Get validation result for a specific field
  const getFieldValidation = useCallback((fieldPath: string) => {
    const keys = fieldPath.split('.');
    if (keys.length === 1 && keys[0]) {
      return (validationState as any)[keys[0]] || { isValid: true };
    } else if (keys.length === 2 && keys[0] && keys[1]) {
      return (validationState as any)[keys[0]]?.[keys[1]] || { isValid: true };
    }
    return { isValid: true };
  }, [validationState]);

  // Check if form has any validation errors
  const hasValidationErrors = useMemo(() => {
    const checkObject = (obj: any): boolean => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key].hasOwnProperty('isValid')) {
          if (!obj[key].isValid) return true;
        } else if (typeof obj[key] === 'object') {
          if (checkObject(obj[key])) return true;
        }
      }
      return false;
    };
    
    return checkObject(validationState);
  }, [validationState]);

  // Clear all validation errors
  const clearValidation = useCallback(() => {
    setValidationState(createInitialValidationState());
    setHasAttemptedSubmit(false);
  }, []);

  return {
    validationState,
    validateField,
    updateFieldValidation,
    validateForm,
    getFieldValidation,
    hasValidationErrors,
    hasAttemptedSubmit,
    clearValidation
  };
};