import Link from 'next/link';

export const metadata = { title: 'Page not found · Sqaron Technologies', robots: { index: false } };

export default function NotFound() {
  return (
    <main className="notfound wrap">
      <p className="eyebrow">404</p>
      <h1>This page <em>moved or never was.</em></h1>
      <p>Everything we build is on the home page: the work, the founders and how to start a project.</p>
      <Link className="btn btn--light" href="/">Back to Sqaron <span aria-hidden="true">→</span></Link>
    </main>
  );
}
