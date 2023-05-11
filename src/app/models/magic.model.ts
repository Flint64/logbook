import { CombatService } from "../services/combat.service";
import { Effect } from "./effect.model";
import { Injectable } from '@angular/core';

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

    castSpell(player, numSelected, enemyIndex, combatService){
        for (const [key, value] of Object.entries(player.magic[numSelected - 1].effect)) {
            // console.log(key + ': ' + value);

            if (value){
                
                //If there's already a value in the array that matches the key, add to its duration instead of adding a seperate effect
                if (combatService.enemyList[enemyIndex].effects.length){
                    for (let i = 0; i < combatService.enemyList[enemyIndex].effects.length; i++){
                        if (combatService.enemyList[enemyIndex].effects[i].name === key){
                            combatService.enemyList[enemyIndex].effects[i].duration += player.magic[numSelected - 1].duration;
                        }
                    }
                }

                //TODO: Change this so that the effect object is just a name, duration, modifier, and thing to be modified
                //instead of the way its set up now where those get added after the current effect object is parsed down.
                
                //Otherwise just add the new effects
                if (player.magic[numSelected - 1].duration !== null){
                    combatService.enemyList[enemyIndex].effects.push({name: key, modifier: value, duration: player.magic[numSelected - 1].duration});
                     /*// TODO: Right now all effects are being pushed to the enemy's list, each with the same duration. 
                        Need to filter it out and make sure only the right ones are being applied and make sure that they are able
                        to be decremented each turn
                     */
                }

                //Remove duplicate effects (removing the one with the lower duration)
                //Compare each item to every other
                for (let i = 0; i < combatService.enemyList[enemyIndex].effects.length; i++) {
                    for (let j = i + 1; j < combatService.enemyList[enemyIndex].effects.length; j++) {
                        //If the names match (two duplicate effects), remove the one with the lower duration
                        if (combatService.enemyList[enemyIndex].effects[i].name === combatService.enemyList[enemyIndex].effects[j].name){
                        //   console.log(`Comparing ${combatService.enemyList[enemyIndex].effects[i].duration} > ${combatService.enemyList[enemyIndex].effects[j].duration}`);
                          if (combatService.enemyList[enemyIndex].effects[i].duration > combatService.enemyList[enemyIndex].effects[j].duration){
                                combatService.enemyList[enemyIndex].effects.splice(j, 1);
                            }
                        }
                    }
                }

                //If adding the value is greater than the max value, set it to the max. Otherwise if subtracting it is less than 0, set to 0
                // if ((player[`${key}`] + value) >= player['max' + key.charAt(0).toUpperCase() + key.slice(1)]){
                    // player[`${key}`] = player['max' + key.charAt(0).toUpperCase() + key.slice(1)];
                // }

                //Override the max value for the following keys.
                //Essentially the max value for these are just
                //keeping track of the current value, not the max possible
                // switch(key){
                //     case 'speed':
                //     case 'attack': //Modifies the upper bound, ie minAttack stays where it is, maxAttack is equal to the modifier of the effect. Dam = between min-max
                //         player[`${key}`] += value;
                //     break;
                // }
                
                //Original value set here or else after modifying in the first if block here it gets set to the wrong value
                //due to the value being compared changing before the next comparison
                // const originalPlayerValue = player[`${key}`];

                //If adding the value is less than or equal to the max, add the value
                // if ((originalPlayerValue + value) < player['max' + key.charAt(0).toUpperCase() + key.slice(1)]){
                    // player[`${key}`] += value;
                // }
                
                //If subtracting the value is less than 0, set it to 0
                // if ((originalPlayerValue + value) < 0) {
                    // player[`${key}`] = 0;
        }
    }
        // player.magic[numSelected - 1].amount -= 1;
        player.mana -= player.magic[numSelected - 1].manaCost;
        console.log(combatService.enemyList[enemyIndex].effects);
    }

        
}
