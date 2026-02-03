import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketNotaCreditoComponent } from './ticket-nota-credito.component';

describe('TicketNotaCreditoComponent', () => {
  let component: TicketNotaCreditoComponent;
  let fixture: ComponentFixture<TicketNotaCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketNotaCreditoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketNotaCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
