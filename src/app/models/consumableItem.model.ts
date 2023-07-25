import { Effect } from "./effect.model";

export class ConsumableItem {

    constructor(data: Partial<ConsumableItem>) {
        Object.assign(this, data);
        
        // Create instances of Effect for the effect property
        this.effect = (data.effect || []).map(effectData => new Effect(effectData));
      }
        
        name: string
        amount: number
        effect: Effect[]

    useItem(player, numSelected){
        
        //Add all effects from the item used if they have a duration
        player.consumables[numSelected - 1].effect.forEach((effect) => {
            if (effect.duration){
                
                //If we have more than one effect in the players list with the same name,
                //increase duration instead of having a duplicate effect
                if (player.effects.length > 0){
                    let index = player.effects.findIndex(obj => obj.name === effect.name);
                    if (index !== -1){ player.effects[index].duration += effect.duration; }
                }
                
                //Push a copy of the effect to prevent pass by reference from changing the values in the consumableItem object
                player.effects.push({...effect});
            }
        });

        // Remove duplicate effects (removing the one with the lower duration)
        // Compare each item to every other
        for (let i = 0; i < player.effects.length; i++) {
            for (let j = i + 1; j < player.effects.length; j++) {
                //If the names match (two duplicate effects), remove the one with the lower duration
                if (player.effects[i].name === player.effects[j].name){
                    if (player.effects[i].duration > player.effects[j].duration){
                        player.effects.splice(j, 1);
                    }
                }
            }
        }

        player.consumables[numSelected - 1].effect.forEach((effect) => {
            const originalPlayerValue = player[`${effect.name}`];
                    
            //If adding the value is greater than the max value, set it to the max. Otherwise if subtracting it is less than 0, set to 0
            if ((player[`${effect.name}`] + effect.modifier) >= player['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)]){
                player[`${effect.name}`] = player['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)];
            }
            
            // //If adding the value is less than or equal to the max, add the value
            if ((originalPlayerValue + effect.modifier) < player['max' + effect.name.charAt(0).toUpperCase() + effect.name.slice(1)]){
                player[`${effect.name}`] += effect.modifier;
            }
            
            //If subtracting the value is less than 0, set it to 0
            if ((originalPlayerValue + effect.modifier) < 0) {
                player[`${effect.name}`] = 0;
            }

            //Override the max value for the following keys.
            //Essentially the max value for these are just
            //keeping track of the current value, not the max possible
            switch(effect.name){
                case 'speed':
                case 'strength':
                    player[`${effect.name}`] += effect.modifier;
                break;
            }
        });
        
        player.consumables[numSelected - 1].amount -= 1;        
    }

        
}
