import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleItemNotaCreditoComponent } from './detalle-item-nota-credito.component';

describe('DetalleItemNotaCreditoComponent', () => {
  let component: DetalleItemNotaCreditoComponent;
  let fixture: ComponentFixture<DetalleItemNotaCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleItemNotaCreditoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleItemNotaCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
