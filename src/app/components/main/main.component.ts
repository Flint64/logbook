import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EquippableItem } from 'src/app/models/equippableItem.model';
import { Player } from 'src/app/models/player.model';
import { CombatService } from 'src/app/services/combat.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SelectCategoryComponent } from './select-category/select-category.component';
import { EquipConfirmationComponent } from './equip-confirmation/equip-confirmation.component';
import _ from 'lodash';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewInit {

  @ViewChildren('memberBoxes') memberBoxes: QueryList<ElementRef>;
  @ViewChild('story', {static: false}) story: ElementRef;
  @ViewChild('inventory', {static: false}) inventory: ElementRef;
  @ViewChild('equipment', {static: false}) equipment: ElementRef;
  @ViewChild('stats', {static: false}) stats: ElementRef;
  @ViewChild('settings', {static: false}) settings: ElementRef;
  @ViewChild('intRef', {static: false}) intRef: ElementRef;
  
  partyForm: FormGroup;
  previousPartyMember = null;
  memberIndex: number = null;
  selectedPartyMember: Player = null;
  intervalID = null;
  textPosition = 0;
  textSpeed = 150;

  viewingMain = {name: 'main', isActive: true}
  viewingSettings = {name: 'settings', isActive: false}
  viewingStats = {name: 'stats', isActive: false}
  viewingEquipment = {name: 'equipment', isActive: false}
  viewingInventory = {name: 'inventory', isActive: false}

  pages = [
    this.viewingMain,
    this.viewingSettings,
    this.viewingStats,
    this.viewingEquipment,
    this.viewingInventory,
  ];

  elements = [];
  
  selectedItem = null;
  viewingConsumables: boolean = false;
  viewEquipped: boolean = true;
  notEquippedItems: EquippableItem[] = [];
  previousElement = null;
  itemCategory: string = 'Weapon';
  itemCategoryDisplay: string = 'Weapons';
  equippedItem = null;
  equippedTrinkets = [];
  trinketComparison = 0;
  
  damageTypes = [
    'BludgeoningDamage',
    'PiercingDamage',
    'SlashingDamage',
    'FireDamage',
    'IceDamage',
    'PoisonDamage',
    'ShockDamage',
  ];

  statusResistances = [
    "BurnResistance",
    "PoisonResistance",
    "FreezeResistance",
    "ShockResistance",
  ]

  damageResistances = [
    'BludgeoningDamageResistance',
    'PiercingDamageResistance',
    'SlashingDamageResistance',
    'FireDamageResistance',
    'IceDamageResistance',
    'PoisonDamageResistance',
    'ShockDamageResistance',
  ]


  baseStatDisplay = [];
  damageTypeDisplay = [];
  statusResistanceDisplay = [];
  damageResistanceDisplay = [];
  trinketDamageBonuses = [];
  
  constructor(public combatService: CombatService, private loaderService: LoaderService, private renderer: Renderer2, private dialog: MatDialog) { }
  
  ngOnInit(): void {

    this.loaderService.loadDevelopmentEnv();
    
    //Grab text speed from localstorage, if any
    if (localStorage.getItem('textSpeed')){
      this.textSpeed = parseInt(localStorage.getItem('textSpeed'));
    }

    // this.startPrint("The story begins...");
    
    this.partyForm = new FormGroup({
      'memberSelected': new FormControl(null)
    });

    this.notEquippedItems = this.combatService.party.inventory.filter(function(e) { return !e.equippedBy });
  }

/****************************************************************************************
 * After View Init - Grabs the buttons and adds them to an array of objects with a
 * matching name for use in switchView to dynamically add/remove classes without repeated
 * code
 ****************************************************************************************/  
  ngAfterViewInit(): void {
    let obj1 = {name: 'inventory', element: this.inventory}
    let obj2 = {name: 'equipment', element: this.equipment}
    let obj3 = {name: 'stats', element: this.stats}
    let obj4 = {name: 'settings', element: this.settings}
    this.elements.push(obj1);
    this.elements.push(obj2);
    this.elements.push(obj3);
    this.elements.push(obj4);
  }

/****************************************************************************************
 * Start print - Starts the print of the text. Has to be in it's own function or else 
 * recursion is an issue
 ****************************************************************************************/
  startPrint(text: string){
    this.intervalID = setInterval( () => this.printText(this.textPosition, text), this.textSpeed );
  }

/****************************************************************************************
 * Print Text - Prints text in an RPG like way via setInterval. Increases the textPosition
 * each time the function is called, and stops the interval when the position has reached
 * the supplied string's length, and resets to 0 for the next batch.
 ****************************************************************************************/
  printText(textPosition: number, text: string){
    if (!this.intervalID){
      return;
    }
    
    if (textPosition !== text.length){
      
      //Use renderer instead of docuoment.createElement so that the view encapsulation works to apply styles correctly
      let child = this.renderer.createElement('span');
      child.innerText = text[textPosition];
      
      this.story.nativeElement.appendChild(child)
      this.story.nativeElement.scrollTo(0, this.story.nativeElement.scrollHeight);  
      this.textPosition++;

    } else {
      this.intervalID = null;
      this.textPosition = 0;
    }
  }

/****************************************************************************************
 * Switch View - Handles switching the main page from the main story menu in to each
 * of the different menus - inventory, equipment, stats, and settings. Loops through
 * arrays of data so as to not repeat the same lines of code to turn off/on a bool
 * for each button press. Sets an active class which forces a highlight and changes
 * the text to 'back'. Pressing the same menu button again takes you to the main page
 ****************************************************************************************/
  switchView(name: string){
    
    //Reset the selected item so the view is empty when navigating to a screen that uses it
    this.selectedItem = null;
    this.equippedItem = null;
    this.clearItemDetailArrays();
    if (this.memberIndex !== null){
      this.selectPartyMember(this.memberIndex);
    }

    this.pages.forEach((page) => {
      if (page.name === name) {

        if (page.isActive){
          this.pages[0].isActive = true;
          page.isActive = false;
          return;
        }
        
        page.isActive = true;
      } else {
        page.isActive = false;
      }
    });

    this.elements.forEach((element) => {
      if (element.name === name){

        if (element.element.nativeElement.classList.contains('active')){
          element.element.nativeElement.classList.remove('active');
          return;
        }
        
        element.element.nativeElement.classList.add('active');
      } else {
          element.element.nativeElement.classList.remove('active');
      }
    });
  }

/****************************************************************************************
 * Inventory Display Swap - In the inventory tab, handles switching the view between
 * equippable items and consumable items
 ****************************************************************************************/
  inventoryDisplaySwap(){
    this.selectedItem =  null;
    this.viewingConsumables = !this.viewingConsumables;
  }

/****************************************************************************************
 * View Item Details - Used in the inventory tab to display selected item details.
 * Also used in the equipment tab to show which item is currently selected
 ****************************************************************************************/
  viewItemDetails(item, activate: boolean = false, element: any = null){
    // console.log(item);
    this.getEquippedItem();

    if (activate){
      element.classList.add('active');
      if (this.previousElement === element){
        this.previousElement = null;
      }
      if (this.previousElement){
        this.previousElement.classList.remove('active');
      }
      this.previousElement = element;     
    }
    this.selectedItem = item;
    this.clearItemDetailArrays();
    this.calcNestedStatDifferences('damageTypes');
    this.calcNestedStatDifferences('statusResistances');
    this.calcNestedStatDifferences('damageResistances');
    this.calcBaseStatDifferences();
    this.trinketDamageDisplay();
  }

/****************************************************************************************
 * Get Equipped Item - Grabs the currently equipped item from the category we're viewing
 * for the player we currently have selected
 ****************************************************************************************/
  getEquippedItem(){
    //If we're viewing the equipment page, grab the currently equipped
    //item for the category we're currently viewing for stat comparsion
    //with the selected item
    if (this.viewingEquipment.isActive){
      this.combatService.party.inventory.forEach((item) => {
        if (this.selectedPartyMember){
          if (item.constructor.name === this.itemCategory && item.equippedBy?.name === this.selectedPartyMember.name){
            this.equippedItem = item;
          }
        }
      });
      // console.log(this.equippedItem);
    }
  }

/****************************************************************************************
 * Toggle View Equipped - Changes if we show/hide already equipped items in the list
 ****************************************************************************************/
  toggleViewEquipped(){
    this.viewEquipped = !this.viewEquipped;
    this.selectedItem = null;
    this.equippedItem = null;
    this.clearItemDetailArrays();
  }
  
/****************************************************************************************
 * Cancel Equip - Removes the selected & equipped item and the active style on the
 * selected item
 ****************************************************************************************/
  cancelEquip(){
    this.selectedItem = null;
    this.equippedItem = null;
    this.clearItemDetailArrays();
    this.previousElement.classList.remove('active');
  }

/****************************************************************************************
 * Equip Item - Handles equipping/unequipping items
 ****************************************************************************************/
  equipItem(){

    this.equippedTrinkets = [];

    //Get the currently equipped trinket(s) (if any)
    this.equippedTrinkets = this.selectedPartyMember.getEquippedTrinkets(this.combatService.party.inventory);

    //Do nothing if we don't have an item selected
    if (!this.selectedItem){
      return;
    }
    
    //If the selected item matches the equipped item, unequip it
    if (this.selectedItem === this.equippedItem || this.selectedItem === this.equippedTrinkets.find(({ name }) => name === this.selectedItem.name)){
      this.equippedItem = null;
      delete this.selectedItem.equippedBy;
      //Update the list of not equipped items when an inventory change is made
      this.notEquippedItems = this.combatService.party.inventory.filter(function(e) { return !e.equippedBy});
      this.clearItemDetailArrays();
      this.calcNestedStatDifferences('damageTypes');
      this.calcNestedStatDifferences('statusResistances');
      this.calcNestedStatDifferences('damageResistances');
      this.calcBaseStatDifferences();
      this.trinketDamageDisplay();
      if (this.trinketComparison === 1){
        this.trinketComparison = 0;
      }
      return;
    }

    //If the item we're trying to equip is already equipped by someone else, display a popup and prevent "stealing" that item from them unless allowed
    //TODO: Also next up, dialog popup when attempting to equip a third trinket that asks which one you'd like to replace
    if (this.selectedItem !== this.equippedItem){
      if (this.selectedItem?.equippedBy?.name !== this.selectedPartyMember.name && this.selectedItem?.equippedBy?.name !== undefined){
        let obj = {
          equippedBy: this.selectedItem?.equippedBy?.name,
          selectedItem: this.selectedItem,
          selectedPartyMember: this.selectedPartyMember.name
        }
        this.equipConfirmation(obj);
        return;
      }

      //Equip item
      //Unequip the currently equipped item, if we have one - Unless we're equipping trinkets, which allows you to equip two at once
      //This allows equipping more than one trinket by preventing the currently equipped item from being removed when equipping another
      if (this.equippedItem){
        if (this.selectedItem.constructor.name !== 'Trinket'){
          delete this.equippedItem.equippedBy; 
        }
      }

      //If the selected item is a trinket and we have less than two equipped, allow equipping more.
      //Otherwise, prevent it, or in the case of a non-trinket, allow equipping it
      if (this.selectedItem.constructor.name === 'Trinket' && this.equippedTrinkets.length + 1 <= 2){
        this.selectedItem.equippedBy = this.selectedPartyMember;
        if (this.equippedTrinkets.length +1 === 2){ //If the equipped trinket is the second one equipped, set the current comparison to the newly equipped trinket to prevent needing to swap comparison twice before it's accurate because trinketDamageComparison() only uses this.equippedTrinkets[this.trinketComparison] and not the equippedItem
          this.trinketComparison = 1;
        }
      } else if (this.selectedItem.constructor.name !== 'Trinket'){
        this.selectedItem.equippedBy = this.selectedPartyMember;
      }
      this.getEquippedItem();

      // this.equippedTrinkets = [];
      // this.equippedTrinkets = this.selectedPartyMember.getEquippedTrinkets(this.combatService.party.inventory);
      
      //Clear damageTypeDisplay to show the newly equipped item's stats as your new stats
      this.clearItemDetailArrays();

      //Update the list of not equipped items when an inventory change is made
      this.notEquippedItems = this.combatService.party.inventory.filter(function(e) { return !e.equippedBy});
      this.previousElement.classList.remove('active');
      this.selectedItem = null;
      return;
    }
  }

/****************************************************************************************
 * Change Item Category / Change Category - Opens a dialog box and allows selecting of
 * an item category
 ****************************************************************************************/
  changeItemCategory(){
    if (!this.selectedPartyMember){
      return;
    }
    
    const dialogRef = this.dialog.open(SelectCategoryComponent, {
      panelClass: 'custom-dialog-container',
      width: '25rem',
      height: '15rem',
      // data: {helpText: data},
      backdropClass: 'backdropBackground',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.selectedItem = null;
        this.equippedItem = null;
        this.clearItemDetailArrays();
        this.itemCategory = result['value'];
        this.itemCategoryDisplay = result['displayName'];
      }
    });
  }

  /****************************************************************************************
 * Equip Confirmation - Opens a dialog box and asks for confirmation when attempting to
 * equip an item that's equipped by someone else, or when attempting to equip a third
 * trinket without first unequipping one
 ****************************************************************************************/
  equipConfirmation(data){
    if (!this.selectedPartyMember){
      return;
    }
    
    const dialogRef = this.dialog.open(EquipConfirmationComponent, {
      panelClass: 'custom-dialog-container',
      width: '25rem',
      height: '15rem',
      data: {data},
      backdropClass: 'backdropBackground',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      //if result === true, then the item was equipped
      if (result){
        if (this.equippedItem){
          if (this.selectedItem.constructor.name !== 'Trinket'){
            delete this.equippedItem.equippedBy; 
          }
        }
        this.selectedItem.equippedBy = this.selectedPartyMember;
        this.getEquippedItem();
        this.clearItemDetailArrays();
        //Update the list of not equipped items when an inventory change is made
        this.notEquippedItems = this.combatService.party.inventory.filter(function(e) { return !e.equippedBy});
        this.previousElement.classList.remove('active');
        this.selectedItem = null;
      }
    });
  }


