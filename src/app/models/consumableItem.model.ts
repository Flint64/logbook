import { Effect } from "./effect.model";

export class ConsumableItem {
    constructor(
        public name: string,
        public amount: number,
        public effect: Effect
        ){
            this.name = name;
            this.amount = amount;
            this.effect = effect;
        }
}
