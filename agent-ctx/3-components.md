---
Task ID: 3
Agent: Components Agent
Task: Create navbar.tsx, hero.tsx, trust.tsx landing page components

Work Log:
- Created /src/components/landing/ directory
- Built navbar.tsx: sticky nav with scroll-based glass effect, inline SVG logo (FileText + Sparkles), 6 nav links with active indicator (framer-motion layoutId), EN/FR language switcher, Sun/Moon theme toggle (next-themes useTheme), Login + Get Started buttons, responsive mobile Sheet menu with staggered animations
- Built hero.tsx: two-column layout (content + dashboard mockup), gradient badge pill, gradient-text headline, two CTA buttons, trust stars, 6 floating glass cards (Resume Preview, AI Score 95, ATS Score 92, Cover Letter, Job Tracker, PDF Export) with progress bars, staggered entrance animations, responsive (stacked on mobile, grid on lg)
- Built trust.tsx: subtle border-y section, heading from translations, 5 company names (Google, Microsoft, Amazon, Meta, Deloitte) with muted styling, gradient edge masks, whileInView animations
- Fixed lint: replaced `useState + useEffect` mounted pattern with `useSyncExternalStore` for SSR-safe client detection
- All three files pass ESLint (only pre-existing provider.tsx error remains from Task 1-2)
- All text uses useTranslations() from next-intl — no hardcoded strings
- Font classes applied: font-heading for headings, font-body for body
- CSS utility classes used: glass, gradient-text, hero-gradient, grid-pattern, animate-float, animate-float-delayed, animate-float-slow
- Brand colors used: brand, violet, emerald and their light variants

Stage Summary:
- 3 production-quality components created in /src/components/landing/
- All components are 'use client' with framer-motion animations
- All text internationalized via next-intl useTranslations
- Responsive design: mobile-first with md/lg breakpoints
- Lint passes for all new files