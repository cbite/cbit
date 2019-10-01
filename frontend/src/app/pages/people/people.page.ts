import {Component, OnInit} from '@angular/core';
import {WindowRef} from '../../shared/util/WindowRef';

@Component({
  styleUrls: ['./people.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div style="margin-bottom: 20px;"><h4>cBiT Staff</h4></div>
        <cbit-person [name]="'Jan De Boer'"
                     [jobtitle]="'Professor of applied cell biology at TU/e'"
                     [email]="'j.d.boer@tue.nl'"
                     [linkedInUrl]="'https://www.linkedin.com/in/jan-de-boer-aa3284b/'"
                     [pictureUrl]="'../../../../assets/images/Jan_de_Boer.png'"
                     (navigate)="onNavigateTo($event)">
            Jan is interested in the molecular complexity of cells and how molecular circuits are involved
            in cell and tissue function. With a background in mouse and Drosophila genetics, he entered
            the field of biomedical engineering in 2002 and has since focused on understanding and
            implementing molecular biology in the field of tissue engineering and regenerative medicine.
            His research is characterized by a holistic approach to both discovery and application, aiming
            at combining high throughput technologies, computational modelling and experimental cell
            biology to streamline the wealth of biological knowledge to real clinical applications. His
            research is defined by strong interdisciplinary collaborations through his big network. He is
            the former chair of the <a href="https://nbte.nl" target="_blank">Netherlands Society for Biomaterials and Tissue Engineering</a> and
            founder and former chair of the <a href="https://www.mosacell.com/" target="_blank">MosaCell platform</a> for patient-derived stem cell research. He
            brought transcriptomics and computational sciences into his research established a data
            repository cBIT and his current team comprises both experimental and computational
            scientists. Jan is a full professor at Biomedical Engineering Department, Eindhoven
            University of Technology (TU/e), chair of BiS, Biointerface Science in Regenerative Medicine
            since 2018. He was a founding member of the <a href="https://www.maastrichtuniversity.nl/research/institute-technology-inspired-regenerative-medicine" target="_blank">Merln Institute</a> for Technology-Inspired
            Regenerative Medicine, Maastricht University and chair of cBITE, Cell Biology Inspired
            Tissue Engineering Lab between 2014-2018 and worked as an associate professor at the
            MIRA Institute for Biomedical Technology, University of Twente between 2004-2014.
        </cbit-person>
        <hr>
        <cbit-person [name]="'Dennie Hebels'"
                     [jobtitle]="'Project manager at the MERLN Institute.'"
                     [email]="'d.hebels@maastrichtuniversity.nl'"
                     [linkedInUrl]="'https://www.linkedin.com/in/denniehebels/'"
                     [pictureUrl]="'../../../../assets/images/Dennie_Hebels.png'"
                     (navigate)="onNavigateTo($event)">
            Dennie obtained his PhD at Maastricht University in 2010 in the field of toxicogenomics,
            followed by two post-docs within the European EnviroGenomarkers project and the diXa
            project. In these projects, he was involved in the identification of genomics biomarkers in
            cancer and hepatotoxicity. In 2015 he started working as a post-doctoral fellow at cBITE
            where he set up the cBiT data repository that stores all previously and newly generated
            experimental data in cBITE and other biomaterial research groups. As of 2017, he is the
            project manager at cBITE, while continuing to assist in bridging the gap between omics data
            and biomaterial-based experimental cell biology to achieve the translation of new concepts
            into pre-clinical research. Currently, Dennie serves a role as advisor of cBiT platform.
        </cbit-person>
          <hr>
          <cbit-person [name]="'Aliaksei Vasilevich'"
                       [jobtitle]="'Data scientist at the TU/e.'"
                       [email]="'a.vasilevich@tue.nl'"
                       [linkedInUrl]="'https://www.linkedin.com/in/aliakseivasilevich/'"
                       [pictureUrl]="'../../../../assets/images/alex.jpg'"
                       (navigate)="onNavigateTo($event)">
              Aliaksei studied biomedical sciences in the International Sakharov Environmental University,
              Minsk, Belarus. During the Master thesis, he developed a method to rapidly measure the
              sensitivity of cells to drugs using image analysis. He obtained his PhD under the supervision
              of Prof. Jan de Boer, where he applied machine learning algorithms to study the biomaterials
              design parameters that affect cells fate. Aliaksei is a data-scientist at the BioInterface
              Science (BiS) laboratory at the Department of Biomedical Engineering, Eindhoven University
              of Technology. He keens on the application of data science solutions for biomaterials
              discovery. Inspired by successes in other areas, he is excited about opportunities that data
              science can bring to biomaterials discovery field. In his current role, he embarked on a
              challenge to streamline biomaterials data management to make it ready for knowledge
              discovery via machine learning.
          </cbit-person>
          <hr>
          <cbit-person [name]="'Patricia Y.W. Dankers'"
                       [jobtitle]="'Professor of Biomedical Materials at the Department of Biomedical Engineering, TU/e.'"
                       [email]="'p.y.w.dankers@tue.nl'"
                       [linkedInUrl]="'https://www.linkedin.com/in/patricia-y-w-dankers-b425021/'"
                       [pictureUrl]="'../../../../assets/images/patricia-dankers.jpg'"
                       (navigate)="onNavigateTo($event)">
              Patricia Dankers studied chemistry at Radboud University (Nijmegen, the Netherlands),
              where she majored in biochemistry and organic chemistry. In 2002, she started her PhD
              research at Eindhoven University of Technology under supervision of prof. E.W. (Bert)
              Meijer, developing and studying supramolecular bioactive biomaterials by introducing a
              modular approach. After her PhD defence in 2006, she became a research scientist at the
              SupraPolix company in Eindhoven and a researcher at the Laboratory of Pathology and
              Medical Biology at the University Medical Center Groningen (UMCG). At UMCG she initiated
              the Dutch bioartificial kidney project together with Prof. Marja J.A. van Luyn. In 2008, Patricia
              Dankers was appointed as assistant professor at Eindhoven University of Technology. In
              2010 she was a visiting professor in the research group of Prof. Samuel I. Stupp at the
              Institute for BioNanotechnology in Medicine at Northwestern University, Chicago (USA). In
              2013, she defended her second PhD thesis, this time in the medical sciences and at
              Groningen University, with her study on kidney regenerative medicine. In 2014, she was
              appointed associate professor at TU/e and in 2017 full professor of Biomedical Materials.
              Patricia Dankers is a Veni (2008) and Vidi (2017) laureate and received an ERC starting
              grant in 2012. She has been awarded various grants and awards, such as the DSM Science
              &amp; Technology Award and the Pauline van Wachem award (for the best thesis in biomaterials
              research and tissue engineering). Since 2015 she is a member of De Jonge Akademie (DJA)
              of the KNAW and in 2016 she joined the board of DJA.
              <br>
              <br>
              The mission of the DankersLab is to provide material solutions for regenerative medicine
              through the development of functional biomaterials based on supramolecular chemistry. For
              more information visit the website of Patricia Dankers&#39; lab: <a href="https://www.dankerslab.nl" target="_blank">www.dankerslab.nl.</a>
              <br>
              <br>
              Patricia Dankers, together with Jan de Boer founded Platform for Therapeutic Biomaterial
              Discovery at TU/e that hosts cBiT platform.
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
