import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAbonosCompraComponent } from './ticket-abonos-compra.component';

describe('TicketAbonosCompraComponent', () => {
  let component: TicketAbonosCompraComponent;
  let fixture: ComponentFixture<TicketAbonosCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketAbonosCompraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketAbonosCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
