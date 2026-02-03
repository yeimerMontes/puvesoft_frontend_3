import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaRestauranteBarZonaComponent } from './venta-restaurante-bar-zona.component';

describe('VentaRestauranteBarZonaComponent', () => {
  let component: VentaRestauranteBarZonaComponent;
  let fixture: ComponentFixture<VentaRestauranteBarZonaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaRestauranteBarZonaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaRestauranteBarZonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
