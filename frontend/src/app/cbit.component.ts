import {Component, ViewContainerRef} from '@angular/core';
import {StudyService} from "./services/study.service";
import {FiltersService} from "./services/filters.service";
import {DownloadSelectionService} from "./services/download-selection.service";
import {AuthenticationService} from "./services/authentication.service";
import {URLService} from "./services/url.service";
import {Router} from "@angular/router";

@Component({
  selector: 'cbit',
  template: `
    <navbar></navbar>
    <img id="bg" src="public/images/achtergrond_transp_v3.png">
    <img id="bg2" src="public/images/achtergrond 2_transp.png"
         [class.notinbrowser]="!isInBrowser()"
         [class.inbrowser]="isInBrowser()"
         >
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* Move down content because we have a fixed navbar that is 50px tall */
    main {
      padding-top: 50px;
    }

    #bg {
      position: fixed; 
      top: 60px; 
      right: 10px;
       
      width: 500px;
      z-index: -1;
      opacity: 0.3;
    }

    #bg2.notinbrowser {
      position: fixed; 
      /*top: 60px; 
      left: 10px;*/
      bottom: -300px;
      margin-left: -20px;
       
      width: 300px;
      z-index: -1;
      opacity: 0.3;
    }

    #bg2.inbrowser {
      position: fixed;
      bottom: -300px;
      left: 25%;    /* Sidebar is 25% of view */
      margin-left: -20px;
    
      width: 300px;
      z-index: -1;
      opacity: 0.3;
    }
  `],
  providers: [URLService, StudyService, FiltersService, DownloadSelectionService, AuthenticationService]
})
export class CBiTComponent {

  // HACK FOR NG2-BOOTSTRAP MODALS!
  // See https://valor-software.com/ng2-bootstrap/#/modals
  constructor(
    private viewContainerRef:ViewContainerRef,
    private _router: Router
  ) {
  }

  isInIntro(): boolean {
    let isExact = true;
    return this._router.isActive('/welcome', isExact) || this._router.isActive('/about', isExact);
  }

  isInBrowser(): boolean {
    let isExact = true;
    return this._router.isActive('/browse', isExact);
  }
}
