import { EquippableItem, Bracer, Helm, Chestplate, Pants, Greaves, Weapon, Trinket} from 'src/app/models/equippableItem.model';
import { Injectable } from '@angular/core';
import { Effect } from "./effect.model";
import _ from 'lodash';
import { Enemy } from './enemy.model';
import { Player } from './player.model';
import { DamageTypes } from './damageTypes.model';

@Injectable()
export class Magic {

    constructor(data: Partial<Magic>) {
        Object.assign(this, data);
        
        // Create instances of Effect for the effect property
        this.effects = (data.effects || []).map(effectData => new Effect(effectData));
      }
    
      name: string
      manaCost: number
      healthCost: number
      useStrength: boolean //if true, override intelligence and use strength for the ability instead
      isAbility: boolean
      power: number
      accuracy: number
      variance: number
      targets: number //Unused
      canTargetParty: boolean
      canTargetEnemies: boolean
      textColor: string
      useChance: number
      recoveryPeriod: number
      damageTypes: DamageTypes[]
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
    private calcSpellDamage(spell: Magic, caster: Player | Enemy, inventory: EquippableItem[]): number{
        let spellDamage = 0;
        if (spell.power){
            spellDamage = ((caster.calcTotalStatValue('intelligence', null, inventory) / 2.5) * spell.power);
            
            if (this.useStrength){
                spellDamage = ((caster.calcTotalStatValue('strength', null, inventory) / 2.5) * spell.power);
            }

            //Damage variance equal  to a range between 1 and the spell's power
            let variance = _.random(1, spell.variance);
            
            // this will add minus sign in 50% of cases
            variance *= Math.round(Math.random()) ? 1 : -1; 

            spellDamage += variance;
            return spellDamage;
        }
        return spellDamage;
    }

    /****************************************************************************************
   * Calculate Attack Accuracy - Determines whether or not an attack hits or not.
   * If we miss, stop here and print the result.
   * true === hit
   * false === miss
   ****************************************************************************************/
    calcSpellAccuracy(caster: Player | Enemy, spellTarget: Player | Enemy, inventory: EquippableItem[], appendText): boolean{
        let casterIsPlayer: boolean = (caster instanceof Player);
        let targetIsPlayer: boolean = (spellTarget instanceof Player);
        
        if ((_.random(1, 100)) < this.accuracy){
          return true;
        } else {
            appendText('*', true, `${ casterIsPlayer ? 'playerText' : 'redText'}`);
            appendText(caster.name, false, `${ casterIsPlayer ? 'underline' : 'crimsonText'}`, `${ casterIsPlayer ? 'playerText' : null}`);
            appendText(`${this.isAbility ? 'uses' : 'casts'}`, false, 'greyText');
            appendText(this.name, false, this.textColor);
            appendText('and misses', false, 'greyText');
            appendText(spellTarget.name + '!', false, 'greyText', `${ targetIsPlayer ? 'underline' : null}`);
          return false;
        }
      }
    
