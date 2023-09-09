export class StatusEffectResistance {
    constructor(data: Partial<StatusEffectResistance>) {
        Object.assign(this, data);
      }
    resistance: number
}

export class BurnResistance extends StatusEffectResistance {
  constructor(data: Partial<BurnResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class PoisonResistance extends StatusEffectResistance {
  constructor(data: Partial<PoisonResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class FreezeResistance extends StatusEffectResistance {
  constructor(data: Partial<FreezeResistance>) {
    super(data);
    Object.assign(this, data);
  }
}

export class ShockResistance extends StatusEffectResistance {
  constructor(data: Partial<ShockResistance>) {
    super(data);
    Object.assign(this, data);
  }
}