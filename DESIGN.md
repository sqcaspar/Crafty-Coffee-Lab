# DESIGN.md - Coffee Brewing Recipe Tracker

## Design Philosophy
**Apple-Style Minimalism**: Clean, intuitive, and elegant interface that focuses on content and functionality while maintaining visual sophistication.

## Design System

### Color Palette
```css
/* Primary Colors */
--primary-blue: #007AFF;      /* iOS Blue */
--primary-gray: #8E8E93;      /* iOS Gray */
--background: #F2F2F7;        /* iOS Background */
--surface: #FFFFFF;           /* Card/Surface */

/* Semantic Colors */
--success: #34C759;           /* iOS Green */
--warning: #FF9500;           /* iOS Orange */
--error: #FF3B30;             /* iOS Red */
--info: #5AC8FA;              /* iOS Light Blue */

/* Text Colors */
--text-primary: #000000;      /* Primary text */
--text-secondary: #6D6D80;    /* Secondary text */
--text-tertiary: #C7C7CC;     /* Tertiary text */
```

### Typography
```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Font Sizes (iOS-inspired) */
--text-large-title: 34px;     /* Large titles */
--text-title-1: 28px;         /* Section titles */
--text-title-2: 22px;         /* Subsection titles */
--text-title-3: 20px;         /* Card titles */
--text-headline: 17px;        /* Headlines */
--text-body: 17px;            /* Body text */
--text-callout: 16px;         /* Callouts */
--text-subhead: 15px;         /* Subheadings */
--text-footnote: 13px;        /* Small text */
--text-caption: 12px;         /* Captions */

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Spacing System
```css
/* iOS-inspired spacing scale */
--space-1: 4px;               /* Tiny */
--space-2: 8px;               /* Small */
--space-3: 12px;              /* Medium-small */
--space-4: 16px;              /* Medium */
--space-5: 20px;              /* Medium-large */
--space-6: 24px;              /* Large */
--space-8: 32px;              /* Extra large */
--space-10: 40px;             /* XXL */
--space-12: 48px;             /* XXXL */
```

### Border Radius
```css
--radius-small: 8px;          /* Buttons, small cards */
--radius-medium: 12px;        /* Cards, modals */
--radius-large: 16px;         /* Large components */
--radius-xl: 20px;            /* Hero sections */
```

## Component Design Guidelines

### Cards & Surfaces
- **Elevation**: Subtle shadows (`box-shadow: 0 1px 3px rgba(0,0,0,0.1)`)
- **Borders**: Minimal, light borders (`1px solid #E5E5EA`)
- **Padding**: Generous internal spacing (16-24px)
- **Background**: Pure white or very light gray

### Buttons
- **Primary**: Blue background, white text, medium radius
- **Secondary**: Gray border, no background, colored text
- **Destructive**: Red color for delete actions
- **Size**: Minimum 44px height (iOS touch target)

### Forms
- **Input Fields**: Clean borders, focus states with blue accent
- **Labels**: Above inputs, medium weight, secondary color
- **Validation**: Inline error states with red accent
- **Spacing**: Generous vertical spacing between fields

### Navigation
- **Tab Bar**: Clean, minimal, with active state indicators
- **Icons**: Simple, monochrome, consistent stroke weight
- **Typography**: Medium weight for active states

## Layout Principles

### Grid System
- **Container**: Max-width with centered content
- **Columns**: Responsive grid with consistent gutters
- **Breakpoints**: Mobile-first responsive design

### Whitespace
- **Liberal Use**: Generous spacing between elements
- **Breathing Room**: Content should never feel cramped
- **Visual Hierarchy**: Use spacing to create content groupings

### Visual Hierarchy
1. **Large Titles**: Main page headings
2. **Section Titles**: Content area headings  
3. **Body Text**: Primary content
4. **Secondary Text**: Supporting information
5. **Captions**: Metadata and fine print

## Current Implementation Status

### ✅ Implemented
- Basic Tailwind CSS setup
- Component structure with React
- Responsive grid layouts
- Toast notification system

### 🔄 Needs Design Improvement
- [ ] **Navigation Tabs**: Apply Apple-style tab design
- [ ] **Recipe Cards**: Enhance card design with better spacing and typography
- [ ] **Forms**: Improve form field design and validation display
- [ ] **Modals**: Enhance modal design with proper backdrop and animations
- [ ] **Color System**: Implement consistent color palette
- [ ] **Typography**: Apply consistent font sizing and weights

## Design Inspiration References

### Apple Design Resources
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- iOS interface patterns and interactions

### Design Goals
- **Clarity**: Every element serves a purpose
- **Consistency**: Unified design language throughout
- **Accessibility**: High contrast, readable text, touch-friendly
- **Performance**: Smooth interactions and transitions

## Future Design Enhancements

### Planned Improvements
1. **Dark Mode Support**: Complete dark theme implementation
2. **Micro-interactions**: Subtle animations and transitions
3. **Mobile Optimization**: Touch-optimized interface
4. **Advanced Layouts**: Grid/list view toggles
5. **Visual Polish**: Refined shadows, gradients, and textures

### Animation Guidelines
- **Duration**: Quick (200-300ms) for most interactions
- **Easing**: Natural easing curves (`ease-out`, `ease-in-out`)
- **Purpose**: Enhance understanding, not distract
- **Performance**: 60fps, GPU-accelerated when possible

## Design Review Checklist

Before implementing new UI components:
- [ ] Follows Apple-style minimalism principles
- [ ] Uses consistent spacing from design system
- [ ] Implements proper typography hierarchy
- [ ] Maintains accessibility standards
- [ ] Works across all breakpoints
- [ ] Includes appropriate micro-interactions

---

**Design System Version**: 1.0  
**Last Updated**: 2025-01-22  
**Design Language**: Apple-Inspired Minimalism  
**Framework**: Tailwind CSS + Custom Components