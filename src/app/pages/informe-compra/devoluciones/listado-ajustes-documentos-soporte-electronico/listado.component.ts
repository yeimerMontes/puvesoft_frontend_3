import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { selectsPagination } from 'src/app/constants/selects';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { headersDevolucionesNotasElectronicas } from 'src/app/constants/devoluciones-notas_electronicas';
import { ActivatedRoute } from '@angular/router';
import { DevolucionesComprasService } from 'src/app/services/devoluciones-compras.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['../../../informe/informe.component.css', '../../../../css/modulo.css'],
})
export class ListadoAjusteDocumentoSoporteElectronicoComponent implements OnInit {
  @ViewChild('staticModal4', { static: false }) childModal4?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })

  childModalPdf?: ModalDirective;

  titleModule: string = 'Historial Notas de Ajustes a Documentos Soporte';
  headers: headersMasterInterface[] = headersDevolucionesNotasElectronicas;

  size: FormGroup;
  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataUsuario: any[] = [];
  private _dataCategoria: any[] = [];
  private _dataReport: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _dataVentaPorMetodoPago: any[] = [];
  private _dataVentaPorMesa: any[] = [];
  dataFactura: any = {};
  selects: number[] = selectsPagination;

  private _data = [];

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  idInvoice = null;

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

  usarDecimales: Number = 1;
  tipoSucursal: any;
  totalVenta: string = '0';
  totalVentaMetodoPago: string = '0';
  totalVentaMesa: string = '0';
  totalGastoPdf: string = '0';
  busquedaPorCodigo: String = '';
  erroresDianFactura: String = '';

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;
  total_registros: any;
  last_page: any;
  valorTotal: any;

  invoiceType: String;
  invoiceTypeNote: String;
  idDetalleCredito = null;
  showTicket = false;
  showTicketNotaCredito = false;
  idNotaCredito = null;
  
  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;


  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private devolucionesService: DevolucionesComprasService,
    private metodoPagoServise: MetodoPagoService,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
  ) { }

  ngOnInit() {


    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      usuario: ['', []],
      field: ['', []],
      metodo_pago: ['', []],
    });
    this.fechaActual();
    this.getUsuarios();
    this.getMetodoPago();
    this.getSucural();

    // Suscribirse a cambios en los parámetros de la ruta
    this.activeRoute.paramMap.subscribe(params => {
      this.invoiceType = params.get('type');
      this.invoiceTypeNote = params.get('type_note');

      this.getHistorial(1, 1);
    });


  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  getMetodoPago() {
    this.metodoPagoServise.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
    });
  }

  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  
  getUsuarios() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataUsuario = resp.data;
    });
  }

  generateExcel() {
    this.getHistorial(1, 1, TypeReport.excel);
  }

  generatePdf() {
    this.getHistorial(1, 1, TypeReport.pdf);
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

  getHistorial(page, type, typeReport: TypeReport = TypeReport.noReport): void {
        let fecha_i = '';
    let fecha_f = '';
    let hora_i = '';
    let hora_f = '';
    let usuario = '';


    if (!this.search.controls.field.value) {
      fecha_i = this.search.controls.fecha_inicial.value;
      fecha_f = this.search.controls.fecha_final.value;
      hora_i = this.search.controls.hora_inicial.value;
      hora_f = this.search.controls.hora_final.value;
      usuario = this.search.controls.usuario.value;
    }

    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, this.total_registros,  fecha_i,
        fecha_f,
        hora_i,
        hora_f,
        usuario, typeReport);
      return;
    }

    if (!this.search.controls.field.value && type != 3) {
      this.loaded = false;
    }

    this.getService(page, this.size.controls.data.value, fecha_i,
        fecha_f,
        hora_i,
        hora_f,
        usuario);
  }

  count = 0;

  getService(
    page,
    perPage,
     fecha_i,
    fecha_f,
    hora_i,
    hora_f,
    usuario,
    typeReport: TypeReport = TypeReport.noReport
  ): void {
    this.devolucionesService
      .getHistorialNotasAjustesDcoumentSoportesElectronica(
        page,
         fecha_i,
        fecha_f,
        hora_i,
        hora_f,
        usuario,
        perPage,
        this.search.controls.field.value,
        typeReport,
        this.search.controls.metodo_pago.value,
        this.invoiceType,
        this.invoiceTypeNote
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Notas Créditos Pos'
            );
          }
          return;
        }

        this.total_registros = resp.data.total;
        this._data = resp.data.data;
        this.loaded = true;
        this.count++;
        
        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;

        this.last_page = resp.data.last_page;
        this.valorTotal = resp.total;
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    this.getHistorial(1, 1);
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  closeModal2() {
    this.childModalPdf?.hide();
  }

  closeModal4() {
    this.childModal4?.hide();
  }

  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  openModal(item, accion: number) {
    this.dataFactura = item;
    switch (accion) {
      case 4:
        this.erroresDianFactura = '';
        this.childModal4?.show();
        this.erroresDianFactura = item.errorMessages;
        break;
      default:
        break;
    }
  }


  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getHistorial(1, 3);
    }, 360);
  }


  getColorState(estado: number) {
    return this.funcionesService.getColorState(estado);
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

  buscarHistorialVencimiento() {
    let fecha_inicial_vencimiento =
      this.search.controls.fecha_inicial_vencimiento.value;
    let fecha_final_vencimiento =
      this.search.controls.fecha_final_vencimiento.value;

    if (!(fecha_inicial_vencimiento || fecha_final_vencimiento)) {
      this.onSuccess(
        'Debe diligenciar las fechas de vencimiento',
        'Diligencie los rangos de fecha de vencimiento para poder consultar el historial de vencimiento...',
        TypeAlert.warning
      );
      return;
    }

    if (!fecha_inicial_vencimiento && fecha_final_vencimiento) {
      this.onSuccess(
        'Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha inicial de vencimiento para poder consultar los vencimientos...',
        TypeAlert.warning
      );
      return;
    }

    if (fecha_inicial_vencimiento && !fecha_final_vencimiento) {
      this.onSuccess(
        'Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha final de vencimiento para poder consultar los vencimientos...',
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.getHistorial(1, 1);
    }
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';
    this.search.controls.field.setValue('');

    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;
    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
    this.horaInicial = this.search.controls.hora_inicial.value;
    this.horaFinal = this.search.controls.hora_final.value;

    if (!(fecha_inicial || fecha_final)) {
      this.onSuccess(
        'Debe diligenciar las fechas',
        'Diligencie los rangos de fecha para poder consultar el historial de devoluciones...',
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.getHistorial(1, 1);
    }
  }

  openModalDetalle(item) {
    this.idDetalleCredito = item.id;
    this.showTicket = true;
  }

  closeModalDetalle(value: string) {
    this.idDetalleCredito = null;
    this.showTicket = false;
  }

  abrirTicketNotaCredito(id) {
    this.showTicketNotaCredito = true;
    this.idNotaCredito = id;
  }

  closeTicketNotaCredito(value: string) {
    this.showTicketNotaCredito = false;
    this.idNotaCredito = null;
  }


  paginate(event) {
    this.page = event;
    this.getHistorial(this.page, 1);
  }
}
