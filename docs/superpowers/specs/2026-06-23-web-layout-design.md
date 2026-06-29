---
name: web-layout-design
description: Design spec for basic layout in apps/web (header, footer, welcome card)
metadata:
  type: reference
---

# Web Layout Design Spec (Basic Layout)

**Date:** 2026-06-23

## Overview
Create a minimal but polished UI for the Next.js application in `apps/web`. The page will consist of:
- A **Header** with the EIS logo text and a simple navigation bar placeholder.
- A **Footer** with a copyright line.
- A **Content area** that centers a welcome card containing a greeting and a **Login** button linking to `/login`.

The design follows a clean, minimalist aesthetic using the provided colour palette.

## Component Structure
```
app/
├─ layout.tsx       // Root layout applying global styles and wrapping children
├─ page.tsx         // Index page rendering the welcome card
└─ globals.css      // Global CSS (font, background, colour variables)

components/
├─ Header.tsx       // Header with logo and nav placeholder
├─ Footer.tsx       // Footer with copyright
└─ WelcomeCard.tsx // Centered card with greeting and login button
```

### Layout (`layout.tsx`)
- Wraps the whole app with `<html lang="en">` and `<body>`.
- Applies the background colour `#f9fafb`.
- Inserts `<Header />` at the top, `<Footer />` at the bottom, and renders `{children}` in between.

### Page (`page.tsx`)
- Renders `<WelcomeCard />` as the sole child inside the layout's content area.

### Header (`Header.tsx`)
- Container with background `#2563eb` (blue) and white text.
- Displays **EIS** as a large text logo on the left.
- A placeholder navigation `<nav>` on the right (empty for now, can be extended later).

### Footer (`Footer.tsx`)
- Container with a light‑gray background (optional) and centred text.
- Text: `© 2026 EIS - Employee Leave System`.

### WelcomeCard (`WelcomeCard.tsx`)
- Centered flex box with a white card, subtle shadow, and padding.
- Title: `Welcome to EIS` (large, centered).
- **Login** button:
  - Background `#16a34a` (green), white text.
  - Rounded corners, padding `0.5rem 1rem`.
  - Links to `/login` using Next.js `<Link>`.

## Styling (`globals.css`)
```css
:root {
  --color-header-bg: #2563eb;
  --color-header-text: #ffffff;
  --color-button-bg: #16a34a;
  --color-button-text: #ffffff;
  --color-bg: #f9fafb;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
  font-family: system-ui, sans-serif;
}

header {
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  color: #555;
}

.welcome-card {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.welcome-card button {
  background-color: var(--color-button-bg);
  color: var(--color-button-text);
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
}
```

## Interaction Flow
1. User lands on `/` (the home page).
2. Header is rendered at the top, footer at the bottom.
3. The centered welcome card greets the user.
4. Clicking **Login** navigates to `/login` (route to be implemented later).

## Extensibility Notes
- The `Header` component includes an empty `<nav>` element for future navigation links.
- The `WelcomeCard` can later accommodate additional actions (e.g., sign‑up, demo video) without changing the layout.
- Global CSS variables make colour updates trivial.

---
**Why:** Provides a clear, minimal UI foundation that matches the colour palette and branding requirements while keeping the codebase tidy and future‑proof.
**How to apply:** Follow the component hierarchy above when creating the files in `apps/web/app/` and import the CSS from `globals.css`.
---
