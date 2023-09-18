import { EquippableItem } from "./equippableItem.model";

export class Chestplate extends EquippableItem{
    constructor(data: Partial<Chestplate>) {
        super(data);
        Object.assign(this, data);
      }

      health: number
      strength: number
      defense: number
      speed: number
      mana: number
      intelligence: number
      evasion: number
}