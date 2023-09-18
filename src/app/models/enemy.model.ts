import { DamageTypes, BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { DamageResistance, BludgeoningDamageResistance, PiercingDamageResistance, SlashingDamageResistance, FireDamageResistance, IceDamageResistance, PoisonDamageResistance, ShockDamageResistance } from "src/app/models/damageResistanceModel";
import { Effect } from "./effect.model";
import _ from 'lodash';
import { Player } from "./player.model";
import { StatusEffectResistance } from "./statusEffectResistanceModel";
import { EquippableItem } from "./equipment/equippableItem.model";

export class Enemy {
    
  constructor(data: Partial<Enemy>) {
    Object.assign(this, data);
  }

        //TODO: Maybe have some attacks that take longer to recover from, like a strong attack that increases the ATB negative after using
        //TODO: Add in a numAttacks variable and make it so that some enemies can act more than once per turn, like a boss or something
        name: string = "";
        health: number = null;
        maxHealth: number = null;
        strength: number = null;
        defense: number = null;
        speed: number = null;
        mana: number = null;
        maxMana: number = null;
        accuracy: number = null;
        evasion: number = null;
        luck: number = null;
        resistance: number = 10;
        intelligence: number = 0;
        damageTypes: Array<DamageTypes> = [];
        damageResistances: Array<DamageResistance> = [];
        statusEffectResistances: Array<StatusEffectResistance> = [];
        effects: Array<Effect> = [];
        turnCount: number = null;
        ATB: number = 0;
    
    /*
      TODO: Add special abilities/attacks to enemy model. Have it be a % like accuracy to see
      if the attack is a regular attack or special attack. If an enemy has more than one special
      attack/magic ability (it'll be an array of abilities) each one should have a % value (totaling
      up to 100%) to see which one gets used. Ex, an enemy may have 20% chance to use a special ability.
      If they have 1 special ability, it's a 100% chance within the 20%. If they have 3, it can be 
      any variation of 33% each, 20/40/40, 10/70/20 etc. Since it's out of 100%, we can programmatically
      determine percent chance of any variation of percentages/number of abilities:

let abilities = [{chance: 10}, {chance: 70}, {chance: 20}];
let split = [];

let rand = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
abilities.forEach((e, index) => {
  if (index === 0){ split.push(e.chance)} else {
  split.push(split[index-1]+e.chance);  
  }
});

console.log(split);
console.log(rand);

split.forEach((e, index) => {
  //First	
  if (index === 0){
    if (rand <= e) {console.log(abilities[index])}
  //Every other value
  }else {
    if (rand > split[index-1] && rand <= e){console.log(abilities[index])}
  }
});
    */


/****************************************************************************************
   * Calculate Total Stat Value - Provides on-demand total stat values for the enemy for
   * use anywhere stats come in to play. Tallies up total defense/attack from any effects
   * and returns the total value.
   * Effects are one unique effect per enemy, so checking once is fine. 
   ****************************************************************************************/
calcTotalStatValue(statName: string, isElemental: boolean, inventory?: EquippableItem[], stopRecursion: boolean = false, count: number = 0){
  let effect: Effect = this.effects.find(({ name }) => name === statName);
  let totalStatValue = 0;
  let counter = count;
  
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

  //Only try adding the value if it exists in the enemy object
  if (this[`${statName}`]){
    totalStatValue += this[`${statName}`]; //equal to base + effect modifier here
  }

  //If we found a matching DR, add it's value to the total
  let searchDamageResistances = this.damageResistances.find(resistance => resistance.constructor.name === statName);
  if (searchDamageResistances){ totalStatValue += searchDamageResistances.resistance; }
  
  //If the found damage resistance is elemental, add the player's resistance; otherwise, add defense
  if (searchDamageResistances && searchDamageResistances?.elemental && stopRecursion === false && counter < 1){
    totalStatValue += this.calcTotalStatValue('resistance', null, null, true, counter++);
  } else if (searchDamageResistances && !searchDamageResistances?.elemental && stopRecursion === false && counter < 1){
    totalStatValue += this.calcTotalStatValue('defense', null, null, true, counter++);
  }

  //Now, search through any equipped item's statusEffectResistances. Any found items have the player's base resistance added
  let searchStatusResistances = this.statusEffectResistances.find(statusResist => statusResist.constructor.name === statName);
  if (searchStatusResistances){ totalStatValue += searchStatusResistances.resistance; }
  if (searchStatusResistances && stopRecursion === false && counter < 1){
    totalStatValue += this.calcTotalStatValue('resistance', null, null, true, counter++);
  }

  let searchDamageTypes = this.damageTypes.find(damageType => damageType.constructor.name === statName);
  if (searchDamageTypes){ totalStatValue += searchDamageTypes.percent; }

    if (isElemental !== null){
    //If we don't have a matching DR, and the damage is physical, return base defense
    if (!searchDamageResistances && isElemental === true && stopRecursion === false && counter < 1 && !searchStatusResistances){
      totalStatValue += this.calcTotalStatValue('resistance', null, null, true, counter++);

    //If we don't have a matching DR, and the damage is elemental, return base resistance
    } else if (!searchDamageResistances && isElemental === false && stopRecursion === false && counter < 1 && !searchStatusResistances && statName !== 'evasion'){
      totalStatValue += this.calcTotalStatValue('defense', null, null, true, counter++);

    //If we don't have a matching StatusResistance, return base resistance
    } else if (!searchStatusResistances && stopRecursion === false && counter < 1 && !searchDamageResistances){
      totalStatValue += this.calcTotalStatValue('resistance', null, null, true, counter++);
    }
  }
  
  // console.log(statName + ' ' + totalStatValue);
  return totalStatValue;
}

  /****************************************************************************************
   * Calculate Effect Resistance - Checks a given stat resistance from calcTotalStatValue
   * and calculates to see if that effect has been resisted or not. Returns true/false
   ****************************************************************************************/
  calcEffectResistance(resistance: number): boolean{
    let val = ((resistance / 2) / 150) * 100;
    if (_.random(1, 100) < val){
      return true;
    }
    return false;
  }

  /****************************************************************************************
   * Calculate Base Attack Damage - Calculates the base attack damage based on the enemy's
   * strength stat
   ****************************************************************************************/
    calcBaseAttackDamage(): number{
      //Damage is a random number between player min attack and attack
      let dam = (this.calcTotalStatValue('strength', null) / 2) + 1 //TODO: 1 is enemy level? Not implemented yet

      //Damage variance, a random number from 1-5 more or less than the calculated value, minimum of 1
      let variance = _.random(1, 5);

      // this will add minus sign in 50% of cases
      variance *= Math.round(Math.random()) ? 1 : -1; 
      dam += variance;

      //Round the damage down to the closest whole number
      dam = Math.floor(dam);

      if (dam <= 0){ dam = 1; }

      return dam;
    }

  /****************************************************************************************
   * Calculate Damage Reduction - Takes the base damage calculated and then further
   * calculates in the target's defense stat(s) to determine how much the defense stat
   * lowers the base damage. Variance is not included in the damage reduction.
   ****************************************************************************************/
    calcDamageReduction(damage: number, playerTarget: Player, inventory, damageTypes: any[] = null): number{
      let physicalDamageAfterReduction = 0;
      let elementalDamageAfterReduction = 0;

      let enemyDamageTypes = [];
      this.damageTypes.forEach((damageType) => {
        let copy = _.cloneDeep(damageType);
        copy.damage = Math.round((damageType.percent / 100) * damage);
        enemyDamageTypes.push(copy);
      });
      
        //If we pass in damageTypes as an argument, then the damage reduction will be from
        //either a spell or consumable rather than a base attack done, so don't use base damage types
        if (damageTypes){
          enemyDamageTypes = [];
          damageTypes.forEach((damageType) => {
            let copy = _.cloneDeep(damageType);
            copy.damage = Math.round((damageType.percent / 100) * damage);
            enemyDamageTypes.push(copy);
          });
        }

      let playerPhysDR = null;
      let playerElemDR = null;
      enemyDamageTypes.forEach((e) => {
        if (e.elemental){
          playerElemDR = playerTarget.calcTotalStatValue(e.constructor.name + 'Resistance', e.elemental, inventory);
          let reductionPercent = (((playerElemDR)/2)/150);
          reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2; //Round to 2 decmial places, preserving number type
          elementalDamageAfterReduction += Math.round((e.damage - (e.damage * reductionPercent)));
        } else {
          playerPhysDR = playerTarget.calcTotalStatValue(e.constructor.name + 'Resistance', e.elemental, inventory);
          let reductionPercent = playerPhysDR / (playerPhysDR + e.damage * 3);
          reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2;
          physicalDamageAfterReduction += Math.round((e.damage - (e.damage * reductionPercent)));
        }
      });
      
      let damageAfterReduction = physicalDamageAfterReduction + elementalDamageAfterReduction;

      //Prevent attacks from doing 0 damage, limiting it to at least 1
      if (damageAfterReduction <= 0){damageAfterReduction = 1;}

      return damageAfterReduction;
    }
    
    /****************************************************************************************
   * Calculate Attack Accuracy - Determines whether or not an attack hits or not.
   * If we miss, stop here and print the result.
   * true === hit
   * false === miss
   ****************************************************************************************/
    calcAttackAccuracy(enemy: Enemy, playerTarget: Player, appendText): boolean{
      if ((_.random(1, 100)) < enemy.calcTotalStatValue('accuracy', null)){
        return true;
      } else {
        if (enemy.health !== 0){
          appendText('*', true, 'greyText');
          appendText(enemy.name, false, 'greyText');
          appendText('misses', false, 'greyText');
          appendText(playerTarget.name + '!', false, 'greyText', 'underline');
        }
  
        //Kill the enemy once the final attack has happened
        if (enemy.health === 0){
          appendText('*', true, 'redText');
          appendText(enemy.name, false, 'redText');
          appendText('at near death attempts', false, 'redText');
          appendText('one final attack on', false, 'redText');
          appendText(playerTarget.name, false, 'redText', 'underline');
          appendText('before perishing and misses!', false, 'redText');
          enemy.health -= 1;
      }
        return false;
      }
    }

   /****************************************************************************************
   * Is Critical Hit - Calculates whether or not the hit is a crit or not
   ****************************************************************************************/
    private isCriticalHit(){
      //(Luck + Weapon Crit/accessory/armor)/2 out of 255
      let critChance = Math.round((((this.calcTotalStatValue('luck', null)) / 2) / 255) * 100);
      if (_.random(1, 100) < critChance){
        return true;
      }
      return false;
    }

  /****************************************************************************************
  * Calculate Evasion Chance - Calculates whether or not the attack was evaded
  * false === attack hits
  * true === attack evaded
  ****************************************************************************************/
  calcEvasionChance(inventory: EquippableItem[], playerTarget: Player, appendText): boolean{
    let enemyAccuracy = this.calcTotalStatValue('accuracy', null);
    let enemyEvasion = playerTarget.calcTotalStatValue('evasion', null, inventory);
    let evadePercent = enemyEvasion / (enemyEvasion + enemyAccuracy) / 2 ;
    evadePercent = Math.round( evadePercent * 1e2 ) / 1e2; //Round to 2 decmial places, preserving number type
    evadePercent *= 100;
    if (_.random(1, 100) < evadePercent){
      if (this.health !== 0){
        appendText('*', true, 'redText');
        appendText(this.name, false, 'redText');
        appendText('attacks, but', false, 'greyText');
        appendText(playerTarget.name, false, 'greyText');
        appendText('deftly dodges the hit!', false, 'greyText');
      }
      if (this.health === 0){
        appendText('*', true, 'redText');
        appendText(this.name, false, 'redText');
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(playerTarget.name, false, 'redText');
        appendText('before perishing, but', false, 'redText');
        appendText(playerTarget.name, false, 'redText');
        appendText('deftly dodges the hit!', false, 'redText');
        this.health -= 1;
      }
      return true;
    }

    
    return false;
  }

    
   /****************************************************************************************
   * Enemy Attack - Handles basic enemy attacks. Damage is based on attack power.
   ****************************************************************************************/
  enemyAttack(party, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void, inventory){
    
    //Select a random party member to attack & calculate damage
    let rand = _.random(0, (party.length - 1));
    let playerTarget: Player = party[rand];
    
    //Only target players that are alive
    while(playerTarget.health < 0){
      rand = _.random(0, (party.length - 1));
      playerTarget = party[rand];
    }

    //Return true/false if we hit/miss to use to show graphic of if enemy is hit or not
    let result = {
      attackHits: null,
      playerTargetIndex: rand
    }

    //Determine whether or not the attack hits
    result.attackHits = this.calcAttackAccuracy(this, playerTarget, appendText);
    if (!result.attackHits){
      return result;
    }

    //Determine whether or not the attack is evaded
    result.attackHits = this.calcEvasionChance(inventory, playerTarget, appendText);
    if (result.attackHits){
      //Attack was evaded
      return result.attackHits;
    }

    //Calculate the attack's damage if we don't miss
    let damage = this.calcBaseAttackDamage();

    //If the attack is a crit, double the damage of the attack
    let attackIsCrit = this.isCriticalHit();
    if (attackIsCrit){
      damage *= 2;
    }
    
    //Now that we have the attack's damage, crit or not, reduce it based on the target's DR
    damage = this.calcDamageReduction(damage, playerTarget, inventory);

    if (!attackIsCrit){
      //If the enemy has more than 0 hp allow the hit
      if (this.health !== 0){
        appendText('*', true, 'crimsonText');
        appendText(this.name, false, 'crimsonText');
        appendText('hits', false, 'greyText');
        appendText(playerTarget.name, false, 'greyText', 'underline');
        appendText('for', false, 'greyText');
        appendText(`${damage}`, false, 'redText');
        appendText('damage!', false, 'greyText');
        playerTarget.health -= damage;
      }

      //Kill the enemy once the final attack has happened
      if (this.health === 0){
        appendText('*', true, 'redText');
        appendText(this.name, false, 'redText');
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(playerTarget.name, false, 'redText', 'underline');
        appendText('before perishing and hits for', false, 'redText');
        appendText(`${damage}`, false, 'crimsonText');
        appendText('damage!', false, 'redText');
        playerTarget.health -= damage;
        this.health -= 1;
      }
    }

    if (attackIsCrit){
      if (this.health !== 0){
      appendText('*', true, 'redText');
      appendText(this.name + ':', false, 'redText');
      appendText('CRITICAL HIT! ', false);
      appendText(playerTarget.name + ' takes', false);
      appendText(damage.toString(), false, 'redText');
      appendText('damage!', false);
      playerTarget.health -= damage;
    }
    
      //Player gets one last attack before dying if it ends up at 0 hp
      if (this.health === 0){
        appendText('*', true, 'redText');
        appendText(this.name + ':', false, 'redText',);
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(playerTarget.name, false, 'underline', 'playerText');
        appendText('before perishing and CRITS for', false, 'redText');
        appendText(damage.toString(), false, 'crimsonText');
        appendText('damage!', false, 'redText');
        playerTarget.health -= damage;
        playerTarget.health -= 1;
      }
    }

  return result;
  
  }
}