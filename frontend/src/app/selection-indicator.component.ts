import {Component, ChangeDetectorRef, OnDestroy, OnInit} from "@angular/core";
import {DownloadSelectionService} from "./services/download-selection.service";
import {Subject} from "rxjs";

@Component({
  selector: 'selection-indicator',
  template: `
    <div class="icon"><span class="glyphicon glyphicon-inbox"></span></div>
    <div class="mainInfoArea">
      {{ numSelectedStudies }} studies<br/>
      {{ numSelectedSamples }} samples
    </div>
  `,
  styles: [`
  :host {
    display: inline-block;
    vertical-align: middle;
  }
  .icon {
    float: left;
    font-size: 200%;
    padding: 5px;
  }
  .mainInfoArea {
    margin-left: 3.5em;
    font-size: 90%;
  }
  `]
})
export class SelectionIndicatorComponent implements OnInit, OnDestroy {
  numSelectedStudies: number = 0;
  numSelectedSamples: number = 0;
  stopStream = new Subject<string>();

  constructor(
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._downloadSelectionService.selection
      .takeUntil(this.stopStream)
      .subscribe(selection => {
        this.updateDownloadSelectionStats();

        // Force Angular2 change detection to see ready = true change.
        // Not sure why it's not being picked up automatically
        this.changeDetectorRef.detectChanges();
      })
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  updateDownloadSelectionStats() {
    let curSelection = this._downloadSelectionService.getSelection();

    this.numSelectedStudies = Object.keys(curSelection.selection).length;
    this.numSelectedSamples = (
      Object.values(curSelection.selection)
        .reduce((soFar, sampleIdsObj) => soFar + Object.keys(sampleIdsObj).length, 0)
    );
  }
}
