import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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


@Component({
  selector: 'app-second',
  templateUrl: './por-vencer.component.html',
  styleUrls: ['../../../../css/modulo.css', '../producto.component.scss'],
})
export class ProductoPorVencerComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModalInsumo', { static: false })
  childModalInsumo?: ModalDirective;

  @ViewChild('staticModalImportar', { static: false })
  childModalImportar?: ModalDirective;

  @ViewChild('staticModalActualizarPrecios', { static: false })
  childModalActualizarPrecios?: ModalDirective;

  titleModule: string = 'Lista de productos por vencer';
  headers: headersMasterInterface[] = headersProducto;

  habilitar: string;
  habilitarInsumos: string = 'display:none;';
  habilitarProductos: string;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  sucursal: any;

  formInsumo: FormGroup; //variable que controla el formulario
  searchInsumo: FormGroup; //variable que controla el formulario
  sizeInsumo: FormGroup;
  formSubirArchivo: FormGroup;
  formSubirArchivo_update: FormGroup;
  files: any;
  files_update: any;

  /* Variables multiselect */
  selectedItemsImpuesto = [];
  dropdownSettings: IDropdownSettings;

  private _impuestos: any[] = [];
  private _dataPdf: any[] = [];
  private _dataInsumos: any[] = [];
  private _dataInsumoCombo: any[] = [];
  private _categorias: any[] = [];
  private _unidadMedidas: any[] = [];

  tiposProducto: tiposProducto[] = [
    { id: null, name: 'Todos' },
    { id: 1, name: 'Producto' },
    { id: 2, name: 'Insumo' },
    { id: 3, name: 'Receta, servicio o combo' },
    { id: 4, name: 'Productos o insumos por vencer' },
  ];
  typeProduct: number;

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

  pagesInsumo: Observable<any[]>;
  pageInsumo = 1;
  totalInsumo = 0;

  pages: Observable<any[]>;
  page = 1;
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
    private router: Router
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
      estado: ['', [Validators.required]],
    });

    this.formInsumo = this.formBuilder.group({
      producto: ['', [Validators.required]],
      insumo: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      valor_compra: ['', [Validators.required]],
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
      limitSelection: 1
    };
    this.createForm();
    this.createForm2();
    this.getSucural();
    this.getProductos(1);
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
      .getProductosPorVencer('', '', '', 'No', this.typeProduct)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, 'Productos');
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.productoService
      .getProductosPorVencer('', '', '', 'No', this.typeProduct)
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  /* Consulto informacion del sucursal */
  private getSucural(): void {
    try {
      this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
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

  public getInsumoCombo(producto_id): void {
    this.loadedInsumo = false;
    this.insumosService.getInsumoCombo(producto_id).subscribe((resp) => {
      this._dataInsumoCombo = resp.data;
      this.loadedInsumo = true;
      /* Sumo valor de la preparacion */
      this.total_preparacion = this.dataInsumoCombo.reduce(
        (acc, obj) => acc + obj.total * 1,
        0
      );

      // console.log(this._unidadMedidas);
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

  get dataInsumoCombo() {
    return this._dataInsumoCombo;
  }

  getInsumos(page): void {
    //this.loaded = false;
    this.insumosService
      .getInsumosActivosPorPagina(
        page,
        this.searchInsumo.controls.field.value,
        this.sizeInsumo.controls.data.value,
        ''
      )
      .subscribe((resp) => {
        //.log(resp);
        this.pageInsumo = resp.data.current_page;
        // this.total = resp.data.total;
        this._dataInsumos = resp.data.data;
        //console.log(this.usar_decimales);

        //this.dtTrigger.next();
        this.loadedInsumo = true;

        this.pagesInsumo = of(resp.data.links);

        //this.pages = of(paginas.slice(1, -1));
      });
  }

  searchTypeProduct(data) {
    this.typeProduct = data;
    this.getProductos(1);
  }

  getProductos(page): void {
    //this.loaded = false;
    this.productoService
      .getProductosPorVencer(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        this.typeProduct
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        //this.dtTrigger.next();
        this.loaded = true;

        this.pages = of(resp.data.links);
        this.last_page = resp.data.last_page;

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

  nextInsumo() {
    this.pagesInsumo.subscribe((resp) => {
      if (this.pageInsumo < resp.length) {
        this.getInsumos(this.pageInsumo + 1);
      }
    });
  }

  next() {
    this.pages.subscribe((resp) => {
      if (this.page < resp.length) {
        this.getProductos(this.page + 1);
      }
    });
  }

  beforeInsumo() {
    if (this.pageInsumo > 1) {
      this.getInsumos(this.pageInsumo - 1);
    }
  }

  before() {
    if (this.page > 1) {
      this.getProductos(this.page - 1);
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
      estado: '1',
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

  openModal(opc: number, obj: {} = {}) {
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
      this.form.reset({
        cod_barra: obj['cod_barra'],
        descripcion: obj['descripcion'],
        nombre: obj['nombre'],
        categoria: obj['categoria_id'],
        impuesto: obj['impuesto'],
        fecha_vencimiento: obj['fecha_vencimiento'],
        valor_compra: this.formatearNumber(obj['valor_compra']),
        valor_venta: this.formatearNumber(obj['valor_venta']),
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
      });
      this.form.get('stock').disable();

      this.imagenProducto = obj['img'];
      /* Deshabilito numero de documento */
      this._idEdit = obj['id'];

      this.action = 'Actualizar Producto';
      this.action1 = 'Actualizar';
      this.isActionAdd = false;
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
      }
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
        'Debe seleccionar el tipo de producto para poder continuar...'
      );
      this.lockbutton = false;
      return;
    } else if (
      this.form.controls.producto.value == true &&
      this.form.controls.insumo.value == true &&
      this.form.controls.combinado.value == true
    ) {
      this.alertProduct(
        'El producto a registrar no puede ser PRODUCTO, INSUMO Y RECETA/SERVICIO/COMBO'
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

    if (
      this.form.controls.stock.value === '' &&
      (this.form.controls.producto.value === true ||
        this.form.controls.insumo.value === true)
    ) {
      this.alertProduct('El stock es requerido');
      this.lockbutton = false;
      return;
    }

    if (
      this.form.controls.stock_minimo.value === '' &&
      (this.form.controls.producto.value === true ||
        this.form.controls.insumo.value === true)
    ) {
      this.alertProduct('El stock mínimo es requerido');
      this.lockbutton = false;
      return;
    }

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
        }
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
              'Eliminado'
            );
            this.closeModal();

            this.getProductos(1);
          },
          (error) => {
            this.onSuccess(
              'El producto, esta siendo usado como insumo en las recetas',
              'Error',
              'Producto, No eliminado'
            );
          }
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
              'Eliminado'
            );
            this.getInsumoCombo(item.producto_id);
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

    this.getInsumos(1);
    this.getInsumoCombo(item.id);
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
              text: 'Error al cargar el archivo, verifique, que sea el formato correcto',
              confirmButtonColor: '#145388',
            });
          }
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
              text: 'Error al cargar el archivo, verifique, que sea el formato correcto',
              confirmButtonColor: '#145388',
            });
          }
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
    console.log(this.countDecimalPoints(n));
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

  menuDigital() {
    this.router.navigate([`/inventario/menuDigital`]);
  }
}
