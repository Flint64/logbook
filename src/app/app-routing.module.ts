import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CombatTestComponent } from './components/combat-test/combat-test.component';
import { HomeComponent } from './components/home/home.component';
import { SacrificeComponent } from './components/sacrifice/sacrifice.component';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [

  // { path: '', redirectTo: '/', pathMatch: 'full', component: HomeComponent},
  { path: '', pathMatch: 'full', component: HomeComponent},
  
  { path: 'sacrifice', component:  SacrificeComponent },
  { path: 'combat-test', component:  CombatTestComponent },
  { path: 'main', component:  MainComponent },

  { path: '**', redirectTo: '/' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
