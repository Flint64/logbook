import { Effect } from "src/app/models/effect.model";

//TODO: Think about adding an id field to each potion, as well as an amount (separate from the amount currently stored) as if the game is updated when people are playing it if changes are made to the base file those changes won't be reflected and could cause some problems if effects are changed or something. If we have an id field and an amount and that's all we store when saving the game, then we can repopulate it on load with fresh versions of the items and there shouldn't be any issues. And do the same with the magic as well.

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
    amount: 3,
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