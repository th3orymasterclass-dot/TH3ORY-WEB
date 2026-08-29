# 💎 TH3ORY — Complete Color Scheme Blueprint & Typography Design System

This document provides the complete technical design specification for **TH3ORY | Masterclass of Influencing**, including exact color hex codes from the enterprise blueprint, Google Font definitions, gradients, glassmorphism tokens, and CSS utility classes.

---

## 🎨 1. Complete Color Scheme Blueprint (17 Semantic Tokens)

| Role Name | Hex Code | Utility Token / CSS Var | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `#15171A` | `--color-primary-bg` | Main dark page background & canvas base |
| **Deep Void** | `#070A11` | `--color-deep-void` | HTML root base, modal backdrops, custom scrollbar track |
| **Panel** | `#0B0F19` | `--color-panel` | Glassmorphism cards, sidebar navigation, dialog modals |
| **Primary Text** | `#FAFAF7` | `--color-primary-text` | Main body text, primary titles, high-contrast headings |
| **Brand Violet** | `#7C5CFC` | `--color-brand-violet` | Primary interactive buttons, active tab indicators, brand accents |
| **Deep Violet** | `#6344E0` | `--color-deep-violet` | Bottom gradient shift stop for interactive CTA buttons |
| **Lavender** | `#E9E4FF` | `--color-lavender` | Sub-accent text, pill tags, delicate borders, highlight strokes |
| **Gold** | `#FFC857` | `--color-gold` | Star ratings, graduate certificates, luxury ribbons, pricing highlights |
| **Dark Gold** | `#E5AA30` | `--color-dark-gold` | Bottom gradient shift stop for gold badges and cards |
| **Muted** | `#555A66` | `--color-muted` | Secondary copy, metadata captions, scrollbar thumb |
| **Success** | `#10B981` | `--color-success` | Verified badges, live system status pulse, active SSL shield |
| **Info** | `#3B82F6` | `--color-info` | Information notices & technical tags |
| **Warning** | `#F59E0B` | `--color-warning` | Caution highlights & pending status |
| **Danger** | `#EF4444` | `--color-danger` | Error alerts & high-priority warnings |
| **Calm Blue** | `#60A5FA` | `--color-calm-blue` | Secondary information badges |
| **Teal** | `#14B8A6` | `--color-teal` | Specialty module badges & highlights |
| **Rose** | `#F472B6` | `--color-rose` | Testimonial highlights & interactive accents |

---

## ✒️ 2. Premium Typography System

Imported via Google Fonts in [`index.html`](file:///c:/Users/menta/OneDrive/Documents/Th3ory/index.html):

```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```

### Typography Hierarchy

| Font Family | CSS Specification | Utility Class | Purpose & Target Elements |
| :--- | :--- | :--- | :--- |
| **Cormorant Garamond** | `'Cormorant Garamond', Georgia, serif` | `.font-serif-luxury` | **High-Fashion Luxury Titles**: Hero subheadings, emphasis quotes, italic accents. |
| **Cinzel** | `'Cinzel', 'Cormorant Garamond', serif` | `.font-brand` | **Luxury Brand Monograms**: `TH3ORY` logo, monogram titles, badge icons. |
| **Outfit** | `'Outfit', 'Plus Jakarta Sans', sans-serif` | `.font-sans-ui` | **Primary UI & Copy**: Body text, form controls, buttons, subportal tabs. |
| **Space Grotesk** | `'Space Grotesk', 'Outfit', sans-serif` | `.font-heading` | **Headlines & Tech Display**: `h1`, `h2`, `h3`, section headers, counters. |

---

## 🌈 3. CSS Gradients, Glassmorphism & Design Tokens

Defined in [`src/index.css`](file:///c:/Users/menta/OneDrive/Documents/Th3ory/src/index.css):

### Text Gradients
```css
.text-gradient-violet {
  background: linear-gradient(135deg, #FAFAF7 0%, #E9E4FF 40%, #7C5CFC 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-gold {
  background: linear-gradient(135deg, #FAFAF7 0%, #FFC857 60%, #E5AA30 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-amber {
  background: linear-gradient(135deg, #FAFAF7 0%, #FFC857 50%, #7C5CFC 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Background Gradients & Glow Effects
```css
.bg-violet-gradient {
  background: linear-gradient(135deg, #7C5CFC 0%, #6344E0 100%);
}

.bg-gold-gradient {
  background: linear-gradient(135deg, #FFC857 0%, #E5AA30 100%);
}

.glow-violet {
  box-shadow: 0 0 40px -10px rgba(124, 92, 252, 0.38);
}

.glow-gold {
  box-shadow: 0 0 35px -8px rgba(255, 200, 87, 0.32);
}
```

### Glassmorphism Surface Tokens
```css
.glass-panel {
  background: rgba(11, 15, 25, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(233, 228, 255, 0.14);
}

.glass-card {
  background: rgba(11, 15, 25, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(233, 228, 255, 0.10);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-modal {
  background: rgba(7, 10, 17, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(233, 228, 255, 0.16);
}
```
