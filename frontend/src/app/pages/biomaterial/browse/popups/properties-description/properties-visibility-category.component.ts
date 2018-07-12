import {Component, Input, OnChanges} from '@angular/core';
import {FieldMetaService} from '../../../../../core/services/field-meta.service';

@Component({
  styleUrls: ['./properties-visibility-category.scss'],
  selector: 'cbit-properties-visibility-category',
  template: `
    <span class="category">{{ title }}</span>
    <div class="category-elements">
      <ul *ngIf="(fields && fields.length > 0)">
        <li *ngFor="let field of fields">
          <div class="category-element"
               placement="right"
               container="body"
               triggers="mouseenter:mouseleave"
               [ngbPopover]="tooltipTemplate">
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
    </div>
  `
})
export class AllFieldsForVisibilityCategoryComponent implements OnChanges {
  @Input() title = '';
  @Input() fields: string[] = [];
  description: { [fieldName: string]: string } = {};

  constructor(private fieldMetaService: FieldMetaService,) {
  }

  ngOnChanges() {
    if (this.fields) {
      Promise.all(
        this.fields.map(fieldName => this.fieldMetaService.getFieldMeta(fieldName))
      ).then(fieldMetasList => {
        this.description = {};
        for (const fieldMeta of fieldMetasList) {
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
