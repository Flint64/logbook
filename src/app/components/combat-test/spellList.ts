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
  recoveryPeriod: number;
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
    canTargetParty: true,
    canTargetEnemies: true,
    textColor: 'orangeText',
    recoveryPeriod: 0,
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
        applicationChance: 80,
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
    recoveryPeriod: 0,
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
    recoveryPeriod: 0,
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
        applicationChance: 80,
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
    canTargetEnemies: true,
    textColor: 'redText',
    recoveryPeriod: 0,
    damageTypes: [],
    effects: [
      {
        name: 'rage',
        duration: 4,
        modifier: null,
        canBeResisted: false,
        applicationChance: 60,
        self: false,
        helpDescription: 'Attack randomly, unable to choose a target or special ability',
      },
      {
        name: 'strength',
        duration: 4,
        modifier: 5,
        canBeResisted: false,
        applicationChance: 100,
        self: false,
        helpDescription: 'Increase attack power',
      },
    ],
  },

  {
    name: 'Gift of Life',
    manaCost: 12,
    healthCost: 15,
    power: 0,
    accuracy: 100,
    variance: 0,
    targets: 0,
    canTargetParty: true,
    canTargetEnemies: false,
    textColor: 'pinkText',
    recoveryPeriod: 0,
    damageTypes: [],
    effects: [
      {
        name: 'health',
        duration: null,
        modifier: 25,
        canBeResisted: false,
        applicationChance: 100,
        self: false,
        helpDescription: 'Restores 25 health',
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
    recoveryPeriod: 0,
    damageTypes: [],
    effects: [
      {
        name: 'health',
        duration: 4,
        modifier: 8,
        canBeResisted: false,
        applicationChance: 100,
        self: false,
        helpDescription: 'Restores 8 health for 4 turns',
      },
    ],
  },

  {
    name: 'Resurrection',
    manaCost: 25,
    healthCost: 0,
    power: 0,
    accuracy: 100,
    variance: 0,
    targets: 0,
    canTargetParty: true,
    canTargetEnemies: false,
    textColor: 'pinkText',
    recoveryPeriod: 0,
    damageTypes: [],
    effects: [
      {
        name: 'health',
        duration: null,
        modifier: 25,
        canBeResisted: false,
        applicationChance: 100,
        self: false,
        helpDescription: 'Restores 25 health',
      },
      {
        name: 'resurrect',
        duration: null,
        modifier: 0,
        canBeResisted: false,
        applicationChance: 100,
        self: false,
        helpDescription: '',
      },
    ],
  },

];
