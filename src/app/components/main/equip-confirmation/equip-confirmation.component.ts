import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-equip-confirmation',
  templateUrl: './equip-confirmation.component.html',
  styleUrls: ['./equip-confirmation.component.scss']
})
export class EquipConfirmationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EquipConfirmationComponent>) { }

  ngOnInit(): void {
    // console.log(this.data.data)
  }

  onClose(itemEquipped: boolean){
    this.dialogRef.close(itemEquipped);
}

}
