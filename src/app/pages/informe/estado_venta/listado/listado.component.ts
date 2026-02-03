import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { estadosCreditos, selectsPagination, tipoAtencion, tiposFacturas, tiposFacturasVentas, tiposVentas } from 'src/app/constants/selects';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { EstadoVentaService } from 'src/app/services/estado-venta.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersEstadoVenta } from 'src/app/constants/estado-ventas';
import { headersEstadoVentaMetodosPagos } from 'src/app/constants/estado-ventas-metodo-pago';
import { headersEstadoVentaMesas } from 'src/app/constants/estado-ventas-mesas';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css',]
})
export class ListadoComponent implements OnInit {

  @ViewChild('staticModal1', { static: false }) childModal1?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModal3', { static: false }) childModal3?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false }) childModalPdf?: ModalDirective;

  
  titleModule: string = 'Estado de ventas registradas';
  headers: headersMasterInterface[] = headersEstadoVenta;
  headers2: headersMasterInterface[] = headersEstadoVentaMetodosPagos;
  headers3: headersMasterInterface[] = headersEstadoVentaMesas;

  formAnular: FormGroup;
  formDevolver: FormGroup;
  formObservacion: FormGroup;
  search: FormGroup; //variable que controla el formulario
  searchCodCredito: FormGroup; //variable que controla el formulario
  size: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataReport: any[] = [];
  private _dataFactura: any = {};
  private _dataMetodoPago: any[];
  private _dataUsuario;
  private _dataProductosFactura: any;
  private _totales: any = {};

  selects: number[] = selectsPagination;
  estados: any[] = estadosCreditos;
  tipoAtencion: any[] = tipoAtencion;
  tipo_venta: any[] = tiposVentas;
  tipo_factura: any[] = tiposFacturas;
  tipo_factura_venta: any[] = tiposFacturasVentas;

  private _data = [];
  private _dataByMetodosDePago = [];
  private _totalesMetodoPago: any = {};
  private _dataByMesas = [];
  private _totalesMesa: any = {};

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
  hasDevolucion = false;

  isRestaurant = false;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;


