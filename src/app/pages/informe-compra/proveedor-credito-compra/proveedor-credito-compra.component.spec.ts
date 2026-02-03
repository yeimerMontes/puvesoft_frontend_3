import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedorCreditoCompraComponent } from './proveedor-credito-compra.component';

describe('ProveedorCreditoCompraComponent', () => {
  let component: ProveedorCreditoCompraComponent;
  let fixture: ComponentFixture<ProveedorCreditoCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProveedorCreditoCompraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorCreditoCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
