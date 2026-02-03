import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { headersHistorialCompra } from 'src/app/constants/historial-compra';
import {
  estadosCreditosCompras,
  selectsPagination,
} from 'src/app/constants/selects';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { BodegaService } from 'src/app/services/bodega.service';
import { CompraService } from 'src/app/services/compra.service';
import { EventoRadianService } from 'src/app/services/evento-radian.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';

import $ from 'jquery';

@Component({
  selector: 'app-radian-listado',
  templateUrl: './radian-listado.component.html',
  styleUrls: ['../../informe/informe.component.css', '../../../css/modulo.css'],
})
export class RadianListadoComponent implements OnInit {
  @ViewChild('staticModalEventoRadian', { static: false })
  childModalEventoRadian?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  // @ViewChild('staticModal3', { static: false }) childModal3?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'EVENTOS RADIAN';
  headers: headersMasterInterface[] = headersHistorialCompra;

  disabled = false;

  formEventoRadian: FormGroup;
  formDevolver: FormGroup;
  // formObservacion: FormGroup;
  search: FormGroup; //variable que controla el formulario
  searchCodCredito: FormGroup; //variable que controla el formulario
  size: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataReport: any[] = [];
  private _dataFactura: any = {};
  private _dataMetodoPago: any[];
  private _dataBodega: any[] = [];

  // private _dataUsuario;
  private _dataProductosFactura: any;
  private _totales: any = {};

  selects: number[] = selectsPagination;
  estados: any[] = estadosCreditosCompras;

  private _data = [];

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  loaded = true;
  loaded2 = true;

