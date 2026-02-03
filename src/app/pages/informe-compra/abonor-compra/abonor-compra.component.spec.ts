import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonorCompraComponent } from './abonor-compra.component';

describe('AbonorCompraComponent', () => {
  let component: AbonorCompraComponent;
  let fixture: ComponentFixture<AbonorCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbonorCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbonorCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
