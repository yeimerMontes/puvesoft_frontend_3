import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import {
  estadosCreditos,
  selectsPagination,
  tipoFactura,
} from 'src/app/constants/selects';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersHistorialVenta } from 'src/app/constants/historial-ventas';
import { Router } from '@angular/router';
import { FuncionService } from 'src/app/services/funcion.service';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: [
    '../../informe.component.css',
    '../../../../css/modulo.css',
    '../../drowpbutton.css',
  ],
})
export class ListadoComponent implements OnInit {
  @ViewChild('staticModal1', { static: false }) childModal1?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModal3', { static: false }) childModal3?: ModalDirective;
  @ViewChild('staticModal4', { static: false }) childModal4?: ModalDirective;

  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Historial de ventas - Recibos';
  headers: headersMasterInterface[] = headersHistorialVenta;

  disabled = false;

  formAnular: FormGroup;
  formDevolver: FormGroup;
  formObservacion: FormGroup;
  search: FormGroup; //variable que controla el formulario
  searchCodCredito: FormGroup; //variable que controla el formulario
  size: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario
  formConvertirRecibo: FormGroup; //variable que controla el formulario

  private _dataReport: any[] = [];
  private _dataFactura: any = {};
  private _dataMetodoPago: any[];
  private _dataUsuario;
  private _dataProductosFactura: any;
  private _totales: any = {};

  selects: number[] = selectsPagination;
  estados: any[] = estadosCreditos;
  tipoFactura: any[] = tipoFactura;

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

  prevTemplate;

  usarDecimales: Number = 1;
  totalVenta: string = '0';
  totalVentaMetodoPago: string = '0';
  totalVentaMesa: string = '0';
  totalGastoPdf: string = '0';
  busquedaPorCodigo: String = '';

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;

  showTicket = false;
  showTicketVentaCarta = false;
  formatTiket: number;
  idInvoice = null;
  disabledEnvioDian = false;

  last_page = 0;

  currentPage = 1;
  hasDevolucion = false;

  showApertura: false;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;
  sucursal: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private historialVentaService: HistorialVentaService,
    private metodoPagoServise: MetodoPagoService,
    private userService: UserService,
    private router: Router,
    private funcionService: FuncionService,
  ) {}

  ngOnInit() {
    this.formAnular = this.formBuilder.group({
      motivo: ['', []],
    });

    this.formDevolver = this.formBuilder.group({
      factura: ['', []],
      metodo_pago: ['', []],
      prds: this.formBuilder.array([]),
    });

    this.formConvertirRecibo = this.formBuilder.group({
      tipo_factura: ['', []],
    });

    this.formObservacion = this.formBuilder.group({
      observacion: ['', []],
    });

    this.formMetodoPago = this.formBuilder.group({
      metodo_pago: ['', []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      usuario: ['', []],
      metodo_pago: ['', []],
      tipo_factura: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.searchCodCredito = this.formBuilder.group({
      field: ['', []],
    });
    this.fechaActual();
    this.getSucural();
    this.getMetodoPago();
    this.getUsuarios();
    this.getHistorial(1, 1);
  }

  getMetodoPago() {
    this.metodoPagoServise.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
    });
  }

  background(estado_id) {
    return estado_id == 5 ? 'rgb(0 136 159 / 17%)' : '';
  }

  getUsuarios() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataUsuario = resp.data;
    });
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
      this.sucursal = resp.data;
      this.usarDecimales = resp.data.usar_decimales;
      this.formatTiket = resp.data.formato_ticket;
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

  get totales() {
    return this._totales;
  }

  get dataMetodoPago() {
    return this._dataMetodoPago;
  }

  get dataUsuario() {
    return this._dataUsuario;
  }

  get prds() {
    return this.formDevolver.get('prds') as FormArray;
  }

  get dataProductosFactura() {
    return this._dataProductosFactura;
  }

  count = 0;

  getService(
    page,
    type,
    perPage,
    typeReport: TypeReport = TypeReport.noReport,
    isExcel = false,
  ) {
    this.historialVentaService
      .getHistorialVentaPorPagina(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.usuario.value,
        this.search.controls.metodo_pago.value,
        this.search.controls.tipo_factura.value,
        perPage,
        this.searchCodCredito.controls.field.value,
        typeReport,
        1, //factura POS
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Ventas',
            );
          }
          return;
        }

        this.total_registros = resp.data.total;
        this.page = resp.data.current_page;
        this._data = resp.data.data.data;
        this.loaded = true;
        this.count++;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        if (this.page == 1) {
          this._totales = resp.total;
        }

        this.last_page = resp.data.last_page;
      });
  }

  pageClicked = 0;
  getHistorial(
    page,
    type,
    typeReport: TypeReport = TypeReport.noReport,
    isExcel = false,
  ): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, type, this.total_registros, typeReport);
      return;
    }
    if (
      !this.searchCodCredito.controls.field.value &&
      !this.hasDevolucion &&
      type != 3
    ) {
      this.loaded = false;
    }
    this.pageClicked = page;
    this.getService(page, type, this.size.controls.data.value);
  }

  generateProductos() {
    this.formDevolver.patchValue({ factura: this._dataFactura.id });
    this._dataProductosFactura.forEach((element, index) => {
      const dis = element.devolucion == element.cantidad ? true : false;

      const producto = this.formBuilder.group({
        factura_venta_detalle_id: new FormControl(element.id),
        producto_id: new FormControl(element.producto_id),
        cantidad_devolver: new FormControl({ value: '', disabled: dis }),
        por_des: new FormControl(element.por_des),
        valor_venta: new FormControl(element.valor_venta),
      });

      this.prds.push(producto);
      if (element.devolucion == element.cantidad) {
        this.prds.get([index]).disable();
      }
    });
  }

  private getProductosByIdFactura(item) {
    this.historialVentaService
      .getDetalleFacturaVenta(item.id)
      .subscribe((resp) => {
        this.cleanData2();
        this._dataFactura = item;
        this._dataProductosFactura = resp.data;

        this.generateProductos();
      });
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

  cleanData1() {
    this.formAnular.reset({
      motivo: '',
    });
  }

  cleanData2() {
    this.formDevolver.patchValue({
      factura: '',
      metodo_pago: null,
    });
    this.prds.clear();
  }

  cleanData3() {
    this.formObservacion.reset({
      observacion: '',
    });
  }

  closeModal1() {
    this.childModal1?.hide();
  }

  closeModal2() {
    this.childModal2?.hide();
  }
  closeModal3() {
    this.childModal3?.hide();
  }

  closeModal4() {
    this.childModal4?.hide();
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

  anular() {
    this.disabled = true;

    this.historialVentaService
      .anularFacturaVenta(
        this._dataFactura.id,
        this.formAnular.get('motivo').value,
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Factura Anulada',
            'Se ha anulado la factura con éxito',
            TypeAlert.success,
          );
          this.getHistorial(1, 1);
          this.disabled = false;
        },
        (error) => {
          this.onSuccess(
            'Factura No Anulada!',
            error.error.message,
            TypeAlert.warning,
          );
          this.disabled = false;
        },
      );
    this.closeModal1();
  }

  devolver() {
    this.disabled = true;
    this.hasDevolucion = false;
    let mayor = false;
    let menor = false;

    this.prds.controls.forEach((element, index) => {
      if (element.get('cantidad_devolver').value) {
        this.hasDevolucion = true;
      }

      if (
        element.get('cantidad_devolver').value >
        this.dataProductosFactura[index].cantidad -
          this.dataProductosFactura[index].devolucion
      ) {
        mayor = true;
      }

      if (
        element.get('cantidad_devolver').value &&
        element.get('cantidad_devolver').value <= 0
      ) {
        menor = true;
      }
    });

    if (!this.hasDevolucion) {
      this.onSuccess(
        'Debe ingresar por lo menos una devolución',
        'Diligencie por lo menos una devolución a una factura para poder realizar la acción de devolver...',
        TypeAlert.warning,
      );
      this.disabled = false;
      return;
    }

    if (mayor) {
      this.onSuccess(
        'Error en la cantidad a devolver',
        'Verifique las cantidades a devolver, estas no pueden exceder las unidades restantes...',
        TypeAlert.warning,
      );
      this.disabled = false;
      return;
    }

    if (menor) {
      this.onSuccess(
        'Error en la cantidad a devolver',
        'Verifique las cantidades a devolver, estas no pueden ser menores o igual a 0',
        TypeAlert.warning,
      );
      this.disabled = false;
      return;
    }

    this.historialVentaService
      .devolucionFacturaVenta(
        this.formDevolver.value,
        this.formDevolver.get('metodo_pago').value,
        this._dataFactura.id,
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Productos devueltos',
            'Se ha realizado las devoluciones de los productos con éxito',
            TypeAlert.success,
          );
          this.router.navigate(['/informe', 'devoluciones']);
          this.disabled = false;
        },
        (error) => {
          const mensaje =
            error?.error?.message ||
            error?.message ||
            'Ocurrió un error inesperado';

          this.onSuccess(
            'Error al devolver los productos!',
            mensaje,
            TypeAlert.warning,
          );

          this.disabled = false;
        },
      );
    this.closeModal2();
  }

  observacion() {
    this.disabled = true;

    this.historialVentaService
      .observacionFacturaVenta(
        this._dataFactura.id,
        this.formObservacion.get('observacion').value,
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Observación a la factura realizada',
            'Se ha realizado la observación a la factura con éxito',
            TypeAlert.success,
          );
          this.getHistorial(1, 1);
          this.disabled = false;
        },
        (_) => {
          this.onSuccess(
            'Observación No Realizada!',
            'Ocurrió un error',
            TypeAlert.warning,
          );
          this.disabled = false;
        },
      );
    this.closeModal3();
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';
    this.searchCodCredito.controls.field.setValue('');

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
        TypeAlert.warning,
      );
      return;
    } else {
      this.loaded = true;
      this.getHistorial(1, 1);
    }
  }

  openModal(item, accion: number) {
    this._dataFactura = item;

    switch (accion) {
      case 1:
        if (item.estado_id == 3) {
          this.onSuccess(
            'La factura fue anulada',
            'Motivo: ' + item.motivo_anulacion,
            TypeAlert.warning,
          );
          return;
        }
        this.cleanData1();
        this.childModal1?.show();
        break;
      case 2: // Devolucion
        if (item.estado_id == 2) {
          this.onSuccess(
            'La factura está en proceso',
            'No puede realizar devoluciones a una factura en proceso',
            TypeAlert.warning,
          );
          return;
        } else if (item.estado_id == 3) {
          this.onSuccess(
            'La factura fue anulada',
            'No puede realizar devoluciones a una factura anulada',
            TypeAlert.warning,
          );
          return;
        } else {
          this.cleanData2();
          this.getProductosByIdFactura(item);
          this.childModal2?.show();
        }
        break;
      case 3:
        this.cleanData3();
        this.childModal3?.show();
        this.formObservacion.reset({
          observacion: item.motivo_observacion,
        });
        break;
      case 4: //reenvio de factura a la Dian
        this.idInvoice = item.id;
        this.formConvertirRecibo.reset({
          tipo_factura: '',
        });
        this.childModal4?.show();
        break;
      default:
        break;
    }
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  getColorState(estado: number) {
    return this.funcionesService.getColorState(estado);
  }

  imprimirTicket(item) {
    this.showTicket = true;
    this.idInvoice = item.id;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  imprimirTicketCarta(item) {
    this.showTicketVentaCarta = true;
    this.idInvoice = item.id;
  }

  closeTicketCarta(value: string) {
    this.showTicketVentaCarta = false;
  }

  ///gestiono el reenvio de la factura electronica cuando la DIAN EST EN MANTENIMIENTO
  electronicInvoiceDian() {
    if (
      this.formConvertirRecibo.controls.tipo_factura.value == null ||
      this.formConvertirRecibo.controls.tipo_factura.value == ''
    ) {
      this.funcionService.onSuccess(
        'Debe escoger el tipo de factura a  la que sera convertido el recibo...',
        'error',
        'Advertencia!',
      );
      return;
    }

    let msj = '';
    if (this.formConvertirRecibo.controls.tipo_factura.value == 2) {
      msj = 'POS ELECTRÓNICO';
    } else if (this.formConvertirRecibo.controls.tipo_factura.value == 3) {
      msj = 'FACTURA ELECTRÓNICA';
    }

    Swal.fire({
      title: 'Estás seguro que desea convertir el recibo a ' + msj + '?',
      text:
        'Si continua, el recibo se convertirá en ' +
        msj +
        ' y sera enviado a la DIAN...',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Convertir!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.disabledEnvioDian = true;

        this.historialVentaService
          .convertirRecibo(
            this.idInvoice,
            this.formConvertirRecibo.controls.tipo_factura.value,
          )
          .subscribe(
            (resp) => {
              this.funcionService.onSuccess(resp.message, 'success', '¡OK!');
              ///en el caso que sea exitoso el envio, refrescamos la tabla
              this.getHistorial(1, 1);

              this.disabledEnvioDian = false;
              this.closeModal4();
            },
            (error) => {
              this.disabledEnvioDian = false;
              this.funcionService.onSuccess(
                error.error.data,
                'error',
                error.error.message,
              );
            },
          );
      }
    });
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page, 1);
  }

  toJson(data) {
    return JSON.parse(data);
  }
}
