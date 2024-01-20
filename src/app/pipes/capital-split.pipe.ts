import { Pipe, PipeTransform } from '@angular/core';
import { DamageResistance } from '../models/damageResistanceModel';

@Pipe({
  name: 'capitalSplit'
})
export class CapitalSplitPipe implements PipeTransform {

  transform(value: DamageResistance[], fieldName: string): Array<any> {
    let arr = [];

    if (!value){
      return;
    }
    
    value.forEach(e => {
      let split = e.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
      let display = {
        name: split[0] + ' ' + split[1] + ': ',
        value: e[`${fieldName}`]
      }

      if (fieldName === 'percent'){ 
        display.value = display.value + '%';
      }

      if (fieldName === 'trinket'){
        display.name = split[0] + ' ' + split[1];
        display.value = e['percent'];
      }
      
      arr.push(display);
    });
    return arr;
  }

}
