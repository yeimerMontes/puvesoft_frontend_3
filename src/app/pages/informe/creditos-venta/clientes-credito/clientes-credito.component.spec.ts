import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesCreditoComponent } from './clientes-credito.component';

describe('ClientesCreditoComponent', () => {
  let component: ClientesCreditoComponent;
  let fixture: ComponentFixture<ClientesCreditoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientesCreditoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
