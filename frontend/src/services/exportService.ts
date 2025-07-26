import { Recipe, RecipeSummary } from '../shared/types/recipe';
import { recipeService } from './recipeService';
import * as XLSX from 'xlsx';

// Export format types
export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  PRINT = 'print'
}

// Export field configuration
export interface ExportFieldConfig {
  recipeName: boolean;
  dateCreated: boolean;
  dateModified: boolean;
  isFavorite: boolean;
  collections: boolean;
  beanInfo: {
    origin: boolean;
    processingMethod: boolean;
    altitude: boolean;
    roastingDate: boolean;
    roastingLevel: boolean;
  };
  brewingParameters: {
    waterTemperature: boolean;
    brewingMethod: boolean;
    grinderModel: boolean;
    grinderUnit: boolean;
    filteringTools: boolean;
    turbulence: boolean;
    additionalNotes: boolean;
  };
  measurements: {
    coffeeBeans: boolean;
    water: boolean;
    coffeeWaterRatio: boolean;
    tds: boolean;
    extractionYield: boolean;
  };
  sensationRecord: {
    overallImpression: boolean;
    acidity: boolean;
    body: boolean;
    sweetness: boolean;
    flavor: boolean;
    aftertaste: boolean;
    balance: boolean;
    tastingNotes: boolean;
  };
}

// Export options interface
export interface ExportOptions {
  format: ExportFormat;
  includeFullDetails?: boolean; // Whether to include full recipe details (vs summary)
  includeImages?: boolean; // Future: include images if available
  customTemplate?: string; // Future: custom export templates
  filename?: string; // Custom filename
  dateRange?: {
    start: Date;
    end: Date;
  };
  fieldConfig?: Partial<ExportFieldConfig>; // Configure which fields to include
  sheetName?: string; // Excel sheet name
  includeStats?: boolean; // Include summary statistics sheet
  includeCollections?: boolean; // Include collections data sheet
}

// Export progress callback
export type ProgressCallback = (progress: number, message: string) => void;

class ExportService {
  
  // Filter recipes by date range
  private filterRecipesByDateRange(
    recipes: RecipeSummary[], 
    dateRange: { start: Date; end: Date }
  ): RecipeSummary[] {
    return recipes.filter(recipe => {
      const recipeDate = new Date(recipe.dateCreated);
      return recipeDate >= dateRange.start && recipeDate <= dateRange.end;
    });
  }
  
  // Apply field configuration to filter data
  private applyFieldFilter(
    data: any[], 
    fieldConfig: Partial<ExportFieldConfig>
  ): any[] {
    if (!fieldConfig || Object.keys(fieldConfig).length === 0) {
      return data; // No filtering, return all data
    }
    
    return data.map(item => {
      const filtered: any = {};
      
      // Basic fields
      if (fieldConfig.recipeName !== false) filtered.recipeName = item.recipeName;
      if (fieldConfig.dateCreated !== false) filtered.dateCreated = item.dateCreated;
      if (fieldConfig.dateModified !== false) filtered.dateModified = item.dateModified;
      if (fieldConfig.isFavorite !== false) filtered.isFavorite = item.isFavorite;
      if (fieldConfig.collections !== false) filtered.collections = item.collections;
      
      // Bean info fields
      if (fieldConfig.beanInfo && item.beanInfo) {
        filtered.beanInfo = {};
        const beanConfig = fieldConfig.beanInfo;
        if (beanConfig.origin !== false) filtered.beanInfo.origin = item.beanInfo.origin;
        if (beanConfig.processingMethod !== false) filtered.beanInfo.processingMethod = item.beanInfo.processingMethod;
        if (beanConfig.altitude !== false) filtered.beanInfo.altitude = item.beanInfo.altitude;
        if (beanConfig.roastingDate !== false) filtered.beanInfo.roastingDate = item.beanInfo.roastingDate;
        if (beanConfig.roastingLevel !== false) filtered.beanInfo.roastingLevel = item.beanInfo.roastingLevel;
      } else if (fieldConfig.beanInfo === undefined && item.beanInfo) {
        // Include all bean info if not explicitly configured
        filtered.beanInfo = item.beanInfo;
      }
      
      // Brewing parameters
      if (fieldConfig.brewingParameters && item.brewingParameters) {
        filtered.brewingParameters = {};
        const brewConfig = fieldConfig.brewingParameters;
        if (brewConfig.waterTemperature !== false) filtered.brewingParameters.waterTemperature = item.brewingParameters.waterTemperature;
        if (brewConfig.brewingMethod !== false) filtered.brewingParameters.brewingMethod = item.brewingParameters.brewingMethod;
        if (brewConfig.grinderModel !== false) filtered.brewingParameters.grinderModel = item.brewingParameters.grinderModel;
        if (brewConfig.grinderUnit !== false) filtered.brewingParameters.grinderUnit = item.brewingParameters.grinderUnit;
        if (brewConfig.filteringTools !== false) filtered.brewingParameters.filteringTools = item.brewingParameters.filteringTools;
      } else if (fieldConfig.brewingParameters === undefined && item.brewingParameters) {
        filtered.brewingParameters = item.brewingParameters;
      }
      
      // Measurements
      if (fieldConfig.measurements && item.measurements) {
        filtered.measurements = {};
        const measureConfig = fieldConfig.measurements;
        if (measureConfig.coffeeBeans !== false) filtered.measurements.coffeeBeans = item.measurements.coffeeBeans;
        if (measureConfig.water !== false) filtered.measurements.water = item.measurements.water;
        if (measureConfig.coffeeWaterRatio !== false) filtered.measurements.coffeeWaterRatio = item.measurements.coffeeWaterRatio;
        if (measureConfig.tds !== false) filtered.measurements.tds = item.measurements.tds;
        if (measureConfig.extractionYield !== false) filtered.measurements.extractionYield = item.measurements.extractionYield;
      } else if (fieldConfig.measurements === undefined && item.measurements) {
        filtered.measurements = item.measurements;
      }
      
      // Sensation record
      if (fieldConfig.sensationRecord && item.sensationRecord) {
        filtered.sensationRecord = {};
        const sensationConfig = fieldConfig.sensationRecord;
        if (sensationConfig.overallImpression !== false) filtered.sensationRecord.overallImpression = item.sensationRecord.overallImpression;
        if (sensationConfig.acidity !== false) filtered.sensationRecord.acidity = item.sensationRecord.acidity;
        if (sensationConfig.body !== false) filtered.sensationRecord.body = item.sensationRecord.body;
        if (sensationConfig.sweetness !== false) filtered.sensationRecord.sweetness = item.sensationRecord.sweetness;
        if (sensationConfig.flavor !== false) filtered.sensationRecord.flavor = item.sensationRecord.flavor;
        if (sensationConfig.aftertaste !== false) filtered.sensationRecord.aftertaste = item.sensationRecord.aftertaste;
        if (sensationConfig.balance !== false) filtered.sensationRecord.balance = item.sensationRecord.balance;
        if (sensationConfig.tastingNotes !== false) filtered.sensationRecord.tastingNotes = item.sensationRecord.tastingNotes;
      } else if (fieldConfig.sensationRecord === undefined && item.sensationRecord) {
        filtered.sensationRecord = item.sensationRecord;
      }
      
      // Include any remaining fields that weren't explicitly configured
      Object.keys(item).forEach(key => {
        if (!filtered.hasOwnProperty(key) && 
            !['beanInfo', 'brewingParameters', 'measurements', 'sensationRecord'].includes(key)) {
          filtered[key] = item[key];
        }
      });
      
      return filtered;
    });
  }
  
