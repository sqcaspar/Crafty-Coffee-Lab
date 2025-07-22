interface RatingSliderProps {
  id: string;
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  onBlur?: (value: number | '') => void;
  required?: boolean;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function RatingSlider({
  id,
  label,
  value,
  onChange,
  onBlur,
  required = false,
  error,
  min = 1,
  max = 10,
  step = 1,
  disabled = false
}: RatingSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value);
    onChange(numValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      const numValue = parseInt(e.target.value);
      onBlur(numValue);
    }
  };

  const displayValue = value === '' ? min : value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{min}</span>
          <span className={`
            px-2 py-1 text-sm font-semibold rounded
            ${value === '' 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-blue-100 text-blue-800'
            }
          `}>
            {value === '' ? '?' : value}
          </span>
          <span className="text-sm text-gray-500">{max}</span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          id={id}
          name={id}
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'accent-red-500' : 'accent-blue-500'}
          `}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? 'true' : 'false'}
        />
        
        {/* Range markers */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {Array.from({ length: max - min + 1 }, (_, i) => (
            <span key={i + min} className="w-1 text-center">
              {i + min}
            </span>
          ))}
        </div>
      </div>
      
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {/* Visual rating indicators */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}