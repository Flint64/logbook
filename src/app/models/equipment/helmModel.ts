import { EquippableItem } from "./equippableItem.model";

export class Helm extends EquippableItem{
    constructor(data: Partial<Helm>) {
        super(data);
        Object.assign(this, data);
      }

    defense: number
    intelligence: number
    accuracy: number
}