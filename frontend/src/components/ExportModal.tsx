import { useState, useEffect } from 'react';
import { RecipeSummary } from '../shared/types/recipe';
import { 
  ExportFormat, 
  ExportOptions,
  ExportFieldConfig,
  exportService,
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMAT_DESCRIPTIONS
} from '../services/exportService';
import { exportTemplateService, ExportTemplate } from '../services/exportTemplates';
import { useToast } from './ui/ToastContainer';
import LoadingSpinner from './ui/LoadingSpinner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: RecipeSummary[];
  selectedRecipes?: Set<string>;
  title?: string;
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  recipes, 
  selectedRecipes,
  title = "Export Recipes"
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [includeFullDetails, setIncludeFullDetails] = useState(true);
  const [customFilename, setCustomFilename] = useState('');
  const [includeStats, setIncludeStats] = useState(false);
  const [includeCollections, setIncludeCollections] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [fieldConfig, setFieldConfig] = useState<Partial<ExportFieldConfig>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  const { showSuccess, showError } = useToast();

  // Load templates on mount
  useEffect(() => {
    const allTemplates = exportTemplateService.getAllTemplates();
    setTemplates(allTemplates);
  }, []);

  // Determine which recipes to export
  const recipesToExport = selectedRecipes && selectedRecipes.size > 0
    ? recipes.filter(recipe => selectedRecipes.has(recipe.recipeId))
    : recipes;

  const handleExport = async () => {
    if (recipesToExport.length === 0) {
      showError('Export Error', 'No recipes selected for export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('');

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeFullDetails,
        filename: customFilename.trim() || undefined,
        includeStats: includeStats && includeFullDetails,
        includeCollections: includeCollections && includeFullDetails,
        dateRange: dateRange.start && dateRange.end ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        } : undefined,
        fieldConfig: Object.keys(fieldConfig).length > 0 ? fieldConfig : undefined
      };

      await exportService.exportRecipes(
        recipesToExport,
        options,
        (progress, message) => {
          setExportProgress(progress);
          setExportMessage(message);
        }
      );

      showSuccess(
        'Export Complete', 
        `Successfully exported ${recipesToExport.length} recipe${recipesToExport.length !== 1 ? 's' : ''}`
      );
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      showError(
        'Export Failed', 
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportMessage('');
    }
  };

  const handleFormatChange = (format: ExportFormat) => {
    setSelectedFormat(format);
    // Reset filename when format changes
    setCustomFilename('');
    // Clear template selection if format doesn't match
    if (selectedTemplate) {
      const template = exportTemplateService.getTemplate(selectedTemplate);
      if (template && template.format !== format) {
        setSelectedTemplate('');
      }
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = exportTemplateService.getTemplate(templateId);
      if (template) {
        // Apply template settings
        setSelectedFormat(template.format);
        setIncludeFullDetails(template.options.includeFullDetails || false);
        setIncludeStats(template.options.includeStats || false);
        setIncludeCollections(template.options.includeCollections || false);
        setFieldConfig(template.options.fieldConfig || {});
        setCustomFilename('');
      }
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      showError('Template Error', 'Please enter a template name');
      return;
    }

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeFullDetails,
        includeStats: includeStats && includeFullDetails,
        includeCollections: includeCollections && includeFullDetails,
        fieldConfig: Object.keys(fieldConfig).length > 0 ? fieldConfig : undefined
      };

      exportTemplateService.saveTemplate({
        name: templateName.trim(),
        description: templateDescription.trim() || `Custom ${EXPORT_FORMAT_LABELS[selectedFormat]} template`,
        format: selectedFormat,
        options
      });

      // Reload templates
      const updatedTemplates = exportTemplateService.getAllTemplates();
      setTemplates(updatedTemplates);

      // Reset form
      setShowSaveTemplate(false);
      setTemplateName('');
      setTemplateDescription('');

      showSuccess('Template Saved', 'Export template saved successfully');
    } catch (error) {
      showError('Save Failed', 'Failed to save template');
    }
  };

  const getFileExtension = (format: ExportFormat): string => {
    switch (format) {
      case ExportFormat.CSV:
        return 'csv';
      case ExportFormat.EXCEL:
        return 'xlsx';
      case ExportFormat.JSON:
        return 'json';
      case ExportFormat.PDF:
      case ExportFormat.PRINT:
        return 'pdf';
      default:
        return 'txt';
    }
  };

  const generatePreviewFilename = (): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = recipesToExport.length === 1 ? 'recipe' : `${recipesToExport.length}_recipes`;
    const extension = getFileExtension(selectedFormat);
    return `coffee_${suffix}_${timestamp}.${extension}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-6 py-6 shadow-xl transition-all w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isExporting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Export Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Exporting {recipesToExport.length} recipe{recipesToExport.length !== 1 ? 's' : ''}
                {selectedRecipes && selectedRecipes.size > 0 && (
                  <span className="font-medium"> (selected recipes)</span>
                )}
              </span>
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Quick Templates</h3>
              <button
                type="button"
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
                disabled={isExporting}
              >
                {showSaveTemplate ? 'Cancel' : 'Save as Template'}
              </button>
            </div>
            
            {templates.length > 0 && (
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm mb-4"
                disabled={isExporting}
              >
                <option value="">Select a template (optional)</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({EXPORT_FORMAT_LABELS[template.format]})
                  </option>
                ))}
              </select>
            )}
            
            {selectedTemplate && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>{templates.find(t => t.id === selectedTemplate)?.name}</strong>
                  <p className="mt-1 text-blue-600">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                </div>
              </div>
            )}

            {/* Save Template Form */}
            {showSaveTemplate && (
              <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="text-sm font-medium text-blue-900 mb-3">Save Current Settings as Template</h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Template name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      disabled={isExporting}
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Template description (optional)"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                      disabled={isExporting}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowSaveTemplate(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                      disabled={isExporting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isExporting}
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Export Format</h3>
            <div className="space-y-3">
              {Object.values(ExportFormat).map((format) => (
                <label
                  key={format}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === format
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={selectedFormat === format}
                    onChange={() => handleFormatChange(format)}
                    className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isExporting}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {EXPORT_FORMAT_LABELS[format]}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {EXPORT_FORMAT_DESCRIPTIONS[format]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Export Options</h3>
            
            {/* Include Full Details */}
            {selectedFormat !== ExportFormat.PRINT && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeFullDetails}
                  onChange={(e) => setIncludeFullDetails(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isExporting}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include full recipe details</span>
                  <p className="text-xs text-gray-600">
                    Include complete brewing parameters, measurements, and tasting notes
                  </p>
                </div>
              </label>
            )}

            {/* Excel-specific options */}
            {selectedFormat === ExportFormat.EXCEL && includeFullDetails && (
              <>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeStats}
                    onChange={(e) => setIncludeStats(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isExporting}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Include statistics sheet</span>
                    <p className="text-xs text-gray-600">
                      Add a separate sheet with recipe statistics and analytics
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeCollections}
                    onChange={(e) => setIncludeCollections(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isExporting}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Include collections sheet</span>
                    <p className="text-xs text-gray-600">
                      Add a separate sheet with collection information and recipe groupings
                    </p>
                  </div>
                </label>
              </>
            )}

            {/* Custom Filename */}
            {selectedFormat !== ExportFormat.PRINT && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Custom Filename (optional)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder={generatePreviewFilename()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={isExporting}
                  />
                  <span className="text-sm text-gray-500">.{getFileExtension(selectedFormat)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Leave empty for automatic naming
                </p>
              </div>
            )}

            {/* Advanced Options Toggle */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
                disabled={isExporting}
              >
                <svg 
                  className={`w-4 h-4 transform transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Advanced Options</span>
              </button>
            </div>
          </div>

          {/* Advanced Options Panel */}
          {showAdvancedOptions && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced Export Options</h4>
              
              {/* Date Range Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date Range Filter (optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      disabled={isExporting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      disabled={isExporting}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Only export recipes created within this date range
                </p>
              </div>

              {/* Field Selection (for full details exports) */}
              {includeFullDetails && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Field Selection
                  </label>
                  <div className="space-y-3">
                    {/* Basic Info */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-800 mb-2">Basic Information</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldConfig.recipeName !== false}
                            onChange={(e) => setFieldConfig(prev => ({ ...prev, recipeName: e.target.checked }))}
                            className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isExporting}
                          />
                          <span className="text-xs text-gray-700">Recipe Name</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldConfig.dateCreated !== false}
                            onChange={(e) => setFieldConfig(prev => ({ ...prev, dateCreated: e.target.checked }))}
                            className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isExporting}
                          />
                          <span className="text-xs text-gray-700">Date Created</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldConfig.isFavorite !== false}
                            onChange={(e) => setFieldConfig(prev => ({ ...prev, isFavorite: e.target.checked }))}
                            className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isExporting}
                          />
                          <span className="text-xs text-gray-700">Favorite Status</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldConfig.collections !== false}
                            onChange={(e) => setFieldConfig(prev => ({ ...prev, collections: e.target.checked }))}
                            className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isExporting}
                          />
                          <span className="text-xs text-gray-700">Collections</span>
                        </label>
                      </div>
                    </div>

                    {/* Bean Info */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-800 mb-2">Bean Information</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldConfig.beanInfo?.origin !== false}
                            onChange={(e) => setFieldConfig(prev => ({ 
                              ...prev, 
                              beanInfo: { ...prev.beanInfo, origin: e.target.checked }
                            }))}
                            className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isExporting}
                          />
                          <span className="text-xs text-gray-700">Origin</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldConfig.beanInfo?.processingMethod !== false}
                            onChange={(e) => setFieldConfig(prev => ({ 
                              ...prev, 
                              beanInfo: { ...prev.beanInfo, processingMethod: e.target.checked }
                            }))}
                            className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isExporting}
                          />
                          <span className="text-xs text-gray-700">Processing Method</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldConfig.beanInfo?.roastingLevel !== false}
                            onChange={(e) => setFieldConfig(prev => ({ 
                              ...prev, 
                              beanInfo: { ...prev.beanInfo, roastingLevel: e.target.checked }
                            }))}
                            className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isExporting}
                          />
                          <span className="text-xs text-gray-700">Roasting Level</span>
                        </label>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <span className="text-xs text-gray-600">Quick select:</span>
                      <button
                        type="button"
                        onClick={() => setFieldConfig({})}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        disabled={isExporting}
                      >
                        All Fields
                      </button>
                      <button
                        type="button"
                        onClick={() => setFieldConfig({
                          recipeName: true,
                          dateCreated: true,
                          beanInfo: { origin: true },
                          measurements: { coffeeWaterRatio: true },
                          sensationRecord: { overallImpression: true }
                        })}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        disabled={isExporting}
                      >
                        Essential Only
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <LoadingSpinner size="small" />
                <span className="text-sm font-medium text-gray-900">Exporting...</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>{exportMessage}</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Cancel'}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || recipesToExport.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span>Exporting...</span>
                </div>
              ) : (
                <>
                  Export {recipesToExport.length} Recipe{recipesToExport.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}