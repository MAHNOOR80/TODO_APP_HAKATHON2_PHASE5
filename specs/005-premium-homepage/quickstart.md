# Quickstart Guide: Premium Homepage Integration

**Feature**: 005-premium-homepage
**Date**: 2026-01-03
**Purpose**: Guide developers on integrating and extending the premium homepage

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Component Overview](#component-overview)
3. [Adding New Homepage Sections](#adding-new-homepage-sections)
4. [Customizing Animations](#customizing-animations)
5. [Extending the Navigation](#extending-the-navigation)
6. [Styling with Tailwind](#styling-with-tailwind)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install framer-motion lucide-react
```

### 2. Verify Installation

```bash
npm list framer-motion lucide-react
# Should show:
# framer-motion@11.0.0
# lucide-react@0.309.0
```

### 3. Directory Structure

The homepage components are organized as follows:

```
frontend/src/
├── pages/
│   └── HomePage.tsx           # Main homepage component
├── components/
│   └── homepage/              # Homepage-specific components
│       ├── Navigation.tsx     # Top navigation bar
│       ├── HeroSection.tsx    # Hero with CTAs
│       ├── FeaturesSection.tsx # Feature cards grid
│       └── FeatureCard.tsx    # Individual feature card
└── App.tsx                    # Routing configuration
```

---

## Component Overview

### HomePage (Page Level)

**Path**: `src/pages/HomePage.tsx`

**Purpose**: Root page that composes all homepage sections

**Key Features**:
- Redirects authenticated users to `/tasks`
- Composes Navigation, HeroSection, and FeaturesSection
- Applies page-level background gradient

**Usage**:
```tsx
import { HomePage } from './pages/HomePage';

// In App.tsx routing
<Route path="/" element={<HomePage />} />
```

---

### Navigation

**Path**: `src/components/homepage/Navigation.tsx`

**Purpose**: Fixed top navigation with logo and menu

**Key Features**:
- Logo navigation (scrolls to top)
- Menu items with smooth scroll
- Mobile hamburger menu
- Sticky positioning

**Extending the Menu**:
```tsx
// Add a new menu item
const menuItems = [
  { label: 'Home', href: '#top' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },      // NEW
  { label: 'About', href: '#about' },          // NEW
  { label: 'Sign In', href: '/signin', isRoute: true },
];
```

---

### HeroSection

**Path**: `src/components/homepage/HeroSection.tsx`

**Purpose**: Hero area with headline, subheading, and CTAs

**Customizing Content**:
```tsx
// Update headline and subheading
<motion.h1>Your Custom Headline</motion.h1>
<motion.p>Your custom subheading text</motion.p>

// Update CTA button text
<Link to="/signup">Your Custom CTA</Link>
```

**Customizing Animations**:
```tsx
// Adjust fade-in timing
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.8,        // Slower fade-in
    delay: 0.2,           // Delay start
    ease: "easeOut"
  }}
>
```

---

### FeaturesSection

**Path**: `src/components/homepage/FeaturesSection.tsx`

**Purpose**: Grid of feature cards

**Adding/Modifying Features**:
```tsx
const features = [
  {
    icon: CheckCircle2,
    title: "Your Feature Title",
    description: "Your feature description (2-3 sentences)"
  },
  {
    icon: TrendingUp,
    title: "Another Feature",
    description: "Another description"
  },
  // Add more features here
];
```

**Changing Grid Layout**:
```tsx
// Current: 2x2 grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

// Change to 3 columns on large screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

### FeatureCard

**Path**: `src/components/homepage/FeatureCard.tsx`

**Purpose**: Reusable card component for features

**Props**:
```typescript
interface FeatureCardProps {
  icon: LucideIcon;     // Lucide icon component
  title: string;        // Feature title
  description: string;  // Feature description
}
```

**Customizing Card Styling**:
```tsx
// Update card background and shadow
<div className="
  bg-white               // Background color
  rounded-xl             // Border radius (12px)
  p-6                    // Padding
  shadow-md              // Shadow size
  hover:shadow-lg        // Hover shadow
  transition-all         // Smooth transitions
  duration-200           // Transition speed
">
```

---

## Adding New Homepage Sections

### Example: Adding a "Testimonials" Section

**Step 1: Create Component**

```tsx
// src/components/homepage/TestimonialsSection.tsx
import { motion } from 'framer-motion';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Jane Doe",
      role: "Product Manager",
      quote: "This app transformed how I manage tasks!",
    },
    // Add more testimonials
  ];

  return (
    <section id="testimonials" className="py-16 px-6">
      <motion.h2
        className="text-3xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        What Our Users Say
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg p-6 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
            <div>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

**Step 2: Add to HomePage**

```tsx
// src/pages/HomePage.tsx
import { TestimonialsSection } from '../components/homepage/TestimonialsSection';

export function HomePage() {
  return (
    <div>
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />  {/* NEW */}
    </div>
  );
}
```

**Step 3: Add to Navigation**

```tsx
// src/components/homepage/Navigation.tsx
const menuItems = [
  // ... existing items
  { label: 'Testimonials', href: '#testimonials' },  // NEW
];
```

---

## Customizing Animations

### Using Framer Motion

**Basic Animation Pattern**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}     // Starting state
  animate={{ opacity: 1, y: 0 }}       // Ending state
  transition={{ duration: 0.6 }}       // Animation timing
>
  Your content
</motion.div>
```

### Scroll-Triggered Animations

**Animate when element enters viewport**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}              // Animate only once
  transition={{ duration: 0.6 }}
>
  Your content
</motion.div>
```

### Staggered Animations

**Animate children sequentially**:
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1  // 0.1s delay between each child
      }
    }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Respecting Reduced Motion

**Always check user's motion preference**:
```tsx
import { useReducedMotion } from 'framer-motion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        opacity: 1,
        y: shouldReduceMotion ? 0 : 20  // Skip animation if reduced motion
      }}
    >
      Content
    </motion.div>
  );
}
```

---

## Extending the Navigation

### Adding External Links

```tsx
// For external links (open in new tab)
{
  label: 'Blog',
  href: 'https://yourblog.com',
  isExternal: true
}

