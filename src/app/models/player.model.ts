import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";
import { Magic } from "./magic.model";
import { Effect } from "./effect.model";

export class Player {
    constructor(){}

    //TODO: Rework some of these fields to be more in line with chrono trigger and stuff like a strength score that adds to attack rather than hard coded numbers. 
    //Or maybe it's okay? It works as is but idk if it would be better that way because then weapons and your score can add to damage rather than right now
    //none of that is being taken into account.

    health: number = 100;
    attack: number = 10;
    minAttack: number = 3;
    defense: number = 30;
    speed: number = 200;
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;

    maxHealth: number = 100;
    maxAttack: number = 10;
    maxMinAttack: number = 3;
    maxDefense: number = 30;
    maxSpeed: number = 200;
    maxMana: number = 33;
    maxAccuracy: number = 90;
    maxLuck: number = 5;
    
    ATB: number = 100;
    turnCount: number = 0;
    
    consumables: ConsumableItem[] = [];
    inventory: EquippableItem[] = [];
    magic: Magic[] = [];
    effects: Effect[] = [];

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