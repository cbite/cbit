import {Component} from '@angular/core';

@Component({
  styleUrls: ['./welcome.scss'],
  template: `
    <div class="page">
      <div class="video-panel">
        <iframe width="560"
                height="315"
                src="https://www.youtube.com/embed/O12dPthanrM"
                frameborder="0"
                allowfullscreen>
        </iframe>
      </div>

      <div class="text-panel">
        <div class="left-panel">
          <img src="../../../assets/images/logos_welcome_screen_vertical.png" class="university_logo"/>
        </div>
        <div class="right-panel">
          <div class="title-panel">
            <div class="title">Welcome to cBiT</div>
            <div class="subtitle">the Compendium for Biomaterial Transcriptomics!</div>
          </div>

          <div class="text-content">
            <p>
              cBiT is the first repository that offers biomaterial-based transcriptomics data
              together with all <br> relevant biomaterial metadata. Check out the <a routerLink="/about">About</a>
              section for more information or <br>go directly to <a routerLink="/biomaterial/browse">Enter cBiT</a>
              to see what we have to offer!
            </p>

            <p>
              cBiT was developed at the department of Cell Biology-Inspired Tissue Engineering (cBITE),<br>
              part of the MERLN Institute at Maastricht University.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WelcomePage {
}
