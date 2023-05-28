import { Effect } from "./effect.model";
import * as Rand from '../../../node_modules/lodash';

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
    
    //TODO: Enemy weaknesses & resistances

    calcBaseAttackDamage(){
        //Damage is a random number between player min attack and attack
      let dam = (this.strength / 2) + 1 //TODO: 1 is enemy level? Not implemented yet

      //Damage variance, a random number from 1-5 more or less than the calculated value, minimum of 1
      let variance = Rand.random(1, 5);

      // this will add minus sign in 50% of cases
      variance *= Math.round(Math.random()) ? 1 : -1; 
      dam += variance;

      //Round the damage down to the closest whole number
      dam = Math.floor(dam);

      if (dam <= 0){ dam = 1; }

      return dam;
    }
    
}