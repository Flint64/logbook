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
            // console.log(key + ': ' + value);
            
            //If the value of the selected propert(ies) isn't null and we have at least one of the item
            if (value !== null && player.consumables[numSelected - 1].amount > 0){
                
                //If there's already a value in the array that matches the key, add to its duration instead of adding a seperate effect
                if (player.effects.length){
                    for (let i = 0; i < player.effects.length; i++){
                        if (player.effects[i].name === key){
                            player.effects[i].duration += player.consumables[numSelected - 1].duration;
                        }
                    }
                }
                
                //Otherwise just add the new effects
                if (player.consumables[numSelected - 1].duration !== null){
                    player.effects.push({name: key, modifier: value, duration: player.consumables[numSelected - 1].duration});
                }

                //Remove duplicate effects (removing the one with the lower duration)
                //Compare each item to every other
                for (let i = 0; i < player.effects.length; i++) {
                    for (let j = i + 1; j < player.effects.length; j++) {
                        //If the names match (two duplicate effects), remove the one with the lower duration
                        if (player.effects[i].name === player.effects[j].name){
                        //   console.log(`Comparing ${player.effects[i].duration} > ${player.effects[j].duration}`);
                          if (player.effects[i].duration > player.effects[j].duration){
                                player.effects.splice(j, 1);
                            }
                        }
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
