import { Effect } from 'src/app/models/effect.model';

interface MagicData {
  name: string;
  manaCost: number;
  minDamage: number;
  maxDamage: number;
  targets: number;
  effect: Partial<Effect>[];
}

export const spells: MagicData[] = [
  {
    name: 'Fireball',
    manaCost: 11,
    minDamage: 6,
    maxDamage: 12,
    targets: 2,
    effect: [
      {
        name: 'burn',
        duration: 4,
        modifier: 5,
        self: false,
        helpDescription: 'Take fire damage over time',
      },
    ],
  },

  {
    name: 'Ice Shard',
    manaCost: 8,
    minDamage: 4,
    maxDamage: 10,
    targets: 1,
    effect: [],
  },

  {
    name: 'Poison Bolt',
    manaCost: 10,
    minDamage: 3,
    maxDamage: 5,
    targets: 1,
    effect: [
      {
        name: 'poison',
        duration: 4,
        modifier: 5,
        self: false,
        helpDescription: 'Take poison damage over time',
      },
    ],
  },
];
