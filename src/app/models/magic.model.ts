import { Injectable } from '@angular/core';
import { Effect } from "./effect.model";
import _ from 'lodash';
import { Enemy } from './enemy.model';
import { Player } from './player.model';
import { EquippableItem } from './equipment/equippableItem.model';

//TODO: Spells need damage types & damage reduction

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
      canTargetParty: boolean
      canTargetEnemies: boolean
      textColor: string
      effects: Effect[]

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
    private calcSpellDamage(spell: Magic, player: Player, inventory: EquippableItem[]): number{
        let spellDamage = 0;
        if (spell.power){
            spellDamage = ((player.calcTotalStatValue('intelligence', inventory) / 2.5) * spell.power);

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
    //TODO: Add spell resistances
    //TODO: Rework spell scaling, it's very swingy right now, that or I'm not utilizing the stats correctly
    //TODO: Anywhere effects are added take in to account effect resistances, and allow them to be resisted
    //TODO: Elemental damage resistance from spells
    castSpell(caster: Player, spellTarget: Player | Enemy, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void, inventory: EquippableItem[]){
        
        let spellDamage = this.calcSpellDamage(this, caster, inventory);
        let effectWasResisted: boolean = false;
        let resistedEffect: Effect = null;

        //Regardless of hit/miss, the spell costs mana
        caster.mana -= this.manaCost;
                
        //If the spell hits
        if ((_.random(1, 100)) < this.accuracy){
            
        //If the spell has a damage value, apply it before the effect(s)
        spellTarget.health -= Math.round(spellDamage);
        
        //If the spell has a duration and is targeted to yourself, add it to your effects list
        this.effects.forEach((effect) => {

            if (effect.canBeResisted){
                if (!spellTarget.calcEffectResistance(spellTarget.calcTotalStatValue(effect.name + 'Resist', inventory))){
                    if (effect.self){
                        this.addSpellEffect(caster, effect);
                    } else {
                        this.addSpellEffect(spellTarget, effect);
                    }
                } else {
                    effectWasResisted = true;
                    resistedEffect = effect;
                }
            } else {
                //Add all effects from the item used if they have a duration && can't be resisted
                    if (effect.self){
                        this.addSpellEffect(caster, effect);
                    } else {
                        this.addSpellEffect(spellTarget, effect);
                    }
            }

            //For using healing/mana magic that have an instant affect
            //Can check both caster & target safely, as this will only
            //affect them if the effect is present in their list.
            if ((effect.name === 'health' || effect.name === 'mana') && !effect.duration){
                spellTarget[effect.name] = spellTarget.calcTotalStatValue(effect.name, inventory);
                caster[effect.name] = caster.calcTotalStatValue(effect.name, inventory);
            }

            //For ANY effect with an instant duration / null, remove it immediately or else it gets duplicated twice
            for (let i = spellTarget.effects.length - 1; i >= 0; i--){
                if (spellTarget.effects[i].duration === null){
                    spellTarget.effects.splice(i, 1);
                }
            }
            
        });

        this.removeDuplicateEffects(caster);
        this.removeDuplicateEffects(spellTarget);

        let healthEffect = spellTarget.effects.find(({ name }) => name === 'health');
        let enrageEffect = spellTarget.effects.find(({ name }) => name === 'rage');
            
            appendText('*', true, 'playerText');
            appendText(caster.name, false, 'underline', 'playerText');
            appendText('casts', false);
            appendText(this.name, false, this.textColor);

            if (healthEffect) {
              appendText('on', false);
              appendText(spellTarget.name + ',',false,'playerText','underline');
              appendText('restoring', false);
              appendText(healthEffect.modifier.toString(), false, 'playerText');
              appendText('health!', false);
            } else if (enrageEffect) {
              appendText('on', false);
              appendText(spellTarget.name + ',', false, 'playerText', 'underline');
              appendText('sending them into', false);
              appendText('an uncontrollable ', false);
              appendText('rage', false, this.textColor);
              appendText(' for ' + (enrageEffect.duration - 1) + ' turns!',false);

            } else {

              if (spellTarget instanceof Enemy) {
                if (spellDamage){
                  appendText('and hits', false);
                  appendText(spellTarget.name, false, 'crimsonText');
                  appendText('for', false);
                  appendText(Math.round(spellDamage).toString(), false, this.textColor);
                  appendText('damage!', false);
                } else {
                    appendText('on', false);
                    appendText(spellTarget.name + '!',false,'crimsonText');
                }
                if (effectWasResisted) {
                  appendText(`${spellTarget.name}`, true, 'crimsonText');
                  appendText('resisted the', false);
                  appendText(`${resistedEffect.name}`, false, this.textColor);
                  appendText('effect!', false);
                }
              } else if (spellTarget instanceof Player) {
                if (spellDamage){
                  appendText('and hits', false);
                  appendText(spellTarget.name, false, 'playerText', 'underline');
                  appendText('for', false);
                  appendText(Math.round(spellDamage).toString(), false, this.textColor);
                  appendText('damage!', false);
                } else {
                    appendText('on', false);
                    appendText(spellTarget.name + '!',false,'playerText','underline');
                }
                if (effectWasResisted) {
                  appendText('*', true, 'playerText');
                  appendText(`${spellTarget.name}`, false, 'underline', 'playerText');
                  appendText('resisted the', false);
                  appendText(`${resistedEffect.name}`, false, this.textColor);
                  appendText('effect!', false);
                }
              }
            }
            


        //If the spell misses
        } else {
            appendText('*', true);
            appendText(caster.name, false, 'underline', 'playerText');
            appendText('casts', false, 'greyText');
            appendText(this.name, false, this.textColor);
            appendText('and misses', false, 'greyText');
            appendText(spellTarget.name + '!', false, 'greyText');
        }
    }
}
