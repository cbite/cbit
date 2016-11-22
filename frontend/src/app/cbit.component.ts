import { Component } from '@angular/core';
import {StudyService} from "./services/study.service";
import {FiltersService} from "./services/filters.service";
import {DownloadSelectionService} from "./services/download-selection.service";

import '../../public/css/styles.css';
import 'bootstrap/less/bootstrap.less';

@Component({
  selector: 'cbit',
  templateUrl: './cbit.component.html',
  providers: [StudyService, FiltersService, DownloadSelectionService]
})
export class CBiTComponent {
}
