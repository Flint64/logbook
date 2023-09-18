import { ConsumableItem } from "./consumableItem.model";
import { EquippableItem } from "./equippableItem.model";
import { Player } from "./player.model";

export class Party {
    constructor(){}
    
    members: Player[] = [];
    consumables: ConsumableItem[] = [];
    inventory: EquippableItem[] = [];
    
}