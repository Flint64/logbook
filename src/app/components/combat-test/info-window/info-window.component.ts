import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Magic } from 'src/app/models/magic.model';

@Component({
  selector: 'app-info-window',
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.scss']
})
export class InfoWindowComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<InfoWindowComponent>) { }

  dataIsMagic: boolean = false;
  
  ngOnInit(): void {
    this.dataIsMagic = this.data instanceof Magic;
  }

  onClose(){
      this.dialogRef.close();
  }

}