/****************************************************************************************
 * Calc Base Stat Differences - Compares selected item to all of the base stats to 
 * display up/down arrows for stat removed/gained/lost when comparing items
 ****************************************************************************************/
calcBaseStatDifferences() {
  if (!this.selectedItem || !this.viewingEquipment.isActive){
    return;
  }

  let baseStats = ['strength', 'intelligence', 'defense', 'speed', 'evasion', 'accuracy', 'luck', 'resistance', 'crit', 'attack'];

  this.equippedTrinkets = [];
  this.equippedTrinkets = this.selectedPartyMember.getEquippedTrinkets(this.combatService.party.inventory);
  
  baseStats.forEach(statName => {

  //Create copies of everything we need so we don't affect the actual player's data
  let equippedItemCopy = _.cloneDeep(this.equippedItem);
  let selectedItemCopy = _.cloneDeep(this.selectedItem);
  let playerCopy = _.cloneDeep(this.selectedPartyMember);
  
  //Get the current totalStatValue using the equipped item
  let oldValue = playerCopy.calcTotalStatValue(statName, null, this.combatService.party.inventory);

  //Get all equipped items of the selected player
  let equippedEquipment = [];
  this.combatService.party.inventory.forEach((equipment) => {
    if (equipment.equippedBy?.name === playerCopy.name){
      equippedEquipment.push(equipment);
    }
  });
  
  //Now "equip" the selected item
  if (equippedItemCopy){
    delete equippedItemCopy.equippedBy;
  }
  selectedItemCopy.equippedBy = playerCopy;

  //Replace the old equipped item with the new one in the list of equipped items
  equippedEquipment.forEach((e, index) => {
    if ((equippedItemCopy && this.equippedTrinkets.length === 2 && this.selectedItem.constructor.name === 'Trinket') || (equippedItemCopy && this.selectedItem.constructor.name !== 'Trinket')){
      if (e.name === equippedItemCopy.name){
        equippedEquipment.splice(index, 1);
        equippedEquipment.push(selectedItemCopy);
      }
    }else {
      equippedEquipment.push(selectedItemCopy);
    }
  });
  
  //Remove any duplicate items from equippedEquipment because somehow they're being duplicated in the else block above and I don't know why
  //This currently only checks to see if the name & description are the same, so make sure those are unique in the item list, or add
  //more checks for different values here to ensure duplicates don't slip through
  equippedEquipment = equippedEquipment.filter((value, index, self) =>
  index === self.findIndex((item) => (
    item.description === value.description && item.name === value.name
  ))
);
  
  let newValue = playerCopy.calcTotalStatValue(statName, null, equippedEquipment);
  
    let obj = {
      name: statName.charAt(0).toUpperCase() + statName.slice(1),
      newValue: newValue,
      oldValue: oldValue,
      statUp: null,
      statDown: null,
      statSame: null,
    };
    
    if (newValue >= 0 && newValue > oldValue){ // Positive change
      obj.statUp = true;
    }else if (newValue >= 0 && newValue < oldValue){ // Negative change
      obj.statDown = true;
    } else if (newValue === oldValue && oldValue > 0){
      obj.statSame = true;
    }
    
    this.baseStatDisplay.push(obj);
  });

  //This prevents showing stat changes when the selected item is an equipped trinket
  if (this.selectedItem === this.equippedTrinkets.find(({ name }) => name === this.selectedItem.name)){
    this.clearItemDetailArrays();
    return;
  }
  
}

