// ForceTouch.ts - React helpers for Force Touch / 3D Touch in METR
import React, {useEffect} from 'react';
import ForceTouchHandler from './ForceTouchHandler';

interface ForceTouchPreviewConfig {
  id: string;
  view: any;
  actions: Array<{
    id: string;
    title: string;
    subtitle?: string;
    icon?: string;
    action: () => void;
  }>;
}

// Hook to register a Force Touch preview for a given component id
export function useForceTouchPreview(
  componentId: string,
  preview: ForceTouchPreviewConfig,
): boolean {
  useEffect(() => {
    const handler = ForceTouchHandler.getInstance();
    handler.registerPreview(componentId, preview as any);

    return () => {
      handler.unregisterPreview(componentId);
    };
  }, [componentId, preview]);

  return ForceTouchHandler.getInstance().isForceTouchSupported();
}

// Higher-order component to attach Force Touch behaviour to existing components
export function withForceTouch<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentId: string,
  getPreview: (props: P) => ForceTouchPreviewConfig,
): React.FC<P> {
  const ComponentWithForceTouch: React.FC<P> = (props: P) => {
    const preview = getPreview(props);
    useForceTouchPreview(componentId, preview);
    // Avoid JSX in .ts file to prevent parser errors
    return React.createElement(WrappedComponent, props);
  };

  ComponentWithForceTouch.displayName = `WithForceTouch(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithForceTouch;
}

