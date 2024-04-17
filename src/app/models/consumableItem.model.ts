import { Effect } from "./effect.model";
import { Player } from "./player.model";
import { Enemy } from "./enemy.model";
import _ from 'lodash';
import { Magic } from "./magic.model";

export class ConsumableItem {

    constructor(data: Partial<ConsumableItem>) {
        Object.assign(this, data);
        
        // Create instances of Effect for the effect property
        this.effects = (data.effects || []).map(effectData => new Effect(effectData));
      }
        name: string
        amount: number
        canTargetEnemies: boolean
        textColor: string
        effects: Effect[]

    /******************************************************************************************************
     * Add Consumable Effect - Add the consumable effect
     ******************************************************************************************************/
    private addConsumableEffect(target: Player | Enemy, effect: Effect){
        //If we have more than one effect in the players list with the same name,
        //increase duration instead of having a duplicate effect
        if (target.effects.length > 0){
            let index = target.effects.findIndex(obj => obj.name === effect.name);
            if (index !== -1){ target.effects[index].duration += effect.duration; }
        }
        
        //Push a copy of the effect to prevent pass by reference from changing the values in the consumableItem object
        target.effects.push({...effect});
        // console.log(target.effects);
    }

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
     * Calculate Thrown Vial Accuracy - Determines whether or not a thrown vial hits its mark
     * Only thrown vials on enemies can miss; a thrown vial on a fellow party member will always hit.
     * Uses base accuracy instead of equipment total so that it's slightly lower
     * If we miss the attack (greater than instead of less than) stop here and print the result
     ******************************************************************************************************/
    calcThrownVialAccuracy(player: Player, target: Player | Enemy, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void): boolean{
        let type = null;
        if (this.constructor.name === 'Potion'){ type = this.constructor.name; }

        //Display text for a thrown item that misses the enemy target.
        if (this.canTargetEnemies && (target instanceof Enemy)){
            if ((_.random(1, 100)) > player.accuracy){
                appendText('*', true, 'playerText');
                appendText(player.name, false, 'playerText', 'underline');
                appendText(`${type === 'Potion' ? 'throws a' : 'uses'}`, false);
                appendText(this.name, false, this.textColor);
                appendText(`${type === 'Potion' ? 'at' : 'on'} ${target.name}`, false);
                appendText('and misses!', false)
                return true;
            }
        }

        //Display text for a thrown item that impacts the target, be it player or enemy
        if (this.canTargetEnemies){
            let isPlayer: boolean = (target instanceof Player);
            appendText('*', true, 'playerText');
            appendText(player.name, false, 'playerText', 'underline');
            appendText(`${type === 'Potion' ? 'throws a' : 'uses'}`, false);
            appendText(this.name, false, this.textColor);
            appendText(`${type === 'Potion' ? 'at' : 'on'}`, false)
            appendText(`${target.name},`, false, `${ isPlayer ? 'underline' : ''}`, '');
            if (type === 'Potion'){
                appendText('and the', false);
                appendText('vial shatters', false);
                appendText('on impact!', false);
            } else {
                appendText('and hits!', false);
            }
        }
        return false;
    }

