import {Component, ViewContainerRef} from '@angular/core';
import {StudyService} from "./services/study.service";
import {FiltersService} from "./services/filters.service";
import {DownloadSelectionService} from "./services/download-selection.service";
import {AuthenticationService} from "./services/authentication.service";
import {URLService} from "./services/url.service";

@Component({
  selector: 'cbit',
  template: `
    <navbar></navbar>
    <img id="bg" src="public/images/achtergrond_transp_v3.png">
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
      /*opacity: 0.5;*/
    }
  `],
  providers: [URLService, StudyService, FiltersService, DownloadSelectionService, AuthenticationService]
})
export class CBiTComponent {
  // HACK FOR NG2-BOOTSTRAP MODALS!
  // See https://valor-software.com/ng2-bootstrap/#/modals
  public constructor(private viewContainerRef:ViewContainerRef) {
  }
}
