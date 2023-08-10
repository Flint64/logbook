import { Effect } from 'src/app/models/effect.model';

interface MagicData {
  name: string;
  manaCost: number;
  power: number;
  accuracy: number;
  variance: number;
  targets: number;
  self: boolean;
  textColor: string;
  effect: Partial<Effect>[];
}

export const spells: MagicData[] = [
  {
    name: 'Fireball',
    manaCost: 11,
    power: 6,
    accuracy: 80,
    variance: 6,
    targets: 2,
    self: false,
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
    power: 4,
    accuracy: 80,
    variance: 2,
    targets: 1,
    self: false,
    textColor: 'lightBlueText',
    effect: [],
  },

  {
    name: 'Poison Bolt',
    manaCost: 10,
    power: 3,
    accuracy: 80,
    variance: 2,
    targets: 1,
    self: false,
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
    power: 0,
    accuracy: 100,
    variance: 0,
    targets: 0,
    self: true,
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
