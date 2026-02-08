# Implementation Plan: Premium Todo App Homepage

**Branch**: `005-premium-homepage` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-premium-homepage/spec.md`

## Summary

Create a modern, premium landing page for the Todo app to replace the current direct-to-signin flow. The homepage will feature an animated hero section with clear CTAs, a features showcase section with benefit cards, and a responsive navigation bar. The design will use premium gradients (blue-to-purple), modern typography, smooth animations, and will be fully responsive across mobile, tablet, and desktop devices. This improves user acquisition by providing context about the app before signup and increases conversion through professional, engaging design.

## Technical Context

**Language/Version**: TypeScript 5.3+ (React 18.2+ with Vite 5.0+)
**Primary Dependencies**:
- **UI Framework**: React 18.2.0
- **Routing**: React Router DOM 6.21.1
- **Styling**: Tailwind CSS 3.4.0
- **Build Tool**: Vite 5.0.8
- **Animation**: Framer Motion (to be added for animations)
- **Icons**: Lucide React (to be added for feature icons)

**Storage**: N/A (static landing page, no data persistence)
**Testing**: Vitest 1.1.0 with React Testing Library 14.1.2
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (frontend-only component)
**Performance Goals**:
- Page load < 3 seconds on 3G connection
- Lighthouse score 90+ (mobile and desktop)
- 60 FPS animations on devices from past 3 years
- Bundle size increase < 100KB for homepage components

**Constraints**:
- Must respect `prefers-reduced-motion` media query
- Must support viewport widths from 320px to 4K
- Must maintain < 200ms interaction response time
- Zero accessibility violations (WCAG 2.1 AA)

**Scale/Scope**:
- Single landing page with 3 main sections
- 3-4 feature cards
- 1 navigation component
- Estimated 4-6 new React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance with Core Principles

**✅ I. Simplicity and Readability First**
- Components will be small, focused, and self-documenting
- No complex state management needed (homepage is static content)
- Animation logic will be declarative using Framer Motion (industry standard)
- **PASS**: Homepage is straightforward UI presentation

**✅ II. Clean Code Principles**
- ESLint + Prettier already enforced in frontend
- Components will follow single responsibility (HeroSection, FeaturesSection, Navigation, FeatureCard)
- Tailwind utility classes for styling (no custom CSS complexity)
- **PASS**: Aligns with existing frontend code standards

**✅ III. Modularity and Extensibility**
- Components will be isolated and reusable
- Navigation component can be extended for future sections (Pricing, About, etc.)
- Design tokens (colors, spacing) will be defined in Tailwind config for consistency
- **PASS**: Homepage doesn't affect existing task management features

**✅ IV. Security First**
- No user input on homepage (only navigation links)
- No authentication required for viewing homepage
- CTAs navigate to existing authenticated `/signin` and `/signup` routes
- **PASS**: Minimal security surface area

**✅ V. API-First Design**
- N/A: Homepage is frontend-only, no API calls required
- **PASS**: No API dependencies

### Frontend Architecture Compliance

**✅ Component Structure**
- UI components will NOT contain business logic (static content only)
- Routing handled by React Router (existing pattern)
- **PASS**: Pure presentation components

**✅ Performance & Accessibility**
- Animations will use `prefers-reduced-motion` media query
- Images will be lazy-loaded and optimized
- Semantic HTML for screen readers
- Proper focus management for keyboard navigation
- **PASS**: Meets accessibility and performance requirements

### Gate Decision

**Status**: ✅ **PASS** - All constitutional requirements met. Proceeding to Phase 0 research.

**Justification**: Homepage is a pure presentation layer with no complexity violations. Uses existing tech stack (React, Tailwind) and follows established patterns.

## Project Structure

### Documentation (this feature)

```text
specs/005-premium-homepage/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (already exists)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # N/A (no data entities for homepage)
├── quickstart.md        # Phase 1 output (integration guide)
└── contracts/           # N/A (no API contracts for static page)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx              # NEW: Main landing page component
│   │   ├── SignInPage.tsx            # Existing
│   │   ├── SignUpPage.tsx            # Existing
│   │   └── TasksPage.tsx             # Existing
│   ├── components/
│   │   ├── homepage/                 # NEW: Homepage-specific components
│   │   │   ├── HeroSection.tsx       # Hero with animations and CTAs
│   │   │   ├── FeaturesSection.tsx   # Feature cards showcase
│   │   │   ├── FeatureCard.tsx       # Individual feature card component
│   │   │   └── Navigation.tsx        # Top navigation bar
│   │   └── ...                       # Existing components
│   ├── assets/                       # NEW: Images, illustrations (if needed)
│   │   └── illustrations/            # Productivity-themed visuals
│   ├── styles/                       # Tailwind config extensions
│   │   └── tailwind.config.js        # Extend with custom colors/animations
│   └── App.tsx                       # Update routing to include HomePage
├── tests/
│   ├── pages/
│   │   └── HomePage.test.tsx         # NEW: Homepage component tests
│   └── components/
│       └── homepage/                 # NEW: Component unit tests
│           ├── HeroSection.test.tsx
│           ├── FeaturesSection.test.tsx
│           ├── FeatureCard.test.tsx
│           └── Navigation.test.tsx
└── package.json                      # Add Framer Motion, Lucide React
```

**Structure Decision**:
We're using the existing **Option 2: Web application** structure. The homepage is a frontend-only feature, so all new code will be in `frontend/src/`. We're organizing homepage components in a dedicated `components/homepage/` directory to keep them isolated and maintainable. This aligns with the existing project structure and makes it easy to extend with additional marketing pages in the future (e.g., Pricing, About).

## Complexity Tracking

> **No Constitution violations to justify.** All gates passed without exceptions.

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **Animation Library Evaluation**
   - **Question**: Which animation library best fits our needs (Framer Motion vs CSS-only vs React Spring)?
   - **Research Focus**: Performance, bundle size, ease of use, accessibility support
   - **Output**: Decision on animation approach with rationale

2. **Icon Library Selection**
   - **Question**: Which icon library provides productivity-themed icons with consistent style?
   - **Research Focus**: Lucide React vs Heroicons vs React Icons (bundle size, tree-shaking, variety)
   - **Output**: Selected icon library with example icons for features

3. **Responsive Breakpoint Strategy**
   - **Question**: Confirm Tailwind's default breakpoints align with our spec requirements (< 768px, 768px-1024px, > 1024px)?
   - **Research Focus**: Verify Tailwind defaults vs custom breakpoints needed
   - **Output**: Breakpoint configuration decision

4. **Smooth Scroll Implementation**
   - **Question**: Best practice for smooth scroll to sections (native CSS vs React Router hash links vs custom logic)?
   - **Research Focus**: Browser compatibility, accessibility, user experience
   - **Output**: Smooth scroll implementation approach

5. **Performance Budget Verification**
   - **Question**: Confirm Framer Motion + Lucide React + homepage components stay within 100KB bundle increase?
   - **Research Focus**: Bundle size analysis, code-splitting strategies
   - **Output**: Bundle optimization strategy

### Expected Research Outputs

All research findings will be documented in `research.md` with the following structure:

```markdown
# Research: Premium Homepage Technical Decisions

