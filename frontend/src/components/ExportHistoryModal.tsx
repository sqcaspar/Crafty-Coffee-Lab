import { useState, useEffect } from 'react';
import { 
  ExportHistoryItem, 
  ExportStats,
  exportHistoryService 
} from '../services/exportHistoryService';
import { EXPORT_FORMAT_LABELS } from '../services/exportService';
import LoadingSpinner from './ui/LoadingSpinner';

interface ExportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportHistoryModal({ isOpen, onClose }: ExportHistoryModalProps) {
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'history' | 'stats'>('history');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const exportHistory = exportHistoryService.getExportHistory();
      const exportStats = exportHistoryService.getExportStats();
      
      setHistory(exportHistory);
      setStats(exportStats);
    } catch (error) {
      console.error('Failed to load export history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = exportHistoryService.searchHistory(query);
      setHistory(results);
    } else {
      const allHistory = exportHistoryService.getExportHistory();
      setHistory(allHistory);
    }
  };

  const handleRemoveItem = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this export from history?');
    if (confirmed) {
      exportHistoryService.removeFromHistory(id);
      loadData(); // Refresh data
    }
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm('Are you sure you want to clear all export history? This cannot be undone.');
    if (confirmed) {
      exportHistoryService.clearHistory();
      loadData(); // Refresh data
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-6 py-6 shadow-xl transition-all w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Export History</h2>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Export History
              </button>
              <button
                onClick={() => setSelectedTab('stats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
              <span className="ml-3 text-lg text-gray-600">Loading export history...</span>
            </div>
          ) : (
            <>
              {/* History Tab */}
              {selectedTab === 'history' && (
                <div>
                  {/* Search and Actions */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Search exports..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="ml-4 px-3 py-2 text-sm text-red-600 hover:text-red-700 focus:outline-none"
                      disabled={history.length === 0}
                    >
                      Clear History
                    </button>
                  </div>

                  {/* History List */}
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Export History</h3>
                      <p className="text-gray-600">
                        {searchQuery ? 'No exports match your search criteria.' : 'You haven\'t exported any recipes yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900">{item.filename}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                              <span>{exportHistoryService.formatExportDate(item.timestamp)}</span>
                              <span>{EXPORT_FORMAT_LABELS[item.format]}</span>
                              <span>{item.recipeCount} recipe{item.recipeCount !== 1 ? 's' : ''}</span>
                              {item.fileSize && (
                                <span>{exportHistoryService.formatFileSize(item.fileSize)}</span>
                              )}
                            </div>
                            {item.status === 'failed' && item.errorMessage && (
                              <p className="mt-2 text-sm text-red-600">{item.errorMessage}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.downloadUrl && item.status === 'completed' && (
                              <a
                                href={item.downloadUrl}
                                download={item.filename}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                Download
                              </a>
                            )}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                              title="Remove from history"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {selectedTab === 'stats' && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalExports}</div>
                      <div className="text-sm text-blue-800">Total Exports</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.successfulExports}</div>
                      <div className="text-sm text-green-800">Successful</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stats.failedExports}</div>
                      <div className="text-sm text-red-800">Failed</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalRecipesExported}</div>
                      <div className="text-sm text-purple-800">Recipes Exported</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Most Used Format</h4>
                      <div className="text-lg text-gray-700">
                        {EXPORT_FORMAT_LABELS[stats.mostUsedFormat]}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Average File Size</h4>
                      <div className="text-lg text-gray-700">
                        {stats.averageFileSize > 0 
                          ? exportHistoryService.formatFileSize(stats.averageFileSize)
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>

                  {stats.totalExports > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Export Success Rate</h4>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(stats.successfulExports / stats.totalExports) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {Math.round((stats.successfulExports / stats.totalExports) * 100)}% success rate
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}