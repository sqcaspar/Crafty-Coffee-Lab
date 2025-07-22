import { useState, useCallback } from 'react';
import { OverallRatingSlider, TasteAttributeSlider } from './EnhancedRatingSlider';

export interface TastingNotesData {
  overallImpression?: number;
  acidity?: number;
  body?: number;
  sweetness?: number;
  flavor?: number;
  aftertaste?: number;
  balance?: number;
  tastingNotes?: string;
}

interface TastingNotesPanelProps {
  data: TastingNotesData;
  onChange: (data: TastingNotesData) => void;
  disabled?: boolean;
  showPresets?: boolean;
}

const flavorPresets = [
  { category: 'Fruity', options: ['Berry', 'Cherry', 'Apple', 'Citrus', 'Tropical', 'Stone Fruit'] },
  { category: 'Floral', options: ['Jasmine', 'Rose', 'Lavender', 'Hibiscus', 'Orange Blossom'] },
  { category: 'Sweet', options: ['Chocolate', 'Caramel', 'Honey', 'Vanilla', 'Brown Sugar', 'Molasses'] },
  { category: 'Nutty', options: ['Almond', 'Hazelnut', 'Walnut', 'Peanut', 'Pecan'] },
  { category: 'Spicy', options: ['Cinnamon', 'Nutmeg', 'Clove', 'Black Pepper', 'Cardamom'] },
  { category: 'Earthy', options: ['Woody', 'Tobacco', 'Cedar', 'Mushroom', 'Soil'] },
  { category: 'Other', options: ['Wine-like', 'Tea-like', 'Herbal', 'Smoky', 'Roasted'] }
];

const brewingProfiles = [
  {
    name: 'Light & Bright',
    description: 'Acidic, light body, floral notes',
    preset: { overallImpression: 7, acidity: 8, body: 4, sweetness: 6, flavor: 7, aftertaste: 6, balance: 7 }
  },
  {
    name: 'Balanced Classic',
    description: 'Well-rounded, medium body',
    preset: { overallImpression: 8, acidity: 6, body: 6, sweetness: 7, flavor: 7, aftertaste: 7, balance: 8 }
  },
  {
    name: 'Rich & Full',
    description: 'Heavy body, chocolate notes',
    preset: { overallImpression: 7.5, acidity: 4, body: 9, sweetness: 8, flavor: 8, aftertaste: 8, balance: 7 }
  },
  {
    name: 'Sweet & Smooth',
    description: 'High sweetness, minimal acidity',
    preset: { overallImpression: 8.5, acidity: 3, body: 7, sweetness: 9, flavor: 8, aftertaste: 8, balance: 8 }
  }
];

