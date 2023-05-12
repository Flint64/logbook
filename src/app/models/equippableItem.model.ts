export class EquippableItem {
    constructor(
        public name: string,
        public healthModifier: number, //TODO: Rename these to just health, defense, etc. Add isEquipped bool
        public attackModifier: number,
        public defenseModifier: number,
        public speedModifier: number,
        public manaModifier: number,
        public accuracyModifier: number,
        public luckModifier: number,
        ){
            this.healthModifier = healthModifier;
            this.attackModifier = attackModifier;
            this.defenseModifier = defenseModifier;
            this.speedModifier = speedModifier;
            this.manaModifier = manaModifier;
            this.accuracyModifier = accuracyModifier;
            this.luckModifier = luckModifier;
        }
}