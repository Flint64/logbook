import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";

export class Player {
    constructor(){}

    health: number = 99;
    attack: number = 10;
    defense: number = 30;
    speed: number = 72; //Lower = faster
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;
    ATB: number = 0;

    maxHealth: number = 99;
    maxAttack: number = 10;
    maxDefense: number = 30;
    maxSpeed: number = 72; //Lower = faster
    maxMana: number = 33;
    maxAccuracy: number = 85;
    maxLuck: number = 5;

    turnCount: number = 0;

    consumables: ConsumableItem[] = [];
    inventory: EquippableItem[] = [];
    magic: any[] = [];

}