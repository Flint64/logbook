import { Injectable } from '@angular/core';
import { Effect } from "./effect.model";
import _ from 'lodash';
import { Enemy } from './enemy.model';
import { Player } from './player.model';

@Injectable()
export class Magic {

    constructor(data: Partial<Magic>) {
        Object.assign(this, data);
        
        // Create instances of Effect for the effect property
        this.effect = (data.effect || []).map(effectData => new Effect(effectData));
      }
    
      name: string
      manaCost: number
      power: number
      accuracy: number
      variance: number
      targets: number
      self: boolean
      textColor: string
      effect: Effect[]

    /******************************************************************************************************
     * Remove Duplicate Effects - Removes duplicate effects (removing the one with the lower duration)
     ******************************************************************************************************/
    private removeDuplicateEffects(target: Player | Enemy, spell: Magic){
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
        this.modifyTargetStats(target, spell);
    }

    /******************************************************************************************************
     * Add Spell Effect - Add the spell effect
     ******************************************************************************************************/
    private addSpellEffect(target: Player | Enemy, effect: Effect){
        //If we have more than one effect in the players list with the same name,
        //increase duration instead of having a duplicate effect
        if (target.effects.length > 0){
            let index = target.effects.findIndex(obj => obj.name === effect.name);
            if (index !== -1){ target.effects[index].duration += effect.duration; }
        }
        
        //Push a copy of the effect to prevent pass by reference from changing the values
        target.effects.push({...effect});
    }

    /******************************************************************************************************
     * Modify Target Stats - Modifies the target (player or enemy's) stats based on the effect 
     * name and modifier
     ******************************************************************************************************/
    private modifyTargetStats(target: any, spell){
        spell.effect.forEach((effect) => {
            const originalValue = target[`${effect.name}`];
                    
            //If adding the value is greater than the max value, set it to the max. Otherwise if subtracting it is less than 0, set to 0
            if ((target[`${effect.name}`] + effect.modifier) >= target['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)]){
                target[`${effect.name}`] = target['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)];
            }
            
            // //If adding the value is less than or equal to the max, add the value
            if ((originalValue + effect.modifier) < target['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)]){
                target[`${effect.name}`] += effect.modifier;
            }
            
            //If subtracting the value is less than 0, set it to 0
            if ((originalValue + effect.modifier) < 0) {
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
    }

    /******************************************************************************************************
     * Cast the spell - Similar to the useItem from the consumableItem class, but can target enemies as 
     * well as the player
     ******************************************************************************************************/
    //TODO: Add spell resistances and spell scaling
    //TODO: Allow selecting of a party member for spells as well instead of defaulting to enemies. Do it the same as consumableItem handles it.
    castSpell(player: Player, numSelected, spellTarget: Player | Enemy, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void){
        
        let spell: Magic = player.magic[numSelected - 1];
        let spellDamage = null;

        //Regardless of hit/miss, the spell costs mana
        player.mana -= spell.manaCost;
                
        //If the spell hits
        if ((_.random(1, 100)) < spell.accuracy){
            
            //If the spell has a damage value, apply it before the effect(s)
        if (spell.power){
            spellDamage = ((player.intelligence / 2.5) * spell.power)

            //Damage variance equal  to a range between 1 and the spell's power
            let variance = _.random(1, spell.variance);
            
            // this will add minus sign in 50% of cases
            variance *= Math.round(Math.random()) ? 1 : -1; 

            spellDamage += variance;
            spellTarget.health -= Math.round(spellDamage);
        }
        
        //If the spell has a duration and is targeted to yourself, add it to your effects list
        spell.effect.forEach((effect) => {
                      
            if (effect.duration){
                if (effect.self){
                    this.addSpellEffect(player, effect);
                } else {
                    this.addSpellEffect(spellTarget, effect);
                }
            }
        });

        this.removeDuplicateEffects(player, spell);
        this.removeDuplicateEffects(spellTarget, spell);
        
        if (spell.self){
            appendText('*', true);
            appendText(player.name, false, 'underline', 'playerText');
            appendText('casts', false);
            appendText(spell.name, false, spell.textColor);

            switch(spell.name){
                case 'Enrage':
                    appendText('and goes berserk!', false);
                break;
            }
            
        } else {
            appendText('*', true);
            appendText(player.name, false, 'underline', 'playerText');
            appendText('casts', false);
            appendText(spell.name, false, spell.textColor);
            appendText('and hits', false,);
            appendText(spellTarget.name, false);
            appendText('for', false);
            appendText(Math.round(spellDamage).toString(), false, spell.textColor);
            appendText('damage!', false);
        }


        //If the spell misses
        } else {
            appendText('*', true);
            appendText(player.name, false, 'underline', 'playerText');
            appendText('casts', false, 'greyText');
            appendText(spell.name, false, spell.textColor);
            appendText('and misses', false, 'greyText');
            appendText(spellTarget.name + '!', false, 'greyText');
        }
    }
}
