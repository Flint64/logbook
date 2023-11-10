import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EquippableItem } from 'src/app/models/equippableItem.model';
import { Player } from 'src/app/models/player.model';
import { CombatService } from 'src/app/services/combat.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SelectCategoryComponent } from './select-category/select-category.component';

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
  itemCategory: string = 'Weapon';
  itemCategoryDisplay: string = 'Weapons';
  equippedItem = null;
  damageTypeDisplay = [];
  
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
    this.damageTypeDisplay = [];
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
    this.damageTypeDifference();
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
    this.damageTypeDisplay = [];
  }
  
/****************************************************************************************
 * Cancel Equip - Removes the selected & equipped item and the active style on the
 * selected item
 ****************************************************************************************/
  cancelEquip(){
    this.selectedItem = null;
    this.equippedItem = null;
    this.damageTypeDisplay = [];
    this.previousElement.classList.remove('active');
  }

/****************************************************************************************
 * Equip Item - Handles equipping/unequipping items
 ****************************************************************************************/
  equipItem(){
    //If the selected item matches the equipped item, unequip it
    if (this.selectedItem === this.equippedItem){
      this.equippedItem = null;
      delete this.selectedItem.equippedBy;
      //Update the list of not equipped items when an inventory change is made
      this.notEquippedItems = this.combatService.party.inventory.filter(function(e) { return !e.equippedBy});
      this.damageTypeDifference();
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
      this.damageTypeDisplay = [];

      //Update the list of not equipped items when an inventory change is made
      this.notEquippedItems = this.combatService.party.inventory.filter(function(e) { return !e.equippedBy});
      return;
    }
  }

/****************************************************************************************
 * Change Item Category - Opens a dialog box and allows selecting of an item category
 ****************************************************************************************/
  changeItemCategory(){
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
        this.damageTypeDisplay = [];
        this.itemCategory = result['value'];
        this.itemCategoryDisplay = result['displayName'];
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
    if (!this.selectedPartyMember || !this.selectedItem){
      return
    }

    //Clear target so that duplicates don't happen
    target.innerHTML = null;
    target.className = "";

    //Get the stat total from calcTotalStatValue
    let totalStat = this.selectedPartyMember.calcTotalStatValue(statName, null, this.combatService.party.inventory);

    //The change from the equipped item to the selected one is equal to the total - equipped + the selected item
    //Only calc change if we have an equipped item
    let change = null;
    if (this.equippedItem){
      change = totalStat - this.equippedItem[statName] + this.selectedItem[statName];
    }
    
    if (!this.equippedItem){
      change = totalStat + this.selectedItem[statName];
    }

    //Generate HTML to plug in place. Two spans, the first for a white '/'
    //and the second one for a colored up/down arrow for pos/neg stat change
    let span1 = this.renderer.createElement('span');
    this.renderer.setProperty(span1, 'innerHTML', '/ ');
    let span2 = this.renderer.createElement('span');
    
    if (change && change > totalStat){ // Positive change
      this.renderer.addClass(span2, 'statUp');
      this.renderer.setProperty(span2, 'innerHTML', `${change} &#9650;`)
      this.renderer.appendChild(target, span1);
      this.renderer.appendChild(target, span2);
    } else if (change && change < totalStat){ // Negative change
      this.renderer.addClass(span2, 'statDown');
      this.renderer.setProperty(span2, 'innerHTML', `${change} &#9660;`)
      this.renderer.appendChild(target, span1);
      this.renderer.appendChild(target, span2);
    }

    //If we don't have a stat change, don't display anything
    if (change === null || change === undefined){
      target.innerHTML = null;
    }
    
  }

/****************************************************************************************
 * Damage Type Difference - Handles displaying item damage type changes when selecting
 * an item to equip. Displays strikethrough and greyed out for lost damage types,
 * up/down arrows for the same damage type increase/decrease, and green text with up arrow
 * for gained damage types
 ****************************************************************************************/
  damageTypeDifference(){
    //If we don't have the required data to display a change, do nothing
    if (!this.selectedPartyMember || !this.selectedItem){
      this.damageTypeDisplay = [];
      return
    }

    //If we don't have an equipped item, display the selected item's stats all as gained
    if (!this.equippedItem && this.selectedItem){      
      let obj = null;
      let splitName = null;
      this.damageTypeDisplay = [];

      this.selectedItem.damageTypes.forEach(e => {
        splitName = e.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        obj = {
          item: e,
          name: splitName[0] + ' ' + splitName[1],
          statGained: true,
          statUp: true
        }
        this.damageTypeDisplay.push(obj);
      });
      return;
    }

    // Don't display stat change if the selected item is the equipped item
    if (this.equippedItem === this.selectedItem){
      this.damageTypeDisplay = [];
      return;
    }

    //Create an object with properties to be used in the template with [ngClass]
    //to add classes to display the result correctly without the need for
    //manipulating the DOM with renderer2 and having to wait for a delay
    let obj = null;
    let splitName = null;
    this.damageTypeDisplay = [];
     
    //Loop through the equippedItem's damage types
    //If the selected item damage type matches the equipped, no change
     this.equippedItem.damageTypes.forEach(e => {
      let found = this.selectedItem.damageTypes.find((el) => el.constructor.name === e.constructor.name);

      if (found && found.percent === e.percent){
        splitName = found.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        // Same exact damage type
        obj = {
          item: found,
          name: splitName[0] + ' ' + splitName[1],
        }
        this.damageTypeDisplay.push(obj);
      }
      
      //If there's a match but the percent is higher, display up arrow for increase
      if (found && found.percent > e.percent){
        splitName = found.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        // Higher percentage of e.constructor.name
        obj = {
          equipped: e,
          item: found,
          name: splitName[0] + ' ' + splitName[1],
          statUp: true
        }
        this.damageTypeDisplay.push(obj);
      }
      
      //If there's a match but the percent is lower, display down arrow for decrease
      if (found && found.percent < e.percent){
        splitName = found.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        // Less percentage of e.constructor.name
        obj = {
          equipped: e,
          item: found,
          name: splitName[0] + ' ' + splitName[1],
          statDown: true
        }
        this.damageTypeDisplay.push(obj);
      }

      //If we don't find a match, that damage type has been lost
      if (!found){
        splitName = e.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        // lost e.constructor.name
        obj = {
          item: e,
          name: splitName[0] + ' ' + splitName[1],
          statRemoved: true
        }
        this.damageTypeDisplay.push(obj);
      }
      
    });
    
    //Now loop through the selectedItem's damage types
    //If we don't find a match, that means we have gained that damage type
    //and it should be displayed as a new one with an up arrow
    this.selectedItem.damageTypes.forEach(e => {
      let found = this.equippedItem.damageTypes.find((el) => el.constructor.name === e.constructor.name)
      if (!found){
        splitName = e.constructor.name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        // gained e.constructor.name
        obj = {
          item: e,
          name: splitName[0] + ' ' + splitName[1],
          statUp: true,
          statGained: true
        }
        this.damageTypeDisplay.push(obj);
      }
    });
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
      this.damageTypeDisplay = [];
      return;
    }
    
    this.memberIndex = index;
    if (this.previousPartyMember !== null){ this.previousPartyMember.classList.remove('memberSelected'); }
    this.selectedPartyMember = this.combatService.party.members[index];
    this.partyForm.controls.memberSelected.setValue(index);
    this.memberBoxes.toArray()[index].nativeElement.classList.add('memberSelected');
    this.previousPartyMember = this.memberBoxes.toArray()[index].nativeElement;
    this.equippedItem = null;
    this.getEquippedItem();
    this.damageTypeDifference();
  }


}