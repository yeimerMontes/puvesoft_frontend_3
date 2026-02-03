import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { RegimenService } from 'src/app/services/regimen.service';
import { environment } from 'src/environments/environment';
import { PrintServiceService } from 'src/app/services/print-service.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TipoDocumentoService } from 'src/app/services/tipo-documento.service';
import { FiguraTributariaService } from 'src/app/services/figura-tributaria.service';
import { DOCUMENT } from '@angular/common';
import { paisesMonedas, tipoFactura } from 'src/app/constants/selects';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { TipoHorasService } from 'src/app/services/tipo-horas.service';

@Component({
  selector: 'app-second',
  templateUrl: './sucursal.component.html',
  styleUrls: ['../../dashboard/dashboard.component.css'],
})
export class SucursalComponent {
  form: FormGroup; //variable que controla el formulario

  @ViewChild('print_ticket', { static: false }) print_ticket: ElementRef;

  action = 'actions.add';
  logo: string;
  loaded = false;
  lockbutton: boolean = false;
  vencimiento: string = '';
  qr: string;
  _urlApi = '';
  plan: any;
  usarDecimales: any;

  isActionAdd: boolean = true;

  activeInfoBasic: boolean = true;
  activeConfigPos: boolean = false;
  activeConfigElectronc: boolean = false;
  activeConfigDocumentSoport: boolean = false;
  activeNominaElectronica: boolean = false;

  paisesMonedas = paisesMonedas;

  private _departamentos: any[] = [];
  private _municipios: any[] = [];
  private _regimenes: any[] = []; //Un array que almacene los regimenes}
  private _tipoDocumentoEmpresa: any[] = [];
  private _figuraTributarias: any[] = [];
  tipoFactura: any[] = tipoFactura;

  private _hasProveedorElectronicoId = null;

  dropdownSettings: IDropdownSettings;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos - Aqui debo llamar los revicios
    private sucursalService: SucursalService,
    private departamentoService: DepartamentoService,
    private regimenService: RegimenService,
    private printServiceService: PrintServiceService,
    private tipoDocumentoService: TipoDocumentoService,
    private figurasTributariasService: FiguraTributariaService,
    private funcionesService: FuncionesService,
    private tipoHorasService: TipoHorasService,

