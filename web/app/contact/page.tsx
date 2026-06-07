'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-[color:var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[color:var(--gold)]" />
            <span className="font-display text-2xl uppercase tracking-tighter">Bamboo</span>
          </Link>
          <Link
            href="/"
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Grove
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-12">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
            Get in touch
          </span>
          <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter mt-3">
            Talk to the grove
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl leading-relaxed">
            Pricing and onboarding are being finalised. Share a few details and our team
            will reach out with next steps tailored to your pitch or portfolio.
          </p>
        </div>

        {submitted ? (
          <div className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-10 text-center">
            <div className="size-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <span className="size-3 rounded-full bg-primary" />
            </div>
            <h2 className="font-display text-3xl uppercase tracking-tighter mb-3">
              Roots received
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thanks, {firstName || 'friend'}. We&rsquo;ll be in touch at{' '}
              <span className="font-mono text-foreground">{email}</span> shortly.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all text-sm uppercase tracking-widest"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-8 md:p-10 space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Field
                label="First name"
                required
                value={firstName}
                onChange={setFirstName}
                autoComplete="given-name"
              />
              <Field
                label="Last name"
                required
                value={lastName}
                onChange={setLastName}
                autoComplete="family-name"
              />
            </div>

            <Field
              label="Email"
              type="email"
              required
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <Field
              label="Phone number"
              type="tel"
              required
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
            />

            <Field
              label="Company name"
              hint="Optional"
              value={companyName}
              onChange={setCompanyName}
              autoComplete="organization"
            />

            <button
              type="submit"
              className="w-full py-4 bg-[color:var(--ink)] text-[color:var(--ink-foreground)] font-bold rounded-xl hover:opacity-90 transition-all text-sm uppercase tracking-widest"
            >
              Send message
            </button>

            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
              We typically reply within one business day
            </p>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  hint,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
          {required && <span className="text-[color:var(--gold)] ml-1">*</span>}
        </span>
        {hint && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
            {hint}
          </span>
        )}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 bg-background border border-[color:var(--input)] rounded-lg text-sm focus:outline-none focus:border-foreground transition-colors"
      />
    </label>
  );
}
