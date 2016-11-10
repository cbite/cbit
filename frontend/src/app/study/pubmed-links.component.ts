import {Component, Input, OnInit} from '@angular/core';
import {Study, RawStudyPublication} from "../common/study.model";

@Component({
  selector: 'pubmed-links',
  template: `
  <span *ngFor="let id of pubmedIds">
    <a href="https://www.ncbi.nlm.nih.gov/pubmed/{{ id }}">PubMed</a>
  </span>
  `
})
export class PubmedLinksComponent implements OnInit {
  @Input() study: Study
  pubmedIds: Array<number> = []

  ngOnInit(): void {
    this.pubmedIds = (((this.study && this.study._source && this.study._source['STUDY PUBLICATIONS']) || [])
      .map((p: RawStudyPublication) => +p['Study PubMed ID'])
    );
  }
}