  // Export multiple recipes
  async exportRecipes(
    recipes: RecipeSummary[],
    options: ExportOptions,
    onProgress?: ProgressCallback
  ): Promise<void> {
    try {
      onProgress?.(0, 'Preparing export...');
      
      // Apply date range filter if specified
      let filteredRecipes = recipes;
      if (options.dateRange) {
        onProgress?.(5, 'Applying date filter...');
        filteredRecipes = this.filterRecipesByDateRange(recipes, options.dateRange);
        console.log(`Filtered ${recipes.length} recipes to ${filteredRecipes.length} by date range`);
      }
      
      let fullRecipes: Recipe[] = [];
      
      // If we need full details, fetch complete recipe data
      if (options.includeFullDetails) {
        onProgress?.(10, 'Loading recipe details...');
        fullRecipes = await this.fetchFullRecipeDetails(filteredRecipes, onProgress);
      }
      
      const data = options.includeFullDetails ? fullRecipes : filteredRecipes;
      const filename = options.filename || this.generateFilename(options.format, data.length);
      
      onProgress?.(70, 'Generating export...');
      
      // Apply field filtering if specified
      let finalData = data;
      if (options.fieldConfig && options.includeFullDetails) {
        onProgress?.(75, 'Applying field filters...');
        finalData = this.applyFieldFilter(data, options.fieldConfig);
      }
      
      onProgress?.(80, 'Generating export...');
      
      switch (options.format) {
        case ExportFormat.CSV:
          await this.exportToCSV(finalData, filename, options, onProgress);
          break;
        case ExportFormat.EXCEL:
          await this.exportToExcel(finalData, filename, options, onProgress);
          break;
        case ExportFormat.JSON:
          await this.exportToJSON(finalData, filename, onProgress);
          break;
        case ExportFormat.PDF:
          await this.exportToPDF(finalData, filename, onProgress);
          break;
        case ExportFormat.PRINT:
          await this.printRecipes(finalData);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
      
      onProgress?.(100, 'Export complete!');
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Export single recipe
  async exportSingleRecipe(
    recipe: Recipe | RecipeSummary,
    options: ExportOptions,
    onProgress?: ProgressCallback
  ): Promise<void> {
    let fullRecipe: Recipe;
    
    // If we have a summary, fetch the full recipe
    if ('recipeName' in recipe && !('beanInfo' in recipe)) {
      onProgress?.(20, 'Loading recipe details...');
      const summary = recipe as RecipeSummary;
      const response = await recipeService.getRecipe(summary.recipeId);
      if (!response.success || !response.data) {
        throw new Error('Failed to load recipe details');
      }
      fullRecipe = response.data;
    } else {
      fullRecipe = recipe as Recipe;
    }
    
    await this.exportRecipes([fullRecipe as any], {
      ...options,
      includeFullDetails: true
    }, onProgress);
  }
  
  // Fetch full recipe details for summaries
  private async fetchFullRecipeDetails(
    summaries: RecipeSummary[],
    onProgress?: ProgressCallback
  ): Promise<Recipe[]> {
    const fullRecipes: Recipe[] = [];
    const total = summaries.length;
    
    for (let i = 0; i < total; i++) {
      const summary = summaries[i];
      if (!summary) continue;
      
      onProgress?.(10 + (i / total) * 50, `Loading recipe ${i + 1} of ${total}...`);
      
      try {
        const response = await recipeService.getRecipe(summary.recipeId);
        if (response.success && response.data) {
          fullRecipes.push(response.data);
        } else {
          console.warn(`Failed to load recipe ${summary.recipeName || 'Unknown'}:`, response.error);
        }
      } catch (error) {
        console.warn(`Error loading recipe ${summary.recipeName || 'Unknown'}:`, error);
      }
    }
    
    return fullRecipes;
  }
  
  // CSV Export
  private async exportToCSV(
    data: Recipe[] | RecipeSummary[],
    filename: string,
    options: ExportOptions,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.(80, 'Generating CSV...');
    
    const isFullRecipe = data.length > 0 && data[0] && 'beanInfo' in data[0];
    
    let csv: string;
    if (isFullRecipe) {
      csv = this.generateFullRecipeCSV(data as Recipe[], options);
    } else {
      csv = this.generateSummaryCSV(data as RecipeSummary[], options);
    }
    
    onProgress?.(90, 'Downloading CSV...');
    this.downloadFile(csv, filename, 'text/csv');
  }

  // Excel Export
  private async exportToExcel(
    data: Recipe[] | RecipeSummary[],
    filename: string,
    options: ExportOptions,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.(80, 'Generating Excel workbook...');
    
    const workbook = XLSX.utils.book_new();
    const isFullRecipe = data.length > 0 && data[0] && 'beanInfo' in data[0];
    
    // Main recipes sheet
    const sheetName = options.sheetName || 'Recipes';
    let recipeData: any[][];
    
    if (isFullRecipe) {
      recipeData = this.generateExcelRecipeData(data as Recipe[], options);
    } else {
      recipeData = this.generateExcelSummaryData(data as RecipeSummary[], options);
    }
    
    const recipesSheet = XLSX.utils.aoa_to_sheet(recipeData);
    
    // Apply styling and formatting
    this.formatExcelSheet(recipesSheet, recipeData[0]);
    
    XLSX.utils.book_append_sheet(workbook, recipesSheet, sheetName);
    
    // Add statistics sheet if requested
    if (options.includeStats && isFullRecipe) {
      onProgress?.(85, 'Generating statistics...');
      const statsSheet = this.createStatsSheet(data as Recipe[]);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    }
    
    // Add collections sheet if requested
    if (options.includeCollections && isFullRecipe) {
      onProgress?.(87, 'Generating collections data...');
      const collectionsSheet = this.createCollectionsSheet(data as Recipe[]);
      XLSX.utils.book_append_sheet(workbook, collectionsSheet, 'Collections');
    }
    
    onProgress?.(90, 'Downloading Excel file...');
    
    // Write and download the file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/\.csv$/, '.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  // JSON Export
  private async exportToJSON(
    data: Recipe[] | RecipeSummary[],
    filename: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.(80, 'Generating JSON...');
    
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      totalRecipes: data.length,
      recipes: data
    };
    
    const json = JSON.stringify(exportData, null, 2);
    
    onProgress?.(90, 'Downloading JSON...');
    this.downloadFile(json, filename, 'application/json');
  }
  
  // PDF Export (simplified version using browser print)
  private async exportToPDF(
    data: Recipe[] | RecipeSummary[],
    _filename: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.(80, 'Generating PDF...');
    
    const printContent = this.generatePrintHTML(data);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check pop-up blocker settings.');
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load
    if (printWindow.onload !== undefined) {
      printWindow.onload = () => {
        onProgress?.(90, 'Opening print dialog...');
        printWindow.print();
        
        // Close the window after printing
        if (printWindow.onafterprint !== undefined) {
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }
      };
    }
  }
  
  // Print recipes directly
  private async printRecipes(data: Recipe[] | RecipeSummary[]): Promise<void> {
    const printContent = this.generatePrintHTML(data);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check pop-up blocker settings.');
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    if (printWindow.onload !== undefined) {
      printWindow.onload = () => printWindow.print();
    }
  }
  
  // Generate CSV for full recipes
  private generateFullRecipeCSV(recipes: Recipe[], options: ExportOptions): string {
    const headers = [
      'Recipe Name',
      'Date Created',
      'Date Modified',
      'Is Favorite',
      'Collections',
      'Origin',
      'Processing Method',
      'Altitude',
      'Roasting Date',
      'Roasting Level',
      'Water Temperature',
      'Brewing Method',
      'Grinder Model',
      'Grinder Setting',
      'Filter Tools',
      'Coffee (g)',
      'Water (g)',
      'Ratio',
      'TDS (%)',
      'Extraction Yield (%)',
      'Overall Rating',
      'Acidity',
      'Body',
      'Sweetness',
      'Flavor',
      'Aftertaste',
      'Balance',
      'Tasting Notes'
    ];
    
    const rows = recipes.map(recipe => [
      recipe.recipeName,
      recipe.dateCreated,
      recipe.dateModified,
      recipe.isFavorite ? 'Yes' : 'No',
      recipe.collections.join('; '),
      recipe.beanInfo.origin,
      recipe.beanInfo.processingMethod,
      recipe.beanInfo.altitude || '',
      recipe.beanInfo.roastingDate || '',
      recipe.beanInfo.roastingLevel || '',
      recipe.brewingParameters.waterTemperature || '',
      recipe.brewingParameters.brewingMethod || '',
      recipe.brewingParameters.grinderModel,
      recipe.brewingParameters.grinderUnit,
      recipe.brewingParameters.filteringTools || '',
      recipe.measurements.coffeeBeans,
      recipe.measurements.water,
      recipe.measurements.coffeeWaterRatio,
      recipe.measurements.tds || '',
      recipe.measurements.extractionYield || '',
      recipe.sensationRecord.overallImpression,
      recipe.sensationRecord.acidity || '',
      recipe.sensationRecord.body || '',
      recipe.sensationRecord.sweetness || '',
      recipe.sensationRecord.flavor || '',
      recipe.sensationRecord.aftertaste || '',
      recipe.sensationRecord.balance || '',
      recipe.sensationRecord.tastingNotes || ''
    ]);
    
    return this.arrayToCSV([headers, ...rows]);
  }
  
  // Generate CSV for recipe summaries
  private generateSummaryCSV(recipes: RecipeSummary[], options: ExportOptions): string {
    const headers = [
      'Recipe Name',
      'Date Created',
      'Date Modified',
      'Is Favorite',
      'Origin',
      'Brewing Method',
      'Overall Rating',
      'Coffee Ratio',
      'Collections'
    ];
    
    const rows = recipes.map(recipe => [
      recipe.recipeName,
      recipe.dateCreated,
      recipe.dateModified,
      recipe.isFavorite ? 'Yes' : 'No',
      recipe.origin,
      recipe.brewingMethod || '',
      recipe.overallImpression,
      recipe.coffeeWaterRatio,
      recipe.collections.join('; ')
    ]);
    
    return this.arrayToCSV([headers, ...rows]);
  }

  // Generate Excel data for full recipes
  private generateExcelRecipeData(recipes: Recipe[], options: ExportOptions): any[][] {
    const fieldConfig = this.getDefaultFieldConfig(options.fieldConfig);
    const headers: string[] = [];
    
    // Build headers based on field configuration
    if (fieldConfig.recipeName) headers.push('Recipe Name');
    if (fieldConfig.dateCreated) headers.push('Date Created');
    if (fieldConfig.dateModified) headers.push('Date Modified');
    if (fieldConfig.isFavorite) headers.push('Is Favorite');
    if (fieldConfig.collections) headers.push('Collections');
    
    // Bean Info headers
    if (fieldConfig.beanInfo.origin) headers.push('Origin');
    if (fieldConfig.beanInfo.processingMethod) headers.push('Processing Method');
    if (fieldConfig.beanInfo.altitude) headers.push('Altitude (m)');
    if (fieldConfig.beanInfo.roastingDate) headers.push('Roasting Date');
    if (fieldConfig.beanInfo.roastingLevel) headers.push('Roasting Level');
    
    // Brewing Parameters headers
    if (fieldConfig.brewingParameters.waterTemperature) headers.push('Water Temperature (°C)');
    if (fieldConfig.brewingParameters.brewingMethod) headers.push('Brewing Method');
    if (fieldConfig.brewingParameters.grinderModel) headers.push('Grinder Model');
    if (fieldConfig.brewingParameters.grinderUnit) headers.push('Grind Setting');
    if (fieldConfig.brewingParameters.filteringTools) headers.push('Filter Tools');
    if (fieldConfig.brewingParameters.turbulence) headers.push('Turbulence');
    if (fieldConfig.brewingParameters.additionalNotes) headers.push('Additional Notes');
    
    // Measurements headers
    if (fieldConfig.measurements.coffeeBeans) headers.push('Coffee (g)');
    if (fieldConfig.measurements.water) headers.push('Water (g)');
    if (fieldConfig.measurements.coffeeWaterRatio) headers.push('Ratio');
    if (fieldConfig.measurements.tds) headers.push('TDS (%)');
    if (fieldConfig.measurements.extractionYield) headers.push('Extraction Yield (%)');
    
    // Sensation Record headers
    if (fieldConfig.sensationRecord.overallImpression) headers.push('Overall Rating');
    if (fieldConfig.sensationRecord.acidity) headers.push('Acidity');
    if (fieldConfig.sensationRecord.body) headers.push('Body');
    if (fieldConfig.sensationRecord.sweetness) headers.push('Sweetness');
    if (fieldConfig.sensationRecord.flavor) headers.push('Flavor');
    if (fieldConfig.sensationRecord.aftertaste) headers.push('Aftertaste');
    if (fieldConfig.sensationRecord.balance) headers.push('Balance');
    if (fieldConfig.sensationRecord.tastingNotes) headers.push('Tasting Notes');
    
    // Generate data rows
    const rows = recipes.map(recipe => {
      const row: any[] = [];
      
      if (fieldConfig.recipeName) row.push(recipe.recipeName);
      if (fieldConfig.dateCreated) row.push(new Date(recipe.dateCreated));
      if (fieldConfig.dateModified) row.push(new Date(recipe.dateModified));
      if (fieldConfig.isFavorite) row.push(recipe.isFavorite ? 'Yes' : 'No');
      if (fieldConfig.collections) row.push(recipe.collections.join('; '));
      
      // Bean Info
      if (fieldConfig.beanInfo.origin) row.push(recipe.beanInfo.origin);
      if (fieldConfig.beanInfo.processingMethod) row.push(recipe.beanInfo.processingMethod);
      if (fieldConfig.beanInfo.altitude) row.push(recipe.beanInfo.altitude || '');
      if (fieldConfig.beanInfo.roastingDate) row.push(recipe.beanInfo.roastingDate ? new Date(recipe.beanInfo.roastingDate) : '');
      if (fieldConfig.beanInfo.roastingLevel) row.push(recipe.beanInfo.roastingLevel || '');
      
      // Brewing Parameters
      if (fieldConfig.brewingParameters.waterTemperature) row.push(recipe.brewingParameters.waterTemperature || '');
      if (fieldConfig.brewingParameters.brewingMethod) row.push(recipe.brewingParameters.brewingMethod || '');
      if (fieldConfig.brewingParameters.grinderModel) row.push(recipe.brewingParameters.grinderModel);
      if (fieldConfig.brewingParameters.grinderUnit) row.push(recipe.brewingParameters.grinderUnit);
      if (fieldConfig.brewingParameters.filteringTools) row.push(recipe.brewingParameters.filteringTools || '');
      if (fieldConfig.brewingParameters.turbulence) row.push(recipe.brewingParameters.turbulence || '');
      if (fieldConfig.brewingParameters.additionalNotes) row.push(recipe.brewingParameters.additionalNotes || '');
      
      // Measurements
      if (fieldConfig.measurements.coffeeBeans) row.push(recipe.measurements.coffeeBeans);
      if (fieldConfig.measurements.water) row.push(recipe.measurements.water);
      if (fieldConfig.measurements.coffeeWaterRatio) row.push(recipe.measurements.coffeeWaterRatio);
      if (fieldConfig.measurements.tds) row.push(recipe.measurements.tds || '');
      if (fieldConfig.measurements.extractionYield) row.push(recipe.measurements.extractionYield || '');
      
      // Sensation Record
      if (fieldConfig.sensationRecord.overallImpression) row.push(recipe.sensationRecord.overallImpression);
      if (fieldConfig.sensationRecord.acidity) row.push(recipe.sensationRecord.acidity || '');
      if (fieldConfig.sensationRecord.body) row.push(recipe.sensationRecord.body || '');
      if (fieldConfig.sensationRecord.sweetness) row.push(recipe.sensationRecord.sweetness || '');
      if (fieldConfig.sensationRecord.flavor) row.push(recipe.sensationRecord.flavor || '');
      if (fieldConfig.sensationRecord.aftertaste) row.push(recipe.sensationRecord.aftertaste || '');
      if (fieldConfig.sensationRecord.balance) row.push(recipe.sensationRecord.balance || '');
      if (fieldConfig.sensationRecord.tastingNotes) row.push(recipe.sensationRecord.tastingNotes || '');
      
      return row;
    });
    
    return [headers, ...rows];
  }

  // Generate Excel data for recipe summaries
  private generateExcelSummaryData(recipes: RecipeSummary[], options: ExportOptions): any[][] {
    const headers = [
      'Recipe Name',
      'Date Created',
      'Date Modified',
      'Is Favorite',
      'Origin',
      'Brewing Method',
      'Overall Rating',
      'Coffee Ratio',
      'Collections'
    ];
    
    const rows = recipes.map(recipe => [
      recipe.recipeName,
      new Date(recipe.dateCreated),
      new Date(recipe.dateModified),
      recipe.isFavorite ? 'Yes' : 'No',
      recipe.origin,
      recipe.brewingMethod || '',
      recipe.overallImpression,
      recipe.coffeeWaterRatio,
      recipe.collections.join('; ')
    ]);
    
    return [headers, ...rows];
  }

  // Format Excel sheet with styling
  private formatExcelSheet(sheet: XLSX.WorkSheet, headers: any[]): void {
    if (!sheet['!ref']) return;
    
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Set column widths
    const columnWidths = headers.map((header, index) => {
      let width = Math.max(header.toString().length, 10);
      
      // Adjust width for specific columns
      if (header.includes('Date')) width = 12;
      if (header.includes('Notes') || header.includes('Description')) width = 30;
      if (header.includes('Name') || header.includes('Origin')) width = 20;
      
      return { wch: Math.min(width, 50) };
    });
    
    sheet['!cols'] = columnWidths;
    
    // Format header row
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!sheet[cellAddress]) continue;
      
      sheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center' }
      };
    }
    
    // Format date columns
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!sheet[cellAddress]) continue;
        
