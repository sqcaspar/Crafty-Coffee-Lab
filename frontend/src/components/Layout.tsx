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
    <div className="min-h-screen bg-mono-white dark:bg-mono-800 transition-colors duration-200">
      {/* Main Content - with top padding for fixed navigation */}
      <main className="pt-24 min-h-screen">
        {children}
      </main>
      
      {/* Floating Action Buttons - positioned in bottom right */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col space-y-3">
        {/* Keyboard Shortcuts Button */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="btn-mono-secondary w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:animate-hover-lift focus-mono"
          title="Keyboard Shortcuts (Ctrl+/ or F1)"
        >
          <svg className="icon-mono" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Backup Button */}
        <button
          onClick={() => setShowBackupModal(true)}
          className="btn-mono-secondary w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:animate-hover-lift focus-mono"
          title="Backup & Restore (Ctrl+B)"
        >
          <svg className="icon-mono" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </button>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-mono-white dark:bg-mono-800 border-t border-mono-200 dark:border-mono-700 mt-section transition-colors duration-200">
        <div className="container-mono py-6">
          <div className="flex items-center justify-between text-body-sm text-mono-500">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-mono-700">Coffee Recipe Tracker</span>
              <span className="text-mono-300">•</span>
              <span>Monochrome Edition</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-caption">Powered by modern design</span>
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