import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaducidadService } from 'src/app/services/caducidad.service';
import { PuntosService } from 'src/app/services/puntos.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-second',
  templateUrl: './puntos.component.html'
})
export class PuntosComponent {

  form: FormGroup; //variable que controla el formulario
  loaded = false;

  action = 'actions.add';
  logo: string;

  isActionAdd: boolean = true;

  private _caducidades: any[] = []; //Un array que almacene los  caducidades

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos - Aqui debo llamar los revicios
    private puntosService: PuntosService,
    private caducidadService: CaducidadService,

  ) { }

  ngOnInit() {

    // Validación del formulario, cada uno de sus campos
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      valor_comprar: ['', [Validators.required]],
      punto_obsequio: ['', [Validators.required]],
      valor_punto: ['', [Validators.required]],
      compra_minima: ['', [Validators.required]],
      caducidad: ['', [Validators.required]],
      estado: ['', [Validators.required]],

    });

    this.form.get('punto_obsequio').disable();
    this.getPuntos();
    this.getCaducidades();

  }

  public getCaducidades(): void {
    this.caducidadService.getCaducidades().subscribe(
      resp => {
        this._caducidades = resp.data;
      }
    );
  }
  get caducidades() {
    return this._caducidades;
  }



  getPuntos() {
    this.puntosService.getSistemaPunto().subscribe(
      resp => {
        //console.log(resp);
        if(resp.data!=null){
          this.form.reset({
            nombre: resp.data.nombre,
            valor_comprar: resp.data.valor_comprar,
            punto_obsequio: 1,
            valor_punto: resp.data.valor_punto,
            compra_minima: resp.data.compra_minima,
            caducidad: resp.data.caducidad_id,
            estado: resp.data.estado_id,
          })
        }else{
          this.form.reset({
            punto_obsequio: 1,
            caducidad: '',
            estado: '',

          })
        }   
        this.loaded = true;


      },
      (err) => {
        alert('Ocurrió un error');
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
    return this.form.controls[campo].errors
      && this.form.controls[campo].touched;
  }

  click() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    //console.log(this.form.value);

    this.puntosService.putSistemaPunto
      (this.form.value)
      .subscribe((resp) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Actualizado',
          text: "" + resp.message + " !",
          showConfirmButton: false,
          timer: 1500
        })
      });

  }

}
