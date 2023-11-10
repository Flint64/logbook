import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-category',
  templateUrl: './select-category.component.html',
  styleUrls: ['./select-category.component.scss']
})
export class SelectCategoryComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<SelectCategoryComponent>) { }

  equipmentCategories: object[] = [
  {value: 'Bracer', displayName: 'Bracers', },
  {value: 'Helm', displayName: 'Helms', },
  {value: 'Chestplate', displayName: 'Chestplates', },
  {value: 'Pants', displayName: 'Pants', },
  {value: 'Greaves', displayName: 'Greaves', },
  {value: 'Weapon', displayName: 'Weapons', },
  {value: 'Trinket', displayName: 'Trinkets'}
  ]
  
  ngOnInit(): void {
  }

  selectCategory(category){
    this.dialogRef.close(category);
  }

  onClose(){
    this.dialogRef.close();
}
  
}
