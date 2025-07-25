# SCA Cupping Protocol Scoring System

## Main Takeaway

The SCA Cupping Protocol scores coffee on a 100-point scale, based on ten sensory and uniformity/cleanliness attributes. Each attribute is scored individually, then summed and adjusted for defects.

## 1. Attributes and Scoring Range

Under the 2004 SCA Cupping Protocol, a single assessor evaluates one coffee sample across these components:

| Category | Maximum Points | Measurement Method |
|----------|---------------|-------------------|
| Fragrance/Aroma | 10 | Orthonasal smell of grounds (fragrance) and brewed coffee (aroma) |
| Flavor | 10 | Combined retronasal aroma + taste while sipping |
| Aftertaste | 10 | Persistence and quality of flavor after swallowing |
| Acidity | 10 | Perceived brightness or liveliness (not sourness) |
| Body | 10 | Mouthfeel weight and viscosity |
| Balance | 10 | Harmony between acidity, sweetness, body, and flavor |
| Sweetness | 10 | Gustatory or retronasal perception of sweetness |
| Clean Cup | 10 | Absence of negative floating or suspended particles, odors |
| Uniformity | 10 | Consistency of key attributes across five individually brewed cups |
| Overall | 10 | General impression, including additional desirable characteristics |

Each attribute is scored on a scale of 6.00–10.00 (integer or half-point increments), where 6.00 indicates "meets minimum quality" and 10.00 indicates "extraordinary quality."

## 2. Defect Penalties

Defects are classified as either taints or faults.

- **Taint** (e.g., papery, medicinal): –2 points per cup
- **Fault** (e.g., moldy, phenolic, sour/phenolic): –4 points per cup

For each defective cup, subtract the corresponding penalty. Defect penalties apply after summing the attribute scores.

## 3. Scoring Formula

Let:
- F₁…F₁₀ be the ten individual attribute scores (each 6.00–10.00)
- T = number of tainted cups × 2
- D = number of faulty cups × 4

Then the **Final Score** is:

```
Final Score = Σ(i=1 to 10) Fi - (2 × Tainted cups) - (4 × Faulty cups)
```

The result is rounded to two decimal places (typical practice is to the nearest 0.25).

## 4. Example Calculation

An assessor evaluates one sample (five cups) and assigns:

| Attribute | Cupper's Score |
|-----------|---------------|
| Fragrance/Aroma | 8.50 |
| Flavor | 8.75 |
| Aftertaste | 8.25 |
| Acidity | 8.00 |
| Body | 7.75 |
| Balance | 8.00 |
| Sweetness | 7.50 |
| Clean Cup | 10.00 |
| Uniformity | 10.00 |
| Overall | 8.25 |

No taints; one cup judged "moldy" (fault) in cup #3.

**Calculation:**
- Sum of attributes = 8.50 + 8.75 + 8.25 + 8.00 + 7.75 + 8.00 + 7.50 + 10.00 + 10.00 + 8.25 = **83.00**
- Fault penalty = 1 cup × 4 = **4**
- **Final Score = 83.00 – 4 = 79.00**

## Quality Score Interpretations

| Score Range | Quality Level |
|-------------|---------------|
| 90+ | Outstanding |
| 85-89 | Excellent |
| 80-84 | Very Good |
| 70-79 | Good |
| 60-69 | Fair |
| Below 60 | Poor |

## Protocol Notes

- This scoring system is based on the **2004 SCA Cupping Protocol**
- Each cup should be evaluated individually for defects
- Scores should be recorded in increments of 0.25 or 0.50 points
- The protocol emphasizes consistency across multiple cups of the same sample
- Professional cuppers typically evaluate 5 cups per sample to assess uniformity

---

# CVA Affective Assessment Scoring System

## Overview

The CVA (Coffee Value Assessment) Affective Assessment is an alternative scoring methodology that uses a 9-point hedonic scale to evaluate coffee quality. Unlike the SCA protocol's 6-10 point technical evaluation, CVA focuses on taster preference and impression of quality.

## CVA Sections and 9-Point Scale

Tasters evaluate eight sections, each on a **1–9 scale** where **5 = neutral liking**.

### CVA Evaluation Sections:
1. **Fragrance**
2. **Aroma**
3. **Flavor**
4. **Aftertaste**
5. **Acidity**
6. **Sweetness**
7. **Mouthfeel**
8. **Overall impression**

### Impression of Quality Scale:
- ① **Extremely low**
- ② **Very low**
- ③ **Moderately low**
- ④ **Slightly low**
- ⑤ **Neither high nor low** (neutral)
- ⑥ **Slightly high**
- ⑦ **Moderately high**
- ⑧ **Very high**
- ⑨ **Extremely high**

## CVA Scoring Formula

The CVA cupping score is calculated using the following equation, rounded to the nearest 0.25 points:

```
S = 0.65625 × Σhi + 52.75 - 2u - 4d
```

**Where:**
- **S** is the cupping score prior to rounding
- **hi** is the 9-point score of each affective section, from i = 1 (fragrance) to i = 8 (overall)
- **u** is the number of non-uniform cups
- **d** is the number of defective cups

## CVA Defects & Uniformity

### Defective Cups
Cups scored as **moldy**, **phenolic**, or **potato**.

### Non-uniform Cups  
Cups exhibiting any qualitatively different characteristic.

### Penalties
- **–2 points** per non-uniform cup
- **–4 points** per defective cup

## CVA Example Calculation

An assessor rates one coffee (five cups) as follows, with one faulty (moldy) cup (#3) and no non-uniform cups:

| Section | Score (1–9) |
|---------|-------------|
| Fragrance | 8 |
| Aroma | 7 |
| Flavor | 8 |
| Aftertaste | 7 |
| Acidity | 6 |
| Sweetness | 6 |
| Mouthfeel | 7 |
| Overall | 8 |

**Calculation Steps:**
1. **Sum of section scores**: 8+7+8+7+6+6+7+8 = **57**
2. **Defective cups** d = 1 → penalty = **4**
3. **Non-uniform cups** u = 0 → penalty = **0**

**CVA Formula Application:**
- Raw calculation: S = 0.65625 × 57 + 52.75 - 2(0) - 4(1)
- S = 37.41 + 52.75 - 0 - 4 = **86.16**
- Alternative method: Two-way table lookup for Σ=57 gives 87.50 before penalties
- After penalties: 87.50 - 4 = **83.50**

**Thus, CVA Affective Score = 83.50**

## CVA Quality Score Interpretations

| Score Range | Quality Level |
|-------------|---------------|
| 90+ | Exceptional Quality |
| 85-89 | Excellent Quality |
| 80-84 | Very High Quality |
| 75-79 | High Quality |
| 70-74 | Good Quality |
| 65-69 | Acceptable Quality |
| Below 65 | Below Standard |

---

# Methodology Comparison

## SCA vs CVA Key Differences

| Aspect | SCA Cupping Protocol | CVA Affective Assessment |
|--------|---------------------|-------------------------|
| **Scale** | 6.00-10.00 points | 1-9 points |
| **Focus** | Technical quality evaluation | Preference and liking |
| **Sections** | 10 attributes | 8 sections |
| **Neutral Point** | 6.00 (minimum quality) | 5 (neither high nor low) |
| **Formula** | Simple summation | Weighted calculation |
| **Range** | 60-100 | ~58-100 |

Both methodologies provide valuable insights into coffee quality, with SCA focusing on technical standards and CVA emphasizing taster preference and affective response.

---

*References: Specialty Coffee Association (SCA) 2004 Cupping Protocol & CVA Affective Assessment Methodology*