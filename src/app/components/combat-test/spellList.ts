import { BludgeoningDamage, DamageTypes, FireDamage, IceDamage, PoisonDamage } from 'src/app/models/damageTypes.model';
import { Effect } from 'src/app/models/effect.model';

interface MagicData {
  name: string;
  manaCost: number;
  healthCost: number;
  power: number;
  accuracy: number;
  variance: number;
  targets: number;
  canTargetParty: boolean;
  canTargetEnemies: boolean;
  textColor: string;
  damageTypes: DamageTypes[]
  effects: Partial<Effect>[];
}

export const spells: MagicData[] = [
  {
    name: 'Fireball',
    manaCost: 11,
    healthCost: 0,
    power: 6,
    accuracy: 80,
    variance: 6,
    targets: 2,
    canTargetParty: false,
    canTargetEnemies: true,
    textColor: 'orangeText',
    damageTypes: [
      new FireDamage({percent: 80, elemental: true}),
      new BludgeoningDamage({percent: 20, elemental: false})
    ],
    effects: [
      {
        name: 'burn',
        duration: 4,
        modifier: 5,
        damageTypeName: 'fire',
        damageType: [new FireDamage({percent: 100, elemental: true})],
        canBeResisted: true,
        self: false,
        helpDescription: 'Take fire damage over time',
      },
    ],
  },

  {
    name: 'Ice Shard',
    manaCost: 8,
    healthCost: 0,
    power: 4,
    accuracy: 80,
    variance: 2,
    targets: 1,
    canTargetParty: false,
    canTargetEnemies: true,
    textColor: 'lightBlueText',
    damageTypes: [
      new IceDamage({percent: 100, elemental: true})
    ],
    effects: [],
  },

  {
    name: 'Poison Bolt',
    manaCost: 10,
    healthCost: 0,
    power: 3,
    accuracy: 80,
    variance: 2,
    targets: 1,
    canTargetParty: true,
    canTargetEnemies: true,
    textColor: 'greenText',
    damageTypes: [
      new PoisonDamage({percent: 100, elemental: true})
    ],
    effects: [
      {
        name: 'poison',
        duration: 4,
        modifier: 5,
        damageTypeName: 'poison',
        damageType: [new PoisonDamage({percent: 100, elemental: true})],
        canBeResisted: true,
        self: false,
        helpDescription: 'Take poison damage over time',
      },
    ],
  },
  
  {
    name: 'Enrage',
    manaCost: 12,
    healthCost: 0,
    power: 0,
    accuracy: 100,
    variance: 0,
    targets: 0,
    canTargetParty: true,
    canTargetEnemies: true, //TODO: Rage effect on enemies should prevent them from using special abilities/magic
    textColor: 'redText',
    damageTypes: [],
    effects: [
      {
        name: 'rage',
        duration: 4,
        modifier: null,
        canBeResisted: false,
        self: false,
        helpDescription: 'Attack randomly, unable to choose a target or special ability',
      },
      {
        name: 'strength',
        duration: 4,
        modifier: 5,
        canBeResisted: false,
        self: false,
        helpDescription: 'Increase attack power',
      },
    ],
  },

  {
    name: 'Gift of Life',
    manaCost: 12,
    healthCost: 0,
    power: 0,
    accuracy: 100,
    variance: 0,
    targets: 0,
    canTargetParty: true,
    canTargetEnemies: false,
    textColor: 'pinkText',
    damageTypes: [],
    effects: [
      {
        name: 'health',
        duration: null,
        modifier: 25,
        canBeResisted: false,
        self: false,
        helpDescription: 'Restores 25 health',
      },
      {
        name: 'health',
        duration: null,
        modifier: -15,
        canBeResisted: false,
        self: true,
        helpDescription: 'Removes 15 health',
      },
    ],
  },

  {
    name: 'Regeneration Burst',
    manaCost: 12,
    healthCost: 0,
    power: 0,
    accuracy: 100,
    variance: 0,
    targets: 0,
    canTargetParty: true,
    canTargetEnemies: false,
    textColor: 'pinkText',
    damageTypes: [],
    effects: [
      {
        name: 'health',
        duration: 4,
        modifier: 8,
        canBeResisted: false,
        self: false,
        helpDescription: 'Restores 8 health for 4 turns',
      },
    ],
  },

];
