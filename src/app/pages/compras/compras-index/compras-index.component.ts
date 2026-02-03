import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { metodoPagos } from 'src/app/constants/selects';
import { ClienteService } from 'src/app/services/cliente.service';
import { CompraService } from 'src/app/services/compra.service';
import { FuncionService } from 'src/app/services/funcion.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MonedaService } from 'src/app/services/moneda.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { TipoRetencionService } from 'src/app/services/tipo_retencion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras-index',
  templateUrl: './compras-index.component.html',
  styleUrls: ['./compras-index.component.scss'],
})
export class ComprasIndexComponent implements OnInit {
  @ViewChild('staticModalValor', { static: false })
  staticModalValor?: ModalDirective;

  @ViewChild('staticModalRetencionProducto', { static: false })
  staticModalRetencionProducto?: ModalDirective;

  search: FormGroup; //variable que controla el formulario para hacer busqueda
  formAperturaCaja: FormGroup; //variable que controla el formulario para hacer busqueda
  formProductos: FormGroup; //variable que controla el formulario
  formPago: FormGroup; //variable que controla el formulario
  formCambiarInfo: FormGroup; //variable que controla el formulario
  formTipoRetencion: FormGroup; //variable que controla el formulario
  formValor: FormGroup; //variable que controla el formulario

  permisoValorVenta: boolean = false; //permiso para modificar el valor de venta
  permisoPorDescuento: boolean = false; //permiso para modificar el porcentaje de descuento
  quitarProducto: boolean = true; //permiso para eliminar un produdo del pedido
  factura = null;

  dataProductosActivos: any[] = [];
  dataProductosActivosTemporal: any[] = []; ///aqui almaceno los productos que se cargan por primera vez para luego que dejen de hacer busqueda retornarlos
  dataMetodoPagos: any[] = metodoPagos;
  _dataCliente: any[] = [];

  categoriaSeleccionada: number;

  zonaPrinciapl: number; //para almacenar la primera zona que se consulta para luego hacer la consulta de mesas
  usarDecimales: Number = 1;
  moneda: string = '$';
  showRetencion: Number = 1;
  timeClear: any;

  carritoId = null;
  carritos = [];

  /* mesa id */
  pageView = 0;

  precio = 0;

  isPaymentVisible = false;

  isChangeTableVisible = false;

  idTableSelected = null;

  productName = '';

  propina = 0;

  tipoRetencion = [];

  totalRetencion = 0;

