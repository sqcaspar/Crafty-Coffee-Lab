import React from 'react';
import type { TurbulenceStep } from '../../shared/types/recipe';

interface TurbulenceStepsProps {
  value: TurbulenceStep[];
  onChange: (steps: TurbulenceStep[]) => void;
  error?: string;
}

export const TurbulenceSteps: React.FC<TurbulenceStepsProps> = ({
  value,
  onChange,
  error
}) => {
  const updateStep = (index: number, field: keyof TurbulenceStep, fieldValue: string) => {
    const updatedSteps = [...value];
    updatedSteps[index] = { ...updatedSteps[index], [field]: fieldValue };
    onChange(updatedSteps);
  };

  const addStep = () => {
    const newStep: TurbulenceStep = {
      actionTime: '0:00',
      actionDetails: '',
      volume: ''
    };
    onChange([...value, newStep]);
  };

  const deleteStep = () => {
    if (value.length > 1) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        Turbulence
      </label>
      
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-700 pb-2 border-b border-gray-200">
        <div className="col-span-2">Step</div>
        <div className="col-span-3">Action Time</div>
        <div className="col-span-4">Action Details</div>
        <div className="col-span-3">Volume</div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {value.map((step, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-center">
            {/* Step Number */}
            <div className="col-span-2 text-sm font-medium text-gray-900">
              Step {index + 1}
            </div>
            
            {/* Action Time */}
            <div className="col-span-3">
              <input
                type="text"
                value={step.actionTime}
                onChange={(e) => updateStep(index, 'actionTime', e.target.value)}
                placeholder="0:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            {/* Action Details */}
            <div className="col-span-4">
              <input
                type="text"
                value={step.actionDetails}
                onChange={(e) => updateStep(index, 'actionDetails', e.target.value)}
                placeholder="Gentle Circle Water Pour"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            {/* Volume */}
            <div className="col-span-3">
              <input
                type="text"
                value={step.volume}
                onChange={(e) => updateStep(index, 'volume', e.target.value)}
                placeholder="30ml"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={addStep}
          className="px-4 py-2 bg-yellow-400 text-black text-sm font-medium rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
        >
          + Add Step
        </button>
        
        <button
          type="button"
          onClick={deleteStep}
          disabled={value.length <= 1}
          className="px-4 py-2 bg-yellow-400 text-black text-sm font-medium rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          - Delete Step
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};