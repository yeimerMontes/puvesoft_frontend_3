import { Observable, of } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { MesaService } from 'src/app/services/mesa.service';
import { ZonaService } from 'src/app/services/zona.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersMesa } from 'src/app/constants/mesa';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { FuncionesService } from 'src/app/services/funciones.service';
import { SucursalService } from 'src/app/services/sucursal.service';

@Component({
  selector: 'app-second',
  templateUrl: './mesa.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class MesaComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Listado de Mesas';
  headers: headersMasterInterface[] = headersMesa;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];

  private _idEdit = 0;

  private _data = [];
  private _zonas = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nueva Mesa';
  action1 = 'Agregar';

  lockbutton: boolean = false;
  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;

  pages: Observable<any[]>;
  page = 1;
  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;
  usarDecimales: Number = 1;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private mesaService: MesaService,
    private zonaService: ZonaService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService
  ) {}

  onSuccess(mensaje: any, tipo: any): void {
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
      puesto: ['', []],
      zona: ['', [Validators.required]],
      estado: ['', [Validators.required]],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });
    this.getSucural();
    this.getMesas(1);
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  generateExcel() {
    this.mesaService.getMesasPorPagina('', '', '', 'No').subscribe((resp) => {
      this.exportarExcelService.getExportar(resp.data, 'Mesas');
    });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.mesaService.getMesasPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataPdf = resp.data;

      //console.log(this._dataPdf)
      this.loaded2 = true;
    });
  }

  /**
   * Consultar todos los departamentos
   */
  private getZonas(): void {
    this.zonaService.getZonaActivas().subscribe((resp) => {
      this._zonas = resp.data;
      //console.log(this._data);
    });
  }

  get dataPdf() {
    return this._dataPdf;
  }

  get zonas() {
    return this._zonas;
  }

  getMesas(page): void {
    //this.loaded = false;
    this.mesaService
      .getMesasPorPagina(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        ''
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page = resp.data.current_page;
        // this.total = resp.data.total;
        this._data = resp.data.data;

        //this.dtTrigger.next();
        this.loaded = true;

        this.pages = of(resp.data.links);

        //this.pages = of(paginas.slice(1, -1));
      });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getMesas(1);
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
        this.getMesas(this.page + 1);
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getMesas(this.page - 1);
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getMesas(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      nombre: '',
      puesto: '',
      zona: '',
      estado: '1',
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();
    /* Cargo las zonas para  en el caso que quieran hacer el registro de una mesa */
    this.getZonas();

    if (opc == 1) {
      this.action = 'Agregar Mesa';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
    } else {
      this.form.reset({
        nombre: obj['nombre'],
        puesto: obj['puesto'],
        zona: obj['zona_id'],
        estado: obj['estado_id'],
      });
      /* Deshabilito numero de documento */
      this._idEdit = obj['id'];

      this.action = 'Actualizar Mesa';
      this.action1 = 'Actualizar';
      this.isActionAdd = false;
    }
    this.childModal?.show();
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
      this.mesaService.addMesa(this.form.value).subscribe(
        (resp) => {
          /* En el caso que este duplixado retorna 201 de lo contraro 200 */
          if (resp.code == '202') {
            this.onSuccess(resp.message, 'error');
          } else {
            this.onSuccess(resp.message, 'success');
            this.closeModal();
          }
          this.lockbutton = false;

          this.getMesas(1);
        },
        (err) => {
          alert('Ocurrió un error');
        }
      );
    } else {
      /* console.log(this._idEdit);
      console.log(this.form.value); */

      this.mesaService
        .putMesa(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess(resp.message, 'success');

          this.closeModal();
          this.form.reset();
          this.lockbutton = false;
          this.getMesas(1);
        });
    }
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el Mesa ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mesaService.deleteMesa(item['id']).subscribe((resp) => {
          this.onSuccess('Eliminado Exitosamente...', 'success');

          this.getMesas(1);
        });
      }
    });
  }
}