  posItemSelectedToDiscount = -1;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private productoService: ProductoService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private clienteService: ClienteService,
    private funcionService: FuncionService,
    private compraService: CompraService,
    private router: Router,
    private tipoRetencionService: TipoRetencionService,
    private monedaService: MonedaService,
  ) {}

  ngOnInit(): void {
    /* Consulto los permisos */
    setTimeout(() => {
      this.permisos();
    }, 2000);

    this.getSucural();

    this.getProductosActivos();
    this.loadCarrito();

    this.loadTipoRetencion();

    /* Formulario de busqueda */
    this.search = this.formBuilder.group({
      producto: ['', []],
    });

    this.formAperturaCaja = this.formBuilder.group({
      inicio_caja: ['', [Validators.required]],
    });

    this.formProductos = this.formBuilder.group({
      hasRetenciones: [false, []],
      prds: this.formBuilder.array([]),
    });

    this.formPago = this.formBuilder.group({
      metodo_pago: ['', []],
      valor: ['', []],
      valor_pagar: ['', []],
      documento_cliente: ['', []],
      nombre_cliente: ['', []],
      porcentaje_propina: ['', []],
      valor_propina: ['', []],
      cortesia: ['', []],
    });

    this.formValor = this.formBuilder.group({
      valor_compra: ['', []],
      iva: ['', []],
      valor_compra_sin_iva: ['', []],
      impuesto: [[], []],
    });

    this.formCambiarInfo = this.formBuilder.group({
      id: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.min(0)]],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      descuento: [null, [Validators.min(0), Validators.max(100)]],
    });

    this.formTipoRetencion = this.formBuilder.group({
      id: ['', []],
      pos: ['', []],
      tipo: ['', []],
      subtotal: ['', []],
      tipo_retencion: [null, []],
      total_retencion: ['', []],
      porcentaje: ['', []],
    });
  }

  /* Consulto información de sucursal */
  private getSucural(): void {
    let sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
    );

    this.usarDecimales = sucursal.usar_decimales;
    this.showRetencion = sucursal.retencion;
    this.moneda = this.monedaService.obtenerSimbolo(sucursal.moneda);

    if (!sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        this.moneda = this.monedaService.obtenerSimbolo(resp.data.moneda);
        this.showRetencion = resp.data.retencion;
      });
    }
  }

  /* Consulto Productos activos */
  getProductosActivos() {
    this.pageView = 1;

    this.productoService.productosActivasCompras().subscribe((resp) => {
      this.dataProductosActivos = resp.data;

      /* Guardo los productos que se cargaron temporalmente */
      this.dataProductosActivosTemporal = this.dataProductosActivos;
    });
  }

  regresarMesas() {
    this.router.navigate(['/dashboard']);
  }

  /* Buscar producto */
  buscar_nombre() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      /* Hago la busqueda */
      if (this.search.controls.producto.value != '') {
        this.productoService
          .getBusquedaPorNombreProductosActivasCompra(
            this.search.controls.producto.value,
          )
          .subscribe((resp) => {
            this.dataProductosActivos = resp.data;
          });
      } else {
        /* Si el campo de busqueda queda vacio asigno los productos que se cargaron primero */
        this.dataProductosActivos = this.dataProductosActivosTemporal;
      }
    }, 360);
  }
  buscar_porBarra(data) {
    /* En el caso que la data de productos quede vacia le asgino los productos que se cargaron temporalmente */
    if (this.dataProductosActivos.length == 0) {
      this.dataProductosActivos = this.dataProductosActivosTemporal;
    }

    this.productoService
      .busquedaPorCodBarraProductosActivasCompras(data)
      .subscribe((resp) => {
        if (resp.data.length == 0) {
          this.funcionService.onSuccess(
            'No hay productos que coincidan con el código...',
            'error',
            'No hay Coincidencias!',
          );
        } else {
          this.getAgregarOrden(resp.data[0]);
        }
      });
    this.search.controls.producto.setValue('');
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  replaceComas(valor) {
    return (valor + '').replaceAll(',', '');
  }

  recortarNumber(valor) {
    if (typeof valor === 'string') {
      valor = parseFloat(valor);
    }
    return valor.toFixed(2);
  }

  subTotalItem(item) {
    let vlrCompra = +(item.get('valor_compra')!.value + '').replaceAll(',', '');

    let vlrCantidad = +(item.get('cantidad')!.value + '').replaceAll(',', '');

    return item.get('descuento')!.value != null &&
      item.get('descuento')!.value >= 0 &&
      item.get('descuento')!.value <= 100
      ? vlrCompra * vlrCantidad -
          (vlrCompra * vlrCantidad * item.get('descuento')!.value) / 100
      : vlrCompra * vlrCantidad;
  }

  campoEsValido(campo: string) {
    return (
      this.formCambiarInfo.get(campo).errors &&
      this.formCambiarInfo.get(campo).touched
    );
  }

  /* ########################################################################## */
  /* Gestión para agregar el producto */
  get prds(): FormArray {
    return this.formProductos.get('prds') as FormArray;
  }

  get dataCliente() {
    return this._dataCliente;
  }

  productos(index: number): FormArray {
    return this.formProductos.get('prds') as FormArray;
  }

  /* Para agregar productos */
  addProductoForm(producto) {
    //console.log(producto);
    let iva = 0;

    iva = this.getPriceIva(producto);
    console.log(iva);

    let valor_compra_sin_iva = producto.valor_compra;

    if (iva != 0) {
      valor_compra_sin_iva = this.calcularValorTotalSinIva(
        producto.valor_compra,
        iva,
      );
    }

    // Corto los ceros después del punto
    let valor = this.formatearNumber(producto.valor_compra);

    let arr = (valor + '').split('.');

    if (arr.length > 1) {
      if (arr[1] == '00') {
        valor = arr[0];
      }
    }

    let valorVenta = this.formatearNumber(producto.valor_venta);

    let arrVenta = (valorVenta + '').split('.');

    if (arrVenta.length > 1) {
      if (arrVenta[1] == '00') {
        valorVenta = arrVenta[0];
      }
    }

    this.productos(producto).push(
      this.formBuilder.group({
        id: [producto.id, []],
        nombre: [producto.nombre, []],
        cod_barra: [producto.cod_barra, []],
        impuesto: [producto.impuesto, []],
        valor_compra_sin_iva: [valor_compra_sin_iva, []],
        iva: [iva, []],
        valor_compra: [valor, []],
        valor_venta: [valorVenta, []],
        valor_base: [valor, []],
        nombre_medida: [producto.nombre_medida, []],
        stock: [producto.stock, []],
        stock_min: [producto.stock_min, []],
        producto: [producto.producto, []],
        combinado: [producto.combinado, []],
        cantidad: [producto.cantidad, [Validators.required]],
        descuento: [, []],

        subtotal_s_imp: [0, []],
        descuento_s_imp: [0, []],

        tipo: ['', []],
        tipo_retencion_id: [null, []],
        por_retencion: [0, []],
        valor_retencion: [null, []],
      }),
    );
    //this.prds.insert(0, formProductoOrden);
  }

  getAgregarOrden(data) {
    var agregoProducto = JSON.parse(JSON.stringify(data));

    agregoProducto.cantidad = 1;

    let odrPrds = this.formProductos.value;

    const found = odrPrds.prds.find(
      (element) => element.id == agregoProducto.id,
    );

    if (!found) {
      this.addProductoForm(agregoProducto);
    } else {
      for (let i = 0; i < this.prds.controls.length; i++) {
        const element = this.prds.controls[i];

        if (element.get('id').value === found.id) {
          let vlrCantidad = +(element.get('cantidad')!.value + '').replaceAll(
            ',',
            '',
          );

          element.get('cantidad').setValue(vlrCantidad + 1);
          break;
        }
      }
    }
    this.total();
  }

  descuentoFormat(form, i) {
    if (form == 2) {
      this.productos(i)
        .get([i])
        .get('descuento')
        .reset(this.productos(i).get([i]).get('descuento').value.toFixed(1));
    }
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

  getPriceIva(producto) {
    return this.funcionesService.getPriceIva(producto);
  }

  calcularValorTotalConIva(valor, iva) {
    // Calcular el producto sin iva para obtener el total con iva 19%
    let valor_con_iva = valor * (1 + iva / 100);
    return valor_con_iva;
  }

  calcularIva(valor, iva) {
    // Calcular el producto sin iva para obtener el total con iva 19%
    let valor_con_iva = valor * (iva / 100);
    return valor_con_iva;
  }

  calcularValorTotalSinIva(valor, iva) {
    // Calculo el valor del producto sin incluir el iva 19%
    let valor_sin_iva = valor / (1 + iva / 100); // iva 19 / 100 = 0.19
    return valor_sin_iva;
  }

  updatePrecioCompraSinIvaValor() {
    // Modifico el valor que no tiene el iva
    let producto = this.formValor.value;

    let iva = this.getPriceIva(producto);

    let valor_compra = producto.valor_compra_sin_iva;

    //console.log(iva);

    if (iva != 0) {
      //console.log('log sin iva 19');

      valor_compra = this.calcularValorTotalConIva(
        producto.valor_compra_sin_iva,
        iva,
      );
    }

    this.formValor.get('valor_compra').setValue(valor_compra);

    // this.total();
  }

  formatearNumberNoDecimal(valor) {
    return this.funcionesService.formatNumberOnlyNoDecimal(valor);
  }

  valor_cantidad(event, item, i) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = val;
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      item.get('cantidad')!.setValue(val);
    } else {
      item.get('cantidad')!.setValue(val);
    }

    this.total();
  }

  valor_pagar(event, item, i) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = this.formatearNumber(val);
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      item.get('valor_compra')!.setValue(val);
    } else {
      item.get('valor_compra')!.setValue(this.formatearNumberNoDecimal(val));
    }

    this.updatePrecioCompraConIva(i);
  }

  valor_pagar_pagar(event, item, i) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = this.formatearNumber(val);
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      item.get('valor_venta')!.setValue(val);
    } else {
      item.get('valor_venta')!.setValue(this.formatearNumberNoDecimal(val));
    }
  }

  updatePrecioCompraConIva(i) {
    // Modifico el valor que tiene el iva
    let producto = this.prds.get([i]).value;

    let iva = this.getPriceIva(producto);

    let valor_compra = +(producto.valor_compra + '').replaceAll(',', '');

    if (iva != 0) {
      valor_compra = this.calcularValorTotalSinIva(valor_compra, iva);
    }
    //console.log(valor_compra);

    this.prds.get([i]).get('valor_compra_sin_iva').setValue(valor_compra);

    this.total();
  }

  updatePrecioCompraSinIva(i) {
    // Modifico el valor que no tiene el iva
    let producto = this.prds.get([i]).value;

    let iva = this.getPriceIva(producto);

    let valor_compra = producto.valor_compra_sin_iva;

    //console.log(iva);

    if (iva != 0) {
      //console.log('log sin iva 19');

      valor_compra = this.calcularValorTotalConIva(
        producto.valor_compra_sin_iva,
        iva,
      );
    }

    this.prds
      .get([i])
      .get('valor_compra')
      .setValue(this.formatearNumber(valor_compra));

    this.total();
  }

  ivaString = '';

  subTotal = 0;
  subTotalConImpuesto = 0;
  subTotalText = 0;
  descuento = 0;
  descuentoConImpuesto = 0;
  totalPagar = 0;
  totalPagarConPropina = 0;
  iva = 0;
  subtotalImpuesto = 0;

  total() {
    this.iva = 0;
    let f = this.formProductos.value.prds;
    let subTotal = 0;
    let subTotalConImpuesto = 0;
    let descuento = 0;
    let descuentoConImpuesto = 0;
    let subtotalImpuesto = 0;

    for (let i = 0; i < f.length; i++) {
      const element = f[i];
      let formSubTotal = 0;
      let formDescuento = 0;
      let formDescuentoConImpuesto = 0;
      let formSubtotalSinImpuesto = 0;
      /* Valido el numero que digitan en el descuento */
      this.validarNumero(element.descuento);

      if (element.descuento < 0 || element.descuento > 100) {
        this.formProductos.value.prds[i].descuento = '';
      }

      let vlrCompra = +(element.valor_compra + '').replaceAll(',', '');

      let vlrCantidad = (element.cantidad + '').replaceAll(',', '');

      let vlr_compra_sin_iva = 0;

      let iva = this.getPriceIva(element);

      let valor_compra_sin_iva_con_descuento = 0;

      if (iva != 0) {
        vlr_compra_sin_iva = this.calcularValorTotalSinIva(vlrCompra, iva);
      } else {
        vlr_compra_sin_iva = vlrCompra;
      }

      this.prds.get([i]).get('valor_base').reset(vlr_compra_sin_iva);

      valor_compra_sin_iva_con_descuento =
        vlr_compra_sin_iva -
        (vlr_compra_sin_iva * Number(element.descuento)) / 100;

      let vlr_iva_con_descuento =
        iva != 0
          ? this.calcularIva(valor_compra_sin_iva_con_descuento, iva)
          : 0;

      let valorImpuesto = vlr_compra_sin_iva > 0 ? vlr_compra_sin_iva : 0;

      formSubtotalSinImpuesto =
        Number(vlrCompra - valorImpuesto) * Number(element.cantidad);

      formSubTotal = Number(vlrCompra) * Number(vlrCantidad);

      this.prds
        .get([i])
        .get('subtotal_s_imp')
        .reset(formSubTotal - formSubtotalSinImpuesto);

      subTotal += formSubTotal - formSubtotalSinImpuesto;

      subTotalConImpuesto += formSubTotal;

      subtotalImpuesto += vlr_iva_con_descuento * element.cantidad;

      if (element.descuento > 0) {
        formDescuentoConImpuesto =
          (formSubTotal * Number(element.descuento)) / 100;

        formDescuento =
          (vlr_compra_sin_iva * element.cantidad * Number(element.descuento)) /
          100;

        this.prds.get([i]).get('descuento_s_imp').reset(formDescuento);

        descuento += formDescuento;

        descuentoConImpuesto += formDescuentoConImpuesto;
      } else {
        this.prds.get([i]).get('descuento_s_imp').reset(0);
      }
      this.iva += (+vlrCompra - element.valor_compra_sin_iva) * +vlrCantidad;
    }

    this.subTotalText = subTotal;

    let arrayIva = (this.iva + '').split('.');

    if (arrayIva.length > 1) {
      this.ivaString = this.formatearNumber(
        +(arrayIva[0] + '.' + arrayIva[1].substring(0, 2)),
      );
    } else {
      this.ivaString = this.formatearNumber(this.iva);
    }

    this.subTotal = subTotal;
    this.subTotalConImpuesto = subTotalConImpuesto;

    this.descuento = descuento;
    this.descuentoConImpuesto = descuentoConImpuesto;
    this.subtotalImpuesto = subtotalImpuesto;

    this.totalPagar = Number(subTotal + subtotalImpuesto - descuento);
    this.totalPagarConPropina = Number(subTotal + subtotalImpuesto - descuento);

    let sum = 0;

    for (let i = 0; i < f.length; i++) {
      const element = f[i];

      if (
        element.tipo_retencion_id != null &&
        element.tipo_retencion_id != '' &&
        element.tipo_retencion_id != 'null'
      ) {
        let subtotal = element.subtotal_s_imp - element.descuento_s_imp;
        let porcentaje = element.por_retencion;

        let total = subtotal * (porcentaje / 100);

        this.prds.get([i]).get('valor_retencion').setValue(total);
        sum += total;
      }
    }

    this.totalRetencion = sum;
  }

  /* Elimino Producto */
  deleteProducto(indice: any, item: any) {
    this.prds.removeAt(indice);
    this.total();
  }

  noPuedeQuitarProducto() {
    this.funcionService.onSuccess(
      'No tiene permiso para quitar el producto del pedido',
      'warning',
      '¡Espere!',
    );
  }

  /* Getiono modal para el pago de facturas */
  /* ######################################################################## */
  getBuscarCliente(event) {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      /* Hago la busqueda */
      if (event.target.value != '' && event.code != null) {
        this.clienteService
          .getBusquedaCliente(event.target.value)
          .subscribe((resp) => {
            this._dataCliente = resp.data;
          });
      }
    }, 360);
  }

  getBuscarClienteEnter(data) {
    /* Hago la busqueda con enter */
    this.clienteService.getBusquedaClienteDocumento(data).subscribe((resp) => {
      if (resp.data.length > 0) {
        this.actualizoInfoCliente(resp.data[0].documento, resp.data[0].nombre);
      } else {
        this.funcionService.onSuccess(
          'No se encontró cliente...',
          'error',
          'No Existe!',
        );
      }
    });
  }

  public guardarCliente(event): void {
    if (!isNaN(event.target.value)) {
      let find = this.dataCliente.find(
        (x) => x?.documento === event.target.value,
      );
      if (find?.documento != '' && find?.nombre != null) {
        this.actualizoInfoCliente(find?.documento, find?.nombre);
      }
    } else {
      let find = this.dataCliente.find((x) => x?.nombre === event.target.value);
      if (find?.documento != '' && find?.nombre != null) {
        this.actualizoInfoCliente(find?.documento, find?.nombre);
      }
    }
  }

  actualizoInfoCliente(documento: any, nombre: any) {
    this.formPago.controls.documento_cliente.setValue(documento);
    this.formPago.controls.nombre_cliente.setValue(nombre);
  }
  /* ################################################################## */

  public proccessEditEvent(id: string) {
    this.isPaymentVisible = false;
  }

  openModalPayment() {
    this.isPaymentVisible = true;
  }

  openModalRetencion(i) {
    //this.valorPagar = 0;
    this.staticModalRetencionProducto?.show();

    this.posItemSelectedToDiscount = i;

    let obj = this.productos(1).get([i]).value;
    this.productName = obj.nombre;

    let idActual = obj.tipo_retencion_id;
    if (idActual) {
      let subtotal_s_imp = +(obj.subtotal_s_imp + ''.replaceAll(',', ''));
      let descuento_s_imp = +(obj.descuento_s_imp + ''.replaceAll(',', ''));

      this.formTipoRetencion = this.formBuilder.group({
        id: [obj.id, [Validators.required]],
        pos: [i, []],
        subtotal: [
          subtotal_s_imp - descuento_s_imp,
          [Validators.required, Validators.min(0)],
        ],
        tipo: [obj.tipo, [Validators.required, Validators.min(1)]],
        tipo_retencion: [idActual, []],
        total_retencion: [obj.valor_retencion, []],
        porcentaje: [obj.por_retencion, []],
      });
    } else {
      let subtotal_s_imp = +(obj.subtotal_s_imp + ''.replaceAll(',', ''));
      let descuento_s_imp = +(obj.descuento_s_imp + ''.replaceAll(',', ''));

      this.formTipoRetencion = this.formBuilder.group({
        id: [obj.id, [Validators.required]],
        pos: [i, []],
        subtotal: [
          subtotal_s_imp - descuento_s_imp,
          [Validators.required, Validators.min(0)],
        ],
        tipo: ['', [Validators.required, Validators.min(1)]],
        tipo_retencion: [null, []],
        total_retencion: ['', []],
        porcentaje: ['', []],
      });
    }

    //this.totalInvoice();
  }

  changeRetencionValorForm(event) {
    let obj = this.formTipoRetencion.value;

    let i = obj.pos;

    if (obj.tipo_retencion == null || obj.tipo_retencion == 'null') {
      this.prds.get([i]).get('por_retencion').setValue(0);
      this.prds.get([i]).get('tipo_retencion_id').setValue(null);
      this.prds.get([i]).get('valor_retencion').setValue('');
      this.prds.get([i]).get('tipo').setValue('');

      this.formTipoRetencion.get('tipo').setValue('');
      this.formTipoRetencion.get('porcentaje').setValue('');
      this.formTipoRetencion.get('total_retencion').setValue('');
      return;
    }

    let subtotal = obj.subtotal;

    let tipoRet = this.tipoRetencion.find(
      (item) => item.id == +obj.tipo_retencion,
    );

    let porcentaje = +tipoRet.porcentaje;

    let total = subtotal * (porcentaje / 100);

    this.formTipoRetencion.get('tipo').setValue(tipoRet.tipo);
    this.formTipoRetencion.get('porcentaje').setValue(porcentaje);
    this.formTipoRetencion.get('total_retencion').setValue(total);

    this.prds.get([i]).get('tipo').setValue(tipoRet.tipo);
    this.prds.get([i]).get('por_retencion').setValue(porcentaje);
    this.prds.get([i]).get('tipo_retencion_id').setValue(+obj.tipo_retencion);
    this.prds.get([i]).get('valor_retencion').setValue(total);

    this.total();
  }

  changeInput(event) {
    console.log(event);

    if (!event) {
      let f = this.prds.value;
      for (let i = 0; i < f.length; i++) {
        this.prds.get([i]).get('por_retencion').setValue(0);
        this.prds.get([i]).get('tipo_retencion_id').setValue(null);
        this.prds.get([i]).get('valor_retencion').setValue('');
        this.prds.get([i]).get('tipo').setValue('');
      }
    }
    this.total();
  }
  cancelarProductosAgregados(clear = false) {
    if (clear) {
      this.removeCarrito(this.carritoId);
    } else {
      this.prds.clear();
      this.subTotal = 0;
      this.descuento = 0;
    }
  }

  openModalChangeTable() {
    this.isChangeTableVisible = true;
  }

  public proccessChangeEditEvent(id: string) {
    this.isChangeTableVisible = false;
  }

  pagar() {
    this.openModalPayment();
  }

  /* Gestion para hacer la asignación de los permisos de usuario */
  permisos() {
    let permisos = JSON.parse(atob(localStorage.getItem(btoa('permisos'))));
    /* Consulto para saber si tiene permiso de modificar el valor de venta */
    const valorVenta = permisos.find((element) => element.id === 9);
    if (valorVenta) {
      this.permisoValorVenta = true;
    }

    /* Consulto para saber si tiene permiso de modificar el porcentaje de descuento */
    const porDescuentoFind = permisos.find((element) => element.id === 10);
    if (porDescuentoFind) {
      this.permisoPorDescuento = true;
    }

    /* Consulto para saber si tiene permiso de eliminar pedido escogido */
    const quitarProductoFind = permisos.find((element) => element.id === 44);

    if (quitarProductoFind) {
      this.quitarProducto = false;
    }
  }

  itemSelected = -1;

  openModalValor(i) {
    this.itemSelected = i;

    let formValue = this.formProductos.get('prds').get([i]).value;
    this.formValor.patchValue({
      valor_compra: formValue.valor_compra,
      iva: formValue.iva,
      valor_compra_sin_iva: formValue.valor_compra_sin_iva,
      impuesto: formValue.impuesto,
    });

    this.staticModalValor?.show();
  }

  closeModalPropina() {
    this.staticModalValor?.hide();
  }

  guardarValorItem() {
    let obj = this.formValor.value;
    this.prds.get([this.itemSelected]).patchValue({
      valor_compra: obj.valor_compra,
      iva: obj.iva,
      valor_compra_sin_iva: obj.valor_compra_sin_iva,
    });
    this.total();

    this.staticModalValor?.hide();
  }

  loadCarrito() {
    this.compraService.indexCarrito().subscribe((resp) => {
      this.carritos = resp.data;
    });
  }

  closeModalRetencion() {
    this.staticModalRetencionProducto?.hide();
  }

  addEspera() {
    let productos = this.prds.value;
    for (let i = 0; i < productos.length; i++) {
      const valor_venta = (productos[i].valor_venta + '').replaceAll(',', '');
      const valor_compra = (productos[i].valor_compra + '').replaceAll(',', '');
      productos[i].valor_venta = valor_venta;
      productos[i].valor_compra = valor_compra;
    }

    this.compraService
      .postEspera(productos, this.carritoId)
      .subscribe((resp) => {
        this.cancelarProductosAgregados();
        this.carritoId = null;
        this.loadCarrito();
      });
  }

  removeCarrito(id: number) {
    Swal.fire({
      title: 'Borrar carrito',
      text: 'Desea limpiar los productos?',
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.compraService.deleteCarrito(id).subscribe((resp) => {
          if (this.carritoId === id) {
            this.cancelarProductosAgregados(false);
            this.carritoId = null;
          }
          this.loadCarrito();
        });
      }
    });
  }

  seleccionarCarrito(id) {
    this.carritoId = id;
    this.cancelarProductosAgregados();
    this.compraService.showCarritoDetalle(id).subscribe((resp) => {
      let data = resp.data;
      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        this.addProductoForm(item);
        this.total();
      }
    });
  }

  loadTipoRetencion() {
    this.tipoRetencionService.getTipoRetencionAll().subscribe((resp) => {
      this.tipoRetencion = resp.data;
      console.log(this.tipoRetencion);
    });
  }
}
