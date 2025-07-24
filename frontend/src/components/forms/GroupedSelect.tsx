interface SelectOption {
  value: string;
  label: string;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface GroupedSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  groups: SelectGroup[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  onBlur?: (value: string) => void;
}

export default function GroupedSelect({
  id,
  label,
  value,
  onChange,
  groups,
  placeholder = 'Select an option...',
  required = false,
  error,
  disabled = false,
  onBlur
}: GroupedSelectProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(value);
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
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
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Type exports for external use
export type { SelectOption, SelectGroup, GroupedSelectProps };