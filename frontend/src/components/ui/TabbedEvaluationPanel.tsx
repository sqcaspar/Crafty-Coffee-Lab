import React, { useState } from 'react';
import type { SensationRecord, EvaluationSystem, QuickTastingAssessment } from '../../shared';
import TraditionalSCAForm from '../forms/TraditionalSCAForm';
import CVAAffectiveForm from '../forms/CVAAffectiveForm';
import CVADescriptiveForm from '../forms/CVADescriptiveForm';

// Legacy TastingNotesPanel interface for backwards compatibility
export interface TastingNotesData {
  overallImpression?: number;
  acidity?: number;
  body?: number;
  sweetness?: number;
  flavor?: number;
  aftertaste?: number;
  balance?: number;
  tastingNotes?: string;
}

interface TabbedEvaluationPanelProps {
  value: SensationRecord;
  onChange: (value: SensationRecord) => void;
  onBlur?: (field: string, value: any) => void;
}

const TabbedEvaluationPanel: React.FC<TabbedEvaluationPanelProps> = ({
  value,
  onChange,
  onBlur
}) => {
  // Determine active tab based on evaluation system or default to legacy
  const getActiveTab = (): EvaluationSystem => {
    if (value.evaluationSystem) {
      return value.evaluationSystem;
    }
    
    // Auto-detect based on data presence
    if (value.traditionalSCA && Object.keys(value.traditionalSCA).length > 0) {
      return 'traditional-sca';
    }
    if (value.cvaAffective && Object.keys(value.cvaAffective).length > 0) {
      return 'cva-affective';
    }
    if (value.cvaDescriptive && Object.keys(value.cvaDescriptive).length > 0) {
      return 'cva-descriptive';
    }
    if (value.quickTasting && Object.keys(value.quickTasting).length > 0) {
      return 'quick-tasting';
    }
    
    return 'legacy';
  };

  const [activeTab, setActiveTab] = useState<EvaluationSystem>(getActiveTab());

  const handleTabChange = (tab: EvaluationSystem) => {
    setActiveTab(tab);
    
    // Update evaluation system in the data
    const updatedValue = { ...value, evaluationSystem: tab };
    onChange(updatedValue);
  };

  const handleLegacyChange = (field: keyof TastingNotesData, fieldValue: any) => {
    const updatedValue = { ...value, [field]: fieldValue };
    onChange(updatedValue);
    
    if (onBlur) {
      onBlur(`sensationRecord.${field}`, fieldValue);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Evaluation Tabs">
          <button
            onClick={() => handleTabChange('quick-tasting')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quick-tasting'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Quick Tasting
          </button>
          
          <button
            onClick={() => handleTabChange('traditional-sca')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'traditional-sca'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            SCA Cupping Protocol
          </button>
          
          <button
            onClick={() => handleTabChange('cva-affective')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cva-affective'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            CVA Affective Scoring
          </button>
          
          <button
            onClick={() => handleTabChange('cva-descriptive')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cva-descriptive'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            CVA Descriptive Assessment
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'quick-tasting' && (
          <QuickTastingForm
            value={value.quickTasting || {}}
            onChange={(updatedQuickTasting) => {
              const updatedValue = {
                ...value,
                quickTasting: updatedQuickTasting
              };
              onChange(updatedValue);
            }}
            onBlur={onBlur}
          />
        )}
        
        {activeTab === 'traditional-sca' && (
          <TraditionalSCAForm
            value={value.traditionalSCA || {}}
            onChange={(updatedSCA) => {
              const updatedValue = {
                ...value,
                traditionalSCA: updatedSCA
              };
              onChange(updatedValue);
            }}
            onBlur={onBlur}
          />
        )}
        
        {activeTab === 'cva-affective' && (
          <CVAAffectiveForm
            value={value.cvaAffective || {}}
            onChange={(updatedCVA) => {
              const updatedValue = {
                ...value,
                cvaAffective: updatedCVA
              };
              onChange(updatedValue);
            }}
            onBlur={onBlur}
          />
        )}
        
        {activeTab === 'cva-descriptive' && (
          <CVADescriptiveForm
            value={value.cvaDescriptive || {}}
            onChange={(updatedCVA) => {
              const updatedValue = {
                ...value,
                cvaDescriptive: updatedCVA
              };
              onChange(updatedValue);
            }}
            onBlur={onBlur}
          />
        )}
      </div>
    </div>
  );
};

// SCA Standard 103-P/2024 CATA Descriptor Lists (same as CVADescriptiveForm)
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

// Quick Tasting form component combining CVA Descriptive and CVA Affective elements
interface QuickTastingFormProps {
  value: QuickTastingAssessment;
  onChange: (value: QuickTastingAssessment) => void;
  onBlur?: (field: string, value: any) => void;
}

const QuickTastingForm: React.FC<QuickTastingFormProps> = ({ value, onChange, onBlur }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFieldChange = (field: keyof QuickTastingAssessment, fieldValue: any) => {
    const updatedValue = { ...value, [field]: fieldValue };
    onChange(updatedValue);
    
    if (onBlur) {
      onBlur(`sensationRecord.quickTasting.${field}`, fieldValue);
    }
  };

  const handleIntensityChange = (field: keyof QuickTastingAssessment, inputValue: string) => {
    const intValue = Math.min(15, Math.max(0, parseInt(inputValue) || 0));
    handleFieldChange(field, intValue);
  };

  const handleQualityChange = (field: keyof QuickTastingAssessment, inputValue: string) => {
    const intValue = Math.min(9, Math.max(1, parseInt(inputValue) || 5));
    handleFieldChange(field, intValue);
  };

  // Handle CATA descriptor selection
  const handleCATASelection = (descriptor: string, isSelected: boolean) => {
    const currentArray = value.flavorAftertasteDescriptors || [];
    let updatedArray: string[];
    
    if (isSelected) {
      updatedArray = [...currentArray, descriptor];
    } else {
      updatedArray = currentArray.filter(item => item !== descriptor);
    }
    
    handleFieldChange('flavorAftertasteDescriptors', updatedArray);
    
    // Validate descriptor limit
    const errors: string[] = [];
    if (updatedArray.length > 5) {
      errors.push(`Flavor + Aftertaste descriptors exceed limit (${updatedArray.length}/5)`);
    }
    setValidationErrors(errors);
  };

  // Create intensity input component for CVA Descriptive fields (0-15 scale)
  const IntensityInput: React.FC<{
    field: keyof QuickTastingAssessment;
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

  // Create quality input component for CVA Affective field (1-9 scale)
  const QualityInput: React.FC<{
    field: keyof QuickTastingAssessment;
    label: string;
    description: string;
  }> = ({ field, label, description }) => {
    const fieldValue = (value[field] as number) ?? 5;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
            {fieldValue}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">1</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={fieldValue}
              onChange={(e) => handleQualityChange(field, e.target.value)}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Very Low</span>
              <span>Neutral</span>
              <span>Very High</span>
            </div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">9</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {fieldValue >= 8 ? 'Extremely High' : 
           fieldValue >= 7 ? 'Very High' : 
           fieldValue >= 6 ? 'High' : 
           fieldValue === 5 ? 'Neutral' :
           fieldValue === 4 ? 'Low' :
           fieldValue === 3 ? 'Very Low' :
           fieldValue <= 2 ? 'Extremely Low' : 'Neutral'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Quick Tasting Assessment
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Streamlined evaluation combining key elements from CVA Descriptive (0-15 intensity) and CVA Affective (1-9 quality) assessments.
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

      {/* CVA Descriptive Intensity Fields (0-15 scale) */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Taste Intensity Assessment (0-15 scale)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IntensityInput
            field="flavorIntensity"
            label="Flavor Intensity"
            description="Combined taste + retronasal smell while coffee is in mouth"
          />
          
          <IntensityInput
            field="aftertasteIntensity"
            label="Aftertaste Intensity"
            description="Sensations remaining after swallowing or spitting"
          />
          
          <IntensityInput
            field="acidityIntensity"
            label="Acidity Intensity"
            description="Perceived sourness character & intensity"
          />
          
          <IntensityInput
            field="sweetnessIntensity"
            label="Sweetness Intensity"
            description="Perceived sweetness impression (gustatory & retronasal)"
          />
          
          <IntensityInput
            field="mouthfeelIntensity"
            label="Mouthfeel Intensity"
            description="Viscosity, texture, astringency, tactile sensations"
          />
        </div>
      </div>

      {/* Flavor + Aftertaste Descriptors */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Flavor + Aftertaste Descriptors
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select descriptors (limit: ≤5 total)</h5>
            <span className={`text-xs px-2 py-1 rounded ${
              (value.flavorAftertasteDescriptors || []).length <= 5
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {(value.flavorAftertasteDescriptors || []).length}/5 selected
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {OLFACTORY_DESCRIPTORS.map((descriptor) => {
              const selectedDescriptors = value.flavorAftertasteDescriptors || [];
              const isSelected = selectedDescriptors.includes(descriptor);
              const canSelect = selectedDescriptors.length < 5 || isSelected;
              
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
                    onChange={(e) => handleCATASelection(descriptor, e.target.checked)}
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
      </div>

      {/* CVA Affective Overall Quality (1-9 scale) */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Overall Quality Assessment (1-9 scale)
        </h4>
        
        <QualityInput
          field="overallQuality"
          label="Overall Quality"
          description="Overall impression of quality (5 = neutral liking)"
        />
      </div>

      {/* Assessment Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Assessment Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Intensity Ratings (0-15)</div>
            <div className="text-gray-600 dark:text-gray-400">
              Flavor: {value.flavorIntensity || 0} | Aftertaste: {value.aftertasteIntensity || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Acidity: {value.acidityIntensity || 0} | Sweetness: {value.sweetnessIntensity || 0} | Mouthfeel: {value.mouthfeelIntensity || 0}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Descriptors</div>
            <div className="text-gray-600 dark:text-gray-400">
              Selected: {(value.flavorAftertasteDescriptors || []).length}/5
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Overall Quality (1-9)</div>
            <div className="text-gray-600 dark:text-gray-400">
              Quality: {value.overallQuality || 5}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabbedEvaluationPanel;