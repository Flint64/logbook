import { Effect } from "./effect.model";
import { CombatService } from "../services/combat.service";

export class ConsumableItem {
    constructor(
        public name: string,
        public amount: number,
        public duration: number,
        public effect: Effect,
        ){
            this.name = name;
            this.amount = amount;
            this.duration = duration;
            this.effect = effect;
        }

    useItem(player, numSelected){
        for (const [key, value] of Object.entries(player.consumables[numSelected - 1].effect)) {
            
            //If the value of the selected propert(ies) isn't null and we have at least one of the item
            if (value !== null && player.consumables[numSelected - 1].amount > 0){
                
                //If there's already a value in the array that matches the key, add to its duration instead of adding a seperate effect
                if (player.consumables[numSelected - 1].duration !== null){

                    if (player.effects.length === 0){
                        player.effects.push({name: key, modifier: value, duration: player.consumables[numSelected - 1].duration});
                    } else {
                        player.effects.forEach((e) => {
                            if (e.name === key) {
                                e.duration += player.consumables[numSelected - 1].duration;
                            }
                        })
                    }
                    
                }

                //If adding the value is greater than the max value, set it to the max. Otherwise if subtracting it is less than 0, set to 0
                if ((player[`${key}`] + value) >= player['max' + key.charAt(0).toUpperCase() + key.slice(1)]){
                    player[`${key}`] = player['max' + key.charAt(0).toUpperCase() + key.slice(1)];
                }

                //Override the max value for the following keys.
                //Essentially the max value for these are just
                //keeping track of the current value, not the max possible
                switch(key){
                    case 'speed':
                        player[`${key}`] += value;
                    break;
                }
                
                //If adding the value is less than or equal to the max, add the value
                if ((player[`${key}`] + value) < player['max' + key.charAt(0).toUpperCase() + key.slice(1)]){
                    player[`${key}`] += value;
                }
                
                //If subtracting the value is less than 0, set it to 0
                if ((player[`${key}`] + value) < 0) {
                    player[`${key}`] = 0;
                } 

            }
        }
        player.consumables[numSelected - 1].amount -= 1;
    }

        
}
