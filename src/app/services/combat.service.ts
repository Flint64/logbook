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
    new Enemy('Goblin',      5, 5, 5, 92, 0, 60, 2),
    new Enemy('Green Slime', 3, 2, 0, 102, 0, 60, 2),
    new Enemy('Kobold',      4, 5, 5, 88, 10, 60, 2)
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

    this.player.effects.forEach((e, index) => {

      //If the player has a poison effect, deal damage before decrementing the counter
      //Poison is equal to the modifier % of the your max hp
      if (e.name === 'poison'){
        this.player.health -= (e.modifier / 100) * this.player.maxHealth;
      }
      
      //Reset the affected stat back to the max value
      if (e.duration - 1 === 0){
        this.player.effects.splice(index, 1);
        this.player[`${e.name}`] = this.player['max' + e.name.charAt(0).toUpperCase() + e.name.slice(1)];
      } else {
        e.duration--;
      }
    });
    console.log(this.player.effects);
  }

  //Only put 8 elements in the array as the last 9th will either be pause or a back button
  // mainMenuOptions = [this.attack, this.magic, this.inventory];
  
}
