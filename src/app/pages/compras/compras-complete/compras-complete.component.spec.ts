import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprasCompleteComponent } from './compras-complete.component';

describe('ComprasCompleteComponent', () => {
  let component: ComprasCompleteComponent;
  let fixture: ComponentFixture<ComprasCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComprasCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComprasCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
