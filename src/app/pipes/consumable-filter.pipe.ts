import { Pipe, PipeTransform } from '@angular/core';
import { ConsumableItem } from '../models/consumableItem.model';

@Pipe({
  name: 'consumableFilter'
})
export class ConsumableFilterPipe implements PipeTransform {

  transform(items: ConsumableItem[], constructorName: string): ConsumableItem[] {
    return items.filter(function(e) { return e.constructor.name === constructorName });
  }

}
