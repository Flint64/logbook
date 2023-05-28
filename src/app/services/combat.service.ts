import { Injectable } from '@angular/core';
import { Enemy } from '../models/enemy.model';
import { Player } from '../models/player.model';
import { enemies } from '../components/combat-test/enemyList';

@Injectable({
  providedIn: 'root'
})
export class CombatService {

  player: Player = new Player();
  
  enemyList: Enemy[] = [];
  
  enemyATBValues: number[] = [];
  enemyHealthValues: number[] = [];
  
  constructor() { }

  /****************************************************************************************
   * End Turn - Ends the player turn in combat. Resets the player's ATB gauge and
   * decrements any active effects on the player
   ****************************************************************************************/
  endTurn(){
    this.player.ATB = 0;
    this.player.turnCount++;

    this.decrementEffects(this.player);
    
    // this.player.effects.forEach((e, index) => {
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
      this.enemyATBValues[index] = num;

      this.decrementEffects(this.enemyList[index]);
      
  }

  decrementEffects(target: any){
    //Handle decrementing and removing effects from the player or enemy based on duration.
    //Looping backwards here to not affect the array indexes
    for (let i = target.effects.length - 1; i >= 0; i--){
      target.effects[i].duration--;

      //Handle the different types of effects here that proc every turn such as
      //poison, burns, etc. Some other effects like rage that have a duration but
      //no modifier are handled in the incrementATB area as rage specifically
      //inhibits your ability to select a target, something not handled here.
      switch(target.effects[i].name){

        //Currently does x% of health damage based on its modifier.
        case 'poison':
          target.health -= (target.effects[i].modifier / 100) * target.maxHealth;
          break;
          case 'burn':
          target.health -= (target.effects[i].modifier);
        break;
      }
      
      //If duration has gone down to 0, remove it from the list and reset player values
      if (target.effects[i].duration === 0){
        
        //Reset player values before removing from list or else effect never ends. 
        for (const [key, value] of Object.entries(target)) {

          //If the player has an effect name that matches a player value, reset it to the max value of that field
          if (target.effects[i].name === key){
              target[`${key}`] = target['max' + target.effects[i].name.charAt(0).toUpperCase() + target.effects[i].name.slice(1)];          
          }
        }
        
        target.effects.splice(i, 1);
      }
    }
  }
  
}

//Only put 8 elements in the array as the last 9th will either be pause or a back button
// mainMenuOptions = [this.attack, this.magic, this.inventory];