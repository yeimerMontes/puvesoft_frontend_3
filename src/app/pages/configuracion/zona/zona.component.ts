import { of, Observable } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { ZonaService } from 'src/app/services/zona.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersZona } from 'src/app/constants/zona';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './zona.component.html',
})
export class ZonaComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;


  titleModule:string = "Lista de Zonas"; 
  headers: headersMasterInterface[] = headersZona;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];

  private _idEdit = 0;

  private _data = [];
  private _roles = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Usuario';
  action1 = 'Agregar';

  isActionAdd: boolean = true;
  lockbutton: boolean = false;

  loaded = false;
  loaded2 = false;

  pages: Observable<any[]>;
  page = 1;
  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private zonaService: ZonaService,
    private exportarExcelService: ExportarExcelService
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
      estado: ['', [Validators.required]],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getZonas(1);
  }

  generateExcel() {
    this.zonaService.getZonasPorPagina('', '', '', 'No').subscribe((resp) => {
      this.exportarExcelService.getExportar(resp.data, 'Zonas');
    });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.zonaService.getZonasPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataPdf = resp.data;

      //console.log(this._dataPdf)
      this.loaded2 = true;
    });
  }

  /**
   * Retorna el vector de los roles del operador
   */
  public get roles() {
    return this._roles;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  getZonas(page): void {
    //this.loaded = false;
    this.zonaService
      .getZonasPorPagina(
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
    this.getZonas(1);
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
        this.getZonas(this.page + 1);
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getZonas(this.page - 1);
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getZonas(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      nombre: '',
      estado: '1',
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();

    if (opc == 1) {
      this.action = 'Agregar Zona';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
    } else {
      this.form.reset({
        nombre: obj['nombre'],
        estado: obj['estado_id'],
      });
      /* Deshabilito numero de documento */
      this._idEdit = obj['id'];

      this.action = 'Actualizar Zona';
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
      this.zonaService.addZona(this.form.value).subscribe(
        (resp) => {
          /* En el caso que este duplixado retorna 201 de lo contraro 200 */
          if (resp.code == '202') {
            this.onSuccess(resp.message, 'error');
          } else {
            this.onSuccess(resp.message, 'success');
            this.closeModal();
          }

          // console.log(resp.message);
          this.lockbutton = false;

          this.getZonas(1);
        },
        (err) => {
          alert('Ocurrió un error');
        }
      );
    } else {
      /* console.log(this._idEdit);
      console.log(this.form.value); */

      this.zonaService
        .putZona(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess(resp.message, 'success');

          this.closeModal();
          this.form.reset();
          this.lockbutton = false;

          this.getZonas(1);
        });
    }
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el usuario ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.zonaService.deleteZona(item['id']).subscribe((resp) => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Eliminado',
            text: 'Eliminado Exitosamente...!',
            showConfirmButton: false,
            timer: 1500,
          });

          this.getZonas(1);
        });
      }
    });
  }
}
