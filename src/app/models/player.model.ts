import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";

export class Player {
    constructor(){}

    health: number = 100;
    attack: number = 10;
    defense: number = 30;
    speed: number = 200;
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;

    maxHealth: number = 100;
    maxAttack: number = 10;
    maxDefense: number = 30;
    maxSpeed: number = 200;
    maxMana: number = 33;
    maxAccuracy: number = 90;
    maxLuck: number = 5;
    
    ATB: number = 100;
    turnCount: number = 0;
    
    consumables: ConsumableItem[] = [];
    inventory: EquippableItem[] = [];
    magic: any[] = [];
    effects: any[] = [];

    //Resets the player back to max values after combat
    //TODO: Make sure this accounts for any equipment
    reset(){
        this.ATB = 100;
        this.turnCount = 0;

        this.maxHealth = 100;
        this.maxAttack = 10;
        this.maxDefense = 30;
        this.maxSpeed = 200;
        this.maxMana = 33;
        this.maxAccuracy = 90;
        this.maxLuck = 5;
        this.effects = [];
    }
    
}