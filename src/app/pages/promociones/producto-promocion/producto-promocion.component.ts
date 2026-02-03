import { PromocionService } from 'src/app/services/promocion.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Observable } from 'rxjs';
import { selectsPagination } from 'src/app/constants/selects';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'producto-promocion',
  templateUrl: './producto-promocion.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class ProductoPromocionComponent {
  @Output() paso = new EventEmitter<any>();
  @Input() data: any;

  formPorcentaje: FormGroup; //variable que controla el formulario
  formProductos: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  lockbutton: boolean = false;
  loaded = false;
  titleModule = 'Detalle de la promoción';

  dataProductos: any[] = [];
  usarDecimales: Number = 1;
  sucursal: any;
  selectedIndividualItem: boolean = false;
  timeClear: any;

  pages: Observable<any[]>;
  page: number = 1;
  selects: number[] = selectsPagination;
  totalItems: number;

  mostrarSpinner: boolean[] = Array(this.dataProductos.length).fill(false);
  mostrarCheck: boolean[] = Array(this.dataProductos.length).fill(false);
  mostrarError: boolean[] = Array(this.dataProductos.length).fill(false);

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private promocionService: PromocionService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getSucural();
    this.getProductosCategoriaSelect(1);
  }
  paginate(event) {
    this.page = event;
    this.getProductosCategoriaSelect(this.page);
  }

  /* Consulto los productos de las categorias seleccionadas */
  public getProductosCategoriaSelect(page): void {
    this.promocionService
      .getProductosPorcategoriaPromocion(
        this.data,
        page,
        this.search.controls.field.value,
        this.size.controls.data.value
      )
      .subscribe((resp) => {
        this.dataProductos = resp.data.data;
        this.totalItems = resp.data.total;
        this.loaded = true;
      });
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductosCategoriaSelect(1);
    }, 360);
  }

  /* Consulto informacion del sucursal */
  private getSucural(): void {
    try {
      this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
      this.usarDecimales = this.sucursal.usar_decimales;
    } catch (error) {
      this.sucursal = '';
    }
    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        //console.log(resp)
        localStorage.setItem(btoa('sucursal'), btoa(JSON.stringify(resp.data)));
      });
    }
  }

  agregarAlMenu(item: any, index) {
    this.mostrarSpinner[index] = true;
    this.mostrarCheck[index] = false;
    this.mostrarError[index] = false;
    //console.log(item);

    item['idPromocion'] = this.data.idPromocion;
    this.promocionService.addProductoPromocion(item).subscribe(
      (resp) => {
        this.mostrarSpinner[index] = false;
        this.mostrarCheck[index] = true;
      },
      (err) => {
        Swal.fire({
          title: 'Ya existe en otra promocion vigente o proxima!',
          text: 'Encontramos que el producto que desea agregar, se encuentra en otra promoción vigente o proxima!',
          icon: 'warning',
          confirmButtonColor: '#145388',
        });
        this.dataProductos[index].promocion = false;
        this.mostrarSpinner[index] = false;
        this.mostrarCheck[index] = false;
        this.mostrarError[index] = true;
      }
    );
  }


  modificarPorcentaje(index, item, por_descuento) {
    this.mostrarSpinner[index] = true;
    this.mostrarCheck[index] = false;
    this.mostrarError[index] = false;

    item.por_descuento = por_descuento;
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.promocionService.updatePrecioPromocion(item).subscribe(
        (resp) => {
          this.mostrarSpinner[index] = false;
          this.mostrarCheck[index] = true;

          this.dataProductos[index].nuevo_valor_venta =
          item.valor_venta - item.valor_venta * (item.por_descuento / 100);
        },
        (err) => {
          alert('Ocurrió un error');
          this.mostrarSpinner[index] = false;
          this.mostrarCheck[index] = false;
          this.mostrarError[index] = true;
        }
      );
    }, 360);
  }

  llamar() {
    //this.loaded = false;
    this.page = 1;
    this.getProductosCategoriaSelect(1);
  }

  atras() {
    this.paso.emit({
      idPromocion: this.data.idPromocion,
      paso: 1,
    });
  }

  siguiente() {
    this.paso.emit({
      idPromocion: this.data.idPromocion,
      paso: 3,
    });
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }
  /**
   * Comprueba que UN campo sea válido, por parámetro se le pasa el campo a evaluar
   *
   * @param campo string
   * @returns boolean
   */
  campoEsValido(campo: string) {
    return (
      this.formPorcentaje.controls[campo].errors &&
      this.formPorcentaje.controls[campo].touched
    );
  }
}
