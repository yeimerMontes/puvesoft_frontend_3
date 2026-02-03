import { Observable, of } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2'
import { selectsPagination } from 'src/app/constants/selects';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { CategoriaGastoService } from 'src/app/services/categoria-gasto.servic';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersCategoriaGastos } from 'src/app/constants/categoria-gastos';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './categoria-gastos.component.html',
})
export class CategoriaGastoComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule:string = "Categorias de Gastos"; 
  headers: headersMasterInterface[] = headersCategoriaGastos;


  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];
  private _idEdit = 0;

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nueva categoria';
  action1 = 'Agregar';

  lockbutton: boolean = false;
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



  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private categoriaGastoService: CategoriaGastoService,
    private exportarExcelService: ExportarExcelService,


  ) { }

  onSuccess(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: "" + mensaje + " !",
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      Swal.fire({
        title: 'Ya existe!',
        text: "" + mensaje + "!",
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388'
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

    this.getCategoriaGastos(1);

  }

  generateExcel() {
    this.categoriaGastoService.getCategoriaGastoPorPagina('', '', '', 'No').subscribe(
      resp => {
        this.exportarExcelService.getExportar(resp.data,'Categoria Gastos');
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.categoriaGastoService.getCategoriaGastoPorPagina('', '', '', 'No').subscribe(
      resp => {
        this._dataPdf = resp.data

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  get dataPdf() {
    return this._dataPdf;
  }


  getCategoriaGastos(page): void {
    //this.loaded = false;
    this.categoriaGastoService
      .getCategoriaGastoPorPagina(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        ''
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
        //this.pages = of(paginas.slice(1, -1));
      });
  }



  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getCategoriaGastos(1);
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
      this.getCategoriaGastos(1);
    }, 360);
  }


  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      nombre: '',
      img: '',
      estado: '1'
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();

    if (opc == 1) {
      this.action = 'Agregar Categoria';
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

      this.action = 'Actualizar Categoria';
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
      this.categoriaGastoService.addCategoriaGasto(this.form.value).subscribe(
        (resp) => {
          console.log('Entre');

          if (resp.code == '202') {
            this.onSuccess(resp.message, "error", "Ya Existe!");
          } else {
            this.onSuccess(resp.message, "success", "Registrado");
            this.closeModal();
          }

          this.lockbutton = false;

          this.getCategoriaGastos(1);
        },
        (err) => {
          alert('Ocurrió un error');
        }
      );
    } else {
      /* console.log(this._idEdit);
      console.log(this.form.value); */

      this.categoriaGastoService
        .putCategoriaGasto(this.form.value, this._idEdit)
        .subscribe((resp) => {
          if (resp.code == '202') {
            this.onSuccess(resp.message, "error", "Ya Existe!");
          } else {
            this.onSuccess(resp.message, "success", "Hecho!");
          }

          this.closeModal();
          this.form.reset();
          this.lockbutton = false;
          this.getCategoriaGastos(1);
        });
    }
  }


  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: "Eliminarás la categoria " + item['nombre'] + "!",
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaGastoService.deleteCategoriaGasto(item['id']).subscribe((resp) => {
          /* En el caso que la categoria este siendo usada no dejo que la elimine */
          //console.log(resp)
          if (resp.code == '202') {
            this.onSuccess(resp.message, "error","Categoria usada por Gastos");
          } else {
            this.onSuccess(resp.message, "success","Eliminado");
            this.closeModal();
          }

          this.getCategoriaGastos(1);
        }
        )
      }
    })
  }

  paginate(event) {
    this.page = event;
    this.getCategoriaGastos(this.page);
  }
}
