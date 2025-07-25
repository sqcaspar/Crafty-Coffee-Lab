import React, { useEffect, useState } from 'react';
import type { TraditionalSCAEvaluation } from 'coffee-tracker-shared';
import { calculateSCAScore, getSCAScoreInterpretation, formatScore, getScoreColor } from '../../utils/scoreCalculations';

interface TraditionalSCAFormProps {
  value: TraditionalSCAEvaluation;
  onChange: (value: TraditionalSCAEvaluation) => void;
  onBlur?: (field: string, value: any) => void;
}

const TraditionalSCAForm: React.FC<TraditionalSCAFormProps> = ({
  value,
  onChange,
  onBlur
}) => {
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  // Auto-calculate final score when evaluation data changes
  useEffect(() => {
    const score = calculateSCAScore(value);
    setCalculatedScore(score);
    
    // Update final score in the data
    if (score !== value.finalScore) {
      onChange({ ...value, finalScore: score });
    }
  }, [value, onChange]);

  const handleFieldChange = (field: keyof TraditionalSCAEvaluation, fieldValue: any) => {
    const updatedValue = { ...value, [field]: fieldValue };
    onChange(updatedValue);
    
    if (onBlur) {
      onBlur(`sensationRecord.traditionalSCA.${field}`, fieldValue);
    }
  };

  const handleRangeChange = (field: keyof TraditionalSCAEvaluation, inputValue: string) => {
    const numericValue = parseFloat(inputValue);
    handleFieldChange(field, numericValue);
  };

  const handleIntegerChange = (field: keyof TraditionalSCAEvaluation, inputValue: string) => {
    const intValue = parseInt(inputValue);
    handleFieldChange(field, intValue);
  };

  // Create range input component for 6-10 point scales
  const QualityRangeInput: React.FC<{
    field: keyof TraditionalSCAEvaluation;
    label: string;
    description?: string;
  }> = ({ field, label, description }) => {
    const fieldValue = (value[field] as number) || 6;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {fieldValue.toFixed(2)}
          </span>
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">6.00</span>
          <input
            type="range"
            min="6"
            max="10"
            step="0.25"
            value={fieldValue}
            onChange={(e) => handleRangeChange(field, e.target.value)}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">10.00</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {fieldValue >= 9 ? 'Outstanding' : 
           fieldValue >= 8 ? 'Excellent' : 
           fieldValue >= 7 ? 'Very Good' : 'Good'}
        </div>
      </div>
    );
  };

  // Create cup characteristic input (0-10, 2-point increments)
  const CupCharacteristicInput: React.FC<{
    field: keyof TraditionalSCAEvaluation;
    label: string;
    description?: string;
  }> = ({ field, label, description }) => {
    const fieldValue = (value[field] as number) || 0;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {fieldValue}
          </span>
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">0</span>
          <input
            type="range"
            min="0"
            max="10"
            step="2"
            value={fieldValue}
            onChange={(e) => handleIntegerChange(field, e.target.value)}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">10</span>
        </div>
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          {fieldValue === 10 ? 'Perfect (5/5 cups)' :
           fieldValue === 8 ? 'Excellent (4/5 cups)' :
           fieldValue === 6 ? 'Good (3/5 cups)' :
           fieldValue === 4 ? 'Fair (2/5 cups)' :
           fieldValue === 2 ? 'Poor (1/5 cups)' : 'None (0/5 cups)'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with SCA logo/branding */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          SCA Cupping Protocol Form
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on SCA 2004 Cupping Protocol. Ten sensory attributes rated 6.00-10.00 with 0.25 increments, adjusted for defects.
        </p>
      </div>

      {/* Quality Attributes Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Quality Attributes (6.00-10.00 points each)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QualityRangeInput
            field="fragrance"
            label="Fragrance/Aroma"
            description="Orthonasal smell of grounds (fragrance) and brewed coffee (aroma)"
          />
          
          <QualityRangeInput
            field="flavor"
            label="Flavor"
            description="Combined taste and retronasal aroma perception"
          />
          
          <QualityRangeInput
            field="aftertaste"
            label="Aftertaste"
            description="Length and quality of lingering taste sensations"
          />
          
          <div className="space-y-4">
            <QualityRangeInput
              field="acidity"
              label="Acidity (Quality)"
              description="Pleasant tartness quality"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Acidity Intensity
              </label>
              <select
                value={value.acidityIntensity || ''}
                onChange={(e) => handleFieldChange('acidityIntensity', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">Select intensity...</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <QualityRangeInput
              field="body"
              label="Body (Quality)"
              description="Tactile feeling and weight in mouth"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Level
              </label>
              <select
                value={value.bodyLevel || ''}
                onChange={(e) => handleFieldChange('bodyLevel', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">Select level...</option>
                <option value="Heavy">Heavy</option>
                <option value="Medium">Medium</option>
                <option value="Thin">Thin</option>
              </select>
            </div>
          </div>
          
          <QualityRangeInput
            field="balance"
            label="Balance"
            description="How flavor, aftertaste, acidity, and body complement each other"
          />
          
          <QualityRangeInput
            field="overall"
            label="Overall"
            description="Final impression score reflecting overall experience"
          />
        </div>
      </div>

      {/* Cup Characteristics Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Cup Characteristics (0-10 points each)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CupCharacteristicInput
            field="uniformity"
            label="Uniformity"
            description="Consistency across 5 cups (2 points per uniform cup)"
          />
          
          <CupCharacteristicInput
            field="cleanCup"
            label="Clean Cup"
            description="Freedom from defects (2 points per clean cup)"
          />
          
          <CupCharacteristicInput
            field="sweetness"
            label="Sweetness"
            description="Pleasing fullness and sweetness (2 points per sweet cup)"
          />
        </div>
      </div>

      {/* Defects Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Defect Penalties
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tainted Cups (-2 points per cup)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Cups with off-flavors that don't render them undrinkable (e.g., papery, medicinal)
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">0</span>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={Math.floor((value.taintDefects || 0) / 2)}
                onChange={(e) => handleIntegerChange('taintDefects', (parseInt(e.target.value) * 2).toString())}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">5</span>
              <div className="w-16 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.floor((value.taintDefects || 0) / 2)} cup{Math.floor((value.taintDefects || 0) / 2) !== 1 ? 's' : ''}
                </span>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  -{value.taintDefects || 0}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Faulty Cups (-4 points per cup)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Cups with severe off-flavors that render them undrinkable (e.g., moldy, phenolic)
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">0</span>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={Math.floor((value.faultDefects || 0) / 4)}
                onChange={(e) => handleIntegerChange('faultDefects', (parseInt(e.target.value) * 4).toString())}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">5</span>
              <div className="w-16 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.floor((value.faultDefects || 0) / 4)} cup{Math.floor((value.faultDefects || 0) / 4) !== 1 ? 's' : ''}
                </span>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  -{value.faultDefects || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Score Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Final SCA Score
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {calculatedScore !== null && getSCAScoreInterpretation(calculatedScore)}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${calculatedScore !== null ? getScoreColor(calculatedScore, 'sca') : 'text-gray-500'}`}>
              {calculatedScore !== null ? formatScore(calculatedScore) : '--'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              out of 100
            </div>
          </div>
        </div>
        
        {calculatedScore !== null && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-gray-500 dark:text-gray-400">Sum of 10 Attributes</div>
              <div className="font-medium">
                {(((value.fragrance || 6) + (value.flavor || 6) + (value.aftertaste || 6) + 
                   (value.acidity || 6) + (value.body || 6) + (value.balance || 6) + 
                   (value.sweetness || 6) + (value.cleanCup || 6) + (value.uniformity || 6) + 
                   (value.overall || 6))).toFixed(2)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-gray-500 dark:text-gray-400">Defect Penalties</div>
              <div className="font-medium text-red-600 dark:text-red-400">
                -{((value.taintDefects || 0) + (value.faultDefects || 0)).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.floor((value.taintDefects || 0) / 2)} taint + {Math.floor((value.faultDefects || 0) / 4)} fault
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-gray-500 dark:text-gray-400">Final Score</div>
              <div className={`font-medium ${getScoreColor(calculatedScore, 'sca')}`}>
                {formatScore(calculatedScore)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraditionalSCAForm;