import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/bamboo/SiteNav';

export const metadata: Metadata = {
  title: 'Privacy Policy · Bamboo',
  description: 'How Bamboo collects, uses, and protects your data.',
};

const UPDATED = 'June 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
          Legal
        </p>
        <h1 className="font-display text-5xl uppercase tracking-tighter mt-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-3">Last updated: {UPDATED}</p>

        <div className="prose-bamboo mt-10 space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <p>
              Bamboo (&quot;we&quot;, &quot;us&quot;) operates an invite-only beta marketplace
              connecting inventors raising capital with investors. This policy explains what we
              collect and why. By using Bamboo you agree to this policy and our{' '}
              <Link href="/terms" className="text-[color:var(--gold)] hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </section>

          <Section title="1. Information we collect">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account data</strong> — your name, email, password (stored hashed by
                Firebase Authentication), and whether you joined as an inventor or investor.
              </li>
              <li>
                <strong>Pitch content</strong> — for inventors: the videos, documents, funding
                terms, and descriptions you upload.
              </li>
              <li>
                <strong>Investment records</strong> — amounts, the pitches you back, and equity
                portions, stored against your account.
              </li>
              <li>
                <strong>Payment data</strong> — processed entirely by Stripe. We never see or store
                your full card number; we keep only Stripe identifiers needed to reconcile a
                payment, refund, or receipt.
              </li>
              <li>
                <strong>Technical data</strong> — basic logs and error reports (via Sentry) to keep
                the service running and diagnose problems.
              </li>
            </ul>
          </Section>

          <Section title="2. How we use it">
            <p>
              To operate the marketplace: authenticate you, publish pitches, process listing fees
              and investments, send transactional receipts, prevent abuse, and improve the product.
              We do not sell your personal data.
            </p>
          </Section>

          <Section title="3. Who we share it with">
            <p>
              Service providers who process data on our behalf: <strong>Google Firebase</strong>{' '}
              (authentication, database, file storage), <strong>Stripe</strong> (payments), and{' '}
              <strong>Sentry</strong> (error monitoring). Inventors and investors see each other only
              to the extent the product requires — for example, a founder sees who invested unless
              that investor chose to invest anonymously.
            </p>
          </Section>

          <Section title="4. Data retention">
            <p>
              We keep your account and transaction records for as long as your account is active and
              as needed to comply with legal, tax, and accounting obligations. You can request
              deletion of your account by contacting us; some records tied to completed payments may
              be retained where the law requires.
            </p>
          </Section>

          <Section title="5. Your choices">
            <p>
              You can access and update your profile in your dashboard, and request a copy or
              deletion of your data by emailing us. Because this is an early beta, some controls are
              handled manually — reach out and we will action your request.
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              Data is encrypted in transit. Access to the database is governed by Firestore security
              rules, and payment card data is handled by Stripe under PCI-DSS. No system is perfectly
              secure, but we work to protect your information and will notify you of any breach
              affecting your account as required by law.
            </p>
          </Section>

          <Section title="7. Beta disclaimer">
            <p>
              Bamboo is a limited beta offered to roughly 100 invited participants. Features and data
              handling may change as the product evolves; we will update this policy and the
              &quot;last updated&quot; date when they do.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              Questions about this policy? Reach us via the{' '}
              <Link href="/contact" className="text-[color:var(--gold)] hover:underline">
                contact page
              </Link>
              .
            </p>
          </Section>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}
