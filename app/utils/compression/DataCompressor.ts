// DataCompressor.ts - Data Compression for METR
import pako from 'pako';

export class DataCompressor {
  private static instance: DataCompressor;

  private constructor() {}

  public static getInstance(): DataCompressor {
    if (!DataCompressor.instance) {
      DataCompressor.instance = new DataCompressor();
    }
    return DataCompressor.instance;
  }

  // Compress string data
  public compress(data: string): string {
    const compressed = pako.deflate(data, {to: 'string'});
    return btoa(String.fromCharCode(...compressed));
  }

  // Decompress string data
  public decompress(compressed: string): string {
    const binaryString = atob(compressed);
    const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
    const decompressed = pako.inflate(bytes, {to: 'string'});
    return decompressed;
  }

  // Compress JSON
  public compressJSON(data: any): string {
    const jsonString = JSON.stringify(data);
    return this.compress(jsonString);
  }

  // Decompress JSON
  public decompressJSON(compressed: string): any {
    const jsonString = this.decompress(compressed);
    return JSON.parse(jsonString);
  }

  // Get compression ratio
  public getCompressionRatio(original: string, compressed: string): number {
    return (1 - compressed.length / original.length) * 100;
  }
}

export default DataCompressor;


