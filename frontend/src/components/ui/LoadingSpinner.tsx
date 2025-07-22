interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'gray' | 'white';
  message?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'blue',
  message 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'gray':
        return 'text-gray-600';
      case 'white':
        return 'text-white';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${getSizeClasses()} ${getColorClasses()} animate-spin`}>
        <svg 
          className="w-full h-full" 
          fill="none" 
          viewBox="0 0 24 24"
          role="img"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m 4,12 a 8,8 0 0,1 8,-8 V 0 a 12,12 0 0,0 -12,12 z"
          />
        </svg>
      </div>
      {message && (
        <p className={`text-sm ${getColorClasses()}`}>
          {message}
        </p>
      )}
    </div>
  );
}