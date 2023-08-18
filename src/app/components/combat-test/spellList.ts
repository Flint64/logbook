import { Effect } from 'src/app/models/effect.model';

interface MagicData {
  name: string;
  manaCost: number;
  power: number;
  accuracy: number;
  variance: number;
  targets: number;
  canTargetParty: boolean;
  canTargetEnemies: boolean;
  textColor: string;
  effects: Partial<Effect>[];
}

export const spells: MagicData[] = [
  {
    name: 'Fireball',
    manaCost: 11,
    power: 6,
    accuracy: 80,
    variance: 6,
    targets: 2,
    canTargetParty: false,
    canTargetEnemies: true,
    textColor: 'redText',
    effects: [
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
    canTargetParty: false,
    canTargetEnemies: true,
    textColor: 'lightBlueText',
    effects: [],
  },

  {
    name: 'Poison Bolt',
    manaCost: 10,
    power: 3,
    accuracy: 80,
    variance: 2,
    targets: 1,
    canTargetParty: false,
    canTargetEnemies: true,
    textColor: 'greenText',
    effects: [
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
    canTargetParty: true,
    canTargetEnemies: false,
    textColor: 'redText',
    effects: [
      {
        name: 'rage',
        duration: 4,
        modifier: null,
        self: false,
        helpDescription: 'Attack randomly, unable to choose a target or special ability',
      },
      {
        name: 'strength',
        duration: 4,
        modifier: 5,
        self: false,
        helpDescription: 'Increase attack power',
      },
    ],
  },

  {
    name: 'Healing Wave',
    manaCost: 12,
    power: 0,
    accuracy: 100,
    variance: 0,
    targets: 0,
    canTargetParty: true,
    canTargetEnemies: false,
    textColor: 'pinkText',
    effects: [
      {
        name: 'health',
        duration: 0,
        modifier: 25,
        self: false,
        helpDescription: 'Restore health',
      },
    ],
  },

];
