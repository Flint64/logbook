import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Enemy } from 'src/app/models/enemy.model';
import { ConsumableItem } from 'src/app/models/consumableItem.model';
import { CombatService } from 'src/app/services/combat.service';
import { Effect } from 'src/app/models/effect.model';
import * as Rand from '../../../../node_modules/lodash';
import { Magic } from 'src/app/models/magic.model';

@Component({
  selector: 'app-combat-test',
  templateUrl: './combat-test.component.html',
  styleUrls: ['./combat-test.component.scss']
})


export class CombatTestComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('story', {static: false}) story: ElementRef;
  @ViewChild('playerHealthBar', {static: false}) playerHealthBar: ElementRef;
  @ViewChildren('enemyBoxes') enemyBoxes: QueryList<ElementRef>;
  @ViewChildren('enemyIcons') enemyIcons: QueryList<ElementRef>;
  @ViewChildren('gameBox') gameBox: QueryList<ElementRef>;
  keyListener = null;

  selectedEnemy: Enemy = null;
  enemyIndex: number = null;
  enemyForm: FormGroup;
  previousTarget = null;
  intervalID = null;
  playerCanSelectEnemy: boolean = true;

  mainMenuOptions = ['Attack', 'Magick', 'Inventory'];

  viewingMainOptions: boolean = true;
  viewingMagicOptions: boolean = false;
  viewingInventoryOptions: boolean = false;
  
  constructor(public combatService: CombatService, private renderer: Renderer2) {
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

    let t = new ConsumableItem('Healing Potion', 1,    [new Effect('health', null, 20, true)]);
    let p = new ConsumableItem('Mana Potion', 1,       [new Effect('mana', null, 50, true)]);
    let s = new ConsumableItem('Speed Potion', 2,      [new Effect('speed', 4, 400, true)]);
    let sp = new ConsumableItem('Poison Yourself', 1,  [new Effect('poison', 4, 5, true)]);
    let ps = new ConsumableItem('Multiple Effects', 3, [new Effect('rage', 4, null, true), new Effect('attack', 4, 5, true), new Effect('speed', 4, 400, true), new Effect('mana', null, -5, true)]);
    let rage = new ConsumableItem('Rage Potion', 1,    [new Effect('rage', 4, null, true)]);
    let atk = new ConsumableItem('Damage+', 1,         [new Effect('attack', 4, 5, true)]);
    let atk2 = new ConsumableItem('Damage+', 1,         [new Effect('attack', 4, 5, true)]);
    
    this.combatService.player.consumables.push(t);
    this.combatService.player.consumables.push(p);
    this.combatService.player.consumables.push(s);
    this.combatService.player.consumables.push(sp);
    this.combatService.player.consumables.push(ps);
    this.combatService.player.consumables.push(rage);
    this.combatService.player.consumables.push(atk);
    this.combatService.player.consumables.push(atk2);
    
    let fireball = new Magic('Fireball', 11, 6, 12, 2, [new Effect('burn', 4, 5, false)]);
    let enrage = new Magic('Enrage', 7, 0, 0, 0, [new Effect('rage', 4, null, true)]);
    this.combatService.player.magic.push(fireball);
    this.combatService.player.magic.push(enrage);
    
    //Auto-start combat
    this.enemyForm.controls.enemySelected.setValue(0);
    this.startCombat();
    this.stopATB();    
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
        } else {
        this.useSpell(numSelected);
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
  appendText(text: string, newline: boolean = false, className: string = null){

    //Use renderer instead of docuoment.createElement so that the view encapsulation works to apply styles correctly
    let child = this.renderer.createElement('span');
    let lineBreak = document.createElement('br');
    if (className){child.classList.add(className);}
    child.innerText = text;
    
    if (newline){this.story.nativeElement.appendChild(lineBreak)};
    this.story.nativeElement.appendChild(child)
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
        let num = Math.floor(Math.random() * 25) + 1; // this will get a number between 1 and 25;
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
      this.stopATB(true);
    }

    //When ATB guage is full, enemy attack
    for (let i = 0; i < this.combatService.enemyATBValues.length; i++){
        if (this.combatService.enemyATBValues[i] >= 100){
            this.enemyAttack(i);
        }
    }

    //Fill the bar based on percent rather than straight value
    //based on the speed.
    this.combatService.player.ATB += (this.combatService.player.speed/100);

    //Increment each individual enemy's ATB guage if they have health remaining
    for (let i = 0; i < this.combatService.enemyATBValues.length; i++){
      if (this.combatService.enemyList[i].health >= 0){
        this.combatService.enemyATBValues[i] += (this.combatService.enemyList[i].speed/100);
      } else {
        //If the enemy is dead, make it's text & icon red
        if (!Array.from(this.enemyBoxes.toArray()[i].nativeElement.classList).includes('enemyHitSVG')){
            this.enemyBoxes.toArray()[i].nativeElement.classList.add('enemyHit');
            this.enemyIcons.toArray()[i].nativeElement.classList.add('enemyHitSVG');
        }
      }
    }

/****************************************************************************************
 * This is here to check the player effects list to remove any classes that may be adding
 * styles such as changing the player's health bar to green when they are poisoned.
 * 
 * When the effect is removed, if the styling class is present, it gets removed to reset
 * the view
 ****************************************************************************************/
    let effectNames = [];
    let classListArr = []
    classListArr = Array.from(this.playerHealthBar.nativeElement.classList);

    for (let i = 0; i < this.combatService.player.effects.length; i++){
      effectNames.push(this.combatService.player.effects[i].name);
    }

    if (!effectNames.includes('poison')){
      if (classListArr.includes('playerHealthBarPoison')){
        this.playerHealthBar.nativeElement.classList.remove('playerHealthBarPoison');
      }
    }

    if (effectNames.includes('rage')){
      //Disable menu selection when in rage
      this.playerCanSelectEnemy = false;

    let searchForEnemy;
    //If all enemy health is less than 0 or player health is less than 0, end the battle
    if (this.combatService.enemyHealthValues.every(isBelowThreshold) || (this.combatService.player.health < 0)){
      searchForEnemy = false;
    } else {
      searchForEnemy = true;
    }
      
      if (this.combatService.player.ATB >= 100){
        while (searchForEnemy){
            let enemyIndex = Rand.random(0, (this.combatService.enemyHealthValues.length - 1));
            if (this.combatService.enemyHealthValues[enemyIndex] > 0){
              this.selectEnemy(enemyIndex, this.enemyBoxes.toArray()[enemyIndex].nativeElement);
              setTimeout(() => {
                this.playerAttack();
              }, 500);
              searchForEnemy = false;
            }
        }
      }
    } else {
      //When the rage effect is no longer active, allow player selection of enemies again
      this.playerCanSelectEnemy = true;
    }
  }

  /****************************************************************************************
   * Stop ATB - Stops combat when player/enemy is below 0 HP
   * Resets interval & ATB gauges
   * Also used to pause combat so we don't clear ATB gauges
   ****************************************************************************************/
  stopATB(endCombat: boolean = false){

    if (endCombat){
      this.combatService.player.reset();
    }
    
    console.log("stopping combat");
    clearInterval(this.intervalID);
    this.intervalID = null;
  }

  /****************************************************************************************
   * Player Attack - Handles basic player attacks.
   * Damage is based on attack power.
   * //TODO: Defense stat
   ****************************************************************************************/
  playerAttack(){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }

    // Returns a random integer from 1-100:
    if ((Math.floor(Math.random() * 100) + 1) < this.combatService.player.accuracy){
      
      //Damage is a random number between player min attack and attack
      let dam = Rand.random(this.combatService.player.minAttack, this.combatService.player.attack);
            
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

    this.combatService.endTurn();

  }

  /****************************************************************************************
   * Use Consumable - Allows usage of a consumable item from the inventory menu
   ****************************************************************************************/
  useConsumable(numSelected){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }
    
    //Only reset the menu if the item was actually consumed
    if ((this.combatService.player.consumables[numSelected - 1].amount - 1) < 0){
      return;
    } else {
      this.combatService.player.consumables[numSelected - 1].useItem(this.combatService.player, numSelected);
      
      // Display what was used and the effect it has based on the type
      /*
      for (const [key, value] of Object.entries(this.combatService.player.consumables[numSelected - 1].effect)) {
        if (value){
            switch (key){
              case 'health':
                this.colorGameBox();
              case 'mana':
                this.appendText(`${this.combatService.player.consumables[numSelected - 1].name} used to ${value > 0 ? 'restore' : 'remove'} ${Math.abs(value)} ${key}`, true);
                this.colorGameBox(false, true, 'purpleBorder');
              break;
                
              case 'rage':
                this.appendText(`${this.combatService.player.consumables[numSelected - 1].name} has made you fly into an uncontrollable rage for ${this.combatService.player.consumables[numSelected - 1].duration - 1} turn(s)`, true, 'enemyTextRed');
              break;
                
              case 'speed':
              case 'attack':
              case 'defense':
              case 'accuracy':
              case 'luck':
                this.appendText(`${this.combatService.player.consumables[numSelected - 1].name} used to ${value > 0 ? `gain a ${key} boost` : `lower ${key}`} for ${this.combatService.player.consumables[numSelected - 1].duration - 1} turn(s)`, true);
                this.colorGameBox(false, true, 'yellowBorder');
              break;
                
              case 'poison':
                this.appendText(`You've been poisoned by ${this.combatService.player.consumables[numSelected - 1].name} for ${this.combatService.player.consumables[numSelected - 1].duration - 1} turn(s)`, true, 'greenText');
                this.colorGameBox(false, true, 'greenBorder');

                //Makes player health bar green when poisoned (when using consumable only).
                //Is removed in the main game loop in the effects loop
                this.playerHealthBar.nativeElement.classList.add('playerHealthBarPoison');
            break;
            }
        }
        // console.log(`${key}: ${value}`);
      }
      */

      this.menuBack('main');
      this.combatService.endTurn();
    }
    
  }

