import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketGastoComponent } from './ticket-gasto.component';

describe('TicketGastoComponent', () => {
  let component: TicketGastoComponent;
  let fixture: ComponentFixture<TicketGastoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketGastoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