        const header = headers[col];
        if (header && header.toString().includes('Date')) {
          sheet[cellAddress].t = 'd';
          sheet[cellAddress].s = { numFmt: 'yyyy-mm-dd' };
        }
      }
    }
  }

  // Create statistics sheet
  private createStatsSheet(recipes: Recipe[]): XLSX.WorkSheet {
    const stats = this.calculateRecipeStats(recipes);
    const data = [
      ['Statistics', ''],
      ['Total Recipes', recipes.length],
      ['Favorite Recipes', recipes.filter(r => r.isFavorite).length],
      [''],
      ['Average Ratings', ''],
      ['Overall Impression', stats.avgOverallImpression.toFixed(1)],
      ['Acidity', stats.avgAcidity.toFixed(1)],
      ['Body', stats.avgBody.toFixed(1)],
      ['Sweetness', stats.avgSweetness.toFixed(1)],
      [''],
      ['Most Common', ''],
      ['Origin', stats.mostCommonOrigin],
      ['Brewing Method', stats.mostCommonBrewingMethod],
      ['Roasting Level', stats.mostCommonRoastingLevel],
      [''],
      ['Measurements', ''],
      ['Avg Coffee Amount', `${stats.avgCoffeeAmount.toFixed(1)}g`],
      ['Avg Water Amount', `${stats.avgWaterAmount.toFixed(1)}g`],
      ['Avg Ratio', `1:${stats.avgRatio.toFixed(1)}`],
    ];
    
    const sheet = XLSX.utils.aoa_to_sheet(data);
    
    // Format the stats sheet
    if (sheet['!ref']) {
      const range = XLSX.utils.decode_range(sheet['!ref']);
      sheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
      
      // Bold the first column
      for (let row = 0; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (sheet[cellAddress]) {
          sheet[cellAddress].s = { font: { bold: true } };
        }
      }
    }
    
    return sheet;
  }

  // Create collections sheet
  private createCollectionsSheet(recipes: Recipe[]): XLSX.WorkSheet {
    const collectionMap = new Map<string, Recipe[]>();
    
    // Group recipes by collection
    recipes.forEach(recipe => {
      if (recipe.collections.length === 0) {
        if (!collectionMap.has('Uncategorized')) {
          collectionMap.set('Uncategorized', []);
        }
        collectionMap.get('Uncategorized')!.push(recipe);
      } else {
        recipe.collections.forEach(collection => {
          if (!collectionMap.has(collection)) {
            collectionMap.set(collection, []);
          }
          collectionMap.get(collection)!.push(recipe);
        });
      }
    });
    
    const data = [
      ['Collection', 'Recipe Count', 'Average Rating', 'Recipe Names']
    ];
    
    collectionMap.forEach((collectionRecipes, collectionName) => {
      const avgRating = collectionRecipes.reduce((sum, r) => sum + r.sensationRecord.overallImpression, 0) / collectionRecipes.length;
      const recipeNames = collectionRecipes.map(r => r.recipeName).join('; ');
      
      data.push([
        collectionName,
        collectionRecipes.length,
        avgRating.toFixed(1),
        recipeNames
      ]);
    });
    
    const sheet = XLSX.utils.aoa_to_sheet(data);
    
    // Format collections sheet
    if (sheet['!ref']) {
      sheet['!cols'] = [
        { wch: 20 }, // Collection
        { wch: 12 }, // Recipe Count
        { wch: 15 }, // Average Rating
        { wch: 50 }  // Recipe Names
      ];
      
      // Format header
      const range = XLSX.utils.decode_range(sheet['!ref']);
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (sheet[cellAddress]) {
          sheet[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '059669' } },
            alignment: { horizontal: 'center' }
          };
        }
      }
    }
    
    return sheet;
  }

  // Calculate recipe statistics
  private calculateRecipeStats(recipes: Recipe[]) {
    const totalRecipes = recipes.length;
    if (totalRecipes === 0) {
      return {
        avgOverallImpression: 0,
        avgAcidity: 0,
        avgBody: 0,
        avgSweetness: 0,
        avgCoffeeAmount: 0,
        avgWaterAmount: 0,
        avgRatio: 0,
        mostCommonOrigin: '',
        mostCommonBrewingMethod: '',
        mostCommonRoastingLevel: ''
      };
    }
    
    const validAcidity = recipes.filter(r => r.sensationRecord.acidity).map(r => r.sensationRecord.acidity!);
    const validBody = recipes.filter(r => r.sensationRecord.body).map(r => r.sensationRecord.body!);
    const validSweetness = recipes.filter(r => r.sensationRecord.sweetness).map(r => r.sensationRecord.sweetness!);
    
    const origins = recipes.map(r => r.beanInfo.origin);
    const brewingMethods = recipes.map(r => r.brewingParameters.brewingMethod).filter(Boolean);
    const roastingLevels = recipes.map(r => r.beanInfo.roastingLevel).filter(Boolean);
    
    return {
      avgOverallImpression: recipes.reduce((sum, r) => sum + r.sensationRecord.overallImpression, 0) / totalRecipes,
      avgAcidity: validAcidity.length > 0 ? validAcidity.reduce((sum, val) => sum + val, 0) / validAcidity.length : 0,
      avgBody: validBody.length > 0 ? validBody.reduce((sum, val) => sum + val, 0) / validBody.length : 0,
      avgSweetness: validSweetness.length > 0 ? validSweetness.reduce((sum, val) => sum + val, 0) / validSweetness.length : 0,
      avgCoffeeAmount: recipes.reduce((sum, r) => sum + r.measurements.coffeeBeans, 0) / totalRecipes,
      avgWaterAmount: recipes.reduce((sum, r) => sum + r.measurements.water, 0) / totalRecipes,
      avgRatio: recipes.reduce((sum, r) => sum + r.measurements.coffeeWaterRatio, 0) / totalRecipes,
      mostCommonOrigin: this.getMostCommon(origins),
      mostCommonBrewingMethod: this.getMostCommon(brewingMethods),
      mostCommonRoastingLevel: this.getMostCommon(roastingLevels)
    };
  }

  // Get default field configuration
  private getDefaultFieldConfig(customConfig?: Partial<ExportFieldConfig>): ExportFieldConfig {
    const defaultConfig: ExportFieldConfig = {
      recipeName: true,
      dateCreated: true,
      dateModified: true,
      isFavorite: true,
      collections: true,
      beanInfo: {
        origin: true,
        processingMethod: true,
        altitude: true,
        roastingDate: true,
        roastingLevel: true
      },
      brewingParameters: {
        waterTemperature: true,
        brewingMethod: true,
        grinderModel: true,
        grinderUnit: true,
        filteringTools: true,
        turbulence: false,
        additionalNotes: false
      },
      measurements: {
        coffeeBeans: true,
        water: true,
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
    };

    // Deep merge custom config
    if (customConfig) {
      return this.deepMerge(defaultConfig, customConfig);
    }
    
    return defaultConfig;
  }

  // Deep merge utility
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // Helper to find most common value
  private getMostCommon(arr: (string | undefined | null)[]): string {
    const counts: Record<string, number> = {};
    const validItems = arr.filter(Boolean) as string[];
    
    validItems.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommon = '';
    
    Object.entries(counts).forEach(([item, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });
    
    return mostCommon;
  }
  
  // Convert array to CSV string
  private arrayToCSV(data: any[][]): string {
    return data.map(row =>
      row.map(cell => {
        const str = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');
  }
  
  // Generate HTML for printing
  private generatePrintHTML(data: Recipe[] | RecipeSummary[]): string {
    const isFullRecipe = data.length > 0 && data[0] && 'beanInfo' in data[0];
    const recipes = data as (Recipe | RecipeSummary)[];
    
    const recipesHTML = recipes.map(recipe => {
      if (isFullRecipe) {
        return this.generateFullRecipeHTML(recipe as Recipe);
      } else {
        return this.generateSummaryRecipeHTML(recipe as RecipeSummary);
      }
    }).join('\n<div style="page-break-after: always;"></div>\n');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Coffee Recipe Export</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
          }
          
          .recipe {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          
          .recipe-header {
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .recipe-title {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
            margin: 0;
          }
          
          .recipe-meta {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 5px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 10px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          
          .info-label {
            font-weight: 600;
            color: #4B5563;
          }
          
          .info-value {
            color: #1F2937;
          }
          
          .rating {
            display: inline-block;
            background: #FEF3C7;
            color: #92400E;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .favorite {
            color: #DC2626;
            font-weight: bold;
          }
          
          .tasting-notes {
            background: #F9FAFB;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #4F46E5;
            font-style: italic;
            margin-top: 10px;
          }
          
          @media print {
            body { margin: 0; }
            .recipe { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin-bottom: 5px;">Coffee Brewing Recipes</h1>
          <p style="color: #666; font-size: 14px;">Exported on ${new Date().toLocaleDateString()}</p>
          <p style="color: #666; font-size: 14px;">${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}</p>
        </div>
        
        ${recipesHTML}
      </body>
      </html>
    `;
  }
  
  // Generate HTML for full recipe
  private generateFullRecipeHTML(recipe: Recipe): string {
    return `
      <div class="recipe">
        <div class="recipe-header">
          <h2 class="recipe-title">
            ${recipe.recipeName}
            ${recipe.isFavorite ? '<span class="favorite">★</span>' : ''}
          </h2>
          <div class="recipe-meta">
            Created: ${new Date(recipe.dateCreated).toLocaleDateString()} | 
            Modified: ${new Date(recipe.dateModified).toLocaleDateString()}
            ${recipe.collections.length > 0 ? ` | Collections: ${recipe.collections.join(', ')}` : ''}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Bean Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Origin:</span>
              <span class="info-value">${recipe.beanInfo.origin}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Processing:</span>
              <span class="info-value">${recipe.beanInfo.processingMethod}</span>
            </div>
            ${recipe.beanInfo.altitude ? `
            <div class="info-item">
              <span class="info-label">Altitude:</span>
              <span class="info-value">${recipe.beanInfo.altitude}m</span>
            </div>` : ''}
            ${recipe.beanInfo.roastingLevel ? `
            <div class="info-item">
              <span class="info-label">Roast Level:</span>
              <span class="info-value">${recipe.beanInfo.roastingLevel}</span>
            </div>` : ''}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Brewing Parameters</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Method:</span>
              <span class="info-value">${recipe.brewingParameters.brewingMethod || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Water Temp:</span>
              <span class="info-value">${recipe.brewingParameters.waterTemperature || 'Not specified'}°C</span>
            </div>
            <div class="info-item">
              <span class="info-label">Grinder:</span>
              <span class="info-value">${recipe.brewingParameters.grinderModel}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Grind Size:</span>
              <span class="info-value">${recipe.brewingParameters.grinderUnit}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Measurements</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Coffee:</span>
              <span class="info-value">${recipe.measurements.coffeeBeans}g</span>
            </div>
            <div class="info-item">
              <span class="info-label">Water:</span>
              <span class="info-value">${recipe.measurements.water}g</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ratio:</span>
              <span class="info-value">1:${recipe.measurements.coffeeWaterRatio}</span>
            </div>
            ${recipe.measurements.tds ? `
            <div class="info-item">
              <span class="info-label">TDS:</span>
              <span class="info-value">${recipe.measurements.tds}%</span>
            </div>` : ''}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Tasting Notes</h3>
          <div class="info-item">
            <span class="info-label">Overall Rating:</span>
            <span class="rating">${recipe.sensationRecord.overallImpression}/10</span>
          </div>
          ${recipe.sensationRecord.tastingNotes ? `
          <div class="tasting-notes">
            "${recipe.sensationRecord.tastingNotes}"
          </div>` : ''}
        </div>
      </div>
    `;
  }
  
  // Generate HTML for recipe summary
  private generateSummaryRecipeHTML(recipe: RecipeSummary): string {
    return `
      <div class="recipe">
        <div class="recipe-header">
          <h2 class="recipe-title">
            ${recipe.recipeName}
            ${recipe.isFavorite ? '<span class="favorite">★</span>' : ''}
          </h2>
          <div class="recipe-meta">
            Created: ${new Date(recipe.dateCreated).toLocaleDateString()} | 
            Modified: ${new Date(recipe.dateModified).toLocaleDateString()}
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Origin:</span>
            <span class="info-value">${recipe.origin}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Method:</span>
            <span class="info-value">${recipe.brewingMethod || 'Not specified'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Ratio:</span>
            <span class="info-value">1:${recipe.coffeeWaterRatio}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Rating:</span>
            <span class="rating">${recipe.overallImpression}/10</span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Generate filename
  private generateFilename(format: ExportFormat, count: number): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const suffix = count === 1 ? 'recipe' : `${count}_recipes`;
    
    let extension: string;
    switch (format) {
      case ExportFormat.EXCEL:
        extension = 'xlsx';
        break;
      case ExportFormat.JSON:
        extension = 'json';
        break;
      case ExportFormat.CSV:
      default:
        extension = 'csv';
        break;
    }
    
    return `coffee_${suffix}_${timestamp}.${extension}`;
  }
  
  // Download file helper
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const exportService = new ExportService();

// Export format display names
export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  [ExportFormat.PDF]: 'PDF Document',
  [ExportFormat.CSV]: 'CSV Spreadsheet',
  [ExportFormat.EXCEL]: 'Excel Workbook',
  [ExportFormat.JSON]: 'JSON Backup',
  [ExportFormat.PRINT]: 'Print Preview'
};

// Export format descriptions
export const EXPORT_FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  [ExportFormat.PDF]: 'Professional PDF document perfect for sharing and archiving',
  [ExportFormat.CSV]: 'Simple spreadsheet format compatible with Excel, Google Sheets, etc.',
  [ExportFormat.EXCEL]: 'Advanced Excel workbook with multiple sheets, formatting, and statistics',
  [ExportFormat.JSON]: 'Complete data backup in JSON format for migration or backup',
  [ExportFormat.PRINT]: 'Print recipes directly or save as PDF from browser'
};