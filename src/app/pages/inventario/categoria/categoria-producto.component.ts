import { of, Observable } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersCategoriaProducto } from 'src/app/constants/categoria-producto';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css', '../producto/producto.component.scss'],
  templateUrl: './categoria-producto.component.html',
})
export class CategoriaProductoComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModalImportar', { static: false })
  childModalImportar?: ModalDirective;

  titleModule: string = 'Lista de categorías de productos';
  headers: headersMasterInterface[] = headersCategoriaProducto;

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
  lockbuttonImportarExcel: boolean = false;
  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;

  pages: number;
  totalItems: number;
  page = 1;
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
    private categoriaProductoService: CategoriaProductoService,
    private exportarExcelService: ExportarExcelService
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

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getCategoriaProductos(1);
    this.createForm();
  }

  createForm() {
    this.formSubirArchivo = this.formBuilder.group({
      archivo: [null, Validators.required],
    });
  }
  get f() {
    return this.formSubirArchivo.controls;
  }

  generateExcel() {
    this.categoriaProductoService
      .getCategoriaProductoPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, 'Categoria Productos');
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.categoriaProductoService
      .getCategoriaProductoPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  get dataPdf() {
    return this._dataPdf;
  }

  getCategoriaProductos(page): void {
    //this.loaded = false;
    this.categoriaProductoService
      .getCategoriaProductoPorPagina(
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
    this.getCategoriaProductos(1);
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
      this.getCategoriaProductos(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      nombre: '',
      img: '',
      estado: '1',
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();
    this.loadImagenCategoria();

    if (opc == 1) {
      this.action = 'Agregar Categoria';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
    } else {
      this.form.reset({
        nombre: obj['nombre'],
        img: obj['img'],
        estado: obj['estado_id'],
      });
      this.imagenCategoria = obj['img'];
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

  openModalImportar() {
    this.childModalImportar.show();
  }

  closeModalImportar() {
    this.childModalImportar?.hide();
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
      this.categoriaProductoService
        .addCategoriaProducto(this.form.value)
        .subscribe(
          (resp) => {
            if (resp.code == '202') {
              this.onSuccess(resp.message, 'error', 'Ya Existe!');
            } else {
              this.onSuccess(resp.message, 'success', 'Registrado');
              this.closeModal();
            }
            this.lockbutton = false;
            this.getCategoriaProductos(1);
          },
          (err) => {
            alert('Ocurrió un error');
          }
        );
    } else {
      /* console.log(this._idEdit);
      console.log(this.form.value); */

      this.categoriaProductoService
        .putCategoriaProducto(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Registrado');

          this.closeModal();
          this.form.reset();
          this.lockbutton = false;
          this.getCategoriaProductos(1);
        });
    }
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

        this.categoriaProductoService.importarArchivo(formData).subscribe(
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
        this.categoriaProductoService
          .deleteCategoriaProducto(item['id'])
          .subscribe((resp) => {
            /* En el caso que la categoria este siendo usada no dejo que la elimine */
            //console.log(resp)
            if (resp.code == '202') {
              this.onSuccess(
                resp.message,
                'error',
                'Categoria usada por productos'
              );
            } else {
              this.onSuccess(resp.message, 'success', 'Eliminado');
              this.closeModal();
            }

            this.getCategoriaProductos(1);
          });
      }
    });
  }

  loadImagenCategoria(){
    this.imagenCategoria = this.form.controls.img.value;
  }

  
  paginate(event) {
    this.page = event;
    this.getCategoriaProductos(this.page);
  }
}
