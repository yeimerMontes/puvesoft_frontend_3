import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizacionCompleteComponent } from './cotizacion-complete.component';

describe('CotizacionCompleteComponent', () => {
  let component: CotizacionCompleteComponent;
  let fixture: ComponentFixture<CotizacionCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CotizacionCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CotizacionCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
