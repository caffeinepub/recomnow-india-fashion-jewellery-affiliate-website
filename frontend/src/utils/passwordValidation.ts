export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
}

export interface PasswordValidationResult {
  strength: PasswordStrength;
  isValid: boolean;
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 8) {
    feedback.push('At least 8 characters');
  } else {
    score += 1;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    feedback.push('At least one lowercase letter');
  } else {
    score += 1;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    feedback.push('At least one uppercase letter');
  } else {
    score += 1;
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    feedback.push('At least one number');
  } else {
    score += 1;
  }

  // Check for special characters (bonus)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  }

  // Determine strength
  let strength: PasswordStrength;
  if (score < 2) {
    strength = PasswordStrength.WEAK;
  } else if (score < 4) {
    strength = PasswordStrength.MEDIUM;
  } else {
    strength = PasswordStrength.STRONG;
  }

  // Password is valid if it meets minimum requirements
  const isValid = password.length >= 8 && /[a-z]/.test(password) && /[0-9]/.test(password);

  return {
    strength,
    isValid,
    feedback,
  };
}

export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

export const PASSWORD_REQUIREMENTS = [
  'At least 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one number',
  'At least one special character (optional, but recommended)',
];
