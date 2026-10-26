import SakshamPortfolio from '@/components/saksham/SakshamPortfolio';
import { JsonLd } from '@/components/Page';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Saksham Srivastava — Backend, AI & data | Co-founder, Sqaron Technologies',
  description: 'Saksham Srivastava builds backends, agentic AI and data systems and is co-founder of Sqaron Technologies. Backend on OSHT – Agro Trading, co-founder and backend lead of Clonix, builder of LUMIQ, StockWaves and FlowCraft.',
  alternates: { canonical: '/saksham-srivastava/' },
  openGraph: { title: 'Saksham Srivastava — the back end of Sqaron', images: [{ url: '/assets/og.png', width: 1200, height: 630 }] },
};

const person = {
  '@context': 'https://schema.org', '@type': 'Person', '@id': `${SITE.url}/#saksham`, name: 'Saksham Srivastava',
  jobTitle: 'Co-founder · Backend, AI & data', url: `${SITE.url}/saksham-srivastava/`, image: `${SITE.url}/assets/img/founders/saksham.jpg`,
  worksFor: { '@type': 'Organization', name: SITE.legalName, url: `${SITE.url}/` },
  knowsAbout: ['Python', 'FastAPI', 'PostgreSQL', 'Agentic AI', 'LLM applications', 'MLOps', 'OCR', 'Backend development'],
  sameAs: ['https://github.com/Saksham653', 'https://linkedin.com/in/saksham-srivastava-b689a8367', 'https://saksham653.github.io/'],
};

export default function SakshamPage() {
  return (
    <>
      <JsonLd data={person} />
      <SakshamPortfolio />
    </>
  );
}
