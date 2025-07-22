import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles = "max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 dark:ring-gray-600 overflow-hidden transition-all duration-300 ease-in-out";
    const animationStyles = isLeaving 
      ? "transform translate-x-full opacity-0" 
      : "transform translate-x-0 opacity-100";
    
    return `${baseStyles} ${animationStyles}`;
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700'
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700'
        };
      default:
        return {
          icon: 'ℹ️',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-600'
        };
    }
  };

  const { icon, color, bgColor, borderColor } = getIconAndColor();

  return (
    <div className={getToastStyles()}>
      <div className={`p-4 ${bgColor} ${borderColor} border-l-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg" role="img" aria-label={type}>
              {icon}
            </span>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${color}`}>
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Close notification"
            >
              <span className="sr-only">Close</span>
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}