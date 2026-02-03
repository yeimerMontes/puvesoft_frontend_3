import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AperturaCajaComponent } from './apertura-caja.component';

describe('AperturaCajaComponent', () => {
  let component: AperturaCajaComponent;
  let fixture: ComponentFixture<AperturaCajaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AperturaCajaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AperturaCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
