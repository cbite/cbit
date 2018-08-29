import {Component, Input} from '@angular/core';
import {StudyCategory} from '../../../../core/util/study-display-category-helper';

@Component({
    selector: 'cbit-study-category',
    styleUrls: ['./study-category.scss'],
    template: `
      <div>
        <span class="category-label" (click)="toggleOpen()">
          <span *ngIf="!isOpen" style="margin-right: 10px"><i class="fas fa-caret-right"></i></span>
          <span *ngIf="isOpen" style="margin-right: 10px"><i class="fas fa-caret-down"></i></span>
          {{category.label}}
        </span>

        <ng-container *ngIf="isOpen">
          <div *ngIf="category.isIsMultiValued()">
            <ol>
              <li *ngFor="let multiValue of category.getUniqueValue()">
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
        </ng-container>
      </div>
    `
  }
)
export class StudyCategoryComponent {

  @Input()
  public category: StudyCategory;

  public isOpen = false;

  public toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