## 1. Animation Library
**Decision**: [Chosen library]
**Rationale**: [Why chosen - performance, accessibility, DX]
**Alternatives Considered**: [Other options and why rejected]

## 2. Icon Library
**Decision**: [Chosen library]
**Rationale**: [Why chosen - bundle size, variety, style]
**Alternatives Considered**: [Other options and why rejected]

## 3. Responsive Breakpoints
**Decision**: [Use Tailwind defaults or custom]
**Rationale**: [Alignment with spec requirements]

## 4. Smooth Scroll
**Decision**: [Implementation approach]
**Rationale**: [Browser support, accessibility, UX]

## 5. Bundle Optimization
**Decision**: [Code-splitting strategy]
**Rationale**: [How we'll stay within performance budget]
```

## Phase 1: Design & Implementation Planning

### Component Architecture

#### 1. HomePage Component (Page Level)

**Responsibility**: Root page component that composes all homepage sections

**Structure**:
```tsx
export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
```

**Props**: None (standalone page)
**State**: None (static content)
**Tests**:
- Renders all child sections
- Applies correct background gradient
- Accessible page structure

---

#### 2. Navigation Component

**Responsibility**: Fixed top navigation bar with logo and menu items

**Props**:
```typescript
interface NavigationProps {
  // No props - static content
}
```

**Features**:
- Logo (left-aligned) - navigates to top on click
- Menu items (right-aligned): Home, Features, Pricing, Sign In
- Smooth scroll to sections on click (Home → top, Features → #features)
- Mobile hamburger menu (< 768px)
- Sticky positioning (fixed to top on scroll)

**States**:
- `isMobileMenuOpen: boolean` - toggles mobile menu

**Responsive Behavior**:
- **Desktop (> 768px)**: Horizontal menu with all items visible
- **Mobile (< 768px)**: Hamburger icon → slide-in menu

**Accessibility**:
- `<nav>` semantic element
- `aria-label` for navigation region
- Keyboard navigation support (Tab, Enter)
- Focus visible styles

**Tests**:
- Renders logo and all menu items
- Mobile menu toggles open/closed
- Smooth scroll triggered on menu click
- Keyboard navigation works

---

#### 3. HeroSection Component

**Responsibility**: Animated hero area with headline, subheading, and CTA buttons

**Props**:
```typescript
interface HeroSectionProps {
  // No props - static content
}
```

**Features**:
- Headline: "Organize Your Life, One Task at a Time"
- Subheading: "The modern todo app that helps you stay focused and productive"
- Animated background shapes/gradients (subtle, continuous motion)
- Two CTA buttons: "Get Started" (primary) → `/signup`, "Sign In" (secondary) → `/signin`
- Fade-in animation on page load

**Animations**:
- Text: Fade-in + slide-up (staggered)
- Background shapes: Slow floating/rotation
- Buttons: Scale-up on hover, ripple effect on click

**Responsive Behavior**:
- **Desktop**: Centered content, large typography, horizontal button layout
- **Tablet**: Slightly reduced typography, horizontal buttons
- **Mobile**: Stacked buttons, compact typography

**Accessibility**:
- Reduced motion: Disable animations if `prefers-reduced-motion: reduce`
- High contrast text over gradient background
- Buttons meet minimum touch target size (44x44px)

**Tests**:
- Renders headline and subheading
- CTA buttons navigate to correct routes
- Animations respect prefers-reduced-motion
- Responsive layout at all breakpoints

---

#### 4. FeaturesSection Component

**Responsibility**: Grid of feature cards showcasing app benefits

**Props**:
```typescript
interface FeaturesSectionProps {
  // No props - static content
}
```

**Features**:
- Section heading: "Everything You Need to Stay Organized"
- Grid of 4 feature cards (FeatureCard components)
- Scroll-triggered fade-in for cards (staggered)

**Feature Card Data** (static):
```typescript
const features = [
  {
    icon: "CheckCircle2", // Lucide icon name
    title: "Smart Task Management",
    description: "Create, organize, and prioritize your tasks with an intuitive interface designed for productivity."
  },
  {
    icon: "TrendingUp",
    title: "Track Your Progress",
    description: "Visualize your achievements and stay motivated with completion tracking and insights."
  },
  {
    icon: "Calendar",
    title: "Deadline Management",
    description: "Never miss a deadline with due dates, reminders, and recurring task support."
  },
  {
    icon: "Zap",
    title: "Lightning Fast",
    description: "Experience instant response times and seamless performance across all your devices."
  }
];
```

**Responsive Behavior**:
- **Desktop (> 1024px)**: 2x2 grid
- **Tablet (768px-1024px)**: 2x2 grid with reduced spacing
- **Mobile (< 768px)**: Single column stack

**Accessibility**:
- `<section id="features">` for smooth scroll target
- Semantic heading hierarchy
- Icons have `aria-hidden="true"` (decorative)

**Tests**:
- Renders all 4 feature cards
- Grid layout adapts to breakpoints
- Scroll-triggered animations work
- Section ID exists for navigation

---

#### 5. FeatureCard Component

**Responsibility**: Individual feature card with icon, title, and description

**Props**:
```typescript
interface FeatureCardProps {
  icon: LucideIcon; // Lucide icon component
  title: string;
  description: string;
}
```

**Features**:
- Icon (top, colored with brand gradient)
- Title (h3, bold, medium size)
- Description (paragraph, 2-3 lines)
- Hover effect: Subtle elevation (shadow), slight scale-up

**Styling**:
- White background with soft shadow
- Rounded corners (12px)
- Padding: 24px
- Border: Optional subtle gradient border

**Animations**:
- Hover: `transform: scale(1.02)`, shadow elevation
- Transition duration: 200ms ease-out

**Accessibility**:
- Icon is decorative (`aria-hidden`)
- Card content is readable by screen readers
- Sufficient color contrast (WCAG AA)

**Tests**:
- Renders icon, title, and description
- Hover effect applies correctly
- Props are passed and displayed
- Meets accessibility standards

---

### Routing Integration

**Current Routing** (App.tsx):
```tsx
// Existing
<Routes>
  <Route path="/signin" element={<SignInPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/tasks" element={<TasksPage />} />
  <Route path="/" element={<Navigate to="/signin" />} /> // REPLACE THIS
</Routes>
```

**Updated Routing**:
```tsx
// New
<Routes>
  <Route path="/" element={<HomePage />} /> {/* NEW: Landing page */}
  <Route path="/signin" element={<SignInPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/tasks" element={<TasksPage />} />
</Routes>
```

**Authenticated User Handling**:
If a user is already signed in and visits `/`, they should be redirected to `/tasks` automatically.

**Implementation**:
```tsx
// In HomePage component
const { user, isLoading } = useAuth(); // Existing auth hook

if (isLoading) return <LoadingSpinner />;
if (user) return <Navigate to="/tasks" replace />;

return <HomePage />; // Show homepage only for unauthenticated users
```

---

### Styling Configuration (Tailwind)

**Custom Colors** (tailwind.config.js):
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
      },
    },
  },
};
```

**Custom Animations** (tailwind.config.js):
```javascript
module.exports = {
  theme: {
    extend: {
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
};
```

---

### Dependencies to Add

**Package Additions**:
```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.309.0"
  }
}
```

**Rationale**:
- **Framer Motion**: Industry-standard React animation library with excellent performance and accessibility support (respects `prefers-reduced-motion`)
- **Lucide React**: Modern, tree-shakeable icon library with consistent style and wide variety of icons

---

### Testing Strategy

**Unit Tests** (Vitest + React Testing Library):
- Each component tested in isolation
- Props rendering verification
- User interactions (clicks, hovers, keyboard navigation)
- Responsive behavior (using matchMedia mocks)
- Accessibility checks (ARIA attributes, semantic HTML)

**Integration Tests**:
- Full HomePage rendering
- Navigation between sections (smooth scroll)
- CTA buttons navigation to auth pages
- Authenticated user redirect logic

**Visual Regression** (Optional, future):
- Screenshot comparison for design consistency

**Accessibility Tests**:
- Automated WCAG checks using axe-core
- Keyboard navigation flow
- Screen reader compatibility (aria-label, semantic HTML)

**Performance Tests**:
- Bundle size analysis (webpack-bundle-analyzer or Vite equivalent)
- Lighthouse CI integration (target: 90+ score)

---

## Phase 2: Task Breakdown (Reference)

**Note**: Detailed task breakdown will be generated by `/sp.tasks` command. This section provides a high-level overview of expected tasks.

### Setup & Configuration
- [ ] Add Framer Motion and Lucide React dependencies
- [ ] Configure Tailwind with custom colors and animations
- [ ] Create `components/homepage/` directory structure

### Component Development (TDD Approach)
- [ ] Test: Navigation component
- [ ] Implement: Navigation component
- [ ] Test: HeroSection component
- [ ] Implement: HeroSection component
- [ ] Test: FeatureCard component
- [ ] Implement: FeatureCard component
- [ ] Test: FeaturesSection component
- [ ] Implement: FeaturesSection component
- [ ] Test: HomePage integration
- [ ] Implement: HomePage composition

### Routing & Integration
- [ ] Update App.tsx routing configuration
- [ ] Implement authenticated user redirect logic
- [ ] Test: Route navigation from homepage CTAs
- [ ] Test: Authenticated redirect flow

### Responsive & Accessibility
- [ ] Test: Responsive layouts (mobile, tablet, desktop)
- [ ] Implement: Mobile navigation hamburger menu
- [ ] Test: Keyboard navigation flow
- [ ] Test: Screen reader compatibility
- [ ] Implement: `prefers-reduced-motion` support

### Performance Optimization
- [ ] Analyze bundle size increase
- [ ] Implement code-splitting if needed
- [ ] Optimize images/assets
- [ ] Run Lighthouse performance audit

### Polish & Validation
- [ ] Verify animations are smooth (60 FPS)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on real mobile devices
- [ ] Final accessibility audit (WCAG 2.1 AA)

---

## Integration Points

### 1. Authentication System Integration

**Dependency**: Existing authentication routes (`/signin`, `/signup`) must be functional

**Integration Logic**:
```tsx
// HomePage.tsx
import { useAuth } from '../hooks/useAuth'; // Existing hook
import { Navigate } from 'react-router-dom';

export function HomePage() {
  const { user, isLoading } = useAuth();

  // If user is authenticated, redirect to tasks page
  if (isLoading) return <div>Loading...</div>;
  if (user) return <Navigate to="/tasks" replace />;

  // Otherwise, show homepage
  return (
    <div>
      <Navigation />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
```

**Testing**:
- Mock `useAuth` hook in tests
- Verify redirect occurs when `user` is present
- Verify homepage displays when `user` is null

---

### 2. Router Configuration

**Dependency**: React Router DOM 6.21.1 (already installed)

**Integration**:
- Update `App.tsx` to add `<Route path="/" element={<HomePage />} />`
- Remove existing `<Navigate to="/signin" />` at root path
- Ensure CTA buttons use `<Link>` or `navigate()` for client-side routing

**Testing**:
- Verify all routes work: `/`, `/signin`, `/signup`, `/tasks`
- Test browser back/forward navigation
- Test direct URL navigation (type URL in address bar)

---

### 3. Smooth Scroll to Sections

**Implementation**:
- Use `scrollIntoView({ behavior: 'smooth' })` for in-page navigation
- Fallback to instant scroll if `prefers-reduced-motion: reduce`

**Code Example**:
```tsx
const handleScrollToFeatures = () => {
  const featuresSection = document.getElementById('features');
  if (featuresSection) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    featuresSection.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }
};
```

---

## Risk Mitigation

### Risk 1: Animation Performance on Low-End Devices

**Impact**: High (affects user experience)
**Likelihood**: Medium

**Mitigation**:
- Use CSS transforms and opacity (GPU-accelerated properties)
- Avoid animating `width`, `height`, `left`, `top` (triggers layout)
- Test on older devices (2-3 years old)
- Implement `will-change` CSS property sparingly
- Respect `prefers-reduced-motion` to disable animations

**Validation**:
- Use Chrome DevTools Performance tab
- Target: 60 FPS during animations
- Fallback: Reduce animation complexity if frame drops detected

---

### Risk 2: Bundle Size Bloat

**Impact**: Medium (affects page load time)
**Likelihood**: Medium

**Mitigation**:
- Tree-shake unused Lucide icons (import only used icons)
- Code-split homepage route (lazy-load HomePage component)
- Analyze bundle with `vite-bundle-visualizer`
- Set performance budget alert in CI (100KB max increase)

**Validation**:
- Run bundle analysis before and after feature
- Monitor Lighthouse performance score (must be 90+)

---

### Risk 3: Accessibility Violations

**Impact**: High (legal/ethical implications)
**Likelihood**: Low

**Mitigation**:
- Use semantic HTML (`<nav>`, `<section>`, `<h1>`-`<h3>`)
- Include ARIA labels where needed (`aria-label`, `aria-hidden`)
- Test with keyboard navigation (Tab, Enter, Escape)
- Test with screen reader (NVDA or VoiceOver)
- Run automated checks (axe-core, Lighthouse accessibility audit)

**Validation**:
- Zero violations in axe DevTools
- Lighthouse accessibility score: 100
- Manual screen reader test

---

### Risk 4: Design Doesn't Meet "Premium" Expectation

**Impact**: Medium (user perception)
**Likelihood**: Medium

**Mitigation**:
- Reference successful SaaS homepages (Linear, Notion, Todoist)
- Use design system principles (consistent spacing, typography hierarchy)
- Get early feedback from user testing or design review
- Iterate on visual polish (shadows, gradients, micro-interactions)

**Validation**:
- User feedback: "modern" and "professional" descriptors
- Visual consistency with brand guidelines
- No design elements that feel "cheap" or outdated

---

## Success Criteria Mapping

**From Spec** → **Implementation Validation**

| Spec Criterion | Validation Method |
|----------------|-------------------|
| **SC-001**: Understand purpose in 5 seconds | User testing: 80% comprehension in < 5s |
| **SC-002**: 80% click CTA within 30 seconds | Analytics tracking (future): click-through rate |
| **SC-003**: Page load < 3 seconds | Lighthouse performance audit, Network throttling (3G) |
| **SC-004**: Responsive across all breakpoints | Manual testing + responsive design tools |
| **SC-005**: 60 FPS animations | Chrome DevTools Performance tab |
| **SC-006**: 30% bounce rate reduction | Analytics comparison (future, post-deployment) |
| **SC-007**: 40% sign-up increase | Analytics comparison (future, post-deployment) |
| **SC-008**: Lighthouse 90+ | Automated Lighthouse CI |
| **SC-009**: <100ms interaction response | Chrome DevTools Performance tab |
| **SC-010**: Zero WCAG AA violations | axe DevTools + manual accessibility testing |

---

## Next Steps

1. **Proceed to Research** (`research.md`):
   - Finalize animation library choice (Framer Motion recommended)
   - Confirm icon library (Lucide React recommended)
   - Document smooth scroll implementation
   - Verify bundle size strategy

2. **Create Quickstart Guide** (`quickstart.md`):
   - Document how to add new homepage sections
   - Explain Tailwind configuration for brand colors
   - Provide animation usage examples

3. **Generate Task List** (`/sp.tasks`):
   - Break down implementation into granular, testable tasks
   - Assign task dependencies and sequencing
   - Define acceptance criteria for each task

4. **Implementation Phase**:
   - Execute tasks following TDD approach
   - Regular testing at each phase
   - Continuous integration with existing codebase

---

## Appendix: Design Tokens

### Color Palette

```css
/* Primary Brand Colors */
--color-brand-blue: #3B82F6;
--color-brand-purple: #8B5CF6;

/* Background Gradients */
--gradient-hero: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
--gradient-button: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);

/* Neutral Colors */
--color-text-primary: #1F2937; /* Gray-900 */
--color-text-secondary: #6B7280; /* Gray-500 */
--color-background: #FFFFFF;
--color-background-subtle: #F9FAFB; /* Gray-50 */

/* Interactive States */
--color-button-hover: #2563EB; /* Blue-600 */
--color-shadow-sm: rgba(0, 0, 0, 0.05);
--color-shadow-md: rgba(0, 0, 0, 0.1);
--color-shadow-lg: rgba(0, 0, 0, 0.15);
```

### Typography Scale

```css
/* Headings */
--font-size-h1: 3.5rem;     /* 56px - Hero headline */
--font-size-h2: 2.25rem;    /* 36px - Section headings */
--font-size-h3: 1.5rem;     /* 24px - Feature card titles */

/* Body */
--font-size-body-lg: 1.125rem; /* 18px - Hero subheading */
--font-size-body: 1rem;        /* 16px - Feature descriptions */
--font-size-body-sm: 0.875rem; /* 14px - Footer text */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing Scale (8px grid)

```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
--spacing-2xl: 4rem;    /* 64px */
--spacing-3xl: 6rem;    /* 96px */
```

### Border Radius

```css
--radius-sm: 0.5rem;  /* 8px - Buttons */
--radius-md: 0.75rem; /* 12px - Feature cards */
--radius-lg: 1rem;    /* 16px - Large containers */
```

### Transition Durations

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 600ms;
```

---

**Plan Complete**. Ready for Phase 0 research and subsequent task generation.
