import { useState, useEffect } from 'react';
import { Recipe } from '../shared/types/recipe';
import { 
  comparisonService, 
  ComparisonItem, 
  ComparisonAnalysis 
} from '../services/comparisonService';
import { useToast } from './ui/ToastContainer';
import LoadingSpinner from './ui/LoadingSpinner';

interface RecipeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeComparisonModal({ isOpen, onClose }: RecipeComparisonModalProps) {
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'comparison' | 'analysis'>('comparison');
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadComparisonData();
    }
  }, [isOpen]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const items = await comparisonService.loadComparisonRecipes();
      setComparisonItems(items);
      
      const recipes = items.map(item => item.recipe);
      const analysisData = comparisonService.analyzeComparison(recipes);
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
      showError('Loading Error', 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromComparison = (recipeId: string) => {
    comparisonService.removeFromComparison(recipeId);
    loadComparisonData();
    showInfo('Recipe Removed', 'Recipe removed from comparison');
  };

  const handleClearComparison = () => {
    const confirmed = window.confirm('Are you sure you want to clear all comparisons?');
    if (confirmed) {
      comparisonService.clearComparison();
      setComparisonItems([]);
      setAnalysis(null);
      showSuccess('Comparison Cleared', 'All recipes removed from comparison');
    }
  };

  const handleExportComparison = (format: 'csv' | 'json') => {
    if (comparisonItems.length === 0) {
      showError('Export Error', 'No recipes to export');
      return;
    }

    try {
      const recipes = comparisonItems.map(item => item.recipe);
      const exportData = comparisonService.exportComparison(recipes, format);
      
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `recipe_comparison_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccess('Export Complete', `Comparison exported as ${format.toUpperCase()}`);
    } catch (error) {
      showError('Export Failed', 'Failed to export comparison data');
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') return value.toString();
    return value.toString();
  };

  const getComparisonField = (recipe: Recipe, field: string): any => {
    switch (field) {
      case 'origin':
        return recipe.beanInfo?.origin;
      case 'processingMethod':
        return recipe.beanInfo?.processingMethod;
      case 'roastingLevel':
        return recipe.beanInfo?.roastingLevel;
      case 'brewingMethod':
        return recipe.brewingParameters?.brewingMethod;
      case 'waterTemperature':
        return recipe.brewingParameters?.waterTemperature;
      case 'grinderModel':
        return recipe.brewingParameters?.grinderModel;
      case 'grinderUnit':
        return recipe.brewingParameters?.grinderUnit;
      case 'coffeeBeans':
        return recipe.measurements?.coffeeBeans;
      case 'water':
        return recipe.measurements?.water;
      case 'coffeeWaterRatio':
        return recipe.measurements?.coffeeWaterRatio;
      case 'tds':
        return recipe.measurements?.tds;
      case 'extractionYield':
        return recipe.measurements?.extractionYield;
      case 'overallImpression':
        return recipe.sensationRecord?.overallImpression;
      case 'acidity':
        return recipe.sensationRecord?.acidity;
      case 'body':
        return recipe.sensationRecord?.body;
      case 'sweetness':
        return recipe.sensationRecord?.sweetness;
      case 'tastingNotes':
        return recipe.sensationRecord?.tastingNotes;
      default:
        return null;
    }
  };

  const comparisonFields = [
    { key: 'recipeName', label: 'Recipe Name', category: 'Basic' },
    { key: 'origin', label: 'Origin', category: 'Bean Info' },
    { key: 'processingMethod', label: 'Processing', category: 'Bean Info' },
    { key: 'roastingLevel', label: 'Roast Level', category: 'Bean Info' },
    { key: 'brewingMethod', label: 'Brewing Method', category: 'Brewing' },
    { key: 'waterTemperature', label: 'Water Temp (°C)', category: 'Brewing' },
    { key: 'grinderModel', label: 'Grinder', category: 'Brewing' },
    { key: 'grinderUnit', label: 'Grind Setting', category: 'Brewing' },
    { key: 'coffeeBeans', label: 'Coffee (g)', category: 'Measurements' },
    { key: 'water', label: 'Water (g)', category: 'Measurements' },
    { key: 'coffeeWaterRatio', label: 'Ratio', category: 'Measurements' },
    { key: 'tds', label: 'TDS (%)', category: 'Measurements' },
    { key: 'extractionYield', label: 'Extraction (%)', category: 'Measurements' },
    { key: 'overallImpression', label: 'Rating', category: 'Tasting' },
    { key: 'acidity', label: 'Acidity', category: 'Tasting' },
    { key: 'body', label: 'Body', category: 'Tasting' },
    { key: 'sweetness', label: 'Sweetness', category: 'Tasting' },
    { key: 'tastingNotes', label: 'Tasting Notes', category: 'Tasting' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-6 py-6 shadow-xl transition-all w-full max-w-7xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recipe Comparison ({comparisonItems.length})
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExportComparison('csv')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={comparisonItems.length === 0}
              >
                Export CSV
              </button>
              <button
                onClick={handleClearComparison}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={comparisonItems.length === 0}
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('comparison')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'comparison'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Side-by-Side Comparison
              </button>
              <button
                onClick={() => setSelectedTab('analysis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'analysis'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Analysis & Insights
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="large" />
                <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading comparison...</span>
              </div>
            ) : comparisonItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Recipes to Compare
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add recipes to comparison from the Recipe List to start comparing.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  You can compare up to {comparisonService.getMaxComparisonItems()} recipes at once.
                </p>
              </div>
            ) : (
              <>
                {selectedTab === 'comparison' && (
                  <div className="overflow-auto max-h-full">
                    <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900">
                            Field
                          </th>
                          {comparisonItems.map((item, index) => (
                            <th key={item.recipe.recipeId} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 min-w-48">
                              <div className="flex items-center justify-between">
                                <span className="truncate">{item.recipe.recipeName}</span>
                                <button
                                  onClick={() => handleRemoveFromComparison(item.recipe.recipeId)}
                                  className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                                  title="Remove from comparison"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonFields.map((field, fieldIndex) => (
                          <tr key={field.key} className={fieldIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 sticky left-0">
                              <div>
                                <span className="block">{field.label}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{field.category}</span>
                              </div>
                            </td>
                            {comparisonItems.map((item) => {
                              const value = field.key === 'recipeName' 
                                ? item.recipe.recipeName 
                                : getComparisonField(item.recipe, field.key);
                              return (
                                <td key={`${item.recipe.recipeId}-${field.key}`} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                                  {field.key === 'tastingNotes' ? (
                                    <div className="max-w-xs">
                                      <p className="truncate" title={formatValue(value)}>
                                        {formatValue(value)}
                                      </p>
                                    </div>
                                  ) : (
                                    formatValue(value)
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedTab === 'analysis' && analysis && (
                  <div className="space-y-6 overflow-auto max-h-full">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysis.averageRatio.toFixed(1)}:1
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-300">Average Ratio</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {analysis.averageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-green-800 dark:text-green-300">Average Rating</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {analysis.averageTDS ? `${analysis.averageTDS.toFixed(2)}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-purple-800 dark:text-purple-300">Average TDS</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {comparisonItems.length}
                        </div>
                        <div className="text-sm text-orange-800 dark:text-orange-300">Recipes Compared</div>
                      </div>
                    </div>

                    {/* Common Elements */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Common Origins</h4>
                        {analysis.commonOrigins.length > 0 ? (
                          <ul className="space-y-1">
                            {analysis.commonOrigins.map((origin, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                {origin}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No common origins found</p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Common Methods</h4>
                        {analysis.commonMethods.length > 0 ? (
                          <ul className="space-y-1">
                            {analysis.commonMethods.map((method, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {method}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No common methods found</p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Common Grinders</h4>
                        {analysis.commonGrinders.length > 0 ? (
                          <ul className="space-y-1">
                            {analysis.commonGrinders.map((grinder, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                {grinder}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No common grinders found</p>
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Insights & Recommendations
                        </h4>
                        <ul className="space-y-3">
                          {analysis.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex">
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strength Analysis */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Strength Analysis</h4>
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          analysis.strengthComparison === 'similar' 
                            ? 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                            : analysis.strengthComparison === 'varied'
                            ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                            : 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                        }`}>
                          {analysis.strengthComparison === 'similar' ? 'Consistent' : 
                           analysis.strengthComparison === 'varied' ? 'Moderate Variation' : 'High Variation'}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Ratio range: {analysis.ratioRange.min}:1 - {analysis.ratioRange.max}:1
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}