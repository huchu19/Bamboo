export type MockInvestment = {
  id: string;
  pitchId: "oxo" | "ledgr" | "northbound";
  amount: number;
  equityPct: number;
  date: string;
  status: "completed" | "processing";
};

export type ActivityKind = "tick" | "doc" | "back";

export type ActivityEntry = {
  kind: ActivityKind;
  copy: string;
  when: string;
};

export const INVESTMENTS: MockInvestment[] = [
  { id: "inv-1", pitchId: "oxo",        amount: 25000, equityPct: 0.14, date: "2026-02-14", status: "completed" },
  { id: "inv-2", pitchId: "ledgr",      amount: 50000, equityPct: 0.09, date: "2026-03-22", status: "completed" },
  { id: "inv-3", pitchId: "northbound", amount: 15000, equityPct: 0.02, date: "2026-05-01", status: "processing" },
];

export const WATCHLIST_IDS = ["tendr", "atlas", "verba"] as const;

export const ACTIVITY: ActivityEntry[] = [
  { kind: "tick", copy: "Oxo crossed 60% raised",               when: "2h" },
  { kind: "doc",  copy: "Ledgr uploaded Q1 update",             when: "1d" },
  { kind: "back", copy: "Northbound · 4 new backers this week", when: "2d" },
  { kind: "tick", copy: "Oxo Root Score climbed to 92",         when: "4d" },
];

export const PORTFOLIO_TARGET = 150_000;
