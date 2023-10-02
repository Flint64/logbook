import { EquippableItem, Bracer, Helm, Chestplate, Pants, Greaves, Weapon, Trinket} from 'src/app/models/equippableItem.model';
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
    
    intelligence: number = 5;
    defense: number = 0;

    //Speed = (Character's speed) + Accessory Bonuses
    speed: number = 200;
    evasion: number = 0;
    mana: number = 33;
    accuracy: number = 80;
    luck: number = 5;
    canSelectEnemy: boolean = true;
    resistance: number = 10;
    
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
    calcTotalStatValue(statName: string, isElemental, inventory?: EquippableItem[], stopRecursion: boolean = false, count: number = 0){
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

      //If the stat exists on the player object, like defense or resistance, include it here.
      //Does NOT handle adding base resisance/defense to something like finding the total BludgeoningDamageResistance
      //which should be equal to BludgeoningDamageResistance modifier + base defense
      if (this[`${statName}`]){
        totalStatValue += this[`${statName}`]; //equal to base + effect modifier here
      }

      let equippedEquipment = [];
      inventory.forEach((equipment) => {
        if (equipment.equippedBy?.name === this.name){
          equippedEquipment.push(equipment);
          if (equipment[`${statName}`]){
            totalStatValue += equipment[`${statName}`];
          }
        }
      });

      equippedEquipment.forEach((equippedItem) => {
        //If we found a matching DR, add it's value to the total
        let searchDamageResistances = equippedItem.damageResistances.find(resistance => resistance.constructor.name === statName);
        if (searchDamageResistances){ totalStatValue += searchDamageResistances.resistance; }
        
        //If the found damage resistance is elemental, add the player's resistance; otherwise, add defense
        if (searchDamageResistances && searchDamageResistances?.elemental && stopRecursion === false && counter < 1){
          totalStatValue += this.calcTotalStatValue('resistance', null, inventory, true, counter++);
        } else if (searchDamageResistances && !searchDamageResistances?.elemental && stopRecursion === false && counter < 1){
          totalStatValue += this.calcTotalStatValue('defense', null, inventory, true, counter++);
        }

        //Now, search through any equipped item's statusEffectResistances. Any found items have the player's base resistance added
        let searchStatusResistances = equippedItem.statusEffectResistances.find(statusResist => statusResist.constructor.name === statName);
        if (searchStatusResistances){ totalStatValue += searchStatusResistances.resistance; }
        if (searchStatusResistances && stopRecursion === false && counter < 1){
          totalStatValue += this.calcTotalStatValue('resistance', null, inventory, true, counter++);
        }
        
        //Finally, search through any equipped item's damageTypes for a total percentage of any given type
        //Does NOT include any extra Trinket damageType percentages, as those are included as +% damage
        //added to the split. For example, a trinket with 10% fire damage, after the damage has been calculated
        //and split between the damage type(s), any matching trinket percentages go to that. So
        //10 damage 60/40 fire/bludgeoning, +10% trinket fire damage, = 10% of 6 = 0.6 rounded 1 so the end result
        //is 7/4 fire/bludgeoning damage instead of 6/4.
        if (!(equippedItem instanceof Trinket)){
          let searchDamageTypes = equippedItem.damageTypes.find(damageType => damageType.constructor.name === statName);
          if (searchDamageTypes){ totalStatValue += searchDamageTypes.percent; }
        }

      if (isElemental !== null){
        //If we don't have a matching DR, and the damage is physical, return base defense
        if (!searchDamageResistances && isElemental === true && stopRecursion === false && counter < 1 && !searchStatusResistances){
          totalStatValue += this.calcTotalStatValue('resistance', null, inventory, true, counter++);

        //If we don't have a matching DR, and the damage is elemental, return base resistance
        } else if (!searchDamageResistances && isElemental === false && stopRecursion === false && counter < 1 && !searchStatusResistances && statName !== 'evasion'){
          totalStatValue += this.calcTotalStatValue('defense', null, inventory, true, counter++);

        //If we don't have a matching StatusResistance, return base resistance
        } else if (!searchStatusResistances && stopRecursion === false && counter < 1 && !searchDamageResistances){
          totalStatValue += this.calcTotalStatValue('resistance', null, inventory, true, counter++);
        }
      }
        
      });

      // console.log(statName + ' ' + totalStatValue);
      return totalStatValue;
    }

  /****************************************************************************************
   * Calculate Effect Resistance - Checks a given stat resistance from calcTotalStatValue
   * and calculates to see if that effect has been resisted or not.
   * true === effect resisted
   * false === effect applied
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
   * 
   * Any split physical damage is calculated individually; So 80/20 slashing/piercing damage
   * for 10 total, so 8/2, is deducted based on slashing/piercing resistance + base defense.
   * If no specific defense, base defense is instead used.
   ****************************************************************************************/
    calcDamageReduction(damage: number, enemyTarget: Enemy, inventory: EquippableItem[], damageTypes: any[] = null): number{
      let physicalDamageAfterReduction = 0;
      let elementalDamageAfterReduction = 0;
          
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

        //If we pass in damageTypes as an argument, then the damage reduction will be from
        //either a spell or consumable rather than a base attack done, so don't use the weapon damage types
        if (damageTypes){
          playerDamageTypes = [];
          damageTypes.forEach((damageType) => {
            let copy = _.cloneDeep(damageType);
            copy.damage = Math.round((damageType.percent / 100) * damage);
            playerDamageTypes.push(copy);
          });
        }
      
      //Search through any trinkets that have any damage types tied to them, and increase the respective player damage type by that percentage
      inventory.forEach((item) => {
        if (item.equippedBy?.name === this.name && (item instanceof Trinket)){
          item.damageTypes.forEach((damageType) => {
            let damageTypeMatchIndex = playerDamageTypes.findIndex(playerDamageType => playerDamageType.constructor.name === damageType.constructor.name);
            if (damageTypeMatchIndex !== -1){
              playerDamageTypes[damageTypeMatchIndex].damage = playerDamageTypes[damageTypeMatchIndex].damage = Math.round((playerDamageTypes[damageTypeMatchIndex].damage + (playerDamageTypes[damageTypeMatchIndex].damage * (damageType.percent / 100))));
            }
          });
        }
      });
      
      let enemyPhysDR = null;
      let enemyElemDR = null;
      playerDamageTypes.forEach((e) => {
        if (e.elemental){
          enemyElemDR = enemyTarget.calcTotalStatValue(e.constructor.name + 'Resistance', e.elemental);
          let reductionPercent = (((enemyElemDR)/2)/150);
          reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2; //Round to 2 decmial places, preserving number type
          elementalDamageAfterReduction += Math.round((e.damage - (e.damage * reductionPercent)));
          if (elementalDamageAfterReduction <= 0){ elementalDamageAfterReduction = 1; }
        } else {
          enemyPhysDR = enemyTarget.calcTotalStatValue(e.constructor.name + 'Resistance', e.elemental);
          let reductionPercent = enemyPhysDR / (enemyPhysDR + e.damage * 3);
          reductionPercent = Math.round( reductionPercent * 1e2 ) / 1e2;
          physicalDamageAfterReduction += Math.round((e.damage - (e.damage * reductionPercent)));
          if (physicalDamageAfterReduction <= 0){ physicalDamageAfterReduction = 1; }
        }
      });
      
      let damageAfterReduction = physicalDamageAfterReduction + elementalDamageAfterReduction;

      //Prevent attacks from doing 0 damage, limiting it to at least 1
      if (damageAfterReduction <= 0){damageAfterReduction = 1;}

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
   ****************************************************************************************/
    private calcBaseAttackDamage(inventory: EquippableItem[]){
      let dam = (this.calcTotalStatValue('strength', null, inventory) / 2) + this.calcTotalStatValue('attack', null, inventory);

      //Damage variance, a random number from 1-7 more or less than the calculated value, minimum of 1
      let variance = _.random(1, this.calcTotalStatValue('variance', null, inventory));

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
    private isCriticalHit(inventory: EquippableItem[]){
      //(Luck + Weapon Crit/accessory/armor)/2 out of 255
      let critChance = Math.round((((this.calcTotalStatValue('luck', null, inventory) + this.calcTotalStatValue('crit', null, inventory)) / 2) / 255) * 100);
      if (_.random(1, 100) < critChance){
        return true;
      }
      return false;
    }

   /****************************************************************************************
   * Calculate Attack Accuracy - Determines whether or not an attack hits or not.
   * If we miss, stop here and print the result.
   * true === hit
   * false === miss
   ****************************************************************************************/
    calcAttackAccuracy(player: Player, enemyTarget: Enemy, inventory: EquippableItem[], appendText): boolean{
      if ((_.random(1, 100)) < player.calcTotalStatValue('accuracy', null, inventory)){
        return true;
      } else {
        if (player.health !== 0){
          appendText('*', true, 'playerText');
          appendText(player.name, false, 'underline', 'playerText');
          appendText('misses', false, 'greyText');
          appendText(enemyTarget.name + '!', false, 'greyText');
        }
        if (player.health === 0){
          appendText('*', true, 'playerText');
          appendText(player.name, false, 'underline', 'playerText');
          appendText('at near death attempts', false, 'redText');
          appendText('one final attack on', false, 'redText');
          appendText(enemyTarget.name, false, 'redText');
          appendText('before perishing and misses!', false, 'redText');
          player.health -= 1;
        }
        return false;
      }
    }

    /****************************************************************************************
    * Calculate Evasion Chance - Calculates whether or not the attack was evaded
    * false === attack hits
    * true === attack evaded
    ****************************************************************************************/
   calcEvasionChance(inventory: EquippableItem[], enemyTarget: Enemy, appendText): boolean{
    let enemyEvasion = enemyTarget.calcTotalStatValue('evasion', null);
    let playerAccuracy = this.calcTotalStatValue('accuracy', null, inventory);
    let evadePercent = enemyEvasion / (enemyEvasion + playerAccuracy) / 2 ;
    evadePercent = Math.round( evadePercent * 1e2 ) / 1e2; //Round to 2 decmial places, preserving number type
    evadePercent *= 100;
    if (_.random(1, 100) < evadePercent){
      if (this.health !== 0){
        appendText('*', true, 'playerText');
        appendText(this.name, false, 'underline', 'playerText');
        appendText('attacks, but', false, 'greyText');
        appendText(enemyTarget.name, false, 'greyText');
        appendText('deftly dodges the hit!', false, 'greyText');
      }
      if (this.health === 0){
        appendText('*', true, 'playerText');
        appendText(this.name, false, 'underline', 'playerText');
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(enemyTarget.name, false, 'redText');
        appendText('before perishing, but', false, 'redText');
        appendText(enemyTarget.name, false, 'redText');
        appendText('deftly dodges the hit!', false, 'redText');
        this.health -= 1;
      }
      return true;
    }

    
    return false;
   }
        
  /****************************************************************************************
   * Player Attack - Handles basic player attacks.
   * Damage is based on attack power.
   ****************************************************************************************/
  playerAttack(enemyTarget: Enemy, intervalID, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void, inventory: EquippableItem[]){    
    
    //Return true/false if we hit/miss to use to show graphic of if enemy is hit or not
    let attackHits = null;

    if (this.ATB < 100 || intervalID === null){ return; }
    
    //Determine whether or not the attack hits
    attackHits = this.calcAttackAccuracy(this, enemyTarget, inventory, appendText);
    if (!attackHits){
      return attackHits;
    }

    //Determine whether or not the attack is evaded
    attackHits = this.calcEvasionChance(inventory, enemyTarget, appendText);
    if (attackHits){
      //Attack was evaded
      return attackHits;
    }
    
    //Calculate the attack's damage if we don't miss
    let damage = this.calcBaseAttackDamage(inventory);

    //If the attack is a crit, double the damage of the attack
    let attackIsCrit = this.isCriticalHit(inventory);
    if (attackIsCrit){
      damage *= 2;
    }

    //Now that we have the attack's damage, crit or not, reduce it based on the target's DR
    damage = this.calcDamageReduction(damage, enemyTarget, inventory);
    
    //Display standard attack hits message if not a crit
    if (!attackIsCrit){
      //If the player has more than 0 hp allow the hit
      if (this.health !== 0){
        appendText('*', true, 'playerText');
        appendText(this.name, false, 'underline', 'playerText');
        appendText('hits', false);
        appendText(enemyTarget.name, false);
        appendText('for', false);
        appendText(damage.toString(), false, 'redText');
        appendText('damage!', false);
        enemyTarget.health -= damage;
      }
      
      //Player gets one last attack before dying if it ends up at 0 hp
      if (this.health === 0){
        appendText('*', true, 'playerText');
        appendText(this.name, false, 'underline', 'playerText');
        appendText('at near death attempts', false, 'redText');
        appendText('one final attack on', false, 'redText');
        appendText(enemyTarget.name, false, 'crimsonText');
        appendText('before perishing and hits for', false, 'redText');
        appendText(damage.toString(), false, 'crimsonText');
        appendText('damage!', false, 'redText');
        enemyTarget.health -= damage;
        this.health -= 1;
    }
  }

  //If we crit, display a different hit message
  if (attackIsCrit){
    if (this.health !== 0){
      appendText('*', true, 'playerText');
      appendText(this.name + ':', false, 'underline', 'playerText');
      appendText('CRITICAL HIT! ', false);
      appendText(enemyTarget.name + ' takes', false);
      appendText(damage.toString(), false, 'redText');
      appendText('damage!', false);
      enemyTarget.health -= damage;
    }
    
    //Player gets one last attack before dying if it ends up at 0 hp
    if (this.health === 0){
      appendText('*', true, 'playerText');
      appendText(this.name + ':', false, 'underline', 'playerText');
      appendText('at near death attempts', false, 'redText');
      appendText('one final attack on', false, 'redText');
      appendText(enemyTarget.name, false, 'redText');
      appendText('before perishing and CRITS for', false, 'redText');
      appendText(damage.toString(), false, 'crimsonText');
      appendText('damage!', false, 'redText');
      enemyTarget.health -= damage;
      this.health -= 1;
    }
  }
  
  return attackHits;

    //If the player or the enemy is at 0 hit points, they get one
    //last attack before dying. (Only attack, not action)
    //FIXME: With current setup, if hit again before the last attack, combat ends
  }
    
}