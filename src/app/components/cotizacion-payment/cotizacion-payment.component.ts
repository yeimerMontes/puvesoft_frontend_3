import { DOCUMENT } from '@angular/common';
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
import { CotizacionService } from 'src/app/services/cotizacion.service';
import { FuncionService } from 'src/app/services/funcion.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { TipoDocumentoService } from 'src/app/services/tipo-documento.service';
import Swal from 'sweetalert2';

import $ from 'jquery';

@Component({
  selector: 'app-cotizacion-payment',
  templateUrl: './cotizacion-payment.component.html',
  styleUrls: ['./cotizacion-payment.component.scss'],
})
export class CotizacionPaymentComponent implements OnInit {
  @ViewChild('staticModalPagar', { static: false })
  childModalPagar?: ModalDirective;
  @Output() editEvent = new EventEmitter<string>();
  @Output() reloadEvent = new EventEmitter<string>();

  @Input() precio: number;
  @Input() total_retencion: number = 0;

  @Input() products: any = [];
  @Input() subTotal: number;
  @Input() subTotal_s_imp: number;
  @Input() descuento: number;
  @Input() descuento_s_imp: number;

  @Input() cantidadBolsa: number;
  @Input() totalBolsa: number;

  

  formPago: FormGroup; //variable que controla el formulario

  usarDecimales: Number = 1;

  _dataCliente: any[] = [];

  totalPagar = 0;

  timeClear: any;

  date = '';

  addCustomUser = (term) => term;

  constructor(
    private formBuilder: FormBuilder,
    private funcionesService: FuncionesService,
    private clienteService: ClienteService,
    private funcionService: FuncionService,
    private router: Router,
    @Inject(DOCUMENT) document: any,
    private ngSelectConfig: NgSelectConfig,
    private ngSelectModule: NgSelectModule,
    private cotizacionService: CotizacionService,
    private tipoDocumentoService: TipoDocumentoService
  ) {
    this.ngSelectConfig.notFoundText = 'No se encontraron resultados';
    this.ngSelectConfig.placeholder = 'Buscar...';
    this.ngSelectConfig.loadingText = 'Cargando...';
    this.ngSelectConfig.appendTo = 'body';
    this.ngSelectConfig.addTagText = 'Escoger';
  }

