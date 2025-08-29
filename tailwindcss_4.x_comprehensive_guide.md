# Tailwind CSS 4.x - Comprehensive Guide and Breaking Changes

## Introduction

Tailwind CSS 4.x introduces several new utilities, changes to existing utilities, and important breaking changes. This guide summarizes the most critical updates, new features, and modifications needed for upgrading and adopting Tailwind CSS 4.x.

---

## Major Changes and Features

### 1. Utility Renaming and Scale Changes
- Shadow utilities: `shadow-sm` is renamed to `shadow-xs`, while `shadow` is now `shadow-sm`. The old names are still supported for backward compatibility.
- Radius and Blur utilities: The scale names are more consistent.

### 2. New Utilities and Features
- `break-after-column`, `break-before-column`, and `break-inside-avoid-column` utilities to control column and page breaks.
- Responsive variants for utilities such as `background-origin`, `border`, `skew`, `rotate`, etc.
- Text decoration styles (`decoration-dashed`, etc.) and `transition-discrete` for better transitions on discrete property changes.
- `whitespace-break-spaces`, `overflow-wrap: break-word/normal/all/ anywhere` utilities.
- `mask-image` utilities for fade effects and complex masking.
- `@utility` API for custom utilities in v4.

### 3. Configuration and Build Changes
- The `@tailwind` directives are replaced with `@import "tailwindcss";` at the top of your CSS files.
- The plugin package `tailwindcss` now recommends importing via `@tailwindcss/postcss` (v4 system requirement Node.js 20+).
- No automatic detection of JS config files; you must explicitly import your config.

### 4. Major Upgrades in Compatibility and Performance
- Better support for modern browsers; consult 'Can I use'.
- Changes in CSS selector specificity for space utility classes (`space-x/y`).
- Tailwind now supports more granular and responsive control over layout, spacing, and visual effects.

---

## Upgrading Essentials
- Use the `@tailwindcss/upgrade` tool (`npx @tailwindcss/upgrade`) to prepare your project.
- Update build scripts to the new `@tailwindcss/postcss` setup.
- Replace `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;` with `@import "tailwindcss";`.
- Review all utility renamings: e.g., shadows, radii, border, transition, etc.
- Check and update your custom CSS layers and plugins as per the new API.

## Summary

Tailwind CSS 4.x is a major release focused on enhancing consistency, utility naming, and responsive control. Upgrading requires updating your configuration, CSS imports, and utility classes, especially for shadows, radii, break properties, and transition utilities.

Ensure to test across browsers and review the new documentation for utilities relevant to your project.

---

For more detailed information, refer to the official [Tailwind CSS upgrade guide](https://tailwindcss.com/docs/upgrade-guide).