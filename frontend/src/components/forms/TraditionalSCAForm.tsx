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

      {/* SCA Cupping Protocol Attributes */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          SCA Cupping Protocol Attributes (6.00-10.00 points each)
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
            description="Combined retronasal aroma + taste while sipping"
          />
          
          <QualityRangeInput
            field="aftertaste"
            label="Aftertaste"
            description="Persistence and quality of flavor after swallowing"
          />
          
          <QualityRangeInput
            field="acidity"
            label="Acidity"
            description="Perceived brightness or liveliness (not sourness)"
          />
          
          <QualityRangeInput
            field="body"
            label="Body"
            description="Mouthfeel weight and viscosity"
          />
          
          <QualityRangeInput
            field="balance"
            label="Balance"
            description="Harmony between acidity, sweetness, body, and flavor"
          />
          
          <QualityRangeInput
            field="sweetness"
            label="Sweetness"
            description="Gustatory or retronasal perception of sweetness"
          />
          
          <QualityRangeInput
            field="cleanCup"
            label="Clean Cup"
            description="Absence of negative floating or suspended particles, odors"
          />
          
          <QualityRangeInput
            field="uniformity"
            label="Uniformity"
            description="Consistency of key attributes across five individually brewed cups"
          />
          
          <QualityRangeInput
            field="overall"
            label="Overall"
            description="General impression, including additional desirable characteristics"
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
              <div className="text-gray-500 dark:text-gray-400">Sum of 10 SCA Attributes</div>
              <div className="font-medium">
                {(((value.fragrance || 6) + (value.flavor || 6) + (value.aftertaste || 6) + 
                   (value.acidity || 6) + (value.body || 6) + (value.balance || 6) + 
                   (value.sweetness || 6) + (value.cleanCup || 6) + (value.uniformity || 6) + 
                   (value.overall || 6))).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Each attribute: 6.00-10.00 points
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
              <div className="text-gray-500 dark:text-gray-400">Final SCA Score</div>
              <div className={`font-medium ${getScoreColor(calculatedScore, 'sca')}`}>
                {formatScore(calculatedScore)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Range: 60.00-100.00
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraditionalSCAForm;