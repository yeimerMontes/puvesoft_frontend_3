import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { VentaRestauranteService } from 'src/app/services/venta-restaurante.service';
import { ClienteService } from 'src/app/services/cliente.service';
import Swal from 'sweetalert2';
import { MesaService } from 'src/app/services/mesa.service';
import { metodoPagos } from 'src/app/constants/selects';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { FuncionService } from 'src/app/services/funcion.service';
import { AdicionesService } from 'src/app/services/adiciones.service';
import { Console } from 'console';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-venta-restaurante-bar-mesa',
  templateUrl: './venta-restaurante-bar-mesa.component.html',
  styleUrls: ['./venta-restaurante-bar-mesa.component.scss'],
})
export class VentaRestauranteBarMesaComponent implements OnInit {
  @ViewChild('staticModalCambiar', { static: false })
  staticModalCambiar?: ModalDirective;

  @ViewChild('staticModalDescuentoGeneral', { static: false })
  staticModalDescuentoGeneral?: ModalDirective;

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
  formProductoInInvoice: FormGroup; //variable que controla el formulario
  formProductos: FormGroup; //variable que controla el formulario
  formPago: FormGroup; //variable que controla el formulario
  formBolsas: FormGroup; //variable que controla el formulario
  formCambiarInfo: FormGroup; //variable que controla el formulario
  formDescuentoGeneral: FormGroup; //variable que controla el formulario
  formValorVenta: FormGroup; //variable que controla el formulario
  formPropina: FormGroup; //variable que controla el formulario
  popoverVisible = false;
  inputValue = '';

  formNota: FormGroup; //variable que controla el formulario
  permisoValorVenta: boolean = false; //permiso para modificar el valor de venta
  permisoPorDescuento: boolean = false; //permiso para modificar el porcentaje de descuento
  factura = null;

  formCheckeds: FormGroup; //variable que controla el formulario
  formAdicionesCheckeds: FormGroup; //variable que controla el formulario

  dataMesas: any[] = [];
  dataCategorias: any[] = [];
  dataProductosActivos: any[] = [];
  dataProductosActivosTemporal: any[] = []; ///aqui almaceno los productos que se cargan por primera vez para luego que dejen de hacer busqueda retornarlos
  dataMetodoPagos: any[] = metodoPagos;
  _dataCliente: any[] = [];
  _dataAdiciones: any[] = [];

  categoriaSeleccionada: number;

  mesaAtendida: String;

  zonaPrinciapl: number; //para almacenar la primera zona que se consulta para luego hacer la consulta de mesas
  usarDecimales: Number = 1;
  moneda: String = '$';
  timeClear: any;

  /* mesa id */
  mesa = null;
  extra: String;
  pageView = 0;

  precio = 0;

  isPaymentVisible = false;

  isChangeTableVisible = false;

  idTableSelected = null;

  productName = '';

  propina = 10;

  isDisabled = false;
  isDeleting = false;

  isReadOnly = false;
  simbolDescuento = '';

  posItemSelectedToDiscount = -1;

  propinaSucursal = 0;
  /* variables promocion */
  colorValorVenta: string;

  @ViewChild('inputSearch', { static: false }) inputElement: ElementRef;

  permisoBorrarPrefactura: boolean = false; //permiso para borrar la prefactura

  productSelected = null; // Producto seleccinado para categorizaciones

  hasImpuestoBolsa = false;
  stockNegativo = false;

