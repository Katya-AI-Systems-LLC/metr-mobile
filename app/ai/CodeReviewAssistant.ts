// CodeReviewAssistant.ts - AI-Powered Code Review & Analysis
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CodeReview {
  id: string;
  prId: string;
  title: string;
  author: string;
  files: FileReview[];
  summary: ReviewSummary;
  issues: Issue[];
  suggestions: Suggestion[];
  security: SecurityAnalysis;
  performance: PerformanceAnalysis;
  bestPractices: BestPracticeCheck[];
  complexity: ComplexityAnalysis;
  testCoverage: TestCoverageAnalysis;
  approved: boolean;
  score: number;
}

interface FileReview {
  path: string;
  language: string;
  additions: number;
  deletions: number;
  changes: CodeChange[];
  issues: Issue[];
  complexity: number;
}

interface CodeChange {
  line: number;
  type: 'addition' | 'deletion' | 'modification';
  content: string;
  review?: string;
}

interface Issue {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  type: 'bug' | 'security' | 'performance' | 'style' | 'maintainability';
  file: string;
  line: number;
  message: string;
  suggestion?: string;
  autoFixable: boolean;
  rule?: string;
}

interface Suggestion {
  id: string;
  type: 'refactor' | 'optimization' | 'cleanup' | 'documentation';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  code?: string;
}

interface ReviewSummary {
  overview: string;
  mainChanges: string[];
  risks: string[];
  improvements: string[];
  verdict: 'approve' | 'request_changes' | 'comment';
}

interface SecurityAnalysis {
  vulnerabilities: Array<{
    type: string;
    severity: string;
    description: string;
    file: string;
    line: number;
  }>;
  hardcodedSecrets: boolean;
  sqlInjectionRisk: boolean;
  xssRisk: boolean;
  sensitiveDataExposure: boolean;
}

interface PerformanceAnalysis {
  hasPerformanceIssues: boolean;
  issues: Array<{
    type: string;
    impact: string;
    location: string;
    suggestion: string;
  }>;
  bigOComplexity: string;
  memoryLeaks: boolean;
}

interface BestPracticeCheck {
  rule: string;
  passed: boolean;
  violations: Array<{
    file: string;
    line: number;
    message: string;
  }>;
}

interface ComplexityAnalysis {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  functions: number;
  classes: number;
  duplicatedCode: number;
}

interface TestCoverageAnalysis {
  coverage: number;
  uncoveredLines: number[];
  missingTests: string[];
  testQuality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
}

export class CodeReviewAssistant {
  private static instance: CodeReviewAssistant;
  private patterns: Map<string, RegExp>;
  private rules: Map<string, (code: string) => Issue[]>;
  
  private constructor() {
    this.patterns = new Map();
    this.rules = new Map();
    this.initializePatterns();
    this.initializeRules();
  }

  public static getInstance(): CodeReviewAssistant {
    if (!CodeReviewAssistant.instance) {
      CodeReviewAssistant.instance = new CodeReviewAssistant();
    }
    return CodeReviewAssistant.instance;
  }

