import {Component, Input} from '@angular/core';

@Component({
    selector: 'cbit-common-properties',
    styleUrls: ['./common-properties.scss'],
    template: `
      <div class="common-properties" (click)="toggleOpen()">
        <span *ngIf="!isOpen" style="margin-right: 10px"><i class="fas fa-caret-right"></i></span>
        <span *ngIf="isOpen" style="margin-right: 10px"><i class="fas fa-caret-down"></i></span> COMMON PROPERTIES
      </div>
      <ng-container *ngIf="isOpen">
      <ul>
        <li *ngFor="let kv of commonKeys | mapToIterable">
          <i>{{ kv.key }}</i>: {{ kv.val }}
        </li>
      </ul>
      </ng-container>
    `
  }
)
export class CommonPropertiesComponent {

  @Input()
  public commonKeys: any;

  public isOpen = false;

  public toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
