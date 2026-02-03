import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketDevolucionCompraComponent } from './ticket-devolucion.component';

describe('TicketDevolucionCompraComponent', () => {
  let component: TicketDevolucionCompraComponent;
  let fixture: ComponentFixture<TicketDevolucionCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketDevolucionCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketDevolucionCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
