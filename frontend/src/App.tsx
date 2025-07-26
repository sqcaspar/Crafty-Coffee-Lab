//comment
import { useState, useEffect } from 'react';
import { ToastProvider } from './components/ui/ToastContainer';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import TabContent from './components/TabContent';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export type ActiveTab = 'home' | 'input' | 'recipes' | 'collections' | 'favorites';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Setup tab navigation keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '1',
        callback: () => handleTabChange('home'),
        description: 'Go to Home tab'
      },
      {
        key: '2',
        callback: () => handleTabChange('input'),
        description: 'Go to Brew Journal tab'
      },
      {
        key: '3',
        callback: () => handleTabChange('recipes'),
        description: 'Go to My Brews tab'
      },
      {
        key: '4',
        callback: () => handleTabChange('favorites'),
        description: 'Go to Top Picks tab'
      }
    ]
  });

  // Handle URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      if (['home', 'input', 'recipes', 'collections', 'favorites'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    // Set initial tab from URL hash
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    
    // Save to localStorage for persistence
    localStorage.setItem('coffeeTracker_activeTab', tab);
  };

  // Restore tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('coffeeTracker_activeTab') as ActiveTab;
    if (savedTab && ['home', 'input', 'recipes', 'collections', 'favorites'].includes(savedTab)) {
      setActiveTab(savedTab);
      window.location.hash = savedTab;
    }
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout onDataRefresh={() => {
          // Force re-render of components that might need to refresh after restore
          window.location.reload();
        }}>
          <Navigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
          <TabContent 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
          />
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App
