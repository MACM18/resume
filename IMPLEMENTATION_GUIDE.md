# Quick Implementation Guide

## Completing the Projects Page

Replace the imports and add the filter functionality:

```typescript
// At the top of app/projects/page.tsx, add:
import { useState, useMemo } from "react";

// Inside the Projects component, add state:
const [selectedTech, setSelectedTech] = useState<string | null>(null);

// Add tech extraction logic:
const allTechnologies = useMemo(() => {
  if (!projects) return [];
  const techSet = new Set<string>();
  projects.forEach((project) => {
    project.tech.forEach((tech) => techSet.add(tech));
  });
  return Array.from(techSet).sort();
}, [projects]);

// Add filter logic:
const filteredProjects = useMemo(() => {
  if (!projects) return [];
  if (!selectedTech) return projects;
  return projects.filter((project) => project.tech.includes(selectedTech));
}, [projects, selectedTech]);

// Then use filteredProjects instead of projects in your render
const featuredProjects = filteredProjects?.filter((p) => p.featured) || [];
const otherProjects = filteredProjects?.filter((p) => !p.featured) || [];
```

Then replace the project cards rendering with:

```typescript
{
  featuredProjects.map((project, index) => (
    <ProjectCard
      key={project.id}
      project={project}
      featured
      delay={0.2 + index * 0.1}
      priority={index === 0}
    />
  ));
}
```

## Adding SEO Metadata to Pages

### Contact Page

Add at the top of the file (after imports):

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Your Name",
  description:
    "Get in touch with me for projects, collaborations, or just to say hello.",
  openGraph: {
    title: "Contact",
    description: "Get in touch",
    type: "website",
  },
};
```

Note: This only works in Server Components. Since your pages are Client Components, you'll need to add a parent Server Component or use next/head:

```typescript
// For client components, use this instead:
import Head from "next/head";

// Inside your component:
<Head>
  <title>Contact | Your Name</title>
  <meta name='description' content='Get in touch with me' />
  <meta property='og:title' content='Contact' />
</Head>;
```

## Fixing Contact Page Unused Imports

Remove unused imports from `app/contact/page.tsx`:

```typescript
// Remove Phone, MapPin, Metadata
import { Mail, Send, Loader2 } from "lucide-react";
// Remove: import type { Metadata } from "next";
```

Fix the error handling:

```typescript
} catch (error) {
  console.error("Contact form error:", error);
  toast({
```

## Navigation Update

Add Contact link to `components/Navigation.tsx`:

```typescript
const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" }, // Add this
];
```

## Testing Checklist

- [ ] Contact form submits successfully
- [ ] Form validation works
- [ ] Toast notifications appear
- [ ] Projects page filter works
- [ ] All images load properly
- [ ] Loading skeletons display correctly
- [ ] Error boundaries catch errors
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive
- [ ] Dark mode works (if applicable)
- [ ] Animations are smooth
- [ ] No console errors
- [ ] TypeScript compiles without errors

## Performance Optimization Commands

```bash
# Analyze bundle size
npm run build
npm run analyze # if you have bundle analyzer set up

# Run Lighthouse
npm run build
npm run start
# Then open Chrome DevTools > Lighthouse

# Check for unused dependencies
npx depcheck
```

## Common Fixes

### If images don't load:

1. Check `next.config.ts` has correct `remotePatterns`
2. Verify image URLs are valid
3. Check image dimensions aren't too large

### If animations stutter:

1. Use `will-change` CSS property sparingly
2. Prefer `transform` and `opacity` for animations
3. Use `requestAnimationFrame` for complex animations

### If types don't match:

1. Check `types/portfolio.ts` for correct definitions
2. Ensure database schema matches types
3. Use proper type guards and null checks

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript
npx tsc --noEmit

# Format code
npm run format # if you have prettier

# Lint code
npm run lint
```

## File Structure

```
app/
├── page.tsx (Home - needs update)
├── about/
│   └── page.tsx (✅ Done)
├── contact/
│   └── page.tsx (✅ Done)
└── projects/
    └── page.tsx (⏳ Needs completion)

components/
├── ui/
│   ├── section-header.tsx (✅ New)
│   ├── feature-card.tsx (✅ New)
│   ├── stats-card.tsx (✅ New)
│   ├── project-card.tsx (✅ New)
│   ├── error-boundary.tsx (✅ New)
│   └── loading-skeleton.tsx (✅ New)
└── [existing components]
```

## Priority Order

1. **High Priority**:

   - Complete Projects page
   - Update Home page CTAs to link to Contact
   - Fix TypeScript errors
   - Test contact form

2. **Medium Priority**:

   - Add SEO metadata
   - Optimize images
   - Add loading states
   - Mobile testing

3. **Low Priority**:
   - Animation polish
   - Micro-interactions
   - Additional accessibility features
   - Performance tuning
