import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import {
  frecuenciaPago,
  selectsPagination,
  tipoCuenta,
} from 'src/app/constants/selects';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HistorialCajaService } from 'src/app/services/historial-caja.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersHistorialCaja } from 'src/app/constants/historial-caja';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { TipoDocumentoService } from 'src/app/services/tipo-documento.service';
import { TipoContratoService } from 'src/app/services/tipo-contrato.service';
import { TipoTrabajadoresService } from 'src/app/services/tipo-trabajador.service';
import { BancosFinancierosService } from 'src/app/services/bancos_financieros.service';
import { emailValidator } from 'src/app/functions/basic';
import { headersEmpleados } from 'src/app/constants/empleados';

@Component({
  selector: 'app-listado',
  templateUrl: './empleado.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class EmpleadoComponent implements OnInit {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  size: FormGroup;
  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  formMetodoPago: FormGroup; //variable que controla el formulario

  titleModule: string = 'Lista de Empleados';
  headers: headersMasterInterface[] = headersEmpleados;

  private _dataReport: any[] = [];
  private _departamentos: any[] = [];
  private _municipios: any[] = [];
  private _tipoDocumentos: any[] = [];
  private _tipoContratos: any[] = [];
  private _tipoTrabajadores: any[] = [];
  private _subTipoTrabajadores: any[] = [];
  private _bancosFinancieros: any[] = [];
  selects: number[] = selectsPagination;
  frecuenciaPago: any[] = frecuenciaPago;
  tipoCuenta: any[] = tipoCuenta;

  private _data = [];

  timeClear: any;

  showTicket = false;
  idInvoice = null;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  loaded = true;
  loaded2 = true;
  lockbutton: boolean = false;

  private _idEdit = 0;

  page = 1;
  pages: number;
  totalItems: number;

  total = 0;
  maxSize;
  nextTemplate;
  type = 1;

  prevTemplate;

  sucursal: String;
  nit: String;
  direccion: String;
  fecha: String;
  logo: String;
  imagen: string;
  usarDecimales: Number = 1;
  tipoSucursal: any;
  totalVenta: string = '0';
  totalVentaMetodoPago: string = '0';
  totalVentaMesa: string = '0';
  totalGastoPdf: string = '0';

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;
  total_registros: any;
  last_page: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private empleadoService: EmpleadoService,
    private departamentoService: DepartamentoService,
    private tipoDocumentoService: TipoDocumentoService,
    private tipoContratoService: TipoContratoService,
    private tipoTrabajadoresService: TipoTrabajadoresService,
    private bancosFinancierosService: BancosFinancierosService
  ) {}

  ngOnInit() {
    //Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      tipo_documento: ['', [Validators.required]],
      documento: ['', [Validators.required]],
      primer_nombre: ['', [Validators.required]],
      segundo_nombre: ['', []],
      primer_apellido: ['', [Validators.required]],
      segundo_apellido: ['', [Validators.required]],
      departamento: ['', [Validators.required]],
      municipio: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, emailValidator]],
      tipo_contrato: ['', [Validators.required]],
      salario_integral: ['', [Validators.required]],
      fecha_inicio_laboral: ['', [Validators.required]],
      salario: ['', [Validators.required]],
      tipo_trabajador: ['', [Validators.required]],
      sub_tipo_trabajador: ['', [Validators.required]],
      frecuencia_pago: ['', [Validators.required]],
      alto_riesgo: ['', [Validators.required]],
      cargo: ['', [Validators.required]],
      vendedor: ['', [Validators.required]],
      meta: ['', []],
      porcentaje_comision: ['', []],
      banco_financiero: ['', [Validators.required]],
      tipo_cuenta: ['', [Validators.required]],
      numero_cuenta: ['', [Validators.required]],
      estado: [''],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
    });

    this, this.getSucural();
    this.getEmpleado(1);
  }

  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.sucursal = resp.data.nombre;
      this.direccion = resp.data.direccion;
      this.nit = resp.data.nit;
      this.fecha = resp.data.fecha;
      this.logo = resp.data.logo;
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.getEmpleado(1, TypeReport.excel);
  }

  generatePdf() {
    this.getEmpleado(1, TypeReport.pdf);
  }

  get data() {
    return this._data;
  }

  get dataReport() {
    return this._dataReport;
  }

  get departamentos() {
    return this._departamentos;
  }

  get municipios() {
    return this._municipios;
  }

  public get tipoDocumentos() {
    return this._tipoDocumentos;
  }

  public get tipoContratos() {
    return this._tipoContratos;
  }

  public get tipoTrabajadores() {
    return this._tipoTrabajadores;
  }

  public get subTipoTrabajadores() {
    return this._subTipoTrabajadores;
  }

  public get bancosFinancieros() {
    return this._bancosFinancieros;
  }

  getNombreFrecuenciaPagoById(id: number): string | undefined {
    const frecuencia = this.frecuenciaPago.find((item) => item.id === id);
    return frecuencia ? frecuencia.nombre : undefined;
  }

  getEmpleado(page, typeReport: TypeReport = TypeReport.noReport): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getService(page, this.total_registros, typeReport);
      return;
    }

    if (!this.search.controls.field.value) {
      this.loaded = false;
    }

    this.getService(page, this.size.controls.data.value);
  }

  getService(
    page,
    perPage,
    typeReport: TypeReport = TypeReport.noReport
  ): void {
    this.empleadoService
      .getEmpleadosPorPagina(
        page,
        perPage,
        this.search.controls.field.value,
        typeReport
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Lista de Empleados'
            );
          }
          return;
        }
        this.total_registros = resp.data.total;
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        this.loaded = true;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        this.last_page = resp.data.last_page;
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

  private getTipoContratos(): void {
    this.tipoContratoService.getTipoContratos().subscribe((resp) => {
      this._tipoContratos = resp.data;
    });
  }

  private getTipoTrabajadores(): void {
    this.tipoTrabajadoresService.getTipoTrabajadores().subscribe((resp) => {
      this._tipoTrabajadores = resp.data;
    });
  }

  private getSubTipoTrabajadores(): void {
    this.tipoTrabajadoresService.getSubTipoTrabajadores().subscribe((resp) => {
      this._subTipoTrabajadores = resp.data;
    });
  }

  private getBancosFinancieros(): void {
    this.bancosFinancierosService.getBancosFinancieros().subscribe((resp) => {
      this._bancosFinancieros = resp.data;
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

  public getTipoDocumentos(): void {
    this.tipoDocumentoService.getTipoDocumentos().subscribe((resp) => {
      this._tipoDocumentos = resp.data;
    });
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    this.getEmpleado(1);
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
      this.getEmpleado(1);
    }, 360);
  }

  cleanData() {
    this.form.reset({
      tipo_documento: '',
      documento: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      departamento: '',
      municipio: '',
      direccion: '',
      telefono: '',
      email: '',
      tipo_contrato: '',
      salario_integral: '',
      fecha_inicio_laboral: '',
      salario: '',
      tipo_trabajador: '',
      sub_tipo_trabajador: '',
      frecuencia_pago: '',
      alto_riesgo: '',
      cargo: '',
      vendedor: '',
      meta: '',
      porcentaje_comision: '',
      banco_financiero: '',
      tipo_cuenta: '',
      numero_cuenta: '',
      estado: 1,
    });
  }

  openModal(opc: number, obj: {} = {}) {
    this.cleanData();
    this.getTipoDocumentos();
    this.getTipoContratos();
    this.getTipoTrabajadores();
    this.getSubTipoTrabajadores();
    this.getBancosFinancieros();

    if (this._departamentos.length == 0) {
      this.getDepartamentos();
    }

    if (opc == 1) {
      this.action = 'Agregar Empleado';
      this.action1 = 'Agregar';
      this.isActionAdd = true;
    } else {
      /* trae y rellena los datos */
      this.form.reset({
        tipo_documento: obj['tipo_documento_id'],
        documento: obj['documento'],
        primer_nombre: obj['primer_nombre'],
        segundo_nombre: obj['segundo_nombre'],
        primer_apellido: obj['primer_apellido'],
        segundo_apellido: obj['segundo_apellido'],
        municipio: obj['municipio_id'] ?? '',
        departamento: obj['departamento_id'] ?? '',
        direccion: obj['direccion'],
        telefono: obj['telefono'],
        email: obj['email'],
        tipo_contrato: obj['tipo_contrato_id'],
        salario_integral: obj['salario_integral'],
        fecha_inicio_laboral: obj['fecha_inicio_laboral'],
        salario: this.formatNumber(Math.round(obj['salario'])),
        tipo_trabajador: obj['tipo_trabajador_id'],
        sub_tipo_trabajador: obj['sub_tipo_trabajador_id'],
        frecuencia_pago: obj['frecuencia_pago'],
        alto_riesgo: obj['alto_riesgo'] ? 1 : 0,
        cargo: obj['cargo'],
        vendedor: obj['vendedor'],
        meta: this.formatNumber(Math.round(obj['meta'])),
        porcentaje_comision: Math.round(obj['porcentaje_comision']),
        banco_financiero: obj['banco_financiero_id'],
        tipo_cuenta: obj['tipo_cuenta'],
        numero_cuenta: obj['numero_cuenta'],
        estado: obj['estado_id'],
      });

      this._idEdit = obj['id'];

      this.action = 'Actualizar Empleado';
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

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  closeModalPdf() {
    this.childModalPdf?.hide();
  }

  onSuccess(title: string, mensaje: string, tipo: TypeAlert): void {
    if (tipo == TypeAlert.success) {
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

      // Mostrar en consola los campos inválidos
      for (const controlName in this.form.controls) {
        if (this.form.controls[controlName].invalid) {
          console.log(`El campo ${controlName} es inválido o está vacío.`);
        }
      }

      return;
    }

    if (this.form.get('salario_integral').value === null) {
      this.onSuccess(
        'Advertencia',
        'Opción de salario integral, se debe diligenciar',
        TypeAlert.warning
      );

      return;
    }
    if (
      this.form.get('vendedor').value == 1 &&
      (this.form.get('porcentaje_comision').value == null || this.form.get('porcentaje_comision').value == '')
    ) {
      this.onSuccess(
        'Advertencia',
        'Debe diligenciar el porcentaje de comisión',
        TypeAlert.warning
      );

      return;
    }

    
    this.lockbutton = true;

    if (this.isActionAdd) {
      this.empleadoService.addEmpleado(this.form.value).subscribe(
        (resp) => {
          this.onSuccess('Registrado', resp.message, TypeAlert.success);
          // console.log(resp.message);
          this.lockbutton = false;
          this.getEmpleado(1);
        },
        (error) => {
          this.lockbutton = false;
          this.onSuccess('Ya existe', error.error.message, TypeAlert.warning);
        }
      );
    } else {
      this.empleadoService
        .putEmpleado(this.form.value, this._idEdit)
        .subscribe((resp) => {
          this.onSuccess('Actualizado', resp.message, TypeAlert.success);

          this.closeModal();
          this.form.reset();

          this.lockbutton = false;
          this.getEmpleado(1);
        });
    }
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
  }

  formatearSalario(event) {
    this.form.controls.salario.setValue(this.formatNumber(event));
  }


  
  formatearMeta(event) {
    this.form.controls.meta.setValue(this.formatNumber(event));
  }

  salarioIntegral(opcion: boolean) {
    if (opcion == true) {
      this.form.controls.salario_integral.setValue(1);
    } else {
      this.form.controls.salario_integral.setValue(0);
    }
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el empleado' + item['nombre'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.empleadoService.deleteEmpleado(item['id']).subscribe((resp) => {
          this.onSuccess(
            'Hecho!',
            'Empleado eliminado Exitosamente...',
            TypeAlert.success
          );

          this.getEmpleado(1);
        });
      }
    });
  }

  paginate(event) {
    this.page = event;
    this.getEmpleado(this.page);
  }
}
