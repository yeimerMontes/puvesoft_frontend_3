import { RouterModule, Routes } from '@angular/router';
import { AbrirCajaComponent } from './abrir-caja.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


const routes: Routes = [
  {
      path: '', component: AbrirCajaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbrirCajaRoutingModule { }
