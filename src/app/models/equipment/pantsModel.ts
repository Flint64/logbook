import { EquippableItem } from "./equippableItem.model";

export class Pants extends EquippableItem{
    constructor(data: Partial<Pants>) {
        super(data);
        Object.assign(this, data);
      }
      health: number
      defense: number
      speed: number
      mana: number
      intelligence: number
}