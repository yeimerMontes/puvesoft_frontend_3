import { Observable, of } from 'rxjs';
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
import { GastoFijoService } from 'src/app/services/gasto-fijo.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-gasto-fijo',
  templateUrl: './gasto-fijo.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class GastoFijoComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Gastos Fijos';
  headers: headersMasterInterface[] = headersHistorialGastos;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataProveedor: any[] = [];
  private _dataCategoria: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _dataPdf: any[] = [];

  private _idEdit = null;

  showApertura = false;
  metodoPagoSelect;

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Gasto Fijo';
  action1 = 'Agregar';

  lockbutton: boolean = false;
  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;

  pages: Observable<any[]>;
  page = 1;
  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;

  usarDecimales: Number = 1;
  totalGasto: string = '0';
  totalGastoPdf: string = '0';
  count: number = 0;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private gastoService: GastoService,
    private gastoFijoService: GastoFijoService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private proveedorService: ProveedorService,
    private categoriaGastoService: CategoriaGastoService,
    private cajaService: CierreCajaService,
    private metodoPagos: MetodoPagoService,
    private _location: Location,
  ) {}

  changeCaja() {
    // this.onWarning('Verificando estado de la caja...', 'warning', 'Espere');
    this.cajaService.estadoCaja().subscribe((resp) => {
      if (!(resp && resp.data && resp.data.length > 0)) {
        this.showApertura = true;
      } else {
        this.showApertura = false;
      }
    });
  }

  closeApertura(event) {
    this.showApertura = false;
    this.getGastos();
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
    //Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      categoria: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      proveedor: ['', []],
      fecha_aplicacion: ['', []],
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
    this.getGastos();
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

  getGastos(): void {
    //this.loaded = false;
    this.total = 0;

    let isshowApertura = false;

    this.gastoFijoService.getAllGastoFijo().subscribe((resp) => {
      //console.log(resp);
      this._data = resp.data;
      for (let i = 0; i < this._data.length; i++) {
        const element = this._data[i];
        if (element.es_pagar_tmp) {
          this.total = +this.total + +element.valor;
        }
        if (
          element.es_pagar_tmp &&
          element.metodo_pago_id == 1 &&
          element.sacar_caja
        ) {
          isshowApertura = true;
        }
      }

      if (isshowApertura) {
        this.changeCaja();
      } else {
        this.showApertura = false;
      }

      // this.totalGasto = resp.total;
      this.loaded = true;
      this.count++;
    });
  }

  counter(i: number) {
    return new Array(i);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      categoria: '',
      proveedor: '',
      descripcion: '',
      valor: '',
      fecha_aplicacion: '',
      metodo_pago: '',
    });
  }

  openModal(opc: number, obj: any = null) {
    this.cleanData();
    this.getCategoriaGastos();

    if (opc == 1) {
      this.action = 'Agregar Nuevo Gasto ';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
    } else {
      this.action = 'Editar Gasto Fijo';
      this.action1 = 'Editar';
      this.isActionAdd = false;
      this._idEdit = obj.id;

      this.form.reset({
        categoria: obj.categoria_id,
        proveedor: obj.proveedor_id,
        descripcion: obj.descripcion,
        valor: obj.valor,
        fecha_aplicacion: obj.fecha_aplic,
        metodo_pago: obj.metodo_pago_id,
      });
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
      this.gastoFijoService.addGasto(this.form.value).subscribe(
        (resp) => {
          this.onSuccess(resp.message, 'success', 'Registrado');

          this.closeModal();
          this.form.reset();
          this.getGastos();
          this.lockbutton = false;
        },
        (err) => {
          alert('Ocurrió un error');
        },
      );
    } else {
      this.gastoFijoService
        .putGasto(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Registrado');

          this.closeModal();
          this.form.reset();
          this.getGastos();
          this.lockbutton = false;
        });
    }
  }

  changeActive(item) {
    this.lockbutton = true;
    if (item.es_pagar_tmp) {
      this.gastoFijoService.inactive(item.id).subscribe(
        (resp) => {
          //console.log(resp);
          this.getGastos();
          this.lockbutton = false;
        },
        (error) => {
          //console.log(error);
          this.lockbutton = false;
        },
      );
    } else {
      this.gastoFijoService.active(item.id).subscribe(
        (resp) => {
          //console.log(resp);
          this.getGastos();
          this.lockbutton = false;
        },
        (error) => {
          //console.log(error);
          this.lockbutton = false;
        },
      );
    }
  }

  changeSacarCaja(item) {
    this.lockbutton = true;
    if (item.sacar_caja) {
      this.gastoFijoService.inactiveSacarCaja(item.id).subscribe(
        (resp) => {
          //console.log(resp);
          this.getGastos();
          this.lockbutton = false;
        },
        (error) => {
          //console.log(error);
          this.lockbutton = false;
        },
      );
    } else {
      this.gastoFijoService.activeSacarCaja(item.id).subscribe(
        (resp) => {
          //console.log(resp);
          this.getGastos();
          this.lockbutton = false;
        },
        (error) => {
          //console.log(error);
          this.lockbutton = false;
        },
      );
    }
  }

  anular(item) {
    this.lockbutton = true;
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el gasto fijo:  ' + item['descripcion'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.gastoFijoService.deleteGasto(item['id']).subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Eliminado');
          this.closeModal();

          this.getGastos();
          this.lockbutton = false;
        });
      } else {
        this.lockbutton = false;
      }
    });
  }

  aplicarGastosFijos() {
    Swal.fire({
      title: 'Estás seguro?',
      text:
        'Confirma el pago con valor $' +
        this.formatearNumber(this.total) +
        ' para los gastos fijos seleccionados',
      icon: 'success',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Pagar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.gastoFijoService.aplicarGastosFijos().subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Pagados');
          this.closeModal();

          this.getGastos();
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

    this.search.controls.fecha_inicial.setValue(`${year}-${month}-${day}`);
    this.search.controls.fecha_final.setValue(`${year}-${month}-${day}`);
  }

  buscarHistorial() {
    this.loaded = false;
    this.gastoFijoService.getAllGastoFijo().subscribe((resp) => {
      this._data = resp.data.data;
      this.totalGasto = resp.total;
      this.loaded = true;
    });
  }

  totalGastos() {
    this.totalGastoPdf = '0';
    // let f = this.dataPdf;
    let total = 0;

    // for (let i = 0; i < f.length; i++) {
    //   // const element = f[i];
    //   /* Valido para que solo sume los diferentes a anulado */
    //   // if (element.estado_id == 1) {
    //   //   total += Number(element.valor);
    //   // }
    // }
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

  goBack() {
    this._location.back();
  }
}
