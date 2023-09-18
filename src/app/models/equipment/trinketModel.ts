import { EquippableItem } from "./equippableItem.model";

export class Trinket extends EquippableItem{
    constructor(data: Partial<Trinket>) {
        super(data);
        Object.assign(this, data);
      }
      health: number
      defense: number
      speed: number
      mana: number
      intelligence: number
      strength: number
      accuracy: number
      luck: number
      crit: number
      evasion: number
}