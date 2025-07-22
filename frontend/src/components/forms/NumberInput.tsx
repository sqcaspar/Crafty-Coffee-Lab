interface NumberInputProps {
  id: string;
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  onBlur?: (value: number | '') => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function NumberInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  unit,
  min,
  max,
  step = 0.1,
  disabled = false
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange('');
      return;
    }
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      const inputValue = e.target.value;
      if (inputValue === '') {
        onBlur('');
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          onBlur(numValue);
        } else {
          onBlur('');
        }
      }
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {unit && <span className="text-gray-500 text-sm ml-1">({unit})</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300' 
              : 'border-gray-300 text-gray-900 placeholder-gray-400'
            }
          `}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? 'true' : 'false'}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{unit}</span>
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}