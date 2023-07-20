import { Injectable } from '@angular/core';
import { Effect } from "./effect.model";
import _ from 'lodash';

@Injectable()
export class Magic {
    constructor(
        public name: string,
        public manaCost: number,
        public minDamage: number,
        public maxDamage: number,
        public targets: number,
        public effect: Effect[],
        ){
            this.name = name;
            this.manaCost = manaCost;
            this.minDamage = minDamage;
            this.maxDamage = maxDamage;
            this.targets = targets;
            this.effect = effect;
        }

    /******************************************************************************************************
     * Remove Duplicate Effects - Removes duplicate effects (removing the one with the lower duration)
     ******************************************************************************************************/
    private removeDuplicateEffects(target: any, spell: any){
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
    private addSpellEffect(target: any, effect: Effect){
        //If we have more than one effect in the players list with the same name,
        //increase duration instead of having a duplicate effect
        if (target.effects.length > 1){
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
                case 'attack': //Modifies the upper bound, ie minAttack stays where it is, maxAttack is equal to the modifier of the effect. Dam = between min-max
                case 'minAttack':
                    target[`${effect.name}`] += effect.modifier;
                break;
            }
        });
    }

    /******************************************************************************************************
     * Cast the spell - Similar to the useItem from the consumableItem class, but can target enemies as 
     * well as the player
     ******************************************************************************************************/
    castSpell(player, numSelected, enemyIndex, combatService){
        
        let spell = player.magic[numSelected - 1];
        let enemy = combatService.enemyList[enemyIndex];
        let spellDamage = null;
        
        //If the spell has a damage value, apply it before the effect(s)
        if (spell.minDamage || spell.maxDamage){
            spellDamage = _.random(spell.minDamage, spell.maxDamage);
            enemy.health -= spellDamage;
        }
        
        //If the spell has a duration and is targeted to yourself, add it to your effects list
        spell.effect.forEach((effect) => {
                      
            if (effect.duration){
                if (effect.self){
                    this.addSpellEffect(player, effect);
                } else {
                    this.addSpellEffect(enemy, effect);
                }
            }
        });

        this.removeDuplicateEffects(player, spell);
        this.removeDuplicateEffects(enemy, spell);
        
        player.mana -= spell.manaCost;
        // console.log(combatService.enemyList[enemyIndex].effects);

        return spellDamage;
    }
}
