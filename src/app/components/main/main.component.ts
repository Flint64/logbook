import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EquippableItem } from 'src/app/models/equippableItem.model';
import { Player } from 'src/app/models/player.model';
import { CombatService } from 'src/app/services/combat.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SelectCategoryComponent } from './select-category/select-category.component';
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
  itemCategory: string = 'Trinket';
  itemCategoryDisplay: string = 'Trinkets';
  equippedItem = null;

  trinketDamageBonuses = [];
  
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


  damageTypeDisplay = [];
  statusResistanceDisplay = [];
  damageResistanceDisplay = [];
  
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

    //Do nothing if we don't have an item selected
    if (!this.selectedItem){
      return;
    }
    
    //If the selected item matches the equipped item, unequip it
    if (this.selectedItem === this.equippedItem){
      this.equippedItem = null;
      delete this.selectedItem.equippedBy;
      //Update the list of not equipped items when an inventory change is made
      this.notEquippedItems = this.combatService.party.inventory.filter(function(e) { return !e.equippedBy});
      this.clearItemDetailArrays();
      this.calcNestedStatDifferences('damageTypes');
      this.calcNestedStatDifferences('statusResistances');
      this.calcNestedStatDifferences('damageResistances');
      return;
    }

    if (this.selectedItem !== this.equippedItem){
      if (this.selectedItem?.equippedBy?.name !== this.selectedPartyMember.name && this.selectedItem?.equippedBy?.name !== undefined){
        console.log('Item equipped by ' + this.selectedItem?.equippedBy?.name); //TODO: Next up, dialog confirm popup to equip an item equipped by someone else
        return;
      }

      //Equip item
      if (this.equippedItem){
        delete this.equippedItem.equippedBy;
      }
      this.selectedItem.equippedBy = this.selectedPartyMember;
      this.getEquippedItem();
      //Clear damageTypeDisplay to show the newly equipped item's stats as your new stats
      this.clearItemDetailArrays();
      // this.trinketDisplay();

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
      width: '30rem',
      height: '20rem',
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
        // this.trinketDisplay();
      }
    });
  }

/****************************************************************************************
 * Calculate Stat Differences - Generates HTML to display positive/negative change 
 * for comparing item stats
 ****************************************************************************************/
  calcStatDifferences(statName: string, target){

    this.getEquippedItem();
    
    //If we don't have the required data to display a change, do nothing
    if (!this.selectedPartyMember || !this.selectedItem || !this.viewingEquipment.isActive){ //TODO: Removing this trinket thing here sorta works, but they're displaying higher numbers than they should be for some reason
      return;
    }

    //Clear target so that duplicates don't happen
    if (target){
      target.innerHTML = null;
      target.className = "";
    }

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
      if (equippedItemCopy){
        if (e.name === equippedItemCopy.name){
          equippedEquipment.splice(index, 1);
          equippedEquipment.push(selectedItemCopy);
        }
      } else {
        equippedEquipment.push(selectedItemCopy);
      }
    });

    //Get the new totalStatValue using the new equipped item's stats. Use the new equippedEquipment
    //as the inventory, as otherwise calcTotalStatValue will always use the actual list of equipped items,
    //ignoring any changes made here
    let newValue = playerCopy.calcTotalStatValue(statName, null, equippedEquipment);
  
    let span1 = this.renderer.createElement('span');
    this.renderer.setProperty(span1, 'innerHTML', '/ ');
    let span2 = this.renderer.createElement('span');
    
    if (newValue >= 0 && newValue > oldValue){ // Positive change
      this.renderer.addClass(span2, 'statUp');
      this.renderer.setProperty(span2, 'innerHTML', `${newValue} &#9650;`)
      this.renderer.appendChild(target, span1);
      this.renderer.appendChild(target, span2);
    } else if (newValue >= 0 && newValue < oldValue){ // Negative change
      this.renderer.addClass(span2, 'statDown');
      this.renderer.setProperty(span2, 'innerHTML', `${newValue} &#9660;`)
      this.renderer.appendChild(target, span1);
      this.renderer.appendChild(target, span2);
    }
  }

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
      if (equippedItemCopy){
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

    //Get the new totalStatValue using the new equipped item's stats. Use the new equippedEquipment
    //as the inventory, as otherwise calcTotalStatValue will always use the actual list of equipped items,
    //ignoring any changes made here

    // this.selectedItem.constructor.name !== 'Trinket'
    /*
    //If the statName is any of these, we need to ignore trinket bonuses
    //The numbers seem to be okay if we have an item equipped in a slot. Otherwise, the values are all higher across the board for some reason
    //Changing the null values in the trinkets from null to 0 made the higher values be ~2x higher rather than ~3x higher. Why?
    //It looks like somehow when making the equippedEquipment array above, two of the selected item are being added to your equipped items when you don't have one equipped. Curious.
    BludgeoningDamage
    PiercingDamage
    SlashingDamage
    FireDamage
    IceDamage
    PoisonDamage
    ShockDamage
    */
    
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
  }


  // trinketDisplay(){
  //   this.trinketDamageBonuses = [];
  //   let trinketBonuses = this.selectedPartyMember.getEquippedTrinkets(this.combatService.party.inventory);
  //   let obj = null;
  //   trinketBonuses.forEach((e) => {
  //     let splitName = e.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
  //     obj = {
  //       display: `+${e.percent}% ${splitName[0]} ${splitName[1]}`
  //     }
  //     this.trinketDamageBonuses.push(obj);
  //   });
  // }

  clearItemDetailArrays(){
    this.damageTypeDisplay = [];
    this.statusResistanceDisplay = [];
    this.damageResistanceDisplay = [];
    this.trinketDamageBonuses = [];
    if (this.selectedPartyMember){
      // this.trinketDisplay();
    }
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
    // this.trinketDisplay();
  }


}