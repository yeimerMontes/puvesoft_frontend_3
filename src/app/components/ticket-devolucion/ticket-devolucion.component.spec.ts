import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketDevolucionComponent } from './ticket-devolucion.component';

describe('TicketDevolucionComponent', () => {
  let component: TicketDevolucionComponent;
  let fixture: ComponentFixture<TicketDevolucionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketDevolucionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketDevolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
