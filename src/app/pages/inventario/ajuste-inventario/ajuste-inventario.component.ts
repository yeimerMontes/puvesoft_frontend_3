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
import { AjusteInventarioService } from 'src/app/services/ajustes-inventario';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersAjusteInventario } from 'src/app/constants/producto';
import { NgSelectConfig } from '@ng-select/ng-select';
import { BodegaService } from 'src/app/services/bodega.service';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './ajuste-inventario.component.html',
})
export class AjusteInventarioComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModalImportar', { static: false })
  childModalImportar?: ModalDirective;

  titleModule: string = 'Ajuste de inventario';
  headers: headersMasterInterface[] = headersAjusteInventario;

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

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Gasto';
  action1 = 'Agregar';

  isActionAdd: boolean = true;
  lockbutton: boolean = false;
  lockbuttonExcel: boolean = false;

  loaded = false;
  loaded2 = false;

  page = 1;
  pages: number;
  totalItems: number;

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

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private productoService: ProductoService,
    private ajusteInventarioService: AjusteInventarioService,
    private ngSelectConfig: NgSelectConfig,
    private bodegaService: BodegaService
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
      bodega: ['', [Validators.required]],
      producto: [null, []],
      tipo_ajuste: ['', [Validators.required]],
      cantidad_actual: ['', []],
      cantidad: ['', [Validators.required]],
      valor_compra: ['', []],
      observacion: ['', []],
    });

    this.formBodegaAjuste = this.formBuilder.group({
      bodega: ['', []],
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

    //this.buscar_nombre('');
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
    this.bodegaService.getBodegaPermisos(0).subscribe((resp) => {
      this._dataBodega = resp.data;
    });
  }

  generateExcel() {
    this.ajusteInventarioService
      .getAjusteInventarioPorPagina(
        '',
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.searchName.controls.field.value,
        '',
        'No',
        this.search.controls.bodega.value
      )
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          ' Ajuste de inventario'
        );
      });
  }

  generateFormatoExcelAjustesInventario() {
    this.ajusteInventarioService
      .getDataProductosAjustesMasivos(
        this.formBodegaAjuste.controls.bodega.value
      )
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          'Formato ajustes inventario'
        );
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.ajusteInventarioService
      .getAjusteInventarioPorPagina(
        '',
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.searchName.controls.field.value,
        '',
        'No',
        this.search.controls.bodega.value
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
      this.sucursal = JSON.parse(
        decodeURIComponent(atob(localStorage.getItem(btoa('sucursal'))))
      );
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
    if (this.form.controls.bodega.value == '') {
      this.onSuccess('Debe seleccionar una bodega...', 'error', 'Advertencia!');
    }
    clearTimeout(this.timeClear);
    this.timeClear = setTimeout(() => {
      /* Hago la busqueda */
      this.productoService
        .getBusquedaPorNombreProductosActivosAjuste(
          value,
          this.form.controls.bodega.value,
          5
        )
        .subscribe(
          (resp) => {
            this._dataProducto = resp.data;
          },
          (err) => {
            this.onSuccess(err.error.message, 'error', 'Error');
          }
        );
    }, 360);
  }

  public guardarProducto(item): void {
    this.form.controls.producto.setValue(item.id);
    this.form.controls.cantidad_actual.setValue(
      this.formatearNumber(item.stock)
    );
    this.form.controls.valor_compra.setValue(
      this.formatearNumber(item.valor_compra)
    );
  }

  get dataProducto() {
    return this._dataProducto;
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
    this.ajusteInventarioService
      .getAjusteInventarioPorPagina(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.searchName.controls.field.value,
        this.size.controls.data.value,
        '',
        this.search.controls.bodega.value
      )
      .subscribe((resp) => {
        //console.log(resp);
        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        this._data = resp.data.data;
        this.loaded = true;
        this.count++;
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
      bodega: '',
      producto: null,
      tipo_ajuste: '',
      cantidad_actual: '',
      cantidad: '',
      valor_compra: '',
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
    this._dataProducto = [];

    ///en el caso que solo tenga una bodega, relaciono el campo con el id que tenga
    if (this.form.controls.bodega.value == '' && this.dataBodega.length < 2) {
      const infobodega = this.dataBodega[0];
      this.form.controls.bodega.setValue(infobodega.codigo);
    }

    if (opc == 1) {
      this.action = 'Agregar Nuevo Ajuste de Inventario ';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
    }
    this.childModal?.show();
  }

  openModalImportar() {
    this.formBodegaAjuste.controls.bodega.setValue('');
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.lockbutton = true;

    if (this.isActionAdd) {
      if (this.form.controls.producto.value == '') {
        this.onSuccess(
          'Debe buscar y seleccionar un producto',
          'error',
          'Advertencia!'
        );
      } else if (this.form.controls.tipo_ajuste.value == '') {
        this.onSuccess(
          'Debe seleccionar el tipo de ajuste',
          'error',
          'Advertencia!'
        );
      } else {
        this.ajusteInventarioService
          .addAjusteInventario(this.form.value)
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

              this.onSuccess(err.error.message, 'error', 'Error');
            }
          );
      }
    } /* else {
      this.gastoService
        .putGasto(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Registrado');

          this.closeModal();
          this.form.reset();

          this.getGastos(1);
        });
    } */
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
        text: 'Diligencia los rangos de fecha para poder consultar los ajustes...',
        icon: 'warning',
        iconColor: '#DC562F',
        showCancelButton: true,
        showConfirmButton: false,
      });
    } else {
      this.loaded = false;
      this.ajusteInventarioService
        .getAjusteInventarioPorPagina(
          this.page,
          this.search.controls.fecha_inicial.value,
          this.search.controls.fecha_final.value,
          this.searchName.controls.field.value,
          this.size.controls.data.value,
          '',
          this.search.controls.bodega.value
        )
        .subscribe((resp) => {
          this.page = resp.data.current_page;
          this.totalItems = resp.data.total;
          this.pages = resp.data.last_page;

          this._data = resp.data.data;
          this.loaded = true;
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

        this.ajusteInventarioService.importarArchivo(formData).subscribe(
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

  clearForm() {
    this._dataProducto = [];
    this.form.patchValue({
      producto: null,
      tipo_ajuste: '',
      cantidad_actual: '',
      cantidad: '',
      valor_compra: '',
      observacion: '',
    });
    this.searchProducto.reset({
      producto: null,
    });
    this.buscar_nombre('');
  }

  paginate(event) {
    this.page = event;
    this.getAjustes(this.page);
  }
}
