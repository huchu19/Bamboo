import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/bamboo/SiteNav';

export const metadata: Metadata = {
  title: 'Terms of Service · Bamboo',
  description: 'The terms governing your use of Bamboo.',
};

const UPDATED = 'June 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
          Legal
        </p>
        <h1 className="font-display text-5xl uppercase tracking-tighter mt-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-3">Last updated: {UPDATED}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <p>
              These Terms govern your use of Bamboo, an invite-only beta marketplace. By creating an
              account you agree to these Terms and to our{' '}
              <Link href="/privacy" className="text-[color:var(--gold)] hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the service.
            </p>
          </section>

          <Section title="1. Eligibility & invites">
            <p>
              Bamboo is currently open only to invited participants. You must be at least 18 and
              provide accurate registration details. You are responsible for keeping your account
              credentials secure and for activity under your account.
            </p>
          </Section>

          <Section title="2. Not investment advice">
            <p>
              Bamboo is a platform, not a broker-dealer, investment adviser, or fund. Nothing on the
              service is financial, legal, or tax advice. Pitches are presented by inventors; we do
              not endorse them or guarantee their accuracy. Investing in early-stage ventures is
              high-risk and you may lose your entire investment. Make your own decisions and seek
              professional advice.
            </p>
          </Section>

          <Section title="3. For inventors">
            <p>
              You must own or have the rights to the content you upload, and your pitch must be
              truthful and not misleading. Listing a pitch requires a one-time{' '}
              <strong>$49 listing fee</strong>. Submitted pitches enter a review queue and go live
              only after approval; a rejected pitch has its listing fee refunded. You are responsible
              for honoring any terms you offer to investors.
            </p>
          </Section>

          <Section title="4. For investors">
            <p>
              Investments are made at your own risk. Funds are processed via Stripe. You authorize
              the charge shown at checkout. Refunds occur where a pitch is cancelled or rejected, per
              the flows described in the product; processing times depend on Stripe and your bank.
            </p>
          </Section>

          <Section title="5. Payments, fees & refunds">
            <p>
              Payments are handled by Stripe under their terms. We are not responsible for Stripe
              outages or bank delays. Listing fees are refundable only when a pitch is rejected in
              review. Investment refunds follow the cancellation and rejection flows built into the
              platform.
            </p>
          </Section>

          <Section title="6. Acceptable use">
            <p>
              Do not use Bamboo to defraud, post unlawful or infringing content, attempt to bypass
              security or access controls, or disrupt the service. We may suspend or remove accounts
              and content that violate these Terms.
            </p>
          </Section>

          <Section title="7. Beta service & changes">
            <p>
              Bamboo is provided &quot;as is&quot; during an early beta and may contain bugs or change
              without notice. We may modify or discontinue features, and may update these Terms; your
              continued use after an update means you accept the revised Terms.
            </p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>
              To the fullest extent permitted by law, Bamboo and its operators are not liable for any
              indirect, incidental, or consequential losses, or for investment losses arising from
              your use of the service. Our total liability for any claim is limited to the fees you
              paid us in the 12 months before the claim.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about these Terms? Reach us via the{' '}
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
