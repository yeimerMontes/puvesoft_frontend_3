import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaRestauranteBarCompletarComponent } from './venta-restaurante-bar-completar.component';

describe('VentaRestauranteBarCompletarComponent', () => {
  let component: VentaRestauranteBarCompletarComponent;
  let fixture: ComponentFixture<VentaRestauranteBarCompletarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaRestauranteBarCompletarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaRestauranteBarCompletarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
