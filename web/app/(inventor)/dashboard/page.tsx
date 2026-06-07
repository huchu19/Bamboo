'use client';

import { useState } from "react";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooLeaf } from "@/components/bamboo/BambooIcons";
import { BambooProgress } from "@/components/bamboo/BambooProgress";

const PITCH_STATUS = {
  status: "Live",
  verified: true,
  views: 4218,
  watchTimeAvg: "48s",
  saves: 312,
  inquiries: 47,
  raised: 62,
  raisedAmount: "$1.49M",
  goal: "$2.4M",
};

export default function DashboardPage() {
  const [tab, setTab] = useState<"overview" | "upload" | "billing">("overview");

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Founder Console
            </span>
            <h1 className="font-display text-6xl uppercase tracking-tighter mt-2">
              Command Deck
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Tend your grove.</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill label={PITCH_STATUS.status} verified={PITCH_STATUS.verified} />
            <button className="text-xs font-bold uppercase tracking-widest px-5 py-2.5 bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground rounded-full hover:opacity-90 transition-all flex items-center gap-1.5">
              <BambooLeaf size={11} className="text-[color:var(--gold)]" /> New Seed
            </button>
          </div>
        </header>

        <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit mb-8">
          {(["overview", "upload", "billing"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all ${
                tab === t
                  ? "bg-[color:var(--ink)] text-[color:var(--ink-foreground)] shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview />}
        {tab === "upload" && <UploadPanel />}
        {tab === "billing" && <BillingPanel />}
      </div>
    </div>
  );
}

function StatusPill({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card ring-1 ring-[color:var(--border)]">
      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{label}</span>
      {verified && <BambooLeaf size={11} className="text-[color:var(--gold)]" />}
    </div>
  );
}

function Overview() {
  const stats = [
    { k: "Views", v: PITCH_STATUS.views.toLocaleString(), trend: "+24%" },
    { k: "Avg Watch", v: PITCH_STATUS.watchTimeAvg, trend: "+6s" },
    { k: "Saves", v: PITCH_STATUS.saves.toString(), trend: "+11%" },
    { k: "Inquiries", v: PITCH_STATUS.inquiries.toString(), trend: "+8" },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-3xl p-8 ring-1 ring-white/10 bamboo-grain">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                Round Progress · Bamboo Segments
              </p>
              <p className="font-display text-5xl uppercase tracking-tighter mt-2 text-[color:var(--gold)]">
                {PITCH_STATUS.raisedAmount}
              </p>
              <p className="text-sm text-white/60 mt-1">of {PITCH_STATUS.goal} target</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">Bloomed</p>
              <p className="font-display text-4xl text-[color:var(--gold)]">{PITCH_STATUS.raised}%</p>
            </div>
          </div>
          <BambooProgress value={PITCH_STATUS.raised} segments={10} />
        </section>

        <section className="grid grid-cols-2 gap-px bg-[color:var(--border)] rounded-2xl overflow-hidden ring-1 ring-[color:var(--border)]">
          {stats.map((s) => (
            <div key={s.k} className="bg-card p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {s.k}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="font-display text-3xl uppercase tracking-tighter">{s.v}</p>
                <span className="text-[10px] font-mono text-primary">{s.trend}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl">
          <header className="flex items-center justify-between p-5 border-b border-[color:var(--border)]">
            <h2 className="font-display text-2xl uppercase tracking-tighter">Inbound</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Last 7 days
            </span>
          </header>
          <ul className="divide-y divide-[color:var(--border)]">
            {[
              { name: "Cassia Capital", note: "Wants intro call this week", amount: "$250K", time: "2h" },
              { name: "Marcus Ng", note: "Reviewing financials", amount: "$50K", time: "6h" },
              { name: "Veritas Syndicate", note: "Soft commit · pending NDA", amount: "$500K", time: "1d" },
              { name: "Olivia Bishop", note: "Requested cap table", amount: "$25K", time: "2d" },
            ].map((row) => (
              <li key={row.name} className="flex items-center justify-between p-5 hover:bg-secondary transition-all">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-[color:var(--ink)] text-[color:var(--ink-foreground)] flex items-center justify-center font-bold text-xs">
                    {row.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-[color:var(--gold)]">{row.amount}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {row.time} ago
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6">
          <h3 className="font-display text-xl uppercase tracking-tighter mb-4">Root Score</h3>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-5xl text-[color:var(--gold)]">92</p>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </div>
          <ul className="space-y-2 mt-5 text-xs">
            {[
              ["Identity verified", true],
              ["Financials uploaded", true],
              ["Cap table verified", true],
              ["Founder interview", false],
            ].map(([label, done]) => (
              <li key={label as string} className="flex items-center gap-2">
                {done ? (
                  <BambooLeaf size={11} className="text-[color:var(--gold)]" />
                ) : (
                  <span className="size-2.5 rounded-full border border-muted-foreground" />
                )}
                <span className={done ? "" : "text-muted-foreground"}>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-gradient-to-br from-[color:var(--ink)] to-primary text-[color:var(--ink-foreground)] rounded-2xl p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">Boost</p>
          <h3 className="font-display text-2xl uppercase tracking-tighter mt-2">
            Feature your pitch
          </h3>
          <p className="text-xs text-white/70 mt-2">
            Lock the top of Discover for 7 days. Avg +4× views.
          </p>
          <button className="mt-4 w-full py-2.5 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all">
            Contact Us · Boost
          </button>
        </section>
      </aside>
    </div>
  );
}

function UploadPanel() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6">
        <h2 className="font-display text-3xl uppercase tracking-tighter mb-1">60s Pitch Video</h2>
        <p className="text-xs text-muted-foreground mb-6">
          MP4 or MOV · max 200 MB · 9:16 or 16:9
        </p>
        <div className="aspect-video border-2 border-dashed border-[color:var(--input)] rounded-xl flex flex-col items-center justify-center text-center p-8 hover:border-foreground transition-all cursor-pointer">
          <div className="size-14 rounded-full bg-secondary flex items-center justify-center text-2xl mb-3">
            ⬆
          </div>
          <p className="font-bold">Drop your pitch here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        </div>
      </section>

      <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6">
        <h2 className="font-display text-3xl uppercase tracking-tighter mb-1">Vault Documents</h2>
        <p className="text-xs text-muted-foreground mb-6">
          PDF, DOCX, XLSX · max 25 MB per file
        </p>
        <div className="space-y-2">
          {["Business Plan", "Financial Model", "Pitch Deck", "Cap Table"].map((d) => (
            <button
              key={d}
              className="w-full flex items-center justify-between p-3 border border-dashed border-[color:var(--input)] rounded-lg hover:border-foreground hover:bg-secondary transition-all"
            >
              <span className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">+</span>
                {d}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Upload
              </span>
            </button>
          ))}
        </div>

        <button className="mt-6 w-full py-3 bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all">
          Save & Publish →
        </button>
      </section>
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-8">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Listing Fee
        </p>
        <p className="font-display text-5xl uppercase tracking-tighter mt-2">Contact Us</p>
        <p className="text-xs text-muted-foreground mt-1">Pricing finalised on listing</p>
        <div className="mt-6 pt-6 border-t border-[color:var(--border)] text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Speak with our team to plant your pitch
        </div>
      </div>

      <div className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-2xl p-8 ring-1 ring-white/10">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
          Verified Badge
        </p>
        <p className="font-display text-5xl uppercase tracking-tighter mt-2 text-[color:var(--gold)]">Contact Us</p>
        <p className="text-xs text-white/60 mt-1">Pricing finalised on verification</p>
        <button className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
          Talk to our team
        </button>
      </div>
    </div>
  );
}
