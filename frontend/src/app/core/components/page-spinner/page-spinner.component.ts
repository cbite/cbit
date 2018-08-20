import {Component} from '@angular/core';

@Component({
    selector: 'cbit-page-spinner',
    styleUrls: ['./page-spinner.component.scss'],
    template: `
        <div class="spinner active">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
        </div>`
})
export class PageSpinnerComponent {
}
