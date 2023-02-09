import { Effect } from "./effect.model";

export class ConsumableItem {
    constructor(
        public name: string,
        public amount: number,
        public effect: Effect,
        ){
            this.name = name;
            this.amount = amount;
            this.effect = effect;
        }

    useItem(player, numSelected){
        for (const [key, value] of Object.entries(player.consumables[numSelected - 1].effect)) {
            
            //If the value of the selected propert(ies) isn't null and we have at least one of the item
            if (value !== null && player.consumables[numSelected - 1].amount > 0){
                
                //If addig the value is greater than the max value, set it to the max. Otherwise if subtracting it is less than 0, set to 0
                if ((player[`${key}`] + value) >= player['max' + key.charAt(0).toUpperCase() + key.slice(1)]){
                    player[`${key}`] = player['max' + key.charAt(0).toUpperCase() + key.slice(1)];
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
        player.ATB = 0;
        player.turnCount++;    
    }

        
}
