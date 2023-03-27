import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";

export class Player {
    constructor(){}

    health: number = 100;
    attack: number = 10;
    minAttack: number = 3;
    defense: number = 30;
    speed: number = 100;
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;

    maxHealth: number = 100;
    maxAttack: number = 10;
    maxDefense: number = 30;
    maxSpeed: number = 100;
    maxMana: number = 33;
    maxAccuracy: number = 90;
    maxLuck: number = 5;
    
    ATB: number = 100;
    turnCount: number = 0;
    
    consumables: ConsumableItem[] = [];
    inventory: EquippableItem[] = [];
    magic: any[] = [];
    effects: any[] = [];

    //Resets any modified player values to the max value after combat excluding health and mana
    //TODO: Make sure this accounts for any equipment
    reset(){
        this.ATB = 100;
        this.turnCount = 0;

        this.attack = this.maxAttack;
        this.defense = this.maxDefense;
        this.speed = this.maxSpeed;
        this.accuracy = this.maxAccuracy;
        this.luck = this.maxLuck;
        this.effects = [];
    }
    
}