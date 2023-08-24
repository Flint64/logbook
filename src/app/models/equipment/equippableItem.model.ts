import { Player } from "../player.model";

export class EquippableItem {
    constructor(data: Partial<EquippableItem>) {
        Object.assign(this, data);
      }

    name: string
    equippedBy: Player
    description: string
}