import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 py-4">
              Coffee Brewing Recipe Tracker
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Connected</span>
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
    </div>
  );
}