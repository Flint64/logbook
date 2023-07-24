export class Effect {
    constructor(data: Partial<Effect>) {
        Object.assign(this, data);
      }

    name: string
    duration: number
    modifier: number
    self: boolean
    helpDescription: string    
}