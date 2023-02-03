import { Item } from "./item.model";

export class Player {
    constructor(){}

    health: number = 99;
    attack: number = 10;
    defense: number = 30;
    speed: number = 25; //Lower = faster
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;
    ATB: number = 0;

    maxHealth: number = 99;
    maxAttack: number = 10;
    maxDefense: number = 30;
    maxSpeed: number = 25; //Lower = faster
    maxMana: number = 33;
    maxAccuracy: number = 85;
    maxLuck: number = 5;

    // inventory = new Map<string, number>([['Healing Potion', 1], ['Mana Potion', 1]]);
    // inventory = [['Healing Potion', 1], ['Mana Potion', 1]];
    inventory: Item[] = [];
    magic: any[] = [];

}