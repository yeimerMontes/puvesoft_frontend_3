import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { DetalleCompraComponent } from './detalle-compra.component';

const routes: Routes = [
  {
    path: '', component: DetalleCompraComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetalleCompraRoutingModule { }
