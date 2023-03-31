//THESE HAVE TO MATCH THE PLAYER/ENEMY MODEL NAMES OR ELSE THINGS BREAK
export class Effect {
    constructor(
        public health: number,
        public attack: number,
        public defense: number,
        public speed: number,
        public mana: number,
        public accuracy: number,
        public luck: number,
        public poison: number,
        public rage: boolean,
        ){
            this.health = health;
            this.attack = attack;
            this.defense = defense;
            this.speed = speed;
            this.mana = mana;
            this.accuracy = accuracy;
            this.luck = luck;
            this.poison = poison;
            this.rage = rage;
        }
    }