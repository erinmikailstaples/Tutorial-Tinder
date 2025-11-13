# Tutorial Tinder - Design Guidelines

## Design Approach

**Reference-Based Approach:** Drawing inspiration from Tinder's playful swipe mechanics, Product Hunt's discovery aesthetic, and GitHub's technical credibility. The design balances fun engagement with educational seriousness - approachable for beginners while maintaining professional polish.

**Core Principle:** Create an instantly recognizable swipe experience that feels modern and game-like, making repository discovery addictive rather than overwhelming.

---

## Typography

**Primary Font:** Inter or DM Sans (Google Fonts)
- Headings (H1): font-bold text-4xl md:text-5xl lg:text-6xl
- Headings (H2): font-bold text-3xl md:text-4xl
- Card Repo Names: font-bold text-xl md:text-2xl
- Body/Descriptions: font-normal text-base leading-relaxed
- Metadata (stars, language): font-medium text-sm
- Button Text: font-semibold text-base

**Monospace Font:** JetBrains Mono or Fira Code (for code snippets, repo names)

**Hierarchy:** Bold, large headings for impact; generous line-height (leading-relaxed) for readability; clear size differentiation between card title and metadata.

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 8, 12, 16, 20, 24, 32
- Micro spacing (card internal): p-6, gap-4
- Component spacing: mb-8, mt-12
- Section padding: py-20 md:py-32
- Card gaps in stack: mb-4

**Container Strategy:**
- Landing page: max-w-6xl mx-auto for hero/content
- Card deck: max-w-md mx-auto (optimized for swipe interaction)
- Full-width sections with inner constraints

---

## Component Library

### Landing Page Components

**Hero Section (80-90vh):**
- Centered content with max-w-3xl
- Large headline with gradient or emphasis styling on "Tinder" keyword
- Subtitle: text-lg md:text-xl with muted treatment
- Single prominent CTA button (Start Swiping) - large size (px-8 py-4 text-lg)
- Optional: Floating/overlapping card preview animation showing sample repo cards
- Background: Subtle gradient or animated dots pattern

**Feature Section (if included):**
- Three-column grid (grid-cols-1 md:grid-cols-3 gap-8)
- Each feature: icon + heading + brief description
- Icons: 40px-48px size from Heroicons
- Content: Centered alignment, icon-title-description vertical stack

### Card Deck Interface

**Card Stack Layout:**
- Container: max-w-md mx-auto, min-h-screen with pt-12 pb-24
- Stack positioning: relative container with cards position-absolute for layering
- Top card: z-50, second card: z-40 with slight scale (scale-95) and blur
- Third card: z-30 with more scale reduction (scale-90)

**Individual Repo Card (shadcn/ui Card component):**
- Dimensions: Full width with aspect-ratio or min-h-[600px]
- Border: rounded-2xl with subtle shadow (shadow-xl)
- Padding: p-8
- Structure (top to bottom):
  1. **Card Header:**
     - Repo owner/name: monospace font, text-sm with badge/pill treatment
     - Repo title: font-bold text-2xl mb-4
  
  2. **Metadata Row:**
     - Flex row with gap-6
     - Language badge (rounded-full px-3 py-1)
     - Star count with icon
     - Last updated (text-xs)
  
  3. **Description:**
     - text-base leading-relaxed mb-6
     - Max 3-4 lines with line-clamp
  
  4. **README Preview:**
     - Scrollable area (max-h-48 overflow-y-auto)
     - Light background container (p-4 rounded-lg)
     - Monospace font, text-sm
  
  5. **Action Buttons (bottom):**
     - Primary: "Launch in Replit" - full-width or prominent (w-full px-6 py-4)
     - Secondary row: "View on GitHub" + Save/Skip icons
     - Button spacing: gap-3

**Swipe Interaction Affordances:**
- Visible swipe indicators on first load (subtle arrows or helper text)
- Card rotation on drag (slight tilt based on swipe direction)
- Beneath-card previews create depth perception

**Keyboard Shortcut Indicators:**
- Fixed bottom bar or floating badge showing: "← Skip  |  → Save  |  ↵ Launch"
- Subtle, non-intrusive positioning
- Small text (text-xs) with icon pairs

### Navigation

**Top Navigation (minimal):**
- Logo/brand on left
- Optional: Counter showing "12 of 47 repos" on right
- Fixed positioning with backdrop-blur
- Height: h-16, padding px-6

### Buttons

**Primary Button (Launch in Replit):**
- Large, rounded (rounded-lg)
- Full-width on cards or prominent sizing
- Font: font-semibold text-base
- Padding: px-8 py-4
- When on images: backdrop-blur-md with semi-transparent background

**Secondary Buttons (Skip/Save):**
- Icon-based or icon + text
- Smaller size (px-6 py-3)
- Rounded-full for icon-only variants
- Clear visual distinction from primary

**Ghost/Outline Variants:**
- For "View on GitHub" links
- Border treatment with transparent background

### Modals/Toasts

**Toast Notifications:**
- Bottom-right positioning (fixed bottom-6 right-6)
- Rounded-lg with shadow-lg
- Success state for "Launching in Replit..."
- Auto-dismiss after 3-4 seconds
- Icon + message layout (gap-3)

### Empty States

**No More Repos:**
- Centered message with illustration or icon
- Encouraging copy: "You've seen them all!"
- CTA to restart or explore more lists

---

## Images

**Hero Section Image:**
- **Large Hero Background:** Yes - use a subtle tech-themed gradient or abstract code visualization
- Alternative: Floating mockup/preview of the card interface showing sample repos
- Treatment: Soft blur or overlay if using photo; keep it non-distracting

**Card Stack Imagery:**
- No images on individual repo cards (keeps focus on content)
- Optional: Language logos as small icons next to language name

**Decorative Elements:**
- Subtle geometric shapes or code bracket motifs in hero background
- Floating code snippets or terminal window illustrations (very subtle, low opacity)

---

## Animations

**Use Sparingly:**
- Card swipe/exit animations: smooth transform transitions (300-400ms)
- Card stack re-ordering: subtle position shifts
- Hero section: Gentle fade-in on load
- **Avoid:** Excessive scroll-triggered animations, flashy effects

**Focus on:**
- Smooth, natural swipe physics
- Clear visual feedback on interactions
- Micro-interactions on button hover (subtle scale or shift)

---

## Accessibility

- Keyboard navigation fully supported (arrow keys, Enter)
- Focus indicators on all interactive elements
- Sufficient contrast ratios for all text
- Screen reader labels for icon-only buttons
- Skip links for keyboard users
- ARIA labels on swipe cards and action buttons

---

## Mobile Responsiveness

- Cards: Full-width with side padding on mobile (px-4)
- Touch-optimized swipe gestures (minimum 44px touch targets)
- Stacked button layout on mobile vs. row on desktop
- Hero text scales down appropriately (text-3xl → text-5xl)
- Single-column everywhere on mobile