/* Shivam Jha's portfolio: facts only, from his portfolio, projects and profiles. */
import { PROJECTS } from './projects';

const project = (slug) => PROJECTS.find((p) => p.slug === slug);

export const SHIVAM = {
  name: 'Shivam Jha',
  role: 'Frontend developer & product designer',
  company: 'Sqaron Technologies Pvt Ltd',
  email: 'hello@sqylon.dev',
  photo: '/assets/img/founders/shivam.jpg',
  links: [
    { label: 'Portfolio', href: 'https://myself-koej.vercel.app/', handle: 'myself-koej.vercel.app' },
    { label: 'GitHub', href: 'https://github.com/shivamj56', handle: 'shivamj56' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shivam-jha-509482268/', handle: 'in/shivam-jha' },
    { label: 'X', href: 'https://x.com/heyshivm11', handle: '@heyshivm11' },
    { label: 'Fiverr', href: 'https://www.fiverr.com/heyshivm', handle: 'heyshivm' },
  ],
};

export const ROTATING = ['sites that sell.', 'apps people keep.', 'AI products.', 'motion with a reason.'];

export const STATEMENT =
  'Most interfaces look fine and do nothing. I build the ones that pay attention: fast on a cheap phone, clear in Hindi or English, moving only when it helps, and made to turn a visitor into a customer.';

// the last one counts down: the usual agency hand-offs, down to none
export const NUMBERS = [
  { to: 8, label: 'products and sites live', note: 'web, apps and AI tools' },
  { to: 3, label: 'platforms', note: 'web, Android and iOS' },
  { to: 2, label: 'languages in one app', note: 'Hindi and English, on OSHT' },
  { to: 9, from: 0, direction: 'down', duration: 2.4, label: 'hand-offs', note: 'sketch to store, one person' },
];

// the capability tiles: kind picks the drawn picture
export const CAPABILITIES = [
  { kind: 'site', label: 'Next.js · React', title: 'Websites that sell', description: 'Landing pages and sites built to turn visitors into enquiries, not just to look good.', colSpan: 2 },
  { kind: 'motion', label: 'GSAP · Motion · WebGL', title: 'Motion with a reason', description: 'Movement that guides the eye and explains what changed. Never decoration for its own sake.', rowSpan: 2 },
  { kind: 'phone', label: 'React Native', title: 'Mobile apps', description: 'Android and iOS from one codebase, in the stores.' },
  { kind: 'chat', label: 'LangGraph · LlamaIndex', title: 'AI products', description: 'Agents, RAG and prompts that hold up in real use.' },
  { kind: 'design', label: 'Figma · systems', title: 'Product design', description: 'From the first sketch to the store listing.' },
  { kind: 'signal', label: 'Built for India', title: 'Fast on cheap phones', description: 'Light pages, Hindi-first screens, voice when typing is hard.' },
];

// the work, with what he did on each
export const FEATURED = [
  { ...project('osht'), role: 'Led the product: app, web console and site' },
  { ...project('clonix'), role: 'Founder · backend by Saksham' },
  { ...project('nexeraai'), role: 'Designed and built' },
];
export const WORK = [
  { ...project('osht'), role: 'Product lead' },
  { ...project('clonix'), role: 'Founder' },
  { ...project('nexeraai'), role: 'Design & build' },
  { ...project('tbj'), role: 'Client site' },
  { ...project('adfusion'), role: 'Client site' },
  { ...project('dark-luxe'), role: 'Corporate concept' },
  { ...project('golden-travel'), role: 'Travel concept' },
  { ...project('bold-kinetic'), role: 'Kinetic concept' },
];

// sites that allow framing, for the live device preview
export const LIVE_SITES = ['tbj', 'adfusion', 'dark-luxe', 'golden-travel', 'bold-kinetic', 'nexeraai', 'osht'].map(project);

export const PROCESS = [
  { kicker: '01 · Listen', title: 'Who is it for?', description: 'A short call about the people who will use it and what they need to get done. Then a written plan and a fixed price.', panel: 'listen' },
  { kicker: '02 · Sketch', title: 'Flows before pixels.', description: 'Wireframes for the paths that matter, then the look: type, colour and the way things move.', panel: 'sketch' },
  { kicker: '03 · Build', title: 'Real code, early.', description: 'Next.js on the web, React Native in the stores. Typed, accessible and quick on a 3G connection.', panel: 'build' },
  { kicker: '04 · Polish', title: 'The motion pass.', description: 'Every transition has to earn its place: it shows where something came from or what to look at next.', panel: 'polish' },
  { kicker: '05 · Ship', title: 'Launch, then listen again.', description: 'Out to the stores and the web, then watching how people really use it and making it better.', panel: 'ship' },
];

export const DRAFTS = [
  { title: 'OmniMatrix', line: 'Real-time options-chain analytics, growing from a prototype into a full SaaS.' },
  { title: 'AI agent tooling', line: 'Claude and GPT multi-agent workflows for trading, content and dev work.' },
];
