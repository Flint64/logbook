import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";
import { Magic } from "./magic.model";
import { Effect } from "./effect.model";
import _ from 'lodash';

export class Player {
    constructor(){}

    name: string = "";
    health: number = 100;
    strength: number = 10; //basic attack damage = (Character's Strength / 2) + Weapon Attack
    intelligence: number = 5;
    defense: number = 30; //TODO: Defender's Defense / (Defender's Defense + Attacker's Attack)  // Damage Reduction = 50 / (50 + 100) = 0.33
    speed: number = 200; //Speed = (Character's speed) + Accessory Bonuses
    mana: number = 33;
    accuracy: number = 90;
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
    maxIntelligence: number = 5;
    maxDefense: number = 30;
    maxSpeed: number = 200;
    maxMana: number = 33;
    maxAccuracy: number = 90;
    maxLuck: number = 5;
    
    ATB: number = 100;
    turnCount: number = 0;
    
    equippedItems: EquippableItem[] = [];
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
      let variance = _.random(1, 7);

      // this will add minus sign in 50% of cases
      variance *= Math.round(Math.random()) ? 1 : -1; 
      dam += variance;

      //Round the damage to the closest whole number
      dam = Math.round(dam);

      if (dam <= 0){ dam = 1; }

      return dam;
    }
    
    //Hit Rate = (Character's Hit% / 2) + (Weapon Hit% + Accessory Bonuses) - Enemy Evade%
    // checkIfHit(){
        // (this.accuracy / 2) + (this.inventory.equippedWeapon + this.inventory.equippedGear) - enemy.dodge;
        // (this.accuracy / 2) + (5 + 5) - 3;
    // }
    
    /****************************************************************************************
   * Player Attack - Handles basic player attacks.
   * Damage is based on attack power.
   * //TODO: Defense stat
   ****************************************************************************************/
  playerAttack(playerTarget, enemyTarget, intervalID, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void){
    
    //Return true/false if we hit/miss to use to show graphic of if enemy is hit or not
    let attackHits = null;

    if (playerTarget.ATB < 100 || intervalID === null){ return; }
    
    // Returns a random integer from 1-100:
    if ((_.random(1, 100)) < playerTarget.accuracy){
      
      let damage = playerTarget.calcBaseAttackDamage();
      attackHits = true;
            
      //If the player has more than 0 hp allow the hit
      if (playerTarget.health !== 0){
        appendText('*', true, 'playerText');
        appendText(playerTarget.name, false, 'underline', 'playerText');
        appendText('hits', false);
        appendText(enemyTarget.name, false);
        appendText('for', false);
        appendText(damage, false, 'redText');
        appendText('damage!', false);
        enemyTarget.health -= damage;
      }
      
      //Player gets one last attack before dying if it ends up at 0 hp
      if (playerTarget.health === 0){
        appendText('*', true, 'playerText');
        appendText(playerTarget.name, false, 'underline', 'playerText');
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(enemyTarget.name, false, 'redText');
        appendText('before perishing and hits for', false, 'redText');
        appendText(damage, false, 'crimsonText');
        appendText('damage!', false, 'redText');
        enemyTarget.health -= damage;
        playerTarget.health -= 1;
    }

    //If we miss
    } else {
      attackHits = false;
      if (playerTarget.health !== 0){
        appendText('*', true, 'playerText');
        appendText(playerTarget.name, false, 'underline', 'playerText');
        appendText('misses', false, 'greyText');
        appendText(enemyTarget.name + '!', false, 'greyText');
      }
      if (playerTarget.health === 0){
        appendText('*', true, 'playerText');
        appendText(playerTarget.name, false, 'underline', 'playerText');
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(enemyTarget.name, false, 'redText');
        appendText('before perishing and misses!', false, 'redText');
        playerTarget.health -= 1;
      }
    }

    return attackHits;

    //If the player or the enemy is at 0 hit points, they get one
    //last attack before dying. (Only attack, not action)
    //FIXME: With current setup, if hit again before the last attack, combat ends
    // this.combatService.endTurn(this.memberIndex);
  }
    
}