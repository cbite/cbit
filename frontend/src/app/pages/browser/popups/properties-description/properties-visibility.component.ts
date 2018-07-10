import {Component, ChangeDetectorRef, Input} from '@angular/core';
import {ClassifiedProperties, StudyService, ClassifiedPropertiesForGivenVisibility} from '../../../../core/services/study.service';
import {FieldMetaService} from '../../../../core/services/field-meta.service';

// Need title="" to remove annoying automatic browser tooltip
@Component({
  styleUrls: ['./properties-visibility.scss'],
  selector: 'cbit-properties-visibility',
  template: `
      <div class="title">{{ title }}</div>
        <cbit-properties-visibility-category
            *ngFor="let category of categories"
            [title]="categoryName[category] || 'unknown'"
            [fields]="classifiedPropertiesForGivenVisibility[category]"
            >
        </cbit-properties-visibility-category>
  `,
})
export class AllFieldsForVisibilityComponent {
  @Input() title = '';
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
