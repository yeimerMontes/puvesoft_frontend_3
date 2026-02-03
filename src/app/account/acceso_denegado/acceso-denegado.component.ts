import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-acceso-denegado',
  templateUrl: './acceso-denegado.component.html',
  styleUrls: ['./acceso-denegado.component.css']
})
export class AccesoDenegadoComponent {
  isPlanRestricted = true; // Podrías pasar esto por estado de ruta

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}