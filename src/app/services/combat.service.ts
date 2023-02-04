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
  
  constructor() { }

  //Only put 8 elements in the array as the last 9th will either be pause or a back button
  // mainMenuOptions = [this.attack, this.magic, this.inventory];
  
}
