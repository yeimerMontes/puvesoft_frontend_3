import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['../../informe.component.css', '../../../../css/modulo.css'],
})
export class ListadoComponent implements OnInit {
  @ViewChild('staticModalPdf', { static: false })
  childModalPdf?: ModalDirective;

  size: FormGroup;
  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario

  selects: number[] = selectsPagination;

  private _data = [];
  private _dataReport = [];

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  loaded = true;
  loaded2 = true;

  pages: Observable<any[]>;
  page = 1;
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
  _arrBancos = [];
  nombresProductos = [];
  totalesProductos = [];
  total_registros: number;
  last_page: any;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private bancosServices: BancosService,
    private router: Router
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
      categoria: ['', []],
      field: ['', []],
    });

    this.fechaActual();
    this.getSucural();
    // this.getHistorial(1);
    this.getBancos();
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

  getBancos() {
    this.categorias = [];

    this.bancosServices.getBancos().subscribe((resp) => {
      this._arrBancos = resp.data;
      this.total = resp.total;

      this.chartArr = [];
      this.categorias = [];

      this._data = [
        {
          nombre: 'Detalle',
          products: this._arrBancos,
        },
      ];

      this._data.forEach((element, index) => {
        const nombres = [];
        const productos = [];
        const unidades = [];

        element.products.forEach((subelement) => {
          const producto = {
            name: subelement.nombre,
            y: +subelement.total,
          };
          nombres.push(subelement.nombre);
          productos.push(producto);
          unidades.push(subelement.id);
        });

        this.categorias.push([productos, unidades]);
        this.grafica(
          element.nombre,
          this.categorias[index][0],
          this.categorias[index][1]
        );
      });
    });
  }

  openModalPdf() {
    this.childModalPdf?.show();
    this.generatePdf();
  }

  closeModalPdf() {
    this.childModalPdf?.hide();
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
      this.getService(page, this.total_registros, typeReport);
      return;
    }
    this.loaded = false;
    this.getService(page, this.size.controls.data.value);
  }

  count = 0;

  getService(page, perPage, typeReport: TypeReport = TypeReport.noReport) {
    this.bancosServices
      .getCategoriasDeVentasPorPagina(
        page,
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.categoria.value,
        typeReport,
        perPage
      )
      .subscribe((resp) => {
        if (typeReport == TypeReport.noReport || typeReport == TypeReport.pdf) {
          this.total_registros = resp.data.total;
          this.page = resp.data.current_page;
          this.loaded = true;
          this.count++;
          this.pages = of(resp.data.links);
          this.last_page = resp.data.last_page;
          let dataOrderBy = resp.data.data;

          dataOrderBy.forEach((item) => {
            item.products.sort(
              (a, b) => b.cantidad_vendida - a.cantidad_vendida
            );
          });
          this._data = dataOrderBy;

          this.chartArr = [];
          this.categorias = [];

          if (
            typeReport == TypeReport.noReport ||
            typeReport == TypeReport.pdf
          ) {
            resp.data.data.forEach((element, index) => {
              const nombres = [];
              const productos = [];
              const unidades = [];

              element.products.forEach((subelement) => {
                const producto = {
                  name:
                    subelement.producto +
                    ' - ' +
                    subelement.cantidad_vendida +
                    ' ' +
                    subelement.unidad_medida_sigla,
                  y: subelement.cantidad_vendida,
                };
                nombres.push(subelement.producto);
                productos.push(producto);
                unidades.push(subelement.unidad_medida_sigla);
              });

              this.categorias.push([productos, unidades]);
              this.grafica(
                element.nombre,
                this.categorias[index][0],
                this.categorias[index][1]
              );
            });
          }
        }

        if (typeReport != TypeReport.noReport) {
          this.loaded2 = true;
          this.count++;
          if (typeReport == TypeReport.excel) {
            this.exportarExcelService.getExportar(
              resp.data,
              'Ventas Por Categoría'
            );
          } else {
            this._dataReport = resp.data.data;
          }
        }
      });
  }

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

  next() {
    this.pages.subscribe((resp) => {
      if (this.page < resp.length) {
        this.getHistorial(this.page + 1);
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getHistorial(this.page - 1);
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

  navigateDetalleBanco() {
    this.router.navigate(['/informe/bancos/detalle']);
  }

  
  navigateTrasladoBanco() {
    this.router.navigate(['/informe/bancos/traslado']);
  }

  buscarHistorial() {
    this.busquedaPorCodigo = '';
    this.search.controls.field.setValue('');

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
        text: 'GRÁFICA',
      },
      subtitle: {
        text: `BANCOS`.toUpperCase(),
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
}
