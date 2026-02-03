import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialAbonoCompraComponent } from './historial-abono-compra.component';

describe('HistorialAbonoCompraComponent', () => {
  let component: HistorialAbonoCompraComponent;
  let fixture: ComponentFixture<HistorialAbonoCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorialAbonoCompraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialAbonoCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
