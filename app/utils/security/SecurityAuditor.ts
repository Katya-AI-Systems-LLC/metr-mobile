// SecurityAuditor.ts - Security Audit System for METR
import {DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  recommendation: string;
  timestamp: number;
}

interface SecurityAuditConfig {
  enableRealTimeScanning: boolean;
  enableDeepScan: boolean;
  scanInterval: number;
}

export class SecurityAuditor {
  private static instance: SecurityAuditor;
  private config: SecurityAuditConfig;
  private issues: SecurityIssue[] = [];
  private scanInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enableRealTimeScanning: true,
      enableDeepScan: false,
      scanInterval: 3600000, // 1 hour
    };

    if (this.config.enableRealTimeScanning) {
      this.startRealTimeScanning();
    }

    this.setupPeriodicScan();
  }

  public static getInstance(): SecurityAuditor {
    if (!SecurityAuditor.instance) {
      SecurityAuditor.instance = new SecurityAuditor();
    }
    return SecurityAuditor.instance;
  }

  // Perform security audit
  public async performAudit(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check for exposed secrets
    issues.push(...this.checkForSecrets());

    // Check for insecure storage
    issues.push(...await this.checkStorageSecurity());

    // Check for insecure network
    issues.push(...this.checkNetworkSecurity());

    // Check for outdated dependencies
    issues.push(...await this.checkDependencies());

    this.issues = issues;
    return issues;
  }

  // Check for secrets
  private checkForSecrets(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check environment variables
    const envVars = Object.keys(process.env);
    const secretPatterns = ['password', 'secret', 'key', 'token', 'api_key'];

    envVars.forEach(key => {
      if (secretPatterns.some(pattern => key.toLowerCase().includes(pattern))) {
        issues.push({
          severity: 'high',
          type: 'exposed_secret',
          description: `Potential secret found in environment: ${key}`,
          recommendation: 'Move secrets to secure storage',
          timestamp: Date.now(),
        });
      }
    });

    return issues;
  }

  // Check storage security
  private async checkStorageSecurity(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      const keys = await AsyncStorage.getAllKeys();
      const sensitiveKeys = keys.filter(key => 
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret')
      );

      if (sensitiveKeys.length > 0) {
        issues.push({
          severity: 'medium',
          type: 'insecure_storage',
          description: `Sensitive data stored in AsyncStorage: ${sensitiveKeys.join(', ')}`,
          recommendation: 'Use encrypted storage for sensitive data',
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // Storage check failed
    }

    return issues;
  }

  // Check network security
  private checkNetworkSecurity(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for HTTP (non-HTTPS) URLs
    // This would need to be implemented based on actual network usage

    return issues;
  }

  // Check dependencies
  private async checkDependencies(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check for known vulnerabilities
    // This would integrate with npm audit or similar

    return issues;
  }

  // Start real-time scanning
  private startRealTimeScanning(): void {
    DeviceEventEmitter.addListener('data_stored', (data: any) => {
      this.checkDataSecurity(data);
    });

    DeviceEventEmitter.addListener('network_request', (data: any) => {
      this.checkNetworkRequest(data);
    });
  }

  // Check data security
  private checkDataSecurity(data: any): void {
    // Check if sensitive data is being stored
    const sensitivePatterns = ['password', 'ssn', 'credit_card'];
    const dataString = JSON.stringify(data);

    sensitivePatterns.forEach(pattern => {
      if (dataString.toLowerCase().includes(pattern)) {
        this.reportIssue({
          severity: 'high',
          type: 'sensitive_data',
          description: `Sensitive data detected: ${pattern}`,
          recommendation: 'Encrypt sensitive data before storage',
          timestamp: Date.now(),
        });
      }
    });
  }

  // Check network request
  private checkNetworkRequest(data: any): void {
    if (data.url && data.url.startsWith('http://')) {
      this.reportIssue({
        severity: 'medium',
        type: 'insecure_network',
        description: `Insecure HTTP request to ${data.url}`,
        recommendation: 'Use HTTPS for all network requests',
        timestamp: Date.now(),
      });
    }
  }

  // Report issue
  private reportIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
    DeviceEventEmitter.emit('security_issue', issue);
  }

  // Setup periodic scan
  private setupPeriodicScan(): void {
    this.scanInterval = setInterval(() => {
      this.performAudit();
    }, this.config.scanInterval);
  }

  // Get issues
  public getIssues(): SecurityIssue[] {
    return [...this.issues];
  }

  // Get critical issues
  public getCriticalIssues(): SecurityIssue[] {
    return this.issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high');
  }

  // Configure auditor
  public configure(config: Partial<SecurityAuditConfig>): void {
    this.config = {...this.config, ...config};
    
    if (this.config.enableRealTimeScanning) {
      this.startRealTimeScanning();
    } else {
      // Stop real-time scanning
    }
  }

  // Stop scanning
  public stop(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }
}

export default SecurityAuditor;


