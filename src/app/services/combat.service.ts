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
  // defense
  // speed
  // mana
  // accuracy
  // luck
  enemyList: Enemy[] = [
    new Enemy('Goblin',      30, 5, 1, 5, 92, 0, 60, 2),
    new Enemy('Green Slime', 3, 2, 1, 0, 102, 0, 60, 2),
    new Enemy('Kobold',      4, 5, 1, 5, 88, 10, 60, 2)
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

      //Loop in reverse from the player effects length to prevent the splice from changing the index and only removing one item per loop
      let i = this.player.effects.length;
      while (i--){
      
      //If the player has a poison effect, deal damage before decrementing the counter
      //Poison is equal to the modifier % of the your max hp
      switch(this.player.effects[i].name){
        case 'poison':
          this.player.health -= (this.player.effects[i].modifier / 100) * this.player.maxHealth;
        break;

        //These need to be here to prevent them from being removed before their duration is up
        //Any new effects added need to be added here or else they are removed automatically
        case 'speed':
        case 'rage':
        break;
          
        default:
          this.player.effects.splice(i, 1);
      }
    };

    //Have this loop separately from the above loop or else effects with multiple effects have their
    //duration decremented for each one when it should only happen once because erroneous effects
    //should be removed in the defualt case above
    i = this.player.effects.length;
    while (i--){
      //Reset the affected stat back to the max value
      if (this.player.effects[i].duration - 1 === 0){

        //Because these effects don't match a player value, make sure they are only removed and aren't trying to be set back to default values
        //such as player.poison = maxPoison etc.
        switch(this.player.effects[i].name){
          case 'poison':
          case 'rage':
          case 'speed':
            this.player.effects.splice(i, 1);
          break;
          
          default:
            this.player.effects.splice(i, 1);
            this.player[`${this.player.effects[i].name}`] = this.player['max' + this.player.effects[i].name.charAt(0).toUpperCase() + this.player.effects[i].name.slice(1)];
        }
        
      } else {
        this.player.effects[i].duration--;
      }
      console.log(this.player.effects[i]);
    };
    
  }

  //Only put 8 elements in the array as the last 9th will either be pause or a back button
  // mainMenuOptions = [this.attack, this.magic, this.inventory];
  
}
