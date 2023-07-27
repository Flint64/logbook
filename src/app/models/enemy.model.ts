import { Effect } from "./effect.model";
import _ from 'lodash';

export class Enemy {
    
  constructor(data: Partial<Enemy>) {
    Object.assign(this, data);
  }

        //TODO: Maybe have some attacks that take longer to recover from, like a strong attack that increases the ATB negative after usin
        name: string = "";
        health: number = null;
        maxHealth: number = null;
        strength: number = null;
        defense: number = null;
        speed: number = null;
        mana: number = null;
        accuracy: number = null;
        luck: number = null;
        effects: Array<Effect> = [];
        turnCount: number = null;
        ATB: number = 0;
    
    //TODO: Enemy weaknesses & resistances

    calcBaseAttackDamage(){
      //Damage is a random number between player min attack and attack
      let dam = (this.strength / 2) + 1 //TODO: 1 is enemy level? Not implemented yet

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
   * Enemy Attack - Handles basic enemy attacks. Damage is based on attack power.
   * //TODO: Defense stat
   ****************************************************************************************/
  enemyAttack(enemy, party){

    //Since we don't have access to the combatService within the class file,
    //make a record of the result of the enemy attack and pass that back to
    //where the attack happens. Then apply the result
    let result = {
      damage: null,
      target: null,
      enemyDeath: null,
      appendText: {
        text: null,
        newline: null,
        color: null
      }
    }

    //Select a random party member to attack & calculate damage
    result.target = party[_.random(0, (party.length - 1))];
    result.damage = enemy.calcBaseAttackDamage();
    
    if ((Math.floor(Math.random() * 100) + 1) < enemy.accuracy){

      if (enemy.health !== 0){
        result.appendText.text = `${enemy.name} hits ${result.target.name} for ${result.damage} damage!`;
        result.appendText.newline = true;
        result.appendText.color = 'enemyTextGrey'
      }

      /*Kill the enemy once the final attack has happened*/
      if (enemy.health === 0){
        result.appendText.text = `${enemy.name} at near death attempts one final attack on ${result.target.name} before perishing and hits for ${result.damage} damage`;
        result.appendText.newline = true;
        result.appendText.color = 'enemyTextRed';
        result.enemyDeath = true;
        // this.previousTarget.classList.add('enemyHit');
      }
      
    //If enemy misses
    } else {
      if (enemy.health !== 0){
        result.appendText.text = `${enemy.name} misses ${result.target.name}!`;
        result.appendText.newline = true;
        result.appendText.color = 'enemyTextGrey';
      }

      if (enemy.health === 0){
        /*Kill the enemy once the final attack has happened*/
        result.appendText.text = `${enemy.name} at near death attempts one final attack on ${result.target.name} before perishing and misses!`;
        result.enemyDeath = true;
        result.appendText.newline = true;
        result.appendText.color = 'enemyTextRed';
    }
  }

    return result;
    
  }
}