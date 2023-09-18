import { DamageTypes, BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { StatusEffectResistance, BurnResistance, PoisonResistance, FreezeResistance, ShockResistance } from "src/app/models/statusEffectResistanceModel";
import { EquippableItem } from "./equippableItem.model";


export class Weapon extends EquippableItem{
    constructor(data: Partial<Weapon>) {
        super(data);
        Object.assign(this, data);
      }

      strength: number
      speed: number
      intelligence: number
      accuracy: number
      luck: number
      attack: number
      crit: number
      statusEffectResistances: StatusEffectResistance[];
      damageTypes: DamageTypes[];
}