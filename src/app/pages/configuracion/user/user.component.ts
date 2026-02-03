import { of, Observable } from 'rxjs';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { ModuloService } from 'src/app/services/modulo.service';
import { selectsPagination } from 'src/app/constants/selects';
import { headersUser } from 'src/app/constants/user';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { BodegaService } from 'src/app/services/bodega.service';
import { emailValidator } from 'src/app/functions/basic';

@Component({
  selector: 'app-second',
  templateUrl: './user.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class UserComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Lista de Usuarios';
  headers: headersMasterInterface[] = headersUser;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];

  private _idEdit = 0;

  private _data = [];
  private _roles = [];
  private _moduleData = [];
  private _roleEdit = [];
  private _permissionFormData = [];
  dataBodega = [];
  bodegaPermisos = [];

  lockbutton: boolean = false;
  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Usuario';
  action1 = 'Agregar';

  isActionAdd: boolean = true;
  seleccionar: boolean = false;

  loaded = false;
  loaded2 = false;

  page = 1;
  pages: number;
  totalItems: number;

  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;

  sucursal:any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private userService: UserService,
    private exportarExcelService: ExportarExcelService,
    private moduleService: ModuloService,
    private bodegaService: BodegaService
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
        title: 'Advertencia!',
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
      documento: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      direccion: [''],
      telefono: ['', []],
      email: ['', [Validators.required, emailValidator]],
      estado: ['', [Validators.required]],
      cargo: ['', [Validators.required]],
      permisos: ['', []],
      bodega_permisos: ['', []],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));

    // //console.log(this.sucursal);

    this.getUsers(1);
    // this.getRoles();
    this.getPermissionByModule();
  }

  generateExcel() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this.exportarExcelService.getExportar(resp.data, 'Usuarios');
    });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataPdf = resp.data;

      ////console.log(this._dataPdf)
      this.loaded2 = true;
    });
  }

  /**
   * Retorna el vector de los roles del operador
   */
  public get roles() {
    return this._roles;
  }

  get moduleData() {
    return this._moduleData;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  getBodegas() {
    this.bodegaService
      .getBodegaPorPagina('', '', '', 'No', this._idEdit, '')
      .subscribe((resp) => {
        this.dataBodega = resp.data;
      });
  }

  getUsers(page): void {
    //this.loaded = false;
    this.userService
      .getUsersPorPagina(
        page,
        this.search.controls.field.value,
        this.size.controls.data.value,
        ''
      )
      .subscribe((resp) => {
        ////console.log(resp);
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

  /**
   * Obtener permisos por módulo
   */
  getPermissionByModule() {
    this.moduleService.getPermissionByModule().subscribe((resp) => {
      this._moduleData = resp.data;

      // if (this.sucursal.tipo_sucursal == 1) {
      //   let elementoConId2 = this._moduleData.find(
      //     (elemento) => elemento.id === 2
      //   );

      //   // Si se encontró el elemento con id 2
      //   if (elementoConId2) {
      //     // Filtrar las permissions y eliminar la que tiene id 44
      //     elementoConId2.permissions = elementoConId2.permissions.filter(
      //       (permission) => permission.id !== 44
      //     );
      //   }
      // }
    });
  }

  /**
   * Almacenar los permisos seleccionados en la propiedad permisos de roleNuevo
   *
   * @param event any
   * @param permiso any
   */
  onChangePermiso(event: any, idPermiso: any) {
    if (event.target.checked) {
      this._permissionFormData.push(idPermiso);
    } else {
      let index = this._permissionFormData.indexOf(idPermiso);
      this._permissionFormData.splice(index, 1);
    }

    this.form.controls.permisos.setValue(
      JSON.stringify(this._permissionFormData)
    );
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getUsers(1);
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
      this.getUsers(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  get formHasPermission() {
    return this._permissionFormData.length > 0;
  }

  cleanData() {
    this._permissionFormData = [];

    this._roleEdit = [];

    this.form.reset();
    this.form.controls.estado.setValue(1);
  }

  loadEditField(obj: {}) {
    ////console.log(obj['permisos']);
    let cad = [];
    for (let i = 0; i < obj['permisos'].length; i++) {
      const element = obj['permisos'][i];
      cad.push(element.id);
    }

    let backupEdit = {
      documento: obj['documento'],
      nombre: obj['nombre'],
      direccion: obj['direccion'],
      telefono: obj['telefono'],
      estado: obj['estado_id'],
      cargo: obj['cargo'],
      email: obj['email'],
      permisos: JSON.stringify(cad),
      bodega_permisos: JSON.stringify(this.bodegaPermisos),
    };

    this._permissionFormData = cad;
    this._roleEdit = this._permissionFormData;

    this.form.setValue({ ...backupEdit });
  }

  hasPermission(idPermissionModule: number) {
    const permissions = this._roleEdit;

    if (!permissions) {
      return false;
    }

    return permissions.find((element) => element == idPermissionModule)
      ? true
      : false;
  }

  openModal(opc: number, obj: {} = {}) {
    this.bodegaPermisos = [];
    this._idEdit = obj['id'] ?? 0;
    this.getBodegas();
    this.getPermissionByModule();
    this.cleanData();
    if (opc == 1) {
      this.action = 'Agregar Usuario';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      this.form.reset({
        cargo: '',
      });
      this.form.controls.estado.setValue(1);

      /* Habilito numero de documento */
      this.form.get('documento').enable();
    } else {
      this.loadEditField(obj);

      this.action = 'actions.edit';

      /* Deshabilito numero de documento */
      this.form.get('documento').disable();
      this._idEdit = obj['id'];

      this.action = 'Actualizar Usuario';
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

  validarCorreoElectronico(correo: string): boolean {
    // Expresión regular para validar una dirección de correo electrónico
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Comprueba si la cadena cumple con el patrón de la expresión regular
    return regexCorreo.test(correo);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (
      this.validarCorreoElectronico(this.form.controls.email.value) == false &&
      this.form.controls.email.value != null
    ) {
      Swal.fire({
        position: 'center',
        icon: 'info',
        title: 'Advertencia',
        text: 'Email no valido',
        showConfirmButton: false,
        timer: 1800,
      });
      return;
    }

    this.lockbutton = true;
    if (this.isActionAdd) {
      this.userService.addUser(this.form.value, 'user').subscribe(
        (resp) => {
          /* En el caso que este duplixado retorna 201 de lo contraro 200 */
          if (resp.code == '202') {
            this.lockbutton = false;
            this.onSuccess(resp.message, 'error');
          } else {
            Swal.fire({
              title: 'Creado Exitosamente!',
              html:
                'Se ha registrado el usuario: ' +
                resp.data.nombre +
                ' la información de acceso es la siguiente:<br> <b>Usuario</b>:' +
                resp.data.usuario +
                ' <b>Contraseña:</b> ' +
                resp.data.usuario +
                '',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#145388',
              confirmButtonText: 'Ok',
            });
            this.closeModal();
          }

          // //console.log(resp.message);
          this.lockbutton = false;

          this.getUsers(1);
        },
        (err) => {
          this.lockbutton = false;
          alert('Ocurrió un error');
        }
      );
    } else {
      /* //console.log(this._idEdit);
      //console.log(this.form.value); */

      this.userService
        .putUser(this.form.value, this._idEdit)
        .subscribe((resp) => {
          if (resp.code == '202') {
            this.onSuccess(resp.message, 'error');
          } else {
            this.onSuccess(resp.message, 'success');
          }
          this.closeModal();

          this.form.reset();
          this.lockbutton = false;
          this.getUsers(1);
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
        this.userService.deleteUser(item['id']).subscribe((resp) => {
          this.onSuccess('Usuario eliminado Exitosamente...', 'success');

          this.getUsers(1);
        });
      }
    });
  }

  permissionAll(event: any, permisos: any) {
    let listPermisos = JSON.parse(this.form.controls.permisos.value);
    if (listPermisos == null || listPermisos == '') {
      listPermisos = [];
    }
    this._permissionFormData = listPermisos;

    if (event.target.checked) {
      for (let i = 0; i < permisos.length; i++) {
        const elementAdd = permisos[i];
        /* Busco el elemento en la lista */
        const found = listPermisos.find((element) => element === elementAdd.id);
        if (!found) {
          listPermisos.push(elementAdd.id);
        }
      }

      this._permissionFormData = listPermisos;
    } else {
      for (let i = 0; i < permisos.length; i++) {
        const elementAdd = permisos[i];

        let index = this._permissionFormData.indexOf(elementAdd.id);
        this._permissionFormData.splice(index, 1);
      }
    }
    this._roleEdit = this._permissionFormData;
    this.form.controls.permisos.setValue(
      JSON.stringify(this._permissionFormData)
    );
  }

  addBodegaPermiso(item) {
    let body = {
      user: this._idEdit,
      bodega: item.codigo,
    };
    // Busca el índice del elemento en el array `bodegaPermisos`
    const index = this.bodegaPermisos.findIndex(
      (permiso) => permiso.user === body.user && permiso.bodega === body.bodega
    );

    if (index > -1) {
      // Si el elemento ya está en el array, lo elimina
      this.bodegaPermisos.splice(index, 1);
    } else {
      // Si el elemento no está en el array, lo agrega
      this.bodegaPermisos.push(body);
    }

    this.form.controls.bodega_permisos.setValue(
      JSON.stringify(this.bodegaPermisos)
    );

    //console.log(this.bodegaPermisos);
  }

  paginate(event) {
    this.page = event;
    this.getUsers(this.page);
  }
}
