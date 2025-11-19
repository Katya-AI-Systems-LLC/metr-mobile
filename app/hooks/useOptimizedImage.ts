// useOptimizedImage.ts - React Hook for Optimized Images
import {useState, useEffect} from 'react';
import {PerformanceOptimizer} from '../utils/performance/PerformanceOptimizer';

interface UseOptimizedImageOptions {
  url: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: string;
}

export const useOptimizedImage = (options: UseOptimizedImageOptions) => {
  const {url, width, height, placeholder, fallback} = options;
  const [optimizedUrl, setOptimizedUrl] = useState<string>(url);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const optimizer = PerformanceOptimizer.getInstance();

  useEffect(() => {
    if (!url) {
      setError(true);
      setLoading(false);
      return;
    }

    // Optimize image URL
    const optimized = optimizer.optimizeImage(url, width, height);
    setOptimizedUrl(optimized);

    // Preload image
    const img = new Image();
    img.onload = () => {
      setLoading(false);
      setError(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
      if (fallback) {
        setOptimizedUrl(fallback);
      }
    };
    img.src = optimized;
  }, [url, width, height, fallback, optimizer]);

  return {
    url: optimizedUrl,
    loading,
    error,
    placeholder: placeholder || optimizedUrl,
  };
};


