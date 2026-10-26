'use client';

/* Start a project: the brief form (Netlify Forms) in front of a raymarched chrome blob.
 * The hero's quick brief fills in what you need, when and the budget. */
import { useEffect, useRef, useState } from 'react';
import { useSite } from './SiteProvider';
import { RevealWords, Reveal, Magnetic } from './ui/motion';
import { NEEDS, WHENS, BUDGETS, SITE } from '@/lib/site';

function Blob() {
  const canvas = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const SQ = (await import('@/lib/engines/blob')).default;
        if (!cancelled && SQ.Blob) SQ.Blob(canvas.current);
      } catch (err) {
        console.warn('[sqylon] blob unavailable', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return <canvas className="cta__blob" ref={canvas} aria-hidden="true" />;
}

export default function Contact() {
  const { brief } = useSite();
  const [need, setNeed] = useState(NEEDS[0]);
  const [when, setWhen] = useState(WHENS[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [status, setStatus] = useState({ text: '', sent: false, html: false });

  useEffect(() => {
    if (!brief.nonce) return;
    setNeed(brief.need); setWhen(brief.when); setBudget(brief.budget);
  }, [brief]);

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.elements.name, contact = form.elements.contact;
    if (!name.value.trim()) { setStatus({ text: 'Add your name so we know who to reply to.' }); name.focus(); return; }
    if (!contact.value.trim()) { setStatus({ text: 'Add an email or WhatsApp number so we can reply.' }); contact.focus(); return; }
    setStatus({ text: 'Sending…' });
    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      setStatus({ text: 'Brief received. Shivam or Saksham will reply within one working day.', sent: true });
    } catch (err) {
      setStatus({ text: '', html: true });
    }
  };

  return (
    <section className="cta" id="contact" aria-labelledby="ctaTitle">
      <Blob />
      <div className="cta__in wrap">
        <div className="cta__head">
          <Reveal as="p" className="eyebrow" y={20}>Start a project</Reveal>
          <RevealWords as="h2" id="ctaTitle">Got an idea? <em>Let&apos;s ship it.</em></RevealWords>
          <Reveal as="p" className="cta__sub" y={24} delay={0.1}>Tell us what you&apos;re building. A founder replies within one working day with questions, then a written plan and a fixed price.</Reveal>
          <ul className="cta__direct">
            <li><span>Email</span><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li><span>Portfolio</span><a href="https://myself-koej.vercel.app/" target="_blank" rel="noopener noreferrer">Shivam Jha ↗</a></li>
            <li><span>Fiverr</span><a href="https://www.fiverr.com/heyshivm" target="_blank" rel="noopener noreferrer">fiverr.com/heyshivm ↗</a></li>
            <li><span>LinkedIn</span><a href="https://www.linkedin.com/in/shivam-jha-509482268/" target="_blank" rel="noopener noreferrer">Shivam Jha ↗</a></li>
          </ul>
        </div>
        <Reveal as="form" className={`brief${status.sent ? ' is-sent' : ''}`} id="brief" name="brief" method="POST" noValidate onSubmit={submit} y={60} amount={0.1}>
          <input type="hidden" name="form-name" value="brief" />
          <p className="hp" hidden><label>Leave this empty <input name="website" tabIndex={-1} autoComplete="off" /></label></p>
          <div className="brief__row">
            <label className="field"><span>Your name</span><input id="fName" name="name" required autoComplete="name" placeholder="Aditi Rao" /></label>
            <label className="field"><span>Email or WhatsApp</span><input id="fContact" name="contact" required autoComplete="email" placeholder="you@company.com" /></label>
          </div>
          <div className="brief__row brief__row--3">
            <label className="field"><span>I need</span><select name="need" value={need} onChange={(e) => setNeed(e.target.value)}>{NEEDS.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label className="field"><span>Timeline</span><select name="timeline" value={when} onChange={(e) => setWhen(e.target.value)}>{WHENS.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label className="field"><span>Budget</span><select name="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>{BUDGETS.map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
          <label className="field"><span>What should it do?</span><textarea name="about" rows={4} placeholder="Who uses it, what they need to get done, and anything you already have." /></label>
          <div className="brief__send">
            <Magnetic as="button" className="btn btn--light" type="submit" data-cursor="Send">Send the brief <span aria-hidden="true">→</span></Magnetic>
            <p className="brief__status" role="status">
              {status.html
                ? <>That didn&apos;t send. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> instead and we&apos;ll reply within a day.</>
                : status.text}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
