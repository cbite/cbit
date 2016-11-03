import {Component, Input, OnInit} from '@angular/core';
import {Study, RawStudyProtocol, RawStudyPublication} from "../common/study.model";

@Component({
  selector: 'doi-links',
  template: `
  <span *ngFor="let doi of dois">
    <a href="https://dx.doi.org/{{ doi }}">DOI</a>
  </span>
  `
})
export class DOILinksComponent implements OnInit {
  @Input() study: Study
  dois: Array<string> = []

  ngOnInit(): void {
    this.dois = (((this.study && this.study._source && this.study._source['STUDY PUBLICATIONS']) || [])
        .map((p: RawStudyPublication) => p['Study Publication DOI'])
    );
  }
}
