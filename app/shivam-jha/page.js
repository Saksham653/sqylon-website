import ShivamPortfolio from '@/components/shivam/ShivamPortfolio';
import { JsonLd } from '@/components/Page';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Shivam Jha — Frontend developer & product designer | Co-founder, Sqaron Technologies',
  description: 'Shivam Jha designs and builds what people touch: sites that sell, Android and iOS apps, AI products and the motion in between. Co-founder of Sqaron Technologies; led OSHT – Agro Trading, founded Clonix, built NexeraAI, TBJ Properties and ADFusion.',
  alternates: { canonical: '/shivam-jha/' },
  openGraph: { title: 'Shivam Jha — interfaces that look back', images: [{ url: '/assets/og.png', width: 1200, height: 630 }] },
};

const person = {
  '@context': 'https://schema.org', '@type': 'Person', '@id': `${SITE.url}/#shivam`, name: 'Shivam Jha',
  jobTitle: 'Co-founder · Frontend developer & product designer', url: `${SITE.url}/shivam-jha/`, image: `${SITE.url}/assets/img/founders/shivam.jpg`,
  worksFor: { '@type': 'Organization', name: SITE.legalName, url: `${SITE.url}/` },
  knowsAbout: ['Frontend development', 'Product design', 'UI/UX', 'Next.js', 'React', 'React Native', 'GSAP', 'WebGL', 'Motion design', 'AI products', 'Prompt engineering'],
  sameAs: ['https://myself-koej.vercel.app/', 'https://github.com/shivamj56', 'https://www.linkedin.com/in/shivam-jha-509482268/', 'https://x.com/heyshivm11', 'https://www.fiverr.com/heyshivm'],
};

export default function ShivamPage() {
  return (
    <>
      <JsonLd data={person} />
      <ShivamPortfolio />
    </>
  );
}
