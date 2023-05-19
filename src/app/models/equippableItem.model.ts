export class EquippableItem {
    constructor(
        public name: string,
        public health: number,
        public strength: number,
        public defense: number,
        public speed: number,
        public mana: number,
        public accuracy: number,
        public luck: number,
        public isEquipped: boolean,
        ){
            this.health = health;
            this.strength = strength;
            this.defense = defense;
            this.speed = speed;
            this.mana = mana;
            this.accuracy = accuracy;
            this.luck = luck;
            this.isEquipped = isEquipped;
        }
}