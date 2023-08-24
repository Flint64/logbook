import { EquippableItem } from "./equippableItem.model";

export class Weapon extends EquippableItem{
    constructor(data: Partial<Weapon>) {
        super(data);
        Object.assign(this, data);
      }

      strength: number
      speed: number
      mana: number
      intelligence: number
      accuracy: number
      luck: number
      attack: number
      crit: number
}