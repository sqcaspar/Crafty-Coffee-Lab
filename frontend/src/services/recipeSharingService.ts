import { Recipe, RecipeSummary } from '../../../shared/src/types/recipe';
import { recipeService } from './recipeService';

export interface ShareableRecipe {
  id: string;
  recipeName: string;
  origin: string;
  brewingMethod: string;
  parameters: {
    waterTemp: number;
    grindSize: string;
    ratio: string;
    brewingTime?: string;
  };
  measurements: {
    coffee: number;
    water: number;
    tds?: number;
    extractionYield?: number;
  };
  ratings?: {
    overall: number;
    acidity?: number;
    body?: number;
    sweetness?: number;
    flavor?: number;
    aftertaste?: number;
    balance?: number;
  };
  notes?: string;
  tags: string[];
  metadata: {
    sharedBy: string;
    sharedAt: string;
    originalId: string;
  };
}

export interface ShareOptions {
  includeRatings: boolean;
  includeTastingNotes: boolean;
  includePersonalNotes: boolean;
  format: 'json' | 'text' | 'markdown' | 'url';
  customMessage?: string;
}

export interface ShareHistory {
  id: string;
  recipeId: string;
  recipeName: string;
  method: 'url' | 'json' | 'text' | 'markdown' | 'clipboard';
  sharedAt: string;
  customMessage?: string;
}

class RecipeSharingService {
  private readonly SHARE_HISTORY_KEY = 'coffeeTracker_shareHistory';
  private readonly MAX_HISTORY_ITEMS = 50;

  // Generate a shareable version of a recipe
  async createShareableRecipe(recipeId: string, options: ShareOptions): Promise<ShareableRecipe | null> {
    try {
      const response = await recipeService.getRecipe(recipeId);
      if (!response.success || !response.data) {
        throw new Error('Failed to load recipe');
      }

      const recipe = response.data;
      
      // Calculate ratio
      const ratio = recipe.measurements.water && recipe.measurements.coffeeBeans
        ? `1:${(recipe.measurements.water / recipe.measurements.coffeeBeans).toFixed(1)}`
        : 'Not specified';

      // Build shareable recipe
      const shareableRecipe: ShareableRecipe = {
        id: this.generateShareId(),
        recipeName: recipe.recipeName,
        origin: recipe.beanInfo.origin || 'Not specified',
        brewingMethod: this.formatBrewingMethod(recipe.brewingParameters.brewingMethod || ''),
        parameters: {
          waterTemp: recipe.brewingParameters.waterTemperature || 0,
          grindSize: recipe.brewingParameters.grinderUnit || 'Not specified',
          ratio,
          brewingTime: recipe.brewingParameters.additionalNotes?.match(/(\d+:\d+|\d+\s*(min|minutes|sec|seconds))/i)?.[0]
        },
        measurements: {
          coffee: recipe.measurements.coffeeBeans || 0,
          water: recipe.measurements.water || 0,
          tds: recipe.measurements.tds,
          extractionYield: recipe.measurements.extractionYield
        },
        tags: this.generateTags(recipe),
        metadata: {
          sharedBy: 'Coffee Enthusiast',
          sharedAt: new Date().toISOString(),
          originalId: recipe.recipeId
        }
      };

      // Add ratings if requested
      if (options.includeRatings && recipe.sensationRecord) {
        shareableRecipe.ratings = {
          overall: recipe.sensationRecord.overallImpression || 0,
          acidity: recipe.sensationRecord.acidity,
          body: recipe.sensationRecord.body,
          sweetness: recipe.sensationRecord.sweetness,
          flavor: recipe.sensationRecord.flavor,
          aftertaste: recipe.sensationRecord.aftertaste,
          balance: recipe.sensationRecord.balance
        };
      }

      // Add tasting notes if requested
      if (options.includeTastingNotes && recipe.sensationRecord?.tastingNotes) {
        shareableRecipe.notes = recipe.sensationRecord.tastingNotes;
      }

      return shareableRecipe;
    } catch (error) {
      console.error('Failed to create shareable recipe:', error);
      return null;
    }
  }

