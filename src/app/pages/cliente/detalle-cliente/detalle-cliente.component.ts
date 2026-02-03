import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { selectsPagination } from 'src/app/constants/selects';
import { SucursalService } from 'src/app/services/sucursal.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { ActivatedRoute } from '@angular/router';
import { FuncionesService } from 'src/app/services/funciones.service';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-second',
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class DetalleClienteComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];

  private _data = [];
  private _dataMetodoPago = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Cliente';
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

  prevTemplate;

  /* Variables del PDF */
  sucursal: String;
  nit: String;
  direccion: String;
  fecha: String;
  logo: String;
  usarDecimales: Number = 1;
  moneda: string = '';
  idCliente: String;
  nombreCliente: String;
  totalCompra: any;

  private _tipoDocumentos: any[] = [];

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private clienteService: ClienteService,
    private exportarExcelService: ExportarExcelService,
    private activeRoute: ActivatedRoute,
    private funcionesService: FuncionesService,
    private _location: Location,
    private monedaService: MonedaService,
  ) {}

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
    this.idCliente = this.activeRoute.snapshot.paramMap.get('idCliente');

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });
    this.nombreCliente = atob(localStorage.getItem(btoa('nombreCliente')));
    this.getSucural();
    this.getFacturaCliente(1);
    this.getMetodoPagoCliente();
  }

  generateExcel() {
    this.clienteService
      .getFacturaCliente('', '', '', 'No', this.idCliente)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          'Historial de compra Cliente ' + this.nombreCliente,
        );
      });
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  getColorState(estado: number) {
    return this.funcionesService.getColorState(estado);
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
      this.moneda = this.monedaService.obtenerSimbolo(resp.data.moneda);
    });
  }

  public get tipoDocumentos() {
    return this._tipoDocumentos;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  /* esta es la funcion que me trae el listado de facturas de un cliente */
  getFacturaCliente(page): void {
    //this.loaded = false;
    this.clienteService
      .getFacturaCliente(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        this.idCliente,
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        // this.total = resp.data.total;
        this._data = resp.data.data;

        //this.dtTrigger.next();
        this.loaded = true;

        //this.pages = of(paginas.slice(1, -1));
      });
  }

  /* Consulto las ventas por metodo de pago */
  private getMetodoPagoCliente(): void {
    //this.loaded = false;
    this.clienteService
      .getMetodoPagoCliente(this.idCliente)
      .subscribe((resp) => {
        this._dataMetodoPago = resp.data;
        this.totalCompra = resp.total;
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getFacturaCliente(1);
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
      this.getFacturaCliente(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  get dataMetodoPago() {
    return this._dataMetodoPago;
  }

  goBack() {
    this._location.back();
  }

  paginate(event) {
    this.page = event;
    this.getFacturaCliente(this.page);
  }
}
