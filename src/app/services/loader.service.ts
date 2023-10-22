import { Injectable } from '@angular/core';
import { CombatService } from './combat.service';
import { Enemy } from '../models/enemy.model';
import { enemies } from '../components/combat-test/enemyList';
import _ from 'lodash';
import { helms, chestplates, pants, bracers, greaves, weapons, trinkets } from '../components/combat-test/equipmentList';
import { EquippableItem, Bracer, Helm, Chestplate, Pants, Greaves, Weapon, Trinket} from 'src/app/models/equippableItem.model';
import { spells } from '../components/combat-test/spellList';
import { potions } from '../components/combat-test/potionList';
import { ConsumableItem } from '../models/consumableItem.model';
import { Effect } from '../models/effect.model';
import { Magic } from '../models/magic.model';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(private combatService: CombatService) { }

  //For testing right now, one giant function to load everything
  loadDevelopmentEnv(){

    //Converts the enemy list into actual Enemy objects
    let convertedEnemyList: Enemy[] = enemies.map(enemyData => new Enemy(enemyData));
    //i is less than the number of enemies we want displayed
    for (let i = 0; i < 3; i++){
      //Push the random enemies chosen to the combatService
      let enemy: Enemy = convertedEnemyList[_.random(0, (enemies.length - 1))];
      let clone = _.cloneDeep(new Enemy(enemy));
      this.combatService.enemyList.push(clone);
    }

    //Converts the equipment list into actual EquippableItem objects
    let convertedHelms: EquippableItem[] = helms.map(helmData => new Helm(helmData));
    convertedHelms.forEach((e) => { this.combatService.party.inventory.push(_.cloneDeep(new Helm(e))); });

    let convertedChestplates: EquippableItem[] = chestplates.map(chestplateData => new Chestplate(chestplateData));
    convertedChestplates.forEach((e) => { this.combatService.party.inventory.push(_.cloneDeep(new Chestplate(e))); });
    this.combatService.party.inventory.push(_.cloneDeep(new Chestplate(convertedChestplates[0]))); //Push a copy of chainmail to have 2
    
    let convertedPants: EquippableItem[] = pants.map(pantsData => new Pants(pantsData));
    convertedPants.forEach((e) => { this.combatService.party.inventory.push(_.cloneDeep(new Pants(e))); });

    let convertedBracers: EquippableItem[] = bracers.map(bracerData => new Bracer(bracerData));
    convertedBracers.forEach((e) => { this.combatService.party.inventory.push(_.cloneDeep(new Bracer(e))); });

    let convertedGreaves: EquippableItem[] = greaves.map(greaveData => new Greaves(greaveData));
    convertedGreaves.forEach((e) => { this.combatService.party.inventory.push(_.cloneDeep(new Greaves(e))); });

    let convertedWeapons: EquippableItem[] = weapons.map(weaponData => new Weapon(weaponData));
    convertedWeapons.forEach((e) => { this.combatService.party.inventory.push(_.cloneDeep(new Weapon(e))); });

    let convertedTrinkets: EquippableItem[] = trinkets.map(trinketData => new Trinket(trinketData));
    convertedTrinkets.forEach((e) => { this.combatService.party.inventory.push(_.cloneDeep(new Trinket(e))); });
    
    //Auto-equip items here for testing purposes
    this.combatService.party.inventory[0].equippedBy = this.combatService.party.members[2]; //Max, Helmet
    this.combatService.party.inventory[1].equippedBy = this.combatService.party.members[1]; //Luke, Chainmail
    this.combatService.party.inventory[3].equippedBy = this.combatService.party.members[2]; //Max, Chainmail
    this.combatService.party.inventory[2].equippedBy = this.combatService.party.members[0]; //Gort, Apprentice Robes
    this.combatService.party.inventory[4].equippedBy = this.combatService.party.members[0]; //Gort, Critical Bracer
    // this.combatService.party.inventory[5].equippedBy = this.combatService.party.members[0]; //Gort, Oak Staff
    this.combatService.party.inventory[6].equippedBy = this.combatService.party.members[1]; //Luke, Shortsword
    this.combatService.party.inventory[7].equippedBy = this.combatService.party.members[2]; //Max, Simple Mace
    this.combatService.party.inventory[8].equippedBy = this.combatService.party.members[0]; //Gort, Bone Phoenix
    // this.combatService.party.inventory[3].equippedBy = this.combatService.party.members[0]; //Gort, TEST
    this.combatService.party.inventory[9].equippedBy = this.combatService.party.members[0]; //Gort, Trinket
    // console.log(this.combatService.party.inventory);

    let convertedPotions: ConsumableItem[] = potions.map(potionData => {
      // Create instances of Effect for the effect property inside the nested map
      const effects = (potionData.effects || []).map(effectData => new Effect(effectData));
      
      // Create a new ConsumableItem instance with the updated effect property
      return new ConsumableItem({ ...potionData, effects: effects });
    });

    //Populate your potions list from those in the potionList file. Currently adds all potions in the file to your inventory
    convertedPotions.forEach((potion) => {
        this.combatService.party.consumables.push(potion);
    });

    let convertedSpells: Magic[] = spells.map(spellData => {
      // Create instances of Effect for the effect property inside the nested map
      const effects = (spellData.effects || []).map(effectData => new Effect(effectData));
      
      // Create a new ConsumableItem instance with the updated effect property
      return new Magic({ ...spellData, effects: effects });
    });

    // console.log(convertedSpells);

    //To start, give each party member one of the spells from the spell list
    this.combatService.party.members[0].magic.push(convertedSpells[0]);
    this.combatService.party.members[0].magic.push(convertedSpells[3]);
    this.combatService.party.members[0].magic.push(convertedSpells[4]);
    this.combatService.party.members[0].magic.push(convertedSpells[5]);
    this.combatService.party.members[1].magic.push(convertedSpells[1]);
    this.combatService.party.members[2].magic.push(convertedSpells[2]);
    this.combatService.party.members[0].magic.push(convertedSpells[6]);
    
  }
  
}
