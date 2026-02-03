import { of, Observable } from 'rxjs';
import { Component, ViewChild, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersProductoBajaExistencia } from 'src/app/constants/producto';
import { BodegaService } from 'src/app/services/bodega.service';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'producto-baja-existencia',
  templateUrl: './producto-baja-existencia.component.html',
  styleUrls: ['../../../../css/modulo.css', '../../../../css/modulo.css'],
})
export class ProductoBajaExistenciaComponent implements OnInit {
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Lista de Productos de Baja Existencia';
  headers: headersMasterInterface[] = headersProductoBajaExistencia;
  paginas: { [key: number]: number } = {}; // Para almacenar la página actual de cada bodega

  habilitar: string;
  habilitarInsumos: string = 'display:none;';
  habilitarProductos: string;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  /* Variables multiselect */
  selectedItemsImpuesto = [];

  private _dataPdf: any[] = [];
  private _data = [];
  private _dataBodega: any[] = [];

  selects: number[] = selectsPagination;
  timeClear: any;

  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;
  loaded_search = false;
  loadedInsumo: boolean;

  pagesInsumo;
  pageInsumo = 1;
  totalInsumo = 0;

  pages: Observable<any[]>;
  page = 1;
  total = 0;
  store: number = 0;
  paginateBodega: number;
  prevTemplate;

  sucursal: any;

  usarDecimales: Number = 1;
  titleInsumo: String;
  medida: String;
  total_preparacion: String;
  imagenProducto: string;
  website = '';

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private productoService: ProductoService,
    private sucursalService: SucursalService,
    private funcionesService: FuncionesService,
    private exportarExcelService: ExportarExcelService,
    private bodegaService: BodegaService,
    @Inject(DOCUMENT) document: any
  ) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this.website = environmentConfig.website;
  }

  onSuccess(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: '' + mensaje + ' !',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: 'Ya existe!',
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }

  ngOnInit() {
    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getSucural();
    this.getBodegas();
    this.getProductos(1);
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.productoService
      .getProductosBajaExistenciaPorPagina('', '', '', 'No', this.store)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, 'Productos');
      });
  }

  public getBodegas(): void {
    this.bodegaService.getBodegaPermisos(0).subscribe((resp) => {
      this._dataBodega = resp.data;
    });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.productoService
      .getProductosBajaExistenciaPorPagina('', '', '', 'No', this.store)
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    try {
      this.sucursal = JSON.parse(
        decodeURIComponent(atob(localStorage.getItem(btoa('sucursal'))))
      );
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

  get dataPdf() {
    return this._dataPdf;
  }

  get dataBodega() {
    return this._dataBodega;
  }

  getProductos(page): void {
    //this.loaded = false;
    this.loaded_search = false;
    this.productoService
      .getProductosBajaExistenciaPorPagina(
        1,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        this.store
      )
      .subscribe((resp) => {
        // this.total = resp.data.total;

        this._data = resp.data;

        if (this.loaded == false) {
          // Inicializar las páginas para cada bodega en 1
          resp.data.forEach((bodega) => {
            this.paginas[bodega.id] = 1;
          });
        }

        this.loaded = true;
        this.loaded_search = true;
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getProductos(1);
  }

  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  next() {
    this.pages.subscribe((resp) => {
      if (this.page < resp.length) {
        this.getProductos(this.page + 1);
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getProductos(this.page - 1);
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductos(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  closeModal2() {
    this.childModal2?.hide();
  }

  openModal2() {
    this.childModal2?.show();
    this.generatePdf();
  }

  searchStoreProduct(data) {
    this.store = data != 0 ? data : 0;

    this.getProductos(1);
  }

  paginate(event, cual) {
    this.store;
    this.page = event;
    this.getProductos(this.page);
  }

  // Método para actualizar la página de una bodega específica
  pageChange(bodegaId: number, page: number) {
    // Actualiza la página actual para la bodega específica
    this.paginas[bodegaId] = page;
  }

  convertToNumber(value: any): number {
    return Number(value);
  }
}
