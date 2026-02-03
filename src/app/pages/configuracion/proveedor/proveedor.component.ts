import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { TipoDocumentoService } from 'src/app/services/tipo-documento.service';
import { ProveedorService } from 'src/app/services/porveedor.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersProveedor } from 'src/app/constants/proveedor';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { RegimenService } from 'src/app/services/regimen.service';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { emailValidator } from 'src/app/functions/basic';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-second',
  templateUrl: './proveedor.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class ProveedorComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Lista de Proveedores';
  headers: headersMasterInterface[] = headersProveedor;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];

  private _idEdit = 0;

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Proveedor';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;
  lockbutton: boolean = false;

  page = 1;
  pages: number;
  totalItems: number;

  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;

  private _tipoDocumentos: any[] = [];

  dropdownSettings: IDropdownSettings;
  private _regimenes: any[] = []; //Un array que almacene los regimenes
  private _departamentos: any[] = [];
  private _municipios: any[] = [];

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private tipoDocumentoService: TipoDocumentoService,
    private proveedorService: ProveedorService,
    private exportarExcelService: ExportarExcelService,
    private regimenService: RegimenService,
    private departamentoService: DepartamentoService,
    private clienteService: ClienteService
  ) {}

  onSuccess(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Hecho!',
        text: '' + mensaje + ' !',
        showConfirmButton: false,
        timer: 2300,
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
      tipo_documento: ['', [Validators.required]],
      documento: ['', [Validators.required]],
      dv: [
        '',
        [
          Validators.required,
          Validators.pattern('^([0-9]{1})$'),
          Validators.maxLength(1),
        ],
      ],
      nombre: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, emailValidator]],
      web: [''],
      departamento: ['', [Validators.required]],
      municipio: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      regimen: ['', [Validators.required]],
      estado: [''],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Seleccionar Todas',
      idField: 'id',
      textField: 'nombre',
      itemsShowLimit: 2,
      allowSearchFilter: false,
      // limitSelection: 1
    };

    this.getProveedores(1);
  }

  generateExcel() {
    this.proveedorService
      .getProveedoresPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, 'Proveedores');
      });
  }

  /**
   * Consultar todos los regimenes
   */
  public getRegimen(): void {
    this.regimenService.getRegimen().subscribe((resp) => {
      this._regimenes = resp.data;
    });
  }

  /**
   * Consultar todos los departamentos
   */
  private getDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe((resp) => {
      this._departamentos = resp.data;
    });
  }

  /**
   * Consultar todos los municipios que pertenecen al departamento con id idDepartamento
   */
  public getMunicipios(): void {
    const idDepartamento = this.form.controls.departamento.value;

    this.departamentoService
      .getMunicipiosByDepartamento(idDepartamento)
      .subscribe((resp) => {
        this._municipios = resp.data;
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.proveedorService
      .getProveedoresPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  public get tipoDocumentos() {
    return this._tipoDocumentos;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  /* Gettear la variable esto es lo que uso en el html y este es el array */
  get regimenes() {
    return this._regimenes;
  }

  get departamentos() {
    return this._departamentos;
  }

  get municipios() {
    return this._municipios;
  }

  /* esta es la funcion que me trae el listado de proveedores */
  getProveedores(page): void {
    //this.loaded = false;
    this.proveedorService
      .getProveedoresPorPagina(
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
    this.getProveedores(1);
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
      this.getProveedores(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  cleanData() {
    this.form.reset({
      tipo_documento: '',
      documento: '',
      regimen: '',
      nombre: '',
      telefono: '',
      email: '',
      web: '',
      municipio: '',
      departamento: '',
      direccion: '',
      estado: '1',
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();
    this.getTipoDocumentos();
    this.getRegimen();
    if (this._departamentos.length == 0) {
      this.getDepartamentos();
    }

    if (opc == 1) {
      this.action = 'Agregar Proveedor';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
      this.form.get('documento').enable();
    } else {
      let regimenItem = [];
      if (obj['regimens_id']) {
        if (Array.isArray(obj['regimens_id'])) {
          regimenItem = obj['regimens_id'];
        }
      }

      /* trae y rellena los datos */
      this.form.reset({
        tipo_documento: obj['tipo_documento_id'],
        documento: obj['documento'],
        dv: obj['dv'],
        regimen: regimenItem,
        nombre: obj['nombre'],
        telefono: obj['telefono'],
        email: obj['email'],
        web: obj['web'],
        municipio: obj['municipio_id'] ?? '',
        departamento: obj['departamento_id'] ?? '',
        direccion: obj['direccion'],
        estado: obj['estado_id'],
      });

      /* Deshabilito numero de documento */
      this.form.get('documento').disable();
      this._idEdit = obj['id'];

      this.action = 'Actualizar Proveedor';
      this.action1 = 'Actualizar';
      this.isActionAdd = false;
    }
    this.getMunicipios();

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

  public getTipoDocumentos(): void {
    this.tipoDocumentoService.getTipoDocumentos().subscribe((resp) => {
      this._tipoDocumentos = resp.data;
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.lockbutton = true;
    if (this.isActionAdd) {
      if (this.form.get('dv').value == null) {
        this.onSuccess(
          'Debe diligenciar el DV del nit',
          'error',
          'Advertencia, DV no diligenciado...'
        );
        return;
      }
      this.proveedorService.addProveedor(this.form.value).subscribe(
        (resp) => {
          /* En el caso que este duplixado retorna 201 de lo contraro 200 */
          if (resp.code == '202') {
            this.onSuccess(resp.message, 'error', 'Ya Existe!');
          } else {
            this.onSuccess(resp.message, 'success', 'Registrado');
            this.closeModal();
          }

          // console.log(resp.message);
          this.lockbutton = false;
          this.getProveedores(1);
        },
        (err) => {
          alert('Ocurrió un error');
        }
      );
    } else {
      /* console.log(this._idEdit);
      console.log(this.form.value); */

      this.proveedorService
        .putProveedor(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Actualizado');

          this.closeModal();
          this.form.reset();

          this.lockbutton = false;

          this.getProveedores(1);
        });
    }
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el proveedor ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.proveedorService.deleteProveedor(item['id']).subscribe((resp) => {
          this.onSuccess(
            'Proveedor eliminado Exitosamente...',
            'success',
            'Hecho!'
          );

          this.getProveedores(1);
        });
      }
    });
  }

  paginate(event) {
    this.page = event;
    this.getProveedores(this.page);
  }

  private rutTimer: any;

  getInfoRut(documento: string) {
    clearTimeout(this.rutTimer); // Limpiar si hay un temporizador previo

    if (documento.length < 5) return; // Solo buscar si hay al menos 5 caracteres

    this.rutTimer = setTimeout(() => {
      this.clienteService.getInfoRut(documento).subscribe(
        (cliente) => {
          this.form.controls.dv.setValue(cliente.data.dv);
          this.form.controls.nombre.setValue(cliente.data.business_name);
          this.form.controls.email.setValue(cliente.data.email);
        },
        (err) => {
          console.log('Cliente no encontrado');
        }
      );
    }, 300); // Esperar 500 ms después de dejar de escribir
  }
}
