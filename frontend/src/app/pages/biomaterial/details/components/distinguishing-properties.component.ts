import {Component, Input} from '@angular/core';
import {Sample} from '../../../../core/types/study.model';

@Component({
    selector: 'cbit-distinguishing-properties',
    styleUrls: ['./distinguishing-properties.scss'],
    template: `
      <div class="distinguishing-properties" (click)="toggleOpen()">
        <span *ngIf="!isOpen" style="margin-right: 10px"><i class="fas fa-caret-right"></i></span>
        <span *ngIf="isOpen" style="margin-right: 10px"><i class="fas fa-caret-down"></i></span> DISTINGUISHING PROPERTIES
      </div>
      <ng-container *ngIf="isOpen">
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
      </ng-container>
    `
  }
)
export class DistinguishingPropertiesComponent {

  @Input()
  public samples: Sample[];

  @Input()
  public commonKeys: any;

  public isOpen = false;

  public toggleOpen() {
    this.isOpen = !this.isOpen;
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
