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
      //TODO: Accuracy for thrown items?
        name: string
        amount: number
        thrown: boolean
        textColor: string
        effect: Effect[]

    useItem(player: Player, target: Player | Enemy, numSelected, consumables, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void){
        
        //Add all effects from the item used if they have a duration
        consumables[numSelected - 1].effect.forEach((effect) => {
                //If we have more than one effect in the players list with the same name,
                //increase duration instead of having a duplicate effect
                if (target.effects.length > 0){
                    let index = target.effects.findIndex(obj => obj.name === effect.name);
                    if (index !== -1){ target.effects[index].duration += effect.duration; }
                }
                
                //Push a copy of the effect to prevent pass by reference from changing the values in the consumableItem object
                target.effects.push({...effect});
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

        //For using healing/mana potions that have an instant affect
        consumables[numSelected - 1].effect.forEach((effect) => {
            if (effect.name === 'health' || effect.name === 'mana'){
                target[effect.name] = target.calcTotalStatValue(effect.name);
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
