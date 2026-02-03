import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { ProductoService } from 'src/app/services/producto.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { ClienteService } from 'src/app/services/cliente.service';
import Swal from 'sweetalert2';
import { metodoPagos } from 'src/app/constants/selects';
import { FuncionService } from 'src/app/services/funcion.service';
import { VentaTiendaService } from 'src/app/services/venta-tienda.service';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { TipoRetencionService } from 'src/app/services/tipo_retencion.service';
import { AdicionesService } from 'src/app/services/adiciones.service';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-venta-tienda',
  templateUrl: './venta-tienda.component.html',
  styleUrls: ['./venta-tienda.component.scss'],
})
export class VentaTiendaComponent implements OnInit {
  @ViewChild('staticModalCambiar', { static: false })
  staticModalCambiar?: ModalDirective;

  @ViewChild('staticModalDescuentoGeneral', { static: false })
  staticModalDescuentoGeneral?: ModalDirective;

  @ViewChild('staticModalRetencionProducto', { static: false })
  staticModalRetencionProducto?: ModalDirective;

  @ViewChild('staticModalNota', { static: false })
  childModalNota?: ModalDirective;

  @ViewChild('staticModalValorVenta', { static: false })
  staticModalValorVenta?: ModalDirective;

  @ViewChild('staticModalCaracterizaciones', { static: false })
  childModaCaracterizaciones?: ModalDirective;

  @ViewChild('staticModalPropina', { static: false })
  staticModalPropina?: ModalDirective;

  search: FormGroup; //variable que controla el formulario para hacer busqueda
  formAperturaCaja: FormGroup; //variable que controla el formulario para hacer busqueda
  formProductos: FormGroup; //variable que controla el formulario
  formPago: FormGroup; //variable que controla el formulario
  formCambiarInfo: FormGroup; //variable que controla el formulario
  formDescuentoGeneral: FormGroup; //variable que controla el formulario
  formTipoRetencion: FormGroup; //variable que controla el formulario
  formValorVenta: FormGroup; //variable que controla el formulario
  formPropina: FormGroup; //variable que controla el formulario

  formNota: FormGroup; //variable que controla el formulario
  permisoValorVenta: boolean = false; //permiso para modificar el valor de venta
  permisoPorDescuento: boolean = false; //permiso para modificar el porcentaje de descuento
  quitarProducto: boolean = true; //permiso para eliminar un produdo del pedido
  factura = null;

  formCheckeds: FormGroup; //variable que controla el formulario
  formAdicionesCheckeds: FormGroup; //variable que controla el formulario
  formCaracterizacionImeiCheckeds: FormGroup; //variable que controla el formulario

  dataCategorias: any[] = [];
  dataProductosActivos: any[] = [];
  dataProductosActivosTemporal: any[] = []; ///aqui almaceno los productos que se cargan por primera vez para luego que dejen de hacer busqueda retornarlos
  dataMetodoPagos: any[] = metodoPagos;
  _dataCliente: any[] = [];
  _dataAdiciones: any[] = [];

  categoriaSeleccionada: number;

  zonaPrinciapl: number; //para almacenar la primera zona que se consulta para luego hacer la consulta de mesas
  usarDecimales: Number = 1;
  moneda: String = "$";
  timeClear: any;

  /* mesa id */
  pageView = 0;

  precio = 0;

  isPaymentVisible = false;

  isCotizaciontVisible = false;

  isChangeTableVisible = false;

  idTableSelected = null;

  productName = '';

  propina = 0;

  carritos = [];
  tipoRetencion = [];

  carritoId = null;

  posItemSelectedToDiscount = -1;

  /* variables promocion */
  colorValorVenta: string;

  productSelected = null; // Producto seleccinado para categorizaciones

  hasImpuestoBolsa = false;

  stockNegativo = false;

  showRetencion = false;

  valorBolsa = 0;

  totalRetencion = 0;

