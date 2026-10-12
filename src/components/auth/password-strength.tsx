'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { validatePasswordStrength, getPasswordStrengthLabel } from '@/lib/auth/utils';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const t = useTranslations('auth.passwordStrength');

  if (!password) return null;

  const { score, requirements } = validatePasswordStrength(password);
  const { label, color } = getPasswordStrengthLabel(score);

  const requirementChecks = [
    { key: 'minLength', met: requirements.minLength },
    { key: 'uppercase', met: requirements.uppercase },
    { key: 'lowercase', met: requirements.lowercase },
    { key: 'number', met: requirements.number },
    { key: 'specialChar', met: requirements.specialChar },
  ];

  return (
    <div className="space-y-3 mt-3">
      {/* Strength Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full transition-all duration-500', color)}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground min-w-[70px] text-right font-body">
          {t(label)}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground font-body">
          {t('requirements')}
        </p>
        <ul className="grid grid-cols-1 gap-1">
          {requirementChecks.map((req) => (
            <li
              key={req.key}
              className={cn(
                'flex items-center gap-2 text-xs font-body transition-colors',
                req.met ? 'text-emerald' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              {t(req.key)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}