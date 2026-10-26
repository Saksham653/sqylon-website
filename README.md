# Sqaron Technologies — website

The website of **Sqaron Technologies Pvt Ltd**, the product studio of **Shivam Jha** and **Saksham Srivastava**: websites, mobile apps, SaaS and AI agents, designed and built end to end. Live at https://sqylon.dev.

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

## Deploy (Netlify)

`netlify.toml` runs `npm run build` and publishes `out/`. The contact form posts to `/__forms.html`, which Netlify detects at deploy time.

To let Clonix and LUMIQ open inside the in-page browser, allow this site to frame them: replace `X-Frame-Options: DENY` / `frame-ancestors 'none'` with `Content-Security-Policy: frame-ancestors 'self' https://sqylon.dev`. Until then they open a preview with a button to the live site.
