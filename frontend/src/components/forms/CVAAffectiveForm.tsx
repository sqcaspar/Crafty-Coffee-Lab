import React, { useEffect, useState } from 'react';
import type { CVAAffectiveAssessment } from 'coffee-tracker-shared';
import { calculateCVAScore, getCVAScoreInterpretation, formatScore, getScoreColor } from '../../utils/scoreCalculations';

interface CVAAffectiveFormProps {
  value: CVAAffectiveAssessment;
  onChange: (value: CVAAffectiveAssessment) => void;
  onBlur?: (field: string, value: any) => void;
}

const CVAAffectiveForm: React.FC<CVAAffectiveFormProps> = ({
  value,
  onChange,
  onBlur
}) => {
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  // Auto-calculate CVA score when evaluation data changes
  useEffect(() => {
    const score = calculateCVAScore(value);
    setCalculatedScore(score);
    
    // Update CVA score in the data
    if (score !== value.cvaScore) {
      onChange({ ...value, cvaScore: score });
    }
  }, [value, onChange]);

  const handleFieldChange = (field: keyof CVAAffectiveAssessment, fieldValue: any) => {
    const updatedValue = { ...value, [field]: fieldValue };
    onChange(updatedValue);
    
    if (onBlur) {
      onBlur(`sensationRecord.cvaAffective.${field}`, fieldValue);
    }
  };

  const handleRangeChange = (field: keyof CVAAffectiveAssessment, inputValue: string) => {
    const intValue = parseInt(inputValue);
    handleFieldChange(field, intValue);
  };

  // Create quality assessment input component for 1-9 scales
  const QualityAssessmentInput: React.FC<{
    field: keyof CVAAffectiveAssessment;
    label: string;
    description?: string;
  }> = ({ field, label, description }) => {
    const fieldValue = (value[field] as number) || 5;
    
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
          <span className="text-sm text-gray-500 dark:text-gray-400">1</span>
          <input
            type="range"
            min="1"
            max="9"
            step="1"
            value={fieldValue}
            onChange={(e) => handleRangeChange(field, e.target.value)}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">9</span>
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

  // Create cup count input for defects
  const CupCountInput: React.FC<{
    field: keyof CVAAffectiveAssessment;
    label: string;
    description?: string;
    penaltyText?: string;
  }> = ({ field, label, description, penaltyText }) => {
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
            max="5"
            step="1"
            value={fieldValue}
            onChange={(e) => handleRangeChange(field, e.target.value)}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">5</span>
        </div>
        {penaltyText && fieldValue > 0 && (
          <div className="text-xs text-center text-red-600 dark:text-red-400">
            {penaltyText.replace('{count}', fieldValue.toString())}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with CVA branding */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          CVA Affective Assessment
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Measures overall quality impression across sensory attributes. Rate each section 1-9 based on quality, not intensity.
        </p>
      </div>

      {/* Quality Impression Ratings Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Quality Impression Ratings (1-9 scale)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QualityAssessmentInput
            field="fragrance"
            label="Fragrance Quality"
            description="Quality impression of dry coffee fragrance"
          />
          
          <QualityAssessmentInput
            field="aroma"
            label="Aroma Quality"
            description="Quality impression of wet coffee aroma"
          />
          
          <QualityAssessmentInput
            field="flavor"
            label="Flavor Quality"
            description="Quality impression of taste and retronasal perception"
          />
          
          <QualityAssessmentInput
            field="aftertaste"
            label="Aftertaste Quality"
            description="Quality impression of lingering taste sensations"
          />
          
          <QualityAssessmentInput
            field="acidity"
            label="Acidity Quality"
            description="Quality impression of acidic characteristics"
          />
          
          <QualityAssessmentInput
            field="sweetness"
            label="Sweetness Quality"
            description="Quality impression of sweet characteristics"
          />
          
          <QualityAssessmentInput
            field="mouthfeel"
            label="Mouthfeel Quality"
            description="Quality impression of tactile sensations"
          />
          
          <QualityAssessmentInput
            field="overall"
            label="Overall Quality"
            description="Final quality impression of the entire coffee experience"
          />
        </div>
      </div>

      {/* Cup Assessment Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Cup Uniformity & Defects Assessment
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CupCountInput
            field="nonUniformCups"
            label="Non-Uniform Cups"
            description="Number of cups that differ significantly from others (0-5)"
            penaltyText="Penalty: -{count} × 2 = -{(value.nonUniformCups || 0) * 2} points"
          />
          
          <CupCountInput
            field="defectiveCups"
            label="Defective Cups"
            description="Number of cups with taste defects or off-flavors (0-5)"
            penaltyText="Penalty: -{count} × 4 = -{(value.defectiveCups || 0) * 4} points"
          />
        </div>
      </div>

      {/* CVA Formula Explanation */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
          CVA Score Calculation Formula
        </h4>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>S = 6.25 × (Σhi) + 37.5 - 2u - 4d</strong></p>
          <div className="ml-4 space-y-1">
            <p>• S = Final CVA Score (58-100, rounded to nearest 0.25)</p>
            <p>• Σhi = Sum of all eight 9-point section scores</p>
            <p>• u = Number of non-uniform cups</p>
            <p>• d = Number of defective cups</p>
          </div>
        </div>
      </div>

      {/* Final CVA Score Display */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Final CVA Score
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {calculatedScore !== null && getCVAScoreInterpretation(calculatedScore)}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${calculatedScore !== null ? getScoreColor(calculatedScore, 'cva') : 'text-gray-500'}`}>
              {calculatedScore !== null ? formatScore(calculatedScore) : '--'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              out of 100
            </div>
          </div>
        </div>
        
        {calculatedScore !== null && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-gray-500 dark:text-gray-400">Section Scores (Σhi)</div>
              <div className="font-medium">
                {((value.fragrance || 0) + (value.aroma || 0) + (value.flavor || 0) + 
                  (value.aftertaste || 0) + (value.acidity || 0) + (value.sweetness || 0) + 
                  (value.mouthfeel || 0) + (value.overall || 0))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-gray-500 dark:text-gray-400">Base Score</div>
              <div className="font-medium">
                {(6.25 * ((value.fragrance || 0) + (value.aroma || 0) + (value.flavor || 0) + 
                          (value.aftertaste || 0) + (value.acidity || 0) + (value.sweetness || 0) + 
                          (value.mouthfeel || 0) + (value.overall || 0)) + 37.5).toFixed(2)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-gray-500 dark:text-gray-400">Cup Penalties</div>
              <div className="font-medium text-red-600 dark:text-red-400">
                -{(2 * (value.nonUniformCups || 0) + 4 * (value.defectiveCups || 0))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-gray-500 dark:text-gray-400">Final Score</div>
              <div className={`font-medium ${calculatedScore !== null ? getScoreColor(calculatedScore, 'cva') : 'text-gray-500'}`}>
                {calculatedScore !== null ? formatScore(calculatedScore) : '--'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scale Reference Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Quality Scale Reference (1-9)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-green-700 dark:text-green-400">High Quality (7-9)</div>
            <div className="text-gray-600 dark:text-gray-400">9 = Extremely High</div>
            <div className="text-gray-600 dark:text-gray-400">8 = Very High</div>
            <div className="text-gray-600 dark:text-gray-400">7 = High</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-yellow-700 dark:text-yellow-400">Neutral Quality (4-6)</div>
            <div className="text-gray-600 dark:text-gray-400">6 = Moderately High</div>
            <div className="text-gray-600 dark:text-gray-400">5 = Neutral</div>
            <div className="text-gray-600 dark:text-gray-400">4 = Moderately Low</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-red-700 dark:text-red-400">Low Quality (1-3)</div>
            <div className="text-gray-600 dark:text-gray-400">3 = Low</div>
            <div className="text-gray-600 dark:text-gray-400">2 = Very Low</div>
            <div className="text-gray-600 dark:text-gray-400">1 = Extremely Low</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVAAffectiveForm;