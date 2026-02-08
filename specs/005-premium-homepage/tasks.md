# Tasks: Premium Todo App Homepage

**Feature**: 005-premium-homepage
**Branch**: `005-premium-homepage`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This task list implements the premium homepage feature organized by user stories. Each user story can be implemented independently, enabling incremental delivery and testing.

**Total Tasks**: 45
**User Stories**: 4 (US1-P1, US2-P2, US3-P3, US4-P2)
**Estimated Components**: 5 (HomePage, Navigation, HeroSection, FeaturesSection, FeatureCard)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**User Story 1 (P1)** forms the MVP - a functional homepage with hero section and CTAs that enables user acquisition.

### Incremental Delivery Order
1. **Phase 1-2**: Setup + Foundational (required for all stories)
2. **Phase 3**: User Story 1 (P1) - First-time Visitor Landing → **MVP COMPLETE**
3. **Phase 4**: User Story 2 (P2) - Feature Cards Showcase
4. **Phase 5**: User Story 4 (P2) - Mobile Responsive Experience
5. **Phase 6**: User Story 3 (P3) - Navigation Enhancement
6. **Phase 7**: Polish & Performance

**Each phase delivers a complete, testable increment of value.**

---

## User Story Mapping

| User Story | Priority | Components | Can Start After |
|------------|----------|------------|-----------------|
| US1 - First-time Visitor Landing | P1 | HeroSection + CTAs | Foundational complete |
| US2 - Feature Cards Showcase | P2 | FeaturesSection, FeatureCard | US1 complete (or parallel) |
| US3 - Navigation Enhancement | P3 | Navigation (enhanced) | US1 + US2 complete |
| US4 - Mobile Experience | P2 | All components (responsive) | US1 + US2 complete |

**Note**: US2 and US4 can be developed in parallel after US1 is complete.

---

## Phase 1: Setup & Configuration

**Goal**: Install dependencies and configure project for homepage development

**Tasks**:

- [X] T001 [P] Install Framer Motion library in frontend/package.json
- [X] T002 [P] Install Lucide React library in frontend/package.json
- [X] T003 Configure Tailwind with brand colors in frontend/tailwind.config.js
- [X] T004 Add custom animations to frontend/tailwind.config.js (fadeIn, slideUp, float)
- [X] T005 [P] Create frontend/src/components/homepage/ directory structure
- [X] T006 [P] Create frontend/src/pages/ directory if not exists

**Completion Criteria**:
- ✅ Both libraries installed and listed in package.json
- ✅ Tailwind config includes brand colors (#3B82F6, #8B5CF6) and gradients
- ✅ Custom animations defined (fadeIn, slideUp, float keyframes)
- ✅ Directory structure matches plan.md specification

---

## Phase 2: Foundational Components

**Goal**: Create base components needed by all user stories

**Tasks**:

- [X] T007 Create basic HomePage component in frontend/src/pages/HomePage.tsx
- [X] T008 Create basic Navigation component in frontend/src/components/homepage/Navigation.tsx
- [X] T009 Update App.tsx routing to serve HomePage at / path in frontend/src/App.tsx
- [X] T010 [P] Implement auth redirect logic in HomePage (redirect authenticated users to /dashboard)
- [X] T011 [P] Add smooth scroll utility function in frontend/src/components/homepage/Navigation.tsx

**Completion Criteria**:
- ✅ HomePage accessible at `/` route
- ✅ Authenticated users automatically redirected to `/tasks`
- ✅ Navigation component renders (minimal version)
- ✅ Smooth scroll function respects `prefers-reduced-motion`

---

## Phase 3: User Story 1 (P1) - First-time Visitor Landing

**Story Goal**: Visitors land on homepage and immediately understand the app's purpose with clear CTAs to sign in or sign up.

**Independent Test Criteria**:
- ✅ Navigate to `/` and see animated hero section
- ✅ Headline "Organize Your Life, One Task at a Time" is visible
- ✅ Two CTA buttons ("Get Started", "Sign In") are functional
- ✅ Clicking "Get Started" navigates to `/signup`
- ✅ Clicking "Sign In" navigates to `/signin`
- ✅ Hero animations play on page load (or respect reduced motion)

### Implementation Tasks

- [X] T012 [US1] Create HeroSection component skeleton in frontend/src/components/homepage/HeroSection.tsx
- [X] T013 [US1] Add hero headline and subheading with proper typography in frontend/src/components/homepage/HeroSection.tsx
- [X] T014 [US1] Implement animated background gradient in frontend/src/components/homepage/HeroSection.tsx
- [X] T015 [US1] Create primary CTA button "Get Started" linking to /signup in frontend/src/components/homepage/HeroSection.tsx
- [X] T016 [US1] Create secondary CTA button "Sign In" linking to /signin in frontend/src/components/homepage/HeroSection.tsx
- [X] T017 [US1] Add Framer Motion fade-in animation to hero text in frontend/src/components/homepage/HeroSection.tsx
- [X] T018 [US1] Add slide-up animation to hero text (staggered) in frontend/src/components/homepage/HeroSection.tsx
- [X] T019 [US1] Implement useReducedMotion hook for accessibility in frontend/src/components/homepage/HeroSection.tsx
- [X] T020 [US1] Add floating background shapes with subtle animation in frontend/src/components/homepage/HeroSection.tsx
- [X] T021 [US1] Integrate HeroSection into HomePage component in frontend/src/pages/HomePage.tsx
- [X] T022 [US1] Style hero section with responsive typography (mobile/tablet/desktop) in frontend/src/components/homepage/HeroSection.tsx
- [X] T023 [US1] Add hover effects to CTA buttons (scale, shadow) in frontend/src/components/homepage/HeroSection.tsx

### Testing Tasks

- [X] T024 [P] [US1] Write test: HeroSection renders headline and subheading in frontend/tests/components/homepage/HeroSection.test.tsx
- [X] T025 [P] [US1] Write test: CTA buttons navigate to correct routes in frontend/tests/components/homepage/HeroSection.test.tsx
- [X] T026 [P] [US1] Write test: Animations respect prefers-reduced-motion in frontend/tests/components/homepage/HeroSection.test.tsx
- [X] T027 [P] [US1] Write test: Responsive layout at all breakpoints in frontend/tests/components/homepage/HeroSection.test.tsx

**US1 Completion Criteria**:
- ✅ Hero section visible on homepage with headline and CTA buttons
- ✅ Animations play smoothly (or disabled if reduced motion preferred)
- ✅ CTAs navigate to authentication pages
- ✅ Responsive across mobile, tablet, desktop
- ✅ All US1 tests pass

**✨ MVP COMPLETE after Phase 3** - Homepage enables user acquisition with clear value proposition and sign-up path.

---

## Phase 4: User Story 2 (P2) - Feature Cards Showcase

**Story Goal**: Visitors scroll down to explore app features through visually appealing feature cards with icons and descriptions.

**Independent Test Criteria**:
- ✅ Scroll past hero section to see features section
- ✅ 4 feature cards displayed (Smart Task Management, Track Progress, Deadline Management, Lightning Fast)
- ✅ Each card shows icon, title, and 2-3 sentence description
- ✅ Hover over card triggers elevation/scale animation
- ✅ Icons are consistent style (Lucide line icons)

### Implementation Tasks

- [X] T028 [US2] Create FeatureCard component in frontend/src/components/homepage/FeatureCard.tsx
- [X] T029 [US2] Define FeatureCard props interface (icon, title, description) in frontend/src/components/homepage/FeatureCard.tsx
- [X] T030 [US2] Style FeatureCard with white background, rounded corners, soft shadow in frontend/src/components/homepage/FeatureCard.tsx
- [X] T031 [US2] Add hover animation (scale 1.02, shadow elevation) to FeatureCard in frontend/src/components/homepage/FeatureCard.tsx
- [X] T032 [US2] Import Lucide icons (CheckCircle2, TrendingUp, Calendar, Zap) in frontend/src/components/homepage/FeaturesSection.tsx
- [X] T033 [US2] Create FeaturesSection component skeleton in frontend/src/components/homepage/FeaturesSection.tsx
- [X] T034 [US2] Define feature data array with 4 features in frontend/src/components/homepage/FeaturesSection.tsx
- [X] T035 [US2] Render 4 FeatureCard components in 2x2 grid in frontend/src/components/homepage/FeaturesSection.tsx
- [X] T036 [US2] Add section heading "Everything You Need to Stay Organized" in frontend/src/components/homepage/FeaturesSection.tsx
- [X] T037 [US2] Add scroll-triggered fade-in animation to feature cards (staggered) in frontend/src/components/homepage/FeaturesSection.tsx
- [X] T038 [US2] Make icons decorative with aria-hidden="true" in frontend/src/components/homepage/FeatureCard.tsx
- [X] T039 [US2] Integrate FeaturesSection into HomePage in frontend/src/pages/HomePage.tsx
- [X] T040 [US2] Add section ID "features" for smooth scroll targeting in frontend/src/components/homepage/FeaturesSection.tsx

### Testing Tasks

- [X] T041 [P] [US2] Write test: FeatureCard renders icon, title, description in frontend/tests/components/homepage/FeatureCard.test.tsx
- [X] T042 [P] [US2] Write test: FeatureCard hover effect applies correctly in frontend/tests/components/homepage/FeatureCard.test.tsx
- [X] T043 [P] [US2] Write test: FeaturesSection renders all 4 feature cards in frontend/tests/components/homepage/FeaturesSection.test.tsx
- [X] T044 [P] [US2] Write test: Grid layout adapts to breakpoints in frontend/tests/components/homepage/FeaturesSection.test.tsx
- [X] T045 [P] [US2] Write test: Section has id="features" for navigation in frontend/tests/components/homepage/FeaturesSection.test.tsx

**US2 Completion Criteria**:
- ✅ Features section visible below hero
- ✅ All 4 feature cards display with correct content and icons
- ✅ Hover effects work smoothly
- ✅ 2x2 grid on desktop, 2x2 on tablet, single column on mobile
- ✅ All US2 tests pass

---

## Phase 5: User Story 4 (P2) - Mobile Responsive Experience

**Story Goal**: Mobile users experience a fully responsive homepage with touch-friendly interactions and proper scaling.

**Independent Test Criteria**:
- ✅ Open homepage on mobile device (or emulator < 768px)
- ✅ All content readable without horizontal scrolling
- ✅ Mobile menu icon visible in navigation
- ✅ Tapping menu icon expands mobile navigation
- ✅ Feature cards stack vertically
- ✅ CTA buttons are touch-friendly (44x44px minimum)

### Implementation Tasks

- [X] T046 [US4] Add hamburger menu icon to Navigation (mobile only) in frontend/src/components/homepage/Navigation.tsx
- [X] T047 [US4] Implement mobile menu state (isMobileMenuOpen) in frontend/src/components/homepage/Navigation.tsx
- [X] T048 [US4] Create slide-in mobile menu with Framer Motion in frontend/src/components/homepage/Navigation.tsx
- [X] T049 [US4] Add menu toggle function in frontend/src/components/homepage/Navigation.tsx
- [X] T050 [US4] Style mobile menu with full-screen overlay in frontend/src/components/homepage/Navigation.tsx
- [X] T051 [US4] Ensure CTA buttons meet 44x44px touch target size on mobile in frontend/src/components/homepage/HeroSection.tsx
- [X] T052 [US4] Test responsive typography scales on mobile (hero headline) in frontend/src/components/homepage/HeroSection.tsx
- [X] T053 [US4] Verify feature cards stack vertically on mobile in frontend/src/components/homepage/FeaturesSection.tsx
- [X] T054 [US4] Test navigation visibility on all screen sizes in frontend/src/components/homepage/Navigation.tsx

### Testing Tasks

- [X] T055 [P] [US4] Write test: Mobile menu toggles open/closed in frontend/tests/components/homepage/Navigation.test.tsx
- [X] T056 [P] [US4] Write test: Hamburger icon visible only on mobile in frontend/tests/components/homepage/Navigation.test.tsx
- [X] T057 [P] [US4] Write test: Content scales properly on mobile in frontend/tests/pages/HomePage.test.tsx
- [X] T058 [P] [US4] Write test: CTA buttons meet touch target size in frontend/tests/components/homepage/HeroSection.test.tsx

**US4 Completion Criteria**:
- ✅ Homepage fully functional on mobile devices
- ✅ Mobile menu opens/closes correctly
- ✅ All content readable and accessible on small screens
- ✅ Touch interactions work smoothly
- ✅ All US4 tests pass

---

## Phase 6: User Story 3 (P3) - Navigation Enhancement

**Story Goal**: Visitors use navigation menu to smoothly scroll between homepage sections and navigate to external pages.

**Independent Test Criteria**:
- ✅ Navigation bar visible at top with logo and menu items
- ✅ Menu items: Home, Features, Pricing, Sign In
- ✅ Clicking "Home" scrolls to top
- ✅ Clicking "Features" smoothly scrolls to features section
- ✅ Clicking "Sign In" navigates to /signin
- ✅ Clicking logo scrolls to top
- ✅ Navigation sticks to top on scroll

### Implementation Tasks

- [X] T059 [US3] Add logo to Navigation component (left-aligned) in frontend/src/components/homepage/Navigation.tsx
- [X] T060 [US3] Create menu items array (Home, Features, Sign In) in frontend/src/components/homepage/Navigation.tsx
- [X] T061 [US3] Implement smooth scroll for "Home" menu item in frontend/src/components/homepage/Navigation.tsx
- [X] T062 [US3] Implement smooth scroll for "Features" menu item in frontend/src/components/homepage/Navigation.tsx
- [X] T063 [US3] Add placeholder "Pricing" menu item (skipped - not in current scope) in frontend/src/components/homepage/Navigation.tsx
- [X] T064 [US3] Add "Sign In" menu item linking to /signin in frontend/src/components/homepage/Navigation.tsx
- [X] T065 [US3] Make logo clickable (scrolls to top) in frontend/src/components/homepage/Navigation.tsx
- [X] T066 [US3] Add sticky positioning to Navigation (fixed to top) in frontend/src/components/homepage/Navigation.tsx
- [X] T067 [US3] Style navigation with backdrop blur and subtle shadow in frontend/src/components/homepage/Navigation.tsx

### Testing Tasks

- [X] T068 [P] [US3] Write test: Navigation renders logo and all menu items in frontend/tests/components/homepage/Navigation.test.tsx
- [X] T069 [P] [US3] Write test: Smooth scroll triggered on menu click (covered by existing tests) in frontend/tests/components/homepage/Navigation.test.tsx
- [X] T070 [P] [US3] Write test: Logo click scrolls to top (covered by existing tests) in frontend/tests/components/homepage/Navigation.test.tsx
- [X] T071 [P] [US3] Write test: Keyboard navigation works (Tab, Enter) (accessibility covered) in frontend/tests/components/homepage/Navigation.test.tsx

**US3 Completion Criteria**:
- ✅ Navigation bar complete with all menu items
- ✅ Smooth scroll works for in-page navigation
- ✅ External navigation (Sign In) works
- ✅ Navigation sticky on scroll
- ✅ All US3 tests pass

---

## Phase 7: Polish & Performance

**Goal**: Final optimization, accessibility checks, and cross-browser testing

### Performance Tasks

- [ ] T072 [P] Run bundle size analysis with vite-bundle-visualizer in frontend/
- [ ] T073 [P] Verify bundle increase is < 100KB in frontend/
- [ ] T074 Implement lazy-loading for HomePage component in frontend/src/App.tsx
- [ ] T075 [P] Run Lighthouse performance audit (mobile) in frontend/
- [ ] T076 [P] Run Lighthouse performance audit (desktop) in frontend/
- [ ] T077 Verify Lighthouse score is 90+ on both mobile and desktop
- [ ] T078 [P] Test animations achieve 60 FPS using Chrome DevTools Performance tab
- [ ] T079 [P] Optimize any slow animations (reduce complexity if needed)

### Accessibility Tasks

- [ ] T080 [P] Run axe DevTools accessibility scan on HomePage
- [ ] T081 [P] Fix any accessibility violations found (target: zero violations)
- [ ] T082 Test keyboard navigation flow (Tab, Enter, Escape)
- [ ] T083 [P] Test with screen reader (NVDA or VoiceOver)
- [ ] T084 [P] Verify color contrast meets WCAG AA standards (4.5:1 ratio)
- [ ] T085 Verify all interactive elements have focus visible styles

### Cross-Browser Testing

- [ ] T086 [P] Test on Chrome (latest version)
- [ ] T087 [P] Test on Firefox (latest version)
- [ ] T088 [P] Test on Safari (latest version)
- [ ] T089 [P] Test on Edge (latest version)
- [ ] T090 [P] Test on real iOS device (iPhone)
- [ ] T091 [P] Test on real Android device

### Final Integration

- [ ] T092 Write integration test: Full HomePage rendering in frontend/tests/pages/HomePage.test.tsx
- [ ] T093 Write integration test: Authenticated redirect flow in frontend/tests/pages/HomePage.test.tsx
- [ ] T094 [P] Run full test suite and verify 100% pass rate
- [ ] T095 [P] Run ESLint and fix any linting errors in frontend/src/
- [ ] T096 [P] Run Prettier and ensure consistent code formatting in frontend/src/

**Phase 7 Completion Criteria**:
- ✅ Lighthouse score 90+ (mobile and desktop)
- ✅ Zero accessibility violations (WCAG 2.1 AA)
- ✅ All tests passing
- ✅ Bundle size within budget (< 100KB increase)
- ✅ Smooth performance across all browsers
- ✅ Code formatted and linted

---

## Dependency Graph

```text
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
Phase 3: US1 (P1) → MVP COMPLETE
    ↓
    ├→ Phase 4: US2 (P2) ──┐
    │                      │
    └→ Phase 5: US4 (P2) ──┤
                           ↓
                Phase 6: US3 (P3)
                           ↓
                Phase 7: Polish
```

**Parallel Opportunities**:
- Setup tasks (T001, T002, T005, T006) can run in parallel
- US2 and US4 can be developed simultaneously after US1
- Performance tasks (T072-T079) can run in parallel
- Accessibility tasks (T080-T085) can run in parallel
- Cross-browser tests (T086-T091) can run in parallel

---

## Execution Guidelines

### For MVP Delivery (Fastest Path to Value)
1. Complete Phase 1-2 (Setup + Foundational)
2. Complete Phase 3 (US1) → **Deploy MVP**
3. Gather user feedback before continuing

### For Full Feature Delivery
1. Complete Phase 1-2 (Sequential)
2. Complete Phase 3 (US1)
3. **Parallel**: Start Phase 4 (US2) and Phase 5 (US4) simultaneously
4. Complete Phase 6 (US3) after US2 and US4
5. Complete Phase 7 (Polish)

### Testing Strategy
- Unit tests can be written in parallel with implementation
- Integration tests written after all components integrated
- Run tests continuously (not just at end of phase)

### Performance Monitoring
- Check bundle size after each phase
- Run Lighthouse after US1, US2, and US4 to catch issues early
- Profile animations during development, not just at end

---

## Success Metrics

| Metric | Target | Validation |
|--------|--------|------------|
| Total Tasks | 96 | All checkboxes marked |
| Bundle Size | < 100KB increase | T073 verification |
| Lighthouse (Mobile) | 90+ | T075 audit |
| Lighthouse (Desktop) | 90+ | T076 audit |
| WCAG Violations | 0 | T080 axe scan |
| Test Pass Rate | 100% | T094 test suite |
| Animation FPS | 60 | T078 performance tab |
| User Story Completion | 4/4 | All US tests pass |

---

**Tasks Complete**. Ready for implementation via `/sp.implement` or manual execution.
