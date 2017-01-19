import {Component, Input} from '@angular/core';
import {CollapseStateService} from "./services/collapse-state.service";

@Component({
  template: `
    <div class="container">
      <div class="row justified">
        <div class="col-xs-8 col-xs-offset-2">
        
          <h1>Welcome to cBiT – the Compendium for Biomaterial Transcriptomics!</h1>
    
          <p>
          cBiT is a repository that incorporates material science and transcriptomics-based
          cell biology, with a focus on clinically relevant materials. It is based on the
          principle of “materiomics”, which offers a holistic approach to material systems
          that aims to merge materials science and biological methodologies in order to open
          new opportunities to discover novel and improved materials with reduced development
          times. cBiT contains a collection of genome-wide transcriptional expression data
          (microarray and RNAseq) from relevant cell lines cultured on clinically successful
          and promising biomaterials. Where available, these transcriptomics data are
          accompanied by an in depth material property characterization of the associated
          biomaterials.
          </p> 
          
          <h2>A new tool</h2>
          <p>
          We present the cBiT repository as a new tool to help scientists generate and collect
          unique and standardized knowledge on how different cell types interact with a wide
          range of commonly used biomaterials. By generating new information and simultaneously
          accumulating it in an open access repository, we expect it is possible to one day
          predict cell response to biomaterials. Such a prediction approach towards biomaterial
          development will drastically reduce the current time and development costs, while
          at the same time ensuring higher clinical success rates.
          </p>
          
          <img src="/public/images/cbit-overview.png" class="img-overview"> 
          
          <h2>Data organization and tutorial</h2>
          <p>
          cBiT can be easily queried and studies or samples of interest can be selected and
          subsequently downloaded. All the available data are organized using ISA-TAB archives
          which ensure a standardized way of characterizing samples and an unambiguous
          identification of samples. For a tutorial on how to use cBiT, please have a look
          at the following video:
          </p>
          
          <div class="centered">
            <iframe width="560"
                    height="315"
                    src="https://www.youtube.com/embed/Zvvaz1qJW0s"
                    frameborder="0"
                    allowfullscreen>
            </iframe>
          </div>
          
          <h2>More information</h2>
          <p>
          More details on how cBiT was designed and the principles of materiomics can also be
          found in the following papers:
          </p>
          <ul>
            <li>[cBiT publication will be added here once published] (this is the primary publication for cBiT citation purposes)</li>
            <li>Cranford SW, et al., Materiomics: An -omics Approach to Biomaterials Research. Adv Mater, 25: 802–824 (2013).</li>
            <li>de Boer J and van Blitterswijk CA (eds.), Materiomics – High throughput screening of biomaterial properties. Cambridge University Press 2013.</li>
          </ul>
          
          <h2>How can you contribute?</h2>
          <p>
          Researchers who are interested in depositing their own data in cBiT can contact us
          for detailed instructions and support on how to prepare the data into archives. Please
          send an email to Dennie Hebels (<code>d.hebels [at] maastrichtuniversity.nl</code>). 
          </p>
          
          <h2>Contact</h2>
          <div class="contact-details">
            Maastricht University<br/>
            MERLN Institute<br/>
            Department of Cell-Biology Inspired Tissue Engineering (cBITE)<br/>
            Universiteitssingel 40<br/>
            6229 ER Maastricht<br/>
            The Netherlands
          </div>
          
          <p>
          Questions regarding the use of cBiT or other details on how cBiT is set up, can be
          directed to Dennie Hebels (<code>d.hebels [at] maastrichtuniversity.nl</code>).
          </p>
          
          <h2>Licensing information</h2> 
          <p>
          The use of cBiT is free of charge for academic users. Commercial users should
          contact Prof. Jan de Boer (<code>jan.deboer [at] maastrichtuniversity.nl</code>).
          </p> 
          
          <p>
          If you would like written approval for a specific use that is otherwise prohibited,
          please contact Dr. Dennie Hebels (<code>d.hebels [at] maastrichtuniversity.nl</code>).
          </p>
          
          <h2>Disclaimer</h2>
          <p>
          The information, services or products provided on cBiT may contain errors and may
          be subject to temporary interruption. Although we do our best to provide all
          information, services and products as complete and accurate as possible, we cannot
          be held responsible for any errors, defects or other harmful consequences, deriving
          from the use of cBiT. Therefore we renounce any liability whatsoever, within the
          boundaries of Dutch law.
          </p>
          
          
          
          <h2>Frequently Asked Questions (FAQ)</h2>
        
          <dl>
          
            <faq-question question="What is cBIT?">
              <p>
                cBiT is a repository that incorporates material science, transcriptomics-based
                cell biology, and clinical data. Users of cBiT are able to download single or
                multiple datasets, which will provide scientists with a powerful tool to improve
                their research, ultimately contributing to new cell biology knowledge and/or
                new biomaterial development.
              </p>
            </faq-question>
            
            <faq-question question="Can I submit my data to cBIT?">
              <p>
                Yes you can! We encourage researchers to submit their own data sets, consisting of
                transcriptomics data and material characterizations. We can provide you with a data
                description template (basically a spreadsheet) and tutorial on how to fill it in.
                After completing the template, just send it to us along with your transcriptomics
                data and we will check everything and upload it into cBiT. Please contact Dennie Hebels
                for more details.
              </p>
            </faq-question>
            
            <faq-question question="When my data are deposited in cBiT do I also need to upload them in other repositories like GEO or ArrayExpress?">
              <p>
                cBiT was designed to include all the essential information that is also requested in
                repositories like the Gene Expression Omnibus (GEO) or ArrayExpress. We follow the
                MIAME (Minimum Information About a Microarray Experiment) and MINSEQE (Minimum Information
                about a high-throughput nucleotide SEQuencing Experiment) guidelines. However, when
                publishing a paper, the journal often requests that data are deposited in GEO or
                ArrayExpress. If these two repositories are specifically requested, the data should also
                be uploaded there. If not, cBiT is a good alternative.
              </p>
            </faq-question>
            
            <faq-question question="Do datasets in cBiT have accession numbers?">
              <p>
                We are planning to assign a Persistent Identifier (PID) to each dataset which could 
                also be used for referencing purposes in publications. The ePIC PID will be used 
                and should be implemented this year: https://www.surf.nl/en/services-and-products/data-persistent-identifier/index.html
              </p>
            </faq-question>
            
            <faq-question question="Does cBiT support MIAME and MINSEQE?">
              <p>
                Yes, cBiT includes all the information described in the MIAME and MINSEQE guidelines.
              </p>
            </faq-question>
            
            <faq-question question="What kinds of data does cBiT offer?">
              <p>
                cBiT was designed with two main types of data in mind: transcriptomics data (microarray 
                or RNAseq-based) and material characterization data. The transcriptomics datasets 
                include both raw and processed data for microarrays and only processed data for RNAseq 
                datasets. The material characterization data cover a wide range of chemical, physical, 
                and mechanical properties and can contain both single values and graph data. Other types 
                of data can also be included as supplementary files. However, these cannot be searched.
              </p>
            </faq-question>
            
            <faq-question question="Which material properties are included?">
              <p>
                Any type of material property can be included. For an overview of the current list of 
                material properties present in cBiT, please check the "Full list of fields" in the Browse 
                tab. This list is constantly updated when new datasets, with new properties, are added to 
                cBiT. It also includes other non-material properties such as technical details about the 
                transcriptomics technique and biological details about the experimental setup.
              </p>
            </faq-question>            
            
            <faq-question question="Which transcriptomics platforms does cBiT support?">
              <p>
                For microarrays, the three main platforms (Affymettrix, Agilent, Illumina) are supported. 
                For sequencing, Illumins is supported but other platforms can also be included. Just contact 
                us for more details.
              </p>
            </faq-question>
            
            <faq-question question="How are submitters authenticated?">
              <p>
                We thoroughly check all submissions and submitters and if necessary  verify details with 
                department or institution leaders before uploading a dataset into cBiT.
              </p>
            </faq-question>
            
            <faq-question question="Can I keep my data private while my manuscript is being prepared or under review?">
              <p>
                If you decide to submit your data to cBiT we can already upload it and hide your study 
                from public view until your manuscript is published.
              </p>
            </faq-question>
            
            <faq-question question="Can I keep my data private after my manuscript is published?">
              <p>
                No, we follow the same procedure as other online repositories, where data need to be 
                publically available after publication. This is normally also requested by journals and 
                ensures an open data policy.
              </p>
            </faq-question>
            
            <faq-question question="How can I make corrections to data that I already submitted?">
              <p>
                First send us an email detailing what needs to be changed. Based on that we will determine 
                whether we can update the dataset for you or whether we need you to create a new study 
                template. Once completed, we will  update the dataset which comes into effect immediately.
              </p>
            </faq-question>
            
            <faq-question question="How can I delete my records?">
              <p>
                If you would like your study to be deleted, please send us an email with the reason and we
                will proceed to remove the study from cBiT.
              </p>
            </faq-question>
            
            <faq-question question="Can I submit data derived from human subjects?">
              <p>
                Yes, however it is your responsibility to ensure that the submitted information does not 
                compromise participant privacy and is in accord with the original consent in addition to all 
                applicable laws, regulations, and institutional policies.
              </p>
            </faq-question>          
           
            <faq-question question="Search and download">
              <p>
                For detailed information on how to search for studies or specific samples in cBiT and how
                to download them, please check out the video tutorial above. If you have any questions not
                answered in the video, please contact us and we will get back to you as soon as possible.
              </p>
            </faq-question>                        
            
          </dl>
          
          
          
          <p class="copyright">
            &copy; 2017 Laboratory for cell-Biology inspired Tissue Engineering, Maastricht University.
            All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .justified {
      text-align: justify;
    }
    
    .img-overview {
      display: block;
      text-align: center;
      width: 100%;
      margin-top: 15px;
      margin-bottom: 40px
    }
    
    .centered {
      margin: auto;
      width: 560px;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    .contact-details {
      margin-left: 40px;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    .copyright {
      width: 100%;
      text-align: center;
      margin-top: 30px;
      font-size: 80%;
    }
  `]
})
export class AboutComponent {
}

@Component({
  selector: 'faq-question',
  template: `
    <dt>
      <a href="#" (click)="$event.preventDefault(); expanded = !expanded">
        <span *ngIf=" expanded" class="glyphicon glyphicon-triangle-bottom"></span>
        <span *ngIf="!expanded" class="glyphicon glyphicon-triangle-right"></span>
        {{ question }}
      </a>
    </dt>
    <dd *ngIf="expanded">
      <ng-content></ng-content>
    </dd>
  `,
  styles: [`
    dd {
      margin-left: 20px;
      margin-top: 5px;
      margin-bottom: 10px;
    }
  `]
})
export class FAQQuestionComponent {
  @Input() question: string;

  constructor(
    private _collapsedStateService: CollapseStateService
  ) { }

  get expanded(): boolean {
    return !this._collapsedStateService.isCollapsed(`faq-${this.question}`, true);
  }
  set expanded(value: boolean) {
    this._collapsedStateService.setCollapsed(`faq-${this.question}`, !value);
  }
}
