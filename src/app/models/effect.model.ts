import { DamageTypes } from "./damageTypes.model";

export class Effect {
    constructor(data: Partial<Effect>) {
        Object.assign(this, data);
      }

    name: string
    duration: number
    modifier: number
    damageTypeName: string
    damageType: DamageTypes[] //Only allow one damageType for effects on consumableItems. Spells can have multiple.
    canBeResisted: boolean
    applicationChance: number
    self: boolean
    helpDescription: string
}