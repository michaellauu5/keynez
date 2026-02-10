

# Extend Logo Wood Background Full-Width

## What Changes
The header currently displays the Keynez logo as a small contained image (max 280px wide). The goal is to extend the wood-textured background from the logo to span the entire header width, while keeping the "Keynez AI" text in its current position.

## Approach
Use the logo image as the **header's background image** instead of (or in addition to) the current gradient. This stretches the wood texture across the full width while the text within the logo remains centered/positioned naturally.

## Technical Details

**File: `src/components/layout/Header.tsx`**

1. On the `<header>` element (line 46), replace the gradient background with the logo's wood texture as a background image:
   - Remove `bg-gradient-to-r from-primary/10 via-sky/5 to-accent/10`
   - Add inline style with `backgroundImage: url(keynezLogo)`, `backgroundSize: cover`, `backgroundPosition: center`
   - Keep `backdrop-blur` and `border-b` for polish

2. The `<img>` tag for the logo (lines 50-54) stays as-is so the "Keynez AI" text remains in its original position. The wood texture simply extends behind the entire nav bar.

**One file changed, two small edits (header className + inline style).**

