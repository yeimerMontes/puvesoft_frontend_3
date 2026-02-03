import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCajaComponent } from './historial-caja.component';

describe('HistorialCajaComponent', () => {
  let component: HistorialCajaComponent;
  let fixture: ComponentFixture<HistorialCajaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialCajaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
