import { useState, useEffect, useMemo } from 'react';
import { Recipe, RecipeSummary } from '../shared/types/recipe';
import { recipeService } from '../services/recipeService';
import { recipeCloneService } from '../services/recipeCloneService';
import { RatingHistoryChart, generateSampleRatingData } from './ui/RatingHistoryChart';
import LoadingSpinner from './ui/LoadingSpinner';

interface StatsData {
  totalRecipes: number;
  averageRating: number;
  favoriteCount: number;
  mostUsedOrigin: string;
  mostUsedMethod: string;
  bestRatedRecipe?: RecipeSummary;
  recentActivity: {
    thisWeek: number;
    thisMonth: number;
  };
  brewingMethods: { [key: string]: number };
  origins: { [key: string]: number };
  ratingDistribution: { [key: string]: number };
  monthlyTrends: {
    month: string;
    count: number;
    avgRating: number;
  }[];
}

interface CloneStats {
  totalClones: number;
  mostUsedTemplate?: string;
  recentActivity: number;
  averageClonesPerWeek: number;
}

export default function RecipeStatsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [detailedRecipes, setDetailedRecipes] = useState<Recipe[]>([]);
  const [cloneStats, setCloneStats] = useState<CloneStats | null>(null);

  // Load recipes and calculate stats
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load all recipes
        const response = await recipeService.getAllRecipes();
        if (response.success && response.data) {
          setRecipes(response.data);
          
          // Load detailed recipe data for recipes with ratings
          const ratedRecipes = response.data.filter(r => r.overallImpression);
          const detailedPromises = ratedRecipes.slice(0, 50).map(r => // Limit to 50 for performance
            recipeService.getRecipe(r.recipeId)
          );
          
          const detailedResponses = await Promise.all(detailedPromises);
          const successful = detailedResponses
            .filter(res => res.success && res.data)
            .map(res => res.data as Recipe);
          
          setDetailedRecipes(successful);
        } else {
          setError(response.error || 'Failed to load recipes');
        }

        // Load clone statistics
        const cloneStatistics = recipeCloneService.getCloneStatistics();
        setCloneStats(cloneStatistics);

      } catch (err) {
        console.error('Error loading stats:', err);
        setError('An error occurred while loading statistics');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate comprehensive stats
  const stats: StatsData = useMemo(() => {
    if (recipes.length === 0) {
      return {
        totalRecipes: 0,
        averageRating: 0,
        favoriteCount: 0,
        mostUsedOrigin: 'None',
        mostUsedMethod: 'None',
        recentActivity: { thisWeek: 0, thisMonth: 0 },
        brewingMethods: {},
        origins: {},
        ratingDistribution: {},
        monthlyTrends: []
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalRecipes = recipes.length;
    const favoriteCount = recipes.filter(r => r.isFavorite).length;
    
    // Ratings analysis
    const ratedRecipes = recipes.filter(r => r.overallImpression);
    const averageRating = ratedRecipes.length > 0
      ? ratedRecipes.reduce((sum, r) => sum + (r.overallImpression || 0), 0) / ratedRecipes.length
      : 0;

    // Best rated recipe
    const bestRatedRecipe = ratedRecipes.length > 0
      ? ratedRecipes.reduce((best, current) => 
          (current.overallImpression || 0) > (best.overallImpression || 0) ? current : best
        )
      : undefined;

    // Recent activity
    const recentActivity = {
      thisWeek: recipes.filter(r => new Date(r.dateCreated) >= oneWeekAgo).length,
      thisMonth: recipes.filter(r => new Date(r.dateCreated) >= oneMonthAgo).length
    };

    // Brewing methods analysis
    const brewingMethods: { [key: string]: number } = {};
    recipes.forEach(r => {
      if (r.brewingMethod) {
        brewingMethods[r.brewingMethod] = (brewingMethods[r.brewingMethod] || 0) + 1;
      }
    });
    const mostUsedMethod = Object.keys(brewingMethods).length > 0
      ? Object.keys(brewingMethods).reduce((a, b) => 
          brewingMethods[a] > brewingMethods[b] ? a : b
        )
      : 'None';

    // Origins analysis
    const origins: { [key: string]: number } = {};
    recipes.forEach(r => {
      if (r.origin) {
        origins[r.origin] = (origins[r.origin] || 0) + 1;
      }
    });
    const mostUsedOrigin = Object.keys(origins).length > 0
      ? Object.keys(origins).reduce((a, b) => 
          origins[a] > origins[b] ? a : b
        )
      : 'None';

    // Rating distribution
    const ratingDistribution: { [key: string]: number } = {};
    ratedRecipes.forEach(r => {
      const rating = r.overallImpression!;
      const bucket = Math.floor(rating);
      const key = `${bucket}-${bucket + 1}`;
      ratingDistribution[key] = (ratingDistribution[key] || 0) + 1;
    });

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthRecipes = recipes.filter(r => {
        const recipeDate = new Date(r.dateCreated);
        return recipeDate >= date && recipeDate < nextMonth;
      });

      const monthRatedRecipes = monthRecipes.filter(r => r.overallImpression);
      const avgRating = monthRatedRecipes.length > 0
        ? monthRatedRecipes.reduce((sum, r) => sum + (r.overallImpression || 0), 0) / monthRatedRecipes.length
        : 0;

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthRecipes.length,
        avgRating
      });
    }

    return {
      totalRecipes,
      averageRating,
      favoriteCount,
      mostUsedOrigin,
      mostUsedMethod,
      bestRatedRecipe,
      recentActivity,
      brewingMethods,
      origins,
      ratingDistribution,
      monthlyTrends
    };
  }, [recipes]);

  // Prepare rating history data
  const ratingHistoryData = useMemo(() => {
    return detailedRecipes
      .filter(r => r.sensationRecord?.overallImpression)
      .map(r => ({
        date: r.dateCreated,
        rating: r.sensationRecord.overallImpression!,
        recipeName: r.recipeName,
        recipeId: r.recipeId
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [detailedRecipes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100">
            Error Loading Statistics
          </h3>
        </div>
        <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Recipe Analytics Dashboard</h1>
        <p className="text-blue-100 dark:text-blue-200">
          Insights into your coffee brewing journey and recipe collection
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRecipes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Recipes</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.favoriteCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.recentActivity.thisWeek}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating History Chart */}
      {ratingHistoryData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <RatingHistoryChart 
            data={ratingHistoryData}
            height={300}
            showTrend={true}
            interactive={true}
          />
        </div>
      )}

      {/* Best Recipe and Clone Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Rated Recipe */}
        {stats.bestRatedRecipe && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white ml-3">
                Best Rated Recipe
              </h3>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {stats.bestRatedRecipe.recipeName}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    Origin: {stats.bestRatedRecipe.origin || 'Unknown'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Method: {stats.bestRatedRecipe.brewingMethod || 'Unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.bestRatedRecipe.overallImpression?.toFixed(1)}/10
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clone Statistics */}
        {cloneStats && cloneStats.totalClones > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white ml-3">
                Recipe Cloning Activity
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {cloneStats.totalClones}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Clones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {cloneStats.recentActivity}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
                </div>
              </div>
              {cloneStats.mostUsedTemplate && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Most Used Template: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cloneStats.mostUsedTemplate}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Average: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cloneStats.averageClonesPerWeek.toFixed(1)} clones/week
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Brewing Methods and Origins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Brewing Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Popular Brewing Methods
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.brewingMethods)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([method, count]) => {
                const percentage = (count / stats.totalRecipes) * 100;
                return (
                  <div key={method} className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {method.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Popular Origins */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Popular Origins
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.origins)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([origin, count]) => {
                const percentage = (count / stats.totalRecipes) * 100;
                return (
                  <div key={origin} className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {origin}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      {stats.monthlyTrends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Monthly Recipe Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.monthlyTrends.map((trend, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {trend.count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    recipes
                  </div>
                  {trend.avgRating > 0 && (
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                      Avg: {trend.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {trend.month}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}