import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Check system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('coffeeTracker_theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Update actual theme based on theme setting
  useEffect(() => {
    let resolvedTheme: 'light' | 'dark';

    if (theme === 'system') {
      resolvedTheme = getSystemTheme();
    } else {
      resolvedTheme = theme;
    }

    setActualTheme(resolvedTheme);

    // Update document class for Tailwind CSS
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color for browser chrome
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setActualTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('coffeeTracker_theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      handleSetTheme('dark');
    } else if (theme === 'dark') {
      handleSetTheme('system');
    } else {
      handleSetTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}