import { getDemoAsset } from "./demo-assets";

export type PitchDocument = {
  label: string;
  /** Path under /public, e.g. "/demo/oxo/deck.pdf". */
  url: string;
  /** Bytes or pretty string — purely for display. */
  size?: string;
};

export type Pitch = {
  id: string;
  company: string;
  founder: string;
  founderId: string;
  hook: string;
  sector: string;
  stage: "Pre-Seed" | "Seed" | "Series A";
  asking: string;
  valuation: string;
  raised: number;
  investors: number;
  verified: boolean;
  daysLeft: number;
  posterColor: string;
  equityOffered: number;
  traction: number[];
  location: string;
  /**
   * Real demo assets — only populated for the 3 pitches we showcase.
   * Drop files into /web/public/demo/{id}/ and set the paths below.
   */
  isDemo?: boolean;
  videoUrl?: string;
  posterUrl?: string;
  documents?: PitchDocument[];
};

export const PITCHES: Pitch[] = [
  {
    id: "oxo",
    company: "Oxo",
    founder: "Maya Chen",
    founderId: "maya-chen",
    hook: "Vertical home farms that pay for themselves in 14 months.",
    sector: "Hardware",
    stage: "Seed",
    asking: "$2.4M",
    valuation: "$18M",
    raised: 62,
    investors: 47,
    verified: true,
    daysLeft: 18,
    posterColor: "from-emerald-900 to-stone-900",
    equityOffered: 13,
    traction: [4, 6, 9, 8, 12, 18, 24, 31, 40, 48, 55, 62],
    location: "Austin, TX",
    isDemo: true,
    videoUrl: getDemoAsset("oxo", "video"),
    posterUrl: getDemoAsset("oxo", "poster"),
    documents: [
      { label: "Pitch Deck", url: "/demo/oxo/deck.pdf", size: "4.2 MB" },
      { label: "Financial Model", url: "/demo/oxo/financials.pdf", size: "1.1 MB" },
      { label: "Unit Economics", url: "/demo/oxo/unit-economics.pdf", size: "780 KB" },
    ],
  },
  {
    id: "ledgr",
    company: "Ledgr",
    founder: "Daniel Okafor",
    founderId: "daniel-okafor",
    hook: "Stripe for emerging-market B2B settlements.",
    sector: "Fintech",
    stage: "Series A",
    asking: "$8M",
    valuation: "$54M",
    raised: 81,
    investors: 112,
    verified: true,
    daysLeft: 6,
    posterColor: "from-amber-900 to-stone-950",
    equityOffered: 9,
    traction: [12, 15, 22, 28, 35, 44, 52, 61, 68, 73, 78, 81],
    location: "Lagos, NG",
    isDemo: true,
    videoUrl: getDemoAsset("ledgr", "video"),
    posterUrl: getDemoAsset("ledgr", "poster"),
    documents: [
      { label: "Pitch Deck", url: "/demo/ledgr/deck.pdf", size: "3.8 MB" },
      { label: "Market Analysis", url: "/demo/ledgr/market.pdf", size: "2.3 MB" },
      { label: "Regulatory Memo", url: "/demo/ledgr/regulatory.pdf", size: "640 KB" },
    ],
  },
  {
    id: "northbound",
    company: "Northbound",
    founder: "Iris Lindqvist",
    founderId: "iris-lindqvist",
    hook: "Carbon-negative steel via hydrogen reduction.",
    sector: "ClimateTech",
    stage: "Series A",
    asking: "$12M",
    valuation: "$90M",
    raised: 41,
    investors: 23,
    verified: true,
    daysLeft: 31,
    posterColor: "from-zinc-800 to-zinc-950",
    equityOffered: 15,
    traction: [2, 4, 6, 8, 11, 14, 18, 22, 27, 32, 37, 41],
    location: "Stockholm, SE",
    isDemo: true,
    videoUrl: getDemoAsset("northbound", "video"),
    posterUrl: getDemoAsset("northbound", "poster"),
    documents: [
      { label: "Pitch Deck", url: "/demo/northbound/deck.pdf", size: "5.6 MB" },
      { label: "Technical Whitepaper", url: "/demo/northbound/whitepaper.pdf", size: "3.1 MB" },
      { label: "LCA Report", url: "/demo/northbound/lca.pdf", size: "1.4 MB" },
    ],
  },
  {
    id: "tendr",
    company: "Tendr",
    founder: "Jules Park",
    founderId: "jules-park",
    hook: "On-demand healthcare staffing — TaskRabbit for nurses.",
    sector: "Healthcare",
    stage: "Seed",
    asking: "$3.1M",
    valuation: "$22M",
    raised: 35,
    investors: 19,
    verified: false,
    daysLeft: 22,
    posterColor: "from-rose-900 to-stone-950",
    equityOffered: 14,
    traction: [3, 5, 7, 9, 11, 14, 17, 20, 24, 28, 32, 35],
    location: "Seoul, KR",
  },
  {
    id: "atlas",
    company: "Atlas Robotics",
    founder: "Wen Zhao",
    founderId: "wen-zhao",
    hook: "Warehouse autonomy retrofitted onto existing forklifts.",
    sector: "Hardware",
    stage: "Seed",
    asking: "$5M",
    valuation: "$30M",
    raised: 58,
    investors: 38,
    verified: true,
    daysLeft: 12,
    posterColor: "from-slate-800 to-slate-950",
    equityOffered: 11,
    traction: [6, 9, 14, 19, 25, 30, 36, 41, 47, 51, 55, 58],
    location: "Shenzhen, CN",
  },
  {
    id: "verba",
    company: "Verba",
    founder: "Lina Marin",
    founderId: "lina-marin",
    hook: "AI dubbing for indie filmmakers in 38 languages.",
    sector: "Media",
    stage: "Pre-Seed",
    asking: "$900K",
    valuation: "$8M",
    raised: 24,
    investors: 11,
    verified: false,
    daysLeft: 27,
    posterColor: "from-indigo-900 to-stone-950",
    equityOffered: 18,
    traction: [1, 2, 3, 5, 7, 9, 12, 15, 18, 21, 23, 24],
    location: "Mexico City, MX",
  },
];

export function getPitch(id: string): Pitch | undefined {
  return PITCHES.find((p) => p.id === id);
}

export function getPitchesByFounder(founderId: string): Pitch[] {
  return PITCHES.filter((p) => p.founderId === founderId);
}

export const DEMO_PITCHES: Pitch[] = PITCHES.filter((p) => p.isDemo);
