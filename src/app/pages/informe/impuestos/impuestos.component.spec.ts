import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImpuestosComponent } from './impuestoscomponent';


describe('ImpuestosComponent', () => {
  let component: ImpuestosComponent;
  let fixture: ComponentFixture<ImpuestosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpuestosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
