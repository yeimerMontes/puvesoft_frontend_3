import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import {
  selectsPagination,
  tiposDetalleVenta,
} from 'src/app/constants/selects';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { UserService } from 'src/app/services/user.service';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { DetalleComprasService } from 'src/app/services/detalle-compra.service';
import { ProveedorService } from 'src/app/services/porveedor.service';
import { headersDetalleCompra } from 'src/app/constants/detalle_compra';
import { BodegaService } from 'src/app/services/bodega.service';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: [
    '../../../informe/informe.component.css',
    '../../../../css/modulo.css',
  ],
})
export class ListadoComponent implements OnInit {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Detalle de compras';
  headers: headersMasterInterface[] = headersDetalleCompra;

  formAnular: FormGroup;
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataReport: any[] = [];
  private _dataFactura;
  private _dataUsuario;
  private _dataBodega: any[] = [];
  dataProveedor: any[] = [];

  selects: number[] = selectsPagination;
  tipoVenta: any[] = tiposDetalleVenta;
  _totales: any;

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

  lastPage;
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
  clienteSeleccionado;

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;
  last_page: any;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private userService: UserService,
    private historialVentaService: HistorialVentaService,
    private detalleCompraService: DetalleComprasService,
    private proveedorService: ProveedorService,
    private bodegaService: BodegaService,

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
      tipo: [1, []],
      proveedor: ['', []],
      usuario: ['', []],
      bodega: ['', []],
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getBodegas();
    this.fechaActual();
    this.getSucural();
    this.getProveedor();
    this.getHistorial(1);
    this.getUsuarios();
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

  getUsuarios() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataUsuario = resp.data;
    });
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }
  private getProveedor() {
    this.proveedorService
      .getProveedoresPorPagina(1, '', 7, '')
      .subscribe((resp) => {
        this.dataProveedor = resp.data.data;
      });
  }

  public getBodegas(): void {
    this.bodegaService
      .getBodegaPermisos(0)
      .subscribe((resp) => {
        this._dataBodega = resp.data;
      });
  }

  get dataBodega() {
    return this._dataBodega;
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

  get dataUsuario() {
    return this._dataUsuario;
  }

  get totales() {
    return this._totales;
  }

  count = 0;

  getService(page, perPage, typeReport: TypeReport = TypeReport.noReport) {
    this.detalleCompraService
      .getDetalleCompraPorPagina(
        this.search.controls.tipo.value,
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.bodega.value,
        this.search.controls.proveedor.value,
        this.search.controls.usuario.value,
        perPage,
        typeReport,
        this.search.controls.field.value
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Detalle_Compras'
            );
          }
          return;
        }

        this.total_registros = resp.data.total;
        this._totales = resp.total;
        this._data = resp.data.data;
        this.loaded = true;
        this.count++;
        
        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        
        this.last_page = resp.data.last_page;
      });
  }

  getHistorial(page, typeReport: TypeReport = TypeReport.noReport): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, this.total_registros, typeReport);
      return;
    }
    if (!this.search.controls.field.value) {
      this.loaded = false;
    }
    this.getService(page, this.size.controls.data.value);
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
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
    this.historialVentaService
      .anularFacturaVenta(
        this._dataFactura.id,
        this.formAnular.get('motivo').value
      )
      .subscribe(
        (resp) => {
          this.onSuccess(
            'Factura Anulada',
            'Se ha anulado la factura con éxito',
            TypeAlert.success
          );
          this.getHistorial(1);
        },
        (_) => {
          this.onSuccess(
            'Factura No Anulada!',
            'Ocurrió un error',
            TypeAlert.warning
          );
        }
      );
    this.closeModal();
  }

  buscarHistorialVencimiento() {
    let fecha_inicial_vencimiento =
      this.search.controls.fecha_inicial_vencimiento.value;
    let fecha_final_vencimiento =
      this.search.controls.fecha_final_vencimiento.value;

    if (!(fecha_inicial_vencimiento || fecha_final_vencimiento)) {
      this.onSuccess(
        'Debe diligenciar las fechas de vencimiento',
        'Diligencie los rangos de fecha de vencimiento para poder consultar el historial de vencimiento...',
        TypeAlert.warning
      );
      return;
    }

    if (!fecha_inicial_vencimiento && fecha_final_vencimiento) {
      this.onSuccess(
        'Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha inicial de vencimiento para poder consultar los vencimientos...',
        TypeAlert.warning
      );
      return;
    }

    if (fecha_inicial_vencimiento && !fecha_final_vencimiento) {
      this.onSuccess(
        'Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha final de vencimiento para poder consultar los vencimientos...',
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.getHistorial(1);
    }
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';
    this.search.controls.field.setValue('');

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
      this.getHistorial(1);
    }
  }

  openModal(item) {
    this.cleanData();
    this.childModal?.show();
    this._dataFactura = item;
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

  buscar_nombre(value) {
    
    clearTimeout(this.timeClear);
    this.timeClear = setTimeout(() => {
      this.proveedorService
        .getProveedoresPorPagina(1, value, 7, '')
        .subscribe((resp) => {
          this.dataProveedor = resp.data.data;
        });
    }, 360);
  }

  public guardarProveedor(item): void {
    let selectedIndex = this.dataProveedor.findIndex(
      (dataItem) => dataItem.nombre == item
    );

    if (selectedIndex != -1) {
      let selectedItemFromData = this.dataProveedor[selectedIndex];
      this.search.controls.proveedor.setValue(selectedItemFromData.id);
    }
  }
  public onClearAll(): void {
    this.search.controls.proveedor.setValue('');
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page);
  }
}
