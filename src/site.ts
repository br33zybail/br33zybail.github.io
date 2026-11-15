export const GROUPS = {
  platform: {
    name: 'Revenue platform',
    blurb: 'A revenue-intelligence app I built alone at a Series C software company. Each part is its own entry.',
  },
  fastscribe: { name: 'FastScribe', blurb: 'My transcription product, live on open speech models and my own GPU.' },
  nearbywatch: { name: 'NearbyWatch', blurb: 'Nashville public records, resolved to the parcel. Pipeline finished, app to come.' },
  zcash: { name: 'Zcash Crosslink', blurb: 'Running a finalizer on the testnet and sending fixes upstream.' },
  workstation: { name: 'Home AI stack', blurb: 'One server, local and cloud models, and races before any model is adopted.' },
} as const;

export const KINDS = {
  ai: 'AI',
  data: 'Data',
  revops: 'Revenue ops',
  infra: 'Infrastructure',
  security: 'Security',
} as const;

export type GroupKey = keyof typeof GROUPS;
export type KindKey = keyof typeof KINDS;

export const SHOT_ALT: Record<string, string> = {
  'study-home.png': 'Design study of a morning brief: a written greeting, overnight counts and a ranked queue, on a dark ground',
  'study-queue.png': 'Design study of an attention queue: one decision shown as a table of field changes with an approve button',
  'study-territory.png': 'Design study of a territory designer: a map of regions with accounts, beside each rep\'s assignments and capacity',
  'study-projection.png': 'Design study of a revenue projection: a headline figure, a stated range and a fan chart',
  'study-practice.png': 'Design study of a coaching page: an objection drill with a score ring and an AI buyer persona',
  'study-signals.png': 'Design study of a signals page: a timeline of account events with an evidence pane',
  'study-account-dashboard.png': 'Design study of a company page: source freshness, a narrative brief and a timeline',
  'panel-paper-queue.jpg': 'Generated image of an attention queue on a paper ground: numbered items, field changes and cited evidence chips',
  'panel-seedream-home.jpg': 'Generated image of a dark home page: one decision at the top above three columns',
  'fastscribe-home-top.png': 'FastScribe home page: a dusk landscape with the line "Speak. It becomes a page." and buttons to speak or upload',
  'fastscribe-transcribe.png': 'FastScribe upload page with a drop zone and tape-reel art',
  'fastscribe-pricing.png': 'FastScribe pricing: a free plan, a monthly plan and pay-per-upload credits',
  'fastscribe-guide-whisper-speed-benchmarks.png': 'FastScribe guide on whisper speed benchmarks, with a reel recorder and stopwatch',
  'fastscribe-guide-language-accuracy.png': 'FastScribe guide on accuracy by language, from Spanish at 3.7% error to Hindi at 48.5%',
  'fastscribe-guides-index.png': 'FastScribe guides index page',
  'nearbywatch-mock-landing.png': 'NearbyWatch landing page design: "See what the city is planning near your home", with an address box',
  'nearbywatch-mock-report.png': 'NearbyWatch address report design: nearby rezonings and development plans in plain English, sorted by impact',
};
