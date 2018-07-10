import {Component} from '@angular/core';
import {FiltersService, EMPTY_FILTERS} from "../../services/filters.service";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  template: `Redirecting...`
})
export class StudyRedirectComponent {
  constructor(
    public _filtersService: FiltersService,
    public _router: Router,
    private _route: ActivatedRoute,
  ) {}

  ngOnInit() {
    let studyId = this._route.snapshot.params['id'];
    console.log(studyId);
    this._filtersService.setFilters(Object.assign({}, EMPTY_FILTERS, {searchText: `studyId:${studyId}`}));
    this._router.navigate(['/browse']);
  }
}
