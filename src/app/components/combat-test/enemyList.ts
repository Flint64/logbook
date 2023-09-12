import { DamageTypes, BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { DamageResistance, BludgeoningDamageResistance, PiercingDamageResistance, SlashingDamageResistance, FireDamageResistance, IceDamageResistance, PoisonDamageResistance, ShockDamageResistance } from "src/app/models/damageResistanceModel";
import { BurnResistance, PoisonResistance } from "src/app/models/statusEffectResistanceModel";

// TODO: Will need different lists of enemies and bosses, probably separated by level or something

//Enemies with physical damage resistances need to be managed carefully, as that essentially adds to their armor, which
//has more drastic damage reduction effects whenever player attack is under their total defense; there is a bit more
//leeway when it comes to elemental resistances, as those can scale up to 300 before there is 100% reduction.
//Physical defense is calculated with the attack damage in mind, which is why the values are prone to swinging
export const enemies = [
    {
      name: 'Goblin',
      health: 15,
      maxHealth: 15,
      strength: 2,
      defense: 5,
      speed: 80,
      mana: 0,
      maxMana: 0,
      accuracy: 60,
      luck: 2,
      resistance: 10,
      damageTypes: [
        new SlashingDamage({percent: 80, elemental: false}),
        new PiercingDamage({percent: 20, elemental: false})
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },

    {
      name: 'Green Slime',
      health: 3,
      maxHealth: 3,
      strength: 2,
      defense: 0,
      speed: 75,
      mana: 0,
      maxMana: 0,
      accuracy: 60,
      luck: 2,
      resistance: 10,
      damageTypes: [
        new BludgeoningDamage({percent: 100, elemental: false})
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },

    {
      name: 'Red Slime',
      health: 6,
      maxHealth: 6,
      strength: 3,
      defense: 3,
      speed: 70,
      mana: 0,
      maxMana: 0,
      accuracy: 50,
      luck: 2,
      resistance: 10,
      damageTypes: [
        new BludgeoningDamage({percent: 100, elemental: false})
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },

    {
      name: 'Kobold',
      health: 4,
      maxHealth: 4,
      strength: 2,
      defense: 5,
      speed: 90,
      mana: 10,
      maxMana: 0,
      accuracy: 60,
      luck: 2,
      resistance: 10,
      damageTypes: [
        new SlashingDamage({percent: 80, elemental: false}),
        new PiercingDamage({percent: 20, elemental: false})
      ],
      damageResistances: [
        new SlashingDamageResistance({resistance: 2, elemental: false})
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },

    {
      name: 'Giant',
      health: 35,
      maxHealth: 35,
      strength: 8,
      defense: 4,
      speed: 50,
      mana: 0,
      maxMana: 0,
      accuracy: 50,
      luck: 2,
      resistance: 10,
      damageTypes: [
        new BludgeoningDamage({percent: 100, elemental: false})
      ],
      damageResistances: [
        new BludgeoningDamageResistance({resistance: 10, elemental: false}),
      ],
      statusEffectResistances: [
        new BurnResistance({resistance: 50}),
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },
    
    {
      name: 'Imp',
      health: 25,
      maxHealth: 25,
      strength: 4,
      defense: 4,
      speed: 80,
      mana: 20,
      maxMana: 20,
      accuracy: 65,
      luck: 5,
      resistance: 40,
      damageTypes: [
        new SlashingDamage({percent: 40, elemental: false}),
        new FireDamage({percent: 60, elemental: true})
      ],
      damageResistances: [
        new FireDamageResistance({resistance: 50, elemental: true}),
        new BludgeoningDamageResistance({resistance: 6, elemental: false})
      ],
      statusEffectResistances: [
        new BurnResistance({resistance: 50}),
        new PoisonResistance({resistance: 300})
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    }
  ];