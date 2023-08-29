import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equipment/equippableItem.model";
import { Magic } from "./magic.model";
import { Effect } from "./effect.model";
import _ from 'lodash';
import { Enemy } from "./enemy.model";

export class Player {
    constructor(){}

    name: string = "";
    health: number = 100;

    //Only used now for displaying current value / total
    maxHealth: number = 100;
    maxMana: number = 33;

    //basic attack damage = (Character's Strength / 2) + Weapon Attack
    strength: number = 10;
    
    //TODO: Defender's Defense / (Defender's Defense + Attacker's Attack)  // Damage Reduction = 50 / (50 + 100) = 0.33
    intelligence: number = 5;
    defense: number = 0; 

    //Speed = (Character's speed) + Accessory Bonuses
    speed: number = 200;
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;
    canSelectEnemy: boolean = true;

    //TODO: Evade? dodge? Evade Rate = (Character's Evade% / 4) + Accessory Bonuses
    
    ATB: number = 100;
    turnCount: number = 0;
    
    magic: Magic[] = [];
    effects: Effect[] = [];

    //TODO: Player weaknesses & resistances

  /****************************************************************************************
   * Calculate Total Stat Value - Provides on-demand total stat values for the player for
   * use anywhere stats come in to play. Tallies up total defense/attack from any equipped
   * items/effects and returns the total value.
   * Effects are one unique effect per party member, so checking once is fine. 
   * But equipment would have to search through all equipped items to see if there are any 
   * that match the search term and add them all up.
   ****************************************************************************************/
    calcTotalStatValue(statName: string, inventory?: EquippableItem[]){
      let effect: Effect = this.effects.find(({ name }) => name === statName);
      let totalStatValue = 0;
      
      if (effect){
        let maxValue = this['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)];
        if (statName === 'health' || statName === 'mana'){
          //If the effect is targeting health or mana and adding the value is over the max allowed value, return the max value instead
          if (effect.modifier + this[`${statName}`] >= maxValue){
            return maxValue;
          }

          //If adding the value is less than 0, set it to 0
          if (effect.modifier + this[`${statName}`] <= 0){
            return 0;
          }

          //And if adding is less than the max, add the value
          if (effect.modifier + this[`${statName}`] < maxValue){
            return effect.modifier + this[`${statName}`];
          }
        }
        
        //If we have an effect matching the specified name, add the modifier
        totalStatValue += effect.modifier;
      }

      //Now that we've checked any active effects, check all equipped equipment
      //Regardless of if totalStatValue has a value at this point, += the checked for value to get a baseline

      //If we're checking for something like crit or attack, which don't exist on the player object,
      //don't try to add that value here
      if (this[`${statName}`]){
        totalStatValue += this[`${statName}`]; //equal to base + effect modifier here
      }

      //check for equipment stats
      //If the equipped item is equipped to the right character,
      //and if it has the stat we're looking for, add it to the total
      inventory.forEach((equipment) => {
        if (equipment.equippedBy.name === this.name){
          if (equipment[`${statName}`]){
            totalStatValue += equipment[`${statName}`];
          }
        }
      });

      // console.log(statName + ' ' + totalStatValue);
      return totalStatValue;
    }

    //Resets any modified player values after combat excluding health and mana
    reset(){
        this.ATB = 100;
        this.turnCount = 0;
        this.effects = [];
    }

   /****************************************************************************************
   * Calculate Base Attack Damage - Calculates the base attack damage including variance
   * //TODO: Move variance from here to the weapon stat. Unless 7 is a good overall factor?
   ****************************************************************************************/
    private calcBaseAttackDamage(inventory: EquippableItem[]){
      let dam = (this.calcTotalStatValue('strength', inventory) / 2) + this.calcTotalStatValue('attack', inventory);

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

   /****************************************************************************************
   * Is Critical Hit - Calculates whether or not the hit is a crit or not
   ****************************************************************************************/
    private isCriticalHit(playerTarget: Player, inventory: EquippableItem[]){
      //(Luck + Weapon Crit/accessory/armor)/2 out of 255
      let critChance = Math.round((((this.calcTotalStatValue('luck', inventory) + this.calcTotalStatValue('crit', inventory)) / 2) / 255) * 100);
      if (_.random(1, 100) < critChance){
        return true;
      }
      return false;
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
  playerAttack(playerTarget: Player, enemyTarget: Enemy, intervalID, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void, inventory: EquippableItem[]){
    
    //Return true/false if we hit/miss to use to show graphic of if enemy is hit or not
    let attackHits = null;

    if (playerTarget.ATB < 100 || intervalID === null){ return; }
    
    // Returns a random integer from 1-100:
    if ((_.random(1, 100)) < playerTarget.accuracy){
      
      let damage = playerTarget.calcBaseAttackDamage(inventory);
      attackHits = true;
      
      //If the attack is a crit, print the correct messages
      if (this.isCriticalHit(playerTarget, inventory)){

        //2x crit damage
        damage *= 2;
        
        if (playerTarget.health !== 0){
          appendText('*', true, 'playerText');
          appendText(playerTarget.name + ':', false, 'underline', 'playerText');
          appendText('CRITICAL HIT! ', false);
          appendText(enemyTarget.name + ' takes', false);
          appendText(damage.toString(), false, 'redText');
          appendText('damage!', false);
          enemyTarget.health -= damage;
        }
        
        //Player gets one last attack before dying if it ends up at 0 hp
        if (playerTarget.health === 0){
          appendText('*', true, 'playerText');
          appendText(playerTarget.name + ':', false, 'underline', 'playerText');
          appendText('at near death attempts', false, 'redText');
          appendText('one final attack on', false, 'redText');
          appendText(enemyTarget.name, false, 'redText');
          appendText('before perishing and CRITS for', false, 'redText');
          appendText(damage.toString(), false, 'crimsonText');
          appendText('damage!', false, 'redText');
          enemyTarget.health -= damage;
          playerTarget.health -= 1;
      }

      //If not a crit, print standard hit messages
      } else {
        //If the player has more than 0 hp allow the hit
        if (playerTarget.health !== 0){
          appendText('*', true, 'playerText');
          appendText(playerTarget.name, false, 'underline', 'playerText');
          appendText('hits', false);
          appendText(enemyTarget.name, false);
          appendText('for', false);
          appendText(damage.toString(), false, 'redText');
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
          appendText(damage.toString(), false, 'crimsonText');
          appendText('damage!', false, 'redText');
          enemyTarget.health -= damage;
          playerTarget.health -= 1;
      }
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