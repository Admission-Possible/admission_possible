# (Ad)mission Possible

> The college application, demystified — and free, built for the first in their family.

A landing experience plus an interactive intake that turns a few questions
into a concrete plan — a recommended application pathway, a balanced starter
college list, and a study track — followed by a student dashboard.

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Home intro animation](#home-intro-animation)
- [About & the founding team](#about--the-founding-team)
- [The intake flow](#the-intake-flow)
- [Design system](#design-system)
- [Accessibility](#accessibility)
- [Testing & CI](#testing--ci)
- [Deployment](#deployment)

---

## Overview

(Ad)mission Possible is a single-page app (migrated from a vanilla
multi-page site) that walks a student from a bold landing page through a
7-question intake and into a personalized plan and dashboard. The goal is to
make the application process legible for students who are navigating it
without a map.

The original vanilla implementation is preserved in git history (see the
`legacy/` directory before the migration commits).

---

## Tech stack

| Concern     | Choice                                     |
| ----------- | ------------------------------------------ |
| UI          | **React 19** + **TypeScript** (strict)     |
| Build / dev | **Vite 8**                                 |
| Routing     | **React Router 8** (client-side)           |
| Styling     | A single hand-authored `global.css`        |
| Tests       | **Vitest 4** + **Testing Library** (jsdom) |
| Hosting     | Static SPA (Vercel rewrite / SPA fallback) |

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (tsc -b) + production build to dist/
npm run preview    # serve the production build
```

---

## Available scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR        |
| `npm run build`     | Type-check then build to `dist/`          |
| `npm run preview`   | Serve the production build locally        |
| `npm run typecheck` | `tsc`, no emit                            |
| `npm run lint`      | ESLint (flat config, TS + react-hooks)    |
| `npm run format`    | Prettier write (`format:check` to verify) |
| `npm test`          | Vitest + Testing Library (jsdom)          |

---

## Project structure

```
public/
  icons/                # PNG icons (menu, route, course, coaching, people,
                        # list, submit, apply, learn-write)
  intro/                # campus photos for the Home intro animation
                        # (harvard, mit, princeton, yale)
  team/                 # founding-team photos + placeholder portraits
src/
  main.tsx              # entry; mounts <App/> in <BrowserRouter> + ErrorBoundary
  App.tsx               # routes, all nested under the Chrome layout
  types.ts              # shared domain types
  data/                 # nav, questions, pathways, plan (computePlan),
                        # storage (sessionStorage), team (founding-team content)
  hooks/
    useReveal.ts        # scroll reveal/slash (re-scanned per route)
    useScrollHideHeader.ts
  components/
    Chrome, Header, Menu, Footer, Crumbs, Icon, Circle, Slash, Wordmark,
    ErrorBoundary
    IntroFloat.tsx      # the Home floating-image hero (see below)
    TeamCard.tsx        # expandable founding-team card on the About page
  pages/                # Home, About, How, Offer, Pathways, Coaching, Join,
                        # WritingCourse, ListBuilder, Router, Plan, Dashboard,
                        # TeamMember (the "My story" profile page), NotFound
  styles/global.css     # the full design system
```

> Files are grouped by role (data / hooks / components / pages / styles).
> Imports rely on these locations, so prefer extending a folder over moving
> files across folders.

---

## Routes

| Path                               | Page                               |
| ---------------------------------- | ---------------------------------- |
| `/`                                | Home                               |
| `/about`                           | About us (founding-team directory) |
| `/how`                             | How admissions works               |
| `/offer`                           | What we offer                      |
| `/writing-course`                  | The writing course                 |
| `/list-builder`                    | College list builder               |
| `/pathways`                        | Application pathways               |
| `/coaching`                        | Coaching                           |
| `/join`                            | Join                               |
| `/team/:slug`                      | Founding-team profile              |
| `/router` → `/plan` → `/dashboard` | The intake flow                    |
| `*`                                | Not found                          |

---

## Home intro animation

The Home page opens with a full-screen **floating-image hero**
(`src/components/IntroFloat.tsx`): the headline _"Impossible becomes
Possible"_ sits centered while ~20 thumbnail images orbit it.

**Behaviour**

- **Scattered, never a grid** — tiles are placed by percentage coordinates
  across every quadrant, at three depth tiers (`far` / `mid` / `near`) that
  drive size, opacity, blur, z-index, and movement amount.
- **Load animation** — each image arrives from an exaggerated outer offset,
  fading and scaling into place on a staggered `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Auto-play inward → outward** — a CSS animation drives a registered
  `@property --inward` custom property (no scrolling required). Tiles
  interpolate between an inward vector (clustered toward the headline) and an
  outward vector (dispersed), looping gently so the field breathes on its own.
- **Continuous drift** — each image has an independent looping float on a
  separate layer, so idle motion never fights the auto-drift transform.

**Three-layer composition** keeps transforms from colliding:

| Layer           | Owns                          |
| --------------- | ----------------------------- |
| `.itile`        | scatter position + auto drift |
| `.itile__inner` | continuous idle drift         |
| `.itile__media` | one-shot load arrival         |

**Performance & a11y** — only `transform` / `opacity` animate, `will-change`
is scoped to animated wrappers, far images lazy-load, and
`prefers-reduced-motion` disables drift in favour of a static fade-in. The
headline is always real text.

**Swapping in photos** — the field uses campus photos in `public/intro/`
(`yale`, `mit`, `harvard`, `princeton`), cycled across the tile slots. Drop
more files in and update the `IMAGES` array at the top of `IntroFloat.tsx`;
positions and motion keep working unchanged.

---

## About & the founding team

The About page (`/about`) opens with a "Who we are" statement, then a
**Founding team** directory: four tilted cards (`TeamCard.tsx`) — Jose,
Haolin, Angeline, and Rehan — each straightening and lifting on hover. Each
card is an expand **button** (an `aria-expanded` disclosure): clicking it
toggles a shared inline intro panel below the grid with the member's full
name, journey line, bio, a bold belief statement, and colored role chips,
plus a "Read my full story →" link to `/team/:slug`. Content lives in
`src/data/team.ts` (a single source of truth shared by the directory and the
profile pages), so a card and its page never drift apart.

`/team/:slug` renders `TeamMember.tsx` — a "My story" profile in Geist: a
light heading, a three-column row (journey path / narrative / a bold belief
statement with a muted sub-paragraph), a wide hero image, a row of pastel
skill pills, and a "Back to About us" pill in the top-left.

**Swapping in real photos** — drop files into `public/team/` and update the
`photo` (card, 15:11) and `storyPhoto` (wide hero) paths in `team.ts`. The
`*.svg` files are brand-palette placeholders; real photos override them.

---

## The intake flow

`Get my plan` goes to `/router`, a 7-question intake. On the last step the
answers and the computed plan are saved to `sessionStorage` and the user is
sent to `/plan`; the plan's track toggle persists and is reflected on
`/dashboard`. Visiting `/plan` or `/dashboard` without intake redirects back
to the router. `computePlan()` maps answers to a pathway, a balanced
reach/target/likely list, and a track. The plan links to `/list-builder` for
refining the starter list, and the dashboard's coaching row routes to
`/join`.

---

## Design system

- **Type** — Geist Mono (display) + Geist (`--display`, used on the About
  page, team cards, and profile pages) + Inter (body).
- **Palette**
  | Token           | Value     | Use                         |
  | --------------- | --------- | --------------------------- |
  | `--bg`          | `#F5F2E0` | warm cream paper            |
  | `--ink`         | `#3A3A36` | text                        |
  | `--muted`       | `#6F6E68` | secondary text              |
  | `--accent`      | `#E8491D` | orange accent               |
  | `--accent-soft` | `#F26B43` | lighter orange (team cards) |
  | `--card`        | `#FBFAF1` | surfaces                    |
  | `--hairline`    | `#C9C6BE` | rules / borders             |
  | `--menu-bg`     | `#4C4B46` | full-screen menu overlay    |
- **Motion** — scroll-triggered reveals and rotating hairline "slashes",
  re-scanned on each route change (`IntersectionObserver` + scroll/timeout
  fallback), plus the Home intro animation above. All respect
  `prefers-reduced-motion`.
- **Icons** — `Icon.tsx` renders a name to either an inline freehand SVG or a
  supplied PNG via the `PNG_ICONS` map (route, course, coaching, people, list,
  submit, apply, write); `bookmark` and `calendar` stay vector. The header's
  menu button uses `menu.png` directly.

---

## Accessibility

- Skip link, `main` landmark, and visible focus styles.
- The menu dialog has dialog semantics and moves focus on open.
- Router options are keyboard-operable.
- All motion honours `prefers-reduced-motion`; decorative intro thumbnails use
  empty `alt` text.

---

## Testing & CI

Tests live next to the code they cover (`*.test.ts[x]`) and include
`computePlan` branch coverage, storage round-trips, component unit tests, and
an end-to-end intake-flow test (router → plan → dashboard). CI
(`.github/workflows/ci.yml`) runs typecheck, lint, format check, tests, and
build on every push and PR to `main`.

---

## Deployment

This is a client-routed SPA, so the host must serve `index.html` for every
path (preserving the old site's direct-URL behaviour). `vercel.json` does this
with a catch-all rewrite. On other static hosts, add the equivalent SPA
fallback (e.g. a `404.html` copy of `index.html` for GitHub Pages).

### Security headers

`vercel.json` also sets response headers, including a Content-Security-Policy.
The default `connect-src 'self'` allows same-origin requests only.

**Wiring up the Join form:** if you set `VITE_JOIN_ENDPOINT` (see
`src/pages/Join.tsx`) to a **cross-origin** backend such as Formspree or
Getform, that `fetch` is a `connect-src` and will be **blocked** by the CSP
until you add the endpoint's origin. Update the `connect-src` slot in
`vercel.json`:

```diff
- "connect-src 'self'; ...
+ "connect-src 'self' https://your-form-backend.example; ...
```

A same-origin endpoint (e.g. a `/api/join` Vercel Function) needs no CSP change.
`vercel.json` is strict JSON and can't hold comments, so this is the canonical
note for that edit.
