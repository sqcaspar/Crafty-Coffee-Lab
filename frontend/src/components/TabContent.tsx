import { useState } from 'react';
import { ActiveTab } from '../App';
import RecipeInput from './RecipeInput';
import RecipeList from './RecipeList';
import RecipeDetail from './RecipeDetail';
import FavoritesList from './FavoritesList';
import CollectionsList from './CollectionsList';

interface TabContentProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export default function TabContent({ activeTab, onTabChange }: TabContentProps) {
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle editing a recipe (switch to input tab with edit mode)
  const handleEditRecipe = (recipeId: string) => {
    setEditingRecipeId(recipeId);
    setViewingRecipeId(null);
    // Switch to input tab
    onTabChange('input');
  };

  // Handle viewing recipe details
  const handleViewRecipe = (recipeId: string) => {
    setViewingRecipeId(recipeId);
  };

  // Handle recipe deletion (refresh the list)
  const handleRecipeDeleted = () => {
    setRefreshTrigger(prev => prev + 1);
    setViewingRecipeId(null);
  };

  // Handle successful recipe save (refresh the list and clear editing state)
  const handleRecipeSaved = () => {
    setEditingRecipeId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingRecipeId(null);
  };

  return (
    <div className="w-full">
      {/* Input Tab */}
      <div
        id="input-panel"
        role="tabpanel"
        aria-labelledby="input-tab"
        className={activeTab === 'input' ? 'block' : 'hidden'}
      >
        <RecipeInput 
          mode={editingRecipeId ? 'edit' : 'create'}
          recipeId={editingRecipeId || undefined}
          onSaveSuccess={handleRecipeSaved}
          onCancel={editingRecipeId ? handleCancelEdit : undefined}
        />
      </div>

      {/* Recipes Tab */}
      <div
        id="recipes-panel"
        role="tabpanel"
        aria-labelledby="recipes-tab"
        className={activeTab === 'recipes' ? 'block' : 'hidden'}
      >
        <RecipeList 
          onEditRecipe={handleEditRecipe}
          onViewRecipe={handleViewRecipe}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Collections Tab */}
      <div
        id="collections-panel"
        role="tabpanel"
        aria-labelledby="collections-tab"
        className={activeTab === 'collections' ? 'block' : 'hidden'}
      >
        <CollectionsList />
      </div>

      {/* Favorites Tab */}
      <div
        id="favorites-panel"
        role="tabpanel"
        aria-labelledby="favorites-tab"
        className={activeTab === 'favorites' ? 'block' : 'hidden'}
      >
        <FavoritesList />
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetail
        recipeId={viewingRecipeId}
        isOpen={!!viewingRecipeId}
        onClose={() => setViewingRecipeId(null)}
        onEdit={handleEditRecipe}
        onDelete={handleRecipeDeleted}
      />
    </div>
  );
}