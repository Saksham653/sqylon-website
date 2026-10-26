import Site from '@/components/Site';
import { PROJECTS } from '@/lib/projects';
import { SITE } from '@/lib/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': `${SITE.url}/#org`, name: SITE.name, legalName: SITE.legalName, alternateName: 'Sqaron', url: `${SITE.url}/`, logo: `${SITE.url}/assets/icon-512.png`, email: SITE.email,
      description: 'Product studio founded by Shivam Jha and Saksham Srivastava. Websites, mobile apps, SaaS and AI agents, designed and built end to end.',
      areaServed: ['IN', 'Worldwide'],
      founder: [{ '@id': `${SITE.url}/#shivam` }, { '@id': `${SITE.url}/#saksham` }],
      knowsAbout: ['Web design', 'Frontend development', 'Mobile apps', 'SaaS', 'AI agents', 'Chrome extensions', 'Backend development', 'Automation'],
    },
    {
      '@type': 'Person', '@id': `${SITE.url}/#shivam`, name: 'Shivam Jha', jobTitle: 'Co-founder · AI architect, product & frontend', worksFor: { '@id': `${SITE.url}/#org` },
      sameAs: ['https://myself-koej.vercel.app/', 'https://github.com/shivamj56', 'https://www.linkedin.com/in/shivam-jha-509482268/', 'https://x.com/heyshivm11', 'https://www.fiverr.com/heyshivm'],
    },
    {
      '@type': 'Person', '@id': `${SITE.url}/#saksham`, name: 'Saksham Srivastava', jobTitle: 'Co-founder · Backend, AI & data', worksFor: { '@id': `${SITE.url}/#org` },
      sameAs: ['https://github.com/Saksham653', 'https://linkedin.com/in/saksham-srivastava-b689a8367', 'https://saksham653.github.io/'],
    },
    ...PROJECTS.map((p) => ({
      '@type': 'CreativeWork', name: p.title, url: p.url, description: p.body,
      author: p.credit.map((c) => ({ '@id': `${SITE.url}/#${c.name.startsWith('Shivam') ? 'shivam' : 'saksham'}` })),
    })),
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Site />
    </>
  );
}
