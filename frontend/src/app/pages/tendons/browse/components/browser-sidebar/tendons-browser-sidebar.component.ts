import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import {TendonsStudy} from '../../../../../core/types/Tendons-study';
import {GoogleAnalyticsService} from '../../../../../services/google-analytics.service';


@Component({
  styleUrls: ['./tendons-browser-sidebar.scss'],
  selector: 'cbit-tendons-browser-sidebar',
  template: `
    <div class="sidebar noselect">
      <div class="sidebar-header">
        <div class="searchbox">
          <div class="search-title">SEARCH
          </div>
          <div class="search-content">
            <input id="searchText"
                   class="searchText"
                   type="text"
                   placeholder="e.g., BCP, stromal cell"
                   name='searchText'
                   [formControl]="searchTextInForm"/>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TendonsBrowserSidebarComponent {

  public searchTextInForm = new FormControl();
  public stopStream = new Subject<string>();

  @Input()
  public studies: TendonsStudy[];

  @Output()
  public updateFiltered = new EventEmitter<TendonsStudy[]>();

  constructor(private googleAnalyticsService: GoogleAnalyticsService) {
    this.searchTextInForm.valueChanges
      .debounceTime(200)       // Don't propagate changes until this many ms have elapsed without change
      .distinctUntilChanged()  // Don't emit the same value twice
      .takeUntil(this.stopStream)
      .subscribe(newSearchText => this.doFilter(newSearchText));
  }

  public doFilter(query: string) {
    this.googleAnalyticsService.emitSearchTendonsEvent();
    this.updateFiltered.emit(this.studies.filter(s => s.name.includes(query)));
  }
}
