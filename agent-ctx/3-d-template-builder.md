# Task 3-d: Functional + Combination Resume Templates

## Files Created
- `/src/components/resume/templates/functional.tsx`
- `/src/components/resume/templates/combination.tsx`

## Summary
Built two professional resume template components following the exact TemplateComponentProps signature and utility import patterns established by existing templates (ats-classic, executive, tech-professional, graduate).

### Functional Template
- **Design philosophy**: Skills-first for career changers
- **Key feature**: Two-section layout — summary + "Core Competencies" in top half, experience/education in bottom half
- **Skills visualization**: 2-column grid of prominent pills with 3px accent left border, subtle #f9fafb background, rounded corners
- **Section dividers**: 3px accent-colored left bar (16px tall) next to headings
- **Work experience**: Compact single-line format (position | company, date right-aligned)

### Combination Template
- **Design philosophy**: Balanced hybrid of skills prominence + chronological experience
- **Header**: 2-column row (professional title left, contact info right-aligned)
- **Skills visualization**: 2-column grid with 4px accent dot before each skill name
- **Section dividers**: 1.5px accent-colored bottom border under headings
- **Work experience**: Bullet-pointed descriptions (• prefix per line), company/location on gray second line
- **Education**: Degree+field bold with date right-aligned, school+GPA below

### Technical Details
- Both use `getTemplateStyles()` from utils, inline styles for dynamic properties, Tailwind only for layout
- Both reorder visible sections to prioritize skills/summary (functional: summary+skills first; combination: summary+skills+work+edu first)
- All 11 section types handled per template
- Zero ESLint errors on new files
- Already registered in `/src/lib/templates/registry.ts` (lazy imports)