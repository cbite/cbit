import {Component, OnInit} from '@angular/core';
import { StudyService } from "../services/study.service";
import {Sample} from "../common/study.model";
import {FiltersService, FiltersState} from "../services/filters.service";

@Component({
  selector: 'samples',
  template: `
  <b>{{ samples.length }} matching samples (search Text: {{searchText}})</b>
  <ul>
    <li *ngFor="let sample of samples">
      <div class="showonhover">Study {{ sample.studyId }} - <b>{{ sample._source['Sample Name'] }}</b> (internal id: {{ sample.id }})
        <div class="hovertext">
          <div *ngFor="let propName of sampleKeys">
    
            <div *ngIf="sample._source[propName] && propName !== '_assay'">
              <b>{{ propName }}</b>: {{ sample._source[propName] }}
            </div>
    
            <div *ngIf="sample._source[propName] && propName === '_assay'">
              <b>Assay Properties</b>: <pre>{{ sample._source[propName] | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </li>
  </ul>
  `,
  styles: [`
  .showonhover .hovertext {
    display: none;
    position:relative;
    font-size: 10px;
    left: 20%;
    z-index: 999;
    background:#e0e0e0;
    padding:0px 7px;
    border: 1px solid #c0c0c0;
    box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.4);
     
    opacity: 0;  
    transition:opacity 0.4s ease-out; 
  }
  .showonhover:hover .hovertext {
    position: absolute;
    display: block;
    opacity: 1;
  }
  `]
})
export class SamplesComponent implements OnInit {
  samples: Sample[];
  sampleKeys: string[];

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService
  ) {
  }

  ngOnInit(): void {
    //this._studyService.getStudies().then(studies => this.studies = studies);
    this._filtersService.filters.subscribe(filters => this.updateSamples(filters));
  }

  updateSamples(filters: FiltersState): void {
    let rawSamples = !filters.searchText ? this._studyService.getSamples() : this._studyService.getSamplesMatching(filters.searchText);
    this.samples = rawSamples.sort((a, b) => a._source['Sample Name'].localeCompare(b._source['Sample Name']));

    let keys = new Set<string>();
    this.samples.forEach(sample => Object.keys(sample._source).forEach(key => keys.add(key)));
    keys.delete('Sample Name');
    this.sampleKeys = Array.from(keys).sort();
  }
}