  @ViewChild('inputSearch', { static: false }) inputElement: ElementRef;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private categoriaProductoService: CategoriaProductoService,
    private productoService: ProductoService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private clienteService: ClienteService,
    private funcionService: FuncionService,
    private router: Router,
    private ventaTiendaService: VentaTiendaService,
    private cotizacionesService: CotizacionesService,
    private tipoRetencionService: TipoRetencionService,
    private adicionesService: AdicionesService,
    private monedaService: MonedaService,
    
  ) {}

  ngOnInit(): void {
    /* Consulto los permisos */
    setTimeout(() => {
      this.permisos();
    }, 2000);

    this.getSucural();

    this.getCategorias();

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
      nota: ['', []],
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
      cantidadBolsa: [0, []],
      totalBolsa: [0, []],
    });

    this.formPropina = this.formBuilder.group({
      valor_propina: ['', []],
    });

    this.formCheckeds = this.formBuilder.group({
      caracteristicas: this.formBuilder.array([]),
    });

    this.formAdicionesCheckeds = this.formBuilder.group({
      adiciones: this.formBuilder.array([]),
    });

    this.formCaracterizacionImeiCheckeds = this.formBuilder.group({
      caracterizacion_imei: this.formBuilder.array([]),
    });

    this.formCambiarInfo = this.formBuilder.group({
      id: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.min(0)]],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      isPorcentaje: [false, []],
      descuento: [null, [Validators.min(0), Validators.max(100)]],
      valorDescuento: [null, [Validators.min(0)]],
    });

     this.formDescuentoGeneral = this.formBuilder.group({
      id: ['', [Validators.required]],
      isPorcentaje: [false, []],
      descuento: [null, [Validators.min(0), Validators.max(100)]],
      valorDescuento: [null, [Validators.min(0)]],
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

    this.formValorVenta = this.formBuilder.group({
      id: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.min(0)]],
      valor_detal: ['', [Validators.required, Validators.min(1)]],
      valor_mayor: ['', [Validators.required, Validators.min(1)]],
    });

    this.formNota = this.formBuilder.group({
      mesa: ['', []],
      factura: ['', []],
    });

    if (sessionStorage.getItem('cotizacion')) {
      const cotizacion = parseInt(sessionStorage.getItem('cotizacion'), 10);

      if (!isNaN(cotizacion)) {
        this.infoCotizacion(cotizacion);

        // Limpia la variable del sessionStorage
        sessionStorage.removeItem('cotizacion');
      } else {
        console.error('El valor de cotizacion no es un ID válido.');
      }
    }
  }

  focusInput() {
    this.inputElement.nativeElement.focus();
  }

  /* Consulto información de sucursal */
  private getSucural(): void {
    let sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal'))))
    );

    this.hasImpuestoBolsa = sucursal.valor_bolsa > 0 ? true : false;
    this.stockNegativo = sucursal.stock_negativo == 0 ? true : false;
    this.showRetencion = sucursal.retencion;
    this.moneda = this.monedaService.obtenerSimbolo(sucursal.moneda);

    this.usarDecimales = sucursal.usar_decimales;
    this.valorBolsa = sucursal.valor_bolsa;

    if (!sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        this.stockNegativo = sucursal.stock_negativo == 0 ? true : false;
        this.showRetencion = sucursal.retencion;
        this.moneda =  this.monedaService.obtenerSimbolo(resp.data.moneda);
      });
    }
  }

  /* Consulto las adiciones */
  getAdiciones(producto_id) {
    this.adicionesService.getAdiciones(producto_id).subscribe((resp) => {
      this._dataAdiciones = resp.data;
      ///agrego adiciones en el caso que existan
      for (let element of this._dataAdiciones) {
        this.adiciones.push(
          this.formBuilder.group({
            insumo_id: element.insumo_id,
            nombre: element.nombre,
            cantidad: element.cantidad,
            valor_venta: element.valor_venta,
            cantidad_adicionar: 0,
            checked: false,
          })
        );
      }
      setTimeout(() => {
        this.childModaCaracterizaciones.show();
      });
    });
  }

  /* Consulto las categorias */
  getCategorias() {
    this.categoriaProductoService.getCategoriasAtivas().subscribe((resp) => {
      this.dataCategorias = resp.data;
      this.dataCategorias.unshift({
        id: null,
        nombre: 'TODOS',
        img: null,
      });
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

      this.focusInput();
    });
  }

  /* Productos por categoria */
  getProductosActivosPorCategoriasId(categoria_id: number) {
    this.categoriaSeleccionada = categoria_id;

    if (this.categoriaSeleccionada) {
      this.productoService
        .getProductosActivosPorCategoriasId(categoria_id)
        .subscribe((resp) => {
          this.dataProductosActivos = resp.data;

          /* Guardo los productos que se cargaron temporalmente */
          this.dataProductosActivosTemporal = this.dataProductosActivos;
        });
    } else {
      this.getCategorias();
    }
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
            this.search.controls.producto.value
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
            'No hay Coincidencias!'
          );
        } else {
          this.getAgregarOrden(resp.data[0]);
        }
      });
    this.search.controls.producto.setValue('');
  }

  formatearNumberNoDecimal(valor) {
    return this.funcionesService.formatNumberOnlyNoDecimal(valor);
  }

  mostrarAlertaMenorPrecio(item) {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      let producto = item.value;

      let valor_compra = +producto.valor_compra;
      let valor_venta = +(producto.valor_venta + '').replaceAll(',', '');

      if (valor_compra >= valor_venta) {
        this.funcionService.onSuccessBoton(
          '<b>' +
            producto.nombre +
            '</b> tiene valor de venta menor o igual al precio de compra.',
          'warning',
          '¡Advertencia!'
        );
      }
    }, 2000);
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

    this.mostrarAlertaMenorPrecio(item);
  }

  subTotalItem(item) {
    let vlr_venta = +item.get('valor_venta')!.value.replaceAll(',', '');

    return item.get('descuento')!.value != null &&
      item.get('descuento')!.value >= 0 &&
      item.get('descuento')!.value <= 100
      ? vlr_venta * item.get('cantidad')!.value -
          (vlr_venta *
            item.get('cantidad')!.value *
            item.get('descuento')!.value) /
            100
      : vlr_venta * item.get('cantidad')!.value;
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


  campoEsValidoFormDescuentoGeneral(campo: string) {
    return (
      this.formDescuentoGeneral.get(campo).errors &&
      this.formDescuentoGeneral.get(campo).touched
    );
  }

  /* ########################################################################## */
  /* Gestión para agregar el producto */
  get prds(): FormArray {
    return this.formProductos.get('prds') as FormArray;
  }

  get caracteristicas(): FormArray {
    return this.formCheckeds.get('caracteristicas') as FormArray;
  }

  get adiciones(): FormArray {
    return this.formAdicionesCheckeds.get('adiciones') as FormArray;
  }

  get caracterizacion_imei(): FormArray {
    return this.formCaracterizacionImeiCheckeds.get(
      'caracterizacion_imei'
    ) as FormArray;
  }

  get dataCliente() {
    return this._dataCliente;
  }

  productos(index: number): FormArray {
    return this.formProductos.get('prds') as FormArray;
  }

  /* Para agregar productos */
  addProductoForm(
    producto,
    caracteristicas,
    adiciones,
    caracterizacion_imei,
    isCarrito = false
  ) {
    ///hago el proceso para calcular el costo de la adición y sumarselo al valor de venta
    let valorAdicion = 0;
    if (adiciones.length > 0) {
      for (let i = 0; i < adiciones.length; i++) {
        const element = adiciones[i];
        let cantidad = +element.cantidad_adicionar || 0;
        let valor = +String(element.valor_venta).replaceAll(',', '') || 0;
        if (cantidad > 0) {
          valorAdicion += cantidad * valor;
        }
      }
    }

    let base = +String(producto.valor_venta).replaceAll(',', '') || 0;
    let valor = this.formatearNumber(base + valorAdicion);

    let arr = (valor + '').split('.');

    if (arr.length > 1) {
      if (arr[1] == '00') {
        valor = arr[0];
      }
    }

    let valor_original = (valor + '').replaceAll(',', '');
    if (isCarrito) {
      valor_original = producto.valor_venta_detal;
    }

    let valor_venta_mayor = producto.valor_venta_mayor;

    if (producto.promocion) {
      producto.por_des = producto.porcentaje_descuento;
    } else {
      producto.por_des = producto.por_des;
    }

    let descuento = producto.por_des ? +producto.por_des : 0;
    this.productos(producto).push(
      this.formBuilder.group({
        id: [producto.id, []],
        nombre: [producto.nombre, []],
        impuesto: [producto.impuesto, []],
        valor_compra: [producto.valor_compra, []],
        valor_venta: [valor, []],
        valor_base: [valor, []],
        valor_original: [valor_original, []],
        valor_venta_mayor: [+valor_venta_mayor, []],
        nombre_medida: [producto.nombre_medida, []],
        stock: [producto.stock, []],
        stock_min: [producto.stock_min, []],
        producto: [producto.producto, []],
        combinado: [producto.combinado, []],
        cantidad: [+producto.cantidad, [Validators.required]],
        descuento: [descuento, []],
        subtotal_s_imp: [0, []],
        descuento_s_imp: [0, []],

        tipo: ['', []],
        tipo_retencion_id: [null, []],
        por_retencion: [0, []],
        valor_retencion: [null, []],

        caracterizaciones: [caracteristicas, []],
        adiciones: [adiciones, []],
        inventario: [producto.inventario, []],
        caracterizacion_imei: [caracterizacion_imei, []],
      })
    );

    if (this.stockNegativo == false && producto.inventario == 1) {
      if (producto.stock < 1) {
        this.funcionService.onSuccess(
          'El stock no puede quedar en negativo',
          'warning',
          '¡Espere!'
        );
      }
    }
  }

  activeItem(i) {
    if (this.caracteristicas.get([i]).get('checked').value) {
      this.caracteristicas.get([i]).get('checked').reset(false);
    } else {
      if (this.productSelected.unico) {
        for (let j = 0; j < this.caracteristicas.controls.length; j++) {
          const element = this.caracteristicas.controls[j];
          this.caracteristicas.get([j]).get('checked').reset(false);
        }
      }

      this.caracteristicas
        .get([i])
        .get('checked')
        .reset(!this.caracteristicas.get([i]).get('checked').value);
    }
  }

  activeItemAdiciones(i: number) {
    const item = this.adiciones.get([i]);
    // marcar como checked
    item.get('checked').setValue(true);
    // obtener valor actual
    let current = item.get('cantidad_adicionar').value || 0;
    // incrementar en 1
    item.get('cantidad_adicionar').setValue(current + 1);
  }

  activeItemCaracterizacionImei(i) {
    if (this.caracterizacion_imei.get([i]).get('checked').value) {
      this.caracterizacion_imei.get([i]).get('checked').reset(false);
    } else {
      this.caracterizacion_imei
        .get([i])
        .get('checked')
        .reset(!this.caracterizacion_imei.get([i]).get('checked').value);
    }
  }

  deleteAdiciones(i) {
    this.adiciones.get([i]).get('checked').reset(false);
    this.adiciones.get([i]).get('cantidad_adicionar').setValue(0);
  }

  removeCaracterizacion(item, pos) {
    let data = [];
    let array = item.get('caracterizaciones').value;

    if (array.length > 1) {
      array.splice(pos, 1);

      data = array;
    }
    item.get('caracterizaciones').setValue(data);
  }

  removeCaracterizacionImei(item, pos) {
    let data = [];
    let array = item.get('caracterizacion_imei').value;

    if (array.length > 1) {
      array.splice(pos, 1);

      data = array;
    }
    item.get('caracterizacion_imei').setValue(data);
  }

  removeAdiciones(item, pos: number) {
    let data = [];
    let array = item.get('adiciones').value;

    if (array.length > 0) {
      // capturo el objeto antes de eliminarlo
      const eliminado = array[pos];
      // me aseguro  que existen las propiedades
      const valorAdicionado =
        (eliminado.valor_venta || 0) * (eliminado.cantidad_adicionar || 1);
      // obtener valor_venta desde el form
      let valorVenta = item.get('valor_venta').value || 0;
      // Me aseguro que sea string y limpiar
      valorVenta = valorVenta.toString().replace(/,/g, '');
      // Convertir a número con punto decimal
      valorVenta = parseFloat(valorVenta);
      let valor = valorVenta - valorAdicionado;
      // llamar a tu función con el valor recalculado
      this.valor_pagar(valor.toString(), item);
      // ahora sí elimino
      array.splice(pos, 1);
      data = array;
    }

    // actualizo el form con las adiciones restantes
    item.get('adiciones').setValue(data);
  }

  openAddProductoAOrden(data) {
    var agregoProducto = JSON.parse(JSON.stringify(data));

    if (
      agregoProducto.caracterizable ||
      agregoProducto.adicion == true ||
      agregoProducto.caracterizable_imei == true
    ) {
      this.productSelected = JSON.parse(JSON.stringify(data));
      this.caracteristicas.clear();
      this.adiciones.clear();

      this.caracterizacion_imei.clear();

      if (agregoProducto.caracterizable == true) {
        for (let i = 0; i < this.productSelected.caracterizacion.length; i++) {
          const element = this.productSelected.caracterizacion[i];
          const newCaracteristica = this.formBuilder.group({
            detalle: element.detalle,
            insumo_id: element.insumo_id,
            restar_inventario: element.restar_inventario,
            checked: false,
          });

          this.caracteristicas.push(newCaracteristica);
        }
      }
      if (agregoProducto.caracterizable_imei == true) {
        for (
          let i = 0;
          i < this.productSelected.caracterizacion_imei.length;
          i++
        ) {
          const element = this.productSelected.caracterizacion_imei[i];
          const newCaracteristica = this.formBuilder.group({
            detalle_imei: element.detalle_imei,
            checked: false,
          });

          this.caracterizacion_imei.push(newCaracteristica);
        }
      }

      this.openModalCaracterizaciones(agregoProducto);
    } else {
      this.getAgregarOrden(data);
    }
  }

  saveSelectedCaracteristicas() {
    let data = [];
    for (let i = 0; i < this.formCheckeds.value.caracteristicas.length; i++) {
      const element = this.formCheckeds.value.caracteristicas[i];
      if (element.checked) {
        data.push({
          detalle: element.detalle,
          insumo_id: element.insumo_id,
          restar_inventario: element.restar_inventario,
        });
      }
    }

    let dataAdiciones = this.formAdicionesCheckeds
      .get('adiciones')
      .value.filter((item) => item.checked);

    let dataCaracterizacionIme = this.formCaracterizacionImeiCheckeds
      .get('caracterizacion_imei')
      .value.filter((item) => item.checked);

    this.getAgregarOrden(
      this.productSelected,
      data,
      dataAdiciones,
      dataCaracterizacionIme
    );

    this.closeModalCaracterizaciones();
  }

  getAgregarOrden(
    data,
    caracterizaciones = [],
    adiciones = [],
    caracterizacion_imei = []
  ) {
    var agregoProducto = JSON.parse(JSON.stringify(data));

    agregoProducto.cantidad = 1;

    let odrPrds = this.formProductos.value;

    const found = odrPrds.prds.find((element) => {
      const v1 = +String(element.valor_venta).replaceAll(',', '');
      const v2 = +String(agregoProducto.valor_venta).replaceAll(',', '');
      return (
        element.id === agregoProducto.id &&
        v1 === v2 &&
        (element.descuento == 0 ||
          element.descuento == agregoProducto.porcentaje_descuento) &&
        JSON.stringify(element.caracterizaciones || []) ===
          JSON.stringify(caracterizaciones || []) &&
        JSON.stringify(element.caracterizacion_imei || []) ===
          JSON.stringify(caracterizacion_imei || []) &&
        JSON.stringify(element.adiciones || []) ===
          JSON.stringify(adiciones || [])
      );
    });

    if (!found) {
      this.addProductoForm(
        agregoProducto,
        caracterizaciones,
        adiciones,
        caracterizacion_imei
      );
    } else {
      for (let i = 0; i < this.prds.controls.length; i++) {
        const element = this.prds.controls[i];
        let val = +element.value.valor_venta.replaceAll(',', '');

        if (
          element.get('id').value === found.id &&
          val == +agregoProducto.valor_venta &&
          (element.value.descuento == 0 ||
            element.value.descuento == agregoProducto.porcentaje_descuento) &&
          JSON.stringify(element.value.caracterizaciones) ==
            JSON.stringify(caracterizaciones) &&
          JSON.stringify(element.value.caracterizacion_imei) ==
            JSON.stringify(caracterizacion_imei) &&
          JSON.stringify(element.value.adiciones) == JSON.stringify(adiciones)
        ) {
          element.get('cantidad').setValue(element.get('cantidad').value + 1);
          this.validateCantidad(element, i);
          break;
        }
      }
    }
    this.total();
  }

  descuentoFormatForm(isValue = false) {
    let obj = this.formCambiarInfo.value;

    if (obj.isPorcentaje) {
      this.toFixedOneDigit();
    }

    let valorDescuento;

    let vlr_venta = obj.valor.replaceAll(',', '');

    if (obj.isPorcentaje) {
      // Descuento por porcentaje
      valorDescuento = this.calculateDescuentoValor(
        +vlr_venta,
        +obj.descuento,
        +obj.cantidad
      );
      this.formCambiarInfo.get('valorDescuento').reset(valorDescuento);
    } else {
      // Descuento por valor
      valorDescuento = this.calculateDescuentoPorcentaje(
        +vlr_venta,
        +obj.valorDescuento,
        +obj.cantidad
      );

      if (isValue && +obj.valorDescuento > this.subTotalInvoice) {
        this.formCambiarInfo.get('valorDescuento').reset();
        this.formCambiarInfo.get('descuento').reset();
      } else {
        this.formCambiarInfo.get('descuento').reset(valorDescuento);
        this.toFixedOneDigit();
      }
    }

    this.productos(1)
      .get([this.posItemSelectedToDiscount])
      .get('descuento')
      .setValue(obj.descuento);
    this.total();

    this.totalInvoice();
  }

  toFixedOneDigit() {
    let value = this.formCambiarInfo.get('descuento').value;
    if (value == null) {
      // this.formCambiarInfo.get('descuento').reset(null);
    } else if (value < 0 || value > 100) {
      this.formCambiarInfo.get('descuento').reset(0);
    } else {
      var decPart = (value + '').split('.');
      if (decPart.length > 1) {
        let cont = decPart[1];
        if (cont.length > 7) {
          this.formCambiarInfo
            .get('descuento')
            .reset(this.formCambiarInfo.get('descuento').value?.toFixed(7));
        }
      }
    }
  }

  descuentoFormat(form, i) {
    if (form == 2) {
      this.productos(i)
        .get([i])
        .get('descuento')
        .reset(this.productos(i).get([i]).get('descuento').value.toFixed(7));
    }
  }

  saveNotes() {
    let data = this.formNota.value;

    if (data.mesa.trim() == '' && data.factura.trim() == '') {
      this.funcionService.onSuccess(
        'Debe enviar por lo menos una nota',
        'Error',
        '¡Espere!'
      );
      return;
    } else {
      this.formProductos.get('nota').setValue(data.factura);
      this.closeModalNota();
    }

    // TODO: Validar si hay un carrito activo
    if (this.carritoId) {
      // TODO: Enviar la nota al carrito
      console.log('Enviando nota al carrito:', this.carritoId, data);
      this.sageNotaCarrito(this.carritoId, data.factura);
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

  subTotal = 0;
  subTotalConImpuesto = 0;
  subTotalText = 0;
  descuento = 0;
  descuentoConImpuesto = 0;
  totalPagar = 0;
  totalPagarConPropina = 0;
  subtotalImpuesto = 0;
  total() {
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

      let vlr_venta = element.valor_venta.replaceAll(',', '');

      let vlr_venta_sin_iva = 0;

      let iva = this.getPriceIva(element);

      let valor_venta_sin_iva_con_descuento = 0;

      if (iva != 0) {
        vlr_venta_sin_iva = this.calcularValorTotalSinIva(vlr_venta, iva);
      } else {
        vlr_venta_sin_iva = vlr_venta;
      }

      this.prds.get([i]).get('valor_base').reset(vlr_venta_sin_iva);

      valor_venta_sin_iva_con_descuento =
        vlr_venta_sin_iva -
        (vlr_venta_sin_iva * Number(element.descuento)) / 100;

      let vlr_iva_con_descuento =
        iva != 0 ? this.calcularIva(valor_venta_sin_iva_con_descuento, iva) : 0;

      let valorImpuesto = vlr_venta_sin_iva > 0 ? vlr_venta_sin_iva : 0;

      formSubtotalSinImpuesto =
        Number(vlr_venta - valorImpuesto) * Number(element.cantidad);

      formSubTotal = Number(vlr_venta) * Number(element.cantidad);

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
          (vlr_venta_sin_iva * element.cantidad * Number(element.descuento)) /
          100;

        this.prds.get([i]).get('descuento_s_imp').reset(formDescuento);

        descuento += formDescuento;

        descuentoConImpuesto += formDescuentoConImpuesto;
      } else {
        this.prds.get([i]).get('descuento_s_imp').reset(0);
      }
    }

    this.subTotalText = subTotal;

    if (this.hasImpuestoBolsa && subTotal > 0) {
      subTotal =
        subTotal + this.valorBolsa * +this.formPago.get('cantidadBolsa').value;

      this.formPago
        .get('totalBolsa')
        .setValue(this.valorBolsa * +this.formPago.get('cantidadBolsa').value);
    } else {
      this.formPago.get('cantidadBolsa').setValue(0);
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

  // TODO: Corregir variables
  subTotalInvoice = 0;
  descuentoInvoice = 0;
  totalPagarInvoice = 0;
  totalInvoice() {
    this.subTotalInvoice = 0;
    this.descuentoInvoice = 0;
    this.totalPagarInvoice = 0;
    let element = this.formCambiarInfo.value;
    let descuentoInvoice = 0;

    let formSubTotalInvoice = 0;
    let formDescuentoInvoice = 0;
    /* Valido el numero que digitan en el descuento */
    this.validarNumero(element.descuento);

    let vlr_venta = element.valor.replaceAll(',', '');

    formSubTotalInvoice = Number(vlr_venta) * Number(element.cantidad);
    this.subTotalInvoice += formSubTotalInvoice;
    if (element.descuento > 0) {
      formDescuentoInvoice =
        (formSubTotalInvoice * Number(element.descuento)) / 100;
      descuentoInvoice += formDescuentoInvoice;
    }

    this.descuentoInvoice = descuentoInvoice;
    this.totalPagarInvoice = Number(this.subTotalInvoice - descuentoInvoice);
  }

  /* Elimino Producto */
  deleteProducto(indice: any, item: any) {
    this.prds.removeAt(indice);
    if (this.prds.length == 0) {
      this.decrementCounter();
    }
    this.total();
  }

  noPuedeQuitarProducto() {
    this.funcionService.onSuccess(
      'No tiene permiso para quitar el producto del pedido',
      'warning',
      '¡Espere!'
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
          'No Existe!'
        );
      }
    });
  }

  public guardarCliente(event): void {
    if (!isNaN(event.target.value)) {
      let find = this.dataCliente.find(
        (x) => x?.documento === event.target.value
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
  valorPagar: any = 0;

  openModalCaracterizaciones(agregoProducto) {
    if (agregoProducto.adicion == true) {
      this.getAdiciones(agregoProducto.id);
    } else {
      this.childModaCaracterizaciones.show();
    }
  }

  openModalPagar(i) {
    this.valorPagar = 0;
    this.staticModalCambiar?.show();

    this.posItemSelectedToDiscount = i;

    let obj = this.productos(1).get([i]).value;
    this.productName = obj.nombre;

    let vlr_venta = obj.valor_venta.replaceAll(',', '');

    let valorDescuento = this.calculateDescuentoValor(
      +vlr_venta,
      obj.descuento,
      obj.cantidad
    );

    this.formCambiarInfo = this.formBuilder.group({
      id: [obj.id, [Validators.required]],
      valor: [vlr_venta, [Validators.required, Validators.min(0)]],
      cantidad: [obj.cantidad, [Validators.required, Validators.min(1)]],
      isPorcentaje: [true, []],
      descuento: [obj.descuento, [Validators.min(0), Validators.max(100)]],
      valorDescuento: [valorDescuento, [Validators.min(0)]],
    });

    this.totalInvoice();
  }

  openModalRetencion(i) {
    this.valorPagar = 0;
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

    this.totalInvoice();
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
      (item) => item.id == +obj.tipo_retencion
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

  valorPagar2: any = 0;
  itemSelected = null;
  openModalValorVenta(i, item) {
    this.itemSelected = item;
    this.valorPagar2 = 0;
    this.staticModalValorVenta?.show();

    this.posItemSelectedToDiscount = i;

    let obj = this.productos(1).get([i]).value;
    this.productName = obj.nombre;

    let vlr_venta = obj.valor_venta.replaceAll(',', '');

    let valor_original = obj.valor_original;
    let vlr_venta_mayor = obj.valor_venta_mayor + ''.replaceAll(',', '');

    this.formValorVenta = this.formBuilder.group({
      id: [obj.id, [Validators.required]],
      valor: [vlr_venta, [Validators.required, Validators.min(0)]],
      valor_detal: [valor_original, [Validators.required, Validators.min(0)]],
      valor_mayor: [vlr_venta_mayor, [Validators.required, Validators.min(0)]],
    });

    this.totalInvoice();
  }

  establecerValorVenta(valor) {
    this.valor_pagar(valor, this.itemSelected);
    this.closeModalValorVenta();
  }

  calculateDescuentoValor(valorVenta, porcentajeDescuento, cantidad) {
    return (valorVenta * cantidad * porcentajeDescuento) / 100;
  }

  calculateDescuentoPorcentaje(valorVenta, valorDescuento, cantidad) {
    return (valorDescuento * 100) / (valorVenta * cantidad);
  }

  closeModalPagar() {
    this.staticModalCambiar?.hide();
  }

  closeModalRetencion() {
    this.staticModalRetencionProducto?.hide();
  }

  closeModalValorVenta() {
    this.staticModalValorVenta?.hide();
  }

  /* Modal para hacer una nota sobre la mesa */
  openModalNota(obj: {} = {}) {
    this.childModalNota?.show();
  }

  closeModalCaracterizaciones() {
    this.childModaCaracterizaciones?.hide();
  }

  closeModalNota() {
    this.childModalNota?.hide();
  }

  completarFactura(id) {
    this.router.navigate(['/vender/ventatienda/' + id + '/completar']);
  }

  public proccessEditEvent(id: string) {
    this.isPaymentVisible = false;
  }

  public proccessCotizacionEvent(id: string) {
    this.isCotizaciontVisible = false;
  }

  pagarCotizacion() {
    this.openModalCotizacion();
  }

  openModalPayment() {
    this.isPaymentVisible = true;
  }

  openModalCotizacion() {
    this.isCotizaciontVisible = true;
  }

  cancelarProductosAgregados(clear = false) {
    if (clear) {
      this.removeCarrito(this.carritoId);
    } else {
      this.prds.clear();
      this.subTotal = 0;
      this.descuento = 0;
      this.subTotalText = 0;
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

  seleccionarCarrito(id, nota = '') {
    this.carritoId = id;
    this.cancelarProductosAgregados();
    console.log('Seleccionando carrito con ID:', id);
    this.formNota.get('factura').setValue(nota);
    this.formProductos.get('nota').setValue(nota);
    this.ventaTiendaService.showCarritoDetalle(id).subscribe((resp) => {
      let data = resp.data;
      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        this.addProductoForm(item, [], [], [], true);
        this.total();
      }
    });
  }

  ///traer información de cotizacion
  infoCotizacion(cotizacion_id) {
    this.cancelarProductosAgregados();
    this.cotizacionesService
      .getDetalleCotizacion(cotizacion_id)
      .subscribe((resp) => {
        let data = resp.data;
        for (let index = 0; index < data.length; index++) {
          const item = data[index];
          this.addProductoForm(item, [], [], []);
          this.total();
        }
      });
  }

  addEspera() {
    let productos = this.prds.value;
    for (let i = 0; i < productos.length; i++) {
      const valor_venta = (productos[i].valor_venta + '').replaceAll(',', '');
      productos[i].valor_venta = valor_venta;
    }

    this.ventaTiendaService
      .postEspera(productos, this.carritoId)
      .subscribe((resp) => {
        this.cancelarProductosAgregados();
        this.carritoId = null;
        this.loadCarrito();

        this.formNota.get('factura').setValue('');
        this.formProductos.get('nota').setValue('');
      });
  }

  loadCarrito() {
    this.ventaTiendaService.indexCarrito().subscribe((resp) => {
      this.carritos = resp.data;
    });
  }

  loadTipoRetencion() {
    this.tipoRetencionService.getTipoRetencionAll().subscribe((resp) => {
      this.tipoRetencion = resp.data;
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
        this.ventaTiendaService.deleteCarrito(id).subscribe((resp) => {
          if (this.carritoId === id) {
            this.cancelarProductosAgregados(false);
            this.carritoId = null;
          }
          this.loadCarrito();
        });
      }
    });
  }

  sageNotaCarrito(id: number, nota: string) {
    this.ventaTiendaService.saveNotaCarrito(id, nota).subscribe(
      (resp) => {
        Swal.fire(
          '¡Éxito!',
          'La nota del carrito ha sido guardada.',
          'success'
        );
      },
      (error) => {
        Swal.fire(
          '¡Error!',
          'No se pudo guardar la nota del carrito.',
          'error'
        );
        console.error('Error saving carrito note:', error);
      }
    );

    this.loadCarrito();
  }

  changeAliasCarrito(id: number, alias: string) {
    Swal.fire({
      title: 'Cambiar Alias del Carrito',
      input: 'text',
      inputLabel: 'Introduce el nuevo alias para el carrito:',
      inputPlaceholder: 'Escribe el nuevo alias aquí...',
      inputValue: alias, // This line sets the default value of the input field
      showCancelButton: true,
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas escribir algo para el alias!';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevoAlias = result.value;
        this.ventaTiendaService.changeAlias(id, nuevoAlias).subscribe(
          (resp) => {
            this.loadCarrito();
            Swal.fire(
              '¡Éxito!',
              'El alias del carrito ha sido actualizado.',
              'success'
            );
          },
          (error) => {
            Swal.fire(
              '¡Error!',
              'No se pudo actualizar el alias del carrito.',
              'error'
            );
            console.error('Error updating carrito alias:', error);
          }
        );
      }
    });
  }

  /* Gestiono color promocion */
  promocion(promocion) {
    const padding = promocion ? '0px' : '10px';
    this.colorValorVenta =
      'cursor: pointer;border-top: solid #2c539e;padding-top:' + padding;

    return this.colorValorVenta;
  }

  paddingPromocion(promocion) {
    let margin = promocion ? '-17px' : '0px';
    return 'margin-top:' + margin;
  }

  decrementCounter() {
    if (this.subTotal > 0) {
      let cantidadBolsa = +this.formPago.get('cantidadBolsa').value;
      if (cantidadBolsa > 0) {
        cantidadBolsa = cantidadBolsa - 1;
        this.formPago.get('cantidadBolsa').setValue(cantidadBolsa);
      }
    } else {
      this.formPago.get('cantidadBolsa').setValue(0);
    }
    this.total();
  }

  incrementCounter() {
    if (this.subTotal > 0) {
      let cantidadBolsa = +this.formPago.get('cantidadBolsa').value;
      cantidadBolsa = cantidadBolsa + 1;
      this.formPago.get('cantidadBolsa').setValue(cantidadBolsa);
    } else {
      this.formPago.get('cantidadBolsa').setValue(0);
    }
    this.total();
  }

  validateCantidad(item, pos) {
    if (this.stockNegativo == false && item.get('inventario').value == 1) {
      let stock = item.get('stock').value;
      let cantidad = item.get('cantidad').value;

      if (cantidad > stock) {
        this.funcionService.onSuccess(
          'El stock no puede quedar en negativo',
          'warning',
          '¡Espere!'
        );

        if (stock < 1) {
          item.get('cantidad').reset(0);
        } else {
          item.get('cantidad').reset(1);
        }
      }
    }

    this.total();
  }

  subtotalFormOriginal = 0;
  openModalDescuentoGeneral() {
    this.staticModalDescuentoGeneral?.show();
    this.formDescuentoGeneral.reset();
    this.formDescuentoGeneral.get('isPorcentaje').setValue(true);
    this.subtotalFormOriginal = this.subTotalText;
  }

  closeModalDescuentoGeneral() {
    this.staticModalDescuentoGeneral?.hide();
  }

  calcularDescuento(isValue = false) {
    let obj = this.formDescuentoGeneral.value;

    if (obj.isPorcentaje) {
      this.toFixedOneDigit();
    }

    for (let i = 0; i < this.prds.controls.length; i++) {
      this.productos(1)
        .get([i])
        .get('descuento')
        .setValue(0);
    }

    let subtotalOriginal = this.subTotalText;

    let promedioPorProducto = 0;
    
    if (obj.isPorcentaje) {
      // Descuento por porcentaje
      if (obj.descuento == null) {
        promedioPorProducto = 0;
      } else {
        promedioPorProducto = +(obj.descuento+"").replaceAll(',', '');
      }
    } else {
      // Descuento por valor
      if (obj.valorDescuento == null) {
        promedioPorProducto = 0;
      } else {
        let valorDescuento = obj.valorDescuento.replaceAll(',', '');

      if (+valorDescuento > this.subtotalFormOriginal) {
        this.formDescuentoGeneral.get('valorDescuento').reset(0);
        this.formDescuentoGeneral.get('descuento').reset(0);
        valorDescuento = 0;
      }
      
      promedioPorProducto = (valorDescuento / subtotalOriginal) * 100;
      }
    }

    console.log('promedioPorProducto', promedioPorProducto);

    for (let i = 0; i < this.prds.controls.length; i++) {
      this.productos(1)
        .get([i])
        .get('descuento')
        .setValue(promedioPorProducto);
    }

    this.total();

    this.totalInvoice();
  }

  toFixedOneDigitFormDescuento() {
    let value = this.formDescuentoGeneral.get('descuento').value;
    if (value == null) {
      // this.formDescuentoGeneral.get('descuento').reset(null);
    } else if (value < 0 || value > 100) {
      this.formDescuentoGeneral.get('descuento').reset(0);
    } else {
      var decPart = (value + '').split('.');
      if (decPart.length > 1) {
        let cont = decPart[1];
        if (cont.length > 7) {
          this.formDescuentoGeneral
            .get('descuento')
            .reset(this.formDescuentoGeneral.get('descuento').value?.toFixed(7));
        }
      }
    }
  }
  
}
