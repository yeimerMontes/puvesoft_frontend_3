import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { headersCotizacion } from 'src/app/constants/cotizacion';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { selectsPagination } from 'src/app/constants/selects';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css']
})
export class ListadoComponent implements OnInit {
  @ViewChild('staticModalPdf', { static: false }) childModalPdf?: ModalDirective;

  @ViewChild('staticModal1', { static: false }) childModal1?: ModalDirective;


  titleModule: string = 'Historial Cotizaciones';
  headers: headersMasterInterface[] = headersCotizacion;

  disabled = false;

  formAnular: FormGroup;

  size: FormGroup;
  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataFactura: any = {};

  private _dataUsuario: any[] = [];
  private _dataCategoria: any[] = [];
  private _dataReport: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _dataVentaPorMetodoPago: any[] = [];
  private _dataVentaPorMesa: any[] = [];
  selects: number[] = selectsPagination;
  sucursal: any;

  private _data = [];

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  showTicket = false;
  idInvoice = null;

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

  fechaInicial: string;
  fechaFinal: string;

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;
  total_registros: any;
  last_page: any;
  valorTotal: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private cotizacionesService: CotizacionesService,
    private router: Router,
  ) { }

  ngOnInit() {

     this.formAnular = this.formBuilder.group({
      motivo: ['', []],
    });


    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      fecha_final: ['', []],
      field: ['', []],
    });

    this.fechaActual();
    this.getSucural();
    this.getHistorial(1);
  }



  /* Consulto informacion de la sucursal*/
  private getSucural(): void {

    try {
      this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
    } catch (error) {
      this.sucursal = "";
    }

    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        this.sucursal = resp.data;
      });
    } else {
      this.usarDecimales = this.sucursal.usar_decimales;
    }

    /*  this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
      this.dia_vencimiento = resp.data.ven_d;
    }); */
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

    get dataFactura() {
    return this._dataFactura;
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

  count = 0;

  getService(page, perPage, fecha_i, fecha_f, typeReport: TypeReport = TypeReport.noReport): void {
    this.cotizacionesService
      .getCotizaciones(
        page,
        fecha_i,
        fecha_f,
        perPage,
        this.search.controls.field.value,
        typeReport
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Cotizaciones'
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
        this.valorTotal = resp.total;
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

  closeModal2() {
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

    var fecha_inicial = `${year}-${month}-${day}`;
    var fecha_final = `${year}-${month}-${day}`;
    this.search.controls.fecha_inicial.setValue(fecha_inicial);
    this.search.controls.fecha_final.setValue(fecha_final);

    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';
    this.search.controls.field.setValue('');

    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;


    if (!(fecha_inicial || fecha_final)) {
      this.onSuccess('Debe diligenciar las fechas',
        'Diligencie los rangos de fecha para poder consultar el historial de cotizaciones...',
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
    ////console.log(item, this.showTicket);

  }

  openModal(item) {
    
    this._dataFactura = item;
    this.cleanData1();

    this.childModal1?.show();
  }

   closeModal1() {
    this.childModal1?.hide();
  }

    cleanData1() {
    this.formAnular.reset({
      motivo: '',
    });
  }

   getColorState(estado: number) {
    return this.funcionesService.getColorState(estado);
  }

  anular() {
    this.disabled = true;

    if (this.dataFactura.estado_id == 3) {
      this.onSuccess(
            'Cotización No Anulada!',
            'La Cotización ya se encuentra anulada',
            TypeAlert.warning
          );
          this.disabled = false;
      return;
    }

    this.cotizacionesService
      .anularCotizacion(
        this._dataFactura.id,
        this.formAnular.get('motivo').value
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Cotización Anulada',
            'Se ha anulado la Cotización con éxito',
            TypeAlert.success
          );
          this.getHistorial(1);
          this.disabled = false;
        },
        (error) => {
          this.onSuccess(
            'Cotización No Anulada!',
            error.error.message,
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
    this.closeModal1();
  }


  closeTicket(value: string) {
    this.showTicket = false;
  }


  goToQuote() {
    this.router.navigate([`/vender/ventatienda`]);
  }

  irVenta(item: any) {

    if (item.estado_id == 3) {
      this.onSuccess(
            'Cotización Anulada!',
            'La Cotización se encuentra anulada, no puede ser convertida en venta',
            TypeAlert.warning
          );
          this.disabled = false;
      return;
    }


    // Establecer una bandera en sessionStorage
    sessionStorage.setItem('cotizacion', item.id);

    if (this.sucursal.tipo_sucursal == 1) {
      this.router.navigate([`/vender/ventatienda`]);
    } else {
      this.router.navigate([`/vender/ventarestaurantebar`]);
    }
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page);
  }

}
