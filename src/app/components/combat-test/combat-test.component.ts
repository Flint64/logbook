import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Enemy } from 'src/app/models/enemy.model';
import { ConsumableItem } from 'src/app/models/consumableItem.model';
import { CombatService } from 'src/app/services/combat.service';
import { Effect } from 'src/app/models/effect.model';
import _ from 'lodash';
import { Magic } from 'src/app/models/magic.model';
import { MatDialog } from '@angular/material/dialog';
import { InfoWindowComponent } from './info-window/info-window.component';
import { enemies } from './enemyList';
import { potions } from './potionList';
import { spells } from './spellList';
import { helms, chestplates, pants, bracers, greaves, weapons, trinkets } from './equipmentList';
import { Player } from 'src/app/models/player.model';
import { EquippableItem, Bracer, Helm, Chestplate, Pants, Greaves, Weapon, Trinket} from 'src/app/models/equippableItem.model';
//ng deploy --base-href=https://flint64.github.io/logbook/

@Component({
  selector: 'app-combat-test',
  templateUrl: './combat-test.component.html',
  styleUrls: ['./combat-test.component.scss']
})


export class CombatTestComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('story', {static: false}) story: ElementRef;
  @ViewChildren('memberBoxes') memberBoxes: QueryList<ElementRef>;
  @ViewChildren('enemyBoxes') enemyBoxes: QueryList<ElementRef>;
  @ViewChildren('enemyIcons') enemyIcons: QueryList<ElementRef>;
  @ViewChildren('gameBox') gameBox: QueryList<ElementRef>;
  keyListener = null;

  selectedEnemy: Enemy = null;
  selectedPartyMember: Player = null;

  selectingSpellOrConsumableTarget: boolean = false;
  selectedSpellOrConsumableTarget: Player | Enemy = null;
  consumableIsThrowable: boolean = false;
  spellCanTargetEnemies: boolean = false;
  selectedConsumableItem: ConsumableItem = null;
  selectedSpell: Magic = null;

  enemyIndex: number = null;
  memberIndex: number = null;

  enemyForm: FormGroup;
  partyForm: FormGroup;

  previousTarget = null;
  previousPartyMember = null;

  intervalID = null;
  helpText_inventory: string = 'Not sure what an item does? You can long press any item to view its details.';
  helpText_magic: string = 'Not sure what a spell does? You can long press any spell to view its details.'

  showEnemyATB: boolean = true;
  showEnemyHP: boolean = true;


  //These items in this list HAVE to match those in the switch
  //in the optionSelected function or else they are inaccessible.
  mainMenuOptions = ['Attack', 'Magick', 'Potions'];

  viewingMainOptions: boolean = true;
  viewingMagicOptions: boolean = false;
  viewingInventoryOptions: boolean = false;
  
  constructor(public combatService: CombatService, private renderer: Renderer2, private dialog: MatDialog) {
    if (!this.keyListener){
      this.keyListener = renderer.listen('document', 'keypress', (e) => {
        if (parseInt(e.key) >= 0 || parseInt(e.key) >= 9 ){
          let numSelected = parseInt(e.key);
          this.optionSelected(numSelected);
        }

        //If spacebar is pressed, allow pausing if viewingMainOptions as if you had pressed 4 / clicked pause
        if (e.key === ' '){
          if (this.intervalID && this.viewingMainOptions){
            this.stopATB();
          } else if (!this.intervalID && this.viewingMainOptions){
            this.startCombat();
          }
        }

      });
   }   
  }
  
  ngOnInit(): void {  
    //Converts the enemy list into actual Enemy objects
    let convertedEnemyList: Enemy[] = enemies.map(enemyData => new Enemy(enemyData));
    console.log(convertedEnemyList);
    
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
    console.log(this.combatService.party.inventory);
    
    this.enemyForm = new FormGroup({
      'enemySelected': new FormControl(null)
    });

    this.partyForm = new FormGroup({
      'memberSelected': new FormControl(null)
    });

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
    
    //Auto-start combat
    this.enemyForm.controls.enemySelected.setValue(0);
    this.startCombat(true);
    this.stopATB();
    
  }

  ngAfterViewInit(): void {
    // Allows selection of the first enemy & party member to allow auto-start of combat
    this.selectEnemy(0);
    this.enemyIndex = 0;
    
    this.selectPartyMember(0);
    this.memberIndex = 0;

    this.calcMemberBoxWidth();

  }

  ngOnDestroy(): void {
    this.keyListener();
  }

  //Calculates the width of the party member info box if there are 1, 2, or 3 party members.
  //Should be called any time the party formation changes.
  calcMemberBoxWidth(){
    let numPartyMembers = this.memberBoxes.toArray().length;
    switch (numPartyMembers){
      case 1:
        this.memberBoxes.toArray().forEach(e => {
          e.nativeElement.classList.add('partyOfOne');
          e.nativeElement.classList.remove('partyOfTwo');
          e.nativeElement.classList.remove('partyOfThree');
        });
      break;

      case 2:
        this.memberBoxes.toArray().forEach(e => {
          e.nativeElement.classList.add('partyOfTwo');
          e.nativeElement.classList.remove('partyOfOne');
          e.nativeElement.classList.remove('partyOfThree');
        });
      break;

      case 3:
        this.memberBoxes.toArray().forEach(e => {
          e.nativeElement.classList.add('partyOfThree');
          e.nativeElement.classList.remove('partyOfTwo');
          e.nativeElement.classList.remove('partyOfOne');
        });
      break;
    }
  }
  
  openHelpWindow(data: any): void {
    if (this.intervalID !== null){ this.stopATB(); }

    const dialogRef = this.dialog.open(InfoWindowComponent, {
        panelClass: 'custom-dialog-container',
        width: '30rem',
        height: '20rem',
        data: {helpText: data},
        backdropClass: 'backdropBackground',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe(result => {
          if (this.intervalID === null){ this.startCombat(); }
      });
  }

  openInfoWindow(data: ConsumableItem | Magic): void {
    if (this.intervalID !== null){ this.stopATB(); }

      const dialogRef = this.dialog.open(InfoWindowComponent, {
        panelClass: 'custom-dialog-container',
        width: '30rem',
        height: '20rem',
        data: data,
        backdropClass: 'backdropBackground',
        disableClose: true,
      });
    
      dialogRef.afterClosed().subscribe(result => {
          if (this.intervalID === null){ this.startCombat(); }
      });
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
            if (this.selectedPartyMember.ATB < 100 || this.intervalID === null){ return; }

            //true if the attack hits, false if it was a miss
            if (this.selectedPartyMember.playerAttack(this.selectedEnemy, this.intervalID, this.appendText.bind(this), this.combatService.party.inventory)){
              this.colorEnemyBox('enemyHitSVG', 'enemyHit', 'enemyHitBorder');
            }
            this.combatService.endTurn(this.selectedPartyMember);
          break;

          case 'Magick':
            this.magick();
          break;

          case 'Potions':
            this.inventory();
          break;
        }
      } else if (this.viewingMagicOptions){
        
        //Prevent keyboard selection breaking due to missing index
        if (numSelected > this.combatService.party.members[this.memberIndex].magic.length + 1){
          return;
        }
        if (this.viewingMagicOptions && numSelected === this.combatService.party.members[this.memberIndex].magic.length + 1){
          // Go back to main menu
          this.menuBack('main');
        } else {
        this.useSpell(numSelected);
      }
        

      } else if (this.viewingInventoryOptions){
        if (this.viewingInventoryOptions && numSelected === this.combatService.party.consumables.length + 1){
          // Go back to main menu
          this.menuBack('main');
        } else {
          this.useConsumable(numSelected); 
        }
      } else if (this.selectedConsumableItem && numSelected === 1){
        this.menuBack('inventory');
      } else if (this.selectedSpell && numSelected === 1){
        this.menuBack('magic');
      }


      } catch (error) {
        //Do nothing if func is undefined
      }
  }

  /****************************************************************************************
   * Append Text - Appends text to the story box whenever an attack is made, etc
   ****************************************************************************************/
  appendText(text: string, newline: boolean = false, className: string = null, className2: string = null){

    //Use renderer instead of docuoment.createElement so that the view encapsulation works to apply styles correctly
    let child = this.renderer.createElement('span');
    let lineBreak = document.createElement('br');
    if (className){child.classList.add(className);}
    if (className2){child.classList.add(className2);}
    child.innerText = text;
    
    if (newline){this.story.nativeElement.appendChild(lineBreak)};
    this.story.nativeElement.appendChild(child)
    this.story.nativeElement.scrollTo(0, this.story.nativeElement.scrollHeight);
  }

  /****************************************************************************************
   * Start Combat - Starts combat and handles starting enemy ATB gauges at different
   * values to shake up combat a bit
   ****************************************************************************************/
  startCombat(setEnemyATB: boolean = false){
    if (this.enemyForm.controls.enemySelected.value === null){
      return;
    }

    if (setEnemyATB){
    // When starting combat, create a value to bind to each invididual enemy ATB guage
      this.combatService.enemyList.forEach((e) => {
        let num = Math.floor(Math.random() * 25) + 1; // this will get a number between 1 and 25;
        num *= Math.round(Math.random()) ? 1 : -1; // this will add minus sign in 50% of cases

        //Enemies will have a chance to start battle with their ATB guage anywhere from
        //half filled  to negative half filled to stagger their attack times a bit. 
        e.ATB = num;
      });
    }
    
    //Handles initially starting combat & resuming from pausing
    if (!this.intervalID){
      console.log("starting combat");
      this.intervalID = setInterval( () => this.incrementATB(), 25 );
    }    
  }

  /****************************************************************************************
   * Increment ATB - The main game loop that handles incrememting the ATB gauges
   ****************************************************************************************/
  incrementATB(){

    this.combatService.enemyHealthValues = [];
    this.combatService.memberHealthValues = [];
    const isBelowThreshold = (currentValue) => currentValue < 0;
    const isAboveThreshold = (currentValue) => currentValue > 100; //Not currently used, can be used for a team attack or something though to make sure each party member is able to act

    //Fill an array that only holds party/enemy health values to check each one to know if we should end combat or not
    this.combatService.enemyList.forEach((e) => {this.combatService.enemyHealthValues.push(e.health)});
    this.combatService.party.members.forEach((e) => {this.combatService.memberHealthValues.push(e.health)});
    
    //If all party or enemy health is less than 0, end the battle
    if (this.combatService.enemyHealthValues.every(isBelowThreshold) || this.combatService.memberHealthValues.every(isBelowThreshold)){
      //settimeout here for any color effects to be removed when combat ends 
      //(normally they are removed 100ms after being applied, but when combat ends abruptly they stick around)
      setTimeout(() => {
        this.stopATB(true);
      }, 115);
    }

    //When ATB guage is full, enemy attack
    this.combatService.enemyList.forEach((e, index) => {
      if (e.ATB >= 100){
        let res = null;

        if (e.numAttacks > 1){
          for (let i = 0; i < _.random(1, e.numAttacks); i++){
              setTimeout(() => {
              let result = e.enemyAttack(this.combatService.party.members, this.appendText.bind(this), this.combatService.party.inventory);
              res = result;
              if (result.attackHits){
                this.colorPlayerBox(result.playerTargetIndex, 'enemyHit', 'enemyHitBorder');
              }
            }, _.random(300, 1000));
            }
         } else {
           let result = e.enemyAttack(this.combatService.party.members, this.appendText.bind(this), this.combatService.party.inventory);
           res = result;
           if (result.attackHits){
             this.colorPlayerBox(result.playerTargetIndex, 'enemyHit', 'enemyHitBorder');
           }
         }
         if (res?.recoveryPeriod){
           this.combatService.endEnemyTurn(e, res.recoveryPeriod);
          } else {
           this.combatService.endEnemyTurn(e, null);
         }
      }
    });
    
    //Increment each individual party member's ATB guage if they have health remaining
    this.combatService.party.members.forEach((member, index) => {
      if (member.health >= 0){
        if (member.ATB > 100){
          //Do nothing if ATB is greater than 100 to prevent the numbers from overflowing
        } else {
          member.ATB += (member.calcTotalStatValue('speed', null, this.combatService.party.inventory)/100);
        }
      } else {
        //If the player is dead, make it's text & icon red. Only add the red filter if the class isn't in place already
        if (!Array.from(this.memberBoxes.toArray()[index].nativeElement.classList).includes('playerHit')){
            this.memberBoxes.toArray()[index].nativeElement.classList.add('playerHit');
        }
      }
    });
    
    //Increment each individual enemy's ATB guage if they have health remaining
    this.combatService.enemyList.forEach((enemy, index) => {
      if (enemy.health >= 0){
        enemy.ATB += (enemy.calcTotalStatValue('speed', null)/100);
      } else {
        //If the enemy is dead, make it's text & icon red. Only add the red filter if the class isn't in place already
        if (!Array.from(this.enemyBoxes.toArray()[index].nativeElement.classList).includes('enemyHitSVG')){
            this.enemyBoxes.toArray()[index].nativeElement.classList.add('enemyHit');
            this.enemyIcons.toArray()[index].nativeElement.classList.add('enemyHitSVG');
        }
      }
    });

/****************************************************************************************
 * This section here handles a party member with the rage status effect. It prevents
 * them from selecting an enemy to attack and forces them to use basic attacks for
 * the duration of the effect.
****************************************************************************************/    
    this.combatService.party.members.forEach((member) => {
      if (member.effects.find(({ name }) => name === "rage")){
        member.canSelectEnemy = false;
        
        if (member.ATB > 100){
          // If our ATB gauge is full and we have the rage effect active, auto attack
          let rand = _.random(0, (this.combatService.enemyList.length - 1));
        
          //Keep selecting a random enemy until one is selected that isn't dead
          while(this.combatService.enemyList[rand].health < 0){ rand = _.random(0, (this.combatService.enemyList.length - 1)); }

          if (member.playerAttack(this.combatService.enemyList[rand], this.intervalID, this.appendText.bind(this), this.combatService.party.inventory)){
            this.colorEnemyBox('enemyHitSVG', 'enemyHit', 'enemyHitBorder');
          }
          this.combatService.endTurn(member);
        }

      } else {
        member.canSelectEnemy = true;
      }
    });
  }

  /****************************************************************************************
   * Check Status - Used in the template to check for status effects and display the 
   * correct status in the player/enemy box
   ****************************************************************************************/  
  checkStatus(target: Player | Enemy, statusName: string): boolean{
    let status = target.effects.find(({ name }) => name === statusName);
    //Only display that we have a positive modifier for
    if (status && status.modifier > 0){
      return true;
    }
  }

  /****************************************************************************************
   * Stop ATB - Stops combat when player/enemy is below 0 HP
   * Resets interval & ATB gauges
   * Also used to pause combat so we don't clear ATB gauges
   ****************************************************************************************/
  stopATB(endCombat: boolean = false){
    if (!this.intervalID){ return; }

    if (endCombat){
      this.combatService.party.members.forEach(member => {
        member.reset();
      });
    }

    console.log("stopping combat");
    clearInterval(this.intervalID);
    this.intervalID = null;

  }


  /****************************************************************************************
   * Use Consumable - Allows usage of a consumable item from the inventory menu
   ****************************************************************************************/
  async useConsumable(numSelected){

    if ((this.combatService.party.members[this.memberIndex].ATB < 100 || this.intervalID === null) && (this.combatService.party.consumables[numSelected - 1].amount - 1) < 0){
      return;
    }

  /*
    You've chosen to use a consumable item, which means we now wait for a target
    to be selected before moving on and ending your turn.
  */
  this.selectingSpellOrConsumableTarget = true;
  this.selectedSpell = null;
  if (this.combatService.party.consumables[numSelected - 1].thrown){ this.consumableIsThrowable = true; }
  this.viewingInventoryOptions = false;
  this.selectedConsumableItem = this.combatService.party.consumables[numSelected - 1];

  // Wait until this.selectedSpellOrConsumableTarget is assigned a value
  while (!this.selectedSpellOrConsumableTarget && this.selectingSpellOrConsumableTarget) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Delay before checking again
  }
  
  //Prevent this from firing if we cancel out of selecting a target for an item by using the back button
  if (this.selectedSpellOrConsumableTarget){
    this.menuBack('main');
    this.combatService.party.consumables[numSelected - 1].useItem(this.selectedPartyMember, this.selectedSpellOrConsumableTarget, this.combatService.party.inventory, this.appendText.bind(this));
    this.combatService.endTurn(this.selectedPartyMember);
    this.selectedSpellOrConsumableTarget = null;
    this.selectedConsumableItem = null;
  }
    
      
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
    // }
    
  }

