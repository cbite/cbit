import {Component} from '@angular/core';
import {StudyService} from "./services/study.service";
import {FiltersService} from "./services/filters.service";
import {DownloadSelectionService} from "./services/download-selection.service";

@Component({
  selector: 'cbit',
  template: `
    <navbar></navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* Move down content because we have a fixed navbar that is 50px tall */
    main {
      padding-top: 50px;
    }
  `],
  providers: [StudyService, FiltersService, DownloadSelectionService]
})
export class CBiTComponent {
}
