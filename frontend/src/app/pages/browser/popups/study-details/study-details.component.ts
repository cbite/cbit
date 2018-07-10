import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Sample, Study} from '../../../../core/types/study.model';
import {getAuthors, getTitle} from '../../../../core/util/study-helper';
import {StudyAndSamples, StudyService} from '../../../../core/services/study.service';
import {getCategoriesToDisplay, StudyCategory} from '../../../../core/util/study-display-category-helper';
import {getCommonKeys} from '../../../../core/util/samples-helper';

@Component({
    styleUrls: ['./study-details.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">{{title}}
          </div>
          <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
        </div>
        <div class="modal-body">
          <h5>{{authors}}</h5>
          <h5>Extra Info</h5>
          <ul>
            <li *ngFor="let category of studyCategories">
              <b>{{category.label}}:</b>

              <div *ngIf="category.isIsMultiValued()">
                <ol>
                  <li *ngFor="let multiValue of category.value">
                    <ul>
                      <li *ngFor="let itemValue of multiValue | mapToIterable">
                        <i>{{ itemValue.key }}</i>: {{ itemValue.val }}
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div *ngIf="!category.isIsMultiValued()">
                <ul>
                  <li *ngFor="let value of category.value | mapToIterable">
                    <i>{{ value.key }}</i>: {{ value.val }}
                  </li>
                </ul>
              </div>
            </li>
          </ul>

          <h5>Samples</h5>
          <h6>Common Properties:</h6>
          <ul>
            <li *ngFor="let kv of commonKeys | mapToIterable">
              <i>{{ kv.key }}</i>: {{ kv.val }}
            </li>
          </ul>
          <h6>Distinguishing properties:</h6>
          <ol>
            <li *ngFor="let sample of samples">
              <b>{{ sample._source['Sample Name'] }}</b>:
              <span *ngFor="let propName of distinctKeys(sample); let isLast = last">
                <span *ngIf="sample._source[propName]">
                  <i>{{ propName }}</i>: {{ sample._source[propName] }}<span *ngIf="!isLast">, </span>
                </span>
              </span>
            </li>
          </ol>
        </div>
      </div>
    `
  }
)
export class StudyDetailsComponent {

  public title: string;
  public authors: string;
  public studyCategories: StudyCategory[] = [];
  public samples: Sample[];
  public commonKeys: any;

  constructor(public activeModal: NgbActiveModal, private studyService: StudyService) {
  }

  public setStudy(study: Study) {
    const getCommonKeysFunction = getCommonKeys;
    this.title = getTitle(study);
    this.authors = getAuthors(study);
    this.studyCategories = getCategoriesToDisplay(study);
    this.studyService.getIdsOfSamplesInStudy(study._id).then(sampleIds => {
      Promise.all(sampleIds.map(sampleId => this.studyService.getSample(sampleId))).then(results => {
          this.samples = this.sortSamples(results);
          this.commonKeys = getCommonKeysFunction(this.samples);
      });
    });
  }

  private sortSamples(samples: Sample[]) {
    return samples.sort((a, b) => (a._source['Sample Name'] + '')
      .localeCompare((b._source['Sample Name'] + '')));
  }

  public onCloseClick() {
    this.activeModal.close();
  }

  public distinctKeys(sample: Sample): string[] {
    const ignoreSampleKeys = {
      'Sample ID': true
    };
    return (
      Object.keys(sample._source)
        .filter(key => key.substr(0, 1) !== '*')
        .filter(key => !(key in this.commonKeys))
        .filter(key => !(key in ignoreSampleKeys))
        .filter(key => sample._source[key] !== sample._source['Sample Name'])
    );
  }
}
