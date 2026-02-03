import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CerrarCajaComponent } from './cerrar-caja.component';
import { CierreComponent } from './cierre/cierre.component';
import { AperturaCajaGuard } from 'src/app/guards/apertura-caja.guard';


const routes: Routes = [
  {
    path: '', component: CerrarCajaComponent,
    children: [
      { path: '', component: CierreComponent, canActivate: [AperturaCajaGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CerrarCajaRoutingModule { }
