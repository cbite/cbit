import {Component} from '@angular/core';

@Component({
  styleUrls: ['./welcome.scss'],
  template: `
    <div class="page">
      <div class="video-panel">
        <iframe width="560"
                height="315"
                src="https://www.youtube.com/embed/hY8oABfbWVg"
                frameborder="0"
                allowfullscreen>
        </iframe>
      </div>

      <div class="text-panel">
        <div class="left-panel">
          <img src="../../../assets/images/TUE_logo.png" class="university_logo" (click)="onNavigate('https://www.tue.nl')"/>
          <img src="../../../assets/images/TUeBis2_logo.png" class="university_logo" (click)="onNavigate('https://jandeboerlab.com/')"/>
          <img src="../../../assets/images/MDR_logo.png" class="university_logo" (click)="onNavigate('https://mdrresearch.nl/')"/>
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
              section for more information or <br>enter cBiT directly by going to the <a routerLink="/dashboard">Dashboard</a>
              to see what we have to offer!
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WelcomePage {
  public onNavigate(target: string) {
    window.location.href = target;
  }
}
