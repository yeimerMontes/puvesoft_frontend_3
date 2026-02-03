import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonarComponent } from './abonar.component';

describe('AbonarComponent', () => {
  let component: AbonarComponent;
  let fixture: ComponentFixture<AbonarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbonarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbonarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
