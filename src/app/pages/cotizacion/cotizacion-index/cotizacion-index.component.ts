import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { metodoPagos } from 'src/app/constants/selects';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { FuncionService } from 'src/app/services/funcion.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MonedaService } from 'src/app/services/moneda.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { VentaRestauranteService } from 'src/app/services/venta-restaurante.service';

@Component({
  selector: 'app-cotizacion-index',
  templateUrl: './cotizacion-index.component.html',
  styleUrls: ['./cotizacion-index.component.scss'],
})
export class CotizacionIndexComponent implements OnInit {
  @ViewChild('staticModalCambiar', { static: false })
  staticModalCambiar?: ModalDirective;
  @ViewChild('staticModalNota', { static: false })
  childModalNota?: ModalDirective;

  @ViewChild('staticModalPropina', { static: false })
  staticModalPropina?: ModalDirective;

  search: FormGroup; //variable que controla el formulario para hacer busqueda
  formAperturaCaja: FormGroup; //variable que controla el formulario para hacer busqueda
  formProductoInInvoice: FormGroup; //variable que controla el formulario
  formProductos: FormGroup; //variable que controla el formulario
  formPago: FormGroup; //variable que controla el formulario
  formCambiarInfo: FormGroup; //variable que controla el formulario
  formPropina: FormGroup; //variable que controla el formulario

  formNota: FormGroup; //variable que controla el formulario
  permisoValorVenta: boolean = false; //permiso para modificar el valor de venta
  permisoPorDescuento: boolean = false; //permiso para modificar el porcentaje de descuento
  factura = null;

  dataCategorias: any[] = [];
  dataProductosActivos: any[] = [];
  dataProductosActivosTemporal: any[] = []; ///aqui almaceno los productos que se cargan por primera vez para luego que dejen de hacer busqueda retornarlos
  dataMetodoPagos: any[] = metodoPagos;
  _dataCliente: any[] = [];

  categoriaSeleccionada: number;

  zonaPrinciapl: number; //para almacenar la primera zona que se consulta para luego hacer la consulta de mesas
  usarDecimales: Number = 1;
  moneda: string = '$';
  timeClear: any;

  /* mesa id */
  pageView = 0;

  precio = 0;

  isPaymentVisible = false;

  isChangeTableVisible = false;

  idTableSelected = null;

  productName = '';

