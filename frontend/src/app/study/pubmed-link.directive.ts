import {Component, Input, OnInit, Directive, HostBinding} from '@angular/core';
import {Study, RawStudyPublication} from "../common/study.model";

@Directive({
  selector: '[pubmed-link]'
})
export class PubmedLinksDirective {
  @Input() pubmedId: string
  @HostBinding('href')
  get href(): string { return `https://www.ncbi.nlm.nih.gov/pubmed/${this.pubmedId}`; }
}