/****************************************************************************************
 * Use Spell - Allows usage of a spell item from the magic menu
 ****************************************************************************************/
  async useSpell(numSelected){
    
    if ((this.combatService.party.members[this.memberIndex].ATB < 100 || this.intervalID === null) && (this.combatService.party.consumables[numSelected - 1].amount - 1) < 0){
      return;
    }

  /*
    You've chosen to use a consumable item, which means we now wait for a target
    to be selected before moving on and ending your turn.
  */
  this.selectingSpellOrConsumableTarget = true;
  this.selectedConsumableItem = null;
  if (this.combatService.party.members[this.memberIndex].magic[numSelected - 1].canTargetEnemies){ this.spellCanTargetEnemies = true; }
  this.viewingMagicOptions = false;
  this.selectedSpell = this.combatService.party.members[this.memberIndex].magic[numSelected - 1];

  // Wait until this.selectedSpellOrConsumableTarget is assigned a value
  while (!this.selectedSpellOrConsumableTarget && this.selectingSpellOrConsumableTarget) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Delay before checking again
  }
  
  //Prevent this from firing if we cancel out of selecting a target for an item by using the back button
  if (this.selectedSpellOrConsumableTarget){
    this.menuBack('main');


    let playerTarget = this.combatService.party.members[this.memberIndex];
    playerTarget.magic[numSelected - 1].castSpell(playerTarget, this.selectedSpellOrConsumableTarget, this.appendText.bind(this), this.combatService.party.inventory);
    this.combatService.endTurn(this.selectedPartyMember);
    this.selectedSpellOrConsumableTarget = null;
    this.selectedConsumableItem = null;
  }
      
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
  }
  

