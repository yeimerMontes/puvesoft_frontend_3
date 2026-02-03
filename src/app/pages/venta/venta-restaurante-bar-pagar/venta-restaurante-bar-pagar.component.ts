import { tipoFactura } from './../../../constants/selects';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  HostListener,
  Input,
  Inject,
} from '@angular/core';
import $ from 'jquery';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { ClienteService } from 'src/app/services/cliente.service';
import { FuncionService } from 'src/app/services/funcion.service';
import { VentaRestauranteService } from 'src/app/services/venta-restaurante.service';
import { DOCUMENT, DatePipe } from '@angular/common';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { TipoDocumentoService } from 'src/app/services/tipo-documento.service';
import { DomiciliarioService } from 'src/app/services/domiciliario.service';
import { VentaTiendaService } from 'src/app/services/venta-tienda.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { FacturaService } from 'src/app/services/factura.service';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-venta-restaurante-bar-pagar',
  templateUrl: './venta-restaurante-bar-pagar.component.html',
  styleUrls: ['./venta-restaurante-bar-pagar.component.scss'],
  providers: [NgSelectConfig],
})
export class VentaRestauranteBarPagarComponent implements OnInit {
  @ViewChild('staticModalPagar', { static: false })
  childModalPagar?: ModalDirective;
  @Output() editEvent = new EventEmitter<string>();
  @Output() reloadEvent = new EventEmitter<string>();

  @Input() typeSell: number = 1;

  @Input() mesa: number;
  @Input() factura: number;
  @Input() precio: number;
  @Input() propina: number;
  @Input() total_retencion: number = 0;

  @Input() products: any = [];
  @Input() carritoId: number = null;
  @Input() subTotal: number;
  @Input() subTotal_s_imp: number;
  @Input() descuento: number;
  @Input() descuento_s_imp: number;

  @Input() cantidadBolsa: number;
  @Input() totalBolsa: number;

  formPago: FormGroup; //variable que controla el formulario

  usarDecimales: Number = 1;
  moneda: string = '$';

  propinaSucursal = 0;
  comisionVenta = 0;

  _dataCliente: any[] = [];

  domiciliarios: any[] = [];
  dataEmpleado: any[] = [];

  totalPagar = 0;
  totalPagarConPropina = 0;
  abono = 0;

  timeClear: any;

  dataMetodoPagos: any[] = [];
  dataMetodoPagosComb: any[] = [];
  tipoFactura: any[] = tipoFactura;
  private _departamentos: any[] = [];
  private _municipios: any[] = [];
  departamentoId: number = 0;

  sucursal: any;
  disableClient: boolean;
  showClientCredit: boolean = false;

  date = '';

  addCustomUser = (term) => term;

  isDisabled = false;

  porcentajePropina = null;

  phoneClient = null;
  directionClient = null;

  totalVentaSinRetencion = 0;

  dateNow = null;

  constructor(
    private formBuilder: FormBuilder,
    private funcionesService: FuncionesService,
    private clienteService: ClienteService,
    private funcionService: FuncionService,
    private ventaRestauranteService: VentaRestauranteService,
    private router: Router,
    private metodoPagoService: MetodoPagoService,
    private domiciliarioService: DomiciliarioService,
    @Inject(DOCUMENT) document: any,
    private ngSelectConfig: NgSelectConfig,
    private ventaTiendaService: VentaTiendaService,
    private tipoDocumentoService: TipoDocumentoService,
    private sucursalService: SucursalService,
    private facturaService: FacturaService,
    private departamentoService: DepartamentoService,
    private empleadoService: EmpleadoService,
    private datePipe: DatePipe,
    private monedaService: MonedaService,
  ) {
    this.ngSelectConfig.notFoundText =
      'Los clientes están cargados, debe buscar';
    this.ngSelectConfig.placeholder = 'Buscar...';
    this.ngSelectConfig.loadingText = 'Cargando...';
    this.ngSelectConfig.appendTo = 'body';
    this.ngSelectConfig.addTagText = 'Escoger';
  }

  ngOnInit(): void {
    let sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
    );

    this.usarDecimales = sucursal.usar_decimales;
    this.comisionVenta = sucursal.comision_venta;
    this.moneda = this.monedaService.obtenerSimbolo(sucursal.moneda);

    let propinaNumber = this.propina ? +this.propina : 0;
    let percioNumber = +this.precio;

    this.totalVentaSinRetencion = this.precio - this.total_retencion;

    let porPropina = (propinaNumber / this.totalVentaSinRetencion) * 100;

    let porPropinaFixed = 0;
    if (porPropina !== 0) {
      porPropinaFixed = this.funcionesService.toFixPorcentaje(porPropina);
    }

    this.dateNow = new Date();
    // this.date = this.datePipe.transform(new Date(), 'MM/d/y');
    this.dateNow = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    //console.log(this.precio);

    this.formPago = this.formBuilder.group({
      metodo_pago: ['', []],
      valor_total: [0, []],
      valor_efectivo: ['', []],
      valor_adeudado: [0, []],
      empleado: ['', []],
      combinado: this.formBuilder.array([]),
      date_credito: ['', []],
      date_plan_separe: ['', []],
      cliente_id: [null, [Validators.required]],
      isPropina: [this.propina ? true : false, []],
      porcentaje_propina: [this.propina ? true : false, []],
      porcentaje: [porPropinaFixed, []],
      valor_propina: [this.propina ? +this.propina : '', []],
      cortesia: ['', []],
      valor_factura: [percioNumber, []],
      valor_factura_sin_retencion: [this.totalVentaSinRetencion, []],
      total_retencion: [this.total_retencion, []],
      domicile: ['', []],
      direccion_cliente: ['', []],
      telefono_cliente: ['', []],
      valor_domicilio: ['', []],
      domiciliario: [null, []],
      tipo_factura: [sucursal.tipo_factura, []],
      fecha_entrega: [this.dateNow, []],
    });

    this.getEmpleado();

    if (this.factura) {
      this.facturaService
        .getPorcentajeFactura(this.factura)
        .subscribe((resp) => {
          this.porcentajePropina = resp.data.porcentaje_propina;
          let propinaFactura = resp.data.propina;
          if (this.porcentajePropina != null) {
            this.formPago.patchValue({
              isPropina: true,
              porcentaje_propina: true,
              porcentaje: +this.porcentajePropina,
              valor_propina: +propinaFactura,
            });
            //console.log(this.formPago.value);
          } else if (propinaFactura != null) {
            let porPropina =
              (+propinaFactura / +this.totalVentaSinRetencion) * 100;

            let porPropinaFixed = 0;
            if (porPropina !== 0) {
              porPropinaFixed =
                this.funcionesService.toFixPorcentaje(porPropina);
            }
            this.formPago.patchValue({
              isPropina: true,
              porcentaje_propina: false,
              porcentaje: +porPropinaFixed,
              valor_propina: +propinaFactura,
            });
          }

          this.updateTotal();
        });
    }

    this.validarCliente();

    this.domiciliarioService
      .getDomiciliariosPorPagina(null, null, null, null)
      .subscribe((resp) => {
        this.domiciliarios = resp.data;
      });

    this.getTipoDocumentos();

    this.metodoPagoService.getMetodoPagos().subscribe(
      (resp) => {
        this.dataMetodoPagos = resp.data;
        this.dataMetodoPagosComb = resp.data;

        this.updateTotal();
        this.openModalPagar({});
      },
      (error) => {
        this.funcionService.onSuccess(
          'Error al cargar los métodos de pago',
          'error',
          'Comunicarse con soporte',
        );
        this.closeModalPagar();
      },
    );

