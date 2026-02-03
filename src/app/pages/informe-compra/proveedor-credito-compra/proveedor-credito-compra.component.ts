import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { headersCreditoProveedor } from 'src/app/constants/credito-proveedores';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { selectsPagination } from 'src/app/constants/selects';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';
import { CreditosComprasService } from 'src/app/services/creditos-compras.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedor-credito-compra',
  templateUrl: './proveedor-credito-compra.component.html',
  styleUrls: ['./proveedor-credito-compra.component.css', '../../../css/modulo.css']
})
export class ProveedorCreditoCompraComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Proveedores Con Créditos';
  headers: headersMasterInterface[] = headersCreditoProveedor;

  disabled = false;

  form: FormGroup;
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataReport: any[] = [];
  private _dataMetodoPago: any[] = [];
  private _totales: any = {};

  private _data = [];
  private _dataCreditosProveedor = [];
  private _dataProveedor: any = {};
  private _totalesCreditoByIdProveedor: any = [];
  selects: number[] = selectsPagination;

  today: string;

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

  showApertura = false;
  last_page: any;
  hasAbono = false;

  fechaInicial: string;
  fechaFinal: string;

  showTicket = false;
  idInvoice = null;

  showInputCaja = false;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private metodoPagoServise: MetodoPagoService,
    private creditoCompraService: CreditosComprasService,
    private router: Router,
    private cierreCajaService: CierreCajaService,
    private cajaService: CierreCajaService
  ) {}

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

    this.form = this.formBuilder.group({
      fecha_pago: ['', []],
      metodo_pago_id: [null, []],
      abonos: this.formBuilder.array([]),
      sacar_caja: ['', []],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
      fecha_inicial: ['', []],
      fecha_final: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getSucural();
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

    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
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
      this.tipoSucursal = resp.data.tipo_sucursal;
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  getMetodoPago() {
    this.metodoPagoServise.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
    });
  }

  get data() {
    return this._data;
  }

  get dataCreditosProveedor() {
    return this._dataCreditosProveedor;
  }

  get dataProveedor() {
    return this._dataProveedor;
  }

  get totalesCreditosByIdClient() {
    return this._totalesCreditoByIdProveedor;
  }

  get dataMetodoPago() {
    return this._dataMetodoPago;
  }

  get dataReport() {
    return this._dataReport;
  }

  get abonos() {
    return this.form.get('abonos') as FormArray;
  }

  get totales() {
    return this._totales;
  }

  count = 0;

  private getService(
    page,
    perPage,
    typeReport: TypeReport = TypeReport.noReport
  ): void {
    this.creditoCompraService
      .getProveedoresConCreditos(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        perPage,
        this.search.controls.field.value
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Proveedores Con Créditos'
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

        if (this.page == 1) {
          this._totales = resp.total;
        }
      });
  }

  getHistorial(page, type, typeReport: TypeReport = TypeReport.noReport): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, this.total_registros, typeReport);
      return;
    }
    if (!this.search.controls.field.value && !this.hasAbono && type != 3) {
      this.loaded = false;
    }
    this.getService(page, this.size.controls.data.value);
  }

  getCreditosByIdProveedor(item) {
    this.creditoCompraService
      .getCreditosByIdProveedor(item.id_proveedor)
      .subscribe((resp) => {
        this.cleanData();
        this._dataProveedor = item;
        this._dataCreditosProveedor = resp.data;
        this._totalesCreditoByIdProveedor = resp.total;
        this.generateAbonos();
      });
  }

  abonar() {
    this.disabled = true;
    this.hasAbono = false;
    let mayor = false;

    this.abonos.controls.forEach((element, index) => {
      if (element.get('valor').value) {
        this.hasAbono = true;
      }

      if (element.get('valor').value > this._dataCreditosProveedor[index].restante && ((element.get('valor').value - this._dataCreditosProveedor[index].restante) > 0.1 ) ) {
        mayor = true;
      }
    });

    if (!this.hasAbono) {
      this.onSuccess(
        'Debe ingresar por lo menos un abono',
        'Diligencie por lo menos un valor a abonar a una factura para poder realizar la acción de abonar...',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    if (mayor) {
      this.onSuccess(
        'Debe ingresar una cantidad menor a abonar',
        'Verifique el valor restante del crédito e ingrese un valor no mayor al restante',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    if (this.form.get('fecha_pago').value > this.today) {
      this.onSuccess(
        'Fecha incorrecta',
        'La fecha de pago no debe ser superior al día de hoy',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    this.creditoCompraService
      .addCreditoAbonoFacturaAll(this.form.value)
      .subscribe((_) => {
        this.onSuccess(
          'Abonos exitosos',
          'Se han realizado los abonos en las facturas exitosamente',
          TypeAlert.success
        );
        this.disabled = false;
        this.getHistorial(1, 1);
        this.getCreditosByIdProveedor(this.dataProveedor);
      });
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
        TypeAlert.warning
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
    //this.loaded = false;
    this.getHistorial(1, 1);
    alert("Llamando")
  }

  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  cleanData() {
    this.form.patchValue({
      fecha_pago: '',
      metodo_pago_id: null,
    });
    //this.fechaActual();
    this.abonos.clear();
  }

  closeApertura(event) {
    this.showApertura = false;
  }

  closeModal() {
    this.childModal?.hide();
  }

  closeModalPdf() {
    this.childModalPdf?.hide();
  }

  goBack() {
    this.router.navigate(['/informe-compras/creditos']);
  }

  openModal(item) {
    this.childModal?.show();
    this.showApertura = false;
    this.cierreCajaService.estadoCaja().subscribe((resp) => {
      if (!(resp && resp.data && resp.data.length > 0)) {
        this.showApertura = true;
      }
    });
    this.getCreditosByIdProveedor(item);
  }

  generateAbonos() {
    this._dataCreditosProveedor.forEach((element) => {
      const abono = this.formBuilder.group({
        factura_id: new FormControl(element.id),
        valor: new FormControl(null),
      });
      this.abonos.push(abono);
    });
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

  imprimirTicket(id) {
    this.showTicket = true;
    this.idInvoice = id; 
  }

  
  closeTicket(value: string) {
    this.showTicket = false;
  }

  viewShowApertura() {
    //console.log(this.form.get('metodo_pago_id').value);
    if (this.form.get('metodo_pago_id').value == 1) {
      this.showInputCaja = true;
      this.form.get('sacar_caja').reset('');
    } else {
      this.showInputCaja = false;
      this.showApertura = false;
      this.form.get('sacar_caja').reset('');
    }
  }

  changeCaja() {
    let checked = this.form.get('sacar_caja').value;
    if (checked) {
      // this.onWarning('Verificando estado de la caja...', 'warning', 'Espere');
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
  
  paginate(event) {
    this.page = event;
    this.getHistorial(this.page, 1);
  }
}