/****************************************************************************************
 * Calc Nested Stat Differences - Compares selected item to all nested data 
 * (damage types, stat resistances, damage resistances) to display up/down arrows for 
 * stat removed/gained/lost when comparing items
 ****************************************************************************************/
  calcNestedStatDifferences(varName: string) {
    if (!this.selectedItem || !this.viewingEquipment.isActive){
      return;
    }

    this[varName].forEach(statName => {

    //Create copies of everything we need so we don't affect the actual player's data
    let equippedItemCopy = _.cloneDeep(this.equippedItem);
    let selectedItemCopy = _.cloneDeep(this.selectedItem);
    let playerCopy = _.cloneDeep(this.selectedPartyMember);
    
    //Get the current totalStatValue using the equipped item
    let oldValue = playerCopy.calcTotalStatValue(statName, null, this.combatService.party.inventory);

    //Get all equipped items of the selected player
    let equippedEquipment = [];
    this.combatService.party.inventory.forEach((equipment) => {
      if (equipment.equippedBy?.name === playerCopy.name){
        equippedEquipment.push(equipment);
      }
    });
    
    //Now "equip" the selected item
    if (equippedItemCopy){
      delete equippedItemCopy.equippedBy;
    }
    selectedItemCopy.equippedBy = playerCopy;

    //Replace the old equipped item with the new one in the list of equipped items
    equippedEquipment.forEach((e, index) => {
      /*****************
       * If we have less than 2 trinkets equipped, this needs to display the second trinket as all adds/statUp.
       * But it needs to accurately display any changes with any other item category with statUp/statDown
       * when there is only one equipped, independently of the number of trinkets we have equipped, hence this
       * giant if statement here
       ******************/
      if ((equippedItemCopy && this.equippedTrinkets.length === 2 && this.selectedItem.constructor.name === 'Trinket') || (equippedItemCopy && this.selectedItem.constructor.name !== 'Trinket')){
        if (e.name === equippedItemCopy.name){
          equippedEquipment.splice(index, 1);
          equippedEquipment.push(selectedItemCopy);
        }
      } else {
        equippedEquipment.push(selectedItemCopy);
      }
    });
    
    //Remove any duplicate items from equippedEquipment because somehow they're being duplicated in the else block above and I don't know why
    //This currently only checks to see if the name & description are the same, so make sure those are unique in the item list, or add
    //more checks for different values here to ensure duplicates don't slip through
    equippedEquipment = equippedEquipment.filter((value, index, self) =>
    index === self.findIndex((item) => (
      item.description === value.description && item.name === value.name
    ))
  );
    
    let newValue = playerCopy.calcTotalStatValue(statName, null, equippedEquipment);
    
      let splitName = statName.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
      let obj = {
        name: splitName[0] + ' ' + splitName[1],
        newValue: newValue,
        oldValue: oldValue,
        statUp: null,
        statDown: null,
        statSame: null,
      };

      //Add in Resistance to the end, so if it's FireDamageResistance, the resistance at the end gets added in correctly
      if (splitName[2]){
        obj.name = splitName[0] + ' ' + splitName[1] + ' ' + splitName[2];
      }
      
      if (newValue >= 0 && newValue > oldValue){ // Positive change
        obj.statUp = true;
      }else if (newValue >= 0 && newValue < oldValue){ // Negative change
        obj.statDown = true;
      } else if (newValue === oldValue && oldValue > 0){
        obj.statSame = true;
      }
      
      if (varName === 'damageTypes') { this.damageTypeDisplay.push(obj); }
      if (varName === 'statusResistances') { this.statusResistanceDisplay.push(obj); }
      if (varName === 'damageResistances') { this.damageResistanceDisplay.push(obj); }
    });

    this.equippedTrinkets = [];
    this.equippedTrinkets = this.selectedPartyMember.getEquippedTrinkets(this.combatService.party.inventory);

    //This prevents showing stat changes when the selected item is an equipped trinket
    if (this.selectedItem === this.equippedTrinkets.find(({ name }) => name === this.selectedItem.name)){
      this.clearItemDetailArrays();
      return;
    }
    
  }

