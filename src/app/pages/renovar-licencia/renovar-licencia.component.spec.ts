import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenovarLicenciaComponent } from './renovar-licencia.component';

describe('DashboardComponent', () => {
  let component: RenovarLicenciaComponent;
  let fixture: ComponentFixture<RenovarLicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenovarLicenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenovarLicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
