import { DamageResistance } from "../damageResistanceModel";
import { DamageTypes } from "../damageTypes.model";
import { Player } from "../player.model";
import { StatusEffectResistance } from "../statusEffectResistanceModel";

export class EquippableItem {
    constructor(data: Partial<EquippableItem>) {
        Object.assign(this, data);
      }

    name: string
    equippedBy: Player
    description: string
    statusEffectResistances: StatusEffectResistance[]
    damageTypes: DamageTypes[]
    damageResistances: DamageResistance[]
}