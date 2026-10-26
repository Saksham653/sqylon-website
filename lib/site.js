/* Shared copy and links used across the page and the metadata. */
export const SITE = {
  url: 'https://sqylon.dev',
  name: 'Sqaron Technologies',
  legalName: 'Sqaron Technologies Pvt Ltd',
  brand: 'SQARON',
  email: 'hello@sqylon.dev',
  title: 'Sqaron Technologies — Design that sells. Code that scales. | Shivam Jha & Saksham Srivastava',
  description:
    'Sqaron Technologies is the product studio of Shivam Jha and Saksham Srivastava. We design and build websites, mobile apps, SaaS and AI agents end to end: OSHT – Agro Trading, Clonix, TBJ Properties, LUMIQ and more.',
};

export const NEEDS = ['A website that sells', 'A mobile app', 'A SaaS or dashboard', 'An AI agent or automation', 'A Chrome extension', 'A backend or API'];
export const WHENS = ['This month', 'In 1–2 months', 'This quarter', 'Just exploring'];
export const BUDGETS = ['Under ₹50,000', '₹50,000 – ₹2 lakh', '₹2 lakh +', 'In USD', 'Not sure yet'];

export const FOUNDERS = {
  A: { name: 'Saksham Srivastava', role: 'Backend, AI & data', img: '/assets/img/founders/saksham.jpg' },
  B: { name: 'Shivam Jha', role: 'AI architect, product & frontend', img: '/assets/img/founders/shivam.jpg' },
};

export const LAB = [
  { name: 'FlowCraft', what: 'A full SaaS that chains AI stages into content pipelines, with Clerk sign-in, Stripe payments and credits.', who: 'Saksham', href: 'https://flow-craft-theta.vercel.app/', cta: 'Live app' },
  { name: 'OmniMatrix', what: 'Real-time options-chain analytics, growing from a prototype into a full SaaS.', who: 'Shivam', state: 'Building' },
  { name: 'HR Agent Pro', what: 'A multi-agent HR system that answers policy questions and runs screening workflows.', who: 'Saksham', href: 'https://github.com/Saksham653/hr-agent-pro', cta: 'Code' },
  { name: 'SmartEdge Copilot', what: 'An LLM copilot for research and meetings, with a modular tool and plugin architecture.', who: 'Saksham', href: 'https://github.com/Saksham653/smartedge-copilot', cta: 'Code' },
  { name: 'AI agent tooling', what: 'Claude and GPT multi-agent workflows for trading, content and dev work.', who: 'Shivam', state: 'Building' },
  { name: 'DriftWatch', what: 'MLOps monitoring that tells data drift from concept drift, with automated alerts.', who: 'Saksham', href: 'https://github.com/Saksham653/ML-DRIFT-DETECTION---PERFORMANCE-MONITORING', cta: 'Code' },
  { name: 'Groundwater API', what: "An async REST API for India's groundwater stations, built for a civic-tech club.", who: 'Saksham', href: 'https://github.com/Saksham653/fixitclub-groundwater-api', cta: 'Code' },
  { name: 'Crawlr', what: 'A universal web scraper with zero dependencies, in the browser or the terminal.', who: 'Saksham', href: 'https://github.com/Saksham653/web-crawlr', cta: 'Code' },
];

export const SERVICES = [
  { title: 'Websites that sell', text: 'Landing pages and business sites built to turn visitors into enquiries.', tags: 'Next.js · GSAP · SEO', img: '/assets/img/work/tbj.jpg' },
  { title: 'Mobile apps', text: 'Android and iOS apps people open every day, Hindi-first when your users need it.', tags: 'React Native · Expo', img: '/assets/img/work/osht.jpg' },
  { title: 'SaaS & dashboards', text: 'Products with accounts, billing and admin, ready to sell from day one.', tags: 'TypeScript · Payments', img: '/assets/img/work/clonix.jpg' },
  { title: 'AI agents & automation', text: 'Assistants and workflows that take the busywork off your team.', tags: 'Claude · GPT · Groq', img: '/assets/img/work/lumiq.jpg' },
  { title: 'Chrome extensions', text: 'AI inside the tools your team already lives in.', tags: 'Manifest V3 · AI', img: '/assets/img/work/clonix.jpg' },
  { title: 'Backends & APIs', text: 'Fast, reliable APIs and databases that keep your data correct.', tags: 'FastAPI · Node · PostgreSQL', img: '/assets/img/work/stockwaves.jpg' },
];

export const STEPS = [
  { title: 'Brief', text: 'A 30-minute discovery call. We agree the scope, what success looks like and the stack.' },
  { title: 'Architecture', text: 'A written design doc and a clickable flow within 72 hours, with a fixed price.' },
  { title: 'Build', text: 'Fixed-price milestones and a working demo every week. You never wait a month to see progress.' },
  { title: 'Launch', text: 'Deploy, smoke-test and monitor. Fourteen days of post-launch support are included.' },
];

export const NUMBERS = [
  { n: 13, text: 'products built between the two of us' },
  { n: 2, text: 'app stores, one Hindi + English app' },
  { n: 72, text: 'hours to a written plan and price' },
  { n: 14, text: 'days of support after launch' },
];
