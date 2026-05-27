# Celeva — Brand Identity Guide

> Elegant Wedding Photography & Experience Platform

---

## Brand Overview

**Brand Name:** Celeva  
**Tone:** Warm, luxurious, romantic, timeless  
**Aesthetic:** Soft elegance — cream and gold tones with editorial serif typography and delicate watercolor florals  
**Target Audience:** Couples and their wedding guests — premium wedding experience

---

## Color Palette

### Core UI Colors (CSS Custom Properties)

| Token | HSL | Hex Approx | Usage |
|---|---|---|---|
| `--background` | `45 35% 96.5%` | `#F9F4ED` | Page background (warm cream) |
| `--foreground` | `25 20% 25%` | `#3D3228` | Body text (dark brown) |
| `--card` | `45 35% 98%` | `#FCFBF9` | Card/panel background (off-white) |
| `--primary` | `45 58% 59%` | `#C4A574` | Buttons, active states, highlights (warm gold/tan) |
| `--primary-foreground` | `25 20% 15%` | `#2A1F12` | Text on primary color (deep brown) |
| `--secondary` | `45 25% 88%` | `#E8E0D6` | Secondary backgrounds (light tan) |
| `--muted` | `45 20% 92%` | `#EAE5E0` | Muted surfaces, skeletons (pale beige) |
| `--muted-foreground` | `25 15% 55%` | `#7A6B5D` | Secondary text, placeholders (medium brown) |
| `--border` | `45 15% 85%` | `#D9CFBE` | Borders and dividers (light tan) |
| `--ring` | `45 58% 59%` | `#C4A574` | Focus rings (matches primary) |
| `--destructive` | `0 84.2% 60.2%` | `#F87171` | Error states (soft red) |

### Footer Accent Colors (Hardcoded)

| Usage | Hex |
|---|---|
| Footer background | `#FBF9F3` |
| Footer text / brand name | `#6e5c51` |
| Footer border | `#e6ded3` |

### Wedding Color Themes (Accent Overlays)

Applied via CSS variables when a wedding selects a theme color:

| Theme | Pastel | On-Color |
|---|---|---|
| Blue | `#D6E4F7` | `#1a2e45` |
| Burgundy | `#C9908A` | `#4a0e0e` |
| Green | `#9db3a1` | `#0d3d1f` |
| Pink | `#FFE4F0` | `#4a1535` |
| Purple | `#E8E0FF` | `#3d2a6e` |
| Salmon | `#FFD4C2` | `#6b2010` |

---

## Typography

### Font Stack

| Tailwind Class | Font Family | Purpose |
|---|---|---|
| `font-cursive` | **Imperial Script** | Hero couple names |
| `font-elegant` | **Great Vibes** | Decorative headings, "Our Love Story" |
| `font-script` | **Herr Von Muellerhoff** | Decorative script accents |
| `font-imperial` | **Imperial Script** | Entourage / section titles |
| `font-savate` | **Savate** | Wedding date display |
| `font-serifElegant` | **Cormorant Garamond** | Elegant serif body/headings |
| `font-story` | **Lora** | Story / editorial body text |
| `font-serifName` | **DM Serif Text** | Names, brand wordmark |
| *(default body)* | **Nunito** | UI body text (sans-serif) |
| *(headings h1–h6)* | **Lilita One** | Display headings |

### Type Scale Used in GuestPhoto

| Context | Tailwind | Notes |
|---|---|---|
| Page title | `text-4xl md:text-5xl` | Hero header |
| Section heading | `text-lg font-medium` | Navigation, subsections |
| Subtitle | `text-xl` | Descriptive subtitle |
| Body / helper | `text-sm` | File names, descriptions |
| Meta / timestamps | `text-xs` | Captions, metadata |

---

## UI Component Patterns

### Buttons

**Primary Button**
```
bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium
hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors
```

**Destructive / Remove Button**
```
px-2 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs rounded
```

**Ghost / Text Button**
```
text-sm text-muted-foreground hover:text-foreground transition-colors
```

### Cards / Panels
```
bg-card rounded-xl shadow-sm border border-border p-8 md:p-12
```

### Navigation Bar
```
bg-card shadow-sm border-b border-border sticky top-0 z-40 backdrop-blur-sm
```
Active link: `text-primary border-b-2 border-primary`  
Inactive link: `text-muted-foreground border-b-2 border-transparent`

### Upload Drop Zone
```
border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
Active drag: border-primary bg-primary/5 scale-[1.02]
Default: border-border hover:border-primary/50 hover:bg-primary/5
```

### Image Gallery (Masonry)
```
columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-4
```
Image card: `rounded-lg shadow-sm hover:shadow-lg border border-border group-hover:scale-[1.02]`

### Lightbox Overlay
```
fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4
```

### Badge / Pill
```
inline-flex items-center bg-primary/10 text-primary px-4 py-2
rounded-full text-sm font-medium border border-primary/20
```

### Progress Bar
```
Track: w-full bg-muted rounded-full h-2
Fill: bg-primary rounded-full h-2 (uploading)
```

### Error / Alert Block
```
bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive
```

### Loading Spinner
```
w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin
```

### Empty State
```
text-center py-16
Icon container: w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center
```

---

## Spacing & Layout

| Token | Value |
|---|---|
| Border radius (base) | `0.5rem` (8px) via `--radius` |
| Container max-width (upload) | `max-w-4xl` |
| Container max-width (gallery) | `max-w-7xl` |
| Section spacing | `mb-12` |
| Card padding | `p-8 md:p-12` |
| Compact card padding | `p-6 md:p-8` |
| Item padding | `p-4` |

---

## Animations & Interactions

| Effect | Class / Property |
|---|---|
| Image fade-in | `fadeIn 0.5s ease-in-out` (custom keyframe) |
| Image hover zoom | `hover:scale-105` |
| Card hover scale | `group-hover:scale-[1.02]` |
| Drag-over scale | `scale-[1.02]` |
| Skeleton pulse | `animate-pulse` |
| Spinner | `animate-spin` |
| Hover overlay | `bg-gradient-to-t from-black/20 to-transparent` |
| Color/state transitions | `transition-all duration-200` / `duration-300` |

---

## Decorative Elements

### Watercolor Background
- File: `/materials/ColorThemed/[Theme]/WaterColorBG.png`
- CSS Class: `.themed-watercolor`
- Overlay: `rgba(255,255,255,0.50)` tint on top of image

### Floral Illustration
- File: `/materials/ColorThemed/[Theme]/FlowerIC.png`
- CSS Class: `.themed-flower-top-right::after` (pinned top-right corner)
- Size: `clamp(320px, 38vw, 560px)` — responsive, smaller on mobile
- Opacity: `0.9`

### Icons (Lucide React)
All iconography uses **Lucide React** — consistent stroke-based icon set:
`Camera`, `Images`, `Upload`, `Image`, `CheckCircle`, `AlertCircle`, `X`,
`ChevronLeft`, `ChevronRight`, `Sparkles`, `Lock`, `CalendarOff`, `RefreshCw`

---

## Brand Voice

- **Warm & intimate** — speaks to couples and their guests personally
- **Elegant, not cold** — formal enough to feel premium, soft enough to feel inviting
- **Minimal text** — let the photography and names speak; UI stays out of the way
- **Celebratory** — moments, memories, milestones

---

## Wordmark

The brand name **Celeva** is rendered in:
- Font: `DM Serif Text` (`font-serifName`)
- Color: `#6e5c51` (warm brown)
- Context: Footer copyright line

---

*Last updated: May 2026*
