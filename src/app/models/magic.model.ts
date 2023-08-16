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
        this.effects = (data.effects || []).map(effectData => new Effect(effectData));
      }
    
      name: string
      manaCost: number
      power: number
      accuracy: number
      variance: number
      targets: number
      self: boolean
      textColor: string
      effects: Effect[]

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
     * Calculate Spell Damage - Returns the damage a given spell will deal, accounting for player's
     * intelligence stat, spell power, and damage variance.
    ******************************************************************************************************/
    private calcSpellDamage(spell: Magic, player: Player): number{
        let spellDamage = 0;
        if (spell.power){
            spellDamage = ((player.calcTotalStatValue('intelligence') / 2.5) * spell.power);

            //Damage variance equal  to a range between 1 and the spell's power
            let variance = _.random(1, spell.variance);
            
            // this will add minus sign in 50% of cases
            variance *= Math.round(Math.random()) ? 1 : -1; 

            spellDamage += variance;
            return spellDamage;
        }
        return spellDamage;
    }

    /******************************************************************************************************
     * Cast the spell - Similar to the useItem from the consumableItem class, but can target enemies as 
     * well as the player
     ******************************************************************************************************/
    //TODO: Add spell resistances and spell scaling
    //TODO: Allow selecting of a party member for spells as well instead of defaulting to enemies. Do it the same as consumableItem handles it.
    //TODO: Magic needs a rework, the self targeting might be finnicky. Doing the above like the consumables might be the best fix for it.
    castSpell(player: Player, numSelected, spellTarget: Player | Enemy, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void){
        
        let spell: Magic = player.magic[numSelected - 1];
        let spellDamage = this.calcSpellDamage(spell, player);

        //Regardless of hit/miss, the spell costs mana
        player.mana -= spell.manaCost;
                
        //If the spell hits
        if ((_.random(1, 100)) < spell.accuracy){
            
        //If the spell has a damage value, apply it before the effect(s)
        spellTarget.health -= Math.round(spellDamage);
        
        //If the spell has a duration and is targeted to yourself, add it to your effects list
        spell.effects.forEach((effect) => {
                      
            if (effect.self){
                this.addSpellEffect(player, effect);
            } else {
                this.addSpellEffect(spellTarget, effect);
            }

            //For using healing/mana magic that have an instant affect
            if (effect.name === 'health' || effect.name === 'mana'){
                spellTarget[effect.name] = spellTarget.calcTotalStatValue(effect.name);
                player[effect.name] = player.calcTotalStatValue(effect.name);
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