    /******************************************************************************************************
     * Cast the spell - Similar to the useItem from the consumableItem class
     * //TODO: Disallow casting spells (except resurrection magic) on dead party/enemies
     ******************************************************************************************************/
    //TODO: Rework spell scaling, it's very swingy right now, that or I'm not utilizing the stats correctly
    castSpell(caster: Player | Enemy, spellTarget: Player | Enemy, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void, inventory: EquippableItem[]){
        let casterIsPlayer: boolean = (caster instanceof Player);
        let targetIsPlayer: boolean = (spellTarget instanceof Player);
        let damageAfterReduction = 0;
        
        let spellDamage = this.calcSpellDamage(this, caster, inventory);


        //Only allow casting of spells on dead targets if there is a resurrect effect in place
        if (spellTarget.health < 0){
            if (!this.effects.find(({ name }) => name === 'resurrect')){
                appendText("Can't cast magic on a corpse!", true);
                return;
            }
        }
        
        //Disallow using resurrection magic on the living
        if (spellTarget.health > 0 && this.effects.find(({ name }) => name === 'resurrect')){
            appendText("Can't resurrect the living!", true);
            return;
        }
        
        //If we have damage types on the spell, reduce the spell damage by the correct damage resistance
        if (this.damageTypes.length > 0){
            if (targetIsPlayer){
                let enemy = new Enemy(null);
                damageAfterReduction = enemy.calcDamageReduction(spellDamage, (spellTarget as Player), inventory, this.damageTypes)
            }

            if (!targetIsPlayer){
                let player: Player = new Player();
                damageAfterReduction = player.calcDamageReduction(spellDamage, (spellTarget as Enemy), inventory, this.damageTypes);
            }
        }

        //Regardless of hit/miss, the spell costs mana
        caster.mana -= this.manaCost;
        caster.health -= this.healthCost;
        
        //Determine whether or not the spell hits
        let spellHits = this.calcSpellAccuracy(caster, spellTarget, inventory, appendText);
        if (!spellHits){
            return;
        }

        //If the spell has a damage value, apply it before the effect(s)
        spellTarget.health -= Math.round(damageAfterReduction);

        //Now that we've dealt any spell base damage, handle adding any effects
        let effectStatus = [];
        
        //For each spell effect, determine if it is resisted or not, and add the result to the effectStatus array
        this.effects.forEach((effect) => {
            let obj = {
                wasResisted: null,
                effect: null
            }

            //If the effect can be resisted, and depending on if it's targeted to self or not, calculate the correct effect resistance
            if (effect.canBeResisted){
                let effectName = effect.name.charAt(0).toUpperCase() + effect.name.slice(1);

                //If the effect has a chance to not be applied (applicationChance < 100) then first check to see if
                //the effect will be applied before checking if it's resisted or not. If it isn't applied,
                //do nothing.
                if (effect.applicationChance < 100){
                    if (_.random(1, 100) > effect.applicationChance){
                        return;
                    }
                }
                
                if (!effect.self){
                    obj.wasResisted = spellTarget.calcEffectResistance(spellTarget.calcTotalStatValue(effectName + 'Resistance', null, inventory));
                    obj.effect = effect;
                }
                
                if (effect.self){
                    obj.wasResisted = spellTarget.calcEffectResistance(caster.calcTotalStatValue(effectName + 'Resistance', null, inventory));
                    obj.effect = effect;
                }
            }
                
            //If the effect can't be resisted, add it to the array and set wasResisted to false
            if (!effect.canBeResisted){
                obj.effect = effect;
                obj.wasResisted = false;
            }
            
            effectStatus.push(obj);
        });
        
        effectStatus.forEach((e) => {
            if (!e.wasResisted){
                e.effect.self ? this.addSpellEffect(caster, e.effect) : this.addSpellEffect(spellTarget, e.effect);
            }

            //For using healing/mana magic that have an instant affect
            //Can check both caster & target safely, as this will only
            //affect them if the effect is present in their list.
            if ((e.effect.name === 'health' || e.effect.name === 'mana') && !e.effect.duration){
                spellTarget[e.effect.name] = spellTarget.calcTotalStatValue(e.effect.name, null, inventory);
                caster[e.effect.name] = caster.calcTotalStatValue(e.effect.name, null, inventory);
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
        
        //Now that all effects have been added and instant effects taken care of, display the result of the spell

        //If the spell hits, display that we cast x on spellTarget.name
        appendText('*', true, `${ casterIsPlayer ? 'playerText' : 'redText'}`);
        appendText(caster.name, false, `${ casterIsPlayer ? 'underline' : 'crimsonText'}`, `${ casterIsPlayer ? 'playerText' : null}`);
        appendText(`${this.isAbility ? 'uses' : 'casts'}`, false);
        appendText(this.name, false, this.textColor);
        appendText('on', false);
        appendText(spellTarget.name + '',false,`${ targetIsPlayer ? 'underline' : null}`, `${ targetIsPlayer ? 'playerText' : null}`);

        //If the spell deals any damage, display the damage dealt to the target
        if (spellDamage){
            appendText('and hits', false);
            // appendText(spellTarget.name, false, `${ targetIsPlayer ? 'underline' : null}`, `${ targetIsPlayer ? 'playerText' : null}`);
            appendText('for', false);
            appendText(Math.round(damageAfterReduction).toString(), false, this.textColor);
            appendText('damage!', false);
        }
        
        //For any effects resisted, display as such
        effectStatus.forEach((e) => {
            //If the effect was resisted and the target isn't dead from the spell, display that the effect was resisted
            if (e.wasResisted && spellTarget.health > 0){
                appendText(spellTarget.name, true, `${ targetIsPlayer ? 'underline' : 'crimsonText'}`, `${ targetIsPlayer ? 'playerText' : null}`);
                appendText('resisted the', false);
                appendText(e.effect.name, false, e.effect.textColor);
                appendText('effect!', false);
            }
            
            //If the effect wasn't resisted, and the effect isn't targeting health or mana, and the effect could have been resisted, and the target isn't dead, display the status infliction
            if (!e.wasResisted && e.effect.canBeResisted && spellTarget.health > 0){
                switch(e.effect.name){
                    case 'health':
                    case 'mana':
                    case 'rage':
                    case 'mana':
                    case 'speed':
                    case 'strength':
                    case 'luck':
                    case 'PoisonResistance':
                    break;

                    default:
                        appendText(spellTarget.name, true, `${ targetIsPlayer ? 'underline' : 'crimsonText'}`, `${ targetIsPlayer ? 'playerText' : null}`);
                        appendText('is inflicted with', false);
                        appendText(e.effect.name + '!', false, this.textColor);
                    break;
                        
                    }
                }
                
                //Now for anything else. This first switch is just to make sure the name of the person targeted by the effect
                //is displayed with the right colors depending on if it is an enemy or not.  - Same as consumableItem model
                switch(e.effect.name){
                    case 'rage':
                    case 'health':
                        if (e.effect.self && casterIsPlayer){ appendText(caster.name, true, 'underline', 'playerText'); };
                        if (e.effect.self && !casterIsPlayer){ appendText(caster.name, true, 'redText'); };
                        if (!e.effect.self && !targetIsPlayer){ appendText(spellTarget.name, true, 'redText'); };
                        if (!e.effect.self && targetIsPlayer){ appendText(spellTarget.name, true, 'underline', 'playerText'); };
                    break;
                }

                //TODO: If consolidating the display of these in to one place, this switch is the common part between consumableModel & magicModel
                //This second switch is for each individual printout dependent on the effect name  - Same as consumableItem model
                switch (e.effect.name){

                case 'rage':
                    appendText('flies into an', false);
                    appendText('uncontrollable rage!', false);
                break;

                case 'health':
                    if (!e.effect.duration){
                        appendText(`${e.effect.modifier > 0 ? 'recovers' : 'loses'}` + ' ' + Math.abs(e.effect.modifier));
                        appendText('health!', false, this.textColor);
                    }
                    
                    if (e.effect.duration){
                        appendText(`${e.effect.modifier > 0 ? 'will recover' : 'will lose'}` + ' ' + Math.abs(e.effect.modifier));
                        appendText('health', false, this.textColor);
                        appendText('for', false);
                        appendText(e.effect.duration, false);
                        appendText('turns!', false);
                    }
                break;

                case 'mana':
                    if (!e.effect.duration){
                        appendText(`${e.effect.modifier > 0 ? 'recovers' : 'loses'}` + ' ' + Math.abs(e.effect.modifier));
                        appendText('mana!', false, this.textColor);
                    }
                    
                    if (e.effect.duration){
                        appendText(`${e.effect.modifier > 0 ? 'will recover' : 'will lose'}` + ' ' + Math.abs(e.effect.modifier));
                        appendText('mana', false, this.textColor);
                        appendText('for', false);
                        appendText(e.effect.duration, false);
                        appendText('turns!', false);
                    }
                break;

                case 'speed':
                case 'strength':
                case 'luck':
                case 'PoisonResistance':
                    //Only print the result if it's a positive modifier
                    if (e.effect.modifier > 0){
                        let splitName = e.effect.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
                        appendText('gains a', false);
                        splitName.forEach((e) => { appendText(e, false, this.textColor) });
                        appendText('boost for', false);
                        appendText(`${e.effect.duration}`, false);
                        appendText('turns!', false);
                    }
                break;
            }
            
        });
    }
}
