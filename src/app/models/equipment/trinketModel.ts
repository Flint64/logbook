import { EquippableItem } from "./equippableItem.model";

export class Trinket extends EquippableItem{
    constructor(data: Partial<Trinket>) {
        super(data);
        Object.assign(this, data);
      }
      defense: number
      speed: number
      intelligence: number
      strength: number
      accuracy: number
      luck: number
      crit: number
      evasion: number
}