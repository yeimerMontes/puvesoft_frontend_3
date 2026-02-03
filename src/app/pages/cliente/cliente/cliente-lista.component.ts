import { Router } from '@angular/router';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { SucursalService } from 'src/app/services/sucursal.service';
import { TipoDocumentoService } from 'src/app/services/tipo-documento.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { selectsPagination } from 'src/app/constants/selects';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersCliente } from 'src/app/constants/cliente';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { emailValidator } from 'src/app/functions/basic';

@Component({
  selector: 'app-second',
  templateUrl: './cliente-lista.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class ClienteListaComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Lista de Clientes';
  headers: headersMasterInterface[] = headersCliente;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataPdf: any[] = [];
  private _departamentos: any[] = [];
  private _municipios: any[] = [];

  private _idEdit = 0;

  private _data = [];

  selects: number[] = selectsPagination;

  timeClear: any;

  action = 'Agregar Nuevo Cliente';
  action1 = 'Agregar';

  isActionAdd: boolean = true;
  lockbutton: boolean = false;

  loaded = false;
  loaded2 = false;

  page = 1;
  pages: number;
  totalItems: number;

  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;

  /* Variables del PDF */
  sucursal: String;
  nit: String;
  direccion: String;
  fecha: String;
  logo: String;

  private _tipoDocumentos: any[] = [];

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private tipoDocumentoService: TipoDocumentoService,
    private clienteService: ClienteService,
    private exportarExcelService: ExportarExcelService,
    private router: Router,
    private departamentoService: DepartamentoService
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
      tipo_documento: ['', [Validators.required]],
      documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      dv: ['', []],
      nombre: ['', [Validators.required]],
      telefono: ['', [Validators.maxLength(18)]],
      email: ['', [Validators.required, emailValidator]],
      direccion: [''],
      departamento: ['', []],
      municipio: ['', []],
      estado: ['', [Validators.required]],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getClientes(1);
  }

  generateExcel() {
    this.clienteService
      .getClientesPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(resp.data, 'Clientes');
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
    this.getSucural();
    /* Consulto la data */
    this.loaded2 = false;
    this.clienteService
      .getClientesPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        //console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      //console.log(resp)
      this.sucursal = resp.data.nombre;
      this.direccion = resp.data.direccion;
      this.nit = resp.data.nit;
      this.fecha = resp.data.fecha;
      this.logo = resp.data.logo;
    });
  }

  public get tipoDocumentos() {
    return this._tipoDocumentos;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  /* esta es la funcion que me trae el listado de proveedores */
  getClientes(page): void {
    //this.loaded = false;
    this.clienteService
      .getClientesPorPagina(
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
    this.getClientes(1);
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
      this.getClientes(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  get departamentos() {
    return this._departamentos;
  }

  get municipios() {
    return this._municipios;
  }

  cleanData() {
    this.form.reset({
      tipo_documento: '',
      documento: '',
      dv: '',
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      municipio: '',
      departamento: '',
      estado: '1',
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();
    this.getTipoDocumentos();
    if (this._departamentos.length == 0) {
      this.getDepartamentos();
    }

    if (opc == 1) {
      this.action = 'Agregar Cliente';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
      /* Habilito numero de documento */
      //this.form.get('documento').enable();
    } else {
      /* trae y rellena los datos */
      this.form.reset({
        tipo_documento: obj['tipo_documento_id'],
        documento: obj['documento'],
        dv: obj['dv'],
        nombre: obj['nombre'],
        telefono: obj['telefono'],
        email: obj['email'],
        direccion: obj['direccion'],
        municipio: obj['municipio_id'] ?? '',
        departamento: obj['departamento_id'] ?? '',
        estado: obj['estado_id'],
      });
      /* Deshabilito numero de documento */
      //this.form.get('documento').disable();
      //this.form.get('dv').disable();
      this._idEdit = obj['id'];

      this.action = 'Actualizar Cliente';
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
      this.clienteService.addCliente(this.form.value).subscribe(
        (resp) => {
          /* En el caso que este duplixado retorna 201 de lo contraro 200 */

          this.onSuccess(resp.message, 'success', 'Registrado');
          this.closeModal();
          // console.log(resp.message);
          this.lockbutton = false;
          this.getClientes(1);
        },
        (err) => {
          this.lockbutton = false;
          this.onSuccess(err.error.message, 'error', 'Advertencia!');
        }
      );
    } else {
      /* console.log(this._idEdit);
      console.log(this.form.value); */

      this.clienteService.putCliente(this.form.value, this._idEdit).subscribe(
        (resp) => {
          this.onSuccess(resp.message, 'success', 'Actualizado');

          this.closeModal();
          this.form.reset();

          this.lockbutton = false;
          this.getClientes(1);
        },
        (err) => {
          this.lockbutton = false;
          this.onSuccess(err.error.message, 'error', 'Advertencia!');
        }
      );
    }
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el cliente ' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.deleteCliente(item['id']).subscribe((resp) => {
          this.onSuccess(
            'Registro eliminado Exitosamente...',
            'success',
            'Eliminado'
          );

          this.getClientes(1);
        });
      }
    });
  }

  verDetalleCliente(id, nombre) {
    /* Guardo EL nombre en localstorage */
    localStorage.setItem(btoa('nombreCliente'), btoa(nombre));

    this.router.navigate([`/cliente/detallecliente/${id}`]);
  }

  paginate(event) {
    this.page = event;
    this.getClientes(this.page);
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
