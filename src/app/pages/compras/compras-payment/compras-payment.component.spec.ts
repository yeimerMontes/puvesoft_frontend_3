import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprasPaymentComponent } from './compras-payment.component';

describe('ComprasPaymentComponent', () => {
  let component: ComprasPaymentComponent;
  let fixture: ComponentFixture<ComprasPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComprasPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComprasPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
