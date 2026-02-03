import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastoFijoComponent } from './gasto-fijo.component';

describe('GastoFijoComponent', () => {
  let component: GastoFijoComponent;
  let fixture: ComponentFixture<GastoFijoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GastoFijoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GastoFijoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