/****************************************************************************************
 * Trinket Damage Display - Displays +% damageType when trinkets/non-trinkets are selected
 * Needed because trinket damage bonuses are excluded from calcTotalStatValue() so another
 * way of displaying this info to the player is needed
 ****************************************************************************************/
  trinketDamageDisplay(){
    //Clear any current trinket damage bonuses
    this.trinketDamageBonuses = [];
    this.equippedTrinkets = [];

    //Get the currently equipped trinket(s) (if any)
    if (!this.viewingInventory.isActive){
      this.equippedTrinkets = this.selectedPartyMember.getEquippedTrinkets(this.combatService.party.inventory);
    }

    if (!this.selectedItem){
      return;
    }

    if (this.selectedItem.constructor.name === 'Trinket'){

      //Create a copy of each damageType from the currently equipped trinket and apply statDown to it so it will display as lost
      let DT_copy = null;
      let splitName = null;
      if (this.equippedTrinkets.length && this.equippedTrinkets[this.trinketComparison] ){
        this.equippedTrinkets[this.trinketComparison].damageTypes.forEach(DT => {
          DT_copy = _.cloneDeep(DT);

          if (this.selectedItem !== this.equippedTrinkets[this.trinketComparison] && this.equippedTrinkets.length === 2){
            DT_copy.statDown = true;
          }

          splitName = DT.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
          DT_copy.name = splitName[0] + ' ' + splitName[1];
          this.trinketDamageBonuses.push(DT_copy);
        });
      }

      //This section here adds the second equipped (if any) trinket's damage type to the list so that when a non-equipped trinket
      //is selected, we still correctly display all current damage bonuses
      if (this.trinketComparison === 0){
        if (this.equippedTrinkets[1]){
          this.equippedTrinkets[1].damageTypes.forEach(DT => {
            DT_copy = _.cloneDeep(DT);
            splitName = DT.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
            DT_copy.name = splitName[0] + ' ' + splitName[1];
            this.trinketDamageBonuses.push(DT_copy);
          });
        }
      } else if (this.trinketComparison === 1){
        if (this.equippedTrinkets[0]){
          this.equippedTrinkets[0].damageTypes.forEach(DT => {
            DT_copy = _.cloneDeep(DT);
            splitName = DT.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
            DT_copy.name = splitName[0] + ' ' + splitName[1];
            this.trinketDamageBonuses.push(DT_copy);
          });
        }
      }
        
      //Now do the same thing for the selected trinket's damage types, except apply statUp to it so it will display all as gained
      this.selectedItem.damageTypes.forEach(DT => {
        DT_copy = _.cloneDeep(DT);
        DT_copy.statUp = true;
        splitName = DT.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        DT_copy.name = splitName[0] + ' ' + splitName[1];
        this.trinketDamageBonuses.push(DT_copy);
      });

      //This prevents showing stat changes when the selected item is an equipped trinket
      if (this.selectedItem === this.equippedTrinkets.find(({ name }) => name === this.selectedItem.name)){
        this.trinketDamageBonuses = [];
      }
      
    }

  }

