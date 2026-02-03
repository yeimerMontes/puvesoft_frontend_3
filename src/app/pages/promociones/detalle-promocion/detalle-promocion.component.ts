import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CategoriaProductoService } from 'src/app/services/categoria-producto.service';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { PromocionService } from 'src/app/services/promocion.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'detalle-promocion',
  templateUrl: './detalle-promocion.component.html',
  styleUrls: ['../../../css/modulo.css'],
})
export class DetallePromocionComponent {
  @Output() paso = new EventEmitter<any>();
  @Input() idGestion: String;

  form: FormGroup; //variable que controla el formulario
  categorias: any[] = [];
  lockbutton: boolean = false;
  loaded = false;
  titleModule = 'Detalle de la promoción';
  action1 = 'Siguiente';
  dropdownSettings: IDropdownSettings;
  tipoPromocion: number;

  usarDecimales: Number = 1;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private categoriaProductoService: CategoriaProductoService,
    private promocionService: PromocionService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService
  ) {}

  ngOnInit() {
    //Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      fecha_inicial: ['', [Validators.required]],
      hora_inicial: ['', [Validators.required]],
      fecha_final: ['', [Validators.required]],
      hora_final: ['', [Validators.required]],
      tipo_promocion: ['', []],
      categoria: ['', []],
      porcentaje: ['', [Validators.required]],
      destino_promocion: ['1',[]],
      estado: ['1', [Validators.required]],
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'nombre',
      allowSearchFilter: true,
      selectAllText: 'SELECCIONAR TODO',
      unSelectAllText: 'QUITAR TODO',
    };

    if (this.idGestion!='new') {
      this.getPromocionId();
    } else {
      this.loaded = true;
    }
    this.getCategorias();
  }

  alert(mensaje: any, tipo: any, title: any, button: boolean): void {
    Swal.fire({
      position: 'center',
      icon: tipo,
      title: title,
      text: '' + mensaje + ' !',
      showConfirmButton: button,
      timer: 1500,
    });
  }

  public selecTipo(data: number): void {
    this.tipoPromocion = data;
    this.form.controls.tipo_promocion.setValue(this.tipoPromocion);
  }

  public getCategorias(): void {
    this.categoriaProductoService.getCategoriasAtivas().subscribe((resp) => {
      this.categorias = resp.data;
    });
  }

  public getPromocionId(): void {
    this.promocionService.getPromocionId(this.idGestion).subscribe((resp) => {
      this.loaded = true;
      let data = resp.data;
      this.form.reset({
        nombre: data.nombre,
        fecha_inicial: data.fecha_inicio,
        hora_inicial: data.hora_inicio,
        fecha_final: data.fecha_fin,
        hora_final: data.hora_fin,
        tipo_promocion: data.tipo_promocion,
        categoria: data.categorias,
        porcentaje:data.por_descuento,
        estado: data.estado_id,
      });
      this.selecTipo(data.tipo_promocion);
    });
  }

  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }


  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  formatearNumberNoDecimal(valor) {
    return this.funcionesService.formatNumberOnlyNoDecimal(valor);
  }

  changePorcentaje(event, field) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = this.formatearNumber(val);
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      this.form.get(field)!.setValue(val);
    } else {
      this.form.get(field)!.setValue(this.formatearNumberNoDecimal(val));
    }

  }


  onsubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.lockbutton = true;
    if (this.form.controls.tipo_promocion.value == '') {
      this.alert(
        'Debe seleccionar, la configuración del producto',
        'warning',
        'Advertentencia',
        false
      );
      return;
    }
    /* En el caso que no alla id  guardo la promoción de lo contrario lo actualizo */
    if (this.idGestion=='new') {
      this.promocionService.addPromocion(this.form.value).subscribe(
        (resp) => {
          this.lockbutton = false;
          this.idGestion = resp.data.id;
          this.paso.emit({
            idPromocion: this.idGestion,
            paso: 2,
            tipo_promocion: this.form.controls.tipo_promocion.value,
            categorias: this.form.controls.categoria.value,
          });
        },
        (err) => {
          this.lockbutton = false;
          alert('Ocurrió un error');
        }
      );
    } else {
      this.promocionService
        .putPromocion(this.form.value, this.idGestion)
        .subscribe(
          (resp) => {
            this.lockbutton = false;
            this.paso.emit({
              idPromocion: this.idGestion,
              paso: 2,
              tipo_promocion: this.form.controls.tipo_promocion.value,
              categorias: this.form.controls.categoria.value,
              data: resp.data,
            });
          },
          (err) => {
            this.lockbutton = false;
            alert('Ocurrió un error al actualizar');
          }
        );
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
}
