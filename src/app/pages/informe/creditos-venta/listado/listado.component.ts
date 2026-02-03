import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { estadosCreditos, selectsPagination } from 'src/app/constants/selects';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { CreditosVentasService } from 'src/app/services/creditos-ventas.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersCreditosVentas } from 'src/app/constants/creditos-ventas';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css'],
})
export class ListadoComponent implements OnInit {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Créditos y Plan Separe';
  headers: headersMasterInterface[] = headersCreditosVentas;

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
  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;
  isList = true;
  idAbonar = null;


  pendiente = '';

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private userService: UserService,
    private historialVentaService: HistorialVentaService,
    private creditosVentasService: CreditosVentasService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {

    let urlTree = this.router.parseUrl(this.router.url);

    this.pendiente = urlTree.queryParams['pendiente'];    

    if (!this.pendiente) {
      this.pendiente = '';
    }

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
    this.getHistorial(this.pendiente, 1, 1);
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.getHistorial(this.pendiente, 1, 1, TypeReport.excel);
  }

  generatePdf() {
    this.getHistorial(this.pendiente, 1, 1, TypeReport.pdf);
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

  get totales() {
    return this._totales;
  }

  count = 0;

  getService(
    pendiente,
    page,
    type,
    perPage,
    typeReport: TypeReport = TypeReport.noReport
  ) {
    this.creditosVentasService
      .getCreditosVentasPorPagina(
        pendiente,
        type,
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        perPage,
        this.search.controls.estado.value,
        this.searchCodCredito.controls.field.value,
        typeReport
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
  getHistorial(pendiente = '', page, type, typeReport: TypeReport = TypeReport.noReport): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(pendiente, page, type, this.total_registros, typeReport);
      return;
    }
    if (!this.searchCodCredito.controls.field.value && type != 3) {
      this.loaded = false;
    } 
    this.pageClicked = page;
    this.getService(pendiente, page, type, this.size.controls.data.value);
  }

  showAbonar(item) {
    if (item.estado_id == 3) {
      this.onSuccess(
        'La factura fue anulada',
        'No puede realizar devoluciones a una factura anulada',
        TypeAlert.warning
      );
      return;
    } else {
      this.isList = false;
      this.idAbonar = item.id;
    }
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getHistorial(this.pendiente, 1, this.type);
  }

  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  buscar(pendiente = '') {
    this.pendiente = pendiente;
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      if (this.searchCodCredito.value.field) {
        this.getHistorial(this.pendiente, 1, 3);        
      } else {
      this.getHistorial(this.pendiente, 1, 1);
      }
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

    this.historialVentaService
      .anularFacturaVenta(
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
          this.getHistorial(this.pendiente, 1, 1);
          this.disabled = false;
        },
        (error) => {
          this.onSuccess(
            'Factura No Anulada!',
            error.error.message,
            TypeAlert.warning
          );

          this.disabled = false;
        }
      );
    this.closeModal();
  }

  buscarHistorialVencimiento(pendiente = '') {
      this.pendiente = pendiente;
      this.loaded = true;
      this.type = 2;
      this.getHistorial(this.pendiente, 1, this.type);
  }

  buscarHistorial(pendiente = '') {
    this.pendiente = pendiente;
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
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.type = 1;
      this.getHistorial(this.pendiente, 1, this.type);
    }
  }

  openModal(item) {
    if (item.estado_id == 3) {
      this.onSuccess(
        'Acción no válida',
        'La factura ya fue anulada anteriormente',
        TypeAlert.warning
      );
      return;
    }
    this.cleanData();
    this._dataFactura = item;
    this.childModal?.show();
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  getColorState(estado: number) {
    return this.funcionesService.getColorStateCreditoVenta(estado);
  }

  getColorState2(estado: number) {
    return this.funcionesService.getColorStateCreditTipo(estado);
  }

  imprimirTicket(item) {
    this.showTicket = true;
    this.idInvoice = item.id;
    //console.log(item, this.showTicket);
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  showList(value: string) {
    this.isList = true;
    if (this.type == 1) {
      this.buscarHistorial(this.pendiente);
    } else {
      this.buscarHistorialVencimiento(this.pendiente);
    }
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.pendiente, this.page, 1);
  }
}
