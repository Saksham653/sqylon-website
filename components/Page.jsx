/* The frame for the inner pages (founders, OSHT): the brand bar, a breadcrumb, and the footer.
 * Server component: these pages are plain prerendered HTML with no animation code. */
import Link from 'next/link';
import { SITE } from '@/lib/site';

export function PageFrame({ crumbs, children }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="pg-top">
        <div className="pg-top__in">
          <Link className="brand" href="/" aria-label="Sqaron Technologies, home"><span className="brand__drop" aria-hidden="true" /><span>{SITE.brand}</span></Link>
          <nav className="pg-top__links" aria-label="Site">
            <Link href="/#work">Work</Link>
            <Link href="/shivam-jha/">Shivam Jha</Link>
            <Link href="/saksham-srivastava/">Saksham Srivastava</Link>
            <Link href="/osht/">OSHT</Link>
          </nav>
          <Link className="btn btn--light btn--sm" href="/#contact">Start a project <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <main id="main" className="pg wrap">
        <p className="pg-crumbs">
          <Link href="/">Sqaron</Link>
          {crumbs.map((c) => <span key={c}> / {c}</span>)}
        </p>
        {children}
      </main>
      <footer className="pg-foot">
        <div className="wrap pg-foot__in">
          <span>© 2026 {SITE.legalName} · Shivam Jha &amp; Saksham Srivastava · India</span>
          <nav aria-label="More">
            <Link href="/">Home</Link> · <Link href="/shivam-jha/">Shivam Jha</Link> · <Link href="/saksham-srivastava/">Saksham Srivastava</Link> · <Link href="/osht/">OSHT – Agro Trading</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function Facts({ title, rows }) {
  return (
    <aside className="pg-card">
      <h2 className="pg-card__title">{title}</h2>
      <dl className="pg-facts">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </aside>
  );
}
