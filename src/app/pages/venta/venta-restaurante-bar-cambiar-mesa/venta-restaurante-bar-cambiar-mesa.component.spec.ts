import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaRestauranteBarCambiarMesaComponent } from './venta-restaurante-bar-cambiar-mesa.component';

describe('VentaRestauranteBarCambiarMesaComponent', () => {
  let component: VentaRestauranteBarCambiarMesaComponent;
  let fixture: ComponentFixture<VentaRestauranteBarCambiarMesaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaRestauranteBarCambiarMesaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaRestauranteBarCambiarMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
