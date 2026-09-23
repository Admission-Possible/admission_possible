# (Ad)mission Possible

> Your future is more than a college acceptance letter.

Guided mentorship, by first-gen students, for the next ones. The site tells one
journey — discover Admission Possible, what we do, how we help, the path, the
people behind it — and ends at a single action: **Join us**, the student
sign-up.

The visual and interaction language follows the
[AI in Design Report 2026](https://stateofaidesign.com/) (proportions, dividers,
motion); the content and branding are Admission Possible's own.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Content rules](#content-rules)
- [Motion](#motion)
- [Supplying assets](#supplying-assets)
- [Accessibility](#accessibility)
- [Testing & CI](#testing--ci)
- [Deployment](#deployment)

---

## Tech stack

| Concern     | Choice                                                       |
| ----------- | ------------------------------------------------------------ |
| UI          | **React 19** + **TypeScript** (strict)                       |
| Build / dev | **Vite 8**                                                   |
| Routing     | **React Router 8** (client-side)                             |
| Styling     | Hand-authored CSS in `src/styles/`                           |
| Tests       | **Vitest 4** + **Testing Library** (jsdom)                   |
| Hosting     | Prerendered static site on Vercel (client-routed after load) |

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (tsc -b) + production build to dist/
npm run preview    # serve the production build
```

`npm run typecheck`, `npm run lint`, `npm run format` and `npm test` do what
they say.

---

## Project structure

```
public/
  colleges/             # every provided campus photo (01–32.jpg)
  art/                  # the botanical hero film + poster
  brand/                # the graduation-cap logo
  team/                 # founding-team photos + placeholder portraits
src/
  App.tsx               # routes, nested under the Chrome layout
  data/
    content.ts          # approved copy: core message, How steps, pathways
    colleges.ts         # the campus photo list
    nav.ts              # the one navigation set (header, menu, footer)
    team.ts             # founding team
  components/           # Header, Menu, Footer, OpeningIntro, AdmissionArt,
                        # PathwayMarks, StepRail, CampusCarousel, TeamStrip,
                        # LetsMake, Plus, Possible, Counter, …
  pages/                # Home, About, How, Offer, Join, Privacy, TeamMember,
                        # NotFound
  styles/               # global (tokens, fonts), editorial (header, menu),
                        # site (home, motion, footer), interior, opening-intro,
                        # admission-art
```

---

## Routes

| Path          | Page                      |
| ------------- | ------------------------- |
| `/`           | Home                      |
| `/about`      | About us                  |
| `/how`        | How it works              |
| `/offer`      | What we offer             |
| `/join`       | Join us (student sign-up) |
| `/privacy`    | Privacy                   |
| `/team/:slug` | Founding-team profile     |
| `*`           | Not found                 |

Header, menu and footer all read `src/data/nav.ts`, so they can't disagree.

---

## Content rules

Only approved content ships. Copy lives in `src/data/content.ts` and
`src/data/team.ts`; do not invent statistics, testimonials, quotes, student
stories or organizational claims. Where something is not yet supplied, the
slot stays empty (e.g. a pathway `logo`) rather than filled with a stand-in.

---

## Motion

- **Opening** (`OpeningIntro`, first homepage visit only): "Impossible Becomes
  Possible" → "Possible" is underlined → "Impossible Becomes" rolls out as
  "Admission" rolls in → the title card docks into the header logo and the
  hero opens.
- **Scroll reveals** (`useReveal` + `site.css`): `data-reveal="group"` staggers
  a section's children by `--i`; `mask` unmasks headings upward; `line` draws
  rules; `rise` lifts the closing statement. One shared easing (`--ease`).
- Hero windows cycle through every campus photo; the carousel loops all of
  them continuously. There are no pause controls; motion stops when off screen,
  in a hidden tab, or when the system asks for reduced motion.

---

## Supplying assets

- **Pathway logos** — add official files to `public/pathways/` and set `logo`
  on each entry in `APPLICATION_PATHWAYS` (`src/data/content.ts`).
- **Team photos** — add to `public/team/` and update `photo` / `storyPhoto` in
  `src/data/team.ts`. The `*.svg` files are placeholders.
- **Campus photos** — add to `public/colleges/` and list them in
  `src/data/colleges.ts`; they join the hero and carousel automatically.

---

## Accessibility

- Skip link, landmarks, visible focus, dialog semantics for the menu.
- Decorative imagery uses empty `alt`; animated numbers expose their final
  value to assistive tech.
- `prefers-reduced-motion` disables the opening, reveals and loops.

---

## Testing & CI

Tests live next to the code they cover (`*.test.ts[x]`). CI
(`.github/workflows/ci.yml`) runs typecheck, lint, format check, tests, and
build on every push and PR to `main`.

---

## Deployment

Every route is **prerendered to its own HTML file** at build time, so crawlers
and link-preview bots get real content instead of an empty root div, and each
page carries its own title, description and canonical. `npm run build` does
three things: the client bundle, an SSR bundle from `src/entry-server.tsx`, and
`scripts/prerender.mjs`, which writes `dist/<route>/index.html` for every entry
in `src/data/routes.ts` plus a `404.html`.

Two consequences worth knowing:

- **There is no SPA catch-all rewrite any more.** It was what turned unknown
  paths into 200-status soft 404s. Unmatched paths now get `404.html` with a
  real 404. **A new route must be added to `src/data/routes.ts` or it will 404
  in production** — a test fails if the manifest drifts from `App.tsx`.
- **Never read browser-only state during render.** The prerender runs in Node,
  so anything that differs on the first client paint makes React throw the
  prerendered tree away. Go through `useHydrated()` (see `src/hooks/`); a test
  hydrates every route and fails on any mismatch.

### Security headers

`vercel.json` also sets response headers, including a Content-Security-Policy.
The default `connect-src 'self'` allows same-origin requests only.

**Wiring up the Join form:** Join POSTs to the same-origin `/api/join`
Vercel Function (`api/join.ts`) by default, which `connect-src 'self'` already
allows — no CSP change needed. If you override `VITE_JOIN_ENDPOINT` (see
`src/pages/Join.tsx`) with a **cross-origin** backend such as Formspree or
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

### Environment variables

Copy `.env.example` to `.env.local` for local development, and set the same
keys in the Vercel project settings for deploys. See that file for the full
list; the ones that matter for Join are:

| Variable             | Where  | Purpose                                                                                                                                        |
| -------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | server | Required for `/api/join` to deliver mail. Unset ⇒ the endpoint returns 503 and the form shows a copyable fallback instead of claiming success. |
| `JOIN_NOTIFY_EMAIL`  | server | The inbox that receives submissions.                                                                                                           |
| `JOIN_FROM_EMAIL`    | server | Optional sender, on a Resend-verified domain.                                                                                                  |
| `VITE_CONTACT_EMAIL` | client | A public address to show as a manual fallback. **Leave unset until you verifiably control the mailbox** — see below.                           |
| `VITE_JOIN_ENDPOINT` | client | Override the POST target. Defaults to `/api/join`.                                                                                             |

> **Contact address:** `VITE_CONTACT_EMAIL` ships in the client bundle and is
> shown to students. It previously pointed at `hello@admissionpossible.org`, a
> domain owned by College Possible — an unrelated nonprofit — so submissions
> were being directed to a third party. Only set this to a mailbox whose domain
> ownership and inbox delivery you have verified end to end. When it is unset,
> the form shows the composed message for copying and names no address at all.
