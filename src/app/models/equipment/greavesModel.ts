import { EquippableItem } from "./equippableItem.model";

export class Greaves extends EquippableItem{
    constructor(data: Partial<Greaves>) {
        super(data);
        Object.assign(this, data);
      }

      strength: number
      defense: number
      luck: number
}