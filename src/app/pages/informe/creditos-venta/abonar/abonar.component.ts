import { TypeAlert } from 'src/app/constants/enums';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { CreditosVentasService } from 'src/app/services/creditos-ventas.service';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';

@Component({
  selector: 'app-abonar',
  templateUrl: './abonar.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css']
})
export class AbonarComponent implements OnInit {
  @Input() id: number;
  @Output() editEvent = new EventEmitter<string>();


  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  searchCodFactura: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataUsuario: any[] = [];
  private _dataCategoria: any[] = [];
  private _dataPdf: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _dataVentaPorMetodoPago: any[] = [];
  private _dataVentaPorMesa: any[] = [];
  private _dataFactura: any;

  private _data = [];

  timeClear: any;
  btnDisabled: boolean = false;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  showTicket = false;
  idInvoice = null;

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
  factura_venta_id;

  selects: number[] = selectsPagination;

  today: string;

  showApertura = false;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private funcionesService: FuncionesService,
    private metodoPagoServise: MetodoPagoService,
    private creditosVentasService: CreditosVentasService,
    private cierreCajaService: CierreCajaService,
  ) { }

  onConfirm(title: string, mensaje: string, functionConfirm, item = undefined) {
    let self = this;

    Swal.fire({
      position: 'center',
      icon: 'warning',
      title: title,
      text: '' + mensaje + ' !',
      confirmButtonText:
        '<i class="fa fa-thumbs-up"></i> Sí, continuar',
      cancelButtonText:
        '<i class="fa fa-thumbs-down"> Cancelar</i>',
      //showConfirmButton: true,
      showCancelButton: true,
      timer: undefined,
    }).then(
      result => {
        if (result.isConfirmed) {
          if (item === undefined) {
            functionConfirm(self);
          } else {
            functionConfirm(self, item);
          }

        }
      }
    );
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

  ngOnInit() {
    this.today = new Date().toISOString().slice(0, 10);

    this.factura_venta_id = this.id;
    //this.activatedRoute.snapshot.paramMap.get('facturaId');

    this.form = this.formBuilder.group({
      fecha_pago: ['', [Validators.required]],
      valor: [null, [Validators.required]],
      metodo_pago_id: [null, [Validators.required]],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      usuario: ['', []],
      metodo_pago: ['', []],
      tipo_factura: ['', []],
      tipo_venta: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
      buscar: ['', []]
    });

    this.searchCodFactura = this.formBuilder.group({
      field: ['', []],
    });
    this.fechaActual();
    this.getSucural();
    this.getMetodoPago();
    this.getHistorial(1);

    this.openModal();
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }


  goBack() {
    this.editEvent.emit('');

  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getHistorial(1);
    }, 360);
  }

  abonar() {
    if (this.form.invalid) {
      this.onSuccess(
        'Debe diligenciar todos los campos',
        'Diligencie todos los campos para realizar el abono',
        TypeAlert.warning
      );
      return;
    }

    if (this.form.get('fecha_pago').value > this.today) {
      this.onSuccess(
        'Fecha incorrecta',
        'La fecha de pago no debe ser superior al día de hoy',
        TypeAlert.warning
      );
      return;
    }

    let valor =
      this.usarDecimales == 1
        ? Math.round(this.form.get('valor').value)
        : this.form.get('valor').value;

        let valorRestante =
        this.usarDecimales == 1
          ? Math.round(this._dataFactura.restante)
          : this._dataFactura.restante+0.1;

    if (valor > valorRestante) {
      this.onSuccess(
        'Error en el valor a pagar',
        'El valor ingresado excede el precio restante a abonar al crédito, asegúrese de ingresar la cantidad correcta',
        TypeAlert.warning
      );
      return;
    }

    if (this.form.get('valor').value <= 0) {
      this.onSuccess(
        'Error en el valor a pagar',
        'Ingrese una cantidad a abonar válida y mayor a cero',
        TypeAlert.warning
      );
      return;
    }

    else {
      this.btnDisabled = true;
      this.creditosVentasService.addCreditoAbonoFactura(this.factura_venta_id, this.form.value).subscribe(
        _ => {
          this.onSuccess(
            'Abono exitoso',
            'Se ha realizado el abono de forma exitosa',
            TypeAlert.success
          );
          this.getHistorial(1);
          this.btnDisabled = false;
          this.cleanData();
        },
        error => {
          this.onSuccess(
            'Ocurrió un error',
            error.error.message,
            TypeAlert.warning
          );
          this.btnDisabled = false;
        }
      );
    }
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.sucursal = resp.data.nombre;
      this.direccion = resp.data.direccion;
      this.nit = resp.data.nit;
      this.fecha = resp.data.fecha;
      this.logo = resp.data.logo;
      this.tipoSucursal = resp.data.tipo_sucursal;
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    this.form.controls.fecha_pago.setValue(`${year}-${month}-${day}`);
  }

  getMetodoPago() {
    this.metodoPagoServise.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
    });
  }

  get data() {
    return this._data;
  }

  get dataFactura() {
    return this._dataFactura;
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

  get dataPdf() {
    return this._dataPdf;
  }

  getHistorial(page): void {
    this.loaded = false;
    this.creditosVentasService.getAbonosCreditosByFacturaId(
      this.factura_venta_id,
      this.size.get('data').value,
      page,
      this.size.get('buscar').value
    ).subscribe(
      resp => {
        this._data = resp.data.abonos.data;
        this._dataFactura = resp.data.factura_venta;
        this.totalItems = resp.data.abonos.total;
        this.pages = resp.data.abonos.last_page;
        this.loaded = true;
      }
    )
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

  cleanData() {
    this.form.reset({
      fecha_pago: '',
      valor: '',
      metodo_pago_id: null,
    });
    this.fechaActual();
  }

  delete(self, item) {
    self.creditosVentasService.deleteAbonoFactura(item).subscribe(
      _ => {
        self.onSuccess('Abono eliminado exitosamente',
          'El abono ha sido eliminado exitosamente',
          TypeAlert.success);

        self.getHistorial(1);
      }
    )
  }

  deleteAbono(item) {
    this.onConfirm('¿Desea eliminar el abono?',
      'Estás a punto de eliminar un abono, acepta si deseas eliminar',
      this.delete,
      item.id
    );
  }

  imprimirTicket(item) {
    
    this.showTicket = true;
    this.idInvoice = item.id;
    ////console.log(item, this.showTicket);

  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  openModal() {
    this.childModal?.show();
    this.showApertura = false;
    this.cierreCajaService.estadoCaja().subscribe((resp) => {
      if (!(resp && resp.data && resp.data.length > 0)) {
        this.showApertura = true;
      }
    });
  }

  closeApertura(event) {
    this.showApertura = false;
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page);
  }
}
