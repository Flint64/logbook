/****
 * Specific damage weaknessess, like low/med/high
 * base - no change from whatever the resistance value is for the damage type
 * low - 1.25 extra damage
 * med - 1.5 extra damage
 * high - status effects - higher chance of applying, and if an enemy is hit with a fire weapon, it has a chance to apply the burn effect even if the weapon doesn't normally do that, ect
*/

/**
 * Specific damage resistances. Likely modify the ones we have here, but add in
 * a data point aside from just the resistance score, such as low/med/high resistance
 * base - no change from whatever the resistance value is for the damage type
 * low - 1.25 less damage
 * med - 1.5 less damage
 * high - Immune to status effects of the matching type
 */

 /*
 * First idea: try adding these as part of the object in this model so we can end up with something like 
 damageResistances: [
        new BludgeoningDamageResistance({resistance: 10, elemental: false, weak: 'med', strong: 'base'}), //if weak
        new BludgeoningDamageResistance({resistance: 10, elemental: false, weak: 'base', strong: 'high'}), //if strong
        new BludgeoningDamageResistance({resistance: 10, elemental: false, weak: 'base', strong: 'base'}), //if no change
      ],
      
      Or instead of two object types, the reason we have 3 levels for each strong/weak is to have more than 3. 
      We have more granular control now with 6 levels. So what about something like:
      
      new BludgeoningDamageResistance({resistance: 10, elemental: false, resistanceModifier: null}), //no change, use base resistance
      new BludgeoningDamageResistance({resistance: 10, elemental: false, resistanceModifier: 'med_strong'})

      So basically:

      low_weak - 1.25 extra damage
      med_weak - 1.5 extra damage
      high_weak - 1.5 extra damage, status effects - higher chance of applying, and if an enemy is hit with a fire weapon, it has a chance to apply the burn effect even if the weapon doesn't normally do that, ect
      null - no change, use base resistance
      low_strong - 1.25 less damage
      med_strong - 1.5 less damage //maybe rework these a bit but I think this is good
      high_strong - Immune to status effects of the matching type


 */

export class DamageResistance {
    constructor(data: Partial<DamageResistance>) {
        Object.assign(this, data);
      }
    resistance: number;
    elemental: boolean;
    resistanceModifier: string;
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