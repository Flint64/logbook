import { EquippableItem } from "./equippableItem.model";

export class Pants extends EquippableItem{
    constructor(data: Partial<Pants>) {
        super(data);
        Object.assign(this, data);
      }
      defense: number
      speed: number
      intelligence: number
}