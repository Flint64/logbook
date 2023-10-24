import { IceDamage, PoisonDamage } from "src/app/models/damageTypes.model";
import { Effect } from "src/app/models/effect.model";
import { Magic } from "src/app/models/magic.model";

// Define a separate interface for ScrollData
interface ScrollData {
    name: string;
    amount: number;
    canTargetEnemies: boolean;
    textColor: string;
    effects: Partial<Effect>[];
    spell: Magic
  }
    
  export const scrolls: ScrollData[] = [
  {
    name: 'Scroll of Ice Shard',
    amount: 3,
    canTargetEnemies: true,
    textColor: 'lightBlueText',
    effects: [],
    spell: new Magic({
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
      })
  },

];
