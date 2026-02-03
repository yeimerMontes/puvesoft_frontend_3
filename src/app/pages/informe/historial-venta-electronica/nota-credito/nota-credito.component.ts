import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { TypeAlert } from 'src/app/constants/enums';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersHistorialVenta } from 'src/app/constants/historial-ventas';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import { tipoNotaCreditoFacturaElectronica, tipoNotaDebitoFacturaElectronica } from 'src/app/constants/selects';
import { NotaFacturaElectronicaService } from 'src/app/services/nota_factura_electronica';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-listado',
  templateUrl: './nota-credito.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css'],
})
export class NotaCreditoElectronicaComponent implements OnInit {
  @ViewChild('staticModal1', { static: false }) childModal1?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModal3', { static: false }) childModal3?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  titleModule: string = 'Facturación electrónica - Nota crédito';
  headers: headersMasterInterface[] = headersHistorialVenta;

  disabled = false;

  loadedDetalle = false;

  formDevolver: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataAtendio: any = {};
  private _dataCliente: any = {};
  private _dataFactura: any = {};
  private _dataMetodoPago: any[];
  private _dataProductosFactura: any[];
  private _dataImpuestos: any[];
  private _dataNotas: any[];

  productosFacturaPrevisualizacion: any[] = [];

  tipoNotaCreditoFacturaElectronica: any[] = tipoNotaCreditoFacturaElectronica;
  tipoNotaDebitoFacturaElectronica: any[] = tipoNotaDebitoFacturaElectronica;


  private _data = [];

  timeClear: any;

  isActionAdd: boolean = true;

  loaded = true;

  pages: Observable<any[]>;
  page = 1;
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

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;

  showTicket = false;
  idInvoice = null;

  last_page = 0;

  currentPage = 1;
  hasDevolucion = false;

  showApertura: false;

  facturaId: String;

  isAnular = false;

  canSendForm = false;

  dataDetalle = null;

  idDetalleCredito = null;

  showTicketNotaCredito = false;

  idNotaCredito = null;

  @ViewChild('staticModalDetalle', { static: false })
  staticModalDetalle?: ModalDirective;

  date: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private funcionesService: FuncionesService,
    private historialVentaService: HistorialVentaService,
    private metodoPagoServise: MetodoPagoService,
    private notaFacturaElectronicaService: NotaFacturaElectronicaService,
    private router: Router,
    private datePipe: DatePipe,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.facturaId = this.activeRoute.snapshot.paramMap.get('facturaId');
    this.formDevolver = this.formBuilder.group({
      factura_id: ['', [Validators.required]],
      tipo_nota: [null, [Validators.required]],
      tipo_concepto_anulacion: [null, [Validators.required]],
      
      is_propina: [false, [Validators.required]],
      propina_actual: [null, [Validators.required]],
      propina_movimiento: ['', []],
      
      is_domicilio: [false, [Validators.required]],
      domicilio_actual: ['', [Validators.required]],
      domicilio_movimiento: ['', []],

      descuento_actual: [null, [Validators.required]],
      descuento_movimiento: ['', []],

      subtotal_actual: ['', [Validators.required]],
      subtotal_movimiento: ['', []],
      subtotal_movimiento_s_imp: [0, []],
      
      total_original: ['', []],

      total_actual: ['', [Validators.required]],
      total_movimiento: ['', []],

      metodo_pago: ['', [Validators.required]],

      prds: this.formBuilder.array([]),
      nota: ['', [Validators.required]],
      
      valor_actual_impuesto: [0, []],
      total_retencion_actual: [0, []],
      total_retencion_movimiento: [0, []],
    });

    this.formMetodoPago = this.formBuilder.group({
      metodo_pago: ['', []],
    });

    this.getSucural();
    this.getMetodoPago();
    this.getProductosByIdFactura(this.facturaId);

