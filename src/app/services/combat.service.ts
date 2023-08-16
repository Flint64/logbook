import { Injectable } from '@angular/core';
import { Enemy } from '../models/enemy.model';
import { Player } from '../models/player.model';
import { enemies } from '../components/combat-test/enemyList';
import { Party } from '../models/party.model';

@Injectable({
  providedIn: 'root'
})
export class CombatService {

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
    this.player1.health = 80;
    
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
    
    member.ATB = -30;
    member.turnCount++;

    this.decrementEffects(member);
    
    // this.party.members[0].effects.forEach((e, index) => {
    //   console.log(e);
    // });
    
  }

  /****************************************************************************************
   * End Turn - Ends the enemies turn in combat. Resets the enemies ATB gauge and
   * decrements any active effects on them
   ****************************************************************************************/
  endEnemyTurn(index: number){
    //Choose a random number between -30/-10 to reset the enemy ATB gauge to so that
    //the enemy attacks are a little more random
    this.enemyList[index].turnCount++;
    let num = Math.floor(Math.random() * (30 - 10 + 1) + 10);
      num *= -1;
      this.enemyList[index].ATB = num;

      this.decrementEffects(this.enemyList[index]);
      
  }

  decrementEffects(target: Enemy | Player){
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
      switch(target.effects[i].name){

        //Currently does x% of health damage based on its modifier. Round to prevent decimals
        case 'poison':
            target.health -= Math.round((target.effects[i].modifier / 100) * target.maxHealth);
            if (Math.round((target.effects[i].modifier / 100) * target.maxHealth) <= 0){
              target.health -= 1;
            }
        break;
        //Currently does flat damage equal to the modifier
        case 'burn':
          target.health -= (target.effects[i].modifier);
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