  valorBolsa = 0;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private categoriaProductoService: CategoriaProductoService,
    private productoService: ProductoService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private ventaRestauranteService: VentaRestauranteService,
    private clienteService: ClienteService,
    private funcionService: FuncionService,
    private router: Router,
    private mesaService: MesaService,
    private activeRoute: ActivatedRoute,
    private adicionesService: AdicionesService,
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
      cantidadBolsa: [0, []],
      totalBolsa: [0, []],
    });

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
      isPorcentaje: [false, []],
      porcentaje: [0, []],
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

    this.formCheckeds = this.formBuilder.group({
      caracteristicas: this.formBuilder.array([]),
    });

    this.formAdicionesCheckeds = this.formBuilder.group({
      adiciones: this.formBuilder.array([]),
    });

    this.mesa = this.activeRoute.snapshot.paramMap.get('idMesa');

    this.mesaService.getMesaActivasById(this.mesa).subscribe(
      (resp) => {
        this.mesaAtendida = resp.data.nombre;
        this.factura = resp.data.factura;

        this.propina = this.factura?.propina;
        let porcentaje_propina = this.factura?.porcentaje_propina;

        if (this.factura) {
          if (porcentaje_propina) {
            // Viene propina con porcentaje

            this.formPropina.patchValue({
              isPorcentaje: true,
              porcentaje: porcentaje_propina,
              valor_propina: this.propina,
            });
          } else if (this.propina != null) {
            let porPropina = (this.propina / this.factura?.total) * 100;

            let porPropinaFixed = 0;
            if (porPropina !== 0) {
              porPropinaFixed =
                this.funcionesService.toFixPorcentaje(porPropina);
            }
            this.formPropina.patchValue({
              isPorcentaje: false,
              porcentaje: +porPropina,
              valor_propina: +this.propina,
            });
          }
        }

        if (resp.data.cod_factura) {
          this.extra = 'si';
        } else {
          this.extra = 'no';
        }

        this.precio = resp.data.total;

        for (let index = 0; index < this.factura?.detalle.length; index++) {
          const item = this.factura?.detalle[index];
          this.addProductoInvoiceForm(item);
        }
      },
      (error) => {},
    );

    this.getSucural();

    this.getCategorias();
  }

  /* Consulto información de sucursal */
  private getSucural(): void {
    let sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
    );

    this.hasImpuestoBolsa = sucursal.valor_bolsa > 0 ? true : false;
    this.stockNegativo = sucursal.stock_negativo == 0 ? true : false;

    this.valorBolsa = sucursal.valor_bolsa;

    this.usarDecimales = sucursal.usar_decimales;
    this.propinaSucursal = sucursal.propina;
    this.moneda = this.monedaService.obtenerSimbolo(sucursal.moneda);

    if (!sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        this.moneda = this.monedaService.obtenerSimbolo(resp.data.moneda);
        this.propinaSucursal = sucursal.propina;
        localStorage.setItem(btoa('sucursal'), btoa(JSON.stringify(sucursal)));
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
          }),
        );
      }
      setTimeout(() => {
        this.childModaCaracterizaciones.show();
      }, 800);
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

  getMesas() {
    this.mesaService.getMesasActivasPorZonas(this.mesa).subscribe((resp) => {
      this.dataMesas = resp.data;
      this.pageView = 1;
    });
  }

  getMesa() {
    let self = this;
    this.mesaService.getMesaActivasById(this.mesa).subscribe(
      (resp) => {
        this.factura = resp.data.factura;
        this.precio = resp.data.total;

        self.prdsInvoice.clear();
        for (let index = 0; index < this.factura?.detalle.length; index++) {
          const item = this.factura?.detalle[index];
          this.addProductoInvoiceForm(item);
        }

        if (!resp.data.cod_factura) {
          this.regresarMesas();
        }
      },
      (error) => {},
    );
  }

  focusInput() {
    this.inputElement.nativeElement.focus();
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

  getTable() {
    this.mesaService.getMesaActivasById(this.mesa).subscribe(
      (resp) => {
        this.factura = resp.data.factura;
      },
      (error) => {},
    );
  }

  regresarMesas() {
    this.router.navigate(['/vender/ventarestaurantebar']);
  }

  goCotizar() {
    this.router.navigate(['/cotizar']);
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
          this.openAddProductoAOrden(resp.data[0]);
        }
      });
    this.search.controls.producto.setValue('');
  }

  subtotalItem(item) {
    let vlr_venta = item.get('valor_venta')!.value.replaceAll(',', '');

    let val =
      item.get('descuento')!.value != null &&
      item.get('descuento')!.value >= 0 &&
      item.get('descuento')!.value <= 100
        ? vlr_venta * item.get('cantidad')!.value -
          (vlr_venta *
            item.get('cantidad')!.value *
            item.get('descuento')!.value) /
            100
        : vlr_venta * item.get('cantidad')!.value;

    if (this.funcionesService.countDecimalPoints(vlr_venta) === 0) {
      return this.formatearNumber(val);
    }

    return val;
  }

  formatearNumber(valor, usarDecimal = null) {
    let dec = this.usarDecimales;
    if (usarDecimal != null) {
      dec = usarDecimal;
    }
    return this.funcionesService.getFormatearNumero(valor, dec);
  }

  formatearNumberNoDecimal(valor) {
    return this.funcionesService.formatNumberOnlyNoDecimal(valor);
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
  addProductoForm(producto, caracteristicas, adiciones) {
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

    let valor_venta_mayor = producto.valor_venta_mayor;

    if (producto.promocion) {
      producto.por_des = producto.porcentaje_descuento;
    } else {
      producto.por_des = producto.por_des;
    }

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
        cantidad: [producto.cantidad, [Validators.required]],
        isPorcentaje: [true, []],
        descuento: [producto.por_des, []],
        subtotal_s_imp: [0, []],
        descuento_s_imp: [0, []],

        caracterizaciones: [caracteristicas, []],
        adiciones: [adiciones, []],
        inventario: [producto.inventario, []],
      }),
    );

    if (this.stockNegativo == false && producto.inventario == 1) {
      if (producto.stock < 1) {
        this.funcionService.onSuccess(
          'El stock no puede quedar en negativo',
          'warning',
          '¡Espere!',
        );
      }
    }

    //this.prds.insert(0, formProductoOrden);
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

  deleteAdiciones(i) {
    this.adiciones.get([i]).get('checked').reset(false);
    this.adiciones.get([i]).get('cantidad_adicionar').setValue(0);
  }

  validateCantidad(item, pos) {
    if (this.stockNegativo == false && item.get('inventario').value == 1) {
      let stock = item.get('stock').value;
      let cantidad = item.get('cantidad').value;

      if (cantidad > stock) {
        this.funcionService.onSuccess(
          'El stock no puede quedar en negativo',
          'warning',
          '¡Espere!',
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

  removeCaracterizacion(item, pos) {
    let data = [];
    let array = item.get('caracterizaciones').value;

    if (array.length > 1) {
      array.splice(pos, 1);

      data = array;
    }
    item.get('caracterizaciones').setValue(data);
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

  /* Para agregar productos */
  addProductoInvoiceForm(producto) {
    this.productosInvoice(producto).push(
      this.formBuilder.group({
        id: [producto.id, []],
        nombre: [producto.nombre, []],
        valor_venta: [producto.valor_venta, []],
        cantidad: [producto.cantidad, [Validators.required]],
        isPorcentaje: [true, []],
        descuento: [producto.por_des, []],
      }),
    );
    //this.prds.insert(0, formProductoOrden);
  }

  openAddProductoAOrden(data) {
    var agregoProducto = JSON.parse(JSON.stringify(data));

    if (agregoProducto.caracterizable || agregoProducto.adicion == true) {
      this.productSelected = JSON.parse(JSON.stringify(data));
      this.caracteristicas.clear();
      this.adiciones.clear();
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

    this.getAgregarOrden(this.productSelected, data, dataAdiciones);
    this.closeModalCaracterizaciones();
  }

  getAgregarOrden(data, caracterizaciones = [], adiciones = []) {
    var agregoProducto = JSON.parse(JSON.stringify(data));
    agregoProducto.cantidad = 1;

    let odrPrds = this.formProductos.value;

    const found = odrPrds.prds.find((element) => {
      let val = +element.valor_venta.replaceAll(',', '');

      let flag =
        element.id == agregoProducto.id &&
        val == +agregoProducto.valor_venta &&
        (element.descuento == null ||
          element.descuento == agregoProducto.porcentaje_descuento) &&
        JSON.stringify(element.caracterizaciones) ==
          JSON.stringify(caracterizaciones) &&
        JSON.stringify(element.adiciones) == JSON.stringify(adiciones);
      return flag;
    });

    if (!found) {
      this.addProductoForm(agregoProducto, caracterizaciones, adiciones);
    } else {
      for (let i = 0; i < this.prds.controls.length; i++) {
        const element = this.prds.controls[i];
        let val = +element.value.valor_venta.replaceAll(',', '');

        if (
          element.get('id').value === found.id &&
          val == +agregoProducto.valor_venta &&
          (element.value.descuento == null ||
            element.value.descuento == agregoProducto.porcentaje_descuento) &&
          JSON.stringify(element.value.caracterizaciones) ==
            JSON.stringify(caracterizaciones) &&
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

    if (obj.isPorcentaje) {
      // Descuento por porcentaje
      valorDescuento = this.calculateDescuentoValor(
        +obj.valor,
        +obj.descuento,
        +obj.cantidad,
      );
      this.formCambiarInfo.get('valorDescuento').reset(valorDescuento);
    } else {
      // Descuento por valor
      valorDescuento = this.calculateDescuentoPorcentaje(
        +obj.valor,
        +obj.valorDescuento,
        +obj.cantidad,
      );

      if (isValue && +obj.valorDescuento > this.subTotalInvoice) {
        this.formCambiarInfo.get('valorDescuento').reset();
        this.formCambiarInfo.get('descuento').reset();
      } else {
        this.formCambiarInfo.get('descuento').reset(valorDescuento);
        this.toFixedOneDigit();
      }
    }

    if (this.isReadOnly) {
      this.productos(1)
        .get([this.posItemSelectedToDiscount])
        .get('descuento')
        .setValue(obj.descuento);
      this.total();
    }

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

  calculatePropinaValor(porcentaje) {
    if (this.factura) {
      // Existe una factura - Se debe calcular con los productos facturados
      return this.factura?.total * (porcentaje / 100);
    } else {
      // No existe factura
      return this.subTotal * (porcentaje / 100);
    }
  }

  // Calcular propina
  propinaFormatForm() {
    let obj = this.formPropina.value;

    if (obj.isPorcentaje) {
      this.toFixedOneDigitPropina();
    }

    let valorDescuento = 0;

    if (obj.isPorcentaje) {
      // Descuento por porcentaje
      valorDescuento = this.calculatePropinaValor(obj.porcentaje);

      this.formPropina.get('valor_propina').reset(valorDescuento);
    } else {
      // Descuento por valor

      let valorPorcentaje = this.totalPagarInvoice / obj.porcentaje;

      this.formPropina.get('porcentaje').reset(valorPorcentaje);
    }

    this.totalInvoice();
  }

  // Formatear porcentaje de propina
  toFixedOneDigitPropina() {
    let value = this.formPropina.get('porcentaje').value;
    if (value == null) {
    } else if (value < 0 || value > 100) {
      this.formPropina.get('porcentaje').reset(0);
    } else {
      var decPart = (value + '').split('.');
      if (decPart.length > 1) {
        let cont = decPart[1];
        if (cont.length > 7) {
          this.formPropina
            .get('porcentaje')
            .reset(this.formPropina.get('porcentaje').value?.toFixed(7));
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
    } else {
      this.productosInvoice(i)
        .get([i])
        .get('descuento')
        .reset(
          this.productosInvoice(i).get([i]).get('descuento').value.toFixed(7),
        );
    }
  }

  saveNotes() {
    let data = this.formNota.value;

    if (data.mesa.trim() == '' && data.factura.trim() == '') {
      this.funcionService.onSuccess(
        'Debe enviar por lo menos una nota',
        'Error',
        '¡Espere!',
      );
      return;
    } else {
      this.updateNotas(data);
      this.closeModalNota();
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
          '¡Advertencia!',
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
      }
    }

    // FACTURA VENTA

    // TODO: Nueva variable para Subtotal + impuestos  SIGUE IGUAL

    // TODO: Nueva variable para para guardar el descuento actual, de igual forma seguir mandando al antiguo

    // FACTURA VENTA DETALLE

    // Valor base

    // subtotal sin impuesto

    // descuento sin impuesto

    this.subTotal = subTotal;
    this.subTotalConImpuesto = subTotalConImpuesto;

    this.descuento = descuento;
    this.descuentoConImpuesto = descuentoConImpuesto;

    this.totalPagar = Number(subTotal - descuento);
    this.totalPagarConPropina = Number(subTotal - descuento);

    this.subtotalImpuesto = subtotalImpuesto;

    // totalPagar = subtotal - descuento + impuesto
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

    formSubTotalInvoice = Number(element.valor) * Number(element.cantidad);
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
  deleteProducto(indice: any) {
    this.prds.removeAt(indice);
    this.total();
  }

  removeProccesedProduct(invoiceDetail) {
    let item = invoiceDetail.value;
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás  ' + item.nombre + ' de la venta',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      this.isDisabled = true;
      this.isDeleting = true;
      if (result.isConfirmed) {
        this.ventaRestauranteService
          .deleteProduct(this.factura.id, item.id)
          .subscribe((resp) => {
            this.getMesa();
            this.isDisabled = false;
            this.isDeleting = false;
          });
      } else {
        this.isDisabled = false;
      }
    });
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
  valorPagar: any = 0;

  openModalCaracterizaciones(agregoProducto) {
    if (agregoProducto.adicion == true) {
      this.getAdiciones(agregoProducto.id);
    } else {
      this.childModaCaracterizaciones.show();
    }
  }

  openModalPagar(i, isFacturado = true) {
    this.valorPagar = 0;
    this.staticModalCambiar?.show();

    this.isReadOnly = true;

    this.posItemSelectedToDiscount = i;

    let obj;
    if (isFacturado) {
      this.isReadOnly = false;
      obj = this.productosInvoice(1).get([i]).value;
    } else {
      obj = this.productos(1).get([i]).value;
    }

    this.productName = obj.nombre;

    let vlrValor_venta = +(obj.valor_venta + '').replaceAll(',', '');
    let vlrDescuento = +(obj.descuento + '').replaceAll(',', '');

    let valorDescuento = this.calculateDescuentoValor(
      vlrValor_venta,
      vlrDescuento,
      obj.cantidad,
    );

    this.formCambiarInfo = this.formBuilder.group({
      id: [obj.id, [Validators.required]],
      valor: [vlrValor_venta, [Validators.required, Validators.min(0)]],
      cantidad: [obj.cantidad, [Validators.required, Validators.min(1)]],
      isPorcentaje: [true, []],
      descuento: [vlrDescuento, [Validators.min(0), Validators.max(100)]],
      valorDescuento: [valorDescuento, [Validators.min(0)]],
    });

    this.totalInvoice();
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

  closeModalValorVenta() {
    this.staticModalValorVenta?.hide();
  }

  updateChangesProduct() {
    if (this.formCambiarInfo.invalid) {
      this.funcionService.onSuccess(
        'Uno o más campos tiene error',
        'error',
        'Revisar campos',
      );
    } else {
      this.ventaRestauranteService
        .updateInvoice(this.mesa, this.factura.id, {
          prdsInvoice: [this.formCambiarInfo.value],
        })
        .subscribe(
          (resp) => {
            this.getMesa();
            this.closeModalPagar();
          },
          (error) => {},
        );
    }
  }

  /* Modal para hacer una nota sobre la mesa */
  openModalNota(obj: {} = {}) {
    /* this.formPago.controls.metodo_pago.setValue(1);
    this.formPago.controls.porcentaje_propina.setValue('no'); */
    this.childModalNota?.show();
  }

  closeModalNota() {
    this.childModalNota?.hide();
  }

  closeModalCaracterizaciones() {
    this.childModaCaracterizaciones?.hide();
  }

  /* Formateo el efectivo */
  formatearEfectivo() {
    this.valorPagar = this.formatearNumber(
      this.formPago.controls.valor_pagar.value,
    );
  }

  completarFactura(id) {
    this.router.navigate(['/vender/ventarestaurantebar/' + id + '/completar']);
  }

  /* Para ir guardando el pedido de la mesa en la BD */
  facturar() {
    if (this.subTotal > 0 && this.mesa != null) {
      this.isDisabled = true;

      let subTotalLocal = this.formatearNumber(this.subTotalConImpuesto);
      let descuentoLocal = this.formatearNumber(this.descuentoConImpuesto);

      let valorSubtotal = subTotalLocal.replaceAll(',', '');
      let valorSDescuento = descuentoLocal.replaceAll(',', '');

      let form = this.formProductos.value;

      for (let i = 0; i < form.prds.length; i++) {
        form.prds[i].valor_venta = form.prds[i].valor_venta.replaceAll(',', '');
      }

      let productosArray = JSON.parse(JSON.stringify(this.prds.value));

      let newArreglo = [];

      for (let i = 0; i < productosArray.length; i++) {
        const elementContainer = productosArray[i];

        const found = newArreglo.findIndex((element) => {
          let flag =
            element.id == elementContainer.id &&
            element.valor_venta == elementContainer.valor_venta &&
            element.descuento == elementContainer.descuento &&
            JSON.stringify(element.caracterizaciones) ==
              JSON.stringify(elementContainer.caracterizaciones);

          return flag;
        });

        if (found != -1) {
          newArreglo[found].cantidad =
            elementContainer.cantidad + newArreglo[found].cantidad;
        } else {
          newArreglo.push(JSON.parse(JSON.stringify(elementContainer)));
        }
      }

      form.prds = newArreglo;

      this.ventaRestauranteService
        .addVenta(
          form,
          valorSubtotal,
          valorSDescuento,
          this.subTotal,
          this.descuento,
          this.mesa,
          this.extra,
          this.factura?.id,
        )
        .subscribe(
          (resp) => {
            if (resp.code == '202') {
              this.funcionService.onSuccess(
                resp.message,
                'error',
                'Ya Existe!',
              );
            } else {
              // this.getTable();
              // this.prds.reset();
              this.completarFactura(resp.data.idFactua);
            }
          },
          (err) => {
            this.isDisabled = false;

            this.funcionService.onSuccess(
              err.error.message,
              'error',
              'Error al facturar los productos!',
            );
          },
        );
    } else {
    }
  }

  public proccessEditEvent(id: string) {
    this.isPaymentVisible = false;
  }

  openModalPayment() {
    this.idTableSelected = this.mesa;
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

  guardarBolsas() {}

  updateNotas(data) {
    this.mesaService.postNotas(this.mesa, data).subscribe(
      (resp) => {
        this.propina = resp;
        this.funcionService.onSuccess(resp.message, 'success', 'OK');
      },
      (err) => {
        this.funcionService.onSuccess(
          err.error.message,
          'error',
          'Error al guardar las notas!',
        );
      },
    );
  }

  updatePropina() {
    this.ventaRestauranteService
      .postPropina(this.mesa, this.factura?.id, this.formPropina.value)
      .subscribe(
        (resp) => {
          this.propina = resp;
          this.funcionService.onSuccess(
            'Se agregó el Serv. Voluntario con éxito',
            'success',
            'OK',
          );
          this.closeModalPropina();
        },
        (err) => {
          this.funcionService.onSuccess(
            err.error.message,
            'error',
            'Error al guardar el Serv. Voluntario!',
          );
        },
      );
  }

  // Solo se muestra si existe una factura
  openModalPropina() {
    if (!this.propina) {
      let valor = this.calculatePropinaValor(this.propinaSucursal);

      this.formPropina.patchValue({
        isPorcentaje: true,
        porcentaje: this.propinaSucursal,
        valor_propina: valor,
      });
    } else {
      this.formPropina.controls['valor_propina'].reset(this.propina);
      let porPropina = (this.propina / this.factura?.total) * 100;

      let porPropinaFixed = this.funcionesService.toFixPorcentaje(porPropina);
      this.formPropina.controls['porcentaje'].reset(porPropinaFixed);
    }

    this.staticModalPropina?.show();
  }

  closeModalPropina() {
    this.staticModalPropina?.hide();
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

    /* Consulto para saber si tiene permiso de borrar productos de la mesa */
    const contain = permisos.find((element) => element.id === 44);
    if (contain) {
      this.permisoBorrarPrefactura = true;
    }
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
    if (this.factura?.subtotal > 0) {
      let cantidadBolsa =
        +this.formProductoInInvoice.get('cantidadBolsa').value;
      if (cantidadBolsa > 0) {
        cantidadBolsa = cantidadBolsa - 1;
        this.formProductoInInvoice.get('cantidadBolsa').setValue(cantidadBolsa);
      }
    } else {
      this.formProductoInInvoice.get('cantidadBolsa').setValue(0);
    }
    this.total();
  }

  incrementCounter() {
    if (this.factura?.subtotal > 0) {
      let cantidadBolsa =
        +this.formProductoInInvoice.get('cantidadBolsa').value;
      cantidadBolsa = cantidadBolsa + 1;
      this.formProductoInInvoice.get('cantidadBolsa').setValue(cantidadBolsa);
    } else {
      this.formProductoInInvoice.get('cantidadBolsa').setValue(0);
    }
    this.total();
  }

  subtotalFormOriginal = 0;
  openModalDescuentoGeneral() {
    this.staticModalDescuentoGeneral?.show();
    this.formDescuentoGeneral.reset();
    this.formDescuentoGeneral.get('isPorcentaje').setValue(true);
    this.subtotalFormOriginal = this.subTotal;
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
      this.productos(1).get([i]).get('descuento').setValue(0);
    }

    let subtotalOriginal = this.subTotal;

    let promedioPorProducto = 0;

    if (obj.isPorcentaje) {
      // Descuento por porcentaje
      if (obj.descuento == null) {
        promedioPorProducto = 0;
      } else {
        promedioPorProducto = +(obj.descuento + '').replaceAll(',', '');
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
      this.productos(1).get([i]).get('descuento').setValue(promedioPorProducto);
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
            .reset(
              this.formDescuentoGeneral.get('descuento').value?.toFixed(7),
            );
        }
      }
    }
  }
}
