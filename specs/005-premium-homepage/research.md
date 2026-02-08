# Research: Premium Homepage Technical Decisions

**Feature**: 005-premium-homepage
**Date**: 2026-01-03
**Purpose**: Resolve technical unknowns and establish implementation approach for premium landing page

---

## 1. Animation Library

**Decision**: **Framer Motion 11.0+**

**Rationale**:
- **Performance**: Uses GPU-accelerated CSS transforms under the hood, achieving 60 FPS animations
- **Accessibility**: Built-in `prefers-reduced-motion` support via `useReducedMotion()` hook
- **Developer Experience**: Declarative API (`<motion.div animate={{ ... }}`) is intuitive and maintainable
- **Bundle Size**: ~30KB gzipped with tree-shaking (acceptable within our 100KB budget)
- **Features**: Supports all required animations (fade-in, slide-up, hover effects, scroll-triggered)
- **Industry Standard**: Used by major companies (Vercel, Stripe, Linear) - proven in production

**Alternatives Considered**:
1. **CSS-only animations**
   - **Pros**: Zero bundle size, excellent performance
   - **Cons**: More verbose, harder to coordinate complex sequences, manual `prefers-reduced-motion` handling
   - **Rejected**: Higher development time, less maintainable for scroll-triggered animations

2. **React Spring**
   - **Pros**: Physics-based animations feel natural
   - **Cons**: Larger bundle (~40KB), steeper learning curve, overkill for our simple animations
   - **Rejected**: Bundle size concern and complexity not justified for our use case

3. **GSAP (GreenSock)**
   - **Pros**: Most powerful, supports complex timelines
   - **Cons**: Requires separate plugin for React, commercial license for some features
   - **Rejected**: Licensing complexity and overkill for simple fade/slide animations

**Implementation Approach**:
```tsx
import { motion } from 'framer-motion';

// Example: Fade-in + slide-up for hero text
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  Organize Your Life
</motion.h1>
```

---

## 2. Icon Library

**Decision**: **Lucide React 0.309+**

**Rationale**:
- **Bundle Size**: Highly tree-shakeable, each icon ~1-2KB (importing 5 icons = ~10KB total)
- **Modern Style**: Clean, consistent line-icon aesthetic matches premium design
- **Variety**: 1000+ icons including all needed productivity icons (CheckCircle2, TrendingUp, Calendar, Zap)
- **React-First**: Built specifically for React with TypeScript support
- **Performance**: SVG-based, scales perfectly at any resolution
- **Maintenance**: Actively maintained, frequent updates

**Alternatives Considered**:
1. **Heroicons**
   - **Pros**: Made by Tailwind team, seamless integration
   - **Cons**: Smaller icon set (~300 icons), more limited productivity icons
   - **Rejected**: Fewer icon options for future expansion

2. **React Icons** (aggregator library)
   - **Pros**: Includes multiple icon sets (FontAwesome, Material, etc.)
   - **Cons**: Larger bundle if not careful, inconsistent styles across sets
   - **Rejected**: Risk of mixing icon styles, harder to tree-shake

3. **Font Awesome React**
   - **Pros**: Largest icon collection (10,000+ icons)
   - **Cons**: Pro version required for premium icons, larger bundle with font files
   - **Rejected**: Overkill for our needs, bundle size concern

**Implementation Approach**:
```tsx
import { CheckCircle2, TrendingUp, Calendar, Zap } from 'lucide-react';

// Example: Feature card icon
<CheckCircle2
  className="w-12 h-12 text-blue-500"
  aria-hidden="true"
/>
```

**Selected Icons for Features**:
- **Smart Task Management**: `CheckCircle2`
- **Track Your Progress**: `TrendingUp`
- **Deadline Management**: `Calendar`
- **Lightning Fast**: `Zap`

---

## 3. Responsive Breakpoint Strategy

**Decision**: **Use Tailwind's default breakpoints**

**Tailwind Default Breakpoints**:
```javascript
{
  'sm': '640px',   // Small devices
  'md': '768px',   // Tablets
  'lg': '1024px',  // Desktops
  'xl': '1280px',  // Large desktops
  '2xl': '1536px'  // Extra large screens
}
```

**Rationale**:
- **Spec Alignment**: Our spec requires < 768px (mobile), 768px-1024px (tablet), > 1024px (desktop)
  - Mobile: `default` (< 768px)
  - Tablet: `md:` (768px+)
  - Desktop: `lg:` (1024px+)
- **Industry Standard**: These breakpoints work well across real devices
- **No Configuration Needed**: Zero overhead, use out of the box
- **Tailwind Ecosystem**: All plugins and community resources use these breakpoints

**Mapping to Spec Requirements**:
| Spec Range | Tailwind Approach |
|------------|-------------------|
| < 768px (mobile) | Default styles (no prefix) |
| 768px-1024px (tablet) | `md:` prefix |
| > 1024px (desktop) | `lg:` prefix and above |

**Implementation Example**:
```tsx
<div className="
  flex flex-col gap-4        // Mobile: vertical stack
  md:flex-row md:gap-6       // Tablet: horizontal layout
  lg:gap-8                   // Desktop: larger spacing
">
  <FeatureCard />
  <FeatureCard />
</div>
```

**No Custom Breakpoints Needed**: Tailwind defaults perfectly match our requirements.

---

## 4. Smooth Scroll Implementation

**Decision**: **Native `scrollIntoView()` with `prefers-reduced-motion` detection**

