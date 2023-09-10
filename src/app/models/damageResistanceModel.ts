/****
 * TODO: Add specific damage weaknessess, like low/med/high
 * low - 1.25 extra damage
 * med - 1.5 extra damage
 * high - status effects - higher chance of applying, and if an enemy is hit with a fire weapon, it has a chance to apply the burn effect even if the weapon doesn't normally do that, ect
*/

/**
 * TODO: Add specific damage resistances. Likely modify the ones we have here, but add in
 * a data point aside from just the resistance score, such as low/med/high resistance
 * low - 1.25 less damage
 * med - 1.5 less damage
 * high - Immune to status effects of the matching type, and elemental damage from weapons/spells will be partially absorbed and added to hp
 */

export class DamageResistance {
    constructor(data: Partial<DamageResistance>) {
        Object.assign(this, data);
      }
    resistance: number;
    elemental: boolean;
}

export class BludgeoningDamageResistance extends DamageResistance {
  constructor(data: Partial<BludgeoningDamageResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class PiercingDamageResistance extends DamageResistance {
  constructor(data: Partial<PiercingDamageResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class SlashingDamageResistance extends DamageResistance {
  constructor(data: Partial<SlashingDamageResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class FireDamageResistance extends DamageResistance {
  constructor(data: Partial<FireDamageResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class IceDamageResistance extends DamageResistance {
  constructor(data: Partial<IceDamageResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class PoisonDamageResistance extends DamageResistance {
  constructor(data: Partial<PoisonDamageResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class ShockDamageResistance extends DamageResistance {
  constructor(data: Partial<ShockDamageResistance>) {
    super(data);
    Object.assign(this, data);
  }
}