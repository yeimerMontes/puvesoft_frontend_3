import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditoCompraComponent } from './credito-compra.component';

describe('CreditoCompraComponent', () => {
  let component: CreditoCompraComponent;
  let fixture: ComponentFixture<CreditoCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditoCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditoCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
