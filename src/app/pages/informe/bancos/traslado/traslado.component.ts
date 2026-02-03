import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { selectsPagination } from 'src/app/constants/selects';
import { Chart } from 'angular-highcharts';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BancosService } from 'src/app/services/bancos.service';
import { Router } from '@angular/router';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersBancoSeguimiento } from 'src/app/constants/banco';
import { headersBancoTraslados } from 'src/app/constants/banco-traslados';
import { UserService } from 'src/app/services/user.service';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './traslado.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css'],
})
export class TrasladoComponent implements OnInit {
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;

  size: FormGroup;
  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  formAjuste: FormGroup;

  titleModule: string = 'Traslados de bancos';
  headers: headersMasterInterface[] = headersBancoTraslados;

  fecha_init: string;
  fecha_fin: string;

  selects: number[] = selectsPagination;

  private _data = [];
  private _dataReport = [];

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  loaded = true;
  loaded2 = true;
  isChecked: boolean = false;
  isChecked2: boolean = false;
  lockbutton: boolean = false;

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
  busquedaPorCodigo: String = '';

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;

  chartArr: Chart[] = [];
  categorias = [];
  listUsers = [];
  metodosPago = [];
  _arrBancos = [];
  nombresProductos = [];
  totalesProductos = [];
  total_registros: number;
  last_page: any;

  showApertura = false;
  showInputCaja = false;

  cajaAbierta = false;

  closeApertura(event) {
    this.showApertura = false;
  }

