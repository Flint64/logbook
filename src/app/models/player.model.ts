import { DamageTypes, BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equipment/equippableItem.model";
import { Magic } from "./magic.model";
import { Effect } from "./effect.model";
import _ from 'lodash';
import { Enemy } from "./enemy.model";
import { Weapon } from "./equipment/weaponModel";

export class Player {
    constructor(){}

    name: string = "";
    health: number = 100;

    //Only used now for displaying current value / total
    maxHealth: number = 100;
    maxMana: number = 33;

    //basic attack damage = (Character's Strength / 2) + Weapon Attack
    strength: number = 10;
    
    intelligence: number = 5;
    defense: number = 0;

    //Speed = (Character's speed) + Accessory Bonuses
    speed: number = 200;
    mana: number = 33;
    accuracy: number = 90;
    luck: number = 5;
    canSelectEnemy: boolean = true;
    resistance: number = 10;

    //TODO: Evade? dodge? Evade Rate = (Character's Evade% / 4) + Accessory Bonuses
    
    ATB: number = 100;
    turnCount: number = 0;
    
    magic: Magic[] = [];
    effects: Effect[] = [];

  /****************************************************************************************
   * Calculate Total Stat Value - Provides on-demand total stat values for the player for
   * use anywhere stats come in to play. Tallies up total defense/attack from any equipped
   * items/effects and returns the total value.
   * Effects are one unique effect per party member, so checking once is fine. 
   * But equipment would have to search through all equipped items to see if there are any 
   * that match the search term and add them all up.
   ****************************************************************************************/
    calcTotalStatValue(statName: string, inventory: EquippableItem[]){
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

      //If we're checking for resistances on equipment, make sure we include the base player resistance stat
      if (statName.includes('Resist')){
        totalStatValue += this.resistance;
      }

      //check for equipment stats
      //If the equipped item is equipped to the right character,
      //and if it has the stat we're looking for, add it to the total
      inventory.forEach((equipment) => {
        if (equipment.equippedBy?.name === this.name){
          if (equipment[`${statName}`]){
            totalStatValue += equipment[`${statName}`];
          }

          if (statName.includes('Resist')){ //FIXME: This? Will resistance.constructor.name match and work?
            equipment.statusEffectResistances.forEach((resistance) => {
              if (resistance.constructor.name === statName){
                totalStatValue += resistance.resistance;
              }
            });
          }

          if (statName.includes('Damage')){
            equipment.damageResistances.forEach((resistance) => {
              if (resistance.constructor.name === statName){
                totalStatValue += resistance.resistance;
              }
            });
          }
        }
      });

      // console.log(statName + ' ' + totalStatValue);
      return totalStatValue;
    }

  /****************************************************************************************
   * Calculate Effect Resistance - Checks a given stat resistance from calcTotalStatValue
   * and calculates to see if that effect has been resisted or not. Returns true for effect
   * was resisted, false for not
   ****************************************************************************************/
    calcEffectResistance(resistance: number): boolean{
      let val = ((resistance / 2) / 150) * 100;
      if (_.random(1, 100) < val){
        return true;
      }
      return false;
    }

  /****************************************************************************************
   * Calculate Damage Reduction - Takes the base damage calculated and then further
   * calculates in the target's defense stat(s) to determine how much the defense stat
   * lowers the base damage.
   * 
   * Weapons can deal multiple damage types. If there is one, it's 100%. If two, it can be
   * any combination that equals 100. Same for multiples. Physical damage (bludgeoning,
   * slashing, piercing) are deducted based on your base defense stat + any damage reduction
   * for that specific damage type using the defense reduction diminishing returns
   * calculation. Any elemental damage is handled solely on the damage resistance stat + 
   * enemy base resistance. The calculation for that is the same as determining whether or
   * not a status effect is applied, except the % chance is damage reduction instead of
   * status resist percent.
   ****************************************************************************************/
    calcDamageReduction(damage: number, enemyTarget: Enemy, inventory: EquippableItem[]): number{
      let physicalDamageAfterReduction = 0;
      let elementalDamageAfterReduction = 0;
      let noMatchingPhysicalReduction = 0;
      let noMatchingElementalReduction = 0;
          
      let playerDamageTypes = [];
      inventory.forEach((item) => {
        if (item instanceof Weapon && item.equippedBy?.name === this.name){
            item.damageTypes.forEach((damageType) => {
              let copy = _.cloneDeep(damageType);
              copy.damage = Math.round((damageType.percent / 100) * damage);
              playerDamageTypes.push(copy);
            });
        }
      });

      //For each damage type we hit the enemy with, check the enemy resistances to see if any match
      //and if they do, calculate the damage reduction accordingly
      playerDamageTypes.forEach((e) => {
        let enemyResistance = enemyTarget.damageResistances.find(resistance => resistance.constructor.name === e.constructor.name + 'Resistance');
        if (enemyResistance){
          let totalEnemyDamageResistance = 0;

          let damageTypeName = enemyResistance.constructor.name.split(/(?=[A-Z])/)[0];
          //Elemental damage reduction
          if (damageTypeName !== 'Bludgeoning' && damageTypeName !== 'Slashing' && damageTypeName !== 'Piercing'){
            totalEnemyDamageResistance += enemyResistance.resistance;
            totalEnemyDamageResistance += enemyTarget.calcTotalStatValue('resistance');
            let reductionPercent = (((totalEnemyDamageResistance)/2)/150);
            reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2; //Round to 2 decmial places, preserving number type
            elementalDamageAfterReduction += Math.round((e.damage - (e.damage * reductionPercent)));
            // console.log(totalEnemyDamageResistance + ' Total Enemy elemental resistance')
            // console.log(reductionPercent*100 + '% elem reduction');
            // console.log(e.damage+ ' elem damage before reduction')

          //Physical damage reduction
          } else {
            totalEnemyDamageResistance += enemyResistance.resistance;
            totalEnemyDamageResistance += enemyTarget.calcTotalStatValue('defense');

            //standard defense damage reduction calculation
            let reductionPercent = totalEnemyDamageResistance / (totalEnemyDamageResistance + e.damage * 3);
            reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2;
            physicalDamageAfterReduction += Math.round((e.damage - (e.damage * reductionPercent)));
            // console.log(totalEnemyDamageResistance + ' Total enemy Physical armor')
            // console.log(reductionPercent * 100 + '% phys reduction');
            // console.log(e.damage+ ' phys damage before reduction')
          }

        } else {
          //Handles no matching ELEMENTAL resistances, so base resistances is all we use
          if (e.constructor.name.split(/(?=[A-Z])/)[0] !== 'Bludgeoning' && e.constructor.name.split(/(?=[A-Z])/)[0] !== 'Slashing' && e.constructor.name.split(/(?=[A-Z])/)[0] !== 'Piercing'){
            let baseResistance = enemyTarget.calcTotalStatValue('resistance');
            let reductionPercent = (((baseResistance)/2)/150);
            reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2; //Round to 2 decmial places, preserving number type
            noMatchingElementalReduction += Math.round((e.damage - (e.damage * reductionPercent)));
            // console.log(baseResistance + ' BASE enemy elemental resistance')
            // console.log(reductionPercent*100 + '% BASE elem reduction');
            // console.log(e.damage + ' BASE elem damage before reduction')

          //Handles no matching PHYSICAL resistances, so base armor is all we use
          } else {
            let baseDefense = enemyTarget.calcTotalStatValue('defense');
            let reductionPercent = baseDefense / (baseDefense + e.damage * 3);
              reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2;
              noMatchingPhysicalReduction += Math.round((e.damage - (e.damage * reductionPercent)));
              // console.log(baseDefense + ' Base enemy armor')
              // console.log(reductionPercent * 100 + '% other reduction');
              // console.log(e.damage+ ' Other damage before reduction')
          }
        }
      });

      let damageAfterReduction = physicalDamageAfterReduction + elementalDamageAfterReduction + noMatchingPhysicalReduction + noMatchingElementalReduction;

      //Prevent attacks from doing 0 damage, limiting it to at least 1
      if (damageAfterReduction <= 0){damageAfterReduction = 1;}
      
      // console.log(damage + ' damage before reduction')
      // console.log(physicalDamageAfterReduction + ' phys after reduction');
      // console.log(elementalDamageAfterReduction + ' elem after reduction');
      // console.log(noMatchingPhysicalReduction + ' Other damage after reduction');
      // console.log(damageAfterReduction + ' total after reduction');
      
      return damageAfterReduction;
    }

   /****************************************************************************************
   * Reset - resets any modified player values after combat excluding health and mana
   ****************************************************************************************/
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
        
  /****************************************************************************************
   * Player Attack - Handles basic player attacks.
   * Damage is based on attack power.
   ****************************************************************************************/
  playerAttack(playerTarget: Player, enemyTarget: Enemy, intervalID, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void, inventory: EquippableItem[]){
    
    //Return true/false if we hit/miss to use to show graphic of if enemy is hit or not
    let attackHits = null;

    if (playerTarget.ATB < 100 || intervalID === null){ return; }
    
    // Returns a random integer from 1-100:
    if ((_.random(1, 100)) < playerTarget.accuracy){

      //If we hit, check if the enemy evades the attack
      //TODO: Enemy evasion
      //Hit Rate = (Character's Hit% / 2) + (Weapon Hit% + Accessory Bonuses) - Enemy Evade%
    // checkIfHit(){
        // (this.accuracy / 2) + (this.inventory.equippedWeapon + this.inventory.equippedGear) - enemy.dodge;
        // (this.accuracy / 2) + (5 + 5) - 3;
    // }
      
      //If we don't evade, calculate damage done
      let damage = playerTarget.calcBaseAttackDamage(inventory);
      damage = playerTarget.calcDamageReduction(damage, enemyTarget, inventory);
      attackHits = true;
      
      //If the attack is a crit, print the correct messages
      if (this.isCriticalHit(playerTarget, inventory)){

        //2x crit damage. If we don't recalculate here, crit damage is doubled after reduction;
        //this way, if we score a critical hit, the damage is recalculated to be double and then reduced by armor
        damage = playerTarget.calcBaseAttackDamage(inventory);
        damage *= 2;
        damage = playerTarget.calcDamageReduction(damage, enemyTarget, inventory);
        
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