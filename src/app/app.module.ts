import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SacrificeComponent } from './components/sacrifice/sacrifice.component';
import { HomeComponent } from './components/home/home.component';
import { CombatTestComponent } from './components/combat-test/combat-test.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { InfoWindowComponent } from './components/combat-test/info-window/info-window.component';
import { LongPressDirective } from './directives/long-press.directive';
import { MainComponent } from './components/main/main.component';
import { EquipmentFilterPipe } from './pipes/equipment-filter.pipe';
import { CapitalSplitPipe } from './pipes/capital-split.pipe';
import { ConsumableFilterPipe } from './pipes/consumable-filter.pipe';
import { SelectCategoryComponent } from './components/main/select-category/select-category.component';
import { EquipConfirmationComponent } from './components/main/equip-confirmation/equip-confirmation.component';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    AppComponent,
    SacrificeComponent,
    HomeComponent,
    CombatTestComponent,
    InfoWindowComponent,
    LongPressDirective,
    MainComponent,
    EquipmentFilterPipe,
    CapitalSplitPipe,
    ConsumableFilterPipe,
    SelectCategoryComponent,
    EquipConfirmationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatIconModule,
    MatDialogModule,
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
