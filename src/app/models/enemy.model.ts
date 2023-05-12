import { Effect } from "./effect.model";

export class Enemy {
    constructor(
        public name: string, //TODO: Maybe have some attacks that take longer to recover from, like a strong attack that increases the ATB negative after using
        public health: number,
        public maxHealth: number,
        public attack: number,
        public minAttack: number,
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
        this.attack = attack;
        this.minAttack = minAttack;
        this.defense = defense;
        this.speed = speed;
        this.mana = mana;
        this.accuracy = accuracy;
        this.luck = luck;
        this.effects = effects;
        this.turnCount = turnCount;
    }
}