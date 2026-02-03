import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizacionIndexComponent } from './cotizacion-index.component';

describe('CotizacionIndexComponent', () => {
  let component: CotizacionIndexComponent;
  let fixture: ComponentFixture<CotizacionIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CotizacionIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CotizacionIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
