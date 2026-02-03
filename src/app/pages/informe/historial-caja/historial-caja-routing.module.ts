import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HistorialCajaComponent } from './historial-caja.component';
import { ListadoComponent } from './listado/listado.component';


const routes: Routes = [
  {
    path: '', component: HistorialCajaComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistorialCajaRoutingModule { }
