import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EstadoVentaComponent } from './estado-venta.component';
import { ListadoComponent } from './listado/listado.component';


const routes: Routes = [
  {
    path: '', component: EstadoVentaComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstadoVentaRoutingModule { }
