import {Component} from '@angular/core';

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
          
          
          
          <!--
          LET’S IGNORE THE FAQ SECTION FOR NOW:
          FAQs
          What is cBIT? cBiT is a repository that incorporates material science, transcriptomics-based cell biology, and clinical data. Users of cBiT are able to download single or multiple datasets, which will provide scientists with a powerful tool to improve their research, ultimately contributing to new cell biology knowledge and/or new biomaterial development.
          Why should I submit my data to cBIT?
          There are several good reasons for submitting your data to us. The most likely reason is that the journal in which you are publishing your research requires deposit of microarray data to a MIAME-compliant public repository like cBIT. We endeavor to make data deposit procedures as straightforward as possible and will provide as much assistance as you require to get your data submitted to cBIT. 
          If you have problems or questions about the submission procedures, just e-mail us at geo@ncbi.nlm.nih.gov and one of our curators will quickly get back to you. In addition to satisfying possible journal requirements for publication, there are other significant benefits to depositing data with GEO. Your data receive long term archiving at a centralized repository, and are integrated with other NCBI resources which afford greatly increased usability and visibility. You may also include links back to your own project websites within your submission, again increasing visibility of your research. Journal publication is not a requirement for data submission to GEO.
          How do I submit my data to GEO?
          When do I submit my data to GEO?
          When will my data receive GEO accession numbers?
          I'm a reviewer, how do I access and evaluate pre-publication data?
          Does GEO support MIAME?
          What kinds of data will GEO accept?
          Does GEO store raw data?
          How are submitters authenticated?
          Can I keep my data private while my manuscript is being prepared or under review?
          Can I keep my data private after my manuscript is published?
          How can I allow reviewers access to my private records?
          How can I make corrections to data that I already submitted?
          How can I delete my records?
          Can I submit data derived from human subjects?
          How can I make edits to my contact information?
          Can I submit an extracted or summary subset of data?
          Query and search
          Who can use GEO data?
          What kinds of retrievals are possible in GEO?
          How can I query and analyze GEO data?
          Can GEO data be accessed programmatically?
          Can I get notified when new data is available?
          Can I cite data I find in GEO as evidence to support my own research?
          What is the difference between a Series and a DataSet?
          Why can't I find gene profile charts or clusters for my study of interest?
          What do the red bars and blue squares represent in GEO profile charts?
          Why can't I find supplementary/raw data for my study of interest?
          What data types are provided with next-generation sequence submissions?
          What is GEO BLAST?
          -->
          
          
          
          <p class="copyright">
            &copy; 2016 Laboratory for cell-Biology inspired Tissue Engineering, Maastricht University.
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
