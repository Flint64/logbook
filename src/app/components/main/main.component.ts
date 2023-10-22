import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Player } from 'src/app/models/player.model';
import { CombatService } from 'src/app/services/combat.service';
import { LoaderService } from 'src/app/services/loader.service';

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
  
  constructor(public combatService: CombatService, private loaderService: LoaderService, private renderer: Renderer2) { }
  
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

    console.log(this.combatService.party.inventory);

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
 * Select Party Member - Allows you to select a party member
 * Clicking anywhere on the enemy box selects them. Unlike the same function in the
 * combat file, this one allows deselecting a party member.
 ****************************************************************************************/
  selectPartyMember(index){
    if (this.memberIndex === index && this.partyForm.controls.memberSelected.value !== null){
      this.memberBoxes.toArray()[index].nativeElement.classList.remove('memberSelected');
      this.partyForm.controls.memberSelected.setValue(null);
      return;
    }
    
    this.memberIndex = index;
    if (this.previousPartyMember !== null){ this.previousPartyMember.classList.remove('memberSelected'); }
    this.selectedPartyMember = this.combatService.party.members[index];
    this.partyForm.controls.memberSelected.setValue(index);
    this.memberBoxes.toArray()[index].nativeElement.classList.add('memberSelected');
    this.previousPartyMember = this.memberBoxes.toArray()[index].nativeElement;
  }


}