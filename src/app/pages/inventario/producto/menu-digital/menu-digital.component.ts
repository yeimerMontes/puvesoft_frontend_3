import { of, Observable } from 'rxjs';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersProductoBajaExistencia } from 'src/app/constants/producto';
import { MenuDigitalService } from 'src/app/services/menu-digital.service';
import { Router } from '@angular/router';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';

@Component({
  selector: 'producto-baja-existencia',
  styleUrls: ['../../../../css/modulo.css', './menu-digital.component.scss'],
  templateUrl: './menu-digital.component.html',
})
export class MenuDigitalComponent implements OnInit {
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  titleModule: string = 'Gestionar Productos Menú Digital';
  headers: headersMasterInterface[] = headersProductoBajaExistencia;

  habilitar: string;
  habilitarInsumos: string = 'display:none;';
  habilitarProductos: string;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  /* Variables multiselect */
  selectedItemsImpuesto = [];

  private _dataPdf: any[] = [];
  private _data = [];

  selects: number[] = selectsPagination;
  timeClear: any;

  isActionAdd: boolean = true;

  loaded = false;
  loaded2 = false;
  loadedInsumo: boolean;

  pagesInsumo;
  pageInsumo = 1;
  totalInsumo = 0;

  pages: Observable<any[]>;
  page = 1;
  total = 0;

  prevTemplate;

  sucursal: any;

  usarDecimales: Number = 1;
  titleInsumo: String;
  medida: String;
  total_preparacion: String;
  imagenProducto: string;

  allChecked: boolean = false;

  private _categorias: any[] = [];

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private menuDigitalService: MenuDigitalService,
    private sucursalService: SucursalService,
    private funcionesService: FuncionesService,
    private router: Router,
    private categoriaProductoService: CategoriaProductoService

  ) {}

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

  
  public getCategorias(): void {
    this.categoriaProductoService.getCategoriasAtivas().subscribe((resp) => {
      this._categorias = resp.data;
    });
  }

  
  get categorias() {
    return this._categorias;
  }

  ngOnInit() {
    //Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', []],
      cod_barra: ['', []],
      categoria: ['', [Validators.required]],
      manejo_inventario: ['', [Validators.required]],
      img: ['', []],
      medida: ['', [Validators.required]],
      stock: ['', [Validators.required]],
      stock_minimo: ['', [Validators.required]],
      impuesto: [''],
      valor_compra: ['', [Validators.required]],
      producto: ['', []],
      insumo: ['', []],
      combinado: ['', []],
      valor_venta: ['', [Validators.required]],
      estado: ['', [Validators.required]],
    });

    this.search = this.formBuilder.group({
      field: ['', []],
      categoria: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });

    this.getSucural();
    this.getProductos(1);
    this.getCategorias();
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    try {
      this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
      this.usarDecimales = this.sucursal.usar_decimales;
    } catch (error) {
      this.sucursal = '';
    }
    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        //console.log(resp)
        localStorage.setItem(btoa('sucursal'), btoa(JSON.stringify(resp.data)));
      });
    }
  }

  get dataPdf() {
    return this._dataPdf;
  }

  getProductos(page): void {
    //this.loaded = false;
    this.menuDigitalService
      .getMenuDigitalPorPaginaCategoria(
        page,
        this.search.controls.field.value,
        this.search.controls.categoria.value,
        this.size.controls.data.value,
        ''
      )
      .subscribe((resp) => {
        //.log(resp);
        this.page = resp.data.current_page;
        // this.total = resp.data.total;
        this._data = resp.data.data;
        //this.dtTrigger.next();
        this.loaded = true;

        this.allChecked = this._data.length == this.getCantidadProductosSeleccionados();

        this.pages = of(resp.data.links);

        //this.pages = of(paginas.slice(1, -1));
      });
  }

  getCantidadProductosSeleccionados() {
    let cantidad = 0;
    this.data.forEach((item) => {
      if (item.seleccionado) {
        cantidad++;
      }
    });
    return cantidad;
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getProductos(1);
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
        this.getProductos(this.page + 1);
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getProductos(this.page - 1);
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getProductos(1);
    }, 360);
  }

  get data() {
    return this._data;
  }

  agregarAlMenu(item: any, i) {
    //console.log(item);
    this.data[i].seleccionado = !this.data[i].seleccionado

    this.menuDigitalService.addMenuDigital(item).subscribe(
      (resp) => {
        this.getProductos(this.page);
      },
      (err) => {
        alert('Ocurrió un error');
      }
    );
  }

  agregarAll(){

    let ids = [];

    this.allChecked = !this.allChecked;

  
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].seleccionado = this.allChecked
    }
    
    this.data.forEach((item) => {
      ids.push(
        {
          id: item.id,
          check: item.seleccionado,
        }
      );
    })

    let body = {
      productos: ids 
    };
    this.menuDigitalService.addMenuDigitalAll(body).subscribe(
      (resp) => {
        this.onSuccess('Productos agregados al menú digital', 'success', 'Exito');
        this.getProductos(this.page);
      },
      (err) => {
        alert('Ocurrió un error');
      }
    );

  }
  
  regresar() {
    this.router.navigate([`/inventario/producto`]);
  }
}