/****************************************************************************************
 * Use Spell - Allows usage of a spell item from the magic menu
 ****************************************************************************************/
  useSpell(numSelected){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }

    //Only reset the menu if we have enough mana to cast the spell
    if ((this.combatService.player.mana - this.combatService.player.magic[numSelected - 1].manaCost) >= 0){

      //CastSpell returns the spell damage so that we can display it here in append text //TODO: reimplement all of the appendText stuff for magic and consumable items
      let spellDamage = this.combatService.player.magic[numSelected - 1].castSpell(this.combatService.player, numSelected, this.enemyIndex, this.combatService);
      
      // Display what was used and the effect it has based on the type
      // for (const [key, value] of Object.entries(this.combatService.player.magic[numSelected - 1].effect)) {
      //   if (value){
      //       switch (key){
      //         case 'health':
      //           this.colorGameBox();
      //         case 'mana':
      //           this.appendText(`${this.combatService.player.consumables[numSelected - 1].name} used to ${value > 0 ? 'restore' : 'remove'} ${Math.abs(value)} ${key}`, true);
      //           this.colorGameBox(false, true, 'purpleBorder');
      //         break;
                
      //         case 'rage':
      //           this.appendText(`${this.combatService.player.consumables[numSelected - 1].name} has made you fly into an uncontrollable rage for ${this.combatService.player.consumables[numSelected - 1].duration - 1} turn(s)`, true, 'enemyTextRed');
      //         break;
                
      //         case 'speed':
      //         case 'attack':
      //         case 'defense':
      //         case 'accuracy':
      //         case 'luck':
      //           this.appendText(`${this.combatService.player.consumables[numSelected - 1].name} used to ${value > 0 ? `gain a ${key} boost` : `lower ${key}`} for ${this.combatService.player.consumables[numSelected - 1].duration - 1} turn(s)`, true);
      //           this.colorGameBox(false, true, 'yellowBorder');
      //         break;
                
      //         case 'poison':
      //           this.appendText(`You've been poisoned by ${this.combatService.player.consumables[numSelected - 1].name} for ${this.combatService.player.consumables[numSelected - 1].duration - 1} turn(s)`, true, 'greenText');
      //           this.colorGameBox(false, true, 'greenBorder');

      //           //Makes player health bar green when poisoned (when using consumable only).
      //           //Is removed in the main game loop in the effects loop
      //           this.playerHealthBar.nativeElement.classList.add('playerHealthBarPoison');
      //       break;
      //       }
      //   }
        // console.log(`${key}: ${value}`);
      // }

      this.menuBack('main');
      this.combatService.endTurn();
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
      let dam = Rand.random(enemy.minAttack, enemy.attack);

      this.combatService.player.health -= dam;
      if (enemy.health !== 0){ 
        this.appendText(enemy.name +  ' hits for ' + dam + ' damage!', true, 'enemyTextGrey');         
        this.colorGameBox();
      }

      /*Kill the enemy once the final attack has happened*/
      if (enemy.health === 0){
        this.appendText(enemy.name +  ' at near death attempts one final attack before perishing and hits for ' + dam + ' damage!', true, 'enemyTextRed'); 
        this.colorGameBox();
        enemy.health -= 1; 
        this.previousTarget.classList.add('enemyHit');
      }
      
    } else {
      if (enemy.health !== 0){this.appendText(enemy.name + ' miss!', true, 'enemyTextGrey'); }
      if (enemy.health === 0){ this.appendText(enemy.name + ' at near death attempts one final attack before perishing and misses!', true, 'enemyTextRed'); enemy.health -= 1; /*Kill the enemy once the final attack has happened*/ }
    }

    //If the player or the enemy is at 0 hit points, they get one
    //last attack before dying. (Only attack, not action)
    //If hit again before the last attack, combat ends
    if (enemy.health === 0){
      this.stopATB(); 
    }

    this.combatService.endEnemyTurn(index);
  }

  /****************************************************************************************
   * Player Takes Damage - Makes the game window flash red if the player is hit. Stays red
   * if player is dead
   ****************************************************************************************/
  colorGameBox(playerTakesDamage: boolean = true, useItem: boolean = false, className: string = null){

    if (playerTakesDamage){
      this.gameBox.forEach((e) => {
        e.nativeElement.classList.add('playerHit');
      });
      
      //If you are not dead, flash red to show damage was taken
      if (this.combatService.player.health > 0){
      setTimeout(() => {
          this.gameBox.forEach((e) => {
            e.nativeElement.classList.remove('playerHit');
          });
        }, 225);
      }
    }

    if (useItem){
      this.gameBox.forEach((e) => {
        e.nativeElement.classList.add(className);
      });
      
      //If you are not dead, flash red to show damage was taken
      setTimeout(() => {
          this.gameBox.forEach((e) => {
            e.nativeElement.classList.remove(className);
          });
        }, 225);
    }
  }

  /****************************************************************************************
   * Select Enemy - Allows you to select which enemy to attack. Clicking anywhere
   * on the enemy box selects them.
   ****************************************************************************************/
  selectEnemy(index, target){
    
    this.enemyIndex = index;
    
    //If we select the label, hp value, or image in the enemy box,
    //set the target to the parent to actually select the enemy
    if (target.innerHTML.charAt(0) !== '<'){
      target = target.parentNode;
    }

    if (this.previousTarget !== null){ this.previousTarget.classList.remove('enemySelected'); }
    this.selectedEnemy = this.combatService.enemyList[index];
    this.enemyForm.controls.enemySelected.setValue(index);
    target.classList.add('enemySelected');
    this.previousTarget = target;
  }

}
