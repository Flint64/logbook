export class Enemy {
    constructor(
        public name: string,
        public health: number,
        public attack: number,
        public defense: number,
        public speed: number,
        public mana: number,
        public accuracy: number,
        public luck: number){

            this.name = name;
            this.health = health;
            this.attack = attack;
            this.defense = defense;
            this.speed = speed; //Lower = faster
            this.mana = mana;
            this.accuracy = accuracy;
            this.luck = luck;
        }
        
        
    // this.name = '';
    // this.health = 5;
    // this.attack = 3;
    // this.defense = 5;
    // this.speed = 30;
    // this.mana = 10;
    // this.accuracy = 60;
    // this.luck = 2;

    // maxHealth: number = 5;
    // maxAttack: number = 3;
    // maxDefense: number = 5;
    // maxSpeed: number = 30;
    // maxMana: number = 10;
    // maxAccuracy: number = 60;
    // maxLuck: number = 2;
}