/****************************************************************************************
 * Magick - Handles selecting the magic option during combat. Displays spell list
 ****************************************************************************************/
  magick(){
    if (this.combatService.party.members[this.memberIndex].ATB < 100 || this.intervalID === null){
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
    if (this.combatService.party.members[this.memberIndex].ATB < 100 || this.intervalID === null){
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
    //If we were selecting a target for a consumable item and go back a menu to
    //cancel it, prevent using the item
    if (this.selectingSpellOrConsumableTarget){ this.selectingSpellOrConsumableTarget = false; this.selectedSpellOrConsumableTarget = null; this.consumableIsThrowable = false; this.selectedConsumableItem = null; this.spellCanTargetEnemies = false; this.selectedSpell = null;}
    
    switch(ref){
      case "main":
        this.viewingMainOptions = true;
        this.viewingMagicOptions = false;
        this.viewingInventoryOptions = false;
      break;
      case "inventory":
        this.viewingMainOptions = false;
        this.viewingMagicOptions = false;
        this.viewingInventoryOptions = true;
      break;
      case "magic":
        this.viewingMainOptions = false;
        this.viewingMagicOptions = true;
        this.viewingInventoryOptions = false;
      break;
    }
  }

  /****************************************************************************************
   * Player Takes Damage - Makes the game window flash red if the player is hit. Stays red
   * if player is dead
   ****************************************************************************************/
  // colorGameBox(playerTakesDamage: boolean = true, useItem: boolean = false, className: string = null){

  //   if (playerTakesDamage){
  //     this.gameBox.forEach((e) => {
  //       e.nativeElement.classList.add('playerHit');
  //     });
      
  //     //If you are not dead, flash red to show damage was taken
  //     if (this.combatService.party.members[this.memberIndex].health > 0){ //Make this check each member, not just the currently selected one
  //     setTimeout(() => {
  //         this.gameBox.forEach((e) => {
  //           e.nativeElement.classList.remove('playerHit');
  //         });
  //       }, 225);
  //     }
  //   }

  //   if (useItem){
  //     this.gameBox.forEach((e) => {
  //       e.nativeElement.classList.add(className);
  //     });
      
  //     //If you are not dead, flash red to show damage was taken
  //     setTimeout(() => {
  //         this.gameBox.forEach((e) => {
  //           e.nativeElement.classList.remove(className);
  //         });
  //       }, 225);
  //   }
  // }

  /****************************************************************************************
   * Color Enemy Box - Makes enemy box flash if the player is hit. Stays red
   * if player is dead
   ****************************************************************************************/
  colorEnemyBox(filterColor: string, textColor: string, borderColor: string){
    this.enemyIcons.toArray()[this.enemyForm.controls.enemySelected.value].nativeElement.classList.add(filterColor);
    this.previousTarget.classList.add(textColor);
    this.previousTarget.classList.add(borderColor);

    // If enemy is not dead, flash red to show damage was taken
    setTimeout(() => {
        this.enemyIcons.toArray()[this.enemyForm.controls.enemySelected.value].nativeElement.classList.remove(filterColor);
        this.previousTarget.classList.remove(textColor);
        this.previousTarget.classList.remove(borderColor);
    }, 100);
  }

  /****************************************************************************************
   * Color Player Box - Makes player box flash if the player is hit. Stays red
   * if player is dead
   ****************************************************************************************/
  colorPlayerBox(playerTargetIndex, textColor: string, borderColor: string){
    this.memberBoxes.toArray()[playerTargetIndex].nativeElement.classList.add(textColor);
    this.memberBoxes.toArray()[playerTargetIndex].nativeElement.classList.add(borderColor);

    // If player is not dead, flash red to show damage was taken
    setTimeout(() => {
      this.memberBoxes.toArray()[playerTargetIndex].nativeElement.classList.remove(textColor);
      this.memberBoxes.toArray()[playerTargetIndex].nativeElement.classList.remove(borderColor);
    }, 100);
  }

  /****************************************************************************************
   * Select Enemy - Allows you to select which enemy to attack. Clicking anywhere
   * on the enemy box selects them.
   ****************************************************************************************/
  selectEnemy(index){

    //Disallow selecting an enemy if we're currently picking a party member to use a consumable item on
    //Selected consumable has to have the 'thrown' property or else it can't be used on an enemy
    if ((this.selectingSpellOrConsumableTarget && this.consumableIsThrowable) || (this.selectingSpellOrConsumableTarget && this.spellCanTargetEnemies)){
      if (this.selectedSpell && !this?.selectedSpell.canTargetEnemies){
        return;
      }
      
      this.selectingSpellOrConsumableTarget = false;
      this.consumableIsThrowable = false;
      this.spellCanTargetEnemies = false;
      this.selectedSpellOrConsumableTarget = this.combatService.enemyList[index];
      return;
    }
    
    this.enemyIndex = index;
    if (this.previousTarget !== null){ this.previousTarget.classList.remove('enemySelected'); }
    this.selectedEnemy = this.combatService.enemyList[index];
    this.enemyForm.controls.enemySelected.setValue(index);
    this.enemyBoxes.toArray()[index].nativeElement.classList.add('enemySelected');
    this.previousTarget = this.enemyBoxes.toArray()[index].nativeElement;
  }

  /****************************************************************************************
   * Select Party Member - Allows you to select which party member to use their turn with. 
   * Clicking anywhere on the enemy box selects them.
   ****************************************************************************************/
  selectPartyMember(index){

    //Disallow selecting party members if we're currently picking a party member to use a consumable item on
    if (this.selectingSpellOrConsumableTarget){
      if (this.selectedSpell && !this?.selectedSpell.canTargetParty){
        return;
      }
      this.selectingSpellOrConsumableTarget = false;
      this.consumableIsThrowable = false;
      this.spellCanTargetEnemies = false;
      this.selectedSpellOrConsumableTarget = this.combatService.party.members[index];
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
