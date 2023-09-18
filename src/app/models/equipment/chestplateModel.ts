import { EquippableItem } from "./equippableItem.model";

export class Chestplate extends EquippableItem{
    constructor(data: Partial<Chestplate>) {
        super(data);
        Object.assign(this, data);
      }

      strength: number
      defense: number
      speed: number
      intelligence: number
      evasion: number
}