import { useState, useRef } from 'react';
import { BackupData, RestoreOptions, backupService } from '../services/backupService';
import { useToast } from './ui/ToastContainer';
import LoadingSpinner from './ui/LoadingSpinner';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete?: () => void;
}

type ModalMode = 'menu' | 'backup' | 'restore' | 'history';

export default function BackupRestoreModal({
  isOpen,
  onClose,
  onRestoreComplete
}: BackupRestoreModalProps) {
  const [mode, setMode] = useState<ModalMode>('menu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    includeRecipes: true,
    includeCollections: true,
    includeUserPreferences: true,
    overwriteExisting: false,
    createBackupBeforeRestore: true
  });
  const [backupHistory, setBackupHistory] = useState(backupService.getBackupHistory());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useToast();

  // Handle backup creation
  const handleCreateBackup = async () => {
    setIsProcessing(true);
    try {
      const result = await backupService.createBackup();
      
      if (result.success && result.data) {
        await backupService.exportBackupToFile(result.data);
        
        showSuccess(
          'Backup Created Successfully!',
          `Backup contains ${result.data.metadata.totalRecipes} recipes and ${result.data.metadata.totalCollections} collections.`
        );
        
        // Refresh backup history
        setBackupHistory(backupService.getBackupHistory());
        
        setMode('menu');
      } else {
        showError('Backup Failed', result.error || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Backup creation error:', error);
      showError('Backup Failed', 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file selection for restore
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await backupService.importBackupFromFile(file);
      
      if (result.success && result.data) {
        setBackupData(result.data);
        setMode('restore');
        showInfo('Backup File Loaded', 'Review the options below and click Restore to proceed.');
      } else {
        showError('Import Failed', result.error || 'Failed to read backup file');
      }
    } catch (error) {
      console.error('File import error:', error);
      showError('Import Failed', 'Could not read the backup file');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle restore operation
  const handleRestore = async () => {
    if (!backupData) return;

    setIsProcessing(true);
    try {
      const result = await backupService.restoreFromBackup(backupData, restoreOptions);
      
      if (result.success) {
        showSuccess('Restore Completed!', result.message);
        onRestoreComplete?.();
        onClose();
      } else {
        showError('Restore Failed', result.message);
        if (result.errors && result.errors.length > 0) {
          console.error('Restore errors:', result.errors);
        }
      }
    } catch (error) {
      console.error('Restore error:', error);
      showError('Restore Failed', 'An unexpected error occurred during restore');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-6 py-6 shadow-xl transition-all w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {mode !== 'menu' && (
                <button
                  onClick={() => setMode('menu')}
                  className="rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'menu' && 'Backup & Restore'}
                {mode === 'backup' && 'Create Backup'}
                {mode === 'restore' && 'Restore from Backup'}
                {mode === 'history' && 'Backup History'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content based on mode */}
          {mode === 'menu' && (
            <div className="space-y-4">
              {/* Main Menu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create Backup */}
                <button
                  onClick={() => setMode('backup')}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Backup</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Export all your recipes, collections, and preferences to a backup file.
                  </p>
                </button>

                {/* Restore from Backup */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Restore Data</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Import recipes and collections from a previously created backup file.
                  </p>
                </button>

                {/* Backup History */}
                <button
                  onClick={() => setMode('history')}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backup History</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View your recent backup activity and download previous backups.
                  </p>
                </button>

                {/* Quick Backup */}
                <button
                  onClick={handleCreateBackup}
                  className="p-6 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">Quick Backup</h3>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Create and download a backup immediately with all default settings.
                  </p>
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                      Backup & Restore Tips:
                    </p>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1">
                      <li>• Backups include all recipes, collections, and user preferences</li>
                      <li>• Regular backups help protect against data loss</li>
                      <li>• Backup files are in JSON format and can be shared between devices</li>
                      <li>• A safety backup is created automatically before restore operations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'backup' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Create Complete Backup
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will create a comprehensive backup of all your data including recipes, collections, favorites, and user preferences.
                </p>
                
                <button
                  onClick={handleCreateBackup}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {isProcessing && <LoadingSpinner size="small" color="white" />}
                  <span>{isProcessing ? 'Creating Backup...' : 'Create & Download Backup'}</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'restore' && backupData && (
            <div className="space-y-6">
              {/* Backup Info */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Backup Information
                </h3>
                <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <div>Created: {new Date(backupData.timestamp).toLocaleString()}</div>
                  <div>Recipes: {backupData.metadata.totalRecipes}</div>
                  <div>Collections: {backupData.metadata.totalCollections}</div>
                  <div>Version: {backupData.version}</div>
                </div>
              </div>

              {/* Restore Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Restore Options</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={restoreOptions.includeRecipes}
                      onChange={(e) => setRestoreOptions(prev => ({ ...prev, includeRecipes: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Restore Recipes ({backupData.metadata.totalRecipes})
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={restoreOptions.includeCollections}
                      onChange={(e) => setRestoreOptions(prev => ({ ...prev, includeCollections: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Restore Collections ({backupData.metadata.totalCollections})
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={restoreOptions.includeUserPreferences}
                      onChange={(e) => setRestoreOptions(prev => ({ ...prev, includeUserPreferences: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Restore User Preferences (theme, settings)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={restoreOptions.overwriteExisting}
                      onChange={(e) => setRestoreOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Overwrite Existing Items
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={restoreOptions.createBackupBeforeRestore}
                      onChange={(e) => setRestoreOptions(prev => ({ ...prev, createBackupBeforeRestore: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Create Safety Backup Before Restore (Recommended)
                    </span>
                  </label>
                </div>
              </div>

              {/* Restore Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMode('menu')}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing && <LoadingSpinner size="small" color="white" />}
                  <span>{isProcessing ? 'Restoring...' : 'Restore Data'}</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'history' && (
            <div className="space-y-4">
              {backupHistory.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recent backup activity ({backupHistory.length} backups)
                  </p>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {backupHistory.map((backup, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(backup.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {backup.recipesCount} recipes, {backup.collectionsCount} collections
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(backup.size)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(backup.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        backupService.clearBackupHistory();
                        setBackupHistory([]);
                      }}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Clear History
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Backup History
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create your first backup to see it listed here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}