# Sqaron Technologies — website

The website of **Sqaron Technologies Pvt Ltd**, the product studio of **Shivam Jha** and **Saksham Srivastava**: websites, mobile apps, SaaS and AI agents, designed and built end to end. Planned domain: sqylon.dev (not registered yet; see Deploy).

## Founders

| Founder | Role | GitHub | Portfolio page |
|---|---|---|---|
| **Shivam Jha** | Frontend developer & product designer | [@shivamj56](https://github.com/shivamj56) | `/shivam-jha/` |
| **Saksham Srivastava** | Backend, AI & data | [@Saksham653](https://github.com/Saksham653) | `/saksham-srivastava/` |

## Stack

- **Next.js 16** (App Router, JavaScript) with `output: 'export'`: every page is prerendered to static HTML in `out/`.
- **React 19**, **Motion** (`motion/react`, formerly Framer Motion) for springs and entrances, **GSAP** + ScrollTrigger (`@gsap/react`) for pinned and scrubbed scroll scenes, **Lenis** for smooth scrolling.
- **WebGL**: the liquid founder portrait, the chrome blob and the founder characters (raw WebGL2 in `lib/engines/`), and the work reel (**FlexCarousel** from React Bits on **ogl**, in `components/FlexCarousel/`).
- Fonts are self-hosted in `app/fonts/` (Geist, Geist Mono, Instrument Serif).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm run preview    # serve out/ on http://localhost:4173
```

## Where things are

| Path | What |
|---|---|
| `app/page.js` | Home page (metadata + JSON-LD), renders `components/Site.jsx` |
| `app/osht/`, `app/shivam-jha/`, `app/saksham-srivastava/` | Inner pages |
| `components/Works.jsx` | Selected work: the WORK fly-through, the scroll-driven reel, the story panel |
| `components/SiteBrowser.jsx` | The in-page macOS-style browser that opens a project's live site |
| `lib/projects.js` | The ten projects: copy, credits, links, screenshots, whether they can be framed |
| `components/shivam/` | Shivam's portfolio (`/shivam-jha/`): his 3D character (`HeadTracker.jsx`, WebGL2 rig in `headRig.js`), the sections, and `portfolio.css`; data in `lib/shivam.js` |
| `components/saksham/` | Saksham's portfolio (`/saksham-srivastava/`); data in `lib/saksham.js` |
| `components/rb/`, `components/ui21/` | Ready-made components: React Bits (one folder each, with its CSS) and 21st.dev ports (Aceternity, Magic UI) |
| `lib/site.js` | Brand, copy and lists used across the page |
| `public/__forms.html` | Registers the `brief` form with Netlify Forms |

## Deploy (Vercel)

1. In Vercel: **Add New → Project** and import `Saksham653/sqylon-website`.
2. Framework preset **Next.js** is detected. Keep the default build (`npm run build`); no environment variables are needed. Node 20.9 or newer.
3. `next.config.mjs` sets `output: 'export'`, so Vercel serves the prerendered static pages. `vercel.json` adds the security and cache headers.

Before it goes public:

- **Contact form.** The brief form posts to `/__forms.html`, which only Netlify Forms understands. On Vercel it needs a backend, for example a Vercel Function that emails or stores the brief. Until then, sending shows the "email us instead" message.
- **Domain and email.** `lib/site.js` uses `https://sqylon.dev` and `hello@sqylon.dev`, but that domain is not registered yet. Point the real domain at Vercel and update `SITE.url` and `SITE.email`; they feed the canonical links, Open Graph tags, sitemap and JSON-LD.
- `netlify.toml` and `public/__forms.html` are only for Netlify and can go once the site is on Vercel.

To let Clonix and LUMIQ open inside the in-page browser, allow this site to frame them: replace `X-Frame-Options: DENY` / `frame-ancestors 'none'` with `Content-Security-Policy: frame-ancestors 'self' <this site's domain>`. Until then they open a preview with a button to the live site.
