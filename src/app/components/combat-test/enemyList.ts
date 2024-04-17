import { DamageTypes, BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { DamageResistance, BludgeoningDamageResistance, PiercingDamageResistance, SlashingDamageResistance, FireDamageResistance, IceDamageResistance, PoisonDamageResistance, ShockDamageResistance } from "src/app/models/damageResistanceModel";
import { BurnResistance, PoisonResistance } from "src/app/models/statusEffectResistanceModel";
import { Magic } from "src/app/models/magic.model";

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
      attack: 3,
      variance: 5,
      defense: 5,
      speed: 80,
      numAttacks: 1,
      mana: 0,
      maxMana: 0,
      accuracy: 60,
      evasion: 10,
      luck: 2,
      resistance: 10,
      intelligence: 0,
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
      attack: 1,
      variance: 5,
      defense: 0,
      speed: 75,
      numAttacks: 1,
      mana: 0,
      maxMana: 0,
      accuracy: 60,
      evasion: 0,
      luck: 2,
      resistance: 10,
      intelligence: 0,
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
      attack: 1,
      variance: 5,
      defense: 3,
      speed: 70,
      numAttacks: 1,
      mana: 0,
      maxMana: 0,
      accuracy: 50,
      evasion: 0,
      luck: 2,
      resistance: 10,
      intelligence: 0,
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
      attack: 2,
      variance: 5,
      defense: 5,
      speed: 90,
      numAttacks: 1,
      mana: 10,
      maxMana: 0,
      accuracy: 60,
      evasion: 20,
      luck: 2,
      resistance: 10,
      intelligence: 11,
      damageTypes: [
        new SlashingDamage({percent: 80, elemental: false}),
        new PiercingDamage({percent: 20, elemental: false})
      ],
      damageResistances: [
        new SlashingDamageResistance({resistance: 2, elemental: false, resistanceModifier: null})
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
      attack: 7,
      variance: 5,
      defense: 4,
      speed: 50,
      numAttacks: 2,
      mana: 0,
      maxMana: 0,
      accuracy: 50,
      evasion: 0,
      luck: 2,
      resistance: 10,
      intelligence: 0,
      damageTypes: [
        new BludgeoningDamage({percent: 100, elemental: false})
      ],
      damageResistances: [
        new BludgeoningDamageResistance({resistance: 10, elemental: false, resistanceModifier: null}),
      ],
      statusEffectResistances: [
        new BurnResistance({resistance: 50}),
      ],
      specialAttackChance: 20,
      specialAttacks: [
        new Magic({
            name: 'Slam',
            manaCost: 0,
            healthCost: 0,
            useStrength: true,
            isAbility: true,
            power: 6,
            accuracy: 60,
            variance: 4,
            targets: 2,
            canTargetParty: true,
            canTargetEnemies: false,
            recoveryPeriod: -50,
            textColor: 'slateText',
            useChance: 100,
            damageTypes: [
              new BludgeoningDamage({percent: 100, elemental: false})
            ],
            effects: [],
        })
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
      attack: 4,
      variance: 5,
      defense: 4,
      speed: 80,
      numAttacks: 1,
      mana: 20,
      maxMana: 20,
      accuracy: 65,
      evasion: 15,
      luck: 5,
      resistance: 40,
      intelligence: 10,
      damageTypes: [
        new SlashingDamage({percent: 40, elemental: false}),
        new FireDamage({percent: 60, elemental: true})
      ],
      damageResistances: [
        new FireDamageResistance({resistance: 50, elemental: true, resistanceModifier: 'high_strong'}),
        new BludgeoningDamageResistance({resistance: 6, elemental: false, resistanceModifier: null}),
        new PoisonDamageResistance({resistance: 50, elemental: true, resistanceModifier: null}),
        new IceDamageResistance({resistance: 0, elemental: true, resistanceModifier: 'low_weak'})
      ],
      statusEffectResistances: [
        new BurnResistance({resistance: 50}),
        new PoisonResistance({resistance: 300})
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },

    {
      name: 'Mage',
      health: 20,
      maxHealth: 20,
      strength: 2,
      attack: 2,
      variance: 5,
      defense: 0,
      speed: 70,
      numAttacks: 1,
      mana: 50,
      maxMana: 50,
      accuracy: 50,
      evasion: 10,
      luck: 5,
      resistance: 90,
      intelligence: 10,
      damageTypes: [
        new BludgeoningDamage({percent: 100, elemental: false})
      ],
      damageResistances: [],
      statusEffectResistances: [],
      specialAttackChance: 75,
      specialAttacks: [
        new Magic({
            name: 'Fireball',
            manaCost: 11,
            healthCost: 0,
            power: 6,
            accuracy: 75,
            variance: 6,
            targets: 2,
            canTargetParty: true,
            canTargetEnemies: false,
            textColor: 'orangeText',
            recoveryPeriod: -20,
            useChance: 60,
            damageTypes: [
              new FireDamage({percent: 80, elemental: true}),
              new BludgeoningDamage({percent: 20, elemental: false})
            ],
            effects: [
              {
                name: 'burn',
                duration: 4,
                modifier: 5,
                canBeResisted: true,
                applicationChance: 80,
                self: false,
                helpDescription: 'Take fire damage over time',
                damageTypeName: 'fire',
                damageType: [
                  new FireDamage({percent: 100, elemental: true})
                ]
              }
            ],
        }),
        new Magic({
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
          useChance: 20,
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
        }),
        new Magic({
          name: 'Healing Jolt',
          manaCost: 14,
          healthCost: 0,
          power: 0,
          accuracy: 100,
          variance: 0,
          targets: 1,
          canTargetParty: false,
          canTargetEnemies: true,
          textColor: 'pinkText',
          recoveryPeriod: 0,
          useChance: 20,
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
                damageTypeName: null,
                damageType: [],
            },
          ],
        })
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },

    {
      name: 'Troll',
      health: 32,
      maxHealth: 32,
      strength: 5,
      attack: 6,
      variance: 6,
      defense: 10,
      speed: 75,
      numAttacks: 1,
      mana: 0,
      maxMana: 0,
      accuracy: 65,
      evasion: 20,
      luck: 4,
      resistance: 30,
      intelligence: 6,
      damageTypes: [
        new BludgeoningDamage({percent: 80, elemental: false}),
        new PoisonDamage({percent: 20, elemental: true})
      ],
      damageResistances: [
        new FireDamageResistance({resistance: 0, elemental: true, resistanceModifier: 'high_weak'}),
        new PoisonDamageResistance({resistance: 0, elemental: true, resistanceModifier: 'high_weak'}),
        new IceDamageResistance({resistance: 20, elemental: true, resistanceModifier: 'high_strong'})
      ],
      statusEffectResistances: [
        new PoisonResistance({resistance: 300})
      ],
      effects: [],
      turnCount: 0,
      ATB: 0
    },
    
  ];