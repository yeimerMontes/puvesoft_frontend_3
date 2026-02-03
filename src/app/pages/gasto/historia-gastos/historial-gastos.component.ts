import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';
import { selectsPagination, metodoPagos } from 'src/app/constants/selects';
import { SucursalService } from 'src/app/services/sucursal.service';
import { GastoService } from 'src/app/services/gastos.servic';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ProveedorService } from 'src/app/services/porveedor.service';
import { CategoriaGastoService } from 'src/app/services/categoria-gasto.servic';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersHistorialGastos } from 'src/app/constants/historial-gasto';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { DatePipe } from '@angular/common';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './historial-gastos.component.html',
})
export class HistorialGastoComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Historial de Gastos';
  headers: headersMasterInterface[] = headersHistorialGastos;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataProveedor: any[] = [];
  private _dataCategoria: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _dataPdf: any[] = [];
  private _dataUsuario;

  showTicket = false;
  idInvoice = null;

  showApertura = false;
  metodoPagoSelect;

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Gasto';
  action1 = 'Agregar';

  lockbutton: boolean = false;
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

  usarDecimales: Number = 1;
  totalGasto: string = '0';
  totalGastoPdf: string = '0';
  count: number = 0;

  date;
  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private gastoService: GastoService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private proveedorService: ProveedorService,
    private categoriaGastoService: CategoriaGastoService,
    private cajaService: CierreCajaService,
    private metodoPagos: MetodoPagoService,
    private datePipe: DatePipe,
    private userService: UserService,
  ) {}

  changeCaja() {
    let checked = this.form.get('sacar_caja').value;
    if (checked) {
      this.cajaService.estadoCaja().subscribe((resp) => {
        if (!(resp && resp.data && resp.data.length > 0)) {
          this.showApertura = true;
        }
      });
    } else {
      Swal.fire({
        title: 'Estás seguro?',
        text: 'El gasto no será sacado de la caja?',
        icon: 'warning',
        iconColor: '#DC562F',
        showCancelButton: true,
        confirmButtonColor: '#145388',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, Continuar!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.showApertura = false;
          this.form.get('sacar_caja').reset('');
        } else {
          this.form.get('sacar_caja').reset(true);
        }
      });
    }
  }

  closeApertura(event) {
    this.showApertura = false;
  }

  onWarning(mensaje: any, tipo: any, title: any): void {
    Swal.fire({
      position: 'center',
      icon: 'warning',
      title: title,
      text: '' + mensaje + ' !',
      showConfirmButton: false,
      timer: 1800,
    });
  }

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
    this.date = new Date();
    // this.date = this.datePipe.transform(new Date(), 'MM/d/y');
    this.date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    //Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      fecha_gasto: ['', []],
      categoria: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      proveedor: ['', []],
      sacar_caja: ['', []],
      metodo_pago: ['', [Validators.required]],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      usuario: ['', []],
      proveedor: ['', []],
      metodo_pago: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });
    this.fechaActual();
    this.getSucural();
    this.getUsuarios();
    this.getGastos(1);
    this.getProveedores();
    this.getMetodoPagos();
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.gastoService
      .getGastoPorPagina(
        '',
          this.search.controls.fecha_inicial.value,
          this.search.controls.fecha_final.value,
          this.search.controls.hora_inicial.value,
          this.search.controls.hora_final.value,
          this.search.controls.proveedor.value,
          this.search.controls.metodo_pago.value,
          this.search.controls.usuario.value,
        '',
        'No',
      )
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, ' Gastos');
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.gastoService
      .getGastoPorPagina(
        '',
         this.search.controls.fecha_inicial.value,
          this.search.controls.fecha_final.value,
          this.search.controls.hora_inicial.value,
          this.search.controls.hora_final.value,
          this.search.controls.proveedor.value,
          this.search.controls.metodo_pago.value,
          this.search.controls.usuario.value,

        '',
        'No',
      )
      .subscribe((resp) => {
        this._dataPdf = resp.data;
        this.totalGastos();

        ////console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  getUsuarios() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataUsuario = resp.data;
    });
  }

  /* Consulto informacion de la sucursal */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  getProveedores() {
    this.proveedorService
      .getProveedoresPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataProveedor = resp.data;
      });
  }

  getMetodoPagos() {
    this.metodoPagos.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
    });
  }

  getCategoriaGastos() {
    this.categoriaGastoService
      .getCategoriaGastoPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataCategoria = resp.data;
      });
  }

  get dataProveedor() {
    return this._dataProveedor;
  }

  get dataCategoria() {
    return this._dataCategoria;
  }

  get dataMetodoPagos() {
    return this._dataMetodoPago;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  get dataUsuario() {
    return this._dataUsuario;
  }

  getGastos(page): void {
    //this.loaded = false;
    this.gastoService
      .getGastoPorPagina(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.proveedor.value,
        this.search.controls.metodo_pago.value,
        this.search.controls.usuario.value,
        this.size.controls.data.value,
        '',
      )
      .subscribe((resp) => {
        //.log(resp);
        this._data = resp.data.data;
        this.totalGasto = resp.total;
        this.loaded = true;
        this.count++;

        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getGastos(1);
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
      this.getGastos(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      fecha_gasto: '',
      categoria: '',
      proveedor: '',
      descripcion: '',
      valor: '',
      sacar_caja: '',
      metodo_pago: '',
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();
    this.getCategoriaGastos();

    if (opc == 1) {
      this.action = 'Agregar Nuevo Gasto ';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
    }
    this.showApertura = false;
    this.childModal?.show();
  }

  closeModal() {
    this.childModal?.hide();
  }

  closeModal2() {
    this.childModal2?.hide();
  }

  openModal2() {
    this.childModal2?.show();
    this.generatePdf();
  }

  /**
   * Comprueba que UN campo sea válido, por parámetro se le pasa el campo a evaluar
   *
   * @param campo string
   * @returns boolean
   */
  campoEsValido(campo: string) {
    return (
      this.form.controls[campo].errors && this.form.controls[campo].touched
    );
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.lockbutton = true;
    if (this.isActionAdd) {
      this.gastoService.addGasto(this.form.value).subscribe(
        (resp) => {
          this.onSuccess(resp.message, 'success', 'Registrado');
          this.closeModal();

          this.lockbutton = false;
          this.getGastos(1);
        },
        (err) => {
          alert('Ocurrió un error');
        },
      );
    } /* else {
      this.gastoService
        .putGasto(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Registrado');

          this.closeModal();
          this.form.reset();

          this.getGastos(1);
        });
    } */
  }

  anular(item) {
    Swal.fire({
      title: item['estado_id'] != 4 ? 'Estás seguro?' : 'Gasto anulado',
      text:
        item['estado_id'] != 4
          ? 'Anularás el gasto:  ' + item['descripcion'] + '!'
          : 'Motivo:\n ' + item['motivo_anulacion'],
      input: item['estado_id'] != 4 ? 'textarea' : null,
      inputPlaceholder:
        'Justifique el motivo por el cual será anulado el gasto',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: item['estado_id'] != 4 ? true : false,
      showCloseButton: item['estado_id'] != 4 ? false : true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Anular!',
      showConfirmButton: item['estado_id'] != 4 ? true : false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value != '') {
          //alert(result.value);

          this.gastoService
            .putGasto({ motivo: result.value }, item['id'])
            .subscribe((resp) => {
              this.onSuccess(resp.message, 'success', 'Anulado');
              this.closeModal();

              this.getGastos(1);
            });
        } else {
          Swal.fire({
            title: 'Advertencia!',
            text: 'Debe justificar, la anulación del gasto',
            icon: 'info',
            iconColor: '#145388',
            showCancelButton: false,
            confirmButtonColor: '#145388',
          });
        }
      }
    });
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el gasto: ' + item['decripcion'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.gastoService.deleteGasto(item['id']).subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Eliminado');
          this.closeModal();

          this.getGastos(1);
        });
      }
    });
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

    if (fecha_inicial == '' || fecha_final == '') {
      Swal.fire({
        title: 'Debe diligenciar las fechas',
        text: 'Diligencia los rangos de fecha para poder consultar los gastos...',
        icon: 'warning',
        iconColor: '#DC562F',
        showCancelButton: true,
        showConfirmButton: false,
      });
    } else {
      this.loaded = false;
      this.gastoService
        .getGastoPorPagina(
          this.page,
          this.search.controls.fecha_inicial.value,
          this.search.controls.fecha_final.value,
          this.search.controls.hora_inicial.value,
          this.search.controls.hora_final.value,
          this.search.controls.proveedor.value,
          this.search.controls.metodo_pago.value,
          this.search.controls.usuario.value,
          this.size.controls.data.value,
          '',
        )
        .subscribe((resp) => {
          this._data = resp.data.data;
          this.totalGasto = resp.total;
          this.loaded = true;

          this.page = resp.data.current_page;
          this.totalItems = resp.data.total;
          this.pages = resp.data.last_page;
        });
    }
  }

  totalGastos() {
    this.totalGastoPdf = '0';
    let f = this.dataPdf;
    let total = 0;

    for (let i = 0; i < f.length; i++) {
      const element = f[i];
      /* Valido para que solo sume los diferentes a anulado */
      if (element.estado_id == 1) {
        total += Number(element.valor);
      }
    }
    this.totalGastoPdf = total.toString();
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
  }

  formatearGasto(event) {
    this.form.controls.valor.setValue(this.formatNumber(event));
  }

  metodoPag(data) {
    this.metodoPagoSelect = data;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  imprimirTicket(item) {
    this.showTicket = true;
    this.idInvoice = item;
    // //console.log(item, this.showTicket);
  }

  paginate(event) {
    this.page = event;
    this.getGastos(this.page);
  }
}
