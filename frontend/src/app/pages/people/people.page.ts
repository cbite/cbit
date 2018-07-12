import {Component, OnInit} from '@angular/core';
import {WindowRef} from '../../shared/util/WindowRef';

@Component({
  styleUrls: ['./people.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div style="margin-bottom: 20px;"><h4>cBiT Staff</h4></div>
        <cbit-person [name]="'Jan De Boer'"
                     [jobtitle]="'Professor of applied cell biology at the MERLN Institute.'"
                     [email]="'jan.deboer@maastrichtuniversity.nl'"
                     [linkedInUrl]="'https://www.linkedin.com/in/jan-de-boer-aa3284b/'"
                     [pictureUrl]="'../../../../assets/images/Jan_de_Boer.png'"
                     (navigate)="onNavigateTo($event)">
          Jan is interested in the molecular complexity of cells and how molecular circuits are involved in cell and
          tissue function. With a background in mouse and Drosophila genetics, he entered the field of biomedical
          engineering
          in 2002 and has since focused on understanding and implementing molecular biology in the field of tissue
          engineering
          and regenerative medicine. His research is characterized by a holistic approach to both discovery and
          application,
          aiming at combining high throughput technologies, computational modeling and experimental cell biology to
          streamline
          the wealth of biological knowledge to real clinical applications.
        </cbit-person>
        <hr>
        <cbit-person [name]="'Dennie Hebels'"
                     [jobtitle]="'Project manager at the MERLN Institute.'"
                     [email]="'d.hebels@maastrichtuniversity.nl'"
                     [linkedInUrl]="'https://www.linkedin.com/in/denniehebels/'"
                     [pictureUrl]="'../../../../assets/images/Dennie_Hebels.png'"
                     (navigate)="onNavigateTo($event)">
          Dennie obtained his PhD at Maastricht University in 2010 in the field of toxicogenomics, followed by two
          post-docs
          within the European EnviroGenomarkers project and the diXa project. In these projects he was involved in the
          identification of
          genomics biomarkers in cancer and hepatotoxicity. In 2015 he started working as a post-doctoral fellow at
          cBITE where
          he set up the cBiT data repository that stores all previously and newly generated experimental data in cBITE
          and other
          biomaterial research groups. As of 2017, he is the project manager at cBITE, while continuing to assist in
          bridging the
          gap between omics data and biomaterial-based experimental cell biology to achieve the translation of new
          concepts
          into pre-clinical research.
        </cbit-person>
      </div>
    </div>
  `
})
export class PeoplePage {

  private nativeWindow: any;

  constructor(private winRef: WindowRef) {
    this.nativeWindow = winRef.getNativeWindow();
  }

  public onNavigateTo(target: any) {
    if (target.newWindow) {
      this.nativeWindow.open(target.url);
    } else {
      this.nativeWindow.location = target.url;
    }
  }
}
