import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { selectsPagination } from 'src/app/constants/selects';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HistorialCajaService } from 'src/app/services/historial-caja.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersHistorialCaja } from 'src/app/constants/historial-caja';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css',]
})
export class ListadoComponent implements OnInit {

  @ViewChild('staticModalPdf', { static: false }) childModalPdf?: ModalDirective;

  size: FormGroup;
  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  formMetodoPago: FormGroup; //variable que controla el formulario

  titleModule: string = 'Historial Cierres de Caja';
  headers: headersMasterInterface[] = headersHistorialCaja;

  private _dataUsuario: any[] = [];
  private _dataCategoria: any[] = [];
  private _dataReport: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _dataVentaPorMetodoPago: any[] = [];
  private _dataVentaPorMesa: any[] = [];
  selects: number[] = selectsPagination;

  private _data = [];

  timeClear: any;

  showTicket = false;
  idInvoice = null;


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

  prevTemplate;

  sucursal: String;
  nit: String;
  direccion: String;
  fecha: String;
  logo: String;
  imagen: string;
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
  total_registros: any;
  last_page: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private historialCajaService: HistorialCajaService,
  ) { }

  ngOnInit() {

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      fecha_final: ['', []],
      field: ['', []],
    });

    this.fechaActual();
    this,this.getSucural();
    this.getHistorial(1);
  }

  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.sucursal = resp.data.nombre;
      this.direccion = resp.data.direccion;
      this.nit = resp.data.nit;
      this.fecha = resp.data.fecha;
      this.logo = resp.data.logo;
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.getHistorial(1, TypeReport.excel);
  }

  generatePdf() {
    this.getHistorial(1, TypeReport.pdf);

  }

  get data() {
    return this._data;
  }

  get dataVentaPorMetodoPago() {
    return this._dataVentaPorMetodoPago;
  }

  get dataVentaPorMesa() {
    return this._dataVentaPorMesa;
  }

  get dataUsuario() {
    return this._dataUsuario;
  }

  get dataMetodoPago() {
    return this._dataMetodoPago;
  }
  get dataCategoria() {
    return this._dataCategoria;
  }

  get dataReport() {
    return this._dataReport;
  }

  getHistorial(page, typeReport: TypeReport = TypeReport.noReport): void {
    let fecha_i = '';
    let fecha_f = '';

    if (!this.search.controls.field.value) {
      fecha_i = this.search.controls.fecha_inicial.value;
      fecha_f = this.search.controls.fecha_final.value;
    }

    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, this.total_registros, fecha_i, fecha_f, typeReport);
      return;
    }

    if (!this.search.controls.field.value) {
      this.loaded = false;
    }
    
    this.getService(page, this.size.controls.data.value, fecha_i, fecha_f);
  }

  getService(page, perPage, fecha_i, fecha_f, typeReport: TypeReport = TypeReport.noReport): void {
    this.historialCajaService
      .getHistorial(
        page,
        fecha_i,
        fecha_f,
        perPage,
        this.search.controls.field.value,
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Caja'
            );
          }
          return;
        }
        this.total_registros = resp.data.total;
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        this.loaded = true;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        this.last_page = resp.data.last_page;
      });
  }
  
  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    this.getHistorial(1);
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
      this.getHistorial(1);
    }, 360);
  }

  
  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  closeModalPdf() {
    this.childModalPdf?.hide();
  }


  cleanData() {
    this.form.reset({
      categoria: '',
      proveedor: '',
      descripcion: '',
      valor: '',
      sacar_caja: '',
    });
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

  /**
   * Comprueba que UN campo sea válido, por parámetro se le pasa el campo a evaluar
   *
   * @param campo string
   * @returns boolean
   */

  /* Para poner la fecha actual */
  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    this.search.controls.fecha_inicial.setValue(`${year}-${month}-${day}`);
    this.search.controls.fecha_final.setValue(`${year}-${month}-${day}`);
  }

  buscarHistorialVencimiento() {
    let fecha_inicial_vencimiento = this.search.controls.fecha_inicial_vencimiento.value;
    let fecha_final_vencimiento = this.search.controls.fecha_final_vencimiento.value;

    if (!(fecha_inicial_vencimiento || fecha_final_vencimiento)) {
      this.onSuccess('Debe diligenciar las fechas de vencimiento',
        'Diligencie los rangos de fecha de vencimiento para poder consultar el historial de vencimiento...',
        TypeAlert.warning);
      return;
    }

    if (!fecha_inicial_vencimiento && fecha_final_vencimiento) {
      this.onSuccess('Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha inicial de vencimiento para poder consultar los vencimientos...',
        TypeAlert.warning);
      return;
    }

    if (fecha_inicial_vencimiento && !fecha_final_vencimiento) {
      this.onSuccess('Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha final de vencimiento para poder consultar los vencimientos...',
        TypeAlert.warning);
      return;
    }

    else {
      this.loaded = true;
      this.getHistorial(1);
    }
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';
    this.search.controls.field.setValue('');

    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;
    

    if (!(fecha_inicial || fecha_final)) {
      this.onSuccess('Debe diligenciar las fechas',
        'Diligencie los rangos de fecha para poder consultar el historial de devoluciones...',
        TypeAlert.warning);
      return;
    }

    else {
      this.loaded = true;
      this.getHistorial(1);
    }
  }

  imprimirTicket(item) {
    
    this.showTicket = true;
    this.idInvoice = item.id;
    console.log(item, this.showTicket);

  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page);
  }

}