    @Inject(DOCUMENT) document: any
  ) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this._urlApi = environmentConfig.menuUrl;
  }

  ngOnInit() {
    // Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipoIdentificacion: ['', [Validators.required]],
      nit: [''],
      dv: ['', [Validators.pattern('^([0-9]{1})$'), Validators.maxLength(1)]],

      regimen: [[], [Validators.required]],
      email: ['', [Validators.email]],
      telefono: [''],
      web: [''],
      departamento: [''],
      municipio: [''],
      direccion: [''],
      tamano_papel: ['', [Validators.required]],
      tamano_letra: ['', [Validators.required]],
      usar_decimales: [''],
      moneda: ['$'],
      caja_all: [false],
      tipo_factura: [1],
      retencion: [0],
      stock_negativo: [''],
      imprimir_ticket: [''],
      valor_bolsa: [0],
      cliente: [''],
      comision_venta: [''],
      propina: [''],
      texto_venta: [''],
      texto_cotizacion: [''],
      prefijo: [''],
      formato_ticket: [],

      resolucion_pos: [''],
      rango_inicial_pos: [''],
      rango_final_pos: [''],
      vigencia_inicial_pos: [''],
      vigencia_final_pos: [''],
      consecutivo_venta: [''],
      pos_resolution_date: [''],
      pos_generated_to_date: [''],

      // Facturación electronica
      factura_elect: [false],
      nombre_fac: [''],
      type_regime_id: [null],
      merchant_registration: [''],

      resolucion_num_dian: ['', [Validators.maxLength(14)]],
      resolucion_date: ['', []],

      generated_to_date: ['0', []],

      prefijo_dian: [''],
      consecutivo_fact_elect: [''],
      min_numero_dian: [''],
      max_numero_dian: [''],
      fecha_inicio_dian: [''],
      fecha_fin_dian: [''],
      clave_tecnica_dian: [''],

      prefijo_credito: [''],
      consec_not_cred: [''],
      nc_from: [''],
      nc_to: [''],

      prefijo_debito: [''],
      consec_not_deb: [''],
      nd_from: [''],
      nd_to: [''],

      //documento soporte
      prefijo_dcs: [''],
      consec_dcs: [''],
      resolucion_dcs: [''],
      ds_resolution_date: [''],
      rango_inicial_dcs: [''],
      rango_final_dcs: [''],
      ds_generated_to_date: [''],
      vigencia_inicial_dcs: [''],
      vigencia_final_dcs: [''],

      prefijo_nota_dcs: [''],
      ds_nc_from: [''],
      ds_nc_to: [''],
      consec_nota_dcs: [''],

      //documentos pos
      prefijo_nota_pos: [''],
      pos_nc_from: [''],
      pos_nc_to: [''],
      consec_nota_pos: [''],

      codigo_postal: [''],

      ne_from: [''],
      ne_to: [''],
      ne_prefix: [''],
      consec_ne: [''],

      ne_crpn_from: [''],
      ne_crpn_to: [''],
      ne_crpn_prefix: [''],
      consec_nota_ne: [''],

      horasExtras: this.formBuilder.array([]),



    });

    if (this._departamentos.length == 0) {
      this.getDepartamentos();
    }

    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Seleccionar Todas',
      idField: 'id',
      textField: 'nombre',
      itemsShowLimit: 2,
      allowSearchFilter: false,
      // limitSelection: 1
    };

    this.getSucursal();
    
    this.getRegimen();
    this.getTipoDocumentosEmpresas();
    this.getFigurasTributarias();
  }

  imprimir() {
    let printContents = this.print_ticket.nativeElement.innerHTML;

    setTimeout(() => {
      this.printServiceService.printDiv('print_ticket', printContents);
      this.printServiceService.isPrinting.subscribe((isPrinting: boolean) => {
        // if (!isPrinting) {
        //   // if (!this.isOpenAlways) {
        //   //   this.editEvent.emit('');
        //   // }
        // }
      });
    }, 300);
  }

  /**
   * Consultar todos los departamentos
   */
  private getDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe((resp) => {
      this._departamentos = resp.data;
    });
  }

  private getTipoDocumentosEmpresas(): void {
    this.tipoDocumentoService.getTipoDocumentos().subscribe((resp) => {
      this._tipoDocumentoEmpresa = resp.data;
    });
  }

  private getTipoHoras(): void {
    this.tipoHorasService.getTipoHoras().subscribe((resp) => {
      this.loadHorasExtras(resp.data);
    });
  }


  private getFigurasTributarias(): void {
    this.figurasTributariasService.getFigurasTributarias().subscribe((resp) => {
      this._figuraTributarias = resp.data;
    });
  }

  get municipios() {
    return this._municipios;
  }

  get departamentos() {
    return this._departamentos;
  }

  get tipoDocumentoEmpresa() {
    return this._tipoDocumentoEmpresa;
  }

  get figuraTributarias() {
    return this._figuraTributarias;
  }

  get hasProveedorElectronicoId() {
    return this._hasProveedorElectronicoId;
  }

  get horasExtras(): FormArray {
    return this.form.get('horasExtras') as FormArray;
  }

  formatearNumberPorcentaje(valor) {
    return this.funcionesService.getFormatearNumero(
      valor,
      this.form.get('usar_decimales').value
    );
  }

  addHoraExtra(hora?: any) {
    return this.formBuilder.group({
      id: [hora.id],
      nombre: [hora.nombre],
      porcentaje: [
        this.formatearNumberPorcentaje(hora.porcentaje),
        [Validators.required, Validators.min(0)],
      ],
    });
  }

   loadHorasExtras(data: any[]) {
    this.horasExtras.clear(); // Limpiar el FormArray actual

    data.forEach((hora) => {
      this.horasExtras.push(this.addHoraExtra(hora)); // Agregar cada hora extra al FormArray
    });
  }

  /* Gettear la variable esto es lo que uso en el html y este es el array */
  get regimenes() {
    return this._regimenes;
  }

  getSucursal() {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.logo = resp.data.logo;
      if (this.logo == null || this.logo == '') {
        this.logo =
          'https://media.istockphoto.com/id/1219544511/es/vector/imagen-galer%C3%ADa-icono-logotipo-vector-illustrattion-plantilla-vectorial-de-dise%C3%B1o-de-icono-de.jpg?s=170667a&w=0&k=20&c=UMUEiVcWt4teR4eMhjXkqWnUgZGMood8isoWmVrCMUQ=';
      }
      this.vencimiento = resp.data.ven_d;
      this.qr = resp.data.sucursal_id;
      this.plan = resp.data.plan;
      this.usarDecimales = resp.data.usar_decimales;

      this._hasProveedorElectronicoId = resp.data.proveedor_electronico_id;
      let regimenItem = [];
      if (resp.data.regimens_id) {
        if (Array.isArray(resp.data.regimens_id)) {
          regimenItem = resp.data.regimens_id;
        }
      }
      this.form.reset({
        nombre: resp.data.nombre,
        tipoIdentificacion: resp.data.tipo_doc_emp_id,
        nit: resp.data.nit,
        dv: resp.data.dv,

        prefijo: resp.data.prefijo,
        consecutivo_venta: resp.data.consecutivo_venta,
        resolucion_pos: resp.data.resolucion_pos,
        rango_inicial_pos: resp.data.rango_inicial_pos,
        rango_final_pos: resp.data.rango_final_pos,
        vigencia_inicial_pos: resp.data.vigencia_inicial_pos,
        vigencia_final_pos: resp.data.vigencia_final_pos,
        pos_resolution_date: resp.data.pos_resolution_date,
        pos_generated_to_date: resp.data.pos_generated_to_date,

        email: resp.data.email,
        regimen: regimenItem,
        telefono: resp.data.telefono,
        web: resp.data.web,
        moneda: resp.data.moneda,
        caja_all: resp.data.caja_all,
        departamento: resp.data.departamento_id
          ? resp.data.departamento_id
          : '',
        municipio: resp.data.municipio_id ? resp.data.municipio_id : '',
        direccion: resp.data.direccion,

        codigo_postal: resp.data.codigo_postal ? resp.data.codigo_postal : '',

        tamano_papel: resp.data.tamano_papel,
        tamano_letra: resp.data.tamano_letra,
        usar_decimales: resp.data.usar_decimales,
        tipo_factura: resp.data.tipo_factura,
        retencion: resp.data.retencion,
        stock_negativo: resp.data.stock_negativo,
        cliente: resp.data.cliente,
        comision_venta: resp.data.comision_venta,
        propina: resp.data.propina,
        imprimir_ticket: resp.data.imprimir_ticket,
        valor_bolsa: resp.data.valor_bolsa,
        texto_venta: resp.data.texto_venta,
        texto_cotizacion: resp.data.texto_cotizacion,

        formato_ticket: resp.data.formato_ticket,
        // Facturación electrónica
        factura_elect: resp.data.is_fact_elect ? true : false,
        nombre_fac: resp.data.business_name ?? '',

        type_regime_id: resp.data.is_fact_elect
          ? resp.data.type_regime_id
          : null,
        merchant_registration: resp.data.is_fact_elect
          ? resp.data.merchant_registration
          : '',

        resolucion_num_dian: resp.data.is_fact_elect
          ? resp.data.resolucion_num_dian
          : '',

        resolucion_date: resp.data.is_fact_elect
          ? resp.data.resolucion_date
          : '',

        generated_to_date: resp.data.is_fact_elect
          ? resp.data.generated_to_date ?? 0
          : '0',

        prefijo_dian: resp.data.is_fact_elect ? resp.data.prefijo_dian : '',
        min_numero_dian: resp.data.is_fact_elect
          ? resp.data.min_numero_dian
          : '',
        max_numero_dian: resp.data.is_fact_elect
          ? resp.data.max_numero_dian
          : '',
        consecutivo_fact_elect: resp.data.is_fact_elect
          ? resp.data.consecutivo_fact_elect
          : '',
        fecha_inicio_dian: resp.data.is_fact_elect
          ? resp.data.fecha_inicio_dian
          : '',
        fecha_fin_dian: resp.data.is_fact_elect ? resp.data.fecha_fin_dian : '',
        clave_tecnica_dian: resp.data.is_fact_elect
          ? resp.data.clave_tecnica_dian
          : '',

        prefijo_credito: resp.data.is_fact_elect
          ? resp.data.prefijo_credito
          : '',
        consec_not_cred: resp.data.is_fact_elect
          ? resp.data.consec_not_cred
          : '',
        nc_from: resp.data.is_fact_elect ? resp.data.nc_from : '',
        nc_to: resp.data.is_fact_elect ? resp.data.nc_to : '',

        prefijo_debito: resp.data.is_fact_elect ? resp.data.prefijo_debito : '',
        consec_not_deb: resp.data.is_fact_elect ? resp.data.consec_not_deb : '',
        nd_from: resp.data.is_fact_elect ? resp.data.nd_from : '',
        nd_to: resp.data.is_fact_elect ? resp.data.nd_to : '',

        //documento soporte
        prefijo_dcs: resp.data.is_fact_elect ? resp.data.prefijo_dcs : '',
        consec_dcs: resp.data.is_fact_elect ? resp.data.consec_dcs : '',
        resolucion_dcs: resp.data.is_fact_elect ? resp.data.resolucion_dcs : '',
        ds_resolution_date: resp.data.is_fact_elect
          ? resp.data.ds_resolution_date
          : '',
        rango_inicial_dcs: resp.data.is_fact_elect
          ? resp.data.rango_inicial_dcs
          : '',
        rango_final_dcs: resp.data.is_fact_elect
          ? resp.data.rango_final_dcs
          : '',
        ds_generated_to_date: resp.data.is_fact_elect
          ? resp.data.ds_generated_to_date
          : '',
        vigencia_inicial_dcs: resp.data.is_fact_elect
          ? resp.data.vigencia_inicial_dcs
          : '',
        vigencia_final_dcs: resp.data.is_fact_elect
          ? resp.data.vigencia_final_dcs
          : '',

        prefijo_nota_dcs: resp.data.is_fact_elect
          ? resp.data.prefijo_nota_dcs
          : '',
        ds_nc_from: resp.data.is_fact_elect ? resp.data.ds_nc_from : '',
        ds_nc_to: resp.data.is_fact_elect ? resp.data.ds_nc_to : '',
        consec_nota_dcs: resp.data.is_fact_elect
          ? resp.data.consec_nota_dcs
          : '',

        ne_prefix:  resp.data.ne_prefix ,
        ne_from:  resp.data.ne_from ,
        ne_to:  resp.data.ne_to ,
        consec_ne:  resp.data.consec_ne ,

        ne_crpn_prefix:  resp.data.ne_crpn_prefix ,
        ne_crpn_from:  resp.data.ne_crpn_from ,
        ne_crpn_to:  resp.data.ne_crpn_to ,
        consec_nota_ne:  resp.data.consec_nota_ne ,

        //documentos pos
        prefijo_nota_pos: resp.data.prefijo_nota_pos,
        pos_nc_from: resp.data.pos_nc_from,
        pos_nc_to: resp.data.pos_nc_to,
        consec_nota_pos: resp.data.consec_nota_pos,
      });

      if (resp.data.is_fact_elect) {
        this.requireFacturacionElectronica();
      }
      // //console.log(resp);
      this.loaded = true;

      this.getMunicipiosByDep(
        resp.data.departamento_id,
        resp.data.municipio_id
      );

      
      this.getTipoHoras();
    });
  }

  requireFacturacionElectronica() {
    this.form.get('type_regime_id').setValidators(Validators.required);

    if (this.form.get('resolucion_num_dian').value) {
      this.form.get('resolucion_num_dian').setValidators(Validators.required);
      this.form.get('resolucion_date').setValidators(Validators.required);
      this.form.get('generated_to_date').setValidators(Validators.required);

      this.form.get('prefijo_dian').setValidators(Validators.required);
      this.form
        .get('consecutivo_fact_elect')
        .setValidators(Validators.required);
      this.form.get('min_numero_dian').setValidators(Validators.required);
      this.form.get('max_numero_dian').setValidators(Validators.required);
      this.form.get('fecha_inicio_dian').setValidators(Validators.required);
      this.form.get('fecha_fin_dian').setValidators(Validators.required);
      this.form.get('clave_tecnica_dian').setValidators(Validators.required);

      this.form.get('prefijo_credito').setValidators(Validators.required);
      this.form.get('consec_not_cred').setValidators(Validators.required);
      this.form.get('prefijo_debito').setValidators(Validators.required);
      this.form.get('consec_not_deb').setValidators(Validators.required);
    } else {
      this.form.get('resolucion_num_dian').clearValidators();
      this.form.get('resolucion_date').clearValidators();
      this.form.get('generated_to_date').clearValidators();

      this.form.get('prefijo_dian').clearValidators();
      this.form.get('consecutivo_fact_elect').clearValidators();
      this.form.get('min_numero_dian').clearValidators();
      this.form.get('max_numero_dian').clearValidators();
      this.form.get('fecha_inicio_dian').clearValidators();
      this.form.get('fecha_fin_dian').clearValidators();
      this.form.get('clave_tecnica_dian').clearValidators();

      this.form.get('prefijo_credito').clearValidators();
      this.form.get('consec_not_cred').clearValidators();
      this.form.get('prefijo_debito').clearValidators();
      this.form.get('consec_not_deb').clearValidators();
    }

    this.form.updateValueAndValidity();
  }

  changeTipoDocumento(event) {
    console.log(event);
  }

  changeFacturaElectronica(event) {
    if (this._hasProveedorElectronicoId) {
      this.form.get('factura_elect').reset({ value: true, disabled: true });
    }
    if (!event.target.checked) {
      this.form.get('factura_elect').reset({ value: false, disabled: true });
    }
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

        this.form.controls.municipio.reset('');
      });
  }

  /**
   * Consultar todos los regimenes
   */
  public getRegimen(): void {
    /* this.regimenService es el nombre que se definio en el constructor
    y getRegimen en el archivo del servicio
     this._regimenes es el array que se creo arriba*/
    this.regimenService.getRegimen().subscribe((resp) => {
      this._regimenes = resp.data;
      ////console.log(this._regimenes);
    });
  }

  /**
   * Consultar todos los municipios que pertenecen al departamento con id idDepartamento
   */
  public getMunicipiosByDep(idDepartamento, idMunicipio): void {
    // //console.log(idMunicipio);

    this.departamentoService
      .getMunicipiosByDepartamento(idDepartamento)
      .subscribe(
        (resp) => {
          this._municipios = resp.data;
          this.form.controls.municipio.reset('');
        },
        (err) => {},
        () => {
          setTimeout(() => {
            this.form.controls.municipio.reset(idMunicipio);
          }, 50);

          ////console.log(new Date());
        }
      );
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

  click() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Espere',
        text: 'Revise que todos los campos no tengan error!',
        showConfirmButton: true,
      });
      return;
    }

    if (this.form.get('factura_elect').value) {
      let mensaje = '';

      if (
        this.form.get('telefono').value == '' ||
        this.form.get('telefono').value == '0' ||
        this.form.get('telefono').value == null
      ) {
        mensaje += 'Telefono';
      }

      let regimen: [] = JSON.parse(
        JSON.stringify(this.form.get('regimen').value)
      );

      if (this.form.get('regimen').value == '[]' || regimen.length == 0) {
        if (mensaje.length > 0) {
          mensaje += '<br>';
        }
        mensaje += 'Regimen';
      }

      if (mensaje.length > 0) {
        Swal.fire({
          title: '<strong>Valide los siguientes campos</strong>',
          icon: 'info',
          html: `Debe ingresar la información de los siguientes campos:<br>${mensaje}`,
          showCloseButton: true,
          showCancelButton: false,
          focusConfirm: false,
          confirmButtonText: `
          Cerrar
        `,
        });

        return;
      }
    }

    var rango_desde = parseInt(this.form.controls.rango_inicial_pos.value);
    var rango_hasta = parseInt(this.form.controls.rango_final_pos.value);
    if (rango_desde > -1 && rango_hasta > -1 && rango_desde > rango_hasta) {
      this.form.controls.rango_inicial_pos.setValue('');
      this.form.controls.rango_final_pos.setValue('');
      this.onSuccess(
        'El rango desde, No puede ser mayor que el rango hasta...'
      );
      return;
    }

    var vigencia_desde = this.form.controls.vigencia_inicial_pos.value;
    var vigencia_hasta = this.form.controls.vigencia_final_pos.value;
    if (
      vigencia_desde != '' &&
      vigencia_hasta != '' &&
      vigencia_desde > vigencia_hasta
    ) {
      this.form.controls.vigencia_inicial_pos.setValue('');
      this.form.controls.vigencia_final_pos.setValue('');
      this.onSuccess(
        'La fecha desde, No puede ser mayor que la fecha hasta...'
      );
      return;
    }

    if (
      this.validarCorreoElectronico(this.form.controls.email.value) == false &&
      this.form.controls.email.value != null
    ) {
      this.onSuccess('Email no valido');
      return;
    }
    if (this.form.controls.nombre.value == '') {
      this.onSuccess('Diligencie el nombre de la empresa');
    } else if (this.form.controls.tamano_letra.value == null) {
      this.onSuccess('Diligencie el tamaño de la letra');
    } else if (this.form.controls.tamano_papel.value == null) {
      this.onSuccess('Diligencie el tamaño del papel');
    } else if (this.form.controls.propina.value == null) {
      this.onSuccess('Debe diligenciar el porcentaje de Serv. Voluntario');
    } else {
      this.lockbutton = true;
      this.sucursalService.putSucursal(this.form.value).subscribe(
        (resp) => {
          this.lockbutton = false;

          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Actualizado',
            text: '' + resp.message + ' !',
            showConfirmButton: false,
            timer: 1800,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1800);
        },
        (error) => {
          this.onError(error.error.message);
          this.lockbutton = false;
        }
      );
    }
  }

  onSuccess(message) {
    Swal.fire({
      position: 'center',
      icon: 'info',
      title: 'Advertencia',
      text: '' + message + ' !',
      showConfirmButton: false,
      timer: 1800,
    });
  }

  onError(message) {
    Swal.fire({
      position: 'center',
      icon: 'info',
      title: 'Advertencia',
      text: '' + message + ' !',
      showConfirmButton: true,
    });
  }

  controlMenu(option) {
    const optionMappings = {
      1: {
        activeInfoBasic: true,
        activeConfigPos: false,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: false,
        activeNominaElectronica: false,
      },
      2: {
        activeInfoBasic: false,
        activeConfigPos: true,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: false,
        activeNominaElectronica: false,
      },
      3: {
        activeInfoBasic: false,
        activeConfigPos: false,
        activeConfigElectronc: true,
        activeConfigDocumentSoport: false,
        activeNominaElectronica: false,
      },
      4: {
        activeInfoBasic: false,
        activeConfigPos: false,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: true,
        activeNominaElectronica: false,
      },
      6: {
        activeInfoBasic: false,
        activeConfigPos: false,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: false,
        activeNominaElectronica: true,
      },
    };

    if (option in optionMappings) {
      const mapping = optionMappings[option];
      this.activeInfoBasic = mapping.activeInfoBasic;
      this.activeConfigPos = mapping.activeConfigPos;
      this.activeConfigElectronc = mapping.activeConfigElectronc;
      this.activeConfigDocumentSoport = mapping.activeConfigDocumentSoport;
      this.activeNominaElectronica = mapping.activeNominaElectronica;
    }
    setTimeout(() => {
      this.controlMenu2(option);
    }, 150);
  }

  controlMenu2(option) {
    const optionMappings = {
      1: {
        activeInfoBasic: true,
        activeConfigPos: false,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: false,
      },
      2: {
        activeInfoBasic: false,
        activeConfigPos: true,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: false,
      },
      3: {
        activeInfoBasic: false,
        activeConfigPos: false,
        activeConfigElectronc: true,
        activeConfigDocumentSoport: false,
      },
      4: {
        activeInfoBasic: false,
        activeConfigPos: false,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: true,
      },
       6: {
        activeInfoBasic: false,
        activeConfigPos: false,
        activeConfigElectronc: false,
        activeConfigDocumentSoport: false,
        activeNominaElectronica: true,
      },
    };

    if (option in optionMappings) {
      const mapping = optionMappings[option];
      this.activeInfoBasic = mapping.activeInfoBasic;
      this.activeConfigPos = mapping.activeConfigPos;
      this.activeConfigElectronc = mapping.activeConfigElectronc;
      this.activeConfigDocumentSoport = mapping.activeConfigDocumentSoport;
      this.activeNominaElectronica = mapping.activeNominaElectronica;
    }
  }
}
