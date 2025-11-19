// METRErrorHandler.ts - Centralized Error Handling
import {DeviceEventEmitter, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import {METRAnalytics} from '../analytics/METRAnalytics';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  AI = 'ai',
  WEB3 = 'web3',
  ARVR = 'arvr',
  UI = 'ui',
  DATA = 'data',
  UNKNOWN = 'unknown',
}

interface ErrorContext {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userId?: string;
  screen?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class METRErrorHandler {
  private static instance: METRErrorHandler;
  private errorHistory: Array<{error: Error; context: ErrorContext; timestamp: number}> = [];
  private maxHistorySize: number = 100;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): METRErrorHandler {
    if (!METRErrorHandler.instance) {
      METRErrorHandler.instance = new METRErrorHandler();
    }
    return METRErrorHandler.instance;
  }

  // Handle error
  public handleError(
    error: Error,
    context: ErrorContext,
    showAlert: boolean = false
  ): void {
    // Log error
    console.error(`[${context.category}] ${error.message}`, error);

    // Store in history
    this.errorHistory.push({
      error,
      context,
      timestamp: Date.now(),
    });

    // Keep only last N errors
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Track analytics
    METRAnalytics.getInstance().error(error, {
      category: context.category,
      severity: context.severity,
      screen: context.screen,
      action: context.action,
      ...context.metadata,
    });

    // Send to Sentry (if enabled)
    if (__DEV__ === false) {
      Sentry.captureException(error, {
        tags: {
          category: context.category,
          severity: context.severity,
        },
        extra: {
          screen: context.screen,
          action: context.action,
          ...context.metadata,
        },
      });
    }

    // Emit event
    DeviceEventEmitter.emit('error_occurred', {
      error: {
        message: error.message,
        stack: error.stack,
      },
      context,
    });

    // Show alert if needed
    if (showAlert && context.severity === ErrorSeverity.CRITICAL) {
      this.showErrorAlert(error, context);
    }
  }

  // Handle network error
  public handleNetworkError(error: Error, metadata?: Record<string, any>): void {
    this.handleError(error, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      metadata,
    });
  }

  // Handle AI error
  public handleAIError(error: Error, metadata?: Record<string, any>): void {
    this.handleError(error, {
      category: ErrorCategory.AI,
      severity: ErrorSeverity.LOW,
      metadata,
    });
  }

  // Handle Web3 error
  public handleWeb3Error(error: Error, metadata?: Record<string, any>): void {
    this.handleError(error, {
      category: ErrorCategory.WEB3,
      severity: ErrorSeverity.HIGH,
      metadata,
    });
  }

  // Handle auth error
  public handleAuthError(error: Error, metadata?: Record<string, any>): void {
    this.handleError(error, {
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.HIGH,
      metadata,
    });
  }

  // Get error history
  public getErrorHistory(
    category?: ErrorCategory,
    severity?: ErrorSeverity
  ): Array<{error: Error; context: ErrorContext; timestamp: number}> {
    let history = this.errorHistory;

    if (category) {
      history = history.filter(item => item.context.category === category);
    }

    if (severity) {
      history = history.filter(item => item.context.severity === severity);
    }

    return history;
  }

  // Get error statistics
  public getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentErrors: Array<{message: string; category: ErrorCategory; timestamp: number}>;
  } {
    const byCategory: Record<ErrorCategory, number> = {
      network: 0,
      auth: 0,
      ai: 0,
      web3: 0,
      arvr: 0,
      ui: 0,
      data: 0,
      unknown: 0,
    };

    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    this.errorHistory.forEach(({context}) => {
      byCategory[context.category]++;
      bySeverity[context.severity]++;
    });

    const recentErrors = this.errorHistory
      .slice(-10)
      .map(({error, context, timestamp}) => ({
        message: error.message,
        category: context.category,
        timestamp,
      }));

    return {
      total: this.errorHistory.length,
      byCategory,
      bySeverity,
      recentErrors,
    };
  }

  // Clear error history
  public clearHistory(): void {
    this.errorHistory = [];
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers(): void {
    // React Native Error Handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.handleError(error, {
        category: ErrorCategory.UNKNOWN,
        severity: isFatal ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
      }, isFatal);

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Promise rejection handler
    if (global.Promise) {
      const originalRejectionHandler = global.Promise.reject;
      global.Promise.reject = function(reason: any) {
        if (reason instanceof Error) {
          METRErrorHandler.getInstance().handleError(reason, {
            category: ErrorCategory.UNKNOWN,
            severity: ErrorSeverity.MEDIUM,
          });
        }
        return originalRejectionHandler.call(this, reason);
      };
    }
  }

  // Show error alert
  private showErrorAlert(error: Error, context: ErrorContext): void {
    Alert.alert(
      'Error',
      error.message || 'An unexpected error occurred',
      [
        {
          text: 'OK',
          style: 'default',
        },
        {
          text: 'Report',
          onPress: () => {
            // Report error
            this.reportError(error, context);
          },
        },
      ]
    );
  }

  // Report error
  private async reportError(error: Error, context: ErrorContext): Promise<void> {
    try {
      const errorReport = {
        error: {
          message: error.message,
          stack: error.stack,
        },
        context,
        timestamp: Date.now(),
        deviceInfo: {
          platform: 'mobile',
          // Add device info
        },
      };

      // Store for later sending
      const reports = await AsyncStorage.getItem('error_reports');
      const reportsArray = reports ? JSON.parse(reports) : [];
      reportsArray.push(errorReport);
      
      // Keep only last 50 reports
      const reportsToKeep = reportsArray.slice(-50);
      await AsyncStorage.setItem('error_reports', JSON.stringify(reportsToKeep));

      // In production, send to error reporting service
      // await this.sendToServer(errorReport);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }
}

export default METRErrorHandler;