  // Format shareable recipe based on format preference
  formatForSharing(shareableRecipe: ShareableRecipe, format: ShareOptions['format'], customMessage?: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify(shareableRecipe, null, 2);
      
      case 'markdown':
        return this.formatAsMarkdown(shareableRecipe, customMessage);
      
      case 'text':
        return this.formatAsText(shareableRecipe, customMessage);
      
      case 'url':
        return this.formatAsUrl(shareableRecipe, customMessage);
      
      default:
        return JSON.stringify(shareableRecipe, null, 2);
    }
  }

  // Share recipe via various methods
  async shareRecipe(recipeId: string, method: 'clipboard' | 'url' | 'download', options: ShareOptions): Promise<{ success: boolean; message?: string; data?: string }> {
    try {
      const shareableRecipe = await this.createShareableRecipe(recipeId, options);
      if (!shareableRecipe) {
        return { success: false, message: 'Failed to prepare recipe for sharing' };
      }

      const formattedContent = this.formatForSharing(shareableRecipe, options.format, options.customMessage);
      
      switch (method) {
        case 'clipboard':
          await this.copyToClipboard(formattedContent);
          this.addToHistory({
            id: Date.now().toString(),
            recipeId,
            recipeName: shareableRecipe.recipeName,
            method: 'clipboard',
            sharedAt: new Date().toISOString(),
            customMessage: options.customMessage
          });
          return { success: true, message: 'Recipe copied to clipboard!' };

        case 'url':
          const shareUrl = this.generateShareUrl(shareableRecipe);
          await this.copyToClipboard(shareUrl);
          this.addToHistory({
            id: Date.now().toString(),
            recipeId,
            recipeName: shareableRecipe.recipeName,
            method: 'url',
            sharedAt: new Date().toISOString(),
            customMessage: options.customMessage
          });
          return { success: true, message: 'Share URL copied to clipboard!', data: shareUrl };

        case 'download':
          this.downloadAsFile(formattedContent, shareableRecipe.recipeName, options.format);
          this.addToHistory({
            id: Date.now().toString(),
            recipeId,
            recipeName: shareableRecipe.recipeName,
            method: options.format,
            sharedAt: new Date().toISOString(),
            customMessage: options.customMessage
          });
          return { success: true, message: 'Recipe file downloaded!' };

        default:
          return { success: false, message: 'Invalid sharing method' };
      }
    } catch (error) {
      console.error('Failed to share recipe:', error);
      return { success: false, message: 'An error occurred while sharing the recipe' };
    }
  }

  // Format as Markdown
  private formatAsMarkdown(recipe: ShareableRecipe, customMessage?: string): string {
    let markdown = '';

    if (customMessage) {
      markdown += `${customMessage}\n\n`;
    }

    markdown += `# ☕ ${recipe.recipeName}\n\n`;
    
    markdown += `## Bean Information\n`;
    markdown += `- **Origin:** ${recipe.origin}\n`;
    markdown += `- **Brewing Method:** ${recipe.brewingMethod}\n\n`;

    markdown += `## Recipe Parameters\n`;
    markdown += `- **Coffee:** ${recipe.measurements.coffee}g\n`;
    markdown += `- **Water:** ${recipe.measurements.water}g\n`;
    markdown += `- **Ratio:** ${recipe.parameters.ratio}\n`;
    markdown += `- **Water Temperature:** ${recipe.parameters.waterTemp}°C\n`;
    markdown += `- **Grind Size:** ${recipe.parameters.grindSize}\n`;
    if (recipe.parameters.brewingTime) {
      markdown += `- **Brewing Time:** ${recipe.parameters.brewingTime}\n`;
    }
    markdown += `\n`;

    if (recipe.measurements.tds || recipe.measurements.extractionYield) {
      markdown += `## Measurements\n`;
      if (recipe.measurements.tds) {
        markdown += `- **TDS:** ${recipe.measurements.tds}%\n`;
      }
      if (recipe.measurements.extractionYield) {
        markdown += `- **Extraction Yield:** ${recipe.measurements.extractionYield}%\n`;
      }
      markdown += `\n`;
    }

    if (recipe.ratings) {
      markdown += `## Tasting Notes\n`;
      markdown += `**Overall Rating:** ${recipe.ratings.overall}/10\n\n`;
      
      if (recipe.ratings.acidity || recipe.ratings.body || recipe.ratings.sweetness) {
        markdown += `**Flavor Profile:**\n`;
        if (recipe.ratings.acidity) markdown += `- Acidity: ${recipe.ratings.acidity}/10\n`;
        if (recipe.ratings.body) markdown += `- Body: ${recipe.ratings.body}/10\n`;
        if (recipe.ratings.sweetness) markdown += `- Sweetness: ${recipe.ratings.sweetness}/10\n`;
        if (recipe.ratings.flavor) markdown += `- Flavor: ${recipe.ratings.flavor}/10\n`;
        if (recipe.ratings.aftertaste) markdown += `- Aftertaste: ${recipe.ratings.aftertaste}/10\n`;
        if (recipe.ratings.balance) markdown += `- Balance: ${recipe.ratings.balance}/10\n`;
        markdown += `\n`;
      }
    }

    if (recipe.notes) {
      markdown += `## Additional Notes\n`;
      markdown += `${recipe.notes}\n\n`;
    }

    if (recipe.tags.length > 0) {
      markdown += `## Tags\n`;
      markdown += recipe.tags.map(tag => `\`${tag}\``).join(' ') + `\n\n`;
    }

    markdown += `---\n`;
    markdown += `*Shared via Coffee Recipe Tracker on ${new Date(recipe.metadata.sharedAt).toLocaleDateString()}*\n`;

    return markdown;
  }

  // Format as plain text
  private formatAsText(recipe: ShareableRecipe, customMessage?: string): string {
    let text = '';

    if (customMessage) {
      text += `${customMessage}\n\n`;
    }

    text += `☕ ${recipe.recipeName}\n`;
    text += `${'='.repeat(recipe.recipeName.length + 2)}\n\n`;
    
    text += `Bean Information:\n`;
    text += `  Origin: ${recipe.origin}\n`;
    text += `  Brewing Method: ${recipe.brewingMethod}\n\n`;

    text += `Recipe Parameters:\n`;
    text += `  Coffee: ${recipe.measurements.coffee}g\n`;
    text += `  Water: ${recipe.measurements.water}g\n`;
    text += `  Ratio: ${recipe.parameters.ratio}\n`;
    text += `  Water Temperature: ${recipe.parameters.waterTemp}°C\n`;
    text += `  Grind Size: ${recipe.parameters.grindSize}\n`;
    if (recipe.parameters.brewingTime) {
      text += `  Brewing Time: ${recipe.parameters.brewingTime}\n`;
    }
    text += `\n`;

    if (recipe.measurements.tds || recipe.measurements.extractionYield) {
      text += `Measurements:\n`;
      if (recipe.measurements.tds) {
        text += `  TDS: ${recipe.measurements.tds}%\n`;
      }
      if (recipe.measurements.extractionYield) {
        text += `  Extraction Yield: ${recipe.measurements.extractionYield}%\n`;
      }
      text += `\n`;
    }

    if (recipe.ratings) {
      text += `Tasting Notes:\n`;
      text += `  Overall Rating: ${recipe.ratings.overall}/10\n`;
      
      if (recipe.ratings.acidity || recipe.ratings.body || recipe.ratings.sweetness) {
        text += `  Flavor Profile:\n`;
        if (recipe.ratings.acidity) text += `    Acidity: ${recipe.ratings.acidity}/10\n`;
        if (recipe.ratings.body) text += `    Body: ${recipe.ratings.body}/10\n`;
        if (recipe.ratings.sweetness) text += `    Sweetness: ${recipe.ratings.sweetness}/10\n`;
        if (recipe.ratings.flavor) text += `    Flavor: ${recipe.ratings.flavor}/10\n`;
        if (recipe.ratings.aftertaste) text += `    Aftertaste: ${recipe.ratings.aftertaste}/10\n`;
        if (recipe.ratings.balance) text += `    Balance: ${recipe.ratings.balance}/10\n`;
      }
      text += `\n`;
    }

    if (recipe.notes) {
      text += `Additional Notes:\n`;
      text += `  ${recipe.notes.replace(/\n/g, '\n  ')}\n\n`;
    }

    if (recipe.tags.length > 0) {
      text += `Tags: ${recipe.tags.join(', ')}\n\n`;
    }

    text += `---\n`;
    text += `Shared via Coffee Recipe Tracker on ${new Date(recipe.metadata.sharedAt).toLocaleDateString()}\n`;

    return text;
  }

  // Generate share URL (placeholder - would need backend implementation)
  private generateShareUrl(recipe: ShareableRecipe): string {
    const encodedRecipe = btoa(JSON.stringify({
      name: recipe.recipeName,
      origin: recipe.origin,
      method: recipe.brewingMethod,
      coffee: recipe.measurements.coffee,
      water: recipe.measurements.water,
      temp: recipe.parameters.waterTemp,
      grind: recipe.parameters.grindSize,
      rating: recipe.ratings?.overall
    }));
    
    // This would typically be a proper URL to your sharing service
    return `https://coffee-recipes.share/r/${encodedRecipe}`;
  }

  // Format as URL-friendly format
  private formatAsUrl(recipe: ShareableRecipe, customMessage?: string): string {
    return this.generateShareUrl(recipe);
  }

  // Copy content to clipboard
  private async copyToClipboard(content: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
  }

  // Download content as file
  private downloadAsFile(content: string, recipeName: string, format: string): void {
    const fileExtensions: { [key: string]: string } = {
      json: 'json',
      markdown: 'md',
      text: 'txt'
    };

    const extension = fileExtensions[format] || 'txt';
    const fileName = `${recipeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate tags based on recipe data
  private generateTags(recipe: Recipe): string[] {
    const tags: string[] = [];

    // Add brewing method tag
    if (recipe.brewingParameters.brewingMethod) {
      tags.push(recipe.brewingParameters.brewingMethod.toLowerCase().replace('_', ' '));
    }

    // Add origin tag
    if (recipe.beanInfo.origin) {
      tags.push(recipe.beanInfo.origin.toLowerCase());
    }

    // Add rating-based tags
    if (recipe.sensationRecord?.overallImpression) {
      const rating = recipe.sensationRecord.overallImpression;
      if (rating >= 8.5) tags.push('excellent');
      else if (rating >= 7) tags.push('very good');
      else if (rating >= 5.5) tags.push('good');
    }

    // Add flavor profile tags
    if (recipe.sensationRecord) {
      if ((recipe.sensationRecord.acidity || 0) >= 7) tags.push('bright');
      if ((recipe.sensationRecord.body || 0) >= 7) tags.push('full-bodied');
      if ((recipe.sensationRecord.sweetness || 0) >= 7) tags.push('sweet');
      if ((recipe.sensationRecord.balance || 0) >= 8) tags.push('balanced');
    }

    return tags;
  }

  // Generate unique share ID
  private generateShareId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Format brewing method for display
  private formatBrewingMethod(method: string): string {
    return method
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Add to share history
  private addToHistory(shareRecord: ShareHistory): void {
    try {
      const history = this.getShareHistory();
      history.unshift(shareRecord);
      
      // Keep only recent shares
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }
      
      localStorage.setItem(this.SHARE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save share history:', error);
    }
  }

  // Get share history
  getShareHistory(): ShareHistory[] {
    try {
      const stored = localStorage.getItem(this.SHARE_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load share history:', error);
      return [];
    }
  }

  // Clear share history
  clearShareHistory(): void {
    try {
      localStorage.removeItem(this.SHARE_HISTORY_KEY);
    } catch (error) {
      console.warn('Failed to clear share history:', error);
    }
  }

  // Import recipe from shared format (basic implementation)
  async importSharedRecipe(sharedData: string): Promise<{ success: boolean; recipe?: any; error?: string }> {
    try {
      let shareableRecipe: ShareableRecipe;

      // Try to parse as JSON first
      try {
        shareableRecipe = JSON.parse(sharedData);
      } catch {
        // If not JSON, try to parse URL
        if (sharedData.includes('coffee-recipes.share/r/')) {
          const encodedPart = sharedData.split('/r/')[1];
          const decodedData = JSON.parse(atob(encodedPart));
          // Convert simplified format back to full recipe structure
          shareableRecipe = this.convertSimplifiedToShareable(decodedData);
        } else {
          throw new Error('Invalid format');
        }
      }

      // Convert to recipe format for import
      const importedRecipe = {
        recipeName: `${shareableRecipe.recipeName} (Imported)`,
        beanInfo: {
          origin: shareableRecipe.origin !== 'Not specified' ? shareableRecipe.origin : '',
          processingMethod: '',
          roastingLevel: undefined,
          altitude: undefined,
          roastingDate: undefined
        },
        brewingParameters: {
          waterTemperature: shareableRecipe.parameters.waterTemp || undefined,
          brewingMethod: this.parseBrewingMethod(shareableRecipe.brewingMethod),
          grinderModel: '',
          grinderUnit: shareableRecipe.parameters.grindSize !== 'Not specified' ? shareableRecipe.parameters.grindSize : '',
          filteringTools: undefined,
          turbulence: undefined,
          additionalNotes: shareableRecipe.notes || undefined
        },
        measurements: {
          coffeeBeans: shareableRecipe.measurements.coffee,
          water: shareableRecipe.measurements.water,
          tds: shareableRecipe.measurements.tds,
          extractionYield: shareableRecipe.measurements.extractionYield
        },
        sensationRecord: {
          overallImpression: shareableRecipe.ratings?.overall,
          acidity: shareableRecipe.ratings?.acidity,
          body: shareableRecipe.ratings?.body,
          sweetness: shareableRecipe.ratings?.sweetness,
          flavor: shareableRecipe.ratings?.flavor,
          aftertaste: shareableRecipe.ratings?.aftertaste,
          balance: shareableRecipe.ratings?.balance,
          tastingNotes: shareableRecipe.notes
        },
        collections: [],
        isFavorite: false
      };

      return { success: true, recipe: importedRecipe };
    } catch (error) {
      console.error('Failed to import shared recipe:', error);
      return { success: false, error: 'Invalid or corrupted shared recipe data' };
    }
  }

  // Helper methods for import functionality
  private convertSimplifiedToShareable(data: any): ShareableRecipe {
    return {
      id: this.generateShareId(),
      recipeName: data.name || 'Imported Recipe',
      origin: data.origin || 'Not specified',
      brewingMethod: data.method || 'Not specified',
      parameters: {
        waterTemp: data.temp || 0,
        grindSize: data.grind || 'Not specified',
        ratio: data.coffee && data.water ? `1:${(data.water / data.coffee).toFixed(1)}` : 'Not specified'
      },
      measurements: {
        coffee: data.coffee || 0,
        water: data.water || 0
      },
      ratings: data.rating ? { overall: data.rating } : undefined,
      tags: [],
      metadata: {
        sharedBy: 'Unknown',
        sharedAt: new Date().toISOString(),
        originalId: ''
      }
    };
  }

  private parseBrewingMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'pour over': 'POUR_OVER',
      'pour-over': 'POUR_OVER',
      'french press': 'FRENCH_PRESS',
      'aeropress': 'AEROPRESS',
      'cold brew': 'COLD_BREW'
    };

    return methodMap[method.toLowerCase()] || method.toUpperCase().replace(' ', '_');
  }
}

export const recipeSharingService = new RecipeSharingService();