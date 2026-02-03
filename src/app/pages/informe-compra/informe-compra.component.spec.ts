import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeCompraComponent } from './informe-compra.component';

describe('InformeCompraComponent', () => {
  let component: InformeCompraComponent;
  let fixture: ComponentFixture<InformeCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformeCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformeCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
