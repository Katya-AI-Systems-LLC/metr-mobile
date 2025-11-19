// BundleAnalyzer.ts - Bundle Size Analysis for METR
import {METRPerformance} from '../performance/METRPerformance';

interface BundleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  dependencies: string[];
}

export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private bundles: Map<string, BundleInfo> = new Map();
  private performance: METRPerformance;

  private constructor() {
    this.performance = METRPerformance.getInstance();
  }

  public static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  // Analyze bundle
  public analyzeBundle(name: string, size: number, gzippedSize: number, dependencies: string[]): void {
    this.bundles.set(name, {
      name,
      size,
      gzippedSize,
      dependencies,
    });

    // Track bundle size
    this.performance.recordMetric({
      name: 'bundle_size',
      value: size,
      unit: 'bytes',
      timestamp: Date.now(),
      tags: {bundle: name},
    });
  }

  // Get bundle report
  public getReport(): {
    totalSize: number;
    totalGzippedSize: number;
    bundles: BundleInfo[];
    largestBundles: BundleInfo[];
    recommendations: string[];
  } {
    const bundles = Array.from(this.bundles.values());
    const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
    const totalGzippedSize = bundles.reduce((sum, b) => sum + b.gzippedSize, 0);

    const largestBundles = [...bundles].sort((a, b) => b.size - a.size).slice(0, 5);

    const recommendations: string[] = [];
    
    largestBundles.forEach(bundle => {
      if (bundle.size > 1000000) {
        recommendations.push(`Consider code splitting for ${bundle.name} (${(bundle.size / 1024 / 1024).toFixed(2)}MB)`);
      }
    });

    return {
      totalSize,
      totalGzippedSize,
      bundles,
      largestBundles,
      recommendations,
    };
  }

  // Get size insights
  public getSizeInsights(): {
    canOptimize: boolean;
    potentialSavings: number;
    suggestions: string[];
  } {
    const report = this.getReport();
    const potentialSavings = report.totalSize * 0.3; // Assume 30% can be saved

    return {
      canOptimize: report.totalSize > 5000000, // 5MB
      potentialSavings,
      suggestions: report.recommendations,
    };
  }
}

export default BundleAnalyzer;


