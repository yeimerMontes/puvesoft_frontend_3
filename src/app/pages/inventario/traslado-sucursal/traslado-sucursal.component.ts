import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { of, Observable } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { SucursalService } from 'src/app/services/sucursal.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ProductoService } from 'src/app/services/producto.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersTrasladosBodega } from 'src/app/constants/producto';
import { NgSelectConfig } from '@ng-select/ng-select';
import { BodegaService } from 'src/app/services/bodega.service';
import { TrasladoBodegasService } from 'src/app/services/traslado-bodegas';
import { TrasladoSucursalesService } from 'src/app/services/traslado-sucursales';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './traslado-sucursal.component.html',
})
export class TrasladoSucursalComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModalImportar', { static: false })
  childModalImportar?: ModalDirective;

  titleModule: string = 'Historial Traslados Entre Sucursales';
  headers: headersMasterInterface[] = headersTrasladosBodega;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  searchProducto: FormGroup; //variable que controla el formulario
  searchName: FormGroup; //variable que controla el formulario
  formBodegaAjuste: FormGroup;
  formSubirArchivo: FormGroup;
  size: FormGroup;
  files: any;

  fecha_init: string;
  fecha_fin: string;

  private _dataProducto: any[] = [];
  private _dataPdf: any[] = [];

  private _data = [];
  private _dataBodega: any[] = [];
  private _dataSucursal: any[] = [];
  private _dataBodegaSucursal: any[] = [];
  dataBodegaDestino: any[] = [];
  datacategoriaProductos: any[] = [];

  selects: number[] = selectsPagination;

  timeClear: any;
  infoTraslado: any = {};

  action = 'Hacer nuevo traslado';
  action1 = 'Trasladar';

  isActionAdd: boolean = true;
  lockbutton: boolean = false;
  lockbuttonExcel: boolean = false;

  loaded = false;
  loaded2 = false;

  pages: Observable<any[]>;
  page = 1;
  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;

  sucursal: any;
  usarDecimales: Number = 1;

  habilitar1: any;
  habilitar2 = 'display:none;';
  habilitar3: any;
  nombre_archivo: any;
  isChecked: boolean = false;
  isChecked2: boolean = false;
  count: number = 0;
  store: number = 0;
  existenciaProducto: boolean = true;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private productoService: ProductoService,
    private trasladoSucursalesService: TrasladoSucursalesService,
    private ngSelectConfig: NgSelectConfig,
    private bodegaService: BodegaService,
    private categoriaProductoService: CategoriaProductoService

  ) {
    this.ngSelectConfig.notFoundText = 'Buscar Producto';
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

  ngOnInit() {
    //Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      bodega_origen: ['', [Validators.required]],
      sucursal_destino: ['', [Validators.required]],
      bodega_destino: ['', [Validators.required]],
      producto: [null, []],
      cantidad_actual: ['', []],
      cantidad_traslado: ['', [Validators.required]],
      categoria_producto: ['', []],
      observacion: ['', []],
    });

    this.formBodegaAjuste = this.formBuilder.group({
      bodega_origen: ['', []],
      bodega_destino: ['', []],
    });
    this.searchProducto = this.formBuilder.group({
      producto: ['', []],
    });
    this.searchName = this.formBuilder.group({
      field: ['', []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      fecha_final: ['', []],
      bodega: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });
    this.getSucural();
    this.getBodegas();
    this.createForm();
    this.getAjustes(1);
    this.fechaActual();
  }

  createForm() {
    this.formSubirArchivo = this.formBuilder.group({
      archivo: [null, Validators.required],
    });
  }
  get f() {
    return this.formSubirArchivo.controls;
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  public getBodegas(): void {
    this.bodegaService
      .getBodegaPermisos(0)
      .subscribe((resp) => {
        this._dataBodega = resp.data;
      });
  }

  public getListSucursales(): void {
    this.sucursalService
      .getSucursalesActivas()
      .subscribe((resp) => {
        this._dataSucursal = resp.data;
      });
  }

  public getExistenciaProductoSucursalTraslado(): void {
    this.trasladoSucursalesService
      .getExistenciaProductoSucursalTraslado(this.form.controls.producto.value, this.form.controls.sucursal_destino.value,)
      .subscribe((resp) => {
        this.existenciaProducto = resp.data.existe;

        console.log(this.existenciaProducto)
        ///consulto si el producto esta creado en la sucursal a donde se desea trasladar
        if (!this.existenciaProducto) {
          this.getcategoriaProductoPorSucursal();

        }
      });
  }

  ///consulto las categorias de los productos de una determinada sucursal en caso que sea necesario
  public getcategoriaProductoPorSucursal(): void {
    this.categoriaProductoService
      .getcategoriaProductoPorSucursal(this.form.controls.sucursal_destino.value,)
      .subscribe((resp) => {
        this.datacategoriaProductos = resp.data;
      });
  }

  public getListbodegaSucursal(sucursal): void {
    this.bodegaService
      .getbodegasSucursales(sucursal)
      .subscribe((resp) => {
        this._dataBodegaSucursal = resp.data;
      });
  }


  generateExcel() {
    this.trasladoSucursalesService
      .getTrasladoSucursalesInventarioPorPagina(
        '',
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.searchName.controls.field.value,
        '',
        'No',
        this.search.controls.bodega.value,

      )
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          'Historial traslados'
        );
      });
  }

  generateFormatoExcelAjustesInventario() {
    this.trasladoSucursalesService
      .getDataProductosTrasladosSucursalesMasivos(this.formBodegaAjuste.controls.bodega_origen.value,
        this.formBodegaAjuste.controls.bodega_destino.value)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          'Formato traslado bodega'
        );
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.trasladoSucursalesService
      .getTrasladoSucursalesInventarioPorPagina(
        '',
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.searchName.controls.field.value,
        '',
        'No',
        this.search.controls.bodega.value,
      )
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        console.log(this._dataPdf);
        this.loaded2 = true;
      });
  }

  /* Consulto informacion del operador */
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

  buscar_nombre(value) {
    clearTimeout(this.timeClear);
    this.timeClear = setTimeout(() => {
      /* Hago la busqueda */
      this.productoService
        .busquedaPorNombreProductosActivosTraslados(value)
        .subscribe((resp) => {
          this._dataProducto = resp.data;
        }, (err) => {
          this.onSuccess(
            err.error.message,
            'error',
            'Error'
          );
        });
    }, 360);
  }

  buscarBodegasConStock(prodcuto_id) {
    /* Hago la busqueda */
    this.productoService
      .busquedaBodegaProdcutoStock(prodcuto_id)
      .subscribe((resp) => {
        this.infoTraslado = resp.data;
      }, (err) => {
        this.onSuccess(
          err.error.message,
          'error al consultar el stock del prodcuto en las bodegas',
          'Error'
        );
      });
  }

  public guardarProducto(item): void {
    this.form.reset({
      bodega_origen: '',
      sucursal_destino: '',
      bodega_destino: '',
      cantidad_actual: '',
      cantidad_traslado: '',
      categoria_producto: '',
      observacion: '',
    });
    let selectedIndex = this._dataProducto.findIndex(
      (dataItem) => dataItem.nombre == item
    );

    if (selectedIndex != -1) {
      let selectedItemFromData = this._dataProducto[selectedIndex];
      this.form.controls.producto.setValue(selectedItemFromData.id);
      this.buscarBodegasConStock(selectedItemFromData.id);

    }


    ////consulto la información de las bodegas que contienen el producto
  }

  get dataProducto() {
    return this._dataProducto;
  }

  get dataSucursal() {
    return this._dataSucursal;
  }

  get dataBodegaSucursal() {
    return this._dataBodegaSucursal;
  }


  get dataPdf() {
    return this._dataPdf;
  }

  get dataBodega() {
    return this._dataBodega;
  }

  getAjustes(page): void {

    if (!this.search.controls.bodega.value) {
      this.search.controls.bodega.setValue(0);
    }
    //this.loaded = false;
    this.trasladoSucursalesService
      .getTrasladoSucursalesInventarioPorPagina(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.searchName.controls.field.value,
        this.size.controls.data.value,
        '',
        this.search.controls.bodega.value,
      )
      .subscribe((resp) => {
        //console.log(resp);
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        this.loaded = true;
        this.count++;

        this.pages = of(resp.data.links);
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getAjustes(1);
  }

  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  next() {
    this.pages.subscribe((resp) => {
      if (this.page < resp.length) {
        this.getAjustes(this.page + 1);
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getAjustes(this.page - 1);
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getAjustes(1);
    }, 360);
  }

  buscarNombre() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getAjustes(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      bodega_origen: '',
      sucursal_destino: '',
      bodega_destino: '',
      producto: null,
      cantidad_actual: '',
      cantidad_traslado: '',
      categoria_producto: '',
      observacion: '',
    });

    this.searchProducto.reset({
      producto: null,
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.isChecked = false;
    this.isChecked2 = false;
    this.cleanData();
    this.getListSucursales();
    this._dataProducto = [];


    if (opc == 1) {
      this.action = 'Hacer nuevo traslado entre sucursales';
      this.action1 = 'Trasladar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
    }
    this.childModal?.show();
  }

  openModalImportar() {
    this.formBodegaAjuste.controls.bodega_origen.setValue('');
    this.childModalImportar.show();
  }
  closeModalImportar() {
    this.childModalImportar?.hide();
  }

  closeModal() {
    this.childModal?.hide();
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

  onSubmit() {

    this.lockbutton = true;

    if (this.isActionAdd) {
      if (this.form.controls.producto.value == '' || this.form.controls.producto.value == null) {
        this.onSuccess(
          'Debe buscar y seleccionar un producto',
          'error',
          'Advertencia!'
        );
        this.lockbutton = false;

      } else if ((this.form.controls.categoria_producto.value == '' || this.form.controls.categoria_producto.value == null) && this.existenciaProducto == false) {
        this.onSuccess(
          'Debe seleccionar una categoria, ya que el producto no existe en la sucursal destino y será creado...',
          'error',
          'Advertencia!'
        );
        this.lockbutton = false;

      } else {
        if (this.form.invalid) {
          this.form.markAllAsTouched();
          this.lockbutton = false;
          return;
        }


        this.trasladoSucursalesService
          .addTrasladoSucursales(this.form.value)
          .subscribe(
            (resp) => {
              this.onSuccess(resp.message, 'success', 'Registrado');
              this.closeModal();
              // window.location.reload();
              this.lockbutton = false;

              this.getAjustes(1);

              /* setTimeout(() => {
                window.location.reload();
              }, 1000); */
            },
            (err) => {
              this.lockbutton = false;

              this.onSuccess(
                err.error.message,
                'error',
                'Error'
              );
            }
          );
      }
    }
  }

  /* Para poner la fecha actual */
  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();
    var fecha_inicial = `${year}-${month}-${day}`;
    var fecha_final = `${year}-${month}-${day}`;
    this.search.controls.fecha_inicial.setValue(fecha_inicial);
    this.search.controls.fecha_final.setValue(fecha_final);

    this.fecha_init = fecha_inicial;
    this.fecha_fin = fecha_final;
  }

  buscarAjuste() {
    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;
    this.fecha_init = fecha_inicial;
    this.fecha_fin = fecha_final;

    this.searchName.controls.field.setValue('');

    if (fecha_inicial == '' || fecha_final == '') {
      Swal.fire({
        title: 'Debe diligenciar las fechas',
        text: 'Diligencia los rangos de fecha para poder consultar los gastos...',
        icon: 'warning',
        iconColor: '#DC562F',
        showCancelButton: true,
        showConfirmButton: false,
      });
    } else {
      this.loaded = false;
      this.trasladoSucursalesService
        .getTrasladoSucursalesInventarioPorPagina(
          this.page,
          this.search.controls.fecha_inicial.value,
          this.search.controls.fecha_final.value,
          this.searchName.controls.field.value,
          this.size.controls.data.value,
          '',
          this.search.controls.bodega.value,
        )
        .subscribe((resp) => {
          this.page = resp.data.current_page;
          this._data = resp.data.data;
          this.loaded = true;

          this.pages = of(resp.data.links);
        });
    }
  }

  incremento() {
    this.form.controls.tipo_ajuste.setValue(1);
  }
  disminucion() {
    this.form.controls.tipo_ajuste.setValue(2);
  }

  /* Gestiono la carga de archivo  */
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
    this.lockbuttonExcel = true;
    if (this.files) {
      if (
        this.files.type == 'application/vnd.ms-excel' ||
        this.files.type ==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        const formData = new FormData();
        formData.append('archivo', this.files, this.files.name);

        this.trasladoSucursalesService.importarArchivo(formData).subscribe(
          (resp) => {
            this.lockbuttonExcel = false;

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
            this.lockbuttonExcel = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Error al cargar el archivo, verifique, que sea el formato correcto...',
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
        this.lockbuttonExcel = false;
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Debe seleccionar un archivo',
        text: 'El formato debe ser .XLS',
        confirmButtonColor: '#145388',
      });
      this.lockbuttonExcel = false;
    }
  }

  searchStoreProduct(data) {
    this.search.controls.bodega.setValue(data != 0 ? data : 0);

    this.getAjustes(1);
  }

  ///filtrar bodegas diferente a la bodega origen
  filterDistintBodegaOrigen(event: number) {
    const codigoBodega = Number(event);
    // Filtrar el array para eliminar el ítem con el código específico
    const bodegasFiltradas = this._dataBodega.filter(bodega => bodega.codigo !== codigoBodega);
    const infobodega = this.infoTraslado.stockBodega.find(bodega => bodega.id === codigoBodega);
    // Verificar que se haya encontrado la bodega
    if (infobodega) {
      this.form.controls.cantidad_actual.setValue(infobodega.stock);
    }
    this.dataBodegaDestino = bodegasFiltradas;
  }

  filterBodegaSucursal(event: number) {
    const id = Number(event);
    this.form.controls.bodega_destino.setValue('');
    this.form.controls.categoria_producto.setValue('');

    this.getListbodegaSucursal(id);

    ///consulto si el producto existe antes de hacer el traslado
    this.getExistenciaProductoSucursalTraslado();

  }


  filterDistintBodegaOrigenImport(event: number) {
    this.formBodegaAjuste.controls.bodega_destino.setValue('');
    const codigoBodega = Number(event);
    // Filtrar el array para eliminar el ítem con el código específico
    const bodegasFiltradas = this._dataBodega.filter(bodega => bodega.codigo !== codigoBodega);

    this.dataBodegaDestino = bodegasFiltradas;
  }

  onClearProducto() {
    this.cleanData();
  }

}