export default function TastingNotesPanel({ 
  data, 
  onChange, 
  disabled = false, 
  showPresets = true 
}: TastingNotesPanelProps) {
  const [activePresetCategory, setActivePresetCategory] = useState<string | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const handleAttributeChange = useCallback((attribute: keyof TastingNotesData) => 
    (value: number) => {
      onChange({
        ...data,
        [attribute]: value
      });
    }, [data, onChange]
  );

  const handleTastingNotesChange = (notes: string) => {
    onChange({
      ...data,
      tastingNotes: notes
    });
  };

  const applyPreset = (preset: typeof brewingProfiles[0]) => {
    onChange({
      ...data,
      ...preset.preset
    });
  };

  const addFlavorNote = (flavor: string) => {
    if (!selectedFlavors.includes(flavor)) {
      const newFlavors = [...selectedFlavors, flavor];
      setSelectedFlavors(newFlavors);
      
      // Add to tasting notes
      const currentNotes = data.tastingNotes || '';
      const newNotes = currentNotes 
        ? `${currentNotes}, ${flavor}` 
        : flavor;
      handleTastingNotesChange(newNotes);
    }
  };

  const removeFlavor = (flavor: string) => {
    const newFlavors = selectedFlavors.filter(f => f !== flavor);
    setSelectedFlavors(newFlavors);
    
    // Remove from tasting notes
    const currentNotes = data.tastingNotes || '';
    const newNotes = currentNotes
      .split(',')
      .map(note => note.trim())
      .filter(note => note !== flavor)
      .join(', ');
    handleTastingNotesChange(newNotes);
  };

  const getAverageRating = () => {
    const ratings = [
      data.acidity, 
      data.body, 
      data.sweetness, 
      data.flavor, 
      data.aftertaste, 
      data.balance
    ].filter(Boolean) as number[];
    
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  const getSuggestedOverall = () => {
    return Math.round(getAverageRating() * 2) / 2; // Round to nearest 0.5
  };

  return (
    <div className="space-y-8">
      {/* Quick Presets */}
      {showPresets && !disabled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
            Quick Profile Presets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brewingProfiles.map((profile, index) => (
              <button
                key={index}
                onClick={() => applyPreset(profile)}
                className="p-4 text-left bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {profile.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {profile.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overall Impression */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100">
            Overall Impression
          </h3>
          {getAverageRating() > 0 && (
            <button
              onClick={() => handleAttributeChange('overallImpression')(getSuggestedOverall())}
              className="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 font-medium"
              disabled={disabled}
            >
              Use Average ({getSuggestedOverall()})
            </button>
          )}
        </div>
        <OverallRatingSlider
          value={data.overallImpression}
          onChange={handleAttributeChange('overallImpression')}
          disabled={disabled}
        />
      </div>

      {/* Taste Attributes Grid */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Taste Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TasteAttributeSlider
            attribute="acidity"
            value={data.acidity}
            onChange={handleAttributeChange('acidity')}
            disabled={disabled}
          />
          <TasteAttributeSlider
            attribute="body"
            value={data.body}
            onChange={handleAttributeChange('body')}
            disabled={disabled}
          />
          <TasteAttributeSlider
            attribute="sweetness"
            value={data.sweetness}
            onChange={handleAttributeChange('sweetness')}
            disabled={disabled}
          />
          <TasteAttributeSlider
            attribute="flavor"
            value={data.flavor}
            onChange={handleAttributeChange('flavor')}
            disabled={disabled}
          />
          <TasteAttributeSlider
            attribute="aftertaste"
            value={data.aftertaste}
            onChange={handleAttributeChange('aftertaste')}
            disabled={disabled}
          />
          <TasteAttributeSlider
            attribute="balance"
            value={data.balance}
            onChange={handleAttributeChange('balance')}
            disabled={disabled}
          />
        </div>

        {/* Average Rating Display */}
        {getAverageRating() > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Average Taste Score:
              </span>
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {getAverageRating().toFixed(1)} / 10
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Flavor Notes */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-4">
          Flavor Notes & Description
        </h3>
        
        {/* Flavor Presets */}
        {!disabled && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {flavorPresets.map((category) => (
                <button
                  key={category.category}
                  onClick={() => setActivePresetCategory(
                    activePresetCategory === category.category ? null : category.category
                  )}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activePresetCategory === category.category
                      ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                      : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
                  }`}
                >
                  {category.category}
                </button>
              ))}
            </div>

            {/* Flavor Options */}
            {activePresetCategory && (
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex flex-wrap gap-2">
                  {flavorPresets
                    .find(cat => cat.category === activePresetCategory)
                    ?.options.map((flavor) => (
                      <button
                        key={flavor}
                        onClick={() => addFlavorNote(flavor)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        disabled={selectedFlavors.includes(flavor)}
                      >
                        {flavor}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Selected Flavors */}
            {selectedFlavors.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2 block">
                  Selected Flavors:
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedFlavors.map((flavor) => (
                    <span
                      key={flavor}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
                    >
                      {flavor}
                      <button
                        onClick={() => removeFlavor(flavor)}
                        className="ml-2 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasting Notes Textarea */}
        <div>
          <label className="block text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
            Detailed Tasting Notes
          </label>
          <textarea
            value={data.tastingNotes || ''}
            onChange={(e) => handleTastingNotesChange(e.target.value)}
            placeholder="Describe the flavor profile, aroma, mouthfeel, and any other sensory notes..."
            disabled={disabled}
            rows={4}
            className="w-full px-4 py-3 border border-purple-200 dark:border-purple-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="mt-2 text-xs text-purple-700 dark:text-purple-300">
            Character count: {(data.tastingNotes || '').length} / 500
          </div>
        </div>
      </div>

      {/* Rating Summary */}
      {(data.overallImpression || getAverageRating() > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Rating Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {data.overallImpression?.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {getAverageRating() > 0 ? getAverageRating().toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Taste Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {selectedFlavors.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flavor Notes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}