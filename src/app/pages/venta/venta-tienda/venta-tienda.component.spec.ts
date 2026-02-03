import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaTiendaComponent } from './venta-tienda.component';

describe('VentaTiendaComponent', () => {
  let component: VentaTiendaComponent;
  let fixture: ComponentFixture<VentaTiendaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaTiendaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaTiendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
