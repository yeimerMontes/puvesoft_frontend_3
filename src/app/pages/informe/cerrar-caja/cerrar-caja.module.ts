import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CerrarCajaRoutingModule } from './cerrar-caja-routing.module';
import { CerrarCajaComponent } from './cerrar-caja.component';
import { CierreComponent } from './cierre/cierre.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  declarations: [CerrarCajaComponent, CierreComponent],
  imports: [
    CommonModule,
    CerrarCajaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ]
})
export class CerrarCajaModule { }
