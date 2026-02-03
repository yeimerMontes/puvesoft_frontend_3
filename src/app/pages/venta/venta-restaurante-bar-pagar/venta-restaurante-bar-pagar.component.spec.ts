import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaRestauranteBarPagarComponent } from './venta-restaurante-bar-pagar.component';

describe('VentaRestauranteBarPagarComponent', () => {
  let component: VentaRestauranteBarPagarComponent;
  let fixture: ComponentFixture<VentaRestauranteBarPagarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaRestauranteBarPagarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaRestauranteBarPagarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
