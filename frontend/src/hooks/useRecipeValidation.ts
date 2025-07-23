import { useState, useCallback, useMemo } from 'react';
import { ZodError, ZodIssue } from 'zod';
import { 
  RecipeInputSchema, 
  BeanInfoSchema, 
  BrewingParametersSchema, 
  MeasurementsInputSchema, 
  SensationRecordSchema 
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
      // DEBUG: Log field validation start
      console.log('🧪 validateField called:', { fieldPath, value, type: typeof value });
      
      const cleanValue = safeValue(value);
      
      // DEBUG: Log cleaned value
      console.log('🧹 Cleaned value:', { cleanValue, originalValue: value });
      
      // Determine which schema to use based on field path
      let schema;
      let dataToValidate;
      
      if (fieldPath.startsWith('beanInfo.')) {
        const fieldName = fieldPath.split('.')[1];
        schema = BeanInfoSchema;
        dataToValidate = { ...formData.beanInfo };
        if (fieldName) {
          dataToValidate[fieldName] = cleanValue;
        }
        
        // DEBUG: Log beanInfo validation setup
        console.log('🫘 BeanInfo validation setup:', { 
          fieldName, 
          cleanValue, 
          dataToValidate,
          originalBeanInfo: formData.beanInfo
        });
        
        // DEBUG: Special case for origin field
        if (fieldName === 'origin') {
          console.log('🌍 Origin field validation details:', {
            fieldPath,
            fieldName,
            cleanValue,
            dataToValidate,
            schemaName: 'BeanInfoSchema'
          });
        }
      } else if (fieldPath.startsWith('brewingParameters.')) {
        const fieldName = fieldPath.split('.')[1];
        schema = BrewingParametersSchema;
        dataToValidate = { ...formData.brewingParameters };
        if (fieldName) {
          dataToValidate[fieldName] = cleanValue;
        }
      } else if (fieldPath.startsWith('measurements.')) {
        const fieldName = fieldPath.split('.')[1];
        schema = MeasurementsInputSchema;
        dataToValidate = { ...formData.measurements };
        if (fieldName) {
          dataToValidate[fieldName] = cleanValue;
        }
      } else if (fieldPath.startsWith('sensationRecord.')) {
        const fieldName = fieldPath.split('.')[1];
        schema = SensationRecordSchema;
        dataToValidate = { ...formData.sensationRecord };
        if (fieldName) {
          dataToValidate[fieldName] = cleanValue;
        }
      } else if (fieldPath === 'recipeName') {
        // Recipe name is optional, just check length
        if (cleanValue && typeof cleanValue === 'string' && cleanValue.length > 200) {
          return { isValid: false, error: 'Recipe name must be 200 characters or less' };
        }
        return { isValid: true };
      }

      if (!schema) {
        console.log('⚠️ No schema found for field:', fieldPath);
        return { isValid: true };
      }

      // DEBUG: Log schema validation attempt
      console.log('🔬 About to validate with schema:', {
        fieldPath,
        schema: schema.constructor.name,
        dataToValidate,
        cleanValue
      });

      // Partial validation - only validate if field has a value or is required
      const result = schema.safeParse(dataToValidate);
      
      // DEBUG: Log schema validation result
      console.log('🎯 Schema validation result:', {
        fieldPath,
        success: result.success,
        dataToValidate,
        result: result.success ? 'SUCCESS' : result.error
      });
      
      if (result.success) {
        return { isValid: true };
      } else {
        const fieldName = fieldPath.split('.').pop();
        const error = getFieldError(result.error, fieldName || '');
        
        // DEBUG: Log validation error details
        console.error('💥 Validation failed for', fieldPath, ':', {
          fieldName,
          error,
          allIssues: result.error.issues,
          dataToValidate
        });
        
        return { isValid: false, error: error || result.error.issues[0]?.message || 'Invalid value' };
      }
    } catch (error) {
      return { isValid: false, error: 'Validation error' };
    }
  }, []);

  // Update validation state for a specific field
  const updateFieldValidation = useCallback((fieldPath: string, value: any, formData: any) => {
    // DEBUG: Log validation calls
    console.log('🔍 updateFieldValidation called:', { fieldPath, value, type: typeof value });
    
    // DEBUG: Special logging for origin field validation
    if (fieldPath === 'beanInfo.origin') {
      console.log('🌍 Validating origin field:', { 
        value, 
        formDataBeanInfo: formData?.beanInfo,
        originValue: formData?.beanInfo?.origin
      });
    }
    
    const result = validateField(fieldPath, value, formData);
    
    // DEBUG: Log validation result
    console.log('📊 Validation result for', fieldPath, ':', result);
    
    // DEBUG: Special logging for origin validation result
    if (fieldPath === 'beanInfo.origin' && !result.isValid) {
      console.error('❌ Origin validation failed:', { 
        fieldPath, 
        value, 
        error: result.error,
        formData: formData?.beanInfo 
      });
    }
    
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