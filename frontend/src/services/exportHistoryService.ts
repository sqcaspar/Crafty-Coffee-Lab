import { ExportFormat, ExportOptions } from './exportService';

// Export history types
export interface ExportHistoryItem {
  id: string;
  timestamp: Date;
  filename: string;
  format: ExportFormat;
  recipeCount: number;
  options: ExportOptions;
  status: 'completed' | 'failed';
  errorMessage?: string;
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: Date;
}

export interface ExportStats {
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  mostUsedFormat: ExportFormat;
  totalRecipesExported: number;
  averageFileSize: number;
}

class ExportHistoryService {
  private readonly STORAGE_KEY = 'coffeeTracker_exportHistory';
  private readonly MAX_HISTORY_ITEMS = 50;

  // Get export history
  getExportHistory(): ExportHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const history = JSON.parse(stored);
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to load export history:', error);
      return [];
    }
  }

  // Add export to history
  addExportToHistory(item: Omit<ExportHistoryItem, 'id' | 'timestamp'>): string {
    try {
      const history = this.getExportHistory();
      
      const newItem: ExportHistoryItem = {
        ...item,
        id: this.generateId(),
        timestamp: new Date()
      };

      // Add to beginning of array
      history.unshift(newItem);

      // Keep only the most recent items
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }

      // Clean up expired items
      const cleanedHistory = this.cleanExpiredItems(history);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedHistory));
      return newItem.id;
    } catch (error) {
      console.error('Failed to save export history:', error);
      return 'error_' + Date.now();
    }
  }

  // Update export status
  updateExportStatus(
    id: string, 
    status: 'completed' | 'failed', 
    updates: Partial<ExportHistoryItem> = {}
  ): void {
    try {
      const history = this.getExportHistory();
      const itemIndex = history.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        history[itemIndex] = {
          ...history[itemIndex],
          status,
          ...updates
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Failed to update export status:', error);
    }
  }

  // Remove export from history
  removeFromHistory(id: string): void {
    try {
      const history = this.getExportHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove export from history:', error);
    }
  }

  // Clear all export history
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear export history:', error);
    }
  }

  // Get export statistics
  getExportStats(): ExportStats {
    const history = this.getExportHistory();
    
    if (history.length === 0) {
      return {
        totalExports: 0,
        successfulExports: 0,
        failedExports: 0,
        mostUsedFormat: ExportFormat.CSV,
        totalRecipesExported: 0,
        averageFileSize: 0
      };
    }

    const successful = history.filter(item => item.status === 'completed');
    const failed = history.filter(item => item.status === 'failed');
    
    // Count format usage
    const formatCounts = history.reduce((acc, item) => {
      acc[item.format] = (acc[item.format] || 0) + 1;
      return acc;
    }, {} as Record<ExportFormat, number>);

    const mostUsedFormat = Object.keys(formatCounts).reduce((a, b) => 
      formatCounts[a as ExportFormat] > formatCounts[b as ExportFormat] ? a : b
    ) as ExportFormat;

    const totalRecipesExported = successful.reduce((sum, item) => sum + item.recipeCount, 0);
    const filesWithSize = successful.filter(item => item.fileSize);
    const averageFileSize = filesWithSize.length > 0 
      ? filesWithSize.reduce((sum, item) => sum + (item.fileSize || 0), 0) / filesWithSize.length
      : 0;

    return {
      totalExports: history.length,
      successfulExports: successful.length,
      failedExports: failed.length,
      mostUsedFormat,
      totalRecipesExported,
      averageFileSize
    };
  }

  // Get recent exports (last 10)
  getRecentExports(): ExportHistoryItem[] {
    return this.getExportHistory().slice(0, 10);
  }

  // Search export history
  searchHistory(query: string): ExportHistoryItem[] {
    const history = this.getExportHistory();
    const lowercaseQuery = query.toLowerCase();
    
    return history.filter(item =>
      item.filename.toLowerCase().includes(lowercaseQuery) ||
      item.format.toLowerCase().includes(lowercaseQuery) ||
      item.status.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get exports by date range
  getExportsByDateRange(start: Date, end: Date): ExportHistoryItem[] {
    const history = this.getExportHistory();
    
    return history.filter(item => 
      item.timestamp >= start && item.timestamp <= end
    );
  }

  // Clean up expired items
  private cleanExpiredItems(history: ExportHistoryItem[]): ExportHistoryItem[] {
    const now = new Date();
    return history.filter(item => 
      !item.expiresAt || item.expiresAt > now
    );
  }

  // Generate unique ID
  private generateId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  // Format export date for display
  formatExportDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const exportHistoryService = new ExportHistoryService();