# Design Tokens Reference

This document provides a comprehensive reference for all design tokens mapped to Tailwind CSS utility classes.

> [!TIP]
> All tokens are defined in `styles/tokens.css` and mapped in `app/globals.css`

---

## 🎨 Brand Colors

| Token                     | Tailwind Class                               | Value     |
| ------------------------- | -------------------------------------------- | --------- |
| `--color-brand-primary`   | `bg-brand-primary`, `text-brand-primary`     | `#1e7d55` |
| `--color-brand-secondary` | `bg-brand-secondary`, `text-brand-secondary` | `#80d897` |
| `--color-brand-surface`   | `bg-brand-surface`                           | `#faf9e5` |
| `--color-brand-text-dark` | `text-brand-text-dark`                       | `#05010e` |

**Usage:**

```jsx
<button className="bg-brand-primary text-white hover:bg-brand-secondary">
  Primary Button
</button>
```

---

## ⚠️ Semantic Colors

| Token                             | Tailwind Class                                   | Value     | Use Case        |
| --------------------------------- | ------------------------------------------------ | --------- | --------------- |
| `--color-semantic-critical`       | `bg-semantic-critical`, `text-semantic-critical` | `#f21515` | Errors          |
| `--color-semantic-critical-hover` | `hover:bg-semantic-critical-hover`               | `#c71b1b` | Error hover     |
| `--color-semantic-success`        | `bg-semantic-success`, `text-semantic-success`   | `#95c135` | Success states  |
| `--color-semantic-success-hover`  | `hover:bg-semantic-success-hover`                | `#7aa125` | Success hover   |
| `--color-semantic-warning`        | `bg-semantic-warning`, `text-semantic-warning`   | `#f1be25` | Warnings        |
| `--color-semantic-warning-hover`  | `hover:bg-semantic-warning-hover`                | `#ad8306` | Warning hover   |
| `--color-semantic-neutral`        | `bg-semantic-neutral`, `text-semantic-neutral`   | `#707993` | Neutral/muted   |
| `--color-semantic-verified`       | `bg-semantic-verified`, `text-semantic-verified` | `#6982e1` | Verified badges |

**Usage:**

```jsx
<span className="text-semantic-critical">Error: Invalid input</span>
<span className="text-semantic-success">Success!</span>
<span className="bg-semantic-warning text-black px-2 rounded">Warning</span>
```

---

## 📊 Status Colors

| Token                    | Tailwind Class      | Value     | Use Case        |
| ------------------------ | ------------------- | --------- | --------------- |
| `--color-status-default` | `bg-status-default` | `#8df0ff` | Default state   |
| `--color-status-stable`  | `bg-status-stable`  | `#95c135` | Stable/active   |
| `--color-status-warning` | `bg-status-warning` | `#f8842d` | Warning state   |
| `--color-status-danger`  | `bg-status-danger`  | `#991d1d` | Danger/critical |

**Usage:**

```jsx
<span className="bg-status-stable text-white px-2 py-1 rounded-full text-xs">
  Active
</span>
```

---

## ✍️ Text Colors

| Token                      | Tailwind Class          | Light Mode | Dark Mode |
| -------------------------- | ----------------------- | ---------- | --------- |
| `--color-text-primary`     | `text-text-primary`     | `#060d26`  | `#fcfcff` |
| `--color-text-secondary`   | `text-text-secondary`   | `#1e7d55`  | `#80d897` |
| `--color-text-tertiary`    | `text-text-tertiary`    | `#475272`  | `#c8cedd` |
| `--color-text-placeholder` | `text-text-placeholder` | `#707993`  | -         |
| `--color-text-disable`     | `text-text-disable`     | `#c8cedd`  | -         |
| `--color-text-critical`    | `text-text-critical`    | `#f21515`  | `#ffa9a9` |
| `--color-text-tags`        | `text-text-tags`        | `#a9edb9`  | -         |

**Usage:**

```jsx
<h1 className="text-text-primary">Main Title</h1>
<p className="text-text-secondary">Subtitle</p>
<span className="text-text-placeholder">Hint text...</span>
```

---

## 🔲 Border Colors

| Token                     | Tailwind Class           | Value     |
| ------------------------- | ------------------------ | --------- |
| `--color-border-default`  | `border-border-default`  | `#a9edb9` |
| `--color-border-hover`    | `border-border-hover`    | `#80d897` |
| `--color-border-neutral`  | `border-border-neutral`  | `#c8cedd` |
| `--color-border-critical` | `border-border-critical` | `#f21515` |
| `--color-border-disable`  | `border-border-disable`  | `#c8cedd` |
| `--color-border-tags`     | `border-border-tags`     | `#a9edb9` |

**Usage:**

```jsx
<input className="border border-border-neutral focus:border-border-default" />
<div className="border-2 border-border-critical">Error state</div>
```

