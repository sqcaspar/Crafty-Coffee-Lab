import { useState, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectWithCustomProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  customPlaceholder?: string;
  customLabel?: string;
  othersValue: string; // The special value that triggers custom input
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * SelectWithCustom - A hybrid component that combines a dropdown select with custom text input
 * 
 * When the user selects the "Others" option (othersValue), a text input field appears
 * allowing them to enter a custom value. This component maintains both the dropdown
 * selection and the custom input state internally.
 */
export default function SelectWithCustom({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option...',
  customPlaceholder = 'Enter custom value...',
  customLabel = 'Custom Value',
  othersValue,
  required = false,
  error,
  disabled = false
}: SelectWithCustomProps) {
  // Determine if we're in custom input mode
  const isCustomMode = !options.some(option => option.value === value) && value !== '';
  const isOthersSelected = value === othersValue;
  const showCustomInput = isOthersSelected || isCustomMode;
  
  // Local state for custom input
  const [customValue, setCustomValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  
  // Initialize state based on current value
  useEffect(() => {
    if (options.some(option => option.value === value)) {
      // Value is a predefined option
      setDropdownValue(value);
      setCustomValue('');
    } else if (value && value !== othersValue) {
      // Value is a custom value
      setDropdownValue(othersValue);
      setCustomValue(value);
    } else {
      // Empty or Others selected
      setDropdownValue(value);
      setCustomValue('');
    }
  }, [value, options, othersValue]);
  
  // Handle dropdown selection change
  const handleDropdownChange = (selectedValue: string) => {
    setDropdownValue(selectedValue);
    
    if (selectedValue === othersValue) {
      // Others selected - keep current custom value or empty
      onChange(customValue || othersValue);
    } else {
      // Predefined option selected
      setCustomValue('');
      onChange(selectedValue);
    }
  };
  
  // Handle custom input change
  const handleCustomChange = (customInput: string) => {
    setCustomValue(customInput);
    onChange(customInput || othersValue);
  };
  
  // Handle blur events
  const handleDropdownBlur = () => {
    if (onBlur) {
      const currentValue = dropdownValue === othersValue ? customValue : dropdownValue;
      onBlur(currentValue);
    }
  };
  
  const handleCustomBlur = () => {
    if (onBlur) {
      onBlur(customValue || othersValue);
    }
  };
  
  return (
    <div className="space-y-1">
      {/* Main label */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Dropdown select */}
      <select
        id={id}
        name={id}
        value={dropdownValue}
        onChange={(e) => handleDropdownChange(e.target.value)}
        onBlur={handleDropdownBlur}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 text-red-900' 
            : 'border-gray-300 text-gray-900'
          }
        `}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : 'false'}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom input field - shown when "Others" is selected */}
      {showCustomInput && (
        <div className="mt-2">
          <label htmlFor={`${id}-custom`} className="block text-sm font-medium text-gray-600 mb-1">
            {customLabel}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            id={`${id}-custom`}
            name={`${id}-custom`}
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            onBlur={handleCustomBlur}
            placeholder={customPlaceholder}
            disabled={disabled}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${error 
                ? 'border-red-300 text-red-900' 
                : 'border-gray-300 text-gray-900'
              }
            `}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}