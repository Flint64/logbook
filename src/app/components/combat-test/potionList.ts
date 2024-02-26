import { PoisonDamage } from "src/app/models/damageTypes.model";
import { Effect } from "src/app/models/effect.model";

//TODO: Think about adding an id field to each potion, as well as an amount (separate from the amount currently stored) as if the game is updated when people are playing it if changes are made to the base file those changes won't be reflected and could cause some problems if effects are changed or something. If we have an id field and an amount and that's all we store when saving the game, then we can repopulate it on load with fresh versions of the items and there shouldn't be any issues. And do the same with the magic as well.

// Define a separate interface for PotionData
interface PotionData {
    name: string;
    amount: number;
    canTargetEnemies: boolean;
    textColor: string;
    effects: Partial<Effect>[];
  }
    
  export const potions: PotionData[] = [
  {
    name: 'Healing Potion',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'pinkText',
    effects: [
      {
        name: 'health',
        duration: null,
        modifier: 20,
        canBeResisted: false,
        self: true,
        helpDescription: 'Restores 20 health',
      }
    ],
  },

  {
    name: 'Regenerative Potion',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'pinkText',
    effects: [
      {
        name: 'health',
        duration: 4,
        modifier: 5,
        canBeResisted: false,
        self: true,
        helpDescription: 'Restores 5 health per turn for 4 turns',
      }
    ],
  },

  {
    name: 'Mana Potion',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'orchidText',
    effects: [
      {
        name: 'mana',
        duration: null,
        modifier: 20,
        canBeResisted: false,
        self: true,
        helpDescription: 'Restores 20 mana',
      },
    ],
  },

  {
    name: 'Speed Potion',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'goldText',
    effects: [
      {
        name: 'speed',
        duration: 4,
        modifier: 400,
        canBeResisted: false,
        self: true,
        helpDescription: 'Increases your speed',
      },
    ],
  },

  {
    name: 'Poison Vial',
    amount: 3,
    canTargetEnemies: true,
    textColor: 'greenText',
    effects: [
      {
        name: 'poison',
        duration: 4,
        modifier: 5,
        canBeResisted: true,
        self: true,
        helpDescription: 'Take poison damage over time',
      },
      {
        name: 'health',
        duration: null,
        modifier: -10,
        damageTypeName: 'poison',
        damageType: [new PoisonDamage({percent: 100, elemental: true})], //Only allow one damageType for effects on consumables
        canBeResisted: false,
        self: true,
        helpDescription: 'Deals direct health damage',
      }
    ],
  },

  {
    name: 'Multiple Effects',
    amount: 3,
    canTargetEnemies: false,
    textColor: null,
    effects: [
      {
        name: 'rage',
        duration: 4,
        modifier: null,
        canBeResisted: false,
        self: true,
        helpDescription: 'Attack randomly, unable to choose a target or special ability',
      },
      {
        name: 'strength',
        duration: 4,
        modifier: 5,
        canBeResisted: false,
        self: true,
        helpDescription: 'Increases attack power',
      },
      {
        name: 'speed',
        duration: 4,
        modifier: 400,
        canBeResisted: false,
        self: true,
        helpDescription: 'Increases your speed',
      },
      {
        name: 'mana',
        duration: null,
        modifier: -5,
        canBeResisted: false,
        self: true,
        helpDescription: 'Removes 5 mana',
      },
    ],
  },

  {
    name: 'Rage Potion',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'crimsonText',
    effects: [
        {
            name: 'rage',
            duration: 4,
            modifier: null,
            canBeResisted: false,
            self: true,
            helpDescription: 'Attack randomly, unable to choose a target or special ability',
          },
    ],
  },

  {
    name: 'Damage+',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'crimsonText',
    effects: [
      {
        name: 'strength',
        duration: 4,
        modifier: 5,
        canBeResisted: false,
        self: true,
        helpDescription: 'Increase attack power',
      },
    ],
  },

  {
    name: 'Crit+',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'goldText',
    effects: [
      {
        name: 'crit',
        duration: 4,
        modifier: 200,
        canBeResisted: false,
        self: true,
        helpDescription: 'Increase critical chance',
      },
      {
        name: 'luck',
        duration: 4,
        modifier: 200,
        canBeResisted: false,
        self: true,
        helpDescription: 'Increases luck',
      },
    ],
  },

  {
    name: 'Poison Resist',
    amount: 3,
    canTargetEnemies: true,
    textColor: 'greenText',
    effects: [
      {
        name: 'PoisonResistance',
        duration: 4,
        modifier: 200,
        canBeResisted: false,
        self: true,
        helpDescription: 'Increase poison resistance',
      }
    ],
  },

  {
    name: 'Resurrection Draught',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'pinkText',
    effects: [
      {
        name: 'health',
        duration: null,
        modifier: 25,
        canBeResisted: false,
        self: true,
        helpDescription: 'Restores 25 health',
      },
      {
        name: 'resurrect',
        duration: null,
        modifier: 0,
        canBeResisted: false,
        self: true,
        helpDescription: 'Resurrects player',
      }
    ],
  },

  {
    name: 'Antidote',
    amount: 3,
    canTargetEnemies: false,
    textColor: 'greenText',
    effects: [
      {
        name: 'poisonCure',
        duration: null,
        modifier: 0,
        canBeResisted: false,
        self: true,
        helpDescription: 'Cures poison',
      }
    ],
  },

];