---

## 🔘 Button Colors

| Token                 | Tailwind Class       | Value     |
| --------------------- | -------------------- | --------- |
| `--color-btn-primary` | `bg-btn-primary`     | `#1e7d55` |
| `--color-btn-hover`   | `hover:bg-btn-hover` | `#80d897` |
| `--color-btn-default` | `bg-btn-default`     | `#fcfcff` |

**Usage:**

```jsx
<button className="bg-btn-primary hover:bg-btn-hover text-white">Submit</button>
```

---

## 🎯 Icon Colors

| Token                         | Tailwind Class             | Value     | Use Case        |
| ----------------------------- | -------------------------- | --------- | --------------- |
| `--color-icon-default`        | `text-icon-default`        | `#05010e` | Default icons   |
| `--color-icon-hover`          | `text-icon-hover`          | `#1e7d55` | Hover state     |
| `--color-icon-water`          | `text-icon-water`          | `#13a8bf` | Water module    |
| `--color-icon-water-hover`    | `text-icon-water-hover`    | `#008296` | Water hover     |
| `--color-icon-tax`            | `text-icon-tax`            | `#475272` | Tax module      |
| `--color-icon-tax-hover`      | `text-icon-tax-hover`      | `#182342` | Tax hover       |
| `--color-icon-security`       | `text-icon-security`       | `#b37abb` | Security module |
| `--color-icon-security-hover` | `text-icon-security-hover` | `#502f55` | Security hover  |
| `--color-icon-success`        | `text-icon-success`        | `#95c135` | Success         |
| `--color-icon-warning`        | `text-icon-warning`        | `#f1be25` | Warning         |
| `--color-icon-critical`       | `text-icon-critical`       | `#f21515` | Critical/error  |

**Usage:**

```jsx
<WaterIcon className="text-icon-water hover:text-icon-water-hover" />
<TaxIcon className="text-icon-tax hover:text-icon-tax-hover" />
```

---

## 📝 Text Field Colors

| Token                        | Tailwind Class          | Value     |
| ---------------------------- | ----------------------- | --------- |
| `--color-field-default`      | `bg-field-default`      | `#fcfcff` |
| `--color-field-default-dark` | `bg-field-default-dark` | `#060d26` |
| `--color-field-disable`      | `bg-field-disable`      | `#ebedf5` |

**Usage:**

```jsx
<input className="bg-field-default disabled:bg-field-disable" />
```

---

## 🍎 Foundation Palettes

### Apple Pallet (Green)

| Shade  | Class             | Value     |
| ------ | ----------------- | --------- |
| dark   | `bg-apple-dark`   | `#1e7d55` |
| darker | `bg-apple-darker` | `#05010e` |
| light  | `bg-apple-light`  | `#faf9e5` |
| medium | `bg-apple-medium` | `#80d897` |
| soft   | `bg-apple-soft`   | `#a9edb9` |

### Sky Blue Pallet

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

### Fuji Pallet (Gray)

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

### Fuan Pallet (Red)

| Shade       | Class                 | Value     |
| ----------- | --------------------- | --------- |
| light       | `bg-fuan-light`       | `#ffd2d2` |
| soft        | `bg-fuan-soft`        | `#ffa9a9` |
| soft-medium | `bg-fuan-soft-medium` | `#ff6060` |
| medium      | `bg-fuan-medium`      | `#f21515` |
| medium-dark | `bg-fuan-medium-dark` | `#c71b1b` |
| dark        | `bg-fuan-dark`        | `#991d1d` |
| darker      | `bg-fuan-darker`      | `#540d0d` |

### Take Pallet (Green)

| Shade       | Class                 | Value     |
| ----------- | --------------------- | --------- |
| light       | `bg-take-light`       | `#f1ffd3` |
| soft        | `bg-take-soft`        | `#d4eca1` |
| soft-medium | `bg-take-soft-medium` | `#afd461` |
| medium      | `bg-take-medium`      | `#95c135` |
| medium-dark | `bg-take-medium-dark` | `#7aa125` |
| dark        | `bg-take-dark`        | `#557909` |
| darker      | `bg-take-darker`      | `#314604` |

### Saffron Pallet (Yellow)

| Shade       | Class                    | Value     |
| ----------- | ------------------------ | --------- |
| light       | `bg-saffron-light`       | `#fff9e9` |
| light-soft  | `bg-saffron-light-soft`  | `#ffe9a8` |
| soft        | `bg-saffron-soft`        | `#ffd968` |
| medium      | `bg-saffron-medium`      | `#f1be25` |
| medium-dark | `bg-saffron-medium-dark` | `#ad8306` |
| dark        | `bg-saffron-dark`        | `#694f00` |

### Moody Blue Pallet

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

### Other Palettes