    this.getDepartamentos();
  }

  validarCliente() {
    /* Consulto para validar el cliente */
    this.sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
    );
    this.disableClient = this.sucursal?.cliente;
    ////console.log(this.sucursal);
    this.propinaSucursal = this.sucursal?.propina;

    if (this.disableClient) {
      this.getBuscarCliente('');
    }

    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.sucursal = resp.data;
        this.disableClient = this.sucursal.cliente;
        this.propinaSucursal = this.sucursal?.propina;

        if (this.disableClient) {
          // this.getBuscarCliente('');
        }
        localStorage.setItem(
          btoa('sucursal'),
          btoa(encodeURIComponent(JSON.stringify(this.sucursal))),
        );
      });
    }

    //console.log(this.disableClient);
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
  }

  valor_pagar(event) {
    if (this.funcionesService.countDecimalPoints(event) === 0) {
      this.formPago.controls.valor_efectivo.setValue(this.formatNumber(event));
    }
  }

  valor_pagar_input(i, event) {
    if (i == 8 && event > 0) {
      // No crédito
      if (this.disableClient) {
        // se muestra
        // No hacer nada
      } else {
        // No se muestra
        this.showClientCredit = true;
      }
    } else if (i == 8 && (event == null || event == 0)) {
      // No crédito
      if (this.disableClient) {
        // se muestra
        // No hacer nada
      } else {
        // No se muestra
        // Limpiar el campo y ocultar el showCliente
        this.formPago.controls.cliente_id.setValue('');
        this.showClientCredit = false;
      }
    }

    let countDecimal = this.funcionesService.countDecimalPoints(event);

    if (countDecimal === 0) {
      this.combinado.get([i]).patchValue({
        price: this.formatNumber(event),
      });
    }
  }

  get combinado() {
    return this.formPago.get('combinado') as FormArray;
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent,
  ) {
    this.edit('');
  }

  get dataCliente() {
    return this._dataCliente;
  }

  public edit(value: string) {
    this.editEvent.emit(value);
  }

  public reload(value: string) {
    this.reloadEvent.emit(value);
  }

  form: any = {
    nombre: '',
    tipo_documento: '',
    documento: '',
    dv: '',
    telefono: '',
    email: '',
    direccion: '',
    departamento: '',
    municipio: '',
  };

  private _tipoDocumentos: any[] = [];

  private getDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe((resp) => {
      this._departamentos = resp.data;
    });
  }

  private getEmpleado(): void {
    if (this.comisionVenta == 1) {
      this.empleadoService.getEmpleadosAll().subscribe((resp) => {
        this.dataEmpleado = resp.data;
      });
    }
  }

  /**
   * Consultar todos los municipios que pertenecen al departamento con id idDepartamento
   */
  public getMunicipios(): void {
    this.departamentoService
      .getMunicipiosByDepartamento(this.departamentoId)
      .subscribe((resp) => {
        this._municipios = resp.data;

        for (let i = 0; i < this._municipios.length; i++) {
          let item = this._municipios[i];
          this.optionsMunicipios += `<option value="${item.id}" ${
            this.form.municipio == item.id ? 'selected' : ''
          }>${item.nombre}</option>`;
        }

        console.log(this.optionsMunicipios);
      });
  }

  public getTipoDocumentos(): void {
    this.tipoDocumentoService.getTipoDocumentos().subscribe((resp) => {
      this._tipoDocumentos = resp.data;
    });
  }

  public get tipoDocumentos() {
    return this._tipoDocumentos;
  }

  get departamentos() {
    return this._departamentos;
  }

  get municipios() {
    return this._municipios;
  }

  getBuscarClienteInstance(value) {
    this.clienteService.getBusquedaClienteDocumento(value).subscribe((resp) => {
      this._dataCliente = resp.data;
      this.formPago.controls.cliente_id.setValue(this._dataCliente[0].id);
      this.onItemSelected(this._dataCliente[0].id);
    });
  }

  onSuccess(mensaje: any, tipo: any, title: any = 'Ya existe!'): void {
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
        title: title,
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }
  optionsMunicipios: any = `
  <option disabled value='' ${
    this.form.municipio == '' ? 'selected' : ''
  }>SELECCIONAR...</option>
  `;

  openCreateClient() {
    let options = '';

    let optionsDepartamentos = `
    <option disabled value='' ${
      this.form.departamento == '' ? 'selected' : ''
    }>SELECCIONAR...</option>
    `;

    for (let i = 0; i < this.tipoDocumentos.length; i++) {
      let item = this.tipoDocumentos[i];
      options += `<option value="${item.id}" ${
        this.form.tipo_documento == item.id ? 'selected' : ''
      }>${item.nombre}</option>`;
    }

    for (let i = 0; i < this.departamentos.length; i++) {
      let item = this.departamentos[i];
      optionsDepartamentos += `<option value="${item.id}" ${
        this.form.departamento == item.id ? 'selected' : ''
      }>${item.nombre}</option>`;
    }

    Swal.fire({
      title: 'Crear cliente',
      html: `
      <div class="row container-fluid">
       <div class="form-group col-md-6">
      <label>Tipo de Documento</label>
      <select id="con2" class="form-control">
      <option disabled ${
        this.form.tipo_documento == '' ? 'selected' : ''
      }>SELECCIONAR...</option>
      ${options}
      </select>
      </div>

       <div class="form-group col-md-6 row" style="margin-left: 0; margin-right: 0;">
        <div style="width: calc(100% - 30px);">
          <label>Nit / Documento</label>
          <input type="text" value="${this.form.documento}" 
        onkeypress="return event.charCode >= 48 && event.charCode <= 57"
         autocomplete="off" id="con3" class="form-control">
        </div>
        <div style="max-width: 30px;" id="dvContainer">
        <label for="dv" style="font-weight: 700"
                      >DV</label
                    >
                    <input
                      type="text"
                      id="con7"
                      class="form-control mb-1 text-center"
                      style="text-transform: uppercase"
                      placeholder=""
                      maxlength="1"
                      pattern="[0-9]{1}"
                      onkeypress='return event.charCode >= 48 && event.charCode <= 57'
                    />
        </div>
      </div>

      <div class="form-group col-md-6">
      <label>Nombre del cliente</label>
      <input  style="text-transform: uppercase" type="text" value="${
        this.form.nombre
      }" autocomplete="off" id="con1" plas class="form-control"> 
      </div>
     
     
      <div class="form-group col-md-6">
      <label>Teléfono</label>
      <input type="number" value="${
        this.form.telefono
      }" autocomplete="off" id="con4" class="form-control">
      </div>
      <div class="form-group col-md-6">
      <label>Correo Electrónico</label>
      <input type="email" value="${
        this.form.email
      }" autocomplete="off" id="con5" class="form-control">
      </div>
      <div class="form-group col-md-6">
      <label>Dirección</label>
      <input type="text" value="${
        this.form.direccion
      }" autocomplete="off" id="con6" class="form-control">
      </div> 
      <div
        class="form-group col-md-6"
      >
        <label>Departamento</label>
        <select id="con10" class="form-control">
        ${optionsDepartamentos}
        </select>
      </div>
      <div
        class="form-group col-md-6"
      >
        <label>Municipios</label>
        <select id="con11" class="form-control">
        ${this.optionsMunicipios}
        </select>
      </div>
      </div>
      `,
      showCancelButton: true,
      allowOutsideClick: false,
      preConfirm: () => {
        var con1 = $('#con1').val();
        var con2 = $('#con2').val();
        var con3 = $('#con3').val();
        var con4 = $('#con4').val();
        var con5 = $('#con5').val();
        var con6 = $('#con6').val();
        var con7 = $('#con7').val();
        var con10 = $('#con10').val();
        var con11 = $('#con11').val();

        this.form.nombre = con1;
        this.form.tipo_documento = con2;
        this.form.documento = con3;
        this.form.dv = con7;
        this.form.telefono = con4;
        this.form.email = con5;
        this.form.direccion = con6;
        this.form.departamento = con10;
        this.form.municipio = con11;

        //console.log(con1, con2, con3);

        if (
          con1 != '' &&
          con2 != '' &&
          con5 != '' &&
          con3 != '' &&
          con10 != null &&
          con11 != null
        ) {
          //console.log('good');
          return this.form;
        } else {
          if (con1 == '') {
            Swal.showValidationMessage('Por favor, rellene el campo nombre.');
            return;
          }

          if (con2 == null) {
            Swal.showValidationMessage(
              'Por favor, rellene el campo tipo documento.',
            );
            return;
          }

          if (con3 == '') {
            Swal.showValidationMessage(
              'Por favor, rellene el campo documento.',
            );
            return;
          }

          if (con2 == 2 && con7 == '') {
            Swal.showValidationMessage('Por favor, diligencie el campo DV.');
            return;
          }

          /*   if (con5 == '') {
            Swal.showValidationMessage(
              'Por favor, diligencie el correo electrónico.'
            );
            return;
          } */

          // Expresión regular para validar el formato del correo electrónico
          const emailPattern =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

          // Validar si el correo electrónico tiene el formato correcto
          if (con5 != '' && !emailPattern.test(con5)) {
            Swal.showValidationMessage(
              'Por favor, ingrese un correo electrónico válido.',
            );
            return;
          }

          return;
        }
      },
      didOpen: () => {
        // Función que se ejecutará cuando el modal se haya abierto
        const selectElement = document.getElementById(
          'con2',
        ) as HTMLSelectElement;
        const selectDepartamento = document.getElementById(
          'con10',
        ) as HTMLSelectElement;

        const documentoInput = document.getElementById(
          'con3',
        ) as HTMLInputElement;

        let debounceTimer: any;

        if (document.getElementById('con2')) {
          selectElement.addEventListener(
            'change',
            this.handleTipoDocumentoChange,
          );
        }
        if (document.getElementById('con10')) {
          selectDepartamento.addEventListener('change', (event) => {
            this.handleDepartamentoChange(event);
          });
        }

        if (documentoInput) {
          documentoInput.addEventListener('input', () => {
            const valor = documentoInput.value;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              if (valor.length >= 5) {
                // mínimo para evitar muchas peticiones
                this.clienteService.getInfoRut(valor).subscribe(
                  (cliente) => {
                    // Llenar campos si el cliente existe
                    (
                      document.getElementById('con1') as HTMLInputElement
                    ).value = cliente.data.business_name;
                    (
                      document.getElementById('con7') as HTMLInputElement
                    ).value = cliente.data.dv;
                    (
                      document.getElementById('con5') as HTMLInputElement
                    ).value = cliente.data.email;

                    // actualizar también `this.form` si quieres mantener el estado sincronizado
                    this.form.nombre = cliente.data.business_name;
                    this.form.dv = cliente.data.dv;
                    this.form.email = cliente.data.email;
                  },
                  (err) => {
                    // si no se encuentra
                    console.log('Cliente no encontrado');
                  },
                );
              }
            }, 300);
          });
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        let obj = result.value;
        this.clienteService.addCliente(this.form).subscribe(
          (resp) => {
            this.getBuscarClienteInstance(this.form.documento);

            this.form.nombre = '';
            this.form.tipo_documento = '';
            this.form.documento = '';
            this.form.dv = '';
            this.form.telefono = '';
            this.form.email = '';
            this.form.direccion = '';
            this.form.departamento = '';
            this.form.municipio = '';
            this.onSuccess(resp.message, 'success', 'Registrado');
            // this.getProveedores(1);
          },
          (err) => {
            this.onSuccess(
              err.error.message,
              'error',
              'No encontrado en el RUES',
            );
          },
        );
      } else {
        this.form.nombre = '';
        this.form.tipo_documento = '';
        this.form.documento = '';
        this.form.dv = '';
        this.form.telefono = '';
        this.form.email = '';
        this.form.direccion = '';
        this.form.departamento = '';
        this.form.municipio = '';
      }
    });
  }

  handleTipoDocumentoChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const dvContainer = document.getElementById('dvContainer');
    if (selectedValue != '2') {
      dvContainer.style.display = 'none'; // Ocultar el campo DV
    } else {
      dvContainer.style.display = 'block'; // Mostrar el campo DV
    }
  }

  handleDepartamentoChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    this.departamentoService
      .getMunicipiosByDepartamento(parseInt(selectedValue))
      .subscribe((resp) => {
        this._municipios = resp.data;
        // Actualizar las opciones del select
        const selectElement = document.getElementById(
          'con11',
        ) as HTMLSelectElement;
        selectElement.innerHTML = ''; // Limpiar opciones existentes

        const option = document.createElement('option');
        option.value = '';
        option.text = 'SELECCIONAR';
        selectElement.add(option);

        this._municipios.forEach((municipio) => {
          const option = document.createElement('option');
          option.value = municipio.id.toString();
          option.text = municipio.nombre;
          selectElement.add(option);
        });
      });
  }

  cleanCombinado() {
    for (let index = 0; index < this.combinado.controls.length; index++) {
      this.combinado.get([index]).patchValue({
        price: null,
      });
    }
  }

  cleanByCourtesy() {
    this.formPago.patchValue({
      metodo_pago: 1,
      valor_total: 0,
      valor_efectivo: '',
      valor_adeudado: 0,
      date_credito: '',
      porcentaje_propina: false,
      valor_propina: '',
    });

    this.updateTotal();

    this.cleanCombinado();
  }

  cleanByDomicile() {
    this.formPago.patchValue({
      domiciliario: null,
      valor_domicilio: '',
      telefono_cliente: '',
      direccion_cliente: '',
    });
    //console.log('no cliente');
  }

  cleanByDomicileWithClient() {
    this.formPago.patchValue({
      domiciliario: null,
      valor_domicilio: '',
      telefono_cliente: this.phoneClient,
      direccion_cliente: this.directionClient,
    });
    //console.log('cliente');
  }

  changeStateCourtesy(event) {
    if (this.formPago.get('cortesia').value) {
      this.cleanByCourtesy();
    }
  }

  changeStatePropina(event) {
    this.cleanByPropina();
    if (this.formPago.get('isPropina').value) {
      let valor = this.calculatePropinaValor(
        this.formPago.get('valor_factura_sin_retencion').value,
        this.propinaSucursal,
      );
      this.formPago.patchValue({
        porcentaje_propina: true,
        porcentaje: this.propinaSucursal,
        valor_propina: valor,
      });
    }
    this.updateTotal();
  }

  // Limpiar la propina
  cleanByPropina() {
    this.formPago.patchValue({
      porcentaje_propina: false,
      porcentaje: 0,
      valor_propina: 0,
    });
    this.updateTotal();
  }

  changeStateDomicile(event) {
    if (!this.formPago.value.cliente_id) {
      this.onSuccess(
        'Debe escoger un cliente para asignar domicilio',
        'warning',
        'Espere',
      );
      this.formPago.get('domicile').reset();
      return;
    }
    if (this.formPago.get('domicile').value) {
      this.cleanByDomicileWithClient();
    } else {
      this.cleanByDomicile();
    }
    this.updateTotal();
  }

  changeMetodoPago(event) {
    if (event.target.value == 2) {
      this.showClientCredit = true;
    } else {
      // No crédito
      if (this.disableClient) {
        // se muestra
        // No hacer nada
      } else {
        // No se muestra
        // Limpiar el campo y ocultar el showCliente
        this.formPago.controls.cliente_id.setValue('');
        this.showClientCredit = false;
      }
    }
    this.formPago.patchValue({
      valor_efectivo: null,
      valor_adeudado: null,
      date_credito: null,
    });
    this.cleanCombinado();

    this.updateTotal();
  }

  updateTotal() {
    let valorAdeudado = this.formPago.get('valor_factura_sin_retencion').value;
    let valorPropina = this.formPago.get('valor_propina').value;
    if (valorPropina === '') {
      valorPropina = 0;
    }
    //console.log(valorPropina);

    let suma = 0;

    suma = valorAdeudado + valorPropina;

    if (this.formPago.get('domicile').value) {
      suma = suma + this.formPago.get('valor_domicilio').value;
    }

    //console.log(suma);

    this.formPago.get('valor_total').setValue(suma); // Asignar total

    let metodoPago = this.formPago.get('metodo_pago').value;

    if (metodoPago == 10) {
      let sumaTotal = this.getTotalCombinado();
      this.formPago.patchValue({
        valor_adeudado: suma - sumaTotal,
      });
    }
  }

  changePercentage(event) {
    this.updateTotal();
  }

  /* ################################################################## */
  valorPagar: any = 0;
  openModalPagar(obj: {} = {}) {
    this.valorPagar = 0;

    this.formPago.controls.metodo_pago.setValue(1);

    this.dataMetodoPagosComb = this.dataMetodoPagosComb.filter((element) => {
      return element.id !== 10 && element.id !== 2;
    });
    this.dataMetodoPagosComb.push({ id: 2, nombre: 'CRÉDITO' });

    for (let index = 0; index < this.dataMetodoPagosComb.length; index++) {
      const element = this.dataMetodoPagosComb[index];
      const pay = this.formBuilder.group({
        price: [null, []], //  Validators.min(0)
        id: element.id,
        nombre: element.nombre,
      });
      this.combinado.push(pay);
    }

    this.childModalPagar?.show();
  }
  closeModalPagar() {
    this.childModalPagar?.hide();
    this.edit('');
  }

  reloadPagar() {
    this.childModalPagar?.hide();
    this.reload('');
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  /* Formateo el efectivo */
  formatearEfectivo() {
    this.valorPagar = this.formatearNumber(
      this.formPago.controls.valor_pagar.value,
    );
  }

  actualizoInfoCliente(clienteId: any, telefono: any, direccion: any) {
    this.formPago.controls.cliente_id.setValue(clienteId);

    this.formPago.controls.telefono_cliente.setValue(telefono);
    this.formPago.controls.direccion_cliente.setValue(direccion);

    this.phoneClient = telefono;
    this.directionClient = direccion;
  }

  getBuscarClienteEnter(data) {
    /* Hago la busqueda con enter */
    this.clienteService.getBusquedaClienteDocumento(data).subscribe((resp) => {
      if (resp.data.length > 0) {
        this.actualizoInfoCliente(
          resp.data[0].id,
          resp.data[0].telefono,
          resp.data[0].direccion,
        );
      } else {
        this.funcionService.onSuccess(
          'No se encontró cliente...',
          'error',
          'No Existe!',
        );
      }
    });
  }

  /* Getiono modal para el pago de facturas */
  /* ######################################################################## */

  onItemSelected(item: any) {
    let selectedIndex = this._dataCliente.findIndex(
      (dataItem) => dataItem.id == item,
    );

    if (selectedIndex != -1) {
      let selectedItemFromData = this._dataCliente[selectedIndex];

      this.actualizoInfoCliente(
        selectedItemFromData.id,
        selectedItemFromData.telefono,
        selectedItemFromData.direccion,
      );
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // Se presionó la tecla enter
      // Seleccionar el primer elemento de la lista
      // this.select.select(this.items[0]);
      //console.log('Botón enter');
    }
  }

  onKeyDown2(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // Se presionó la tecla enter
      // Seleccionar el primer elemento de la lista
      // this.select.select(this.items[0]);
      //console.log('Botón enter');
    }
  }

  getBuscarCliente(value) {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      /* Hago la busqueda */
      // if (event.target.value != '' && event.code != null) {
      this.clienteService.getBusquedaCliente(value).subscribe((resp) => {
        this._dataCliente = resp.data;
      });
      // }
    }, 360);
  }

  getTotalCombinado() {
    let suma = 0;
    for (let i = 0; i < this.combinado.controls.length; i++) {
      let price = this.combinado.controls[i].get('price').value;
      if (price && price.length > 0) {
        let valorInput = +price.replaceAll(',', '');
        suma += valorInput;
      }
    }
    return suma;
  }

  changeDeuda(index: number) {
    const valortotal = this.formPago.get('valor_total').value;

    let sumaTemp = this.getTotalCombinado();
    sumaTemp = +this.formatearNumber(sumaTemp).replaceAll(',', '');
    let flagSumar = false;

    if (sumaTemp > valortotal + 1) {
      this.combinado.controls[index].patchValue({
        price: null,
      });
      flagSumar = true;
    }

    let sumaTotal = sumaTemp;
    if (flagSumar) {
      sumaTotal = this.getTotalCombinado();
    }

    this.abono = sumaTotal;

    this.formPago.patchValue({
      valor_adeudado: valortotal - this.abono,
    });
  }

  pagar(type, body) {
    if (this.typeSell == 1) {
      // Restaurante
      this.pagarRestaurante(type, body);
    } else {
      // Tienda
      this.pagarTienda(type, body);
    }
  }

  pagarRestaurante(type, body) {
    this.ventaRestauranteService
      .postPayment(this.mesa, this.factura, type, body)
      .subscribe(
        (resp) => {
          //console.log(resp);
          this.funcionService.onSuccess(resp.message, 'success', '¡OK!');

          if (document.location.href.indexOf('completar') != -1) {
            this.reloadPagar();
          } else {
            this.router.navigate([
              '/vender/ventarestaurantebar/' + this.factura + '/completar',
            ]);
          }
        },
        (error) => {
          this.isDisabled = false;
          this.funcionService.onSuccessWithButtonHtml(
            error.error.data,
            'error',
            error.error.message,
          );
        },
      );
  }

  pagarTienda(type, body) {
    body['subtotal'] = this.subTotal;
    body['descuento'] = this.descuento;
    body['cantidadBolsa'] = this.cantidadBolsa;

    body['subtotal_s_imp'] = this.subTotal_s_imp;
    body['descuento_s_imp'] = this.descuento_s_imp;

    for (let i = 0; i < this.products.prds.length; i++) {
      this.products.prds[i].valor_venta = (
        this.products.prds[i]['valor_venta'] + ''
      ).replaceAll(',', '');
      this.products.prds[i].cantidad = (
        this.products.prds[i]['cantidad'] + ''
      ).replaceAll(',', '');
    }

    body['nota'] = this.products ? this.products.nota : '';
    body['prds'] = this.products.prds;

    body['carritoId'] = this.carritoId;
    this.ventaTiendaService.postPayment(type, body).subscribe(
      (resp) => {
        //console.log(resp);
        this.funcionService.onSuccess(resp.message, 'success', '¡OK!');

        if (document.location.href.indexOf('completar') != -1) {
          this.reloadPagar();
        } else {
          this.router.navigate([
            '/vender/ventatienda/' + resp.data + '/completar',
          ]);
        }
      },
      (error) => {
        console.log(error);
        this.isDisabled = false;
        this.funcionService.onSuccessWithButtonHtml(
          error.error.data,
          'error',
          error.error.message,
        );
      },
    );
  }

  onSubmit() {
    if (this.disableClient || this.showClientCredit) {
      if (this.formPago.invalid) {
        this.funcionService.onSuccess(
          'La información del cliente es obligatoria',
          'error',
          'Espere!',
        );
        return;
      }
    }

    console.log(this.formPago.value);

    let tipo_factura = this.formPago.get('tipo_factura').value;
    let valor_propina = this.formPago.get('valor_propina').value ?? 0;
    let valor_total = this.formPago.get('valor_total').value;
    let valor_domicilio = this.formPago.get('valor_domicilio').value;

    if (tipo_factura == 2 || tipo_factura == 3) {
      if (+valor_propina - +(+valor_total - +valor_propina) > -1) {
        this.funcionService.onSuccess(
          'El valor de la propina debe ser menor que el valor de la factura',
          'warning',
          'Espere!',
        );
        return;
      }
      if (+valor_domicilio - +(+valor_total - +valor_domicilio) > -1) {
        this.funcionService.onSuccess(
          'El valor del domicilio debe ser menor que el valor de la factura',
          'warning',
          'Espere!',
        );
        return;
      }
    }

    let metodoPago = this.formPago.get('metodo_pago').value;

    let cortesia = this.formPago.get('cortesia').value;

    let body = { ...this.formPago.value };

    let valor_efectivo = this.formPago.get('valor_efectivo').value;

    this.isDisabled = true;

    if (cortesia) {
      this.pagar(5, body);
    } else {
      let domicile = this.formPago.get('domicile').value;

      if (domicile) {
        // Comprobar si la información del domicilio está completa
        let direccion_cliente = this.formPago.get('direccion_cliente').value;
        let telefono_cliente = this.formPago.get('telefono_cliente').value;
        let valor_domicilio = this.formPago.get('valor_domicilio').value;
        let domiciliario = this.formPago.get('domiciliario').value;

        let flag = false;
        let msg = '';
        if (direccion_cliente == null || direccion_cliente + ''.length == 0) {
          msg = 'La dirección es obligatoria';
          flag = true;
        }
        if (telefono_cliente == null || telefono_cliente + ''.length == 0) {
          msg = 'El teléfono es obligatorio';
          flag = true;
        }
        if (valor_domicilio === '' || valor_domicilio === null) {
          valor_domicilio = 0;
          // msg = 'El valor del domicilio es obligatorio';
          // flag = true;
        }
        if (domiciliario == null || domiciliario + ''.length == 0) {
          msg = 'El domiciliario es obligatorio';
          flag = true;
        }

        if (flag) {
          this.funcionService.onSuccess(msg, 'error', 'Espere!');
          this.isDisabled = false;
          return;
        }
      }

      if (metodoPago == 1) {
        // 1 : Efectivo
        let valor_total = this.formPago.get('valor_total').value;

        if (valor_efectivo.length == 0) {
          this.funcionService.onSuccess(
            'Debe ingresar el valor de efectivo',
            'error',
            'Espere!',
          );
          this.isDisabled = false;
          return;
        } else {
          valor_efectivo = body.valor_efectivo.replaceAll(',', '');
          body['valor_efectivo'] = valor_efectivo;
        }

        // 10 - 20 = -10 false
        // 20 - 10 = 10  true
        // 6000.03 - 6000 = 0.3
        // if (valor_efectivo < valor_total) {
        if (valor_total - valor_efectivo > 1) {
          this.funcionService.onSuccess(
            'El valor pagado debe ser mayor o igual al total a pagar',
            'error',
            'Espere!',
          );
          this.isDisabled = false;
          return;
        }

        this.pagar(1, body);
      } else if (metodoPago == 2) {
        let inpCredito = this.formPago.get('date_credito');
        // 2 : Crédito
        if (!inpCredito.value) {
          this.funcionService.onSuccess(
            'La fecha de crédito es obligatoria',
            'error',
            'Espere!',
          );
          this.isDisabled = false;
          return;
        }

        if (inpCredito.value < this.date) {
          Swal.fire({
            title: 'Estás seguro?',
            text: 'La fecha del crédito es menor a la fecha actual',
            icon: 'warning',
            iconColor: '#DC562F',
            showCancelButton: true,
            confirmButtonColor: '#145388',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Continuar!',
          }).then((result) => {
            if (result.isConfirmed) {
              this.pagar(2, body);
            }
          });
        } else {
          this.pagar(2, body);
        }
      } else if (metodoPago == 10) {
        // 10 : combinado

        let flag = this.hasValueItemCredit();
        let flagSeparatePlan = this.hasValueItemSeparatePlan(); //valida si se gestiono plan separe

        let inpCredito = this.formPago.get('date_credito');
        let inpPlanSepare = this.formPago.get('date_plan_separe');

        ///valido que en combinado no seleccione plan separe y credito, que solo pueda seleccionar uno solo
        if (flag && flagSeparatePlan) {
          this.funcionService.onSuccess(
            'Si usa plan separe no puede usar crédito',
            'error',
            'Espere!',
          );
          this.isDisabled = false;
          return;
        }

        if (flag) {
          // Validar si es crédito

          if (!inpCredito.value) {
            this.funcionService.onSuccess(
              'La fecha de crédito es obligatoria',
              'error',
              'Espere!',
            );
            this.isDisabled = false;
            return;
          }
        }

        if (flagSeparatePlan) {
          // Validar si es plan separe

          if (!inpPlanSepare.value) {
            this.funcionService.onSuccess(
              'La fecha de vencimiento para el plan separe es obligatoria',
              'error',
              'Espere!',
            );
            this.isDisabled = false;
            return;
          }
        }

        if (
          this.formPago.get('valor_adeudado').value <= -1 ||
          this.formPago.get('valor_adeudado').value >= 1
        ) {
          this.funcionService.onSuccess(
            'Compruebe el total del pago',
            'error',
            'Espere!',
          );
          this.isDisabled = false;
          return;
        }

        for (let i = 0; i < body['combinado'].length; i++) {
          const element = body['combinado'][i];
          if (element.price && element.price.length > 0) {
            body['combinado'][i].price = +element.price.replaceAll(',', '');
          }
        }

        if (flag && inpCredito.value < this.date) {
          Swal.fire({
            title: 'Estás seguro?',
            text: 'La fecha del crédito es menor a la fecha actual',
            icon: 'warning',
            iconColor: '#DC562F',
            showCancelButton: true,
            confirmButtonColor: '#145388',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Continuar!',
          }).then((result) => {
            if (result.isConfirmed) {
              this.pagar(4, body);
            }
          });
        } else if (flagSeparatePlan && inpPlanSepare.value < this.date) {
          Swal.fire({
            title: 'Estás seguro?',
            text: 'La fecha del plan separe es menor a la fecha actual',
            icon: 'warning',
            iconColor: '#DC562F',
            showCancelButton: true,
            confirmButtonColor: '#145388',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Continuar!',
          }).then((result) => {
            if (result.isConfirmed) {
              this.pagar(4, body);
            }
          });
        } else {
          this.pagar(4, body);
        }
      } else if (metodoPago == 13) {
        let inpPlanSepare = this.formPago.get('date_plan_separe');
        // 13: Plan separe
        if (!inpPlanSepare.value) {
          this.funcionService.onSuccess(
            'La fecha del plan separe es obligatoria',
            'error',
            'Espere!',
          );
          this.isDisabled = false;
          return;
        }

        if (inpPlanSepare.value < this.date) {
          Swal.fire({
            title: 'Estás seguro?',
            text: 'La fecha del plan separe es menor a la fecha actual',
            icon: 'warning',
            iconColor: '#DC562F',
            showCancelButton: true,
            confirmButtonColor: '#145388',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Continuar!',
          }).then((result) => {
            if (result.isConfirmed) {
              this.pagar(6, body);
            }
          });
        } else {
          this.pagar(6, body);
        }
      } else {
        this.pagar(3, body);
      }
    }
  }

  hasValueItemCredit() {
    let combinedArray = this.combinado.value;

    let arrayPreciosFormateados = [];

    for (let i = 0; i < combinedArray.length; i++) {
      const element = combinedArray[i];
      if (element.price && element.price.length > 0) {
        arrayPreciosFormateados.push({
          id: element.id,
          price: +element.price.replaceAll(',', ''),
        });
      }
    }

    let itemCredit = arrayPreciosFormateados.find(
      (item) =>
        item.id === 2 &&
        item.price != null &&
        item.price != '' &&
        item.price > 0,
    );

    if (itemCredit) {
      return true;
    } else {
      return false;
    }
  }

  hasValueItemSeparatePlan() {
    let combinedArray = this.combinado.value;

    let arrayPreciosFormateados = [];

    for (let i = 0; i < combinedArray.length; i++) {
      const element = combinedArray[i];
      if (element.price && element.price.length > 0) {
        arrayPreciosFormateados.push({
          id: element.id,
          price: +element.price.replaceAll(',', ''),
        });
      }
    }

    let itemSeparatePlan = arrayPreciosFormateados.find(
      (item) =>
        item.id === 13 &&
        item.price != null &&
        item.price != '' &&
        item.price > 0,
    );

    if (itemSeparatePlan) {
      return true;
    } else {
      return false;
    }
  }

  // Calcular propina
  propinaFormatForm() {
    let obj = this.formPago.value;

    if (obj.porcentaje_propina) {
      let porcentajeFixed = this.funcionesService.toFixPorcentaje(
        obj.porcentaje,
      );
      this.formPago.get('porcentaje').reset(porcentajeFixed);
    }

    obj = this.formPago.value;

    let valorDescuento = 0;

    if (obj.porcentaje_propina) {
      // Descuento por porcentaje
      valorDescuento = this.calculatePropinaValor(
        obj.valor_factura_sin_retencion,
        obj.porcentaje,
      );

      this.formPago.get('valor_propina').reset(valorDescuento);
    } else {
      // Descuento por valor

      let porPropina =
        (obj.valor_propina / obj.valor_factura_sin_retencion) * 100;
      let porPropinaFixed = this.funcionesService.toFixPorcentaje(porPropina);

      this.formPago.get('porcentaje').reset(porPropinaFixed);
    }

    this.updateTotal();
  }

  // Se calcular la propina con el subtotal de la factura y el porcentaje recibido por parametro
  calculatePropinaValor(valor, porcentaje) {
    return valor * (porcentaje / 100);
  }

  changeTipoFactura(event) {}

  sumPrice(price) {
    let valueOriginal = (
      this.formPago.get('valor_efectivo').value + ''
    ).replaceAll(',', '');
    let total = +valueOriginal + +price;

    this.formPago.controls.valor_efectivo.setValue(
      this.formatNumber(total + ''),
    );
  }

  setPriceTotal() {
    let valueOriginal = (
      this.formPago.get('valor_total').value + ''
    ).replaceAll(',', '');

    this.formPago.controls.valor_efectivo.setValue(
      this.formatearNumber(valueOriginal),
    );
  }
}
