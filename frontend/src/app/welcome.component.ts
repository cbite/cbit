import {Component} from '@angular/core';

@Component({
  template: `
    <div class="container">
      <div class="row justified">
        <div class="col-xs-2">
          <img src="/public/images/logos_welcome_screen_vertical.png" class="img-overview">
        </div>
        <div class="col-xs-8">
          
		  
		  
		  
		  <h1 class="just-centered">Welcome to cBiT – the Compendium for Biomaterial Transcriptomics!</h1>

          <div class="centered">
            <iframe width="560"
                    height="315"
                    src="https://www.youtube.com/embed/O12dPthanrM"
                    frameborder="0"
                    allowfullscreen>
            </iframe>
          </div>
          
          <p>
            cBiT is the first repository that offers biomaterial-based transcriptomics data
            together with all relevant biomaterial metadata. Check out the <a routerLink="/about">About</a>
            section for more information or go directly to <a routerLink="/browse">Browse</a>
            to see what we have to offer!
          </p>
          
          <p>  
            cBiT was developed at the department of Cell Biology-Inspired Tissue Engineering (cBITE),
            part of the MERLN Institute at Maastricht University.
          </p>
          
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

    .just-centered {
      text-align: center;
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
