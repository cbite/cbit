import {
  Component, OnInit, animate, transition, style, state, trigger, OnDestroy,
  ChangeDetectorRef, EventEmitter, Output, ViewChild
} from '@angular/core';
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {DownloadSelectionService} from "./services/download-selection.service";
import {DownloadComponent} from "./download.component";

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
            
            <li dropdown class="dropdown">
              <a dropdownToggle>
                <span class="glyphicon glyphicon-wrench"></span>
                Admin
                <span class="caret"></span>
              </a>
              
              <ul dropdownMenu class="dropdown-menu">
                <li [class.active]="isCurrentRoute('/upload')">
                  <a routerLink="/upload"  ><span class="glyphicon glyphicon-cloud-upload"></span> Upload Study</a>
                </li>
                <li [class.active]="isCurrentRoute('/studies')">
                  <a routerLink="/studies"  ><span class="glyphicon glyphicon-list-alt"></span> Manage Studies</a>
                </li>
                <li [class.active]="isCurrentRoute('/metadata')">
                  <a routerLink="/metadata"  ><span class="glyphicon glyphicon-wrench"></span> Edit Field Metadata</a>
                </li>
              </ul>
            </li>
            
            
          </ul>
          
          <ul class="nav navbar-nav navbar-right">
            <li dropdown class="dropdown" [class.selectionLI]="!isSelectionEmpty">
              <a dropdownToggle class="selectionLink">
                <selection-indicator></selection-indicator>
                <span class="caret"></span>
              </a>
              
              <ul dropdownMenu class="dropdown-menu">
                <li [class.disabled]="isSelectionEmpty">
                  <a href="#" (click)="$event.preventDefault(); clearSelection()">
                    <span class="glyphicon glyphicon-ban-circle"></span> 
                    Clear Selection
                  </a>
                </li>
                
                <li [class.disabled]="isSelectionEmpty">
                  <a href="#" (click)="$event.preventDefault(); downloadModal.show()">
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
      
    <div bsModal #downloadModal="bs-modal" class="modal fade" role="dialog" (onShow)="downloadCheckout.refresh()">
      <download-checkout [modal]="downloadModal"></download-checkout>
    </div>
  `,
  styles: [`
  .selectionLink {
    display: table-cell;
    padding-top: 5px;
    padding-bottom: 5px;
    vertical-align: middle;
  }
  
  .selectionLI {
    background-color: #cfc;
  }
  .selectionLI:hover, .selectionLI:focus {
    background-color: #ada;
  }
  .navbar-default .navbar-nav > .selectionLI.open > a, .navbar-default .navbar-nav > .selectionLI.open > a:hover, .navbar-default .navbar-nav > .selectionLI.open > a:focus {
    background-color: #ada;
  }
  `]
})
export class NavBarComponent implements OnInit, OnDestroy {
  navBarCollapsed = true;
  isSelectionEmpty = true;
  stopStream = new Subject<string>();
  @ViewChild(DownloadComponent) downloadCheckout: DownloadComponent;

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
    this.isSelectionEmpty = (Object.keys(curSelection.selection).length === 0);
  }

  isCurrentRoute(route : string) : boolean {
    let isExact = true;
    return this._router.isActive(route, isExact);
  }

  clearSelection() {
    this._downloadSelectionService.clearSelection();
  }
}
