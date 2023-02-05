import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Enemy } from 'src/app/models/enemy.model';
import { ConsumableItem } from 'src/app/models/consumableItem.model';
import { CombatService } from 'src/app/services/combat.service';
import { Effect } from 'src/app/models/effect.model';

@Component({
  selector: 'app-combat-test',
  templateUrl: './combat-test.component.html',
  styleUrls: ['./combat-test.component.scss']
})


export class CombatTestComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('story', {static: false}) story: ElementRef;
  @ViewChildren('enemyBoxes') enemyBoxes: QueryList<ElementRef>;
  @ViewChildren('enemyIcons') enemyIcons: QueryList<ElementRef>;
  @ViewChildren('gameBox') gameBox: QueryList<ElementRef>;
  keyListener = null;

  selectedEnemy: Enemy = null;
  enemyForm: FormGroup;
  previousTarget = null;
  intervalID = null;

  mainMenuOptions = ['Attack', 'Magick', 'Inventory'];

  viewingMainOptions: boolean = true;
  viewingMagicOptions: boolean = false;
  viewingInventoryOptions: boolean = false;
  
  constructor(public combatService: CombatService, renderer: Renderer2) {
    if (!this.keyListener){
      this.keyListener = renderer.listen('document', 'keypress', (e) => {
        if (parseInt(e.key) >= 0 || parseInt(e.key) >= 9 ){
          
          let numSelected = parseInt(e.key);
          this.optionSelected(numSelected);
        }

      });
   }
  }
  
  ngOnInit(): void {

    this.enemyForm = new FormGroup({
      'enemySelected': new FormControl(null)
    });

    let t = new ConsumableItem('Healing Potion', 1, new Effect(20, null, null, null, null, null, null));
    let p = new ConsumableItem('Mana Potion', 1, new Effect(null, null, null, null, -20, null, null));
    this.combatService.player.consumables.push(t);
    this.combatService.player.consumables.push(p);

    let m = 'Fireball';
    this.combatService.player.magic.push(m);
    
    //Auto-start combat
    this.enemyForm.controls.enemySelected.setValue(0);
    this.startCombat();
  }

  ngAfterViewInit(): void {
    // Allows selection of the first enemy to allow auto-start of combat
    this.selectEnemy(0, this.enemyBoxes.first.nativeElement);
  }

  ngOnDestroy(): void {
    this.keyListener();
  }

  optionSelected(numSelected: number){
    try {
      if (this.viewingMainOptions){
        if (this.viewingMainOptions && numSelected === this.mainMenuOptions.length + 1){
            if (this.intervalID !== null){
              this.stopATB();
            } else {
              this.startCombat();
            }
            return;
        }
      switch(this.mainMenuOptions[numSelected - 1]){

          case 'Attack':
            this.playerAttack();
          break;

          case 'Magick':
            this.magick();
          break;

          case 'Inventory':
            this.inventory();
          break;
        }
      } else if (this.viewingMagicOptions){
        if (this.viewingMagicOptions && numSelected === this.combatService.player.magic.length + 1){
          // Go back to main menu
          this.menuBack('main');
      }
        

      } else if (this.viewingInventoryOptions){
        if (this.viewingInventoryOptions && numSelected === this.combatService.player.consumables.length + 1){
          // Go back to main menu
          this.menuBack('main');
        } else {
          this.useConsumable(numSelected); 
        }
      }


      } catch (error) {
        //Do nothing if func is undefined
      }
  }

  /****************************************************************************************
   * Append Text - Appends text to the story box whenever an attack is made, etc
   ****************************************************************************************/
  appendText(text, newline: boolean = false){
    if (newline){this.story.nativeElement.innerHTML +='<br>'}
    this.story.nativeElement.innerHTML += text;
    this.story.nativeElement.scrollTo(0, this.story.nativeElement.scrollHeight);
  }

  /****************************************************************************************
   * Start Combat - Starts combat and handles starting enemy ATB gauges at different
   * values to shake up combat a bit
   ****************************************************************************************/
  startCombat(){
    if (this.enemyForm.controls.enemySelected.value === null){
      return;
    }

    // When starting combat, create a value to bind to each invididual enemy ATB guage
    if (this.combatService.enemyATBValues.length === 0){
      this.combatService.enemyList.forEach((e) => {
        let num = Math.floor(Math.random() * 50) + 1; // this will get a number between 1 and 99;
        num *= Math.round(Math.random()) ? 1 : -1; // this will add minus sign in 50% of cases
        /*
          Enemies will have a chance to start battle with their ATB guage anywhere from
          half filled  to negative half filled to stagger their attack times a bit. 
        */
        this.combatService.enemyATBValues.push(num);
      });
    }
    
    //Handles initially starting combat & resuming from pausing
    if (!this.intervalID){
      console.log("starting combat");
      this.intervalID = setInterval( () => this.incrementATB(), 25 );
    }
  }

  /****************************************************************************************
   * Increment ATB - The main 'game' loop that handles incrememting the ATB gauges
   ****************************************************************************************/
  incrementATB(){

    this.combatService.enemyHealthValues = [];
    const isBelowThreshold = (currentValue) => currentValue < 0;

    //Fill an array that only holds enemy health values to check each one to know if we should end combat or not
    this.combatService.enemyList.forEach((e) => {this.combatService.enemyHealthValues.push(e.health)});
    
    //If all enemy health is less than 0 or player health is less than 0, end the battle
    if (this.combatService.enemyHealthValues.every(isBelowThreshold) || (this.combatService.player.health < 0)){
      this.stopATB();
    }
    
    //When ATB guage is full, auto player attack if rage or something
    // if (this.combatService.player.ATB >= 100){
    // }

    //When ATB guage is full, enemy attack
    for (let i = 0; i < this.combatService.enemyATBValues.length; i++){
        if (this.combatService.enemyATBValues[i] >= 100){
            this.enemyAttack(i);
        }
    }

    //Fill the bar based on percent rather than straight value
    //based on the speed. Lower = faster
    this.combatService.player.ATB += (1*100/this.combatService.player.speed);

    //Increment each individual enemy's ATB guage if they have health remaining
    for (let i = 0; i < this.combatService.enemyATBValues.length; i++){
      if (this.combatService.enemyList[i].health >= 0){
        this.combatService.enemyATBValues[i] += (1*100/this.combatService.enemyList[i].speed);
      }
    }
    
  }

  /****************************************************************************************
   * Stop ATB - Stops combat when player/enemy is below 0 HP
   * Resets interval & ATB gauges
   * Also used to pause combat so we don't clear ATB gauges
   ****************************************************************************************/
  stopATB(){
    console.log("stopping combat");
    clearInterval(this.intervalID);
    this.intervalID = null;
  }

  /****************************************************************************************
   * Player Attack - Handles basic player attacks. //FIXME: Outsource this so that magic and items can be used without duplicating most of this?
   * Damage is based on attack power. //TODO: Minimum damage values
   * //TODO: Defense stat
   ****************************************************************************************/
  playerAttack(){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }
    
    // Returns a random integer from 1-100:
    if ((Math.floor(Math.random() * 100) + 1) < this.combatService.player.accuracy){
      let dam = Math.floor(Math.random() * this.combatService.player.attack + 1);

      //If the player has more than 0 hp allow the hit
      if (this.combatService.player.health !== 0){
        this.appendText('PLAYER hit for ' + dam + ' damage!', true);
        this.selectedEnemy.health -= dam;
        this.enemyIcons.toArray()[this.enemyForm.controls.enemySelected.value].nativeElement.classList.add('enemyHitSVG');
        this.previousTarget.classList.add('enemyHit');
        
        //If enemy is not dead, flash red to show damage was taken
        setTimeout(() => {
          if (this.selectedEnemy.health > 0){
            this.enemyIcons.toArray()[this.enemyForm.controls.enemySelected.value].nativeElement.classList.remove('enemyHitSVG');
            this.previousTarget.classList.remove('enemyHit');
          }
        }, 100);
        
        //If the enemy is dead, make it's text & icon red
        if (this.selectedEnemy.health < 0){
          this.previousTarget.classList.add('enemyHit');
          this.enemyIcons.toArray()[this.enemyForm.controls.enemySelected.value].nativeElement.classList.add('enemyHitSVG');
        }
      }
      
      //Enemy gets one last attack before dying if it ends up at 0 hp
      if (this.combatService.player.health === 0){ 
        this.appendText('PLAYER at near death attempts one final attack before perishing and hits for ' + dam + ' damage!', true);
    }

    //If we miss
    } else {
      if (this.combatService.player.health !== 0){this.appendText('PLAYER miss!', true); }
      if (this.combatService.player.health === 0){ this.appendText('PLAYER at near death attempts one final attack before perishing and misses!', true) }
    }

    //If the player or the enemy is at 0 hit points, they get one
    //last attack before dying. (Only attack, not action)
    //FIXME: With current setup, if hit again before the last attack, combat ends
    if (this.combatService.player.health === 0){
      this.stopATB();
    }

    //Reset ATB guage to empty
    this.combatService.player.ATB = -10;
  }

  /****************************************************************************************
   * Use Consumable - Allows usage of a consumable item from the inventory menu
   ****************************************************************************************/
  useConsumable(numSelected){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }

    for (const [key, value] of Object.entries(this.combatService.player.consumables[numSelected - 1].effect)) {


      
      //If the value of the selected propert(ies) isn't null and we have at least one of the item
      if (value !== null &&  this.combatService.player.consumables[numSelected - 1].amount > 0){

        //If addig the value is greater than the max value, set it to the max. Otherwise if subtracting it is less than 0, set to 0
        if ((this.combatService.player[`${key}`] += value) > this.combatService.player['max' + key.charAt(0).toUpperCase() + key.slice(1)]){
          this.combatService.player[`${key}`] = this.combatService.player['max' + key.charAt(0).toUpperCase() + key.slice(1)];
        } else if ((this.combatService.player[`${key}`] += value) < 0) {
          this.combatService.player[`${key}`] = 0;
        } else { //Otherwise add/subtract the value like normal
          this.combatService.player[`${key}`] += value;
          this.combatService.player.consumables[numSelected - 1].amount -= 1;
        }

        this.combatService.player.ATB = 0;
        this.menuBack('main');
      }
    }    
  }

  /****************************************************************************************
   * Magick - Handles selecting the magic option during combat. Displays spell list
   ****************************************************************************************/
  magick(){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }
    this.viewingMainOptions = false;
    this.viewingMagicOptions = true;
    this.viewingInventoryOptions = false;
  }

  /****************************************************************************************
   * Inventory - Handles selecting the inventory option during combat. Displays consumable 
   * items.
   ****************************************************************************************/
  inventory(){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }
    this.viewingMainOptions = false;
    this.viewingMagicOptions = false;
    this.viewingInventoryOptions = true;
  }

  /****************************************************************************************
   * Menu Back - Handles going back from any nested menu or back to the main options
   ****************************************************************************************/
  menuBack(ref){
    switch(ref){
      case "main":
        this.viewingMainOptions = true;
        this.viewingMagicOptions = false;
        this.viewingInventoryOptions = false;
      break;
    }
  }

  /****************************************************************************************
   * Enemy Attack - Handles basic enemy attacks. Damage is based on attack power.
   * //TODO: Defense stat
   ****************************************************************************************/
  enemyAttack(index){

    let enemy = this.combatService.enemyList[index];

    if ((Math.floor(Math.random() * 100) + 1) < enemy.accuracy){
      let dam = Math.floor(Math.random() * enemy.attack + 1);
      this.combatService.player.health -= dam;
      if (enemy.health !== 0){ 
        this.appendText(enemy.name +  ' hits for ' + dam + ' damage!', true);         
        this.playerHit();      
      }

      /*Kill the enemy once the final attack has happened*/
      if (enemy.health === 0){
        this.appendText(enemy.name +  ' at near death attempts one final attack before perishing and hits for ' + dam + ' damage!', true); 
        this.playerHit();
        enemy.health -= 1; 
        this.previousTarget.classList.add('enemyHit');
      }
      
    } else {
      if (enemy.health !== 0){this.appendText(enemy.name + ' miss!', true); }
      if (enemy.health === 0){ this.appendText(enemy.name + ' at near death attempts one final attack before perishing and misses!', true); enemy.health -= 1; /*Kill the enemy once the final attack has happened*/ }
    }

    //If the player or the enemy is at 0 hit points, they get one
    //last attack before dying. (Only attack, not action)
    //If hit again before the last attack, combat ends
    if (enemy.health === 0){
      this.stopATB(); 
    }

    //Reset ATB guage to -10 to display empty guage instead of partially
    //filled due to interval counter never stopping
    this.combatService.enemyATBValues[index] = -10;
  }

  /****************************************************************************************
   * Player Hit - Makes the game window flash red if the player is hit. Stays red
   * if player is dead
   ****************************************************************************************/
  playerHit(){
    this.gameBox.forEach((e) => {
      e.nativeElement.classList.add('playerHit');
    });
    
    //If you are not dead, flash red to show damage was taken
    if (this.combatService.player.health > 0){
    setTimeout(() => {
        this.gameBox.forEach((e) => {
          e.nativeElement.classList.remove('playerHit');
        });
      }, 100);
    }
  }

  /****************************************************************************************
   * Select Enemy - Allows you to select which enemy to attack. Clicking anywhere
   * on the enemy box selects them. Selecting the icon or name will NOT select the enemy
   ****************************************************************************************/
  selectEnemy(index, target){
    
    //Do nothing if we're selecting the label and not the actual div
    if (target.innerHTML.charAt(0) !== '<'){
      return;
    }

    if (this.previousTarget !== null){ this.previousTarget.classList.remove('enemySelected'); }
    this.selectedEnemy = this.combatService.enemyList[index];
    this.enemyForm.controls.enemySelected.setValue(index);
    target.classList.add('enemySelected');
    this.previousTarget = target;
  }

}
