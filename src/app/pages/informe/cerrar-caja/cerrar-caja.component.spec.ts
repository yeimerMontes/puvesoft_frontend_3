import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarCajaComponent } from './cerrar-caja.component';

describe('CerrarCajaComponent', () => {
  let component: CerrarCajaComponent;
  let fixture: ComponentFixture<CerrarCajaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CerrarCajaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CerrarCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
