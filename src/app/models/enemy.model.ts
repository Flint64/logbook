import { Effect } from "./effect.model";
import * as Rand from '../../../node_modules/lodash';

export class Enemy {
    constructor(
        public name: string, //TODO: Maybe have some attacks that take longer to recover from, like a strong attack that increases the ATB negative after using
        public health: number,
        public maxHealth: number,
        public strength: number,
        public defense: number,
        public speed: number,
        public mana: number,
        public accuracy: number,
        public luck: number,
        public effects: Array<Effect>,
        public  turnCount: number){

        this.name = name;
        this.health = health;
        this.maxHealth = maxHealth;
        this.strength = strength;
        this.defense = defense;
        this.speed = speed;
        this.mana = mana;
        this.accuracy = accuracy;
        this.luck = luck;
        this.effects = effects;
        this.turnCount = turnCount;
    }
    
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