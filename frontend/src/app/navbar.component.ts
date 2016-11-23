import {Component, OnInit, animate, transition, style, state, trigger} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'navbar',
  template: `
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container-fluid">
    
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" (click)="navBarCollapsed = !navBarCollapsed" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">cBiT</a>
        </div>
    
        <div id="navbar" [collapse]="navBarCollapsed" class="navbar-collapse">
          <ul class="nav navbar-nav">
          
            <li [class.active]="isCurrentRoute('/welcome')">
              <a routerLink="/welcome">Welcome</a>
            </li>
            <li [class.active]="isCurrentRoute('/browse')">
              <a routerLink="/browse"  >Browse</a>
            </li>
            <li [class.active]="isCurrentRoute('/download')">
              <a routerLink="/download"><span class="glyphicon glyphicon-download-alt"></span> Download</a>
            </li>
            <li [class.active]="isCurrentRoute('/upload')">
              <a routerLink="/upload"  ><span class="glyphicon glyphicon-cloud-upload"></span> Upload</a>
            </li>
            
          </ul>
        </div>
    
      </div>
    </nav>
  `
})
export class NavBarComponent {
  navBarCollapsed = true;

  constructor(private _router : Router){
  }

  isCurrentRoute(route : string) : boolean {
    let isExact = true;
    return this._router.isActive(route, isExact);
  }
}
