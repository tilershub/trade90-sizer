// Knowledge architecture registry — one entry per content hub.
export interface HubConfig {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  accent: string; // tailwind text color for the hub tag
}

export const HUBS: Record<string, HubConfig> = {
  'psychology': {
    slug: 'psychology',
    name: 'Trading Psychology',
    shortName: 'Psychology',
    tagline: 'The mental game of funded trading',
    description:
      'Why disciplined traders keep funded accounts and talented traders lose them. Practical frameworks for discipline, losing streaks, and emotional control.',
    accent: 'text-sky-400',
  },
  'risk-management': {
    slug: 'risk-management',
    name: 'Risk Management',
    shortName: 'Risk',
    tagline: 'Protect the account first',
    description:
      'Position sizing, daily loss limits, drawdown mechanics, and risk of ruin — the mathematics that decides whether your account survives long enough for your edge to work.',
    accent: 'text-emerald-400',
  },
  'trading-plans': {
    slug: 'trading-plans',
    name: 'Trading Plans',
    shortName: 'Plans',
    tagline: 'Structure before execution',
    description:
      'How to build a written trading plan, professional daily routines, and instrument-specific plan frameworks for indices, gold, and forex.',
    accent: 'text-amber-400',
  },
  'prop-firms': {
    slug: 'prop-firms',
    name: 'Prop Firms',
    shortName: 'Prop Firms',
    tagline: 'Evaluations, rules, and funded accounts',
    description:
      'How prop firm challenges actually work: rule structures, drawdown models, firm comparisons, and what changes once you are funded.',
    accent: 'text-purple-400',
  },
  'performance': {
    slug: 'performance',
    name: 'Performance',
    shortName: 'Performance',
    tagline: 'Measure, review, improve',
    description:
      'Trading journals, expectancy, win rate and profit factor, and the monthly review process that turns trade data into improvement.',
    accent: 'text-rose-400',
  },
};

export const HUB_ORDER = ['psychology', 'risk-management', 'trading-plans', 'prop-firms', 'performance'];

export function getHub(slug: string): HubConfig {
  const hub = HUBS[slug];
  if (!hub) throw new Error(`Unknown hub: ${slug}`);
  return hub;
}
