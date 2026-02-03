import { of, Observable } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ImpuestoService } from 'src/app/services/impuesto.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersInventario } from 'src/app/constants/producto';
import { BodegaService } from 'src/app/services/bodega.service';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './ver-inventario.component.html',
})
export class VerInventarioComponent {
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = "Estado del inventario";
  headers: headersMasterInterface[] = headersInventario;

  habilitar: string;
  habilitarInsumos: string = 'display:none;';
  habilitarProductos: string;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];
  private _dataBodega: any[] = [];

  private _idEdit = 0;

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;


  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;
  loadedInsumo: boolean;

  pagesInsumo;
  pageInsumo = 1;
  totalInsumo = 0;

  page = 1;
  pages: number;
  totalItems: number;
  total = 0;

  prevTemplate;

  sucursal: String;
  nit: String;
  direccion: String;
  fecha: String;
  logo: String;
  usarDecimales: Number = 1;
  titleInsumo: String;
  medida: String;
  total_preparacion: String;
  imagenProducto: string;
  total_inventario: any = 0;
  total_general: any = 0;
  store: number = 0;


  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private productoService: ProductoService,
    private sucursalService: SucursalService,
    private funcionesService: FuncionesService,
    private exportarExcelService: ExportarExcelService,
    private bodegaService: BodegaService,


  ) { }

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
      .getInventario('', '', '', 'No', this.store).subscribe(
        resp => {
          this.exportarExcelService.getExportar(resp.data, 'Inventario');
        });
  }


  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.productoService
      .getInventario('', '', '', 'No', this.store)
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      //console.log(resp)
      this.sucursal = resp.data.nombre;
      this.direccion = resp.data.direccion;
      this.nit = resp.data.nit;
      this.fecha = resp.data.fecha;
      this.logo = resp.data.logo;
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  public getBodegas(): void {
    this.bodegaService
      .getBodegaPermisos(0)
      .subscribe((resp) => {
        this._dataBodega = resp.data;
      });
  }



  get dataPdf() {
    return this._dataPdf;
  }

  getProductos(page): void {
    //this.loaded = false;
    this.productoService
      .getInventario(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        this.store
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;

        // this.total = resp.data.total;
        this._data = resp.data.data;
        this.total_inventario = resp.total;
        this.total_general = resp.total_general;
        //console.log(this.usar_decimales);

        //this.dtTrigger.next();
        this.loaded = true;


        //this.pages = of(paginas.slice(1, -1));
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

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductos(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  get dataBodega() {
    return this._dataBodega;
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
    this.titleInforme(data);

    this.getProductos(1);
  }

  titleInforme(data) {
    //consulto el nombre de la bodega
    const codigoData = Number(data);
    const bodega = this.dataBodega.find(b => b.codigo === codigoData);
    if (bodega && bodega.nombre) {
      this.titleModule = 'Estado del inventario - ' + bodega.nombre;
    }else{
      this.titleModule = 'Estado del inventario';

    }
  }

  paginate(event) {
    this.page = event;
    this.getProductos(this.page);
  }
}
