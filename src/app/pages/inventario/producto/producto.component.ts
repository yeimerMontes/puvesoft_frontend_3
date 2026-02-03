import { Router } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { selectsPagination } from 'src/app/constants/selects';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { InsumoService } from 'src/app/services/insumo.service';
import { ImpuestoService } from 'src/app/services/impuesto.service';
import { UnidadmedidaService } from 'src/app/services/unidad-medida.service';
import { tiposProducto } from 'src/app/interface/typeProduct';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersProducto } from 'src/app/constants/producto';
import { BodegaService } from 'src/app/services/bodega.service';
import * as JsBarcode from 'jsbarcode';
import { AdicionesService } from 'src/app/services/adiciones.service';


@Component({
  selector: 'app-second',
  templateUrl: './producto.component.html',
  styleUrls: ['../../../css/modulo.css', './producto.component.scss'],
})
export class ProductoComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModalInsumo', { static: false })
  childModalInsumo?: ModalDirective;
  @ViewChild('staticModalAdicion', { static: false })
  childModalAdicion?: ModalDirective;
  @ViewChild('barcode', { static: false })
  barcodeElement!: ElementRef<SVGSVGElement>;

  @ViewChild('staticModalCaracterizacion', { static: false })
  staticModalCaracterizacion?: ModalDirective;

  @ViewChild('staticModalImportar', { static: false })
  childModalImportar?: ModalDirective;

  @ViewChild('staticModalActualizarPrecios', { static: false })
  childModalActualizarPrecios?: ModalDirective;

  titleModule: string = 'Listado de productos';
  headers: headersMasterInterface[] = headersProducto;

  habilitar: string;
  habilitarInsumos: string = 'display:none;';
  habilitarProductos: string;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  sucursal: any;

  formInsumo: FormGroup; //variable que controla el formulario
  formAdicion: FormGroup; //variable que controla el formulario
  searchInsumo: FormGroup; //variable que controla el formulario
  formCategoria: FormGroup;
  sizeInsumo: FormGroup;
  formSubirArchivo: FormGroup;
  formSubirArchivo_update: FormGroup;
  files: any;
  files_update: any;
  bodegaForm: FormGroup;

  formCaracteristicas: FormGroup;

  /* Variables multiselect */
  selectedItemsImpuesto = [];
  dropdownSettings: IDropdownSettings;

  private _impuestos: any[] = [];
  private _dataPdf: any[] = [];
  private _dataInsumos: any[] = [];
  private _dataInsumosTodos: any[] = [];
  private _dataInsumoCombo: any[] = [];
  private _dataAdiciones: any[] = [];
  private _categorias: any[] = [];
  private _unidadMedidas: any[] = [];
  private _dataBodega: any[] = [];

  tiposProducto: tiposProducto[] = [
    { id: null, name: 'Todos' },
    { id: 1, name: 'Producto' },
    { id: 2, name: 'Insumo' },
    { id: 3, name: 'Receta, servicio o combo' },
  ];
  typeProduct: number;
  store: number = 0;

  private _idEdit = 0;

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nueva Producto';
  action1 = 'Agregar';

  lockbutton: boolean = false;
  lockbuttonImportarExcel: boolean = false;
  lockbuttonImportarExcelPrecios: boolean = false;

  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;
  loadedInsumo: boolean;

  pageInsumo = 1;
  totalInsumo = 0;

  page = 1;
  pages: number;
  totalItems: number;
  total = 0;

  prevTemplate;

  usarDecimales: Number = 1;
  titleInsumo: String;
  medida: String;
  total_preparacion: String;
  imagenProducto: string;
  habilitar1: any;
  habilitar2 = 'display:none;';
  habilitar3: any;
  nombre_archivo: any;

  habilitar1_update: any;
  habilitar2_update = 'display:none;';
  habilitar3_update: any;
  nombre_archivo_update: any;
  disabled_stock: boolean = false;

  last_page: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private productoService: ProductoService,
    private sucursalService: SucursalService,
    private insumosService: InsumoService,
    private funcionesService: FuncionesService,
    private impuestoService: ImpuestoService,
    private unidadMedidaService: UnidadmedidaService,
    private categoriaProductoService: CategoriaProductoService,
    private exportarExcelService: ExportarExcelService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private bodegaService: BodegaService,
    private adicionesService: AdicionesService,
  ) {}

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

  ngOnInit() {
    this.formCategoria = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      img: ['', []],
      estado: ['', [Validators.required]],
    });
    //Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', []],
      cod_barra: ['', []],
      categoria: ['', [Validators.required]],
      manejo_inventario: ['', [Validators.required]],
      img: ['', []],
      medida: ['', []],
      stock: ['', []],
      stock_minimo: ['', []],
      impuesto: [''],
      fecha_vencimiento: [''],
      valor_compra: ['', []],
      producto: ['', []],
      insumo: ['', []],
      combinado: ['', []],
      valor_venta: ['', [Validators.required]],
      valor_venta_mayor: ['', []],
      estado: ['', [Validators.required]],

      caracterizable: [false, []],
      unico: [null, []],
      productoId: ['', []],
      detalle: ['', []],
      insumo_id: [null],
      restar_inventario: [null],
      caracteristicas: this.formBuilder.array([]),
      detalle_imei: ['', []],

      caracterizable_imei: [false, []],
      caracteristicas_imei: this.formBuilder.array([]),

      bodegas: [null, []],
    });

    this.formInsumo = this.formBuilder.group({
      producto: ['', [Validators.required]],
      insumo: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      valor_compra: ['', [Validators.required]],
    });

    this.formAdicion = this.formBuilder.group({
      producto: ['', [Validators.required]],
      insumo: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      valor_venta: ['', [Validators.required]],
    });

    this.bodegaForm = this.formBuilder.group({
      bodegas: this.formBuilder.array([]),
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });
    this.searchInsumo = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });
    this.sizeInsumo = this.formBuilder.group({
      data: [10, []],
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'nombre',
      itemsShowLimit: 2,
      allowSearchFilter: false,
      //limitSelection: 1
    };

    this.getBodegas();
    this.createForm();
    this.createForm2();
    this.getSucural();
    this.getProductos(1);
    this.getInsumosTodos(1);
  }

  generarCodigo(valor: string) {
    if (this.barcodeElement?.nativeElement) {
      (JsBarcode as any)(this.barcodeElement.nativeElement, valor || '', {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 60,
        displayValue: true,
      });
    } else {
      console.error('⚠️ No se encontró el elemento SVG');
    }
  }

  onItemSelect(item: any) {
    this.applyValidation();
  }

  onItemDeselect(item: any) {
    this.applyValidation();
  }

  applyValidation() {
    const selectedImpuestos = this.form.get('impuesto')?.value || [];

    // Si "Ninguno (Excluido)" o "No Gravado" están seleccionados
    const excludeIds = [1, 100];
    const hasExclusion = selectedImpuestos.some((item: any) =>
      excludeIds.includes(item.id),
    );
    if (hasExclusion) {
      const exclusion = selectedImpuestos.find((item: any) =>
        excludeIds.includes(item.id),
      );
      this.form.patchValue({ impuesto: [exclusion] }); // Mantener solo "Ninguno" o "No Gravado"
      return;
    }

    // Si hay más de un IVA seleccionado, mantener solo el último
    const ivaIds = [2, 3, 4, 5];
    const selectedIvas = selectedImpuestos.filter((item: any) =>
      ivaIds.includes(item.id),
    );
    if (selectedIvas.length > 1) {
      const lastIva = selectedIvas[selectedIvas.length - 1]; // Obtener el último IVA seleccionado
      const otherImpuestos = selectedImpuestos.filter(
        (item: any) => !ivaIds.includes(item.id),
      );
      this.form.patchValue({ impuesto: [...otherImpuestos, lastIva] });
    }
  }

  createForm() {
    this.formSubirArchivo = this.formBuilder.group({
      archivo: [null, Validators.required],
    });
  }
  get f() {
    return this.formSubirArchivo.controls;
  }

  createForm2() {
    this.formSubirArchivo_update = this.formBuilder.group({
      archivo: [null, Validators.required],
    });
  }
  get f2() {
    return this.formSubirArchivo_update.controls;
  }

  get caracterizaciones(): FormArray {
    return this.form.get('caracteristicas') as FormArray;
  }

  get caracteristicas_imei(): FormArray {
    return this.form.get('caracteristicas_imei') as FormArray;
  }

  get inforBodegas(): FormArray {
    return this.bodegaForm.get('bodegas') as FormArray;
  }

  addCaracteristica() {
    const detalle = this.form.get('detalle')!.value?.trim();
    const insumo_id = this.form.get('insumo_id')!.value;
    if (insumo_id) {
      this.form.get('restar_inventario').setValue(false);
    }
    const restar = insumo_id != null || insumo_id != '' ? false : null;

    if (!detalle) return;

    const item = this.formBuilder.group({
      detalle: [detalle],
      insumo_id: [insumo_id],
      restar_inventario: [restar],
    });

    this.caracterizaciones.push(item);

    // Limpiar campos individuales
    this.form.get('detalle')!.reset();
    this.form.get('insumo_id')!.reset();
    this.form.get('restar_inventario')!.setValue(null);
  }

  addCaracteristicaImei() {
    const detalle_imei = this.form.get('detalle_imei')!.value?.trim();

    if (!detalle_imei) return;

    // Verificar si ya existe el IMEI en el FormArray
    const existe = this.caracteristicas_imei.controls.some(
      (ctrl) => ctrl.get('detalle_imei')!.value === detalle_imei,
    );

    if (existe) {
      this.onSuccess('El IMEI ya fue agregado', 'error', 'Ya Existe!');
      return;
    }

    const item = this.formBuilder.group({
      detalle_imei: [detalle_imei],
    });

    this.caracteristicas_imei.push(item);

    // Limpiar campo
    this.form.get('detalle_imei')!.reset();
  }

  removeCaracteristica(i) {
    /*  console.log(i); */

    const caracteristicasArray = this.form.get('caracteristicas') as FormArray;
    caracteristicasArray.removeAt(i);
    this.cdr.detectChanges();
  }

  removeCaracteristica_imei(i) {
    /*  console.log(i); */

    const caracteristicasArray = this.form.get(
      'caracteristicas_imei',
    ) as FormArray;
    caracteristicasArray.removeAt(i);
    this.cdr.detectChanges();
  }

  getInsumoNombre(id) {
    /* console.log(this.dataInsumosTodos); */
    const insumo = this.dataInsumoCombo.find((i) => i.insumo_id == id);
    return insumo ? insumo.nombre : '—';
  }

  manejaInventario(dato) {
    //Si no maneja inventario le quito las validadciones de algunos campos de l
    if (dato == 1) {
      this.habilitar = '';
      //this.form.controls.medida.setValue('');
      this.form.controls.combinado.setValue(false);
    } else {
      this.form.controls.medida.setValue(6);
      this.form.controls.stock.setValue(0);
      this.form.controls.valor_compra.setValue(0);
      this.form.controls.stock_minimo.setValue(0);
      this.form.controls.producto.setValue(false);
      this.form.controls.insumo.setValue(false);
      this.form.controls.combinado.setValue(true);
      this.form.controls.combinado.setValue(true);
      this.habilitar = 'display:none;';
    }
  }

  /* En el caso que marque que es una receta que seleccione que no maneja inventario */
  SelectInventario(data: boolean) {
    if (data) {
      this.form.controls.manejo_inventario.setValue(1);
    } else {
      this.form.controls.manejo_inventario.setValue(2);
    }
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }
  /* quitarDecimales(valor) {
    // En el caso que no quiera decimales se los quito a las cajas de texto tambien 
    if (this.usarDecimales == 1) {
      return Math.trunc(valor);
    } else {
      return valor;
    }
  } */

  generateExcel() {
    this.productoService
      .geExcelProducto('', '', '', 'No', this.typeProduct, this.store)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          'Formato_Actualizacion_Productos',
        );
      });
  }

  generateExcel2() {
    this.productoService
      .getProductosPorPagina('', '', '', 'No', this.typeProduct, this.store)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, 'Productos');
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.productoService
      .getProductosPorPagina('', '', '', 'No', this.typeProduct, this.store)
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  keyupText(event) {
    let letter = event.target.value.trimStart();
    this.form
      .get('detalle')
      .reset(letter[0].toUpperCase() + letter.slice(1).toLowerCase());
  }

  /* Consulto informacion del sucursal */
  private getSucural(): void {
    try {
      this.sucursal = JSON.parse(
        decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
      );
      /*   console.log(this.sucursal); */
      this.usarDecimales = this.sucursal.usar_decimales;
    } catch (error) {
      this.sucursal = '';
    }
    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        //console.log(resp)
        localStorage.setItem(btoa('sucursal'), btoa(JSON.stringify(resp.data)));
      });
    }
  }

  public getCategorias(): void {
    this.categoriaProductoService.getCategoriasAtivas().subscribe((resp) => {
      this._categorias = resp.data;
    });
  }

  public getImpuestos(): void {
    this.impuestoService.getImpuestos().subscribe((resp) => {
      this._impuestos = resp.data;
    });
  }

  public getUnidadMedida(): void {
    this.unidadMedidaService.getUnidadMedidas().subscribe((resp) => {
      this._unidadMedidas = resp.data;

      // console.log(this._unidadMedidas);
    });
  }
  public getBodegas(): void {
    this.bodegaService.getBodegaPermisos(this._idEdit).subscribe((resp) => {
      this._dataBodega = resp.data;
    });
  }

  public getInsumoCombo(producto_id): void {
    this.loadedInsumo = false;
    this.insumosService.getInsumoCombo(producto_id).subscribe((resp) => {
      this._dataInsumoCombo = resp.data;
      this.loadedInsumo = true;
      /* Sumo valor de la preparacion */
      this.total_preparacion = this.dataInsumoCombo.reduce(
        (acc, obj) => acc + obj.total * 1,
        0,
      );

      // console.log(this._unidadMedidas);
    });
  }

  public getAdiciones(producto_id): void {
    this.loadedInsumo = false;
    this.adicionesService.getAdiciones(producto_id).subscribe((resp) => {
      this._dataAdiciones = resp.data;
      this.loadedInsumo = true;
    });
  }

  get dataPdf() {
    return this._dataPdf;
  }

  get categorias() {
    return this._categorias;
  }

  get impuestos() {
    return this._impuestos;
  }

  get unidadMedidas() {
    return this._unidadMedidas;
  }

  get dataInsumos() {
    return this._dataInsumos;
  }
  get dataInsumosTodos() {
    return this._dataInsumosTodos;
  }

  get dataInsumoCombo() {
    return this._dataInsumoCombo;
  }

  get dataAdiciones() {
    return this._dataAdiciones;
  }

  get dataBodega() {
    return this._dataBodega;
  }
  getInsumos(page): void {
    //this.loaded = false;
    this.insumosService
      .getInsumosActivosPorPagina(
        page,
        this.searchInsumo.controls.field.value,
        this.sizeInsumo.controls.data.value,
        '',
      )
      .subscribe((resp) => {
        //.log(resp);
        this.pageInsumo = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        // this.total = resp.data.total;
        this._dataInsumos = resp.data.data;
        //console.log(this.usar_decimales);

        //this.dtTrigger.next();
        this.loadedInsumo = true;

        //this.pages = of(paginas.slice(1, -1));
      });
  }

  getInsumosTodos(page): void {
    //this.loaded = false;
    this.insumosService
      .getInsumosActivosPorPagina(
        page,
        this.searchInsumo.controls.field.value,
        this.sizeInsumo.controls.data.value,
        'Si',
      )
      .subscribe((resp) => {
        this._dataInsumosTodos = resp.data;
      });
  }

  searchTypeProduct(data) {
    this.typeProduct = data;
    this.getProductos(1);
  }

  searchStoreProduct(data) {
    this.store = data != 0 ? data : 0;

    this.titleInforme(data);
    this.getProductos(1);
  }

  titleInforme(data) {
    //consulto el nombre de la bodega
    const codigoData = Number(data);
    const bodega = this.dataBodega.find((b) => b.codigo === codigoData);
    if (bodega && bodega.nombre) {
      this.titleModule = 'Listado de productos - ' + bodega.nombre;
    } else {
      this.titleModule = 'Listado de productos';
    }
  }

  getProductos(page): void {
    //this.loaded = false;
    this.productoService
      .getProductosPorPagina(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        this.typeProduct,
        this.store,
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        //this.dtTrigger.next();
        this.loaded = true;

        //this.pages = of(paginas.slice(1, -1));
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getProductos(1);
  }

  llamarInsumo() {
    //this.loaded = false;
    this.getInsumos(1);
  }
  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  botonesInsumo(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductos(1);
    }, 360);
  }

  buscarInsumo() {
    clearTimeout(this.timeClear);
    this.timeClear = setTimeout(() => {
      this.getInsumos(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      nombre: '',
      descripcion: '',
      cod_barra: '',
      categoria: '',
      manejo_inventario: '',
      img: '',
      medida: '',
      stock: '',
      stock_minimo: '',
      impuesto: [],
      fecha_vencimineto: '',
      producto: false,
      insumo: false,
      combinado: false,
      valor_compra: '',
      valor_venta: '',
      valor_venta_mayor: '',
      estado: '1',
      caracterizable: false,
      unico: null,
      productoId: '',
      detalle: '',
      caracteristicas: this.formBuilder.array([]),
      bodegas: '',
    });

    this.imagenProducto = '';
  }

  cleanDataInsumo() {
    this.form.reset({
      producto: '',
      cantidad: '',
      insumo: '',
      valor: '',
    });
  }

  openModalInsumo(obj: {} = {}) {
    this.cleanDataInsumo();

    this.formInsumo.controls.cantidad.setValue('');

    this.action = 'Agregar ' + obj['nombre'];
    this.action1 = 'Agregar';
    this.medida = obj['nombre_medida'];

    this.formInsumo.controls.valor_compra.setValue(obj['valor_compra']);
    this.formInsumo.controls.insumo.setValue(obj['id']);
    this.childModalInsumo?.show();
  }

  openModalAdicion(obj: {} = {}) {
    this.formAdicion.controls.cantidad.setValue('');
    this.formAdicion.controls.valor_venta.setValue('');

    this.action = 'Adición ' + obj['nombre'];
    this.action1 = 'Agregar';
    this.medida = obj['nombre_medida'];

    this.formAdicion.controls.insumo.setValue(obj['id']);
    this.childModalAdicion?.show();
  }

  openModal(opc: number, obj: {} = {}) {
    this._idEdit = obj['id'] ?? 0;
    this._dataInsumoCombo = [];

    if (obj['combinado']) {
      this.getInsumoCombo(obj['id']);
      this.getAdiciones(obj['id']);
    }

    this.inforBodegas.clear();
    //esto lo hago para actualizar la lista de bodegas
    this.bodegaService.getBodegaPermisos(this._idEdit).subscribe((resp) => {
      this._dataBodega = resp.data;
      this.updateFormArray(); //esto es para agregar las cantidades que hay en cada bodega
    });
    this.getImpuestos();
    this.getCategorias();
    this.getUnidadMedida();
    this.cleanData();
    this.loadImagenProducto();

    /* Valido si maneja inventario o no para mostrar las opciones */
    if (
      this.form.controls.manejo_inventario.value == 1 ||
      this.form.controls.manejo_inventario.value == ''
    ) {
      this.habilitar = '';
    } else {
      this.habilitar = 'display:none;';
    }

    if (opc == 1) {
      this.disabled_stock = false; //para deshabilitar el stock
      this.action = 'Agregar Producto';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      this.form.get('stock').enable();
    } else {
      /* if (obj['inventario'] == 1 || obj['inventario'] == '') {
        this.habilitar = '';
      } else {
        this.habilitar = 'display:none;';
      } */
      this.disabled_stock = true; //para deshabilitar el stock

      let caracterizable = obj['caracterizable'];
      let caracterizable_imei = obj['caracterizable_imei'];

      this.form.reset({
        cod_barra: obj['cod_barra'],
        descripcion: obj['descripcion'],
        nombre: obj['nombre'],
        categoria: obj['categoria_id'],
        impuesto: obj['impuesto'],
        fecha_vencimiento: obj['fecha_vencimiento'],
        valor_compra: this.formatearNumber(obj['valor_compra']),
        valor_venta: this.formatearNumber(obj['valor_venta']),
        valor_venta_mayor: this.formatearNumber(obj['valor_venta_mayor']),
        medida: obj['medida_id'],
        manejo_inventario: obj['maneja_inventario'],
        stock: this.formatearNumber(obj['stock']),
        stock_minimo: this.formatearNumber(obj['stock_min']),
        tipo: obj['tipo_id'],
        producto: obj['producto'],
        insumo: obj['insumo'],
        combinado: obj['combinado'],
        img: obj['img'],
        estado: obj['estado_id'],

        caracterizable: caracterizable,
        unico: obj['unico'],
        productoId: '',
        detalle: '',
        caracteristicas: this.formBuilder.array([]),
        caracterizable_imei: caracterizable_imei,
        caracteristicas_imei: this.formBuilder.array([]),
      });

      this.caracterizaciones.clear();
      this.caracteristicas_imei.clear();

      if (caracterizable) {
        for (let i = 0; i < obj['caracterizacion'].length; i++) {
          const element = obj['caracterizacion'][i];
          const newCaracteristica = this.formBuilder.group({
            // You can add the necessary form controls here
            // For example:
            detalle: element.detalle,
            insumo_id: element.insumo_id,
            restar_inventario: element.restar_inventario,
          });

          this.caracterizaciones.push(newCaracteristica);
        }
      }

      //Gestiono el agregado de los IMEI
      if (caracterizable_imei) {
        for (let i = 0; i < obj['caracterizacion_imei'].length; i++) {
          const element = obj['caracterizacion_imei'][i];
          const newCaracteristica = this.formBuilder.group({
            // You can add the necessary form controls here
            // For example:
            detalle_imei: element.detalle_imei,
          });

          this.caracteristicas_imei.push(newCaracteristica);
        }
      }

      this.form.get('stock').disable();

      this.imagenProducto = obj['img'];
      /* Deshabilito numero de documento */
      this.action = 'Actualizar Producto';
      this.action1 = 'Actualizar';
      this.isActionAdd = false;
      if (this.form.get('cod_barra')?.value) {
        setTimeout(() => {
          this.generarCodigo(this.form.get('cod_barra')?.value);
        }, 500);
      }
    }
    this.childModal?.show();
  }

  openModalImportar() {
    this.childModalImportar.show();
  }

  openModalActualizarPrecios() {
    this.childModalActualizarPrecios.show();
  }

  closeModal() {
    this.childModal?.hide();
  }

  closeModalInsumo() {
    this.childModalInsumo?.hide();
  }

  closeModalAdicion() {
    this.childModalAdicion?.hide();
  }

  closeModalImportar() {
    this.childModalImportar?.hide();
  }

  closeModalActualizarPrecios() {
    this.childModalActualizarPrecios?.hide();
  }

  closeModal2() {
    this.childModal2?.hide();
  }

  openModal2() {
    this.childModal2?.show();
    this.generatePdf();
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

  campoEsValidoInsumo(campo: string) {
    return (
      this.formInsumo.controls[campo].errors &&
      this.formInsumo.controls[campo].touched
    );
  }

  campoEsValidoAdicion(campo: string) {
    return (
      this.formAdicion.controls[campo].errors &&
      this.formAdicion.controls[campo].touched
    );
  }

  onSubmitInsumo() {
    if (this.formInsumo.invalid) {
      this.formInsumo.markAllAsTouched();
      return;
    }
    this.insumosService.addInsumo(this.formInsumo.value).subscribe(
      (resp) => {
        if (resp.code == '202') {
          this.onSuccess(resp.message, 'error', 'Ya Existe!');
        } else {
          this.onSuccess(resp.message, 'success', 'Registrado');
          this.closeModalInsumo();
          this.getInsumoCombo(this.formInsumo.controls.producto.value);
        }
      },
      (err) => {
        alert('Ocurrió un error');
      },
    );
  }

  onSubmitAdicion() {
    if (this.formAdicion.invalid) {
      this.formAdicion.markAllAsTouched();
      return;
    }
    this.adicionesService.addAdicion(this.formAdicion.value).subscribe(
      (resp) => {
        if (resp.code == '202') {
          this.onSuccess(resp.message, 'error', 'Ya Existe!');
        } else {
          this.onSuccess(resp.message, 'success', 'Registrado');
          this.childModalAdicion?.hide();

          this.getAdiciones(this.formAdicion.controls.producto.value);
        }
      },
      (err) => {
        alert('Ocurrió un error');
      },
    );
  }

  alertProduct(message) {
    Swal.fire({
      title: 'Advertencia',
      text: message,
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Ok',
      showConfirmButton: false,
    });
  }
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.lockbutton = true;
    /* En el caso que no halla marcado el tipo de producto no lo dejo hacer ningun solicitud */
    if (
      this.form.controls.producto.value == false &&
      this.form.controls.insumo.value == false &&
      this.form.controls.combinado.value == false
    ) {
      this.alertProduct(
        'Debe seleccionar el tipo de producto para poder continuar...',
      );
      this.lockbutton = false;
      return;
    } else if (
      this.form.controls.producto.value == true &&
      this.form.controls.insumo.value == true &&
      this.form.controls.combinado.value == true
    ) {
      this.alertProduct(
        'El producto a registrar no puede ser PRODUCTO, INSUMO Y RECETA/SERVICIO/COMBO',
      );
      this.lockbutton = false;
      return;
    }

    if (
      this.form.controls.medida.value === '' &&
      (this.form.controls.producto.value === true ||
        this.form.controls.insumo.value === true)
    ) {
      this.alertProduct('La unidad de medida es requerida');
      this.lockbutton = false;
      return;
    }

    /* if (
      this.form.controls.stock.value === '' &&
      (this.form.controls.producto.value === true ||
        this.form.controls.insumo.value === true)
    ) {
      this.alertProduct('El stock es requerido');
      this.lockbutton = false;
      return;
    } */

    /*  if (
       this.form.controls.stock_minimo.value === '' &&
       (this.form.controls.producto.value === true ||
         this.form.controls.insumo.value === true)
     ) {
       this.alertProduct('El stock mínimo es requerido');
       this.lockbutton = false;
       return;
     } */

    if (this.form.controls.impuesto.value.length === 0) {
      this.alertProduct('Debe diligenciar los impuestos');
      this.lockbutton = false;
      return;
    }

    if (
      this.form.controls.valor_compra.value === '' &&
      (this.form.controls.producto.value === true ||
        this.form.controls.insumo.value === true)
    ) {
      this.alertProduct('El valor de compra es requerido');
      this.lockbutton = false;
      return;
    }

    ///agrego la gestión de bodega
    this.form.controls.bodegas.setValue(
      JSON.stringify(this.inforBodegas.value),
    );

    // medida, stock, stock_minimo, valor_compra;

    if (this.isActionAdd) {
      this.productoService.addProducto(this.form.value).subscribe(
        (resp) => {
          if (resp.code == '202') {
            this.onSuccess(resp.message, 'error', 'Ya Existe!');
          } else {
            this.onSuccess(resp.message, 'success', 'Registrado');
            this.closeModal();
          }

          this.lockbutton = false;
          this.getProductos(1);
        },
        (err) => {
          alert('Ocurrió un error');
        },
      );
    } else {
      /* console.log(this._idEdit);
      console.log(this.form.value); */

      this.productoService
        .putProducto(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess('Actualizado exitosamente', 'success', 'Hecho!');

          this.closeModal();
          this.form.reset();
          this.lockbutton = false;

          this.getProductos(1);
        });
    }
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el producto ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.deleteProducto(item['id']).subscribe(
          (resp) => {
            this.onSuccess(
              'Producto eliminado exitosamente',
              'success',
              'Eliminado',
            );
            this.closeModal();

            this.getProductos(1);
          },
          (error) => {
            this.onSuccess(
              'El producto, esta siendo usado como insumo en las recetas',
              'Error',
              'Producto, No eliminado',
            );
          },
        );
      }
    });
  }

  deleteInsumo(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el insumo ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.insumosService
          .deleteInsumo(item['producto_id'], item['id'])
          .subscribe((resp) => {
            this.onSuccess(
              'Insumo eliminado exitosamente',
              'success',
              'Eliminado',
            );
            this.getInsumoCombo(item.producto_id);
          });
      }
    });
  }

  deleteAdicion(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás la adición ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adicionesService
          .adicionesDelete(item['producto_id'], item['id'])
          .subscribe((resp) => {
            this.onSuccess(
              'Adición eliminado exitosamente',
              'success',
              'Eliminada',
            );
            this.getAdiciones(item.producto_id);
          });
      }
    });
  }

  /* Gestiono insumos */
  gestionInsumos(item) {
    this.titleInsumo = 'Relacionar Insumos con ' + item.nombre;
    this.habilitarProductos = 'display:none;';
    this.habilitarInsumos = '';
    this.formInsumo.controls.producto.setValue(item.id);
    this.formAdicion.controls.producto.setValue(item.id);

    this.getInsumos(1);
    this.getInsumoCombo(item.id);
    this.getAdiciones(item.id);
  }

  regresar() {
    this.habilitarProductos = '';
    this.habilitarInsumos = 'display:none;';
    this.getProductos(1);
  }

  uploadArchivo(event) {
    this.files = event.target.files[0];
    this.habilitar1 = 'display:none;';
    this.habilitar2 = '';
    this.habilitar3 = 'display:none;';
    //console.log(this.files);
    if (this.files) {
      this.nombre_archivo = this.files.name;
      if (
        this.files.type == 'application/vnd.ms-excel' ||
        this.files.type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        this.habilitar1 = 'display:none;';
        this.habilitar2 = '';
      } else {
        this.habilitar1 = '';
        this.habilitar2 = 'display:none;';
        this.files = '';
        //alert('archivo no permitido');
      }
    }
  }

  /* Para gestionar la carga de archivos atravez de documento de excel */
  onSubmitArchivo() {
    this.lockbuttonImportarExcel = true;
    if (this.files) {
      if (
        this.files.type == 'application/vnd.ms-excel' ||
        this.files.type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        const formData = new FormData();
        formData.append('archivo', this.files, this.files.name);

        this.productoService.importarArchivo(formData).subscribe(
          (resp) => {
            this.lockbuttonImportarExcel = false;

            if (resp.code == '201') {
              this.onSuccess(resp.message, 'error', 'Advertencia');
            } else {
              this.onSuccess(resp.message, 'success', 'Guardado!');

              clearTimeout(this.timeClear);
              this.timeClear = setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            this.closeModalImportar();
          },
          (error) => {
            this.lockbuttonImportarExcel = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
              confirmButtonColor: '#145388',
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          },
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Debe seleccionar un archivo, el formato debe ser .XLS',
          confirmButtonColor: '#145388',
        });
        this.lockbuttonImportarExcel = false;
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Debe seleccionar un archivo',
        text: 'El formato debe ser .XLS',
        confirmButtonColor: '#145388',
      });
      this.lockbuttonImportarExcel = false;
    }
  }

  /* Gestiono para generar la actualizacion masiva desde excel */

  uploadUpdateProductos(event) {
    this.files_update = event.target.files[0];
    this.habilitar1_update = 'display:none;';
    this.habilitar2_update = '';
    this.habilitar3_update = 'display:none;';
    //console.log(this.files);
    if (this.files_update) {
      this.nombre_archivo_update = this.files_update.name;
      if (
        this.files_update.type == 'application/vnd.ms-excel' ||
        this.files_update.type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        this.habilitar1_update = 'display:none;';
        this.habilitar2_update = '';
      } else {
        this.habilitar1_update = '';
        this.habilitar2_update = 'display:none;';
        this.files_update = '';
        //alert('archivo no permitido');
      }
    }
  }

  /* Para gestionar la carga de archivos atravez de documento de excel */
  onSubmitUpdateExcelProductos() {
    this.lockbuttonImportarExcelPrecios = true;
    if (this.files_update) {
      if (
        this.files_update.type == 'application/vnd.ms-excel' ||
        this.files_update.type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        const formData = new FormData();
        formData.append('archivo', this.files_update, this.files_update.name);

        this.productoService.importarUpdateProductoExcel(formData).subscribe(
          (resp) => {
            this.lockbuttonImportarExcelPrecios = false;

            if (resp.code == '201') {
              this.onSuccess(resp.message, 'error', 'Advertencia');
            } else {
              this.onSuccess(resp.message, 'success', 'Guardado!');

              clearTimeout(this.timeClear);
              this.timeClear = setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            this.closeModalImportar();
          },
          (error) => {
            this.lockbuttonImportarExcelPrecios = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
              confirmButtonColor: '#145388',
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          },
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Debe seleccionar un archivo, el formato debe ser .XLS',
          confirmButtonColor: '#145388',
        });
        this.lockbuttonImportarExcelPrecios = false;
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Debe seleccionar un archivo',
        text: 'El formato debe ser .XLS',
        confirmButtonColor: '#145388',
      });
      this.lockbuttonImportarExcelPrecios = false;
    }
  }
  loadImagenProducto() {
    this.imagenProducto = this.form.controls.img.value;
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
  }

  countDecimalPoints(input: string): number {
    const match = input.match(/\./g);
    return match ? match.length : 0;
  }

  formatearValorCompra(event) {
    if (this.countDecimalPoints(event) === 0) {
      this.form.controls.valor_compra.setValue(this.formatNumber(event));
    }
  }
  formatearValorVenta(event) {
    if (this.countDecimalPoints(event) === 0) {
      this.form.controls.valor_venta.setValue(this.formatNumber(event));
    }
  }
  formatearValorVentaMayor(event) {
    if (this.countDecimalPoints(event) === 0) {
      this.form.controls.valor_venta_mayor.setValue(this.formatNumber(event));
    }
  }

  formatearValorVentaAdicion(event) {
    if (this.countDecimalPoints(event) === 0) {
      this.formAdicion.controls.valor_venta.setValue(this.formatNumber(event));
    }
  }
  menuDigital() {
    this.router.navigate([`/inventario/menuDigital`]);
  }

  updateFormArray(): void {
    const bodegasFormArray = this.bodegaForm.get('bodegas') as FormArray;
    this.dataBodega.forEach((bodega) => {
      bodegasFormArray.push(
        this.formBuilder.group({
          id: [bodega.codigo],
          nombre: [bodega.nombre],
          alias: [bodega.alias],
          stock: [bodega.stock],
          stock_min: [bodega.stock_min],
        }),
      );
    });
  }

  paginateProducto(event) {
    this.page = event;
    this.getProductos(this.page);
  }

  paginateInsumo(event) {
    this.page = event;
    this.getInsumos(this.page);
  }

  generarCodigoBarras(): void {
    // Genera un número aleatorio de 7 dígitos (1000000 - 9999999)
    const numero = Math.floor(100000000 + Math.random() * 900000000);
    this.form.controls.cod_barra.setValue(numero.toString());

    if (this.form.get('cod_barra')?.value) {
      setTimeout(() => {
        this.generarCodigo(this.form.get('cod_barra')?.value);
      }, 500);
    }
  }

  updateCodBrra() {
    setTimeout(() => {
      this.generarCodigo(this.form.get('cod_barra')?.value);
    }, 500);
  }

 abrirModalCategoria() {
  this.formCategoria.reset({ estado: 'ACTIVO' });

  Swal.fire({
    html: `
   <div class="d-flex justify-content-between align-items-center w-100 px-4 py-3" 
           style="background-color: #2f59a7; color: white; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <h5 class="m-0 fw-bold">Agregar Categoria</h5>
        <button type="button"
          id="btn-close-swal"
          style="
            background: transparent;
            border: none;
            color: white;
            font-size: 18px;
            font-weight: bold;
            line-height: 1;
            cursor: pointer;
          ">
          &times;
        </button>
      </div>
      
      <div class="container-fluid p-4 text-start">
        <div class="row g-4">
          <div class="col-md-5">
            <div class="card shadow-sm border-0 rounded-3" style="border: 1px solid #eee !important;">
              <div class="card-body text-center d-flex flex-column">
                <label class="fw-bold text-dark small mb-4" style="font-size:12px;font-weight:bold;">
                  IMAGEN DE PRESENTACIÓN
                </label>
                <div class="flex-grow-1 d-flex align-items-center justify-content-center" style="min-height: 110px;">
                  <img id="prev_img"
                       src="../../../../assets/img/defecto.jpg"
                       class="img-fluid"
                       style="max-height: 180px;">
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-7" style="text-align: left !important;">
            <div class="mb-3">
              <label class="form-label fw-bold text-dark mb-1" style="font-size:12px;font-weight:bold;">
                Nombre
              </label>
              <input type="text" id="swal-nombre" style='text-transform: uppercase;' class="form-control" placeholder="NOMBRE" autocomplete="off">
            </div>
            
            <div class="mb-3" style="text-align: left !important;">
              <label class="form-label fw-bold text-dark mb-1" style="font-size:12px;font-weight:bold;">
                URL de imagen
              </label>
              <textarea id="swal-img" class="form-control" rows="5" placeholder="URL" style="resize:none;"></textarea>
            </div>
            
            <div class="mb-0" style="text-align: left !important;">
              <label class="form-label fw-bold text-dark mb-1" style="font-size:12px;font-weight:bold;">
                Estado
              </label>
              <select id="swal-estado" class="form-control">
                <option value="1">ACTIVO</option>
                <option value="2">INACTIVO</option>
              </select>
            </div>
          </div>
        </div>
      </div>

   <div class="text-center pb-4">
      <button id="btn-confirmar" class="btn btn-primary px-4 py-2 fw-bold shadow-sm">
        <span id="btn-text">Agregar</span>
        <span id="btn-spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
      </button>
    </div>
    `,
    showConfirmButton: false,
    heightAuto: false,

    didOpen: () => {
      const popup = Swal.getPopup();
      const htmlContainer = popup?.querySelector('.swal2-html-container') as HTMLElement;
      if (popup) popup.style.padding = '0';
      if (htmlContainer) {
        htmlContainer.style.margin = '0';
        htmlContainer.style.padding = '0';
      }

      document.getElementById('btn-close-swal')?.addEventListener('click', () => Swal.close());

      const inputImg = document.getElementById('swal-img') as HTMLTextAreaElement;
      const preview = document.getElementById('prev_img') as HTMLImageElement;
      inputImg.addEventListener('input', () => {
        preview.src = inputImg.value || '../../../../assets/img/defecto.jpg';
      });

      // Al hacer click, ejecutamos la validación y el proceso
      document.getElementById('btn-confirmar')?.addEventListener('click', () => Swal.clickConfirm());
    },

    preConfirm: () => {
      const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
      const btnConfirmar = document.getElementById('btn-confirmar') as HTMLButtonElement;
      const btnText = document.getElementById('btn-text') as HTMLElement;
      const btnSpinner = document.getElementById('btn-spinner') as HTMLElement;

      if (!nombre) {
        Swal.showValidationMessage('El nombre es obligatorio');
        return false;
      }

      // --- ACTIVAR SPINNER ---
      btnConfirmar.disabled = true;
      btnText.innerText = 'Guardando... ';
      btnSpinner.classList.remove('d-none');

      const data = {
        nombre: nombre.toUpperCase(),
        img: (document.getElementById('swal-img') as HTMLTextAreaElement).value,
        estado: (document.getElementById('swal-estado') as HTMLSelectElement).value,
      };

      return new Promise<any>((resolve, reject) => {
        this.formCategoria.patchValue(data);

        this.categoriaProductoService.addCategoriaProducto(this.formCategoria.value)
          .subscribe({
            next: (resp) => resolve(resp),
            error: (err) => {
              // --- DESACTIVAR SPINNER EN CASO DE ERROR ---
              btnConfirmar.disabled = false;
              btnText.innerText = 'Agregar';
              btnSpinner.classList.add('d-none');
              Swal.showValidationMessage('Ocurrió un error al guardar');
              reject(err);
            }
          });
      });
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const resp = result.value;
      if (resp.code == 202) {
        this.onSuccess(resp.message, 'error', 'Ya Existe!');
      } else {
        this.onSuccess(resp.message, 'success', 'Registrado');
        this.getCategorias();
        if(this.form.controls['categoria']) this.form.controls['categoria'].setValue(resp.data.id);
      }
    }
  });
}

}
