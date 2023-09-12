import { Effect } from "./effect.model";
import { Player } from "./player.model";
import { Enemy } from "./enemy.model";
import _ from 'lodash';

export class ConsumableItem {

    constructor(data: Partial<ConsumableItem>) {
        Object.assign(this, data);
        
        // Create instances of Effect for the effect property
        this.effects = (data.effects || []).map(effectData => new Effect(effectData));
      }
        
      //Consumables are assumed to be able to be used on any party member,
      //but not every item can be thrown in combat. If thrown is true,
      //then an enemy can be selected as a target in lieu of a Player
        name: string
        amount: number
        thrown: boolean
        textColor: string
        effects: Effect[]

    /******************************************************************************************************
     * Add Consumable Effect - Add the consumable effect
     ******************************************************************************************************/
    private addConsumableEffect(target: Player | Enemy, effect: Effect){
        //If we have more than one effect in the players list with the same name,
        //increase duration instead of having a duplicate effect
        if (target.effects.length > 0){
            let index = target.effects.findIndex(obj => obj.name === effect.name);
            if (index !== -1){ target.effects[index].duration += effect.duration; }
        }
        
        //Push a copy of the effect to prevent pass by reference from changing the values in the consumableItem object
        target.effects.push({...effect});
        // console.log(target.effects);
    }

    /******************************************************************************************************
     * Remove Duplicate Effects - Removes duplicate effects (removing the one with the lower duration)
     ******************************************************************************************************/
    private removeDuplicateEffects(target: Player | Enemy){

        //For ANY effect with an instant duration / null, remove it immediately or else it gets duplicated twice
        for (let i = target.effects.length - 1; i >= 0; i--){
            if (!target.effects[i].duration){
                target.effects.splice(i, 1);
            }
        }
        
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
    }
       
    /******************************************************************************************************
     * Use Item - Uses the selected item, adds any effects to the selected target, and prints the result
     * 'this' refers to the selected consumable. No need to pass in the party.consumables and numSelected.
     * We do however need access to the inventory to check equipment for any resistances.
     ******************************************************************************************************/
    //TODO: Elemental damage resistance from any thrown vials
    //TODO: thrown consumables with elemental damages need damage reduction based on type?

    
    useItem(player: Player, target: Player | Enemy, inventory, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void){
    //TODO: This whole thing needs a rework. Resisting effects should be its own function, accuracy should be outsourced as well, and the
    //resultant display of what happened needs some work, maybe text stored in the object itself, split on spaces and applied somehow. It just needs to be cleaner.

        let effectWasResisted: boolean = false;
        let resistedEffect: Effect = null;
        let appliedEffect: Effect = null;

        //If we're throwing a vial on an enemy, calculate accuracy to see if the vial finds it's mark
        //Use base accuracy instead of equipment total so that it's slightly lower
        //If we miss the attack (greater than instead of less than) stop here and print the result
        if (this.thrown && (target instanceof Enemy)){
            if ((_.random(1, 100)) > player.accuracy){
                this.amount -= 1;
                appendText('*', true, 'playerText');
                appendText(player.name, false, 'playerText', 'underline');
                appendText('throws a', false);
                appendText(this.name, false, this.textColor);
                appendText(`at ${target.name}`, false);
                appendText('and misses!', false)
                return;
            }
        }

        //If the effect can be resisted, such as poison, burn, etc. then
        //grab the name + Resistance to get poisonResist, burnResist, etc.
        //which are the names on equipment so that we can caluclate
        //the correct resistance values.
        this.effects.forEach((effect) => {
            if (effect.canBeResisted){
                if (!target.calcEffectResistance(target.calcTotalStatValue(effect.name + 'Resistance', null, inventory))){
                    this.addConsumableEffect(target, effect);
                    appliedEffect = effect;
                } else {
                    effectWasResisted = true;
                    resistedEffect = effect;
                }
            } else {
                //Add all effects from the item used if they have a duration && can't be resisted
                this.addConsumableEffect(target, effect);
            }
        });

        
        //For using healing/mana potions that have an instant affect
        this.effects.forEach((effect) => {
            if ((effect.name === 'health' || effect.name === 'mana') && !effect.duration){
                target[effect.name] = target.calcTotalStatValue(effect.name, null, inventory);
            }
        });        
        
        this.removeDuplicateEffects(target);

        this.amount -= 1;
        appendText('*', true, 'playerText');
        appendText(player.name, false, 'playerText', 'underline');
        appendText('uses', false);
        appendText(this.name, false, this.textColor);

        if (target instanceof Enemy){
            appendText(`on ${target.name}`, false);
        } else if (target instanceof Player){
            appendText('on', false)
            appendText(target.name, false, 'underline', 'playerText');
        }

        //If the effect was resisted, display that in the story text
        if (effectWasResisted){
            if (target instanceof Enemy){
                appendText(`${target.name}`, true, 'crimsonText');
                appendText('resisted the', false);
                appendText(`${resistedEffect.name}`, false, this.textColor); //FIXME: If a potion/vial has multiple effects that can be resisted, only the last resisted one will be displayed because this isn't in a loop
                appendText('effect!', false);
                
            } else if (target instanceof Player){
                appendText('*', true, 'playerText');
                appendText(`${target.name}`, false, 'underline', 'playerText');
                appendText('resisted the', false);
                appendText(`${resistedEffect.name}`, false, this.textColor);
                appendText('effect!', false);
    
            }
        //If the effect is applied, also display the reuslt
        } else {
            if (target instanceof Enemy){
                appendText(`${target.name}`, true, 'crimsonText');
                appendText('is inflicted with', false);
                appendText(`${appliedEffect.name}!`, false, this.textColor); //FIXME: If a potion/vial has multiple effects that can be resisted, only the last resisted one will be displayed because this isn't in a loop
                // appendText('effect!', false);
                
            } else if (target instanceof Player){
                appendText('*', true, 'playerText');
                appendText(`${target.name}`, false, 'underline', 'playerText');
                appendText('is inflicted with', false);
                appendText(`${appliedEffect.name}!`, false, this.textColor);
                // appendText('effect!', false);
    
            }
        }
    }

        
}
