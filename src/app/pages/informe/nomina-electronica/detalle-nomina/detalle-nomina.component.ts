import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { estadosCreditos, selectsPagination } from 'src/app/constants/selects';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersNominaElectronicaDetalle } from 'src/app/constants/nomina-electronica-detalle';
import { ActivatedRoute, Router } from '@angular/router';
import { FuncionService } from 'src/app/services/funcion.service';
import { NominaElectronicaService } from 'src/app/services/nomina-electronica.service';
import { meses } from 'src/app/constants/meses';
import { YearService } from 'src/app/services/year.service';
import { estadoNomina, tipoNomina } from 'src/app/constants/detalle-nomina';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detalle-nomina',
  templateUrl: './detalle-nomina.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css', '../../drowpbutton.css'],
})
export class DetalleNominaComponent implements OnInit {

  @ViewChild('staticModal3', { static: false }) childModal3?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Empleados En Emisión De Nómina Electrónica';
  headers: headersMasterInterface[] = headersNominaElectronicaDetalle;
  mesesAnio = meses;
  tipoNominaArr = tipoNomina;
  estadoNominaArr = estadoNomina;

  disabled = false;
  disabledEnvioDian = false;
  formAnular: FormGroup;
  formDevolver: FormGroup;
  formNominaElectronica: FormGroup;
  search: FormGroup; //variable que controla el formulario
  searchCodCredito: FormGroup; //variable que controla el formulario
  size: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataReport: any[] = [];
  private _dataFactura: any = {};
  private _dataNomina: any = {};
  private _dataMetodoPago: any[];
  private _dataUsuario;
  private _dataProductosFactura: any;
  private _totales: any = {};
  total_deducciones = 0;
  total_devengado = 0;
  total_salario = 0;

  selects: number[] = selectsPagination;
  estados: any[] = estadosCreditos;

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

  is_fact_elect: boolean = false;
  usarDecimales: Number = 1;
  tipoSucursal: any;
  totalVenta: string = '0';
  totalVentaMetodoPago: string = '0';
  totalVentaMesa: string = '0';
  totalGastoPdf: string = '0';
  busquedaPorCodigo: String = '';
  erroresDianFactura: String = '';

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;

  showTicket = false;
  showTicketVentaCarta = false;
  formatTiket: number;
  createdAt: number;
  idInvoice = null;

  isFacturaElectronica = false;

  
  empleadosNoAgregados: any[];

  last_page = 0;

  currentPage = 1;
  hasDevolucion = false;

  showApertura: false;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  nominaId: String;

