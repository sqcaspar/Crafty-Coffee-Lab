import { useState, useEffect } from 'react';

export interface RatingSliderProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  showStars?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
  disabled?: boolean;
  required?: boolean;
}

const colorClasses = {
  blue: {
    track: 'bg-blue-200 dark:bg-blue-800',
    fill: 'bg-blue-500 dark:bg-blue-400',
    thumb: 'bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    track: 'bg-green-200 dark:bg-green-800',
    fill: 'bg-green-500 dark:bg-green-400',
    thumb: 'bg-green-500 dark:bg-green-400 border-green-500 dark:border-green-400',
    text: 'text-green-600 dark:text-green-400'
  },
  yellow: {
    track: 'bg-yellow-200 dark:bg-yellow-800',
    fill: 'bg-yellow-500 dark:bg-yellow-400',
    thumb: 'bg-yellow-500 dark:bg-yellow-400 border-yellow-500 dark:border-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-500'
  },
  red: {
    track: 'bg-red-200 dark:bg-red-800',
    fill: 'bg-red-500 dark:bg-red-400',
    thumb: 'bg-red-500 dark:bg-red-400 border-red-500 dark:border-red-400',
    text: 'text-red-600 dark:text-red-400'
  },
  purple: {
    track: 'bg-purple-200 dark:bg-purple-800',
    fill: 'bg-purple-500 dark:bg-purple-400',
    thumb: 'bg-purple-500 dark:bg-purple-400 border-purple-500 dark:border-purple-400',
    text: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    track: 'bg-orange-200 dark:bg-orange-800',
    fill: 'bg-orange-500 dark:bg-orange-400',
    thumb: 'bg-orange-500 dark:bg-orange-400 border-orange-500 dark:border-orange-400',
    text: 'text-orange-600 dark:text-orange-400'
  }
};

export default function EnhancedRatingSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  description,
  showStars = false,
  color = 'blue',
  disabled = false,
  required = false
}: RatingSliderProps) {
  const [localValue, setLocalValue] = useState(value || min);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getPercentage = () => {
    return ((localValue - min) / (max - min)) * 100;
  };

  const renderStars = () => {
    if (!showStars || max > 10) return null;

    const starRating = Math.round((localValue / max) * 5);
    
    return (
      <div className="flex items-center space-x-1 mt-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < starRating 
                ? 'text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            } transition-colors duration-200`}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          ({starRating}/5 stars)
        </span>
      </div>
    );
  };

  const getRatingLabel = () => {
    const percentage = getPercentage();
    
    if (percentage >= 90) return { text: 'Exceptional', color: 'text-green-600 dark:text-green-400' };
    if (percentage >= 80) return { text: 'Excellent', color: 'text-green-500 dark:text-green-400' };
    if (percentage >= 70) return { text: 'Very Good', color: 'text-blue-500 dark:text-blue-400' };
    if (percentage >= 60) return { text: 'Good', color: 'text-blue-400 dark:text-blue-400' };
    if (percentage >= 50) return { text: 'Average', color: 'text-yellow-500 dark:text-yellow-400' };
    if (percentage >= 40) return { text: 'Below Average', color: 'text-orange-500 dark:text-orange-400' };
    if (percentage >= 30) return { text: 'Poor', color: 'text-red-400 dark:text-red-400' };
    return { text: 'Very Poor', color: 'text-red-500 dark:text-red-400' };
  };

  const ratingLabel = getRatingLabel();
  const colors = colorClasses[color];

  return (
    <div className="space-y-3">
      {/* Label and Value */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-semibold ${colors.text}`}>
            {localValue.toFixed(step < 1 ? 1 : 0)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / {max}
          </span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      {/* Custom Slider */}
      <div className="relative">
        <div 
          className={`w-full h-2 rounded-full ${colors.track} transition-all duration-200 ${
            isDragging ? 'shadow-lg' : ''
          }`}
        >
          {/* Progress fill */}
          <div 
            className={`h-full rounded-full ${colors.fill} transition-all duration-200`}
            style={{ width: `${getPercentage()}%` }}
          />
        </div>
        
        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={disabled}
          className={`
            absolute top-0 w-full h-2 opacity-0 cursor-pointer
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        />
        
        {/* Custom thumb */}
        <div 
          className={`
            absolute top-1/2 w-5 h-5 rounded-full border-2 transform -translate-y-1/2 transition-all duration-200
            ${colors.thumb} shadow-md
            ${isDragging ? 'scale-110 shadow-lg' : 'hover:scale-105'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{ left: `calc(${getPercentage()}% - 10px)` }}
        />
      </div>

      {/* Rating Labels and Stars */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${ratingLabel.color}`}>
            {ratingLabel.text}
          </span>
        </div>
        
        {/* Scale indicators */}
        <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
          <span>{min}</span>
          <span>•</span>
          <span>{Math.round((min + max) / 2)}</span>
          <span>•</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Stars */}
      {renderStars()}
    </div>
  );
}

// Quick preset component for overall impression
export function OverallRatingSlider({ value, onChange, disabled }: { 
  value: number | undefined; 
  onChange: (value: number) => void; 
  disabled?: boolean;
}) {
  return (
    <EnhancedRatingSlider
      label="Overall Impression"
      value={value}
      onChange={onChange}
      min={1}
      max={10}
      step={0.5}
      description="Your overall evaluation of this coffee brewing result"
      showStars={true}
      color="yellow"
      disabled={disabled}
      required={true}
    />
  );
}

// Taste attribute slider component
export function TasteAttributeSlider({ 
  attribute, 
  value, 
  onChange, 
  disabled 
}: { 
  attribute: 'acidity' | 'body' | 'sweetness' | 'flavor' | 'aftertaste' | 'balance';
  value: number | undefined; 
  onChange: (value: number) => void; 
  disabled?: boolean;
}) {
  const attributeConfig = {
    acidity: {
      label: 'Acidity',
      description: 'Brightness and tartness of the coffee',
      color: 'green' as const
    },
    body: {
      label: 'Body',
      description: 'Weight and mouthfeel of the coffee',
      color: 'red' as const
    },
    sweetness: {
      label: 'Sweetness',
      description: 'Natural sweetness and sugar-like flavors',
      color: 'yellow' as const
    },
    flavor: {
      label: 'Flavor',
      description: 'Overall flavor complexity and character',
      color: 'purple' as const
    },
    aftertaste: {
      label: 'Aftertaste',
      description: 'Lingering flavors after swallowing',
      color: 'orange' as const
    },
    balance: {
      label: 'Balance',
      description: 'Harmony between all taste elements',
      color: 'blue' as const
    }
  };

  const config = attributeConfig[attribute];

  return (
    <EnhancedRatingSlider
      label={config.label}
      value={value}
      onChange={onChange}
      min={1}
      max={10}
      step={0.5}
      description={config.description}
      color={config.color}
      disabled={disabled}
    />
  );
}