import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { selectsPagination, tipoSeguimiento } from 'src/app/constants/selects';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { ProductoSeguimientoService } from 'src/app/services/seguimiento.service';
import { headersSeguimientoProducto } from 'src/app/constants/seguimiento_producto';
import { ProductoService } from 'src/app/services/producto.service';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css'],
})
export class ListadoComponent implements OnInit {
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Seguimiento a productos';
  headers: headersMasterInterface[] = headersSeguimientoProducto;

  formAnular: FormGroup;
  formDevolver: FormGroup;
  formObservacion: FormGroup;
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataReport: any[] = [];
  private _dataFactura: any = {};
  private _dataProducto: any[] = [];

  selects: number[] = selectsPagination;
  estados: any[] = tipoSeguimiento;

  private _data = [];

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;
  loaded = true;
  loaded2 = true;

  page = 1;
  pages: number;
  totalItems: number;

  total = 0;
  maxSize;
  nextTemplate;
  type = 1;
  total_registros;
  productoSeleccionado;

  prevTemplate;

  usarDecimales: Number = 1;
  tipoSucursal: any;
  totalVenta: string = '0';
  totalVentaMetodoPago: string = '0';
  totalVentaMesa: string = '0';
  totalGastoPdf: string = '0';
  busquedaPorCodigo: String = '';

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;

  showTicket = false;
  idInvoice = null;

  last_page = 0;

  currentPage = 1;
  hasDevolucion = false;

  showApertura: false;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;
  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private productoSeguimientoService: ProductoSeguimientoService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      producto: [null, []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.fechaActual();
    this.getSucural();
    this.getHistorial(1, 1);
    this.buscar_nombre('');
  }

  background(estado_id) {
    return estado_id == 5 ? 'rgb(0 136 159 / 17%)' : '';
  }

  closeApertura(event) {}

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.getHistorial(1, 1, TypeReport.excel, true);
  }

  generatePdf() {
    this.getHistorial(1, 1, TypeReport.pdf);
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  get data() {
    return this._data;
  }

  get dataReport() {
    return this._dataReport;
  }

  get dataFactura() {
    return this._dataFactura;
  }

  get dataProducto() {
    return this._dataProducto;
  }

  count = 0;

  getService(
    page,
    type,
    perPage,
    typeReport: TypeReport = TypeReport.noReport,
    isExcel = false
  ) {
    this.productoSeguimientoService
      .getproductoSeguimeintoPorPagina(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.producto.value,
        perPage
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Ventas'
            );
          }
          return;
        }

        this.total_registros = resp.data.total;
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        this.loaded = true;
        this.count++;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        this.last_page = resp.data.last_page;
      });
  }

  pageClicked = 0;
  getHistorial(
    page,
    type,
    typeReport: TypeReport = TypeReport.noReport,
    isExcel = false
  ): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, type, this.total_registros, typeReport);
      return;
    }
    this.loaded = false;
    this.count++;

    this.pageClicked = page;
    this.getService(page, type, this.size.controls.data.value);
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getHistorial(1, this.type);
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
      this.getHistorial(1, 3);
    }, 360);
  }

  closeModalPdf() {
    this.childModalPdf?.hide();
  }

  onSuccess(title: string, mensaje: string, tipo: TypeAlert): void {
    if (tipo == TypeAlert.success) {
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
        title: title,
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }

  /* Para poner la fecha actual */
  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    var fecha_inicial = `${year}-${month}-${day}`;
    var fecha_final = `${year}-${month}-${day}`;
    this.search.controls.fecha_inicial.setValue(fecha_inicial);
    this.search.controls.fecha_final.setValue(fecha_final);
    this.search.controls.hora_inicial.setValue(`00:00`);
    this.search.controls.hora_final.setValue(`23:59`);

    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
    this.horaInicial = `00:00`;
    this.horaFinal = `23:59`;
  }

  buscarHistorial() {
    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;

    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
    this.horaInicial = this.search.controls.hora_inicial.value;
    this.horaFinal = this.search.controls.hora_final.value;

    if (!(fecha_inicial || fecha_final)) {
      this.onSuccess(
        'Debe diligenciar las fechas',
        'Diligencie los rangos de fecha para poder consultar el historial de crédito...',
        TypeAlert.warning
      );
      return;
    }
    if (!this.search.controls.producto.value) {
      this.onSuccess(
        'Debe diligenciar el producto',
        'Por favor diligencie el nombre del producto para poder hacer la busqueda...',
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.getHistorial(1, 1);
    }
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  buscar_nombre(value) {
    this.productoSeleccionado = this.search.controls.producto.value;

    clearTimeout(this.timeClear);
    this.timeClear = setTimeout(() => {
      /* Hago la busqueda */
      this.productoService
        .busquedaPorNombreProductosActivosTraslados(value, 5)
        .subscribe((resp) => {
          this._dataProducto = resp.data;
        });
    }, 360);
  }

  public guardarProducto(item: any): void {
    // Verificamos que item no sea null o undefined (por si limpian el select)
    if (item && item.id) {
      this.search.controls.producto.setValue(item.id);
    } else {
      // Opcional: Si limpian el select, reseteas el control
      this.search.controls.producto.setValue(null);
    }
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page, 1);
  }
}