  ngOnInit(): void {
    this.formPago = this.formBuilder.group({
      cliente_id: [null, [Validators.required]],
      valor_factura: [+this.precio, []],

      fecha_vencimiento: ['', []],
    });

    this.getTipoDocumentos();

    this.getBuscarCliente('');

    setTimeout(() => {
      this.openModalPagar();
    }, 300);
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
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

  private _tipoDocumentos: any[] = [];

  public getTipoDocumentos(): void {
    this.tipoDocumentoService.getTipoDocumentos().subscribe((resp) => {
      this._tipoDocumentos = resp.data;
    });
  }

  public get tipoDocumentos() {
    return this._tipoDocumentos;
  }

  form: any = {
    nombre: '',
    tipo_documento: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: '',
  };

  openCreateClient() {
    let options = '';

    for (let i = 0; i < this.tipoDocumentos.length; i++) {
      let item = this.tipoDocumentos[i];
      options += `<option value="${item.id}" ${
        this.form.tipo_documento == item.id ? 'selected' : ''
      }>${item.nombre}</option>`;
    }

    Swal.fire({
      title: 'Crear cliente',
      html: `
      <div class="row container-fluid">
      <div class="form-group col-md-6">
      <label>Nombre del cliente</label>
      <input type="text" value="${
        this.form.nombre
      }" autocomplete="off" id="con1" plas class="form-control"> 
      </div>
      <div class="form-group col-md-6">
      <label>Tipo de Documento</label>
      <select id="con2" class="form-control">
      <option disabled ${
        this.form.tipo_documento == '' ? 'selected' : ''
      }>SELECCIONAR...</option>
      ${options}
      </select>
      </div>
      <div class="form-group col-md-6">
      <label>Nit / Documento</label>
      <input type="text" value="${this.form.documento}" 
      onkeypress="return event.charCode >= 48 && event.charCode <= 57"
      autocomplete="off" id="con3" class="form-control">
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

        this.form.nombre = con1;
        this.form.tipo_documento = con2;
        this.form.documento = con3;
        this.form.telefono = con4;
        this.form.email = con5;
        this.form.direccion = con6;

        if (con1 != '' && con2 != '' && con3 != '') {
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
        this.clienteService.addCliente(result.value).subscribe(
          (resp) => {
            this.getBuscarClienteInstance(obj.documento);

            this.form.nombre = '';
            this.form.tipo_documento = '';
            this.form.documento = '';
            this.form.telefono = '';
            this.form.email = '';
            this.form.direccion = '';
            this.onSuccess(resp.message, 'success', 'Registrado');
            // this.getProveedores(1);
          },
          (err) => {
            this.onSuccess(
              'Ocurrió un error al crear el cliente, comuniquese con soporte',
              'error',
              'Error'
            );
          }
        );
      } else {
        this.form.nombre = '';
        this.form.tipo_documento = '';
        this.form.documento = '';
        this.form.telefono = '';
        this.form.email = '';
        this.form.direccion = '';
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent
  ) {
    this.edit('');
  }

  get dataProveedor() {
    return this._dataCliente;
  }

  public edit(value: string) {
    this.editEvent.emit(value);
  }

  public reload(value: string) {
    this.reloadEvent.emit(value);
  }

  /* ################################################################## */
  valorPagar: any = 0;
  openModalPagar(obj: {} = {}) {
    this.valorPagar = 0;
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
      this.formPago.controls.valor_pagar.value
    );
  }

  actualizoInfoProveedor(documento: any) {
    this.formPago.controls.cliente_id.setValue(documento);
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
          'No Existe!'
        );
      }
    });
  }

  /* Getiono modal para el pago de facturas */
  /* ######################################################################## */

  onItemSelected(item: any) {
    let selectedIndex = this._dataCliente.findIndex(
      (dataItem) => dataItem.id == item
    );

    if (selectedIndex != -1) {
      let selectedItemFromData = this._dataCliente[selectedIndex];
      this.actualizoInfoProveedor(selectedItemFromData.id);
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
      this.clienteService.getBusquedaCliente(value).subscribe((resp) => {
        this._dataCliente = resp.data;
      });
      // }
    }, 360);
  }

  getBuscarClienteInstance(value) {
    this.clienteService.getBusquedaClienteDocumento(value).subscribe((resp) => {
      this._dataCliente = resp.data;
      this.formPago.controls.cliente_id.setValue(this._dataCliente[0].id);
    });
  }

  pagar(body) {
    this.comprar(body);
  }

  comprar(body) {
    body['subtotal'] = this.subTotal;
    body['subTotal_s_imp'] = this.subTotal_s_imp;
    body['descuento'] = this.descuento;
    body['descuento_s_imp'] = this.descuento_s_imp;
    body['cantidadBolsa'] = this.cantidadBolsa;
    body['totalBolsa'] = this.totalBolsa;


    let prds = this.products.prds;
    for (let i = 0; i < prds.length; i++) {
      const element = prds[i];
      prds[i].valor_venta = (prds[i].valor_venta + '').replaceAll(',', '');
      prds[i].cantidad = (prds[i].cantidad + '').replaceAll(',', '');
      prds[i].descuento = (prds[i].descuento + '').replaceAll(',', '');
    }

    body['prds'] = prds;

    this.cotizacionService.postPayment(body).subscribe(
      (resp) => {
        this.funcionService.onSuccess(resp.message, 'success', '¡OK!');

        if (document.location.href.indexOf('completar') != -1) {
          this.reloadPagar();
        } else {
          this.router.navigate(['/cotizar/' + resp.data + '/completar']);
        }
      },
      (error) => {
        //console.log(error);
        this.funcionService.onSuccess(error.message, 'error', '¡Atención!');
      }
    );
  }

  onSubmit() {
    if (this.formPago.invalid) {
      this.funcionService.onSuccess(
        'La información del cliente es obligatoria',
        'error',
        'Espere!'
      );
      return;
    }

    // TODO: Validar solo cliente, fecha vencimiento cotizacion, valores
    let body = { ...this.formPago.value };

    this.pagar(body);
  }
}
