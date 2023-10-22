import { Pipe, PipeTransform } from '@angular/core';
import { EquippableItem } from '../models/equippableItem.model';

@Pipe({
  name: 'equipmentFilter'
})
export class EquipmentFilterPipe implements PipeTransform {

  transform(items: EquippableItem[], constructorName: string): EquippableItem[] {
    return items.filter(function(e) { return e.constructor.name === constructorName });
  }

}
