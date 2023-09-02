import { Player } from "src/app/models/player.model";
import { Resistance } from "src/app/models/resistanceModel";

/****************************************************************************************
 * Helms
 ****************************************************************************************/
interface HelmsData {
    name: string;
    equippedBy: Player;
    description: string;
    health: number;
    defense: number;
    mana: number;
    intelligence: number;
    accuracy: number;
    resistances: Partial<Resistance>[];
  }

export const helms: HelmsData[] = [
    {
        name: 'Steel Helm',
        equippedBy: null,
        description: "A sturdy steel helm",
        health: 0,
        defense: 3,
        mana: 0,
        intelligence: 0,
        accuracy: 0,
        resistances: [{
            name: 'shockResist',
            modifier: -5
        }]
    }
];

/****************************************************************************************
 * Chestplates
 ****************************************************************************************/
interface ChestplateData {
    name: string
    equippedBy: Player
    description: string
    health: number
    strength: number
    defense: number
    speed: number
    mana: number
    intelligence: number
    resistances: Partial<Resistance>[];
}

export const chestplates: ChestplateData[] = [
    {
        name: 'Chainmail',
        equippedBy: null,
        description: null,
        health: 0,
        strength: 0,
        defense: 10,
        speed: 0,
        mana: 0,
        intelligence: 0,
        resistances: [{
            name: 'shockResist',
            modifier: -5
        }]
    },
    {
        name: 'Apprentice Robes',
        equippedBy: null,
        description: null,
        health: 0,
        strength: 0,
        defense: 3,
        speed: 10,
        mana: 0,
        intelligence: 3,
        resistances: [
            {
            name: 'shockResist',
            modifier: 5
        },
        {
            name: 'burnResist',
            modifier: 5
        }
    ]
    }
];

/****************************************************************************************
 * Pants
 ****************************************************************************************/
interface PantsData {
    name: string
    equippedBy: Player
    description: string
    health: number
    defense: number
    speed: number
    mana: number
    intelligence: number
    resistances: Partial<Resistance>[];
}

export const pants: PantsData[] = [
];

/****************************************************************************************
 * Bracers
 ****************************************************************************************/
interface BracerData {
    name: string
    equippedBy: Player;
    description: string;
    health: number;
    strength: number;
    defense: number;
    speed: number;
    mana: number;
    accuracy: number;
    luck: number;
    crit: number;
    resistances: Partial<Resistance>[];
}

export const bracers: BracerData[] = [
    {
        name: 'Critical Bracers',
        equippedBy: null,
        description: null,
        health: 0,
        strength: 0,
        defense: 0,
        speed: 0,
        mana: 0,
        accuracy: 0,
        luck: 0,
        crit: 8,
        resistances: [{
            name: 'burnResist',
            modifier: 5
        }]
    }
];

/****************************************************************************************
 * Greaves
 ****************************************************************************************/
interface GreaveData {
    name: string
    equippedBy: Player;
    description: string;
    health: number;
    strength: number;
    defense: number;
    luck: number;
    resistances: Partial<Resistance>[];
}

export const greaves: GreaveData[] = [
];

/****************************************************************************************
 * Weapons
 ****************************************************************************************/
interface WeaponData {
    name: string
    equippedBy: Player;
    description: string;
    strength: number;
    speed: number;
    mana: number;
    intelligence: number;
    accuracy: number;
    luck: number;
    attack: number;
    crit: number;
    resistances: Partial<Resistance>[];
}

export const weapons: WeaponData[] = [
    {
        name: 'Oak Staff',
        equippedBy: null,
        description: null,
        strength: 0,
        speed: 0,
        mana: 0,
        intelligence: 3,
        accuracy: 5,
        luck: 0,
        attack: 2,
        crit: 3,
        resistances: [{
            name: 'burnResist',
            modifier: 5
        }]
    },
    {
        name: 'Shortsword',
        equippedBy: null,
        description: null,
        strength: 0,
        speed: 0,
        mana: 0,
        intelligence: 0,
        accuracy: 5,
        luck: 0,
        attack: 4,
        crit: 5,
        resistances: [{
            name: 'shockResist',
            modifier: -5
        }]
    },
    {
        name: 'Simple Mace',
        equippedBy: null,
        description: null,
        strength: 0,
        speed: 0,
        mana: 0,
        intelligence: 0,
        accuracy: 5,
        luck: 0,
        attack: 6,
        crit: 3,
        resistances: [{
            name: 'poisonResist',
            modifier: 5
        }]
    }
];

/****************************************************************************************
 * Trinkets
 ****************************************************************************************/
interface TrinketData {
    name: string
    equippedBy: Player;
    description: string;
    health: number;
    defense: number;
    speed: number;
    mana: number;
    intelligence: number;
    strength: number;
    accuracy: number;
    luck: number;
    crit: number;
    resistances: Partial<Resistance>[];
}

export const trinkets: TrinketData[] = [
];