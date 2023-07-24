import { ConsumableItem } from "src/app/models/consumableItem.model";
import { Effect } from "src/app/models/effect.model";

// export const potions: Partial<ConsumableItem[] & Effect[]>[] = [
    // export const potions = [

// Define a separate interface for ConsumableItemData
interface ConsumableItemData {
    name: string;
    amount: number;
    effect: Partial<Effect>[];
  }
    
  export const potions: ConsumableItemData[] = [
  {
    name: 'Healing Potion',
    amount: 1,
    effect: [
      {
        name: 'health',
        duration: null,
        modifier: 20,
        self: true,
        helpDescription: 'Restores 20 health',
      }
    ],
  },

  {
    name: 'Mana Potion',
    amount: 1,
    effect: [
      {
        name: 'mana',
        duration: null,
        modifier: 20,
        self: true,
        helpDescription: 'Restores 20 mana',
      },
    ],
  },

  {
    name: 'Speed Potion',
    amount: 1,
    effect: [
      {
        name: 'speed',
        duration: 4,
        modifier: 400,
        self: true,
        helpDescription: 'Increases your speed',
      },
    ],
  },
  {
    name: 'Poison Yourself',
    amount: 1,
    effect: [
      {
        name: 'poison',
        duration: 4,
        modifier: 5,
        self: true,
        helpDescription: 'Take poison damage over time',
      },
    ],
  },

  {
    name: 'Multiple Effects',
    amount: 1,
    effect: [
      {
        name: 'rage',
        duration: 4,
        modifier: null,
        self: true,
        helpDescription: 'Attack randomly, unable to choose a target or special ability',
      },
      {
        name: 'attack',
        duration: 4,
        modifier: 5,
        self: true,
        helpDescription: 'Increases attack power',
      },
      {
        name: 'speed',
        duration: 4,
        modifier: 400,
        self: true,
        helpDescription: 'Increases your speed',
      },
      {
        name: 'mana',
        duration: null,
        modifier: -5,
        self: true,
        helpDescription: 'Removes 5 mana',
      },
    ],
  },

  {
    name: 'Rage Potion',
    amount: 1,
    effect: [
        {
            name: 'rage',
            duration: 4,
            modifier: null,
            self: true,
            helpDescription: 'Attack randomly, unable to choose a target or special ability',
          },
    ],
  },

  {
    name: 'Damage+',
    amount: 1,
    effect: [
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
