import { EquippableItem } from "./equippableItem.model";

export class Bracer extends EquippableItem{
    constructor(data: Partial<Bracer>) {
        super(data);
        Object.assign(this, data);
      }

      strength: number
      defense: number
      speed: number
      accuracy: number
      luck: number
      crit: number
      evasion: number
}