import {Component, ChangeDetectorRef, Input} from '@angular/core';
import {ClassifiedProperties, StudyService, ClassifiedPropertiesForGivenVisibility} from "../../../services/study.service";

@Component({
  selector: 'all-fields-visibility-category',
  template: `
    <li>
      <h6>{{ title }}</h6>
      <ul>
        <li *ngFor="let field of fields">
          <div class="fieldName"
               [my-tooltip]="tooltipTemplate" placement="right">
            {{ withoutStar(field) }}
          </div>
          <ng-template #tooltipTemplate>
            <div [innerHtml]="description[field] || 'No description available'"></div>
          </ng-template>
        </li>
      </ul>
      <div *ngIf="(!fields || fields.length == 0)" class="none-yet">
        None yet!
      </div>
    </li>
  `,
  styles: [`
    .none-yet {
      padding-left: 40px;
      font-style: oblique;
      color: #999;
    }
    li {
      width: auto;
    }
    .fieldName {
      color: #337ab7;
      display: inline-block;
      width: auto;
    }
  `]
})
export class AllFieldsForVisibilityCategoryComponent {
  @Input() title: string = '';
  @Input() fields: string[] = [];
  description: { [fieldName: string]: string } = {};

  constructor(
    private _studyService: StudyService
  ) {}

  ngOnChanges() {
    if (this.fields) {
      Promise.all(
        this.fields.map(fieldName => this._studyService.getFieldMeta(fieldName))
      ).then(fieldMetasList => {
        this.description = {};
        for (let fieldMeta of fieldMetasList) {
          this.description[fieldMeta.fieldName] = fieldMeta.description;
        }
      });
    } else {
      this.description = {};
    }
  }

  withoutStar(s: string): string {
    if (s.substr(0, 1) == '*') {
      return s.substr(1);
    } else {
      return s;
    }
  }
}

// Need title="" to remove annoying automatic browser tooltip
@Component({
  selector: 'all-fields-visibility',
  template: `
    <li title="">
      <h5>{{ title }}</h5>
      <ul>
        <all-fields-visibility-category
            *ngFor="let category of categories"
            [title]="categoryName[category] || 'unknown'"
            [fields]="classifiedPropertiesForGivenVisibility[category]"
            >
        </all-fields-visibility-category>
      </ul>
    </li>
  `,
  styles: [`
    h5 {
      margin-bottom: 20px;
    }
    ul {
      list-style: none;
      padding-left: 20px;
    }
    all-fields-visibility-category {
      display: block;
    }
    all-fields-visibility-category:not(:first-child) {
      margin-top: 15px;
    }
  `]
})
export class AllFieldsForVisibilityComponent {
  @Input() title: string = '';
  @Input() classifiedPropertiesForGivenVisibility: ClassifiedPropertiesForGivenVisibility = {};

  // Ordered like in filters sidebar
  categories = [
    'Material > General',
    'Material > Chemical',
    'Material > Physical',
    'Material > Mechanical',
    'Biological',
    'Technical > General',
    'Technical > Microarray',
    'Technical > RNA sequencing',
  ];

  categoryName = {
    'Material > General':  'Material Properties - General',
    'Material > Chemical':  'Material Properties - Chemical',
    'Material > Physical':  'Material Properties - Physical',
    'Material > Mechanical':  'Material Properties - Mechanical',
    'Biological':  'Biological Properties',
    'Technical > General':  'Technical Properties - General',
    'Technical > Microarray':  'Technical Properties - Microarray',
    'Technical > RNA sequencing':  'Technical Properties - RNA sequencing',
  };

  withoutStar(s: string): string {
    if (s.substr(0, 1) == '*') {
      return s.substr(1);
    } else {
      return s;
    }
  }
}

@Component({
  selector: 'all-fields',
  template: `
    <div *ngIf="!ready">
      Loading... <spinner></spinner>
    </div>
    <div class="content">
      <ul *ngIf="ready">
        <all-fields-visibility title="MAIN FILTERS" [classifiedPropertiesForGivenVisibility]="classifiedProperties['main'] || {}">
        </all-fields-visibility>
        
        <all-fields-visibility title="ADDITIONAL FILTERS" [classifiedPropertiesForGivenVisibility]="classifiedProperties['additional'] || {}">
        </all-fields-visibility>
      </ul>
    </div>
  `,
  styles: [`
    .content {
      max-height: 400px;
      overflow-y: auto;
    }
    ul {
      list-style: none;
      padding-left: 0;
    }
    
    all-fields-visibility {
      display: block;
    }
    all-fields-visibility:not(:first-child) {
      margin-top: 30px;
    }
  `],
  exportAs: "allFields"
})
export class AllFieldsComponent {
  ready = false;
  classifiedProperties: ClassifiedProperties = {};

  constructor(
    private _studyService: StudyService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  refresh() {
    this._studyService.getAllFieldMetas()
      .then(fieldMetas => {
        this.classifiedProperties = this._studyService.classifyProperties(fieldMetas);
        console.log(this.classifiedProperties);
        this.ready = true;
        this._changeDetectorRef.detectChanges();
      })
  }
}
