// DataExporter.ts - Data Export Utilities for METR
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {DeviceEventEmitter} from 'react-native';

interface ExportConfig {
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
  includeMetadata: boolean;
  compress: boolean;
}

interface ExportOptions {
  data: any[];
  filename: string;
  format: ExportConfig['format'];
  fields?: string[];
}

export class DataExporter {
  private static instance: DataExporter;

  private constructor() {}

  public static getInstance(): DataExporter {
    if (!DataExporter.instance) {
      DataExporter.instance = new DataExporter();
    }
    return DataExporter.instance;
  }

  // Export data
  public async export(options: ExportOptions): Promise<string> {
    const {data, filename, format, fields} = options;

    let content: string;
    let fileExtension: string;

    switch (format) {
      case 'json':
        content = this.exportJSON(data, fields);
        fileExtension = 'json';
        break;

      case 'csv':
        content = this.exportCSV(data, fields);
        fileExtension = 'csv';
        break;

      case 'pdf':
        // PDF export would require additional library
        throw new Error('PDF export not yet implemented');

      case 'xlsx':
        // XLSX export would require additional library
        throw new Error('XLSX export not yet implemented');

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Save to file
    const filePath = `${RNFS.DocumentDirectoryPath}/${filename}.${fileExtension}`;
    await RNFS.writeFile(filePath, content, 'utf8');

    DeviceEventEmitter.emit('data_exported', {filePath, format});

    return filePath;
  }

  // Export JSON
  private exportJSON(data: any[], fields?: string[]): string {
    const filteredData = fields
      ? data.map(item => {
          const filtered: any = {};
          fields.forEach(field => {
            filtered[field] = item[field];
          });
          return filtered;
        })
      : data;

    return JSON.stringify(filteredData, null, 2);
  }

  // Export CSV
  private exportCSV(data: any[], fields?: string[]): string {
    if (data.length === 0) {
      return '';
    }

    const keys = fields || Object.keys(data[0]);
    const headers = keys.join(',');
    const rows = data.map(item =>
      keys.map(key => {
        const value = item[key];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  // Share exported file
  public async share(filePath: string, options?: {title?: string; message?: string}): Promise<void> {
    try {
      await Share.open({
        url: `file://${filePath}`,
        title: options?.title || 'Export',
        message: options?.message || 'Exported data',
      });
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  }

  // Export and share
  public async exportAndShare(options: ExportOptions): Promise<void> {
    const filePath = await this.export(options);
    await this.share(filePath, {
      title: `Export ${options.filename}`,
      message: `Exported ${options.data.length} items`,
    });
  }
}

export default DataExporter;


