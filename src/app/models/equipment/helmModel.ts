import { EquippableItem } from "./equippableItem.model";

export class Helm extends EquippableItem{
    constructor(data: Partial<Helm>) {
        super(data);
        Object.assign(this, data);
      }

    health: number
    defense: number
    mana: number
    intelligence: number
    accuracy: number
}