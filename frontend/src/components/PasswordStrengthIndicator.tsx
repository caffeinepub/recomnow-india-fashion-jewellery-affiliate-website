import { useMemo } from 'react';
import { validatePasswordStrength, PasswordStrength } from '../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthIndicator({ 
  password, 
  className = '' 
}: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => {
    if (!password) return null;
    return validatePasswordStrength(password);
  }, [password]);

  if (!password || !validation) {
    return null;
  }

  const getStrengthColor = () => {
    switch (validation.strength) {
      case PasswordStrength.WEAK:
        return 'bg-red-500';
      case PasswordStrength.MEDIUM:
        return 'bg-yellow-500';
      case PasswordStrength.STRONG:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (validation.strength) {
      case PasswordStrength.WEAK:
        return 'Weak';
      case PasswordStrength.MEDIUM:
        return 'Medium';
      case PasswordStrength.STRONG:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthWidth = () => {
    switch (validation.strength) {
      case PasswordStrength.WEAK:
        return 'w-1/3';
      case PasswordStrength.MEDIUM:
        return 'w-2/3';
      case PasswordStrength.STRONG:
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
          />
        </div>
        <span className={`text-sm font-medium ${
          validation.strength === PasswordStrength.WEAK ? 'text-red-500' :
          validation.strength === PasswordStrength.MEDIUM ? 'text-yellow-500' :
          'text-green-500'
        }`}>
          {getStrengthText()}
        </span>
      </div>

      {/* Feedback */}
      {validation.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {validation.feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-red-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