  propina = 0;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private categoriaProductoService: CategoriaProductoService,
    private productoService: ProductoService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private clienteService: ClienteService,
    private funcionService: FuncionService,
    private router: Router,
    private monedaService: MonedaService,
  ) {}

  ngOnInit(): void {
    /* Consulto los permisos */
    setTimeout(() => {
      this.permisos();
    }, 2000);

    /* Carga listado de zonas y mesas al iniciar el componente */
    this.formProductoInInvoice = this.formBuilder.group({
      prdsInvoice: this.formBuilder.array([]),
    });

    this.getSucural();

    this.getCategorias();

    /* Formulario de busqueda */
    this.search = this.formBuilder.group({
      producto: ['', []],
    });

    this.formAperturaCaja = this.formBuilder.group({
      inicio_caja: ['', [Validators.required]],
    });

    this.formProductos = this.formBuilder.group({
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

    this.formPropina = this.formBuilder.group({
      valor_propina: ['', []],
    });

    this.formCambiarInfo = this.formBuilder.group({
      id: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.min(0)]],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      descuento: [null, [Validators.min(0), Validators.max(100)]],
    });

    this.formNota = this.formBuilder.group({
      mesa: ['', []],
      factura: ['', []],
    });
  }

  /* Consulto información de sucursal */
  private getSucural(): void {
    let sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
    );

    this.usarDecimales = sucursal.usar_decimales;
    this.moneda = this.monedaService.obtenerSimbolo(sucursal.moneda);

    if (!sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        this.moneda = this.monedaService.obtenerSimbolo(resp.data.moneda);
      });
    }
  }

  /* Consulto las categorias */
  getCategorias() {
    this.categoriaProductoService.getCategoriasAtivas().subscribe((resp) => {
      this.dataCategorias = resp.data;
      this.pageView = 1;
      this.getProductosActivos();
    });
  }

  /* Consulto Productos activos */
  getProductosActivos() {
    this.productoService.getProductosActivos().subscribe((resp) => {
      this.dataProductosActivos = resp.data;

      /* Guardo los productos que se cargaron temporalmente */
      this.dataProductosActivosTemporal = this.dataProductosActivos;
    });
  }

  /* Productos por categoria */
  getProductosActivosPorCategoriasId(categoria_id: number) {
    this.categoriaSeleccionada = categoria_id;

    this.productoService
      .getProductosActivosPorCategoriasId(categoria_id)
      .subscribe((resp) => {
        this.dataProductosActivos = resp.data;

        /* Guardo los productos que se cargaron temporalmente */
        this.dataProductosActivosTemporal = this.dataProductosActivos;
      });
  }

  regresarMesas() {
    this.router.navigate(['/']);
  }

  /* Buscar producto */
  buscar_nombre() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      /* Hago la busqueda */
      if (this.search.controls.producto.value != '') {
        this.productoService
          .getBusquedaPorNombreProductosActivos(
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
      .busquedaPorCodBarraProductosActivas(data)
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

  subTotalItem(item) {
    let vlrCantidad = +(item.get('cantidad').value + '').replaceAll(',', '');
    let vlrVenta = +(item.get('valor_venta').value + '').replaceAll(',', '');

    return item.get('descuento')!.value != null &&
      item.get('descuento')!.value >= 0 &&
      item.get('descuento')!.value <= 100
      ? vlrVenta * vlrCantidad -
          (vlrVenta * vlrCantidad * item.get('descuento')!.value) / 100
      : vlrVenta * vlrCantidad;
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
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

  get prdsInvoice(): FormArray {
    return this.formProductoInInvoice.get('prdsInvoice') as FormArray;
  }

  get dataCliente() {
    return this._dataCliente;
  }

  productos(index: number): FormArray {
    return this.formProductos.get('prds') as FormArray;
  }

  productosInvoice(index: number): FormArray {
    return this.formProductoInInvoice.get('prdsInvoice') as FormArray;
  }

  /* Para agregar productos */
  addProductoForm(producto) {
    let valor = this.formatearNumber(producto.valor_venta);

    let arr = (valor + '').split('.');

    if (arr.length > 1) {
      if (arr[1] == '00') {
        valor = arr[0];
      }
    }

    this.productos(producto).push(
      this.formBuilder.group({
        id: [producto.id, []],
        nombre: [producto.nombre, []],
        impuesto: [producto.impuesto, []],
        valor_compra: [producto.valor_compra, []],
        valor_venta: [valor, []],
        nombre_medida: [producto.nombre_medida, []],
        stock: [producto.stock, []],
        stock_min: [producto.stock_min, []],
        producto: [producto.producto, []],
        combinado: [producto.combinado, []],
        cantidad: [producto.cantidad, [Validators.required]],
        descuento: [, []],
      }),
    );
    //this.prds.insert(0, formProductoOrden);
  }
  /* Para agregar productos */
  addProductoInvoiceForm(producto) {
    console.log(producto);

    this.productosInvoice(producto).push(
      this.formBuilder.group({
        id: [producto.id, []],
        nombre: [producto.nombre, []],
        valor_venta: [producto.valor_venta, []],
        cantidad: [producto.cantidad, [Validators.required]],
        descuento: [producto.por_des, []],
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

        let vlrCantidad = +(element.get('cantidad').value + '').replaceAll(
          ',',
          '',
        );

        if (element.get('id').value === found.id) {
          element
            .get('cantidad')
            .setValue(this.formatearNumber(+vlrCantidad + 1));
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
    } else {
      this.productosInvoice(i)
        .get([i])
        .get('descuento')
        .reset(
          this.productosInvoice(i).get([i]).get('descuento').value.toFixed(1),
        );
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

  formatearNumberNoDecimal(valor) {
    return this.funcionesService.formatNumberOnlyNoDecimal(valor);
  }

  valor_pagar(event, item) {
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

    this.total();
  }

  valor_cantidad(event, item) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = this.formatearNumber(val);
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      item.get('cantidad')!.setValue(val);
    } else {
      item.get('cantidad')!.setValue(this.formatearNumberNoDecimal(val));
    }

    this.total();
  }

  subTotal = 0;
  descuento = 0;
  totalPagar = 0;
  totalPagarConPropina = 0;
  total() {
    let f = this.formProductos.value.prds;
    let subTotal = 0;
    let descuento = 0;
    for (let i = 0; i < f.length; i++) {
      const element = f[i];
      let formSubTotal = 0;
      let formDescuento = 0;

      let vlrDescuento = +(element.descuento + '').replaceAll(',', '');

      /* Valido el numero que digitan en el descuento */
      this.validarNumero(vlrDescuento);

      if (vlrDescuento < 0 || vlrDescuento > 100) {
        this.formProductos.value.prds[i].descuento = '';
      }

      let vlrVenta = +(element.valor_venta + '').replaceAll(',', '');
      let vlrCantidad = +(element.cantidad + '').replaceAll(',', '');

      formSubTotal = Number(vlrVenta) * Number(vlrCantidad);
      subTotal += formSubTotal;
      if (vlrDescuento > 0) {
        formDescuento = (formSubTotal * Number(vlrDescuento)) / 100;
        descuento += formDescuento;
      }
    }
    this.subTotal = subTotal;
    this.descuento = descuento;
    this.totalPagar = Number(subTotal - descuento);
    this.totalPagarConPropina = Number(subTotal - descuento);
  }

  /* Elimino Producto */
  deleteProducto(indice: any, item: any) {
    this.prds.removeAt(indice);
    this.total();
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

  /* Modal para hacer una nota sobre la mesa */
  openModalNota(obj: {} = {}) {
    /* this.formPago.controls.metodo_pago.setValue(1);
    this.formPago.controls.porcentaje_propina.setValue('no'); */
    this.childModalNota?.show();
  }

  closeModalNota() {
    this.childModalNota?.hide();
  }

  public proccessEditEvent(id: string) {
    this.isPaymentVisible = false;
  }

  openModalPayment() {
    this.isPaymentVisible = true;
  }

  cancelarProductosAgregados() {
    this.prds.clear();
    this.subTotal = 0;
    this.descuento = 0;
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
  }
}
