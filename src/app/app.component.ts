import { Component, Inject, ViewChild } from '@angular/core';
import {
  ModalDirective,
} from 'ngx-bootstrap/modal';
import { ConnectionService } from './services/ConnectionService.service';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'puvesoft3';

  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;

  private faviconLink: HTMLLinkElement;

  constructor(
    public connectionService: ConnectionService,
    @Inject(DOCUMENT) document: any,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    let hostname = document.location.hostname;
    
    let environmentConfig = environment[hostname];
    
    this.titleService.setTitle(environmentConfig.titleSite);

    this.faviconLink = document.querySelector("link[rel*='icon']") || document.createElement('link');
    this.faviconLink.type = 'image/x-icon';
    this.faviconLink.rel = 'shortcut icon';
    document.head.appendChild(this.faviconLink);

    this.faviconLink.href = environmentConfig.faviconUrl;
  }


  openModal() {
    this.childModal?.show();
  }

  closeModal() {
    this.childModal?.hide();
  }
}
