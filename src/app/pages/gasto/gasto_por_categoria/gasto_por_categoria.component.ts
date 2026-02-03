import { Observable, of } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { selectsPagination } from 'src/app/constants/selects';
import { SucursalService } from 'src/app/services/sucursal.service';
import { GastoService } from 'src/app/services/gastos.servic';
import { ExportarExcelService } from 'src/app/services/exportar-excel.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { CategoriaGastoService } from 'src/app/services/categoria-gasto.servic';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-second',
  styleUrls: ['../../../css/modulo.css'],
  templateUrl: './gasto_por_categoria.component.html',
})
export class GastoPorCategoriaComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;
  @ViewChild('staticModal2', { static: false }) childModal2?: ModalDirective;

  form: FormGroup; //variable que controla el formulario
  search: FormGroup; //variable que controla el formulario
  size: FormGroup;

  private _dataCategoria: any[] = [];
  private _dataPdf: any[] = [];

  private _data = [];
  private _dataUsuario;

  selects: number[] = selectsPagination;

  timeClear: any;

  isActionAdd: boolean = true;

  loaded = false;
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

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private gastoService: GastoService,
    private exportarExcelService: ExportarExcelService,
    private funcionesService: FuncionesService,
    private categoriaGastoService: CategoriaGastoService,
    private userService: UserService,
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

  ngOnInit() {
    this.search = this.formBuilder.group({
      fecha_inicial: ['', []],
      hora_inicial: ['', []],
      fecha_final: ['', []],
      hora_final: ['', []],
      usuario: ['', []],
      categoria: ['', []],
    });

    this.size = this.formBuilder.group({
      data: [10, []],
    });
    this.getSucural();
    this.getUsuarios();
    this.getGastos(1);
    this.fechaActual();
    this.getCategoriaGastos();
  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  generateExcel() {
    this.gastoService
      .getGastoPorCategoriaExcel(
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.usuario.value,
        this.search.controls.categoria.value,
      )
      .subscribe((resp) => {
        this.exportarExcelService.getExportar(
          resp.data,
          ' Gastos por categoria',
        );
      });
  }

  generatePdf() {
    /* Consulto la data */
    this.loaded2 = false;
    this.gastoService
      .getGastoPorCategoria(
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.usuario.value,
        this.search.controls.categoria.value,
      )
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
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  getCategoriaGastos() {
    this.categoriaGastoService
      .getCategoriaGastoPorPagina('', '', '', 'No')
      .subscribe((resp) => {
        this._dataCategoria = resp.data;
      });
  }

  getUsuarios() {
    this.userService.getUsersPorPagina('', '', '', 'No').subscribe((resp) => {
      this._dataUsuario = resp.data;
    });
  }

  get dataCategoria() {
    return this._dataCategoria;
  }

  get dataPdf() {
    return this._dataPdf;
  }

  get dataUsuario() {
    return this._dataUsuario;
  }

  private getGastos(page): void {
    //this.loaded = false;
    this.gastoService
      .getGastoPorCategoria(
        this.search.controls.fecha_inicial.value,
        this.search.controls.fecha_final.value,
        this.search.controls.hora_inicial.value,
        this.search.controls.hora_final.value,
        this.search.controls.usuario.value,
        this.search.controls.categoria.value,
      )
      .subscribe((resp) => {
        console.log(resp);
        this._data = resp.data;
        this.loaded = true;
      });
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getGastos(1);
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

  anular(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Anularás el gasto:  ' + item['descripcion'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Anular!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.gastoService.putGasto([], item['id']).subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Anulado');
          this.closeModal();

          this.getGastos(1);
        });
      }
    });
  }

  delete(item) {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'Eliminarás el gasto: ' + item['decripcion'] + '!',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.gastoService.deleteGasto(item['id']).subscribe((resp) => {
          this.onSuccess(resp.message, 'success', 'Eliminado');
          this.closeModal();

          this.getGastos(1);
        });
      }
    });
  }

  /* Para poner la fecha actual */
  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    var fecha_inicial = `${year}-${month}-${day}`;
    var fecha_final = `${year}-${month}-${day}`;
    this.search.controls.fecha_inicial.setValue(fecha_inicial);
    this.search.controls.fecha_final.setValue(fecha_final);
    this.search.controls.hora_inicial.setValue(`00:00`);
    this.search.controls.hora_final.setValue(`23:59`);

    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
    this.horaInicial = `00:00`;
    this.horaFinal = `23:59`;
  }

  buscarGastos() {
    var fecha_inicial = this.search.controls.fecha_inicial.value;
    var fecha_final = this.search.controls.fecha_final.value;
    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
    this.horaInicial = this.search.controls.hora_inicial.value;
    this.horaFinal = this.search.controls.hora_final.value;

    if (fecha_inicial == '' || fecha_final == '') {
      Swal.fire({
        title: 'Debe diligenciar las fechas',
        text: 'Diligencia los rangos de fecha para poder consultar los gastos...',
        icon: 'warning',
        iconColor: '#DC562F',
        showCancelButton: true,
        showConfirmButton: false,
      });
    } else {
      this.loaded = false;
      this.gastoService
        .getGastoPorCategoria(
          this.search.controls.fecha_inicial.value,
          this.search.controls.fecha_final.value,
          this.search.controls.hora_inicial.value,
          this.search.controls.hora_final.value,
          this.search.controls.usuario.value,
          this.search.controls.categoria.value,
        )
        .subscribe((resp) => {
          this.page = resp.data.current_page;
          this._data = resp.data;
          this.loaded = true;
          //console.log(this.data);
          this.pages = of(resp.data.links);
        });
    }
  }

  totalGastos() {
    this.totalGastoPdf = '0';
    let f = this.dataPdf;
    let total = 0;

    for (let i = 0; i < f.length; i++) {
      const element = f[i];

      total += Number(element.valor);
    }
    this.totalGastoPdf = total.toString();
  }
}
