// FormValidator.ts - Advanced Form Validation for METR
import {DeviceEventEmitter} from 'react-native';

interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

interface FieldValidation {
  field: string;
  rules: ValidationRule[];
  value: any;
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export class FormValidator {
  private static instance: FormValidator;
  private validations: Map<string, FieldValidation[]> = new Map();

  private constructor() {
    this.setupDefaultValidators();
  }

  public static getInstance(): FormValidator {
    if (!FormValidator.instance) {
      FormValidator.instance = new FormValidator();
    }
    return FormValidator.instance;
  }

  // Setup default validators
  private setupDefaultValidators(): void {
    // Common validators are built-in
  }

  // Register validation
  public registerValidation(formId: string, fields: FieldValidation[]): void {
    this.validations.set(formId, fields);
  }

  // Validate form
  public validate(formId: string, values: Record<string, any>): ValidationResult {
    const fields = this.validations.get(formId);
    if (!fields) {
      return {valid: true, errors: {}};
    }

    const errors: Record<string, string[]> = {};
    let valid = true;

    for (const field of fields) {
      const value = values[field.field];
      const fieldErrors: string[] = [];

      for (const rule of field.rules) {
        if (!this.validateRule(rule, value)) {
          fieldErrors.push(rule.message);
          valid = false;
        }
      }

      if (fieldErrors.length > 0) {
        errors[field.field] = fieldErrors;
      }
    }

    const result = {valid, errors};

    DeviceEventEmitter.emit('form_validated', {formId, result});

    return result;
  }

  // Validate rule
  private validateRule(rule: ValidationRule, value: any): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';

      case 'email':
        return this.validateEmail(value);

      case 'url':
        return this.validateUrl(value);

      case 'minLength':
        return value && value.length >= rule.value;

      case 'maxLength':
        return !value || value.length <= rule.value;

      case 'pattern':
        return rule.value.test(value);

      case 'custom':
        return rule.validator ? rule.validator(value) : true;

      default:
        return true;
    }
  }

  // Validate email
  private validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate URL
  private validateUrl(url: string): boolean {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Create validation rules
  public createRules(): {
    required: (message: string) => ValidationRule;
    email: (message: string) => ValidationRule;
    url: (message: string) => ValidationRule;
    minLength: (length: number, message: string) => ValidationRule;
    maxLength: (length: number, message: string) => ValidationRule;
    pattern: (pattern: RegExp, message: string) => ValidationRule;
    custom: (validator: (value: any) => boolean, message: string) => ValidationRule;
  } {
    return {
      required: (message: string) => ({
        type: 'required',
        message,
      }),
      email: (message: string) => ({
        type: 'email',
        message,
      }),
      url: (message: string) => ({
        type: 'url',
        message,
      }),
      minLength: (length: number, message: string) => ({
        type: 'minLength',
        value: length,
        message,
      }),
      maxLength: (length: number, message: string) => ({
        type: 'maxLength',
        value: length,
        message,
      }),
      pattern: (pattern: RegExp, message: string) => ({
        type: 'pattern',
        value: pattern,
        message,
      }),
      custom: (validator: (value: any) => boolean, message: string) => ({
        type: 'custom',
        validator,
        message,
      }),
    };
  }
}

export default FormValidator;


