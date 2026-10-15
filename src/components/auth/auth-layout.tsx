'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from '@/i18n/provider';
import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Globe, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const tAuth = useTranslations('auth.common');
  const tLegal = useTranslations('legal.footer');
  const tA = useTranslations('a11y');
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background hero-gradient">
      {/* Top Bar */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="text-muted-foreground hover:text-foreground"
              aria-label={tA('backToHome')}
              title={tAuth('back')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10">
              <FileText className="w-5 h-5 text-brand" strokeWidth={2} />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-violet" fill="currentColor" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">
              CareerForge <span className="text-brand">AI</span>
            </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
              className="text-muted-foreground hover:text-foreground"
              aria-label={tA('switchLanguage')}
            >
              <Globe className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground"
              aria-label={tA('toggleTheme')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground font-body">
          {tLegal('copyright')}
        </p>
      </footer>
    </div>
  );
}