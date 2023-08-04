import { Effect } from 'src/app/models/effect.model';

interface MagicData {
  name: string;
  manaCost: number;
  minDamage: number;
  maxDamage: number;
  accuracy: number;
  targets: number;
  textColor: string;
  effect: Partial<Effect>[];
}

export const spells: MagicData[] = [
  {
    name: 'Fireball',
    manaCost: 11,
    minDamage: 6,
    maxDamage: 12,
    accuracy: 80,
    targets: 2,
    textColor: 'redText',
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
    accuracy: 80,
    targets: 1,
    textColor: 'lightBlueText',
    effect: [],
  },

  {
    name: 'Poison Bolt',
    manaCost: 10,
    minDamage: 3,
    maxDamage: 5,
    accuracy: 80,
    targets: 1,
    textColor: 'greenText',
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
  
  {
    name: 'Enrage',
    manaCost: 12,
    minDamage: 0,
    maxDamage: 0,
    accuracy: 100,
    targets: 0,
    textColor: 'redText',
    effect: [
      {
        name: 'rage',
        duration: 4,
        modifier: null,
        self: true,
        helpDescription: 'Attack randomly, unable to choose a target or special ability',
      },
      {
        name: 'strength',
        duration: 4,
        modifier: 5,
        self: true,
        helpDescription: 'Increase attack power',
      },
    ],
  },

];
