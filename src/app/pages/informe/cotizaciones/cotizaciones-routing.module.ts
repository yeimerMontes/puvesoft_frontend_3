import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CotizacionesComponent } from './cotizaciones.component';
import { ListadoComponent } from './listado/listado.component';


const routes: Routes = [
  {
    path: '', component: CotizacionesComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CotizacionesRoutingModule { }
