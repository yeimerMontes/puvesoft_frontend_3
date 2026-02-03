import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAbonosComponent } from './ticket-abonos.component';

describe('TicketAbonosComponent', () => {
  let component: TicketAbonosComponent;
  let fixture: ComponentFixture<TicketAbonosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketAbonosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketAbonosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
