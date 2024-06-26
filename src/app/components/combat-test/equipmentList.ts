import { BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { Player } from "src/app/models/player.model";
import { StatusEffectResistance, BurnResistance, PoisonResistance, FreezeResistance, ShockResistance } from "src/app/models/statusEffectResistanceModel";
import { DamageResistance, BludgeoningDamageResistance, PiercingDamageResistance, SlashingDamageResistance, FireDamageResistance, IceDamageResistance, PoisonDamageResistance, ShockDamageResistance } from "src/app/models/damageResistanceModel";
import { EquippableItem, Bracer, Weapon, Chestplate, Pants, Greaves, Trinket, Helm} from "src/app/models/equippableItem.model";

/****************************************************************************************
 * Helms
 ****************************************************************************************/
export const helms: Helm[] = [
    {
        name: 'Steel Helm',
        equippedBy: null,
        description: "A sturdy steel helm",
        defense: 3,
        intelligence: 0,
        accuracy: 0,
        statusEffectResistances: [],
        damageResistances: [],
        damageTypes: []
    }
];

/****************************************************************************************
 * Chestplates
 ****************************************************************************************/
export const chestplates: Chestplate[] = [
    {
        name: 'Chainmail',
        equippedBy: null,
        description: null,
        strength: 0,
        defense: 10,
        speed: 0,
        intelligence: 0,
        evasion: 0,
        statusEffectResistances: [],        
        damageResistances: [],
        damageTypes: []
    },

    {
        name: 'Apprentice Robes',
        equippedBy: null,
        description: null,
        strength: 0,
        defense: 3,
        speed: 10,
        intelligence: 3,
        evasion: 0,
        statusEffectResistances: [],        
        damageResistances: [],
        damageTypes: []
    },

    // {
    //     name: 'TEST',
    //     equippedBy: null,
    //     description: null,
    //     
    //     strength: 0,
    //     defense: 20,
    //     speed: 10,
    //     
    //     intelligence: 3,
    //     statusEffectResistances: [
    //         new PoisonResistance({resistance: 25}),
    //         new BurnResistance({resistance: 30}),
    //         new ShockResistance({resistance: 35})
    //     ],
    //     damageResistances: [
    //         new BludgeoningDamageResistance({resistance: 15, elemental: false}),
    //         new FireDamageResistance({resistance: 15, elemental: true}),
    //         new SlashingDamageResistance({resistance: 15, elemental: false}),
    //         new PoisonDamageResistance({resistance: 15, elemental: true})
    //     ],
    //     damageTypes: [
    //         new FireDamage({percent: 10, elemental: true}),
    //         new ShockDamage({percent: 12, elemental: true}),
    //         new PoisonDamage({percent: 14, elemental: true}),
    //         new PiercingDamage({percent: 64, elemental: false})
    //     ]
    // }
];

/****************************************************************************************
 * Pants
 ****************************************************************************************/
export const pants: Pants[] = [
    // {
    //     name: 'Fancy Pants',
    //     equippedBy: null,
    //     description: null,
    //     
    //     defense: 5,
    //     speed: 0,
    //     
    //     intelligence: 0,
    //     statusEffectResistances: [
    //         new PoisonResistance({resistance: 25}),
    //     ],
    //     damageResistances: [
    //         new SlashingDamageResistance({resistance: 15, elemental: false}),
    //     ],
    //     damageTypes: [
    //         new FireDamage({percent: 10, elemental: true}),
    //     ]
    // }
];

/****************************************************************************************
 * Bracers
 ****************************************************************************************/
export const bracers: Bracer[] = [
    {
        name: 'Critical Bracers',
        equippedBy: null,
        description: null,
        strength: 0,
        defense: 0,
        speed: 0,
        accuracy: 0,
        luck: 0,
        crit: 8,
        evasion: 0,
        statusEffectResistances: [],
        damageResistances: [],
        damageTypes: []
    }
];

/****************************************************************************************
 * Greaves
 ****************************************************************************************/
export const greaves: Greaves[] = [
];

/****************************************************************************************
 * Weapons
 ****************************************************************************************/
export const weapons: Weapon[] = [
    {
        name: 'Oak Staff',
        equippedBy: null,
        description: null,
        strength: 0,
        speed: 0,
        intelligence: 3,
        accuracy: 5,
        luck: 0,
        attack: 2,
        variance: 7,
        crit: 3,
        statusEffectResistances: [],
        damageTypes: [
            new BludgeoningDamage({percent: 100, elemental: false})
        ],
        damageResistances: []
    },

    {
        name: 'Shortsword',
        equippedBy: null,
        description: null,
        strength: 0,
        speed: 0,
        intelligence: 0,
        accuracy: 5,
        luck: 0,
        attack: 4,
        variance: 7,
        crit: 5,
        statusEffectResistances: [],
        damageTypes: [
            new SlashingDamage({percent: 80, elemental: false}),
            new PiercingDamage({percent: 20, elemental: false})
        ],
        damageResistances: []
    },

    {
        name: 'Poison Dipped Mace',
        equippedBy: null,
        description: null,
        strength: 0,
        speed: 0,
        intelligence: 0,
        accuracy: 5,
        luck: 0,
        attack: 6,
        variance: 7,
        crit: 3,
        statusEffectResistances: [
            new PoisonResistance({resistance: 5})
        ],
        damageTypes: [
            new BludgeoningDamage({percent: 90, elemental: false}),
            new PoisonDamage({percent: 10, elemental: true})
        ],
        damageResistances: []
    },

    {
        name: 'Bone Phoenix',
        equippedBy: null,
        description: 'An enchanted fiery morning star',
        strength: 0,
        speed: 0,
        intelligence: 0,
        accuracy: 5,
        luck: 0,
        attack: 6,
        variance: 7,
        crit: 3,
        statusEffectResistances: [
            new BurnResistance({resistance: 30}) //Just for reference when working on enemyModel, these class names work with the player model calcTotalStatValue if passed in the same as the instance class name
        ],

        damageTypes: [
            new FireDamage({percent: 60, elemental: true}),
            new BludgeoningDamage({percent: 40, elemental: false})
        ],
        damageResistances: [
            new FireDamageResistance({resistance: 30, elemental: true, resistanceModifier: null}), //Just for reference when working on enemyModel, these class names work with the player model calcTotalStatValue if passed in the same as the instance class name
        ]
    }
];

/****************************************************************************************
 * Trinkets
 ****************************************************************************************/
export const trinkets: Trinket[] = [
    {
        name: 'Fire Gem',
        equippedBy: null,
        description: 'A test trinket',
        defense: 0,
        speed: 0,
        intelligence: 1,
        strength: 5,
        accuracy: 0,
        luck: 0,
        crit: 0,
        evasion: 5,
        statusEffectResistances: [new BurnResistance({resistance: 30})],
        damageTypes: [new FireDamage({percent: 10, elemental: true})],
        damageResistances: [new FireDamageResistance({resistance: 30, elemental: true, resistanceModifier: null})]
    },
    {
        name: 'Ice Gem',
        equippedBy: null,
        description: 'A test trinket',
        defense: 0,
        speed: 0,
        intelligence: 2,
        strength: 0,
        accuracy: 0,
        luck: 0,
        crit: 0,
        evasion: 5,
        statusEffectResistances: [new FreezeResistance({resistance: 30}), new PoisonResistance({resistance: 5})],
        damageTypes: [new IceDamage({percent: 10, elemental: true})],
        damageResistances: [new IceDamageResistance({resistance: 30, elemental: true, resistanceModifier: null})]
    },
    {
        name: 'Poison Gem',
        equippedBy: null,
        description: 'A test trinket',
        defense: 0,
        speed: 0,
        intelligence: 3,
        strength: 0,
        accuracy: 0,
        luck: 0,
        crit: 0,
        evasion: 5,
        statusEffectResistances: [new PoisonResistance({resistance: 30}),],
        damageTypes: [new PoisonDamage({percent: 10, elemental: true})],
        damageResistances: [new PoisonDamageResistance({resistance: 30, elemental: true, resistanceModifier: null})]
    },
    {
        name: 'Sharp Gem',
        equippedBy: null,
        description: 'A test trinket',
        defense: 0,
        speed: 0,
        intelligence: 4,
        strength: 0,
        accuracy: 0,
        luck: 0,
        crit: 5,
        evasion: 2,
        statusEffectResistances: [],
        damageTypes: [new SlashingDamage({percent: 10, elemental: false})],
        damageResistances: [new SlashingDamageResistance({resistance: 30, elemental: false, resistanceModifier: null})]
    }
];