    this.date = this.datePipe.transform(new Date(), 'y/MM/d h:mm:ss a');
  }

  getMetodoPago() {
    this.metodoPagoServise.getMetodoPagos().subscribe((resp) => {
      this._dataMetodoPago = resp.data;
    });
  }

  closeApertura(event) {}

  formatearNumber(valor) {
    let num = this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
    let b = num.split(".")
    if (b.length > 1) {
      let size = b[0].length;
      num = num.substring(0, size+3)
    }

    return num;
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  get data() {
    return this._data;
  }

  get dataCliente() {
    return this._dataCliente;
  }

  get dataAtendio() {
    return this._dataAtendio;
  }

  get dataFactura() {
    return this._dataFactura;
  }

  get dataMetodoPago() {
    return this._dataMetodoPago;
  }

  nombreMetdoPago(pos) {
    if (pos) {
      return this._dataMetodoPago[pos].nombre;
    }
    return '';
  }

  get prds() {
    return this.formDevolver.get('prds') as FormArray;
  }

  get dataProductosFactura() {
    return this._dataProductosFactura;
  }

  get dataImpuestos() {
    return this._dataImpuestos;
  }  

  get dataNotas() {
    return this._dataNotas;
  }

  tipoConcepto(item) {
    if (item.tipo_nota == 1) {
      return this.tipoNotaCreditoFacturaElectronica.find(element => element.id == item.tipo_concepto).nombre
    } else {
      return this.tipoNotaDebitoFacturaElectronica.find(element => element.id == item.tipo_concepto).nombre
    }
  }

  tipoConceptoById(id) {
    if (id){ 
      return this.tipoNotaCreditoFacturaElectronica.find(element => element.id == id).nombre
    }
    return '';
  }

  generateProductos() {
    this.formDevolver.patchValue({ factura_id: this.facturaId });
    this.formDevolver.patchValue({ tipo_nota: 1 }); // Nota crédito

    let impuesto_total = 0;
    
    this._dataProductosFactura.forEach((element, index) => {
      let iva = 0;
      let valor_venta =
        element.valor_venta - element.valor_venta * (element.por_des / 100);
      iva = this.getPriceIva(element);
      
      let valor_base = valor_venta;

      if (iva != 0) {
        valor_base = this.calcularValorTotalSinIva(valor_venta, iva);
      }

      let impuesto = element.impuesto;
      let arrayImpuesto = [];

      if (!Array.isArray(impuesto)) {
        arrayImpuesto.push(impuesto);
      } else {
        arrayImpuesto = JSON.parse(JSON.stringify(impuesto));
      }

      const producto = this.formBuilder.group({
        nombre: element.nombre,
        id: element.producto_id,
        factura_venta_detalle_id: element.id,

        cod_barra: element.cod_barra,

        sigla: element.sigla,
        
        cantidad_actual: this.formatearCantidad(element.cantidad),
        cantidad_movimiento: '',

        descuento_actual: 0,
        descuento_movimiento: '',

        valor_venta_actual: this.formatearNumber(valor_venta),
        valor_venta_movimiento: this.formatearNumber(valor_venta),

        valor_base: valor_base,
        valor_base_movimiento: 0,

        porcentaje_impuesto: iva,
        valor_actual_impuesto: element.valor_impuesto, // element.total - this.calcularValorTotalSinIva(element.total, iva)

        subtotal_actual: element.total,
        subtotal_movimiento: 0,
        
        subtotal_movimiento_sin_impuesto: 0,
        
        por_des_actual: 0,
        por_des_movimiento: '',

        total_actual: element.total,
        total_movimiento: 0,

        valor_venta_sin_iva: this.calcularValorTotalSinIva(element.total, iva), 

        impuesto: this.formBuilder.array(arrayImpuesto),

        valor_impuesto_movimiento: 0,

        tipo_retencion_id: element.tipo_retencion_id,
        por_retencion: element.por_retencion,

        valor_retencion_actual: element.valor_retencion,
        valor_retencion_movimiento: 0
      });

      impuesto_total += (+element.valor_impuesto);

      this.prds.push(producto);
      if (element.devolucion == element.cantidad_movimiento) {
        this.prds.get([index]).disable();
      }
    });

    this.formDevolver.get('valor_actual_impuesto').reset(impuesto_total);

    this.total();
  }

  formatearCantidad(numero: number) {
    const numeroFormateado = numero.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const numeroConPunto = numeroFormateado
      .replace(/\.00$/, '')
      .replace(',', '.');
    return numeroConPunto;
  }

  private getProductosByIdFactura(facturaId) {
    this.loaded = false;
    this.notaFacturaElectronicaService
      .getEstadoFacturaElectronica(facturaId, 1)
      .subscribe((resp) => {
        this._dataCliente = resp.data.cliente;
        this._dataFactura = resp.data.facturaVenta;
        this._dataProductosFactura = resp.data.facturaVentaDetalle;
        this._dataAtendio = resp.data.atendio;
        this._dataImpuestos = resp.data.facturaVentaImpuesto;
        this._dataNotas = resp.data.notasCredito;
        this.canSendForm = resp.data.nueva_nota_credito;

        // Propina
        if (!this._dataFactura.disabled_propina) {
          this.formDevolver.patchValue({ propina_actual: this._dataFactura.propina }); 
        } else {
          this.formDevolver.patchValue({ propina_actual: 0 }); 
        }
        
        // Domicilio
        if ((this._dataFactura.domicilio_id != null) && (!this._dataFactura.disabled_domicilio) ) {
          this.formDevolver.patchValue({ domicilio_actual: resp.data.domicilio.valor });
        } else {
          this.formDevolver.patchValue({ domicilio_actual: 0 });
        }

        // descuento
        this.formDevolver.patchValue({ descuento_actual: this._dataFactura.descuento_s_imp ?? 0 });
        
        // Subtotal
        this.formDevolver.patchValue({ subtotal_actual: this._dataFactura.subtotal_s_imp });

        this.formDevolver.patchValue({ total_original: this._dataFactura.total_original });

        // Total
        this.formDevolver.patchValue({ total_actual: this._dataFactura.total });
        this.formDevolver.patchValue({ total_retencion_actual: this._dataFactura.total_retencion });
        

        this.generateProductos();

        let productos = this.prds.value;

        let sum = 0;
        for (let i = 0; i < productos.length; i++) {
          const element = productos[i];
          let valor = element['valor_base'] * element['cantidad_actual'];
          sum += valor;
        }

        if (this._dataFactura.subtotal_s_imp == null) {
          this.formDevolver.patchValue({ subtotal_actual: sum});
        }
        
        if (this._dataNotas.length > 0) {
          this.formDevolver.patchValue({ subtotal_actual: this._dataFactura.total - this.formDevolver.value.valor_actual_impuesto});
        }

        this.loaded = true;
      });
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

  formatearNumberNoDecimal(valor) {
    return this.funcionesService.formatNumberOnlyNoDecimal(valor);
  }

  changeCantidadDevolver(event, item) {

    clearTimeout(this.timeClear);
    let cantidad = item.get('cantidad_movimiento').value;

    this.timeClear = setTimeout(() => {
      if (cantidad.length > 12 ) {
        cantidad =""
        item.get('cantidad_movimiento').reset(cantidad);
      } else if (cantidad == 0) {
        item.get('cantidad_movimiento').reset(cantidad);
      } 

      if (event.target.value == 0) {
        item.get('cantidad_movimiento').reset('');
      } else if (event.target.value != '' && (+event.target.value) > (+item.get('cantidad_actual').value)) {
        this.onSuccess(
          'Error en la cantidad a devolver',
          'La cantidad a devolver no puede superar la cantidad de la venta',
          TypeAlert.warning
        );
        item.get('cantidad_movimiento').reset('');
      }
      this.subTotalItem(item);
      this.total();
    }, 360);    
    
  }

  changeConceptoNotaCredito() {
    this.prds.clear();
    this.generateProductos();

    if (this.formDevolver.get('tipo_concepto_anulacion').value == 2) {
      this.formDevolver.get('is_propina').reset(true);
      this.changePropina('');
      this.formDevolver.get('is_domicilio').reset(true);
      this.changeDomicilio('');
    } else {
      this.formDevolver.get('is_propina').reset(false);
      this.changePropina('');
      this.formDevolver.get('is_domicilio').reset(false);
      this.changeDomicilio('');
    }
    this.total();
  }

  calcularIva(valor, iva) {
    // Calcular el producto sin iva para obtener el total con iva 19%
    let valor_con_iva = valor * (iva / 100);
    return valor_con_iva;
  }


  subTotal = 0;
  descuento = 0;
  totalPagar = 0;
  totalRetencion = 0;
  
  impuestoMovimiento = 0;

  total() {
    
    let f = this.formDevolver.value.prds;
    let subTotal = 0;
    let descuento = 0;

    this.impuestoMovimiento = 0;

    let sumTotalRetencion = 0;

    for (let i = 0; i < f.length; i++) {
      const element = f[i];
      let formSubTotal = 0;
      let formDescuento = 0;
      /* Valido el numero que digitan en el descuento */

      let por_des = '';
      let valor_fact = '';
      let canti = '';

      if (this.formDevolver.get('tipo_concepto_anulacion').value == 1) {
        por_des = 'por_des_actual';
        valor_fact = 'valor_venta_actual';
        canti = 'cantidad_movimiento';
      } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 2) {
        por_des = 'por_des_actual';
        valor_fact = 'valor_venta_actual';
        canti = 'cantidad_actual';
      } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 3) {
        por_des = 'por_des_movimiento';
        valor_fact = 'valor_venta_actual';
        canti = 'cantidad_actual';
      } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 4) {
        por_des = 'por_des_actual';
        valor_fact = 'valor_venta_movimiento';
        canti = 'cantidad_actual';
      } else {
        por_des = 'por_des_movimiento';
        valor_fact = 'valor_venta_actual';
        canti = 'cantidad_actual';
      }

      this.validarNumero(element[por_des]);

      if (element[por_des] < 0 || element[por_des] > 100) {
        this.formDevolver.value.prds[i][por_des] = '';
      }

      let vlr_venta = (element[valor_fact]+"").replaceAll(',', '');
      //let vlr_venta = element.valor_venta;

      let can_dev = element[canti]
      if (can_dev == '') {
        can_dev = 0;
      }

      let iva = element.porcentaje_impuesto;

      // Cuando es concepto de rebaja el precio se calcula (total_actual - (valor_movimiento*cantidad_actual))
      if (this.formDevolver.get('tipo_concepto_anulacion').value == 4) {

        let vlr_venta_sin_iva = 0;

        let val_movimiento = (+element['valor_venta_actual'].replaceAll(',', '')) - (+element['valor_venta_movimiento'].replaceAll(',', ''));

        if (iva != 0) {
          vlr_venta_sin_iva = this.calcularValorTotalSinIva(val_movimiento, iva);
        } else {
          vlr_venta_sin_iva = +val_movimiento;
        }

        this.prds.get([i]).get('valor_base_movimiento').reset(vlr_venta_sin_iva);
      
        let total_actual = (+(element['total_actual']+"").replaceAll(',', '')) ?? 0;

        formSubTotal =  Number(total_actual) - ( Number(val_movimiento) * Number(can_dev) );

        let total_movimiento = this.prds.get([i]).get('total_movimiento').value;

        let subtotal_movimiento_sin_impuesto = 0;
        if (iva != 0) {
          subtotal_movimiento_sin_impuesto = this.calcularValorTotalSinIva(total_movimiento, iva);
        } else {
          subtotal_movimiento_sin_impuesto = +total_movimiento;
        }

        this.prds.get([i]).get('subtotal_movimiento_sin_impuesto').reset(subtotal_movimiento_sin_impuesto);
        
        if (formSubTotal > 0) {
    
          let iva = this.getPriceIva(element);
          
          let valor_impuesto_movimiento = this.calcularIva(subtotal_movimiento_sin_impuesto, iva);
          
          this.prds.get([i]).get('valor_impuesto_movimiento')!.setValue(valor_impuesto_movimiento);
          
          this.impuestoMovimiento += valor_impuesto_movimiento;

          subTotal += subtotal_movimiento_sin_impuesto + valor_impuesto_movimiento;

        }
  
      } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 3) {

        if (element[por_des] != '') {
                    
          let total_movimiento = (+(element['total_movimiento']+"").replaceAll(',', '')) ?? 0;

          formSubTotal = total_movimiento;
          subTotal += formSubTotal;

          let total_con_iva = formSubTotal;

          let vlr_venta_sin_iva = 0;

          let val_movimiento = element['valor_venta_movimiento'];

          if (iva != 0) {
            vlr_venta_sin_iva = this.calcularValorTotalSinIva(val_movimiento, iva);
          } else {
            vlr_venta_sin_iva = +val_movimiento;
          }

          this.prds.get([i]).get('valor_base_movimiento').reset(vlr_venta_sin_iva);

          let valor_impuesto_movimiento = total_con_iva-this.calcularValorTotalSinIva(total_con_iva, iva);

          let subtotal_movimiento_sin_impuesto = 0;
          if (iva != 0) {
            subtotal_movimiento_sin_impuesto = this.calcularValorTotalSinIva(total_movimiento, iva);
          } else {
            subtotal_movimiento_sin_impuesto = +total_movimiento;
          }

          this.prds.get([i]).get('subtotal_movimiento_sin_impuesto').reset(subtotal_movimiento_sin_impuesto);
          
          this.prds.get([i]).get('valor_impuesto_movimiento')!.setValue(valor_impuesto_movimiento);
          
          this.impuestoMovimiento += valor_impuesto_movimiento;

        }

      } else {

        formSubTotal = Number(vlr_venta) * Number(can_dev);
        subTotal += formSubTotal;

        let val_base = element['valor_base'];

        this.prds.get([i]).get('valor_base_movimiento').reset(val_base);
        
        this.prds.get([i]).get('subtotal_movimiento').reset(formSubTotal);

        let subtotal_movimiento_sin_impuesto = 0;
        if (iva != 0) {
          subtotal_movimiento_sin_impuesto = this.calcularValorTotalSinIva(formSubTotal, iva);
        } else {
          subtotal_movimiento_sin_impuesto = +formSubTotal;
        }

        this.prds.get([i]).get('subtotal_movimiento_sin_impuesto').reset(subtotal_movimiento_sin_impuesto);
          


        let total_con_iva = formSubTotal;
              
          let valor_base = total_con_iva-this.calcularValorTotalSinIva(total_con_iva, iva);
          
          this.prds.get([i]).get('valor_impuesto_movimiento')!.setValue(valor_base);
          

          if (this.formDevolver.get('tipo_concepto_anulacion').value == 1 && can_dev > 0) {
            this.impuestoMovimiento += valor_base;
          } else {
            this.impuestoMovimiento += valor_base;
          }        
      }

      if (this.formDevolver.get('tipo_concepto_anulacion').value == 2) {
        this.prds.get([i]).get('valor_impuesto_movimiento')!.setValue(can_dev);
        this.prds.get([i]).get('cantidad_movimiento')!.setValue(can_dev);
        let total_actual = this.prds.get([i]).get('total_actual').value;
        this.prds.get([i]).get('total_movimiento')!.setValue(total_actual);
      }


      if (element[por_des] > 0) {
        formDescuento = formSubTotal;
        descuento += formDescuento;
      }

      let product = this.prds.get([i]).value;

      let por_retencion = product.por_retencion;

      let subtotal_movimiento_sin_impuesto = product.subtotal_movimiento_sin_impuesto;

      let total = subtotal_movimiento_sin_impuesto * (por_retencion / 100);

      sumTotalRetencion += total;

      this.prds.get([i]).get('valor_retencion_movimiento').setValue(total); 

    }
    

    this.subTotal = subTotal;
    this.descuento = descuento;

    this.totalRetencion = sumTotalRetencion;

    if (this.formDevolver.get('tipo_concepto_anulacion').value == 3) {
      this.subTotal = this.subTotal * 2; // Multiplico por 2 para realizar el descuento en el template
      this.totalPagar = this.subTotal;
    } else {
      this.totalPagar = Number(subTotal - descuento);
    }
  }

  validarInput(i) {
    clearTimeout(this.timeClear);
    let cantidad = this.prds.get([i]).get('cantidad_movimiento').value;

    this.timeClear = setTimeout((cantidad) => {
      if (cantidad.length > 12 ) {
        cantidad =""
        this.prds.get([i]).get('cantidad_movimiento').reset(cantidad);
      } else if (cantidad == 0) {
        this.prds.get([i]).get('cantidad_movimiento').reset(cantidad);
      } 
    }, 360);
  }


  valor_pagar(evento, event, item, i, template) {
    let val = event.replaceAll(',', '');

    let valor_venta= +(item.get('valor_venta_actual').value + '').replaceAll(',', '');
    let valor_venta_movimiento = +val;
    
    if (valor_venta < valor_venta_movimiento) {
      item.get('valor_venta_movimiento')!.reset(this.formatearNumber(item.get('valor_venta_actual')!.value.replaceAll(',', '')));
      
      evento.returnValue = false;
      evento.target.value = item.get('valor_venta_movimiento').value;
    } else {

      if (this.funcionesService.countDecimalPoints(val) === 0) {
        let val2 = this.formatearNumber(val);
        let arr = val2.split('.');
        if (arr.length > 1) {
          val = arr[0];
        } else {
          val = val2;
        }
        item.get('valor_venta_movimiento')!.setValue(val);
      } else {
        item.get('valor_venta_movimiento')!.setValue(this.formatearNumberNoDecimal(val));
      }

    }

    this.subTotalItem(item);
    
    this.total();
  }

  valor_propina_movimiento(evento, event, inputName, inputActual) {
    let val = event.replaceAll(',', '');

    let valor= +(this.formDevolver.get(inputActual).value + '').replaceAll(',', '');
    let valor_movimiento = +val;

    if (val == 0) {
      this.formDevolver.get(inputName)!.setValue('');
    } else {
      if (valor < valor_movimiento) {
        this.formDevolver.get(inputName)!.reset(
          this.formatearNumber(this.formDevolver.get(inputActual)!.value.replaceAll(',', ''))
        );
        
        evento.returnValue = false;
        evento.target.value = this.formDevolver.get(inputName).value;
      } else {

        if (this.funcionesService.countDecimalPoints(val) === 0) {
          let val2 = this.formatearNumber(val);
          let arr = val2.split('.');
          if (arr.length > 1) {
            val = arr[0];
          } else {
            val = val2;
          }
          this.formDevolver.get(inputName)!.setValue(val);
        } else {
          this.formDevolver.get(inputName)!.setValue(this.formatearNumberNoDecimal(val));
        }

      }
    }
    
    this.total();
  }

  updatePrecioCompraConIva(i) {
    // Modifico el valor que tiene el iva
    let producto = this.prds.get([i]).value;

    let iva = this.getPriceIva(producto);

    let valor_venta_movimiento = +(producto.valor_venta_movimiento + '').replaceAll(',', '');

    if (iva != 0) {
      valor_venta_movimiento = this.calcularValorTotalSinIva(valor_venta_movimiento, iva);
    }
    

    this.prds.get([i]).get('valor_venta_sin_iva').setValue(valor_venta_movimiento);

    this.total();
  }

  calcularValorTotalConIva(valor, iva) {
    // Calcular el producto sin iva para obtener el total con iva 19%
    let valor_con_iva = valor * (1 + iva / 100);
    return valor_con_iva;
  }

  calcularValorTotalSinIva(valor, iva) {
    // Calculo el valor del producto sin incluir el iva 19%
    let valor_sin_iva = valor / (1 + iva / 100); // iva 19 / 100 = 0.19
    return valor_sin_iva;
  }

  getPriceIva(producto) {
    return this.funcionesService.getPriceIva(producto);
  }

  recortarNumber(valor) {
    if (typeof valor === 'string') {
      valor = parseFloat(valor);
    }
    return valor.toFixed(2);
  }

  subTotalItem(item) {

    let por_des = '';
    let valor_fact = '';
    let canti = '';

    if (this.formDevolver.get('tipo_concepto_anulacion').value == 1) {
      por_des = 'por_des_actual';
      valor_fact = 'valor_venta_actual';
      canti = 'cantidad_movimiento';
    } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 2) {
      por_des = 'por_des_actual';
      valor_fact = 'valor_venta_movimiento';
      canti = 'cantidad_movimiento';
    } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 3) {
      por_des = 'por_des_movimiento';
      valor_fact = 'valor_venta_actual';
      canti = 'cantidad_actual';
    }
    else if (this.formDevolver.get('tipo_concepto_anulacion').value == 4) {
      por_des = 'por_des_actual';
      valor_fact = 'valor_venta_movimiento';
      canti = 'cantidad_actual';
    } else {
      por_des = 'por_des_movimiento';
      valor_fact = 'valor_venta_actual';
      canti = 'cantidad_actual';
    }

    let vlr_venta = (+item.get(valor_fact)!.value.replaceAll(',', '')) ?? 0;

    let por_des_item = item.get(por_des)!.value ?? 0;
    let cant_item = item.get(canti)!.value ?? 0;

    let total =
      por_des_item != null &&
      por_des_item >= 0 &&
      por_des_item <= 100
        ? vlr_venta * cant_item -
          (vlr_venta *
            cant_item *
            por_des_item) /
            100
        : vlr_venta * cant_item;

    
    if (this.formDevolver.get('tipo_concepto_anulacion').value == 4) {
      
      let vlr_venta_actual = (+(item.get('total_actual')!.value+"").replaceAll(',', '')) ?? 0;
      item.get('total_movimiento')!.setValue(vlr_venta_actual-total);
      item.get('subtotal_movimiento')!.setValue(vlr_venta_actual-total);
      return vlr_venta_actual-total;

    } if (this.formDevolver.get('tipo_concepto_anulacion').value == 3) {

      let valor_momivimiento = vlr_venta * (por_des_item / 100);

      let total_movimiento = valor_momivimiento*cant_item;
      // cant_item
      
      
      
      item.get('valor_venta_movimiento')!.setValue(valor_momivimiento);
      item.get('total_movimiento')!.setValue(total_movimiento);
      item.get('subtotal_movimiento')!.setValue(total_movimiento);
      return total;

      
      

    } if (this.formDevolver.get('tipo_concepto_anulacion').value == 1) {

      let total_movimiento = vlr_venta*cant_item;
      
      item.get('total_movimiento')!.setValue(total_movimiento);
      return total;

    } else {

      item.get('total_movimiento')!.setValue(total);
      return total;

    }

  }

  por_des_item(item, event) {

    if (event.target.value < 1 || event.target.value > 100) {
      item.get('por_des_movimiento').reset('');
    }

    this.subTotalItem(item);
    this.total();
  }


  validarNumero(numero) {
    let s = numero + ''.split('.');

    if (s.length > 2) {
      return {
        flag: false,
        description: 'El número tiene más de 1 (.)',
      };
    }
  }

  subtotalPrevisualizacion = 0;
  impuestoPrevisualizacion = 0;

  previsualizar() {

    this.productosFacturaPrevisualizacion = [];

    this.subtotalPrevisualizacion = 0;
    this.impuestoPrevisualizacion = 0;

    this.hasDevolucion = false;
    let mayor = false;
    let menor = false;

    if (this.formDevolver.invalid) {
      this.onSuccess(
        'Espere',
        'Debe completar toda la información para poder previsualizar',
        TypeAlert.warning
      );
      return;
    }

    this.prds.controls.forEach((element, index) => {
      if (element.get('cantidad_movimiento').value) {
        this.hasDevolucion = true;
      }

      if (
        element.get('cantidad_movimiento').value >
        this.dataProductosFactura[index].cantidad_movimiento -
          this.dataProductosFactura[index].devolucion
      ) {
        mayor = true;
      }

      if (
        element.get('cantidad_movimiento').value &&
        element.get('cantidad_movimiento').value <= 0
      ) {
        menor = true;
      }
    });

    // Concepto Devolución
    if (this.formDevolver.get('tipo_concepto_anulacion').value == 1) {
      if (!this.hasDevolucion) {
          this.onSuccess(
            'Debe ingresar por lo menos una devolución',
            'Diligencie por lo menos una devolución a una factura para poder realizar la acción de devolver...',
            TypeAlert.warning
          );
          return;
        }

        if (mayor) {
          this.onSuccess(
            'Error en la cantidad a devolver',
            'Verifique las cantidades a devolver, estas no pueden exceder las unidades restantes...',
            TypeAlert.warning
          );
          return;
        }

        if (menor) {
          this.onSuccess(
            'Error en la cantidad a devolver',
            'Verifique las cantidades a devolver, estas no pueden ser menores a 0...',
            TypeAlert.warning
          );
          return;
        }

    }

    let formuDevolverValue = JSON.parse(JSON.stringify(this.formDevolver.value));

    let arrProducts = [];

    for (let i = 0; i < formuDevolverValue.prds.length; i++) {
      formuDevolverValue.prds[i]['valor_venta_actual'] = (formuDevolverValue.prds[i].valor_venta_actual+"").replaceAll(',', '')
      formuDevolverValue.prds[i]['valor_venta_movimiento'] = (formuDevolverValue.prds[i].valor_venta_movimiento+"").replaceAll(',', '')      
    }

    for (let i = 0; i < formuDevolverValue.prds.length; i++) {

      let element = formuDevolverValue.prds[i];

      let iva = this.getPriceIva(element);
      
      

      formuDevolverValue.prds[i]['valor_impuesto'] = 0;

      if (this.formDevolver.get('tipo_concepto_anulacion').value == 1) {

        let cantidad_actual = formuDevolverValue.prds[i]['cantidad_actual'];
        let cantidad_movimiento = formuDevolverValue.prds[i]['cantidad_movimiento'];
        
        formuDevolverValue.prds[i]['valor_impuesto'] = formuDevolverValue.prds[i]['valor_actual_impuesto'] - formuDevolverValue.prds[i]['valor_impuesto_movimiento'];
        formuDevolverValue.prds[i]['subtotal_movimiento'] = formuDevolverValue.prds[i]['subtotal_actual'] - formuDevolverValue.prds[i]['subtotal_movimiento'];
        
        let resta = cantidad_actual - cantidad_movimiento;

        formuDevolverValue.prds[i]['cantidad_movimiento'] = resta;
        
        if (resta > 0) {
          arrProducts.push(formuDevolverValue.prds[i])
          this.productosFacturaPrevisualizacion.push(formuDevolverValue.prds[i]);
        }

      } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 3) {        
        
        let valor_venta_movimiento = formuDevolverValue.prds[i]['valor_venta_movimiento'] ?? 0;
        let valor_venta_actual = formuDevolverValue.prds[i]['valor_venta_actual'] ?? 0;

        valor_venta_movimiento = valor_venta_actual - valor_venta_movimiento;

        formuDevolverValue.prds[i]['valor_venta_movimiento'] = valor_venta_movimiento;

        let valor_impuesto_movimiento = formuDevolverValue.prds[i]['valor_impuesto_movimiento'] ?? 0;
        let valor_actual_impuesto = formuDevolverValue.prds[i]['valor_actual_impuesto'] ?? 0;

        valor_impuesto_movimiento = valor_actual_impuesto - valor_impuesto_movimiento;

        formuDevolverValue.prds[i]['valor_impuesto'] = valor_impuesto_movimiento;

        let valor_base_movimiento = formuDevolverValue.prds[i]['valor_base_movimiento'] ?? 0;
        let valor_base = formuDevolverValue.prds[i]['valor_base'] ?? 0;

        valor_base_movimiento = valor_base - valor_base_movimiento;

        formuDevolverValue.prds[i]['valor_base_movimiento'] = valor_base_movimiento;
        
        formuDevolverValue.prds[i]['cantidad_movimiento'] = formuDevolverValue.prds[i]['cantidad_actual'];

        let subtotal_movimiento = formuDevolverValue.prds[i]['subtotal_movimiento'] ?? 0;
        let subtotal_actual = formuDevolverValue.prds[i]['subtotal_actual'] ?? 0;

        subtotal_movimiento = subtotal_actual - subtotal_movimiento;

        formuDevolverValue.prds[i]['subtotal_movimiento'] = subtotal_movimiento;

        arrProducts.push(formuDevolverValue.prds[i])

        this.productosFacturaPrevisualizacion.push(formuDevolverValue.prds[i]);

      } else if (
        this.formDevolver.get('tipo_concepto_anulacion').value == 4
      ) {
        

        let valor_base_movimiento = formuDevolverValue.prds[i]['valor_base_movimiento'] ?? 0;
        let valor_base = formuDevolverValue.prds[i]['valor_base'] ?? 0;

        valor_base_movimiento = valor_base - valor_base_movimiento;

        formuDevolverValue.prds[i]['valor_base_movimiento'] = valor_base_movimiento;

        let valor_impuesto_movimiento = formuDevolverValue.prds[i]['valor_impuesto_movimiento'] ?? 0;
        let valor_actual_impuesto = formuDevolverValue.prds[i]['valor_actual_impuesto'] ?? 0;

        valor_impuesto_movimiento = valor_actual_impuesto - valor_impuesto_movimiento;

        formuDevolverValue.prds[i]['valor_impuesto'] = valor_impuesto_movimiento;
        
        formuDevolverValue.prds[i]['cantidad_movimiento'] = formuDevolverValue.prds[i]['cantidad_actual'];

        let subtotal_movimiento = formuDevolverValue.prds[i]['subtotal_movimiento'] ?? 0;
        let subtotal_actual = formuDevolverValue.prds[i]['subtotal_actual'] ?? 0;

        subtotal_movimiento = subtotal_actual - subtotal_movimiento;

        formuDevolverValue.prds[i]['subtotal_movimiento'] = subtotal_movimiento;

        arrProducts.push(formuDevolverValue.prds[i])

        this.productosFacturaPrevisualizacion.push(formuDevolverValue.prds[i]);
      }
      
    }

    if (
      this.formDevolver.get('tipo_concepto_anulacion').value == 1 
      || this.formDevolver.get('tipo_concepto_anulacion').value == 3
      || this.formDevolver.get('tipo_concepto_anulacion').value == 4
      ) {
      formuDevolverValue['prds'] = arrProducts;
    }

    for (let i = 0; i < this.productosFacturaPrevisualizacion.length; i++) {
      const element = this.productosFacturaPrevisualizacion[i];
      this.subtotalPrevisualizacion += element.subtotal_movimiento;
      this.impuestoPrevisualizacion += element.valor_impuesto;
    }

    this.openModalPrevisualizacion();
  }

  devolver() {
    this.disabled = true;
    this.hasDevolucion = false;
    let mayor = false;
    let menor = false;

    if (this.formDevolver.invalid) {
      this.onSuccess(
        'Espere',
        'Debe completar toda la información para poder enviarlo',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    this.prds.controls.forEach((element, index) => {
      if (element.get('cantidad_movimiento').value) {
        this.hasDevolucion = true;
      }

      if (
        element.get('cantidad_movimiento').value >
        this.dataProductosFactura[index].cantidad_movimiento -
          this.dataProductosFactura[index].devolucion
      ) {
        mayor = true;
      }

      if (
        element.get('cantidad_movimiento').value &&
        element.get('cantidad_movimiento').value <= 0
      ) {
        menor = true;
      }
    });

    // Concepto Devolución
    if (this.formDevolver.get('tipo_concepto_anulacion').value == 1) {
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
            'Verifique las cantidades a devolver, estas no pueden ser menores a 0...',
            TypeAlert.warning
          );
          this.disabled = false;
          return;
        }

      // Descuento
      this.formDevolver.patchValue({ descuento_movimiento: this.descuento });

      // Subtotal
      this.formDevolver.patchValue({ subtotal_movimiento: this.subTotal });
      
      // Total a pagar
      this.formDevolver.patchValue({ total_movimiento: this.totalPagar });
      
      this.formDevolver.patchValue({ total_retencion_movimiento: this.totalRetencion });

    } 
    // Concepto Anulación
    else if (this.formDevolver.get('tipo_concepto_anulacion').value == 2) {

      this.formDevolver.patchValue({ propina_movimiento: this.formDevolver.get('propina_actual').value });
      this.formDevolver.patchValue({ domicilio_movimiento: this.formDevolver.get('domicilio_actual').value });
      this.formDevolver.patchValue({ descuento_movimiento: this.formDevolver.get('descuento_movimiento').value });
      this.formDevolver.patchValue({ subtotal_movimiento: this.formDevolver.get('subtotal_actual').value });
      this.formDevolver.patchValue({ total_movimiento: this.formDevolver.get('total_actual').value });

      for (let i = 0; i < this.prds.length; i++) {
        this.prds.get([i]).get('cantidad_movimiento').reset( this.prds.get([i]).get('cantidad_actual').value );
        this.prds.get([i]).get('valor_venta_movimiento').reset( this.prds.get([i]).get('valor_venta_actual').value );
        this.prds.get([i]).get('subtotal_movimiento').reset( this.prds.get([i]).get('subtotal_actual').value );
        this.prds.get([i]).get('por_des_movimiento').reset( this.prds.get([i]).get('por_des_actual').value );
        this.prds.get([i]).get('total_movimiento').reset( this.prds.get([i]).get('total_actual').value );
      }

    } 
    // Concepto Descuento
    else if (this.formDevolver.get('tipo_concepto_anulacion').value == 3) {

      for (let i = 0; i < this.prds.length; i++) {
        this.prds.get([i]).get('cantidad_movimiento').reset( this.prds.get([i]).get('cantidad_actual').value );
        // this.prds.get([i]).get('valor_venta_movimiento').reset( this.prds.get([i]).get('valor_venta_actual').value );
      }
      
      // Descuento
      
      
      this.formDevolver.patchValue({ descuento_movimiento: this.descuento });
      

      // Subtotal
      this.formDevolver.patchValue({ subtotal_movimiento: this.subTotal-this.descuento });
      
      
      // Total a pagar
      this.formDevolver.patchValue({ total_movimiento: this.totalPagar-this.descuento });
      
      

    } else {

      for (let i = 0; i < this.prds.length; i++) {
        this.prds.get([i]).get('cantidad_movimiento').reset( this.prds.get([i]).get('cantidad_actual').value );
        this.prds.get([i]).get('por_des_movimiento').reset( this.prds.get([i]).get('por_des_actual').value );
      }
      
      // Descuento
      this.formDevolver.patchValue({ descuento_movimiento: this.descuento });

      // Subtotal
      this.formDevolver.patchValue({ subtotal_movimiento: this.subTotal });
      
      // Total a pagar
      this.formDevolver.patchValue({ total_movimiento: this.totalPagar });

    }

    let formuDevolverValue = this.formDevolver.value;

    let arrProducts = [];

    for (let i = 0; i < formuDevolverValue.prds.length; i++) {
      formuDevolverValue.prds[i]['valor_venta_actual'] = (formuDevolverValue.prds[i].valor_venta_actual+"").replaceAll(',', '')
      formuDevolverValue.prds[i]['valor_venta_movimiento'] = (formuDevolverValue.prds[i].valor_venta_movimiento+"").replaceAll(',', '')      
    }

    for (let i = 0; i < formuDevolverValue.prds.length; i++) {

      if (this.formDevolver.get('tipo_concepto_anulacion').value == 1 && (+formuDevolverValue.prds[i].cantidad_movimiento) > 0) {
        arrProducts.push(formuDevolverValue.prds[i])
      } else if (this.formDevolver.get('tipo_concepto_anulacion').value == 3 && formuDevolverValue.prds[i].por_des_movimiento != '') {
        
        formuDevolverValue.prds[i].por_des_movimiento = 0;

        arrProducts.push(formuDevolverValue.prds[i])
      } else if (
        this.formDevolver.get('tipo_concepto_anulacion').value == 4 
        && (formuDevolverValue.prds[i].valor_venta_actual - formuDevolverValue.prds[i].valor_venta_movimiento) > 0
      ) {
        
        formuDevolverValue.prds[i]['valor_venta_movimiento'] = (+formuDevolverValue.prds[i]['valor_venta_actual'].replaceAll(',', '')) - (+formuDevolverValue.prds[i]['valor_venta_movimiento'].replaceAll(',', ''));

        arrProducts.push(formuDevolverValue.prds[i])
      }
      
    }

    if (
      this.formDevolver.get('tipo_concepto_anulacion').value == 1 
      || this.formDevolver.get('tipo_concepto_anulacion').value == 3
      || this.formDevolver.get('tipo_concepto_anulacion').value == 4
      ) {
      formuDevolverValue['prds'] = arrProducts;
    }

    if (formuDevolverValue['prds'].length == 0) {
      this.onSuccess(
        'Espere!',
        'Debe aplicar el concepto sobre el producto',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    let canDevolver = -1;

    if (this.formDevolver.get('tipo_concepto_anulacion').value == 1 && formuDevolverValue['prds'].length > 0) {
      canDevolver = 0;
      for (let i = 0; i < formuDevolverValue['prds'].length; i++) {
        let item = formuDevolverValue['prds'][i];
        if ((+item.cantidad_actual) - (+item.cantidad_movimiento) == 0) {
          canDevolver++;
        }
      }
    }
    
    if (
      (canDevolver == formuDevolverValue['prds'].length) && (formuDevolverValue['prds'].length == this.prds.length)
      && (
        ((+(this.formDevolver.get('domicilio_actual').value+"")) - (+(this.formDevolver.get('domicilio_movimiento').value+"")) != 0)
        ||
        ((+(this.formDevolver.get('propina_actual').value+"")) - (+(this.formDevolver.get('propina_movimiento').value+"")) != 0)
      )
    ) {
      this.onSuccess(
        'Espere!',
        'Para devolver todos los productos debe devolver todos los cargos',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    let propinaMov = (this.formDevolver.get('propina_movimiento').value+"").replaceAll(',', '');
    let domicilioMov = (this.formDevolver.get('domicilio_movimiento').value+"").replaceAll(',', '');
    formuDevolverValue['propina_movimiento'] = propinaMov;
    formuDevolverValue['domicilio_movimiento'] = domicilioMov;
    
    formuDevolverValue['subtotal_movimiento_s_imp'] = (this.subTotal - this.descuento) - this.impuestoMovimiento;


    // console.log(formuDevolverValue);
    // this.disabled = false;

    // return;


    this.historialVentaService
      .notaCreditoFacturacionElectronica(
        formuDevolverValue,
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Acción exitosa',
            'Nota de crédito creada exitosamente',
            TypeAlert.success
          );
          // this.router.navigate(['/informe', 'devoluciones']);
          // this.getHistorial(1, 1);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        (error) => {
          this.funcionesService.onSuccessWithButton(
            error.error.data,
            TypeAlert.warning,
            error.error.message,
          );
          this.disabled = false;
        }
      );
  }

  openModalDetalle(item) {
    this.idDetalleCredito = item.id;
    this.showTicket = true;
  }

  closeModalDetalle(value: string) {
    this.idDetalleCredito = null;
    this.showTicket = false;
  }

  openModalPrevisualizacion() {
    this.staticModalDetalle?.show();
  }

  closeModalPrevisualizacion() {
    this.staticModalDetalle?.hide();
  }

  changePropina(event) {
    if (this.formDevolver.value.is_propina) {
      this.formDevolver.get('propina_movimiento').reset(this.formDevolver.value.propina_actual)
    } else {
      this.formDevolver.get('propina_movimiento').reset(0)
    }
  }

  changeDomicilio(event) {
    if (this.formDevolver.value.is_domicilio) {
      this.formDevolver.get('domicilio_movimiento').reset(this.formDevolver.value.domicilio_actual)
    } else {
      this.formDevolver.get('domicilio_movimiento').reset(0)
    }
  }

  regresar() {
    this.router.navigate(['/informe/historialventaelectronica']);
  }

  abrirTicketNotaCredito(id) {
    this.showTicketNotaCredito = true;
    this.idNotaCredito = id;
  }
  
  closeTicketNotaCredito(value: string) {
    this.showTicketNotaCredito = false;
    this.idNotaCredito = null;
  }


}
