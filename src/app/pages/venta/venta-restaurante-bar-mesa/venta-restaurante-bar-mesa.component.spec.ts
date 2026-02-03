import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaRestauranteBarMesaComponent } from './venta-restaurante-bar-mesa.component';

describe('VentaRestauranteBarMesaComponent', () => {
  let component: VentaRestauranteBarMesaComponent;
  let fixture: ComponentFixture<VentaRestauranteBarMesaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaRestauranteBarMesaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaRestauranteBarMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
