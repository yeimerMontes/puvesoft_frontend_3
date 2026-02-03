import { of, Observable } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { SucursalService } from 'src/app/services/sucursal.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ProductoService } from 'src/app/services/producto.service';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { Chart } from 'angular-highcharts';
import { BodegaService } from 'src/app/services/bodega.service';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './inventario_por_categoria.component.html',
})
export class InventarioCategoriaComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: String = "INVENTARIO POR CATEGORIAS";
  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataCategoria: any[] = [];
  private _dataPdf: any[] = [];
  private _data = [];
  private _dataBodega: any[] = [];


  selects: number[] = selectsPagination;

  timeClear: any;

  isActionAdd: boolean = true;

  loaded = true;
  loaded2 = false;

  pages: Observable<any[]>;
  page = 1;
  total = 0;
  maxSize;
  nextTemplate;

  prevTemplate;

  sucursal: String;
  nit: String;
  direccion: String;
  fecha: String;
  logo: String;
  imagen: string;
  usarDecimales: Number = 1;
  totalGasto: string = '0';
  totalGastoPdf: string = '0';
  desde: String;
  hasta: String;

  chartArr: Chart[] = [];
  categorias = [];
  _arrCategorias = [];


  /* Para la grafica */
  view: [number, number] = [600, 260];
  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  store: number = 0;



  /*  onRandomData() {
     this.countryService.randomData();
   }
  */
  onSelect(data: any): void {
    /*   //console.log('Item clicked', JSON.parse(JSON.stringify(data))); */
  }

  onActivate(data: any): void {
    /*  //console.log('Activate', JSON.parse(JSON.stringify(data))); */
  }

  onDeactivate(data: any): void {
    /*  //console.log('Deactivate', JSON.parse(JSON.stringify(data))); */
  }

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private productoService: ProductoService,
    private categoriaProductoService: CategoriaProductoService,
    private bodegaService: BodegaService,
  ) { }



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
        title: 'Ya existe!',
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }

  ngOnInit() {
    this.search = this.formBuilder.group({
      categoria: ['', []],
      bodega: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });
    this.getBodegas();
    this.getSucural();
    this.getCategoriaInventario();
    this.getInventario(1);
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.productoService
      .getInvetarioPorCategoriaExcel(this.search.controls.categoria.value, this.store)
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          ' inventario por categoria'
        );
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.productoService
      .getInvetarioPorCategoria(this.search.controls.categoria.value, this.store)
      .subscribe((resp) => {
        this._dataPdf = resp.data;

        ////console.log(this._dataPdf)
        this.loaded2 = true;
      });
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      ////console.log(resp)
      this.sucursal = resp.data.nombre;
      this.direccion = resp.data.direccion;
      this.nit = resp.data.nit;
      this.fecha = resp.data.fecha;
      this.logo = resp.data.logo;
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  getCategoriaInventario() {
    this.categoriaProductoService
      .getCategoriaProductoPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataCategoria = resp.data;

      });
  }

  public getBodegas(): void {
    this.bodegaService
      .getBodegaPermisos(0)
      .subscribe((resp) => {
        this._dataBodega = resp.data;
      });
  }

  get dataBodega() {
    return this._dataBodega;
  }


  get dataCategoria() {
    return this._dataCategoria;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  private getInventario(page): void {
    this.loaded = false;
    this.productoService
      .getInvetarioPorCategoria(this.search.controls.categoria.value, this.store)
      .subscribe((resp) => {
        ////console.log(resp);
        this._data = resp.data;

        this.chartArr = [];
        this.categorias = [];
        this.loaded = true;

        /* Gestiono la carga de información en la grafica */
        resp.data.forEach((element, index) => {
          const nombres = [];
          const productos = [];
          const unidades = [];
          element.inventario.forEach(subelement => {
            const producto = { name: subelement.nombre + ' - ' + subelement.stock + " " + subelement.medida, y: parseFloat(subelement.stock) };
            nombres.push(subelement.nombre);
            productos.push(producto);
            unidades.push(subelement.medida);
          });

          this.categorias.push([productos, unidades]);
          this.grafica(element.nombre, this.categorias[index][0], this.categorias[index][1]);

        });

      });
  }



  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getInventario(1);
    }, 360);
  }

  get data() {
    return this._data;
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

  buscarPorCategoria(event) {
    this.loaded = false;

    this.productoService
      .getInvetarioPorCategoria(this.search.controls.categoria.value, this.store)
      .subscribe((resp) => {
        this.page = resp.data.current_page;
        this._data = resp.data;

        this.chartArr = [];
        this.categorias = [];
        this.loaded = true;

        /* Gestiono la carga de información en la grafica */
        resp.data.forEach((element, index) => {
          const nombres = [];
          const productos = [];
          const unidades = [];

          element.inventario.forEach(subelement => {
            const producto = { name: subelement.nombre + ' - ' + subelement.stock + " " + subelement.medida, y: parseFloat(subelement.stock) };
            nombres.push(subelement.nombre);
            productos.push(producto);
            unidades.push(subelement.medida);
          });

          this.categorias.push([productos, unidades]);
          this.grafica(element.nombre, this.categorias[index][0], this.categorias[index][1]);

        });


        // //console.log(this.data);
        this.pages = of(resp.data.links);
      });
  }


  grafica(categoria: string, total: any[], unidades: any[]) {
    const grafica = new Chart({
      chart: {
        type: 'pie',
      },
      title: {
        text: 'ESTADO DE INVENTARIO',
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
          data: total
        },
      ],
    });
    this.chartArr.push(grafica);
  }

  searchStoreProduct(data) {
    this.store = data != 0 ? data : 0;
    this.titleInforme(data);

    this.getInventario(1);
  }

  titleInforme(data) {
    //consulto el nombre de la bodega
    const codigoData = Number(data);
    const bodega = this.dataBodega.find(b => b.codigo === codigoData);
    if (bodega && bodega.nombre) {
      this.titleModule = 'INVENTARIO POR CATEGORIAS - ' + bodega.nombre;
    }else{
      this.titleModule = 'INVENTARIO POR CATEGORIAS';

    }
  }
}
