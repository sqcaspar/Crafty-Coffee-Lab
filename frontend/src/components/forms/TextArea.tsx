interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

export default function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 3,
  maxLength,
  disabled = false
}: TextAreaProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          resize-vertical
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
          }
        `}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : 'false'}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}