- **Orange**: `bg-orange-light`, `bg-orange-medium`, `bg-orange-soft`, `bg-orange-pink`, `bg-orange-red`
- **Purple**: `bg-purple-dark`, `bg-purple-medium`, `bg-purple-soft`
- **Wisteria**: `bg-wisteria-dark`, `bg-wisteria-light`, `bg-wisteria-medium`, `bg-wisteria-soft`
- **Yellow**: `bg-yellow-light`, `bg-yellow-medium`, `bg-yellow-soft`
- **Glacier**: `bg-glacier-bright`, `bg-glacier-light`, `bg-glacier-dark`, etc.
- **Crustae**: `bg-crustae-dark`, `bg-crustae-light`, `bg-crustae-medium`, etc.
- **Blue**: `bg-blue-dark`, `bg-blue-medium`, `bg-blue-soft`, etc.

---

## 📏 Spacing

| Token          | Tailwind Class           | Value  |
| -------------- | ------------------------ | ------ |
| `--spacing-1x` | `p-1x`, `m-1x`, `gap-1x` | `8px`  |
| `--spacing-2x` | `p-2x`, `m-2x`, `gap-2x` | `16px` |
| `--spacing-3x` | `p-3x`, `m-3x`, `gap-3x` | `24px` |
| `--spacing-4x` | `p-4x`, `m-4x`, `gap-4x` | `32px` |

**Usage:**

```jsx
<div className="p-3x gap-2x flex">
  <div className="m-1x">Item</div>
</div>
```

---

## 🔵 Border Radius

| Token                  | Tailwind Class        | Value   |
| ---------------------- | --------------------- | ------- |
| `--radius-circle`      | `rounded-circle`      | `100px` |
| `--radius-square`      | `rounded-square`      | `8px`   |
| `--radius-square-hard` | `rounded-square-hard` | `16px`  |

**Usage:**

```jsx
<div className="rounded-square bg-brand-primary">Card</div>
<span className="rounded-circle bg-status-stable">Badge</span>
```

---

## 🌓 Shadows

| Token                    | Tailwind Class         | Description       |
| ------------------------ | ---------------------- | ----------------- |
| `--shadow-smooth-low`    | `shadow-smooth-low`    | Subtle elevation  |
| `--shadow-smooth-medium` | `shadow-smooth-medium` | Standard cards    |
| `--shadow-smooth-high`   | `shadow-smooth-high`   | Modals, dropdowns |

**Usage:**

```jsx
<div className="shadow-smooth-low bg-white rounded-square p-3x">
  Low elevation card
</div>
<div className="shadow-smooth-medium bg-white rounded-square-hard p-3x">
  Medium elevation card
</div>
```

---

## 🌙 Dark Mode

Dark mode is automatically handled when `.dark` class is on a parent element:

```jsx
// In your layout or root component
<html className={isDark ? "dark" : ""}>...</html>
```

These tokens automatically switch in dark mode:

- `text-text-primary` → uses `--color-alias-text-colors-primary-dark`
- `text-text-secondary` → uses `--color-alias-text-colors-secondary-dark`
- `border-border-default` → uses `--color-border-colors-default-dark`
- `text-icon-default` → uses `--color-icon-color-default-dark`
- Shadows → use darker variants with increased opacity

---

## 📚 Typography Classes

Typography classes are defined in `styles/typography.css`:

| Class                    | Description            |
| ------------------------ | ---------------------- |
| `.typo-h1`               | Heading 1 (responsive) |
| `.typo-h2`               | Heading 2 (responsive) |
| `.typo-h3`               | Heading 3 (responsive) |
| `.typo-body`             | Body text (responsive) |
| `.typo-sub`              | Subtitle (responsive)  |
| `.typo-button`           | Button text            |
| `.typo-button-sm`        | Small button text      |
| `.typo-menu`             | Menu/nav text          |
| `.typo-tags`             | Tags/labels            |
| `.typo-logo`             | Logo text              |
| `.typo-text-button`      | Text button/link       |
| `.typo-text-button-line` | Underlined link        |
| `.typo-discount`         | Discount badge         |

**Usage:**

```jsx
<h1 className="typo-h1 text-text-primary">Page Title</h1>
<p className="typo-body text-text-tertiary">Description text</p>
<button className="typo-button-sm bg-btn-primary">Click</button>
```

---

## 🎬 Motion / Easing

| Token                  | Tailwind Class       | Description       |
| ---------------------- | -------------------- | ----------------- |
| `--ease-spring-snappy` | `ease-spring-snappy` | Quick, responsive |
| `--ease-spring`        | `ease-spring`        | Natural spring    |
| `--ease-spring-soft`   | `ease-spring-soft`   | Gentle spring     |

**Usage:**

```jsx
<div className="transition-transform duration-300 ease-spring hover:scale-105">
  Animated element
</div>
```