**Rationale**:
- **Browser Support**: `scrollIntoView({ behavior: 'smooth' })` supported in all modern browsers (Chrome 61+, Firefox 36+, Safari 15.4+)
- **Zero Dependencies**: Native API, no library needed
- **Accessibility**: Easy to disable smooth scroll for users who prefer reduced motion
- **Performance**: Hardware-accelerated, browser-optimized
- **Simplicity**: One-line implementation

**Alternatives Considered**:
1. **React Router hash links** (`#features`)
   - **Pros**: Declarative, updates URL
   - **Cons**: Instant jump (not smooth), requires CSS `scroll-behavior: smooth` for smoothness (less control)
   - **Rejected**: Less control over accessibility and behavior

2. **External library** (react-scroll, react-scrollspy)
   - **Pros**: More features (offset, easing functions)
   - **Cons**: Adds bundle size, overkill for simple scroll
   - **Rejected**: Unnecessary dependency for basic use case

3. **Manual scroll animation** (requestAnimationFrame loop)
   - **Pros**: Full control over easing, timing
   - **Cons**: Complex implementation, reinventing the wheel
   - **Rejected**: Native API is sufficient and more performant

**Implementation**:
```tsx
// In Navigation component
const handleScrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  section.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
};

// Usage
<button onClick={() => handleScrollToSection('features')}>
  Features
</button>
```

**Accessibility Handling**:
- If `prefers-reduced-motion: reduce` is set, use `behavior: 'auto'` (instant jump)
- Otherwise, use `behavior: 'smooth'` for animated scroll
- Ensures users with vestibular disorders aren't disoriented by motion

---

## 5. Bundle Optimization Strategy

**Decision**: **Route-based code splitting with React.lazy() + bundle analysis monitoring**

**Performance Budget**:
- **Target**: < 100KB total increase for homepage feature
- **Expected Breakdown**:
  - Framer Motion: ~30KB gzipped
  - Lucide React (5 icons): ~10KB
  - Homepage components: ~20KB
  - **Total Estimated**: ~60KB (well within budget)

**Rationale**:
- **Code Splitting**: Lazy-load HomePage to avoid loading it on auth pages
- **Tree-Shaking**: Lucide React only imports used icons (not entire library)
- **Monitoring**: Use Vite's built-in bundle analyzer to verify sizes
- **Performance Testing**: Run Lighthouse audit to ensure 90+ score maintained

**Implementation Approach**:

**1. Lazy-Load HomePage Route**:
```tsx
// App.tsx
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <HomePage />
          </Suspense>
        }
      />
      {/* Other routes */}
    </Routes>
  );
}
```

**2. Import Only Used Icons**:
```tsx
// ❌ BAD: Imports entire library
import * as Icons from 'lucide-react';

// ✅ GOOD: Tree-shakeable, only imports what's used
import { CheckCircle2, TrendingUp, Calendar, Zap } from 'lucide-react';
```

**3. Bundle Analysis**:
```bash
# Add to package.json scripts
"analyze": "vite-bundle-visualizer"

# Run after implementation
npm run build
npm run analyze
```

**4. Performance Monitoring**:
- **Lighthouse CI**: Automate performance testing in CI pipeline
- **Target Metrics**:
  - Performance Score: 90+
  - First Contentful Paint (FCP): < 1.8s
  - Largest Contentful Paint (LCP): < 2.5s
  - Total Blocking Time (TBT): < 200ms

**Validation Plan**:
1. Baseline measurement (before feature)
2. Implementation with bundle analysis
3. Lighthouse audit comparison
4. If budget exceeded: analyze heavy dependencies, consider CSS-only animations

---

## Additional Research Findings

### 6. Animation Performance Best Practices

**Key Learnings**:
- **GPU-Accelerated Properties**: Only animate `transform` and `opacity`
  - `translateX/Y/Z`, `scale`, `rotate` are GPU-accelerated
  - Avoid animating `width`, `height`, `left`, `top`, `margin` (triggers layout reflow)

- **Will-Change Property**: Use sparingly
  ```css
  /* Only on elements that will definitely animate soon */
  .hero-text {
    will-change: transform, opacity;
  }
  ```

- **Frame Rate Monitoring**: Use Chrome DevTools Performance tab to verify 60 FPS

**Implementation Guideline**:
```tsx
// ✅ GOOD: GPU-accelerated
<motion.div animate={{ opacity: 1, scale: 1.02 }} />

// ❌ BAD: Triggers layout reflow
<motion.div animate={{ width: 300, height: 200 }} />
```

---

### 7. Tailwind Configuration Extension

**Custom Colors Setup**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        'button-gradient': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
```

**Usage in Components**:
```tsx
<div className="bg-hero-gradient">
  <h1 className="text-brand-blue animate-fade-in">
    Organize Your Life
  </h1>
</div>
```

---

## Research Summary

All technical unknowns have been resolved:

| Research Area | Decision | Justification |
|---------------|----------|---------------|
| **Animation Library** | Framer Motion 11.0+ | Performance, accessibility, DX, industry standard |
| **Icon Library** | Lucide React 0.309+ | Tree-shakeable, modern style, React-first |
| **Responsive Breakpoints** | Tailwind defaults | Perfect alignment with spec, zero config |
| **Smooth Scroll** | Native `scrollIntoView()` | Zero deps, accessible, performant |
| **Bundle Optimization** | Lazy load + tree-shaking | Well within 100KB budget (~60KB estimated) |

**Total Estimated Bundle Impact**: ~60KB gzipped (40% under budget)

**Next Step**: Proceed to Phase 1 (Quickstart Guide creation) and Phase 2 (Task generation via `/sp.tasks`)

---

**Research Complete**. All decisions documented and ready for implementation.
