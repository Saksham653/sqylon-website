/* Saksham Srivastava's portfolio: facts only, taken from his projects, GitHub and portfolio. */
import { PROJECTS } from './projects';

const project = (slug) => PROJECTS.find((p) => p.slug === slug);

export const SAKSHAM = {
  name: 'Saksham Srivastava',
  first: 'Saksham',
  role: 'Backend, AI & data',
  company: 'Sqaron Technologies Pvt Ltd',
  based: 'India',
  photo: '/assets/img/founders/saksham.jpg',
  intro: 'Co-founder of Sqaron Technologies. He builds the systems behind the screen: APIs, databases, agentic AI, LLM apps and MLOps pipelines.',
  links: [
    { label: 'GitHub', href: 'https://github.com/Saksham653', handle: 'github.com/Saksham653' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/saksham-srivastava-b689a8367', handle: 'in/saksham-srivastava' },
    { label: 'Portfolio', href: 'https://saksham653.github.io/', handle: 'saksham653.github.io' },
  ],
};

// what he reaches for, what for, and where it shipped
export const STACK = [
  { tool: 'Python', use: 'everything that runs on the server', where: 'every project' },
  { tool: 'FastAPI', use: 'async REST APIs', where: 'StockWaves' },
  { tool: 'PostgreSQL', use: 'data that has to be right', where: 'StockWaves' },
  { tool: 'Accounting logic', use: 'double-entry books that always balance', where: 'OSHT – Agro Trading' },
  { tool: 'Workers', use: 'jobs that keep systems in step on their own', where: 'OSHT – Agro Trading' },
  { tool: 'OCR + PDF', use: 'papers in, statements and reports out', where: 'OSHT – Agro Trading' },
  { tool: 'Agents + LangChain', use: 'multi-agent and tool-using LLM apps', where: 'HR Agent Pro · SmartEdge Copilot' },
  { tool: 'Groq · Llama 3', use: 'fast inference on top of checked numbers', where: 'LUMIQ' },
  { tool: 'MLOps', use: 'data drift vs concept drift, with alerts', where: 'DriftWatch' },
  { tool: 'Clerk + Stripe', use: 'sign-in, payments and credits', where: 'FlowCraft' },
  { tool: 'Docker', use: 'the same build everywhere', where: 'StockWaves' },
];

// everything he has built or run the backend for, newest work first
export const DEPLOYMENTS = [
  {
    ...project('osht'), status: 'live', role: 'Backend support · led by Shivam Jha',
    did: 'Servers and APIs for the Android, iOS and web apps, double-entry books, background workers, OCR and PDF automation, zero-downtime releases.',
    stack: ['APIs', 'Ledgers', 'Workers', 'OCR', 'PDF'],
  },
  {
    ...project('clonix'), status: 'pre-booking', role: 'Co-founder · backend · founded by Shivam Jha',
    did: 'Leads the backend engine that scans a website into design tokens, components and packs for AI editors.',
    stack: ['Engine', 'APIs', 'Scanning'],
  },
  {
    ...project('lumiq'), status: 'beta', role: 'Built by Saksham',
    did: 'Ask a spreadsheet questions in plain English. Numbers come from code, words from AI, and every figure is checked before you see it.',
    stack: ['Groq', 'Llama 3', 'In-browser data'],
  },
  {
    ...project('stockwaves'), status: 'live', role: 'Built by Saksham',
    did: 'Stock, sales, suppliers and staff in real time, with an AI assistant that answers questions about the actual inventory.',
    stack: ['FastAPI', 'PostgreSQL', 'React', 'Docker'],
  },
  {
    slug: 'flowcraft', title: 'FlowCraft', status: 'live', role: 'Built by Saksham', embed: false,
    url: 'https://flow-craft-theta.vercel.app/', line: 'AI content pipelines, as a SaaS.',
    did: 'Chains AI stages into content pipelines, with sign-in, Stripe payments and credits.',
    stack: ['Clerk', 'Stripe', 'AI pipelines'], links: [{ label: 'Live app', href: 'https://flow-craft-theta.vercel.app/' }],
  },
  {
    slug: 'hr-agent-pro', title: 'HR Agent Pro', status: 'code', role: 'Built by Saksham',
    url: 'https://github.com/Saksham653/hr-agent-pro', line: 'A multi-agent HR desk.',
    did: 'Answers policy questions and runs screening workflows with a team of agents.',
    stack: ['Multi-agent', 'LLM'], links: [{ label: 'Code', href: 'https://github.com/Saksham653/hr-agent-pro' }],
  },
  {
    slug: 'smartedge', title: 'SmartEdge Copilot', status: 'code', role: 'Built by Saksham',
    url: 'https://github.com/Saksham653/smartedge-copilot', line: 'A copilot for research and meetings.',
    did: 'An LLM copilot with a modular tool and plugin architecture.',
    stack: ['LLM', 'Tools', 'Plugins'], links: [{ label: 'Code', href: 'https://github.com/Saksham653/smartedge-copilot' }],
  },
  {
    slug: 'driftwatch', title: 'DriftWatch', status: 'code', role: 'Built by Saksham',
    url: 'https://github.com/Saksham653/ML-DRIFT-DETECTION---PERFORMANCE-MONITORING', line: 'MLOps monitoring.',
    did: 'Tells data drift from concept drift and raises alerts automatically.',
    stack: ['MLOps', 'Monitoring'], links: [{ label: 'Code', href: 'https://github.com/Saksham653/ML-DRIFT-DETECTION---PERFORMANCE-MONITORING' }],
  },
  {
    slug: 'groundwater', title: 'Groundwater API', status: 'code', role: 'Built by Saksham',
    url: 'https://github.com/Saksham653/fixitclub-groundwater-api', line: "An async API for India's groundwater stations.",
    did: 'An async REST API built for a civic-tech club.',
    stack: ['Async', 'REST'], links: [{ label: 'Code', href: 'https://github.com/Saksham653/fixitclub-groundwater-api' }],
  },
  {
    slug: 'crawlr', title: 'Crawlr', status: 'code', role: 'Built by Saksham',
    url: 'https://github.com/Saksham653/web-crawlr', line: 'A universal web scraper.',
    did: 'Zero dependencies, in the browser or the terminal.',
    stack: ['Scraping', 'Zero deps'], links: [{ label: 'Code', href: 'https://github.com/Saksham653/web-crawlr' }],
  },
];

// what his systems do, written as log lines (descriptions of real features, not live data)
export const LOG_LINES = [
  ['api', 'order raised by voice → purchase order created', 'osht'],
  ['ledger', 'voucher posted · debit = credit · books balanced', 'osht'],
  ['ocr', 'lorry receipt read · fields matched to the order', 'osht'],
  ['pdf', 'statement generated for the office', 'osht'],
  ['worker', 'systems back in step', 'osht'],
  ['engine', 'site scanned → tokens + components packed', 'clonix'],
  ['lumiq', 'question answered · every figure checked first', 'lumiq'],
  ['stock', 'assistant answered from the actual inventory', 'stockwaves'],
  ['agents', 'policy question → answer, screening step queued', 'hr-agent-pro'],
  ['drift', 'data drift ≠ concept drift → alert raised', 'driftwatch'],
  ['crawl', 'pages fetched · zero dependencies', 'crawlr'],
  ['billing', 'credits added after payment', 'flowcraft'],
];

export const WALL_WORDS = ['postgres', 'fastapi', 'workers', 'agents', 'pipelines', 'ledgers', 'ocr → pdf', 'llm apps', 'mlops', 'async', 'inference', 'scrapers'];
