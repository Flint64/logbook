import { DamageResistance } from "./damageResistanceModel";
import { Player } from "./player.model";
import { DamageTypes, BludgeoningDamage, PiercingDamage, SlashingDamage, FireDamage, IceDamage, PoisonDamage, ShockDamage } from "src/app/models/damageTypes.model";
import { StatusEffectResistance, BurnResistance, PoisonResistance, FreezeResistance, ShockResistance } from "src/app/models/statusEffectResistanceModel";

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

export class Chestplate extends EquippableItem{
  constructor(data: Partial<Chestplate>) {
      super(data);
      Object.assign(this, data);
    }

    strength: number
    defense: number
    speed: number
    intelligence: number
    evasion: number
}

export class Greaves extends EquippableItem{
  constructor(data: Partial<Greaves>) {
      super(data);
      Object.assign(this, data);
    }

    strength: number
    defense: number
    luck: number
}

export class Helm extends EquippableItem{
  constructor(data: Partial<Helm>) {
      super(data);
      Object.assign(this, data);
    }

  defense: number
  intelligence: number
  accuracy: number
}

export class Pants extends EquippableItem{
  constructor(data: Partial<Pants>) {
      super(data);
      Object.assign(this, data);
    }
    defense: number
    speed: number
    intelligence: number
}

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