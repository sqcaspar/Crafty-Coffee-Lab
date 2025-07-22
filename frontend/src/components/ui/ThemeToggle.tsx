import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function ThemeToggle({ size = 'medium', showLabel = true }: ThemeToggleProps) {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-12 h-12';
      case 'medium':
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-6 h-6';
      case 'medium':
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={toggleTheme}
        className={`
          ${getButtonSize()}
          flex items-center justify-center
          rounded-lg
          bg-gray-100 hover:bg-gray-200 
          dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-600 hover:text-gray-800
          dark:text-gray-400 dark:hover:text-gray-200
          border border-gray-200 dark:border-gray-700
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          shadow-sm hover:shadow-md
          active:scale-95
        `}
        title={`Current: ${getLabel()}. Click to cycle themes.`}
        aria-label={`Toggle theme. Currently ${getLabel().toLowerCase()}.`}
      >
        <div className={`${getIconSize()} transition-transform duration-200`}>
          {getIcon()}
        </div>
      </button>

      {showLabel && (
        <div className="hidden sm:block">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Theme
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getLabel()} {theme === 'system' && `(${actualTheme})`}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for minimal spaces
export function CompactThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'light') {
      return '☀️';
    } else if (theme === 'dark') {
      return '🌙';
    } else {
      return '💻';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        w-8 h-8 flex items-center justify-center
        rounded-lg
        bg-gray-100 hover:bg-gray-200 
        dark:bg-gray-800 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        text-sm
        active:scale-95
      "
      title={`Theme: ${theme}`}
      aria-label={`Toggle theme. Currently ${theme}.`}
    >
      {getIcon()}
    </button>
  );
}