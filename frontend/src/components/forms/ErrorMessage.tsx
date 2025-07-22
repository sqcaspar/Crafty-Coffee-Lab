interface ErrorMessageProps {
  error?: string;
  fieldId?: string;
  className?: string;
}

export default function ErrorMessage({ error, fieldId, className = '' }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <p 
      id={fieldId ? `${fieldId}-error` : undefined}
      className={`text-sm text-red-600 ${className}`}
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
}