  pages: Observable<any[]>;
  page = 1;
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
  hasDevolucion = false;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  showApertura: false;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private eventoRadianService: EventoRadianService,
    private metodoPagoServise: MetodoPagoService,
    private router: Router,
    private bodegaService: BodegaService
  ) {}

  ngOnInit() {
    this.formEventoRadian = this.formBuilder.group({
      cufe: ['', []],
    });

    this.formDevolver = this.formBuilder.group({
      factura: ['', []],
      metodo_pago: ['', []],
      prds: this.formBuilder.array([]),
    });

    this.formMetodoPago = this.formBuilder.group({
      metodo_pago: ['', []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      bodega: ['', []],
      estado: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.searchCodCredito = this.formBuilder.group({
      field: ['', []],
    });
    this.getBodegas();
    this.fechaActual();
    this.getSucural();
    this.getMetodoPago();
    this.getHistorial(1, 1);
  }

  getMetodoPago() {
    this.metodoPagoServise.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
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
      this.sucursal = resp.data.nombre;
      this.direccion = resp.data.direccion;
      this.nit = resp.data.nit;
      this.fecha = resp.data.fecha;
      this.logo = resp.data.logo;
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  public getBodegas(): void {
    this.bodegaService.getBodegaPermisos(0).subscribe((resp) => {
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

  get totales() {
    return this._totales;
  }

  get dataMetodoPago() {
    return this._dataMetodoPago;
  }

  get prds() {
    return this.formDevolver.get('prds') as FormArray;
  }

  get dataProductosFactura() {
    return this._dataProductosFactura;
  }

  count = 0;

  getService(
    page,
    type,
    perPage,
    typeReport: TypeReport = TypeReport.noReport
  ) {
    this.eventoRadianService
      .getEventosRadian(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        // this.search.controls.usuario.value,
        this.search.controls.estado.value,
        // this.search.controls.tipo_factura.value,
        perPage,
        this.searchCodCredito.controls.field.value,
        typeReport,
        1, ///facturas normales
        this.search.controls.bodega.value
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Ventas'
            );
          }
          return;
        }

        this.total_registros = resp.data.total;
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        console.log(this._data);

        this.loaded = true;
        this.count++;
        this.pages = of(resp.data.links);

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
    if (!this.searchCodCredito.controls.field.value && !this.hasDevolucion) {
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

  next() {
    this.pages.subscribe((resp) => {
      if (this.page < resp.length) {
        this.getHistorial(this.page + 1, this.type);
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getHistorial(this.page - 1, this.type);
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getHistorial(1, 3);
    }, 360);
  }

  cleanDataEventoRadian() {
    this.formEventoRadian.reset({
      cufe: '',
    });
  }

  closeModal1() {
    this.childModalEventoRadian?.hide();
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
        timer: 2000,
      });
    } else {
      Swal.fire({
        title: title,
        html: '' + mensaje + '!',
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

  guardarEventoRadian() {
    this.disabled = true;

    this.eventoRadianService
      .guardarEventoRADIAN(this.formEventoRadian.get('cufe').value)
      .subscribe(
        (resp) => {
          this.onSuccess('Evento RADIAN', resp.message, TypeAlert.success);
          this.getHistorial(1, 1);
          this.disabled = false;
        },
        (error) => {
          this.funcionesService.onSuccessWithButton(
            'Ocurrió un error',
            error.error.message,
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
    this.closeModal1();
  }

  devolver() {
    this.disabled = true;
    this.hasDevolucion = false;
    let mayor = false;
    let menor = false;

    this.prds.controls.forEach((element, index) => {
      if (element.get('cantidad_devolver').value) {
        this.hasDevolucion = true;
      }

      if (
        element.get('cantidad_devolver').value >
        this.dataProductosFactura[index].cantidad -
          this.dataProductosFactura[index].devolucion
      ) {
        mayor = true;
      }

      if (
        element.get('cantidad_devolver').value &&
        element.get('cantidad_devolver').value < 1
      ) {
        menor = true;
      }
    });

    if (!this.hasDevolucion) {
      this.onSuccess(
        'Debe ingresar por lo menos una devolución',
        'Diligencie por lo menos una devolución a una factura para poder realizar la acción de devolver...',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    if (mayor) {
      this.onSuccess(
        'Error en la cantidad a devolver',
        'Verifique las cantidades a devolver, estas no pueden exceder las unidades restantes...',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    if (menor) {
      this.onSuccess(
        'Error en la cantidad a devolver',
        'Verifique las cantidades a devolver, estas no pueden ser menores a 1...',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    this.eventoRadianService
      .devolucionFacturaCompra(
        this.formDevolver.value,
        this.formDevolver.get('metodo_pago').value,
        this._dataFactura.id
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Productos devueltos',
            'Se ha realizado las devoluciones de los productos con éxito',
            TypeAlert.success
          );
          this.router.navigate(['/informe-compras', 'devoluciones']);
          // this.getHistorial(1, 1);
          this.disabled = false;
        },
        (_) => {
          this.funcionesService.onSuccessWithButton(
            'Error al devolver los productos!',
            'Ocurrió un error',
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
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
      this.getHistorial(1, 1);
    }
  }

  openModalEventoRadian() {
    this.cleanDataEventoRadian();
    this.childModalEventoRadian?.show();
  }

  openModal(item, accion: number) {
    this._dataFactura = item;

    switch (accion) {
      case 1:
        if (item.estado_id == 3) {
          this.onSuccess(
            'La factura fue anulada',
            'cufe: ' + item.cufe_anulacion,
            TypeAlert.warning
          );
          return;
        }
        this.cleanDataEventoRadian();
        this.childModalEventoRadian?.show();
        break;
      case 2:
        this.childModal2?.show();
        break;
      default:
        break;
    }
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
  }

  form: any = {
    option: '',
  };

  changeStatus(id, type) {
    let title = '';

    let types = [
      {
        "id": 1,
        "text": "Documento con inconsistencias",
      },
      {
        "id": 2,
        "text": "Mercancía no encontrada totalmente",
      },
      {
        "id": 3,
        "text": "Mercancía no entregada parcialmente",
      },
      {
        "id": 4,
        "text": "Servicio no prestado",
      },
    ];

    let options = '';

    for (let i = 0; i < types.length; i++) {
      let item = types[i];
      options += `<option value="${item.id}">${item.text}</option>`;
    }



    switch (type) {
      case 1: // Acuse de recibo
        title = 'Acuse de recibo';
        break;
      case 2:
        title = 'Reclamo de la Factura Electrónica de Venta';
        break;
      case 3:
        title = 'Recibo del bien y/o prestación del servicio';
        break;
      case 4:
        title = 'Aceptación expresa';
        break;
    }

    if (type == 2) {
      Swal.fire({
        title: 'Escoja una opción',
        html: `
        <div class="row container-fluid">
        <div class="form-group col-md-12">
        <label>Motivo de rechazo</label>
        <select id="con2" class="form-control">
        <option disabled value='' selected>SELECCIONAR...</option>
        ${options}
        </select>
        </div>
        `,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          var con2 = $('#con2').val();
          console.log(con2);
          console.log( $('#con2'));
          

          this.form.option = con2;
          if (con2 != '' && con2 != null) {
            return this.form;
          } else {
            Swal.showValidationMessage(
              'Por favor, rellene todos los campos correctamente.'
            );
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          let obj = result.value;
          console.log(obj)
          this.eventoRadianService.changeStatusEventoRadian(id, type, obj.option).subscribe(
            (resp) => {
              this.onSuccess('Ok', resp.message, TypeAlert.success);
              this.getHistorial(1, 1);
              this.disabled = false;
            },
            (error) => {
              this.showErrors(error);
              this.disabled = false;
            }
          );
        } else {
          this.form.nombre = '';
        }
      });
    } else {
      Swal.fire({
        title: 'Información',
        text: title,
        icon: 'warning',
        iconColor: '#DC562F',
        showCancelButton: true,
        confirmButtonColor: '#145388',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.eventoRadianService.changeStatusEventoRadian(id, type).subscribe(
            (resp) => {
              this.onSuccess('Ok', resp.message, TypeAlert.success);
              this.getHistorial(1, 1);
              this.disabled = false;
            },
            (error) => {
              this.showErrors(error);
              this.disabled = false;
            }
          );
        }
      });
    }
  }

  showErrors(error) {
    let message = "";
    console.log(error);
    
    if ((typeof error.error.errors.string) == "string") {
      message = error.error.errors.string;
    } else {
      let li = '<ul>';
      for (let i = 0; i < (error.error.errors.string).length; i++) {
        let item = error.error.errors.string[i];
        message += '<li>' + item + "</li>";
      }      
      li += '</ul>';
    }
    this.onSuccess(
        'Ocurrió un error',
        message,
        TypeAlert.warning
      );
  }

  delete(id) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Desea continuar con esta eliminación?',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eventoRadianService.delete(id).subscribe(
          (resp) => {
            this.onSuccess('Ok', 'Eliminado con éxito', TypeAlert.success);
            this.getHistorial(1, 1);
            this.disabled = false;
          },
          (error) => {
            this.showErrors(error);
            this.disabled = false;
          }
        );
      }
    });
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  closeApertura(event) {}
}
