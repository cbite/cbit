import {Component, Input} from '@angular/core';
import {CollapseStateService} from '../../core/services/collapse-state.service';

@Component({
  styleUrls: ['./about.scss'],
  template: `
    <div class="page">
      <div class="page-content">
          <h4>What is cBiT?</h4>
          
          <p>
              cBiT is the first repository that offers biomaterial-based transcriptomics
              data together with all relevant biomaterial metadata.
              
              cBiT was an initiative of the <a href="https://www.jandeboerlab.com" target="_blank">de Boer lab</a> when still at the Merln Institute in Maastricht, and now at the department
              of BME at TU/e. cBiT is continuing to expand as part of Platform for Therapeutic Biomaterial
              Discovery at TU/e.
          </p>

          <h4>Why cBiT?</h4>
          <ul>
            <li>cBiT aims to provide a comprehensive overview of materiomics studies and make them publically available for download and further analysis</li>
            <li>cBiT is an important step towards standardization in the field of cell-biomaterial interactions</li>
            <li>cBiT wants to stimulate data sharing in the biomaterial community</li>
            <li>In depth (meta)analysis of cBiT’s big data will accelerate biomaterial development</li>
          </ul>

          <img src="../../../assets/images/cbit-overview-final.png" class="img-overview">

          <h3>What can we do for you?</h3>

          <p>
            The possibilities offered by cBiT are:
          </p>

          <ol class="possibilities">
            <li>
              <div class="possibility">
                Browse, download and analyze data yourself
              </div>

              cBiT can be easily queried under <a routerLink="/biomaterial/browse">Enter cBiT</a> using either free text search or
              a material and study property quick selection menu. Studies of interest can subsequently be downloaded for further analysis. 
              For a manual on how to use cBiT, please have a look at
              <a href="/assets/pdfs/cBiT user manual.pdf">this pdf</a>.
            </li>

            <li>
              <div class="possibility">
                Browse, download and find an external party to analyze the data
              </div>

              cBiT can be easily queried under <a routerLink="/biomaterial/browse">Enter cBiT</a> using either free text search or
              a material and study property quick selection menu. Studies of interest can subsequently be downloaded for further analysis.
              For a manual on how to use cBiT, please have a look at
              <a href="/assets/pdfs/cBiT user manual.pdf">this pdf</a>.
            </li>

            <li>
              <div class="possibility">
                Contact us with an interesting question and ask us to analyze cBiT data
              </div>

              We have ample experience with materiomics-data analysis and are happy to help out! Researchers who are
              interested in analyzing cBiT data can contact us for support, please send an email to Alex Vasilevich
              (<code>a.vasilevich [at] tue.nl</code>).
            </li>

            <li>
              <div class="possibility">
                Supply us with an interesting biomaterial and ask us to generate data
              </div>

              We have a lot of experience with biomaterial-transcriptomics studies and are happy to help out!
              Researchers who are interested in analyzing the effect of their biomaterial on the cell transcriptome
              can contact us for support, please send an email to Alex Vasilevich
              (<code>a.vasilevich [at] tue.nl</code>).
            </li>

            <li>
              <div class="possibility">
                Upload your own dataset
              </div>

              Researchers who are interested in depositing their own data in cBiT can follow the detailed
              instructions in <a href="/assets/pdfs/cBiT data archive preparation instructions.zip">this zip file</a> on how to prepare
              the data into archives.
            </li>
          </ol>


          <h4>Want to know more?</h4>
          <p>
            More details on how cBiT was designed and the principles of materiomics can be found in
            the following papers:
          </p>
          <ul>
            <li>
              Hebels et al., cBiT: A Transcriptomics Database for Innovative Biomaterial Engineering.
              <a href="https://www.ncbi.nlm.nih.gov/pubmed/29020642" target="_blank">Biomaterials, 149: 88-97 (2017)</a>
            </li>

            <li>
              Cranford SW, et al., Materiomics: An -omics Approach to Biomaterials Research.
              <a href="https://www.ncbi.nlm.nih.gov/pubmed/23297023" target="_blank">Adv Mater, 25: 802–824 (2013)</a>
            </li>

            <li>
              de Boer J and van Blitterswijk CA (eds.), Materiomics – High throughput screening of
              biomaterial properties.
              <a href="http://www.cambridge.org/gb/academic/subjects/engineering/materials-science/materiomics-high-throughput-screening-biomaterial-properties?format=HB&isbn=9781107016774" target="_blank">Cambridge University Press (2013)</a>
            </li>
          </ul>

          <h4>Contact</h4>
          <div class="contact-details">
              BiS, Biointerface Science in Regenerative Medicine<br>
              Department of Biomedical Engineering<br>
              Eindhoven University of Technology (TU/e)<br>
              PO Box 513, 5600 MB, Eindhoven<br>
              The Netherlands<br>
              Internal address: Building 15, Gemini-Zuid, Office 3.116
          </div>

          <p>
            Questions regarding the use of cBiT or other details on how cBiT is set up, can be
            directed to Alex Vasilevich (<code>a.vasilevich [at] tue.nl</code>).
          </p>

          <div class="disclaimers">
            <h5>Licensing information</h5>
            <p>
              The use of cBiT is free of charge for academic users.
            </p>

            <p>
              If you would like written approval for a specific use that is otherwise prohibited,
              please contact Dr. Alex Vasilevich (<code>a.vasilevich [at] tue.nl</code>).
            </p>

            <h5>Disclaimer</h5>
            <p>
              The information, services or products provided on cBiT may contain errors and may
              be subject to temporary interruption. Although we do our best to provide all
              information, services and products as complete and accurate as possible, we cannot
              be held responsible for any errors, defects or other harmful consequences, deriving
              from the use of cBiT. Therefore we renounce any liability whatsoever, within the
              boundaries of Dutch law.
            </p>
          </div>
        </div>
    </div>
  `
})
export class AboutPage {
}
