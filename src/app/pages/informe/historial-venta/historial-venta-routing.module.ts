import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HistorialVentaComponent } from './historial-venta.component';
import { ListadoComponent } from './listado/listado.component';


const routes: Routes = [
  {
    path: '', component: HistorialVentaComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistorialVentaRoutingModule { }
