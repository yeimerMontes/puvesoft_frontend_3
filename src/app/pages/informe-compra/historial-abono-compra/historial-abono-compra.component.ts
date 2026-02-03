import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { selectsPagination } from 'src/app/constants/selects';
import Swal from 'sweetalert2';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { Router } from '@angular/router';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { CreditosComprasService } from 'src/app/services/creditos-compras.service';
import { headersHistorialAbonoCompra } from 'src/app/constants/historial-abono-compra';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-historial-abono-compra',
  templateUrl: './historial-abono-compra.component.html',
  styleUrls: ['../../informe/informe.component.css', '../../../css/modulo.css'],
})
export class HistorialAbonoCompraComponent implements OnInit {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Historial de Abonos';
  headers: headersMasterInterface[] = headersHistorialAbonoCompra;

  form: FormGroup;
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataUsuario: any[] = [];
  private _dataReport: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _pricesTotales;

  private _data = [];
  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;

  page = 1;
  pages: number;
  totalItems: number;

  total = 0;
  maxSize;
  nextTemplate;
  total_registros;

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
  last_page: any;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  showTicket = false;
  idInvoice = null;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private metodoPagoServise: MetodoPagoService,
    private creditosComprasService: CreditosComprasService,
    private router: Router,
    private userService: UserService,
  ) {}

  onSuccess(mensaje: string, title: string, tipo: TypeAlert): void {
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

  ngOnInit() {
    this.form = this.formBuilder.group({
      metodo_pago: [null, []],
      valores_abonar: this.formBuilder.array([]),
    });

    this.search = this.formBuilder.group({
      field: ['', []],
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      usuario: ['', []],
      metodo_pago: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getSucural();
    this.getUsuarios();
    this.getMetodoPago();
    this.getHistorial(1, 1);
    this.fechaActual();
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

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

  generateExcel() {
    this.getHistorial(1, 1, TypeReport.excel);
  }

  generatePdf() {
    this.getHistorial(1, 1, TypeReport.pdf);
  }

  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.tipoSucursal = resp.data.tipo_sucursal;

      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  getMetodoPago() {
    this.metodoPagoServise.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
    });
  }

  getUsuarios() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataUsuario = resp.data;
    });
  }

  get data() {
    return this._data;
  }

  get dataUsuario() {
    return this._dataUsuario;
  }

  get dataMetodoPago() {
    return this._dataMetodoPago;
  }

  get dataReport() {
    return this._dataReport;
  }

  get pricesTotales() {
    return this._pricesTotales;
  }

  get valores_abonar() {
    return this.form.get('valores_abonar') as FormArray;
  }

  private getService(
    page,
    perPage,
    fecha_i,
    fecha_f,
    hora_i,
    hora_f,
    usuario,
    typeReport: TypeReport = TypeReport.noReport,
  ): void {
    let paginate = '';
    if (typeReport != TypeReport.noReport) {
      paginate = 'no';
    }

    this.creditosComprasService
      .getAbonosCreditosAll(
        page,
        paginate,
        fecha_i,
        fecha_f,
        hora_i,
        hora_f,
        usuario,
        perPage,
        this.search.controls.metodo_pago.value,
        this.search.controls.field.value,
      )
      .subscribe((resp) => {
        if (typeReport == TypeReport.noReport) {
          this.page = resp.data.current_page;
          this._data = resp.data.data;
          this.loaded = true;

          this.totalItems = resp.data.total;
          this.pages = resp.data.last_page;
          this.last_page = resp.data.last_page;
        }
        this.total_registros = resp.data.total;
        this._pricesTotales = resp.total;

        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial de abonos',
            );
          }
        }
      });
  }

  getHistorial(page, type, typeReport: TypeReport = TypeReport.noReport): void {
    let fecha_i = this.search.controls.fecha_inicial.value;
    let fecha_f = this.search.controls.fecha_final.value;
    let hora_i = this.search.controls.hora_inicial.value;
    let hora_f = this.search.controls.hora_final.value;
    let usuario = this.search.controls.usuario.value;

    if (typeReport != TypeReport.noReport) {
      this.getService(
        page,
        '',
        fecha_i,
        fecha_f,
        hora_i,
        hora_f,
        usuario,
        typeReport,
      );
      this.loaded2 = false;
      return;
    }

    if (!this.search.controls.field.value && type != 3) {
      this.loaded = false;
    }
    this.getService(
      page,
      this.size.controls.data.value,
      fecha_i,
      fecha_f,
      hora_i,
      hora_f,
      usuario,
    );
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getHistorial(1, 3);
    }, 360);
  }

  buscarHistorial() {
    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;

    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;

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
  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    this.getHistorial(1, 1);
  }

  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  cleanData() {
    this.search.reset({});
  }

  goBack() {
    this.router.navigate(['/informe-compras/creditos']);
  }

  closeModal() {
    this.childModal?.hide();
  }

  closeModalPdf() {
    this.childModalPdf?.hide();
  }

  openModal(item) {
    this.childModal?.show();
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  getColorState(estado) {
    switch (estado) {
      case 1:
        return '#689975';
      case 2:
        return '#f49b00';
      case 3:
        return '#df6868';
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
    this.getHistorial(this.page, 1);
  }
}
