import { ExportFieldConfig, ExportFormat, ExportOptions } from './exportService';

// Export template interface
export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  options: ExportOptions;
  createdAt: Date;
  isDefault: boolean;
}

// Predefined export templates
export const DEFAULT_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'quick_summary',
    name: 'Quick Summary',
    description: 'Essential recipe information only - perfect for sharing',
    format: ExportFormat.CSV,
    options: {
      format: ExportFormat.CSV,
      includeFullDetails: false,
      fieldConfig: {
        recipeName: true,
        dateCreated: true,
        beanInfo: {
          origin: true,
          processingMethod: false,
          altitude: false,
          roastingDate: false,
          roastingLevel: true
        },
        brewingParameters: {
          brewingMethod: true,
          waterTemperature: false,
          grinderModel: false,
          grinderUnit: false,
          filteringTools: false,
          turbulence: false,
          additionalNotes: false
        },
        measurements: {
          coffeeBeans: true,
          water: true,
          coffeeWaterRatio: true,
          tds: false,
          extractionYield: false
        },
        sensationRecord: {
          overallImpression: true,
          acidity: false,
          body: false,
          sweetness: false,
          flavor: false,
          aftertaste: false,
          balance: false,
          tastingNotes: false
        }
      }
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: 'complete_analysis',
    name: 'Complete Analysis',
    description: 'Full recipe details with all measurements and tasting notes',
    format: ExportFormat.EXCEL,
    options: {
      format: ExportFormat.EXCEL,
      includeFullDetails: true,
      includeStats: true,
      includeCollections: true
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: 'brewing_guide',
    name: 'Brewing Guide',
    description: 'Focus on brewing parameters and techniques',
    format: ExportFormat.CSV,
    options: {
      format: ExportFormat.CSV,
      includeFullDetails: true,
      fieldConfig: {
        recipeName: true,
        dateCreated: true,
        beanInfo: {
          origin: true,
          processingMethod: true,
          altitude: true,
          roastingDate: true,
          roastingLevel: true
        },
        brewingParameters: {
          brewingMethod: true,
          waterTemperature: true,
          grinderModel: true,
          grinderUnit: true,
          filteringTools: true,
          turbulence: true,
          additionalNotes: true
        },
        measurements: {
          coffeeBeans: true,
          water: true,
          coffeeWaterRatio: true,
          tds: true,
          extractionYield: true
        },
        sensationRecord: {
          overallImpression: false,
          acidity: false,
          body: false,
          sweetness: false,
          flavor: false,
          aftertaste: false,
          balance: false,
          tastingNotes: true
        }
      }
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: 'tasting_notes',
    name: 'Tasting Notes',
    description: 'Focus on sensory evaluation and flavor profiles',
    format: ExportFormat.JSON,
    options: {
      format: ExportFormat.JSON,
      includeFullDetails: true,
      fieldConfig: {
        recipeName: true,
        dateCreated: true,
        beanInfo: {
          origin: true,
          processingMethod: true,
          altitude: false,
          roastingDate: true,
          roastingLevel: true
        },
        brewingParameters: {
          brewingMethod: true,
          waterTemperature: false,
          grinderModel: false,
          grinderUnit: false,
          filteringTools: false,
          turbulence: false,
          additionalNotes: false
        },
        measurements: {
          coffeeBeans: false,
          water: false,
          coffeeWaterRatio: true,
          tds: true,
          extractionYield: true
        },
        sensationRecord: {
          overallImpression: true,
          acidity: true,
          body: true,
          sweetness: true,
          flavor: true,
          aftertaste: true,
          balance: true,
          tastingNotes: true
        }
      }
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: 'favorites_only',
    name: 'Favorites Collection',
    description: 'Export only favorite recipes with full details',
    format: ExportFormat.EXCEL,
    options: {
      format: ExportFormat.EXCEL,
      includeFullDetails: true,
      includeStats: true,
      includeCollections: false
    },
    createdAt: new Date(),
    isDefault: true
  }
];

class ExportTemplateService {
  private readonly STORAGE_KEY = 'coffeeTracker_exportTemplates';

  // Get all templates (default + custom)
  getAllTemplates(): ExportTemplate[] {
    const customTemplates = this.getCustomTemplates();
    return [...DEFAULT_EXPORT_TEMPLATES, ...customTemplates];
  }

  // Get custom templates only
  getCustomTemplates(): ExportTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const templates = JSON.parse(stored);
      return templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load custom templates:', error);
      return [];
    }
  }

  // Get template by ID
  getTemplate(id: string): ExportTemplate | null {
    const allTemplates = this.getAllTemplates();
    return allTemplates.find(template => template.id === id) || null;
  }

  // Save custom template
  saveTemplate(template: Omit<ExportTemplate, 'id' | 'createdAt' | 'isDefault'>): string {
    try {
      const customTemplates = this.getCustomTemplates();
      
      const newTemplate: ExportTemplate = {
        ...template,
        id: this.generateTemplateId(),
        createdAt: new Date(),
        isDefault: false
      };

      customTemplates.push(newTemplate);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
      
      return newTemplate.id;
    } catch (error) {
      console.error('Failed to save template:', error);
      throw new Error('Failed to save export template');
    }
  }

  // Update custom template
  updateTemplate(id: string, updates: Partial<ExportTemplate>): void {
    try {
      const customTemplates = this.getCustomTemplates();
      const templateIndex = customTemplates.findIndex(template => template.id === id);
      
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }

      if (customTemplates[templateIndex].isDefault) {
        throw new Error('Cannot update default template');
      }

      customTemplates[templateIndex] = {
        ...customTemplates[templateIndex],
        ...updates,
        id, // Ensure ID doesn't change
        isDefault: false // Ensure it remains custom
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  // Delete custom template
  deleteTemplate(id: string): void {
    try {
      const customTemplates = this.getCustomTemplates();
      const templateToDelete = customTemplates.find(template => template.id === id);
      
      if (!templateToDelete) {
        throw new Error('Template not found');
      }

      if (templateToDelete.isDefault) {
        throw new Error('Cannot delete default template');
      }

      const filtered = customTemplates.filter(template => template.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  // Create template from current export options
  createTemplateFromOptions(
    name: string,
    description: string,
    options: ExportOptions
  ): string {
    return this.saveTemplate({
      name,
      description,
      format: options.format,
      options
    });
  }

  // Apply template to get export options
  applyTemplate(templateId: string): ExportOptions {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return { ...template.options };
  }

  // Get template suggestions based on format
  getTemplatesByFormat(format: ExportFormat): ExportTemplate[] {
    return this.getAllTemplates().filter(template => template.format === format);
  }

  // Get recently used templates
  getRecentTemplates(limit: number = 5): ExportTemplate[] {
    // This would typically track usage, but for now just return default templates
    return DEFAULT_EXPORT_TEMPLATES.slice(0, limit);
  }

  // Generate unique template ID
  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validate template
  validateTemplate(template: Partial<ExportTemplate>): string[] {
    const errors: string[] = [];

    if (!template.name?.trim()) {
      errors.push('Template name is required');
    }

    if (!template.description?.trim()) {
      errors.push('Template description is required');
    }

    if (!template.format) {
      errors.push('Export format is required');
    }

    if (!template.options) {
      errors.push('Export options are required');
    }

    return errors;
  }
}

export const exportTemplateService = new ExportTemplateService();