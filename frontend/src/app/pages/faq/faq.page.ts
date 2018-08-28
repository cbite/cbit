import {Component, Input} from '@angular/core';
import {CollapseStateService} from '../../core/services/collapse-state.service';

@Component({
  styleUrls: ['./faq.scss'],
  template: `
    <div class="page">
      <div class="page-content">
          <div class="title"><h4>Frequently Asked Questions (FAQ)</h4></div>
          <dl>
            <cbit-faq-question question="What is cBIT?">
              <p>
                cBiT is a repository that collects biomaterial-based transcriptomics studies along with any other
                relevant supplementary data. Users of cBiT can search for studies and download the associated
                transcriptomics data, biomaterial characteristics and other study parameters, thereby providing
                scientists with a powerful tool to improve their research. With cBiT we aim to ultimately contribute
                to new cell biology knowledge and/or new biomaterial development.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I submit my data to cBIT?">
              <p>
                Yes you can! We encourage researchers to submit their own data sets. This process consists of
                sending us the sample attributes which describe everything about your samples from cell culturing
                conditions to biomaterial characterization. Your transcriptomics data (microarray or RNA sequencing)
                can be uploaded to EBI’s ArrayExpress (<a href="https://www.ebi.ac.uk/arrayexpress/" target="_blank">https://www.ebi.ac.uk/arrayexpress/</a>) which we will then
                integrate with cBiT. Any other supplementary data you may have you can also deposit with us and
                we integrate it with your cBiT study. A tutorial on how to prepare your data can be found in the
                About section.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Do datasets in cBiT have accession numbers?">
              <p>
                All cBiT datasets have their own Persistent Identifier (PID) which can also be used for referencing
                purposes in publications. We use the European Persistent Identifier Consortium (ePIC) PID.
                Moreover, the transcriptomics data which should be stored in ArrayExpress also receive their own
                accession number.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Does cBiT support MIAME and MINSEQE?">
              <p>
                Yes, cBiT includes all the information described in the MIAME and MINSEQE guidelines. This is import
                since cBiT also integrates with ArrayExpress where the same guidelines are followed.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="What kinds of data does cBiT offer?">
              <p>
                cBiT was designed with two main types of data in mind: transcriptomics data (microarray or RNAseq-
                based) and material characterization data. The transcriptomics datasets, which are stored in
                ArrayExpress and integrated with cBiT, include both raw and processed data for microarrays and (in
                most cases only) raw data for RNAseq datasets. The material characterization data cover a wide
                range of chemical, physical, and mechanical attributes (or properties) and can contain both single
                values and graph data. In addition, other important study attributes, such as cell culturing conditions
                are documented. All of these attributes are searchable. Other types of data can also be included as
                supplementary files.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Which material properties are included?">
              <p>
                Any type of material property can be included. For an overview of the current list of material
                properties present in cBiT, please click on &quot;All properties&quot; in the search section of the Biomaterial
                Studies (Enter cBiT tab). This list is constantly updated when new datasets, with new properties, are
                added to cBiT. It also includes other non-material properties such as technical details about the
                transcriptomics technique and biological details about the experimental setup.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Which transcriptomics platforms does cBiT support?">
              <p>
                Since the transcriptomics data are stored in ArrayExpress, which accepts all commonly used
                platforms, there are no restrictions in cBiT.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="How are submitters authenticated?">
              <p>
                We thoroughly check all submissions and submitters and if necessary verify details with department
                or institution leaders before uploading a dataset into cBiT.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I keep my data private while my manuscript is being prepared or under review?">
              <p>
                If you decide to submit your data to cBiT (and ArrayExpress) it is possible to keep your data hidden
                until the date of publication of your manuscript. In the meantime cBiT (and ArrayExpress) can
                provide you with a URL or login to give peer reviewers access to your data..
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I keep my data private after my manuscript is published?">
              <p>
                No, we follow the same procedure as other online repositories, where data need to be publically
                available after publication. This is normally also requested by journals and ensures an open data
                policy.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="How can I make corrections to data that I already submitted?">
              <p>
                First send us an email detailing what needs to be changed. Based on that we will determine whether
                we can update the dataset for you or whether we need more information from you. Once
                completed, we will update the dataset which comes into effect immediately.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="How can I delete my records?">
              <p>
                If you would like your study to be deleted, please send us an email with the reason and we will
                proceed to remove the study from cBiT..
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Can I submit data derived from human subjects?">
              <p>
                Yes, however it is your responsibility to ensure that the submitted information does not compromise
                participant privacy and is in accord with the original consent in addition to all applicable laws,
                regulations, and institutional policies. The same responsibility applies to the transcriptomics data
                stored in ArrayExpress.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="Search and download">
              <p>
                For detailed information on how to search for studies in cBiT and how to download them, please
                check out the user manual in the About section.
              </p>
            </cbit-faq-question>

            <cbit-faq-question question="What is the Tendon Studies section about?">
              <p>
                In this separate section of cBiT we want to include a simple overview of transcriptomics studies using
                tendon tissue or tenocytes. It will not have the extensive search possibilities available for the
                biomaterial studies. It is solely meant as an overview with links to the studies and the associated
                data.
              </p>
            </cbit-faq-question>
          </dl>
        </div>
    </div>
  `
})
export class FAQPage {
}
