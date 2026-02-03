import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTablasMaestras } from './report-master-tables.component';

describe('AperturaCajaComponent', () => {
  let component: ReporteTablasMaestras;
  let fixture: ComponentFixture<ReporteTablasMaestras>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteTablasMaestras ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteTablasMaestras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
