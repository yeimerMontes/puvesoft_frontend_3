import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import Glide from '@glidejs/glide';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-glide',
  templateUrl: './glide.component.html',
})
export class GlideComponent
  implements AfterContentInit, AfterViewInit, OnDestroy
{
  @Input() settings;
  @ViewChild('glideRef', { static: true }) glideRef: ElementRef;
  @ViewChild('glideSlides', { static: true }) glideSlides: ElementRef;
  updateTimeout;
  glideCarousel;
  glideCount = [];
  direction = 'ltr';

  constructor() {}

  ngAfterContentInit(): void {
    this.glideCount = Array(
      this.glideSlides.nativeElement.childNodes.length - 1
    )
      .fill(1)
      .map((x, i) => i);
    this.glideCarousel = new Glide(this.glideRef.nativeElement, {
      ...this.settings,
    });
    this.glideCarousel.mount();
  }

  ngAfterViewInit(): void {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', false, false);
    window.dispatchEvent(event);
  }

  update(): void {
    this.updateTimeout = setTimeout(() => {
      this.glideCarousel.update();
    }, 500);
  }

  onBulletClick(bulletIndex): void {
    this.glideCarousel.go('=' + bulletIndex);
  }

  ngOnDestroy(): void {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = null;
    this.glideCarousel.destroy();
  }
}
