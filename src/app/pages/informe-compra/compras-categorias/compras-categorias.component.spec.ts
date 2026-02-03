import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComprasCategoriasComponent } from './compras-categorias.component';


describe('ComprasCategoriasComponent', () => {
  let component: ComprasCategoriasComponent;
  let fixture: ComponentFixture<ComprasCategoriasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComprasCategoriasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComprasCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
