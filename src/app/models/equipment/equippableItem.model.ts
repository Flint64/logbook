import { Player } from "../player.model";
import { Resistance } from "../resistanceModel";

export class EquippableItem {
    constructor(data: Partial<EquippableItem>) {
        Object.assign(this, data);
      }

    name: string
    equippedBy: Player
    description: string
    resistances: Resistance[]
}