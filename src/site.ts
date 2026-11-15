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
