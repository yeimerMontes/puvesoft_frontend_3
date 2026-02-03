import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-second',
  templateUrl: './gestion-promocion.component.html',
  styleUrls: ['../../../css/modulo.css', './gestion-promocion.component.css'],
})
export class GestionPromocionComponent {
  form: FormGroup; //variable que controla el formulario
  lockbutton: boolean = false;
  loaded = true;
  titleModule = 'Nueva Promoción';
  pasoActual: number = 1; // o el paso inicial que desees
  idGestion: any;

  //pasos para gestionar las promociones
  paso1: boolean = true;
  paso2: boolean = false;
  paso3: boolean = false;
  dataPaso1: any;
  constructor(
    private _location: Location,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.idGestion = this.activeRoute.snapshot.paramMap.get('idGestion');
  }

  cambioTitulo() {
    this.idGestion == 'new'
      ? (this.titleModule = 'Nueva Promoción')
      : (this.titleModule = 'Editar Promoción');
  }

  obtenerTextoPaso(paso: number): string {
    // Puedes personalizar el texto del paso según tus necesidades
    switch (paso) {
      case 1:
        return 'Detalles';
      case 2:
        return 'Productos';
      case 3:
        return 'Resumen';
      default:
        return '';
    }
  }

  gestionPromocion(paso: number) {
    this.pasoActual = paso;
    this.paso1 = paso === 1;
    this.paso2 = paso === 2;
    this.paso3 = paso === 3;
  }

  requestPaso1(paso: any) {
    this.pasoActual = paso.paso;
    this.dataPaso1 = paso;
    if (paso.paso == 3 || paso.paso == 2) {
      this.idGestion = paso.idPromocion;
    }
    this.gestionPromocion(this.pasoActual);
    this.cambioTitulo();
  }

  goBack() {
    this._location.back();
  }
}
