interface ValidationSummaryProps {
  errors: string[];
  isVisible: boolean;
  onClose?: () => void;
}

export default function ValidationSummary({ errors, isVisible, onClose }: ValidationSummaryProps) {
  if (!isVisible || errors.length === 0) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-5 h-5 text-red-400" role="img" aria-label="Error">
            ⚠️
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Please correct the following errors:
          </h3>
          <div className="mt-2">
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              aria-label="Close error summary"
            >
              <span className="sr-only">Dismiss</span>
              <span className="text-sm">✕</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}