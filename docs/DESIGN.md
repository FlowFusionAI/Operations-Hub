# Operations Hub Design System

> Professional dark-first design system for B2B SaaS operations management.
> Read this before implementing any UI work.

---

## Philosophy

Operations Hub's visual identity conveys **trust, reliability, and operational excellence** through:

- **Dark-first** aesthetic with deep indigo-blue accents
- **Smooth, purposeful animations** via framer-motion (never gratuitous)
- **Glass-morphism** and subtle elevation for depth
- **OKLCH color system** for perceptual uniformity
- Inspired by **Linear, Vercel, Raycast** aesthetics
- No emojis in the UI

---

## Color System

### Brand Colors (OKLCH)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `oklch(0.60 0.18 265)` | CTAs, focus rings, active nav, links |
| Background | `oklch(0.12 0.01 265)` | Main app background |
| Card/Surface | `oklch(0.18 0.012 265)` | Cards, modals, dropdowns |
| Border | `oklch(1 0 0 / 8%)` | Subtle separation lines |
| Muted text | `oklch(0.65 0.01 265)` | Secondary/helper text |

### Semantic Colors

- **Destructive**: `oklch(0.62 0.22 25)` — errors, delete actions
- **Success**: `oklch(0.70 0.14 140)` — teal, confirmations
- **Warning**: `oklch(0.72 0.12 85)` — amber, caution states
- **Info**: `oklch(0.65 0.15 320)` — purple, informational

### Rules

- Use primary blue for CTAs and primary actions only
- Maintain minimum 4.5:1 contrast ratio for all text
- Use `oklch(1 0 0 / 8%)` borders — never solid colored borders
- Never use pure black (`#000`) — always use the background token
- Dark mode is the default; light theme lives under `.light` class

---

## Typography

**Fonts** (already loaded via Google Fonts):
- **Geist Sans**: Headings, body text, UI elements
- **Geist Mono**: Data values, timestamps, IDs, uppercase labels

**Hierarchy**:
- `h1`: `text-4xl font-semibold tracking-tight` (lg: `text-5xl`)
- `h2`: `text-3xl font-semibold tracking-tight`
- `h3`: `text-2xl font-semibold tracking-tight`
- `h4`: `text-xl font-semibold tracking-tight`
- Body: `leading-7`
- Uppercase labels: `font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground`

---

## Animation System

All animation presets live in `lib/motion.ts`. Always import from there — never define inline animation configs.

### Transitions

| Name | Config | Use for |
|------|--------|---------|
| `smooth` | spring 300/30 | Most UI interactions |
| `snappy` | spring 400/35 | Buttons, toggles, quick feedback |
| `gentle` | spring 200/28 | Page transitions, large elements |

### Available Variants

| Variant | Import | Use for |
|---------|--------|---------|
| `pageVariants` | `lib/motion` | Route/page transitions |
| `cardVariants` | `lib/motion` | Card entrance animations |
| `containerVariants` | `lib/motion` | Parent of staggered lists |
| `listItemVariants` | `lib/motion` | Children in staggered lists |
| `floatingOrbVariants` | `lib/motion` | Background orb animations |
| `modalVariants` | `lib/motion` | Dialog/modal entrance |
| `toastVariants` | `lib/motion` | Notification animations |

### Animation Rules

1. **Purposeful** — every animation must serve a UX purpose
2. **60fps** — only animate `transform` and `opacity` (GPU-accelerated)
3. **Respect preferences** — always honor `prefers-reduced-motion`
4. **Consistent timing** — use presets from `lib/motion.ts`, never ad-hoc values
5. **Subtle** — animations should be felt, not watched

### When to Animate

**Do animate**: Page transitions, card entrances, button hover/tap, focus states, loading states, toasts
**Don't animate**: Large data tables, every state change, long-running processes

---

## Glass-Morphism

Utility classes defined in `globals.css`:

| Class | Effect |
|-------|--------|
| `glass` | Transparent bg + 12px blur + subtle border |
| `glass-elevated` | Slightly more opaque + 16px blur + shadow |
| `glow-primary` | Inner primary-colored glow border |
| `hover-glow` | Primary glow on hover |

Use `glass-elevated` for: cards, modals, popovers, sidebar
Use `glass` for: secondary surfaces, tooltips

---

## Reusable Components

### Background Animation
```tsx
import { BackgroundAnimation } from "@/components/background-animation"
// Floating gradient orbs — use on main pages
<BackgroundAnimation />
```

### Page Transition
```tsx
import { PageTransition } from "@/components/page-transition"
// Wrap page content for enter/exit animations
<PageTransition>{children}</PageTransition>
```

### Animated Card
```tsx
import { AnimatedCard } from "@/components/ui/animated-card"
// Card with entrance animation + hover lift
<AnimatedCard>{content}</AnimatedCard>
```

### Staggered List
```tsx
import { StaggeredList, StaggeredListItem } from "@/components/staggered-list"
<StaggeredList>
  {items.map(item => (
    <StaggeredListItem key={item.id}>{item.content}</StaggeredListItem>
  ))}
</StaggeredList>
```

---

## Accessibility Checklist

- [ ] All text meets WCAG AAA contrast (7:1 for body, 4.5:1 for large text)
- [ ] All interactive elements have visible focus rings (primary blue, 3px)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Animations disabled when `prefers-reduced-motion: reduce` is set
- [ ] Form inputs have associated labels
- [ ] Error states are communicated via color AND text

---

## Implementation Checklist (for every UI task)

1. Use dark theme colors from `globals.css` tokens
2. Import animation variants from `lib/motion.ts`
3. Use `/frontend-design` skill for new pages/components
4. Use `glass-elevated` for elevated surfaces
5. Add loading states with animations
6. Test keyboard navigation
7. Verify contrast ratios
8. Run `npm run build` before marking done
