import {Component, Input} from '@angular/core';
import {CollapseStateService} from '../../services/collapse-state.service';

@Component({
  styleUrls: ['./faq.scss'],
  template: `
    <div class="page">
      <div class="page-content">
          <div class="title"><h4>Frequently Asked Questions (FAQ)</h4></div>
          <dl>
            <cbit-faq-question question="What is cBIT?">
              <p>
                cBiT is a repository that incorporates material science, transcriptomics-based
                cell biology, and clinical data. Users of cBiT are able to download single or
                multiple datasets, which will provide scientists with a powerful tool to improve
                their research, ultimately contributing to new cell biology knowledge and/or
                new biomaterial development.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I submit my data to cBIT?">
              <p>
                Yes you can! We encourage researchers to submit their own data sets, consisting of
                transcriptomics data and material characterizations. We can provide you with a data
                description template (basically a spreadsheet) and tutorial on how to fill it in.
                After completing the template, just send it to us along with your transcriptomics
                data and we will check everything and upload it into cBiT. Please contact Dennie Hebels
                for more details.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="When my data are deposited in cBiT do I also need to upload them in other repositories like GEO or ArrayExpress?">
              <p>
                cBiT was designed to include all the essential information that is also requested in
                repositories like the Gene Expression Omnibus (GEO) or ArrayExpress. We follow the
                MIAME (Minimum Information About a Microarray Experiment) and MINSEQE (Minimum Information
                about a high-throughput nucleotide SEQuencing Experiment) guidelines. However, when
                publishing a paper, the journal often requests that data are deposited in GEO or
                ArrayExpress. If these two repositories are specifically requested, the data should also
                be uploaded there. If not, cBiT is a good alternative.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Do datasets in cBiT have accession numbers?">
              <p>
                We are planning to assign a Persistent Identifier (PID) to each dataset which could
                also be used for referencing purposes in publications. The ePIC PID will be used
                and should be implemented this year: https://www.surf.nl/en/services-and-products/data-persistent-identifier/index.html
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Does cBiT support MIAME and MINSEQE?">
              <p>
                Yes, cBiT includes all the information described in the MIAME and MINSEQE guidelines.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="What kinds of data does cBiT offer?">
              <p>
                cBiT was designed with two main types of data in mind: transcriptomics data (microarray
                or RNAseq-based) and material characterization data. The transcriptomics datasets
                include both raw and processed data for microarrays and only processed data for RNAseq
                datasets. The material characterization data cover a wide range of chemical, physical,
                and mechanical properties and can contain both single values and graph data. Other types
                of data can also be included as supplementary files. However, these cannot be searched.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Which material properties are included?">
              <p>
                Any type of material property can be included. For an overview of the current list of
                material properties present in cBiT, please check the "Full list of fields" in the Browse
                tab. This list is constantly updated when new datasets, with new properties, are added to
                cBiT. It also includes other non-material properties such as technical details about the
                transcriptomics technique and biological details about the experimental setup.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Which transcriptomics platforms does cBiT support?">
              <p>
                For microarrays, the three main platforms (Affymettrix, Agilent, Illumina) are supported.
                For sequencing, Illumins is supported but other platforms can also be included. Just contact
                us for more details.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="How are submitters authenticated?">
              <p>
                We thoroughly check all submissions and submitters and if necessary  verify details with
                department or institution leaders before uploading a dataset into cBiT.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I keep my data private while my manuscript is being prepared or under review?">
              <p>
                If you decide to submit your data to cBiT we can already upload it and hide your study
                from public view until your manuscript is published.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I keep my data private after my manuscript is published?">
              <p>
                No, we follow the same procedure as other online repositories, where data need to be
                publically available after publication. This is normally also requested by journals and
                ensures an open data policy.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="How can I make corrections to data that I already submitted?">
              <p>
                First send us an email detailing what needs to be changed. Based on that we will determine
                whether we can update the dataset for you or whether we need you to create a new study
                template. Once completed, we will  update the dataset which comes into effect immediately.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="How can I delete my records?">
              <p>
                If you would like your study to be deleted, please send us an email with the reason and we
                will proceed to remove the study from cBiT.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I submit data derived from human subjects?">
              <p>
                Yes, however it is your responsibility to ensure that the submitted information does not
                compromise participant privacy and is in accord with the original consent in addition to all
                applicable laws, regulations, and institutional policies.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Search and download">
              <p>
                For detailed information on how to search for studies or specific samples in cBiT and how
                to download them, please check out the video tutorial above. If you have any questions not
                answered in the video, please contact us and we will get back to you as soon as possible.
              </p>
            </cbit-faq-question>
          </dl>
        </div>
    </div>
  `
})
export class FAQPage {
}
