import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Enemy } from 'src/app/models/enemy.model';
import { Player } from 'src/app/models/player.model';
import { HostListener } from '@angular/core';
import { Item } from 'src/app/models/item.model';
import { CombatService } from 'src/app/services/combat.service';

@Component({
  selector: 'app-combat-test',
  templateUrl: './combat-test.component.html',
  styleUrls: ['./combat-test.component.scss']
})


export class CombatTestComponent implements OnInit, OnDestroy {
  
  @ViewChild('story', {static: false}) story: ElementRef;
  keyListener = null;

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) {
    // if (this.viewingMainOptions){

      // if (parseInt(event.key) >= 0 || parseInt(event.key) >= 9){
        // console.log(this.combatService.)
      // }
      
      // switch(event.key){
      //   case "1": 
      //     this.combatService.playerAttack();
      //   break;
  
      //   case "2": 
      //     this.magick();
      //   break;
  
      //   case "3": 
      //     this.inventory();
      //   break;
  
      //   case "4": 
      //     if (this.intervalID !== null){
      //       this.stopATB();
      //     } else {
      //       this.startCombat();
      //     }
      //   break;
      // } 
    // }

    // if (this.viewingMagicOptions){
      // switch(event.key){
      //   case "1":
      //     this.menuBack('main');
      //   break;
      //   } 
    // }

    // if (this.viewingInventoryOptions){
    //   switch(event.key){
    //     case "1":
    //       this.menuBack('main');
    //     break;
    //     } 
    // }
    
  // }

  selectedEnemy: Enemy = null;
  key = null;

  // test: Enemy = {health: 20, attack: 5, defense: 5, speed: 30, mana: 10, accuracy: 60, luck: 2}

  enemyForm: FormGroup;
  previousTarget = null;

  intervalID = null;

  menuOptions = [];

  viewingMainOptions: boolean = true;
  viewingMagicOptions: boolean = false;
  viewingInventoryOptions: boolean = false;
  
  constructor(public combatService: CombatService, renderer: Renderer2) {
    if (!this.keyListener){
      this.keyListener = renderer.listen('document', 'keypress', (e) => {
        if (parseInt(e.key) >= 0 || parseInt(e.key) >= 9 ){
          
          let numSelected = parseInt(e.key);
          this.optionSelected(numSelected);
          
          //When we're one past the number of menu options pause/resume combat
          if (parseInt(e.key) === combatService.mainMenuOptions.length + 1){
            if (this.intervalID !== null){
              this.stopATB();
            } else {
              this.startCombat();
            }
          }
        }

        //0 is reserved for something else unknown as of yet
        // if (parseInt(e.key) === 0){
        //   // set 0 equal to 9 here
        // }

      });
   }
  }

  optionSelected(numSelected: number){
    try {
      switch(this.combatService.mainMenuOptions[numSelected - 1]['name']){

          case 'Attack':
            this.combatService.mainMenuOptions[numSelected - 1]['func'](this.selectedEnemy);
          break;

          case 'Magic':
          case 'Inventory':
            this.combatService.mainMenuOptions[numSelected - 1]['func']();
            break;
            
            case 'Test':
              this.combatService.mainMenuOptions[numSelected - 1]['func']('GAAAAAAAAH!!');
          break;
        }

      } catch (error) {
        //Do nothing if func is undefined
      }
  }


  ngOnInit(): void {

    this.menuOptions = this.combatService.mainMenuOptions;

    this.enemyForm = new FormGroup({
      'enemySelected': new FormControl(null)
    });

    let t = new Item('Healing Potion', 1);
    let p = new Item('Mana Potion', 1);
    this.combatService.player.inventory.push(t);
    this.combatService.player.inventory.push(p);

    // console.log(this.combatService.player.inventory[0][0] + ' - ' + this.combatService.player.inventory[0][1]);
    // console.log(this.combatService.player.inventory[1][0] + ' - ' + this.combatService.player.inventory[1][1]);
    
  }

  ngOnDestroy(): void {
    this.keyListener();
  }

  appendText(text, newline: boolean = false){
    if (newline){this.story.nativeElement.innerHTML +='<br>'}
    this.story.nativeElement.innerHTML += text;
    this.story.nativeElement.scrollTo(0, this.story.nativeElement.scrollHeight);
  }

  startCombat(){

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
    
    if (!this.intervalID){
      console.log("starting combat");
      this.intervalID = setInterval( () => this.incrementATB(), 100 );
    }
  }

  incrementATB(){

    const isBelowThreshold = (currentValue) => currentValue < 0;

    const enemyHealth = [];
    this.combatService.enemyList.forEach((e) => {enemyHealth.push(e.health)});
    
    //If all enemy health is less than 0 or player health is less than 0, end the battle
    if (enemyHealth.every(isBelowThreshold) || (this.combatService.player.health < 0)){
      this.stopATB();
    }
    
    //When ATB guage is full, allow player attack
    if (this.combatService.player.ATB >= 100){
      // this.combatService.playerAttack();
    }

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

  //Stops combat when player/enemy is below 0 HP
  //Resets interval & ATB guages
  //Also used to pause combat, so we don't clear the ATB guages
  stopATB(){
    console.log("stopping combat");
    clearInterval(this.intervalID);
    this.intervalID = null;
  }

  //Attack is based on hit chance with their accuracy.
  //Damage is based on attack power
  //TODO: Defense stat
  playerAttack(){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }
    
    // Returns a random integer from 1-100:
    if ((Math.floor(Math.random() * 100) + 1) < this.combatService.player.accuracy){
      let dam = Math.floor(Math.random() * this.combatService.player.attack + 1);
      this.selectedEnemy.health -= dam;
      if (this.combatService.player.health !== 0){ this.appendText('PLAYER hit for ' + dam + ' damage!', true); }
      if (this.combatService.player.health === 0){ this.appendText('PLAYER at near death attempts one final attack before perishing and hits for ' + dam + ' damage!', true) }
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

    //Reset ATB guage to -10 to display
    //empty guage instead of partially
    //filled due to interval counter
    //never stopping
    this.combatService.player.ATB = -10;
  }

  magick(){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }
    this.viewingMainOptions = false;
    this.viewingMagicOptions = true;
    this.viewingInventoryOptions = false;
  }

  inventory(){
    if (this.combatService.player.ATB < 100 || this.intervalID === null){
      return;
    }
    this.viewingMainOptions = false;
    this.viewingMagicOptions = false;
    this.viewingInventoryOptions = true;
  }

  menuBack(ref){
    switch(ref){
      case "main":
        this.viewingMainOptions = true;
        this.viewingMagicOptions = false;
        this.viewingInventoryOptions = false;
      break;
    }
  }

  //Attack is based on hit chance with their accuracy.
  //Damage is based on attack power
  //TODO: Defense stat
  enemyAttack(index){

    let enemy = this.combatService.enemyList[index];

    if ((Math.floor(Math.random() * 100) + 1) < enemy.accuracy){
      let dam = Math.floor(Math.random() * enemy.attack + 1);
      this.combatService.player.health -= dam;
      if (enemy.health !== 0){ this.appendText(enemy.name +  ' hits for ' + dam + ' damage!', true); }
      if (enemy.health === 0){ this.appendText(enemy.name +  ' at near death attempts one final attack before perishing and hits for ' + dam + ' damage!', true); enemy.health -= 1; /*Kill the enemy once the final attack has happened*/ }
    } else {
      if (enemy.health !== 0){this.appendText(enemy.name + ' miss!', true); }
      if (enemy.health === 0){ this.appendText(enemy.name + ' at near death attempts one final attack before perishing and misses!', true); enemy.health -= 1; /*Kill the enemy once the final attack has happened*/ }
    }

    //If the player or the enemy is at 0 hit points, they get one
    //last attack before dying. (Only attack, not action)
    //FIXME: With current setup, if hit again before the last attack, combat ends
    if (enemy.health === 0){
      this.stopATB(); 
    }

    //Reset ATB guage to -10 to display
    //empty guage instead of partially
    //filled due to interval counter
    //never stopping
    this.combatService.enemyATBValues[index] = -10;
  }

  //Allows you to select which enemy to attack. Clicking anywhere
  //on the enemy box selects them
  selectEnemy(index, target){
    if (this.previousTarget !== null){ this.previousTarget.classList.remove('enemySelected'); }
    this.selectedEnemy = this.combatService.enemyList[index];
    this.enemyForm.controls.enemySelected.setValue(index);
    target.classList.add('enemySelected');
    this.previousTarget = target;
  }

}
