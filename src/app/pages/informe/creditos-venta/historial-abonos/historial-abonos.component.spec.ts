import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialAbonosComponent } from './historial-abonos.component';

describe('HistorialAbonosComponent', () => {
  let component: HistorialAbonosComponent;
  let fixture: ComponentFixture<HistorialAbonosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialAbonosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialAbonosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
