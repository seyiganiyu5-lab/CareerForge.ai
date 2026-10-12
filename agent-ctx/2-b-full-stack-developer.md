# Task 2-b: Blog Data, Components, and Pages

## Files Created

### Data
- `src/data/blog-posts.ts` — 10 blog categories, 2 authors, 8 full blog posts with EN/FR content

### Components
- `src/components/blog/blog-hero.tsx` — Hero section with gradient text heading and search bar
- `src/components/blog/blog-card.tsx` — Blog post card with image placeholder, category badge, author initials, hover effects
- `src/components/blog/featured-article.tsx` — Large featured article card (image left, content right)
- `src/components/blog/category-filter.tsx` — Horizontal scrollable category pills with active state
- `src/components/blog/newsletter-section.tsx` — Email subscription section using `content.newsletter` translations

### Pages
- `src/app/(content)/blog/page.tsx` — Blog homepage: hero, featured article, category filter, post grid, newsletter
- `src/app/(content)/blog/[slug]/page.tsx` — Article page: breadcrumb, ToC sidebar, article content, share, prev/next, related posts

## Key Design Decisions
- All components use `useLocale` + `getLocalized` for EN/FR translation
- Poppins font for headings, Inter for body text
- Author avatars use colored circles with initials (no real images)
- Category badges have distinct color coding
- Framer Motion animations: fade-in, whileInView stagger, hover scale
- Article page uses `lg:grid lg:grid-cols-[240px_1fr] lg:gap-12` layout
- Lint passes clean