    /******************************************************************************************************
     * Calculate Resisted Effect - Determines whether or not an effect is applied based on resistances
     * If the effect can be resisted, such as poison, burn, etc. then grab the name + Resistance to get
     * poisonResist, burnResist, etc. which are the names on equipment so that we can caluclate the 
     * correct resistance values.
     ******************************************************************************************************/
    calcResistedEffect(target: Player | Enemy, inventory, appendText, willBeResisted: boolean = null){
        this.effects.forEach((effect) => {
            let isPlayer: boolean = (target instanceof Player);

            //If the effect can't be resisted, add the effect and move on
            //This has the same affect as the below block, except for enemies
            //with high_weak resistance. This should override the effect's
            //effect.canBeResisted, which is why we check for this first
            if (willBeResisted === false){
                this.addConsumableEffect(target, effect);
                return;
            }

            //If we have high_strong resistance, the effect should always be resisted, and should be checked and handled before
            //the effect's effect.canBeResisted, and override it
            if (willBeResisted === true){
                appendText(`${target.name}`, true, `${ isPlayer ? 'underline' : 'crimsonText'}`, `${ isPlayer ? 'playerText' : null}`);
                appendText('resisted the', false);
                appendText(`${effect.name}`, false, this.textColor);
                appendText('effect!', false);
                return;
            }
            
            //If the effect can't be resisted, add the effect and move on
            if (!effect.canBeResisted){
                this.addConsumableEffect(target, effect);
                return;
            }

            //If the effect is resisted, display the text
            let effectName = effect.name.charAt(0).toUpperCase() + effect.name.slice(1);
            if (target.calcEffectResistance(target.calcTotalStatValue(effectName + 'Resistance', null, inventory))){
                appendText(`${target.name}`, true, `${ isPlayer ? 'underline' : 'crimsonText'}`, `${ isPlayer ? 'playerText' : null}`);
                appendText('resisted the', false);
                appendText(`${effect.name}`, false, this.textColor);
                appendText('effect!', false);
                return;
            }
            
            //If the effect isn't resisted, add the effect and display the text
            this.addConsumableEffect(target, effect);
            appendText(`${target.name}`, true, `${ isPlayer ? 'underline' : 'crimsonText'}`, `${ isPlayer ? 'playerText' : null}`);
            appendText('is inflicted with', false);
            appendText(`${effect.name}!`, false, this.textColor);
        });
    }

       
    /******************************************************************************************************
     * Use Item - Uses the selected item, adds any effects to the selected target, and prints the result
     * 'this' refers to the selected consumable. No need to pass in the party.consumables and numSelected.
     * We do however need access to the inventory to check equipment for any resistances.
     ******************************************************************************************************/
    useItem(player: Player, target: Player | Enemy, inventory, appendText: (text: string, newline?: boolean, className?: string, className2?: string) => void){

        if (this.constructor.name === 'Scroll'){
            this.amount -= 1;
            this['spell'].castSpell(player, target, appendText, inventory);
            return;
        }
        
        //Only allow using consumables on dead targets if there is a resurrect effect in place
        if (target.health < 0){
            if (!this.effects.find(({ name }) => name === 'resurrect')){
                appendText('Can\'t use an item on a corpse!', true);
                return;
            }
        }

        //Disallow using resurrection items on the living
        if (target.health > 0 && this.effects.find(({ name }) => name === 'resurrect')){
            appendText("Can't resurrect the living!", true);
            return;
        }

        //If the target isn't dead, regardless of the outcome, the item is consumed
        this.amount -= 1;

        //If we miss throwing a vial on an enemy, stop here after the message is displayed
        let thrownVialAccuracy: boolean = this.calcThrownVialAccuracy(player, target, appendText);
        if (thrownVialAccuracy){
            return;
        }
        
        //If the used item isn't a thrown item, display the base "use item" text rather than the thrown item text
        if (!this.canTargetEnemies){
            appendText('*', true, 'playerText');
            appendText(player.name, false, 'playerText', 'underline');
            appendText('uses', false);
            appendText(this.name, false, this.textColor);
            appendText('on', false);
            appendText(target.name, false, 'playerText', 'underline');
        }
        
        //Check if the effect(s) are resisted or not, and display the correct text accordingly
        //If the enemy target has high_weak and can't resist effects, or high_strong and always
        //resists certain effects, handle those here
        let isPlayer: boolean = (target instanceof Player);

        //If it's an enemy
        if (!isPlayer){
            let willBeResisted = null;
            
            let damageTypeName = null;
            this.effects.forEach((effect) => {
                if (effect?.damageType?.length){
                    effect.damageType.forEach(DT => {
                        damageTypeName = DT.constructor.name;
                    });
                }
            });
            
            //If we have a damage type match of a resistance to the damage type being applied,
            //check if there is any weakness/strength
            (target as Enemy).damageResistances.forEach((DR) => {
                if (DR.constructor.name.includes(damageTypeName)){
                    if (DR.resistanceModifier === 'high_weak'){ //high_weak can't be resisted
                        willBeResisted = false;
                        this.calcResistedEffect(target, inventory, appendText, willBeResisted);
                        console.log(damageTypeName);
                    } else if (DR.resistanceModifier === 'high_strong'){ //high_strong is always resisted
                        willBeResisted = true;
                        this.calcResistedEffect(target, inventory, appendText, willBeResisted);
                    }
                }
            });
        } else {
            this.calcResistedEffect(target, inventory, appendText);
        }
        
        //For using healing/mana potions that have an instant affect
        this.effects.forEach((effect, index) => {
            let isPlayer: boolean = (target instanceof Player);
            if (effect.name === 'health' && !effect.duration && effect.damageType){
                    let damageTypeName = effect.damageTypeName;

                //If the effect is dealing damage to health, calculate any damage reduction
                //Consumables only allow one damage type, so array[0] is all that's needed
                    let arr = [];
                    arr.push(effect?.damageType[0]);
                    let damageAfterReduction = 0;
                    if (isPlayer){
                        let enemy = new Enemy(null);
                        damageAfterReduction = enemy.calcDamageReduction(Math.abs(effect.modifier), target as Player, inventory, arr);
                    } else {
                        damageAfterReduction = player.calcDamageReduction(Math.abs(effect.modifier), target as Enemy, inventory, arr);
                    }
                    target.health -= damageAfterReduction;
                    appendText(`${target.name}`, true, `${ isPlayer ? 'underline' : 'crimsonText'}`, `${ isPlayer ? 'playerText' : null}`);
                    appendText('takes', false);
                    appendText(`${damageAfterReduction}`, false);
                    if (damageTypeName){ appendText(`${damageTypeName}`, false, this.textColor); }
                    appendText('damage!', false);
                } else {
                    
                    target[effect.name] = target.calcTotalStatValue(effect.name, null, inventory);
                    
                    //Now for anything else. This first switch is just to make sure the name of the person targeted by the effect
                    //is displayed with the right colors depending on if it is an enemy or not.  - Same as magic model
                    switch(effect.name){
                        case 'rage':
                        case 'health':
                        case 'mana':
                        case 'speed':
                        case 'strength':
                        case 'luck':
                        case 'PoisonResistance':
                        case 'poisonCure':
                            if (isPlayer){ appendText(target.name, true, 'underline', 'playerText'); };
                            if (!isPlayer){ appendText(target.name, true, 'redText'); };
                        break;
                    }
                    
                    //TODO: If consolidating the display of these in to one place, this switch is the common part between consumableModel & magicModel
                    //This second switch is for each individual printout dependent on the effect name - Same as magic model
                    switch (effect.name){
                        case 'health':
                            if (!effect.duration){
                                appendText(`${effect.modifier > 0 ? 'recovers' : 'loses'}` + ' ' + Math.abs(effect.modifier));
                                appendText('health!', false, this.textColor);
                            }
                            
                            if (effect.duration){
                                appendText(`${effect.modifier > 0 ? 'will recover' : 'will lose'}` + ' ' + Math.abs(effect.modifier));
                                appendText('health', false, this.textColor);
                                appendText('for', false);
                                appendText(`${effect.duration}`, false);
                                appendText('turns!', false);
                            }
                        break;

                        case 'mana':
                            if (!effect.duration){
                                appendText(`${effect.modifier > 0 ? 'recovers' : 'loses'}` + ' ' + Math.abs(effect.modifier));
                                appendText('mana!', false, this.textColor);
                            }
                            
                            if (effect.duration){
                                appendText(`${effect.modifier > 0 ? 'will recover' : 'will lose'}` + ' ' + Math.abs(effect.modifier));
                                appendText('mana', false, this.textColor);
                                appendText('for', false);
                                appendText(`${effect.duration}`, false);
                                appendText('turns!', false);
                            }
                        break;

                        case 'rage':
                            appendText('flies into an', false);
                            appendText('uncontrollable rage!', false);
                        break;

                        case 'speed':
                        case 'strength':
                        case 'luck':
                        case 'PoisonResistance':
                            let splitName = effect.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
                            appendText('gains a', false);
                            splitName.forEach((e) => { appendText(e, false, this.textColor) });
                            appendText('boost for', false);
                            appendText(`${effect.duration}`, false);
                            appendText('turns!', false);
                        break;
                        case 'poisonCure':
                            target.effects = target.effects.filter(function(e) { return e.name !== 'poison' });
                            appendText('is cured of poison!', false);
                        break;
                    }
                }
        });        
        
        //Remove any duplicate effects / instant effects before ending your turn
        this.removeDuplicateEffects(target);
    }

        
}

export class Potion extends ConsumableItem{
    constructor(data: Partial<Potion>) {
    super(data);
    Object.assign(this, data);
    }
}

export class Scroll extends ConsumableItem{
    constructor(data: Partial<Scroll>) {
    super(data);
    Object.assign(this, data);
    }
    spell: Magic
}