import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";

export class Player {
    constructor(){}

    health: number = 99;
    attack: number = 10;
    defense: number = 30;
    speed: number = 200;
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;

    ATB: number = 100;

    maxHealth: number = 99;
    maxAttack: number = 10;
    maxDefense: number = 30;
    maxSpeed: number = 200;
    maxMana: number = 33;
    maxAccuracy: number = 85;
    maxLuck: number = 5;

    // tempHealth: number = 99;
    // tempAttack: number = 10;
    // tempDefense: number = 30;
    // tempSpeed: number = 72;
    // tempMana: number = 33;
    // tempAccuracy: number = 90;
    // tempLuck: number = 5;

    turnCount: number = 0;

    consumables: ConsumableItem[] = [];
    inventory: EquippableItem[] = [];
    magic: any[] = [];
    effects: any[] = [];

}