import { of, Observable } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersCategoriaProducto } from 'src/app/constants/categoria-producto';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { Router } from '@angular/router';
import { PromocionService } from 'src/app/services/promocion.service';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './listado-promocion.component.html',
})
export class ListadoPromocionComponent {
  @ViewChild('staticModalImportar', { static: false })
  childModalImportar?: ModalDirective;

  titleModule: string = 'Historial de promociones';
  headers: headersMasterInterface[] = headersCategoriaProducto;

  form: FormGroup; //variable que controla el formulario
  search1: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nueva categoria';
  action1 = 'Agregar';

  lockbutton: boolean = false;
  lockbuttonImportarExcel: boolean = false;
  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;

  page = 1;
  pages: number;
  totalItems: number;

  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;
  imagenCategoria: string;

  formSubirArchivo: FormGroup;
  files: any;
  habilitar1: any;
  habilitar2 = 'display:none;';
  habilitar3: any;
  nombre_archivo: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private promocionService: PromocionService,
    private exportarExcelService: ExportarExcelService,
    private router: Router
  ) {}

  onSuccess(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Hecho!',
        text: '' + mensaje + ' !',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: 'Ya existe!',
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
      img: ['', []],
      estado: ['', [Validators.required]],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });

     this.search1 = this.formBuilder.group({
      fecha_inicial: ['', []],
      fecha_final: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getpromociones(1);
    this.fechaActual();
  }

  generateExcel() {
    this.promocionService
      .getPromocionPorPagina(
        '',
        this.search.controls.field.value,
        '',
        'No',
        this.search1.controls.fecha_inicial.value,
        this.search1.controls.fecha_final.value
      )
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          'Historial_promociones'
        );
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.promocionService
      .getPromocionPorPagina(
        '',
        this.search.controls.field.value,
        '',
        'No',
        this.search1.controls.fecha_inicial.value,
        this.search1.controls.fecha_final.value
      )
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  get dataPdf() {
    return this._dataPdf;
  }

  getpromociones(page): void {
    //this.loaded = false;
    this.promocionService
      .getPromocionPorPagina(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        '',
        this.search1.controls.fecha_inicial.value,
        this.search1.controls.fecha_final.value
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page = resp.data.current_page;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        // this.total = resp.data.total;
        this._data = resp.data.data;

        //this.dtTrigger.next();
        this.loaded = true;


      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getpromociones(1);
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
      this.getpromociones(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  /* Para poner la fecha actual */
  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    this.search1.controls.fecha_inicial.setValue(`${year}-${month}-${day}`);
    this.search1.controls.fecha_final.setValue(`${year}-${month}-${day}`);
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás la categoria ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.promocionService.deletePromocion(item['id']).subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Eliminado');

          this.getpromociones(1);
        });
      }
    });
  }

  loadImagenCategoria() {
    this.imagenCategoria = this.form.controls.img.value;
  }

  promocion(data) {
    this.router.navigate([`/promociones/gestionPromocion/` + data]);
  }

  buscarHistorial() {
    var fecha_inicial = this.search1.controls.fecha_inicial.value;
    var fecha_final = this.search1.controls.fecha_final.value;

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
      this.getpromociones(1);
    }
  }

  paginate(event) {
    this.page = event;
    this.getpromociones(this.page);
  }
}