   canViewOpen(event) {
    if (event.target.value === '1') {
      this.cajaService.estadoCaja().subscribe((resp) => {
        if (!(resp && resp.data && resp.data.length > 0)) {
          this.showApertura = true;
          this.cajaAbierta = false;
        } else {
          this.cajaAbierta = true;
        }
      });
    } else {
      this.showApertura = false;
      this.cajaAbierta = false;
    }
  }

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private bancosServices: BancosService,
    private router: Router,
    private userService: UserService,
    private cajaService: CierreCajaService,
  
  ) {}

  ngOnInit() {
    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      fecha_final: ['', []],
      hora_inicial: ['', []],
      hora_final: ['', []],
      user: [null, []],
      metodo_pago: [null, []],
    });

    this.formAjuste = this.formBuilder.group({
      metodo_pago_origen: [null, [Validators.required]],
      valor_original_origen: ['', [Validators.required]],

      metodo_pago_destino: [null, [Validators.required]],
      valor_original_destino: ['', [Validators.required]],

      cantidad: ['', [Validators.required]],
      observacion: ['', [Validators.required]],

      sacar_caja: ['', []],
    });

    this.fechaActual();
    this.getSucural();
    this.getHistorial(1);
    this.getUsers();
    this.getMetodosPago();
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

  getUsers(): void {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this.listUsers = resp.data;
    });
  }

  getMetodosPago(): void {
    this.bancosServices.getBancos().subscribe((resp) => {
      this.metodosPago = resp.data;
    });
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  getBancos(page, perPage, typeReport: TypeReport = TypeReport.noReport) {
    this.categorias = [];

    this.bancosServices
      .getBancosTraslados(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.metodo_pago.value,
        this.search.controls.user.value,
        perPage,
        typeReport
      )
      .subscribe((resp) => {
        if (typeReport != TypeReport.noReport) {
          this._dataReport = resp.data.data;
          this.loaded2 = true;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              this._dataReport,
              'Historial Bancos'
            );
          }
          return;
        }

        console.log('Datos de bancos:', this._data);

        this.total = 0;
        // this.total = resp.total.total_movimiento;

        this.total_registros = resp.data.total;
        this.page = resp.data.current_page;
        this._data = resp.data.data;
        this.loaded = true;
        this.count++;
        this.totalItems = resp.data.total;
        this.pages = resp.data.last_page;
        this.last_page = resp.data.last_page;

        console.log('Datos de bancos:', this._data);
      });
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  closeModalPdf() {
    this.childModalPdf?.hide();
  }

  closeModal() {
    this.childModal?.hide();
  }

  generateExcel() {
    this.getHistorial(1, TypeReport.excel);
  }

  generatePdf() {
    this.getHistorial(1, TypeReport.pdf);
  }

  get data() {
    return this._data;
  }

  get dataReport() {
    return this._dataReport;
  }

  get arrBancos() {
    return this._arrBancos;
  }

  getHistorial(page, typeReport: TypeReport = TypeReport.noReport): void {
    if (typeReport != TypeReport.noReport) {
      this.loaded2 = false;
      this.getBancos(page, this.total_registros, typeReport);
      return;
    }
    this.loaded = false;
    this.getBancos(page, this.size.controls.data.value);
  }

  count = 0;

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    this.getHistorial(1);
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
      this.getHistorial(1);
    }, 360);
  }

  cleanData() {
    this.form.reset({
      categoria: '',
      proveedor: '',
      descripcion: '',
      valor: '',
      sacar_caja: '',
    });
  }

  onSuccess(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
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

  /* Para poner la fecha actual */
  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    this.search.controls.fecha_inicial.setValue(`${year}-${month}-${day}`);
    this.search.controls.fecha_final.setValue(`${year}-${month}-${day}`);
    this.search.controls.hora_inicial.setValue(`00:00`);
    this.search.controls.hora_final.setValue(`23:59`);
  }

  buscarHistorialVencimiento() {
    let fecha_inicial_vencimiento =
      this.search.controls.fecha_inicial_vencimiento.value;
    let fecha_final_vencimiento =
      this.search.controls.fecha_final_vencimiento.value;

    if (!(fecha_inicial_vencimiento || fecha_final_vencimiento)) {
      this.onSuccess(
        'Debe diligenciar las fechas de vencimiento',
        'Diligencie los rangos de fecha de vencimiento para poder consultar las ventas por categorías...',
        TypeAlert.warning
      );
      return;
    }

    if (!fecha_inicial_vencimiento && fecha_final_vencimiento) {
      this.onSuccess(
        'Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha inicial de vencimiento para poder consultar las ventas por categorías...',
        TypeAlert.warning
      );
      return;
    }

    if (fecha_inicial_vencimiento && !fecha_final_vencimiento) {
      this.onSuccess(
        'Debe diligenciar ambas fechas de vencimiento',
        'Diligencie la fecha final de vencimiento para poder consultar las ventas por categorías...',
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.getHistorial(1);
    }
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';

    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;

    if (!(fecha_inicial || fecha_final)) {
      this.onSuccess(
        'Debe diligenciar las fechas',
        'Diligencie los rangos de fecha para poder consultar las ventas por categorías...',
        TypeAlert.warning
      );
      return;
    } else {
      this.loaded = true;
      this.getHistorial(1);
    }
  }

  grafica(categoria: string, total: any[], unidades: any[]) {
    const grafica = new Chart({
      chart: {
        type: 'pie',
      },
      title: {
        text: 'PRODUCTOS MÁS VENDIDOS',
      },
      subtitle: {
        text: `CATEGORÍA: ${categoria}`.toUpperCase(),
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 100,
        floating: true,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        shadow: true,
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          type: 'pie',
          name: 'Total',
          data: total,
        },
      ],
    });
    this.chartArr.push(grafica);
  }

  navigateBanco() {
    this.router.navigate(['/informe/bancos']);
  }

  campoEsValido(campo: string) {
    return this.formAjuste.controls[campo].errors;
  }

  findMetodoPago(id) {
    return this.metodosPago.find((element) => element.metodo_pago_id == id);
  }

  cambiarMetodoPago(isOrigen: boolean = true) {

    if (isOrigen) {
      let metodo_pago_origen = this.formAjuste.controls['metodo_pago_origen'].value;
      let found = this.findMetodoPago(metodo_pago_origen);

      this.formAjuste.controls['valor_original_origen'].setValue(found.total);

      this.changeAmount(this.formAjuste.controls['cantidad'].value);
    } else {
      let metodo_pago_destino = this.formAjuste.controls['metodo_pago_destino'].value;
      let found = this.findMetodoPago(metodo_pago_destino);

      this.formAjuste.controls['valor_original_destino'].setValue(found.total);
    }

    if (this.formAjuste.controls['metodo_pago_origen'].value ===
        this.formAjuste.controls['metodo_pago_destino'].value) {
      this.formAjuste.controls['metodo_pago_destino'].setValue(null);
      this.formAjuste.controls['valor_original_destino'].setValue('');
      Swal.fire({
        title: 'Error',
        text: 'El método de pago origen y destino no pueden ser iguales.',
        icon: 'error',
        confirmButtonColor: '#145388',
      });
    }

     if (this.formAjuste.controls['metodo_pago_origen'].value == 1 || this.formAjuste.controls['metodo_pago_destino'].value == 1) {
      this.showInputCaja = true;
      this.formAjuste.get('sacar_caja').reset('0');
    } else {
      this.showInputCaja = false;
      this.formAjuste.get('sacar_caja').reset('0');
    }

    if (this.formAjuste.controls['sacar_caja'].value != '1') {
      this.showApertura = false;
    }

  }

  changeAmount(valor) {
    // valor = valor+"";
    // let valor_original_origen = this.formAjuste.controls['valor_original_origen'].value;

    // if (valor != '') {
    //   if ((+valor) > (+valor_original_origen)) {
    //   this.formAjuste.controls['cantidad'].setValue('');

    //   Swal.fire({
    //     title: 'Error',
    //     text: 'El valor a trasladar no puede ser mayor al valor actual del banco de origen.',
    //     icon: 'error',
    //     confirmButtonColor: '#145388',
    //   });
    // }
    // }
  }

  openModal() {
    this.isChecked = false;
    this.isChecked2 = false;
    this.childModal?.show();
    this.formAjuste = this.formBuilder.group({
      metodo_pago_origen: [null, [Validators.required]],
      valor_original_origen: ['', [Validators.required]],
      metodo_pago_destino: [null, [Validators.required]],
      valor_original_destino: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      observacion: ['', [Validators.required]],
      sacar_caja: ['0', []],
    });
  }

  onSubmit() {
    if (this.formAjuste.invalid) {
      this.formAjuste.markAllAsTouched();

      let msg = '<ul>';

      if (this.campoEsValido('metodo_pago_origen')) {
        msg += '<li>El método de pago origen es obligatorio.</li>';
      }

      if (this.campoEsValido('metodo_pago_destino')) {
        msg += '<li>El método de pago destino es obligatorio.</li>';
      }

      if (this.campoEsValido('cantidad')) {
        msg += '<li>La cantidad a ajustar es obligatoria.</li>';
      }

      if (this.campoEsValido('observacion')) {
        msg += '<li>La observación es obligatoria.</li>';
      }

      msg += '</ul>';

      if (msg !== '<ul></ul>') {
        // Mostrar el mensaje de error al usuario utilizando SweetAlert2 para mejorar la experiencia
        Swal.fire({
          title: 'Errores de Validación',
          html: msg,
          icon: 'error',
          customClass: {
            htmlContainer: 'text-left',
          },
        });
        return;
      }

      return;
    }
    this.lockbutton = true;

    if (this.isActionAdd) {
      this.bancosServices.addTrasladoBanco(this.formAjuste.value).subscribe(
        (resp) => {
          this.onSuccess(resp.message, 'success', 'Registrado');
          this.closeModal();
          // window.location.reload();
          this.lockbutton = false;
          // this.getAjustes(1);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        (err) => {
          this.lockbutton = false;
          this.onSuccess(err.error.message, 'error', 'Error');
        }
      );
    }
  }

  paginate(event) {
    this.page = event;
    this.getHistorial(this.page);
  }
}
