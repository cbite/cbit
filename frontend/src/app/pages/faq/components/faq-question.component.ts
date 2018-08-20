import {Component, Input} from '@angular/core';
import {CollapseStateService} from '../../../core/services/collapse-state.service';

@Component({
  styleUrls: ['./faq-question.scss'],
  selector: 'cbit-faq-question',
  template: `
    <dt>
      <a href="#" (click)="$event.preventDefault(); expanded = !expanded">
        <span *ngIf=" expanded" style="margin-right: 10px;"><i class="fas fa-caret-right fa-rotate-90"></i></span>
        <span *ngIf="!expanded" style="margin-right: 10px;"><i class="fas fa-caret-right"></i></span>
        {{ question }}
      </a>
    </dt>
    <dd *ngIf="expanded">
      <ng-content></ng-content>
    </dd>
  `
})
export class FAQQuestionComponent {
  @Input() question: string;

  constructor(private _collapsedStateService: CollapseStateService) {
  }

  get expanded(): boolean {
    return !this._collapsedStateService.isCollapsed(`faq-${this.question}`, true);
  }

  set expanded(value: boolean) {
    this._collapsedStateService.setCollapsed(`faq-${this.question}`, !value);
  }
}
