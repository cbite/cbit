import {
  Component, OnInit, animate, transition, style, state, trigger, OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {DownloadSelectionService} from "./services/download-selection.service";

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
            <li [class.active]="isCurrentRoute('/upload')">
              <a routerLink="/upload"  ><span class="glyphicon glyphicon-cloud-upload"></span> Upload (admin!)</a>
            </li>
            
          </ul>
          
          <ul class="nav navbar-nav navbar-right">
            <li dropdown class="dropdown" [class.cartLI]="!isCartEmpty">
              <a dropdownToggle class="cartLink">
                <selection-indicator></selection-indicator>
                <span class="caret"></span>
              </a>
              
              <ul dropdownMenu class="dropdown-menu">
                <li [class.disabled]="isCartEmpty">
                  <a href="#" (click)="$event.preventDefault(); clearCart()">
                    <span class="glyphicon glyphicon-ban-circle"></span> 
                    Clear Cart
                  </a>
                </li>
                
                <li [class.disabled]="isCartEmpty">
                  <a href="#" (click)="$event.preventDefault(); proceedToDownload()">
                    <span class="glyphicon glyphicon-download-alt"></span>
                    Download
                  </a>
                </li>
              </ul>
            </li>
            
          </ul>
        </div>
    
      </div>
    </nav>
  `,
  styles: [`
  .cartLink {
    display: table-cell;
    padding-top: 5px;
    padding-bottom: 5px;
    vertical-align: middle;
  }
  
  .cartLI {
    background-color: #cfc;
  }
  .cartLI:hover, .cartLI:focus {
    background-color: #ada;
  }
  .navbar-default .navbar-nav > .cartLI.open > a, .navbar-default .navbar-nav > .cartLI.open > a:hover, .navbar-default .navbar-nav > .cartLI.open > a:focus {
    background-color: #ada;
  }
  `]
})
export class NavBarComponent implements OnInit, OnDestroy {
  navBarCollapsed = true;
  isCartEmpty = true;
  stopStream = new Subject<string>();

  constructor(
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef,
    private _router : Router
  ) { }

  ngOnInit(): void {
    this._downloadSelectionService.selection
      .takeUntil(this.stopStream)
      .subscribe(selection => {
        this.updateDownloadSelectionStats();

        // Force Angular2 change detection to see ready = true change.
        // Not sure why it's not being picked up automatically
        this.changeDetectorRef.detectChanges();
      })
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  updateDownloadSelectionStats() {
    let curSelection = this._downloadSelectionService.getSelection();
    this.isCartEmpty = (Object.keys(curSelection.inCart).length === 0);
  }

  isCurrentRoute(route : string) : boolean {
    let isExact = true;
    return this._router.isActive(route, isExact);
  }

  clearCart() {
    this._downloadSelectionService.clearCart();
  }

  proceedToDownload() {
    this._router.navigate(['/download']);
  }
}
