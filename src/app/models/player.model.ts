import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";
import { Magic } from "./magic.model";
import { Effect } from "./effect.model";
import * as Rand from '../../../node_modules/lodash';

export class Player {
    constructor(){}

    health: number = 100;
    strength: number = 10; //basic attack damage = (Character's Strength / 2) + Weapon Attack
    defense: number = 30; //TODO: Defender's Defense / (Defender's Defense + Attacker's Attack)  // Damage Reduction = 50 / (50 + 100) = 0.33
    speed: number = 200; //Speed = (Character's speed) + Accessory Bonuses
    mana: number = 33;
    accuracy: number = 90; //TODO: Hit Rate = (Character's Accuracy% / 2) + Weapon Hit% + Accessory Bonuses
    luck: number = 5;

    //TODO: Evade? dodge? Evade Rate = (Character's Evade% / 4) + Accessory Bonuses
    //TODO: Critical Hit Rate = (Character's Critical% / 4) + Weapon Critical% + Accessory Bonuses
    /*
    When a character makes an attack, the game generates a random number between 0 and 255 (inclusive), 
    which is compared against their critical hit rate. If the random number is less than or equal to 
    the critical hit rate, the attack is a critical hit and deals bonus damage.

    Doubleish the damage for crits
    */

    maxHealth: number = 100;
    maxStrength: number = 10;
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

    //TODO: Player weaknesses & resistances

    //Resets any modified player values to the max value after combat excluding health and mana
    //TODO: Make sure this accounts for any equipment
    reset(){
        this.ATB = 100;
        this.turnCount = 0;

        this.strength = this.maxStrength;
        this.defense = this.maxDefense;
        this.speed = this.maxSpeed;
        this.accuracy = this.maxAccuracy;
        this.luck = this.maxLuck;
        this.effects = [];
    }

    calcBaseAttackDamage(){
        //Damage is a random number between player min attack and attack
      let dam = (this.strength / 2) + 5 //TODO: 5 is your equipped weapon damage stat, not implemented yet

      //Damage variance, a random number from 1-7 more or less than the calculated value, minimum of 1
      let variance = Rand.random(1, 7);

      // this will add minus sign in 50% of cases
      variance *= Math.round(Math.random()) ? 1 : -1; 
      dam += variance;

      //Round the damage to the closest whole number
      dam = Math.round(dam);

      if (dam <= 0){ dam = 1; }

      return dam;
    }
    
}