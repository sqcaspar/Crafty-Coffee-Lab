# UI Design Collaboration Guide
*Working with Figma and Claude Code for Coffee Recipe Tracker*

## Table of Contents
1. [Getting Started with Figma](#getting-started-with-figma)
2. [Design-to-Code Workflow](#design-to-code-workflow)
3. [Design Best Practices](#design-best-practices)
4. [Technical Considerations](#technical-considerations)
5. [Collaboration Process](#collaboration-process)
6. [Quality Assurance](#quality-assurance)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started with Figma

### Initial Setup
1. **Create Figma Account**: Sign up at [figma.com](https://figma.com) (free plan is sufficient)
2. **Install Figma Desktop App**: Better performance than browser version
3. **Learn Basic Navigation**: 
   - `Space + drag` to pan
   - `Cmd/Ctrl + scroll` to zoom
   - `V` for selection tool, `R` for rectangle, `T` for text

### Project Setup for Coffee Tracker
```
Recommended Figma File Structure:
📁 Coffee Recipe Tracker UI
  📄 Design System (colors, typography, components)
  📄 Home Page
  📄 Recipe Input Form
  📄 Recipe List/Grid
  📄 Recipe Detail View
  📄 Collections Management
  📄 Mobile Responsive Views
```

### Design System Foundation
**Our Current Monochrome Palette:**
```
Primary Colors:
- mono-white: #ffffff
- mono-50: #fafafa  
- mono-100: #f5f5f5
- mono-200: #e5e5e5
- mono-300: #d4d4d4
- mono-400: #a3a3a3
- mono-500: #737373
- mono-600: #525252
- mono-700: #404040
- mono-800: #262626
- mono-900: #171717
```

**Typography System:**
- **Font**: Inter (Google Fonts)
- **Hero**: 48px, Bold
- **H1**: 36px, Semibold
- **H2**: 24px, Semibold  
- **H3**: 20px, Medium
- **Body**: 16px, Regular
- **Body Small**: 14px, Regular
- **Caption**: 12px, Regular, Uppercase

**Spacing Grid**: Use 8px base unit (8px, 16px, 24px, 32px, 48px, 64px)

---

## Design-to-Code Workflow

### Step 1: Design in Figma
1. **Create new design file** in your Coffee Tracker project
2. **Set up artboards** with standard screen sizes:
   - Desktop: 1440px width
   - Tablet: 768px width  
   - Mobile: 375px width
3. **Use our color palette** (copy hex codes from above)
4. **Follow spacing grid** (8px increments)

### Step 2: Design Review & Export
1. **Complete your design** with all states (normal, hover, focus, disabled)
2. **Create interactive prototype** (optional but helpful)
3. **Export screenshots**:
   - PNG format, 2x resolution
   - Export individual screens and key components
   - Name files clearly: `home-page-desktop.png`, `recipe-card-hover.png`

### Step 3: Capture & Share with Claude Code

#### What to Capture from Figma:

**1. Visual Screenshots:**
- Right-click your design → "Export" → PNG format
- Set to 2x resolution for crisp images
- Export both overview and detail shots

**2. Technical Specifications (Inspect Panel):**
- Select any element → Right panel → "Inspect" tab
- **Copy these values exactly:**
  - `Fill: #ffffff` (background colors)
  - `Stroke: 1px solid #e5e5e5` (borders)
  - `Corner radius: 16px` (rounded corners)
  - `Drop shadow: 0 4px 12px rgba(0,0,0,0.1)` (shadows)
  - `Width: 320px, Height: 240px` (dimensions)
  - `Padding: 24px` (inner spacing)
  - `Gap: 16px` (space between elements)

**3. Typography Details:**
- Select text → Inspect panel shows:
  - `Inter, 16px, Medium` (font family, size, weight)
  - `Line height: 24px` (spacing between lines)
  - `Letter spacing: -0.5px` (character spacing)
  - `Fill: #262626` (text color)

**4. Layout Measurements:**
- Use Figma's measurement tool (hold Alt/Option while hovering)
- Capture spacing between elements
- Note alignment relationships (centered, left-aligned, etc.)

#### How to Pass Information to Claude Code:

**Method 1: Screenshot + Specifications**
```
1. Upload/attach your PNG exports
2. Copy-paste specifications from inspect panel
3. Add written descriptions for interactions
```

**Method 2: Detailed Text Description**
```
Design: Recipe Card Component
File: recipe-card-design.png

Layout:
- Card container: 320px × 240px, white background
- Border: 1px solid #e5e5e5, 16px corner radius
- Shadow: 0 4px 12px rgba(0,0,0,0.1)
- Padding: 24px all sides

Typography:
- Title: Inter, 18px, Semibold, #171717 color
- Subtitle: Inter, 14px, Regular, #525252 color
- Body text: Inter, 16px, Regular, #404040 color

Interactive elements:
- Favorite button: 24px × 24px, top-right corner
- Hover state: lift 4px up, stronger shadow
- Click feedback: slight scale down (0.98)

Responsive behavior:
- Mobile: stack elements vertically
- Tablet: 2 columns
- Desktop: 4 columns
```

**Method 3: Component Breakdown**
```
What each part does:
├── Card Header (recipe title + favorite button)
├── Recipe Image (16:9 aspect ratio, rounded corners)
├── Recipe Details (origin, method, date created)
├── Rating Stars (1-5 filled stars, yellow color)
└── Action Buttons (Edit, Delete, More options menu)

States to implement:
- Default (normal appearance)
- Hover (lift effect + shadow)
- Loading (skeleton placeholder)
- Empty (no image placeholder)
```

**Example sharing format:**
```
Design: Recipe Card Component
File: recipe-card-design.png

Specifications:
- Card size: 320px × 240px
- Border radius: 16px
- Background: #ffffff
- Border: 1px solid #e5e5e5
- Padding: 24px
- Shadow: 0 4px 12px rgba(0,0,0,0.1)

Hover state:
- Lift effect: translate Y -4px
- Shadow: 0 8px 24px rgba(0,0,0,0.15)
- Scale: 1.02

Interactive elements:
- Favorite star button (top right)
- Rating display (5 stars)
- Action buttons (Edit, Delete)
```

### Step 4: Implementation by Claude Code
- I'll translate your design into React/TypeScript components
- Match your specifications exactly
- Integrate with existing design system
- Ensure responsive behavior
- Add accessibility features

### Step 5: Review & Iterate
1. **View implementation** at http://localhost:3000
2. **Compare with your Figma design**
3. **Provide feedback** on any differences
4. **Request adjustments** if needed
5. **Repeat until satisfied**

---

## Design Best Practices

### Component-Based Thinking
**Think in React Components:**
- **Atomic elements**: Buttons, inputs, icons
- **Molecules**: Search bar, card header, form fields
- **Organisms**: Navigation, recipe card, form sections
- **Templates**: Page layouts with content areas

**Example Component Breakdown:**
```
Recipe Card Component:
├── Card Container (background, border, shadow)
├── Recipe Image (aspect ratio 16:9)
├── Card Header
│   ├── Recipe Title (text)
│   ├── Rating Stars (5 icons)
│   └── Favorite Button (icon + state)
├── Card Body
│   ├── Recipe Details (origin, method, date)
│   └── Tasting Notes (truncated text)
└── Card Actions
    ├── Edit Button
    ├── Delete Button
    └── More Options Menu
```

### Responsive Design Guidelines
**Mobile-First Approach:**
1. **Start with mobile design** (375px width)
2. **Scale up to tablet** (768px width)
3. **Optimize for desktop** (1440px+ width)

**Key Breakpoints:**
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Responsive Considerations:**
- **Navigation**: Hamburger menu on mobile, tabs on desktop
- **Grid layouts**: 1 column mobile → 2-3 columns tablet → 4+ columns desktop
- **Forms**: Single column on mobile, multi-column on desktop
- **Typography**: Smaller sizes on mobile

### Interactive States Design
**Always design these states:**
- **Default**: Normal appearance
- **Hover**: Subtle highlight (desktop only)
- **Focus**: Clear focus indicator for accessibility
- **Active/Pressed**: Visual feedback during interaction
- **Disabled**: Reduced opacity/greyed out
- **Loading**: Skeleton loaders or spinners
- **Error**: Red indicators for validation errors
- **Success**: Green confirmations

### Data Scenarios
**Design for real data:**
- **Empty states**: "No recipes yet" with call-to-action
- **Loading states**: Skeleton components while data loads
- **Error states**: Connection issues, server errors
- **Long content**: Recipe names that wrap, long descriptions
- **Many items**: How grids look with 20+ recipes
- **Single item**: How lists look with only 1 recipe

---

## Technical Considerations

### What Translates Well
✅ **Easy to implement:**
- Solid colors and gradients
- Standard border radius
- Box shadows
- Typography hierarchy
- Grid layouts
- Flexbox layouts
- Simple animations (fade, slide, scale)
- CSS transforms

### What's Challenging
⚠️ **Requires careful planning:**
- Complex animations with multiple steps
- Custom illustrations (need SVG export)
- Non-standard fonts (licensing issues)
- Overlapping elements with precise positioning
- Complex masking effects
- Custom scrollbars

❌ **Avoid or simplify:**
- Figma-specific effects (noise, inner shadow combinations)
- Complex image filters
- Video backgrounds
- Advanced prototyping interactions
- Non-web fonts

### Performance Considerations
**Image Optimization:**
- **Icons**: Use SVG, not PNG
- **Photos**: Optimize file size, consider WebP format
- **Illustrations**: SVG preferred over complex PNG

**Animation Performance:**
- **Prefer**: transform, opacity changes
- **Avoid**: animating width, height, top, left properties
- **Use**: GPU-accelerated properties (transform, opacity)

### Accessibility Requirements
**Color Contrast:**
- **Text on background**: Minimum 4.5:1 contrast ratio
- **Interactive elements**: Clear visual distinction
- **Error states**: Don't rely on color alone

**Focus Indicators:**
- **Visible focus rings** on all interactive elements
- **Logical tab order** through the interface
- **Skip links** for keyboard navigation

**Touch Targets:**
- **Minimum size**: 44px × 44px for mobile
- **Adequate spacing** between clickable elements

---

## Collaboration Process

### Communication Protocol
**When sharing designs:**
1. **Context**: Explain what you're designing and why
2. **Requirements**: List specific functionality needed
3. **Priority**: Mark which parts are most important
4. **Timeline**: When you need it implemented

**Example communication:**
```
Hi! I've designed a new recipe card layout. 

Context: The current cards feel too cramped, so I made them larger with better spacing.

Requirements:
- Must show recipe image, title, rating, and date
- Favorite button should toggle state
- Hover effect for desktop users
- Responsive for mobile (stack elements vertically)

Priority: High - this affects the main recipe list view

Files attached: recipe-card-desktop.png, recipe-card-mobile.png, recipe-card-hover.png

Let me know if you need any clarifications!
```

### Review Process
**After I implement your design:**
1. **Test on localhost:3000** in different browsers
2. **Check mobile responsiveness** (resize browser window)
3. **Test interactions** (hover, click, form inputs)
4. **Compare with your Figma design**
5. **Document any differences** or requested changes

**Feedback Format:**
```
Overall: Looks great! Few adjustments needed:

✅ Correct:
- Colors match perfectly
- Spacing looks right
- Hover effects work well

🔄 Adjustments needed:
- Recipe title font should be slightly larger (18px instead of 16px)
- Card shadow too strong - can we reduce opacity to 0.1?
- Mobile: buttons stack weirdly, can they be side by side?

❓ Questions:
- Should the favorite star be filled when selected?
- What happens when recipe title is very long?
```

### Iterative Refinement
**Typical iteration cycle:**
1. **Initial implementation** (80% match to design)
2. **Your feedback** on differences
3. **Refinement** (95% match)
4. **Final polish** (pixel-perfect)
5. **Cross-browser testing**
6. **Mobile optimization**

---

## Quality Assurance

### Pre-Implementation Checklist
**Before asking for implementation:**
- [ ] Design follows our color palette
- [ ] Typography uses Inter font family
- [ ] Spacing follows 8px grid system
- [ ] All interactive states designed
- [ ] Mobile responsive version included
- [ ] Component structure is clear
- [ ] Export quality is high (2x resolution)

### Post-Implementation Testing
**After receiving coded version:**
- [ ] Visual accuracy (compare side-by-side)
- [ ] Responsive behavior on different screen sizes
- [ ] Interactive states work correctly
- [ ] Loading states function properly
- [ ] Error handling displays correctly
- [ ] Accessibility: tab navigation works
- [ ] Performance: no lag during interactions

### Browser Testing
**Test in these browsers:**
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

---

## Troubleshooting

### Common Issues & Solutions

**Issue: "Colors don't match exactly"**
- Solution: Use Figma's inspect panel to copy exact hex codes
- Share color values: `#f5f5f5` not "light gray"

**Issue: "Layout breaks on mobile"**
- Solution: Design mobile version explicitly, don't assume auto-scaling works

**Issue: "Animation feels different than expected"**
- Solution: Describe timing and easing in detail
- Reference: "Should feel like iOS button press" or "Smooth like Gmail"

**Issue: "Component looks different in browser"**
- Solution: Fonts render differently - minor adjustments are normal
- Focus on proportions and spacing rather than pixel-perfect matching

**Issue: "Interactive prototype doesn't work in code"**
- Solution: Figma prototypes are guidelines, not exact specifications
- Describe the intended interaction in words

### Getting Help
**When stuck on design decisions:**
- Look at modern web apps: Linear, Notion, Stripe Dashboard
- Check design systems: Material Design, Apple HIG, Ant Design
- Use Figma Community templates for inspiration

**When technical limitations arise:**
- I'll suggest alternative approaches that achieve the same user experience
- We can iterate on solutions together
- Performance and accessibility always take priority

---

## Quick Reference

### File Naming Convention
```
[component]-[viewport]-[state].png

Examples:
- home-page-desktop.png
- recipe-card-mobile-hover.png
- form-input-tablet-error.png
- navigation-mobile-open.png
```

### Essential Figma Shortcuts
- `Cmd/Ctrl + D`: Duplicate
- `Cmd/Ctrl + G`: Group
- `Alt + drag`: Duplicate while dragging
- `Cmd/Ctrl + Shift + K`: Create component
- `F`: Frame tool
- `Shift + A`: Auto layout

### Handoff Checklist
- [ ] All screens exported as PNG (2x resolution)
- [ ] Color values copied from inspect panel
- [ ] Font sizes and weights documented
- [ ] Spacing measurements noted
- [ ] Interaction descriptions written
- [ ] Component structure explained
- [ ] Edge cases considered (long text, empty states)

---

## Design Maintenance & Updates

### Keeping Your Figma Designs Updated

**1. Version Control in Figma:**
- **Page versions**: Figma automatically saves version history
- **Manual versions**: Click "+" next to file name → "Save to version history"
- **Naming convention**: "v1.0 - Initial Design", "v1.1 - Card Updates", etc.
- **Access history**: File menu → "Show version history"

**2. Design System Evolution:**
- **Keep components updated**: When I implement changes, update your Figma components
- **Sync colors**: If we adjust colors in code, update your Figma color styles
- **Typography updates**: Match any font size/weight changes made during implementation

**3. Documentation Workflow:**
```
After each implementation cycle:
1. Update Figma designs based on final coded version
2. Screenshot the actual implemented UI
3. Compare with original design and note differences
4. Update Figma to match successful implementations
5. Document any design decisions that changed during coding
```

### Future Design Updates

**When you want to make changes:**

**Small Updates (colors, spacing, text):**
1. Make changes in Figma
2. Export affected components
3. Share: "Quick update - changed card shadow from 0.1 to 0.05 opacity"
4. I update code accordingly

**Medium Updates (layout changes, new components):**
1. Design new version in Figma
2. Create comparison screenshots (before/after)
3. Export new components with specifications
4. Share complete component breakdown
5. I implement with full testing

**Major Updates (complete redesigns):**
1. Create new Figma page for redesign
2. Keep old version for reference
3. Design complete user flows
4. Export comprehensive specifications
5. Plan implementation in phases with you

### Long-term Figma Organization

**File Structure Evolution:**
```
📁 Coffee Recipe Tracker UI
  📄 🎯 Current Version (working designs)
  📄 📦 Implemented Components (matches live code)
  📄 🔬 Experiments (trying new ideas)
  📄 📚 Archive (old versions)
  📄 📋 Design System (colors, typography, components)
```

**Component Library Management:**
- **Create Figma components** for reusable elements (buttons, cards, forms)
- **Publish component library** for consistency across designs
- **Update components** when code implementation teaches us better patterns
- **Document usage rules** for each component

### Staying Synchronized

**Monthly Review Process:**
1. **Compare live app** (localhost:3000) with Figma designs
2. **Note any differences** that crept in during development
3. **Update Figma** to match the live version
4. **Plan upcoming improvements** based on usage patterns

**When Implementation Differs from Design:**
```
Sometimes code implementation reveals better solutions:

Original Figma design: Button with 12px padding
Implementation reality: Needs 16px for better touch targets
Resolution: Update Figma to 16px, document the reason

This creates a feedback loop that improves both design and code!
```

**Design Evolution Examples:**
- **Responsive discoveries**: Mobile testing might reveal better layouts
- **Accessibility improvements**: Implementation adds focus states not in original design
- **Performance optimizations**: Simpler animations that work better in browser
- **User feedback**: Real usage data suggests different information hierarchy

### Best Practices for Design Longevity

**1. Design with Code Reality in Mind:**
- Test your designs on actual devices
- Consider loading states from the beginning
- Design for edge cases (long text, missing images)
- Think about keyboard navigation

**2. Maintain Design Documentation:**
- **Decision log**: Why you chose certain layouts or colors
- **Component specs**: Detailed breakdown of each UI component
- **User flow maps**: How different screens connect
- **Responsive rules**: How layouts adapt across screen sizes

**3. Regular Design Health Checks:**
- **Monthly**: Compare Figma vs. live app
- **Quarterly**: Review design system for consistency
- **After major features**: Update component library
- **Before new designs**: Ensure using latest established patterns

This process ensures your designs stay relevant and implementable over time!

---

*This guide will evolve as we work together. Feel free to suggest improvements or ask questions about any section!*

**Happy designing! 🎨**