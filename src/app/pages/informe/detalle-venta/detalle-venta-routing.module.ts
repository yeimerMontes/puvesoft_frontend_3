import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { DetalleVentaComponent } from './detalle-venta.component';

const routes: Routes = [
  {
    path: '', component: DetalleVentaComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetalleVentaRoutingModule { }
