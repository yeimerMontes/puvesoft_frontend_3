import { DOCUMENT, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ClienteService } from 'src/app/services/cliente.service';
import { CompraService } from 'src/app/services/compra.service';
import { FuncionService } from 'src/app/services/funcion.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { ProveedorService } from 'src/app/services/porveedor.service';
import { TipoDocumentoService } from 'src/app/services/tipo-documento.service';
import Swal from 'sweetalert2';
import $ from 'jquery';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';
import { RegimenService } from 'src/app/services/regimen.service';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { tipoFacturaCompra } from 'src/app/constants/selects';
import { BodegaService } from 'src/app/services/bodega.service';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-compras-payment',
  templateUrl: './compras-payment.component.html',
  styleUrls: ['./compras-payment.component.scss'],
})
export class ComprasPaymentComponent implements OnInit {
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
  @Input() subTotal: number;
  @Input() subTotal_s_imp: number;
  @Input() descuento: number;
  @Input() descuento_s_imp: number;

  @Input() nota: any;

  formPago: FormGroup; //variable que controla el formulario

  usarDecimales: Number = 1;
  moneda: string = '$';

  _dataProveedor: any[] = [];

  totalPagar = 0;
  totalPagarConPropina = 0;
  abono = 0;

  timeClear: any;

  dataMetodoPagos: any[] = [];
  dataMetodoPagosComb: any[] = [];
  private _regimenes: any[] = []; //Un array que almacene los regimenes
  private _departamentos: any[] = [];
  private _municipios: any[] = [];
  private _dataBodega: any[] = [];

  departamentoId: number = 0;
  sucursal: any;

  tipoFactura: any[] = tipoFacturaCompra;

  totalVentaSinRetencion = 0;

  date;

  addCustomUser = (term) => term;

  showApertura = false;

  showInputCaja = true;

  closeApertura(event) {
    this.showApertura = false;
  }

  canViewOpen(event) {
    if (event.target.value === '1') {
      this.cajaService.estadoCaja().subscribe((resp) => {
        if (!(resp && resp.data && resp.data.length > 0)) {
          this.showApertura = true;
        }
      });
    } else {
      this.showApertura = false;
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private funcionesService: FuncionesService,
    private clienteService: ClienteService,
    private proveedorService: ProveedorService,
    private funcionService: FuncionService,
    private router: Router,
    private metodoPagoService: MetodoPagoService,
    @Inject(DOCUMENT) document: any,
    private ngSelectConfig: NgSelectConfig,
    private ngSelectModule: NgSelectModule,
    private compraService: CompraService,
    private tipoDocumentoService: TipoDocumentoService,
    private cajaService: CierreCajaService,
    private datePipe: DatePipe,
    private regimenService: RegimenService,
    private departamentoService: DepartamentoService,
    private sucursalService: SucursalService,
    private bodegaService: BodegaService,
    private monedaService: MonedaService,
  ) {
    this.ngSelectConfig.notFoundText = 'No se encontraron resultados';
    this.ngSelectConfig.placeholder = 'Buscar...';
    this.ngSelectConfig.loadingText = 'Cargando...';
    this.ngSelectConfig.appendTo = 'body';
    this.ngSelectConfig.addTagText = 'Escoger';
    this.ngSelectConfig.loadingText = 'Buscando...';
  }

  ngOnInit(): void {
    this.date = new Date();
    // this.date = this.datePipe.transform(new Date(), 'MM/d/y');
    this.date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.totalVentaSinRetencion = this.precio - this.total_retencion;

    this.formPago = this.formBuilder.group({
      tipo_factura: [1, []],
      bodega: ['', []],
      metodo_pago: ['', []],
      valor_total: [0, []],
      valor_efectivo: ['', []],
      valor_adeudado: [0, []],
      combinado: this.formBuilder.array([]),
      date_credito: ['', []],
      proveedor_id: [null, [Validators.required]],
      porcentaje_propina: [false, []],
      valor_propina: [this.propina ? +this.propina : '', []],
      valor_factura: [+this.precio, []],
      valor_factura_sin_retencion: [this.totalVentaSinRetencion, []],
      total_retencion: [this.total_retencion, []],

      codigo_factura: ['', []],
      fecha_compra: [this.date, []],
      sacar_caja: ['', []],

      observacion: ['', []],
    });

    this.metodoPagoService.getMetodoPagos().subscribe(
      (resp) => {
        this.dataMetodoPagos = resp.data;
        this.dataMetodoPagosComb = resp.data;

        this.updateTotal();
        this.openModalPagar({});
      },
      (error) => {
        this.funcionService.onSuccessWithButton(
          'Error al cargar los métodos de pago',
          'error',
          'Comunicarse con soporte',
        );
        this.closeModalPagar();
      },
    );

    this.getBodegas();
    this.getTipoDocumentos();
    this.getDepartamentos();
    this.getRegimen();
    this.getSucursal();
    this.getBuscarProveedor('');
  }

  public getBodegas(): void {
    this.bodegaService.getBodegaPermisos(0).subscribe((resp) => {
      this._dataBodega = resp.data;
    });
  }

  getSucursal() {
    /* Consulto para validar el cliente */
    this.sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
    );
    this.usarDecimales = this.sucursal.usar_decimales;
    this.moneda = this.monedaService.obtenerSimbolo(this.sucursal.moneda);

    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.sucursal = resp.data;
        this.usarDecimales = this.sucursal.usar_decimales;
        this.moneda = this.monedaService.obtenerSimbolo(this.sucursal.moneda);

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
    this.formPago.controls.valor_efectivo.setValue(this.formatNumber(event));
  }

