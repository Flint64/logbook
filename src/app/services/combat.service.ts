import { Injectable } from '@angular/core';
import { Enemy } from '../models/enemy.model';
import { Player } from '../models/player.model';
import { enemies } from '../components/combat-test/enemyList';
import { Party } from '../models/party.model';

@Injectable({
  providedIn: 'root'
})
export class CombatService {

  combatActive: boolean = false;
  party: Party = new Party();
  
  player1: Player = new Player();
  player2: Player = new Player();
  player3: Player = new Player();

  memberHealthValues: number[] = [];
  
  enemyList: Enemy[] = [];
  enemyHealthValues: number[] = [];
  
  constructor() {
    this.player1.name = "Gort";
    this.player1.speed = 150;
    
    this.player2.name = "Luke";
    this.player2.speed = 250;

    this.player3.name = "Max";
    this.player3.speed = 125;
    
    this.party.members.push(this.player1);
    this.party.members.push(this.player2);
    this.party.members.push(this.player3);
   }

  /****************************************************************************************
   * End Turn - Ends the player turn in combat. Resets the player's ATB gauge and
   * decrements any active effects on the player
   ****************************************************************************************/
  endTurn(member: Player){
    
    member.ATB = -15;
    member.turnCount++;

    this.decrementEffects(member);
    
    // this.party.members[0].effects.forEach((e, index) => {
    //   console.log(e);
    // });
    
  }

  /****************************************************************************************
   * End Enemy Turn - Ends the enemies turn in combat. Resets the enemies ATB gauge and
   * decrements any active effects on them.
   * If we have a recoveryDuration, the attack made takes longer to recover from, and
   * should set the enemy ATB gauge to -recoveryDuration
   ****************************************************************************************/
  endEnemyTurn(enemy: Enemy, recoveryDuration: number){
    //Choose a random number between -30/-10 to reset the enemy ATB gauge to so that
    //the enemy attacks are a little more random
    enemy.turnCount++;
    let num = Math.floor(Math.random() * (30 - 10 + 1) + 10);
      num *= -1;
      enemy.ATB = num;

    if (recoveryDuration && recoveryDuration < 0){
      enemy.ATB += recoveryDuration;
    }

      this.decrementEffects(enemy);
      
  }

  /****************************************************************************************
   * Decrement Effects - Handles decrementing any active effects on players or enemies
   * and removes them once their duration has reached 0. Also handles application of 
   * DoT effects such as poison and burn.
   ****************************************************************************************/
  decrementEffects(target: Enemy | Player){
    let tempEnemy = new Enemy({});
    let tempPlayer = new Player();
    
    //If the target is at 0 hp or less, don't decrement the effects and instead let them die
    if (target.health <= 0){ return; }
    
    //Handle decrementing and removing effects from the player or enemy based on duration.
    //Looping backwards here to not affect the array indexes
    for (let i = target.effects.length - 1; i >= 0; i--){
      target.effects[i].duration--;

      //Handle the different types of effects here that proc every turn such as
      //poison, burns, etc. Some other effects like rage that have a duration but
      //no modifier are handled in the incrementATB area as rage specifically
      //inhibits your ability to select a target, something not handled here.
      let dam = 0;
      switch(target.effects[i].name){
        //Currently does x% of health damage based on its modifier. Round to prevent decimals
        case 'poison':
          dam = 0;
          //Allow damage resistances to factor in to DoT effects
          (target instanceof Player) ? dam = tempEnemy.calcDamageReduction(Math.round(target.effects[i].modifier / 100 * target.maxHealth), target, this.party.inventory, target.effects[i].damageType) : dam = tempPlayer.calcDamageReduction(Math.round(target.effects[i].modifier / 100 * target.maxHealth), target, this.party.inventory, target.effects[i].damageType);
          
            target.health -= dam;
            if (dam <= 0){
              //Updated to prevent poison from killing
              if (target.health - 1 != 0){
                target.health -= 1;
              }
            }
        break;
        //Currently does flat damage equal to the modifier
        case 'burn':
          dam = 0;
          (target instanceof Player) ? dam = tempEnemy.calcDamageReduction(target.effects[i].modifier, target, this.party.inventory, target.effects[i].damageType) : dam = tempPlayer.calcDamageReduction(target.effects[i].modifier, target, this.party.inventory, target.effects[i].damageType);
          target.health -= dam;
        break;
        case 'health':
          target.health = target.calcTotalStatValue('health', null, this.party.inventory);
        break;
        case 'mana':
          target.health = target.calcTotalStatValue('mana', null, this.party.inventory);
        break;
      }
      
      //If duration has gone down to 0, remove it from the list and reset player values
      if (target.effects[i].duration === 0 || target.effects[i].duration < 0 || !target.effects[i].duration){
        target.effects.splice(i, 1);
      }
    }
  }
  
}

//Only put 8 elements in the array as the last 9th will either be pause or a back button
// mainMenuOptions = [this.attack, this.magic, this.inventory];