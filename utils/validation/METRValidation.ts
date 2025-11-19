// METRValidation.ts - Validation Utilities
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class METRValidation {
  // Email validation
  static email(value: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      errors: isValid ? [] : ['Invalid email format'],
    };
  }

  // URL validation
  static url(value: string): ValidationResult {
    try {
      new URL(value);
      return {isValid: true, errors: []};
    } catch {
      return {isValid: false, errors: ['Invalid URL format']};
    }
  }

  // Required field
  static required(value: any): ValidationResult {
    const isValid = value !== null && value !== undefined && value !== '';
    return {
      isValid,
      errors: isValid ? [] : ['This field is required'],
    };
  }

  // Min length
  static minLength(value: string, min: number): ValidationResult {
    const isValid = value.length >= min;
    return {
      isValid,
      errors: isValid ? [] : [`Minimum length is ${min} characters`],
    };
  }

  // Max length
  static maxLength(value: string, max: number): ValidationResult {
    const isValid = value.length <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Maximum length is ${max} characters`],
    };
  }

  // Min value
  static min(value: number, min: number): ValidationResult {
    const isValid = value >= min;
    return {
      isValid,
      errors: isValid ? [] : [`Minimum value is ${min}`],
    };
  }

  // Max value
  static max(value: number, max: number): ValidationResult {
    const isValid = value <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Maximum value is ${max}`],
    };
  }

  // Pattern match
  static pattern(value: string, pattern: RegExp): ValidationResult {
    const isValid = pattern.test(value);
    return {
      isValid,
      errors: isValid ? [] : ['Invalid format'],
    };
  }

  // Custom validation
  static custom(value: any, validator: (val: any) => boolean, message: string): ValidationResult {
    const isValid = validator(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  }

  // Validate with multiple rules
  static validate(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Password strength
  static passwordStrength(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Phone number validation
  static phoneNumber(phone: string): ValidationResult {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phone.replace(/\s/g, ''));
    return {
      isValid,
      errors: isValid ? [] : ['Invalid phone number format'],
    };
  }

  // Credit card validation (Luhn algorithm)
  static creditCard(cardNumber: string): ValidationResult {
    const cleaned = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const isValid = sum % 10 === 0 && cleaned.length >= 13 && cleaned.length <= 19;
    return {
      isValid,
      errors: isValid ? [] : ['Invalid credit card number'],
    };
  }
}

export default METRValidation;


