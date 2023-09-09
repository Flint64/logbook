import { DamageTypes, BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { DamageResistance, BludgeoningDamageResistance, PiercingDamageResistance, SlashingDamageResistance, FireDamageResistance, IceDamageResistance, PoisonDamageResistance, ShockDamageResistance } from "src/app/models/damageResistanceModel";
import { Effect } from "./effect.model";
import _ from 'lodash';
import { Player } from "./player.model";
import { StatusEffectResistance } from "./statusEffectResistanceModel";

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
        luck: number = null;
        resistance: number = 10;
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
calcTotalStatValue(statName: string){
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

  //Only try adding the value if it exists in the enemy object
  if (this[`${statName}`]){
    totalStatValue += this[`${statName}`]; //equal to base + effect modifier here
  }
  
  //If we're checking for resistances, make sure we include the base resistance stat for elemental resist
  if (statName !== 'BludgeoningDamageResistance' && statName !== 'SlashingDamageResistance' && statName !== 'PiercingDamageResistance'){
    this.statusEffectResistances.forEach((resistance) => {
      if (resistance.constructor.name === statName){
        totalStatValue += resistance.resistance;
      }
    });
    totalStatValue += this.resistance;
  } else {
    //For calculating damageResistance and not elemental, add in the base defense stat
      this.damageResistances.forEach((resistance) => {
        if (resistance.constructor.name === statName){
          totalStatValue += resistance.resistance;
        }
      });
      totalStatValue += this.defense;
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
    calcBaseAttackDamage(): number{ //TODO: Next up2, also make this work with damage reductions from player equipment like the player model
      //Damage is a random number between player min attack and attack
      let dam = (this.calcTotalStatValue('strength') / 2) + 1 //TODO: 1 is enemy level? Not implemented yet

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
    //TODO: Make this work like the playerModel version, to calculate split damages and reductions based on defense/elemental resistances
    calcDamageReduction(damage: number, playerTarget: Player, inventory): number{
      let targetDefense = playerTarget.calcTotalStatValue('defense', inventory);
      let reductionPercent = targetDefense/(targetDefense + 3 * damage);
      let damageAfterReduction = Math.floor(damage - (damage * reductionPercent));
      if (damageAfterReduction <= 0){
        damageAfterReduction = 1;
      }
      
      return damageAfterReduction;
    }
    
    /****************************************************************************************
   * Enemy Attack - Handles basic enemy attacks. Damage is based on attack power.
   * //TODO: Defense stat
   * //TODO: Enemy Crits
   ****************************************************************************************/
  enemyAttack(enemy, party, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void, inventory){
    
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

    if ((_.random(1, 100)) < enemy.accuracy){

      let damage = enemy.calcBaseAttackDamage();
      damage = enemy.calcDamageReduction(damage, playerTarget, inventory);
      result.attackHits = true;

      //If the enemy has more than 0 hp allow the hit
      if (enemy.health !== 0){
        appendText('*', true, 'crimsonText');
        appendText(enemy.name, false, 'crimsonText');
        appendText('hits', false, 'greyText');
        appendText(playerTarget.name, false, 'greyText', 'underline');
        appendText('for', false, 'greyText');
        appendText(damage, false, 'redText');
        appendText('damage!', false);
        playerTarget.health -= damage;
      }

      //Kill the enemy once the final attack has happened
      if (enemy.health === 0){
        appendText('*', true, 'redText');
        appendText(enemy.name, false, 'redText');
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(playerTarget.name, false, 'redText', 'underline');
        appendText('before perishing and hits for', false, 'redText');
        appendText(damage, false, 'crimsonText');
        appendText('damage!', false, 'redText');
        playerTarget.health -= damage;
        enemy.health -= 1;
      }
      
    //If enemy misses
    } else {
      result.attackHits = false;
      
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
  }    

  return result;
  
  }
}