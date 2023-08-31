export class Resistance {
    constructor(data: Partial<Resistance>) {
        Object.assign(this, data);
      }
      
    name: string
    modifier: number
}