  valor_pagar_input(i, event) {
    let countDecimal = this.funcionesService.countDecimalPoints(event);

    if (countDecimal === 0) {
      this.combinado.get([i]).patchValue({
        price: this.formatNumber(event),
      });
    }

    if (this.formPago.value.metodo_pago == 1 || this.hasValueItemEfectivo()) {
      this.showInputCaja = true;
    } else {
      this.showInputCaja = false;
    }
  }

  get combinado() {
    return this.formPago.get('combinado') as FormArray;
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
        title: title,
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }

  private _tipoDocumentos: any[] = [];

  public getTipoDocumentos(): void {
    this.tipoDocumentoService.getTipoDocumentos().subscribe((resp) => {
      this._tipoDocumentos = resp.data;
    });
  }

  /**
   * Consultar todos los regimenes
   */
  public getRegimen(): void {
    this.regimenService.getRegimen().subscribe((resp) => {
      this._regimenes = resp.data;
    });
  }

  private getDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe((resp) => {
      this._departamentos = resp.data;
    });
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

  public get tipoDocumentos() {
    return this._tipoDocumentos;
  }

  get regimenes() {
    return this._regimenes;
  }

  get departamentos() {
    return this._departamentos;
  }

  get municipios() {
    return this._municipios;
  }

  get dataBodega() {
    return this._dataBodega;
  }

  form: any = {
    nombre: '',
    tipo_documento: '',
    dv: '',
    documento: '',
    regimen_id: '',
    regimen: '',
    telefono: '',
    email: '',
    direccion: '',
    departamento: '',
    municipio: '',
    web: '',
  };

  optionsMunicipios: any = `
  <option disabled value='' ${
    this.form.municipio == '' ? 'selected' : ''
  }>SELECCIONAR...</option>
  `;
  openCreateOperator() {
    let options = `
    <option disabled value='' ${
      this.form.tipo_documento == '' ? 'selected' : ''
    }>SELECCIONAR...</option>
    `;

    let optionsRegimens = `
    <option disabled value='' ${
      this.form.regimen == '' ? 'selected' : ''
    }>SELECCIONAR...</option>
    `;

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

    for (let i = 0; i < this.regimenes.length; i++) {
      let item = this.regimenes[i];
      optionsRegimens += `<option value="${item.id}" ${
        this.form.regimen == item.id ? 'selected' : ''
      }>${item.nombre}</option>`;
    }

    for (let i = 0; i < this.departamentos.length; i++) {
      let item = this.departamentos[i];
      optionsDepartamentos += `<option value="${item.id}" ${
        this.form.departamento == item.id ? 'selected' : ''
      }>${item.nombre}</option>`;
    }

    Swal.fire({
      title: 'Crear Proveedor',
      html: `
      <div class="row container-fluid">
        <div class="form-group col-md-6">
      <label>Tipo de Documento</label>
      <select id="con2" class="form-control" (change)="handleTipoDocumentoChange($event)">
      ${options}
      </select>
      </div>

       <div class="form-group col-md-6">
      <label>Nit / Documento</label>
      <input type="text" value="${this.form.documento}" autocomplete="off" id="con3" class="form-control">
      </div>
      <div id="dvContainer" style='max-width: 90px;' class="form-group col-md-6">
          <label for="dv">DV</label>
          <input
            type="text"
            class="form-control mb-1 text-center"
            maxlength="1"
            pattern="[0-9]{1}"
            onkeypress='return event.charCode >= 48 && event.charCode <= 57'
            id="con8"
            value="${this.form.dv}"
          />
        </div>
      
      <div class="form-group col-md-6">
      <label>Nombre del proveedor</label>
      <input type="text" style="text-transform: uppercase" value="${this.form.nombre}" autocomplete="off" id="con1" plas class="form-control"> 
      </div>
    
     
        <div
        class="form-group col-md-6"
      >
        <label>Régimen</label>
        <select id="con9" class="form-control">
        ${optionsRegimens}
        </select>
      </div>
      <div class="form-group col-md-6">
      <label>Teléfono</label>
      <input type="number" value="${this.form.telefono}" autocomplete="off" id="con4" class="form-control">
      </div>
      <div class="form-group col-md-6">
      <label>Correo Electrónico</label>
      <input type="email" value="${this.form.email}" autocomplete="off" id="con5" class="form-control">
      </div>
      <div class="form-group col-md-6">
      <label>Dirección</label>
      <input type="text" value="${this.form.direccion}" autocomplete="off" id="con6" class="form-control">
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
      <div class="form-group col-md-6">
      <label>Página Web</label>
      <input type="url" value="${this.form.web}" autocomplete="off" id="con7" class="form-control">
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
        var con8 = $('#con8').val();
        var con9 = $('#con9').val();
        var con10 = $('#con10').val();
        var con11 = $('#con11').val();

        this.form.nombre = con1;
        this.form.tipo_documento = con2;
        this.form.documento = con3;
        this.form.telefono = con4;
        this.form.email = con5;
        this.form.direccion = con6;
        this.form.web = con7;
        this.form.dv = con8;
        this.form.regimen_id = con9;
        this.form.departamento = con10;
        this.form.municipio = con11;

        if (
          con1 != '' &&
          con2 != null &&
          con3 != '' &&
          con4 != '' &&
          con5 != '' &&
          con6 != '' &&
          con8 != '' &&
          con10 != null &&
          con11 != null
        ) {
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

          if (con8 == '') {
            Swal.showValidationMessage('Por favor, diligencie el campo DV.');
            return;
          }

          if (con9 == '' || con9 == null) {
            Swal.showValidationMessage('Por favor, diligencie el regimen.');
            return;
          }
          if (!con6 || con6 == '') {
            Swal.showValidationMessage('Por favor, diligencie la dirección');
            return;
          }

          if (con4 == '') {
            Swal.showValidationMessage('Por favor, rellene el campo telefono.');
            return;
          }

          if (con5 == '') {
            Swal.showValidationMessage('El email es obligatorio.');
            return;
          }

          if (con10 == null) {
            Swal.showValidationMessage(
              'Por favor, diligencie el departamento.',
            );
            return;
          }

          if (con11 == null) {
            Swal.showValidationMessage('Por favor, diligencie el municipio.');
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
                      document.getElementById('con8') as HTMLInputElement
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
        let regimenID = parseInt(this.form.regimen_id.replace(/"/g, ''));
        let listRegimen = [
          {
            id: regimenID,
            nombre: this.getNombreRegimenById(regimenID),
          },
        ];
        this.form.regimen = listRegimen;
        this.proveedorService.addProveedor(this.form).subscribe(
          (resp) => {
            this.getBuscarProveedorInstance(this.form.documento);

            this.form.nombre = '';
            this.form.tipo_documento = '';
            this.form.documento = '';
            this.form.telefono = '';
            this.form.email = '';
            this.form.direccion = '';
            this.form.web = '';
            this.form.dv = '';
            this.form.regimen_id = '';
            this.form.departamento = '';
            this.form.municipio = '';
            this.form.regimen = '';
            this.onSuccess(resp.message, 'success', 'Registrado');
            // this.getProveedores(1);
          },
          (err) => {
            this.onSuccess(
              'Ocurrió un error al crear el proveedor, comuniquese con soporte',
              'error',
              'Error',
            );
          },
        );
      } else {
        this.form.nombre = '';
        this.form.tipo_documento = '';
        this.form.documento = '';
        this.form.telefono = '';
        this.form.email = '';
        this.form.direccion = '';
        this.form.web = '';
        this.form.dv = '';
        this.form.regimen = '';
        this.form.departamento = '';
        this.form.municipio = '';
      }
    });
  }

  // Función para obtener el nombre del régimen dado su id
  getNombreRegimenById(id: number): string {
    const regimen = this.regimenes.find((r) => r.id === id);
    return regimen ? regimen.nombre : '';
  }

  handleTipoDocumentoChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const dvContainer = document.getElementById('dvContainer');
    /*   if (selectedValue != '2') {
      dvContainer.style.display = 'none'; // Ocultar el campo DV
    } else {
      dvContainer.style.display = 'block'; // Mostrar el campo DV
    } */
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

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent,
  ) {
    this.edit('');
  }

  get dataProveedor() {
    return this._dataProveedor;
  }

  public edit(value: string) {
    this.editEvent.emit(value);
  }

  public reload(value: string) {
    this.reloadEvent.emit(value);
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
      bodega: '',
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

  changeMetodoPago(event) {
    this.formPago.patchValue({
      valor_efectivo: null,
      valor_adeudado: null,
      date_credito: null,
    });
    this.cleanCombinado();

    if (this.formPago.value.metodo_pago == 1 || this.hasValueItemEfectivo()) {
      this.showInputCaja = true;
    } else {
      this.showInputCaja = false;
      this.formPago.get('sacar_caja').reset('0');
    }

    this.updateTotal();
  }

  updateTotal() {
    let isActiveTip = this.formPago.get('porcentaje_propina').value;

    let valorAdeudado = this.formPago.get('valor_factura_sin_retencion').value;
    let valorPropina = this.formPago.get('valor_propina').value;
    if (valorPropina === '') {
      valorPropina = 0;
    }

    let valorPorcentaje = 0;
    let suma = 0;
    if (isActiveTip === 'true') {
      valorPorcentaje = valorAdeudado * 0.1;
    }

    suma = valorAdeudado + valorPorcentaje + valorPropina;

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
    this.formPago.controls.porcentaje_propina.setValue(false);

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

  actualizoInfoProveedor(documento: any) {
    this.formPago.controls.proveedor_id.setValue(documento);
  }

  getBuscarClienteEnter(data) {
    /* Hago la busqueda con enter */
    this.clienteService.getBusquedaClienteDocumento(data).subscribe((resp) => {
      if (resp.data.length > 0) {
        this.actualizoInfoProveedor(resp.data[0].documento);
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
    let selectedIndex = this._dataProveedor.findIndex(
      (dataItem) => dataItem.id == item,
    );

    if (selectedIndex != -1) {
      let selectedItemFromData = this._dataProveedor[selectedIndex];
      this.actualizoInfoProveedor(selectedItemFromData.id);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // Se presionó la tecla enter
      // Seleccionar el primer elemento de la lista
      // this.select.select(this.items[0]);
    }
  }

  onKeyDown2(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // Se presionó la tecla enter
      // Seleccionar el primer elemento de la lista
      // this.select.select(this.items[0]);
    }
  }

  getBuscarProveedor(value) {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.proveedorService.search(value).subscribe((resp) => {
        this._dataProveedor = resp.data;
      });
      // }
    }, 360);
  }

  getBuscarProveedorInstance(value) {
    this.proveedorService.search(value).subscribe((resp) => {
      this._dataProveedor = resp.data;
      this.formPago.controls.proveedor_id.setValue(this._dataProveedor[0].id);
    });
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
    let flagSumar = false;

    if (sumaTemp > valortotal) {
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
    this.isDisabled = true;
    this.comprar(type, body);
  }

  comprar(type, body) {
    body['subtotal'] = this.subTotal;
    body['descuento'] = this.descuento;

    body['subtotal_s_imp'] = this.subTotal_s_imp;
    body['descuento_s_imp'] = this.descuento_s_imp;

    for (let i = 0; i < this.products.prds.length; i++) {
      this.products.prds[i].valor_venta = (
        this.products.prds[i]['valor_venta'] + ''
      ).replaceAll(',', '');
      this.products.prds[i].valor_compra = (
        this.products.prds[i]['valor_compra'] + ''
      ).replaceAll(',', '');
      this.products.prds[i].cantidad = (
        this.products.prds[i]['cantidad'] + ''
      ).replaceAll(',', '');
    }

    body['prds'] = this.products.prds;
    this.compraService.postPayment(type, body).subscribe(
      (resp) => {
        this.funcionService.onSuccess(resp.message, 'success', '¡OK!');

        if (document.location.href.indexOf('completar') != -1) {
          this.reloadPagar();
        } else {
          this.router.navigate(['/compras/' + resp.data + '/completar']);
        }
      },
      (error) => {
        //console.log(error);
        this.funcionService.onSuccess(
          error.error.data,
          'error',
          error.error.message,
        );
        ///Si ocurre un error desbloequeo el boton de procesar para que el usuario no tenga que salir de la modal e intentar volver a hacer la gestión
        this.isDisabled = false;
      },
    );
  }

  isDisabled = false;
  onSubmit() {
    ///consulto las bodegas
    if (
      this.dataBodega.length > 1 &&
      this.formPago.controls.bodega.value == ''
    ) {
      this.funcionService.onSuccess(
        'Debe seleccionar una bodega, para poder procesar la compra',
        'error',
        'Espere!',
      );
      return;
    } else {
      ///en el caso que solo tenga una bodega, relaciono el campo con el id que tenga
      if (this.formPago.controls.bodega.value == '') {
        const infobodega = this.dataBodega[0];
        this.formPago.controls.bodega.setValue(infobodega.codigo);
      }
    }

    if (this.formPago.invalid) {
      this.funcionService.onSuccess(
        'Revise que los campos estén llenos',
        'error',
        'Espere!',
      );
      return;
    }

    let metodoPago = this.formPago.get('metodo_pago').value;

    let body = { ...this.formPago.value };

    if (metodoPago == 1) {
      body['valor_efectivo'] = this.formPago.get('valor_total').value;
    }

    if (metodoPago == 1) {
      // 1 : Efectivo
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

      let inpCredito = this.formPago.get('date_credito');
      if (flag) {
        // Validar si es crédito

        if (!inpCredito.value) {
          this.funcionService.onSuccess(
            'La fecha de crédito es obligatoria',
            'error',
            'Espere!',
          );
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
        return;
      }

      for (let i = 0; i < body['combinado'].length; i++) {
        const element = body['combinado'][i];
        if (element.price && element.price.length > 0) {
          body['combinado'][i].price = +element.price.replaceAll(',', '');
        }
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
            this.pagar(4, body);
          }
        });
      } else {
        this.pagar(4, body);
      }
    } else {
      this.pagar(3, body);
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

  hasValueItemEfectivo() {
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
        item.id === 1 &&
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
}
