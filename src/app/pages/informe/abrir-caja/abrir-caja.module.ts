import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbrirCajaComponent } from './abrir-caja.component';
import { AbrirCajaRoutingModule } from './abrir-caja-routing.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [AbrirCajaComponent],
  imports: [
    CommonModule,
    AbrirCajaRoutingModule,
    ReactiveFormsModule,
  ]
})
export class AbrirCajaModule { }
