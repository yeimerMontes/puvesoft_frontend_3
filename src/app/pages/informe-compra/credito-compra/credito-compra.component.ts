import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { headersHistorialCreditoCompra } from 'src/app/constants/historial-credito-compra';
import { estadosCreditos, selectsPagination } from 'src/app/constants/selects';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { CompraService } from 'src/app/services/compra.service';
import { CreditosComprasService } from 'src/app/services/creditos-compras.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-credito-compra',
  templateUrl: './credito-compra.component.html',
  styleUrls: ['../../informe/informe.component.css', '../../../css/modulo.css'],
})
export class CreditoCompraComponent implements OnInit {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Créditos de compras';
  headers: headersMasterInterface[] = headersHistorialCreditoCompra;

  formAnular: FormGroup;
  search: FormGroup; //variable que controla el formulario
  searchCodCredito: FormGroup; //variable que controla el formulario
  size: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataReport: any[] = [];
  private _dataFactura: any = {};
  private _totales: any = {};

  disabled = false;

  selects: number[] = selectsPagination;
  estados: any[] = estadosCreditos;

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

  showTicket = false;
  idInvoice = null;

  last_page = 0;

  currentPage = 1;

  isList = true;
  idAbonar = null;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private compraService: CompraService,
    private creditosComprasService: CreditosComprasService,
  ) {}

  ngOnInit() {
    this.formAnular = this.formBuilder.group({
      motivo: ['', []],
    });
    this.formMetodoPago = this.formBuilder.group({
      metodo_pago: ['', []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      estado: [null, []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.searchCodCredito = this.formBuilder.group({
      field: ['', []],
    });
    this.fechaActual();
    this.getSucural();
    this.getHistorial(1, 1);
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.getHistorial(1, 1, TypeReport.excel);
  }

  generatePdf() {
    this.getHistorial(1, 1, TypeReport.pdf);
  }

  /* Consulto informacion del operador */
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

  count = 0;

  getService(
    page,
    type,
    perPage,
    typeReport: TypeReport = TypeReport.noReport
  ) {
    this.creditosComprasService
      .getCreditosComprasPorPagina(
        type,
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.estado.value,
        perPage,
        typeReport,
        this.searchCodCredito.controls.field.value
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Créditos'
            );
          }
          return;
        }

        this.total_registros = resp.data.total;
        this._data = resp.data.data.data;
        this.loaded = true;
        this.count++;
        if (this.page == 1) {
          this._totales = resp.total;
        }

        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        this.last_page = resp.data.last_page;
      });
  }

  pageClicked = 0;
  getHistorial(page, type, typeReport: TypeReport = TypeReport.noReport): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, type, this.total_registros, typeReport);
      return;
    }
    if (!this.searchCodCredito.controls.field.value) {
      this.loaded = false;
    }
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

  cleanData() {
    this.formAnular.reset({
      motivo: '',
    });
  }

  closeModal() {
    this.childModal?.hide();
  }

  closeModal2() {
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

    this.compraService
      .anularFacturaCompra(
        this._dataFactura.id,
        this.formAnular.get('motivo').value
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Factura Anulada',
            'Se ha anulado la factura con éxito',
            TypeAlert.success
          );
          this.getHistorial(1, 1);
          this.disabled = false;
        },
        (_) => {
          this.onSuccess(
            'Factura No Anulada!',
            'Ocurrió un error',
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
    this.closeModal();
  }

  buscarHistorialVencimiento() {
    this.loaded = true;
    this.type = 2;
    this.getHistorial(1, this.type);
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';
    this.searchCodCredito.controls.field.setValue('');

    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;

    if (!(fecha_inicial || fecha_final)) {
      this.onSuccess(
        'Debe diligenciar las fechas',
        'Diligencie los rangos de fecha para poder consultar el historial de crédito...',
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.type = 1;
      this.getHistorial(1, this.type);
    }
  }

  openModal(item) {
    if (item.estado_id == 3) {
      this.onSuccess(
        'La factura fue anulada',
        'Motivo: ' + item.motivo_anulacion,
        TypeAlert.warning
      );
      return;
    }
    this.cleanData();
    this._dataFactura = item;
    this.childModal?.show();
  }

  abonarLink(id) {
    this.isList = false;
    this.idAbonar = id;
    // this.router.navigate(['/informe-compras/creditos/abonar/' + id]);
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  getColorState(estado: number) {
    switch (estado) {
      case 1:
        return '#689975';
      case 3:
        return '#df6868';
      case 4:
        return '#f49b00';
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

  showList(value: string) {
    this.isList = true;
    if (this.type == 1) {
      this.buscarHistorial();
    } else {
      this.buscarHistorialVencimiento();
    }
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page, 1);
  }
}
