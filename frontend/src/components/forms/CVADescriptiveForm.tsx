import React, { useState } from 'react';
import type { CVADescriptiveAssessment } from 'coffee-tracker-shared';

interface CVADescriptiveFormProps {
  value: CVADescriptiveAssessment;
  onChange: (value: CVADescriptiveAssessment) => void;
  onBlur?: (field: string, value: any) => void;
}

// SCA Standard 103-P/2024 CATA Descriptor Lists
const OLFACTORY_DESCRIPTORS = [
  'Floral',
  'Berry', 'Dried Fruit', 'Citrus Fruit',
  'Sour', 'Fermented',
  'Green/Vegetative',
  'Chemical', 'Musty/Earthy', 'Woody',
  'Cereal', 'Burnt', 'Tobacco',
  'Nutty', 'Cocoa',
  'Spice',
  'Vanilla/Vanillin', 'Brown Sugar'
];

const MAIN_TASTES = ['Salty', 'Sour', 'Sweet', 'Bitter', 'Umami'];

const MOUTHFEEL_DESCRIPTORS = ['Metallic', 'Rough', 'Oily', 'Smooth', 'Mouth-Drying'];

const CVADescriptiveForm: React.FC<CVADescriptiveFormProps> = ({
  value,
  onChange,
  onBlur
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFieldChange = (field: keyof CVADescriptiveAssessment, fieldValue: any) => {
    const updatedValue = { ...value, [field]: fieldValue };
    onChange(updatedValue);
    
    if (onBlur) {
      onBlur(`sensationRecord.cvaDescriptive.${field}`, fieldValue);
    }
  };

  const handleIntensityChange = (field: keyof CVADescriptiveAssessment, inputValue: string) => {
    const intValue = Math.min(15, Math.max(0, parseInt(inputValue) || 0));
    handleFieldChange(field, intValue);
  };

  // Validate CATA descriptor limits
  const validateDescriptorLimits = () => {
    const errors: string[] = [];
    
    const fragranceAromaCount = (value.fragranceAromaDescriptors || []).length;
    const flavorAftertasteCount = (value.flavorAftertasteDescriptors || []).length;
    const mainTastesCount = (value.mainTastes || []).length;
    const mouthfeelCount = (value.mouthfeelDescriptors || []).length;
    
    if (fragranceAromaCount > 5) {
      errors.push(`Fragrance + Aroma descriptors exceed limit (${fragranceAromaCount}/5)`);
    }
    if (flavorAftertasteCount > 5) {
      errors.push(`Flavor + Aftertaste descriptors exceed limit (${flavorAftertasteCount}/5)`);
    }
    if (mainTastesCount > 2) {
      errors.push(`Main Tastes exceed limit (${mainTastesCount}/2)`);
    }
    if (mouthfeelCount > 2) {
      errors.push(`Mouthfeel descriptors exceed limit (${mouthfeelCount}/2)`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle CATA descriptor selection
  const handleCATASelection = (
    field: 'fragranceAromaDescriptors' | 'flavorAftertasteDescriptors' | 'mainTastes' | 'mouthfeelDescriptors',
    descriptor: string,
    isSelected: boolean
  ) => {
    const currentArray = value[field] || [];
    let updatedArray: string[];
    
    if (isSelected) {
      updatedArray = [...currentArray, descriptor];
    } else {
      updatedArray = currentArray.filter(item => item !== descriptor);
    }
    
    handleFieldChange(field, updatedArray);
    
    // Validate after change
    setTimeout(validateDescriptorLimits, 0);
  };

  // Create intensity input component
  const IntensityInput: React.FC<{
    field: keyof CVADescriptiveAssessment;
    label: string;
    description: string;
  }> = ({ field, label, description }) => {
    const fieldValue = (value[field] as number) ?? 0;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {fieldValue}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">0</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={fieldValue}
              onChange={(e) => handleIntensityChange(field, e.target.value)}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>None</span>
              <span>Medium</span>
              <span>Very High</span>
            </div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">15</span>
        </div>
      </div>
    );
  };

  // Create CATA selector component
  const CATASelector: React.FC<{
    field: 'fragranceAromaDescriptors' | 'flavorAftertasteDescriptors' | 'mainTastes' | 'mouthfeelDescriptors';
    descriptors: string[];
    limit: number;
    title: string;
  }> = ({ field, descriptors, limit, title }) => {
    const selectedDescriptors = value[field] || [];
    const remainingSelections = limit - selectedDescriptors.length;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
          <span className={`text-xs px-2 py-1 rounded ${
            remainingSelections >= 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {selectedDescriptors.length}/{limit} selected
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {descriptors.map((descriptor) => {
            const isSelected = selectedDescriptors.includes(descriptor);
            const canSelect = remainingSelections > 0 || isSelected;
            
            return (
              <label
                key={descriptor}
                className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-600'
                    : canSelect
                    ? 'bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700'
                    : 'bg-gray-100 border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!canSelect}
                  onChange={(e) => handleCATASelection(field, descriptor, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${
                  canSelect ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {descriptor}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          CVA Descriptive Assessment
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          SCA Standard 103-P/2024: Builds objective sensory fingerprint using 0-15 intensity scales and CATA descriptors. 
          Does not compute a quality score - focuses on sensory profile mapping.
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Descriptor Limit Violations:</h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Olfactory Evaluation (Orthonasal) */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Olfactory Evaluation (Orthonasal Olfaction)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IntensityInput
            field="fragrance"
            label="Fragrance Intensity"
            description="Smell of dry coffee grounds before brewing (0=None, 15=Very High)"
          />
          
          <IntensityInput
            field="aroma"
            label="Aroma Intensity"
            description="Smell of brewed coffee at aroma break & crust removal (0=None, 15=Very High)"
          />
        </div>

        <CATASelector
          field="fragranceAromaDescriptors"
          descriptors={OLFACTORY_DESCRIPTORS}
          limit={5}
          title="Fragrance + Aroma Descriptors (Combined limit: ≤5 total)"
        />
      </div>

      {/* Section 2: Flavor Evaluation (Gustatory + Retronasal) */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Flavor Evaluation (Gustatory + Retronasal Olfaction)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IntensityInput
            field="flavor"
            label="Flavor Intensity"
            description="Combined taste + retronasal smell while coffee is in mouth (0=None, 15=Very High)"
          />
          
          <IntensityInput
            field="aftertaste"
            label="Aftertaste Intensity"
            description="Sensations remaining after swallowing/spitting (0=None, 15=Very High)"
          />
        </div>

        <CATASelector
          field="flavorAftertasteDescriptors"
          descriptors={OLFACTORY_DESCRIPTORS}
          limit={5}
          title="Flavor + Aftertaste Descriptors (Retronasal - Combined limit: ≤5 total)"
        />

        <CATASelector
          field="mainTastes"
          descriptors={MAIN_TASTES}
          limit={2}
          title="Main Tastes (Gustatory sensations - Limit: ≤2 selections)"
        />
      </div>

      {/* Section 3: Gustatory Characteristics */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Gustatory Characteristics
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <IntensityInput
              field="acidity"
              label="Acidity Intensity"
              description="Perceived sourness character & intensity (0=None, 15=Very High)"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Acidity Descriptors (Free Text)
              </label>
              <input
                type="text"
                value={value.acidityDescriptors || ''}
                onChange={(e) => handleFieldChange('acidityDescriptors', e.target.value)}
                placeholder="e.g., tartaric, bright, sparkling"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <IntensityInput
              field="sweetness"
              label="Sweetness Intensity"
              description="Perceived sweetness impression (gustatory & retronasal) (0=None, 15=Very High)"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sweetness Descriptors (Free Text)
              </label>
              <input
                type="text"
                value={value.sweetnessDescriptors || ''}
                onChange={(e) => handleFieldChange('sweetnessDescriptors', e.target.value)}
                placeholder="e.g., cane sugar, caramel, honey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Tactile Evaluation (Mouthfeel) */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Tactile Evaluation (Mouthfeel)
        </h4>
        
        <IntensityInput
          field="mouthfeel"
          label="Mouthfeel Intensity"
          description="Viscosity, texture, astringency, tactile sensations (0=None, 15=Very High)"
        />

        <CATASelector
          field="mouthfeelDescriptors"
          descriptors={MOUTHFEEL_DESCRIPTORS}
          limit={2}
          title="Mouthfeel Descriptors (Limit: ≤2 selections)"
        />
      </div>

      {/* Section 5: Additional Notes & Metadata */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Additional Assessment Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Roast Level Assessment
            </label>
            <input
              type="text"
              value={value.roastLevel || ''}
              onChange={(e) => handleFieldChange('roastLevel', e.target.value)}
              placeholder="e.g., Light (Agtron 58), Medium, Dark"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assessor ID
            </label>
            <input
              type="text"
              value={value.assessorId || ''}
              onChange={(e) => handleFieldChange('assessorId', e.target.value)}
              placeholder="Cupper identification"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Descriptors & Notes
          </label>
          <textarea
            rows={3}
            value={value.additionalNotes || ''}
            onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
            placeholder="Additional sensory descriptors, notes, or observations not captured above..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Assessment Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Intensity Ratings</div>
            <div className="text-gray-600 dark:text-gray-400">
              F: {value.fragrance || 0} | A: {value.aroma || 0} | Fl: {value.flavor || 0} | Af: {value.aftertaste || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Ac: {value.acidity || 0} | S: {value.sweetness || 0} | M: {value.mouthfeel || 0}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Descriptor Counts</div>
            <div className="text-gray-600 dark:text-gray-400">
              Olfactory: {(value.fragranceAromaDescriptors || []).length}/5
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Retronasal: {(value.flavorAftertasteDescriptors || []).length}/5
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Taste & Mouthfeel</div>
            <div className="text-gray-600 dark:text-gray-400">
              Main Tastes: {(value.mainTastes || []).length}/2
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Mouthfeel: {(value.mouthfeelDescriptors || []).length}/2
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Completion Status</div>
            <div className={`text-sm px-2 py-1 rounded ${
              validationErrors.length === 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {validationErrors.length === 0 ? 'Valid' : 'Limits Exceeded'}
            </div>
          </div>
        </div>
      </div>

      {/* Reference Guide */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
          SCA Standard 103-P/2024 Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-gray-700 dark:text-gray-300">Intensity Scale (0-15)</div>
            <div className="text-gray-600 dark:text-gray-400">0 = None, 5-10 = Medium, 15 = Very High</div>
            <div className="text-gray-600 dark:text-gray-400">Mark any point on the scale - recorded as nearest integer</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-700 dark:text-gray-300">CATA Descriptor Limits</div>
            <div className="text-gray-600 dark:text-gray-400">Fragrance + Aroma: ≤5 combined</div>
            <div className="text-gray-600 dark:text-gray-400">Flavor + Aftertaste: ≤5 combined</div>
            <div className="text-gray-600 dark:text-gray-400">Main Tastes: ≤2 | Mouthfeel: ≤2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVADescriptiveForm;