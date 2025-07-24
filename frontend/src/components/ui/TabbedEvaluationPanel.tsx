import React, { useState } from 'react';
import type { SensationRecord, EvaluationSystem } from 'coffee-tracker-shared';
import TraditionalSCAForm from '../forms/TraditionalSCAForm';
import CVAAffectiveForm from '../forms/CVAAffectiveForm';

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
            onClick={() => handleTabChange('legacy')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'legacy'
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
            Traditional SCA
          </button>
          
          <button
            onClick={() => handleTabChange('cva-affective')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cva-affective'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            CVA System
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'legacy' && (
          <LegacyTastingForm
            value={value}
            onChange={handleLegacyChange}
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>CVA Descriptive Assessment</p>
            <p className="text-sm mt-2">Component under development</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Legacy tasting form component (maintains existing functionality)
interface LegacyTastingFormProps {
  value: SensationRecord;
  onChange: (field: keyof TastingNotesData, value: any) => void;
}

const LegacyTastingForm: React.FC<LegacyTastingFormProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Overall Impression - Required Field */}
      <div>
        <label htmlFor="overall-impression" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Overall Impression *
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">1</span>
          <input
            id="overall-impression"
            type="range"
            min="1"
            max="10"
            step="1"
            value={value.overallImpression || 5}
            onChange={(e) => onChange('overallImpression', parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">10</span>
          <div className="w-12 text-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {value.overallImpression || 5}
            </span>
          </div>
        </div>
      </div>

      {/* Optional Rating Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'acidity', label: 'Acidity' },
          { key: 'body', label: 'Body' },
          { key: 'sweetness', label: 'Sweetness' },
          { key: 'flavor', label: 'Flavor' },
          { key: 'aftertaste', label: 'Aftertaste' },
          { key: 'balance', label: 'Balance' }
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {label}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">1</span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={(value as any)[key] || 5}
                onChange={(e) => onChange(key as keyof TastingNotesData, parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">10</span>
              <div className="w-12 text-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {(value as any)[key] || 5}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasting Notes */}
      <div>
        <label htmlFor="tasting-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tasting Notes
        </label>
        <textarea
          id="tasting-notes"
          rows={4}
          value={value.tastingNotes || ''}
          onChange={(e) => onChange('tastingNotes', e.target.value)}
          placeholder="Describe the flavors, aromas, and overall experience..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default TabbedEvaluationPanel;