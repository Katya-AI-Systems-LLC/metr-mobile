// DataImporter.ts - Data Import Utilities for METR
import RNFS from 'react-native-fs';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {DeviceEventEmitter} from 'react-native';

interface ImportConfig {
  format: 'json' | 'csv' | 'auto';
  validate: boolean;
  transform?: (data: any) => any;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{row: number; error: string}>;
  data: any[];
}

export class DataImporter {
  private static instance: DataImporter;

  private constructor() {}

  public static getInstance(): DataImporter {
    if (!DataImporter.instance) {
      DataImporter.instance = new DataImporter();
    }
    return DataImporter.instance;
  }

  // Import from file
  public async import(
    filePath: string,
    config: ImportConfig
  ): Promise<ImportResult> {
    try {
      const content = await RNFS.readFile(filePath, 'utf8');
      const format = config.format === 'auto' ? this.detectFormat(filePath) : config.format;

      let data: any[];

      switch (format) {
        case 'json':
          data = this.parseJSON(content);
          break;

        case 'csv':
          data = this.parseCSV(content);
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Transform data if needed
      if (config.transform) {
        data = data.map(config.transform);
      }

      // Validate data
      const errors: Array<{row: number; error: string}> = [];
      if (config.validate) {
        data.forEach((item, index) => {
          const validation = this.validateItem(item);
          if (!validation.valid) {
            errors.push({
              row: index + 1,
              error: validation.error || 'Validation failed',
            });
          }
        });
      }

      const result: ImportResult = {
        success: errors.length === 0,
        imported: data.length - errors.length,
        errors,
        data: data.filter((_, index) => !errors.some(e => e.row === index + 1)),
      };

      DeviceEventEmitter.emit('data_imported', {result});

      return result;
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        imported: 0,
        errors: [{row: 0, error: (error as Error).message}],
        data: [],
      };
    }
  }

  // Detect format from file path
  private detectFormat(filePath: string): 'json' | 'csv' {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (extension === 'json') return 'json';
    if (extension === 'csv') return 'csv';
    throw new Error('Unable to detect file format');
  }

  // Parse JSON
  private parseJSON(content: string): any[] {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  // Parse CSV
  private parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      data.push(item);
    }

    return data;
  }

  // Parse CSV line (handles quoted values)
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  // Validate item
  private validateItem(item: any): {valid: boolean; error?: string} {
    // Basic validation
    if (!item || typeof item !== 'object') {
      return {valid: false, error: 'Invalid item format'};
    }

    return {valid: true};
  }

  // Pick file for import
  public async pickFile(): Promise<DocumentPickerResponse | null> {
    try {
      const DocumentPicker = require('react-native-document-picker').default;
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      return result[0] || null;
    } catch (error) {
      if ((error as any).code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Failed to pick file:', error);
      }
      return null;
    }
  }
}

export default DataImporter;


