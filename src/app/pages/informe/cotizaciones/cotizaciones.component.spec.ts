import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizacionesComponent } from './cotizaciones.component';

describe('CotizacionesComponent', () => {
  let component: CotizacionesComponent;
  let fixture: ComponentFixture<CotizacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CotizacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CotizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
