import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  website = '';

  constructor(
    @Inject(DOCUMENT) document: any
  ){
    let hostname = document.location.hostname;
  
    let environmentConfig = environment[hostname];

    this.website = environmentConfig.website;
  }

}
