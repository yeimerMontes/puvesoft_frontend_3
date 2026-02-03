import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizacionPaymentComponent } from './cotizacion-payment.component';

describe('CotizacionPaymentComponent', () => {
  let component: CotizacionPaymentComponent;
  let fixture: ComponentFixture<CotizacionPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CotizacionPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CotizacionPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
