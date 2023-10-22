import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  pathsVisible: boolean = false;

  constructor(private loaderService: LoaderService) { }

  ngOnInit(): void {
    //Loads the development environment on startup
    this.loaderService.loadDevelopmentEnv();
  }

  togglePathsVisible(){
    this.pathsVisible = !this.pathsVisible;
  }

}
