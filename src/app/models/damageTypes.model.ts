export class DamageTypes {
    constructor(data: Partial<DamageTypes>) {
        Object.assign(this, data);
      }
    percent: number
}

export class BludgeoningDamage extends DamageTypes {
  constructor(data: Partial<BludgeoningDamage>) {
    super(data);
    Object.assign(this, data);
  }
}

export class PiercingDamage extends DamageTypes {
  constructor(data: Partial<PiercingDamage>) {
    super(data);
    Object.assign(this, data);
  }
}

export class SlashingDamage extends DamageTypes {
  constructor(data: Partial<SlashingDamage>) {
    super(data);
    Object.assign(this, data);
  }
}

export class FireDamage extends DamageTypes {
  constructor(data: Partial<FireDamage>) {
    super(data);
    Object.assign(this, data);
  }
}

export class IceDamage extends DamageTypes {
  constructor(data: Partial<IceDamage>) {
    super(data);
    Object.assign(this, data);
  }
}

export class PoisonDamage extends DamageTypes {
  constructor(data: Partial<PoisonDamage>) {
    super(data);
    Object.assign(this, data);
  }
}

export class ShockDamage extends DamageTypes {
  constructor(data: Partial<ShockDamage>) {
    super(data);
    Object.assign(this, data);
  }
}