  disabledEnviando = false;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private historialVentaService: HistorialVentaService,
    private nominaElectronicaService: NominaElectronicaService,
    private metodoPagoServise: MetodoPagoService,
    private userService: UserService,
    private router: Router,
    private funcionService: FuncionService,
    private yearService: YearService,
    private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private _location: Location
  ) {}

  ngOnInit() {

    this.nominaId = this.activeRoute.snapshot.paramMap.get('nominaId');

    console.log(this.nominaId);

    this.formAnular = this.formBuilder.group({
      motivo: ['', []],
    });

    this.formDevolver = this.formBuilder.group({
      factura: ['', []],
      metodo_pago: ['', []],
      prds: this.formBuilder.array([]),
    });

    this.formNominaElectronica = this.formBuilder.group({
      empleado: [null, []],
      nomina: [this.nominaId]
    });

    this.formMetodoPago = this.formBuilder.group({
      metodo_pago: ['', []],
    });

    this.search = this.formBuilder.group({
      empleado: ['', []],
      num_nomina: ['', []],
      tipo_nomina: ['', []],
      estado: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.searchCodCredito = this.formBuilder.group({
      field: ['', []],
    });
    // this.fechaActual();
    this.getSucural();
    console.log('hee')
    this.getHistorial(1, 1);

    this.buscarEmpleadosNoAgregadosNomina();
  }


  background(estado_id) {
    return estado_id == 5 ? 'rgb(0 136 159 / 17%)' : '';
  }

  getMonth(month) {
    
    // Buscar el mes por su id
    const result = this.mesesAnio.find(m => m.id === month);

    // Si no se encuentra, retornar "Mes inválido"
    return result ? result.name : "Mes inválido";
}

  closeApertura(event) {}

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.getHistorial(1, 1, TypeReport.excel, true);
  }

  generatePdf() {
    this.getHistorial(1, 1, TypeReport.pdf);
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
      this.is_fact_elect = resp.data.is_fact_elect;
      this.formatTiket = resp.data.formato_ticket;
      this.createdAt = resp.data.created_at;

      this.isFacturaElectronica = resp.data.is_fact_elect;

    });
  }

  get data() {
    return this._data;
  }

  get dataNomina() {
    return this._dataNomina;
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

  buscarEmpleadosNoAgregadosNomina() {
    this.nominaElectronicaService.buscarEmpleadosNoAgregadosNomina(this.nominaId).subscribe(
      resp => {
        this.empleadosNoAgregados = resp.data;
      }
    )
  }

  getService(
    page,
    type,
    perPage,
    typeReport: TypeReport = TypeReport.noReport,
    isExcel = false
  ) {
    this.nominaElectronicaService
      .getDetalleNominaElectronica(
        this.nominaId,
        page,
        this.search.controls.empleado.value,
        this.search.controls.num_nomina.value,
        this.search.controls.tipo_nomina.value,
        this.search.controls.estado.value,
        perPage,
        typeReport
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this._dataReport = resp.data.data;

            this.exportarExcelService.getExportar(
              this._dataReport,
              'Nómina Electrónica'
            );
          } else {
            this._dataReport = resp.data.data.data;
          }
          return;
        }

        this.total_registros = resp.data.data.total;
        this.page = resp.data.data.current_page;
        this._data = resp.data.data.data;
        this._dataNomina = resp.data.info_nomina;
        this.total_deducciones = resp.data.total_deducciones;
        this.total_devengado = resp.data.total_devengado;
        this.total_salario = resp.data.total_salario;
        
        this.loaded = true;
        this.count++;
        this.pages = of(resp.data.data.links);
        if (this.page == 1) {
          // this._totales = resp.total;
        }

        this.last_page = resp.data.last_page;

        this._dataReport = resp.data.data;
      });
  }

  downloadFile(factura_id, file, codigo_factura) {
    this.historialVentaService
      .downloadInvoiceFile(factura_id, file, 3)
      .subscribe(
        (data: Blob) => {
          const blob = new Blob([data], { type: 'application/' + file });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = codigo_factura + '.' + file;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('Error downloading: ' + file, error);
        }
      );
  }

  pageClicked = 0;
  getHistorial(
    page,
    type,
    typeReport: TypeReport = TypeReport.noReport,
    isExcel = false
  ): void {
console.log("edfsdf")
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, type, this.total_registros, typeReport);
      return;
    }
    if (
      !this.searchCodCredito.controls.field.value &&
      !this.hasDevolucion &&
      type != 3
    ) {
      this.loaded = false;
    }
    this.pageClicked = page;
    this.getService(page, type, this.size.controls.data.value);
  }

  generateProductos() {
    this.formDevolver.patchValue({ factura: this._dataFactura.id });
    this._dataProductosFactura.forEach((element, index) => {
      const dis = element.devolucion == element.cantidad ? true : false;

      const producto = this.formBuilder.group({
        producto_id: new FormControl(element.producto_id),
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

  private getProductosByIdFactura(item) {
    this.historialVentaService
      .getDetalleFacturaVenta(item.id)
      .subscribe((resp) => {
        this.cleanData2();
        this._dataFactura = item;
        this._dataProductosFactura = resp.data;

        this.generateProductos();
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
    this.prds.clear();
  }

  cleanData3() {
    this.formNominaElectronica.reset({
      empleado: [null, []],
      nomina: [this.nominaId]
    });
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
        timer: 2000,
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

  sendNominaElectronica(nominaId, id, empleadoId) {
      Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción enviará la nómina electrónica! ¿Deseas continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.disabledEnviando = true; 

        Swal.fire({
          title: 'Enviando nómina del empleado...',
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false
        });

        this.nominaElectronicaService
          .sendNominaElectronica(
            nominaId,
            id,
            empleadoId
          )
          .subscribe({ 
            next: (resp) => {
              Swal.close(); 

              this.onSuccess(
                'Nómina enviada con éxito',
                resp.message,
                TypeAlert.success
              );
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            },
            error: (error) => {
              Swal.close(); 

              
              const errorMessage = error && error.error && error.error.message ? error.error.message : 'Error desconocido al enviar la nómina.';
              this.onSuccess(
                'Ocurrió un error!',
                errorMessage,
                TypeAlert.warning
              );
              this.disabledEnviando = false; 
            }
          });
      }
    });

  }

   goBack() {
    this._location.back();
  }

   openPdfInNewTab(nominaId, id, empleadoId): void {
    Swal.fire({
      title: 'Cargando PDF...', 
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,   
      showConfirmButton: false 
      }
    );

    this.nominaElectronicaService.getNominaElectronicaPdf(nominaId, id, empleadoId)
      .subscribe({
        next: (pdfBlob: Blob) => {
          Swal.close();
          const blobUrl = URL.createObjectURL(pdfBlob);
          window.open(blobUrl, '_blank');
        },
        error: (error) => {
          Swal.close();
          Swal.fire({
            title: 'Error al cargar el PDF',
            text: 'No se pudo cargar el PDF de la nómina electrónica. Por favor, inténtalo de nuevo.',
            icon: 'error', 
            confirmButtonColor: '#145388',
          });
        }
      });
  }

  deleteNominaElectronica(nominaId, id, empleadoId) {
      this.disabledEnviando = true;
      Swal.fire({
        title: 'Ingrese la nota de la nómina a eliminar',
        input: 'textarea',
        inputPlaceholder: 'Escribe una nota aquí...',
        showCancelButton: true,
        confirmButtonText: 'Eliminar Nómina',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: (description) => {
          if (!description || description.trim() === '') {
            Swal.showValidationMessage('La nota no puede estar vacía');
            return false; 
         }
          return description;
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          const description = result.value || '';
  
          this.disabledEnviando = true;
  
          Swal.fire({
            title: 'Eliminando nómina del empleado...',
            html: `<p>Nota: <strong>${description || 'Ninguna'}</strong></p>`,
            didOpen: () => {
              Swal.showLoading();
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
          });
  
          
          this.nominaElectronicaService
            .deleteNominaElectronica(
              nominaId, id, empleadoId,description
            )
            .subscribe({
              next: (resp) => {
                Swal.close();
  
                this.onSuccess(
                  'Nómina elimninada con éxito',
                  resp.message,
                  TypeAlert.success
                );
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              },
              error: (error) => {
                Swal.close();
  
                const errorMessage = error && error.error && error.error.message ? error.error.message : 'Error desconocido al enviar la nómina.';
                this.onSuccess(
                  'Ocurrió un error!',
                  errorMessage,
                  TypeAlert.warning
                );
                this.disabledEnviando = false; 
              }
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
    // this.search.controls.fecha_inicial.setValue(fecha_inicial);
    // this.search.controls.fecha_final.setValue(fecha_final);
    // this.search.controls.hora_inicial.setValue(`00:00`);
    // this.search.controls.hora_final.setValue(`23:59`);

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
          this.getHistorial(1, 1);
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

    this.historialVentaService
      .devolucionFacturaVenta(
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
          this.router.navigate(['/informe', 'devoluciones']);
          // this.getHistorial(1, 1);
          this.disabled = false;
        },
        (_) => {
          this.onSuccess(
            'Error al devolver los productos!',
            'Ocurrió un error',
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
  }

  observacion() {
    this.disabled = true;

    this.nominaElectronicaService
      .agregarEmpleadoNomina(
        this.formNominaElectronica.value
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Empleado agregado a la nómina',
            'Se agregó el empleado con éxito',
            TypeAlert.success
          );
          this.buscarEmpleadosNoAgregadosNomina();
          this.getHistorial(1, 1);
          this.disabled = false;
        },
        (error) => {
          this.onSuccess(
            'Ocurrió un error!',
            error.error.message,
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
    this.closeModal3();
  }

  openModal(item, accion: number) {
    this._dataFactura = item;

    switch (accion) {
      case 1:
        if (item.estado_id == 3) {
          this.onSuccess(
            'La factura fue anulada',
            'Motivo: ' + item.motivo_anulacion,
            TypeAlert.warning
          );
          return;
        }
        this.cleanData1();
        break;
      case 2: // Devolucion
        if (item.estado_id == 2) {
          this.onSuccess(
            'La factura está en proceso',
            'No puede realizar devoluciones a una factura en proceso',
            TypeAlert.warning
          );
          return;
        } else if (item.estado_id == 3) {
          this.onSuccess(
            'La factura fue anulada',
            'No puede realizar devoluciones a una factura anulada',
            TypeAlert.warning
          );
          return;
        } else {
          this.cleanData2();
          this.getProductosByIdFactura(item);
        }
        break;
      case 3:
        this.cleanData3();
        this.childModal3?.show();
        this.formNominaElectronica.reset({
          empleado: null,
          nomina: this.nominaId
        });
        break;
      case 4:
        this.erroresDianFactura = '';
        this.erroresDianFactura = item.errorMessages;
        break;
      case 5: //reenvio de factura a la Dian
        this.idInvoice = item.id;
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
    return this.funcionesService.getColorState(estado);
  }

  getColorStateNominaEnviada(estado: number) {
    if (estado == null) {
      estado = 0;
    }
    return this.funcionesService.getColorStateNominaEnviada(estado);
  }

  imprimirTicket(item) {
    this.showTicket = true;
    this.idInvoice = item.id;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  imprimirTicketCarta(item) {
    this.showTicketVentaCarta = true;
    this.idInvoice = item.id;
  }

  closeTicketCarta(value: string) {
    this.showTicketVentaCarta = false;
  }

  ///gestiono el reenvio de la factura electronica cuando la DIAN EST EN MANTENIMIENTO
  electronicInvoiceDian() {
    this.disabledEnvioDian = true;

    this.historialVentaService.reenviarFacturaDian(this.idInvoice).subscribe(
      (resp) => {
        this.funcionService.onSuccess(resp.message, 'success', '¡OK!');
        ///en el caso que sea exitoso el envio, refrescamos la tabla
        this.getHistorial(1, 1);

        this.disabledEnvioDian = false;
      },
      (error) => {
        this.disabledEnvioDian = false;
        this.funcionService.onSuccess(
          error.error.data,
          'error',
          error.error.message
        );
      }
    );
  }
}
