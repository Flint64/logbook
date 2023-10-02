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
    self: boolean
    helpDescription: string
}

//TODO: Lucky hit type for some effects. Right now everything is 100% chance to be applied barring any resistances. Add a way for effects to have like a 20% proc chance, then check for resistances to see if it gets applied or not 