// Render logic
{item.isExternal ? (
  <a
    href={item.href}
    target="_blank"
    rel="noopener noreferrer"
    className="nav-link"
  >
    {item.label}
  </a>
) : (
  <Link to={item.href}>{item.label}</Link>
)}
```

### Adding Dropdown Menus

```tsx
// Menu item with dropdown
{
  label: 'Resources',
  children: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Support', href: '/support' },
  ]
}

// Render with state management
const [openDropdown, setOpenDropdown] = useState<string | null>(null);

<div
  onMouseEnter={() => setOpenDropdown(item.label)}
  onMouseLeave={() => setOpenDropdown(null)}
>
  <button>{item.label}</button>
  {openDropdown === item.label && (
    <div className="dropdown-menu">
      {item.children.map(child => (
        <Link to={child.href}>{child.label}</Link>
      ))}
    </div>
  )}
</div>
```

---

## Styling with Tailwind

### Using Brand Colors

**Colors are defined in `tailwind.config.js`**:
```javascript
colors: {
  brand: {
    blue: '#3B82F6',
    purple: '#8B5CF6',
  },
}
```

**Usage in components**:
```tsx
<div className="text-brand-blue bg-brand-purple">
  Brand colored content
</div>
```

### Using Gradients

**Gradients defined in config**:
```javascript
backgroundImage: {
  'hero-gradient': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
  'button-gradient': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
}
```

**Usage**:
```tsx
<div className="bg-hero-gradient">Hero background</div>
<button className="bg-button-gradient">Gradient button</button>
```

### Custom Animations

**Animations defined in config**:
```javascript
animation: {
  'fade-in': 'fadeIn 0.6s ease-out',
  'slide-up': 'slideUp 0.6s ease-out',
  'float': 'float 6s ease-in-out infinite',
}
```

**Usage**:
```tsx
<div className="animate-fade-in">Fades in on mount</div>
<div className="animate-float">Floating animation</div>
```

### Responsive Design

**Tailwind breakpoint modifiers**:
```tsx
<div className="
  text-sm          // Mobile: small text
  md:text-base     // Tablet (768px+): base text
  lg:text-lg       // Desktop (1024px+): large text
">
  Responsive text
</div>

<div className="
  flex-col         // Mobile: vertical stack
  md:flex-row      // Tablet+: horizontal layout
">
  Responsive layout
</div>
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for specific component
npm test HomePage
```

### Writing Component Tests

**Example: Testing HeroSection**:
```tsx
// src/components/homepage/HeroSection.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders headline and subheading', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    expect(screen.getByText(/Organize Your Life/i)).toBeInTheDocument();
    expect(screen.getByText(/modern todo app/i)).toBeInTheDocument();
  });

  it('renders CTA buttons with correct links', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    const signUpButton = screen.getByRole('link', { name: /get started/i });
    const signInButton = screen.getByRole('link', { name: /sign in/i });

    expect(signUpButton).toHaveAttribute('href', '/signup');
    expect(signInButton).toHaveAttribute('href', '/signin');
  });
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Troubleshooting

### Issue: Animations not working

**Possible Causes**:
1. Framer Motion not installed
2. Component not wrapped in `<motion.div>`
3. User has `prefers-reduced-motion` enabled

**Solution**:
```bash
# Verify installation
npm list framer-motion

# Check component uses motion
<motion.div>...</motion.div>  // ✅
<div>...</div>                 // ❌

# Test with reduced motion disabled
# In DevTools: Rendering tab → "Emulate CSS media prefers-reduced-motion: no-preference"
```

---

### Issue: Icons not displaying

**Possible Causes**:
1. Lucide React not installed
2. Icon name typo
3. Import syntax incorrect

**Solution**:
```bash
# Verify installation
npm list lucide-react

# Check import syntax
import { CheckCircle2 } from 'lucide-react';  // ✅ (note: CheckCircle2, not CheckCircle)
import { CheckCircle } from 'lucide-react';   // ❌

# Verify icon name exists
# See: https://lucide.dev/icons
```

---

### Issue: Smooth scroll not working

**Possible Causes**:
1. Section ID missing
2. Function not called correctly
3. Browser doesn't support smooth scroll

**Solution**:
```tsx
// Ensure section has ID
<section id="features">...</section>  // ✅
<section>...</section>                 // ❌

// Verify function call
<button onClick={() => handleScrollToSection('features')}>

// Fallback for older browsers
const handleScrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    // Try smooth scroll
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      // Fallback to instant scroll
      element.scrollIntoView({ block: 'start' });
    }
  }
};
```

---

### Issue: Responsive layout broken

**Possible Causes**:
1. Missing Tailwind breakpoint prefixes
2. Incorrect class order
3. Parent container constraints

**Solution**:
```tsx
// Check class order (mobile-first approach)
<div className="
  text-sm        // Mobile (default)
  md:text-base   // Tablet (768px+)
  lg:text-lg     // Desktop (1024px+)
">

// Verify parent doesn't constrain width
<div className="w-full max-w-7xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {/* Responsive grid */}
  </div>
</div>
```

---

## Additional Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide Icons Gallery](https://lucide.dev/icons)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Quickstart Complete**. Ready for implementation via `/sp.tasks` command.
