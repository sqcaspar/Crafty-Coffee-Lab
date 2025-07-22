export default function FavoritesList() {
  const favoriteRecipes = [
    {
      id: '1',
      name: 'Ethiopian Yirgacheffe Pour-over', 
      origin: 'Ethiopia',
      brewingMethod: 'Pour-over',
      overallImpression: 8,
      dateCreated: '2024-01-15'
    },
    {
      id: '3',
      name: 'Guatemalan Aeropress Experiment',
      origin: 'Guatemala',
      brewingMethod: 'Aeropress', 
      overallImpression: 9,
      dateCreated: '2024-01-13'
    }
  ];

  const collections = [
    {
      id: '1',
      name: 'Morning Brews',
      description: 'Perfect recipes for starting the day',
      recipeCount: 5,
      color: 'bg-blue-500'
    },
    {
      id: '2', 
      name: 'High Rated',
      description: 'Recipes scoring 8+ overall impression',
      recipeCount: 3,
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Experimental',
      description: 'Testing new brewing techniques',
      recipeCount: 7,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Favorites Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Favorite Recipes</h2>
            <p className="mt-1 text-sm text-gray-600">
              Your starred recipes for quick access
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{favoriteRecipes.length} favorites</span>
            <span>⭐</span>
          </div>
        </div>

        {favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteRecipes.map((recipe) => (
              <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-sm truncate pr-2">
                    {recipe.name}
                  </h3>
                  <button className="text-yellow-400 hover:text-gray-300" title="Remove from favorites">
                    ⭐
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{recipe.origin} • {recipe.brewingMethod}</p>
                  <div className="flex items-center justify-between">
                    <span>Rating: {recipe.overallImpression}/10</span>
                    <span className="text-xs">{new Date(recipe.dateCreated).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Edit
                  </button>
                  <button className="text-xs text-gray-600 hover:text-gray-700 font-medium">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-gray-500">No favorite recipes yet</p>
            <p className="text-sm text-gray-400 mt-1">Star recipes to see them here</p>
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recipe Collections</h2>
            <p className="mt-1 text-sm text-gray-600">
              Organize your recipes into custom groups
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            New Collection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div key={collection.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full ${collection.color} mt-1.5 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {collection.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      {collection.recipeCount} recipes
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View
                      </button>
                      <button className="text-xs text-gray-600 hover:text-gray-700 font-medium">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Collection Button (Large) */}
        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
          <div className="text-2xl mb-2">📁</div>
          <p className="text-gray-600 font-medium">Create New Collection</p>
          <p className="text-sm text-gray-400 mt-1">Group related recipes together</p>
        </div>
      </div>
    </div>
  );
}