/****************************************************************************************
 * Swap Trinket Comparison / swap trinket / trinket swap - We're allowed to equip two 
 * trinkets at once. Because of that, comparing the currently selected item to the 
 * equipped item won't work, as we don't know which one to compare it to. 
 * This allows us to swap between indexes 0 and 1 to compare a trinket to another one. 
 * After the swap is made, we re-call trinketDamageDisplay() to update the view.
 ****************************************************************************************/
  swapTrinketComparison(){
    this.equippedTrinkets = [];
    this.equippedTrinkets = this.selectedPartyMember.getEquippedTrinkets(this.combatService.party.inventory);
    
    if (this.equippedTrinkets.length < 2){
      return;
    }
    
    if (this.trinketComparison === 0){
      if (this.equippedItem === this.equippedTrinkets[0]){ this.equippedItem = this.equippedTrinkets[1]; }
      this.trinketComparison = 1;
    } else if (this.trinketComparison === 1){
      if (this.equippedItem === this.equippedTrinkets[1]){ this.equippedItem = this.equippedTrinkets[0]; }
      this.trinketComparison = 0;
    }

    this.clearItemDetailArrays();
    this.calcNestedStatDifferences('damageTypes');
    this.calcNestedStatDifferences('statusResistances');
    this.calcNestedStatDifferences('damageResistances');
    this.calcBaseStatDifferences();
    this.trinketDamageDisplay();
  }

