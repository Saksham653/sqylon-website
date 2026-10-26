import Link from 'next/link';
import { PageFrame, JsonLd, Facts } from '@/components/Page';
import { SITE } from '@/lib/site';

const PLAY = 'https://play.google.com/store/apps/details?id=com.shreehari.vendors';
const STORE = 'https://apps.apple.com/in/app/osht-agro-trading/id6802507783';

export const metadata = {
  title: 'OSHT – Agro Trading app | Led by Shivam Jha, with Saksham Srivastava (Sqaron Technologies)',
  description: 'OSHT – Agro Trading is the grain-trade order book of Om Shri Hari Trading Pvt Ltd, on Android, iOS and the web. Led and built by Shivam Jha, with backend support from Saksham Srivastava, of Sqaron Technologies.',
  alternates: { canonical: '/osht/' },
};

const FAQ = [
  ['Who developed the OSHT – Agro Trading app?', 'OSHT – Agro Trading was led and built by Shivam Jha (product, Android and iOS app, web office console) with backend support from Saksham Srivastava, the two founders of Sqaron Technologies, for Om Shri Hari Trading Private Limited.'],
  ['Who built the backend of OSHT?', 'Saksham Srivastava supported the project as its backend developer, working with Shivam Jha, who led it.'],
  ['Who built the app screens and the frontend?', 'Shivam Jha led OSHT and built what people use: the Android and iOS app, the web office console and the landing site, with its notifications and field-use automation.'],
  ['What is OSHT – Agro Trading?', "The order book of Om Shri Hari Trading Pvt Ltd's grain business. Brokers and suppliers raise orders, follow each lorry from loading to the factory's receipt, send the papers behind it, and see purchase receipts and pay slips, in Hindi and English, with voice input."],
  ['Where can I download it?', 'Free on Google Play and the Apple App Store. An account with Om Shri Hari Trading is needed to sign in.'],
];

const data = [
  {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'OSHT – Agro Trading', applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android, iOS', url: 'https://www.omshriharitrading.com/', sameAs: [PLAY, STORE],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    author: [{ '@id': `${SITE.url}/#shivam` }, { '@id': `${SITE.url}/#saksham` }],
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  },
];

export default function OshtPage() {
  return (
    <PageFrame crumbs={['OSHT – Agro Trading']}>
      <JsonLd data={data} />
      <header className="pg-hero pg-hero--wide">
        <div>
          <p className="pg-role">Product · Android, iOS &amp; web · Live</p>
          <h1>OSHT – <em>Agro Trading</em></h1>
        </div>
      </header>
      <p className="pg-lead">The order book for Om Shri Hari Trading&apos;s grain business, used in the field by brokers, suppliers and staff. Led and built by <Link href="/shivam-jha/">Shivam Jha</Link>, with backend support from <Link href="/saksham-srivastava/">Saksham Srivastava</Link>, of Sqaron Technologies.</p>
      <div className="pg-actions">
        <a className="btn btn--light" href={PLAY} rel="noopener">Google Play <span aria-hidden="true">↗</span></a>
        <a className="btn btn--ghost" href={STORE} rel="noopener">App Store <span aria-hidden="true">↗</span></a>
        <a className="btn btn--ghost" href="https://www.omshriharitrading.com/" rel="noopener">Website <span aria-hidden="true">↗</span></a>
      </div>
      <figure className="pg-shot"><img src="/assets/img/work/osht.jpg" alt="OSHT – Agro Trading landing page: Your whole trade, in your voice." width="1456" height="829" /></figure>
      <div className="pg-grid">
        <div className="pg-prose">
          <h2>What it does</h2>
          <ul>
            <li><strong>Raise an order</strong> one question at a time and watch it move through every stage, from approval to delivery.</li>
            <li><strong>Follow each lorry</strong> paper by paper, from loading to the factory&apos;s receipt and on to the pay slip.</li>
            <li><strong>See every paper:</strong> which of a lorry&apos;s papers are in, which one is still owed, and send yours by camera, gallery or PDF.</li>
            <li><strong>Know where your money is:</strong> purchase receipts and pay slips appear the moment the office files them.</li>
            <li><strong>Get told</strong> the moment something needs you, instead of having to check.</li>
          </ul>
          <h2>Built for the mandi</h2>
          <ul>
            <li><strong>Hindi and English</strong>, with more Indian languages on the way.</li>
            <li><strong>Speak</strong> the quantity, the rate and any note, so an order can be raised without typing.</li>
            <li><strong>Reads questions aloud</strong> for anyone who would rather listen than read.</li>
            <li><strong>Works offline:</strong> holds on to papers when the signal drops and sends them when the bars come back.</li>
          </ul>
          <h2>Questions</h2>
          <div className="pg-faq">
            {FAQ.map(([q, a], i) => (
              <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </div>
        <Facts title="App facts" rows={[
          ['App', 'OSHT – Agro Trading'],
          ['Led by', <Link key="s" href="/shivam-jha/">Shivam Jha</Link>],
          ['Backend support', <Link key="k" href="/saksham-srivastava/">Saksham Srivastava</Link>],
          ['Studio', 'Sqaron Technologies'],
          ['Built for', 'Om Shri Hari Trading Pvt Ltd'],
          ['Platforms', 'Android · iOS · Web office console'],
          ['Languages', 'Hindi · English'],
          ['Price', 'Free (account needed to sign in)'],
        ]} />
      </div>
    </PageFrame>
  );
}
