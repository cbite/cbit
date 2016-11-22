import {Component, OnInit} from '@angular/core';
import {StudyService} from "./services/study.service";
import {FiltersService} from "./services/filters.service";
import {DownloadSelectionService} from "./services/download-selection.service";

import 'bootstrap/less/bootstrap.less';
import '../../public/css/styles.css';
import {Router} from "@angular/router";

@Component({
  selector: 'cbit',
  templateUrl: './cbit.component.html',
  providers: [StudyService, FiltersService, DownloadSelectionService]
})
export class CBiTComponent implements OnInit {
  private currentUrl: string = '_';

  constructor(private _router : Router){
    this.currentUrl = ''
  }

  ngOnInit() {
    //this._router.subscribe(
    //  currentUrl => this.currentUrl = currentUrl,
    //  error => console.log(error)
    //);
  }

  isCurrentRoute(route : string) : boolean {
    return this.currentUrl === route;
  }
}
