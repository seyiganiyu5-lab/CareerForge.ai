export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePasswordStrength(password: string): {
  score: number;
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
} {
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  const score = Math.min(100, (metCount / 5) * 100);

  return { score, requirements };
}

export function getPasswordStrengthLabel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'veryWeak', color: 'bg-destructive' };
  if (score <= 40) return { label: 'weak', color: 'bg-orange-500' };
  if (score <= 60) return { label: 'fair', color: 'bg-yellow-500' };
  if (score <= 80) return { label: 'strong', color: 'bg-emerald' };
  return { label: 'veryStrong', color: 'bg-emerald-500' };
}