  /*
  Variables para controlar la propina y el domicilio
  */
 propinaGlobal = 0;
 domicilioGlobal = 0;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private estadoventaService: EstadoVentaService,
    private metodoPagoServise: MetodoPagoService,
    private userService: UserService,
  ) { }

  ngOnInit() {

    this.formAnular = this.formBuilder.group({
      motivo: ['', []]
    })

    this.formDevolver = this.formBuilder.group({
      factura: ['', []],
      metodo_pago: ['', []],
      prds: this.formBuilder.array([])
    })

    this.formObservacion = this.formBuilder.group({
      observacion: ['', []]
    })

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
      tipo_factura_venta: ['', []],
      tipo_venta: ['', []],
      estado: ['', []],
      tipo_atencion: [1, []],
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

  getUsuarios() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataUsuario = resp.data;
    });
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
      this.usarDecimales = resp.data.usar_decimales;
    });
    this.isRestaurant = (
      JSON.parse(
        decodeURIComponent(atob(localStorage.getItem(btoa('sucursal'))))
        ).tipo_sucursal == 2
      ) ? true: false;
  }

  get data() {
    return this._data;
  }

  get dataByMetodosDePago() {
    return this._dataByMetodosDePago;
  }

  get totalesMetodoPago() {
    return this._totalesMetodoPago;
  }

  get dataByMesas() {
    return this._dataByMesas;
  }

  get totalesMesa() {
    return this._totalesMesa;
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

  metodoPagoSelected() {
    return this.search.controls.metodo_pago.value;
  }

  getService(page, type, perPage, typeReport: TypeReport = TypeReport.noReport) {
    this.estadoventaService
      .getHistorialVentaPorPagina(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.usuario.value,
        this.search.controls.metodo_pago.value,
        this.search.controls.tipo_factura.value,
        this.search.controls.tipo_factura_venta.value,
        perPage,
        this.searchCodCredito.controls.field.value,
        this.search.controls.tipo_venta.value,
        this.search.controls.estado.value,
        typeReport,
        this.search.controls.tipo_atencion.value,
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(this._dataReport, 'Estado de Ventas');
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
          //console.log(this._totales)
          this.propinaGlobal = this._totales.total_propina;
          this.domicilioGlobal = this._totales.domicilio_total;
          this._totales['propinaGlobal'] = this.propinaGlobal;
          this._totales['domicilioGlobal'] = this.domicilioGlobal;
        }

        this.last_page = resp.data.last_page;
      });

    this.estadoventaService.getVentasPorMetodoPago(
      this.search.controls.fecha_inicial.value,
      this.search.controls.fecha_final.value,
      this.search.controls.hora_inicial.value,
      this.search.controls.hora_final.value,
      this.search.controls.usuario.value,
      this.search.controls.metodo_pago.value,
      this.search.controls.tipo_factura.value,
      this.search.controls.tipo_factura_venta.value,
      this.searchCodCredito.controls.field.value,
      this.search.controls.tipo_venta.value,
      this.search.controls.estado.value,
      this.search.controls.tipo_atencion.value,
      ).subscribe(
        resp => {
          this._dataByMetodosDePago = resp.data;
          this._totalesMetodoPago = resp.total;
          this._totalesMetodoPago['propinaGlobal'] = this.propinaGlobal;
          this._totalesMetodoPago['domicilioGlobal'] = this.domicilioGlobal;          
        }
      )

      if (this.isRestaurant) {
        this.estadoventaService.getVentasPorMesas(
          this.search.controls.fecha_inicial.value,
          this.search.controls.fecha_final.value,
          this.search.controls.hora_inicial.value,
          this.search.controls.hora_final.value,
          this.search.controls.usuario.value,
          this.search.controls.metodo_pago.value,
          this.search.controls.tipo_factura.value,
          this.searchCodCredito.controls.field.value,
          this.search.controls.tipo_venta.value,
          this.search.controls.estado.value,
          this.isRestaurant,
          this.search.controls.tipo_atencion.value,
        ).subscribe(
          resp => {
            this._dataByMesas = resp.data;
              this._totalesMesa = resp.total;
              this._totalesMesa['propinaGlobal'] = this.propinaGlobal;
              this._totalesMesa['domicilioGlobal'] = this.domicilioGlobal;          
          }
        )
      }
    
  }

  pageClicked = 0;
  getHistorial(page, type, typeReport: TypeReport = TypeReport.noReport): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, type, this.total_registros, typeReport);
      return;
    }
    if (!this.searchCodCredito.controls.field.value && !this.hasDevolucion && type != 3) {
      this.loaded = false;
    }
    this.pageClicked = page;
    this.getService(page, type, this.size.controls.data.value);

  }

  generateProductos() {
    this.formDevolver.patchValue({ factura: this._dataFactura.id })
    this._dataProductosFactura.forEach((element, index) => {
      const dis = (element.devolucion == element.cantidad) ? true : false;

      const producto = this.formBuilder.group({
        producto_id: new FormControl(element.id),
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
    if(!this.searchCodCredito.get('field').value) {
      this.buscarHistorial();
      return;
    }

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
    this.fechaActual();
    this.prds.clear();
  }

  cleanData3() {
    this.formAnular.reset({
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
    this.busquedaPorCodigo = '';
    this.searchCodCredito.controls.field.setValue('');

    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;
    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
    this.horaInicial = this.search.controls.hora_inicial.value;
    this.horaFinal = this.search.controls.hora_final.value;

    if (!(fecha_inicial || fecha_final)) {
      this.onSuccess('Debe diligenciar las fechas',
        'Diligencie los rangos de fecha para poder consultar el historial de estado de venta...',
        TypeAlert.warning);
      return;
    }

    else {
      this.loaded = true;
      this.getHistorial(1, 1);
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
    //console.log(item, this.showTicket);

  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page, 1);
  }

}
