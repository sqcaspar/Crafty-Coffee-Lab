import { ReactNode, useState } from 'react';
import BackupRestoreModal from './BackupRestoreModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import ThemeToggle from './ui/ThemeToggle';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
  children: ReactNode;
  onDataRefresh?: () => void;
}

export default function Layout({ children, onDataRefresh }: LayoutProps) {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const { toggleTheme } = useTheme();

  // Setup global keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'b',
        ctrlKey: true,
        callback: () => setShowBackupModal(true),
        description: 'Open backup & restore'
      },
      {
        key: '/',
        ctrlKey: true,
        callback: () => setShowShortcutsModal(true),
        description: 'Show keyboard shortcuts'
      },
      {
        key: 'F1',
        callback: () => setShowShortcutsModal(true),
        description: 'Show help and shortcuts'
      },
      {
        key: 't',
        ctrlKey: true,
        shiftKey: true,
        callback: () => toggleTheme(),
        description: 'Toggle dark/light theme'
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white py-4">
              Coffee Brewing Recipe Tracker
            </h1>
            <div className="flex items-center space-x-4">
              {/* Keyboard Shortcuts Button */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title="Keyboard Shortcuts (Ctrl+/ or F1)"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                Help
              </button>

              {/* Backup Button */}
              <button
                onClick={() => setShowBackupModal(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title="Backup & Restore (Ctrl+B)"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Backup
              </button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Coffee Brewing Recipe Tracker v1.0</span>
              <span>•</span>
              <span>Step 16 - UX Enhancements</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs">Export features available in Recipe List</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onRestoreComplete={() => {
          setShowBackupModal(false);
          onDataRefresh?.();
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}