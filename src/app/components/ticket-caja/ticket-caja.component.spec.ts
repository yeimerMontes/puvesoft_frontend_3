import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketCajaComponent } from './ticket-caja.component';

describe('TicketCajaComponent', () => {
  let component: TicketCajaComponent;
  let fixture: ComponentFixture<TicketCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketCajaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
