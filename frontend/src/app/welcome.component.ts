import {Component} from '@angular/core';

@Component({
  template: `
    <div class="container">
      <div class="row justified">
        <div class="col-xs-8 col-xs-offset-2">
          <h1>Welcome to cBiT – the Compendium for Biomaterial Transcriptomics!</h1>
    
          <p>
          cBiT is a repository that incorporates material science and transcriptomics-based
          cell biology, with a focus on clinically relevant materials. cBiT was developed at
		  the department of Cell Biology-Inspired Tissue Engineering (cBITE), part of the MERLN
		  Institute at Maastricht University. Check out the About section for more information
		  or go directly to Browse to see what we have to offer!
          </p> 
          
          <img src="/public/images/cbit-overview.png" class="img-overview"> 
          
          <div class="centered">
            <iframe width="560"
                    height="315"
                    src="https://www.youtube.com/embed/Zvvaz1qJW0s"
                    frameborder="0"
                    allowfullscreen>
            </iframe>
          </div>

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
    
    .copyright {
      width: 100%;
      text-align: center;
      margin-top: 30px;
      font-size: 80%;
    }
  `]
})
export class WelcomeComponent {
}
