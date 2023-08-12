import { Effect } from "./effect.model";
import { Player } from "./player.model";
import { Enemy } from "./enemy.model";

export class ConsumableItem {

    constructor(data: Partial<ConsumableItem>) {
        Object.assign(this, data);
        
        // Create instances of Effect for the effect property
        this.effect = (data.effect || []).map(effectData => new Effect(effectData));
      }
        
      //Consumables are assumed to be able to be used on any party member,
      //but not every item can be thrown in combat. If thrown is true,
      //then an enemy can be selected as a target in lieu of a Player
        name: string
        amount: number
        thrown: boolean
        textColor: string
        effect: Effect[]

    useItem(player: Player, target: Player | Enemy, numSelected, consumables, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void){
        
        //Add all effects from the item used if they have a duration
        consumables[numSelected - 1].effect.forEach((effect) => {
            if (effect.duration){
                
                //If we have more than one effect in the players list with the same name,
                //increase duration instead of having a duplicate effect
                if (target.effects.length > 0){
                    let index = target.effects.findIndex(obj => obj.name === effect.name);
                    if (index !== -1){ target.effects[index].duration += effect.duration; }
                }
                
                //Push a copy of the effect to prevent pass by reference from changing the values in the consumableItem object
                target.effects.push({...effect});
            }
        });

        // Remove duplicate effects (removing the one with the lower duration)
        // Compare each item to every other
        for (let i = 0; i < target.effects.length; i++) {
            for (let j = i + 1; j < target.effects.length; j++) {
                //If the names match (two duplicate effects), remove the one with the lower duration
                if (target.effects[i].name === target.effects[j].name){
                    if (target.effects[i].duration > target.effects[j].duration){
                        target.effects.splice(j, 1);
                    }
                }
            }
        }

        consumables[numSelected - 1].effect.forEach((effect) => {
            const originalPlayerValue = target[`${effect.name}`];
                    
            //If adding the value is greater than the max value, set it to the max. Otherwise if subtracting it is less than 0, set to 0
            if ((target[`${effect.name}`] + effect.modifier) >= target['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)]){
                target[`${effect.name}`] = target['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)];
            }
            
            // //If adding the value is less than or equal to the max, add the value
            if ((originalPlayerValue + effect.modifier) < target['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)]){
                target[`${effect.name}`] += effect.modifier;
            }
            
            //If subtracting the value is less than 0, set it to 0
            if ((originalPlayerValue + effect.modifier) < 0) {
                target[`${effect.name}`] = 0;
            }

            //Override the max value for the following keys.
            //Essentially the max value for these are just
            //keeping track of the current value, not the max possible
            switch(effect.name){
                case 'speed':
                case 'strength':
                    target[`${effect.name}`] += effect.modifier;
                break;
            }
        });
        
        consumables[numSelected - 1].amount -= 1;
        appendText('*', true);
        appendText(player.name, false, 'playerText', 'underline');
        appendText('uses', false);
        appendText(consumables[numSelected - 1].name, false, consumables[numSelected - 1].textColor);

        if (target instanceof Enemy){
            appendText(`on ${target.name}`, false);
        } else if (target instanceof Player){
            appendText('on', false)
            appendText(target.name, false, 'underline', 'playerText');
        }
        
    }

        
}
