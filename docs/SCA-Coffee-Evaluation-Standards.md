# SCA Coffee Evaluation Standards

## Overview

The Specialty Coffee Association (SCA) coffee evaluation system encompasses multiple assessment methodologies with specific quantitative parameters and ranges. The system has evolved from the traditional 2004 cupping protocol to the new Coffee Value Assessment (CVA) system, each with distinct scoring mechanisms and parameter specifications.

## Traditional SCA Cupping Form Parameters

The traditional SCA cupping form utilizes a **6-10 point scale** for quality assessment across multiple sensory attributes. Each parameter is scored with specific quality descriptors.

### Quality Attributes (6-10 Point Scale)

Each attribute follows the same quality progression:
- **6.00**: Good
- **7.00**: Very Good  
- **8.00**: Excellent
- **9.00**: Outstanding
- **10.00**: Perfect (theoretical maximum)

#### Primary Attributes
- **Fragrance/Aroma**: 6.00-10.00 points
- **Flavor**: 6.00-10.00 points
- **Aftertaste**: 6.00-10.00 points
- **Acidity**: 6.00-10.00 points (quality) + intensity level (High/Medium/Low)
- **Body**: 6.00-10.00 points (quality) + level descriptor (Heavy/Medium/Thin)
- **Balance**: 6.00-10.00 points
- **Overall**: 6.00-10.00 points (final impression)

### Cup Characteristics (Uniformity Scoring)

Based on evaluation of 5 cups, with 2 points awarded per compliant cup:

- **Uniformity**: 0-10 points (2 points × 5 cups maximum)
- **Clean Cup**: 0-10 points (2 points × 5 cups maximum)  
- **Sweetness**: 0-10 points (2 points × 5 cups maximum)

### Defect Penalties

Defects result in point deductions from the total score:

- **Taint Defects**: -2 points per affected cup
- **Fault Defects**: -4 points per affected cup

### Score Calculation

**Final Score** = Sum of all quality attributes + uniformity + clean cup + sweetness - defect penalties

**Theoretical Range**: 36-100 points (6×7 attributes + 3×10 cup characteristics = 72-100 points before defects)

## New CVA System Parameters

The Coffee Value Assessment (CVA) system includes two complementary assessment methods:

### 1. CVA Descriptive Assessment (15-Point Intensity Scale)

Uses a **0-15 scale** to measure the strength/intensity of sensory perceptions:

#### Intensity Ratings (0-15 Scale)
- **0**: No perception/Extremely Low
- **5-10**: Medium intensity range
- **15**: Extremely High intensity

#### Evaluated Attributes
- **Fragrance Intensity**: 0-15 scale
- **Aroma Intensity**: 0-15 scale
- **Flavor Intensity**: 0-15 scale (combined taste and retronasal perception)
- **Aftertaste Intensity**: 0-15 scale (lingering sensations)
- **Acidity Intensity**: 0-15 scale (sourness perception)
- **Sweetness Intensity**: 0-15 scale (sweet taste/aroma)
- **Mouthfeel Intensity**: 0-15 scale (tactile sensations)

#### Check-All-That-Apply (CATA) Selections

Descriptive categories with selection limits:

- **Olfactory Categories**: Up to 5 descriptors from predefined flavor categories
- **Retronasal Perceptions**: Up to 5 descriptors for flavor/aftertaste
- **Main Tastes**: Up to 2 selections from: salty, sour, sweet, bitter, umami
- **Mouthfeel Descriptors**: Up to 2 selections from: metallic, rough, oily, smooth, mouth-drying

### 2. CVA Affective Assessment (9-Point Quality Scale)

Uses a **1-9 scale** for impression of quality ratings across all sensory sections.

#### 9-Point Quality Scale Structure
- **1**: Extremely Low impression of quality
- **2**: Very Low
- **3**: Moderately Low
- **4**: Slightly Low
- **5**: Neither High nor Low (neutral point)
- **6**: Slightly High
- **7**: Moderately High
- **8**: Very High
- **9**: Extremely High impression of quality

#### Evaluated Sections (All use 1-9 scale)
- **Fragrance**: 1-9 quality impression
- **Aroma**: 1-9 quality impression
- **Flavor**: 1-9 quality impression
- **Aftertaste**: 1-9 quality impression
- **Acidity**: 1-9 quality impression
- **Sweetness**: 1-9 quality impression
- **Mouthfeel**: 1-9 quality impression
- **Overall**: 1-9 quality impression

#### Cup Uniformity and Defects
- **Non-uniform Cups**: 0-5 cups (penalty factor)
- **Defective Cups**: 0-5 cups (penalty factor)

### CVA Affective Score Calculation

The CVA employs a specific mathematical formula for final score calculation:

**Formula**: `S = 6.25 × (Σhi) + 37.5 - 2u - 4d`

Where:
- **S** = Final cupping score (rounded to nearest 0.25)
- **Σhi** = Sum of all eight 9-point section scores
- **u** = Number of non-uniform cups
- **d** = Number of defective cups

#### CVA Score Ranges
- **Minimum Possible**: 58.00 points (all sections scored 1, no defects)
- **Neutral Baseline**: 79.00 points (all sections scored 5, no defects)
- **Maximum Possible**: 100.00 points (all sections scored 9, no defects)

## Implementation Guidelines

### Data Storage Considerations
- Use DECIMAL data types for precise scoring (e.g., DECIMAL(4,2) for 6.00-10.00 ranges)
- Store CATA selections as JSON arrays with proper validation
- Implement proper rounding for CVA scores (nearest 0.25)

### Validation Rules
- Traditional SCA: 6.00-10.00 range validation with 0.25 increments
- CVA Descriptive: 0-15 integer range for intensity scales
- CVA Affective: 1-9 integer range for quality impressions
- CATA Selection limits: Enforce maximum selections per category

### User Interface Design
- Clear scale labeling with quality descriptors
- Real-time score calculation and display
- Visual distinction between intensity and quality scales
- Helpful tooltips explaining SCA methodology
- Form validation with specific error messages

### Backwards Compatibility
- Maintain existing simple rating system for legacy data
- Provide migration path from old to new evaluation systems
- Support multiple evaluation systems within single application

---

**References**: Based on official SCA Coffee Evaluation Standards and Coffee Value Assessment (CVA) methodology documentation.

**Last Updated**: 2025-07-24  
**Document Version**: 1.0  
**Applicable Standards**: SCA Cupping Protocol 2004, CVA System 2023