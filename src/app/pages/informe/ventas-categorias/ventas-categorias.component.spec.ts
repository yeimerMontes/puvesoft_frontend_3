import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasCategoriasComponent } from './ventas-categorias.component';

describe('VentasCategoriasComponent', () => {
  let component: VentasCategoriasComponent;
  let fixture: ComponentFixture<VentasCategoriasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentasCategoriasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentasCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
