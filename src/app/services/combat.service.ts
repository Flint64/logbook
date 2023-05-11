import { Injectable } from '@angular/core';
import { Enemy } from '../models/enemy.model';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class CombatService {

  player: Player = new Player();

  // name
  // health
  // attack
  // minAttack
  // defense
  // speed
  // mana
  // accuracy
  // luck
  // effects
  enemyList: Enemy[] = [
    new Enemy('Goblin',      30, 5, 1, 5, 80, 0, 60, 2, []),
    new Enemy('Green Slime', 3, 2, 1, 0, 75, 0, 60, 2, []),
    new Enemy('Kobold',      4, 5, 1, 5, 90, 10, 60, 2, []),
  ];
  
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

    //Handle decrementing and removing effects from the player based on duration.
    //Looping backwards here to not affect the array indexes
    for (let i = this.player.effects.length - 1; i >= 0; i--){
      this.player.effects[i].duration--;

      //Handle the different types of effects here that proc every turn such as
      //poison, burns, etc. Some other effects like rage that have a duration but
      //no modifier are handled in the incrementATB area as rage specifically
      //inhibits your ability to select a target, something not handled here.
      switch(this.player.effects[i].name){

        //Currently does x% of health damage based on its modifier.
        case 'poison':
        case 'burn':
          this.player.health -= (this.player.effects[i].modifier / 100) * this.player.maxHealth;
        break;
      }
      
      //If duration has gone down to 0, remove it from the list and reset player values
      if (this.player.effects[i].duration === 0){
        
        //Reset player values before removing from list or else effect never ends. 
        for (const [key, value] of Object.entries(this.player)) {

          //If the player has an effect name that matches a player value, reset it to the max value of that field* with the exception of minAttack
          //attack -> maxAttack
          //minAttack -> maxMinAttack
          if (this.player.effects[i].name === key){
            if (this.player.effects[i].name === 'minAttack'){
              //Reset to maxMinAttack instead of just appending max to the field
              this.player[`${key}`] = this.player['maxMin' + this.player.effects[i].name.charAt(0).toUpperCase() + this.player.effects[i].name.slice(1)]
            } else {
              this.player[`${key}`] = this.player['max' + this.player.effects[i].name.charAt(0).toUpperCase() + this.player.effects[i].name.slice(1)]
            }

            
          }
        }
        
        //TODO: And fix the CSS on the player bars
        this.player.effects.splice(i, 1);
      }
    }
    
    // this.player.effects.forEach((e, index) => {
    //   console.log(e);
    // });
    
  }

  /****************************************************************************************
   * End Turn - Ends the enemies turn in combat. Resets the enemies ATB gauge and
   * decrements any active effects on them
   ****************************************************************************************/
  endEnemyTurn(index: number){
    //Reset ATB guage to -10 to display empty guage instead of partially
    //filled due to interval counter never stopping

    //Choose a random number between -30/-10 to reset the enemy ATB gauge to so that
    //the enemy attacks are a little more random
    let num = Math.floor(Math.random() * (30 - 10 + 1) + 10);
      num *= -1;
      this.enemyATBValues[index] = num;
      // console.log(num);


    //TODO: Make this work like the player endTurn function above
    // this.enemyATBValues[index] = -10; 
    
  }
  
}

//Only put 8 elements in the array as the last 9th will either be pause or a back button
// mainMenuOptions = [this.attack, this.magic, this.inventory];