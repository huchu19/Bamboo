export type FounderMilestone = {
  date: string;
  label: string;
  detail?: string;
  kind: 'founded' | 'verified' | 'milestone' | 'pitch' | 'raise';
};

export type Backer = {
  name: string;
  kind: 'Lead' | 'Syndicate' | 'Angel';
};

export type Founder = {
  id: string;
  name: string;
  location: string;
  bio: string;
  activeSince: string;
  rootVerified: boolean;
  followers: number;
  milestones: FounderMilestone[];
  backers: Backer[];
};

export const FOUNDERS: Founder[] = [
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    location: 'Austin, TX',
    bio: 'Mechanical engineer turned grower. Building hardware that pays its rent in lettuce.',
    activeSince: '2024-03',
    rootVerified: true,
    followers: 184,
    milestones: [
      { date: '2023-08', label: 'Founded Oxo', kind: 'founded' },
      { date: '2024-02', label: 'First prototype shipped', detail: '12 units to design partners', kind: 'milestone' },
      { date: '2024-09', label: 'Root-Verified', kind: 'verified' },
      { date: '2025-01', label: 'Listed seed round', detail: '$2.4M ask · 13% equity', kind: 'pitch' },
      { date: '2026-02', label: 'Crossed 62% raised', detail: '47 backers · 18 days left', kind: 'raise' },
    ],
    backers: [
      { name: 'Sequoia Scout', kind: 'Lead' },
      { name: 'AngelList Syndicate', kind: 'Syndicate' },
      { name: 'Cassia Capital', kind: 'Angel' },
    ],
  },
  {
    id: 'daniel-okafor',
    name: 'Daniel Okafor',
    location: 'Lagos, NG',
    bio: 'Fintech operator. Previously ran payments at a pan-African bank. Done waiting on correspondent rails.',
    activeSince: '2022-11',
    rootVerified: true,
    followers: 612,
    milestones: [
      { date: '2022-11', label: 'Founded Ledgr', kind: 'founded' },
      { date: '2023-06', label: 'Seed round closed', detail: '$1.8M · led by Future Africa', kind: 'raise' },
      { date: '2024-04', label: 'Root-Verified', kind: 'verified' },
      { date: '2025-09', label: 'Listed Series A', detail: '$8M ask · 9% equity', kind: 'pitch' },
      { date: '2026-03', label: '81% raised · 112 backers', kind: 'raise' },
    ],
    backers: [
      { name: 'Future Africa', kind: 'Lead' },
      { name: 'Norrsken', kind: 'Syndicate' },
      { name: 'Greycroft Scout', kind: 'Angel' },
    ],
  },
  {
    id: 'iris-lindqvist',
    name: 'Iris Lindqvist',
    location: 'Stockholm, SE',
    bio: 'Metallurgist. Spent a decade decarbonizing the dirtiest industry on earth.',
    activeSince: '2021-04',
    rootVerified: true,
    followers: 298,
    milestones: [
      { date: '2021-04', label: 'Founded Northbound', kind: 'founded' },
      { date: '2023-11', label: 'First hydrogen pilot', kind: 'milestone' },
      { date: '2024-12', label: 'Root-Verified', kind: 'verified' },
      { date: '2025-08', label: 'Listed Series A', detail: '$12M ask · 15% equity', kind: 'pitch' },
    ],
    backers: [
      { name: 'Breakthrough Energy', kind: 'Lead' },
      { name: 'Khosla Ventures', kind: 'Syndicate' },
    ],
  },
  {
    id: 'jules-park',
    name: 'Jules Park',
    location: 'Seoul, KR',
    bio: 'Former ER nurse, then ops at a digital health unicorn. Now staffing the staffing problem.',
    activeSince: '2024-01',
    rootVerified: false,
    followers: 76,
    milestones: [
      { date: '2024-01', label: 'Founded Tendr', kind: 'founded' },
      { date: '2024-08', label: 'Pilot at two hospitals', kind: 'milestone' },
      { date: '2025-11', label: 'Listed seed round', detail: '$3.1M ask · 14% equity', kind: 'pitch' },
    ],
    backers: [
      { name: 'Rebel Fund', kind: 'Lead' },
      { name: 'Korean Angel Network', kind: 'Syndicate' },
    ],
  },
  {
    id: 'wen-zhao',
    name: 'Wen Zhao',
    location: 'Shenzhen, CN',
    bio: 'Robotics PhD. Built three warehouse automation MVPs before this one stuck.',
    activeSince: '2022-07',
    rootVerified: true,
    followers: 421,
    milestones: [
      { date: '2022-07', label: 'Founded Atlas Robotics', kind: 'founded' },
      { date: '2023-09', label: 'First retrofit deployment', detail: '14 forklifts at a 3PL', kind: 'milestone' },
      { date: '2024-05', label: 'Root-Verified', kind: 'verified' },
      { date: '2025-10', label: 'Listed seed round', detail: '$5M ask · 11% equity', kind: 'pitch' },
    ],
    backers: [
      { name: 'GGV', kind: 'Lead' },
      { name: 'Foxconn Ventures', kind: 'Syndicate' },
      { name: 'Plug & Play', kind: 'Angel' },
    ],
  },
  {
    id: 'lina-marin',
    name: 'Lina Marin',
    location: 'Mexico City, MX',
    bio: 'Indie filmmaker first, ML engineer second. Built Verba because she got tired of bad dubs.',
    activeSince: '2025-02',
    rootVerified: false,
    followers: 39,
    milestones: [
      { date: '2025-02', label: 'Founded Verba', kind: 'founded' },
      { date: '2025-07', label: '38-language demo released', kind: 'milestone' },
      { date: '2026-01', label: 'Listed pre-seed', detail: '$900K ask · 18% equity', kind: 'pitch' },
    ],
    backers: [
      { name: 'Latitud', kind: 'Lead' },
      { name: 'Y Combinator Alumni', kind: 'Syndicate' },
    ],
  },
];

export function getFounder(id: string): Founder | undefined {
  return FOUNDERS.find((f) => f.id === id);
}
