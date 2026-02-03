import { VentaRestauranteService } from 'src/app/services/venta-restaurante.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { FuncionesService } from 'src/app/services/funciones.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { selectsPagination } from 'src/app/constants/selects';
import { DomicilioService } from 'src/app/services/domicilio.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { headersDomicilios } from 'src/app/constants/domicilios';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { DomiciliarioService } from 'src/app/services/domiciliario.service';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';

@Component({
  selector: 'domicilios',
  templateUrl: './domicilios.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class DomiciliosComponent implements OnInit {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  headers: headersMasterInterface[] = headersDomicilios;

  form: FormGroup; //variable que controla el formulario
  search_fech: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  title: String;
  type: number = 0;
  page = 1;
  totalItems: number;
  pages: number;

  loaded = false;
  loaded2 = false;
  usarDecimales: Number = 1;
  timeClear: any;
  tipo: any;
  _idEdit;
  showTicket = false;
  idInvoice = null;
  totalPagar: any;
  facturaVentaID: any;

  private _dataDomiciliarios = [];
  private _dataMetodosPago = [];
  private _data = [];
  private _dataPdf = [];

  selects: number[] = selectsPagination;
  lockbutton: boolean = false;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private domiciliosService: DomicilioService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private ventaRestauranteService: VentaRestauranteService,
    private exportarExcelService: ExportarExcelService,
    private domiciliarioService: DomiciliarioService,
    private metodoPagoService: MetodoPagoService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        factura_venta_id: ['', [Validators.required]],
        domiciliario: ['', [Validators.required]],
        metodo_pago: ['', []],
        total_pagar: ['', []],
        combinaciones: this.formBuilder.array([]),
      },
      {
        validators: [this.validarCombinadoConTotal()],
      }
    );

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.search_fech = this.formBuilder.group({
      fecha_inicial: ['', []],
      fecha_final: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.form.get('metodo_pago')?.valueChanges.subscribe((valor) => {
      if (valor == 10) {
        if (this.combinaciones.length === 0) {
          this.agregarCombinacion();
        }
      } else {
        this.combinaciones.clear();
      }
    });

    this.fechaActual();
    this.getSucural();
    this.getDomicilios(1, this.type);
  }

  nuevaCombinacion(data: any = {}): FormGroup {
    return this.formBuilder.group({
      id: [data.id || null, [Validators.required]],
      metodo: [data.metodo || '', [Validators.required]],
      valor: [data.valor || '', [Validators.required, Validators.min(0.01)]],
    });
  }

  get combinaciones(): FormArray {
    return this.form.get('combinaciones') as FormArray;
  }

  agregarCombinacion() {
    this.combinaciones.push(this.nuevaCombinacion());
  }

  eliminarCombinacion(index: number) {
    this.combinaciones.removeAt(index);
  }

  get totalCombinado(): number {
    return this.combinaciones.controls.reduce((sum, grupo) => {
      const val = parseFloat(grupo.get('valor')?.value) || 0;
      return sum + val;
    }, 0);
  }

  get faltanteCombinado(): number {
    return Math.max(this.totalPagar - this.totalCombinado, 0);
  }

  onMetodoSelect(event: Event, index: number): void {
    const select = event.target as HTMLSelectElement;
    const valorId = parseInt(select.value, 10);
    const valorNombre = select.options[select.selectedIndex].text;

    const grupo = this.combinaciones.at(index);
    grupo.get('id')?.setValue(valorId);
    grupo.get('metodo')?.setValue(valorNombre);
  }

  // Función para formatear número manteniendo decimales
  formatNumber(value: any): string {
    if (value === null || value === undefined || value === '') return '';

    const valorStr = value.toString();

    // Separar parte entera y decimal
    const [entero, decimal] = valorStr.split('.');

    // Formatear la parte entera con comas
    const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Volver a unir con la parte decimal si existe
    return decimal !== undefined
      ? `${enteroFormateado}.${decimal}`
      : enteroFormateado;
  }

 onValorInput(input: string, index: number): void {
  const limpio = input.replace(/,/g, '').replace(/[^0-9.]/g, '');
  const valor = parseFloat(limpio);

  const grupo = this.combinaciones.at(index);
  const valorAnterior = +grupo.get('valor')?.value || 0;

  const totalActual = this.totalCombinado - valorAnterior;
  const faltante = this.totalPagar - totalActual;

  if (!isNaN(valor)) {
    if (valor > faltante) {
      // Si el valor se pasa del total permitido, lo borramos y marcamos como touched
      grupo.get('valor')?.setValue('', { emitEvent: false });
      grupo.get('valor')?.markAsTouched();
    } else {
      grupo.get('valor')?.setValue(valor, { emitEvent: true });
    }
  } else {
    grupo.get('valor')?.setValue('', { emitEvent: false });
  }
}

  validarCombinadoConTotal() {
    return (form: AbstractControl): ValidationErrors | null => {
      const metodoControl = form.get('metodo_pago');
      const metodo = +metodoControl?.value;

      // Si no se ha diligenciado método de pago, no validar
      if (!metodoControl?.value) {
        return null;
      }

      // Solo aplicar si es método COMBINADO (id === 10)
      if (metodo === 10) {
        const combinaciones = form.get('combinaciones') as FormArray;

        // Validar que todas las combinaciones tengan id y metodo
        const faltantes = combinaciones.controls.some((ctrl) => {
          const id = ctrl.get('id')?.value;
          const metodo = ctrl.get('metodo')?.value;
          return !id || !metodo;
        });

        if (faltantes) {
          return { combinacionesIncompletas: true };
        }

        // Validar suma de valores
        const suma = combinaciones.controls.reduce((acc, item) => {
          const val = parseFloat(item.get('valor')?.value) || 0;
          return acc + val;
        }, 0);

        if (suma !== this.totalPagar) {
          return { sumaCombinadoInvalida: true };
        }
      }

      return null;
    };
  }

  onSuccess(mensaje: any, tipo: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Actualizado',
        text: '' + mensaje + ' !',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: 'Advertencia!',
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  getDomicilios(page, type): void {
    this.type = type;
    if (this.type == 0) {
      this.title = 'ORDENES PENDIENTES';
    } else {
      this.title = 'ORDENES ENTREGADAS';
    }
    //this.loaded = false;
    this.domiciliosService
      .getDomiciliosPorPagina(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        this.type,
        this.search_fech.controls.fecha_inicial.value,
        this.search_fech.controls.fecha_final.value
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

  generateExcel() {
    this.type = this.type;
    if (this.type == 0) {
      this.title = 'ORDENES PENDIENTES';
    } else {
      this.title = 'ORDENES ENTREGADAS';
    }

    this.domiciliosService
      .getDomiciliosPorPagina(
        '',
        this.search.controls.field.value,
        this.size.controls.data.value,
        'No',
        this.type,
        this.search_fech.controls.fecha_inicial.value,
        this.search_fech.controls.fecha_final.value
      )
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, ' ' + this.title);
      });
  }

  generatePdf() {
    this.loaded2 = false;

    this.type = this.type;
    if (this.type == 0) {
      this.title = 'ORDENES PENDIENTES';
    } else {
      this.title = 'ORDENES ENTREGADAS';
    }

    this.domiciliosService
      .getDomiciliosPorPagina(
        '',
        this.search.controls.field.value,
        this.size.controls.data.value,
        'No',
        this.type,
        this.search_fech.controls.fecha_inicial.value,
        this.search_fech.controls.fecha_final.value
      )
      .subscribe((resp) => {
        this._dataPdf = resp.data;
        this.loaded2 = true;
      });
  }

  get data() {
    return this._data;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  get dataDomiciliarios() {
    return this._dataDomiciliarios;
  }

  get dataMetodosPago() {
    return this._dataMetodosPago;
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getDomicilios(1, this.type);
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
      this.getDomicilios(1, this.type);
    }, 360);
  }

  buscarHistorial() {
    this.search.controls.field.setValue('');

    if (
      this.search_fech.controls.fecha_inicial.value != '' &&
      this.search_fech.controls.fecha_inicial.value != ''
    ) {
      this.getDomicilios(1, this.type);
    } else {
      Swal.fire({
        title: 'Debe diligenciar las fechas',
        text: 'Diligencia los rangos de fecha para poder consultar las ordenes...',
        icon: 'warning',
        iconColor: '#DC562F',
        showCancelButton: true,
        showConfirmButton: false,
      });
    }
  }

  /* Actualizar estado de factura cuando se haga la entrega del domicilio */
  updateEstadoFactura(factura_id: any) {
    Swal.fire({
      title: '¿Estás seguro que el producto fue entregado?',
      text: 'Si, da click en OK, el domicilio se marcará como entregado, y se terminará de procesar la venta',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ok',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ventaRestauranteService.updateEstadoFactura(factura_id).subscribe(
          (resp) => {
            if (resp.code == '202') {
              this.onSuccess(resp.message, 'error');
            } else {
              this.onSuccess(resp.message, 'success');
            }
            this.getDomicilios(1, this.type);
          },
          (err) => {
            alert('Ocurrió un error');
          }
        );
      }
    });
  }

  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    var fecha_inicial = `${year}-${month}-${day}`;
    var fecha_final = `${year}-${month}-${day}`;
    this.search_fech.controls.fecha_inicial.setValue(fecha_inicial);
    this.search_fech.controls.fecha_final.setValue(fecha_final);
  }

  imprimirTicket(id) {
    this.showTicket = true;
    this.idInvoice = id;
  }

  closeTicket(value: string) {
    this.showTicket = false;
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

  ///consulto metodos de pagos
  getMetodoPago() {
    this.metodoPagoService.getMetodoPagos().subscribe((resp) => {
      this._dataMetodosPago = resp.data;
    });
  }

  openModal(obj: {} = {}) {
    this.totalPagar = obj['total_venta'];
    this.lockbutton = false;

    ///Consulto domiciliarios
    this.domiciliarioService
      .getDomiciliariosPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataDomiciliarios = resp.data;
      });

    ///consulto metodos de pagos:
    this.getMetodoPago();

    this.form.controls.domiciliario.setValue(obj['domiciliario_id']);
    this.form.controls.total_pagar.setValue(obj['total_venta']);
    this.form.controls.metodo_pago.setValue('');
    this.form.controls.factura_venta_id.setValue(obj['factura_venta_id']);
    this._idEdit = obj['id'];
    this.childModal?.show();
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
      if (this.form.errors?.combinacionesIncompletas) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Todos los métodos combinados deben tener método de pago asignado.',
        });
        return;
      } else if (this.form.errors?.sumaCombinadoInvalida) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'El total asignado en los métodos combinados no coincide con el total a pagar.',
        });
        return;
      }
    }

    this.lockbutton = true;
    this.domiciliosService
      .putDomicilio(this.form.value, this._idEdit)
      .subscribe((resp) => {
        this.lockbutton = false;

        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Hecho!',
          text: 'Domiciliario actualizado exitosamente!',
          showConfirmButton: false,
          timer: 1500,
        });
        this.closeModal();
        this.getDomicilios(1, this.type);
      });
  }

  paginate(event) {
    this.page = event;
    this.getDomicilios(this.page, this.type);
  }
}
