import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { InsumoService } from 'src/app/services/insumo.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { ProduccionService } from 'src/app/services/produccion.service';
import { InsumoProduccionDetalleService } from 'src/app/services/insumo-produccion-detalle.service';
import {
  headersProduccion1,
  headersProduccion2,
} from 'src/app/constants/produccion';

@Component({
  selector: 'app-second',
  templateUrl: './produccion.component.html',
  styleUrls: ['../../../css/modulo.css', './produccion.component.scss'],
})
export class ProduccionComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModal3', { static: false }) childModal3?: ModalDirective;
  @ViewChild('staticModalInsumo', { static: false })
  childModalInsumo?: ModalDirective;

  titleModule: string = 'Modulo de producción';
  headers: headersMasterInterface[] = headersProduccion1;
  headers2: headersMasterInterface[] = headersProduccion2;
  typePdf: any;

  habilitar: string;
  habilitarInsumos: string = 'display:none;';
  habilitarProductos: string;

  $color1 = '#dddddd';

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;
  size_EnProceso: FormGroup;
  size_EnProcesoDetalle: FormGroup;

  sucursal: any;

  formInsumo: FormGroup; //variable que controla el formulario
  searchInsumo: FormGroup; //variable que controla el formulario
  sizeInsumo: FormGroup;

  private _dataPdf: any[] = [];
  private _dataInsumos: any[] = [];
  private _dataInsumoCombo: any[] = [];
  private _dataProducto: any[] = [];

  store: number = 0;

  private _idEdit = 0;

  private _dataLotePreparacion = [];
  private _dataLoteEnProceso = [];
  private _dataLoteEnProcesoDetalle = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Crear Nueva Producción';
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

  page_LotePreparacion = 1;
  page_LoteEnProceso = 1;
  page_LoteEnProcesoDetalle = 1;
  pages_LotePreparacion: number;
  pages_LoteEnProceso: number;
  pages_LoteEnProcesoDetalle: number;
  totalItems_LotePreparacion: number;
  totalItems_LoteEnProceso: number;
  totalItems_LoteEnProcesoDetalle: number;
  total = 0;

  prevTemplate;

  usarDecimales: Number = 1;
  titleInsumo: String;
  cantidad_fabricar: any;
  medida: String;
  habilitar1: any;
  habilitar2 = 'display:none;';
  habilitar3: any;

  habilitar1_update: any;
  habilitar2_update = 'display:none;';
  habilitar3_update: any;

  total_preparacion: any;
  last_page: any;
  type: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private produccionService: ProduccionService,
    private sucursalService: SucursalService,
    private insumosService: InsumoService,
    private insumoProduccionDetalleService: InsumoProduccionDetalleService,
    private funcionesService: FuncionesService,
    private productoService: ProductoService,
    private exportarExcelService: ExportarExcelService
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
      nombre_produccion: ['', [Validators.required]],
      producto: ['', [Validators.required]],
      cantidad_fabricar: ['', [Validators.required]],
    });

    this.formInsumo = this.formBuilder.group({
      produccion: ['', [Validators.required]],
      insumo: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      valor_compra: ['', [Validators.required]],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
      fecha_inicial: [this.getTodayDate(), []], // Asigna la fecha actual
      fecha_final: [this.getTodayDate(), []], // Asigna la fecha actual
      estado: ['', []],
    });
    this.searchInsumo = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.size_EnProceso = this.formBuilder.group({
      data: [10, []],
    });

    this.size_EnProcesoDetalle = this.formBuilder.group({
      data: [10, []],
    });

    this.sizeInsumo = this.formBuilder.group({
      data: [10, []],
    });

    this.getSucural();
    this.getProductos(1);
    this.getProductosEnProceso(1);
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel2() {
    this.produccionService
      .getProduccionPorPagina('', '', '', 'No', 1, this.store)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          'Producción En gestión'
        );
      });
  }

  generateExcel3() {
    this.produccionService
      .getProduccionPorPagina('', '', '', 'No', 2, this.store)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, 'Producción');
      });
  }

  generatePdf(type) {
    /* Consulto la data */
    this.loaded2 = false;
    this.produccionService
      .getProduccionPorPagina('', '', '', 'No', type, this.store)
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

  public getInsumoCombo(produccion_id): void {
    this.loadedInsumo = false;
    this.insumoProduccionDetalleService
      .getInsumoCombo(produccion_id)
      .subscribe((resp) => {
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

  public getProducto(): void {
    this.productoService
      .getProductosPorPagina('', '', '', 'No', '', this.store)
      .subscribe((resp) => {
        this._dataProducto = resp.data;
      });
  }

  get dataPdf() {
    return this._dataPdf;
  }

  get dataProducto() {
    return this._dataProducto;
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
        this.totalItems_LotePreparacion = resp.data.total;
        this.pages_LotePreparacion = resp.data.last_page;
        // this.total = resp.data.total;
        this._dataInsumos = resp.data.data;
        //console.log(this.usar_decimales);

        //this.dtTrigger.next();
        this.loadedInsumo = true;

        //this.pages = of(paginas.slice(1, -1));
      });
  }

  searchStoreProduct(data) {
    this.store = data != 0 ? data : 0;

    this.getProductos(1);
  }

  getProductos(page): void {
    //this.loaded = false;
    this.produccionService
      .getProduccionPorPagina(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        1,
        this.store
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page_LotePreparacion = resp.data.current_page;
        this._dataLotePreparacion = resp.data.data;
        this.totalItems_LotePreparacion = resp.data.total;
        this.pages_LotePreparacion = resp.data.last_page;
        //this.dtTrigger.next();
        this.loaded = true;
      });
  }

  getProductosEnProceso(page): void {
    //this.loaded = false;
    this.produccionService
      .getProduccionPorPagina(
        page,
        this.search.controls.field.value,
        this.size_EnProceso.controls.data.value,
        '',
        2,
        this.store
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page_LoteEnProceso = resp.data.current_page;
        this._dataLoteEnProceso = resp.data.data;
        this.totalItems_LoteEnProceso = resp.data.total;
        this.pages_LoteEnProceso = resp.data.last_page;
        //this.dtTrigger.next();
        this.loaded = true;
      });
  }

  getProductosEnProcesoDetalle(page): void {
    //this.loaded = false;
    this.produccionService
      .getProduccionPorPaginaDetalle(
        page,
        this.search.controls.field.value,
        this.size_EnProcesoDetalle.controls.data.value,
        '',
        3,
        this.store,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.estado.value
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page_LoteEnProcesoDetalle = resp.data.current_page;
        this._dataLoteEnProcesoDetalle = resp.data.data;
        this.totalItems_LoteEnProcesoDetalle = resp.data.total;
        this.pages_LoteEnProcesoDetalle = resp.data.last_page;
        //this.dtTrigger.next();
        this.loaded = true;
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getProductos(1);
  }

  llamarEnProceso() {
    //this.loaded = false;
    this.getProductosEnProceso(1);
  }

  llamarEnProcesoDetalle() {
    //this.loaded = false;
    this.getProductosEnProcesoDetalle(1);
  }

  llamarInsumo() {
    //this.loaded = false;
    this.getInsumos(1);
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductos(1);
    }, 360);
  }

  buscar_EnProceso() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductosEnProceso(1);
    }, 360);
  }

  buscar_EnProcesoDetalle() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductosEnProcesoDetalle(1);
    }, 360);
  }

  buscarInsumo() {
    clearTimeout(this.timeClear);
    this.timeClear = setTimeout(() => {
      this.getInsumos(1);
    }, 360);
  }

  get dataLotePreparacion() {
    return this._dataLotePreparacion;
  }
  get dataLoteEnProceso() {
    return this._dataLoteEnProceso;
  }

  get dataLoteEnProcesoDetalle() {
    return this._dataLoteEnProcesoDetalle;
  }

  cleanData() {
    this.form.reset({
      nombre_produccion: '',
      producto: '',
      cantidad_fabricar: '',
    });
  }

  openModalInsumo(obj: {} = {}) {
    this.formInsumo.controls.cantidad.setValue('');

    this.action = 'Agregar ' + obj['nombre'];
    this.action1 = 'Agregar';
    this.medida = obj['nombre_medida'];

    this.formInsumo.controls.valor_compra.setValue(obj['valor_compra']);
    this.formInsumo.controls.insumo.setValue(obj['id']);
    this.childModalInsumo?.show();
  }

  openModal(opc: number, obj: {} = {}) {
    this._idEdit = obj['id'] ?? 0;
    //esto lo hago para actualizar la lista de bodegas
    this.cleanData();
    this.getProducto();

    if (opc == 1) {
      this.action = 'Crear Producción';
      this.action1 = 'Crear Producción';
      this.isActionAdd = true;
    } else {
      this.form.reset({
        nombre_produccion: obj['nombre_produccion'],
        producto: obj['producto_id'],
        cantidad_fabricar: this.formatearNumber(obj['cantidad_fabricar']),
      });

      /* Deshabilito numero de documento */
      this.action = 'Actualizar Producción';
      this.action1 = 'Actualizar';
      this.isActionAdd = false;
    }
    this.childModal?.show();
  }

  closeModal() {
    this.childModal?.hide();
  }

  closeModalInsumo() {
    this.childModalInsumo?.hide();
  }

  closeModal2() {
    this.childModal2?.hide();
  }

  closeModal3() {
    this.childModal3?.hide();
  }

  openModal2(type) {
    this.typePdf = type;
    if (type == 1) {
      this.titleModule = 'Módulo de producción<br>Producciones';
    } else {
      this.titleModule = 'Módulo de producción<br>Historial Producciones';
    }

    this.childModal2?.show();
    this.generatePdf(type);
  }

  openModal3(type) {
    this.childModal3?.show();
    this.getProductosEnProcesoDetalle(1);
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
    /*  Object.keys(this.formInsumo.controls).forEach(field => {
      const control = this.formInsumo.get(field);
      if (control?.errors) {
        console.log(`Errores en ${field}:`, control.errors);
      }
    }); */

    if (this.formInsumo.invalid) {
      this.formInsumo.markAllAsTouched();
      return;
    }
    this.insumoProduccionDetalleService
      .addInsumo(this.formInsumo.value)
      .subscribe(
        (resp) => {
          if (resp.code == '202') {
            this.onSuccess(resp.message, 'error', 'Ya Existe!');
          } else {
            this.onSuccess(resp.message, 'success', 'Registrado');
            this.closeModalInsumo();
            this.getInsumoCombo(this.formInsumo.controls.produccion.value);
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

    if (this.isActionAdd) {
      this.produccionService.addProduccion(this.form.value).subscribe(
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
          this.lockbutton = false;
          alert('Ocurrió un error');
        }
      );
    } else {
      this.produccionService
        .putProduccion(this.form.value, this._idEdit)
        .subscribe(
          (resp) => {
            this.onSuccess('Actualizado exitosamente', 'success', 'Hecho!');

            this.closeModal();
            this.form.reset();
            this.lockbutton = false;

            this.getProductos(1);
          },
          (err) => {
            this.lockbutton = false;
            alert('Ocurrió un error');
          }
        );
    }
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás la producción ' + item['nombre_produccion'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.produccionService.deleteProduccion(item['id']).subscribe(
          (resp) => {
            this.onSuccess(
              'Producción eliminada exitosamente',
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
        this.insumoProduccionDetalleService
          .deleteInsumo(item['produccion_id'], item['id'])
          .subscribe((resp) => {
            this.onSuccess(
              'Insumo eliminado exitosamente',
              'success',
              'Eliminado'
            );
            this.getInsumoCombo(item.produccion_id);
            this.getProductos(1);
          });
      }
    });
  }

  /* Gestiono insumos */
  gestionInsumos(item) {
    this.titleInsumo =
      'Relacionar Insumos con la producción: ' + item.nombre_produccion;
    this.cantidad_fabricar = item.cantidad_fabricar;
    this.habilitarProductos = 'display:none;';
    this.habilitarInsumos = '';
    this.formInsumo.controls.produccion.setValue(item.id);

    this.getInsumos(1);
    this.getInsumoCombo(item.id);
  }

  regresar() {
    this.habilitarProductos = '';
    this.habilitarInsumos = 'display:none;';
    this.getProductos(1);
  }

  paginateProducto(event) {
    this.page_LotePreparacion = event;
    this.getProductos(this.page_LotePreparacion);
  }

  paginateProductoEnProceso(event) {
    this.page_LoteEnProceso = event;
    this.getProductosEnProceso(this.page_LoteEnProceso);
  }

  paginateProductoEnProcesoDetalle(event) {
    this.page_LoteEnProcesoDetalle = event;
    this.getProductosEnProcesoDetalle(this.page_LoteEnProcesoDetalle);
  }

  paginateInsumo(event) {
    this.page_LotePreparacion = event;
    this.getInsumos(this.page_LotePreparacion);
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
  }

  countDecimalPoints(input: string): number {
    const match = input.match(/\./g);
    return match ? match.length : 0;
  }

  formatearCantidad(event) {
    if (this.countDecimalPoints(event) === 0) {
      this.form.controls.cantidad_fabricar.setValue(this.formatNumber(event));
    }
  }

  iniciarProduccion(item) {
    Swal.fire({
      title: 'Estás seguro de iniciar la produccion?',
      text:
        'Iniciaras la producción de ' +
        item['nombre_produccion'] +
        ', Una vez inicies ya no podras modificar los insumos agregados, ni la información basica!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Iniciar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.produccionService.iniciarProduccion(item['id']).subscribe(
          (resp) => {
            this.onSuccess(
              'Producción iniciada exitosamente',
              'success',
              'Inicio Producción'
            );
            this.getProductos(1);
            this.getProductosEnProceso(1);
          },
          (error) => {
            this.onSuccess(
              error.error.message,
              'error',
              'Producción no iniciada'
            );
          }
        );
      }
    });
  }

  anularProduccion(item) {
    Swal.fire({
      title: 'Estás seguro de anular la produccion?',
      text:
        'Anularas la producción de ' +
        item['nombre_produccion'] +
        ', Una vez la anules, todos los insumos que se descontaron, regresaran nuevamente al inventario!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Iniciar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.produccionService.anularProduccion(item['id']).subscribe(
          (resp) => {
            this.onSuccess(
              'Producción Anulada exitosamente',
              'success',
              'Inicio Producción'
            );
            this.getProductosEnProceso(1);
          },
          (error) => {
            this.onSuccess(
              error.error.message,
              'error',
              'Producción no anulada'
            );
          }
        );
      }
    });
  }

  finalizarProduccion(item) {
    Swal.fire({
      title: 'Estás seguro de finalizar la producción?',
      html: `
    <p>Finalizarás la producción de <strong>${
      item['nombre_produccion']
    }</strong>.</p>
    <p>Una vez finalizada, será enviada al inventario y podrá realizar ventas.</p>
    ${
      item.cantidad_fabricar - item.cantidad_entregada > 0
        ? `<input id="cantidadProduccion" type="number" class="swal2-input" style='text-align:right;font-weight: bold;' placeholder="Ingrese la cantidad producida" value='${
            item.cantidad_fabricar - item.cantidad_entregada
          }'>`
        : ''
    }
  `,
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Finalizar!',
      didOpen: () => {
        const confirmButton = Swal.getConfirmButton();
        const cantidadRestante =
          item.cantidad_fabricar - item.cantidad_entregada;

        if (cantidadRestante === 0) {
          confirmButton.disabled = true; // Deshabilita el botón si la operación es 0
        }
      },
      preConfirm: () => {
        const cantidad = (
          document.getElementById('cantidadProduccion') as HTMLInputElement
        ).value;
        if (!cantidad || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
          Swal.showValidationMessage('Debe ingresar una cantidad válida');
        }
        return cantidad;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const cantidadProduccion = result.value;

        // Enviar la cantidad al servicio
        this.produccionService
          .finalizarProduccion(item['id'], cantidadProduccion)
          .subscribe(
            (resp) => {
              this.onSuccess(
                'Producción finalizada exitosamente',
                'success',
                'Finalización Producción'
              );
              this.getProductosEnProceso(1);
            },
            (error) => {
              this.onSuccess(
                error.error.message,
                'error',
                'Producción no finalizada'
              );
            }
          );
      }
    });
  }
}
