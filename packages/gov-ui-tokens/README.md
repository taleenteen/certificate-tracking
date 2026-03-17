# Gov UI Tokens

Design token reference for government e-services.

---

## Installation

```bash
npm install @gov-ui/tokens
```

```css
/* app/globals.css */
@import "@gov-ui/tokens/styles.css";
@import "tailwindcss";
```

---

## Table of Contents

- [Colors](#colors)
  - [Brand](#brand-colors)
  - [Semantic](#semantic-colors)
  - [Status](#status-colors)
  - [Text](#text-colors)
  - [Border](#border-colors)
  - [Button](#button-colors)
  - [Icon](#icon-colors)
  - [Field](#field-colors)
- [Color Palettes](#color-palettes)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Motion](#motion)
- [Dark Mode](#dark-mode)

---

## Colors

### Brand Colors

Primary brand identity colors.

| Token                     | Class                                       | Value     |
| ------------------------- | ------------------------------------------- | --------- |
| `--color-brand-primary`   | `bg-brand-primary` `text-brand-primary`     | `#1e7d55` |
| `--color-brand-secondary` | `bg-brand-secondary` `text-brand-secondary` | `#80d897` |
| `--color-brand-surface`   | `bg-brand-surface`                          | `#faf9e5` |
| `--color-brand-text-dark` | `text-brand-text-dark`                      | `#05010e` |

```tsx
<button className="bg-brand-primary text-white hover:bg-brand-secondary">
  Submit
</button>
```

---

### Semantic Colors

Colors that communicate meaning.

| Token                             | Class                                           | Value     | Use Case                    |
| --------------------------------- | ----------------------------------------------- | --------- | --------------------------- |
| `--color-semantic-critical`       | `bg-semantic-critical` `text-semantic-critical` | `#f21515` | Errors, destructive actions |
| `--color-semantic-critical-hover` | `hover:bg-semantic-critical-hover`              | `#c71b1b` | Error hover state           |
| `--color-semantic-success`        | `bg-semantic-success` `text-semantic-success`   | `#95c135` | Success states              |
| `--color-semantic-success-hover`  | `hover:bg-semantic-success-hover`               | `#7aa125` | Success hover state         |
| `--color-semantic-warning`        | `bg-semantic-warning` `text-semantic-warning`   | `#f1be25` | Warnings, cautions          |
| `--color-semantic-warning-hover`  | `hover:bg-semantic-warning-hover`               | `#ad8306` | Warning hover state         |
| `--color-semantic-neutral`        | `bg-semantic-neutral` `text-semantic-neutral`   | `#707993` | Neutral, muted content      |
| `--color-semantic-verified`       | `bg-semantic-verified` `text-semantic-verified` | `#6982e1` | Verification badges         |

```tsx
<span className="text-semantic-critical">Error: Invalid input</span>
<span className="text-semantic-success">Operation successful</span>
```

---

### Status Colors

Visual indicators for system states.

| Token                    | Class               | Value     | Use Case         |
| ------------------------ | ------------------- | --------- | ---------------- |
| `--color-status-default` | `bg-status-default` | `#8df0ff` | Default state    |
| `--color-status-stable`  | `bg-status-stable`  | `#95c135` | Active, stable   |
| `--color-status-warning` | `bg-status-warning` | `#f8842d` | Warning state    |
| `--color-status-danger`  | `bg-status-danger`  | `#991d1d` | Critical, danger |

```tsx
<span className="bg-status-stable text-white px-2 py-1 rounded-full text-xs">
  Active
</span>
```

---

### Text Colors

Hierarchical text colors with dark mode support.

| Token                      | Class                   | Light     | Dark      |
| -------------------------- | ----------------------- | --------- | --------- |
| `--color-text-primary`     | `text-text-primary`     | `#060d26` | `#fcfcff` |
| `--color-text-secondary`   | `text-text-secondary`   | `#1e7d55` | `#80d897` |
| `--color-text-tertiary`    | `text-text-tertiary`    | `#475272` | `#c8cedd` |
| `--color-text-placeholder` | `text-text-placeholder` | `#707993` | —         |
| `--color-text-disable`     | `text-text-disable`     | `#c8cedd` | —         |
| `--color-text-critical`    | `text-text-critical`    | `#f21515` | `#ffa9a9` |
| `--color-text-tags`        | `text-text-tags`        | `#a9edb9` | —         |

```tsx
<h1 className="text-text-primary">Main Title</h1>
<p className="text-text-secondary">Subtitle</p>
<span className="text-text-placeholder">Hint text...</span>
```

---

### Border Colors

| Token                     | Class                    | Value     |
| ------------------------- | ------------------------ | --------- |
| `--color-border-default`  | `border-border-default`  | `#a9edb9` |
| `--color-border-hover`    | `border-border-hover`    | `#80d897` |
| `--color-border-neutral`  | `border-border-neutral`  | `#c8cedd` |
| `--color-border-critical` | `border-border-critical` | `#f21515` |
| `--color-border-disable`  | `border-border-disable`  | `#c8cedd` |
| `--color-border-tags`     | `border-border-tags`     | `#a9edb9` |

```tsx
<input className="border border-border-neutral focus:border-border-default" />
<div className="border-2 border-border-critical">Error state</div>
```

---

### Button Colors

| Token                 | Class                | Value     |
| --------------------- | -------------------- | --------- |
| `--color-btn-primary` | `bg-btn-primary`     | `#1e7d55` |
| `--color-btn-hover`   | `hover:bg-btn-hover` | `#80d897` |
| `--color-btn-default` | `bg-btn-default`     | `#fcfcff` |

```tsx
<button className="bg-btn-primary hover:bg-btn-hover text-white">Submit</button>
```

---

### Icon Colors

Module-specific icon colors.

| Token                         | Class                      | Value     | Module         |
| ----------------------------- | -------------------------- | --------- | -------------- |
| `--color-icon-default`        | `text-icon-default`        | `#05010e` | Default        |
| `--color-icon-hover`          | `text-icon-hover`          | `#1e7d55` | Hover state    |
| `--color-icon-water`          | `text-icon-water`          | `#13a8bf` | Water          |
| `--color-icon-water-hover`    | `text-icon-water-hover`    | `#008296` | Water hover    |
| `--color-icon-tax`            | `text-icon-tax`            | `#475272` | Tax            |
| `--color-icon-tax-hover`      | `text-icon-tax-hover`      | `#182342` | Tax hover      |
| `--color-icon-security`       | `text-icon-security`       | `#b37abb` | Security       |
| `--color-icon-security-hover` | `text-icon-security-hover` | `#502f55` | Security hover |
| `--color-icon-success`        | `text-icon-success`        | `#95c135` | Success        |
| `--color-icon-warning`        | `text-icon-warning`        | `#f1be25` | Warning        |
| `--color-icon-critical`       | `text-icon-critical`       | `#f21515` | Critical       |

```tsx
<WaterIcon className="text-icon-water hover:text-icon-water-hover" />
<TaxIcon className="text-icon-tax hover:text-icon-tax-hover" />
```

---

### Field Colors

Input field backgrounds.

| Token                        | Class                   | Value     |
| ---------------------------- | ----------------------- | --------- |
| `--color-field-default`      | `bg-field-default`      | `#fcfcff` |
| `--color-field-default-dark` | `bg-field-default-dark` | `#060d26` |
| `--color-field-disable`      | `bg-field-disable`      | `#ebedf5` |

```tsx
<input className="bg-field-default disabled:bg-field-disable" />
```

---

## Color Palettes

Foundation color palettes for extended use cases.

### Apple (Green)

| Shade  | Class             | Value     |
| ------ | ----------------- | --------- |
| dark   | `bg-apple-dark`   | `#1e7d55` |
| darker | `bg-apple-darker` | `#05010e` |
| light  | `bg-apple-light`  | `#faf9e5` |
| medium | `bg-apple-medium` | `#80d897` |
| soft   | `bg-apple-soft`   | `#a9edb9` |

### Sky Blue

| Shade       | Class                | Value     |
| ----------- | -------------------- | --------- |
| bright      | `bg-sky-bright`      | `#edfcff` |
| light       | `bg-sky-light`       | `#cdf8ff` |
| light-soft  | `bg-sky-light-soft`  | `#adf4ff` |
| soft        | `bg-sky-soft`        | `#8df0ff` |
| soft-medium | `bg-sky-soft-medium` | `#6debff` |
| medium      | `bg-sky-medium`      | `#4de7ff` |
| medium-dark | `bg-sky-medium-dark` | `#2fcfe8` |
| dark        | `bg-sky-dark`        | `#13a8bf` |
| dark-darker | `bg-sky-dark-darker` | `#008296` |
| darker      | `bg-sky-darker`      | `#005f6d` |

### Fuji (Gray)

| Shade       | Class                 | Value     |
| ----------- | --------------------- | --------- |
| bright      | `bg-fuji-bright`      | `#fcfcff` |
| light       | `bg-fuji-light`       | `#ebedf5` |
| soft        | `bg-fuji-soft`        | `#c8cedd` |
| soft-medium | `bg-fuji-soft-medium` | `#707993` |
| medium      | `bg-fuji-medium`      | `#475272` |
| medium-dark | `bg-fuji-medium-dark` | `#252f4a` |
| dark        | `bg-fuji-dark`        | `#182342` |
| darker      | `bg-fuji-darker`      | `#060d26` |

### Fuan (Red)

| Shade       | Class                 | Value     |
| ----------- | --------------------- | --------- |
| light       | `bg-fuan-light`       | `#ffd2d2` |
| soft        | `bg-fuan-soft`        | `#ffa9a9` |
| soft-medium | `bg-fuan-soft-medium` | `#ff6060` |
| medium      | `bg-fuan-medium`      | `#f21515` |
| medium-dark | `bg-fuan-medium-dark` | `#c71b1b` |
| dark        | `bg-fuan-dark`        | `#991d1d` |
| darker      | `bg-fuan-darker`      | `#540d0d` |

### Take (Green)

| Shade       | Class                 | Value     |
| ----------- | --------------------- | --------- |
| light       | `bg-take-light`       | `#f1ffd3` |
| soft        | `bg-take-soft`        | `#d4eca1` |
| soft-medium | `bg-take-soft-medium` | `#afd461` |
| medium      | `bg-take-medium`      | `#95c135` |
| medium-dark | `bg-take-medium-dark` | `#7aa125` |
| dark        | `bg-take-dark`        | `#557909` |
| darker      | `bg-take-darker`      | `#314604` |

### Saffron (Yellow)

| Shade       | Class                    | Value     |
| ----------- | ------------------------ | --------- |
| light       | `bg-saffron-light`       | `#fff9e9` |
| light-soft  | `bg-saffron-light-soft`  | `#ffe9a8` |
| soft        | `bg-saffron-soft`        | `#ffd968` |
| medium      | `bg-saffron-medium`      | `#f1be25` |
| medium-dark | `bg-saffron-medium-dark` | `#ad8306` |
| dark        | `bg-saffron-dark`        | `#694f00` |

### Moody Blue

| Shade       | Class                  | Value     |
| ----------- | ---------------------- | --------- |
| bright      | `bg-moody-bright`      | `#f3f5ff` |
| light       | `bg-moody-light`       | `#d7dfff` |
| light-soft  | `bg-moody-light-soft`  | `#bccaff` |
| soft        | `bg-moody-soft`        | `#a0b4ff` |
| soft-medium | `bg-moody-soft-medium` | `#859eff` |
| medium      | `bg-moody-medium`      | `#6982e1` |
| medium-dark | `bg-moody-medium-dark` | `#4f67bf` |
| dark        | `bg-moody-dark`        | `#26387b` |
| dark-darker | `bg-moody-dark-darker` | `#172559` |
| darker      | `bg-moody-darker`      | `#182342` |

### Additional Palettes

**Orange**

- `bg-orange-light` `#ffb381`
- `bg-orange-medium` `#f8842d`
- `bg-orange-soft` `#fb8b07`
- `bg-orange-pink` `#ff5558`
- `bg-orange-red` `#fe4d01`

**Purple**

- `bg-purple-dark` `#390f37`
- `bg-purple-medium` `#815288`
- `bg-purple-soft` `#bd9fd1`

**Wisteria**

- `bg-wisteria-dark` `#502f55`
- `bg-wisteria-light` `#fef7ff`
- `bg-wisteria-light-soft` `#f2cff7`
- `bg-wisteria-medium` `#b37abb`
- `bg-wisteria-medium-dark` `#815288`
- `bg-wisteria-soft` `#e5a8ee`

**Glacier**

- `bg-glacier-bright` `#f8fcff`
- `bg-glacier-light` `#dcf1ff`
- `bg-glacier-light-soft` `#c0e5ff`
- `bg-glacier-soft` `#afd4ef`
- `bg-glacier-soft-medium` `#98bcd5`
- `bg-glacier-medium` `#82a4bb`
- `bg-glacier-medium-dark` `#6d8ca2`
- `bg-glacier-dark` `#597588`
- `bg-glacier-dark-darker` `#465e6f`
- `bg-glacier-darker` `#344856`

**Crustae**

- `bg-crustae-dark` `#703000`
- `bg-crustae-light` `#fff3ea`
- `bg-crustae-light-soft` `#ffcfab`
- `bg-crustae-medium` `#f8842d`
- `bg-crustae-medium-dark` `#b4540d`
- `bg-crustae-soft` `#ffab6d`

**Blue**

- `bg-blue-dark` `#042d8b`
- `bg-blue-darker` `#010006`
- `bg-blue-medium` `#008296`
- `bg-blue-medium-dark` `#394e9d`
- `bg-blue-soft` `#98bcd5`
- `bg-blue-soft-medium` `#71c9d5`

**Yellow**

- `bg-yellow-light` `#ede9da`
- `bg-yellow-medium` `#f1be25`
- `bg-yellow-medium-dark` `#eabf23`
- `bg-yellow-soft` `#f1dca7`
- `bg-yellow-soft-medium` `#dbbd7e`

---

## Typography

Responsive typography classes defined in `typography.css`.

| Class                    | Description                                  |
| ------------------------ | -------------------------------------------- |
| `.typo-h1`               | Heading 1 (56px desktop, 36px mobile)        |
| `.typo-h2`               | Heading 2 (48px desktop, 28px mobile)        |
| `.typo-h3`               | Heading 3 (36px desktop, 24px mobile)        |
| `.typo-sub`              | Subtitle (28px desktop, 16px mobile)         |
| `.typo-body`             | Body text (16px)                             |
| `.typo-button`           | Button text (24px desktop, 16px mobile)      |
| `.typo-button-sm`        | Small button (20px desktop, 16px mobile)     |
| `.typo-menu`             | Menu/navigation (16px desktop, 14px mobile)  |
| `.typo-tags`             | Tags/labels (16px desktop, 14px mobile)      |
| `.typo-logo`             | Logo text (18px desktop, 16px mobile)        |
| `.typo-text-button`      | Text button/link (14px desktop, 12px mobile) |
| `.typo-text-button-line` | Underlined link                              |
| `.typo-discount`         | Discount badge (16px, medium weight)         |

```tsx
<h1 className="typo-h1 text-text-primary">Page Title</h1>
<p className="typo-body text-text-tertiary">Description text</p>
<button className="typo-button-sm bg-btn-primary">Click</button>
```

---

## Spacing

Consistent spacing scale using 8px base unit.

| Token          | Classes                                                                                                | Value  |
| -------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| `--spacing-1x` | `p-1x` `m-1x` `gap-1x` `px-1x` `py-1x` `pt-1x` `pr-1x` `pb-1x` `pl-1x` `mt-1x` `mr-1x` `mb-1x` `ml-1x` | `8px`  |
| `--spacing-2x` | `p-2x` `m-2x` `gap-2x` ...                                                                             | `16px` |
| `--spacing-3x` | `p-3x` `m-3x` `gap-3x` ...                                                                             | `24px` |
| `--spacing-4x` | `p-4x` `m-4x` `gap-4x` ...                                                                             | `32px` |

```tsx
<div className="p-3x gap-2x flex">
  <div className="m-1x">Item</div>
</div>
```

---

## Border Radius

| Token                  | Class                 | Value   |
| ---------------------- | --------------------- | ------- |
| `--radius-circle`      | `rounded-circle`      | `100px` |
| `--radius-square`      | `rounded-square`      | `8px`   |
| `--radius-square-hard` | `rounded-square-hard` | `16px`  |

```tsx
<div className="rounded-square bg-brand-primary">Card</div>
<span className="rounded-circle bg-status-stable">Badge</span>
```

---

## Shadows

Multi-layer shadows with automatic dark mode adjustment.

| Token                    | Class                  | Use Case                          |
| ------------------------ | ---------------------- | --------------------------------- |
| `--shadow-smooth-low`    | `shadow-smooth-low`    | Subtle elevation, cards at rest   |
| `--shadow-smooth-medium` | `shadow-smooth-medium` | Standard cards, raised components |
| `--shadow-smooth-high`   | `shadow-smooth-high`   | Modals, dropdowns, overlays       |

```tsx
<div className="shadow-smooth-low bg-white rounded-square p-3x">
  Low elevation card
</div>
<div className="shadow-smooth-medium bg-white rounded-square-hard p-3x">
  Medium elevation card
</div>
<div className="shadow-smooth-high bg-white rounded-square-hard p-3x">
  High elevation modal
</div>
```

---

## Motion

Spring-based easing functions for natural animations.

| Token                  | Class                | Character                            |
| ---------------------- | -------------------- | ------------------------------------ |
| `--ease-spring-snappy` | `ease-spring-snappy` | Quick, responsive micro-interactions |
| `--ease-spring`        | `ease-spring`        | Natural spring, general purpose      |
| `--ease-spring-soft`   | `ease-spring-soft`   | Gentle, extended spring motion       |

```tsx
<div className="transition-transform duration-300 ease-spring hover:scale-105">
  Animated element
</div>
```

---

## Dark Mode

Dark mode is activated by adding the `.dark` class to a parent element.

```tsx
<html className={isDark ? "dark" : ""}>...</html>
```

### Automatic Token Switching

The following tokens automatically switch values in dark mode:

| Token                   | Light Value | Dark Value |
| ----------------------- | ----------- | ---------- |
| `text-text-primary`     | `#060d26`   | `#fcfcff`  |
| `text-text-secondary`   | `#1e7d55`   | `#80d897`  |
| `text-text-tertiary`    | `#475272`   | `#c8cedd`  |
| `text-text-critical`    | `#f21515`   | `#ffa9a9`  |
| `border-border-default` | `#a9edb9`   | `#80d897`  |
| `text-icon-default`     | `#05010e`   | `#fcfcff`  |
| `bg-field-default`      | `#fcfcff`   | `#060d26`  |

Shadow opacity is increased in dark mode for better visibility.

---

## Quick Reference

### Common Patterns

**Card Component**

```tsx
<div className="bg-white rounded-square-hard shadow-smooth-medium p-3x">
  <h3 className="typo-h3 text-text-primary">Title</h3>
  <p className="typo-body text-text-tertiary">Content</p>
</div>
```

**Primary Button**

```tsx
<button className="bg-btn-primary hover:bg-btn-hover text-white typo-button-sm px-3x py-2x rounded-square">
  Submit
</button>
```

**Status Badge**

```tsx
<span className="bg-status-stable text-white typo-tags px-2x py-1x rounded-circle">
  Active
</span>
```

**Input Field**

```tsx
<input
  className="bg-field-default border border-border-neutral focus:border-border-default rounded-square p-2x typo-body text-text-primary placeholder:text-text-placeholder"
  placeholder="Enter value..."
/>
```

**Alert Message**

```tsx
<div className="bg-fuan-light border border-border-critical rounded-square p-3x">
  <p className="text-semantic-critical typo-body">Error message</p>
</div>
```
