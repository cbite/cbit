import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'cbit-person',
  styleUrls: ['./person.scss'],
  template: `
        <div class="profile-panel">
          <div class="picture-panel">
            <img class="picture" [src]="pictureUrl">
            <div class="contacts">
              <span class="icon" (click)="onEmailClicked()"><i class="fas fa-envelope"></i></span>
              <span class="icon" (click)="onLinkedInClicked()"><i class="fab fa-linkedin"></i></span>
            </div>
          </div>
          <div class="text-panel">
            <div class="title">{{name}}</div>
            <div class="subtitle">{{jobtitle}}</div>
            <div class="description">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
  `
})
export class PersonComponent {

  @Input()
  public name: string;

  @Input()
  public jobtitle: string;

  @Input()
  public pictureUrl: string;

  @Input()
  public email: string;

  @Input()
  public linkedInUrl: string;

  @Output()
  public navigate = new EventEmitter();

  constructor() {
  }

  public onLinkedInClicked() {
    this.navigate.emit({url: this.linkedInUrl, newWindow: true});
  }

  public onEmailClicked() {
    this.navigate.emit({url: `mailto:${this.email}`});
  }
}