/****************************************************************************************
 * Clear Item Detail Arrays - Clears out all item comparison data
 ****************************************************************************************/
  clearItemDetailArrays(){
    this.damageTypeDisplay = [];
    this.statusResistanceDisplay = [];
    this.damageResistanceDisplay = [];
    this.trinketDamageBonuses = [];
    this.baseStatDisplay = [];
  }
  
/****************************************************************************************
 * Select Party Member - Allows you to select a party member
 * Clicking anywhere on the enemy box selects them. Unlike the same function in the
 * combat file, this one allows deselecting a party member.
 ****************************************************************************************/
  selectPartyMember(index){
    if (this.memberIndex === index && this.partyForm.controls.memberSelected.value !== null){
      this.memberBoxes.toArray()[index].nativeElement.classList.remove('memberSelected');
      this.partyForm.controls.memberSelected.setValue(null);
      this.memberIndex = null;
      this.selectedPartyMember = null;
      this.equippedItem = null;
      this.selectedItem = null;
      this.clearItemDetailArrays();
      return;
    }
    
    this.memberIndex = index;
    if (this.previousPartyMember !== null){ this.previousPartyMember.classList.remove('memberSelected'); }
    this.selectedPartyMember = this.combatService.party.members[index];
    this.partyForm.controls.memberSelected.setValue(index);
    this.memberBoxes.toArray()[index].nativeElement.classList.add('memberSelected');
    this.previousPartyMember = this.memberBoxes.toArray()[index].nativeElement;
    this.clearItemDetailArrays();
    this.equippedItem = null;
    this.getEquippedItem();
    this.calcNestedStatDifferences('damageTypes');
    this.calcNestedStatDifferences('statusResistanceDisplay');
    this.calcNestedStatDifferences('damageResistanceDisplay');
    this.calcBaseStatDifferences();
    this.trinketDamageDisplay();
  }


}