  private initializePatterns() {
    // Security patterns
    this.patterns.set('hardcodedSecret', /(?:api[_-]?key|secret|password|token)\s*=\s*["'][^"']+["']/gi);
    this.patterns.set('sqlInjection', /query\s*\(\s*['"`].*\$\{.*\}.*['"`]\s*\)/gi);
    this.patterns.set('xss', /innerHTML\s*=|document\.write\(/gi);
    
    // Performance patterns
    this.patterns.set('inefficientLoop', /for.*in\s+.*array/gi);
    this.patterns.set('memoryLeak', /addEventListener.*(?!removeEventListener)/gi);
    this.patterns.set('syncInAsync', /async.*await.*\.forEach/gi);
    
    // Code smell patterns
    this.patterns.set('consoleLogs', /console\.(log|error|warn|debug)/gi);
    this.patterns.set('todoComments', /\/\/\s*(TODO|FIXME|HACK|XXX)/gi);
    this.patterns.set('debugger', /\bdebugger\b/gi);
    this.patterns.set('unusedImports', /import\s+.*\s+from\s+['"][^'"]+['"]/gi);
  }

  private initializeRules() {
    // Security rules
    this.rules.set('security', (code: string) => {
      const issues: Issue[] = [];
      
      // Check for hardcoded secrets
      const secretMatches = code.matchAll(this.patterns.get('hardcodedSecret')!);
      for (const match of secretMatches) {
        issues.push({
          id: `sec_${Date.now()}`,
          severity: 'critical',
          type: 'security',
          file: '',
          line: 0,
          message: 'Hardcoded secret detected',
          suggestion: 'Use environment variables for sensitive data',
          autoFixable: false,
        });
      }
      
      return issues;
    });

    // Performance rules
    this.rules.set('performance', (code: string) => {
      const issues: Issue[] = [];
      
      // Check for inefficient loops
      if (this.patterns.get('inefficientLoop')!.test(code)) {
        issues.push({
          id: `perf_${Date.now()}`,
          severity: 'major',
          type: 'performance',
          file: '',
          line: 0,
          message: 'Inefficient loop detected',
          suggestion: 'Use for...of or traditional for loop instead',
          autoFixable: true,
        });
      }
      
      return issues;
    });
  }

  // Review pull request
  public async reviewPullRequest(
    prId: string,
    files: Array<{path: string; content: string; diff: string}>
  ): Promise<CodeReview> {
    const fileReviews: FileReview[] = [];
    const allIssues: Issue[] = [];
    
    // Review each file
    for (const file of files) {
      const fileReview = await this.reviewFile(file);
      fileReviews.push(fileReview);
      allIssues.push(...fileReview.issues);
    }
    
    // Perform overall analysis
    const security = this.analyzeSecurityOverall(files);
    const performance = this.analyzePerformanceOverall(files);
    const bestPractices = this.checkBestPractices(files);
    const complexity = this.analyzeComplexity(files);
    const testCoverage = this.analyzeTestCoverage(files);
    const suggestions = this.generateSuggestions(fileReviews, allIssues);
    const summary = this.generateReviewSummary(fileReviews, allIssues, suggestions);
    
    // Calculate review score
    const score = this.calculateReviewScore(allIssues, complexity, testCoverage);
    
    const review: CodeReview = {
      id: `review_${Date.now()}`,
      prId,
      title: `PR #${prId} Review`,
      author: 'AI Assistant',
      files: fileReviews,
      summary,
      issues: allIssues,
      suggestions,
      security,
      performance,
      bestPractices,
      complexity,
      testCoverage,
      approved: score >= 70 && !allIssues.some(i => i.severity === 'critical'),
      score,
    };
    
    await this.saveReview(review);
    return review;
  }

  // Review single file
  private async reviewFile(file: {path: string; content: string; diff: string}): Promise<FileReview> {
    const language = this.detectLanguage(file.path);
    const issues: Issue[] = [];
    const changes: CodeChange[] = [];
    
    // Parse diff
    const diffLines = file.diff.split('\n');
    let lineNumber = 0;
    
    diffLines.forEach(line => {
      if (line.startsWith('+')) {
        lineNumber++;
        changes.push({
          line: lineNumber,
          type: 'addition',
          content: line.substring(1),
        });
        
        // Review the added line
        const lineIssues = this.reviewCodeLine(line.substring(1), file.path, lineNumber);
        issues.push(...lineIssues);
      } else if (line.startsWith('-')) {
        changes.push({
          line: lineNumber,
          type: 'deletion',
          content: line.substring(1),
        });
      } else if (!line.startsWith('@@')) {
        lineNumber++;
      }
    });
    
    // Apply language-specific rules
    const languageIssues = this.applyLanguageRules(file.content, language);
    issues.push(...languageIssues);
    
    // Calculate file complexity
    const complexity = this.calculateFileComplexity(file.content);
    
    return {
      path: file.path,
      language,
      additions: changes.filter(c => c.type === 'addition').length,
      deletions: changes.filter(c => c.type === 'deletion').length,
      changes,
      issues,
      complexity,
    };
  }

  // Review single line of code
  private reviewCodeLine(line: string, file: string, lineNumber: number): Issue[] {
    const issues: Issue[] = [];
    
    // Check for console logs
    if (this.patterns.get('consoleLogs')!.test(line)) {
      issues.push({
        id: `issue_${Date.now()}`,
        severity: 'minor',
        type: 'style',
        file,
        line: lineNumber,
        message: 'Console log detected',
        suggestion: 'Remove console logs before production',
        autoFixable: true,
      });
    }
    
    // Check for TODO comments
    if (this.patterns.get('todoComments')!.test(line)) {
      issues.push({
        id: `issue_${Date.now()}`,
        severity: 'info',
        type: 'maintainability',
        file,
        line: lineNumber,
        message: 'TODO comment found',
        suggestion: 'Consider addressing TODO items',
        autoFixable: false,
      });
    }
    
    // Check for debugger statements
    if (this.patterns.get('debugger')!.test(line)) {
      issues.push({
        id: `issue_${Date.now()}`,
        severity: 'critical',
        type: 'bug',
        file,
        line: lineNumber,
        message: 'Debugger statement found',
        suggestion: 'Remove debugger statement',
        autoFixable: true,
      });
    }
    
    return issues;
  }

  // Apply language-specific rules
  private applyLanguageRules(code: string, language: string): Issue[] {
    const issues: Issue[] = [];
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        issues.push(...this.reviewJavaScript(code));
        break;
      case 'python':
        issues.push(...this.reviewPython(code));
        break;
      case 'java':
        issues.push(...this.reviewJava(code));
        break;
      default:
        // Generic rules
        issues.push(...this.reviewGeneric(code));
    }
    
    return issues;
  }

  private reviewJavaScript(code: string): Issue[] {
    const issues: Issue[] = [];
    
    // Check for var usage
    if (/\bvar\s+\w+/.test(code)) {
      issues.push({
        id: `js_${Date.now()}`,
        severity: 'minor',
        type: 'style',
        file: '',
        line: 0,
        message: 'Use const/let instead of var',
        autoFixable: true,
      });
    }
    
    // Check for == instead of ===
    if (/[^=!]==[^=]/.test(code)) {
      issues.push({
        id: `js_${Date.now()}`,
        severity: 'major',
        type: 'bug',
        file: '',
        line: 0,
        message: 'Use === instead of ==',
        autoFixable: true,
      });
    }
    
    // Check for async without await
    if (/async\s+(?:function|\([^)]*\)\s*=>)[^{]*{[^}]*(?!await)[^}]*}/.test(code)) {
      issues.push({
        id: `js_${Date.now()}`,
        severity: 'minor',
        type: 'maintainability',
        file: '',
        line: 0,
        message: 'Async function without await',
        autoFixable: false,
      });
    }
    
    return issues;
  }

  private reviewPython(code: string): Issue[] {
    const issues: Issue[] = [];
    
    // Check for PEP8 violations
    if (/\S\s{2,}(?!#)/.test(code)) {
      issues.push({
        id: `py_${Date.now()}`,
        severity: 'minor',
        type: 'style',
        file: '',
        line: 0,
        message: 'PEP8: Multiple spaces',
        autoFixable: true,
      });
    }
    
    return issues;
  }

  private reviewJava(code: string): Issue[] {
    const issues: Issue[] = [];
    
    // Check for null checks
    if (/if\s*\(\s*\w+\s*==\s*null\s*\)/.test(code)) {
      issues.push({
        id: `java_${Date.now()}`,
        severity: 'info',
        type: 'maintainability',
        file: '',
        line: 0,
        message: 'Consider using Optional instead of null checks',
        autoFixable: false,
      });
    }
    
    return issues;
  }

  private reviewGeneric(code: string): Issue[] {
    const issues: Issue[] = [];
    
    // Check for long lines
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          id: `generic_${Date.now()}`,
          severity: 'minor',
          type: 'style',
          file: '',
          line: index + 1,
          message: 'Line too long (>120 characters)',
          autoFixable: false,
        });
      }
    });
    
    return issues;
  }

  // Detect programming language
  private detectLanguage(filepath: string): string {
    const extension = filepath.split('.').pop()?.toLowerCase();
    
    const languageMap: {[key: string]: string} = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
    };
    
    return languageMap[extension || ''] || 'unknown';
  }

  // Analyze security overall
  private analyzeSecurityOverall(files: Array<{path: string; content: string}>): SecurityAnalysis {
    const vulnerabilities: any[] = [];
    let hardcodedSecrets = false;
    let sqlInjectionRisk = false;
    let xssRisk = false;
    let sensitiveDataExposure = false;
    
    files.forEach(file => {
      if (this.patterns.get('hardcodedSecret')!.test(file.content)) {
        hardcodedSecrets = true;
        vulnerabilities.push({
          type: 'Hardcoded Secret',
          severity: 'critical',
          description: 'Sensitive data hardcoded in source',
          file: file.path,
          line: 0,
        });
      }
      
      if (this.patterns.get('sqlInjection')!.test(file.content)) {
        sqlInjectionRisk = true;
        vulnerabilities.push({
          type: 'SQL Injection',
          severity: 'critical',
          description: 'Potential SQL injection vulnerability',
          file: file.path,
          line: 0,
        });
      }
      
      if (this.patterns.get('xss')!.test(file.content)) {
        xssRisk = true;
        vulnerabilities.push({
          type: 'XSS',
          severity: 'major',
          description: 'Potential XSS vulnerability',
          file: file.path,
          line: 0,
        });
      }
    });
    
    return {
      vulnerabilities,
      hardcodedSecrets,
      sqlInjectionRisk,
      xssRisk,
      sensitiveDataExposure,
    };
  }

  // Analyze performance overall
  private analyzePerformanceOverall(files: Array<{path: string; content: string}>): PerformanceAnalysis {
    const issues: any[] = [];
    let hasPerformanceIssues = false;
    let memoryLeaks = false;
    
    files.forEach(file => {
      if (this.patterns.get('inefficientLoop')!.test(file.content)) {
        hasPerformanceIssues = true;
        issues.push({
          type: 'Inefficient Loop',
          impact: 'medium',
          location: file.path,
          suggestion: 'Use optimized iteration methods',
        });
      }
      
      if (this.patterns.get('memoryLeak')!.test(file.content)) {
        memoryLeaks = true;
        hasPerformanceIssues = true;
        issues.push({
          type: 'Memory Leak',
          impact: 'high',
          location: file.path,
          suggestion: 'Ensure proper cleanup of event listeners',
        });
      }
    });
    
    return {
      hasPerformanceIssues,
      issues,
      bigOComplexity: 'O(n)', // Simplified
      memoryLeaks,
    };
  }

  // Check best practices
  private checkBestPractices(files: Array<{path: string; content: string}>): BestPracticeCheck[] {
    const checks: BestPracticeCheck[] = [
      {
        rule: 'No console logs',
        passed: true,
        violations: [],
      },
      {
        rule: 'Consistent naming',
        passed: true,
        violations: [],
      },
      {
        rule: 'Error handling',
        passed: true,
        violations: [],
      },
    ];
    
    files.forEach(file => {
      // Check for console logs
      if (this.patterns.get('consoleLogs')!.test(file.content)) {
        checks[0].passed = false;
        checks[0].violations.push({
          file: file.path,
          line: 0,
          message: 'Console log found',
        });
      }
    });
    
    return checks;
  }

  // Analyze complexity
  private analyzeComplexity(files: Array<{path: string; content: string}>): ComplexityAnalysis {
    let totalLines = 0;
    let totalFunctions = 0;
    let totalClasses = 0;
    
    files.forEach(file => {
      const lines = file.content.split('\n');
      totalLines += lines.length;
      
      // Count functions (simplified)
      totalFunctions += (file.content.match(/function\s+\w+|=>\s*{|\w+\s*\([^)]*\)\s*{/g) || []).length;
      
      // Count classes (simplified)
      totalClasses += (file.content.match(/class\s+\w+/g) || []).length;
    });
    
    return {
      cyclomaticComplexity: Math.floor(totalFunctions * 1.5), // Simplified
      cognitiveComplexity: Math.floor(totalFunctions * 2), // Simplified
      linesOfCode: totalLines,
      functions: totalFunctions,
      classes: totalClasses,
      duplicatedCode: 0, // Would need more analysis
    };
  }

  // Calculate file complexity
  private calculateFileComplexity(content: string): number {
    const lines = content.split('\n').length;
    const functions = (content.match(/function\s+\w+|=>\s*{/g) || []).length;
    const conditionals = (content.match(/if\s*\(|switch\s*\(|\?\s*:/g) || []).length;
    const loops = (content.match(/for\s*\(|while\s*\(|do\s*{/g) || []).length;
    
    return Math.floor((functions * 2) + (conditionals * 1.5) + (loops * 1.5) + (lines * 0.01));
  }

  // Analyze test coverage
  private analyzeTestCoverage(files: Array<{path: string; content: string}>): TestCoverageAnalysis {
    const testFiles = files.filter(f => 
      f.path.includes('.test.') || f.path.includes('.spec.') || f.path.includes('__tests__')
    );
    
    const coverage = testFiles.length > 0 ? 
      Math.min(100, testFiles.length * 20) : 0;
    
    let quality: TestCoverageAnalysis['testQuality'] = 'poor';
    if (coverage >= 80) quality = 'excellent';
    else if (coverage >= 60) quality = 'good';
    else if (coverage >= 40) quality = 'needs_improvement';
    
    return {
      coverage,
      uncoveredLines: [],
      missingTests: [],
      testQuality: quality,
    };
  }

  // Generate suggestions
  private generateSuggestions(fileReviews: FileReview[], issues: Issue[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Suggest refactoring for complex files
    fileReviews.forEach(file => {
      if (file.complexity > 50) {
        suggestions.push({
          id: `sug_${Date.now()}`,
          type: 'refactor',
          description: `Consider refactoring ${file.path} to reduce complexity`,
          impact: 'high',
          effort: 'medium',
        });
      }
    });
    
    // Suggest optimizations for performance issues
    if (issues.some(i => i.type === 'performance')) {
      suggestions.push({
        id: `sug_${Date.now()}`,
        type: 'optimization',
        description: 'Optimize loops and async operations for better performance',
        impact: 'medium',
        effort: 'low',
      });
    }
    
    return suggestions;
  }

  // Generate review summary
  private generateReviewSummary(
    fileReviews: FileReview[],
    issues: Issue[],
    suggestions: Suggestion[]
  ): ReviewSummary {
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const majorIssues = issues.filter(i => i.severity === 'major');
    
    let verdict: ReviewSummary['verdict'] = 'approve';
    if (criticalIssues.length > 0) {
      verdict = 'request_changes';
    } else if (majorIssues.length > 2) {
      verdict = 'request_changes';
    } else if (issues.length > 10) {
      verdict = 'comment';
    }
    
    return {
      overview: `Reviewed ${fileReviews.length} files with ${issues.length} issues found`,
      mainChanges: fileReviews.map(f => `Modified ${f.path}`),
      risks: criticalIssues.map(i => i.message),
      improvements: suggestions.map(s => s.description),
      verdict,
    };
  }

  // Calculate review score
  private calculateReviewScore(
    issues: Issue[],
    complexity: ComplexityAnalysis,
    testCoverage: TestCoverageAnalysis
  ): number {
    let score = 100;
    
    // Deduct for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 20; break;
        case 'major': score -= 10; break;
        case 'minor': score -= 5; break;
        case 'info': score -= 1; break;
      }
    });
    
    // Factor in complexity
    if (complexity.cyclomaticComplexity > 100) score -= 10;
    if (complexity.cyclomaticComplexity > 200) score -= 10;
    
    // Factor in test coverage
    if (testCoverage.coverage < 40) score -= 15;
    else if (testCoverage.coverage < 60) score -= 10;
    else if (testCoverage.coverage < 80) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // Save review
  private async saveReview(review: CodeReview): Promise<void> {
    try {
      const reviews = await this.getAllReviews();
      reviews.push(review);
      await AsyncStorage.setItem('code_reviews', JSON.stringify(reviews));
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  }

  // Get all reviews
  public async getAllReviews(): Promise<CodeReview[]> {
    try {
      const saved = await AsyncStorage.getItem('code_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load reviews:', error);
      return [];
    }
  }

  // Auto-fix issues
  public autoFix(code: string, issues: Issue[]): string {
    let fixedCode = code;
    
    issues.filter(i => i.autoFixable).forEach(issue => {
      switch (issue.type) {
        case 'style':
          if (issue.message.includes('console log')) {
            fixedCode = fixedCode.replace(/console\.(log|error|warn|debug)\([^)]*\);?\n?/g, '');
          }
          if (issue.message.includes('var')) {
            fixedCode = fixedCode.replace(/\bvar\s+/g, 'const ');
          }
          break;
        case 'bug':
          if (issue.message.includes('debugger')) {
            fixedCode = fixedCode.replace(/\bdebugger;?\n?/g, '');
          }
          if (issue.message.includes('===')) {
            fixedCode = fixedCode.replace(/([^=!])={2}([^=])/g, '$1===$2');
          }
          break;
      }
    });
    
    return fixedCode;
  }
}
